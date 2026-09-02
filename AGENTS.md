# Base44 Dev Environment

## Project Overview
Vite + React 19 + TypeScript frontend app — a gynecology clinic management system
("Cabinet Gynécologique Nouakchott"). French UI. Features: appointment booking,
medical records, ultrasound reports, prescriptions, doctor agenda.

## Tech Stack
- **Runtime**: Bun (bun.lock) + Vite 6 dev server on port 3000
- **UI**: React 19, Tailwind CSS 4 (via @tailwindcss/vite), lucide-react icons, motion
- **Data**: Firebase (Firestore + Auth) with localStorage fallback in `src/services/dataService.ts`
- **AI**: @google/genai declared in package.json but NOT used in source — no GEMINI_API_KEY needed

## Setup
```
docker compose -f docker-compose.base44.yml up -d --build
```
The compose uses `oven/bun:1.2-debian`, bind-mounts the repo, runs `bun install` then
`bun run dev` (vite --port=3000 --host=0.0.0.0).

## Secrets
None required. Firebase config is public (firebase-applet-config.json) and the app
falls back to localStorage + mock data if Firestore is unreachable.

## Verification
- `curl -sf http://localhost:3000/` returns the Vite-served index.html
- Dev server serves unhashed source modules (live reload works)
- `vite.config.ts` sets `server.host: true` and `allowedHosts: true` for the preview proxy

## Notes
- DISABLE_HMR env var disables HMR + file watching (used during agent edits to prevent flicker)
- App defaults to a demo patient user (Fatimetou) for immediate interactive preview
- AuthModal lets you switch between demo patient and doctor roles
