# Patterns de Code JumpBoard

## Server Components (Pattern Principal)

Toutes les pages protégées suivent ce pattern :

```typescript
// app/[role]/[page]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer les données user avec son organisation
  const { data: userData } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  // Vérifier le rôle
  if (userData.role !== 'expected_role') redirect('/login')

  // Fetch des données (RLS appliqué automatiquement)
  const { data } = await supabase
    .from('table')
    .select('*')

  return <Component data={data} />
}
```

## Supabase Clients

### Server Components / Server Actions
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

### Client Components
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Server Actions

Pour les mutations simples, utiliser des Server Actions :

```typescript
// app/[role]/[page]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSomething(id: string, data: Partial<Something>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('table')
    .update(data)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/path/to/revalidate')
}
```

## UI Components avec CVA

Pattern pour les composants avec variants :

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes",
      },
      size: {
        default: "size-default",
        sm: "size-sm",
        lg: "size-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

export function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size, className }))} {...props} />
  )
}
```

## Loading States

Chaque page doit avoir un `loading.tsx` :

```typescript
// app/[role]/[page]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

## API Routes

Pour les opérations complexes ou qui nécessitent le service role :

```typescript
// app/api/resource/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Vérifier l'auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // ... logique

  return NextResponse.json({ success: true, data })
}
```

## Conditional Classes

Toujours utiliser `cn()` de `@/lib/utils` :

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "dark" ? "dark-classes" : "light-classes"
)} />
```
