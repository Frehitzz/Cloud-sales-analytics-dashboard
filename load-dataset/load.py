import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


# default file paths and upload settings
SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CSV_PATH = SCRIPT_DIR / "job_salary_prediction_dataset.csv"
DEFAULT_REQUIREMENTS_PATH = SCRIPT_DIR / "requirements.md"
DEFAULT_BATCH_SIZE = 1_000
DEFAULT_TABLE_NAME = "job-salary-prediction"
ENV_PATHS = [
    SCRIPT_DIR / ".env",
    SCRIPT_DIR.parent / ".env",
]

# columns that should become numbers before upload
INTEGER_COLUMNS = {
    "experience_years",
    "skills_count",
    "certifications",
    "salary",
}


def to_database_name(column_name: str) -> str:
    # change column names into database style names
    name = column_name.strip().lower()
    name = re.sub(r"[^a-z0-9]+", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    return name


def parse_requirements(path: Path) -> dict[str, str]:
    # read supabase info from requirements.md
    if not path.exists():
        return {}

    text = path.read_text(encoding="utf-8")
    values: dict[str, str] = {}

    # find the supabase project link
    url_match = re.search(r"https://[^\s]+", text)
    if url_match:
        values["url"] = url_match.group(0).strip()

    # find the service role key
    key_match = re.search(r"service_role_key:\s*([^\s]+)", text)
    if key_match:
        values["service_role_key"] = key_match.group(1).strip()

    # find the table name from item number 3
    table_match = re.search(r"^\s*3\.\s*(.+?)\s*$", text, re.MULTILINE)
    if table_match:
        values["table_name"] = table_match.group(1).strip()

    return values


def parse_env_file(path: Path) -> dict[str, str]:
    # read simple key value lines from a local env file
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value

    return values


def load_env_files() -> dict[str, str]:
    # load env values from project files without needing extra packages
    values: dict[str, str] = {}
    for path in ENV_PATHS:
        values.update(parse_env_file(path))
    return values


def normalize_supabase_url(value: str) -> str:
    # turn dashboard links into api links
    value = value.strip().rstrip("/")
    dashboard_match = re.search(r"supabase\.com/dashboard/project/([a-z0-9]+)", value)
    if dashboard_match:
        return f"https://{dashboard_match.group(1)}.supabase.co"
    return value


def load_config(requirements_path: Path) -> tuple[str, str, str]:
    # load settings from env first then local files
    requirements = parse_requirements(requirements_path)
    env_file = load_env_files()

    supabase_url = os.getenv("SUPABASE_URL") or env_file.get("SUPABASE_URL") or requirements.get("url", "")
    service_role_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or env_file.get("SUPABASE_SERVICE_ROLE_KEY")
        or env_file.get("SUPABASE_KEY")
        or requirements.get("service_role_key", "")
    )
    table_name = (
        os.getenv("SUPABASE_TABLE_NAME")
        or env_file.get("SUPABASE_TABLE_NAME")
        or requirements.get("table_name")
        or DEFAULT_TABLE_NAME
    )

    placeholder_values = {
        "url of supabase project",
        "role-key of supabase project",
    }

    if not supabase_url or supabase_url.strip().lower() in placeholder_values:
        raise ValueError("Missing Supabase URL. Set SUPABASE_URL or add the real project URL to requirements.md.")
    if not service_role_key or service_role_key.strip().lower() in placeholder_values:
        raise ValueError(
            "Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY or add the real key to requirements.md."
        )
    if not table_name:
        raise ValueError("Missing Supabase table name. Set SUPABASE_TABLE_NAME or add it to requirements.md.")

    return normalize_supabase_url(supabase_url), service_role_key, table_name


def convert_value(column_name: str, value: str) -> Any:
    # clean each csv value before sending it
    value = value.strip()
    if value == "":
        return None
    if column_name in INTEGER_COLUMNS:
        return int(value)
    return value


def row_batches(csv_path: Path, batch_size: int):
    # read the csv and yield rows in batches
    with csv_path.open(newline="", encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row.")

        # convert headers once before reading rows
        mapped_columns = [to_database_name(column) for column in reader.fieldnames]
        if len(mapped_columns) != len(set(mapped_columns)):
            raise ValueError(f"Column names are not unique after conversion: {mapped_columns}")

        batch: list[dict[str, Any]] = []
        total_rows = 0

        for raw_row in reader:
            # build one row using database column names
            row = {
                mapped_column: convert_value(mapped_column, raw_row[original_column])
                for original_column, mapped_column in zip(reader.fieldnames, mapped_columns)
            }
            batch.append(row)
            total_rows += 1

            # send the batch back when it reaches the limit
            if len(batch) >= batch_size:
                yield batch, total_rows
                batch = []

        # send the last batch if it has rows
        if batch:
            yield batch, total_rows


def insert_batch(supabase_url: str, service_role_key: str, table_name: str, batch: list[dict[str, Any]]) -> None:
    # insert one batch using the supabase rest api
    table_path = quote(table_name, safe="")
    url = f"{supabase_url}/rest/v1/{table_path}"
    body = json.dumps(batch).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )

    try:
        # accept normal successful insert responses
        with urlopen(request, timeout=60) as response:
            if response.status not in (200, 201, 204):
                raise RuntimeError(f"Unexpected status from Supabase: {response.status}")
    except HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase insert failed with HTTP {error.code}: {error_body}") from error
    except URLError as error:
        raise RuntimeError(f"Could not reach Supabase: {error.reason}") from error


def load_dataset(csv_path: Path, requirements_path: Path, batch_size: int, dry_run: bool) -> None:
    # check the input before doing any upload
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    if batch_size <= 0:
        raise ValueError("Batch size must be greater than zero.")

    # prepare upload settings and counters
    supabase_url, service_role_key, table_name = load_config(requirements_path)
    started_at = time.time()
    inserted_rows = 0
    batch_number = 0

    print(f"CSV: {csv_path}")
    print(f"Supabase URL: {supabase_url}")
    print(f"Table: {table_name}")
    print(f"Batch size: {batch_size}")

    # go through the csv one batch at a time
    for batch, rows_read in row_batches(csv_path, batch_size):
        batch_number += 1
        if dry_run:
            print(f"[dry-run] Batch {batch_number}: prepared {len(batch)} rows, {rows_read} rows read.")
        else:
            insert_batch(supabase_url, service_role_key, table_name, batch)
            inserted_rows += len(batch)
            print(f"Batch {batch_number}: inserted {inserted_rows} rows.")

    # show the final result
    elapsed_seconds = time.time() - started_at
    if dry_run:
        print(f"Dry run complete in {elapsed_seconds:.1f}s. No rows were inserted.")
    else:
        print(f"Done. Inserted {inserted_rows} rows in {elapsed_seconds:.1f}s.")


def parse_args() -> argparse.Namespace:
    # define command line options
    parser = argparse.ArgumentParser(description="Load the job salary prediction CSV into Supabase.")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV_PATH, help="Path to the CSV file.")
    parser.add_argument(
        "--requirements",
        type=Path,
        default=DEFAULT_REQUIREMENTS_PATH,
        help="Path to requirements.md for default Supabase settings.",
    )
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Rows to insert per request.")
    parser.add_argument("--dry-run", action="store_true", help="Parse the CSV without inserting rows.")
    return parser.parse_args()


def main() -> int:
    # run the loader and return a command line status code
    args = parse_args()
    try:
        load_dataset(
            csv_path=args.csv,
            requirements_path=args.requirements,
            batch_size=args.batch_size,
            dry_run=args.dry_run,
        )
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    # start the script when this file is run directly
    raise SystemExit(main())
