import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const JOB_TITLES_RPC = 'get_job_titles'

type JobTitleResponse = {
  job_title?: string | null
}

type TopbarProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onSidebarToggle: () => void
}

const pageTitles: Record<string, { label: string; title: string }> = {
  '/': {
    label: 'Home',
    title: 'Job Analytics Dashboard',
  },
  '/data-table': {
    label: 'Data Table',
    title: 'Opportunity register',
  },
  '/insights': {
    label: 'Insights',
    title: 'Signals that need action',
  },
}

async function fetchJobTitles() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env',
    )
  }

  const { data, error } = await supabase.rpc(JOB_TITLES_RPC)

  if (error) {
    throw error
  }

  const rows = (data ?? []) as JobTitleResponse[]

  return rows
    .map((row) => row.job_title?.trim() ?? '')
    .filter((jobTitle) => jobTitle.length > 0)
}

function Topbar({
  isSidebarCollapsed,
  onMenuClick,
  onSidebarToggle,
}: TopbarProps) {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [isJobTitlesLoading, setIsJobTitlesLoading] = useState(false)
  const [jobTitlesError, setJobTitlesError] = useState<string | null>(null)
  const pageTitle = pageTitles[pathname] ?? pageTitles['/']
  const selectedJobTitle = searchParams.get('job_title') ?? ''
  const isHomePage = pathname === '/'

  const loadJobTitles = useCallback(async () => {
    setIsJobTitlesLoading(true)
    setJobTitlesError(null)

    try {
      const nextJobTitles = await fetchJobTitles()

      setJobTitles(nextJobTitles)

      if (selectedJobTitle && !nextJobTitles.includes(selectedJobTitle)) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('job_title')
        setSearchParams(nextParams, { replace: true })
      }
    } catch (error) {
      setJobTitlesError(
        error instanceof Error ? error.message : 'Could not load job titles',
      )
    } finally {
      setIsJobTitlesLoading(false)
    }
  }, [searchParams, selectedJobTitle, setSearchParams])

  useEffect(() => {
    if (isHomePage) {
      void loadJobTitles()
    }
  }, [isHomePage, loadJobTitles])

  function handleJobTitleChange(value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set('job_title', value)
    } else {
      nextParams.delete('job_title')
    }

    setSearchParams(nextParams)
  }

  return (
    <header className="sticky top-0 z-[100] flex min-h-16 items-center gap-4 border-b border-border bg-bg-surface px-4 md:px-6">
      <button
        aria-label="Open sidebar"
        className="flex h-10 w-10 flex-none cursor-pointer flex-col justify-center gap-[5px] rounded-lg border-0 bg-bg-elevated px-3 transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <span className="block h-0.5 rounded-sm bg-text-primary" />
        <span className="block h-0.5 rounded-sm bg-text-primary" />
        <span className="block h-0.5 rounded-sm bg-text-primary" />
      </button>

      <button
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden min-h-9 cursor-pointer rounded-lg border border-border-strong bg-transparent px-4 font-display text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:block"
        onClick={onSidebarToggle}
        type="button"
      >
        {isSidebarCollapsed ? 'Expand' : 'Collapse'}
      </button>

      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-text-secondary">{pageTitle.label}</span>
        <strong className="truncate font-display text-base font-semibold text-text-primary">
          {pageTitle.title}
        </strong>
      </div>

      {isHomePage && (
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <label className="sr-only" htmlFor="home-job-title-filter">
            Filter Home dashboard by job title
          </label>
          <select
            className="min-h-10 w-64 max-w-[34vw] cursor-pointer rounded border border-border-strong bg-bg-elevated px-3 font-display text-sm font-semibold text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isJobTitlesLoading || jobTitles.length === 0}
            id="home-job-title-filter"
            onChange={(event) => handleJobTitleChange(event.target.value)}
            title={jobTitlesError ?? undefined}
            value={selectedJobTitle}
          >
            <option value="">All job titles</option>
            {jobTitles.map((jobTitle) => (
              <option key={jobTitle} value={jobTitle}>
                {jobTitle}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  )
}

export default Topbar
