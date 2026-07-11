export type CountryConfig = {
  code: string
  name: string
  currencyCode: string
  currencyName?: string
  locale: string
  flag: string
  // multiplier to convert from INR (base) to this currency: amount_in_target = amount_in_inr * rate
  inrToCurrencyRate: number
  popularDestinations: string[]
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    currencyCode: 'INR',
    currencyName: 'Indian Rupee',
    locale: 'en-IN',
    flag: '🇮🇳',
    inrToCurrencyRate: 1,
    popularDestinations: ['Goa', 'Kerala', 'Jaipur', 'Leh', 'Kashmir'],
  },
  {
    code: 'US',
    name: 'United States',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    locale: 'en-US',
    flag: '🇺🇸',
    inrToCurrencyRate: 0.012,
    popularDestinations: ['New York', 'Los Angeles', 'Miami', 'Chicago'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currencyCode: 'GBP',
    currencyName: 'British Pound',
    locale: 'en-GB',
    flag: '🇬🇧',
    inrToCurrencyRate: 0.0096,
    popularDestinations: ['London', 'Edinburgh', 'Bath'],
  },
  {
    code: 'AE',
    name: 'UAE',
    currencyCode: 'AED',
    currencyName: 'United Arab Emirates Dirham',
    locale: 'en-AE',
    flag: '🇦🇪',
    inrToCurrencyRate: 0.044,
    popularDestinations: ['Dubai', 'Abu Dhabi'],
  },
  {
    code: 'JP',
    name: 'Japan',
    currencyCode: 'JPY',
    currencyName: 'Japanese Yen',
    locale: 'ja-JP',
    flag: '🇯🇵',
    inrToCurrencyRate: 1.7,
    popularDestinations: ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji'],
  },
  {
    code: 'SG',
    name: 'Singapore',
    currencyCode: 'SGD',
    currencyName: 'Singapore Dollar',
    locale: 'en-SG',
    flag: '🇸🇬',
    inrToCurrencyRate: 0.016,
    popularDestinations: ['Singapore'],
  },
  {
    code: 'AU',
    name: 'Australia',
    currencyCode: 'AUD',
    currencyName: 'Australian Dollar',
    locale: 'en-AU',
    flag: '🇦🇺',
    inrToCurrencyRate: 0.019,
    popularDestinations: ['Sydney', 'Melbourne'],
  },
  {
    code: 'CA',
    name: 'Canada',
    currencyCode: 'CAD',
    currencyName: 'Canadian Dollar',
    locale: 'en-CA',
    flag: '🇨🇦',
    inrToCurrencyRate: 0.016,
    popularDestinations: ['Toronto', 'Vancouver'],
  },
  {
    code: 'EU',
    name: 'Euro Zone',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    locale: 'en-IE',
    flag: '🇪🇺',
    inrToCurrencyRate: 0.011,
    popularDestinations: ['Paris', 'Nice', 'Lyon'],
  },
  {
    code: 'TH',
    name: 'Thailand',
    currencyCode: 'THB',
    currencyName: 'Thai Baht',
    locale: 'th-TH',
    flag: '🇹🇭',
    inrToCurrencyRate: 0.41,
    popularDestinations: ['Bangkok', 'Phuket'],
  },
]

export const DEFAULT_COUNTRY_CODE = 'IN'

export function getCountryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0]
}
