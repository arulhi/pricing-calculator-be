# DEPLOY_PLAN — Deployment Guide

## Overview

Two services need to be set up:

| Service | Purpose |
|---|---|
| **Supabase** | PostgreSQL database + Auth |
| **Render** | Hosting the NestJS API (recommended for long-running Node apps) |

> **Note:** NestJS is designed as a long-running server, not serverless. Render is recommended over Vercel because it runs a persistent Node.js process. Vercel alternatives are listed at the bottom.

---

## Step 1 — Supabase Project

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Fill in:
   - **Name:** `spfio-api`
   - **Database Password:** Generate a strong password (save this)
   - **Region:** Pick the closest to your audience (e.g. `Singapore` or `US East`)
   - **Pricing Plan:** Free tier is fine to start
4. Click **Create new project**
5. Wait ~2 minutes for the database to provision

### 1.2 Run Schema

1. In the Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open `sql/schema.sql` from the backend repo
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run**
6. Verify: You should see `CREATE TABLE` and `INSERT 0 4` / `INSERT 0 5` success messages

This creates:
- `admin_users` — admin profiles
- `service_types` — seeded with 4 service types
- `addons` — seeded with 5 add-ons
- `submissions` — quote requests (empty)
- `contacts` — contact form entries (empty)

### 1.3 Get API Credentials

1. In Supabase dashboard, go to **Project Settings > API**
2. Find these two values:

| Key | Where to find |
|---|---|
| `SUPABASE_URL` | **Project URL** (looks like `https://xxxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API Keys > `service_role` key** (starts with `eyJ...`) |

> ⚠️ The `service_role` key has admin privileges. Never expose it to the frontend or client-side code.

### 1.4 Seed Admin User

> Skip this step if you already created an admin via the API.

Run the seed script from the backend directory:

```bash
# Make sure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npx ts-node scripts/seed.ts
```

This creates:
- Supabase Auth user: `admin@spf.io` / `admin123`
- Record in `admin_users` table

---

## Step 2 — Environment Variables

### 2.1 Backend `.env`

Create `.env` by copying the example:

```bash
cp .env.example .env
```

Fill in the values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key...
JWT_SECRET=<run: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

Generate a JWT secret:

```bash
openssl rand -hex 32
```

### 2.2 Verify Local Connection

```bash
npm run start:dev
```

Check that:
- Server starts without the `SUPABASE_URL not set` warning (means it connected to real Supabase)
- `GET http://localhost:3001/api/service-types` returns the 4 seeded service types
- `POST http://localhost:3001/api/auth/login` with `admin@spf.io` / `admin123` works

---

## Step 3 — Deploy to Render

[Render](https://render.com) is recommended over Vercel for NestJS because it runs a persistent Node.js process.

### 3.1 Create a Render Account

1. Go to [render.com](https://render.com) and sign up (GitHub login works)
2. Click **New + > Web Service**
3. Connect your GitHub repository

### 3.2 Configure the Web Service

| Setting | Value |
|---|---|
| **Name** | `spfio-api` |
| **Region** | Pick the closest to your audience |
| **Branch** | `main` |
| **Root Directory** | (leave empty) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/main` |
| **Plan** | Free (or Starter for $7/month) |

### 3.3 Add Environment Variables

In Render dashboard, go to your service > **Environment** and add:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |
| `JWT_SECRET` | Your generated secret |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render uses this internally) |

### 3.4 Deploy

1. Click **Create Web Service**
2. Render will build and deploy automatically (~3-5 minutes)
3. Once done, you get a URL like `https://spfio-api.onrender.com`

### 3.5 Verify Deployment

```bash
curl https://spfio-api.onrender.com/api/service-types
curl https://spfio-api.onrender.com/api/addons

curl -X POST https://spfio-api.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin@spf.io","password":"admin123"}'
```

### 3.6 Redeploy on Changes

Push to `main` branch — Render auto-deploys. Or click **Manual Deploy** from the Render dashboard.

---

## Alternative — Deploy to Vercel (experimental)

NestJS is designed for long-running servers, but can be deployed to Vercel with limitations.

1. Remove the `start:prod` script's listener in `main.ts` (Vercel doesn't support `app.listen`)
2. The `handler` export in `main.ts` uses `@vendia/serverless-express` which translates API Gateway events to Express
3. Set `vercel-build` script: `"vercel-build": "npm run build"`
4. Configure in Vercel:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/`

> ⚠️ **Known issues:** Vercel uses esbuild for serverless functions, which doesn't support `emitDecoratorMetadata`. The pre-compiled `dist/` output may not bundle correctly. Render or Railway are more reliable choices for NestJS.

---

## Step 4 — Connect Frontend

### 4.1 Update `.env.local`

In the frontend repo (`pricing-calculator/`), update `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://spfio-api.vercel.app
```

### 4.2 Test

Start the frontend locally:

```bash
cd pricing-calculator
npm run dev
```

Verify:
- Pricing calculator loads service types from the deployed API
- "Request a Quote" form submits successfully
- Admin login at `/admin/login` works
- Admin dashboard shows submissions with status

### 4.3 Deploy Frontend

Deploy the frontend to Vercel (or its existing host) pointing `NEXT_PUBLIC_API_URL` to the backend URL.

---

## Step 5 — Production Checklist

- [ ] Change the default admin password (`admin123`) after first login
- [ ] Set up custom domain for Vercel (e.g. `api.spf.io`)
- [ ] Configure CORS in `main.ts` to allow only your frontend domain
- [ ] Enable Supabase Row Level Security (RLS) for production
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)
- [ ] Configure database backups in Supabase (Project Settings > Database > Backups)

---

## Troubleshooting

### "supabaseUrl is required" or "Supabase not configured"

The `.env` file is missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`.

**Fix:** Copy `.env.example` to `.env` and fill in the values from Supabase Project Settings > API.

### Deployment fails on Vercel

Check the build logs in Vercel dashboard. Common issues:
- Missing environment variables → Set them in Vercel project settings
- TypeScript errors → Run `npm run build` locally first
- Node.js version mismatch → Set to 20.x in Vercel project settings

### Login returns 401

The admin user doesn't exist in Supabase Auth. Run the seed script:
```bash
npx ts-node scripts/seed.ts
```

Or register via API:
```bash
curl -X POST https://spfio-api.vercel.app/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@spf.io","password":"admin123"}'
```

### CORS errors from frontend

The backend's `main.ts` has `enableCors` with specific origins. Add your frontend URL:
```typescript
origin: ['http://localhost:3000', 'https://your-frontend.vercel.app']
```

### Database connection issues

- Verify `SUPABASE_URL` is correct (ends with `.supabase.co`)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (starts with `eyJ`)
- Check Supabase dashboard for any project restrictions or IP access rules

---

## Quick Reference

```bash
# Local development (in-memory mock, no Supabase needed)
npm run start:dev

# Local development (with Supabase)
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run start:dev

# Seed admin user in Supabase
npx ts-node scripts/seed.ts

# Build for production
npm run build

# Deploy to Vercel
git push origin main
```
