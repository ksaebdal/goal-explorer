import { describe, expect, it } from 'vitest'
import { missedShotsFileName } from './shotFiles.ts'

describe('missedShotsFileName', () => {
  it('makes a safe, lowercase file name from league and season', () => {
    expect(missedShotsFileName('1. Bundesliga', '2023/2024')).toBe('1-bundesliga-2023-2024.json')
  })

  it("removes accents and apostrophes (e.g. \"Women's\")", () => {
    expect(missedShotsFileName("UEFA Women's Euro", '2025')).toBe('uefa-women-s-euro-2025.json')
    expect(missedShotsFileName('Liga Profesional', 'Año 2020')).toBe('liga-profesional-ano-2020.json')
  })

  it('gives different seasons of the same league different files', () => {
    expect(missedShotsFileName('La Liga', '2014/2015')).not.toBe(missedShotsFileName('La Liga', '2015/2016'))
  })
})
