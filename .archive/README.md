# .archive

This directory holds abandoned prototype files that are no longer part of the active codebase.
Files here are kept for historical reference only. They are **not imported, not built, and not deployed**.

---

## wortweg.prototype.jsx

**Archived:** 2026-06-22  
**Original path:** `wortweg.jsx` (project root)  
**Reason:** Dead code — unreferenced web prototype superseded by the React Native `src/` codebase.

### What it was

A single-file (1,505 lines, 94 KB) **browser-based React web app** — the original Codex-generated
prototype for WortWeg. It used:

- Standard HTML/browser React (`div`, `button`, `className`, `linear-gradient` CSS)
- `lucide-react` (web icon library, not `lucide-react-native`)
- Inline styles and a global `C` colour constant object
- Its own embedded lesson data (`LESSONS`, `vocab`, `sentences`) hardcoded inside the file
- Its own tab-based routing via `useState` (`home | vocab | chat | exam | profile`)
- Its own article colour system for der/die/das (blue/pink/green)

### Why it was replaced

The project migrated to **Expo React Native** (`src/` tree) with:

- Proper React Native components (`View`, `Text`, `TouchableOpacity`, etc.)
- TypeScript throughout
- Structured lesson data in `src/data/` (36 lessons, 288 exercises)
- A real navigation stack via React Navigation
- A secure Express backend (`server/`) for AI and speech features

### Status

- Not imported anywhere — confirmed by `grep` across all `.ts`, `.tsx`, `.js`, `.jsx` files.
- Not referenced in `package.json`, `tsconfig.json`, `app.json`, or any config.
- `npm run quality` (typecheck + content QA + server check) passes before and after this move.
- Kept here rather than deleted so the original design decisions and colour system remain accessible.
