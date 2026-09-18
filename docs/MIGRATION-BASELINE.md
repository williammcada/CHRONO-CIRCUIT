# Migration Baseline — CHRONO CIRCUIT

**Recorded:** 18 September 2026  
**Repository:** `williammcada/CHRONO-CIRCUIT`  
**Branch:** `main`  
**Source-preservation checkpoint:** `f73f1e34eef5da83ac686c3b41b99b9e55c02133`  
**Record status:** Current source identity. This is not by itself a functional-test, release, or deployment claim.

## Canonical source identity

| Field | Value |
| --- | --- |
| Canonical source path | `public/` structured application tree |
| Source tree SHA | `d1d78fd3b6b6d72a43c74e26ac4b2cb38fc4002d` |
| Entry point | `public/index.html` — blob `ee006fe52ca333724a3fcc0db9df5eb5aabfee77` |
| Version represented | Repository records label v0.8.0; deployment identity remains unverified |
| Repository source checkpoint | `f73f1e34eef5da83ac686c3b41b99b9e55c02133` |

The checkpoint above identifies the application/planning source immediately before this normalization record was committed. Later documentation-only commits do not change the preserved application bytes.

## Verification status

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Source exists in the default branch | Passed | Repository paths and Git object identities were read directly on 18 September 2026. |
| Byte-preservation comparison | Not applicable | Not applicable — this is a structured repository; identity is recorded by commit, tree and entry-point blob. |
| Functional workflow | Not run | Source preservation does not establish that imports, gameplay, reports, storage or exports work. |
| Hosted/running application | Not run | Not verified; earlier observation indicated a stale v0.7-looking hosted application. |

## Documentation authority

- [`PROJECT-BRIEF.md`](PROJECT-BRIEF.md) records purpose, scope, must-retain behavior and verification requirements.
- [`change-specs/INDEX.md`](change-specs/INDEX.md) identifies approved or directional change records.
- [`MIGRATION-NOTE.md`](MIGRATION-NOTE.md) is retained as historical migration context but its pre-upload source-status language is superseded by this baseline.
- This file controls current source identity when an older brief or note says the source was unknown or “TO ESTABLISH.”

## Next gate

Verify the actual hosted version, answer modes, assets and cache/service-worker state against the preserved structured source before further gameplay revisions.

Do not label a future commit a verified release until the exact candidate has passed the project brief’s required verification and that evidence is preserved.
