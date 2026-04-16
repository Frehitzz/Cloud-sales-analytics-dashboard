import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/classNames'

type IconTitleProps = {
  as?: 'h1' | 'h2'
  children: ReactNode
  className?: string
  icon: LucideIcon
  iconClassName?: string
  iconSize?: number
}

function IconTitle({
  as: Heading = 'h1',
  children,
  className,
  icon: Icon,
  iconClassName,
  iconSize = 20,
}: IconTitleProps) {
  return (
    <Heading
      className={cn(
        'flex min-w-0 items-center gap-3 font-display font-bold leading-tight text-text-primary',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-10 w-10 flex-none place-items-center rounded-lg bg-primary-subtle text-primary',
          iconClassName,
        )}
      >
        <Icon aria-hidden="true" size={iconSize} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </Heading>
  )
}

export default IconTitle
