# WortWeg Documentation Index

This folder contains all the planning, testing, release, and architectural documentation for WortWeg. Use this index to navigate the project's operational guidelines and future roadmaps.

## 1. Release / APK Docs
Documentation regarding the immediate Alpha 0.7.1 build and release process.
- [alpha-0.7.1-main-release-gate-audit.md](alpha-0.7.1-main-release-gate-audit.md): Final checklist proving the `main` branch is safe and ready for the APK build.
- [apk-quota-reset-checklist.md](apk-quota-reset-checklist.md): Step-by-step instructions on what commands to run the moment the EAS quota resets.
- [alpha-0.7.1-release-notes.md](alpha-0.7.1-release-notes.md): Official release notes outlining features (Azure pronunciation) and limitations (no login).
- [alpha-0.7.1-tester-announcement.md](alpha-0.7.1-tester-announcement.md): Announcement text for tester communities.

## 2. Tester Workflow Docs
Materials for managing and interacting with our private Alpha testers.
- [private-alpha-test-plan.md](private-alpha-test-plan.md): The overarching strategy for the private Alpha testing phase.
- [private-alpha-feedback-questions.md](private-alpha-feedback-questions.md): Core questions to ask testers during interviews.
- [private-alpha-feedback-form-template.md](private-alpha-feedback-form-template.md): Copy-pasteable Google Forms structure (Turkish) for structured feedback.
- [private-alpha-tester-message-pack.md](private-alpha-tester-message-pack.md): Pre-written WhatsApp/Telegram onboarding and invitation messages.
- [alpha-bug-report-template.md](alpha-bug-report-template.md): Standardized format for testers to report crashes or UI issues.
- [alpha-triage-workflow.md](alpha-triage-workflow.md): Team guide on how to classify bugs by severity and which branches to patch them on.

## 3. Branch / Merge Safety Docs
Critical guidelines to prevent accidental merges and protect the `main` branch.
- [branch-and-release-plan.md](branch-and-release-plan.md): High-level map of which branches belong to 0.7.1 versus future 0.8.0.
- [current-branch-inventory.md](current-branch-inventory.md): A snapshot of all active branches, identifying their purpose and expected content counts.
- [do-not-touch-main-checklist.md](do-not-touch-main-checklist.md): The absolute rules for what can and cannot be merged into `main` during a freeze.
- [pull-request-description-drafts.md](pull-request-description-drafts.md): Pre-written GitHub PR templates to ensure safe and clear code reviews.

## 4. Alpha 0.8 Content Docs
Documentation covering the massive 84-lesson expansion pack planned for the next release.
- [a1-c2-exam-content-roadmap.md](a1-c2-exam-content-roadmap.md): The thematic structure of the upcoming A1 to C2 and exam-prep lessons.
- [a1-c2-content-quality-audit.md](a1-c2-content-quality-audit.md): Review of the pedagogical quality, Turkish explanations, and natural German phrasing.
- [alpha-0.8-content-integration-audit.md](alpha-0.8-content-integration-audit.md): Final verification of the 84-lesson merge, ensuring no duplicate IDs.
- [alpha-0.8-release-plan.md](alpha-0.8-release-plan.md): The rollout strategy for the 0.8.0 update after 0.7.1 is tested.

## 5. Exam-Prep Docs
Specific documentation for the unofficial test-preparation modules.
- [exam-prep-foundation.md](exam-prep-foundation.md): Overview of the TestDaF/Goethe style academic and professional writing modules.
- [exam-prep-legal-quality-audit.md](exam-prep-legal-quality-audit.md): Verification that no official logos, trademarks, or copyrighted materials were used.

## 6. Database / Sync Docs
The complete architectural blueprint for safely implementing backend data synchronization in the future.
- [database-sync-implementation-plan.md](database-sync-implementation-plan.md): High-level strategy for moving from local-only to cloud-synced progress.
- [local-progress-storage-audit.md](local-progress-storage-audit.md): Deep dive into exactly what `AsyncStorage` currently holds.
- [anonymous-progress-sync-contract.md](anonymous-progress-sync-contract.md): Strict definitions of what data is permitted to sync (and what is forbidden).
- [database-schema-and-api-contract.md](database-schema-and-api-contract.md): Pseudo-SQL and Zod validation rules for the future backend.
- [anonymous-id-and-migration-plan.md](anonymous-id-and-migration-plan.md): How to generate a safe device UUID without requiring a user login.
- [database-implementation-readiness-checklist.md](database-implementation-readiness-checklist.md): The exact chronological order in which to build the sync features.
- [database-sync-implementation-prompts.md](database-sync-implementation-prompts.md): Phase-by-phase implementation instructions for the development team.

## 7. Navigation / UI Planning Docs
Roadmaps for restructuring the app to handle the massive content increase.
- [alpha-0.8-lesson-navigation-plan.md](alpha-0.8-lesson-navigation-plan.md): Strategy for replacing the linear list with categorized hubs and level filters.
- [alpha-0.8-lesson-navigation-implementation-prompts.md](alpha-0.8-lesson-navigation-implementation-prompts.md): Step-by-step instructions for safely building the new UI filters and search functionality.

## 8. Store / Privacy Docs
Drafts for our eventual public release on the Google Play Store and App Store.
- [privacy-policy-draft.md](privacy-policy-draft.md): Draft explaining our anonymous data collection and minimal backend footprint.
- [play-store-listing-draft.md](play-store-listing-draft.md): Store descriptions, screenshots plans, and feature lists.
- [data-handling-notes.md](data-handling-notes.md): Internal guidelines on data retention and GDPR compliance.

---

## 9. Golden Rules
Before making any changes to the project, remember these immutable rules:
1. **`main` stays frozen** for the Alpha 0.7.1 APK. Only critical crash fixes are allowed.
2. **Build from `main` only** the absolute moment the EAS quota resets.
3. **Do not merge Alpha 0.8 content** (the 84 lessons) until the 0.7.1 tester feedback is fully collected and digested.
4. **Database, login, and payment** are strictly deferred to later phases. Do not build them now.
5. **No raw audio, chat history, or free-text answers** will ever be synced to the backend to protect user privacy.
