# Project Brief — CHRONO CIRCUIT

**Brief version:** 0.4 — approved modular-math scope  
**Owner:** William McAda · **Credit:** A WILLIAM MCADA PRODUCT  
**Status:** Canonical source identity reconciled; release, functional and deployment verification remain separately stated.  
**Repository:** `williammcada/CHRONO-CIRCUIT`, branch `main`.  
**Current running version:** Unverified. The structured v0.8.0-labeled source is preserved, but earlier observation showed a v0.7-looking deployment with missing options.  
**Source/baseline:** Canonical preserved source: the structured `public/` application tree (tree `d1d78fd3b6b6d72a43c74e26ac4b2cb38fc4002d`) with entry point `public/index.html` (blob `ee006fe52ca333724a3fcc0db9df5eb5aabfee77`) at source checkpoint `f73f1e34eef5da83ac686c3b41b99b9e55c02133`. Repository records label this v0.8.0; the live deployment remains unverified.  
**Next work:** Verify the actual hosted version, answer modes, assets and cache/service-worker state against the preserved structured source before further gameplay revisions.  

## 1. Purpose, audience and detailed scope

- Retro action-platform time-arithmetic game for a child/student; landscape touch-first iPad, desktop keyboard, iPhone where tested. Earlier gamepad support is recorded and should be checked before removal.
- Core controls Run, Jump, Pulse, Time, Pause; time problems at gates earn progression/powers, bosses are action encounters without inserted math questions.
- Math scope includes forward/backward time, addition/subtraction, crossing noon, quarter-past/to and half-past, 24-hour versus AM/PM. Gate question count is adult-configurable; earlier default two.
- Preserve stage select, replay/progress rules, platforms/ladders/hazards, earned attack styles, weakness/progression systems and upbeat stage music. Preserve accepted single-jump behavior unless an explicit spec changes it.
- Eight-stage expansion includes four additions recorded as Tidal Exchange/Brinejaw/Depth Charge; Verdant Engine/Floravel/Bramble Roller; Prism Archive/Facet/Prism Orbit; Dynamo Fair/Jolt Jester/Arc Thread. Match final names/balance to source and expansion document; do not assert proposal content is live.
- v0.8 answer modes: Teach, Guide, Independent, Mastery. Exact hint, reveal, scoring and progression semantics must come from the full answer-mode specification; names alone are insufficient.
- Adult-only six-digit PIN protects settings/DEV access; preserve local progress migration from v0.7. Local PIN is not a server security boundary.
- Keep crisp readable text atop retro art. GitHub Pages release must match actual built assets, source path, cache/service-worker state and repository subpath.

## 2. This task and boundaries

**Approved next revision (2026-09-18):** [v0.9 Modular Math](change-specs/v0.9-MODULAR-MATH.md). Implementation pending. Adult-selectable Time and/or Subtraction; four missing-minuend/subtrahend equation and word-problem types; whole-number entered answers; no MCQ including existing Time choices; balanced random allocation across eight stages; subject-aware descriptions, hints, Practice Relay, reports and save migration. Default subtraction range: within 100, zero off; selectable ranges 20/100/1,000. Changes apply to new runs; continued runs retain their configuration. Preserve gameplay, powers, clocks and four instructional modes. The approved specification defines acceptance tests and deliberate exceptions to the earlier time-only scope.

The following paragraph records the earlier normalization task:

This normalization establishes the exact repository source path, Git object identity and source-preservation checkpoint; creates the linked migration baseline; and retires stale pre-upload source-status wording. It does not change application behavior, approve new features, rerun product tests or convert source preservation into a release claim.

## 3. Standards and adoption

