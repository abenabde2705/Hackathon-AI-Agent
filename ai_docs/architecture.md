# Architecture JumpBoard v3

## Stack Technique

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15.5.9 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui patterns |
| Backend | Supabase (PostgreSQL 15 + Auth + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Messaging | WhatsApp Business API (Twilio) |
| AI | Groq API (llama-3.1-8b-instant) |
| Maps | Leaflet + react-leaflet |

## Structure des Dossiers

```
jumpboard-v3-whatsapp/
├── web/                          # App Next.js
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── api/              # API routes
│   │   │   ├── employee/         # Portal employé (dark theme)
│   │   │   ├── manager/          # Dashboard manager (light theme)
│   │   │   ├── superadmin/       # Portal DRH (dark theme)
│   │   │   └── admin/            # Dashboard admin
│   │   ├── components/
│   │   │   ├── ui/               # Composants Radix UI
│   │   │   ├── layout/           # Sidebar, navigation
│   │   │   ├── manager/          # Composants manager
│   │   │   ├── superadmin/       # Composants DRH (map, panels)
│   │   │   └── analytics/        # Charts
│   │   ├── lib/
│   │   │   ├── supabase/         # Clients Supabase
│   │   │   ├── services/         # Business logic
│   │   │   └── data/             # Données statiques
│   │   └── types/                # TypeScript definitions
│   └── public/
│       └── geo/                  # GeoJSON pour cartes
├── supabase/
│   ├── migrations/               # SQL migrations
│   ├── functions/                # Edge Functions
│   └── seed/                     # Données de test
└── ai_docs/                      # Documentation IA (ce dossier)
```

## Portails par Rôle

| Rôle | Route | Theme | Scope |
|------|-------|-------|-------|
| Employee | `/employee/*` | Dark | Son organisation |
| Manager | `/manager/*` | Light | Son organisation |
| Admin | `/admin/*` | - | Son organisation |
| SuperAdmin (DRH) | `/superadmin/*` | Dark | Toute l'entreprise (multi-sites) |

## Multi-Tenant Architecture

```
Company (ex: "Camping Group France")
  ├── Organization/Site 1: "Camping Les Pins"
  │     ├── Teams
  │     ├── Users (employees, managers, admin)
  │     └── Data (onboardings, tickets, etc.)
  ├── Organization/Site 2: "Village Vacances du Lac"
  └── Organization/Site 3: ...

SuperAdmin → Accès à tous les sites de sa Company
Autres rôles → Accès uniquement à leur Organization
```

## Sécurité (RLS)

Toutes les tables ont des Row Level Security policies qui utilisent :
- `public.user_organization_id()` - ID de l'organisation du user
- `public.user_company_id()` - ID de l'entreprise (pour SuperAdmins)
- `public.user_role()` - Rôle du user

Pattern de policy standard :
```sql
CREATE POLICY "table_select" ON table_name
  FOR SELECT USING (
    organization_id = public.user_organization_id() OR
    (public.user_role() = 'superadmin' AND organization_id IN (
      SELECT id FROM organizations WHERE company_id = public.user_company_id()
    ))
  );
```
