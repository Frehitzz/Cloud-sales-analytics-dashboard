import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'
import Button from '../components/ui/Button'
import ChartCard from '../components/ui/ChartCard'
import DataTable, { type SalesRow } from '../components/ui/DataTable'
import KPICard from '../components/ui/KPICard'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const DASHBOARD_STATS_RPC = 'get_dashboard_stats'
const SALARY_BY_EXPERIENCE_RPC = 'get_avg_salary_by_experience'
const JOB_TITLES_RPC = 'get_job_titles'
const RECHARTS_CDN_SRC =
  'https://cdnjs.cloudflare.com/ajax/libs/recharts/3.2.1/Recharts.min.js'

type RechartsProps = {
  children?: React.ReactNode
  [key: string]: unknown
}

type RechartsBundle = {
  CartesianGrid: React.ComponentType<RechartsProps>
  Line: React.ComponentType<RechartsProps>
  LineChart: React.ComponentType<RechartsProps>
  ResponsiveContainer: React.ComponentType<RechartsProps>
  Tooltip: React.ComponentType<RechartsProps>
  XAxis: React.ComponentType<RechartsProps>
  YAxis: React.ComponentType<RechartsProps>
}

declare global {
  interface Window {
    React?: typeof React
    ReactDOM?: typeof ReactDOM
    ReactIs?: Record<string, unknown>
    Recharts?: RechartsBundle
  }
}

type HomeStats = {
  averageExperience: number
  averageSalary: number
  highestSalary: number
  totalRecords: number
}

// 4 kpi cards
type DashboardStatsResponse = {
  averageExperience?: number | string | null
  averageSalary?: number | string | null
  highestSalary?: number | string | null
  totalRecords?: number | string | null
}

type SalaryByExperiencePoint = {
  avgSalary: number
  experienceYears: number
  label: string
  rowCount: number
}

type SalaryByExperienceResponse = {
  avg_salary?: number | string | null
  experience_years?: number | string | null
  row_count?: number | string | null
}

type JobTitleResponse = {
  job_title?: string | null
}

const pipelineRows: SalesRow[] = [
  {
    account: 'HelioCore Systems',
    amount: '$284,000',
    owner: 'Ari Kim',
    region: 'North America',
    stage: 'Proposal',
    status: 'On track',
  },
  {
    account: 'Nimbus Retail Group',
    amount: '$176,500',
    owner: 'Mina Hart',
    region: 'EMEA',
    stage: 'Negotiation',
    status: 'Review',
  },
  {
    account: 'Atlas Fintech',
    amount: '$421,800',
    owner: 'Leo Grant',
    region: 'APAC',
    stage: 'Contract',
    status: 'Risk',
  },
]

let rechartsLoadPromise: Promise<void> | null = null

const defaultStats: HomeStats = {
  averageExperience: 0,
  averageSalary: 0,
  highestSalary: 0,
  totalRecords: 0,
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  notation: 'compact',
  style: 'currency',
})

const numberFormatter = new Intl.NumberFormat('en-US')

function formatCurrency(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '$0'
  }

  return currencyFormatter.format(value)
}

function formatYears(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 yrs'
  }

  return `${value.toFixed(1)} yrs`
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    return Number(value)
  }

  return 0
}

