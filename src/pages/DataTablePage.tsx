import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DataTable, { type SalesRow } from '../components/ui/DataTable'

const salesRows: SalesRow[] = [
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
  {
    account: 'Orbit Logistics',
    amount: '$138,900',
    owner: 'Jules Park',
    region: 'North America',
    stage: 'Discovery',
    status: 'On track',
  },
  {
    account: 'Summit BioLabs',
    amount: '$316,400',
    owner: 'Nora Ellis',
    region: 'EMEA',
    stage: 'Validation',
    status: 'Review',
  },
  {
    account: 'Vector Manufacturing',
    amount: '$204,700',
    owner: 'Theo Lane',
    region: 'LATAM',
    stage: 'Proposal',
    status: 'On track',
  },
]

function DataTablePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-start justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <span className="inline-flex font-display text-xs font-semibold uppercase text-primary">
            Data Table
          </span>
          <h1 className="mt-1 font-display text-[2.25rem] font-bold leading-[1.1] text-text-primary">
            Opportunity register
          </h1>
          <p className="text-sm text-text-secondary">
            Pipeline records prepared for filtering, sorting, and future data
            context.
          </p>
        </div>
        <div className="flex items-center gap-3 max-md:justify-between">
          <Badge tone="info">{salesRows.length} records</Badge>
          <Button type="button" variant="secondary">
            Add Filter
          </Button>
        </div>
      </section>

      <section className="animate-fade-slide-up rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Sales opportunities
            </h2>
            <p className="text-sm text-text-secondary">
              Static rows for the first dashboard structure pass.
            </p>
          </div>
          <Badge tone="primary">Synced</Badge>
        </div>
        <DataTable rows={salesRows} />
      </section>
    </div>
  )
}

export default DataTablePage
