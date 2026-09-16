# v0.7.0 — Eight Circuits

## Changes

- Replaced Tempo’s procedural body drawing with 77 registered raster animation frames. Idle and running have independent timing; running fire preserves the stride. Rear-facing climbing holds still on a stopped rung, reverses when descending, and keeps the grip stable when aiming left or right.
- Added Tidal Exchange, Verdant Engine, Prism Archive and Dynamo Fair: 45 new rooms, 12 new enemy types, four moving bosses, and four earned attack styles.
- Added rising buoys and clamps, safe folding leaves, persistent bridge switches, return routes, delayed beams, magnetic pushes, shootable fireworks and recovery-only moving arena drums.
- Unified all eight bosses, 24 enemy types and eight portraits using matching raster models. Added seven registered background plates, retaining Furnace Run’s existing scenery.
- Added four distinct original arranged songs and stage-specific instruments. All eight scores have 40-bar structures lasting roughly 63–76 seconds, with boss variations.
- Connected the eight-guardian weakness ring. Existing powers remain useful; Updraft Burst keeps its earlier bonus against Pendula. Every boss remains blaster-defeatable.
- Added 48 structured question templates covering timetable decisions, multi-step journeys, comparisons and seconds. The campaign now has 72 templates, 24 gates and 48 questions on a default fresh playthrough.
- Added proper schedule tables, ordered step cards, route-and-difference responses, exact time fields and equivalent duration entry. A worked answer requires a fresh, unrevealed check before credit.
- Preserved v0.6 progress migration, required math on replays and the 1–10 questions-per-gate setting. Drafts, attempts, check questions and world switches survive resumptions. Malformed imported learning sessions are discarded without losing other valid progress.
- Prepared the repository for GitHub Pages with relative assets, an automated validation/test/build/deploy workflow and a generated, scope-aware offline cache.

## Verification

**322 automated tests passed on Node 24**, with external dependency lookup removed from the environment. Source validation confirms 25 JavaScript modules, their exports/imports and the relative manifest. The static release build contains 43 runtime files plus its generated worker.

Coverage includes:

- All 89 nonboss room routes using the real single-jump, ladder and machinery physics.
- All 93 enemy placements, fired on from reachable positions sampled along production traversal traces.
- Basic-blaster victories against all eight bosses. The Railox regression victory loses no hearts.
- Damage-free responses to all 12 new boss attacks from both sides, with assist on and off; the same coverage for Railox’s three attacks.
- The complete weakness cycle, weapon energy/caps, line of sight, bounded interrupts, one-bounce explosions, orbit hit limits and shootable fireworks.
- All 48 new templates across 64 seeds each, including independent arithmetic checks and exact entry formats.
- Gate UI events, fresh-check credit, replay reset, stable saved rooms, partial gates, checkpoint retention, and malformed-import handling.
- Native PNG pixel checks for Tempo’s registration, planted idle feet and matching run/fire boot phases.
- Source soundtrack structure and finite, cleaned-up synth voices.

Production Canvas views were rendered and inspected for every stage and every boss, alongside native/enlarged sprite sheets and motion samples. These checks use the actual drawing modules with a Canvas backend.

**Testing limits:** the available browser rejected the local preview URL with `ERR_BLOCKED_BY_CLIENT`, so a live browser interaction run could not be completed. Physical iPhone/iPad Safari layout, multi-touch and audio behavior remain unverified. Automated arena tests establish available dodges, not a child playtest of difficulty or pacing.

## Upgrade

When moving from the old host, export the old game’s progress JSON from its grown-up report and import it on the new GitHub Pages site. Browser storage does not transfer between hosts. Close old game tabs before reopening a newly deployed version so its offline worker can activate.

No remote GitHub repository or live Pages deployment was modified during this build.
