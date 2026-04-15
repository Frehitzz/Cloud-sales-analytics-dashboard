# Home Global Job Title Filter Analysis

## Goal

Add one global `job_title` filter on the Home page.

The filter should use all job titles from Supabase and affect these Home page items:

- Average Salary KPI
- Highest Salary KPI
- Total Records KPI
- Avg. Experience KPI
- Average salary by experience chart
- Salary by work type chart

The filter should keep an `All job titles` option. When `All job titles` is selected, the Home page should show the full dataset.

## Current State

`src/pages/Home.tsx` currently uses these RPCs:

- `get_dashboard_stats`
- `get_avg_salary_by_experience`
- `get_job_titles`
- `get_avg_salary_by_remote_work`
- `get_top_paying_jobs`

Current filter behavior:

- `get_job_titles()` already provides the dropdown options.
- `selectedJobTitle` already exists in `Home.tsx`.
- `get_avg_salary_by_experience(p_job_title)` already accepts the selected job title.
- The existing dropdown only affects the Average salary by experience chart.
- The KPI cards still call `get_dashboard_stats()` without a job title filter.
- The Salary by work type chart still calls `get_avg_salary_by_remote_work()` without a job title filter.

## Affected Calculations

All formulas below use rows from:

```sql
public."job-salary-prediction"
```

When a job title is selected, each formula should apply:

```sql
where p_job_title is null
   or job_title = p_job_title
```

### Average Salary KPI

Current meaning:

```sql
avg(salary)
```

With global filter:

```sql
avg(salary)
from rows where job_title = selected job title
```

If `All job titles` is selected:

```sql
avg(salary)
from all rows
```

Frontend field affected:

```ts
stats.averageSalary
```

### Highest Salary KPI

Current meaning:

```sql
max(salary)
```

With global filter:

```sql
max(salary)
from rows where job_title = selected job title
```

If `All job titles` is selected:

```sql
max(salary)
from all rows
```

Frontend field affected:

```ts
stats.highestSalary
```

### Total Records KPI

Current meaning:

```sql
count(*)
```

With global filter:

```sql
count(*)
from rows where job_title = selected job title
```

If `All job titles` is selected:

```sql
count(*)
from all rows
```

Frontend field affected:

```ts
stats.totalRecords
```

### Avg. Experience KPI

Current meaning:

```sql
avg(experience_years)
```

With global filter:

```sql
avg(experience_years)
from rows where job_title = selected job title
```

If `All job titles` is selected:

```sql
avg(experience_years)
from all rows
```

Frontend field affected:

```ts
stats.averageExperience
```

### Average Salary by Experience Chart

This is already mostly ready because `supabase-salary-job-title-filter.sql.md` defines:

```sql
get_avg_salary_by_experience(p_job_title text default null)
```

Calculation per point:

```sql
select
  experience_years,
  avg(salary) as avg_salary,
  count(*) as row_count
group by experience_years
```

With global filter:

```sql
where p_job_title is null
   or job_title = p_job_title
```

Frontend data affected:

```ts
salaryByExperience
```

No SQL change is needed for this RPC if the SQL from `supabase-salary-job-title-filter.sql.md` has already been run.

### Salary by Work Type Chart

This currently uses `get_avg_salary_by_remote_work()` from `supabase-remote-work-salary-comparison.sql.md`.

Current calculation per pie slice:

```sql
select
  remote_work,
  avg(salary) as avg_salary,
  count(*) as row_count
group by remote_work
```

Needed calculation with global filter:

```sql
select
  remote_work,
  avg(salary) as avg_salary,
  count(*) as row_count
where p_job_title is null
   or job_title = p_job_title
group by remote_work
```

Frontend data affected:

```ts
remoteWorkSalary
```

SQL change is needed because the current RPC has no `p_job_title` parameter.

## Supabase SQL Changes Needed

### 1. Update `get_dashboard_stats`

This is required for the 4 KPI cards.

The current frontend expects camelCase keys:

```ts
averageExperience
averageSalary
highestSalary
totalRecords
```

Use this replacement RPC:

```sql
create or replace function get_dashboard_stats(p_job_title text default null)
returns json
language sql
stable
as $$
  select json_build_object(
    'averageExperience', coalesce(avg(experience_years), 0),
    'averageSalary', coalesce(avg(salary), 0),
    'highestSalary', coalesce(max(salary), 0),
    'totalRecords', count(*)
  )
  from public."job-salary-prediction"
  where p_job_title is null
     or job_title = p_job_title;
$$;
```

Frontend call should become:

