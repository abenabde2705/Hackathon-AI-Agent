import Link from 'next/link'
import { getJobs, JobFilters as JobFiltersType } from '@/lib/services/jobs'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, MapPin, Building2, ArrowRight, TrendingUp } from 'lucide-react'
import { JobFilters } from './job-filters'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

const JOB_TYPE_COLORS: Record<string, { text: string, bg: string, border: string, dot: string }> = {
  CDI: { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-800/50', dot: 'bg-blue-500' },
  CDD: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50/50 dark:bg-amber-900/30', border: 'border-amber-100 dark:border-amber-800/50', dot: 'bg-amber-500' },
  Stage: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50/50 dark:bg-violet-900/30', border: 'border-violet-100 dark:border-violet-800/50', dot: 'bg-violet-500' },
  Alternance: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/50 dark:bg-emerald-900/30', border: 'border-emerald-100 dark:border-emerald-800/50', dot: 'bg-emerald-500' },
  Freelance: { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50/50 dark:bg-orange-900/30', border: 'border-orange-100 dark:border-orange-800/50', dot: 'bg-orange-500' },
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Opportunités</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {jobs.length} offre{jobs.length > 1 ? 's' : ''} exclusive{jobs.length > 1 ? 's' : ''} pour la communauté.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-2xl font-black text-blue-600 leading-none">{jobs.length}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Offres Live</span>
          </div>
          {canCreate && (
            <Button asChild className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all gap-2 group">
              <Link href="/dashboard/jobs/new">
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Publier une offre
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-4 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50">
        <Suspense fallback={<div className="h-12 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />}>
          <JobFilters />
        </Suspense>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => {
            const style = JOB_TYPE_COLORS[job.type] ?? JOB_TYPE_COLORS['CDI']
            return (
              <div
                key={job.id}
                className="group relative flex flex-col rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />

                <div className="p-8 flex flex-col flex-1 gap-6 z-10">
                  {/* Top Bar: Icon + Type */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-700/50 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300 group-hover:scale-110">
                      <Briefcase className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest", style.bg, style.text, style.border)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />
                      {job.type}
                    </div>
                  </div>

                  {/* Body: Title + Company */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
                        <Building2 className="h-4 w-4 text-blue-500/70" />
                        {job.company}
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 uppercase tracking-tight">
                          <MapPin className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                          {job.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                    {job.description}
                  </p>

                  {/* Bottom Bar: Action */}
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 hover:bg-blue-600 hover:text-white transition-all duration-300 group/btn"
                  >
                    <span className="text-sm font-bold tracking-tight">Consulter l'offre</span>
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-zinc-50 group-hover/btn:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-[32px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-8">
            <TrendingUp className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Aucun résultat</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">Désolé, aucune offre ne correspond à vos critères. Essayez d'élargir votre recherche.</p>
        </div>
      )}
    </div>
  )
}
