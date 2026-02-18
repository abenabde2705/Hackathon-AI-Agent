# PRP 001 : Setup Initial & Socle Alumni

## Goal
Initialiser le projet Alumni avec Next.js 15, Supabase, Tailwind CSS 4 et TypeScript, en mettant en place le schéma de données de base (Profiles, Jobs, Events) et une sécurité RLS basée sur les rôles `alumni`, `staff`, `admin`.

## Why
**Business Justification:**
- Créer une fondation solide et scalable pour la communauté Alumni.
- Permettre aux agents de travailler dans une structure de fichiers prévisible.
- Garantir la sécurité des données dès le départ via RLS.

**Priority:** High (Foundation)

## What

### Scope
**In Scope:**
- Scaffolding Next.js 15 (App Router) + Tailwind 4.
- Configuration Supabase (Clients Browser/Server + Middleware).
- Schéma SQL initial (Migration 001) : Tables `profiles`, `jobs`, `events` avec Enums.
- Système de rôles : `alumni`, `staff`, `admin`.
- Structure de routes segmentée : `/(auth)`, `/(alumni)`, `/(staff)`, `/(admin)`.
- Utilitaires de base (`cn`, types Supabase).

**Out of Scope:**
- Multi-tenancy (pas de Company/Organization).
- Fonctionnalités avancées (Chat, Notifications, Analytics).
- Déploiement CI/CD.

### User Stories
1. En tant qu'utilisateur, je peux me connecter pour accéder à mon espace dédié.
2. En tant qu'Alumni, je peux voir la liste des jobs et des événements.
3. En tant que Staff, je peux publier un job ou un événement.
4. En tant qu'Admin, je peux gérer les rôles des utilisateurs.

## Technical Context

### Database Schema (Supabase)

```sql
-- Roles Enum
CREATE TYPE user_role AS ENUM ('alumni', 'staff', 'admin');

-- Job Type Enum
CREATE TYPE job_type AS ENUM ('CDI', 'CDD', 'Freelance');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'alumni' NOT NULL,
  graduation_year INTEGER,
  degree TEXT,
  current_company TEXT,
  current_position TEXT,
  linkedin_url TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  type job_type DEFAULT 'CDI' NOT NULL,
  apply_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Security (RLS)
- **Profiles :** Lecture par les utilisateurs connectés ; Modification uniquement par le propriétaire ou admin.
- **Jobs & Events :** Lecture par tous les rôles ; Création/Modification limitée à `staff` et `admin`.

### Files to Implement

| Path | Action | Description |
|------|--------|-------------|
| `web/src/lib/supabase/` | CREATE | Clients et Middleware auth |
| `web/src/app/` | CREATE | Layouts et routes segmentées par rôle |
| `supabase/migrations/` | CREATE | Schéma initial (Enums, Tables, RLS) |
| `web/src/components/ui/` | CREATE | Primitives shadcn (Button, Card, Input) |

## Validation Criteria
- [ ] Le projet compile sans erreur (`pnpm build`).
- [ ] La migration SQL s'applique proprement sur une instance Supabase locale.
- [ ] Le middleware redirige correctement vers `/(auth)` si non connecté.
- [ ] Les types TypeScript sont générés et incluent les nouveaux Enums et colonnes.
- [ ] Les composants de base utilisent Tailwind 4.

---
**Created:** 2026-02-18
**Status:** Ready
