import Badge from './Badge'

type KPICardProps = {
  delta: string
  deltaTone: 'success' | 'danger' | 'warning'
  label: string
  sparkline?: number[]
  value: string
}

function KPICard({
  delta,
  deltaTone,
  label,
  sparkline = [42, 58, 51, 68, 74, 81, 88],
  value,
}: KPICardProps) {
  const maxValue = Math.max(...sparkline)

  return (
    <article className="flex min-h-[164px] animate-fade-slide-up flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-sm font-medium text-text-secondary">
          {label}
        </span>
        <Badge tone={deltaTone}>{delta}</Badge>
      </div>
      <div className="font-mono text-[1.75rem] font-bold text-text-primary">
        {value}
      </div>
      <div aria-hidden="true" className="mt-auto flex h-11 items-end gap-2">
        {sparkline.map((point, index) => (
          <span
            className="w-full min-w-2 rounded-t bg-gradient-to-b from-teal to-primary"
            key={`${label}-${point}-${index}`}
            style={{ height: `${Math.max(18, (point / maxValue) * 100)}%` }}
          />
        ))}
      </div>
    </article>
  )
}

export default KPICard
