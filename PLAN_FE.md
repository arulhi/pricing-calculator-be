# PLAN_FE — Frontend Integration Guide

## Overview

The backend is a NestJS REST API deployed on Vercel, backed by Supabase (PostgreSQL). All endpoints are prefixed with `/api`. Swagger docs are available at `/api/docs`.

---

## Base URL

| Environment | URL |
|---|---|
| Local Dev | `http://localhost:3001` |
| Production | `https://spfio-api.vercel.app` |

Set `NEXT_PUBLIC_API_URL` in frontend's `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Auth Flow

The frontend login page (`/admin/login`) sends `{ username, password }` to `POST /api/auth/login`. The backend maps `username` → `email` for Supabase Auth.

```
POST /api/auth/login { username, password }
  → 200 { token: "eyJ..." }

GET /api/auth/me  (Authorization: Bearer <token>)
  → 200 { id: "uuid", email: "admin@spf.io" }
```

Store the token in `localStorage` under key `spfio_admin_token`. The existing `src/lib/api.ts` already handles this automatically — it reads the token and attaches it as `Authorization: Bearer <token>` on every request.

---

## Registration (CLI only)

`POST /api/auth/register` creates a Supabase Auth user + admin profile row. This endpoint is intended for initial setup (admin dashboard registration to be added later).

---

## Endpoints

### Service Types — `/api/service-types`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/service-types` | — | List all (public, used by pricing calculator) |
| `POST` | `/api/service-types` | Admin | Create a service type |
| `PUT` | `/api/service-types/:id` | Admin | Update a service type |
| `DELETE` | `/api/service-types/:id` | Admin | Delete a service type |

**Response shape (GET):**
```json
[
  {
    "id": "live-events",
    "name": "Live Events",
    "desc": "Real-time captions, translations & streaming",
    "rate": 150,
    "unit": "hour"
  }
]
```

**Request shape (POST/PUT):**
```json
{
  "id": "live-events",
  "name": "Live Events",
  "desc": "Real-time captions, translations & streaming",
  "rate": 150,
  "unit": "hour"
}
```

> Note: `desc` in the API maps to `description` in the database. The API always speaks `desc` to match the frontend interface.

---

### Add-ons — `/api/addons`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/addons` | — | List all (public, used by pricing calculator) |
| `POST` | `/api/addons` | Admin | Create an add-on |
| `PUT` | `/api/addons/:id` | Admin | Update an add-on |
| `DELETE` | `/api/addons/:id` | Admin | Delete an add-on |

**Response shape (GET):**
```json
[
  {
    "id": "text-to-speech",
    "name": "Text-to-Speech",
    "desc": "AI voice output for translations",
    "price": 50,
    "unit": "event"
  }
]
```

**Request shape (POST/PUT):**
```json
{
  "id": "text-to-speech",
  "name": "Text-to-Speech",
  "desc": "AI voice output for translations",
  "price": 50,
  "unit": "event"
}
```

---

### Submissions (Quote Requests) — `/api/submissions`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/submissions` | — | Submit a quote (public, from pricing calculator) |
| `GET` | `/api/submissions` | Admin | List all submissions |
| `GET` | `/api/submissions/:id` | Admin | Get a single submission |
| `DELETE` | `/api/submissions/:id` | Admin | Delete a submission |

**Request shape (POST):**
```json
{
  "serviceType": "live-events",
  "serviceName": "Live Events",
  "hours": 4,
  "languages": 3,
  "attendees": 500,
  "premiumLanguages": false,
  "selectedAddons": ["text-to-speech", "polls"],
  "totalEstimate": 2450,
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "company": "Acme Inc",
    "message": "Looking for conference translation services"
  }
}
```

