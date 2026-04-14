import argparse
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen
import json

import pandas as pd


# default paths and cloud storage names
SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT_PATH = SCRIPT_DIR / "job_salary_prediction_dataset.csv"
DEFAULT_OUTPUT_PATH = SCRIPT_DIR / "job_salary_prediction_dataset_cleaned.csv"
DEFAULT_ENV_PATH = SCRIPT_DIR / ".env"
DEFAULT_BUCKET_NAME = "datasets"
DEFAULT_STORAGE_PATH = "job_salary_prediction_dataset_cleaned.csv"


def parse_env_file(path: Path) -> dict[str, str]:
    # read supabase settings from the env file
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        # skip empty lines and comment lines
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        # split each line into key and value
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values


def get_setting(name: str, env_values: dict[str, str], default: str = "") -> str:
    # get a setting from system env then env file then default value
    return os.getenv(name) or env_values.get(name) or default


def handle_missing_values(data: pd.DataFrame) -> pd.DataFrame:
    # make a copy so the original data is not changed
    cleaned = data.copy()

    for column in cleaned.columns:
        # add a new column to show if the value was missing
        missing_flag = f"{column}_was_missing"
        cleaned[missing_flag] = cleaned[column].isna()

        # fill number columns with the middle value
        if pd.api.types.is_numeric_dtype(cleaned[column]):
            fill_value = cleaned[column].median()
            cleaned[column] = cleaned[column].fillna(fill_value)
        else:
            # fill text columns with the most common value
            mode_values = cleaned[column].mode(dropna=True)
            fill_value = mode_values.iloc[0] if not mode_values.empty else "unknown"
            cleaned[column] = cleaned[column].fillna(fill_value)

    return cleaned


def standardize_column(data: pd.DataFrame, column: str) -> pd.DataFrame:
    # make a copy before adding the standardized column
    cleaned = data.copy()

    # get the mean and standard deviation
    mean_value = cleaned[column].mean()
    standard_deviation = cleaned[column].std()

    # avoid dividing by zero if all values are the same
    if standard_deviation == 0:
        cleaned[f"{column}_standardized"] = 0
    else:
        # create a new standardized column using z score
        cleaned[f"{column}_standardized"] = (cleaned[column] - mean_value) / standard_deviation

    return cleaned


def filter_outliers_iqr(data: pd.DataFrame, column: str) -> pd.DataFrame:
    # get the middle range of the selected column
    first_quartile = data[column].quantile(0.25)
    third_quartile = data[column].quantile(0.75)
    iqr = third_quartile - first_quartile

    # make lower and upper limits for normal values
    lower_limit = first_quartile - (1.5 * iqr)
    upper_limit = third_quartile + (1.5 * iqr)

    # keep only rows inside the normal range
    return data[(data[column] >= lower_limit) & (data[column] <= upper_limit)].copy()


def upload_to_supabase_storage(
    file_path: Path,
    supabase_url: str,
    service_role_key: str,
    bucket_name: str,
    storage_path: str,
) -> None:
    # build the supabase storage upload url
    upload_path = quote(storage_path, safe="/")
    bucket_path = quote(bucket_name, safe="")
    url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket_path}/{upload_path}"

    # create the upload request for the cleaned csv
    request = Request(
        url,
        data=file_path.read_bytes(),
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "text/csv",
            "x-upsert": "true",
        },
    )

    try:
        # send the file to supabase storage
        with urlopen(request, timeout=120) as response:
            if response.status not in (200, 201):
                raise RuntimeError(f"unexpected supabase storage status: {response.status}")
    except HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"supabase storage upload failed with http {error.code}: {error_body}") from error
    except URLError as error:
        raise RuntimeError(f"could not reach supabase storage: {error.reason}") from error


