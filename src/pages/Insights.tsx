import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight, Laptop, Lightbulb, TrendingUp, Trophy } from 'lucide-react'
import IconTitle from '../components/ui/IconTitle'

type InsightRowProps = {
  body: string
  chart: ReactNode
  icon: LucideIcon
  title: string
}

const salaryGrowthPoints = '6,96 34,82 62,68 90,54 118,39 146,24'

const workTypeSegments = [
  {
    color: 'var(--color-success)',
    dash: '82 100',
    label: 'Remote',
    rotation: -90,
    value: '$154K',
  },
  {
    color: 'var(--color-info)',
    dash: '64 100',
    label: 'Hybrid',
    rotation: 205,
    value: '$151K',
  },
  {
    color: 'var(--color-danger)',
    dash: '54 100',
    label: 'On-site',
    rotation: 345,
    value: '$148K',
  },
]

const topRoleBars = [
  { label: 'AI', value: 96 },
  { label: 'ML', value: 88 },
  { label: 'PM', value: 78 },
]

function MiniLineChart() {
  return (
    <div
      aria-label="Salary growth mini line chart"
      className="grid h-full min-h-0 place-items-center"
    >
      <svg
        className="h-full max-h-[118px] w-full"
        role="img"
        viewBox="0 0 152 104"
      >
        <defs>
          <linearGradient id="salary-growth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.36" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d={`M ${salaryGrowthPoints} L 146 98 L 6 98 Z`}
          fill="url(#salary-growth-fill)"
        />
        <polyline
          fill="none"
          points={salaryGrowthPoints}
          stroke="var(--color-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <circle cx="146" cy="24" fill="var(--color-info)" r="5" />
      </svg>
    </div>
  )
}

