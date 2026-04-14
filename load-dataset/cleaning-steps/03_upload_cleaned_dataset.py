import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


# default paths and storage names
SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_DIR = SCRIPT_DIR.parent
DEFAULT_INPUT_PATH = SCRIPT_DIR / "02_standardized_no_outliers.csv"
DEFAULT_ENV_PATH = DATASET_DIR / ".env"
DEFAULT_BUCKET_NAME = "datasets"
DEFAULT_STORAGE_PATH = "job_salary_prediction_dataset_cleaned.csv"


def parse_env_file(path: Path) -> dict[str, str]:
    # read settings from the env file
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        # skip blank lines and comment lines
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        # split the line into name and value
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values


def get_setting(name: str, env_values: dict[str, str], default: str = "") -> str:
    # use system env first then env file then default value
    return os.getenv(name) or env_values.get(name) or default


def ensure_storage_bucket(supabase_url: str, service_role_key: str, bucket_name: str) -> None:
    # build the bucket check url
    bucket_path = quote(bucket_name, safe="")
    read_url = f"{supabase_url.rstrip('/')}/storage/v1/bucket/{bucket_path}"

    # make a request to check if the bucket exists
    read_request = Request(
        read_url,
        method="GET",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
        },
    )

    try:
        # stop if the bucket already exists
        with urlopen(read_request, timeout=60) as response:
            if response.status == 200:
                print(f"bucket exists: {bucket_name}")
                return
    except HTTPError as error:
        # continue only when the bucket is missing
        error_body = error.read().decode("utf-8", errors="replace")
        bucket_is_missing = error.code == 404 or "Bucket not found" in error_body
        if not bucket_is_missing:
            raise RuntimeError(f"could not check storage bucket with http {error.code}: {error_body}") from error

    # prepare the request to create a private bucket
    create_url = f"{supabase_url.rstrip('/')}/storage/v1/bucket"
    body = json.dumps(
        {
            "id": bucket_name,
            "name": bucket_name,
            "public": False,
        }
    ).encode("utf-8")

    # create the bucket request
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
            print(f"bucket created: {bucket_name}")
    except HTTPError as error:
        # ignore conflict because the bucket already exists
        error_body = error.read().decode("utf-8", errors="replace")
        if error.code == 409:
            print(f"bucket already exists: {bucket_name}")
            return
        raise RuntimeError(f"could not create storage bucket with http {error.code}: {error_body}") from error
    except URLError as error:
        raise RuntimeError(f"could not reach supabase storage: {error.reason}") from error


def upload_file(file_path: Path, supabase_url: str, service_role_key: str, bucket_name: str, storage_path: str) -> None:
    # build the upload url
    upload_path = quote(storage_path, safe="/")
    bucket_path = quote(bucket_name, safe="")
    url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket_path}/{upload_path}"

    # create a request with the csv file bytes
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
        # send the cleaned csv to supabase storage
        with urlopen(request, timeout=120) as response:
            if response.status not in (200, 201):
                raise RuntimeError(f"unexpected supabase storage status: {response.status}")
    except HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"supabase storage upload failed with http {error.code}: {error_body}") from error
    except URLError as error:
        raise RuntimeError(f"could not reach supabase storage: {error.reason}") from error


def parse_args() -> argparse.Namespace:
    # set up command line options
    parser = argparse.ArgumentParser(description="upload the cleaned csv to supabase storage")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_PATH, help="cleaned csv file to upload")
    parser.add_argument("--bucket", default=None, help="supabase storage bucket name")
    parser.add_argument("--storage-path", default=None, help="path for the uploaded file inside the bucket")
    return parser.parse_args()


def main() -> int:
    # read command line options and env values
    args = parse_args()
    env_values = parse_env_file(DEFAULT_ENV_PATH)

    try:
        # make sure the cleaned csv exists before upload
        if not args.input.exists():
            raise FileNotFoundError(f"cleaned csv file not found: {args.input}")

        # get supabase settings
        supabase_url = get_setting("SUPABASE_URL", env_values)
        service_role_key = get_setting("SUPABASE_SERVICE_ROLE_KEY", env_values) or get_setting("SUPABASE_KEY", env_values)
        bucket_name = args.bucket or get_setting("SUPABASE_STORAGE_BUCKET", env_values, DEFAULT_BUCKET_NAME)
        storage_path = args.storage_path or get_setting("SUPABASE_STORAGE_PATH", env_values, DEFAULT_STORAGE_PATH)

        if not supabase_url:
            raise ValueError("missing SUPABASE_URL in load-dataset/.env")
        if not service_role_key:
            raise ValueError("missing SUPABASE_SERVICE_ROLE_KEY in load-dataset/.env")

        # make sure the bucket exists before uploading
        ensure_storage_bucket(supabase_url, service_role_key, bucket_name)

        # upload the final cleaned csv
        upload_file(args.input, supabase_url, service_role_key, bucket_name, storage_path)

        print(f"uploaded file: {args.input}")
        print(f"bucket: {bucket_name}")
        print(f"storage path: {storage_path}")
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    # run the script when python opens this file
    raise SystemExit(main())
