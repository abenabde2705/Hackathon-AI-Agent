import Link from 'next/link'
import { getJobs, JobFilters as JobFiltersType } from '@/lib/services/jobs'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, MapPin, Building2, ArrowRight } from 'lucide-react'
import { JobFilters } from './job-filters'
import { Suspense } from 'react'

const JOB_TYPE_COLORS: Record<string, string> = {
  CDI: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  CDD: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  Stage: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  Alternance: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  Freelance: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const filters: JobFiltersType = {
    search: params.search as string,
    type: params.type as string,
    sort: params.sort as 'newest' | 'oldest',
  }

  const jobs = await getJobs(filters)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const canCreate = profile?.role === 'admin' || profile?.role === 'staff'

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Offres d'emploi</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {jobs.length} offre{jobs.length > 1 ? 's' : ''} disponible{jobs.length > 1 ? 's' : ''} pour le réseau Alumni.
          </p>
        </div>
        {canCreate && (
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4" />
              Publier une offre
            </Link>
          </Button>
        )}
      </div>

      <Suspense fallback={<div className="h-14 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />}>
        <JobFilters />
      </Suspense>

      {jobs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => {
            const colorClass = JOB_TYPE_COLORS[job.type] ?? JOB_TYPE_COLORS['CDI']
            return (
              <div
                key={job.id}
                className="group animate-fade-up flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6 flex flex-col flex-1 gap-4">
                  {/* Company + type */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-zinc-400" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
                      {job.type}
                    </span>
                  </div>

                  {/* Title + company */}
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug text-base">
                      {job.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {job.company}
                    </p>
                  </div>

                  {/* Location */}
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {job.location}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 flex-1">
                    {job.description}
                  </p>

                  {/* CTA */}
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="mt-auto flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/link transition-colors pt-2 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    Voir les détails
                    <ArrowRight className="h-4 w-4 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Aucune offre trouvée</h3>
          <p className="text-sm text-zinc-400 mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      )}
    </div>
  )
}
