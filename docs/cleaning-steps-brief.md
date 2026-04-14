cleaning steps brief explanation

step 1

01_handle_missing_values.py checks the dataset for empty or missing values
If it finds missing values, it fills them and shows which columns were fixed


step 2

02_standardize_and_filter_outliers.py standardizes the salary column so the numbers are easier to compare
It also removes salary values that are too far from the normal range using the IQR method


step 3

03_upload_cleaned_dataset.py uploads the final cleaned CSV file to Supabase Storage
It also checks if the storage bucket exists and creates it if needed


short summary

The first script fixes missing values
The second script standardizes salary and removes outliers
The third script uploads the cleaned dataset to the cloud
