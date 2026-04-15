import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ChartCard from '../components/ui/ChartCard'
import KPICard from '../components/ui/KPICard'

const insights = [
  {
    body: 'Enterprise renewals are moving faster than forecast, led by security and data platform bundles.',
    label: 'Expansion',
    tone: 'success',
    value: '+18%',
  },
  {
    body: 'APAC pipeline has strong top-of-funnel volume but needs qualification before month end.',
    label: 'Qualification',
    tone: 'warning',
    value: '41 deals',
  },
  {
    body: 'Three strategic accounts show procurement delays that could move revenue into next quarter.',
    label: 'Risk',
    tone: 'danger',
    value: '$620K',
  },
] as const

const segments = [
  { label: 'New business', value: 46 },
  { label: 'Expansion', value: 34 },
  { label: 'Renewals', value: 20 },
]

function Insights() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <h1 className="font-display text-[2.25rem] font-bold leading-[1.1] text-text-primary">
            Signals that need action
          </h1>
          <p className="text-sm text-text-secondary">
            Account movement, deal risk, and segment performance for sales
            leaders.
          </p>
        </div>
        <Button type="button" variant="secondary">
          Download Brief
        </Button>
      </section>

      <section
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 md:gap-6"
        aria-label="Insight metrics"
      >
        <KPICard
          delta="+5.2%"
          deltaTone="success"
          label="Win Rate"
          sparkline={[44, 49, 47, 53, 59, 61, 67]}
          value="34.8%"
        />
        <KPICard
          delta="-2 days"
          deltaTone="success"
          label="Sales Cycle"
          sparkline={[76, 73, 71, 68, 65, 63, 60]}
          value="42d"
        />
        <KPICard
          delta="$620K"
          deltaTone="danger"
          label="At Risk"
          sparkline={[35, 42, 49, 58, 62, 70, 79]}
          value="3 deals"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {insights.map((insight) => (
          <article
            className="flex animate-fade-slide-up flex-col gap-4 rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6"
            key={insight.label}
          >
            <div className="flex items-center justify-between gap-4">
              <Badge tone={insight.tone}>{insight.label}</Badge>
              <strong className="font-mono text-text-primary">
                {insight.value}
              </strong>
            </div>
            <p className="text-sm text-text-secondary">{insight.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <ChartCard eyebrow="Mix" title="Revenue composition" wide>
          <div className="flex flex-col gap-4">
            {segments.map((segment) => (
              <div className="flex flex-col gap-2" key={segment.label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary">
                    {segment.label}
                  </span>
                  <strong className="font-mono text-text-primary">
                    {segment.value}%
                  </strong>
                </div>
                <span className="block h-2.5 overflow-hidden rounded-lg bg-bg-elevated">
                  <span
                    className="block h-full rounded-lg bg-gradient-to-r from-primary to-teal"
                    style={{ width: `${segment.value}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard eyebrow="Next step" title="Recommended focus">
          <div className="flex flex-col gap-4">
            <p className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4 text-sm text-text-secondary">
              Prioritize contract review for Atlas Fintech.
            </p>
            <p className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4 text-sm text-text-secondary">
              Move APAC qualification calls into this week.
            </p>
            <p className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4 text-sm text-text-secondary">
              Assign executive sponsor to Nimbus Retail Group.
            </p>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}

export default Insights
