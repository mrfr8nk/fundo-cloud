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

| Layer          | Tech                                                       |
| -------------- | ---------------------------------------------------------- |
| Frontend       | **React 19 + Vite 7** (SPA), **react-router-dom v7**      |
| UI             | TailwindCSS v4, shadcn/ui, Lucide, Recharts, Sonner       |
| Backend        | Supabase (Postgres + Auth + Edge Functions / Deno)         |
| Storage / CDN  | Cloudflare R2 (S3-compatible) + custom domain              |
| Build runtime  | Bun (or Node 20+)                                          |
| Validation     | Zod                                                        |

> This project is a **plain React + Vite SPA** — no SSR, no TanStack Start, no Cloudflare Workers. It deploys as static files to any host (Vercel, Render, Netlify, Cloudflare Pages, S3, etc.).

## 📂 Project Structure

```
index.html              Vite entry HTML
src/
  main.tsx              React + BrowserRouter bootstrap
  App.tsx               Route table (react-router-dom)
  styles.css            Tailwind v4 + design tokens
  pages/
    Landing.tsx         Public landing page (/)
    Auth.tsx            Sign in / Sign up (/auth)
    app/
      AppLayout.tsx     Authenticated dashboard shell (/app)
      Overview.tsx      /app
      Files.tsx         /app/files
      Keys.tsx          /app/keys
      Docs.tsx          /app/docs
      Analytics.tsx     /app/analytics
      Admin.tsx         /app/admin
  integrations/supabase/ Auto-generated Supabase client + types
  hooks/useAuth.ts       Session + roles hook
  lib/                   Utilities (format, etc.)
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

- Node 20+ or Bun 1.1+
- A Supabase project (auto-provisioned in Lovable Cloud)
- A Cloudflare R2 bucket + API token

### 2. Install

```bash
bun install
# or: npm install
```

### 3. Environment

`.env` (auto-managed — do not edit manually):

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### 4. Backend Secrets

Set these in Supabase → Edge Functions → Secrets:

| Secret                      | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `R2_ACCOUNT_ID`             | Cloudflare account ID                              |
| `R2_ACCESS_KEY_ID`          | R2 access key                                      |
| `R2_SECRET_ACCESS_KEY`      | R2 secret key                                      |
| `R2_BUCKET`                 | R2 bucket name                                     |
| `R2_PUBLIC_BASE_URL`        | e.g. `https://cdn.synapex.co.zw`                   |

### 5. R2 Bucket CORS

Cloudflare → R2 → bucket → Settings → CORS Policy:

```json
[{
  "AllowedOrigins": [
    "https://cdn.synapex.co.zw",
    "https://your-app.vercel.app",
    "http://localhost:8080"
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

App: <http://localhost:8080>

## 🌐 Custom Domain (Cloudflare R2)

1. Cloudflare → R2 → bucket → **Settings → Custom Domains → Connect Domain**
2. Enter `cdn.synapex.co.zw`
3. Cloudflare creates the DNS record + SSL automatically (1–2 min)
4. Set `R2_PUBLIC_BASE_URL` secret to `https://cdn.synapex.co.zw`

## 📖 REST API

Base URL: `https://<project-id>.functions.supabase.co`

All requests require `Authorization: Bearer fundo_live_xxx`.

```bash
# Upload
curl -X POST $BASE/api-upload \
  -H "Authorization: Bearer fundo_live_xxx" \
  -F "file=@./logo.png" -F "visibility=public"

# List
curl $BASE/api-files -H "Authorization: Bearer fundo_live_xxx"

# Delete
curl -X POST $BASE/api-files \
  -H "Authorization: Bearer fundo_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"action":"delete","fileId":"<uuid>"}'
```

## 🔐 Security

- **RLS** on every table; users only see their own rows (admins bypass via `has_role()`)
- API keys stored as **SHA-256 hashes** — raw key shown once at creation
- Direct-to-R2 uploads via short-lived (15 min) presigned URLs
- File extension allowlist (`.exe`, `.bat`, `.sh`, … blocked)
- 100 MB per-file limit, per-user storage + bandwidth quotas

## 🧪 Scripts

```bash
bun dev          # Vite dev server (port 8080)
bun run build    # Production build → dist/
bun run preview  # Preview prod build locally
```

---

## 🚢 Deployment

This is a **static SPA** — `bun run build` produces a `dist/` folder with `index.html` + assets. Deploy that folder anywhere.

> All three host options below require **SPA fallback** (every URL → `index.html`) so client-side routes like `/app/files` work on direct loads / refreshes.

### Option A — Deploy on Vercel

1. **Push to GitHub** and import the repo at <https://vercel.com/new>.
2. **Framework preset**: `Vite` (auto-detected).
3. **Build settings** (defaults are correct):
   - Install Command: `bun install` (or leave blank)
   - Build Command: `bun run build`
   - Output Directory: `dist`
4. **Environment Variables** (Project → Settings → Environment Variables):

   | Key                              | Value                       |
   | -------------------------------- | --------------------------- |
   | `VITE_SUPABASE_URL`              | `https://xxx.supabase.co`   |
   | `VITE_SUPABASE_PUBLISHABLE_KEY`  | your publishable (anon) key |
   | `VITE_SUPABASE_PROJECT_ID`       | your project ref            |

