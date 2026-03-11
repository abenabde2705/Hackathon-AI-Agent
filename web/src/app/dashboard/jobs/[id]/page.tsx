import { getJobById } from '@/lib/services/jobs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Building2, MapPin, Calendar, ExternalLink, Briefcase, Info, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DeleteJobButton } from './delete-button'
import { AnimatedPage, AnimatedSection } from '@/components/ui/animated-section'
import { cn } from '@/lib/utils'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const isStaffOrAdmin = profile?.role === 'admin' || profile?.role === 'staff'

  const formattedDate = new Date(job.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <AnimatedPage className="max-w-6xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-0 hover:bg-transparent transition-all">
          <Link href="/dashboard/jobs">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Retour aux offres</span>
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 border-zinc-200 dark:border-zinc-800 font-bold gap-2">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
          {isStaffOrAdmin && <DeleteJobButton id={id} />}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatedSection className="rounded-[40px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-blue-600/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{job.company}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest border border-blue-200/50 dark:border-blue-800/50">
                      {job.type}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      Publié le {formattedDate}
                    </span>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                {job.title}
              </h1>
            </div>

            <div className="p-10 space-y-10">
              {/* Description Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Description du poste
                </h3>
                <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                  {job.description}
                </div>
              </div>

              {/* Requirement highlights (placeholder for future expansion) */}
              <div className="p-8 rounded-[32px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100">Candidature au réseau Alumni</h4>
                    <p className="text-sm text-blue-700/70 dark:text-blue-300/70 font-medium">
                      Cette offre est réservée en priorité aux membres de notre communauté. N'oubliez pas de mentionner votre diplôme lors de votre prise de contact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Action Card */}
          <AnimatedSection delay={0.1} className="rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sticky top-24">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Récapitulatif</h3>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50">
                    <Building2 className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Entreprise</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{job.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50">
                    <MapPin className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Localisation</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{job.location || 'Non spécifié'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50">
                    <Briefcase className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contrat</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{job.type}</p>
                  </div>
                </div>
              </div>

              {job.apply_url && (
                <Button asChild className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all group/btn">
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Postuler maintenant
                    <ExternalLink className="h-5 w-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </Button>
              )}
              
              <div className="pt-2">
                <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">
                  Référence de l'offre: #{job.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Share Card */}
          <AnimatedSection delay={0.2} className="rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 p-8 shadow-sm">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4">Besoin d'aide ?</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
              Une question sur cette offre ou sur le processus de recrutement ? Contactez l'administrateur de la plateforme.
            </p>
            <Button variant="outline" className="w-full rounded-xl font-bold border-zinc-200 dark:border-zinc-800">
              Contacter le support
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </AnimatedPage>
  )
}
