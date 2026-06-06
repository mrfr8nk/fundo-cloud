# Fundo CDN

A production-grade file hosting & content delivery platform with a futuristic neon UI, presigned direct-to-R2 uploads, a developer REST API, per-user quotas, and an admin console.

Built by **Developer Darrell Mucheri**.

---

## ✨ Features

- **Direct-to-R2 uploads** via presigned URLs (no server bandwidth used)
- **Public + private** files with short-link sharing
- **Developer REST API** with hashed Bearer keys (`fundo_live_*`)
- **Per-user quotas** (storage / bandwidth) with usage logs
- **Admin panel** for user & file moderation
- **Analytics dashboard** (requests, bandwidth, actions) with Recharts
- **Email/password auth** with JWT sessions (7-day tokens)
- **First user becomes admin** automatically
- **Futuristic neon glassmorphism** design system

---

## 🧱 Tech Stack

| Layer         | Tech                                                      |
| ------------- | --------------------------------------------------------- |
| Frontend      | **React 19 + Vite 7** (SPA), react-router-dom v7          |
| UI            | TailwindCSS v4, shadcn/ui, Lucide, Recharts, Sonner       |
| Backend       | **Express.js** (Node 20), **Mongoose**, JWT auth          |
| Database      | **MongoDB Atlas**                                         |
| Storage / CDN | Cloudflare R2 (S3-compatible) + custom domain             |
| Validation    | Zod (frontend), native Express (backend)                  |

> The frontend is a plain React + Vite SPA. The Express API runs alongside it in development (Vite proxies `/api` to port 3001). In production, host the API separately and set `VITE_API_BASE_URL` accordingly.

---

## 📂 Project Structure

```
index.html                  Vite entry
src/
  main.tsx                  React + BrowserRouter bootstrap
  App.tsx                   Route table
  styles.css                Tailwind v4 + design tokens
  lib/
    api.ts                  Fetch wrapper (JWT, base path)
    format.ts               formatBytes, formatDate, classifyMime
  hooks/
    useAuth.ts              JWT session hook (/api/auth/me)
  pages/
    Landing.tsx             Public landing page (/)
    Auth.tsx                Sign in / Sign up (/auth)
    app/
      AppLayout.tsx         Authenticated dashboard shell
      Overview.tsx          /app  — stats overview
      Files.tsx             /app/files
      Keys.tsx              /app/keys
      Analytics.tsx         /app/analytics
      Admin.tsx             /app/admin  (admin only)
      Docs.tsx              /app/docs   — API reference
server/
  index.js                  Express app entry (port 3001)
  db.js                     Mongoose connection
  middleware/
    auth.js                 JWT verify + requireAdmin
  models/
    User.js                 email, passwordHash, role, quota
    File.js                 r2Key, sizeBytes, visibility, tags…
    ApiKey.js               keyPrefix, keyHash, revokedAt…
    UsageLog.js             action, bytes, fileId
  routes/
    auth.js                 POST /signup  /signin  GET /me
    files.js                GET / POST /presign /confirm PATCH DELETE
    keys.js                 GET POST DELETE
    analytics.js            GET /  GET /overview
    admin.js                GET /users  GET /files  DELETE /files/:id
```

---

## 🚀 Local Setup

### 1. Prerequisites

- Node 20+
- MongoDB Atlas cluster (free tier works)
- Cloudflare R2 bucket + API token (optional — app runs without it, uploads return a 503)

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file or set these in your host's secrets panel:

| Variable              | Required | Description                                         |
| --------------------- | -------- | --------------------------------------------------- |
| `MONGODB_URI`         | ✅       | MongoDB Atlas connection string                     |
| `JWT_SECRET`          | ✅       | Random 32+ char secret for signing JWTs             |
| `API_PORT`            |          | Express port (default `3001`)                       |
| `R2_ACCOUNT_ID`       |          | Cloudflare account ID                               |
| `R2_ACCESS_KEY_ID`    |          | R2 API token access key                             |
| `R2_SECRET_ACCESS_KEY`|          | R2 API token secret key                             |
| `R2_BUCKET`           |          | R2 bucket name                                      |
| `VITE_CDN_BASE_URL`   |          | Public CDN base URL (e.g. `https://cdn.example.com`)|

### 4. Run (development)

```bash
npm run dev:all
```

