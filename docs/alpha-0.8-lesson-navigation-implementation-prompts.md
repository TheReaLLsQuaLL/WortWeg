# WortWeg Alpha 0.8 Lesson Navigation Implementation Prompts

## Phase 1 — Inspect current lesson list UI

**Context:** Before we restructure the app's navigation to support 84 lessons, we must deeply understand how the current UI components map data to the screen. The goal is investigation only.

**Files to inspect:**
- `src/screens/HomeScreen.tsx` (or equivalent main list screen)
- `src/components/LessonCard.tsx` (or equivalent components)
- `src/data/lessons.ts`

**Strict rules:**
- Identify how the lessons are currently grouped and displayed.
- Do NOT make any behavior or UI changes yet.
- Note any hardcoded limitations.

**Testing commands:**
- `grep -R "LessonCard" src/`
- `npm run typecheck`

**Report format:**
- List the main UI files responsible for rendering the lesson list.
- Explain the current mapping logic.

**Rollback notes:**
- None required (no code changes).

---

## Phase 2 — Add level filters

**Context:** The current linear list will be overwhelming with 84 lessons. We need to introduce basic level filtering (A0 to C2 + Exam-style) so users can jump to their relevant proficiency tier.

**Files to inspect:**
- Main lesson list screen (e.g., `src/screens/HomeScreen.tsx`)
- Navigation/Header components

**Strict rules:**
- Implement tabs or a filter dropdown for A0, A1, A2, B1, B2, C1, C2, Exam-style.
- Preserve all 84 lessons; do not accidentally delete or hide content permanently.
- No premium locks or paywalls implemented yet.
- Do not bump the version metadata.

**Testing commands:**
- `npm run typecheck`
- `npm run quality`

**Report format:**
- Which UI elements were added.
- How the filter state is managed.
- Confirmation that no lessons are lost.

**Rollback notes:**
- If the filters break the list rendering, revert the component changes to restore the standard flat list.

---

## Phase 3 — Add “Continue learning” and “Recommended next”

**Context:** Users need a fast track back into their learning journey without hunting through the filtered tabs. We will add a dynamic "Recommended next" card at the top of the UI.

**Files to inspect:**
- Main lesson list screen
- `src/lib/storage.ts` or relevant context/store hooks

**Strict rules:**
- Derive the next lesson solely from existing local progress (`AsyncStorage`).
- Do NOT add any new database dependencies.
- Must remain strictly offline-first.

**Testing commands:**
- `npm run typecheck`
- `npm run quality`

**Report format:**
- The logic used to calculate the "Recommended next" lesson.
- UI files modified.

**Rollback notes:**
- If the recommendation logic crashes due to edge cases (e.g., all lessons completed), revert and handle the null state.

---

## Phase 4 — Add exam-style section

**Context:** The new Exam-style foundation pack must be easily discoverable but structurally separated so standard path learners aren't confused.

**Files to inspect:**
- Main lesson list screen / Navigation config
- `src/data/lessons.exam.ts`

**Strict rules:**
- Use clearly unofficial wording (e.g., "Exam-style Practice", "TestDaF-style").
- Absolutely NO official logos (Goethe, telc, etc.).
- NO partnership claims.

**Testing commands:**
- `npm run typecheck`
- `npm run content:qa`

**Report format:**
- Where the exam section is placed in the UI.
- The exact phrasing used for the headers.

**Rollback notes:**
- If the phrasing accidentally violates trademark rules, revert immediately to safe placeholders.

---

## Phase 5 — Add search/filter

**Context:** As content scales, power users need text-based search and advanced toggle filters to find specific topics (like "opinions" or "verbs").

**Files to inspect:**
- Main lesson list screen
- UI input components

**Strict rules:**
- Implement a search bar capable of searching by Turkish title OR German title.
- Add toggle filters for "Completed" / "Not Completed".
- Rely on built-in React Native components (`TextInput`); avoid adding heavy third-party search dependencies if possible.

**Testing commands:**
- `npm run typecheck`
- `npm run quality`

**Report format:**
- How the search string filters the lesson array.
- Proof that both German and Turkish queries work.

**Rollback notes:**
- If text input causes severe re-render lag, revert and explore debounce optimization later.

---

## Phase 6 — QA and regression testing

**Context:** After a massive UI overhaul, we must ensure nothing broke the core functionality of the app or hid critical data.

**Files to inspect:**
- The entire app flow.

**Strict rules:**
- Verify all 84 lessons are reachable through the UI.
- Verify the core A0/A1/A2 main path still loads perfectly.
- Verify the B1/B2 bridge appears in the correct logical order.
- Verify exam-style content is placed safely.
- Run a speaking exercise and AI teacher chat to ensure the lesson payload is still passing correctly from the UI to the game screens.

**Testing commands:**
- `npm run content:qa`
- `npm run typecheck`
- `npm run quality`

**Report format:**
- Final pass/fail status for the 5 key verification rules.
- Any UI bugs found and fixed.

**Rollback notes:**
- If a lesson fails to load from the new UI layout, investigate the route parameters passing the `lessonId`.
