import { useEffect, useState } from 'react'

export type LoadState<T> =
  | { status: 'idle' } // nothing requested (path is null)
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

type Finished<T> = Extract<LoadState<T>, { status: 'error' | 'ready' }>

/** A download that has finished, and which file it was for. */
export interface FinishedDownload<T> {
  path: string
  state: Finished<T>
}

/**
 * Works out what to show for `path`, given the last download that finished.
 * Pure (no React), so it is easy to test: if the finished download is for
 * another file, the one we want is still loading.
 */
export function currentLoadState<T>(path: string | null, finished: FinishedDownload<T> | null): LoadState<T> {
  if (path === null) return { status: 'idle' }
  if (finished?.path !== path) return { status: 'loading' }
  return finished.state
}

/**
 * Downloads a JSON file from the public folder, e.g. useJson<Shot[]>('goals.json').
 * Pass null to download nothing. A new path cancels the old download and starts
 * from "loading", so you never see the previous season's shots or an old error.
 */
export function useJson<T>(path: string | null): LoadState<T> {
  const [finished, setFinished] = useState<FinishedDownload<T> | null>(null)

  useEffect(() => {
    if (path === null) return
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}${path}`, { signal: controller.signal })
      .then((response) => {
        // A missing file makes the dev server answer with the app's HTML page instead, so check the type too.
        const isJson = response.headers.get('content-type')?.includes('json')
        if (!response.ok || !isJson) throw new Error(`${path} not found - did you run "npm run build:data"?`)
        return response.json() as Promise<T>
      })
      .then((data) => setFinished({ path, state: { status: 'ready', data } }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setFinished({ path, state: { status: 'error', message: error.message } })
      })
    return () => {
      controller.abort() // stop downloading a file nobody wants any more
      setFinished(null) // and forget its result, so a retry starts from "loading"
    }
  }, [path])

  return currentLoadState(path, finished)
}