**Response shape (GET — all fields):**
```json
{
  "id": "uuid",
  "timestamp": 1712345678000,
  "serviceType": "live-events",
  "serviceName": "Live Events",
  "hours": 4,
  "languages": 3,
  "attendees": 500,
  "premiumLanguages": false,
  "selectedAddons": ["text-to-speech"],
  "totalEstimate": 2450,
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "company": "Acme Inc",
    "message": "Looking for conference translation services"
  }
}
```

> Note: The API uses camelCase + nested `formData` matching the frontend `Submission` interface exactly. Mapping to/from DB snake_case is handled by the backend.

---

### Contact (Request-a-Quote) — `/api/contact`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contact` | — | Submit contact form (public) |

**Request shape:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "company": "Acme Inc",
  "service": "live-events",
  "message": "Tell us about your project..."
}
```

No auth required. The `/request-a-quote` page already calls this endpoint with `api.post("/api/contact", form)`.

---

## Frontend Files Already Integrated

These files already point to the backend and need **no changes**:

| File | Endpoint |
|---|---|
| `src/data/service-types.ts` | `GET/POST/PUT/DELETE /api/service-types` |
| `src/data/addons.ts` | `GET/POST/PUT/DELETE /api/addons` |
| `src/data/submissions.ts` | `GET/POST/DELETE /api/submissions` |
| `src/app/admin/login/page.tsx` | `POST /api/auth/login` |
| `src/app/admin/layout.tsx` | `GET /api/auth/me` for auth check |
| `src/app/request-a-quote/page.tsx` | `POST /api/contact` |
| `src/lib/api.ts` | Centralized fetch with JWT handling |

---

## Data Type Mapping

### ServiceType
```typescript
// Frontend interface (src/data/service-types.ts)
interface ServiceType {
  id: string
  name: string
  desc: string        // ← maps to DB column "description"
  rate: number
  unit: string
}
```

### Addon
```typescript
// Frontend interface (src/data/addons.ts)
interface Addon {
  id: string
  name: string
  desc: string        // ← maps to DB column "description"
  price: number
  unit: string
}
```

### Submission
```typescript
// Frontend interface (src/data/submissions.ts)
interface Submission {
  id: string
  timestamp: number            // JS timestamp (ms), from DB created_at
  serviceType: string          // → DB service_type
  serviceName: string          // → DB service_name
  hours: number
  languages: number
  attendees: number
  premiumLanguages: boolean    // → DB premium_languages
  selectedAddons: string[]     // → DB selected_addons (JSONB)
  totalEstimate: number        // → DB total_estimate
  formData: {
    firstName: string          // → DB first_name
    lastName: string           // → DB last_name
    email: string
    company: string
    message: string
  }
}
```

---

## Admin Credentials

### Local Dev (in-memory mock — no Supabase needed)

| Field | Value |
|---|---|
| Username/Email | `admin@spf.io` |
| Password | `adminspfio123` |

The mock auto-seeds this user on startup. Login at `/admin/login`.

### Production (Supabase)

Run the seed script to create the admin user:

```bash
# Ensure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npx ts-node scripts/seed.ts
```

Or register via the API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@spf.io","password":"adminspfio123"}'
```

---

## Quick Setup

```bash
# 1. No .env needed for local dev — runs in-memory mock
npm run start:dev     # → http://localhost:3001

# 2. Swagger docs
open http://localhost:3001/api/docs

# 3. Login with admin@spf.io / adminspfio123

# 4. Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### With Supabase

```bash
# 1. Backend .env
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# 2. Run schema in Supabase SQL Editor (sql/schema.sql)

# 3. Seed admin user
npx ts-node scripts/seed.ts

# 4. Start backend
npm run start:dev
```

---

## Admin Flow

1. Register an admin account (via API: `POST /api/auth/register` or Supabase dashboard)
2. Go to `/admin/login` → enter email + password
3. Token stored in `localStorage` → redirected to `/admin`
4. Admin layout verifies token via `GET /api/auth/me` on every route change
5. CRUD service types and add-ons via admin pages
6. View submissions on admin dashboard
