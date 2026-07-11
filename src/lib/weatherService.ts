/**
 * Weather Service — Open-Meteo (https://open-meteo.com)
 * ✅ Completely FREE — no API key needed, no 401 ever.
 * ✅ Geocoding via Open-Meteo geocoding API (also free, no key).
 * ✅ 7-day hourly forecast with temperature, rain, humidity, wind.
 * No Supabase. No DB. In-memory cache 20 min.
 */

const GEO_URL      = 'https://geocoding-api.open-meteo.com/v1'
const FORECAST_URL = 'https://api.open-meteo.com/v1'

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface WeatherDay {
  date:          string
  label:         string
  tempMax:       number
  tempMin:       number
  condition:     string
  conditionIcon: string
  humidity:      number
  rainChance:    number   // 0-100 %
  windKph:       number
  uvIndex:       number
}

export interface WeatherData {
  location: string
  country:  string
  current: {
    temp:          number
    feelsLike:     number
    condition:     string
    conditionIcon: string
    humidity:      number
    windKph:       number
    rainChance:    number
    uvIndex:       number
  }
  forecast:  WeatherDay[]
  fetchedAt: number
}

export interface WeatherRecommendation {
  travelScore:        'Excellent' | 'Good' | 'Moderate' | 'Poor'
  travelScoreColor:   string
  transport:          string
  accommodation:      string
  packingSuggestions: string[]
  warnings:           string[]
}

export type WeatherError = 'location_not_found' | 'network' | 'unknown'

export interface WeatherResult {
  data:         WeatherData | null
  error:        WeatherError | null
  errorMessage: string | null
}

// ─── WMO weather code → condition text + emoji ─────────────────────────────────
// https://open-meteo.com/en/docs#weathervariables
function wmoToCondition(code: number): { text: string; emoji: string } {
  if (code === 0)               return { text: 'Clear sky',          emoji: '☀️'  }
  if (code <= 2)                return { text: 'Partly cloudy',      emoji: '🌤️' }
  if (code === 3)               return { text: 'Overcast',           emoji: '☁️'  }
  if (code <= 49)               return { text: 'Foggy',              emoji: '🌫️' }
  if (code <= 59)               return { text: 'Drizzle',            emoji: '🌦️' }
  if (code <= 69)               return { text: 'Rainy',              emoji: '🌧️' }
  if (code <= 79)               return { text: 'Snow',               emoji: '❄️'  }
  if (code <= 84)               return { text: 'Rain showers',       emoji: '🌦️' }
  if (code <= 86)               return { text: 'Snow showers',       emoji: '🌨️' }
  if (code === 95)              return { text: 'Thunderstorm',       emoji: '⛈️'  }
  if (code <= 99)               return { text: 'Thunderstorm+hail',  emoji: '⛈️'  }
  return { text: 'Unknown', emoji: '🌡️' }
}

// ─── Tourist attraction → nearest city ─────────────────────────────────────────
const LOCATION_MAP: Record<string, string> = {
  'kerala backwaters': 'Alappuzha',
  'goa beaches':       'Panaji',
  'goa, india':        'Panaji',
  'goa':               'Panaji',
  'taj mahal':         'Agra',
  'backwaters':        'Alappuzha',
  'varanasi, india':   'Varanasi',
  'jaipur, india':     'Jaipur',
  'kerala':            'Kochi',
  'himachal':          'Shimla',
  'ladakh':            'Leh',
  'andaman':           'Port Blair',
  'kashmir':           'Srinagar',
  'coorg':             'Madikeri',
  'munnar':            'Munnar',
  'ooty':              'Ooty',
  'manali':            'Manali',
  'shimla, india':     'Shimla',
}

function normalizeLocation(raw: string): string {
  const lower = raw.trim().toLowerCase()
  if (LOCATION_MAP[lower]) return LOCATION_MAP[lower]
  for (const [key, city] of Object.entries(LOCATION_MAP)) {
    if (lower.includes(key)) return city
  }
  // Strip ", India" suffix etc.
  return raw.replace(/,\s*(india|in|us|uk|ae|sg|jp|fr|au)$/i, '').trim() || raw.trim()
}

// ─── In-memory cache (20 min) ──────────────────────────────────────────────────
const CACHE_TTL = 20 * 60 * 1000
const cache     = new Map<string, WeatherData>()

function cKey(loc: string) { return loc.toLowerCase().trim() }

function getCached(loc: string): WeatherData | null {
  const hit = cache.get(cKey(loc))
  if (!hit) return null
  if (Date.now() - hit.fetchedAt > CACHE_TTL) { cache.delete(cKey(loc)); return null }
  return hit
}

