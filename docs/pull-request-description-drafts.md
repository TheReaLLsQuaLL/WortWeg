# WortWeg Pull Request Description Drafts

These PR descriptions are pre-written to ensure smooth code review and merging once the Alpha 0.7.1 APK is tested.

---

## 1. Alpha 0.7.1 Release-Safe Main Fixes

**Target Branch:** `main` (Already contains these fixes)

**Summary:**
This PR finalizes the `main` branch for the Alpha 0.7.1 APK build. It includes critical bug fixes and required release-gate documentation. No massive content expansions are included here.

**What changed:**
- Fixed Android microphone permission resume bug (so users aren't locked out of speaking exercises).
- Fixed the speech temp upload file cleanup for Azure scoring (prevents storage bloat).
- Added `docs/apk-quota-reset-checklist.md` and `docs/alpha-0.7.1-main-release-gate-audit.md`.

**What did NOT change:**
- Application logic and lesson schemas remain intact.
- NO future Alpha 0.8 content was merged.

**Testing performed:**
- `npm run quality` passing.
- Manual Android permission toggle testing.

**Merge timing recommendation:**
- **ALREADY ON MAIN.** This is the frozen state awaiting the EAS quota reset.

**Risk level:** 
- Low.

---

## 2. Alpha 0.8 Content Integration

**Branch:** `feature/alpha-0.8-content-integration`
**Target:** `main`

> ⚠️ **DO NOT MERGE YET:** Must wait until Alpha 0.7.1 APK testing is fully completed!

**Summary:**
This massive PR introduces the next phase of WortWeg content. It integrates the A1–C2 expansion pack and the new exam-style foundation, ballooning the app to 84 lessons. This will serve as the core data layer for the upcoming `0.8.0-alpha` release.

**What changed:**
- Integrated A1, A2, B1, B1/B2 bridge, B2, C1, and C2 lesson packs.
- Integrated the legally safe exam-prep foundation pack.
- Total counts increased to exactly: **84 lessons**, **672 exercises**, **672 vocabulary items**.

**What did NOT change:**
- The React Native UI and navigation components (they still render a linear list, which will be addressed in a future PR).
- Core speaking/scoring logic.

**Testing performed:**
- Content audits passed: A1-C2 quality and exam legal safety verified.
- `npm run content:qa` passing with expected 84/672/672 targets.

**Merge timing recommendation:**
- **HOLD.** Merge only after 0.7.1 tester feedback is digested.

**Risk level:** 
- High (massive data change).

---

## 3. Database Planning Docs

**Branch:** `docs/alpha-0.8-database-sync-plan`
**Target:** `main`

**Summary:**
This PR introduces the complete architectural plan for our upcoming anonymous progress sync. It establishes the rigid boundaries required to safely back up tester progress without compromising privacy.

**What changed:**
- Added `docs/database-sync-implementation-plan.md`.
- Added `docs/local-progress-storage-audit.md`.
- Added the `anonymous-progress-sync-contract.md` defining the explicit safe allowlist.
- Defined forbidden data (raw audio, chat history, free text).
- Added schema, API contract, anonymous ID migration plan, and readiness checklists.

**What did NOT change:**
- **Zero code was changed.** No database, API endpoints, or mobile sync logic has been implemented yet.

**Testing performed:**
- Documentation review. `npm run quality` untouched.

**Merge timing recommendation:**
- Can be merged at any time, as it contains only documentation.

**Risk level:** 
- None.

---

## 4. Navigation Planning Docs

**Branch:** `docs/alpha-0.8-database-sync-plan` (or equivalent docs branch)
**Target:** `main`

**Summary:**
This PR outlines the UI/UX roadmap for handling the upcoming 84-lesson scale. It details how we will break away from a single linear list to prevent user fatigue.

**What changed:**
- Added `docs/alpha-0.8-lesson-navigation-plan.md`.
- Added `docs/alpha-0.8-lesson-navigation-implementation-prompts.md`.
- Documented the need for level filters, a "Recommended next" section, and a separate exam-style hub.

**What did NOT change:**
- **Zero code was changed.** No UI components or navigation logic were refactored.

**Testing performed:**
- Documentation review.

**Merge timing recommendation:**
- Can be merged at any time (documentation only).

**Risk level:** 
- None.

---

## 5. Tester Workflow Docs

**Branch:** `docs/alpha-0.8-database-sync-plan` (or equivalent docs branch)
**Target:** `main`

**Summary:**
This PR provides the necessary operational materials for the team to manage our upcoming private Alpha test.

**What changed:**
- Added `docs/alpha-bug-report-template.md`.
- Added `docs/alpha-triage-workflow.md`.
- Added `docs/private-alpha-tester-message-pack.md` (WhatsApp/Telegram invites).
- Added `docs/private-alpha-feedback-form-template.md` (Google Forms structure).

**What did NOT change:**
- No application code or configuration.

**Testing performed:**
- Documentation review.

**Merge timing recommendation:**
- Merge immediately so the team can prepare the Google Forms and tester WhatsApp groups while waiting for the EAS quota.

**Risk level:** 
- None.