function MiniWorkTypeChart() {
  return (
    <div className="flex h-full min-h-0 items-center gap-3">
      <svg
        aria-label="Remote work salary comparison mini donut chart"
        className="h-24 w-24 flex-none"
        role="img"
        viewBox="0 0 42 42"
      >
        <circle
          cx="21"
          cy="21"
          fill="transparent"
          r="15.915"
          stroke="var(--color-bg-elevated)"
          strokeWidth="6"
        />
        {workTypeSegments.map((segment) => (
          <circle
            cx="21"
            cy="21"
            fill="transparent"
            key={segment.label}
            r="15.915"
            stroke={segment.color}
            strokeDasharray={segment.dash}
            strokeLinecap="round"
            strokeWidth="6"
            transform={`rotate(${segment.rotation} 21 21)`}
          />
        ))}
      </svg>
      <div className="grid min-w-0 gap-1">
        {workTypeSegments.map((segment) => (
          <div
            className="flex items-center justify-between gap-2 text-[0.72rem] text-text-secondary"
            key={segment.label}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="h-2 w-2 flex-none rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate">{segment.label}</span>
            </span>
            <strong className="font-mono text-text-primary">
              {segment.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniTopRolesChart() {
  return (
    <div
      aria-label="Top paying job roles mini bar chart"
      className="grid h-full w-full min-h-0 content-center gap-2"
    >
      {topRoleBars.map((role) => (
        <div className="grid grid-cols-[2rem_1fr] items-center gap-2" key={role.label}>
          <span className="font-mono text-[0.72rem] text-text-secondary">
            {role.label}
          </span>
          <span className="h-3 overflow-hidden rounded bg-bg-elevated">
            <span
              className="block h-full rounded bg-primary"
              style={{ width: `${role.value}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Desktop: original landscape row layout ────────────────────────────────────
function InsightRow({ body, chart, icon, title }: InsightRowProps) {
  return (
    <article className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(7.5rem,13rem)] items-center gap-3 overflow-hidden rounded-lg border border-border bg-bg-surface p-3 transition-colors duration-150 hover:border-border-strong md:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)] md:gap-5 md:p-5">
      <div className="min-w-0 overflow-hidden">
        <IconTitle
          as="h2"
          className="text-lg md:text-xl"
          icon={icon}
          iconClassName="h-8 w-8"
          iconSize={18}
        >
          {title}
        </IconTitle>
        <p className="mt-2 overflow-hidden text-[0.78rem] leading-snug text-text-secondary md:text-sm md:leading-relaxed">
          {body}
        </p>
      </div>
      <div className="h-full min-h-0 overflow-hidden rounded-lg border border-border bg-bg-elevated p-2 md:p-3">
        {chart}
      </div>
    </article>
  )
}

// ── Mobile: portrait paginated card ──────────────────────────────────────────
type InsightCardProps = InsightRowProps & {
  index: number
  total: number
}

function InsightCard({ body, chart, icon: Icon, index, title, total }: InsightCardProps) {
  return (
    <article className="flex flex-1 flex-col items-center gap-4 overflow-hidden rounded-lg border border-border bg-bg-surface p-5">
      {/* Title — horizontal alignment */}
      <div className="flex w-full items-center justify-center gap-3">
        <span
          className="flex items-center justify-center rounded-md p-1.5"
          style={{ background: 'var(--color-primary-subtle)' }}
        >
          <Icon
            size={20}
            style={{ color: 'var(--color-primary)' }}
          />
        </span>
        <h2
          className="text-base font-semibold leading-snug"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
      </div>

      {/* Chart — centered */}
      <div
        className="w-full flex-none overflow-hidden rounded-lg border"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-elevated)',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '9rem',
        }}
      >
        {chart}
      </div>

      {/* Paragraph */}
      <p
        className="w-full flex-1 overflow-auto text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
      >
        {body}
      </p>

      {/* Dot indicator at bottom */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: i === index ? '1.25rem' : '0.4rem',
              height: '0.4rem',
              borderRadius: '9999px',
              background: i === index ? 'var(--color-primary)' : 'var(--color-border-strong)',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
    </article>
  )
}

const INSIGHTS = [
  {
    body: 'Salary increases steadily as years of experience grow, starting from around 118,000 at entry level to over 173,000 for highly experienced professionals. This shows a strong positive relationship between experience and salary. It confirms that long-term career growth leads to higher earning potential.',
    chart: <MiniLineChart />,
    icon: TrendingUp,
    title: 'Salary Growth with Experience',
  },
  {
    body: 'Remote jobs have slightly higher average salaries compared to hybrid and on-site roles. While the difference is not very large, remote work still offers a financial advantage. This suggests that remote opportunities are competitive in terms of compensation.',
    chart: <MiniWorkTypeChart />,
    icon: Laptop,
    title: 'Remote Work Salary Comparison',
  },
  {
    body: 'AI Engineer has the highest average salary, followed by Machine Learning Engineer and Product Manager. This shows that roles related to AI and advanced technologies offer higher compensation compared to other roles. It highlights the strong demand for specialized technical skills in the job market.',
    chart: <MiniTopRolesChart />,
    icon: Trophy,
    title: 'Top Paying Job Roles',
  },
]

function Insights() {
  const [activePage, setActivePage] = useState(0)

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-3 overflow-hidden md:h-[calc(100dvh-7rem)] md:gap-4">
      <header className="shrink-0">
        <IconTitle className="text-2xl md:text-[2rem]" icon={Lightbulb}>
          Job Salary Insights
        </IconTitle>
      </header>

      {/* ── Desktop: 3-row stacked layout (unchanged) ── */}
      <div className="hidden min-h-0 flex-1 grid-rows-3 gap-3 overflow-hidden md:grid md:gap-4">
        {INSIGHTS.map((item) => (
          <InsightRow
            key={item.title}
            body={item.body}
            chart={item.chart}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </div>

      {/* ── Mobile: paginated portrait card ── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
        <InsightCard
          key={INSIGHTS[activePage].title}
          body={INSIGHTS[activePage].body}
          chart={INSIGHTS[activePage].chart}
          icon={INSIGHTS[activePage].icon}
          index={activePage}
          title={INSIGHTS[activePage].title}
          total={INSIGHTS.length}
        />

        {/* Prev / Next navigation */}
        <div
          className="flex shrink-0 items-center justify-between gap-3"
        >
          <button
            aria-label="Previous insight"
            disabled={activePage === 0}
            onClick={() => setActivePage((p) => Math.max(0, p - 1))}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid var(--color-border-strong)',
              background: 'var(--color-bg-elevated)',
              color: activePage === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: activePage === 0 ? 'not-allowed' : 'pointer',
              opacity: activePage === 0 ? 0.45 : 1,
              transition: 'all 0.15s ease',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
            }}
          >
            {activePage + 1} / {INSIGHTS.length}
          </span>

          <button
            aria-label="Next insight"
            disabled={activePage === INSIGHTS.length - 1}
            onClick={() => setActivePage((p) => Math.min(INSIGHTS.length - 1, p + 1))}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: activePage === INSIGHTS.length - 1 ? 'not-allowed' : 'pointer',
              opacity: activePage === INSIGHTS.length - 1 ? 0.45 : 1,
              transition: 'all 0.15s ease',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Insights
