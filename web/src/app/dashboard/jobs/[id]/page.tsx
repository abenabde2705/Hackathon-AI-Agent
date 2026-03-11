import { getJobById } from '@/lib/services/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Building2, MapPin, Calendar, ExternalLink } from 'lucide-react'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard/jobs">
          <ChevronLeft className="h-4 w-4" />
          Retour aux offres
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="border-b dark:border-zinc-800">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {job.type}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-4">Description du poste</h3>
                <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {job.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border dark:border-zinc-800 dark:bg-zinc-900 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">Détails de l'offre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-5 w-5 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Entreprise</span>
                  <span className="text-zinc-500">{job.company}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Localisation</span>
                  <span className="text-zinc-500">{job.location || 'Non spécifié'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Publié le</span>
                  <span className="text-zinc-500">
                    {new Date(job.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {job.apply_url && (
                <Button asChild className="w-full gap-2">
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                    Postuler maintenant
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
