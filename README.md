# CHRONO CIRCUIT v0.10.0-rc.1

**A WILLIAM MCADA PRODUCT**

An eight-stage action-platform game using the same K–7 math catalog, settings and progression system as Olivia's Magic Bracelet Quest and Mega Man Math. The stages, bosses, powers, music and safe-gate structure remain Chrono's own.

See the [approved synchronization specification](docs/change-specs/v0.10-SHARED-MATH.md) and [verification record](docs/verification/v0.10.md). Physical iPhone/iPad checks remain unverified. Close all old game tabs/windows and reopen after deployment to activate the offline update.

## Choose the practice

Open **Settings → Adult Settings** using your existing local adult password (fresh installations: `admin123`). Under **Math practice**:

- Choose General Review, Targeted Review or Fixed Progression, grade range and 1–10 questions per gate.
- Search all grades. Search results are in grade order, not a rigor ranking.
- Check skills; the complete selected list remains visible with Remove and Clear selection.
- Preview one question per checked skill, in order, beside Save settings. Preview never changes progress or saves the draft.
- Save settings to apply at the next unopened gate. An unfinished gate keeps its original question count and content.

Fresh defaults are two questions and the quarter-hour start/end-time skill (forward/backward by 15–105 minutes). The shared text catalog has 240 skills, including K–2 and all retained Olivia/Mega Man skills. It is not a complete grade curriculum.

Practice Relay uses five questions from the same selection without changing the configured game-gate count. Fixed Progression advances at 80% first-attempt success over 10 questions and steps back to a linked prerequisite below 50%.

Teach, Guide, Independent and Mastery are no longer selectable. Begun legacy gates retain their original modes and questions for recovery; archived evidence stays separate. Old subtraction settings receive an explicitly approximate shared selection, which adults should review. Completed gates, powers and stage progress are retained. JSON backup/import, individual evidence deletion, math-only clearing and confirmed reset with a local recovery backup are available. Clock-themed art and TIME controls remain gameplay features.

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
- [Approved synchronization specification](docs/change-specs/v0.10-SHARED-MATH.md)
- [Verification record](docs/verification/v0.10.md)
- [Shared-source provenance](public/shared-math.provenance.json)
- [Release notes](RELEASE_NOTES.md)
- [Change-spec index](docs/change-specs/INDEX.md)
- [Historical source baseline](docs/MIGRATION-BASELINE.md)
- [McAda Project Handbook](https://github.com/williammcada/mcada-project-handbook)

Repository: `williammcada/CHRONO-CIRCUIT`. GitHub is the canonical source. Follow DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY. Update relevant documentation with each change, and report tests and device limitations explicitly.
