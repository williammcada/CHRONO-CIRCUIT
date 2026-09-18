# Project Brief — CHRONO CIRCUIT

**Brief version:** 0.5 — v0.9 modular math implementation  
**Owner:** William McAda · **Credit:** A WILLIAM MCADA PRODUCT  
**Repository:** williammcada/CHRONO-CIRCUIT, main  
**Application version:** 0.9.0  
**Status:** Implementation complete; automated checks passed. Deployment and browser/device evidence are tracked separately in [verification](verification/v0.9.md).

## Purpose and targets

Eight-stage retro action-platform game for a child. Adults select math content independently of level choice. Target landscape touch-first iPad and desktop keyboard; preserve gamepad support and existing responsive behavior. Do not infer physical Safari/iPhone verification from automated tests.

## Approved curriculum and settings

[v0.9 Modular Math](change-specs/v0.9-MODULAR-MATH.md) governs the current implementation. Protected adult settings select Time, Subtraction, or both. Subtraction contains four independent types: missing minuend equation, missing subtrahend equation, missing minuend word problem and missing subtrahend word problem. All numbers and answers are whole numbers. Ranges 20/100/1,000; default 100; zero off. All four types initially enabled. Existing saves and fresh defaults stay Time-only until changed by an adult.

No multiple-choice responses, including Time. Route identifiers are entered as text; time units, AM/PM and day remain representation controls. Questions are shuffled in balanced subject/type bags across each stage. Question count defaults to two per gate, adjustable 1–10. Each stage has three gates. Configuration and seeds are fixed for a run; later settings affect new runs/relays only. Continue and new-run configurations are visibly distinguished.

Preserve existing Time strands: forward/backward arithmetic, noon/midnight, quarter/half-hour language, 12/24-hour conversion, schedules/transfers, multi-step journeys/deadlines, comparisons and time units. Hide time-learning claims when Time is not active; keep game-world clock theming.

## Must retain

- Eight stages, stage select, replay/progress rules, single jump, ladders/platforms/hazards, art, music, gamepad, touch and keyboard controls.
- Math only at safe gates and Practice Relay. Boss fights never open questions. All required traversal and bosses work with the basic blaster.
- Fresh stage replays reopen gates; death/checkpoint retry retains credited and partial work. Permanent powers and learning history remain.
- Teach, Guide, Independent and Mastery, including stage overrides. A revealed answer never credits an item; fresh checks retain the question type and range. Mastery requires two consecutive correct items.
- Existing local adult password protection and DEV isolation. The early six-digit PIN proposal was superseded by the v0.8 release notes; v0.9 preserves the configurable password behavior.
- Local storage key `chrono-circuit-save-v1`; schema 6 migrates versions 1–5 and retains legacy room indices. New routes store subject/type/range snapshot, seed and generator version. Old runs retain legacy Time generation.
- Reports separate the four subtraction types, retain prior records, and distinguish support-weighted practice score from accuracy. Imports retain current adult settings and valid run snapshots; invalid learning sessions cannot inject canonical answers.

## Architecture and delivery

Dependency-free ES modules in `public/`, entry point `public/index.html`. Registry: `math-modules.js`; subtraction: `subtraction.js`; configuration: `practice-config.js`; adult markup: `practice-ui.js`; legacy Time task adapter: `time-tasks.js`. Shared gate/progress layers dispatch by module. No new server, account, paid service or network dependency.

GitHub Pages uses the existing main-push workflow. Build copies source/assets and creates a content-fingerprinted, scope-aware service worker. Old clients activate the update after old tabs close. Keep all asset/module paths relative to the repository subpath. Never commit build output or credentials.

## Provenance and applicable standards

Implementation starts from `979485dd02a312e86b02c780cc6737fb1e8ee40b` (approved design checkpoint). Earlier source preservation is recorded in [MIGRATION-BASELINE.md](MIGRATION-BASELINE.md). v0.8-labeled source still contained BUILD 0.7.0; v0.9 corrects the running identity.

Handbook revision consulted: `6de4cbf33c3b9860125c412359fb64ef3d0b20d1`; AI-START-HERE.md, UNIVERSAL-RULES.md, CONDITIONAL-STANDARDS.md (S-02, S-03, S-04), RELEASE-CHECKLIST.md. Apply U-01–U-08 in project scope. No new global policy or other-project quotas are adopted.

Also consulted AGENTS.md, v0.8 answer-mode Markdown and original DOCX, v0.8 release-note clarifications, relevant eight-stage expansion sections, and current source/workflow. v0.9 deliberately supersedes time-only curriculum and answer-choice allowances; it does not change stage/boss design.

## Verification and release workflow

DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY.

Required automated commands: `npm test`, `npm run check`, `npm run build`. Verify generator arithmetic, modes and fresh checks, all type subsets/counts, migration/import, every stage's gate/boss admission, controls and retained gameplay. Browser checks supplement these; physical iPad Safari is separate evidence. See [v0.9 verification](verification/v0.9.md) for actual outcomes and limitations. Preserve exact candidates before testing/packaging; recover them after delivery failure. Update this brief, relevant specifications/indexes, README and release notes automatically when project changes affect them.
