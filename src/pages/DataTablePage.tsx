import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Table2 } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import IconTitle from '../components/ui/IconTitle'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const DATASET_TABLE = 'job-salary-prediction'
const PAGE_SIZE = 20

const jobTitleOptions = [
  'AI Engineer',
  'Backend Developer',
  'Business Analyst',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Frontend Developer',
  'Machine Learning Engineer',
  'Product Manager',
  'Software Engineer',
]

const industryOptions = [
  'Consulting',
  'Education',
  'Finance',
  'Government',
  'Healthcare',
  'Manufacturing',
  'Media',
  'Retail',
  'Technology',
  'Telecom',
]

const workSetupOptions = ['Hybrid', 'No', 'Yes']

type SortColumn = 'salary' | 'experience_years' | 'job_title'

type SortKey =
  | 'database'
  | 'salary_desc'
  | 'salary_asc'
  | 'experience_years_desc'
  | 'experience_years_asc'
  | 'job_title_asc'
  | 'job_title_desc'

type SortOption = {
  ascending: boolean
  column: SortColumn | null
  label: string
  value: SortKey
}

const sortOptions: SortOption[] = [
  {
    ascending: true,
    column: null,
    label: 'Database order',
    value: 'database',
  },
  {
    ascending: false,
    column: 'salary',
    label: 'Salary: high to low',
    value: 'salary_desc',
  },
  {
    ascending: true,
    column: 'salary',
    label: 'Salary: low to high',
    value: 'salary_asc',
  },
  {
    ascending: false,
    column: 'experience_years',
    label: 'Experience years: high to low',
    value: 'experience_years_desc',
  },
  {
    ascending: true,
    column: 'experience_years',
    label: 'Experience years: low to high',
    value: 'experience_years_asc',
  },
  {
    ascending: true,
    column: 'job_title',
    label: 'Job title: A-Z',
    value: 'job_title_asc',
  },
  {
    ascending: false,
    column: 'job_title',
    label: 'Job title: Z-A',
    value: 'job_title_desc',
  },
]

type SalaryTableRow = {
  experience_years: number | string | null
  industry: string | null
  job_title: string | null
  remote_work: string | null
  salary: number | string | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

const numberFormatter = new Intl.NumberFormat('en-US')

function formatSalary(value: SalaryTableRow['salary']) {
  const salary = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(salary) || salary <= 0) {
    return 'N/A'
  }

  return currencyFormatter.format(salary)
}

function formatExperience(value: SalaryTableRow['experience_years']) {
  const years = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(years) || years < 0) {
    return 'N/A'
  }

  return `${numberFormatter.format(years)} yrs`
}

function getRemoteWorkTone(remoteWork: string | null) {
  const normalizedRemoteWork = remoteWork?.trim().toLowerCase()

  if (normalizedRemoteWork === 'yes' || normalizedRemoteWork === 'remote') {
    return 'success'
  }

  if (normalizedRemoteWork === 'hybrid') {
    return 'info'
  }

  return 'warning'
}

