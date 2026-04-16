# Codebase Audit - 2026-04-16

## Scope

This audit reviewed the React/Vite frontend, Supabase integration code, Open-Meteo weather feature, Python dataset scripts, project configuration, documentation, and generated/local artifacts.

## Verification

The current codebase passes the available automated checks:

```text
npm.cmd run build
npm.cmd run lint
python -m compileall -q load-dataset
```

Build output includes a Vite chunk-size warning for a JavaScript bundle above 500 KB. This is not a build failure, but it is worth tracking as the app grows.

## Overall Assessment

The project is functional and has a clear dashboard structure. TypeScript, ESLint, Vite, Tailwind tokens, Supabase configuration checks, and gitignored secrets are all good foundations.

The main maintainability risk is that several pages have grown into large mixed-responsibility components. Data fetching, data transformation, visual rendering, responsive modal behavior, and design details often live in the same file. The most important next step is to split these areas into focused hooks, service modules, and reusable UI components.

## Strengths

- The app uses TypeScript and strict compiler options such as `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- `src/lib/supabase.ts` centralizes Supabase client setup and safely handles missing frontend env values.
- The weather code mapping is isolated in `src/lib/weather.ts`, which is cleaner than embedding Open-Meteo mapping directly in the topbar.
- Most shared UI elements use reusable components such as `Button`, `Badge`, `ChartCard`, `IconTitle`, and `KPICard`.
- `.gitignore` excludes `.env`, `load-dataset/.env`, generated cleaned CSV files, `dist`, `node_modules`, and Python cache files.
- The Python loader supports dry-run mode and batches inserts instead of uploading rows one at a time.

## Findings

### 1. High - Supabase service role key can be read from a tracked Markdown file

Evidence:

- `load-dataset/load.py:43` parses `requirements.md`.
- `load-dataset/load.py:56` to `load-dataset/load.py:59` looks for `service_role_key`.
- `load-dataset/load.py:111` to `load-dataset/load.py:117` accepts the parsed key as a config fallback.

Why it matters:

The Supabase service role key has admin-level access. Supporting a tracked Markdown file as a key source makes it easier to accidentally commit a real key.

Recommendation:

Only read service role keys from environment variables or ignored `.env` files. Keep `requirements.md` documentation-only and remove service-key parsing from `parse_requirements`.

### 2. High - Home page relies on a CDN-loaded Recharts bundle and React globals

Evidence:

- `src/pages/Home.tsx:24` to `src/pages/Home.tsx:25` defines a CDN URL for Recharts.
- `src/pages/Home.tsx:47` to `src/pages/Home.tsx:53` extends `window` with React, ReactDOM, ReactIs, and Recharts.
- `src/pages/Home.tsx:183` to `src/pages/Home.tsx:304` reimplements a ReactIs compatibility object.
- `src/pages/Home.tsx:306` to `src/pages/Home.tsx:348` injects a script tag at runtime.

Why it matters:

This is brittle and hard to maintain. It depends on a third-party CDN at runtime, bypasses normal bundler dependency management, pollutes globals, and creates a large block of low-level code inside a page component. It also makes offline development and repeatable builds less reliable.

Recommendation:

Install `recharts` as an npm dependency and import chart components normally. If initial bundle size is a concern, use `React.lazy` or route-level code splitting instead of a raw CDN script.

### 3. Medium - `Home.tsx` is too large and mixes responsibilities

Evidence:

- `src/pages/Home.tsx` contains RPC names, response types, formatters, CDN loading, data fetching, chart transformation, state management, and all chart JSX in one file.
- The page starts data-loader callbacks around `src/pages/Home.tsx:542` and continues through multiple chart render blocks past line 1100.

Why it matters:

Large mixed-responsibility files are harder to review, test, and safely change. A dashboard page can stay readable if data access, chart data mapping, and chart rendering are split.

Recommendation:

Split into:

- `src/lib/dashboardData.ts` for Supabase RPC calls and transformations.
- `src/hooks/useDashboardStats.ts` or one `useHomeDashboardData` hook.
- `src/components/charts/SalaryByExperienceChart.tsx`.
- `src/components/charts/RemoteWorkSalaryChart.tsx`.
- `src/components/charts/TopPayingJobsChart.tsx`.

### 4. Medium - Weather polling can overlap requests and has a shared abort controller

Evidence:

- `src/components/layout/TopbarWeather.tsx:21` creates one `AbortController` for the component lifetime.
- `src/components/layout/TopbarWeather.tsx:24` defines `loadWeather`.
- `src/components/layout/TopbarWeather.tsx:48` to `src/components/layout/TopbarWeather.tsx:50` intentionally delays the loading state.
- `src/components/layout/TopbarWeather.tsx:60` to `src/components/layout/TopbarWeather.tsx:62` starts a fixed 30-second interval.

Why it matters:

If a request stalls, a later interval can start another request while the first one is still running. The artificial loading delay also means multiple calls can race to update `isLoading`. This is fine for a classroom demonstration, but less ideal for production behavior.

Recommendation:

Track an in-flight request with a ref, or replace `setInterval` with recursive `setTimeout` that schedules the next poll only after the current poll finishes. Keep the polling interval configurable with a constant or env value.

### 5. Medium - Data table page hard-codes filter options that can drift from Supabase

Evidence:

- `src/pages/DataTablePage.tsx:9` to `src/pages/DataTablePage.tsx:35` hard-codes job titles, industries, and work setup values.
- Query filters are applied later in `loadRows`, but option lists do not come from the database.

Why it matters:

If the dataset changes, the UI can show stale filters or miss valid options.

Recommendation:

Fetch distinct filter options from Supabase RPCs or a metadata endpoint. If fixed options are required for the assignment, centralize them in a `datasetSchema.ts` module and document that they are intentionally static.

### 6. Medium - Large inline style blocks reduce readability and design consistency

Evidence:

- `src/pages/DataTablePage.tsx:448` to `src/pages/DataTablePage.tsx:469` styles the mobile filter button inline.
- `src/pages/DataTablePage.tsx:624` to `src/pages/DataTablePage.tsx:665` styles the modal overlay and sheet inline.
- Additional inline styles continue through the rest of the mobile filter modal.
- `src/pages/Insights.tsx:195` to `src/pages/Insights.tsx:247` uses inline styles for mobile insight cards.
- `src/pages/Insights.tsx:322` to `src/pages/Insights.tsx:378` uses inline styles for mobile navigation buttons.

Why it matters:

Inline style blocks hide design decisions inside JSX and make repeated design changes tedious. Some hard-coded colors such as `#6366f1`, `#818cf8`, and `#fff` also bypass the project color token system.

