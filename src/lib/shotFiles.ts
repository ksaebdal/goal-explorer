// Missed shots are split into one file per league + season (public/shots/<name>.json),
// so the app only downloads the season you are looking at. The data script and the
// app both use this function, so they always agree on the file name.

/** e.g. ("1. Bundesliga", "2023/2024") → "1-bundesliga-2023-2024.json" */
export function missedShotsFileName(competition: string, season: string): string {
  const slug = `${competition} ${season}`
    .normalize('NFD') // split "é" into "e" + accent...
    .replace(/[̀-ͯ]/g, '') // ...and drop the accent
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // anything else (spaces, dots, slashes) becomes "-"
    .replace(/^-|-$/g, '')
  return `${slug}.json`
}
