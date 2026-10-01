# Project Brief — CHRONO CIRCUIT

**Brief version:** 0.7 — shared math synchronization  
**Owner:** William McAda · **Credit:** A WILLIAM MCADA PRODUCT  
**Repository:** williammcada/CHRONO-CIRCUIT, main  
**Application version:** 0.10.0-rc.1  
**Status:** Shared-system implementation deployed to [GitHub Pages](https://williammcada.github.io/CHRONO-CIRCUIT/) from `0f32a4d0c3d0a819dee50d17106b0f4d433e4bf6`; running version, answer checking and deployed hashes verified. Evidence and physical-device limits are maintained in [verification](verification/v0.10.md).

## Current contract and source

[Approved v0.10 specification](change-specs/v0.10-SHARED-MATH.md), approved 2026-10-01. Baseline Chrono `ff5fbac605ad2f6c6aa3f76c3ecc3ecd77961e06` (v0.9.1). Verified implementation candidate `45a6ea9377c134f840ed34dd03d6a16943b7e45c`; subsequent release documentation does not change the runtime.

Canonical math: Olivia `df28efce7bde25a239915af7db72b8b5caf85eb4`, `src/shared-math`. Generated ES-module bundle SHA-256 `5216527ee97c316a4454760b5cf8862a6a675e62464d515f59226a70b38727dd`. [Provenance manifest](../public/shared-math.provenance.json) records every source hash. ES-module packaging adds public validation/pool exports; it does not change catalog, selection UI, preview, checking or progression semantics. Mega Man v0.6.1 consumes the same canonical source in IIFE form.

## Audience, practice and targets

Eight-stage retro action-platform game for children. Target landscape touch-first iPad and desktop keyboard; preserve gamepad support. Automated browser testing includes landscape phone dimensions, not physical iOS verification.

Use the same 240 text skills (K–7), settings labels, all-grade search, complete checked list, per-skill removal, Clear selection and sequential one-question-per-skill preview as Olivia and Mega Man. Preview is beside Save settings, independent of gate count and saved evidence. No Grade 3 preset.

Modes: Mixed Review—General, Mixed Review—Targeted and Fixed Progression. Grade range K–7, count 1–10, separate 24-hour toggle. Fixed progression uses first-attempt history: at least 80% of the latest 10 advances; below 50% returns to a linked prerequisite. Wrong answers retry without gameplay penalties. Use shared constructed-response checkers and fraction rules.

Chrono's default stays time-focused and two questions per gate, initially selecting the quarter-hour forward/backward start/end-time skill. Legacy subtraction selections receive an explicit approximate mapping by range and story usage; mixed addition/subtraction may occur in these shared skills, so the migration note asks adults to review selection. The old subject/type/range/zero controls and Teach/Guide/Independent/Mastery are superseded for new practice, by explicit approval. Their generators/policies remain only to recover begun legacy gates. No old learning evidence is imported into shared progression as mastery.

## Must retain and gate ownership

- Eight stages, stage selection, replay rules, single jump, ladders/platforms/hazards, art/music, keyboard/gamepad and cross-shaped touch D-pad.
- Three safe gates per stage. Boss fights and deaths never create new math gates. Required traversal/bosses remain possible with the basic blaster.
- Begun gates retain count, generated item, draft, attempts and credits across exits, stage switching, deaths, reloads and JSON roundtrips. Shared settings apply at the next unopened gate, superseding the old run-wide configuration policy.
- An old gate with answered slots or a learning session keeps its legacy mode and content until finished. Unopened old gates adopt shared math.
- Fresh stage replay restarts that stage's gates, retaining earned powers and report history. Game-world clock themes and TIME controls do not promise time-only content.
- Five-question Practice Relay uses the shared selection independently of the configured game-gate count; unfinished relays can continue.
- Existing password lock and DEV isolation; DEV progress does not persist.
- Existing storage key `chrono-circuit-save-v1`; schema 7 wraps validated schema 1–6 recovery and retains room indices.
- Keep original reports with subject/type metadata and distinguish their support-weighted practice score from shared first-attempt evidence. Imports preserve current adult configuration. Pending shared items regenerate from bounded seed metadata rather than trusting imported answers.

## Data, deletion and architecture

No accounts, student names, analytics, remote learner storage, paid service or new runtime dependency. Data stays in browser storage. Shared events retain the latest 5,000; the existing completed report retains up to 160 records. Adult settings provide CSV evidence export, JSON backup/import, per-skill evidence reset, math-only reset and confirmed campaign clear with one local backup. Archived report records can be deleted individually or together. Campaign clear preserves the adult password and downloaded files. Restore replaces progress; failed backup/storage writes do not claim successful campaign replacement.

Dependency-free ES modules in `public/`; entry `public/index.html`. `shared-math.js` is generated from canonical Olivia source. `arcade-math.js` owns Chrono migration and per-gate snapshots; `arcade-ui.js` binds shared settings and a game-pausing prompt/keypad. `progress.js`, `math-modules.js`, `subtraction.js`, `practice-config.js`, `practice-ui.js`, `gate-ui.js` and time modules remain for legacy recovery/regression. Do not independently edit the generated shared bundle. Rebuild with `node scripts/sync-shared-math.mjs /path/to/pinned/olivia` and verify source hashes.

Math Arcade teacher assignments/accounts/network integration are outside this synchronization release.

## Delivery and standards

GitHub Pages uses the existing main-push workflow. The build copies source/assets and generates a scope-aware fingerprinted offline worker. Keep all paths relative. Close old tabs to activate an update. Do not commit build output, dependency directories, credentials or personal reports. The reported additional Render deployment has no supplied URL and is not claimed verified.

Handbook baseline actually consulted: `c50115ba1fea9cb552f3ad1415e670a219118b56`; AI-START-HERE.md, UNIVERSAL-RULES.md, CONDITIONAL-STANDARDS.md (S-02/S-03/approved S-03-M/S-04), RELEASE-CHECKLIST.md. Apply approved U-09 deletion and U-10 input reliability, and U-01–U-08 in project scope. No handbook policy was changed. Also read AGENTS.md, prior brief, v0.9/v0.9.1 specifications and actual current source/workflow.

## Verification workflow

DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY.

Run `npm test`, `npm run check`, `npm run build`. The browser runner `node tests/shared-host.browser.mjs` uses externally installed Playwright/Chromium; see the script's optional PLAYWRIGHT_MODULE/CHROMIUM_MODULE paths. It serves the production build with test-only in-memory handles that are not shipped. Legacy VM tests deliberately exercise retained recovery paths; new adapter tests cover all eight stages, shared generation, migration/forgery and progression. Browser tests cover the actual shared default.

See [v0.10 verification](verification/v0.10.md) for evidence. Physical iPhone/iPad Safari/Edge, sustained hardware play, lock/unlock and school-network use remain Not run. Retain known v0.9.1 viewport recovery and shared-coordinate labels; no claim of resolving an intermittent physical-device defect is inferred from emulation.
