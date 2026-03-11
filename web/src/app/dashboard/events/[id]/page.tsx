import { getEventById, getEventParticipants, isUserRegistered } from '@/lib/services/events'
import { registerForEvent, unregisterFromEvent } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react'
import { DeleteEventButton } from './delete-button'

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/events">
            <ChevronLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>

        {isStaffOrAdmin && <DeleteEventButton id={id} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border dark:border-zinc-800 dark:bg-zinc-900">
            {event.image_url && (
              <div className="h-64 w-full relative">
                <img src={event.image_url} alt={event.title} className="object-cover w-full h-full" />
              </div>
            )}
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(event.event_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {event.location}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4">À propos de cet événement</h3>
                <div className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {event.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg">Inscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Users className="h-5 w-5" />
                <span>{participants.length} participant(s)</span>
              </div>
              
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    Vous êtes inscrit !
                  </div>
                  <form action={handleUnregister}>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                      Se désinscrire
                    </Button>
                  </form>
                </div>
              ) : (
                <form action={handleRegister}>
                  <Button className="w-full">S'inscrire à l'événement</Button>
                </form>
              )}
            </CardContent>
          </Card>

          {isStaffOrAdmin && (
            <Card className="border dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Liste des participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participants.length > 0 ? (
                    participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border dark:border-zinc-700">
                          {p.profiles.first_name?.[0]}{p.profiles.last_name?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {p.profiles.first_name} {p.profiles.last_name}
                          </span>
                          <span className="text-xs text-zinc-500 capitalize">{p.profiles.role}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 italic">Aucun inscrit pour le moment.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
