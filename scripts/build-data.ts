// Reads the raw StatsBomb open data and writes:
//   public/goals.json        every goal (the app loads this at start)
//   public/shots/<name>.json the missed shots of one league + season (loaded on demand)
// Run with: npm run build:data   (takes a minute or two - it reads ~12 GB)
//
// Where the data is: set STATSBOMB_DATA_DIR to the "data" folder of your copy of
// https://github.com/statsbomb/open-data, or clone it next to this project
// (../open-data/data), which is the default.
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractShots } from '../src/lib/extractShots.ts'
import { compareShots } from '../src/lib/order.ts'
import { normalizePlayerNames } from '../src/lib/playerNames.ts'
import { missedShotsFileName } from '../src/lib/shotFiles.ts'
import type { RawEvent, RawMatch, Shot } from '../src/lib/types.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(process.env.STATSBOMB_DATA_DIR ?? path.join(here, '../../open-data/data'))
const GOALS_FILE = path.resolve(here, '../public/goals.json')
const SHOTS_DIR = path.resolve(here, '../public/shots')

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

/**
 * Event files whose match is not in any data/matches list. The publisher removed
 * these matches from its lists, so we don't know their league or season and skip them.
 */
async function countUnlistedEventFiles(matches: RawMatch[]): Promise<number> {
  const listed = new Set(matches.map((m) => `${m.match_id}.json`))
  const files = await readdir(path.join(DATA_DIR, 'events'))
  return files.filter((f) => f.endsWith('.json') && !listed.has(f)).length
}

async function main() {
  if (!existsSync(path.join(DATA_DIR, 'matches'))) {
    throw new Error(
      `No StatsBomb data found in ${DATA_DIR}.\n` +
        'Clone https://github.com/statsbomb/open-data next to this project, or set STATSBOMB_DATA_DIR ' +
        'to its "data" folder (see README.md).',
    )
  }
  console.log(`Reading StatsBomb data from ${DATA_DIR}`)
  const matches = await loadAllMatches()
  console.log(`Found ${matches.length} matches`)

  let shots: Shot[] = []
  let missingEvents = 0
  for (const [i, match] of matches.entries()) {
    const eventsFile = path.join(DATA_DIR, 'events', `${match.match_id}.json`)
    if (!existsSync(eventsFile)) {
      missingEvents++
      continue
    }
    shots.push(...extractShots(match, await readJson<RawEvent[]>(eventsFile)))
    if ((i + 1) % 250 === 0) console.log(`  ${i + 1}/${matches.length} matches, ${shots.length} shots`)
  }

  // One name per player, one player per name (see playerNames.ts). Done on ALL
  // shots together, so a player has the same name in goals.json and the shot files.
  shots = normalizePlayerNames(shots)

  shots.sort(compareShots)

  const goals = shots.filter((s) => s.outcome === 'Goal')
  await writeFile(GOALS_FILE, JSON.stringify(goals))
  console.log(`Wrote ${goals.length} goals to ${path.relative(process.cwd(), GOALS_FILE)}`)

  // Group the misses by league + season. Two different leagues must never share a file name.
  const missesByFile = new Map<string, { competition: string; season: string; shots: Shot[] }>()
  for (const shot of shots) {
    if (shot.outcome === 'Goal') continue
    const { competition, season } = shot
    const fileName = missedShotsFileName(competition, season)
    const group = missesByFile.get(fileName) ?? { competition, season, shots: [] }
    if (group.competition !== competition || group.season !== season) {
      throw new Error(`"${group.competition} ${group.season}" and "${competition} ${season}" both map to ${fileName}`)
    }
    group.shots.push(shot)
    missesByFile.set(fileName, group)
  }

  // Start from an empty folder so files from an old run can't linger.
  await rm(SHOTS_DIR, { recursive: true, force: true })
  await mkdir(SHOTS_DIR, { recursive: true })
  for (const [fileName, group] of missesByFile) {
    await writeFile(path.join(SHOTS_DIR, fileName), JSON.stringify(group.shots))
  }
  const missCount = shots.length - goals.length
  console.log(`Wrote ${missCount} missed shots to ${missesByFile.size} files in ${path.relative(process.cwd(), SHOTS_DIR)}/`)

  if (missingEvents > 0) console.log(`(${missingEvents} matches had no events file and were skipped)`)
  const unlisted = await countUnlistedEventFiles(matches)
  if (unlisted > 0) console.log(`(${unlisted} event files belong to matches not listed in data/matches and were skipped)`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
