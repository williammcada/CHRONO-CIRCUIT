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
