import Link from 'next/link'
import { getEvents } from '@/lib/services/events'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, MapPin, ArrowRight } from 'lucide-react'

export default async function EventsPage() {
  const events = await getEvents()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const canCreate = profile?.role === 'admin' || profile?.role === 'staff'

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Événements</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {events.length} événement{events.length > 1 ? 's' : ''} à venir dans la communauté.
          </p>
        </div>
        {canCreate && (
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]">
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Créer un événement
            </Link>
          </Button>
        )}
      </div>

      {events.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => {
            const date = new Date(event.event_date)
            const day = date.toLocaleDateString('fr-FR', { day: 'numeric' })
            const month = date.toLocaleDateString('fr-FR', { month: 'short' })
            const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            const isPast = date < new Date()

            return (
              <div
                key={event.id}
                className="group animate-fade-up flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Image or gradient banner */}
                {event.image_url ? (
                  <div className="h-44 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {isPast && (
                      <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white bg-zinc-800/80 px-3 py-1 rounded-full">Terminé</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-24 w-full bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-white/20" />
                    {isPast && (
                      <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white bg-zinc-800/70 px-3 py-1 rounded-full">Terminé</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1 gap-3">
                  {/* Date badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shrink-0">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">{day}</span>
                      <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-500 uppercase tracking-wide">{month}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug text-base">
                        {event.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{time}</p>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {event.location}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 flex-1">
                    {event.description}
                  </p>

                  {/* CTA */}
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="mt-auto flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/link transition-colors pt-3 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    Détails et inscription
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
            <Calendar className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Aucun événement à venir</h3>
          <p className="text-sm text-zinc-400 mt-1">Revenez plus tard pour voir les nouveaux événements.</p>
        </div>
      )}
    </div>
  )
}
