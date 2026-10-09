# Goal Explorer

Browse every goal and shot in the [StatsBomb open data](https://github.com/statsbomb/open-data) on a football pitch: where it was taken from, how far out and at what angle, who assisted it, and how it ended. Pick a league and season to also see the missed shots.

- Filter by league, season, team and player
- Click a shot to see the match, arena, distance, two angles, body part, assist or key pass, and xG
- Statistics for the current selection: top scorers and assisters, goal distances, how goals were set up
- Missed shots coloured by outcome (saved / missed), loaded per league and season

Built with React, TypeScript and Vite, with unit tests in Vitest.

> **This repository contains no football data.** The StatsBomb data may not be redistributed (see [Data and terms](#data-and-terms)), so you generate the app's data files yourself from your own copy of the open data.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer, and git.

```sh
# 1. Get the StatsBomb open data (large: ~15 GB) next to this project
cd ..
git clone https://github.com/statsbomb/open-data.git
cd goal-explorer

# 2. Install and generate the app's data files from it (~1-2 minutes)
npm install
npm run build:data

# 3. Start the app and open http://localhost:5173
npm run dev
```

If your copy of the open data lives somewhere else, point the script at its `data` folder:

```sh
STATSBOMB_DATA_DIR=/path/to/open-data/data npm run build:data
```

StatsBomb also asks every user of the data to register at [statsbomb.com/resource-centre](https://statsbomb.com/resource-centre).

### The StatsBomb logo

The data terms require the StatsBomb logo on anything you publish based on the data, including screenshots. Download it from the [StatsBomb Media Pack](https://statsbomb.com/media-pack/) and save it as `public/statsbomb-logo.png`. The page footer shows it automatically; without it, only a text credit appears.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build:data` | Generate `public/goals.json` and `public/shots/` from the StatsBomb data |
| `npm test` | Run the unit tests once (`npm run test:watch` reruns them on every save) |
| `npm run lint` | Check the code with oxlint |
| `npm run build` | Typecheck and build for production into `dist/` |

Every push to GitHub runs the lint, tests and build automatically (`.github/workflows/ci.yml`). This needs no data and publishes nothing.

## How it works

The raw event data is far too big for a browser (~12 GB), so the project has two halves:

1. **`scripts/build-data.ts`** runs once on your machine. It reads every listed match and its events, and keeps every shot (penalty shootouts excluded). It writes:
   - `public/goals.json`: all ~11k goals (~7 MB), loaded when the app starts;
   - `public/shots/<league>-<season>.json`: the ~90k missed shots, one file per league and season, loaded only when you ask for them.
2. **The React app (`src/`)** downloads those files and lets you filter and plot the shots.

Both generated outputs are listed in `.gitignore`, so they are never committed.

```
src/
├── lib/            pure logic shared by the script and the app (with tests)
│   ├── types.ts        the Shot type + the raw StatsBomb shapes we read
│   ├── extractShots.ts match + events → Shot[]
│   ├── geometry.ts     pitch size, distance and angles to goal
│   ├── outcomes.ts     8 raw outcomes → Goal / Saved / Missed
│   ├── playerNames.ts  one consistent name per player (by id)
│   ├── filters.ts      filtering and dropdown options
│   ├── stats.ts        numbers for the stats panel
│   ├── order.ts        sort order of shots
│   ├── shotFiles.ts    file name of a league + season's missed shots
│   └── useJson.ts      React hook that downloads a JSON file
└── components/     React UI: Pitch, OutcomeLegend, FiltersBar, ShotDetails, StatsPanel, ShotList, Attribution
```

## Notes on the data

- StatsBomb uses a 120 × 80 yard pitch, and every event is recorded as if the team attacks towards x = 120. Distances are converted to metres.
- Two angles are computed for every shot:
  - the **goal-mouth angle**: how wide the goal looked, between the lines to both posts (about 37° from the penalty spot);
  - the **angle from centre**: 0° straight in front of goal, 90° from the byline.
- The 8 raw shot outcomes are grouped into Goal / Saved / Missed for colour. Three colours are about the limit for a readable, colour-blind-safe scatter. The exact outcome is shown in the details panel.
- A shot's assist (or, for a miss, its "key pass") is the pass it points to via `shot.key_pass_id`.
- Own goals are separate event types, not shots, so they are not plotted. A match's score can therefore be higher than its number of goal dots.
- Team names sometimes differ between the match and event files (e.g. "Stade Malherbe Caen" vs "Caen"). The scoring team is therefore matched by id and named from the match file.
- Players can appear under several names (e.g. after marriage, or "Phil" vs "Philip Foden"), and two different players can share a name. `src/lib/playerNames.ts` gives every player id the name from its latest match, and adds `(id N)` when two players share a name, so one name always means one player.
- Some event files are not listed in any `data/matches` file, and the script skips them and reports how many.
  - In the copy used during development, 274 such files existed, holding 756 goals. 272 were from 1. Bundesliga 2015/16, which a data update reduced from 306 listed matches to 34.

## Data and terms

The football data is © StatsBomb and is used under the **StatsBomb Public Data User Agreement** (`LICENSE.pdf` in the [open-data repository](https://github.com/statsbomb/open-data)). In short:

- The data is for analysis and research; analysis and conclusions may be shared publicly.
- Anything published from it must credit StatsBomb with **their logo**.
- The data itself may **not be redistributed**, reproduced or provided to third parties, and may not be used commercially.

That is why this repository contains only code, and why the app is not hosted publicly: a public site would have to serve the generated data files to every visitor. Analysis and conclusions here are my own, not necessarily StatsBomb's.
