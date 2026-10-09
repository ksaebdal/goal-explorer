# Goal Explorer

Browse every goal in the StatsBomb open data (`../data`) and see where it was scored from on a football pitch.

## Getting started

```sh
npm install
npm run build:data   # reads ~12 GB of events in ../data, writes public/goals.json (~1 min)
npm run dev          # open http://localhost:5173
```

## Scripts

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm run build:data` | Regenerate `public/goals.json` from `../data` |
| `npm test`           | Run the unit tests once (`test:watch` to rerun on save) |
| `npm run lint`       | Check the code with oxlint                    |
| `npm run build`      | Typecheck and build for production into `dist/` |

## How it works

The raw events are far too big for a browser, so the project has two halves:

1. **`scripts/build-goals.ts`** runs once on your machine. It reads every match and its events, keeps only goals (shots with outcome "Goal", excluding penalty shootouts) and writes a small flat `public/goals.json`.
2. **The React app (`src/`)** downloads that file and lets you filter and plot the goals.

```
src/
├── lib/            pure logic shared by the script and the app (with tests)
│   ├── types.ts        the Goal type + the raw StatsBomb shapes we read
│   ├── extractGoals.ts match + events → Goal[]
│   ├── geometry.ts     pitch size, distance to goal
│   ├── filters.ts      filtering and dropdown options
│   ├── playerNames.ts  one consistent name per player (by id)
│   ├── stats.ts        numbers for the stats panel
│   └── useGoals.ts     React hook that loads goals.json
└── components/     React UI: Pitch, FiltersBar, GoalDetails, GoalList
```

## Notes on the data

- StatsBomb uses a 120 × 80 yard pitch, and every event is recorded as if the team attacks towards x = 120. Distances are converted to metres.
- A goal's assist is the pass its shot points to via `shot.key_pass_id` (about two thirds of goals have one). Penalties, direct free kicks and solo goals have none.
- Own goals are separate event types (not shots) and are not plotted, so a match's score can be higher than its number of dots.
- Team names sometimes differ between the match and event files (e.g. "Stade Malherbe Caen" vs "Caen"), so the scoring team is matched by id and named from the match file.
- Players can also appear under several names (e.g. after marriage, or "Phil" vs "Philip Foden"), and two different players can share a name. `src/lib/playerNames.ts` gives every player id the name from its latest match and adds `(id N)` when two players share a name, so one name always means one player.
