# Chrono Circuit v0.7

An original elapsed-time action adventure for iPad, iPhone landscape, and desktop. Eight complete stages connect safe clock-gate problems with platforming and uninterrupted moving boss fights.

## Play and publish

The playable application is in `public/`. It uses Canvas and Web Audio, with no external runtime packages or services.

For a local preview, use Node 24:

```sh
npm run dev
```

Open the local address printed by the server. Serve the folder over HTTP; opening `index.html` as a local file does not provide the module/offline environment the game needs.

### GitHub Pages

1. Put this entire repository in your intended GitHub repository, retaining `public/`, `scripts/`, `tests/`, and `.github/workflows/pages.yml`.
2. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
3. Push to `main`, or run **Test and publish Chrono Circuit** from Actions. The workflow validates the source, runs the tests, builds `dist/`, and publishes it.
4. Open the page URL reported by the deployment. Confirm the title shows **v0.7.0**.

This follows [GitHub’s custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). It supports repository subpaths; all game URLs are relative. The workflow uses an explicit [Node 24 setup](https://github.com/actions/setup-node).

The separate WEB release ZIP contains the built site with `index.html` at its root. It is useful when publishing a static branch directly. Keep this source repository as the editable project.

No GitHub remote, repository, or live deployment was created during this build; the GitHub connection and destination have not been provided.

## Move existing progress

A new host has its own browser storage. Before leaving the old game, open **GROWN-UP REPORT → EXPORT JSON**. In v0.7 on the new host, use **GROWN-UP REPORT → IMPORT JSON** and choose that file. The game migrates v0.6’s powers, room positions, questions-per-gate setting, and completed gate parts. Keep a copy of the exported report until the new game shows the expected progress.

Fresh replays always reset that stage’s gate questions. Deaths, checkpoint retries, and resumed sessions preserve earned credit. Settings offer **1–10 questions per gate**, default **2**, fixed when each run begins.

## Campaign

| Stage | Guardian | Distinct platforming | Curriculum | Earned power |
|---|---|---|---|---|
| Furnace Run | Pendula | Conveyors, lifts, ladders, falling plates | Forward time, elapsed time, noon | Beat Brake |
| Midnight Metro | Railox | Train roofs, signals, climbing shafts | Backward time, missing departure, midnight | Transit Lance |
| Bell Tower | Ricochet | Clock hands, vertical ladders, bell hazards | Quarter past/to, half past, time language | Echo Disc |
| Sky Dial | Vesper Wing | Airships, wind, moving platforms | 12/24-hour notation, overnight duration | Updraft Burst |
| Tidal Exchange | Brinejaw | Rising buoys, raft transfers, return route | Timetables, waits, transfers, deadlines | Depth Charge |
| Verdant Engine | Floravel | Growing leaves, seed lifts, braided routes | Multi-step journeys, missing steps, time budgets | Bramble Roller |
| Prism Archive | Facet | Hub return, light bridges, delayed beams | Compare durations, differences, ties, overnight trips | Prism Orbit |
| Dynamo Fair | Jolt Jester | Returning gondolas, drums, magnetic pushes | Minutes/seconds, repeated cycles, remaining time | Arc Thread |

97 rooms including eight arenas; 24 clock gates. At the default setting, a fresh eight-stage campaign contains 48 gate questions. The bank contains 72 structural templates, including 48 new templates with numerical variations. Worked examples require an unrevealed fresh check before credit. Bosses do not invoke the question interface.

### Weapon weakness ring

| Weapon | Primary weak guardian |
|---|---|
| Beat Brake | Railox |
| Transit Lance | Ricochet |
| Echo Disc | Vesper Wing |
| Updraft Burst | Floravel |
| Bramble Roller | Jolt Jester |
| Arc Thread | Brinejaw |
| Depth Charge | Facet |
| Prism Orbit | Pendula |

Updraft Burst retains its earlier bonus against Pendula. The basic blaster can defeat every boss; no required path needs an earned weapon. Special attacks consume shared energy. Blue cells and checkpoints restore it.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | Left/Right or A/D | Arrow pad |
| Jump | Space or Z | JUMP |
| Climb | Up/Down | Up/Down pad |
| Fire | X or J | FIRE |
| Clock or local bridge switch | E or Up | TIME / SWITCH |
| Use power | C | POWER |
| Cycle earned powers | Q | SWAP |
| Drop through marked ledges | Down + Jump | Down + JUMP |
| Pause | Esc or P | Pause button |

Single jump is retained. Railox has reachable raised ledges and warned attacks. No question has a timer or health penalty. Music begins after a tap or keypress; settings independently control music, effects, narration, and reduced motion.

## Build and verification

```sh
npm test
npm run check
npm run build
```

These commands require only Node 24 and its bundled npm. They do not require `npm install`. `npm run build` packages the application and generates a cache manifest from the actual files. Do not manually maintain a separate list of art assets.

See `RELEASE_NOTES.md` for verification coverage and limits. Offline content updates after old game tabs close; close old tabs and reopen the play link if a previous version persists.

## Artwork and maintenance

Tempo uses 77 registered 48×48 raster frames, a fixed feet pivot, a distance-driven run, separate firing overlays, distinct air/landing/hurt/victory states, and held/reversible rear-facing climbing. The physics collider and blaster origin remain unchanged. Boss portraits and in-level actors use the same generated models.

`art-source/` retains the model boards, exact generation prompts, unmodified raster sources, registered previews, and the Olivia-style preparation pipeline. Rebuilding art is optional and requires the art tools documented beside the source (Sharp, Canvas, or Pillow); playing, testing, and building the game do not.

`AGENTS.md` records Will’s instruction to use GitHub for all projects going forward unless he requests otherwise.
