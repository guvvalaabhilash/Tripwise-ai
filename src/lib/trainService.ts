/**
 * Train Service — Indian Railways data via erail.in API.
 * Falls back to a curated static dataset when API key is unavailable
 * or when the API call fails, so the UI is always functional.
 *
 * erail.in endpoints used:
 *   GET http://api.erail.in/trains/?src=<SRC>&dst=<DST>&apikey=<KEY>
 *   GET http://api.erail.in/station/?name=<NAME>&apikey=<KEY>
 */

const ERAIL_KEY = import.meta.env.VITE_IRCTC_API_KEY as string | undefined
const BASE      = 'http://api.erail.in'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TrainResult {
  trainNo:    string
  trainName:  string
  departure:  string   // HH:MM
  arrival:    string   // HH:MM
  duration:   string   // e.g. "6h 45m"
  distance:   string   // km
  classes:    string[] // ['SL', '3A', '2A', '1A', 'CC']
  runsOn:     string   // "M T W T F S S" flags
  type:       'rajdhani' | 'shatabdi' | 'vande' | 'express' | 'passenger' | 'duronto' | 'garibrath'
}

export interface StationResult {
  code: string
  name: string
  state: string
}

// ─── Station code lookup (top Indian cities) ──────────────────────────────────
export const STATION_MAP: Record<string, string> = {
  // Major metros
  'mumbai':        'CSTM', 'mumbai cst':     'CSTM', 'mumbai central': 'BCT',
  'delhi':         'NDLS', 'new delhi':      'NDLS', 'old delhi':      'DLI',
  'kolkata':       'HWH',  'howrah':         'HWH',  'sealdah':        'SDAH',
  'chennai':       'MAS',  'chennai central':'MAS',
  'bengaluru':     'SBC',  'bangalore':      'SBC',  'yeshwanthpur':   'YPR',
  'hyderabad':     'HYB',  'secunderabad':   'SC',
  'ahmedabad':     'ADI',
  'pune':          'PUNE',
  'jaipur':        'JP',
  'lucknow':       'LKO',
  'bhopal':        'BPL',
  'nagpur':        'NGP',
  'surat':         'ST',
  'kanpur':        'CNB',
  'agra':          'AGC',
  'varanasi':      'BSB',
  'amritsar':      'ASR',
  'chandigarh':    'CDG',
  'kochi':         'ERS',  'ernakulam':      'ERS',
  'goa':           'MAO',  'madgaon':        'MAO',  'panaji':         'MAO',
  'thiruvananthapuram': 'TVC', 'trivandrum':  'TVC',
  'bhubaneswar':   'BBS',
  'patna':         'PNBE',
  'ranchi':        'RNC',
  'guwahati':      'GHY',
  'jammu':         'JAT',
  'shimla':        'SML',
  'manali':        'PLM',  // nearest: Pathankot
  'udaipur':       'UDZ',
  'jodhpur':       'JU',
  'mysuru':        'MYS',  'mysore':         'MYS',
  'coimbatore':    'CBE',
  'madurai':       'MDU',
  'vijayawada':    'BZA',
  'visakhapatnam': 'VSKP', 'vizag':          'VSKP',
  'indore':        'INDB',
  'raipur':        'R',
  'srinagar':      'SVDK', // nearest railhead
  'leh':           'SVDK',
  'alappuzha':     'ALLP', 'alleppey':       'ALLP',
  'kozhikode':     'CLT',  'calicut':        'CLT',
}

export function resolveStation(input: string): string {
  const lower = input.trim().toLowerCase()
  return STATION_MAP[lower] ?? input.trim().toUpperCase().replace(/\s+/g, '')
}

