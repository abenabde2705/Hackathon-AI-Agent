# Architecture Alumni Platform

## Stack Technique

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15.5.9 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui patterns |
| Backend | Supabase (PostgreSQL 15 + Auth + Realtime) |

## Structure des Dossiers

```
alumni-platform/
├── web/                          # Application Next.js
│   ├── src/
│   │   ├── app/                  # App Router (Groupes par rôle)
│   │   │   ├── (auth)/           # Connexion / Inscription
│   │   │   ├── (alumni)/         # Portail Alumni
│   │   │   ├── (staff)/          # Dashboard Staff
│   │   │   └── (admin)/          # Dashboard Admin
│   │   ├── components/
│   │   │   ├── ui/               # Primitives (shadcn)
│   │   │   ├── layout/           # Navigation, Sidebars
│   │   │   └── shared/           # Composants réutilisables
│   │   ├── lib/
│   │   │   ├── supabase/         # Clients Supabase (client, server, middleware)
│   │   │   ├── services/         # Logique métier et IA
│   │   │   └── utils.ts          # Utilitaires (cn, etc.)
│   │   └── types/                # Définitions TypeScript
│   └── public/                   # Assets statiques
├── supabase/
│   ├── migrations/               # Migrations SQL (RLS, Schéma)
│   └── seed/                     # Données de test
└── ai_docs/                      # Documentation pour les agents (ce dossier)
```

## Accès par Rôle

| Rôle | Route | Scope |
|------|-------|-------|
| Alumni | `/(alumni)/*` | Consultation jobs/events, gestion profil |
| Staff | `/(staff)/*` | Gestion des jobs et événements |
| Admin | `/(admin)/*` | Administration globale et rôles |

## Sécurité (RLS)

Toutes les tables utilisent Row Level Security (RLS) basé sur `auth.uid()` et le rôle défini dans la table `profiles`.

Pattern de policy standard :
```sql
CREATE POLICY "view_policy" ON table_name
  FOR SELECT USING (true); -- Souvent ouvert aux connectés

CREATE POLICY "modify_policy" ON table_name
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );
```
