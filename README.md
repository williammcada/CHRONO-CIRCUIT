# CHRONO CIRCUIT v0.9.0

**A WILLIAM MCADA PRODUCT**

An eight-stage action-platform game with adult-selected math practice. Choose Time, Subtraction: missing numbers, or both. The same stages, bosses and powers support the selected content.

## Choose the practice

Open **Settings → Adult Settings** using the existing local adult password. Under **Math practice**, choose subjects, then select subtraction question types:

- Missing starting number — equation.
- Missing amount taken away — equation.
- Missing starting number — word problem.
- Missing amount taken away — word problem.

All four start selected. Choose values within 20, 100 (default), or 1,000; zero is off by default. Questions use entered answers, with balanced shuffled allocation across each stage's three gates. The question count remains 1–10 per gate, default two. Time-only remains the default until an adult changes it.

Changes apply to **new stage runs and new Practice Relays**. Continue preserves a run's questions and settings. Restart from Entrance applies the current settings, clears that stage's gate work and retains permanent powers and reports. The stage screen shows both saved and new-run practice.

Teach, Guide, Independent and Mastery retain their instructional policies. All subjects use constructed responses. Clock-themed art, TIME controls and time-slowing powers remain gameplay features even with subtraction selected.

## Run and verify

Dependency-free browser application in `public/`. Node 22 or later:

```sh
npm run dev
npm test
npm run check
npm run build
```

GitHub Actions tests and builds pushes to `main`, then publishes `dist` to GitHub Pages. Keep URLs relative. The generated offline cache updates after old tabs close; close all game tabs and reopen after a release if an older version remains visible.

## Canonical records

- [Project brief](docs/PROJECT-BRIEF.md)
- [Approved v0.9 specification](docs/change-specs/v0.9-MODULAR-MATH.md)
- [Verification record](docs/verification/v0.9.md)
- [Release notes](RELEASE_NOTES.md)
- [Change-spec index](docs/change-specs/INDEX.md)
- [Historical source baseline](docs/MIGRATION-BASELINE.md)
- [McAda Project Handbook](https://github.com/williammcada/mcada-project-handbook)

Repository: `williammcada/CHRONO-CIRCUIT`. GitHub is the canonical source. Follow DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY. Update relevant documentation with each change, and report tests and device limitations explicitly.