function DataTablePage() {
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [selectedSort, setSelectedSort] = useState<SortKey>('database')
  const [selectedWorkSetup, setSelectedWorkSetup] = useState('')
  const [rows, setRows] = useState<SalaryTableRow[]>([])
  const [totalRows, setTotalRows] = useState(0)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
    [totalRows],
  )

  const loadRows = useCallback(
    async (shouldApply: () => boolean = () => true) => {
      setIsLoading(true)
      setError(null)

      if (!isSupabaseConfigured || !supabase) {
        setRows([])
        setTotalRows(0)
        setError('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
        setIsLoading(false)
        return
      }

      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      try {
        let query = supabase
          .from(DATASET_TABLE)
          .select(
            'job_title,experience_years,salary,industry,remote_work',
            { count: 'exact' },
          )

        if (selectedJobTitle) {
          query = query.eq('job_title', selectedJobTitle)
        }

        if (selectedIndustry) {
          query = query.eq('industry', selectedIndustry)
        }

        if (selectedWorkSetup) {
          query = query.eq('remote_work', selectedWorkSetup)
        }

        const sortOption = sortOptions.find(
          (option) => option.value === selectedSort,
        )

        if (sortOption?.column) {
          query = query.order(sortOption.column, {
            ascending: sortOption.ascending,
          })
        }

        const { count, data, error: queryError } = await query
          .range(from, to)

        if (queryError) {
          throw queryError
        }

        if (shouldApply()) {
          setRows((data ?? []) as SalaryTableRow[])
          setTotalRows(count ?? 0)
        }
      } catch (queryError) {
        if (shouldApply()) {
          setRows([])
          setTotalRows(0)
          setError(
            queryError instanceof Error
              ? queryError.message
              : 'Could not load Supabase rows',
          )
        }
      } finally {
        if (shouldApply()) {
          setIsLoading(false)
        }
      }
    },
    [currentPage, selectedIndustry, selectedJobTitle, selectedSort, selectedWorkSetup],
  )

  useEffect(() => {
    let isMounted = true

    void loadRows(() => isMounted)

    return () => {
      isMounted = false
    }
  }, [loadRows])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    tableScrollRef.current?.scrollTo({ left: 0, top: 0 })
  }, [currentPage])

  const canGoBack = currentPage > 1 && !isLoading
  const canGoForward = currentPage < totalPages && !isLoading
  const hasActiveControls =
    selectedIndustry !== '' ||
    selectedJobTitle !== '' ||
    selectedSort !== 'database' ||
    selectedWorkSetup !== ''

  function handleFilterChange(updateFilter: () => void) {
    setCurrentPage(1)
    updateFilter()
  }

  function resetControls() {
    setCurrentPage(1)
    setSelectedIndustry('')
    setSelectedJobTitle('')
    setSelectedSort('database')
    setSelectedWorkSetup('')
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <IconTitle className="text-[2.25rem] leading-[1.1]" icon={Table2}>
            Salary dataset
          </IconTitle>
          {error && (
            <p className="mt-2 text-sm text-danger">
              Supabase table failed to load: {error}
            </p>
          )}
        </div>
      </section>

      <section className="animate-fade-slide-up flex max-h-[calc(100vh-13.5rem)] min-h-[360px] flex-col rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:max-h-[calc(100vh-12rem)] md:p-6">

        <div className="mb-5 grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_5.5rem]">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase text-text-secondary">
            Job Title
            <select
              className="min-h-10 cursor-pointer rounded border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold normal-case text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onChange={(event) =>
                handleFilterChange(() => setSelectedJobTitle(event.target.value))
              }
              value={selectedJobTitle}
            >
              <option value="">All job titles</option>
              {jobTitleOptions.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase text-text-secondary">
            Industry
            <select
              className="min-h-10 cursor-pointer rounded border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold normal-case text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onChange={(event) =>
                handleFilterChange(() => setSelectedIndustry(event.target.value))
              }
              value={selectedIndustry}
            >
              <option value="">All industries</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase text-text-secondary">
            Work Setup
            <select
              className="min-h-10 cursor-pointer rounded border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold normal-case text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onChange={(event) =>
                handleFilterChange(() =>
                  setSelectedWorkSetup(event.target.value),
                )
              }
              value={selectedWorkSetup}
            >
              <option value="">All work setups</option>
              {workSetupOptions.map((workSetup) => (
                <option key={workSetup} value={workSetup}>
                  {workSetup}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase text-text-secondary">
            Sort by
            <select
              className="min-h-10 cursor-pointer rounded border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold normal-case text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onChange={(event) =>
                handleFilterChange(() =>
                  setSelectedSort(event.target.value as SortKey),
                )
              }
              value={selectedSort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button
            className="self-end md:w-[5.5rem]"
            disabled={!hasActiveControls}
            onClick={resetControls}
            type="button"
            variant="primary"
          >
            Reset
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto" ref={tableScrollRef}>
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
                  Job Title
                </th>
                <th className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
                  Experience Years
                </th>
                <th className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
                  Salary
                </th>
                <th className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
                  Industry
                </th>
                <th className="sticky top-0 z-10 border-b border-border bg-bg-surface px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
                  Remote Work
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <tr key={`loading-row-${index}`}>
                    <td
                      className="border-b border-border px-4 py-4 text-sm text-text-secondary"
                      colSpan={5}
                    >
                      Loading row {index + 1}...
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                rows.map((row, index) => (
                  <tr
                    className="group"
                    key={`${row.job_title ?? 'job'}-${row.industry ?? 'industry'}-${index}`}
                  >
                    <td className="border-b border-border px-4 py-4 text-sm font-semibold text-text-primary group-hover:bg-bg-hover">
                      {row.job_title || 'N/A'}
                    </td>
                    <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                      {formatExperience(row.experience_years)}
                    </td>
                    <td className="border-b border-border px-4 py-4 font-mono text-sm font-semibold text-text-primary group-hover:bg-bg-hover">
                      {formatSalary(row.salary)}
                    </td>
                    <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                      {row.industry || 'N/A'}
                    </td>
                    <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                      <Badge tone={getRemoteWorkTone(row.remote_work)}>
                        {row.remote_work || 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    className="border-b border-border px-4 py-8 text-center text-sm text-text-secondary"
                    colSpan={5}
                  >
                    No Supabase rows available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
          <p className="text-sm text-text-secondary">
            Page {numberFormatter.format(currentPage)} of{' '}
            {numberFormatter.format(totalPages)}
          </p>
          <div className="flex items-center gap-3 max-md:grid max-md:grid-cols-2">
            <Button
              disabled={!canGoBack}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              disabled={!canGoForward}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              type="button"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DataTablePage
