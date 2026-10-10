# Nusantara Gemar Membaca (NGM)

Web app for reading curated Nusantara folktales, with an optional **Interactive 2D Story Exploration** mode.
Built from `docs/PRD_NGM_Revised.md` (source of truth) and the original React/Vite prototype.

**Stack:** React 19 + TypeScript + Vite + Tailwind (frontend) · Express + SQLite (`node:sqlite`, no native deps) · Vitest · Playwright (Python) for browser tests.

## Requirements
- Node.js **>= 22.13** (uses the built-in `node:sqlite`; it prints an "experimental" warning, which is expected)
- For browser tests only: Python 3 with `playwright` and a Chromium install

## Quick start
```bash
npm install
cp .env.example .env          # then edit: set ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                   # http://localhost:3000  (Express + Vite middleware, DB auto-created and seeded)
```
The first start creates `data/ngm.db`, seeds it from `src/data/*`, and creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
There is **no default admin password**; without those variables nobody can sign in to `/#/admin`.

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (API + Vite HMR) |
| `npm run build` | Production frontend build to `dist/` |
| `npm start` | Production server (needs `npm run build`; **requires** `SESSION_SECRET`; set `COOKIE_SECURE=false` if served over plain HTTP) |
| `npm run lint` | `tsc --noEmit` (the project has no ESLint config) |
| `npm test` | Vitest: engine, validator, asset files, API integration |
| `npm run test:e2e` | Playwright browser flows against the production server (build first) |
| `npm run db:seed` / `db:reset` | Seed an empty DB / wipe and re-seed (**destroys admin edits**) |
| `npm run admin:create -- <email> <password>` | Create the admin, or reset its password (min 10 chars) |
| `npm run assets:generate` | Re-generate the pixel-art PNGs in `public/assets/2d/` |

## Architecture
```
server/   index.ts (bootstrap) · app.ts (routes) · content.ts (public payload + publication gate)
          db.ts (schema) · seed.ts · security.ts (scrypt, signed cookie) · ai.ts (Gemini, server-side only)
src/
  engine2d/engine.ts     pure game logic: movement, bounds, camera, distance check, events, progression
  engine2d/validate.ts   2D config validation (shared by browser and server publish gate)
  components/Interactive2DReader.tsx   DOM-rendered scene (sprites are real <button>/<img>), controls, panels
  components/ReaderPage.tsx            standard reader + mode selection + fallback
  components/AdminPage.tsx             CMS UI
  data/                  prototype content (seed source) · data/interactive/ = 2D assets registry, avatar, scene config
  lib/                   API client, content provider (loading / error / retry), analytics
public/assets/2d/        generated pixel-art PNGs
tests/                   vitest suites · tests/e2e/run_e2e.py
```
Public pages read `GET /api/content` (published stories only). Admin pages use `/api/admin/*` behind an HttpOnly, SameSite=Strict signed session cookie
(+ Origin check on writes, login throttling). Passwords are scrypt-hashed.

### Content model / publication
Workflow: `draft → content-review → visual-review → approved → published` (one step at a time; back to draft = unpublish; archive any time).
**Publishing is refused** unless: title/summary present, ≥1 scene and no empty scene, ≥1 source, every linked source *verified* with known rights,
every cultural item sourced and verified, every public visual has a clear licence, and (if flagged ready) the 2D config validates.
Published content is read-only until unpublished. Only visuals with status `approved` reach the public site.

## Interactive 2D: how scenes and events are configured
A story is 2D-capable when `interactive2DStatus === 'ready'`, `defaultReaderMode === 'interactive-2d'`, **and** `validateStory2D` passes (the server also
re-checks on every public request and silently falls back to the standard reader if not). Everything else uses the standard reader unchanged.

