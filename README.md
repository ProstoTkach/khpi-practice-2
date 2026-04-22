# UserFlow (Frontend + Backend)

Vanilla JS dashboard + Node.js/Express REST API with PostgreSQL storage.

- **Frontend**: `frontend/` (static HTML/CSS/JS)
- **Backend**: `backend/` (Express + `pg` + Sequelize, Jest/Supertest tests)

## Project structure

```text
frontend/
  pages/                 # HTML pages
  js/                    # ES modules (Fetch API client)
  public/                # static assets (default avatar)

backend/
  src/
    app.js               # Express app (+ /health)
    routes/              # users/profiles/scores routes
    controllers/         # validation + request handling
    services/            # DB operations
    db/                  # pg pool + Sequelize + schema.sql
    models/              # Sequelize models & associations
    utils/               # sanitize helper
  tests/
    api.test.js          # integration API tests
  package.json
  .env                   # local env vars
```

## Features

- **CRUD**: users, profiles, scores
- **Validation**: email format, password >= 8, score 0..100, numeric ids
- **Security**:
  - parameterized SQL (SQLi-resistant)
  - bcrypt password hashing
  - basic anti-XSS sanitization for stored text fields
- **Tests**: Jest + Supertest integration suite (GitHub Actions included)

## Backend API

Base URL (local): `http://localhost:3000`

- `GET /health`
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /users-with-five-scores`
- `GET /users-max-score`
- `POST /profiles`
- `GET /profiles`
- `GET /profiles/:id`
- `PUT /profiles/:id`
- `DELETE /profiles/:id`
- `POST /scores`
- `GET /scores`
- `GET /scores/:id`
- `PUT /scores/:id`
- `DELETE /scores/:id`

## Local development

### 1) Database (local PostgreSQL)

Create DB and apply schema:

```sql
CREATE DATABASE registration_app;
```

```bash
psql -d registration_app -f backend/src/db/schema.sql
```

### 2) Backend

Create `backend/.env` (example):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=registration_app

# tests
DB_NAME_TEST=tests_db
```

Run:

```bash
cd backend
npm install
npm run dev
```

### 3) Frontend

Open `frontend/pages/index.html` in browser (or serve `frontend/` as static).

Frontend reads API base from `frontend/js/config.js`:

- `window.__API_BASE_URL__` (preferred for hosting)
- fallback: `http://localhost:3000`

## Tests

```bash
cd backend
npm test
```

Safety rules:

- Tests refuse to run on DB name without `"test"` in it.
- Cleanup removes **only test-created rows** (by email prefix).
- If test DB is empty, tests auto-create tables (minimal schema).

## Hosting (simple)

### Where to host PostgreSQL

Any managed Postgres works. The simplest options:

- **Render PostgreSQL**: easiest if your backend is on Render (same provider, easy env vars).
- **Railway PostgreSQL**: easy UI, quick start; good for student projects.
- **Neon / Supabase**: standalone managed Postgres; you just take connection params.

Pick the same region as your backend to reduce latency.

### Deploy backend (Render/Railway)

1. Create a Web Service from this repo.
2. Set **root directory** to `backend`.
3. Start command: `npm start`
4. Set environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `NODE_ENV=production`
5. Apply schema once to the hosted DB using `backend/src/db/schema.sql`.

Verify: open `GET /health` on your deployed backend.

### Deploy frontend (Netlify/Vercel/GitHub Pages)

Host `frontend/` as static.

Before `<script type="module" src="../js/main.js"></script>` on each page, inject:

```html
<script>
  window.__API_BASE_URL__ = "https://YOUR-BACKEND-DOMAIN";
</script>
```

Redeploy frontend.

## Next steps checklist

- Deploy PostgreSQL
- Deploy backend, check `/health`
- Apply schema to hosted DB
- Deploy frontend with `window.__API_BASE_URL__`
- Confirm CRUD + scores flows in UI
