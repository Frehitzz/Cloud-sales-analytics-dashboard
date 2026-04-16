import { fetchWeatherApi } from 'openmeteo'
import type { LucideIcon } from 'lucide-react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const TRACKED_LOCATION = {
  latitude: 14.5243,
  longitude: 121.0792,
  name: 'Pasig, Philippines',
}

type WeatherCodeMeta = {
  description: string
  icon: LucideIcon
  tone: string
}

export type CurrentWeather = {
  apparentTemperature: number
  code: number
  description: string
  icon: LucideIcon
  latitude: number
  longitude: number
  name: string
  temperature: number
  time: Date
  tone: string
  windSpeed: number
}

const weatherCodeMap: Record<number, WeatherCodeMeta> = {
  0: { description: 'Clear sky', icon: Sun, tone: 'text-warning' },
  1: { description: 'Mainly clear', icon: CloudSun, tone: 'text-warning' },
  2: { description: 'Partly cloudy', icon: CloudSun, tone: 'text-teal' },
  3: { description: 'Overcast', icon: Cloud, tone: 'text-text-secondary' },
  45: { description: 'Fog', icon: CloudFog, tone: 'text-text-secondary' },
  48: {
    description: 'Depositing rime fog',
    icon: CloudFog,
    tone: 'text-text-secondary',
  },
  51: { description: 'Light drizzle', icon: CloudDrizzle, tone: 'text-info' },
  53: {
    description: 'Moderate drizzle',
    icon: CloudDrizzle,
    tone: 'text-info',
  },
  55: { description: 'Dense drizzle', icon: CloudDrizzle, tone: 'text-info' },
  56: {
    description: 'Light freezing drizzle',
    icon: CloudDrizzle,
    tone: 'text-teal',
  },
  57: {
    description: 'Dense freezing drizzle',
    icon: CloudDrizzle,
    tone: 'text-teal',
  },
  61: { description: 'Slight rain', icon: CloudRain, tone: 'text-info' },
  63: { description: 'Moderate rain', icon: CloudRain, tone: 'text-info' },
  65: { description: 'Heavy rain', icon: CloudRain, tone: 'text-info' },
  66: {
    description: 'Light freezing rain',
    icon: CloudRain,
    tone: 'text-teal',
  },
  67: {
    description: 'Heavy freezing rain',
    icon: CloudRain,
    tone: 'text-teal',
  },
  71: { description: 'Slight snow', icon: CloudSnow, tone: 'text-teal' },
  73: { description: 'Moderate snow', icon: CloudSnow, tone: 'text-teal' },
  75: { description: 'Heavy snow', icon: CloudSnow, tone: 'text-teal' },
  77: { description: 'Snow grains', icon: CloudSnow, tone: 'text-teal' },
  80: { description: 'Slight rain showers', icon: CloudRain, tone: 'text-info' },
  81: {
    description: 'Moderate rain showers',
    icon: CloudRain,
    tone: 'text-info',
  },
  82: { description: 'Violent rain showers', icon: CloudRain, tone: 'text-info' },
  85: { description: 'Slight snow showers', icon: CloudSnow, tone: 'text-teal' },
  86: { description: 'Heavy snow showers', icon: CloudSnow, tone: 'text-teal' },
  95: {
    description: 'Thunderstorm',
    icon: CloudLightning,
    tone: 'text-warning',
  },
  96: {
    description: 'Thunderstorm with slight hail',
    icon: CloudLightning,
    tone: 'text-warning',
  },
  99: {
    description: 'Thunderstorm with heavy hail',
    icon: CloudLightning,
    tone: 'text-warning',
  },
}

function getWeatherCodeMeta(code: number): WeatherCodeMeta {
  return (
    weatherCodeMap[code] ?? {
      description: `Weather code ${code}`,
      icon: Cloud,
      tone: 'text-text-secondary',
    }
  )
}

function toNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export async function fetchCurrentWeather(signal?: AbortSignal) {
  const params = {
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    latitude: TRACKED_LOCATION.latitude,
    longitude: TRACKED_LOCATION.longitude,
    timezone: 'auto',
  }

  const responses = await fetchWeatherApi(
    FORECAST_URL,
    params,
    3,
    0.2,
    2,
    { signal },
  )
  const response = responses[0]
  const current = response.current()

  if (!current) {
    throw new Error('Open-Meteo did not return current weather data')
  }

  const utcOffsetSeconds = response.utcOffsetSeconds()
  const code = Math.round(toNumber(current.variables(2)?.value()))
  const meta = getWeatherCodeMeta(code)

  return {
    apparentTemperature: toNumber(current.variables(1)?.value()),
    code,
    description: meta.description,
    icon: meta.icon,
    latitude: response.latitude(),
    longitude: response.longitude(),
    name: TRACKED_LOCATION.name,
    temperature: toNumber(current.variables(0)?.value()),
    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
    tone: meta.tone,
    windSpeed: toNumber(current.variables(3)?.value()),
  } satisfies CurrentWeather
}