// ─── Static fallback dataset — real popular Indian trains ─────────────────────
const STATIC_TRAINS: (TrainResult & { from: string; to: string })[] = [
  // Mumbai ↔ Delhi
  { trainNo:'12951', trainName:'Rajdhani Express',        departure:'17:00', arrival:'08:15', duration:'15h 15m', distance:'1384', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'CSTM', to:'NDLS' },
  { trainNo:'12953', trainName:'August Kranti Rajdhani',  departure:'17:40', arrival:'10:55', duration:'17h 15m', distance:'1386', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'BCT',  to:'NDLS' },
  { trainNo:'12137', trainName:'Punjab Mail',             departure:'19:35', arrival:'14:45', duration:'19h 10m', distance:'1542', classes:['SL','3A','2A','1A'], runsOn:'Daily', type:'express', from:'CSTM', to:'NDLS' },
  // Delhi ↔ Kolkata
  { trainNo:'12301', trainName:'Howrah Rajdhani',         departure:'16:55', arrival:'09:55', duration:'17h 00m', distance:'1451', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'NDLS', to:'HWH' },
  { trainNo:'12305', trainName:'Kolkata Rajdhani',        departure:'15:00', arrival:'09:55', duration:'18h 55m', distance:'1457', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'NDLS', to:'HWH' },
  // Delhi ↔ Chennai
  { trainNo:'12621', trainName:'Tamil Nadu SF Express',   departure:'22:30', arrival:'07:10', duration:'32h 40m', distance:'2174', classes:['SL','3A','2A','1A'], runsOn:'Daily', type:'express', from:'NDLS', to:'MAS' },
  { trainNo:'22691', trainName:'Rajdhani Express',        departure:'06:15', arrival:'08:10', duration:'26h 55m', distance:'2180', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'NDLS', to:'MAS' },
  // Delhi ↔ Mumbai
  { trainNo:'12952', trainName:'Rajdhani Express',        departure:'08:20', arrival:'23:35', duration:'15h 15m', distance:'1384', classes:['1A','2A','3A'], runsOn:'Daily',    type:'rajdhani', from:'NDLS', to:'CSTM' },
  // Mumbai ↔ Goa
  { trainNo:'10103', trainName:'Mandovi Express',         departure:'07:10', arrival:'17:15', duration:'10h 05m', distance:'582',  classes:['SL','3A','2A'], runsOn:'Daily',    type:'express',  from:'CSTM', to:'MAO' },
  { trainNo:'12133', trainName:'Mangalore Express',       departure:'22:10', arrival:'09:30', duration:'11h 20m', distance:'586',  classes:['SL','3A','2A','1A'], runsOn:'Daily', type:'express', from:'CSTM', to:'MAO' },
  // Delhi ↔ Agra
  { trainNo:'12002', trainName:'Bhopal Shatabdi',         departure:'06:00', arrival:'08:10', duration:'02h 10m', distance:'195',  classes:['CC','EC'],       runsOn:'Daily',    type:'shatabdi', from:'NDLS', to:'AGC' },
  { trainNo:'20482', trainName:'Vande Bharat Express',    departure:'06:00', arrival:'07:45', duration:'01h 45m', distance:'195',  classes:['CC','EC'],       runsOn:'Daily',    type:'vande',    from:'NDLS', to:'AGC' },
  // Delhi ↔ Jaipur
  { trainNo:'12015', trainName:'Ajmer Shatabdi',          departure:'06:05', arrival:'10:30', duration:'04h 25m', distance:'303',  classes:['CC','EC'],       runsOn:'Daily',    type:'shatabdi', from:'NDLS', to:'JP' },
  { trainNo:'22985', trainName:'Vande Bharat Express',    departure:'06:20', arrival:'10:15', duration:'03h 55m', distance:'303',  classes:['CC','EC'],       runsOn:'Daily',    type:'vande',    from:'NDLS', to:'JP' },
  // Bangalore ↔ Chennai
  { trainNo:'12007', trainName:'Chennai Shatabdi',        departure:'06:00', arrival:'11:00', duration:'05h 00m', distance:'362',  classes:['CC','EC'],       runsOn:'Daily',    type:'shatabdi', from:'SBC',  to:'MAS' },
  { trainNo:'20607', trainName:'Vande Bharat Express',    departure:'05:50', arrival:'10:35', duration:'04h 45m', distance:'362',  classes:['CC','EC'],       runsOn:'Daily',    type:'vande',    from:'SBC',  to:'MAS' },
  // Hyderabad ↔ Mumbai
  { trainNo:'12701', trainName:'Hussainsagar Express',    departure:'22:00', arrival:'17:15', duration:'19h 15m', distance:'795',  classes:['SL','3A','2A'], runsOn:'Daily',    type:'express',  from:'HYB',  to:'CSTM' },
  // Delhi ↔ Varanasi
  { trainNo:'12559', trainName:'Shiv Ganga Express',      departure:'18:40', arrival:'06:20', duration:'11h 40m', distance:'775',  classes:['SL','3A','2A','1A'], runsOn:'Daily', type:'express', from:'NDLS', to:'BSB' },
  { trainNo:'22435', trainName:'Vande Bharat Express',    departure:'06:00', arrival:'14:00', duration:'08h 00m', distance:'775',  classes:['CC','EC'],       runsOn:'Daily',    type:'vande',    from:'NDLS', to:'BSB' },
  // Kolkata ↔ Chennai
  { trainNo:'12841', trainName:'Coromandel Express',      departure:'14:50', arrival:'14:35', duration:'23h 45m', distance:'1659', classes:['SL','3A','2A','1A'], runsOn:'Daily', type:'express', from:'HWH', to:'MAS' },
]

