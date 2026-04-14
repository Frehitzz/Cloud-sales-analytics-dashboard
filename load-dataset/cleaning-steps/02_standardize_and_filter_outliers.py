import argparse
from pathlib import Path

import pandas as pd


# default input and output file paths
SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_DIR = SCRIPT_DIR.parent
ORIGINAL_INPUT_PATH = DATASET_DIR / "job_salary_prediction_dataset.csv"
DEFAULT_INPUT_PATH = SCRIPT_DIR / "01_missing_values_fixed.csv"
DEFAULT_OUTPUT_PATH = SCRIPT_DIR / "02_standardized_no_outliers.csv"


def standardize_column(data: pd.DataFrame, column: str) -> tuple[pd.DataFrame, float, float]:
    # make a copy so the input data is not changed
    cleaned = data.copy()

    # get the average and spread of the column
    mean_value = float(cleaned[column].mean())
    standard_deviation = float(cleaned[column].std())

    # avoid dividing by zero when all values are the same
    if standard_deviation == 0:
        cleaned[f"{column}_standardized"] = 0
    else:
        # add a new column with standardized values
        cleaned[f"{column}_standardized"] = (cleaned[column] - mean_value) / standard_deviation

    # return the data and the values used for the math
    return cleaned, mean_value, standard_deviation


def filter_outliers_iqr(data: pd.DataFrame, column: str) -> tuple[pd.DataFrame, pd.DataFrame, dict[str, float]]:
    # find the first and third quartile
    first_quartile = float(data[column].quantile(0.25))
    third_quartile = float(data[column].quantile(0.75))

    # calculate the middle range
    iqr = third_quartile - first_quartile

    # create the lowest and highest allowed values
    lower_limit = first_quartile - (1.5 * iqr)
    upper_limit = third_quartile + (1.5 * iqr)

    # keep rows inside the allowed range
    normal_rows = data[(data[column] >= lower_limit) & (data[column] <= upper_limit)].copy()

    # save rows outside the range so we can show them
    outlier_rows = data[(data[column] < lower_limit) | (data[column] > upper_limit)].copy()

    # save the numbers used to filter outliers
    limits = {
        "first_quartile": first_quartile,
        "third_quartile": third_quartile,
        "iqr": iqr,
        "lower_limit": lower_limit,
        "upper_limit": upper_limit,
    }

    # return clean rows outlier rows and the limit report
    return normal_rows, outlier_rows, limits


def parse_args() -> argparse.Namespace:
    # set up command line options
    parser = argparse.ArgumentParser(description="standardize a column and remove outliers")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_PATH, help="csv file from step 1")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH, help="cleaned csv file to write")
    parser.add_argument("--column", default="salary", help="number column to standardize and check for outliers")
    parser.add_argument("--show-outliers", type=int, default=10, help="how many removed outlier rows to show")
    return parser.parse_args()


def main() -> int:
    # read command line options
    args = parse_args()

    # use the original dataset if step 1 output is missing
    input_path = args.input
    if not input_path.exists() and args.input == DEFAULT_INPUT_PATH:
        print(f"step 1 file was not found: {input_path}")
        print(f"using original dataset instead: {ORIGINAL_INPUT_PATH}")
        input_path = ORIGINAL_INPUT_PATH

    # open the csv from step 1
    data = pd.read_csv(input_path)

    # standardize the selected number column
    standardized, mean_value, standard_deviation = standardize_column(data, args.column)

    # remove outliers using iqr
    cleaned, outliers, limits = filter_outliers_iqr(standardized, args.column)

    # save the cleaned csv for step 3
    args.output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(args.output, index=False)

    # print the row count result
    print(f"input rows: {len(data)}")
    print(f"output rows: {len(cleaned)}")
    print(f"removed outlier rows: {len(outliers)}")
    print(f"saved file: {args.output}")
    print("")
    print("standardized column")
    print(f"column: {args.column}")
    print(f"new column: {args.column}_standardized")
    print(f"mean: {mean_value:.2f}")
    print(f"standard deviation: {standard_deviation:.2f}")
    print("")
    print("iqr outlier limits")
    for name, value in limits.items():
        print(f"{name}: {value:.2f}")

    # show sample outlier rows that were removed
    if not outliers.empty:
        columns_to_show = [args.column, f"{args.column}_standardized"]
        print("")
        print(f"first {min(args.show_outliers, len(outliers))} outlier rows removed")
        print(outliers[columns_to_show].head(args.show_outliers).to_string(index=False))

    return 0


if __name__ == "__main__":
    # run the script when python opens this file
    raise SystemExit(main())
