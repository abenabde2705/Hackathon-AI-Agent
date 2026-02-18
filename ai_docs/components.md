# Composants UI JumpBoard

## Organisation

```
components/
├── ui/                 # Primitives Radix UI (shadcn style)
├── layout/             # Sidebar, navigation
├── manager/            # Composants spécifiques manager
├── superadmin/         # Composants DRH (map, panels)
├── analytics/          # Charts et visualisations
├── icons/              # Icônes custom SVG
└── providers/          # Context providers
```

## Composants UI Disponibles

| Composant | Path | Usage |
|-----------|------|-------|
| `Button` | `ui/button.tsx` | Boutons avec variants |
| `Card` | `ui/card.tsx` | Conteneurs |
| `Badge` | `ui/badge.tsx` | Labels/tags |
| `Dialog` | `ui/dialog.tsx` | Modales |
| `Input` | `ui/input.tsx` | Champs texte |
| `Select` | `ui/select.tsx` | Dropdowns |
| `Skeleton` | `ui/skeleton.tsx` | Loading states |
| `Avatar` | `ui/avatar.tsx` | Photos profil |
| `DropdownMenu` | `ui/dropdown-menu.tsx` | Menus contextuels |
| `Pagination` | `ui/pagination.tsx` | Navigation pages |

## Button Variants

```typescript
// Variants disponibles
variant: 'default' | 'secondary' | 'ghost' | 'ghost-dark' | 'ghost-light' |
         'destructive' | 'outline' | 'link' | 'primary'

// Tailles
size: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'

// Usage
<Button variant="primary" size="lg">Action principale</Button>
<Button variant="ghost-dark">Sur fond sombre</Button>
<Button variant="destructive" size="sm">Supprimer</Button>
```

## Sidebar

Le composant `Sidebar` est unifié pour employee et manager :

```typescript
import { Sidebar } from '@/components/layout/sidebar'

<Sidebar
  variant="employee" // ou "manager"
  user={{ full_name, email, avatar_url }}
  organizationName="Camping Les Pins"
/>
```

## Charts (Analytics)

```typescript
// Trust Score avec courbe
import { TrustScoreChart } from '@/components/analytics/TrustScoreChart'

// Progress circulaire
import { ProgressRing } from '@/components/analytics/progress-ring'
<ProgressRing value={75} label="Completion" trend={+5} />

// Retention
import { RetentionChart } from '@/components/analytics/retention-chart'
<RetentionChart data={data} variant="warning" />

// Time Range
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector'
```

## SuperAdmin Components

```typescript
// Carte interactive France
import { FranceMap } from '@/components/superadmin/FranceMap'

// Panel détail site
import { SiteDetailPanel } from '@/components/superadmin/SiteDetailPanel'

// Sélecteur de site
import { SiteSelector } from '@/components/superadmin/SiteSelector'

// Header DRH
import { DRHHeader } from '@/components/superadmin/DRHHeader'
```

## Manager Components

```typescript
// Header unifié
import { ManagerHeader } from '@/components/manager/ManagerHeader'

// Actions collaborateur (dropdown)
import { CollaborateurActions } from '@/components/manager/CollaborateurActions'

// Modales
import { AddCollaborateurModal } from '@/components/manager/AddCollaborateurModal'
import { EditCollaborateurModal } from '@/components/manager/EditCollaborateurModal'
import { ViewProfileModal } from '@/components/manager/ViewProfileModal'

// Quick Actions
import { QuickActionsCard } from '@/components/manager/QuickActionsCard'
```

## Conventions

1. **Imports** : Toujours utiliser `@/` pour les paths absolus
2. **cn()** : Utiliser pour combiner les classes Tailwind
3. **forwardRef** : Pour les composants qui wrappent des éléments natifs
4. **Variants** : Utiliser CVA pour les composants avec plusieurs styles
5. **Dark mode** : Supporter avec les classes `dark:` de Tailwind
