import argparse
from pathlib import Path

import pandas as pd


# default folder and file paths
SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_DIR = SCRIPT_DIR.parent
DEFAULT_INPUT_PATH = DATASET_DIR / "job_salary_prediction_dataset.csv"
DEFAULT_OUTPUT_PATH = SCRIPT_DIR / "01_missing_values_fixed.csv"


def fill_missing_values(data: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    # make a copy so the original data is not changed
    cleaned = data.copy()

    # keep notes about what was fixed
    report_rows = []

    for column in cleaned.columns:
        # count empty values in this column
        missing_count = int(cleaned[column].isna().sum())
        missing_flag = f"{column}_was_missing"

        # do nothing when the column has no missing values
        if missing_count == 0:
            fill_method = "none"
            fill_value = "none"
            missing_flag = "none"
        elif pd.api.types.is_numeric_dtype(cleaned[column]):
            # mark rows that were missing before filling
            cleaned[missing_flag] = cleaned[column].isna()

            # fill missing number values with the middle value
            fill_method = "median"
            fill_value = cleaned[column].median()
            cleaned[column] = cleaned[column].fillna(fill_value)
        else:
            # mark rows that were missing before filling
            cleaned[missing_flag] = cleaned[column].isna()

            # fill missing text values with the most common value
            fill_method = "most common value"
            mode_values = cleaned[column].mode(dropna=True)
            fill_value = mode_values.iloc[0] if not mode_values.empty else "unknown"
            cleaned[column] = cleaned[column].fillna(fill_value)

        # add this column result to the report
        report_rows.append(
            {
                "column": column,
                "missing_values": missing_count,
                "fill_method": fill_method,
                "fill_value": fill_value,
                "flag_column": missing_flag,
            }
        )

    # return the cleaned data and the report table
    return cleaned, pd.DataFrame(report_rows)


def parse_args() -> argparse.Namespace:
    # set up command line options
    parser = argparse.ArgumentParser(description="fix missing values in the dataset")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_PATH, help="csv file to read")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH, help="csv file to write")
    return parser.parse_args()


def main() -> int:
    # read command line options
    args = parse_args()

    # open the csv file
    data = pd.read_csv(args.input)

    # fix missing values and make a report
    cleaned, report = fill_missing_values(data)

    # save the cleaned csv file
    args.output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(args.output, index=False)

    # print the basic result
    print(f"input rows: {len(data)}")
    print(f"output rows: {len(cleaned)}")
    print(f"saved file: {args.output}")
    print("")
    print("missing value report")
    print(report.to_string(index=False))

    # show only columns that actually had missing values
    changed_columns = report[report["missing_values"] > 0]
    print("")
    if changed_columns.empty:
        print("no missing values were found")
    else:
        print("columns fixed")
        print(changed_columns.to_string(index=False))

    return 0


if __name__ == "__main__":
    # run the script when python opens this file
    raise SystemExit(main())
