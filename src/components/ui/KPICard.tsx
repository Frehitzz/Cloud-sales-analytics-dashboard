import Badge from './Badge'

type KPICardProps = {
  context?: string
  delta: string
  deltaTone: 'success' | 'danger' | 'warning'
  label: string
  sparkline?: number[]
  value: string
}

function KPICard({
  context,
  delta,
  deltaTone,
  label,
  sparkline,
  value,
}: KPICardProps) {
  const maxValue = sparkline ? Math.max(...sparkline) : 0

  return (
    <article
      className={`flex animate-fade-slide-up flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6 ${
        sparkline ? 'min-h-[164px]' : 'min-h-[132px]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-sm font-medium text-text-secondary">
          {label}
        </span>
        <Badge tone={deltaTone}>{delta}</Badge>
      </div>
      <div className="font-mono text-[1.75rem] font-bold text-text-primary">
        {value}
      </div>
      {context && <p className="text-sm text-text-muted">{context}</p>}
      {sparkline && (
        <div aria-hidden="true" className="mt-auto flex h-11 items-end gap-2">
          {sparkline.map((point, index) => (
            <span
              className="w-full min-w-2 rounded-t bg-gradient-to-b from-teal to-primary"
              key={`${label}-${point}-${index}`}
              style={{ height: `${Math.max(18, (point / maxValue) * 100)}%` }}
            />
          ))}
        </div>
      )}
    </article>
  )
}

export default KPICard
