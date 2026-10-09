import { describe, expect, it } from 'vitest'
import { normalizePlayerNames } from './playerNames.ts'
import type { Assist, Goal } from './types.ts'

// Only the fields normalizePlayerNames looks at matter.
function goal(player: string, playerId: number | null, matchDate: string, assist: Assist | null = null): Goal {
  return { player, playerId, matchDate, assist } as Goal
}

function assist(player: string, playerId: number | null): Assist {
  return { player, playerId, fromX: 0, fromY: 0, toX: 0, toY: 0, kind: 'Pass', height: 'Ground Pass' }
}

const names = (goals: Goal[]) => goals.map((g) => g.player)

describe('normalizePlayerNames', () => {
  it('uses the most recent name for a player who appears under two names', () => {
    const goals = [goal('Lindsey Horan', 1, '2021-05-01'), goal('Lindsey Heaps', 1, '2024-05-01')]
    expect(names(normalizePlayerNames(goals))).toEqual(['Lindsey Heaps', 'Lindsey Heaps'])
  })

  it('also counts names seen as an assister when picking the most recent one', () => {
    const goals = [
      goal('Phil Foden', 5, '2020-01-01'),
      goal('Someone Else', 9, '2023-01-01', assist('Philip Foden', 5)),
    ]
    const result = normalizePlayerNames(goals)
    expect(result[0].player).toBe('Philip Foden')
    expect(result[1].assist?.player).toBe('Philip Foden')
  })

  it('adds the id when two different players share a name', () => {
    const goals = [
      goal('Juan Carlos Pérez López', 6559, '2019-01-01'),
      goal('Juan Carlos Pérez López', 397771, '2020-01-01'),
    ]
    expect(names(normalizePlayerNames(goals))).toEqual([
      'Juan Carlos Pérez López (id 6559)',
      'Juan Carlos Pérez López (id 397771)',
    ])
  })

  it("doesn't confuse one player's old name with another player's current name", () => {
    const goals = [
      goal('Alex Smith', 1, '2019-01-01'), // player 1's old name...
      goal('Alex Jones', 1, '2023-01-01'), // ...and current name
      goal('Alex Smith', 2, '2023-01-01'), // a different player, currently called Alex Smith
    ]
    expect(names(normalizePlayerNames(goals))).toEqual(['Alex Jones', 'Alex Jones', 'Alex Smith'])
  })

  it('picks the same name regardless of input order when two names share a date', () => {
    const a = goal('Vikram Partap Singh', 3, '2023-01-01')
    const b = goal('Vikram Pratap Singh', 3, '2023-01-01')
    expect(names(normalizePlayerNames([a, b]))).toEqual(names(normalizePlayerNames([b, a])))
  })

  it('adds the id to assisters too when two players share a name', () => {
    const goals = [
      goal('Scorer', 10, '2020-01-01', assist('Sam Lee', 1)),
      goal('Scorer', 10, '2020-01-01', assist('Sam Lee', 2)),
    ]
    expect(normalizePlayerNames(goals).map((g) => g.assist?.player)).toEqual(['Sam Lee (id 1)', 'Sam Lee (id 2)'])
  })

  it('leaves players with one consistent name alone', () => {
    const goals = [goal('Thierry Henry', 2, '2004-01-01'), goal('Thierry Henry', 2, '2005-01-01')]
    expect(names(normalizePlayerNames(goals))).toEqual(['Thierry Henry', 'Thierry Henry'])
  })

  it('keeps the name as-is when there is no player id', () => {
    expect(names(normalizePlayerNames([goal('Unknown', null, '2020-01-01')]))).toEqual(['Unknown'])
  })

  it('keeps goals without an assist without one', () => {
    expect(normalizePlayerNames([goal('A', 1, '2020-01-01')])[0].assist).toBeNull()
  })
})