[Canonical handbook](https://github.com/williammcada/mcada-project-handbook). File blob revisions consulted: AI-START-HERE.md 6557a45aaa6d29d7d1abde808e6d0ac248b08820; UNIVERSAL-RULES.md aed6fe311aa2e88983f862a30a2d8f05d2ffc04d; CONDITIONAL-STANDARDS.md dad2d3a05ca0f18260196ea51ac6351bffffdc1c; PROJECT-TEMPLATE.md 574f4c6fcf19ecc2f9e27582fd856fb08123e8da. These are file blobs, not repository commit SHAs.

Relevant rules: U-01 identity, U-02 help, U-03 input validation, U-04 unambiguous math/text where applicable, U-05 reader/device, U-06 preservation, U-07 verification, U-08 local scope. Conditional selection: S-02, S-03, S-04.
Baseline adoption: selected for this documentation task within existing user instructions. Handbook still labels shared scope/modules seeded/draft; no new global rule ratification is inferred. Project-specific approved decisions control their own scope.

## 4. Must-retain behavior

The detailed scope above is the feature-preservation inventory. Preserve existing settings, data, accepted content, assets, exports and compatibility confirmed in source. Distinguish implemented behavior, accepted pending changes and historical requests during intake. A missing entry in this brief is not authorization to remove working behavior. Preserve valid user work during migrations and failures.

## 5. Source, release and deployment discipline

Canonical preserved source: the structured `public/` application tree (tree `d1d78fd3b6b6d72a43c74e26ac4b2cb38fc4002d`) with entry point `public/index.html` (blob `ee006fe52ca333724a3fcc0db9df5eb5aabfee77`) at source checkpoint `f73f1e34eef5da83ac686c3b41b99b9e55c02133`. Repository records label this v0.8.0; the live deployment remains unverified.

See [`MIGRATION-BASELINE.md`](MIGRATION-BASELINE.md) for the authoritative source manifest and the checks actually performed.

DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY.

Use “implementation checkpoint” or “release candidate” before verification. Preserve candidate bytes and logs before packaging; recover that checkpoint after a ZIP/upload failure. Do not rebuild a verified implementation to fix delivery. Repository upload and website deployment are different operations.

## 6. Known issues, conflicts and open evidence

Observed stale v0.7 deployment/missing options, prior YAML workflow error, text and iPhone zoom issues. Historical reported 338 checks do not prove current hosted behavior or physical Safari compatibility.

| Conflict or risk | Required handling |
| --- | --- |
| Historical claim versus current source | Inspect exact source; keep historical claim labeled until verified. |
| Proposed next scope versus working baseline | Use the approved version-specific specification; do not silently promote proposals. |
| Other project rules | Do not import AAC quotas, other-game retry counts, or a shared backend without explicit scope. |
| Handbook proposals | No additional exception or proposal is adopted by this brief. |

## 7. Verification contract

Check all four mode semantics and PIN boundary, saved-progress migration, time boundary answers, stage/boss completion, controls and actual hosted version/options on iPad.

| Evidence required | Result in this task |
| --- | --- |
| Exact source candidate/commit identified and preserved | Passed — canonical path and source checkpoint recorded in `docs/MIGRATION-BASELINE.md`; no functional verification inferred |
| Project-specific checks above, with inputs and expected/actual results | Not run |
| Save/import/export and malformed-input regression | Not run |
| Intended devices and real deployment path, where applicable | Not run |
| Version, release notes and delivered bytes agree | Not run |

The next build report must name the candidate, environment and test results; historical reports of passing tests do not transfer to a changed candidate.

## 8. Handoff and provenance

Current source identity is recorded in [`MIGRATION-BASELINE.md`](MIGRATION-BASELINE.md). That manifest supersedes earlier unknown-source or pre-upload statements while preserving the original migration note as history.

Required project records: CHRONO_CIRCUIT_EIGHT_STAGE_EXPANSION_PROPOSAL.docx; v0.8 Answer Modes Specification; current source, build output and deployment configuration.

Provenance: previous migration brief and project-history audit in this conversation; directly read dossier/proposal where explicitly stated above. Records not explicitly marked read here are retrieval targets, not claims of fresh inspection. No current app code was tested for this brief.

Before substantive implementation retrieve these records, the current source, approved change spec and applicable handbook. If an indispensable spec is inaccessible, report the gap instead of filling it with invented details. Do not delete unique historical chats/assets until their contents are independently preserved.

## 9. Ecosystem boundary

Shared principles do not establish shared code, accounts or interfaces. MathQuest is engagement, TestForge assessment design, GradePal learner-level evidence, and DataDiver institutional analytics. Integration remains separately specified unless confirmed in source. Other projects remain independent unless their brief explicitly says otherwise.