This starts both Vite (port 5000) and the Express API (port 3001) via `concurrently`. Vite proxies all `/api` requests to the backend automatically.

- App: <http://localhost:5000>
- API: <http://localhost:3001/api/health>

### 5. First user

The very first account created via Sign Up is automatically assigned the `admin` role.

---

## 🌐 Cloudflare R2 Setup

1. Create an R2 bucket in the Cloudflare dashboard.
2. Create an **API token** with Object Read + Write permissions and note the access/secret keys.
3. Set the five `R2_*` environment variables (see table above).
4. Configure **CORS** on the bucket:

```json
[{
  "AllowedOrigins": ["https://your-app.com", "http://localhost:5000"],
  "AllowedMethods": ["PUT", "GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}]
```

5. Optionally connect a **Custom Domain** (R2 → bucket → Settings → Custom Domains) and set `VITE_CDN_BASE_URL` to it.

---

## 📖 REST API

All endpoints are prefixed `/api`. Authenticated routes require `Authorization: Bearer <jwt>`.

### Auth

```bash
POST /api/auth/signup   { email, password }  → { token, user }
POST /api/auth/signin   { email, password }  → { token, user }
GET  /api/auth/me                            → { id, email, role }
```

### Files

```bash
GET    /api/files                            → file[]
POST   /api/files/presign  { filename, mime, size }  → { url, fileId }
POST   /api/files/confirm  { fileId }        → { ok }
PATCH  /api/files/:id      { name?, folder?, visibility?, favorite? }
DELETE /api/files/:id
```

### API Keys

```bash
GET    /api/keys
POST   /api/keys           { name }          → { key (shown once), id, … }
DELETE /api/keys/:id                         # revokes the key
```

### Analytics

```bash
GET /api/analytics           → { byDay[], byAction[] }
GET /api/analytics/overview  → { files, storage, keys, requests, quota }
```

### Admin (admin role required)

```bash
GET    /api/admin/users
GET    /api/admin/files
DELETE /api/admin/files/:id
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens signed with `JWT_SECRET`, expire in 7 days
- API keys stored as **SHA-256 hashes** — raw key shown once at creation
- R2 presigned PUT URLs expire in 15 minutes
- `requireAdmin` middleware blocks non-admin access to `/api/admin`

---

## 🧪 Scripts

```bash
npm run dev         # Vite only (frontend)
npm run server      # Express API only
npm run dev:all     # Both together (recommended for local dev)
npm run build       # Production build → dist/
npm run preview     # Preview prod build locally
```

---

## 🚢 Deployment

The frontend builds to a static `dist/` folder. The Express backend must be hosted as a Node.js service.

### Option A — Render

1. **Backend**: New → Web Service → Node → build `npm install`, start `node server/index.js`. Add all env vars.
2. **Frontend**: New → Static Site → build `npm run build`, publish `dist/`. Add SPA rewrite `/* → /index.html`.
3. Point `VITE_API_BASE_URL` (build-time) at your backend URL, or proxy via the static host.

### Option B — Railway / Fly.io / any Node host

Deploy `server/` as a Node 20 app, set env vars, expose port 3001. Host `dist/` on Vercel/Netlify/Cloudflare Pages with SPA fallback.

### Post-deploy Checklist

- [ ] `MONGODB_URI` set on backend host
- [ ] `JWT_SECRET` set on backend host (keep it private)
- [ ] `R2_*` secrets set on backend host
- [ ] `VITE_CDN_BASE_URL` set at frontend build time
- [ ] R2 bucket CORS includes deployed frontend origin
- [ ] Smoke test: sign up → upload → copy public link → load via CDN domain

---

## 🛠 Troubleshooting

| Symptom                                    | Fix                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `MONGODB_URI environment variable is not set` | Set the variable and restart the server                              |
| Upload returns 503                         | Set all five `R2_*` env vars and restart                               |
| `/api/*` returns 404 in dev                | Ensure `npm run dev:all` is running (not just `npm run dev`)            |
| Refresh on `/app/files` returns 404        | Host not configured for SPA fallback — rewrite `/* → /index.html`      |
| JWT errors after changing `JWT_SECRET`     | All existing tokens are invalidated — users must sign in again          |

---

## 📜 License

MIT © Developer Darrell Mucheri

---

**Fundo CDN** — Lightning-fast file hosting & delivery.
Crafted with care by **Developer Darrell Mucheri**.
