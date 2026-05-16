# Fundo CDN

A production-grade file hosting & content delivery platform with a futuristic neon UI, presigned direct-to-R2 uploads, a developer REST API, per-user quotas, and an admin console.

Built by **Developer Darrell Mucheri**.

---

## ✨ Features

- **Direct-to-R2 uploads** via presigned URLs (no server bandwidth)
- **Public + private** files with time-boxed signed share links
- **Developer REST API** with hashed Bearer keys (`fundo_live_*`)
- **Per-user quotas** (storage / bandwidth) with usage logs
- **Admin panel** for user & file moderation
- **Analytics dashboard** (storage, bandwidth, requests) with Recharts
- **Auth** via email/password + Google OAuth
- **Futuristic neon glassmorphism** design system

## 🧱 Tech Stack

| Layer          | Tech                                                   |
| -------------- | ------------------------------------------------------ |
| Frontend       | React 19, TanStack Start, TanStack Router, TailwindCSS |
| UI             | shadcn/ui, Lucide, Recharts, Sonner                    |
| Backend        | Supabase (Postgres + Auth + Edge Functions / Deno)     |
| Storage / CDN  | Cloudflare R2 (S3-compatible) + custom domain          |
| Build runtime  | Vite 7, Bun, Cloudflare Workers (SSR)                  |
| Validation     | Zod                                                    |

## 📂 Project Structure

```
src/
  routes/                TanStack Start file-based routes
    index.tsx            Landing page
    auth.tsx             Sign in / Sign up
    app/                 Authenticated dashboard
      files.tsx          Library + drag-drop upload
      keys.tsx           API key management
      docs.tsx           Interactive API docs
      analytics.tsx      Usage charts
      admin.tsx          Admin console
  integrations/supabase/ Auto-generated Supabase client + types
  hooks/useAuth.ts       Session + roles hook
  lib/                   Utilities (format, error capture)
supabase/
  migrations/            SQL migrations (tables, RLS, functions)
  functions/             Deno edge functions
    r2-presign-put/      Issue presigned PUT URL
    r2-confirm/          Verify object & write metadata
    r2-sign-get/         Issue presigned GET URL
    r2-delete/           Delete object + row
    key-mint/            Generate API key
    api-upload/          Public REST: upload (multipart)
    api-files/           Public REST: list / delete
```

## 🚀 Local Setup

### 1. Prerequisites

- Node 20+ / Bun 1.1+
- A Supabase project (auto-provisioned in Lovable Cloud)
- A Cloudflare R2 bucket + API token

### 2. Install

```bash
bun install
```

### 3. Environment

`.env` (auto-managed by Lovable Cloud — do not edit manually):

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### 4. Backend Secrets

Configure these in Supabase → Edge Functions → Secrets:

| Secret                      | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `R2_ACCOUNT_ID`             | Cloudflare account ID                              |
| `R2_ACCESS_KEY_ID`          | R2 access key                                      |
| `R2_SECRET_ACCESS_KEY`      | R2 secret key                                      |
| `R2_BUCKET`                 | R2 bucket name                                     |
| `R2_PUBLIC_BASE_URL`        | e.g. `https://cdn.synapex.co.zw`                   |

### 5. R2 Bucket CORS

In Cloudflare → R2 → your bucket → Settings → CORS Policy:

```json
[{
  "AllowedOrigins": [
    "https://cdn.synapex.co.zw",
    "https://your-app.lovable.app",
    "http://localhost:3000"
  ],
  "AllowedMethods": ["PUT", "GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}]
```

### 6. Run

```bash
bun dev
```

App: <http://localhost:3000>

## 🌐 Custom Domain (Cloudflare R2)

1. Cloudflare → R2 → your bucket → **Settings → Custom Domains** → **Connect Domain**
2. Enter `cdn.synapex.co.zw`
3. Cloudflare creates the DNS record + SSL automatically (1–2 min)
4. Make sure the `R2_PUBLIC_BASE_URL` secret matches: `https://cdn.synapex.co.zw`

All public file URLs and API responses will resolve through your domain.

## 📖 REST API

Base URL: `https://<project-id>.functions.supabase.co`

All requests require `Authorization: Bearer fundo_live_xxx`.

### Upload

```bash
curl -X POST $BASE/api-upload \
  -H "Authorization: Bearer fundo_live_xxx" \
  -F "file=@./logo.png" \
  -F "visibility=public"
```

### List

```bash
curl $BASE/api-files -H "Authorization: Bearer fundo_live_xxx"
```

### Delete

```bash
curl -X POST $BASE/api-files \
  -H "Authorization: Bearer fundo_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"action":"delete","fileId":"<uuid>"}'
```

Response shape:

