# WortWeg Private Alpha Test Plan (v0.7.1)

Welcome to the WortWeg Private Alpha! We greatly appreciate your help in testing the app before our wider release. 

## 1. Installation Instructions
*(Placeholder for EAS APK installation instructions or testing track link once quota allows the build to be generated.)*
- Download the `.apk` file using the link provided.
- If prompted, allow your browser to "Install from unknown sources".
- Open the installed WortWeg app.

## 2. What to Test
Your main goal is to test the core features of the app, focusing heavily on the new AI speaking practice and Azure-based pronunciation feedback. We want to know if the app feels natural, if the feedback is accurate, and if there are any blocking bugs.

### 2.1. Microphone Permission Checklist
- [ ] On first launch/use of a speaking exercise, does the app ask for microphone permission natively?
- [ ] Deny the permission once. Does the app show a clear message ("Konuşma pratiği için mikrofon izni vermelisin")?
- [ ] Try to request permission again through the app button and grant it. Does the app correctly recognize the permission and allow recording?
- [ ] Deny the permission permanently (if applicable on your Android version). Does the app instruct you to go to phone settings?
- [ ] Put the app in the background, go to phone settings, grant microphone permission, and return to the app. Does the app immediately recognize the permission without requiring a restart?

### 2.2. Speaking Practice Checklist
- [ ] Start a speaking exercise. Hold the microphone button. Does it pulse/animate while recording?
- [ ] Read the German sentence aloud. Release the button. Does it transition to an "analyzing" state?
- [ ] If you release the button too quickly (under a second), does it tell you to record longer?
- [ ] Hold the button and swipe left to cancel the recording. Does it cancel successfully without sending data to the server?
- [ ] While recording, press the Home button to put the app in the background, then return to it. Does the app gracefully cancel the recording instead of getting stuck?

### 2.3. Azure Pronunciation Feedback Checklist
- [ ] After recording a successful sentence, does the app return a score (e.g., "Çok yakın!", "Neredeyse oldu")?
- [ ] Does the screen display a percentage similarity/accuracy score?
- [ ] Are mispronounced words highlighted or pointed out in the feedback UI?
- [ ] Deliberately mispronounce a word or two in a sentence. Does the Azure system accurately detect the mispronounced words and reflect that in your score?
- [ ] Does the app gracefully handle situations with background noise? (e.g., "Sesini duyamadık" or "Mikrofona biraz daha yakın konuşup tekrar dene".)

### 2.4. Lesson Content Checklist
- [ ] Navigate through the main path (A1/A2 lessons) and the preview B1/B2/C1/C2 packs.
- [ ] Check if Turkish translations and grammar explanations are clear and typo-free.
- [ ] Try different types of exercises (multiple choice, fill-in-the-blank, word-building). Do they work correctly?

## 3. Crash and Bug Reporting Format
If you encounter a bug, freeze, or crash, please report it to us using the following format:

**Device Model:** (e.g., Samsung Galaxy S21)
**Android Version:** (e.g., Android 13)
**Steps to Reproduce:**
1. Open the app
2. Go to Lesson X
3. Do Y
**Expected Behavior:** (What should have happened)
**Actual Behavior:** (What actually happened)
**Screenshots/Video:** (Attach if possible)
