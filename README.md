# Billiard Admin

Admin dashboard for the multi-vendor billiard booking API ([`billiard-api`](../billiard-api)). Next.js (App Router) + TypeScript + Tailwind CSS v4, talking to the Laravel backend over its Sanctum token API.

## Setup

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your Laravel API
npm run dev
```

The backend must be running (`php artisan serve`) and reachable at the URL in `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api/v1`). Log in with any seeded user, e.g. a `vendor_admin` from `php artisan db:seed`.

## What's real vs. placeholder

Wired to the real API: **Dashboard**, **Booking**, **Meja Billiard**, **Member**, **User & Role** (the last one only for `super_admin`/`vendor_admin`, matching the backend's `UserPolicy`).

Everything else in the sidebar (**Jadwal**, **Pembayaran**, **Promo**, **Laporan**, **Notifikasi**, **Pengaturan**, **Log Aktivitas**) is a "Coming Soon" placeholder — those don't have a backing API endpoint yet.

## Structure

- `src/lib/api.ts` — fetch wrapper that attaches the Sanctum bearer token
- `src/lib/auth.tsx` — auth context (login/logout/me), token kept in `localStorage`
- `src/lib/nav.ts` — sidebar item config, including per-role visibility
- `src/lib/useApiList.ts` — small hook for fetching a paginated list endpoint
- `src/components/layout` — `Sidebar`, `Topbar`, `DashboardShell` (auth guard + chrome)
- `src/app/(dashboard)/*` — all authenticated pages, sharing the shell via the route group layout
