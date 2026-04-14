import type { ReactNode } from 'react'
import { cn } from '../../lib/classNames'

type BadgeTone = 'success' | 'danger' | 'info' | 'warning' | 'primary'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
}

const toneClassNames: Record<BadgeTone, string> = {
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
  primary: 'bg-primary-subtle text-primary',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
}

function Badge({ children, tone = 'primary' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold',
        toneClassNames[tone],
      )}
    >
      {children}
    </span>
  )
}

export default Badge
