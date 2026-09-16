# Chrono Circuit v0.8

A William McAda game project. Eight playable time-arithmetic stages.

## Update your existing CHRONO-CIRCUIT repository

Your existing `.github/workflows/pages.yml` remains in GitHub. Browser uploads do not delete files omitted from an upload, so you do NOT need to upload or recreate that hidden folder again.

1. Extract CHRONO_CIRCUIT_V0.8_GITHUB.zip.
2. In the existing repository, use Add file → Upload files. Upload the extracted visible files and folders at the repository root (public, scripts, tests, docs, package.json, README.md, RELEASE_NOTES.md, AGENTS.md). Do not upload the ZIP itself or the outer folder. art-source is unchanged and need not be uploaded again.
3. Commit to main. Keep Settings → Pages → Source set to GitHub Actions.
4. Open Actions → Test and publish Chrono Circuit and inspect the new run. It tests and builds public/ before publishing dist/.
5. Close older game tabs, reopen the Pages site, and confirm v0.8.0 on the title. Offline updates activate after old tabs close.

The packaged YAML parses successfully. Its branch line is exactly `branches: [main]`, with no trailing character. If the existing workflow still contains `[main]a`, correct that existing typo once; subsequent updates require no YAML edits.

## New repository or workflow-free upload

Use CHRONO_CIRCUIT_V0.8_PAGES.zip instead. It contains the already-built game with index.html at the root. Upload all its contents to a new repository, then Settings → Pages → Deploy from a branch → main → /(root) → Save. No custom Actions file is required. On a repository that already has a custom deployment workflow, disable that workflow first to avoid competing deployments.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Adult access and DEV

Settings → Adult Settings → password `admin123`. Change it inside Adult Settings if desired. Never enter this password on an unrelated site. This is a local game lock, not a GitHub credential.

Choose Teach, Guide, Independent, or Mastery, 1–10 questions per gate (default 2), and optional stage overrides. Choices apply to new runs; checkpoint retries keep their mode and credited answers.

DEV mode is available only after adult unlock. Load any room or boss, test all earned attack styles, refill health/energy, and reset an encounter. All math gates are bypassed in a disposable save; DEV never writes campaign or academic progress. Returning to the title restores the original save. Reload exits DEV. Adult access expires after five minutes and locks on resize or hiding the page. DEV play pauses for reauthentication when locked.

The password verifier stays in separate browser storage and is excluded from progress exports. No account or server is involved. Forgotten custom password recovery requires clearing only the `chrono-circuit-adult-v1` browser storage entry using browser developer tools; campaign data uses a different key. There is no child-accessible reset button.

## Answer modes

- Teach: worked solution, then a fresh supported check.
- Guide: adjustable clock and hints; word-to-clock choices remain.
- Independent: typed computational responses; no clock adjustment, choice answers, or automatic worked solution. Route decisions remain selections.
- Mastery: independent response followed by a fresh numerical transfer check. Two consecutive correct responses earn the configured item credit. A mistake resets that pair. Thus a mastery gate requires at least twice the configured number of responses; the progress counter counts completed pairs.

Mastery uses new numerical variants; it does not guarantee a different representation for every follow-up. No automatic mode promotion. Parent reports retain answer mode on new records.

## Development

Node 22+; no package installation required.

    npm test
    npm run check
    npm run build
    npm run dev

338 automated checks passed for the release. Browser visual testing was blocked by the environment's localhost policy; physical Safari remains unverified. Check text and adult forms on target devices before classroom use.
