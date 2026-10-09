// Reads the raw StatsBomb data in ../data and writes public/goals.json.
// Run with: npm run build:data   (takes a few minutes - it reads ~12 GB)
import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractGoals } from '../src/lib/extractGoals.ts'
import type { Goal, RawEvent, RawMatch } from '../src/lib/types.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(here, '../../data')
const OUTPUT_FILE = path.resolve(here, '../public/goals.json')

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, 'utf8')) as T
}

/** Every match from every data/matches/<competition>/<season>.json file. */
async function loadAllMatches(): Promise<RawMatch[]> {
  const matchesDir = path.join(DATA_DIR, 'matches')
  const matches: RawMatch[] = []
  // withFileTypes + the filters skip hidden files like macOS's .DS_Store.
  for (const competitionDir of await readdir(matchesDir, { withFileTypes: true })) {
    if (!competitionDir.isDirectory()) continue
    const competitionPath = path.join(matchesDir, competitionDir.name)
    for (const seasonFile of await readdir(competitionPath)) {
      if (!seasonFile.endsWith('.json')) continue
      matches.push(...(await readJson<RawMatch[]>(path.join(competitionPath, seasonFile))))
    }
  }
  return matches
}

async function main() {
  const matches = await loadAllMatches()
  console.log(`Found ${matches.length} matches`)

  const goals: Goal[] = []
  let missingEvents = 0
  for (const [i, match] of matches.entries()) {
    const eventsFile = path.join(DATA_DIR, 'events', `${match.match_id}.json`)
    if (!existsSync(eventsFile)) {
      missingEvents++
      continue
    }
    goals.push(...extractGoals(match, await readJson<RawEvent[]>(eventsFile)))
    if ((i + 1) % 250 === 0) console.log(`  ${i + 1}/${matches.length} matches, ${goals.length} goals`)
  }

  // Newest match first; within a match, in the order the goals were scored.
  goals.sort(
    (a, b) =>
      b.matchDate.localeCompare(a.matchDate) ||
      a.matchId - b.matchId ||
      a.period - b.period ||
      a.minute - b.minute ||
      a.second - b.second,
  )

  await writeFile(OUTPUT_FILE, JSON.stringify(goals))
  console.log(`Wrote ${goals.length} goals to ${path.relative(process.cwd(), OUTPUT_FILE)}`)
  if (missingEvents > 0) console.log(`(${missingEvents} matches had no events file and were skipped)`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
