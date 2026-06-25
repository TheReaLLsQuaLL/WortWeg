# WortWeg Current Branch Inventory & Status

## 1. Main branch
- **Purpose:** Alpha 0.7.1 APK release.
- **Expected version:** `0.7.1-alpha`
- **Expected content:** 40 lessons / 320 exercises / 320 vocabulary
- **Status:** Frozen. Quality checks pass correctly. Awaiting EAS build quota reset.

## 2. Alpha 0.8 content branch
- **Branch:** `feature/alpha-0.8-content-integration`
- **Expected content:** 84 lessons / 672 exercises / 672 vocabulary
- **Purpose:** Staging ground for the future `0.8.0-alpha` release.
- **Status:** Verified. Quality checks pass correctly. Do not merge until 0.7.1 APK is tested.

## 3. Exam-prep branch
- **Branch:** `feature/exam-prep-foundation`
- **Purpose:** Original exam-style practice foundation (TestDaF/Goethe style).
- **Rule:** Must stay legally unofficial (no logos, no partnership claims). Merged into the 0.8 content branch.

## 4. Database planning/docs branches
- **Branches:** `docs/alpha-0.8-database-sync-plan`
- **Docs created:**
  - `docs/database-sync-implementation-plan.md`
  - `docs/local-progress-storage-audit.md`
  - `docs/anonymous-progress-sync-contract.md`
  - `docs/database-schema-and-api-contract.md`
  - `docs/anonymous-id-and-migration-plan.md`
  - `docs/database-implementation-readiness-checklist.md`
  - `docs/database-sync-implementation-prompts.md`
- **Confirmation:** No database code, endpoints, or state changes have been implemented yet. Documentation only.

## 5. Navigation planning/docs
- **Branches:** Included in current planning docs.
- **Docs created:**
  - `docs/alpha-0.8-lesson-navigation-plan.md`
  - `docs/alpha-0.8-lesson-navigation-implementation-prompts.md`
- **Confirmation:** No UI components, navigation logic, or screen architectures have been implemented yet. Documentation only.

## 6. Build waiting state
- The Alpha 0.7.1 APK cannot be built until the Expo EAS build quota resets.
- When the quota resets, the build **must** be executed from the `main` branch only.

## 7. Dangerous actions to avoid
- **Do not merge** `feature/alpha-0.8-content-integration` into `main` before the 0.7.1 APK is tested by early users.
- **Do not implement** payment systems.
- **Do not implement** login or database logic on `main`.
- **Do not add** new native dependencies before the `eas build` successfully generates the 0.7.1 APK.
