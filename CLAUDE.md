# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Alumni Connect** — A platform connecting alumni with their school community. Staff can invite alumni, post jobs/events, and scrape LinkedIn profiles. Alumni can update their profiles and browse opportunities.

## Commands

All commands run from `/home/amrou/dev/hackathon/web/`:

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build
pnpm lint       # ESLint check
```

Docker (from repo root):
```bash
docker-compose up   # Runs web on port 3002
```

## Architecture

### Monorepo Structure

```
hackathon/
├── web/                # Next.js 15 app (main codebase)
├── supabase/migrations/  # SQL migrations (run manually in Supabase dashboard)
├── ai_docs/            # Architecture docs (architecture.md, patterns.md, database.md)
└── PRPs/               # Feature specs / product requirement prompts
```

### Next.js App Router Layout (`web/src/`)

Route groups enforce role-based access:
- `app/(auth)/` — Public pages (login, signup)
- `app/(alumni)/` — Alumni portal
- `app/(staff)/` — Staff/admin dashboard
- `app/(admin)/` — Admin-only features
- `app/api/` — Server-side API routes (scrape/linkedin, alumni/csv-urls)

### Supabase Client Pattern

Three distinct clients — use the right one for the context:
- `lib/supabase/client.ts` — Browser client (Client Components)
- `lib/supabase/server.ts` — Server client with cookies (RSC, Server Actions, Route Handlers)
- `lib/supabase/admin.ts` — Service role client for privileged ops (inviting users, bypassing RLS)

### Authentication & RBAC

- Auth via Supabase (email/password)
- `src/middleware.ts` redirects users based on role: `admin`/`staff` → `/staff`, `alumni` → `/alumni`
- Three roles defined in `profiles.role` enum: `alumni` (default), `staff`, `admin`
- RLS policies on all tables enforce role checks at DB level using `auth.uid()` against `profiles.role`
- A DB trigger auto-creates a `profiles` row on `auth.users` insert

### Server Actions Pattern

Mutations use `'use server'` actions in `lib/services/user-actions.ts`. They call `revalidatePath()` after mutations. Use the admin client for operations that need to bypass RLS (e.g., inviting users via Supabase Admin API).

### LinkedIn Scraping

- `POST /api/scrape/linkedin` — validates URL with Zod, calls Bright Data API
- Service: `lib/services/scraping/bright-data.ts`
- UI components: `components/scraping/`
- Types: `types/scraping.ts`
- Requires `BRIGHT_DATA_API_KEY` env var

### UI Components

shadcn/ui + Radix UI base. Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes. Component variants use `class-variance-authority` (CVA).

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BRIGHT_DATA_API_KEY=
```

See `.env.example` at repo root.

## Database

Migrations live in `supabase/migrations/` and are applied manually via the Supabase dashboard or CLI. Key tables: `profiles` (extends `auth.users`), `jobs`, `events`. All have RLS enabled.

The `profiles` table has a foreign key to `auth.users`, so inserting profiles requires a valid auth user — use the admin client's `inviteUserByEmail` to create users programmatically.

## Key Docs

- `ai_docs/architecture.md` — Full system architecture
- `ai_docs/patterns.md` — Code patterns and conventions
- `ai_docs/database.md` — Schema details and RLS policies
- `PRPs/` — Per-feature specs with implementation details
