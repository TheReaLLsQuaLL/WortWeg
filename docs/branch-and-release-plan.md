# WortWeg Branch & Release Plan

This document maps out the current branches prepared during the EAS build quota block and establishes a safe, organized merge path for future releases.

## 1. Current Main Branch Purpose
The `main` branch is frozen specifically for the **next APK build** (Alpha 0.7.1). It must remain highly stable.
- **Expected Version:** `0.7.1-alpha`
- **Expected Content:** 40 lessons / 320 exercises / 320 vocabulary
- **Included Fixes:** 
  - Microphone permission resume fix (AppState integration)
  - Speech temp upload cleanup safety fix
- **Explicitly Excluded:** 
  - **NO** A1–C2 expansion yet
  - **NO** exam-prep foundation yet
  - **NO** database, payment, or login implementations

## 2. Next APK Branch
- **Branch:** `main`
- **Release Target:** Alpha 0.7.1
- **Build Command Placeholder:** `npx eas-cli build --platform android --profile preview --clear-cache`
- **QA:** Refer to `docs/apk-quota-reset-checklist.md` for the exact QA sequence.

## 3. Future Content Branch
- **Branch:** `feature/a1-c2-content-expansion`
- **Target Release:** Likely `0.8.0-alpha`
- **Content Totals:** 76 lessons / 608 exercises / 608 vocabulary
- **Scope:** Includes massive structural curriculum additions spanning A1, A2, B2, C1, and C2. Will profoundly alter the learning path depth.

## 4. Future Exam Branch
- **Branch:** `feature/exam-prep-foundation`
- **Target Release:** To be merged *after* the `a1-c2-content-expansion` review.
- **Scope:** Includes exam-style documentation and 4 original exam-style practice lessons. 
- **Constraint:** Must remain completely legally safe. We use terms like "Goethe-style practice" and "telc-style practice" without claiming any official partnerships or using official logos.

## 5. Docs Branches
Any branches prefixed with `docs/` or containing solely markdown additions (like this one) are safe, documentation-only branches. They do not alter app code, dependencies, or backend behavior and can be merged into `main` before the APK build, provided they do not contain code leaks.

## 6. Database Planning Branch
- **Branch:** `feature/alpha-0.8-database-foundation`
- **Scope:** Currently planning only. Outlines schema, local vs. cloud split, and anonymous user ID strategies.
- **Constraint:** Do not merge into `main` until *after* the Alpha 0.7.1 APK has been successfully tested by users.

## 7. Recommended Merge Order
To ensure absolute stability, please follow this strict merge and release sequence:
1. **Build and Test:** Build the Alpha 0.7.1 APK straight from the current `main`.
2. **QA & Triage:** Distribute to private alpha testers and fix any critical bugs directly on `main` (producing 0.7.1.x patches if needed).
3. **Decide Next Target:** Decide whether the subsequent release is a minor patch (`0.7.2-alpha`) or the massive content leap (`0.8.0-alpha`).
4. **Merge Expansion:** Review and merge `feature/a1-c2-content-expansion`.
5. **Merge Exams:** Review and merge `feature/exam-prep-foundation`.
6. **Backend Evolution:** Begin implementing and merging database/login mechanics.
7. **Monetization:** Payment implementation (RevenueCat/Stripe) comes much later, strictly after the backend is robust.

## 8. Dangerous Merges to Avoid
- 🚨 **DO NOT** merge all content into `main` before successfully testing the 0.7.1 APK in the wild.
- 🚨 **DO NOT** add payment or financial SDKs.
- 🚨 **DO NOT** merge the database infrastructure into `main` before 0.7.1 testing concludes.
- 🚨 **DO NOT** add new native dependencies until the current build quota resets and a baseline APK is proven stable.
