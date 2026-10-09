// Runs before `npm run deploy` and stops it if the site would be incomplete or
// break the StatsBomb data terms. Hosting the data publicly is only allowed
// because StatsBomb gave written permission; the logo (§1.4) is always required.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')
const problems: string[] = []

if (!existsSync(path.join(publicDir, 'goals.json'))) {
  problems.push('public/goals.json is missing - run "npm run build:data" first.')
}
const shotsDir = path.join(publicDir, 'shots')
if (!existsSync(shotsDir) || readdirSync(shotsDir).filter((f) => f.endsWith('.json')).length === 0) {
  problems.push('public/shots/ is missing or empty - run "npm run build:data" first.')
}

// A real PNG file always starts with these 8 bytes.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const logo = path.join(publicDir, 'statsbomb-logo.png')
if (!existsSync(logo)) {
  problems.push(
    'public/statsbomb-logo.png is missing. The StatsBomb data terms (§1.4) require their logo on anything\n' +
      '  published from the data. Download it from https://statsbomb.com/media-pack/ and save it there as a PNG.',
  )
} else if (!readFileSync(logo).subarray(0, 8).equals(PNG_SIGNATURE)) {
  problems.push('public/statsbomb-logo.png is not a PNG image - save the logo in PNG format.')
}

if (problems.length > 0) {
  console.error('Not deploying:\n' + problems.map((p) => `- ${p}`).join('\n'))
  process.exit(1)
}
console.log('Deploy checks passed: data files and StatsBomb logo are present.')
