# Patterns de Code Alumni

## Server Components (Pattern Principal)

Pages protégées avec vérification du rôle via la table `profiles` :

```typescript
// app/(alumni)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer le profil et le rôle
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'alumni') redirect('/unauthorized')

  // Fetch des données spécifiques
  const { data: jobs } = await supabase.from('jobs').select('*').limit(5)

  return <Dashboard profile={profile} recentJobs={jobs} />
}
```

## Supabase Clients

L'accès aux clients est centralisé dans `src/lib/supabase/`.

### RSC / Server Actions
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

### Client Components
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## Server Actions (Mutations)

Utiliser pour les actions de formulaire ou interactions côté serveur :

```typescript
// app/(alumni)/profile/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: Partial<Profile>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) throw error
  
  revalidatePath('/profile')
}
```

## UI Components avec CVA

Pattern utilisé pour les composants de base (ex: `Button`) :

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Gestion des Classes (Tailwind 4)

Toujours utiliser la fonction utilitaire `cn` :

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "p-4 border rounded-lg",
  isActive ? "bg-accent text-accent-foreground" : "bg-card"
)} />
```
