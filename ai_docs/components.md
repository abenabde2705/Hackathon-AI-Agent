# Composants UI Alumni

## Organisation

```
web/src/components/
├── ui/                 # Primitives (shadcn/ui style)
├── layout/             # Navigation, Sidebars, Footers
├── shared/             # Composants réutilisables
└── [role]/             # Composants spécifiques (alumni, staff, admin)
```

## Composants UI Disponibles

Les composants de base sont localisés dans `src/components/ui/`.

| Composant | Path | Usage |
|-----------|------|-------|
| `Button` | `ui/button.tsx` | Boutons avec variants (CVA) |
| `Card` | `ui/card.tsx` | Conteneurs (Header, Content, Footer) |
| `Input` | `ui/input.tsx` | Champs de saisie texte |

## Conventions de Stylisation (Tailwind 4)

- **Variables CSS** : Définies dans `src/app/globals.css` (ex: `--primary`, `--background`).
- **Variants** : Utiliser `class-variance-authority` (CVA) pour les états complexes.
- **Utilitaire `cn`** : Pour fusionner les classes Tailwind proprement.

### Exemple de Button
```typescript
import { Button } from "@/components/ui/button"

<Button variant="primary" size="lg">Se connecter</Button>
<Button variant="outline" size="sm">Annuler</Button>
```

### Exemple de Card
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Nouveau Job</CardTitle>
  </CardHeader>
  <CardContent>
    Détails du poste...
  </CardContent>
</Card>
```

## Icons
Utiliser `lucide-react` pour toutes les icônes de l'interface.
```typescript
import { User, LogOut } from "lucide-react"

<User className="size-4" />
```