Recommendation:

Move these states to Tailwind utility classes and CSS variables. Reuse `Button`, `Badge`, and `IconTitle` where possible. Create `MobileFilterSheet` and `InsightPager` components instead of keeping all styling in page files.

### 7. Medium - Mobile filter modal is missing standard dialog accessibility behavior

Evidence:

- `src/pages/DataTablePage.tsx:617` to `src/pages/DataTablePage.tsx:645` renders the overlay and sheet.
- It does not define `role="dialog"`, `aria-modal="true"`, a labelled title relation, focus trapping, or Escape-key close handling.

Why it matters:

Keyboard and screen-reader users may have a poor experience. Focus can remain behind the modal, and screen readers may not know that a modal interaction has started.

Recommendation:

Add semantic dialog attributes, move focus into the sheet when opened, restore focus to the filter button when closed, close on Escape, and prevent tab focus from leaving the dialog while it is open.

### 8. Medium - There are no automated tests

Evidence:

- `package.json` has `dev`, `build`, `lint`, and `preview`, but no `test` script.
- Python scripts compile, but there is no test suite for cleaning behavior, parsing, or upload request construction.

Why it matters:

The app relies on Supabase RPCs, weather code mapping, formatters, pagination, and data-cleaning transformations. These are easy to regress without tests.

Recommendation:

Add Vitest and React Testing Library for frontend unit tests. Start with:

- Weather code mapping and fetch response parsing.
- Formatters for salary, years, and temperature.
- Pagination and filter state transitions in `DataTablePage`.
- Dashboard data transform functions after moving them out of `Home.tsx`.

For Python, add `pytest` tests for `to_database_name`, `convert_value`, env parsing, missing-value filling, standardization, and outlier filtering.

### 9. Low - Unused and template artifacts remain in `src`

Evidence:

