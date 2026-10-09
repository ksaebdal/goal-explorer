import { describe, expect, it } from 'vitest'
import { compareShots } from './order.ts'
import type { Shot } from './types.ts'

const shot = (id: string, matchDate: string, matchId: number, period: number, minute: number, second = 0) =>
  ({ id, matchDate, matchId, period, minute, second }) as Shot

describe('compareShots', () => {
  it('puts newer matches first, then keeps each match together in time order', () => {
    const shots = [
      shot('old', '2015-01-01', 1, 1, 5),
      shot('b-2nd-half', '2016-01-01', 2, 2, 50),
      shot('a-late', '2016-01-01', 1, 1, 30, 10),
      shot('a-early', '2016-01-01', 1, 1, 30, 5),
      shot('b-1st-half', '2016-01-01', 2, 1, 44),
    ]
    expect(shots.sort(compareShots).map((s) => s.id)).toEqual(['a-early', 'a-late', 'b-1st-half', 'b-2nd-half', 'old'])
  })
})
