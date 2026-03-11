import { getEventById, getEventParticipants, isUserRegistered } from '@/lib/services/events'
import { registerForEvent, unregisterFromEvent } from '../actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, MapPin, Users, CheckCircle2, Clock, Share2 } from 'lucide-react'
import { DeleteEventButton } from './delete-button'
import { AnimatedPage, AnimatedSection } from '@/components/ui/animated-section'
import { cn } from '@/lib/utils'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const event = await getEventById(id)
  
  if (!event) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const isRegistered = user ? await isUserRegistered(id, user.id) : false
  const participants = await getEventParticipants(id)
  const isStaffOrAdmin = profile?.role === 'admin' || profile?.role === 'staff'

  const handleRegister = registerForEvent.bind(null, id)
  const handleUnregister = unregisterFromEvent.bind(null, id)

  const date = new Date(event.event_date)
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <AnimatedPage className="max-w-6xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-0 hover:bg-transparent transition-all">
          <Link href="/dashboard/events">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Retour aux événements</span>
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-10 px-4 border-zinc-200 dark:border-zinc-800 font-bold gap-2">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
          {isStaffOrAdmin && <DeleteEventButton id={id} />}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatedSection className="rounded-[40px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
            {event.image_url ? (
              <div className="h-80 w-full relative overflow-hidden">
                <img src={event.image_url} alt={event.title} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/50">
                      Événement Alumni
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight leading-none">{event.title}</h1>
                </div>
              </div>
            ) : (
              <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-blue-600/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                    Événement Alumni
                  </span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">{event.title}</h1>
              </div>
            )}

            <div className="p-10 space-y-10">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50 capitalize">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Heure</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50">{formattedTime}</p>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lieu</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  À propos de cet événement
                </h3>
                <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                  {event.description}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Registration Card */}
          <AnimatedSection delay={0.1} className="rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sticky top-24">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Inscription</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800/50">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[11px] font-black uppercase tracking-widest">{participants.length} Participant{participants.length > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              {isRegistered ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-3xl text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 animate-bounce-slow">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-tight">Vous êtes inscrit !</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium mt-1">On se voit à l'événement.</p>
                  </div>
                  <form action={handleUnregister}>
                    <Button variant="ghost" className="w-full h-12 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-all underline underline-offset-4 decoration-zinc-200">
                      Annuler ma participation
                    </Button>
                  </form>
                </div>
              ) : (
                <form action={handleRegister}>
                  <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">
                    S'inscrire maintenant
                  </Button>
                </form>
              )}
              
              <div className="pt-2">
                <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">
                  Accès réservé aux membres AlumniHub
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Participants Card */}
          {isStaffOrAdmin && (
            <AnimatedSection delay={0.2} className="rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50">
                    <Users className="h-4 w-4 text-zinc-500" />
                  </div>
                  Participants inscrits
                </h3>
              </div>
              <div className="p-8 pt-6">
                <div className="space-y-5">
                  {participants.length > 0 ? (
                    participants.map((p) => (
                      <div key={p.id} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-default">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-300 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0 uppercase">
                          {p.profiles.first_name?.[0]}{p.profiles.last_name?.[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {p.profiles.first_name} {p.profiles.last_name}
                          </span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">{p.profiles.role}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                      <Users className="h-10 w-10 text-zinc-300 mb-2" />
                      <p className="text-sm text-zinc-500 font-bold italic">Aucun inscrit</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