- `src/components/ui/DataTable.tsx:1` to `src/components/ui/DataTable.tsx:77` defines a sales/account table that is not imported anywhere.
- `src/assets/vite.svg` and `src/assets/react.svg` are template assets and are not referenced by app code.

Why it matters:

Dead code and template assets make the project harder to understand and can confuse future changes.

Recommendation:

Delete unused template assets and either remove `src/components/ui/DataTable.tsx` or repurpose it as the actual dataset table component used by `DataTablePage`.

### 10. Low - Encoded comment artifacts hurt readability

Evidence:

- `src/pages/DataTablePage.tsx:166` contains mojibake characters in comments.
- `src/pages/DataTablePage.tsx:442`, `src/pages/DataTablePage.tsx:512`, and `src/pages/DataTablePage.tsx:616` have similar encoded separator comments.
- `src/pages/Insights.tsx:156`, `src/pages/Insights.tsx:180`, `src/pages/Insights.tsx:193`, and later comments show the same issue.

Why it matters:

The code still runs, but corrupted comment text looks unprofessional and makes the source harder to scan.

Recommendation:

Replace decorative separator comments with short ASCII comments or remove them where the JSX already explains the section.

### 11. Low - Empty sidebar footer should be removed or given real content

Evidence:

- `src/components/layout/Sidebar.tsx:138` to `src/components/layout/Sidebar.tsx:145` renders an empty footer `div`.

Why it matters:

Empty layout elements add noise and can create unexpected spacing.

Recommendation:

Remove the empty block or add intentional footer content such as app version, dataset name, or user/account context.

### 12. Low - Python utilities duplicate Supabase request and env parsing logic

Evidence:

- `load-dataset/clean_dataset.py:31` to `load-dataset/clean_dataset.py:43` parses env values.
- `load-dataset/cleaning-steps/03_upload_cleaned_dataset.py:20` to `load-dataset/cleaning-steps/03_upload_cleaned_dataset.py:36` repeats similar env parsing.
- `load-dataset/clean_dataset.py:100` to `load-dataset/clean_dataset.py:130` and `load-dataset/cleaning-steps/03_upload_cleaned_dataset.py:115` to `load-dataset/cleaning-steps/03_upload_cleaned_dataset.py:139` repeat storage upload logic.

Why it matters:

Bug fixes to upload handling or env parsing must be repeated in multiple places.

Recommendation:

Create a small shared module such as `load-dataset/supabase_utils.py` for env parsing, bucket creation, and file upload helpers.

### 13. Low - Python dependencies are not pinned

Evidence:

- `load-dataset/python-requirements.txt` contains only `pandas`.

Why it matters:

Unpinned dependencies make data-cleaning results and local setup less reproducible over time.

Recommendation:

Pin a tested version, for example `pandas==<tested-version>`, or use a lockfile-producing workflow such as `uv` or `pip-tools`.

## Recommended Refactor Plan

1. Remove service-role-key parsing from tracked Markdown files.
2. Replace CDN Recharts loading with an npm dependency or lazy import.
3. Extract dashboard RPC calls and chart transforms out of `Home.tsx`.
4. Convert the mobile filter sheet and insights pager into reusable components with token-based styling.
5. Add dialog accessibility behavior for the mobile filter modal.
6. Add a small automated test suite for pure functions and key user flows.
7. Remove unused template assets and dead components.
8. Consolidate duplicated Python Supabase helper code.

## Suggested File Organization

```text
src/
  components/
    charts/
      RemoteWorkSalaryChart.tsx
      SalaryByExperienceChart.tsx
      TopPayingJobsChart.tsx
    data-table/
      DatasetFilters.tsx
      DatasetTable.tsx
      MobileFilterSheet.tsx
    insights/
      InsightCard.tsx
      InsightPager.tsx
  hooks/
    useHomeDashboardData.ts
    useDatasetRows.ts
    useTopbarWeather.ts
  lib/
    dashboardData.ts
    datasetFilters.ts
    supabase.ts
    weather.ts
```

## Notes

- The current `.env` files and generated cleaned CSV are ignored by git, which is correct.
- The committed raw CSV is large. If repository size becomes a problem, consider storing the dataset in Supabase Storage or a release artifact and documenting how to download it.
- This audit did not run a live browser accessibility test or a dependency vulnerability scan. It focused on source code, structure, local build/lint checks, and Python syntax compilation.
