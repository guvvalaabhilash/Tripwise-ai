import React, { createContext, useContext, useState, useEffect } from 'react'
import { DEFAULT_COUNTRY_CODE, getCountryByCode, type CountryConfig } from '@/lib/countries'

type CountryContextType = {
  country: CountryConfig
  setCountryCode: (code: string) => void
  formatAmount: (amountInINR: number) => string
  convertAmount: (amountInINR: number) => number
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

const STORAGE_KEY = 'selected_country'

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<CountryConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY_CODE
      return getCountryByCode(stored)
    } catch (e) {
      return getCountryByCode(DEFAULT_COUNTRY_CODE)
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, country.code)
    // dispatch event so non-hook code can react if needed
    window.dispatchEvent(new CustomEvent('countryChange', { detail: country }))
  }, [country])

  const setCountryCode = (code: string) => setCountry(getCountryByCode(code))

  const convertAmount = (amountInINR: number) => {
    return amountInINR * (country.inrToCurrencyRate || 1)
  }

  const formatAmount = (amountInINR: number) => {
    const value = convertAmount(amountInINR)
    try {
      return new Intl.NumberFormat(country.locale, {
        style: 'currency',
        currency: country.currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    } catch (e) {
      return `${country.flag} ${value.toFixed(0)}`
    }
  }

  return (
    <CountryContext.Provider value={{ country, setCountryCode, formatAmount, convertAmount }}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const ctx = useContext(CountryContext)
  if (!ctx) throw new Error('useCountry must be used within CountryProvider')
  return ctx
}
