# Wolli Mascot Integration Checklist

This checklist defines the future safe integration path for approved final Wolli mascot assets after the asset set exists.

Do not use this checklist to generate images. Do not add mascot assets until the assets have passed the Wolli asset brief and origin/license review.

Reference docs:

- `docs/wolli-mascot-asset-brief.md`
- `docs/project-status-snapshot.md`
- `docs/developer-precommit-checklist.md`

## 1. Preconditions

Before any app integration work starts, confirm:

- Final Wolli assets exist.
- Asset origin/license is clear.
- Assets do not resemble Duolingo or other competitor mascots.
- Assets are not from rejected Google Stitch mascot outputs.
- Assets are original and aligned with Wolli as an owl/bird-inspired guide.
- Phone smoke status is understood before making release-impacting changes.
- Current app placeholders and Wolli/avatar usage points are identified.
- The current comic UI direction is stable and should not be redesigned during mascot integration.
- `.env` remains ignored and untracked.

## 2. Asset Requirements

Expected asset set:

- avatar head
- full-body standing
- happy encouragement
- thinking/explaining
- speaking/microphone
- mistake/retry support
- empty-state sitting
- optional app icon candidate later

Preferred formats:

- PNG or WebP for app runtime assets.
- SVG or source file for archive if available.
- Transparent background.
- Multiple sizes if needed for 32px, 48px, and 96px display.
- Consistent naming across poses.
- Clear source/license/origin note.

## 3. Suggested Asset Location

Recommended future folder:

```text
src/assets/wolli/
```

Suggested contents:

```text
src/assets/wolli/
  README.md
  wolli-avatar-head.png
  wolli-standing.png
  wolli-happy.png
  wolli-thinking.png
  wolli-speaking.png
  wolli-retry.png
  wolli-empty-state.png
```

Notes:

- Use the current project asset convention if one exists by the time assets are added.
- Add a short `README.md` or license note inside the asset folder if useful.
- Do not use external image URLs in runtime UI.
- Do not commit rejected concept art unless it is intentionally archived outside runtime assets with clear notes.

## 4. Integration Targets To Inspect

Likely screens/components to inspect before changing code:

- onboarding welcome/value demo
- Home Wolli card/guide
- Chat/AI teacher header
- Lesson completion
- Speaking Practice
- Speaking Library
- Mistakes empty/support state
- Vocab empty/review state
- Exam result encouragement
- Profile/progress if relevant
- shared mascot/avatar components if present

Do not assume every target needs an asset in the first pass.

## 5. Replacement Strategy

- Replace placeholders gradually.
- Start with avatar head only.
- Then add empty-state support assets.
- Then add lesson, speaking, and completion poses.
- Avoid broad layout redesign.
- Keep current comic UI spacing and safe areas.
- Preserve existing routes, progression, SRS, mistakes, AI/STT, and analytics behavior.
- Do not let mascot art dominate dense learning screens.
- Do not add animation in the first integration pass.

## 6. Accessibility / UX Checks

For each mascot usage:

- Use a meaningful `accessibilityLabel` where the image communicates content or state.
- Mark decorative images appropriately if possible.
- Confirm readability on small Android screens.
- Confirm no layout overflow.
- Confirm no clipped bottom content or sticky CTA overlap.
- Confirm the asset works on lavender/white panels.
- Confirm the asset works near yellow/purple accents.
- Confirm touch targets and text remain readable.
- Avoid tiny text or details inside mascot art.

## 7. Brand Safety Checks

Before committing mascot assets or integrations, confirm:

- no green owl look
- no Duolingo-like proportions, expression, or color identity
- no sheep/wolf/cat/person mascot
- no competitor similarity
- no official exam/school logo implication
- no German eagle symbolism
- no copied Stitch mascot
- no external mascot URLs
- no copyrighted character similarity

## 8. Technical Checks

Run:

```sh
npm run quality
git diff --check
```

If images were added:

- Inspect file sizes.
- Confirm no remote image URLs.
- Confirm images are imported from local assets only.
- Confirm app still launches.
- Confirm no content totals changed.
- Confirm no generated/rejected mascot art was accidentally committed.

Expected totals remain:

- 36 lessons
- 288 exercises
- 288 vocabulary items

## 9. Manual Visual QA

Check these screens on phone or emulator after integration:

- onboarding
- Home
- AI chat
- lesson completion
- speaking
- mistakes
- vocab
- exam result
- small Android screen scroll

Confirm:

- mascot assets do not overlap text
- mascot assets do not crowd CTAs
- bottom nav and safe areas remain correct
- comic UI remains consistent
- no broad redesign occurred

## 10. Commit Plan

Suggested small commits:

1. `Add Wolli mascot asset pack`
2. `Integrate Wolli avatar assets`
3. `Add Wolli support poses to empty states`

Keep each commit focused. Prefer a separate docs/license note commit only if asset-origin documentation needs cleanup.

## 11. Non-Goals

- no redesign
- no animation in first pass
- no app icon replacement until separate review
- no competitor parody
- no generated mascot without review
- no Stitch mascot art
- no external image URLs
- no route/progression/content changes
- no Azure
- no deployment

## 12. Next Prompt Title

Integrate approved Wolli avatar head asset only.
