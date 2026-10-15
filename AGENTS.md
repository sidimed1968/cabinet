# Base44 Dev Environment

## What this app is
A **client-only Vite + React 19 SPA** (French UI) for a gynecology clinic: appointment
booking, medical records, ultrasound reports, prescriptions, doctor agenda.

- Single entry point: `index.html` → `src/main.tsx` → `src/App.tsx`
- **No router and no backend**: views are switched by `activeTab` state in `src/App.tsx`,
  and the demo user/role lives in component state. `curl` on `/` is the only route.
- No secrets are required. `@google/genai` is declared in `package.json` but is **not
  imported anywhere** in `src/`, so `GEMINI_API_KEY` is not needed to boot.

## Start it
```
docker compose -f docker-compose.base44.yml up -d --build
```
Runs `npm install` + `npm run dev` (already binds `0.0.0.0:3000`) from the bind-mounted
source, so edits appear via live reload. `node_modules` lives in the `web_node_modules`
volume, never on the bind mount.

## Non-obvious gotchas

### 1. The dev-server host allowlist is the fragile part (root cause of a past failed start)
Vite rejects requests for a hostname it does not recognise with
`403 Blocked request. This host ("…") is not allowed.` The preview proxy requests the dev
server with `Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN`, so if that host is not
allowlisted the preview never starts — the page stays blank and every asset 403s.

`docker-compose.base44.yml` therefore passes the platform-provided
`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` through to the service (bare entry under
`environment:`); Vite >= 6.1 appends it to `server.allowedHosts`. **Do not remove that
pass-through**, and do not replace it with a hardcoded hostname — the sandbox id rotates.

Check it (expect `200`, not `403`):
```
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: 3000-whatever.${BASE44_SANDBOX_HOST_DOMAIN}" http://localhost:3000/
```

### 2. Firebase is only half-alive here
`firebase-applet-config.json` points at a real AI Studio Firebase project, but the `apiKey`
in this checkout is a placeholder. Result: the Firestore *Listen* stream connects (200s on
`.../Firestore/Listen/channel`) while document writes are rejected with **403** on
`/v1/projects/.../databases/...`. Every read/write in `src/services/dataService.ts` swallows
that and falls back to `localStorage` + `src/data/mockData.ts`, so the app stays usable —
this is expected, not a bug to "fix".

Consequence worth knowing when testing: `bookAppointment` takes the local fallback path on
success, and the first write seeds `localStorage` with `DEMO_APPOINTMENTS` plus the new
record. To leave no trace, snapshot `localStorage.getItem('cabinet_appointments_v1')`
before a test booking and restore it afterwards.

### 3. Package manager
`bun.lock` is committed and `bun install` works, but the compose uses the pre-cached
`node:22` image with `npm install --no-package-lock` (a Bun image has to be pulled and its
`debian` variants do not ship `curl`, which silently breaks curl-based healthchecks).
Either is fine; keep the choice consistent with the healthcheck tooling.

## Verify
```
docker compose -f docker-compose.base44.yml ps          # web must be "healthy"
docker compose -f docker-compose.base44.yml logs --tail=30 web
docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit   # npm run lint
docker compose -f docker-compose.base44.yml exec -T web npm run build
```
Both `tsc --noEmit` and `vite build` pass on the current code — keep them green.

Manual checks that matter: the patient dashboard loads (demo user "Fatimetou Mint Sidi"),
the "Prendre Rendez-vous" flow confirms a slot, and switching to the doctor demo profile
("Profil Demo" → "Dr. Mariem") renders the dashboard, agenda and patient list.

## Notes
- `DISABLE_HMR=true` in `vite.config.ts` disables HMR *and* file watching; the compose
  leaves it unset so live reload works.
- `README.md` is empty in this repo; this file is the setup source of truth.
- `package.json`'s `clean` script removes a `server.js` that does not exist in this repo.
