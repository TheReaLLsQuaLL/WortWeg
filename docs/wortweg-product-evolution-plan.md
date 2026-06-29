# WortWeg Product Evolution Plan: Premium AI German Experience

This document outlines the strategic future for WortWeg (Alpha 0.8/0.9 and beyond), transforming it from a robust MVP into a deeply engaging, premium AI-powered German learning platform for Turkish speakers.

> ⚠️ **CRITICAL REMINDER:** Do not implement any of these features on `main` before the Alpha 0.7.1 APK is fully tested and approved.

## 1. Product Vision: The Learning Loop Redesign
WortWeg must feel less like a textbook and more like a personal German coach. The ideal daily loop:
1. **Open app** → Greeted personally by the AI/Mascot.
2. **Recommended next lesson** → Context-aware push towards the right difficulty.
3. **Short learning session** → Micro-learning bursts to keep cognitive load low.
4. **Instant feedback** → Granular pronunciation scoring and grammar corrections.
5. **Progress reward** → Immediate XP or streak visualization.
6. **AI encouragement** → Positive reinforcement.
7. **Daily return** → The user feels motivated to come back tomorrow.

## 2. Personal Learning Profile
We will prepare a structured architecture to track user metrics locally (initially offline) and anonymously via the backend later:
- Learning streak (daily consecutive usage)
- XP (Experience points earned)
- Completed lessons count
- Weak grammar areas tracking
- Pronunciation score history
- Vocabulary strength metrics
- Speaking confidence rating

**Data Safety Rule:** We will *never* sync raw audio, private chat conversations, free-text answers, or sensitive PII.

## 3. WortWeg Mascot & Character System
To build emotional connection, we will introduce a unique WortWeg character (e.g., "Wolli"). 
- **Personality:** A friendly, serious-but-encouraging language coach. Never shames the user.
- **Animation States:**
  - **Idle:** Blinking, breathing, subtle ambient movements.
  - **Correct Answer:** Small celebration, positive reaction, subtle reward flare.
  - **Speaking Practice:** Active listening pose, encouraging nods.
  - **Mistake:** Supportive, "try again" encouragement.

*Note: This must remain entirely original and distinct from competitors like Duolingo.*

## 4. Motivation & Reward System
Visible progress drives retention. We will implement:
- **XP Ecosystem:**
  - `+10` for a completed exercise
  - `+20` for a speaking challenge
  - `+50` for full lesson completion
- **Visual Feedback:** Animated XP counter ticks, progress bars filling up smoothly, and micro-celebrations upon completion.

## 5. Progress Visualization: The German Journey Map
We will replace the standard list view with a visually satisfying journey map:
- **Structure:** A vertical or winding path mapping A1 → A2 → B1 → B2 → C1 → C2.
- **Nodes:** Each level node will visually represent completed lessons, unlocked skills, speaking ability, and vocabulary milestones.

## 6. Speaking Practice Upgrade (The Hero Feature)
Speaking is WortWeg's killer feature. We will enhance the Azure-powered loop:
1. User speaks.
2. Speech recognition transcription.
3. Azure pronunciation analysis.
4. Word-level phoneme feedback (red/green highlighting).
5. AI explanation of how to shape the mouth/tongue (in Turkish).
6. Retry option.

*Future Addition:* Pronunciation improvement history ("Your 'R' pronunciation improved this week!") and confidence scoring.

## 7. AI Teacher Personality
The AI coach will evolve to:
- Remember local learning context.
- Adapt difficulty dynamically.
- Explain mistakes clearly in Turkish.
- Maintain a tone that is friendly and educational (not robotic, not childish).

## 8. Lesson Experience Upgrade
Moving away from a rigid "Question → Answer → Next" format to a dynamic flow:
- Warm-up
- Core Practice
- Challenge Mode
- Speaking Moment (Hero interaction)
- Review
- Reward/Summary

## 9. Premium Micro-Interactions
The app must feel incredibly polished:
- **Buttons:** Satisfying press animations (scale down slightly).
- **Cards:** Subtle parallax or hover/press movements.
- **Progress:** Animated completion rings.
- **Feedback:** Haptic feedback on success/failure states.
*(Must remain lightweight to perform well on lower-end Android devices).*

## 10. Premium Future Preparation
While payments will not be implemented yet, we will architect boundaries:
- **Free Tier:** A0–B1 core learning, basic speaking practice.
- **Premium Tier:** B2–C2 content, Exam preparation paths, unlimited advanced AI simulations, deep pronunciation analysis, and personalized learning plans.

## 11. Technical Strategy & Recommendations
- **Animation Frameworks:** `react-native-reanimated`, `lottie-react-native`, or `rive-react-native`.
- **Priorities:** Offline support, 60fps performance, compatibility with low-end Androids.
- **Avoid:** Heavy 3D models, massive unoptimized image assets, bloated dependencies.

## 12. Implementation Phases
- **Phase 1 (UX):** Core UI polish, button interactions, typography (No logic changes).
- **Phase 2 (Rewards):** XP system, progress bars, local streak tracking.
- **Phase 3 (Mascot):** Integrate Rive/Lottie character animations into the UI.
- **Phase 4 (AI Personalization):** Context-aware AI coach and pronunciation history tracking.
- **Phase 5 (Premium):** Gate content (B2/C2), introduce subscription logic.

> **Risk Assessment:** Introducing heavy animations can degrade Android performance. We must profile performance using `npm run quality` and device testing on each branch. 
> 
> **What MUST NOT be implemented before Alpha 0.7.1 testing:** Everything on this list. `main` is completely frozen.