function createReactIsGlobal() {
  const reactElementType = Symbol.for('react.transitional.element')
  const reactPortalType = Symbol.for('react.portal')
  const reactFragmentType = Symbol.for('react.fragment')
  const reactStrictModeType = Symbol.for('react.strict_mode')
  const reactProfilerType = Symbol.for('react.profiler')
  const reactConsumerType = Symbol.for('react.consumer')
  const reactContextType = Symbol.for('react.context')
  const reactForwardRefType = Symbol.for('react.forward_ref')
  const reactSuspenseType = Symbol.for('react.suspense')
  const reactSuspenseListType = Symbol.for('react.suspense_list')
  const reactMemoType = Symbol.for('react.memo')
  const reactLazyType = Symbol.for('react.lazy')
  const reactViewTransitionType = Symbol.for('react.view_transition')
  const reactClientReferenceType = Symbol.for('react.client.reference')

  function typeOf(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return undefined
    }

    const element = value as {
      $$typeof?: symbol
      getModuleId?: unknown
      type?: { $$typeof?: symbol } | symbol
    }

    if (element.$$typeof === reactElementType) {
      const elementType = element.type

      switch (element.type) {
        case reactFragmentType:
        case reactProfilerType:
        case reactStrictModeType:
        case reactSuspenseType:
        case reactSuspenseListType:
        case reactViewTransitionType:
          return element.type
        default:
          const nestedType =
            typeof elementType === 'object' && elementType !== null
              ? elementType.$$typeof
              : undefined

          switch (nestedType) {
            case reactContextType:
            case reactForwardRefType:
            case reactLazyType:
            case reactMemoType:
            case reactConsumerType:
              return nestedType
            default:
              return element.$$typeof
          }
      }
    }

    if (element.$$typeof === reactPortalType) {
      return element.$$typeof
    }

    return undefined
  }

  function isValidElementType(value: unknown) {
    return (
      typeof value === 'string' ||
      typeof value === 'function' ||
      value === reactFragmentType ||
      value === reactProfilerType ||
      value === reactStrictModeType ||
      value === reactSuspenseType ||
      value === reactSuspenseListType ||
      (typeof value === 'object' &&
        value !== null &&
        (((value as { $$typeof?: symbol }).$$typeof &&
          [
            reactLazyType,
            reactMemoType,
            reactContextType,
            reactConsumerType,
            reactForwardRefType,
            reactClientReferenceType,
          ].includes((value as { $$typeof?: symbol }).$$typeof as symbol)) ||
          (value as { getModuleId?: unknown }).getModuleId !== undefined))
    )
  }

  return {
    ContextConsumer: reactConsumerType,
    ContextProvider: reactContextType,
    Element: reactElementType,
    ForwardRef: reactForwardRefType,
    Fragment: reactFragmentType,
    Lazy: reactLazyType,
    Memo: reactMemoType,
    Portal: reactPortalType,
    Profiler: reactProfilerType,
    StrictMode: reactStrictModeType,
    Suspense: reactSuspenseType,
    SuspenseList: reactSuspenseListType,
    isContextConsumer: (value: unknown) => typeOf(value) === reactConsumerType,
    isContextProvider: (value: unknown) => typeOf(value) === reactContextType,
    isElement: (value: unknown) =>
      typeof value === 'object' &&
      value !== null &&
      (value as { $$typeof?: symbol }).$$typeof === reactElementType,
    isForwardRef: (value: unknown) => typeOf(value) === reactForwardRefType,
    isFragment: (value: unknown) => typeOf(value) === reactFragmentType,
    isLazy: (value: unknown) => typeOf(value) === reactLazyType,
    isMemo: (value: unknown) => typeOf(value) === reactMemoType,
    isPortal: (value: unknown) => typeOf(value) === reactPortalType,
    isProfiler: (value: unknown) => typeOf(value) === reactProfilerType,
    isStrictMode: (value: unknown) => typeOf(value) === reactStrictModeType,
    isSuspense: (value: unknown) => typeOf(value) === reactSuspenseType,
    isSuspenseList: (value: unknown) =>
      typeOf(value) === reactSuspenseListType,
    isValidElementType,
    typeOf,
  }
}

