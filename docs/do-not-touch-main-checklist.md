# WortWeg "Do Not Touch Main" Safety Checklist

## 1. Current Main Purpose
- `main` is strictly reserved for the Alpha 0.7.1 APK build.
- Expected version: `0.7.1-alpha`
- Expected content: 40 lessons / 320 exercises / 320 vocabulary items.
- Only critical release fixes should be committed or merged into `main` at this time.

## 2. Safe Main Changes
Changes to `main` are allowed **only** if they are strictly required for the release:
- Release-blocking bug fixes (e.g., app crashes on launch).
- Security/privacy cleanup fixes (e.g., removing a temporary audio file that wasn't deleted).
- Docs-only release/checklist files (if intentional).

## 3. Unsafe Main Changes
Do **not** merge the following before the Alpha 0.7.1 APK test concludes:
- Alpha 0.8 content integration (the massive 84-lesson expansion)
- Exam-prep foundation (part of Alpha 0.8)
- Database sync implementation
- Login/Auth features
- Payment/Premium features
- New native dependencies
- Lesson navigation UI refactor
- Large frontend refactors

## 4. Before Touching Main
If a critical fix must be pushed, strictly run these commands to ensure environment integrity:
```bash
git checkout main
git pull origin main
git status -sb
npm run quality
```

## 5. Before APK Build
Before kicking off the `eas build` command (once the quota resets), explicitly confirm the following:
- `package.json` version is `"0.7.1"`
- `app.json` `expo.version` is `"0.7.1"`
- `app.json` `android.versionCode` is `7`
- `src/constants.ts` `APP_VERSION` is `'0.7.1-alpha'`
- `npm run content:qa` outputs exactly **40 / 320 / 320**.

## 6. Future Branches
The following branches are staging areas for future releases and should remain disconnected from `main` for now:
- `feature/alpha-0.8-content-integration` (Next major content pack)
- `feature/exam-prep-foundation` (Exam practice)
- Docs/database branches
- Docs/navigation branches

## 7. Merge Decision Rule
> **Golden Rule:** If a change is NOT explicitly needed for Alpha 0.7.1 APK testing, it MUST stay off `main`. 
