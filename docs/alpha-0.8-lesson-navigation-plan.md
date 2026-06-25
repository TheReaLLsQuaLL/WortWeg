# WortWeg Alpha 0.8 Lesson Navigation & Discovery Plan

## 1. Why this is needed
- **Scale:** Alpha 0.7.1 features 40 lessons, but Alpha 0.8 will leap to 84 lessons.
- **Cognitive Load:** Scrolling through 84 lessons linearly in a single list is overwhelming.
- **Discovery:** Users need an easier way to filter by their proficiency level, find relevant themes, and specifically discover the new exam-style practice modules.

## 2. Current Expected Content Groups
The 84 lessons are structured across several distinct content groups:
1. A0 / A1 / A2 main path
2. B1 preview
3. B1/B2 bridge
4. B2 practical communication
5. C1 advanced communication
6. C2 advanced nuance
7. Exam-style foundation

## 3. Recommended Navigation Model
To break up the massive lesson list, the UI should pivot towards a categorized hub structure:
- **Level Tabs/Filters:** A top tab bar or dropdown letting users quickly jump between A0, A1, A2, B1, B2, C1, C2, and Exam-style.
- **“Continue learning” section:** A prominent header card returning the user to their last active lesson.
- **“Recommended next” section:** A dynamic carousel suggesting the next logical lesson based on their profile and completion history.
- **“Exam-style practice” section:** A dedicated hub for test-prep so it doesn't get buried or confuse standard path learners.
- **“Weak points practice” section:** A shortcut to spaced repetition review cards.

## 4. Search & Filter Ideas
- **Filter by CEFR level:** Instantly isolate A1 vs C1.
- **Filter by theme:** E.g., Daily Life, Travel, Business/Work, Academic.
- **Filter by status:** "Not completed" vs "Completed" (for review).
- **Filter by focus:** Focus on Speaking vs Writing vs Vocabulary.
- **Text Search:** A search bar allowing queries by Turkish or German title.

## 5. Premium-Ready Structure (Without Payment Yet)
- **Mark future premium candidates in docs only:** Note which groups are high-value (B2, C1, C2, Exam-style, unlimited Azure pronunciation).
- **No locks yet:** Do not implement paywalls, locks, or hidden content states for Alpha 0.8 testers.
- **Visibility:** Allow all testers to experience the full 84-lesson scale freely to gather maximum QA feedback.

## 6. UX Risks
- **Overwhelming scroll:** Displaying 84 lessons on one screen might cause performance or navigation fatigue.
- **Intimidation:** Showing C2 advanced nuance to an A1 beginner might discourage them.
- **Exam confusion:** Mixing TestDaF-style academic graphs with basic A1 introductions could confuse the learner's journey.
- **Lost users:** Without a clear "Recommended Next" button, users might not know what to click after finishing a lesson.

## 7. Implementation Phases
- **Phase 1 (Current):** Documentation only.
- **Phase 2:** Simple level filters (A1, A2, B1, etc.) on the lesson list screen.
- **Phase 3:** "Recommended next lesson" logic at the top of the home screen.
- **Phase 4:** Search bar and advanced thematic filters.
- **Phase 5:** Premium grouping and UI locks (Later beta/1.0 phase).

## 8. QA Plan
Before the UI changes are merged, verify the following:
- [ ] All 84 lessons appear and none are accidentally hidden by faulty filters.
- [ ] The core A0/A1/A2 main path still functions smoothly.
- [ ] The B1/B2 bridge sequence appears logically before the core B2 pack.
- [ ] Exam-style lessons are clearly marked as unofficial practice.
- [ ] Completed lessons are correctly flagged in the new categorized UI.
