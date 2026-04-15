# Supabase SQL for Remote Work Salary Comparison

Run this SQL in the Supabase SQL editor.

## Remote Work Average Salary RPC

This RPC returns the average salary grouped by `remote_work`.

Expected groups:

- `Yes`
- `Hybrid`
- `No`

```sql
create or replace function get_avg_salary_by_remote_work()
returns table (
  remote_work text,
  avg_salary numeric,
  row_count bigint
)
language sql
stable
as $$
  select
    remote_work,
    avg(salary) as avg_salary,
    count(*) as row_count
  from public."job-salary-prediction"
  where remote_work is not null
    and remote_work <> ''
  group by remote_work
  order by
    case remote_work
      when 'Yes' then 1
      when 'Hybrid' then 2
      when 'No' then 3
      else 4
    end,
    remote_work;
$$;
```

## Optional Index

This helps Supabase group and filter by `remote_work` faster.

```sql
create index if not exists idx_job_salary_remote_work
on public."job-salary-prediction" (remote_work);
```

## Frontend RPC Usage

```ts
await supabase.rpc('get_avg_salary_by_remote_work')
```
