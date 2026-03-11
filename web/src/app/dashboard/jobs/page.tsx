import Link from 'next/link'
import { getJobs } from '@/lib/services/jobs'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Plus, Briefcase, MapPin, Building2 } from 'lucide-react'

export default async function JobsPage() {
  const jobs = await getJobs()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const canCreate = profile?.role === 'admin' || profile?.role === 'staff'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Offres d'emploi</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Découvrez les dernières opportunités pour le réseau Alumni.</p>
        </div>
        {canCreate && (
          <Button asChild className="gap-2">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4" />
              Publier une offre
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="flex flex-col border dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl line-clamp-1">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {job.type}
                  </span>
                  {job.location && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/jobs/${job.id}`}>Voir les détails</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
            <Briefcase className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium">Aucune offre disponible</h3>
            <p className="text-zinc-500">Revenez plus tard pour voir les nouvelles opportunités.</p>
          </div>
        )}
      </div>
    </div>
  )
}
