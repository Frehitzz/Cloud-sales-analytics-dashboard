import { useCallback, useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import ChartCard from '../components/ui/ChartCard'
import DataTable, { type SalesRow } from '../components/ui/DataTable'
import KPICard from '../components/ui/KPICard'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const DASHBOARD_STATS_RPC = 'get_dashboard_stats'

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

const chartBars = [62, 78, 70, 86, 92, 88, 96, 104, 118, 126, 132, 146]

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

function Home() {
  const [stats, setStats] = useState<HomeStats>(defaultStats)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

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

  useEffect(() => {
    let isMounted = true

    void loadStats(() => isMounted)

    return () => {
      isMounted = false
    }
  }, [loadStats])

  const kpiDelta = statsError ? 'Error' : isStatsLoading ? 'Loading' : 'Live'
  const kpiDeltaTone = statsError
    ? 'danger'
    : isStatsLoading
      ? 'warning'
      : 'success'

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <span className="inline-flex font-display text-xs font-semibold uppercase text-primary">
            Home
          </span>
          <h1 className="mt-1 font-display text-[2.25rem] font-bold leading-[1.1] text-text-primary">
            Sales dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            Revenue, pipeline, and account movement for the active quarter.
          </p>
          {statsError && (
            <p className="mt-2 text-sm text-danger">
              Supabase stats failed to load: {statsError}
            </p>
          )}
        </div>
        <Button
          disabled={isStatsLoading}
          onClick={() => void loadStats()}
          type="button"
        >
          {isStatsLoading ? 'Loading...' : 'Refresh Data'}
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
            <span className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded bg-info-subtle px-2 py-0.5 text-xs font-semibold text-info">
              Monthly
            </span>
          }
          eyebrow="Revenue trend"
          title="Closed revenue"
          wide
        >
          <div
            className="flex min-h-[188px] items-end gap-2 md:gap-3"
            aria-label="Monthly closed revenue"
          >
            {chartBars.map((bar, index) => (
              <div
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
                key={index}
              >
                <span
                  className="w-full max-h-[148px] rounded-t-md bg-gradient-to-b from-primary to-info"
                  style={{ height: `${bar}px` }}
                />
                <small className="font-mono text-xs text-text-muted">
                  {index + 1}
                </small>
              </div>
            ))}
          </div>
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