5. **SPA rewrite** — A `vercel.json` is already included in this repo. It rewrites every URL to `index.html` so client-side routes like `/app/files` work on direct load and browser refresh without 404s.

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

   > No manual step needed — just make sure you don't delete `vercel.json` from the root.

6. **Deploy**. Add a custom domain in Project → Settings → Domains.
7. **Update R2 CORS** with the new Vercel URL + custom domain.

> ⚠️ Edge functions (`supabase/functions/*`) deploy via Supabase, not Vercel:
> ```bash
> npx supabase functions deploy r2-presign-put r2-confirm r2-sign-get r2-delete key-mint api-upload api-files
> ```

### Option B — Deploy on Render

Render hosts static sites for free with automatic HTTPS and global CDN.

#### Step-by-step

1. **Push your code to GitHub** (or GitLab).

2. Go to <https://dashboard.render.com> → click **New +** → **Static Site**.

3. **Connect your repository** — authorize Render to access GitHub if prompted, then select this repo.

4. **Configure the build**:

   | Field               | Value                       |
   | ------------------- | --------------------------- |
   | Name                | `fundo-cdn` (or anything)   |
   | Branch              | `main`                      |
   | Build Command       | `npm ci && npm run build`   |
   | Publish Directory   | `dist`                      |

   > Use `npm ci` (not `npm install`) — it reads `package-lock.json` directly and avoids the `"Exit handler never called!"` npm bug that appears on some Render Node versions.
   > A `.node-version` file is included in this repo that pins Node 20, which Render automatically picks up.

5. **Add environment variables** — scroll to **Environment Variables** on the same page and add:

   | Key                              | Value                       |
   | -------------------------------- | --------------------------- |
   | `VITE_SUPABASE_URL`              | `https://xxx.supabase.co`   |
   | `VITE_SUPABASE_PUBLISHABLE_KEY`  | your publishable (anon) key |
   | `VITE_SUPABASE_PROJECT_ID`       | your project ref            |

6. **Fix SPA routing (prevents 404 on refresh)** — after the site is created, go to:
   **Dashboard → your site → Redirects/Rewrites → Add Rule**

   | Field       | Value          |
   | ----------- | -------------- |
   | Source      | `/*`           |
   | Destination | `/index.html`  |
   | Type        | **Rewrite**    |

   Click **Save Changes**. Without this rule, navigating directly to `/app/files` or refreshing any non-root URL returns a 404.

7. Click **Create Static Site** — Render builds and deploys automatically. You'll get a live URL like `https://fundo-cdn.onrender.com`.

8. **(Optional) Custom domain** — Settings → Custom Domains → add your domain and point a CNAME at `fundo-cdn.onrender.com`.

9. **Update R2 CORS** — add your new Render URL (and custom domain) to the R2 bucket CORS policy.

10. **Deploy Supabase edge functions** the same way as above:
    ```bash
    npx supabase functions deploy r2-presign-put r2-confirm r2-sign-get r2-delete key-mint api-upload api-files
    ```

#### Optional: `render.yaml` (Infrastructure as Code)

Add this file to the repo root to version-control your Render config:

```yaml
services:
  - type: web
    name: fundo-cdn
    runtime: static
    buildCommand: npm ci && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_PUBLISHABLE_KEY
        sync: false
      - key: VITE_SUPABASE_PROJECT_ID
        sync: false
```

With `render.yaml` present, the rewrite rule and build settings are applied automatically — no manual dashboard config needed.

### Option C — Cloudflare Pages / Netlify / S3

`bun run build`, upload `dist/`, configure SPA fallback (`/* → /index.html`). Done.

### Post-deploy Checklist

- [ ] `R2_PUBLIC_BASE_URL` secret set to your CDN domain
- [ ] R2 bucket CORS includes all deployed origins
- [ ] R2 bucket has Custom Domain connected
- [ ] Supabase Auth → URL Configuration → add deployed URL to **Site URL** + **Redirect URLs**
- [ ] Google OAuth redirect URI updated in Google Cloud Console
- [ ] Edge functions deployed (`supabase functions deploy …`)
- [ ] Smoke test: sign up → upload → copy public link → load via CDN domain

---

## 🛠 Troubleshooting

| Symptom                                              | Fix                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `permission denied for function has_role`            | `GRANT EXECUTE ON FUNCTION public.has_role TO authenticated, anon, service_role;`         |
| Upload XHR fails with CORS error                     | Add deployed origin to R2 bucket CORS policy                                              |
| Public URL returns 403                               | File `visibility` is `private` — use `/r2-sign-get` for a signed URL                      |
| Refresh on `/app/files` returns 404                  | Host is not configured for SPA fallback — see Deployment section                          |
| Auth redirect lands on `localhost`                   | Set Site URL + Redirect URLs in Supabase Auth settings                                    |
| `vite: command not found` on Vercel                  | Install Command must be `bun install`, NOT `bun run build`                                |

---

## 📜 License

MIT © Developer Darrell Mucheri

---

**Fundo CDN** — Lightning-fast file hosting & delivery.
Crafted with care by **Developer Darrell Mucheri**.
