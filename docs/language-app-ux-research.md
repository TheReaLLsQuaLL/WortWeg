# WortWeg Language App UX Research Notes

Purpose: extract high-level UX principles from public screenshots, App Store / Google Play listings, and official pages. This file is not a visual spec and must not be used to copy layouts, wording, colors, mascots, icons, or proprietary flows.

## Sources Inspected

| App | Source inspected | Main UI pattern observed | What WortWeg can learn | What WortWeg must not copy | Concrete WortWeg idea |
| --- | --- | --- | --- | --- | --- |
| Duolingo | App Store listing: https://apps.apple.com/us/app/duolingo-language-lessons/id570060128 and Google Play listing: https://play.google.com/store/apps/details?id=com.duolingo | Short lessons, progress motivation, single next action, onboarding asks motivation and level/placement. | Keep first-run decisions short and make the next lesson obvious. | Do not copy green palette, owl behavior, copy tone, character system, or exact path layout. | Keep Wolli as a calm purple guide and show one dominant Home CTA: Bugünkü adım. |
| Babbel | App Store listing: https://apps.apple.com/us/app/babbel-language-learning/id829587759 and Google Play listing: https://play.google.com/store/apps/details?id=com.babbel.mobile.android.en | Practical lessons, real-life goals, short sessions, contextual grammar, listen/speak/write practice. | Make onboarding goal-based and keep lesson goals practical. | Do not copy Babbel cards, lesson copy, subscription framing, or orange branding. | Keep Turkish grammar micro-notes inside WortWeg lessons and short practical speaking prompts. |
| Busuu | Official page: https://www.busuu.com/en-US | Real-life language, A1-C1 framing, progress tracking, community/feedback positioning. | Keep CEFR level awareness visible but not heavy. | Do not copy community claims, badges, layout, or wording. | Plan-ready screen shows start level, target level, daily time only. |
| Memrise | Official page: https://www.memrise.com/ and App Store listing: https://apps.apple.com/us/app/memrise-learn-languages/id635966718 | Real-life phrases and confidence from hearing authentic language. | Speaking practice should feel like using real phrases, not a technical recorder. | Do not copy video-native layout, memory metaphors, or brand colors. | Speaking screen centers one German sentence and one hold-to-speak microphone. |
| Rosetta Stone | App Store listing: https://apps.apple.com/us/app/rosetta-stone-learn-languages/id435588892 | Immersive listening/speaking confidence and simple focused exercises. | Speaking UI should feel calm and focused. | Do not copy immersion claims, image-choice exercises, or brand styling. | Speaking result uses sentence comparison without overexplaining technical scoring. |
| Drops | Official page: https://languagedrops.com/ and App Store listing: https://apps.apple.com/us/app/drops-language-learning-games/id939540371 | Visual vocabulary, short sessions, compact cards, playful but minimal interactions. | Keep option cards visually clear and small enough for phone screens. | Do not copy Drops illustrations, gestures, palette, or word-card layout. | Onboarding uses 4-6 compact option cards and one bottom CTA. |
| Pimsleur | App Store listing: https://apps.apple.com/us/app/pimsleur-learn-language-fast/id1405735469 and official site: https://www.pimsleur.com/ | Audio-first confidence, listening/speaking from day one. | Press-and-hold speaking should feel like a natural speaking habit. | Do not copy audio course structure or brand voice. | Wolli prompts users to speak one useful A1 sentence after lessons. |
| LingoDeer | App Store listing: https://apps.apple.com/us/app/lingodeer-learn-languages/id1261193709 | Structured lessons, alphabet-to-conversation progression, grammar clarity. | Preserve CEFR roadmap and German grammar sequence. | Do not copy deer mascot, lesson map, or grammar screen wording. | Keep Turkish-first der/die/das and verb-second notes in lessons. |
| Mondly | App Store listing: https://apps.apple.com/us/app/mondly-learn-languages/id987873536 | Voice recognition, chatbot/speaking practice, bright beginner-friendly phrase work. | Speaking feedback should be clear and lenient for beginners. | Do not copy chatbot UI, color treatment, or phrase examples. | Use simple result states: Çok yakın, Neredeyse oldu, Tekrar deneyelim. |
| Mango Languages | Official page: https://mangolanguages.com | Conversation-based learning, pronunciation/culture/comprehension as integrated skills. | Connect grammar and pronunciation to practical conversation. | Do not copy Mango color-coded translation system or institutional positioning. | Keep article colors as WortWeg own der/die/das system for Turkish learners. |

