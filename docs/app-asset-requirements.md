# WortWeg App Asset Requirements

This document defines the app asset requirements for the first EAS preview build. It records the temporary private-alpha assets now in the repo and keeps final brand/Wolli assets as pending. It does not create credentials, native folders, or App Store / Play Store readiness claims.

## 1. Current Config Status

Inspected files:

- `app.json`
- `eas.json`
- `assets/`
- `docs/wolli-mascot-asset-brief.md`
- `docs/wolli-mascot-integration-checklist.md`

Current app identifiers:

- iOS `bundleIdentifier`: `com.toprakyildiz.wortweg`
- Android `package`: `com.toprakyildiz.wortweg`

Current asset folder status:

- `assets/icon.png` exists as a temporary private-alpha icon.
- `assets/splash.png` exists as a temporary private-alpha splash image.
- `assets/adaptive-icon.png` exists as a temporary private-alpha Android adaptive foreground.
- No final Wolli mascot asset is present.
- Final brand/store-quality assets are still pending.

Current app config asset references:

| Config field | Current value | Status |
| --- | --- | --- |
| `expo.icon` | `./assets/icon.png` | Temporary private-alpha asset present |
| `expo.splash.image` | `./assets/splash.png` | Temporary private-alpha asset present |
| `expo.android.adaptiveIcon.foregroundImage` | `./assets/adaptive-icon.png` | Temporary private-alpha asset present |
| `expo.android.adaptiveIcon.backgroundColor` | `#1E1B3A` | Present, review with final art later |

## 2. Temporary Asset Set

The current assets are original code-generated placeholders for internal preview testing only:

- `assets/icon.png`: 1024x1024 PNG.
- `assets/adaptive-icon.png`: 1024x1024 PNG with transparent background/safe centered foreground.
- `assets/splash.png`: 1242x2436 portrait PNG.

Design direction:

- Dark lavender/purple base.
- Warm yellow comic-style `WW` wordmark.
- Simple wordmark-only composition.
- No mascot.
- No external images or remote URLs.
- No Stitch asset reuse.
- No green owl, Duolingo-like owl, sheep, cat, wolf, or person mascot.

These assets are acceptable for an internal preview build smoke test, but they are not final store or public-launch brand assets.

## 3. App Icon Requirement

Temporary status: present at `assets/icon.png`.

Final asset still needed before broader tester distribution or any public launch claim:

- Square app icon for Expo/EAS config.
- Original WortWeg-branded artwork.
- Readable at small launcher sizes.
- No tiny text.
- No competitor-style mascot silhouette.
- No official exam/school logo implication.
- Should work against iOS and Android launcher contexts.

## 4. Splash Screen Requirement

Temporary status: present at `assets/splash.png`.

Final asset/config still needed before broader tester distribution or any public launch claim:

- Simple splash image or intentionally minimal splash configuration.
- Consistent with WortWeg comic UI without a heavy redesign.
- Should avoid clutter and tiny text.
- Should not imply full B1/B2 availability.
- Should not include official exam-provider names or certification claims.

## 5. Android Adaptive Icon Requirement

Temporary status: foreground present at `assets/adaptive-icon.png`; background color remains `#1E1B3A`.

Final asset/config still needed before broader tester distribution or any public launch claim:

- Adaptive icon foreground image with transparent background.
- Background color reviewed against final foreground art.
- Simple silhouette that remains readable when masked by Android launchers.
- No remote images or generated placeholder references.

## 6. Wolli Mascot Guidance

Use the existing Wolli docs for final mascot direction:

- `docs/wolli-mascot-asset-brief.md`
- `docs/wolli-mascot-integration-checklist.md`

Wolli direction:

- Original owl/bird-inspired guide.
- Friendly German-learning guide for Turkish speakers.
- Warm, clear, slightly playful, not childish.
- Compatible with WortWeg's 2D comic-book UI.

Prohibited directions:

- Green owl mascot.
- Duolingo-like proportions, expression, colors, or silhouette.
- Sheep, cat, wolf, or person mascot.
- Copied Stitch-generated mascot.
- Copied competitor mascot silhouette.
- German eagle symbolism.
- Official school/exam logos.

The temporary assets intentionally do not use Wolli. Final Wolli assets remain a separate brand task.

## 7. Comic UI Style Fit

Future final assets should fit the current WortWeg visual system:

- Bold ink outlines around 2px.
- Sticker-like shadows.
- Lavender/white panel compatibility.
- Warm yellow and purple accent compatibility.
- Turkish-first visual tone: friendly, clear, useful, not childish.
- Readable on small Android screens.
- Transparent-background variants where useful.

## 8. Ready vs Missing

Ready now for a first internal preview smoke, not public release:

- App identifiers are set in `app.json`.
- Microphone permission copy is present.
- Hosted backend URL is available through the EAS preview public env.
- `eas.json` has a preview-only internal distribution profile.
- Temporary `icon.png`, `splash.png`, and `adaptive-icon.png` are present and referenced by `app.json`.

Still missing before broader tester distribution or final brand review:

- Final app icon.
- Final splash image or final splash configuration.
- Final Android adaptive icon foreground/background review.
- Final Wolli mascot asset pack.
- Visual phone smoke on a built install package.
- Asset origin/license note for final assets.

## 9. Acceptance Checklist

Before committing final app assets:

- Assets are original and license/origin is documented.
- No competitor mascot resemblance.
- No Stitch mascot reuse.
- No official Goethe/telc/OeSD claim or logo implication.
- No external image URLs in runtime UI.
- File sizes are reasonable for a mobile app.
- `npm run quality` passes.
- Content totals remain 36 lessons, 288 exercises, 288 vocabulary items.
- Installed preview build launches and displays icon/splash correctly.

## 10. Next Prompt Title

Prepare first EAS preview build smoke checklist without running build.
