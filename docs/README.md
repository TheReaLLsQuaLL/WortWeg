# WortWeg Docs Index

This index keeps the `docs/` folder navigable as planning, audit, alpha, backend, and brand documents grow.

## 1. Current Status

- [Project Status Snapshot](project-status-snapshot.md)
- [Local Release Readiness Audit](local-release-readiness-audit.md)
- [Feature Roadmap](feature-roadmap.md)

## 2. Development Workflow

- [Developer Pre-Commit Checklist](developer-precommit-checklist.md)
- [Backend Hardening Audit](backend-hardening-audit.md)
- [Backend Deployment Plan](backend-deployment-plan.md)
- [Backend Pre-Deployment Checklist](backend-predeployment-checklist.md)
- [Backend Hosting Evaluation](backend-hosting-evaluation.md)

## 3. Backend / AI / Speech

- [Backend Roadmap](backend-roadmap.md)
- [Backend Deployment Plan](backend-deployment-plan.md)
- [Backend Hardening Audit](backend-hardening-audit.md)
- [Backend Hosting Evaluation](backend-hosting-evaluation.md)
- [Backend Pre-Deployment Checklist](backend-predeployment-checklist.md)
- [Azure Pronunciation Prototype](azure-pronunciation-prototype.md)

## 4. Alpha / Testing

- [Alpha Test Checklist](alpha-test-checklist.md)
- [Private Alpha Metadata Draft](private-alpha-metadata-draft.md)
- [Private Alpha Tester Guide Draft](private-alpha-tester-guide-draft.md)
- [Private Alpha Distribution Plan](private-alpha-distribution-plan.md)
- [EAS Preview Build Plan](eas-preview-build-plan.md)
- [EAS Account / Project Readiness](eas-account-project-readiness.md)
- [App Asset Requirements](app-asset-requirements.md)
- [Local Release Readiness Audit](local-release-readiness-audit.md)

## 5. Design / Brand

- [Wolli Mascot Asset Brief](wolli-mascot-asset-brief.md)
- [Wolli Mascot Integration Checklist](wolli-mascot-integration-checklist.md)
- [UX Competitor Notes](ux-competitor-notes.md)
- [Language App UX Research](language-app-ux-research.md)
- [UX Simplification Change Plan](ux-simplification-change-plan.md)
- [Design Reference Folder](design-reference/)
- [Stitch Comic Reference Zip](design-reference/stitch-comic/stitch_wortweg_design_system.zip)

## 6. Guardrails Summary

- A0/A1/A2 are playable.
- B1 preview is limited to 8 optional lessons.
- Full B1/B2 paths are coming soon.
- First hosted backend smoke passed on Render at `https://wortweg.onrender.com`.
- Phone hosted AI/speech smoke passed against Render.
- Installed Android EAS preview APK smoke passed after Expo asset/module alignment.
- Temporary icon/splash assets are acceptable for internal preview, not final brand or store assets.
- Current speaking score is transcript-based; slow but word-correct speech can score 100 because nuanced pronunciation scoring is not implemented yet.
- Azure pronunciation assessment is not implemented yet.
- Do not add official exam affiliation claims.
- Do not put API keys in app code, docs, screenshots, or committed environment files.
- Keep `.env` local and untracked.

## 7. Useful Commands

```sh
npm run quality
npm run server:dev
npm run server:check
npm run server:smoke
npm run quality:backend
PATH=/Users/squall/.nvm/versions/node/v22.22.3/bin:$PATH npx expo start --clear --port 8083
```

## 8. Next Recommended Action

Define the private alpha tester distribution/support process before inviting testers. Keep Azure pronunciation assessment as future backend-only prototype work.
