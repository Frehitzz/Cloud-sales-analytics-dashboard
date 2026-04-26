# Job Salary Analytics Dashboard

React + TypeScript + Vite dashboard for exploring a job salary dataset stored in Supabase.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Data source: Supabase
- Dataset tooling: Python + pandas
- Extra API: Open-Meteo weather in the top bar

## Local Run

### 1. Prerequisites

- Node.js LTS
- npm
- A Supabase project with:
  - a `job-salary-prediction` table for the dataset
  - the RPC functions used by the dashboard

### 2. Install frontend dependencies

```powershell
npm install
```

### 3. Create the root `.env`

Create a file named `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These values are required by the dashboard pages. Without them, the app starts, but the data-driven pages will show configuration errors.

### 4. Start the app

```powershell
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

### 5. Optional verification

```powershell
npm run lint
npm run build
```

## Supabase Requirements

The frontend reads from:

- table: `job-salary-prediction`
- RPCs:
  - `get_dashboard_stats`
  - `get_avg_salary_by_experience`
  - `get_job_titles`
  - `get_avg_salary_by_remote_work`
  - `get_top_paying_jobs`

If the table or RPCs are missing, the dashboard will load but charts and metrics will fail to populate.

## Dataset Loader

Use this only if you need to upload or refresh the dataset in Supabase locally.

### 1. Python prerequisites

- Python 3
- `pip`

### 2. Install Python dependencies

```powershell
pip install -r load-dataset\python-requirements.txt
```

### 3. Create `load-dataset/.env`

Copy `load-dataset/.env.example` to `load-dataset/.env`, then fill in your real values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_TABLE_NAME=job-salary-prediction
SUPABASE_STORAGE_BUCKET=datasets
SUPABASE_STORAGE_PATH=job_salary_prediction_dataset_cleaned.csv
```

### 4. Test the loader first

```powershell
python load-dataset\load.py --dry-run
```

### 5. Upload the dataset

```powershell
python load-dataset\load.py
```

The dataset CSV used by the loader is:

```text
load-dataset/job_salary_prediction_dataset.csv
```

## Routes

- `/` - overview dashboard
- `/insights` - written insights page
- `/data-table` - paginated salary dataset table

## Notes

- `.env` and `load-dataset/.env` are gitignored.
- The weather widget uses Open-Meteo and does not need an API key.
- The home dashboard currently loads Recharts from a CDN at runtime, so an internet connection is needed for charts on that page.