Per scene (see `src/types.ts`, example in `src/data/interactive/roro-jonggrang.ts`):
- `backgroundAssetId`, `worldWidth`, `movementBounds {minX,maxX}`, `avatarStartX`, `nextSceneNumber` (omit on the last scene)
- `interactiveTargets[]`: `id, type, label, spriteAssetId, positionX, interactionRadius, hint, eventId, culturalContent?`
- `storyEvents[]`: `id, triggerTargetId, type (narration|dialogue|cultural-info), requirement (required|optional), sequence, lines[], afterEvent (return-control|advance-scene)`
- `decorSprites[]`: scenery, never interactive
Rules enforced by validation: required events need `sequence`; the last required event must `advance-scene`; every cultural target carries a sourced annotation;
targets must be reachable inside the bounds; sprites/backgrounds must exist in `src/data/interactive/assets.ts` with a known licence.
Units are logical art pixels (scene height 144). Default avatar speed 70 px/s. Camera follows horizontally and clamps at world edges.

Controls: ←/→ or A/D (desktop), on-screen ◀ ▶ buttons (hold) and a drag strip (touch); click/tap a target within its radius. Too far → hint, no event.
Open dialogue pauses movement; **Lanjut** advances; Esc closes without completing. "Baca versi teks" switches to the standard reader at the same scene at any time.

### Adding another 2D story
1. Add sprites/backgrounds to `public/assets/2d/` and register them (with real provenance) in `src/data/interactive/assets.ts`.
2. Write a config builder like `roro-jonggrang.ts` and apply it in `server/seed.ts` (or store scene JSON in the DB).
3. Run `npm test` (validator) and review the readiness report in the CMS before marking the story ready.

## AI visuals
`POST /api/admin/stories/:id/scenes/:n/visuals/generate` calls Gemini **on the server** with `GEMINI_API_KEY` (never sent to the browser).
The prompt is built only from curated scene text and its cultural annotation; results are saved as `pending` with prompt, version and method `ai`, and
appear publicly only after an admin approves them with a clear licence. Without a key the endpoint returns 503 and creates nothing.
The AI badge in the reader is shown only when the asset record says `ai`.

## Seed-data decisions (read before trusting the content)
- Source records are derived from the prototype's free-text source strings and seeded as **unverified / rights unknown**; nothing is claimed as verified.
- Prototype scene/cover images are imported as `approved` (so the site looks as before) with method `unknown` and licence `unknown`. They are *not* labelled AI.
  The seeded stories are flagged `legacy`; the publication gate will not let them be re-published until an editor resolves sources, rights and licences.
- 9 of 10 stories have no scene text in the prototype. They stay listed ("Naskah segera hadir") and the reader says so; they cannot be re-published until scenes exist.
- Prototype `sceneCount` said 8 for Roro Jonggrang but only 4 scenes exist; it is now derived from the real scenes.
- Removed prototype claims the data does not support: star ratings/review counts, "120+ naskah", hard-coded region counts, a "registered reader account" avatar,
  and partner claims in the footer/glossary. Counts are now computed from published stories.
- Pixel-art assets are **procedural placeholders** (`scripts/generate-pixel-assets.mjs`), licence `project-original`, cultural review **pending**. Which object carries which
  annotation (e.g. singgasana ↔ "Diplomasi Halus") is an editorial mapping needing curator sign-off.

## Defaults chosen for open PRD questions
Touch movement = hold buttons + drag strip; landscape 16:9 logical scene scaled ×2 (phones) / ×3; completed targets can be replayed without double counting;
required events follow `sequence` (out-of-order → hint); no scene-jumping in 2D; whole-story fallback to the standard reader when a *required* asset fails
(decor failures are ignored); whole-story 2D (mixed 2D/standard scenes unsupported); no persisted progress.

## Known limitations
- 2D scene/target/event **editing is not in the CMS** (config lives in code/seed; CMS shows the validation report, toggles readiness and manages asset review).
- Cultural review of 2D assets is *pending*; the validator reports it as a warning, it does not block.
- Character profiles are shown as chips (name/role) only; no character detail pages. Bookmarks, accounts, teacher mode, offline: out of PRD MVP scope here.
- No ESLint, no axe/WCAG audit, no screen-reader testing; contrast and keyboard behaviour were only spot-checked. Quiet mode does not restyle the 2D panels.
- Material Symbols and the logo load from Google/hotlinked URLs; offline they fall back to text/placeholder.
- AI generation has **not** been run against the live Gemini API (no key available here).
- Single admin role; login throttle is in-memory; SQLite file DB (single-node).
