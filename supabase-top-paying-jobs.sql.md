# Supabase SQL for Top 10 Highest Paying Jobs

Run this SQL in the Supabase SQL editor.

## Top Paying Jobs RPC

This RPC returns the top 10 job titles ranked by average salary.

```sql
create or replace function get_top_paying_jobs()
returns table (
  job_title text,
  avg_salary numeric,
  highest_salary numeric,
  row_count bigint
)
language sql
stable
as $$
  select
    job_title,
    avg(salary) as avg_salary,
    max(salary) as highest_salary,
    count(*) as row_count
  from public."job-salary-prediction"
  where job_title is not null
    and job_title <> ''
    and salary is not null
  group by job_title
  order by avg_salary desc
  limit 10;
$$;
```

## Optional Index

This helps Supabase group salary records by job title faster.

```sql
create index if not exists idx_job_salary_job_title
on public."job-salary-prediction" (job_title);
```

## Frontend RPC Usage

```ts
await supabase.rpc('get_top_paying_jobs')
```
