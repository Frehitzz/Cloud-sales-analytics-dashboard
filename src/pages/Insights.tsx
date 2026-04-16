import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Laptop, Lightbulb, TrendingUp, Trophy } from 'lucide-react'
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
      className="grid h-full min-h-0 content-center gap-2"
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

function Insights() {
  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col gap-3 overflow-hidden md:h-[calc(100dvh-7rem)] md:gap-4">
      <header className="shrink-0">
        <IconTitle className="text-2xl md:text-[2rem]" icon={Lightbulb}>
          Job Salary Insights
        </IconTitle>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-3 gap-3 overflow-hidden md:gap-4">
        <InsightRow
          body="Salary increases steadily as years of experience grow, starting from around 118,000 at entry level to over 173,000 for highly experienced professionals. This shows a strong positive relationship between experience and salary. It confirms that long-term career growth leads to higher earning potential."
          chart={<MiniLineChart />}
          icon={TrendingUp}
          title="Salary Growth with Experience"
        />
        <InsightRow
          body="Remote jobs have slightly higher average salaries compared to hybrid and on-site roles. While the difference is not very large, remote work still offers a financial advantage. This suggests that remote opportunities are competitive in terms of compensation."
          chart={<MiniWorkTypeChart />}
          icon={Laptop}
          title="Remote Work Salary Comparison"
        />
        <InsightRow
          body="AI Engineer has the highest average salary, followed by Machine Learning Engineer and Product Manager. This shows that roles related to AI and advanced technologies offer higher compensation compared to other roles. It highlights the strong demand for specialized technical skills in the job market."
          chart={<MiniTopRolesChart />}
          icon={Trophy}
          title="Top Paying Job Roles"
        />
      </div>
    </div>
  )
}

export default Insights