function loadRechartsFromCdn() {
  if (window.Recharts) {
    return Promise.resolve()
  }

  if (rechartsLoadPromise) {
    return rechartsLoadPromise
  }

  window.React = React
  window.ReactDOM = ReactDOM
  window.ReactIs = window.ReactIs ?? createReactIsGlobal()

  rechartsLoadPromise = new Promise<void>((resolve, reject) => {
    const finishLoad = () => {
      if (window.Recharts) {
        resolve()
        return
      }

      reject(new Error('Recharts CDN loaded but did not expose window.Recharts'))
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RECHARTS_CDN_SRC}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', finishLoad, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Could not load Recharts from CDNJS')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = RECHARTS_CDN_SRC
    script.onload = finishLoad
    script.onerror = () => reject(new Error('Could not load Recharts from CDNJS'))

    document.head.appendChild(script)
  })

  return rechartsLoadPromise
}

async function fetchHomeStats() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env',
    )
  }

  const { data, error } = await supabase.rpc(DASHBOARD_STATS_RPC)

  if (error) {
    throw error
  }

  const stats = data as DashboardStatsResponse | null

  return {
    averageExperience: toNumber(stats?.averageExperience),
    averageSalary: toNumber(stats?.averageSalary),
    highestSalary: toNumber(stats?.highestSalary),
    totalRecords: toNumber(stats?.totalRecords),
  }
}

async function fetchSalaryByExperience(jobTitle: string | null) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env',
    )
  }

  const { data, error } = await supabase.rpc(SALARY_BY_EXPERIENCE_RPC, {
    p_job_title: jobTitle,
  })

  if (error) {
    throw error
  }

  const rows = (data ?? []) as SalaryByExperienceResponse[]

  return rows
    .map((row) => {
      const experienceYears = toNumber(row.experience_years)
      const avgSalary = toNumber(row.avg_salary)
      const rowCount = toNumber(row.row_count)

      return {
        avgSalary,
        experienceYears,
        label: `${experienceYears} yrs`,
        rowCount,
      }
    })
    .filter(
      (row) =>
        Number.isFinite(row.experienceYears) &&
        Number.isFinite(row.avgSalary) &&
        row.avgSalary > 0,
    )
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

