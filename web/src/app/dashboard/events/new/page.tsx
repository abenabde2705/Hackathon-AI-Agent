import { createEvent } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    redirect('/dashboard/events')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard/events">
          <ChevronLeft className="h-4 w-4" />
          Retour aux événements
        </Link>
      </Button>

      <Card className="border dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Créer un nouvel événement</CardTitle>
          <CardDescription>Organisez une rencontre ou un atelier pour la communauté.</CardDescription>
        </CardHeader>
        <form action={createEvent}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre de l'événement</label>
              <Input name="title" placeholder="Ex: Afterwork Alumni Mars 2026" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date et Heure</label>
                <Input name="event_date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lieu</label>
                <Input name="location" placeholder="Ex: Paris (75) ou Zoom" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL de l'image (optionnel)</label>
              <Input name="image_url" type="url" placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                name="description" 
                placeholder="Détaillez le programme, les intervenants et les infos pratiques..." 
                className="min-h-[200px]"
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Créer l'événement</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
