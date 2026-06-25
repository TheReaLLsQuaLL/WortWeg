# WortWeg Exam-Prep Foundation

## 1. Exam-Prep Center Concept
The WortWeg Exam-Prep Center will be a dedicated section of the app designed to prepare users for official German proficiency exams. It will provide mock tasks, structured practice, and AI-driven feedback that simulate the experience and difficulty of the actual exams, specifically focusing on speaking and writing tasks.

## 2. Free vs Premium Split
- **Free Tier:** Users will have access to "exam-style foundation" lessons. These lessons introduce the format, vocabulary, and basic strategies required for exam tasks.
- **Premium Tier (Future):** Users will unlock full-length mock exams, unlimited AI evaluations for writing tasks, and advanced pronunciation scoring via Azure for speaking tasks. Premium users will also gain access to specific intensive modules (e.g., TestDaF-style academic graphs).

## 3. Safe Legal Wording
WortWeg is an independent learning platform and is **not affiliated with, endorsed by, or connected to** the Goethe-Institut, telc GmbH, ÖSD, or TestDaF-Institut. 
To avoid trademark and copyright infringement:
- We will NEVER use official logos.
- We will NEVER use the exact wording "Goethe Zertifikat", "telc Prüfung", etc. in a way that implies an official product.
- We will use legally safe wording such as:
  - "Goethe-style practice"
  - "telc-style communication tasks"
  - "ÖSD-style preparation"
  - "TestDaF-style academic study practice"
  - "Exam-style B1 Speaking"

## 4. Suggested Exam Modes
- **Goethe-style A1/B1/B2 speaking/writing practice:** Focus on describing pictures, planning an event with a partner, and writing formal/informal emails.
- **telc-style B1/B2/C1 communication practice:** Focus on problem-solving dialogues, expressing opinions on short texts, and formal complaint letters.
- **ÖSD-style B1/B2/C1 practice:** Focus on situation-based roleplays, reading comprehension strategies, and formal writing.
- **TestDaF-style academic speaking/writing practice:** Focus on describing graphs/charts, academic argumentation, and university-context speaking tasks.

## 5. What Not to Store or Copy
- **NEVER** copy texts, audio, images, or exact prompts from past or official practice exams.
- **NEVER** store proprietary scoring rubrics or exact grading scales.
- All content (reading texts, audio scripts, prompt scenarios) **must be 100% original**, created specifically for WortWeg by mimicking the *structure* and *format* of the exams without plagiarizing the content.

## 6. How Azure Pronunciation Helps Speaking Tasks
Azure's word-level pronunciation feedback (Alpha 0.7 feature) is critical for exam prep. It provides:
- Objective scoring on `pronunciationScore`, `fluencyScore`, `accuracyScore`, and `completenessScore`.
- Word-level highlighting (mispronunciations) so learners can identify exactly where they lose points in oral exams.
- The ability to practice long, continuous monologues (e.g., "Mündlicher Ausdruck") with immediate objective feedback.

## 7. How AI Teacher Helps Writing Feedback
The AI Teacher (Gemini/OpenAI) will be configured to evaluate user writing submissions based on exam-style criteria:
- **Task Fulfillment:** Did the user address all bullet points in the prompt?
- **Vocabulary/Grammar:** Is the language appropriate for the target CEFR level?
- **Cohesion/Structure:** Are connectors (weil, deshalb, einerseits) used correctly?
- The AI will not give an official "grade" but will provide constructive feedback and rewrite suggestions.

## 8. Future Payment Timing
Premium exam-prep content will remain locked until the payment infrastructure (e.g., RevenueCat, Stripe) is fully integrated and tested. Alpha and Beta phases will focus on testing the AI evaluation quality using the free "foundation" lessons.

## 9. Implementation Phases
- **Phase 1 (Current):** Foundation & Documentation. Add 4 free "exam-style" introductory lessons.
- **Phase 2:** UI/UX design for the Exam-Prep Center hub.
- **Phase 3:** Integration of AI Teacher specifically for long-form writing evaluation.
- **Phase 4:** Premium paywall integration and release of full mock exams.
