# WortWeg Alpha 0.8 Release Plan

## 1. Release Target
- **Suggested Version:** `0.8.0-alpha`
- **Timing:** This release should happen strictly *after* Alpha 0.7.1 APK testing is complete.
- **Rule:** Do *not* merge this content into `main` before the 0.7.1 tester feedback is collected and finalized.

## 2. Planned Content
The 0.8.0-alpha release will feature a massive expansion of the curriculum:
- A1 foundation pack
- A2 daily-life pack
- B1 preview content
- B1/B2 bridge pack
- B2 practical communication pack
- C1 advanced communication pack
- C2 advanced nuance pack
- Exam-prep foundation pack

## 3. Expected Totals
- **84 lessons**
- **672 exercises**
- **672 vocabulary items**

## 4. Why Alpha 0.8 is Bigger than Alpha 0.7.1
- **Alpha 0.7.1:** Focused strictly on core technical functionality (Azure pronunciation feedback, microphone permission state fixes, and core speaking QA).
- **Alpha 0.8:** Focuses heavily on content scale, learning continuity across all CEFR levels, and introducing the exam-prep foundation.

## 5. Merge Plan
Once Alpha 0.7.1 APK testing is finished:
1. Start from the `main` branch.
2. Merge the `feature/alpha-0.8-content-integration` branch into `main`.
3. Resolve any conflicts, if they exist.
4. Run full quality checks (`npm run quality`, `npm run content:qa`, `npm run typecheck`).
5. Only bump version metadata when the merge is clean and verified.

## 6. Version Bump Checklist
When ready to release, update the following files:
- [ ] `package.json`: Update `"version"` to `"0.8.0"`
- [ ] `app.json`: Update `expo.version` to `"0.8.0"`
- [ ] `app.json`: Update `expo.android.versionCode` to `8`
- [ ] `src/constants.ts`: Update `APP_VERSION` to `'0.8.0-alpha'`

## 7. QA Checklist
Before building the APK, verify:
- [ ] `npm run content:qa` outputs exactly **84 / 672 / 672**.
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run server:check` passes with zero errors.
- [ ] The app opens successfully on a device/simulator.
- [ ] All lessons load properly.
- [ ] New CEFR levels appear correctly in the UI.
- [ ] The B1/B2 bridge lessons appear in logical order.
- [ ] Exam-style lessons remain legally safe and unofficial.
- [ ] Speaking practice (Azure STT/Scoring) still works.
- [ ] AI teacher (Gemini/OpenAI) still works.

## 8. Risks
- **Content Overload:** Too much new content in one release might overwhelm testers or hide smaller bugs.
- **C2 Quality:** Advanced nuance requires real-user feedback to verify natural phrasing.
- **Legal Vigilance:** Exam-style wording must strictly remain unofficial in future updates.
- **Synonym Tolerance:** Advanced accepted-answer variants may still need further expansion based on what testers type.
- **UI Scalability:** The current UI may eventually require filtering/search capabilities because scrolling through 84 lessons is cumbersome.

## 9. What is NOT Included
- Database synchronization (Firebase/Supabase)
- User login / Authentication
- Payment / Subscription systems
- A full premium paywall lock system
- A full, graded official exam simulator
- Play Store public launch

## 10. Final Recommendation
- **Keep Alpha 0.7.1 small:** Build it, test the critical Azure features, and gather initial feedback.
- **Use Alpha 0.8.0 for the big content expansion:** Roll out the 84-lesson curriculum only *after* confirming the core mechanics are stable.
