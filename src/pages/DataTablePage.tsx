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

  // ── Mobile filter modal state ──────────────────────────────────────────────
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [tempJobTitle, setTempJobTitle] = useState('')
  const [tempIndustry, setTempIndustry] = useState('')
  const [tempWorkSetup, setTempWorkSetup] = useState('')
  const [tempSort, setTempSort] = useState<SortKey>('database')

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

  // ── Mobile modal helpers ───────────────────────────────────────────────────
  function openMobileFilter() {
    setTempJobTitle(selectedJobTitle)
    setTempIndustry(selectedIndustry)
    setTempWorkSetup(selectedWorkSetup)
    setTempSort(selectedSort)
    setIsMobileFilterOpen(true)
  }

  function applyMobileFilters() {
    setCurrentPage(1)
    setSelectedJobTitle(tempJobTitle)
    setSelectedIndustry(tempIndustry)
    setSelectedWorkSetup(tempWorkSetup)
    setSelectedSort(tempSort)
    setIsMobileFilterOpen(false)
  }

  function resetMobileFilters() {
    setTempJobTitle('')
    setTempIndustry('')
    setTempWorkSetup('')
    setTempSort('database')
  }

  const mobileActiveCount = [
    tempJobTitle !== '',
    tempIndustry !== '',
    tempWorkSetup !== '',
    tempSort !== 'database',
  ].filter(Boolean).length

  const appliedActiveCount = [
    selectedJobTitle !== '',
    selectedIndustry !== '',
    selectedWorkSetup !== '',
    selectedSort !== 'database',
  ].filter(Boolean).length

  const mobileSelectClass =
    'min-h-10 w-full cursor-pointer rounded-lg border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold normal-case text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

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

      <section className="animate-fade-slide-up flex max-h-[calc(100vh-13.5rem)] min-h-[360px] max-md:min-h-[570px] flex-col rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:max-h-[calc(100vh-12rem)] md:p-6">

        {/* ── Desktop filter bar — hidden on mobile, unchanged ── */}
        <div className="mb-5 grid gap-3 max-md:hidden md:grid-cols-[repeat(4,minmax(0,1fr))_5.5rem]">
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

        {/* ── Mobile: pill button to open filter modal — hidden on desktop ── */}
        <div className="mb-4 flex items-center gap-2 md:hidden">
          <button
            id="mobile-filter-btn"
            onClick={openMobileFilter}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              border: hasActiveControls
                ? '2px solid #6366f1'
                : '1.5px solid var(--color-border-strong)',
              background: hasActiveControls
                ? 'rgba(99,102,241,0.12)'
                : 'var(--color-bg-elevated)',
              color: hasActiveControls ? '#818cf8' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.18s',
              letterSpacing: '0.01em',
              boxShadow: hasActiveControls
                ? '0 0 0 3px rgba(99,102,241,0.13)'
                : 'none',
            }}
          >
            {/* Sliders icon */}
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              width="16"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
              <circle cx="8" cy="6" fill="currentColor" r="2" stroke="none" />
              <circle cx="16" cy="12" fill="currentColor" r="2" stroke="none" />
              <circle cx="10" cy="18" fill="currentColor" r="2" stroke="none" />
            </svg>
            Filters &amp; Sort
            {hasActiveControls && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#6366f1',
                  color: '#fff',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  minWidth: '1.25rem',
                  height: '1.25rem',
                  padding: '0 0.3rem',
                }}
              >
                {appliedActiveCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Table ── */}
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

        {/* ── Pagination ── */}
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

      {/* ── Mobile filter bottom-sheet modal ─────────────────────────────────── */}
      {isMobileFilterOpen && (
        /* Overlay — click outside to close */
        <div
          id="mobile-filter-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileFilterOpen(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'mobileOverlayIn 0.22s ease',
          }}
        >
          {/* Sheet */}
          <div
            id="mobile-filter-sheet"
            style={{
              width: '100%',
              background: 'var(--color-bg-surface, #1a1a2e)',
              borderRadius: '1.25rem 1.25rem 0 0',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
              animation: 'mobileSheetIn 0.25s cubic-bezier(0.32,0.72,0,1)',
              maxHeight: '90dvh',
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '0.75rem',
                paddingBottom: '0.25rem',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '0.25rem',
                  borderRadius: '9999px',
                  background: 'var(--color-border-strong, #444)',
                }}
              />
            </div>

            {/* Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.25rem 0.75rem',
                borderBottom: '1px solid var(--color-border, #222)',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                Filters &amp; Sort
              </span>

              {mobileActiveCount > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#818cf8',
                    background: 'rgba(99,102,241,0.15)',
                    borderRadius: '9999px',
                    padding: '0.15rem 0.65rem',
                  }}
                >
                  {mobileActiveCount} active
                </span>
              )}

              {/* Close button */}
              <button
                aria-label="Close filter panel"
                onClick={() => setIsMobileFilterOpen(false)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-strong)',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: '0.3rem',
                  borderRadius: '0.5rem',
                  transition: 'background 0.15s',
                }}
              >
                <svg
                  fill="none"
                  height="18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                  width="18"
                >
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* Filter fields */}
            <div
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
              }}
            >
              {/* Job Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Job Title
                </span>
                <select
                  className={mobileSelectClass}
                  onChange={(e) => setTempJobTitle(e.target.value)}
                  value={tempJobTitle}
                >
                  <option value="">All job titles</option>
                  {jobTitleOptions.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Industry
                </span>
                <select
                  className={mobileSelectClass}
                  onChange={(e) => setTempIndustry(e.target.value)}
                  value={tempIndustry}
                >
                  <option value="">All industries</option>
                  {industryOptions.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Setup */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Work Setup
                </span>
                <select
                  className={mobileSelectClass}
                  onChange={(e) => setTempWorkSetup(e.target.value)}
                  value={tempWorkSetup}
                >
                  <option value="">All work setups</option>
                  {workSetupOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Sort By
                </span>
                <select
                  className={mobileSelectClass}
                  onChange={(e) => setTempSort(e.target.value as SortKey)}
                  value={tempSort}
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'var(--color-border, #222)',
                  margin: '0.15rem 0',
                }}
              />

              {/* Action buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <button
                  disabled={mobileActiveCount === 0}
                  id="mobile-filter-reset-btn"
                  onClick={resetMobileFilters}
                  type="button"
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--color-border-strong)',
                    background: 'var(--color-bg-elevated)',
                    color:
                      mobileActiveCount === 0
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: mobileActiveCount === 0 ? 'not-allowed' : 'pointer',
                    opacity: mobileActiveCount === 0 ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  Reset
                </button>
                <button
                  id="mobile-filter-apply-btn"
                  onClick={applyMobileFilters}
                  type="button"
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(175,23,99,0.35)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    ; (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-primary-hover)'
                  }}
                  onMouseLeave={(e) => {
                    ; (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-primary)'
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Injected keyframe animations */}
          <style>{`
            @keyframes mobileOverlayIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes mobileSheetIn {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

export default DataTablePage
