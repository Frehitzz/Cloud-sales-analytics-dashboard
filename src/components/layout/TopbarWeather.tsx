import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { fetchCurrentWeather, type CurrentWeather } from '../../lib/weather'

const temperatureFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

const WEATHER_POLL_INTERVAL_MS = 30 * 1000
const MIN_LOADING_VISIBLE_MS = 1200

function formatTemperature(value: number) {
  return `${temperatureFormatter.format(value)} C`
}

function TopbarWeather() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWeather() {
      const loadingStartedAt = Date.now()

      setIsLoading(true)
      setError(null)

      try {
        const nextWeather = await fetchCurrentWeather(controller.signal)

        setWeather(nextWeather)
      } catch (loadError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load weather',
        )
      } finally {
        const elapsedMs = Date.now() - loadingStartedAt
        const remainingMs = Math.max(0, MIN_LOADING_VISIBLE_MS - elapsedMs)

        if (remainingMs > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remainingMs))
        }

        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadWeather()

    const intervalId = window.setInterval(() => {
      void loadWeather()
    }, WEATHER_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      controller.abort()
    }
  }, [])

  const WeatherIcon = isLoading ? RefreshCw : error ? AlertCircle : weather?.icon ?? RefreshCw
  const label = error
    ? 'Weather unavailable'
    : isLoading && weather
      ? 'Updating weather'
      : weather?.description ?? 'Loading weather'
  const value = weather ? formatTemperature(weather.temperature) : '...'

  return (
    <div
      className="ml-auto flex min-w-0 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-secondary"
      title={error ?? `${label} in ${weather?.name ?? 'Pasig, Philippines'}`}
    >
      <WeatherIcon
        aria-hidden="true"
        className={`${isLoading ? 'animate-spin' : ''} ${
          error ? 'text-danger' : weather?.tone ?? 'text-text-secondary'
        }`}
        size={18}
        strokeWidth={2.2}
      />
      <span className="hidden max-w-36 truncate sm:inline">{label}</span>
      <strong className="whitespace-nowrap font-mono text-text-primary">
        {value}
      </strong>
    </div>
  )
}

export default TopbarWeather
