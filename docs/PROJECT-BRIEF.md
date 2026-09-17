# Project Brief — CHRONO CIRCUIT

**Brief status:** Migration baseline / requires source verification where noted  
**Brief version:** 0.1  
**Last updated:** 18 September 2026  
**Owner:** William McAda  
**Product credit:** A WILLIAM MCADA PRODUCT  
**Handbook repository:** `williammcada/mcada-project-handbook`  
**Handbook baseline:** `6557a45aaa6d29d7d1abde808e6d0ac248b08820 (AI-START-HERE.md); UNIVERSAL-RULES.md @ aed6fe311aa2e88983f862a30a2d8f05d2ffc04d`  
**Repository:** `williammcada/CHRONO-CIRCUIT`  
**Canonical source status:** Existing GitHub repository. Current latest commit observed during migration: `54a5d5171ed652731ced87fab83e1ae8dca1634c`. The repository README identifies v0.8.0.  
**Current project state:** Existing deployed v0.8 codebase. The repository reports 338 automated checks passed for the release; physical Safari remained unverified in that release note.

## 1. Purpose and audience

CHRONO CIRCUIT is a touch-first action-platform game for practicing time arithmetic through math gates, stages, bosses, earned powers, and multiple instructional answer modes.

**Primary audience / operator:** Child/student player on iPad, iPhone where supported, or computer; adult/teacher/parent for protected settings and developer controls.

## 2. Standards selection

**Universal baseline:** U-01 through U-08 where applicable.

**Conditional modules:** S-02 Curriculum/Assessment/Evidence; S-03 Live Classroom and Educational Games; S-04 Distribution/Deployment

Apply only the selected modules and project-local requirements. Do not import restrictions from unrelated projects.

## 3. Project-specific requirements

- Preserve time-arithmetic learning identity and the configured gate/question modes.
- Support complete required touch controls on target mobile devices and keyboard controls where supported.
- Keep important in-game text crisp and readable.
- Preserve adult settings/DEV boundaries and local-only progress behavior unless explicitly changed.
- GitHub Pages deployment must publish the actual intended version rather than a stale build.
- Math prompts must avoid unstated rounding or time-convention ambiguity.

## 4. Preserve from the current accepted project

- Eight-stage structure and stage-select/progression behavior currently accepted.
- Teach, Guide, Independent, and Mastery answer modes.
- Boss/gameplay balance decisions, earned attack styles, and power progression unless a later spec changes them.
- Local progress storage and report behavior.
- Retro visual/music identity and touch-first interface.

## 5. Relationship to other projects

- Independent educational game; MathQuest rules do not automatically apply.
- Shares universal educational-game principles but retains its own time-arithmetic, boss, control, and presentation rules.

A conceptual relationship is not proof of an implemented integration. Do not invent a shared API, data schema, identity layer, or deployment dependency without an explicit integration task.

## 6. Source and version discipline

The exact current source artifact or repository commit must be identified before a substantive build. If the field above says the source is not yet established, first locate the latest known-good local file/ZIP or existing repository state and record its exact identity here.

For substantial revisions use:

**DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY (when applicable)**

A packaging/export/deployment failure must not force reconstruction of an already verified build.

## 7. Definition of done

| # | Requirement / check | Result | Evidence / limitation |
| ---: | --- | --- | --- |
| 1 | Math gates score supported time-arithmetic representations correctly. | Not run | |
| 2 | Touch controls work on target iPad/iPhone sizes claimed by the release. | Not run | |
| 3 | Keyboard controls work where claimed. | Not run | |
| 4 | Bosses and stages remain completable under the intended difficulty. | Not run | |
| 5 | Text is crisp on actual target displays. | Not run | |
| 6 | Progress/save/replay/DEV boundaries work as documented. | Not run | |
| 7 | GitHub Actions or Pages deployment serves the intended version. | Not run | |

Allowed results: **Passed / Failed / Not run / Not applicable**. A "Passed" result requires an actual check against the identified candidate.

## 8. Known issues and migration notes

Preserve the existing detailed README content when replacing it with the migration-enhanced README in this pack. The new README below includes the current release information plus the canonical documentation links.

## 9. Handoff files

A substantive AI implementation task should retrieve or receive:

1. `AI-START-HERE.md`;
2. `UNIVERSAL-RULES.md`;
3. the relevant sections of `CONDITIONAL-STANDARDS.md`;
4. this project brief;
5. the exact current source artifact/commit;
6. the approved version-specific change specification;
7. applicable assets and deployment configuration.

Do not reconstruct the current implementation from a historical chat summary when the actual source should be available.

## 10. Ownership

**William McAda**  
**A WILLIAM MCADA PRODUCT**
