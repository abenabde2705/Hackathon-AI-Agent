'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase handles the hash fragment automatically to set the session
    // We just wait a bit and redirect to profile or home
    const timer = setTimeout(() => {
      router.push('/dashboard/jobs')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Authentification en cours</h2>
        <p className="text-muted-foreground">
          Veuillez patienter pendant que nous validons votre accès...
        </p>
      </Card>
    </div>
  )
}
