import { createJob } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewJobPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    redirect('/dashboard/jobs')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard/jobs">
          <ChevronLeft className="h-4 w-4" />
          Retour aux offres
        </Link>
      </Button>

      <Card className="border dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Publier une nouvelle offre</CardTitle>
          <CardDescription>Remplissez les détails pour partager une opportunité avec le réseau.</CardDescription>
        </CardHeader>
        <form action={createJob}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre du poste</label>
                <Input name="title" placeholder="Ex: Développeur Fullstack React" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Entreprise</label>
                <Input name="company" placeholder="Ex: Tech Solutions" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lieu</label>
                <Input name="location" placeholder="Ex: Paris (75) ou Remote" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de contrat</label>
                <select 
                  name="type" 
                  className="w-full h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                  required
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lien pour postuler</label>
              <Input name="apply_url" type="url" placeholder="https://..." required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                name="description" 
                placeholder="Décrivez les missions, le profil recherché et les avantages..." 
                className="min-h-[200px]"
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Publier l'offre</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
