import Badge from './Badge'

export type SalesRow = {
  account: string
  amount: string
  owner: string
  region: string
  stage: string
  status: 'On track' | 'Risk' | 'Review'
}

type DataTableProps = {
  rows: SalesRow[]
}

const statusTone = {
  'On track': 'success',
  Risk: 'danger',
  Review: 'warning',
} as const

function DataTable({ rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Account
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Region
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Owner
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Stage
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Amount
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-display text-xs font-semibold uppercase text-text-secondary">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="group" key={`${row.account}-${row.owner}`}>
              <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                {row.account}
              </td>
              <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                {row.region}
              </td>
              <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                {row.owner}
              </td>
              <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                {row.stage}
              </td>
              <td className="border-b border-border px-4 py-4 font-mono text-sm font-semibold text-text-primary group-hover:bg-bg-hover">
                {row.amount}
              </td>
              <td className="border-b border-border px-4 py-4 text-sm text-text-primary group-hover:bg-bg-hover">
                <Badge tone={statusTone[row.status]}>{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
