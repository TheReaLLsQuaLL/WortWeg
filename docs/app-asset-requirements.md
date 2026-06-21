# WortWeg App Asset Requirements

This document defines the app asset requirements for the first EAS preview build. It does not add final art, generate images, create credentials, or claim App Store / Play Store readiness.

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

- `assets/` exists but has no committed asset files.
- No final app icon is present.
- No splash image is present.
- No Android adaptive icon foreground image is present.
- No Wolli final mascot asset is present.

Current app config asset references:

| Config field | Current value | Status |
| --- | --- | --- |
| `expo.icon` | Not set | Missing |
| `expo.splash.image` | Not set | Missing |
| `expo.android.adaptiveIcon.foregroundImage` | Not set | Missing |
| `expo.android.adaptiveIcon.backgroundColor` | `#1E1B3A` | Present, but should be reviewed with final art |

## 2. App Icon Requirement

Needed before tester distribution:

- Square app icon for Expo/EAS config.
- Original WortWeg-branded artwork.
- Readable at small launcher sizes.
- No tiny text.
- No competitor-style mascot silhouette.
- No official exam/school logo implication.
- Should work against iOS and Android launcher contexts.

Recommended future path, not currently referenced:

```text
assets/icon.png
```

Do not add this path to `app.json` until an approved asset exists.

## 3. Splash Screen Requirement

Needed before tester distribution:

- Simple splash image or intentionally minimal splash configuration.
- Consistent with WortWeg comic UI without a heavy redesign.
- Should avoid clutter and tiny text.
- Should not imply full B1/B2 availability.
- Should not include official exam-provider names or certification claims.

Recommended future path, not currently referenced:

```text
assets/splash.png
```

Do not add this path to `app.json` until an approved asset exists.

## 4. Android Adaptive Icon Requirement

Current config has only:

```json
"adaptiveIcon": {
  "backgroundColor": "#1E1B3A"
}
```

Needed before tester distribution:

- Adaptive icon foreground image with transparent background.
- Background color reviewed against final foreground art.
- Simple silhouette that remains readable when masked by Android launchers.
- No remote images or generated placeholder references.

Recommended future path, not currently referenced:

```text
assets/adaptive-icon.png
```

Do not add this path to `app.json` until an approved asset exists.

## 5. Wolli Mascot Guidance

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

## 6. Comic UI Style Fit

Future assets should fit the current WortWeg visual system:

- Bold ink outlines around 2px.
- Sticker-like shadows.
- Lavender/white panel compatibility.
- Warm yellow and purple accent compatibility.
- Turkish-first visual tone: friendly, clear, useful, not childish.
- Readable on small Android screens.
- Transparent-background variants where useful.

## 7. Ready vs Missing

Ready now:

- App identifiers are set in `app.json`.
- Microphone permission copy is present.
- Hosted backend URL is available through the EAS preview public env.
- `eas.json` has a preview-only internal distribution profile.

Missing before tester distribution:

- Final app icon.
- Splash image or final splash configuration.
- Android adaptive icon foreground image.
- Review of adaptive icon background color with final art.
- Final Wolli mascot asset pack, if Wolli is used in icon/splash or app screens.
- App icon/splash config update after assets are approved.
- Visual phone smoke on a built install package.

## 8. Acceptance Checklist

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

## 9. Next Prompt Title

Prepare first EAS preview build smoke checklist without running build.
