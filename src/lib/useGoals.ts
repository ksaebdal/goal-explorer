import { useEffect, useState } from 'react'
import type { Goal } from './types.ts'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; goals: Goal[] }

/** Downloads goals.json once, when the component first appears on screen. */
export function useGoals(): LoadState {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    // If the component disappears before the download finishes, ignore the result.
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}goals.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} - did you run "npm run build:data"?`)
        return response.json() as Promise<Goal[]>
      })
      .then((goals) => {
        if (!cancelled) setState({ status: 'ready', goals })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
