import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useCountUp } from 'react-countup'
import Badge from './Badge'

type CountUpConfig = {
  decimals?: number
  end: number
  prefix?: string
  suffix?: string
}

type KPICardProps = {
  context?: string
  countUp?: CountUpConfig
  delta?: string
  deltaTone?: 'success' | 'danger' | 'warning'
  icon?: LucideIcon
  label: string
  sparkline?: number[]
  value: string
}

type CountUpValueProps = {
  countUp: CountUpConfig
  onEnd: () => void
}

type AnimatedKPIValueProps = {
  countUp?: CountUpConfig
  value: string
}

function CountUpValue({ countUp, onEnd }: CountUpValueProps) {
  const countUpRef = useRef<HTMLElement>(null!)

  const { start } = useCountUp({
    decimals: countUp.decimals ?? 0,
    duration: 1.6,
    end: countUp.end,
    enableReinitialize: false,
    onEnd,
    prefix: countUp.prefix,
    ref: countUpRef,
    separator: ',',
    startOnMount: false,
    suffix: countUp.suffix,
    useEasing: true,
  })

  useEffect(() => {
    start()
  }, [start])

  return <span ref={countUpRef} />
}

function AnimatedKPIValue({ countUp, value }: AnimatedKPIValueProps) {
  const [hasAnimationEnded, setHasAnimationEnded] = useState(
    !countUp || !Number.isFinite(countUp.end) || countUp.end <= 0,
  )

  const shouldAnimate =
    countUp &&
    !hasAnimationEnded &&
    Number.isFinite(countUp.end) &&
    countUp.end > 0

  return shouldAnimate ? (
    <CountUpValue
      countUp={countUp}
      onEnd={() => setHasAnimationEnded(true)}
    />
  ) : (
    value
  )
}

function KPICard({
  context,
  countUp,
  delta,
  deltaTone,
  icon: Icon,
  label,
  sparkline,
  value,
}: KPICardProps) {
  const maxValue = sparkline ? Math.max(...sparkline) : 0
  const countUpKey = countUp
    ? `${countUp.decimals ?? 0}:${countUp.end}:${countUp.prefix ?? ''}:${
        countUp.suffix ?? ''
      }:${value}`
    : value

  return (
    <article
      className={`flex animate-fade-slide-up flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-border-strong md:p-6 ${
        sparkline ? 'min-h-[164px]' : 'min-h-[132px]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 font-display text-sm font-medium text-text-secondary">
          {Icon && (
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-primary-subtle text-primary">
              <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
          )}
          <span className="truncate">{label}</span>
        </span>
        {delta && deltaTone && <Badge tone={deltaTone}>{delta}</Badge>}
      </div>
      <div className="font-mono text-[1.75rem] font-bold text-text-primary">
        <AnimatedKPIValue
          countUp={countUp}
          key={countUpKey}
          value={value}
        />
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
