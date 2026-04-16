import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/classNames'
import IconTitle from './IconTitle'

type ChartCardProps = {
  action?: ReactNode
  children: ReactNode
  eyebrow?: string
  icon?: LucideIcon
  title: string
  wide?: boolean
}

function ChartCard({
  action,
  children,
  eyebrow,
  icon: Icon,
  title,
  wide,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        'min-w-0 animate-fade-slide-up rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6 lg:col-span-4',
        wide && 'lg:col-span-8',
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          {eyebrow && (
            <span className="inline-flex font-display text-xs font-semibold uppercase text-primary">
              {eyebrow}
            </span>
          )}
          {Icon ? (
            <IconTitle
              as="h2"
              className="text-lg font-semibold"
              icon={Icon}
              iconClassName="h-8 w-8"
              iconSize={18}
            >
              {title}
            </IconTitle>
          ) : (
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {title}
            </h2>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default ChartCard
