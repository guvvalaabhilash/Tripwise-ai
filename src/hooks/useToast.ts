import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type })
  }, [])

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return { toast, show, hide }
}
