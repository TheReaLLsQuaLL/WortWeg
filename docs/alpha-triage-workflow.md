# WortWeg Alpha Triage Workflow

## 1. Classify Severity
When a bug report is received, assign one of the following severity levels:
- **Release Blocker:** Prevents app launch, crashes the app entirely, or completely breaks core functionality (e.g., microphone deadloop). Must be fixed before the next APK.
- **High:** Major feature is broken (e.g., Azure scoring fails, AI teacher hangs), but a workaround exists or it only affects specific users.
- **Medium:** UI glitches, minor content typos, or non-critical state bugs.
- **Low:** Aesthetic issues or extremely rare edge cases.

## 2. Classify Area
Determine which module of the app is failing:
- App launch
- Lesson content
- Speaking practice
- Microphone permission
- Azure pronunciation feedback
- AI teacher
- Backend/API
- UI/UX

## 3. Decide Branch
Route the fix to the correct staging ground to protect the `main` branch freeze:
- **Release blocker** → Create a `fix/` branch off `main`. Merge directly back to `main`.
- **Future content issue** → Route to the relevant content branch (e.g., `feature/alpha-0.8-content-integration`). Do NOT merge to `main`.
- **Database/navigation idea** → Route to future planning branches. Do NOT merge to `main`.

## 4. Required Checks Before Merging to Main
If the fix is a release blocker bound for `main`, these absolute checks MUST pass:
- [ ] Run `npm run quality` and ensure zero errors.
- [ ] No version bumps (must remain `0.7.1`).
- [ ] No content surprises (content must remain exactly **40 lessons / 320 exercises / 320 vocabulary** unless a specific content fix was authorized).

## 5. Tester Response Template (Turkish)
Use this friendly template to acknowledge bug reports from our Alpha testers:

> Merhaba! Hata bildiriminiz için çok teşekkür ederiz. Bu sorunu incelemeye aldık ve en kısa sürede çözeceğiz. WortWeg'in gelişimine katkınız bizim için çok değerli. Yeni güncellemeler için lütfen takipte kalın!