```json
{
  "id": "uuid",
  "name": "logo.png",
  "size": 12345,
  "mime": "image/png",
  "url": "https://cdn.synapex.co.zw/<key>",
  "visibility": "public",
  "created_at": "2026-01-01T00:00:00Z"
}
```

## 🔐 Security Model

- **RLS** on every table; users can only read/write their own rows (admins bypass via `has_role()`)
- API keys stored as **SHA-256 hashes** — raw key shown only once at creation
- Direct-to-R2 uploads via short-lived (15 min) presigned URLs
- File extension allowlist (`.exe`, `.bat`, `.sh`, ... blocked)
- 100 MB per-file limit
- Per-user storage + bandwidth quotas enforced on upload + download

## 🧪 Scripts

```bash
bun dev          # Vite dev server
bun run build    # Production build
bun run preview  # Preview prod build locally
```

---

## 🚢 Deployment

> **Note**: Fundo CDN runs on TanStack Start with SSR via Cloudflare Workers by default. Vercel and Render are supported via the Node/Static adapters.

### Option A — Deploy on Vercel

1. **Push to GitHub** — connect your repo to a Vercel project.
2. **Import** the project in Vercel → **New Project** → select repo.
3. **Framework preset**: `Vite` (Vercel auto-detects).
4. **Build settings** — leave defaults; Vercel reads `package.json`:
   - Install: `bun install` (or `npm install`)
   - Build: `bun run build`
   - Output: `.output/public` (TanStack Start's static output)
5. **Environment Variables** (Project Settings → Environment Variables):

   | Key                              | Value                              |
   | -------------------------------- | ---------------------------------- |
   | `VITE_SUPABASE_URL`              | `https://xxx.supabase.co`          |
   | `VITE_SUPABASE_PUBLISHABLE_KEY`  | your publishable (anon) key        |
   | `VITE_SUPABASE_PROJECT_ID`       | your project ref                   |

6. **Deploy**. Vercel gives you `your-app.vercel.app`.
7. **Custom domain** — Project → Settings → Domains → add `app.synapex.co.zw` (or similar). Add the CNAME at Cloudflare.
8. **Update R2 CORS** to include the new Vercel URL + custom domain.

> ⚠️ Edge functions (`supabase/functions/*`) are **not** deployed by Vercel — they run on Supabase. Deploy them separately:
> ```bash
> npx supabase functions deploy r2-presign-put r2-confirm r2-sign-get r2-delete key-mint api-upload api-files
> ```

### Option B — Deploy on Render

1. **Push to GitHub**.
2. Render → **New** → **Web Service** → connect repo.
3. **Settings**:
   - **Environment**: `Node`
   - **Build Command**: `bun install && bun run build`
   - **Start Command**: `bun run preview -- --host 0.0.0.0 --port $PORT`
     *(or for SSR: `node .output/server/index.mjs`)*
   - **Node Version**: 20+
4. **Environment Variables** — same three `VITE_*` vars as above.
5. **Create Web Service** → Render gives you `your-app.onrender.com`.
6. **Custom domain** — Service → Settings → Custom Domains → add yours → add CNAME at Cloudflare.
7. **Update R2 CORS** with the new origins.
8. Deploy Supabase edge functions the same way as above.

### Option C — Static-only (cheapest)

If you only need the frontend (Supabase handles all backend), deploy the static build:

```bash
bun run build
# upload .output/public/ to any static host (Cloudflare Pages, Netlify, S3)
```

### Post-deploy Checklist

- [ ] `R2_PUBLIC_BASE_URL` secret set to your CDN domain
- [ ] R2 bucket CORS includes all deployed origins
- [ ] R2 bucket has Custom Domain connected
- [ ] Supabase Auth → URL Configuration → add deployed URL to **Site URL** + **Redirect URLs**
- [ ] Google OAuth redirect URI updated in Google Cloud Console
- [ ] Edge functions deployed (`supabase functions deploy ...`)
- [ ] Smoke test: sign up → upload → copy public link → load via CDN domain

---

## 🛠 Troubleshooting

| Symptom                                              | Fix                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `permission denied for function has_role`            | `GRANT EXECUTE ON FUNCTION public.has_role TO authenticated, anon, service_role;`         |
| Upload XHR fails with CORS error                     | Add deployed origin to R2 bucket CORS policy                                              |
| Public URL returns 403                               | File `visibility` is `private` — use `/r2-sign-get` to get a signed URL                   |
| Auth redirect lands on `localhost`                   | Set Site URL + Redirect URLs in Supabase Auth settings                                    |
| `Object missing` on confirm                          | Presigned URL expired (15 min) — re-request                                               |

---

## 📜 License

MIT © Developer Darrell Mucheri

---

**Fundo CDN** — Lightning-fast file hosting & delivery.
Crafted with care by **Developer Darrell Mucheri**.
