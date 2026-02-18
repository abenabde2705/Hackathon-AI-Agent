# Base de Données Alumni

## Schéma Global

Le projet utilise Supabase (PostgreSQL) avec une architecture simplifiée centrée sur l'utilisateur et ses interactions (Jobs, Events).

## Enums

### `user_role`
- `alumni` (par défaut)
- `staff`
- `admin`

### `job_type`
- `CDI`
- `CDD`
- `Freelance`

## Tables Principales

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | Informations étendues des utilisateurs | Propriétaire / Admin |
| `jobs` | Offres d'emploi postées par le Staff | Public (lecture) / Staff (écriture) |
| `events` | Événements organisés par le Staff | Public (lecture) / Staff (écriture) |

## Détails des Tables

### `profiles`
Stocke les informations professionnelles et académiques des Alumni.
- `id`: UUID (FK vers `auth.users`)
- `first_name`, `last_name`: TEXT
- `role`: `user_role`
- `graduation_year`: INTEGER
- `degree`: TEXT
- `current_company`, `current_position`: TEXT
- `linkedin_url`: TEXT
- `bio`, `avatar_url`: TEXT

### `jobs`
Offres professionnelles destinées au réseau.
- `id`: UUID (Primary Key)
- `title`, `company`, `location`: TEXT
- `description`: TEXT
- `type`: `job_type`
- `apply_url`: TEXT
- `created_by`: UUID (FK vers `profiles`)

### `events`
Événements communautaires.
- `id`: UUID (Primary Key)
- `title`, `description`, `location`: TEXT
- `event_date`: TIMESTAMPTZ
- `image_url`: TEXT
- `created_by`: UUID (FK vers `profiles`)

## Pattern de Sécurité (RLS)

### Accès aux Profils
```sql
CREATE POLICY "Public viewable profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Gestion des Contenus (Jobs/Events)
```sql
CREATE POLICY "Anyone can view" ON jobs FOR SELECT USING (true);
CREATE POLICY "Staff/Admin can manage" ON jobs 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );
```

## Génération des Types
Après chaque migration, mettre à jour les types TypeScript :
```bash
pnpm supabase:types
```
