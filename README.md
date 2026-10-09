# Goal Explorer

Browse every goal in the StatsBomb open data (`../data`) and see where it was scored from on a football pitch. Pick a league and season to also see the missed shots (saved, off target, blocked).

## Getting started

```sh
npm install
npm run build:data   # reads ~12 GB of events in ../data, writes public/goals.json + public/shots/ (~1-2 min)
npm run dev          # open http://localhost:5173
```

## Scripts

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm run build:data` | Regenerate `public/goals.json` and `public/shots/` from `../data` |
| `npm test`           | Run the unit tests once (`test:watch` to rerun on save) |
| `npm run lint`       | Check the code with oxlint                    |
| `npm run build`      | Typecheck and build for production into `dist/` |

## How it works

The raw events are far too big for a browser, so the project has two halves:

1. **`scripts/build-data.ts`** runs once on your machine. It reads every match and its events and keeps every shot (excluding penalty shootouts). It writes:
   - `public/goals.json`: all ~11k goals (7 MB), loaded when the app starts;
   - `public/shots/<league>-<season>.json`: the ~90k missed shots, one file per league + season (80 files), loaded only when you ask for them.
2. **The React app (`src/`)** downloads those files and lets you filter and plot the shots.

```
src/
├── lib/            pure logic shared by the script and the app (with tests)
│   ├── types.ts        the Goal type + the raw StatsBomb shapes we read
│   ├── extractShots.ts match + events → Shot[]
│   ├── geometry.ts     pitch size, distance and angles to goal
│   ├── outcomes.ts     8 raw outcomes → Goal / Saved / Missed
│   ├── shotFiles.ts    file name of a league + season's missed shots
│   ├── filters.ts      filtering and dropdown options
│   ├── playerNames.ts  one consistent name per player (by id)
│   ├── stats.ts        numbers for the stats panel
│   └── useJson.ts      React hook that downloads a JSON file
└── components/     React UI: Pitch, OutcomeLegend, FiltersBar, ShotDetails, StatsPanel, GoalList
```

## Notes on the data

- StatsBomb uses a 120 × 80 yard pitch, and every event is recorded as if the team attacks towards x = 120. Distances are converted to metres.
- A goal's assist is the pass its shot points to via `shot.key_pass_id` (about two thirds of goals have one). Penalties, direct free kicks and solo goals have none.
- Two angles are computed for every shot: the **goal-mouth angle** (how wide the goal looked from the shot, between the lines to both posts; about 37° from the penalty spot) and the **angle from centre** (0° straight in front of goal, 90° from the byline).
- The 8 raw shot outcomes are grouped into Goal / Saved / Missed for colour (three colours are about the limit for a readable, colour-blind-safe scatter); the exact outcome is shown in the details panel.
- `data/events` contains 274 match files that are not listed in any `data/matches` file (756 goals, ~6,300 missed shots). Git history shows they were listed until the data update in commit b0bc9f22, which dropped them: 272 are from 1. Bundesliga 2015/16 (306 matches before that update, 34 after), plus one La Liga 2007/08 and one FA WSL 2018/19 match. We follow the current lists and skip them; the data script reports how many it skipped. So Bundesliga 2015/16 is incomplete here.
- Own goals are separate event types (not shots) and are not plotted, so a match's score can be higher than its number of dots.
- Team names sometimes differ between the match and event files (e.g. "Stade Malherbe Caen" vs "Caen"), so the scoring team is matched by id and named from the match file.
- Players can also appear under several names (e.g. after marriage, or "Phil" vs "Philip Foden"), and two different players can share a name. `src/lib/playerNames.ts` gives every player id the name from its latest match and adds `(id N)` when two players share a name, so one name always means one player.
