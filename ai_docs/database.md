# Base de Données JumpBoard

## Entités Principales

### Hiérarchie
```
companies (entreprises multi-sites)
  └── organizations (sites/locations)
        ├── teams
        ├── users (employees, managers, admins)
        ├── onboardings
        ├── issues (tickets)
        └── events
```

### Tables Clés

| Table | Description | RLS |
|-------|-------------|-----|
| `companies` | Entreprises parentes | Oui |
| `organizations` | Sites (avec lat/lng pour map) | Oui |
| `users` | Tous les utilisateurs | Oui |
| `teams` | Équipes par organisation | Oui |
| `onboardings` | Sessions d'onboarding | Oui |
| `onboarding_steps` | Étapes individuelles | Oui |
| `step_templates` | Templates d'étapes réutilisables | Oui |
| `issues` | Tickets de support | Oui |
| `issue_messages` | Messages dans tickets | Oui |
| `whatsapp_identities` | Mapping WhatsApp → user | Oui |
| `jumpy_conversations` | Sessions chatbot | Oui |
| `jumpy_messages` | Messages chatbot | Oui |
| `events` | Audit log (event sourcing) | Oui |
| `daily_metrics` | KPIs pré-calculés | Oui |

## Rôles Utilisateurs

```typescript
type UserRole = 'employee' | 'manager' | 'admin' | 'superadmin'
```

- **employee** : Accès à son onboarding, Jumpy, tickets
- **manager** : Gestion de son équipe + analytics
- **admin** : Administration de l'organisation
- **superadmin** : Vue multi-sites (DRH)

## Helper Functions SQL

Définies dans le schema `public` :

```sql
-- Retourne l'organization_id du user connecté
public.user_organization_id() → UUID

-- Retourne le company_id du user (pour superadmins)
public.user_company_id() → UUID

-- Retourne le rôle du user
public.user_role() → TEXT
```

## Pattern de Migration

```sql
-- 1. Créer la table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  -- ... autres colonnes
);

-- 2. Activer RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. Créer les policies
CREATE POLICY "new_table_select" ON new_table
  FOR SELECT USING (
    organization_id = public.user_organization_id() OR
    (public.user_role() = 'superadmin' AND organization_id IN (
      SELECT id FROM organizations WHERE company_id = public.user_company_id()
    ))
  );

CREATE POLICY "new_table_insert" ON new_table
  FOR INSERT WITH CHECK (
    organization_id = public.user_organization_id()
  );

-- 4. Créer les index
CREATE INDEX idx_new_table_org ON new_table(organization_id);
```

## Régénérer les Types

Après chaque modification de schema :

```bash
pnpm supabase:types
```

Cela met à jour `web/src/types/supabase.ts`.

## Conventions de Nommage

- Tables : `snake_case` pluriel (`users`, `onboarding_steps`)
- Colonnes : `snake_case` (`organization_id`, `created_at`)
- Policies : `table_action` (`users_select`, `issues_insert`)
- Index : `idx_table_column` (`idx_users_organization`)
- Foreign keys : `table_fk_column` (`users_fk_organization`)
