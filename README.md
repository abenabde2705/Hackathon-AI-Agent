# Alumni Project

## Project Structure

- `web/`: Next.js 15 application.
- `supabase/`: Supabase configuration and migrations.
- `ai_docs/`: Technical documentation for AI agents.
- `PRPs/`: Product Requirement Prompts for feature implementations.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
cd web
pnpm install
```

### Supabase Setup

1. Create a Supabase project.
2. Apply the migration in `supabase/migrations/001_initial_setup.sql`.
3. Copy `web/.env.example` to `web/.env.local` and fill in your Supabase credentials.

### Development

```bash
cd web
pnpm dev
```
