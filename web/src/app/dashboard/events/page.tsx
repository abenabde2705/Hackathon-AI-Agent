import Link from 'next/link'
import { getEvents } from '@/lib/services/events'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'

export default async function EventsPage() {
  const events = await getEvents()
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
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Événements</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Découvrez les prochains événements de la communauté.</p>
        </div>
        {canCreate && (
          <Button asChild className="gap-2">
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Créer un événement
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="flex flex-col border dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              {event.image_url && (
                <div className="h-48 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.event_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {event.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/events/${event.id}`}>Détails et Inscription</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
            <Calendar className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium">Aucun événement à venir</h3>
            <p className="text-zinc-500">Revenez plus tard pour voir les nouveaux événements.</p>
          </div>
        )}
      </div>
    </div>
  )
}