## Onboarding animation and first-session patterns

| App | Principle observed | What WortWeg can learn | What WortWeg must not copy | Concrete WortWeg implementation idea |
| --- | --- | --- | --- | --- |
| Duolingo | Public listings emphasize personalization, motivation, level segmentation, friendly guidance, and gradual engagement before deeper commitment. | Ask only the minimum setup questions and make progress visible. Add one tiny learning moment so onboarding does not feel like a form. | Do not copy the green palette, owl behavior, exact path shape, copy tone, streak pressure, or mascot animation style. | Wolli appears briefly, asks goal/level, then introduces one der/die/das mini moment in WortWeg purple. |
| Babbel | Public screenshots and pages present practical language goals, clean step-by-step setup, and speech confidence as useful outcomes. | Keep onboarding mature, practical, and focused on why the user wants German. | Do not copy Babbel lesson cards, orange/white visual identity, subscription framing, or exact speech screens. | Goal cards stay short: Sınav, Günlük yaşam, İş, Seyahat, Aile, Okul. |
| Busuu | Public pages emphasize placement, CEFR awareness, progress tracking, and a study-plan feeling. | Placement should feel optional but valuable, and the final plan should show start level, target level, and daily time clearly. | Do not copy Busuu community positioning, badges, layout, or wording. | Add a concise placement choice, then a small animated roadmap reveal. |
| Memrise | Public pages emphasize real-life phrases and confidence through interactive language exposure. | Demonstrate actual German quickly instead of explaining features abstractly. | Do not copy video-first layouts, memory metaphors, or brand colors. | The mini demo shows real beginner words: der Apfel, die Schule, das Haus. |
| Drops | Public screenshots emphasize visual-first micro-interactions and short-session energy. | Use compact visual cards, gentle entrance animation, and minimal text. | Do not copy Drops gestures, illustrations, word-card layouts, or bright palette. | Option cards stagger in, selected cards gently scale, and the daily-time card fills a small meter. |
| LingoDeer | Public listings emphasize structured progression and grammar clarity. | Give a tiny grammar signal early, but keep it concise and beginner-safe. | Do not copy deer mascot, lesson map, grammar screen wording, or layout. | The article demo explains that der/die/das are learned with color + pattern, not long rules. |
| Mondly | Public listings emphasize conversation, chat/speaking practice, and a path-like language journey. | Show that the app leads into speaking and daily practice, not only quizzes. | Do not copy chatbot UI, exact conversational screens, or visual treatment. | Final reveal includes nodes for first lesson, vocabulary review, and speaking practice. |
| Mango Languages | Public pages emphasize real-world conversation and real voices. | Keep onboarding tied to practical speech and understanding. | Do not copy Mango's institutional positioning, color-coded translation method, or wording. | Use Turkish-first copy that connects German examples to practical learning. |

Onboarding direction from these patterns:

- Show value, do not only ask questions.
- Keep setup short and one-action-at-a-time.
- Add a single interactive learning demo before placement/daily planning.
- Use subtle motion: fade/slide, staggered cards, selected-card scale, Wolli bounce, roadmap reveal.
- Keep WortWeg original: purple identity, Wolli, Turkish explanations, German roadmap, and the der/die/das color system.

## WortWeg Design Direction

- One obvious next action: Home should answer "Bugün ne yapacağım?" first.
- Onboarding under one minute: one idea per screen, one headline, one helper, one primary action.
- Wolli as a calm guide: present but not chatty, not mascot-driven pressure.
- Turkish-first clarity: every explanation and result should be short Turkish, with German examples kept simple.
- CEFR confidence: keep A0/A1 visible and plan-based without turning Home into a dense dashboard.
- Speaking is a habit: press and hold, speak, release, see a simple result.
- Feedback is honest: current speaking score is target-sentence similarity, not real phonetic pronunciation scoring.
- Safe mobile UI: top safe area, bottom safe area, scrollable cards, no duplicate progress indicators.
- WortWeg identity: purple/lavender brand, Wolli, German roadmap, der/die/das colors, original Turkish learner focus.

## Implementation Notes For This Pass

- Keep OnboardingProgressHeader as the only onboarding progress indicator.
- Use press-and-hold microphone in SpeakingPracticeScreen.
- Show animated analysis state: "Dinliyorum..." and "Cümleni karşılaştırıyoruz.".
- Simplify result screen to one closeness score, sentence cards, missing/extra chips, and one feedback sentence.
- Add iOS screenshot requests for onboarding and speaking states to alpha checklist.