function Home() {
  const [stats, setStats] = useState<HomeStats>(defaultStats)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [salaryByExperience, setSalaryByExperience] = useState<
    SalaryByExperiencePoint[]
  >([])
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [chartError, setChartError] = useState<string | null>(null)
  const [isChartLoading, setIsChartLoading] = useState(true)
  const [jobTitlesError, setJobTitlesError] = useState<string | null>(null)
  const [isJobTitlesLoading, setIsJobTitlesLoading] = useState(true)
  const [isRechartsReady, setIsRechartsReady] = useState(false)

  const loadStats = useCallback(
    async (shouldApply: () => boolean = () => true) => {
      setIsStatsLoading(true)
      setStatsError(null)

      try {
        const nextStats = await fetchHomeStats()

        if (shouldApply()) {
          setStats(nextStats)
        }
      } catch (error) {
        if (shouldApply()) {
          setStatsError(
            error instanceof Error ? error.message : 'Could not load stats',
          )
        }
      } finally {
        if (shouldApply()) {
          setIsStatsLoading(false)
        }
      }
    },
    [],
  )

  const loadSalaryChart = useCallback(
    async (shouldApply: () => boolean = () => true) => {
      setIsChartLoading(true)
      setChartError(null)

      try {
        const [nextRows] = await Promise.all([
          fetchSalaryByExperience(selectedJobTitle || null),
          loadRechartsFromCdn(),
        ])

        if (shouldApply()) {
          setSalaryByExperience(nextRows)
          setIsRechartsReady(Boolean(window.Recharts))
        }
      } catch (error) {
        if (shouldApply()) {
          setChartError(
            error instanceof Error ? error.message : 'Could not load chart',
          )
        }
      } finally {
        if (shouldApply()) {
          setIsChartLoading(false)
        }
      }
    },
    [selectedJobTitle],
  )

  const loadJobTitles = useCallback(
    async (shouldApply: () => boolean = () => true) => {
      setIsJobTitlesLoading(true)
      setJobTitlesError(null)

      try {
        const nextJobTitles = await fetchJobTitles()

        if (shouldApply()) {
          setJobTitles(nextJobTitles)
          setSelectedJobTitle((currentJobTitle) =>
            currentJobTitle && !nextJobTitles.includes(currentJobTitle)
              ? ''
              : currentJobTitle,
          )
        }
      } catch (error) {
        if (shouldApply()) {
          setJobTitlesError(
            error instanceof Error
              ? error.message
              : 'Could not load job title filters',
          )
        }
      } finally {
        if (shouldApply()) {
          setIsJobTitlesLoading(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    let isMounted = true

    void loadStats(() => isMounted)
    void loadJobTitles(() => isMounted)
    void loadSalaryChart(() => isMounted)

    return () => {
      isMounted = false
    }
  }, [loadJobTitles, loadSalaryChart, loadStats])

  const kpiDelta = statsError ? 'Error' : isStatsLoading ? 'Loading' : 'Live'
  const kpiDeltaTone = statsError
    ? 'danger'
    : isStatsLoading
      ? 'warning'
      : 'success'
  const Recharts = isRechartsReady ? window.Recharts : undefined
  const chartStatus = chartError
    ? 'Error'
    : isChartLoading
      ? 'Loading'
      : 'Live'
  const isLoading = isStatsLoading || isChartLoading || isJobTitlesLoading

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <span className="inline-flex font-display text-xs font-semibold uppercase text-primary">
            Home
          </span>
          <h1 className="mt-1 font-display text-[2.25rem] font-bold leading-[1.1] text-text-primary">
            Job Analytics Dashboard
          </h1>
          {statsError && (
            <p className="mt-2 text-sm text-danger">
              Supabase stats failed to load: {statsError}
            </p>
          )}
        </div>
        <Button
          disabled={isLoading}
          onClick={() => {
            void loadStats()
            void loadJobTitles()
            void loadSalaryChart()
          }}
          type="button"
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </section>

      <section
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 md:gap-6"
        aria-label="Key sales metrics"
      >
        <KPICard
          delta={kpiDelta}
          deltaTone={kpiDeltaTone}
          label="Average Salary"
          sparkline={[48, 51, 57, 63, 70, 83, 91]}
          value={isStatsLoading ? '...' : formatCurrency(stats.averageSalary)}
        />
        <KPICard
          delta={kpiDelta}
          deltaTone={kpiDeltaTone}
          label="Highest Salary"
          sparkline={[52, 49, 58, 64, 66, 72, 79]}
          value={isStatsLoading ? '...' : formatCurrency(stats.highestSalary)}
        />
        <KPICard
          delta={kpiDelta}
          deltaTone={kpiDeltaTone}
          label="Total Records"
          sparkline={[10, 20, 30, 40, 50, 60, 70]}
          value={
            isStatsLoading ? '...' : numberFormatter.format(stats.totalRecords)
          }
        />
        <KPICard
          delta={kpiDelta}
          deltaTone={kpiDeltaTone}
          label="Average Experience"
          sparkline={[5, 6, 8, 7, 9, 8, 10]}
          value={isStatsLoading ? '...' : formatYears(stats.averageExperience)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <ChartCard
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="sr-only" htmlFor="salary-job-title-filter">
                Filter salary chart by job title
              </label>
              <select
                className="min-h-9 w-52 max-w-full rounded border border-border-strong bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isJobTitlesLoading || jobTitles.length === 0}
                id="salary-job-title-filter"
                onChange={(event) => setSelectedJobTitle(event.target.value)}
                value={selectedJobTitle}
              >
                <option value="">All job titles</option>
                {jobTitles.map((jobTitle) => (
                  <option key={jobTitle} value={jobTitle}>
                    {jobTitle}
                  </option>
                ))}
              </select>
              <span className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded bg-info-subtle px-2 py-0.5 text-xs font-semibold text-info">
                {chartStatus}
              </span>
            </div>
          }
          eyebrow="Salary trend"
          title="Average salary by experience"
          wide
        >
          {jobTitlesError && (
            <p className="mb-3 text-sm text-warning">
              Job title filter failed to load: {jobTitlesError}
            </p>
          )}

          {chartError && (
            <p className="min-h-[248px] text-sm text-danger">
              Salary chart failed to load: {chartError}
            </p>
          )}

          {!chartError && isChartLoading && (
            <p className="min-h-[248px] text-sm text-text-secondary">
              Loading average salary by experience...
            </p>
          )}

          {!chartError &&
            !isChartLoading &&
            (!Recharts || salaryByExperience.length === 0) && (
              <p className="min-h-[248px] text-sm text-text-secondary">
                No salary chart data available
                {selectedJobTitle ? ` for ${selectedJobTitle}.` : '.'}
              </p>
            )}

          {!chartError &&
            !isChartLoading &&
            Recharts &&
            salaryByExperience.length > 0 && (
              <div
                className="h-[280px] min-w-0"
                aria-label="Average salary by experience years"
              >
                <Recharts.ResponsiveContainer width="100%" height="100%">
                  <Recharts.LineChart
                    data={salaryByExperience}
                    margin={{ bottom: 8, left: 8, right: 12, top: 8 }}
                  >
                    <Recharts.CartesianGrid
                      stroke="var(--color-border)"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <Recharts.XAxis
                      dataKey="experienceYears"
                      name="Experience years"
                      interval={2}
                      stroke="var(--color-text-muted)"
                      tickFormatter={(value: number | string) =>
                        `${toNumber(value)}`
                      }
                      tickLine={false}
                    />
                    <Recharts.YAxis
                      name="Average salary"
                      stroke="var(--color-text-muted)"
                      tickFormatter={(value: number | string) =>
                        compactCurrencyFormatter.format(toNumber(value))
                      }
                      tickLine={false}
                      width={72}
                    />
                    <Recharts.Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: '8px',
                        boxShadow: '0 18px 40px rgb(0 0 0 / 0.28)',
                      }}
                      cursor={{ fill: 'var(--color-bg-hover)' }}
                      formatter={(value: number | string) => [
                        formatCurrency(toNumber(value)),
                        'Avg salary',
                      ]}
                      itemStyle={{
                        color: 'var(--color-text-primary)',
                      }}
                      labelFormatter={(value: number | string) =>
                        `${toNumber(value)} years experience`
                      }
                      labelStyle={{
                        color: 'var(--color-text-secondary)',
                        fontWeight: 600,
                      }}
                      wrapperStyle={{
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                      }}
                    />
                    <Recharts.Line
                      activeDot={{
                        fill: 'var(--color-info)',
                        r: 5,
                        stroke: 'var(--color-text-primary)',
                        strokeWidth: 2,
                      }}
                      dataKey="avgSalary"
                      dot={{
                        fill: 'var(--color-bg-surface)',
                        r: 3,
                        stroke: 'var(--color-primary)',
                        strokeWidth: 2,
                      }}
                      name="Avg salary"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </Recharts.LineChart>
                </Recharts.ResponsiveContainer>
              </div>
            )}
        </ChartCard>

        <ChartCard eyebrow="Coverage" title="Pipeline health">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4">
              <span className="text-sm text-text-secondary">Enterprise</span>
              <strong className="font-mono text-text-primary">72%</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4">
              <span className="text-sm text-text-secondary">Mid Market</span>
              <strong className="font-mono text-text-primary">64%</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4">
              <span className="text-sm text-text-secondary">SMB</span>
              <strong className="font-mono text-text-primary">58%</strong>
            </div>
          </div>
        </ChartCard>
      </section>

      <ChartCard eyebrow="Priority accounts" title="Active pipeline">
        <DataTable rows={pipelineRows} />
      </ChartCard>
    </div>
  )
}

export default Home