// ─── Step 1: Geocode location name → lat/lon ───────────────────────────────────
interface GeoResult { name: string; country: string; lat: number; lon: number }

async function geocode(location: string): Promise<GeoResult | null> {
  const url = `${GEO_URL}/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
  console.log('[Weather] Geocoding:', url)
  try {
    const res  = await fetch(url)
    const json = await res.json()
    const r    = json?.results?.[0]
    if (!r) return null
    return { name: r.name, country: r.country, lat: r.latitude, lon: r.longitude }
  } catch (err) {
    console.error('[Weather] Geocode error:', err)
    return null
  }
}

// ─── Main fetch ────────────────────────────────────────────────────────────────
export async function fetchWeather(rawLocation: string): Promise<WeatherResult> {
  const empty = (error: WeatherError, msg: string): WeatherResult =>
    ({ data: null, error, errorMessage: msg })

  if (!rawLocation.trim()) return empty('location_not_found', 'No location provided.')

  const location = normalizeLocation(rawLocation)
  console.log(`[Weather] "${rawLocation}" → resolves to "${location}"`)

  const cached = getCached(location)
  if (cached) {
    console.log('[Weather] Cache hit:', location)
    return { data: cached, error: null, errorMessage: null }
  }

  try {
    // ── Geocode ─────────────────────────────────────────────────────────────
    const geo = await geocode(location)
    if (!geo) {
      console.warn('[Weather] Location not found:', location)
      return empty('location_not_found', `Location "${location}" not found. Try a nearby city.`)
    }
    console.log('[Weather] Geocoded:', geo.name, geo.country, geo.lat, geo.lon)

    // ── Forecast request ─────────────────────────────────────────────────────
    const fUrl =
      `${FORECAST_URL}/forecast` +
      `?latitude=${geo.lat}` +
      `&longitude=${geo.lon}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,` +
      `precipitation_probability_max,windspeed_10m_max,uv_index_max` +
      `&hourly=relativehumidity_2m,apparent_temperature` +
      `&current_weather=true` +
      `&timezone=auto` +
      `&forecast_days=7`

    console.log('[Weather] Forecast URL:', fUrl)

    const fRes  = await fetch(fUrl)
    const fJson = await fRes.json()

    if (!fRes.ok || fJson.error) {
      console.error('[Weather] Forecast error:', fJson)
      return empty('unknown', 'Weather data unavailable. Please try again.')
    }

    // ── Parse daily forecast ─────────────────────────────────────────────────
    const daily   = fJson.daily   as Record<string, unknown[]>
    const hourly  = fJson.hourly  as Record<string, unknown[]>
    const curW    = fJson.current_weather as Record<string, unknown>

    const dates      = daily.time                         as string[]
    const codes      = daily.weathercode                  as number[]
    const maxTemps   = daily.temperature_2m_max           as number[]
    const minTemps   = daily.temperature_2m_min           as number[]
    const rainProbs  = daily.precipitation_probability_max as number[]
    const winds      = daily.windspeed_10m_max            as number[]
    const uvs        = daily.uv_index_max                 as number[]

    const forecastDays: WeatherDay[] = dates.map((dateStr, i) => {
      const cond = wmoToCondition(codes[i] ?? 0)
      return {
        date:          dateStr,
        label:         new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' }),
        tempMax:       Math.round(maxTemps[i] ?? 0),
        tempMin:       Math.round(minTemps[i] ?? 0),
        condition:     cond.text,
        conditionIcon: cond.emoji,
        humidity:      0,   // filled below from hourly
        rainChance:    Math.round(rainProbs[i] ?? 0),
        windKph:       Math.round(winds[i] ?? 0),
        uvIndex:       Math.round(uvs[i] ?? 0),
      }
    })

    // Fill humidity from hourly average for each day
    const hourlyTimes = hourly.time       as string[]
    const humidities  = hourly.relativehumidity_2m as number[]
    const appTemps    = hourly.apparent_temperature as number[]

    const humByDay = new Map<string, number[]>()
    hourlyTimes.forEach((t, i) => {
      const day = t.split('T')[0]
      if (!humByDay.has(day)) humByDay.set(day, [])
      humByDay.get(day)!.push(humidities[i])
    })
    forecastDays.forEach(d => {
      const hums = humByDay.get(d.date) ?? []
      d.humidity = hums.length
        ? Math.round(hums.reduce((s, v) => s + v, 0) / hums.length)
        : 60
    })

    // ── Current weather ──────────────────────────────────────────────────────
    const curCode    = wmoToCondition(Number(curW.weathercode ?? 0))
    const curHourIdx = hourlyTimes.findIndex(t => t.startsWith(new Date().toISOString().slice(0, 13)))
    const curHumidity  = curHourIdx >= 0 ? humidities[curHourIdx]  : (forecastDays[0]?.humidity ?? 60)
    const curFeelsLike = curHourIdx >= 0 ? appTemps[curHourIdx]    : Number(curW.temperature)

    const data: WeatherData = {
      location:  geo.name,
      country:   geo.country,
      current: {
        temp:          Math.round(Number(curW.temperature)),
        feelsLike:     Math.round(curFeelsLike),
        condition:     curCode.text,
        conditionIcon: curCode.emoji,
        humidity:      Math.round(curHumidity),
        windKph:       Math.round(Number(curW.windspeed)),
        rainChance:    forecastDays[0]?.rainChance ?? 0,
        uvIndex:       forecastDays[0]?.uvIndex    ?? 0,
      },
      forecast:  forecastDays,
      fetchedAt: Date.now(),
    }

    cache.set(cKey(location), data)
    console.log('[Weather] ✅ Loaded:', data.location, data.country, data.current.temp + '°C', data.current.condition)
    return { data, error: null, errorMessage: null }

  } catch (err) {
    console.error('[Weather] Network error:', err)
    return { data: null, error: 'network', errorMessage: 'Network error — check your internet connection.' }
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────
export function getWeatherRecommendations(weather: WeatherData): WeatherRecommendation {
  const { current, forecast } = weather
  const avgRain = forecast.reduce((s, d) => s + d.rainChance, 0) / (forecast.length || 1)
  const avgTemp = forecast.reduce((s, d) => s + (d.tempMax + d.tempMin) / 2, 0) / (forecast.length || 1)
  const maxWind = Math.max(...forecast.map(d => d.windKph), current.windKph)
  const hasSevere = forecast.some(d => d.rainChance > 75 || d.windKph > 60)

  let score: WeatherRecommendation['travelScore']
  let scoreColor: string
  if      (avgRain < 20 && maxWind < 30 && avgTemp > 15 && avgTemp < 38) { score = 'Excellent'; scoreColor = 'text-emerald-400' }
  else if (avgRain < 40 && maxWind < 50)                                  { score = 'Good';      scoreColor = 'text-cyan-400'    }
  else if (avgRain < 65 && maxWind < 70)                                  { score = 'Moderate';  scoreColor = 'text-orange-400'  }
  else                                                                     { score = 'Poor';      scoreColor = 'text-red-400'     }

  let transport = 'flight'
  if      (hasSevere && maxWind > 70)    transport = 'train'
  else if (avgRain > 60)                 transport = 'train'
  else if (avgTemp > 35 && avgRain < 20) transport = 'car'

  let accommodation = 'hotel'
  if      (avgTemp > 32 && avgRain < 20) accommodation = 'resort'
  else if (avgTemp > 20 && avgRain < 30) accommodation = 'airbnb'

  const packing: string[] = []
  if (avgRain > 30)          packing.push('☂️ Rain jacket & umbrella')
  if (avgTemp > 30)          packing.push('🕶️ Sunglasses & sunscreen (SPF 50+)')
  if (avgTemp < 15)          packing.push('🧥 Warm jacket & layered clothing')
  if (current.humidity > 70) packing.push('💧 Hydration essentials')
  if (maxWind > 40)          packing.push('🧣 Windproof outer layer')
  if (packing.length === 0)  packing.push('👕 Light comfortable clothing')
  packing.push('💊 Basic first-aid & medicines')

  const warnings: string[] = []
  if (avgRain > 75)  warnings.push('⚠️ Heavy rainfall — book indoor activities')
  if (maxWind > 60)  warnings.push('⚠️ Strong winds — outdoor plans may be disrupted')
  if (avgTemp > 40)  warnings.push('🌡️ Extreme heat — stay hydrated, avoid midday sun')
  if (avgTemp < 5)   warnings.push('🥶 Very cold — heavy winter gear essential')

  return { travelScore: score, travelScoreColor: scoreColor, transport, accommodation, packingSuggestions: packing, warnings }
}

// ─── Weather → plain text (AI chat) ───────────────────────────────────────────
export function weatherToText(weather: WeatherData): string {
  const { current, forecast, location, country } = weather
  const days = forecast.slice(0, 3)
    .map(d => `${d.label}: ${d.tempMin}–${d.tempMax}°C, ${d.condition}, ${d.rainChance}% rain`)
    .join(' | ')
  return (
    `Current weather in ${location}, ${country}: ` +
    `${current.temp}°C, ${current.condition}, ` +
    `humidity ${current.humidity}%, wind ${current.windKph} km/h. ` +
    `3-day: ${days}.`
  )
}
