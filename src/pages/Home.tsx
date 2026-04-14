import Button from '../components/ui/Button'
import ChartCard from '../components/ui/ChartCard'
import DataTable, { type SalesRow } from '../components/ui/DataTable'
import KPICard from '../components/ui/KPICard'

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

function Home() {
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
        </div>
        <Button type="button">Refresh Data</Button>
      </section>

      <section
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 md:gap-6"
        aria-label="Key sales metrics"
      >
        <KPICard
          delta="+12.4%"
          deltaTone="success"
          label="Total Revenue"
          sparkline={[48, 51, 57, 63, 70, 83, 91]}
          value="$1.28M"
        />
        <KPICard
          delta="+8.7%"
          deltaTone="success"
          label="Pipeline Value"
          sparkline={[52, 49, 58, 64, 66, 72, 79]}
          value="$4.82M"
        />
        <KPICard
          delta="-3.1%"
          deltaTone="danger"
          label="Churn Risk"
          sparkline={[70, 74, 68, 73, 80, 78, 76]}
          value="18"
        />
        <KPICard
          delta="Review"
          deltaTone="warning"
          label="Open Deals"
          sparkline={[35, 44, 41, 49, 57, 62, 68]}
          value="246"
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
