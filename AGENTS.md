# Project instructions

## Persistent user preference

On 2026-09-15, Will instructed: "we are migrating to Github for all projects going forward unless I tell you otherwise (commit to memory)."

Use GitHub as the default source repository for this and future projects unless Will explicitly chooses another destination. Prepare changes in version control and preserve reviewable commits. Do not assume a GitHub account, repository, or remote URL that has not been provided or verified. This preference replaces the earlier Netlify/Sites default.

## Chrono Circuit

- The playable application is the dependency-free browser game in `public/`.
- Keep all asset/module URLs relative so GitHub Pages project subpaths work.
- Preserve v0.6 saves and the `chrono-circuit-save-v1` storage key; old numeric room indices must retain meaning.
- Math happens at safe stage gates; bosses never open questions.
- Fresh replays require gate questions. Deaths/checkpoint retries preserve credited work.
- Questions per gate default to 2, configurable 1–10, fixed when a shared gate opens. Settings changes apply to the next unopened gate.
- No required traversal may depend on an earned power. Every boss must be beatable with the regular blaster.
- Tempo uses registered raster sprites with consistent feet anchors; never rescale each animation frame independently.
- Run `npm test`, `npm run check`, and `npm run build` before a release. Browser tests supplement deterministic physics/curriculum tests.
- Keep generated source artwork and registration metadata in version control. Do not include private progress reports, credentials, dependency directories, or build output.

## Modular math (v0.9+)

- Keep adult-selected subjects separate from stage gameplay. Preserve legacy Time generation for old runs.
- New runs snapshot math configuration and seed; settings changes must not rewrite active questions.
- All subjects use constructed responses; keep subtraction types separate in reports.
- Update affected documentation alongside code; record exact verification and deployment limits.

## Shared math (v0.10+; supersedes new-practice selection above)

- Use Olivia's canonical shared math component, catalog and Practice engine, with recorded source revision and generated bundle hash. No independent settings/catalog fork.
- Teach/Guide/Independent/Mastery and the old subject/type/range controls are recovery-only for begun legacy gates; the user approved replacing them for new practice on 2026-10-01.
- Keep shared snapshots separately per gate, including drafts and credit across stage switches/reloads. Preserve begun legacy gates and archived reports. Unopened gates use shared settings.
- `arcade-math.js`/`arcade-ui.js` are Chrono host adapters; `progress.js` and the historical modules retain legacy save recovery. Schema 7 preserves schemas 1–6 and the storage key.
- Math Arcade account/assignment/network integration is not implemented by this local synchronization release.
