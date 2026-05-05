import { useCallback, useEffect, useState } from 'react'
import type { ApiError } from './types'

type AsyncState<T> = {
  data: T | null
  error: ApiError | null
  loading: boolean
  reload: () => void
}

export function useAsync<T>(factory: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
    reload: () => undefined,
  })

  useEffect(() => {
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) {
        setState((prev) => ({ ...prev, data: null, error: null, loading: true }))
      }
    }, 0)

    factory()
      .then((data) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, data, error: null, loading: false }))
        }
      })
      .catch((error: ApiError) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, data: null, error, loading: false }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [factory])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    factory()
      .then((data) => setState((prev) => ({ ...prev, data, error: null, loading: false })))
      .catch((error: ApiError) =>
        setState((prev) => ({ ...prev, data: null, error, loading: false })),
      )
  }, [factory])

  return { ...state, reload }
}
