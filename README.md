# Pokémon Spanbouer

Full-stack assignment starter: React (Vite), Express, MySQL, and PokeAPI.

**Brief:** `Tuisopdrag_Fullstack_Pokemon.docx` (repository root).

**Publish to GitHub:** on Windows, run **`GITHUB-ONE-CLICK.cmd`** in this directory (repository root). macOS/Linux: see **`docs/submission-guide.md`**.

## Ownership

**Original starter:** `NOTICE` names the copyright holder(s). `LICENSE` permits **non-commercial** use only and requires this section to stay accurate.

**Additions and changes in this clone:**

- `backend/src/services/auth.service.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/services/pokeapi.service.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/services/collection.service.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/controllers/auth.controller.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/controllers/pokemon.controller.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/controllers/backpack.controller.js` — implemented and owned by Marc Breedt for this submission.
- `backend/src/controllers/team.controller.js` — implemented and owned by Marc Breedt for this submission.
- `frontend/src/components/features/*` — implemented and owned by Marc Breedt for this submission.
- `frontend/src/components/layout/AppLayout.jsx` — modified and owned by Marc Breedt for this submission.
- `database/schema.sql` — implemented and owned by Marc Breedt for this submission.
- `docs/architecture.md` — written and owned by Marc Breedt for this submission.

## Requirements

- Node.js 18+
- npm
- MySQL 8 (server running)
- Git

## First-time setup

1. Install backend dependencies (required for `scripts/setup.js`):

```bash
   cd backend
   npm install
   cd ..
```

2. Run the database setup script from the repository root:

```bash
   node scripts/setup.js
```

   You will be prompted for a MySQL admin account (often `root`). The script creates the database, an application user with a generated password, writes `backend/.env`, and runs `database/schema.sql`.

   Install MySQL first if needed: https://dev.mysql.com/downloads/mysql/

3. Start the apps (two terminals):

```bash
   cd backend && npm run dev
```

```bash
   cd frontend && npm install && npm run dev
```

4. Open http://localhost:5173

## Layout
Details: `docs/project-map.md`.

## HTTP API

Only **GET** and **POST** are used.

- **GET** — read data  
- **POST** — create, update, or delete (mutations)

Deletes use POST with a JSON body, for example:

```http
POST /api/backpack/remove
Content-Type: application/json

{"id": 42}
```

## Documentation

| File | Content |
|------|---------|
| `docs/project-map.md` | Paths, routes, API table |
| `docs/architecture.md` | Your architecture write-up (submission) |
| `docs/submission-guide.md` | Deliverable, publish script, runtime README, licence |
| `GITHUB-ONE-CLICK.cmd` | Windows: create GitHub repo and push |
| `LICENSE` | Non-commercial licence (starter + derivatives) |
| `NOTICE` | Original starter copyright / ownership |
| `backend/README.md` | Backend commands and env vars |
| `frontend/README.md` | Frontend commands |

## Runtime configuration

| Item | Value |
|------|-------|
| Backend base URL | http://localhost:3001 |
| Frontend dev URL | http://localhost:5173 |
| MySQL host | 127.0.0.1 |
| MySQL port | 3306 |
| Database name | pokemon_spanbouer |
| Database user | pokemon_app |
| Database password | nv5ErJ8hcG7w9jHnbGLt |

### Test account

| Field | Value |
|-------|-------|
| Email | test1@test.com |
| Password | Test1234! |

### Steps to run locally

1. Start MySQL.
2. From the repo root: `cd backend && npm install && cd ..` then `node scripts/setup.js` — use the MySQL **admin** password when prompted; align the table above with the output (or document an alternative if you import `database/dump.sql` instead).
3. `cd backend && npm run dev`
4. `cd frontend && npm install && npm run dev`
5. Open the frontend URL and sign in with the test account.

If you include `database/dump.sql`, state in this README whether importers should load that file instead of running `setup.js` (see `docs/submission-guide.md`).

## Production build (optional)

```bash
cd frontend && npm run build
```

Serve `frontend/dist/` with any static host. Point the API at your deployed backend; set `VITE_API_BASE_URL` before `npm run build` if the API is not proxied.

Run the backend with `NODE_ENV=production` and a strong `JWT_SECRET`.
