# v0.9.0 — Modular Math

- Adult-selectable Time, Subtraction, or both; four independently selectable missing-minuend/subtrahend equation and word-problem types.
- Whole-number ranges 20/100/1,000, optional zero, default within 100 with zero off. Existing users stay on Time until an adult changes it.
- Balanced shuffled questions across each stage; stable run seeds/configuration and fresh same-type checks. Continue retains its settings; restart applies new ones while keeping permanent rewards and records.
- Typed responses for every subject, including previous Time choices. Subject-aware hints, worked examples, narration, stage text and five-question Practice Relay.
- Schema-6 migration and validated roundtrips; reports separate subtraction types and clarify the support-weighted practice score.
- Running build number corrected from the stale 0.7.0 value to 0.9.0; product credit on the title screen; offline cache version updated.
- Gameplay, eight stages/bosses, art, powers, music, controls and the existing adult password mechanism retained.

Validation: 408 automated tests, module/import checks and static build passed. See [verification](docs/verification/v0.9.md) for exact evidence and browser/device limitations. The cache is designed to activate after old game tabs close. Returning-client activation remains unverified in the cloud browser; see the verification record.

# v0.8.0

- Four adult-controlled answer modes, per-stage overrides and saved run snapshots.
- Password-locked adult settings and isolated DEV room/boss testing. Initial local password: admin123.
- Questions-per-gate control moved behind adult access.
- Manual clock entry for word questions in Independent and Mastery; computation choice/clock adjustment controls removed in these modes.
- Mastery requires a fresh numerical check; mode recorded in reports.
- Dynamo Fair magnets now pull on the ground and in the air, toward the source, with ramp and cap. Inward cyan field cues replace rectangular field markers.
- Predictive enemy/boss rectangles appear only with DEV debug hitboxes enabled. Attack poses, warnings and actual hazards remain visible.
- Canvas labels render on a separate device-resolution layer, including room titles, boss warnings and world labels. Pixel-art sprites keep their rendering style.
- Existing GitHub Actions upgrade path plus a static branch-publishing package.

Validation: 338 passing automated tests; module/import check and static build passed. Local browser preview blocked; no physical Safari verification.

Implementation clarifications superseding the early document: configurable password replaces six-digit-only PIN; no unprotected reset button; mastery adds a fresh check per configured item, and numerical transfer is implemented before cross-representation transfer. GitHub Pages is the deployment target.
