import { describe, expect, it } from 'vitest'
import { currentLoadState } from './useJson.ts'

describe('currentLoadState', () => {
  it('is idle when nothing is requested', () => {
    expect(currentLoadState(null, null)).toEqual({ status: 'idle' })
  })

  it('is loading until a download for this file has finished', () => {
    expect(currentLoadState('a.json', null)).toEqual({ status: 'loading' })
  })

  it("is loading - not showing old data - while the previous file's result is still around", () => {
    const old = { path: 'la-liga-2014.json', state: { status: 'ready' as const, data: [1, 2, 3] } }
    expect(currentLoadState('la-liga-2015.json', old)).toEqual({ status: 'loading' })
  })

  it('returns the finished result when it is for this file', () => {
    const done = { path: 'a.json', state: { status: 'ready' as const, data: [1] } }
    expect(currentLoadState('a.json', done)).toEqual({ status: 'ready', data: [1] })
  })

  it('passes errors through', () => {
    const failed = { path: 'a.json', state: { status: 'error' as const, message: 'not found' } }
    expect(currentLoadState('a.json', failed)).toEqual({ status: 'error', message: 'not found' })
  })
})
