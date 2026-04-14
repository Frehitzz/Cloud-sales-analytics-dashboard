# cleaning steps

This folder separates the cleaning work into three Python files

Run them in this order

## important for git bash

If you are using Git Bash, use `/` in the path

Do not use `\` in Git Bash

This is correct for Git Bash:

```bash
python load-dataset/cleaning-steps/01_handle_missing_values.py
```

This can fail in Git Bash:

```bash
python load-dataset\cleaning-steps\01_handle_missing_values.py
```

If you are using PowerShell, both styles may work, but `/` is still okay

## step 1

```bash
python load-dataset/cleaning-steps/01_handle_missing_values.py
```

This handles missing values

It creates:

```text
load-dataset/cleaning-steps/01_missing_values_fixed.csv
```

When you run it, it shows:

- how many rows were read
- how many rows were saved
- which columns had missing values
- what value was used to fill missing values

## step 2

```bash
python load-dataset/cleaning-steps/02_standardize_and_filter_outliers.py
```

This standardizes `salary` and removes salary outliers with IQR

It creates:

```text
load-dataset/cleaning-steps/02_standardized_no_outliers.csv
```

When you run it, it shows:

- how many rows were read
- how many rows were saved
- how many outlier rows were removed
- the salary mean
- the salary standard deviation
- the IQR limits
- sample outlier rows that were removed

## step 3

```bash
python load-dataset/cleaning-steps/03_upload_cleaned_dataset.py
```

This uploads the final cleaned CSV to Supabase Storage

When you run it, it shows:

- if the storage bucket exists
- what file was uploaded
- the bucket name
- the storage path

## short summary

Step 1 fixes missing values

Step 2 standardizes salary and removes outliers

Step 3 uploads the cleaned file to Supabase Storage
