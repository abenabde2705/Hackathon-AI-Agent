# Alumni Platform - Frontend (Web)

This is the frontend of the Alumni Platform, built with Next.js 15.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Auth & Database:** Supabase

## Setup

1.  **Environment Variables:**
    Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
    ```bash
    cp .env.example .env.local
    ```

2.  **Installation:**
    ```bash
    pnpm install
    ```

3.  **Development:**
    ```bash
    pnpm dev
    ```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project API Anon Key.

You can find these in the Supabase Dashboard under **Project Settings > API**.
