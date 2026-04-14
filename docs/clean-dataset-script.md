# clean dataset script explanation

This file explains `load-dataset/clean_dataset.py` in very simple words

Think of the dataset like a big table

Each row is one job record

Each column is one kind of information, like job title, years of experience, or salary

The script cleans that table and saves a better version of it

## short summary

`clean_dataset.py` cleans the job salary CSV file

It fixes missing values, standardizes the salary column, removes salary outliers, saves a new cleaned CSV file, and uploads that cleaned file to Supabase Storage

## files used

The script reads this file:

```text
load-dataset/job_salary_prediction_dataset.csv
```

The script creates this cleaned file:

```text
load-dataset/job_salary_prediction_dataset_cleaned.csv
```

The script reads Supabase settings from this file:

```text
load-dataset/.env
```

## why this script exists

Raw data can have problems

Some values can be empty

Some number values can be too large or too small

Some number columns can be hard to compare

This script cleans those problems before the data is used

## what the script does step by step

1. it opens the CSV file
2. it checks for missing values
3. it fills missing number values with the middle value
4. it fills missing text values with the most common value
5. it adds flag columns to remember which values were missing
6. it standardizes the salary column
7. it removes salary outliers using IQR
8. it saves a cleaned CSV file
9. it creates a Supabase Storage bucket if needed
10. it uploads the cleaned CSV file to Supabase Storage

## missing values

A missing value means a cell has no data

Example:

```text
job_title,experience_years,salary
Data Analyst,,90000
```

The `experience_years` value is missing

The script handles missing values in two ways

First, it creates a new flag column

Example:

```text
experience_years_was_missing
```

This column says `true` if the original value was missing

Second, it fills the missing value

For number columns, it uses the median

The median is the middle value

For text columns, it uses the most common value

## standardizing salary

The script standardizes the `salary` column

This means it changes salary into a new number that is easier to compare

It creates a new column:

```text
salary_standardized
```

This does not delete the original salary

The original `salary` column stays in the cleaned file

## removing outliers

An outlier is a value that is very far from normal values

Example:

Most salaries may be near `100000`

But one salary may be `9999999`

That very large number can make analysis worse

The script uses IQR to find outliers

IQR means interquartile range

In simple words, it looks at the normal middle part of the salary values and removes values that are too far away

## exporting to cloud storage

After cleaning, the script saves the cleaned CSV locally

Then it uploads the cleaned CSV to Supabase Storage

The default bucket name is:

```text
datasets
```

The default uploaded file name is:

```text
job_salary_prediction_dataset_cleaned.csv
```

If the bucket does not exist, the script tries to create it

## important code parts

### parse_env_file

This reads the `.env` file

The `.env` file has the Supabase URL and key

### get_setting

This gets one setting value

It checks the computer environment first

Then it checks the `.env` file

Then it uses a default value if needed

### handle_missing_values

This fixes missing values

It also adds flag columns so we can remember where missing values were found

### standardize_column

This creates a standardized version of one number column

The script uses `salary` by default

### filter_outliers_iqr

This removes rows where the salary is too far from the normal range

It uses the IQR method

### upload_to_supabase_storage

This uploads the cleaned CSV file to Supabase Storage

### ensure_storage_bucket

This checks if the Supabase Storage bucket exists

If it does not exist, the script creates it

### clean_dataset

This is the main cleaning function

It reads the CSV, cleans it, removes outliers, and saves the cleaned CSV

### main

This starts everything when you run the script

## how to run the script

To clean the dataset and upload it:

```powershell
python load-dataset\clean_dataset.py
```

To clean the dataset but not upload it:

```powershell
python load-dataset\clean_dataset.py --skip-upload
```

Use `--skip-upload` when you only want to test the cleaning part

## what happened when the script was tested

The original dataset had:

```text
250000 rows
```

After cleaning, it had:

```text
247664 rows
```

The script removed:

```text
2336 rows
```

Those removed rows were salary outliers

## final summary

This script is like a cleaner for your dataset

It reads the old CSV file, fixes missing values, makes salary easier to compare, removes strange salary values, saves a new cleaned CSV file, and uploads the cleaned file to Supabase Storage
