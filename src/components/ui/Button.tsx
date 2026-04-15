import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/classNames'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

const variantClassNames = {
  primary: 'bg-primary text-text-primary hover:bg-primary-hover',
  secondary:
    'border border-border-strong bg-transparent text-text-primary hover:bg-bg-hover',
} as const

function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 px-5 font-display text-sm font-semibold text-text-primary transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-current',
        variantClassNames[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
