import { createJob } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Briefcase, Building2, MapPin, Link as LinkIcon, AlignLeft, Sparkles } from 'lucide-react'
import { AnimatedPage, AnimatedSection } from '@/components/ui/animated-section'

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
    <AnimatedPage className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" asChild className="gap-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-0 hover:bg-transparent transition-all">
        <Link href="/dashboard/jobs">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight">Retour aux offres</span>
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          Publier une offre
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Partagez une opportunité de carrière avec les talents de notre communauté.
        </p>
      </div>

      <AnimatedSection className="rounded-[40px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
        <form action={createJob}>
          <div className="p-10 space-y-8">
            {/* Job & Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Intitulé du poste</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input name="title" placeholder="Ex: Développeur Fullstack React" required 
                    className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Entreprise</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input name="company" placeholder="Ex: Tech Solutions" required 
                    className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
                </div>
              </div>
            </div>

            {/* Location & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Localisation</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input name="location" placeholder="Ex: Paris (75) ou Remote" required 
                    className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Type de contrat</label>
                <div className="relative group">
                  <select 
                    name="type" 
                    className="w-full h-14 pl-4 pr-10 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none outline-none"
                    required
                  >
                    <option value="CDI">Contrat à Durée Indéterminée (CDI)</option>
                    <option value="CDD">Contrat à Durée Déterminée (CDD)</option>
                    <option value="Freelance">Freelance / Indépendant</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronLeft className="h-4 w-4 text-zinc-400 -rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Application Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Lien de candidature</label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                <Input name="apply_url" type="url" placeholder="https://votre-site.com/jobs/123" required 
                  className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" />
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Description & Missions</label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-6 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                <Textarea 
                  name="description" 
                  placeholder="Décrivez les missions, le profil recherché et les avantages..." 
                  className="min-h-[240px] pl-12 pt-5 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-[32px] focus:ring-4 focus:ring-blue-500/10 transition-all font-medium leading-relaxed"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="p-10 pt-0">
            <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-[0.99] transition-all">
              Publier l'opportunité
            </Button>
          </div>
        </form>
      </AnimatedSection>
    </AnimatedPage>
  )
}
