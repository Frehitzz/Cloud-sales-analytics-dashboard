# load dataset script explanation

This file explains `load-dataset/load.py` in simple words

The script uploads the CSV file into Supabase

CSV file:

```text
load-dataset/job_salary_prediction_dataset.csv
```

Supabase settings file:

```text
load-dataset/.env
```

Main script:

```text
load-dataset/load.py
```

## what this script does

The script reads the CSV file, changes each row into data that Supabase can accept, then sends the data to your Supabase table

It does not send rows one by one

It sends `1000` rows at a time so the upload is faster

Your CSV has `250000` rows, so the script sends about `250` batches

## files used by the script

`load-dataset/job_salary_prediction_dataset.csv`

This is the dataset that will be uploaded

`load-dataset/.env`

This has your Supabase project info

Example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_TABLE_NAME=job-salary-prediction
```

`load-dataset/load.py`

This is the Python script that does the upload

## why we use .env

The `.env` file keeps important settings outside the code

This is useful because the Supabase service role key is private

Do not post your `.env` file online

Do not commit your `.env` file to GitHub

## how to test first

Before uploading, run dry run mode

```powershell
python load-dataset\load.py --dry-run
```

Dry run means the script reads the CSV and prepares the batches, but it does not upload anything

Use this to check if the script can read your files correctly

## how to upload

After dry run works, run this command

```powershell
python load-dataset\load.py
```

This will start uploading the CSV rows into Supabase

## simple flow

1. the script finds the CSV file
2. the script reads the Supabase info from `.env`
3. the script reads the CSV header
4. the script changes column names into database style names
5. the script reads rows from the CSV
6. the script groups rows into batches of `1000`
7. the script sends each batch to Supabase
8. the script prints progress after each batch

## column names

The CSV column names are already simple, but the script still cleans them

Example:

```text
Job Title
```

becomes

```text
job_title
```

Your CSV has names like this:

```text
job_title
experience_years
education_level
skills_count
industry
company_size
location
remote_work
certifications
salary
```

## number columns

Some values should be numbers, not text

The script converts these columns into numbers:

```text
experience_years
skills_count
certifications
salary
```

This helps Supabase save the data correctly

## important functions in load.py

### to_database_name

This changes column names into database style names

Example:

```text
Job Title
```

becomes

```text
job_title
```

### parse_env_file

This reads values from the `.env` file

It looks for lines like this:

```env
SUPABASE_URL=https://your-project.supabase.co
```

### load_config

This gets the Supabase URL, service role key, and table name

The script needs these before it can upload data

### convert_value

This cleans each value from the CSV

It also changes number columns from text into numbers

### row_batches

This reads the CSV and groups rows into batches

Each batch has `1000` rows by default

### insert_batch

This sends one batch to Supabase

It uses the Supabase REST API

### load_dataset

This is the main upload process

It checks the file, loads settings, reads batches, and uploads them

## common errors

### missing supabase url

This means the script cannot find your Supabase URL

Check this file:

```text
load-dataset/.env
```

Make sure it has:

```env
SUPABASE_URL=https://your-project.supabase.co
```

### missing service role key

This means the script cannot find your Supabase key

Check this line in `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### table not found

This means the table name is wrong or the table does not exist in Supabase

Check this line:

```env
SUPABASE_TABLE_NAME=job-salary-prediction
```

Also check that the table exists in Supabase

### column error

This usually means the CSV column names do not match the table column names

Check that your Supabase table has the same column names as the CSV after cleaning

## safe way to use it

Always run dry run first

```powershell
python load-dataset\load.py --dry-run
```

If dry run works, run the real upload

```powershell
python load-dataset\load.py
```

Watch the terminal while it uploads

The script prints the number of inserted rows after each batch