```ts
await supabase.rpc('get_dashboard_stats', {
  p_job_title: selectedJobTitle || null,
})
```

### 2. Keep `get_avg_salary_by_experience`

No change is needed if this SQL has already been applied:

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

### 3. Keep `get_job_titles`

No change is needed for the dropdown list.

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

### 4. Update `get_avg_salary_by_remote_work`

This is required for the Salary by work type chart.

```sql
create or replace function get_avg_salary_by_remote_work(p_job_title text default null)
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
    and (
      p_job_title is null
      or job_title = p_job_title
    )
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

Frontend call should become:

```ts
await supabase.rpc('get_avg_salary_by_remote_work', {
  p_job_title: selectedJobTitle || null,
})
```

### 5. Index Recommendation

The existing index from `supabase-salary-job-title-filter.sql.md` is useful:

```sql
create index if not exists idx_job_salary_title_experience
on public."job-salary-prediction" (job_title, experience_years);
```

For the remote-work chart, this index is better than a remote-work-only index when filtering by job title:

```sql
create index if not exists idx_job_salary_title_remote_work
on public."job-salary-prediction" (job_title, remote_work);
```

For KPI filtering, this index may also help:

```sql
create index if not exists idx_job_salary_title
on public."job-salary-prediction" (job_title);
```

## Frontend Implementation Plan

### 1. Treat `selectedJobTitle` as the global Home filter

`Home.tsx` already has:

```ts
const [selectedJobTitle, setSelectedJobTitle] = useState('')
```

Keep this state, but use it for all affected Home data fetches.

### 2. Move the dropdown out of the chart header

The current dropdown is inside the Average salary by experience `ChartCard`.

For a global filter, move it near the top of the Home page, before the KPI cards.

Recommended UI:

```tsx
<section className="flex items-center justify-between gap-4">
  <label htmlFor="home-job-title-filter">Job title</label>
  <select id="home-job-title-filter">
    <option value="">All job titles</option>
    ...
  </select>
</section>
```

The Average salary by experience card should no longer own the filter.

### 3. Update `fetchHomeStats`

Change:

```ts
async function fetchHomeStats()
```

To:

```ts
async function fetchHomeStats(jobTitle: string | null)
```

Then call:

```ts
await supabase.rpc(DASHBOARD_STATS_RPC, {
  p_job_title: jobTitle,
})
```

### 4. Update `loadStats`

Add `selectedJobTitle` as a dependency.

The call should pass:

```ts
selectedJobTitle || null
```

This makes KPI cards reload whenever the global filter changes.

### 5. Keep `fetchSalaryByExperience`

This already accepts:

```ts
jobTitle: string | null
```

It already calls:

```ts
supabase.rpc(SALARY_BY_EXPERIENCE_RPC, {
  p_job_title: jobTitle,
})
```

No frontend data-shape change is needed.

### 6. Update `fetchRemoteWorkSalary`

Change:

```ts
async function fetchRemoteWorkSalary()
```

To:

```ts
async function fetchRemoteWorkSalary(jobTitle: string | null)
```

Then call:

```ts
await supabase.rpc(REMOTE_WORK_SALARY_RPC, {
  p_job_title: jobTitle,
})
```

### 7. Update `loadRemoteWorkSalary`

Add `selectedJobTitle` as a dependency.

The call should pass:

```ts
selectedJobTitle || null
```

This makes the Salary by work type pie chart reload whenever the global filter changes.

### 8. Load behavior

When the page first loads:

- Load job titles.
- Load KPI stats with `p_job_title: null`.
- Load salary by experience with `p_job_title: null`.
- Load salary by work type with `p_job_title: null`.

When the user changes job title:

- Reload KPI stats.
- Reload Average salary by experience.
- Reload Salary by work type.
- Do not reload `get_job_titles()` unless the dataset changes.

### 9. Count-up KPI behavior

The KPI cards currently animate once when data first loads.

For this global filter feature, the simplest behavior is:

- On first page load, animate KPI values.
- On filter changes, show updated final values without replaying the animation.

This matches the current count-up requirement: animate once when the page loads, not repeatedly.

## Open Question

The Home page also has `Top 10 highest paying jobs`.

This analysis does not connect the global job title filter to that chart because filtering a top-10 job-title ranking by a single selected job title makes the chart collapse to one item.

Decision needed:

- Option A: Leave `Top 10 highest paying jobs` global/unfiltered.
- Option B: Hide or replace that chart when a specific job title is selected.
- Option C: Make it show the selected job title against related metrics instead of top 10.

Recommended choice: Option A.