def ensure_storage_bucket(supabase_url: str, service_role_key: str, bucket_name: str) -> None:
    # build the url used to check the bucket
    bucket_path = quote(bucket_name, safe="")
    read_url = f"{supabase_url.rstrip('/')}/storage/v1/bucket/{bucket_path}"

    # create a request to check if the bucket exists
    read_request = Request(
        read_url,
        method="GET",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
        },
    )

    try:
        # stop here if the bucket already exists
        with urlopen(read_request, timeout=60) as response:
            if response.status == 200:
                return
    except HTTPError as error:
        # only continue when the bucket is missing
        error_body = error.read().decode("utf-8", errors="replace")
        bucket_is_missing = error.code == 404 or "Bucket not found" in error_body
        if not bucket_is_missing:
            raise RuntimeError(f"could not check storage bucket with http {error.code}: {error_body}") from error

    # build the request body for a new private bucket
    create_url = f"{supabase_url.rstrip('/')}/storage/v1/bucket"
    body = json.dumps(
        {
            "id": bucket_name,
            "name": bucket_name,
            "public": False,
        }
    ).encode("utf-8")

    # create the bucket when it does not exist yet
    create_request = Request(
        create_url,
        data=body,
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        },
    )

    try:
        # send the bucket create request
        with urlopen(create_request, timeout=60) as response:
            if response.status not in (200, 201):
                raise RuntimeError(f"unexpected bucket create status: {response.status}")
    except HTTPError as error:
        # ignore conflict because it means the bucket already exists
        error_body = error.read().decode("utf-8", errors="replace")
        if error.code == 409:
            return
        raise RuntimeError(f"could not create storage bucket with http {error.code}: {error_body}") from error
    except URLError as error:
        raise RuntimeError(f"could not reach supabase storage: {error.reason}") from error


def clean_dataset(input_path: Path, output_path: Path, normalize_column: str, outlier_column: str) -> tuple[int, int]:
    # read the csv file into pandas
    data = pd.read_csv(input_path)
    original_rows = len(data)

    # clean missing values then standardize and remove outliers
    cleaned = handle_missing_values(data)
    cleaned = standardize_column(cleaned, normalize_column)
    cleaned = filter_outliers_iqr(cleaned, outlier_column)

    # save the cleaned data as a new csv file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(output_path, index=False)

    return original_rows, len(cleaned)


def parse_args() -> argparse.Namespace:
    # set up command line options
    parser = argparse.ArgumentParser(description="Clean the job salary dataset and upload it to Supabase Storage")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_PATH, help="csv file to clean")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH, help="cleaned csv output path")
    parser.add_argument("--normalize-column", default="salary", help="numeric column to standardize")
    parser.add_argument("--outlier-column", default="salary", help="numeric column used for iqr outlier filtering")
    parser.add_argument("--bucket", default=None, help="supabase storage bucket name")
    parser.add_argument("--storage-path", default=None, help="path for the uploaded file inside the bucket")
    parser.add_argument("--skip-upload", action="store_true", help="only save the cleaned csv locally")
    return parser.parse_args()


def main() -> int:
    # read command line options and env values
    args = parse_args()
    env_values = parse_env_file(DEFAULT_ENV_PATH)

    try:
        # run the data cleaning steps
        original_rows, cleaned_rows = clean_dataset(
            input_path=args.input,
            output_path=args.output,
            normalize_column=args.normalize_column,
            outlier_column=args.outlier_column,
        )

        print(f"original rows: {original_rows}")
        print(f"cleaned rows: {cleaned_rows}")
        print(f"removed rows: {original_rows - cleaned_rows}")
        print(f"saved cleaned csv: {args.output}")

        # stop here when the user only wants a local file
        if args.skip_upload:
            print("upload skipped")
            return 0

        # get supabase upload settings
        supabase_url = get_setting("SUPABASE_URL", env_values)
        service_role_key = get_setting("SUPABASE_SERVICE_ROLE_KEY", env_values) or get_setting("SUPABASE_KEY", env_values)
        bucket_name = args.bucket or get_setting("SUPABASE_STORAGE_BUCKET", env_values, DEFAULT_BUCKET_NAME)
        storage_path = args.storage_path or get_setting("SUPABASE_STORAGE_PATH", env_values, DEFAULT_STORAGE_PATH)

        if not supabase_url:
            raise ValueError("missing SUPABASE_URL in load-dataset/.env")
        if not service_role_key:
            raise ValueError("missing SUPABASE_SERVICE_ROLE_KEY in load-dataset/.env")

        # make sure the storage bucket exists before upload
        ensure_storage_bucket(
            supabase_url=supabase_url,
            service_role_key=service_role_key,
            bucket_name=bucket_name,
        )
        # upload the cleaned csv to supabase storage
        upload_to_supabase_storage(
            file_path=args.output,
            supabase_url=supabase_url,
            service_role_key=service_role_key,
            bucket_name=bucket_name,
            storage_path=storage_path,
        )

        print(f"uploaded cleaned csv to bucket: {bucket_name}")
        print(f"storage path: {storage_path}")
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    # run the script when this file is opened by python
    raise SystemExit(main())
