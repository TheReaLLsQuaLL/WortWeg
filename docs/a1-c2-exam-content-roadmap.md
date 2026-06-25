# WortWeg A1–C2 & Exam-Prep Roadmap

## 1. Full A1–C2 Course Structure

### A1 Target Skills
- Understand and use familiar everyday expressions and very basic phrases.
- Introduce oneself and others; ask and answer questions about personal details (where they live, people they know, things they have).
- Interact in a simple way provided the other person talks slowly and clearly.

### A2 Target Skills
- Understand sentences and frequently used expressions related to areas of most immediate relevance (e.g., shopping, local geography, employment).
- Communicate in simple and routine tasks requiring a simple and direct exchange of information.
- Describe in simple terms aspects of their background, immediate environment, and matters in areas of immediate need.

### B1 Target Skills
- Understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.
- Deal with most situations likely to arise whilst traveling in an area where the language is spoken.
- Produce simple connected text on topics which are familiar or of personal interest.

### B2 Target Skills
- Understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field.
- Interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain.
- Produce clear, detailed text on a wide range of subjects and explain a viewpoint.

### C1 Target Skills
- Understand a wide range of demanding, longer texts, and recognize implicit meaning.
- Express ideas fluently and spontaneously without much obvious searching for expressions.
- Use language flexibly and effectively for social, academic, and professional purposes.

### C2 Target Skills
- Can understand with ease virtually everything heard or read.
- Can summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation.
- Can express themselves spontaneously, very fluently, and precisely, differentiating finer shades of meaning even in more complex situations.

## 2. Recommended Lesson Counts Per Level
To ensure the course remains beginner-friendly and realistic, and to avoid overpromising high-end C2 quality too early:
- **A0 (Intro):** 4 Lessons (already partially exists)
- **A1:** ~40 Lessons
- **A2:** ~50 Lessons
- **B1:** ~60 Lessons
- **B2:** ~60 Lessons
- **C1:** ~40 Lessons
- **C2:** ~20 Lessons (Focused heavily on nuance and precision; shorter but much more difficult content)
*Total Planned: ~274 Lessons.*

## 3. Lesson Themes Per Level
- **A1:** Greetings, Family, Numbers, Shopping, Appointments, Weather, Daily Routines.
- **A2:** Daily routines, Travel, Housing (Wohnungssuche), Work basics, Health (Arzttermin), Hobbies.
- **B1:** Doctor visits, Apartment hunting, Workplace communication, Official authorities (Behörden), Expressing opinions, Future plans.
- **B2:** Debates, Work emails (formal communication), News comprehension, Resolving problems, Formal writing structures, Cultural differences.
- **C1:** Academic study, Complex arguments, Presentations, Technical topics, Politics/Economics.
- **C2:** Nuance and idioms, Literary or advanced texts, Professional precision, Regional dialects (light exposure).

## 4. Exercise Model Per Lesson
**Recommendation**: Retain the current highly-tested model.
- **8 Exercises per Lesson**
- **8 Vocabulary Items per Lesson**
*Reasoning*: The 8/8 structure is already heavily integrated into the `lessonFactory.ts` architecture, `content:qa` scripts, and the mobile UI experience. It provides a quick, satisfying learning loop without overwhelming mobile users. Advanced concepts in B2/C1/C2 can be spread across multiple lessons rather than creating massive individual lessons.

## 5. Exam-Prep Roadmap
We will create original practice plans mapped to popular exam formats.
- **Goethe (A1, B1, B2, C1, C2)**: Focus heavily on structured speaking tasks (Bildbeschreibungen - picture descriptions) and formal/informal letter/email writing.
- **telc (B1, B2, C1 Hochschule)**: Focus on specialized vocabulary, structured reading comprehension (Leseverstehen), and gap-fill tests (Sprachbausteine).
- **ÖSD (B1, B2, C1)**: Introduce Austrian variations subtly where applicable and mimic the exact structure of ÖSD listening and reading tasks.
- **TestDaF**: Focus strictly on study-readiness (University context). Heavy emphasis on graph/chart descriptions (Grafikbeschreibung) and academic argumentation.

## 6. Legal & Trademark Safety
To protect WortWeg from IP issues:
- **Never** copy official exam questions, past papers, or audio files.
- **Never** use official logos of the Goethe-Institut, telc, ÖSD, or TestDaF.
- **Never** claim an official partnership or endorsement.
- Use phrasing like "Exam-style Practice", "Goethe B1 Preparation Mode", or "Mock Tests for telc B2".
- **Disclaimer**: Add a permanent, visible disclaimer in the Exam-Prep section: *"Not affiliated with, endorsed by, or connected to Goethe-Institut, telc gGmbH, ÖSD, or TestDaF-Institut."*

## 7. Premium Content Proposal
**Free Tier:**
- Core A1, A2, and B1 lessons (ensures wide adoption and accessibility).
- Limited daily pronunciation checks.
- Basic progress tracking and vocabulary reviews.

**Premium Candidates (Future Paywall):**
- Advanced B2, C1, C2 lesson packs.
- **Exam-Prep Center** (Mock exams, structured guides).
- Unlimited Azure advanced pronunciation analysis.
- TestDaF writing/speaking simulator with AI feedback.
- Personalized, unlimited weak-word review.
- Unlimited AI Teacher practice sessions.

## 8. Implementation Phases
- **Phase 1:** Planning only (This Document).
- **Phase 2:** A1/A2 Content Packs (Fill out the remaining core A1/A2 lessons).
- **Phase 3:** B1/B2 Content Packs (Create the B1/B2 core).
- **Phase 4:** Exam-Prep Foundation (Build the UI and mock exams for B1/B2 levels).
- **Phase 5:** C1/C2 Advanced Content (Deploy academic/professional content).
- **Phase 6:** Premium/Paywall implementation (Add auth, Stripe/RevenueCat, and lock features).

## 9. Risk Analysis
- **Content Quality Risk**: High levels (C1/C2) require native-level nuance. AI-generated or hastily written content will frustrate advanced users.
- **Too Many Lessons Before Testing**: Massively increasing JSON size (to 200+ lessons) might impact app load time or RAM on older devices.
- **App Size/Performance**: More audio text and images could bloat the app.
- **QA Complexity**: Validating 274 lessons * 8 exercises requires a massive automated QA suite. The current `content:qa` script must be highly robust.
- **User Confusion**: If users see "Premium" locked content before we actually have a login or payment system, they will be confused or frustrated.

## 10. Main Recommendation
**Do NOT add all A1–C2 content before the next APK release.** 
- We must build and distribute Alpha 0.7.1 as a stable, lightweight test to validate the core UI, audio recording, and Azure integration on real Android hardware.
- Create phased Git branches for content expansion (e.g., `feature/content-a1-expansion`). 
- Validate the JSON scaling (load times) with ~80 lessons before committing to 270+. 
- Implement Exam-Prep UI and backend logic *after* establishing a solid user base and validating the core loop.
