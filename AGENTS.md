# Development notes

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
npm install
npm run dev     # vite --port=3000 --host=0.0.0.0
```
Edits hot-reload. In the Base44 dev sandbox the same dev command runs from a bind-mounted
`node:22` container; its `docker-compose.base44.yml` and `.base44/environment.json` are
generated per environment and deliberately kept out of feature pull requests.

## Non-obvious gotchas

### 1. The dev-server host allowlist is the fragile part (root cause of a past failed start)
Vite rejects requests for a hostname it does not recognise with
`403 Blocked request. This host ("…") is not allowed.` Behind a reverse proxy the dev
server is reached with `Host: <port>-<sandbox id>.<host-domain>`, so if that host is not
allowlisted the site never loads — the page stays blank and every asset 403s. The app code
is innocent in that case: `vite build` and `tsc --noEmit` both pass.

When running under such a proxy, pass `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` through to
the dev server process (a bare environment entry); Vite >= 6.1 appends it to
`server.allowedHosts`. Do not hardcode a hostname — the sandbox id rotates.

Check it (expect `200`, not `403`):
```
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: 3000-whatever.<host-domain>" http://localhost:3000/
```

### 2. Firebase writes need real credentials (this checkout has a placeholder key)
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
`bun.lock` is committed and `bun install` works; npm installs the same tree fine
(`node:22`, `npm install --no-package-lock`). Either is fine — just keep the choice
consistent with the container you run it in (Bun's `debian` images do not ship `curl`,
which silently breaks curl-based healthchecks).

## Verify
```
npx tsc --noEmit    # npm run lint
npm run build
curl -sf http://localhost:3000/ >/dev/null && echo up
```
Both `tsc --noEmit` and `vite build` pass on the current code — keep them green.

Manual checks that matter: the patient dashboard loads (demo user "Fatimetou Mint Sidi"),
the "Prendre Rendez-vous" flow confirms a slot, and switching to the doctor demo profile
("Profil Demo" → "Dr. Mariem") renders the dashboard, agenda and patient list.

## Notes
- `DISABLE_HMR=true` in `vite.config.ts` disables HMR *and* file watching; leave it unset
  so live reload works.
- `README.md` is empty in this repo; this file is the setup source of truth.
- `package.json`'s `clean` script removes a `server.js` that does not exist in this repo.
