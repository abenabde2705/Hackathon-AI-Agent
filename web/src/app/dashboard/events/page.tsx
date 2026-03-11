import Link from 'next/link'
import { getEvents } from '@/lib/services/events'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, MapPin, ArrowRight, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function EventsPage() {
  const events = await getEvents()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const canCreate = profile?.role === 'admin' || profile?.role === 'staff'

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Événements</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {events.length} rendez-vous{events.length > 1 ? 's' : ''} à venir dans votre réseau.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-2xl font-black text-blue-600 leading-none">{events.length}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">À Venir</span>
          </div>
          {canCreate && (
            <Button asChild className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all gap-2 group">
              <Link href="/dashboard/events/new">
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Créer un événement
              </Link>
            </Button>
          )}
        </div>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => {
            const date = new Date(event.event_date)
            const day = date.toLocaleDateString('fr-FR', { day: 'numeric' })
            const month = date.toLocaleDateString('fr-FR', { month: 'short' })
            const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            const isPast = date < new Date()

            return (
              <div
                key={event.id}
                className="group relative flex flex-col rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Image Banner */}
                <div className="h-52 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800/50">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-blue-600/10 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <Calendar className="h-8 w-8 text-blue-600/40" />
                      </div>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  {isPast && (
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-xs font-black text-white bg-zinc-800/80 px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20">Terminé</span>
                    </div>
                  )}
                  
                  {/* Date Badge (floating) */}
                  <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-white dark:border-zinc-800 transition-transform group-hover:scale-110">
                    <span className="text-xl font-black text-blue-600 leading-none">{day}</span>
                    <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{month}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 gap-5">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-4 w-4 text-blue-500/70" />
                        {time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-400 dark:text-zinc-500">
                          <MapPin className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-medium">
                    {event.description}
                  </p>

                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 hover:bg-blue-600 hover:text-white transition-all duration-300 group/btn"
                  >
                    <span className="text-sm font-bold tracking-tight">Détails de l'événement</span>
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
            <Users className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Aucun événement</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">Désolé, aucun événement n'est programmé pour le moment. Revenez bientôt !</p>
        </div>
      )}
    </div>
  )
}