function findStaticTrains(fromCode: string, toCode: string): TrainResult[] {
  const from = fromCode.toUpperCase()
  const to   = toCode.toUpperCase()
  // Exact match
  let results = STATIC_TRAINS.filter(t => t.from === from && t.to === to)
  // Reverse direction
  if (!results.length) results = STATIC_TRAINS.filter(t => t.from === to && t.to === from)
    .map(t => ({ ...t, from: to, to: from }))
  // Partial – same major hub (show all from the source city)
  if (!results.length) results = STATIC_TRAINS.filter(t => t.from === from || t.to === from)
  return results.map(({ from: _f, to: _t, ...rest }) => rest)
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = new Map<string, { trains: TrainResult[]; ts: number }>()
const TTL   = 30 * 60 * 1000  // 30 min

function cached(key: string): TrainResult[] | null {
  const hit = cache.get(key)
  if (!hit || Date.now() - hit.ts > TTL) return null
  return hit.trains
}

// ─── Main search ──────────────────────────────────────────────────────────────
export interface TrainSearchResult {
  trains:       TrainResult[]
  source:       'api' | 'static'
  fromResolved: string
  toResolved:   string
  error:        string | null
}

export async function searchTrains(
  fromInput: string,
  toInput:   string,
): Promise<TrainSearchResult> {
  const fromCode = resolveStation(fromInput)
  const toCode   = resolveStation(toInput)
  const key      = `${fromCode}:${toCode}`

  // Return cache
  const hit = cached(key)
  if (hit) return { trains: hit, source: 'api', fromResolved: fromCode, toResolved: toCode, error: null }

  // Try erail.in if key available
  if (ERAIL_KEY?.trim()) {
    try {
      const url = `${BASE}/trains/?src=${fromCode}&dst=${toCode}&apikey=${ERAIL_KEY.trim()}`
      console.log('[Trains] erail API:', url)
      const res  = await fetch(url)
      const json = await res.json()

      if (res.ok && Array.isArray(json) && json.length > 0) {
        const trains: TrainResult[] = json.map((t: Record<string, unknown>) => ({
          trainNo:   String(t.trainNo   ?? t.train_no   ?? ''),
          trainName: String(t.trainName ?? t.train_name ?? ''),
          departure: String(t.departureTime ?? t.dep ?? ''),
          arrival:   String(t.arrivalTime   ?? t.arr ?? ''),
          duration:  String(t.duration ?? ''),
          distance:  String(t.distance ?? ''),
          classes:   Array.isArray(t.classes) ? t.classes : [],
          runsOn:    String(t.runDays ?? 'Daily'),
          type:      classifyTrain(String(t.trainName ?? '')),
        }))
        cache.set(key, { trains, ts: Date.now() })
        return { trains, source: 'api', fromResolved: fromCode, toResolved: toCode, error: null }
      }
    } catch (err) {
      console.warn('[Trains] erail API failed, using static data:', err)
    }
  }

  // Static fallback
  const trains = findStaticTrains(fromCode, toCode)
  return {
    trains,
    source:       'static',
    fromResolved: fromCode,
    toResolved:   toCode,
    error:        trains.length === 0 ? `No trains found between ${fromCode} and ${toCode}.` : null,
  }
}

function classifyTrain(name: string): TrainResult['type'] {
  const n = name.toLowerCase()
  if (n.includes('rajdhani') || n.includes('raj'))  return 'rajdhani'
  if (n.includes('shatabdi') || n.includes('shat'))  return 'shatabdi'
  if (n.includes('vande'))                           return 'vande'
  if (n.includes('duronto'))                         return 'duronto'
  if (n.includes('garib rath') || n.includes('grib')) return 'garibrath'
  return 'express'
}

// ─── Train type → badge style ─────────────────────────────────────────────────
export const TRAIN_TYPE_STYLE: Record<TrainResult['type'], { label: string; color: string; bg: string }> = {
  rajdhani:  { label: 'Rajdhani',   color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/25' },
  shatabdi:  { label: 'Shatabdi',   color: 'text-cyan-400',    bg: 'bg-cyan-500/15 border-cyan-500/25'   },
  vande:     { label: 'Vande Bharat',color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  duronto:   { label: 'Duronto',    color: 'text-purple-400',  bg: 'bg-purple-500/15 border-purple-500/25' },
  garibrath: { label: 'Garib Rath', color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/25'   },
  express:   { label: 'Express',    color: 'text-slate-300',   bg: 'bg-white/8 border-white/10'           },
  passenger: { label: 'Passenger',  color: 'text-slate-400',   bg: 'bg-white/5 border-white/8'            },
}
