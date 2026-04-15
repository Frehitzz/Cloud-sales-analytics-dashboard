# Supabase SQL for Salary Chart Job Title Filter

Run this SQL in the Supabase SQL editor.

## 1. Update Average Salary by Experience RPC

This keeps one RPC and adds an optional `p_job_title` filter.

When `p_job_title` is `null`, it returns data for all job titles.
When `p_job_title` has a value, it returns data only for that job title.

```sql
create or replace function get_avg_salary_by_experience(p_job_title text default null)
returns table (
  experience_years numeric,
  avg_salary numeric,
  row_count bigint
)
language sql
stable
as $$
  select
    experience_years,
    avg(salary) as avg_salary,
    count(*) as row_count
  from public."job-salary-prediction"
  where p_job_title is null
     or job_title = p_job_title
  group by experience_years
  order by experience_years;
$$;
```

## 2. Add Job Title List RPC

This RPC gives the frontend the job titles for the filter dropdown.

```sql
create or replace function get_job_titles()
returns table (
  job_title text
)
language sql
stable
as $$
  select distinct job_title
  from public."job-salary-prediction"
  where job_title is not null
    and job_title <> ''
  order by job_title;
$$;
```

## 3. Add Index for Better Filtering

This helps Supabase filter by `job_title` and group by `experience_years` faster.

```sql
create index if not exists idx_job_salary_title_experience
on public."job-salary-prediction" (job_title, experience_years);
```

## Frontend RPC Usage

For all job titles:

```ts
await supabase.rpc('get_avg_salary_by_experience', {
  p_job_title: null,
})
```

For one selected job title:

```ts
await supabase.rpc('get_avg_salary_by_experience', {
  p_job_title: selectedJobTitle,
})
```
