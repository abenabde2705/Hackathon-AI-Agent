'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function ConfirmContent() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleConfirm = async () => {
      const supabase = createClient()
      const queryParams = new URLSearchParams(window.location.search)
      const tokenHash = queryParams.get('token_hash')
      const type = queryParams.get('type')
      const code = queryParams.get('code')

      // Modern Supabase PKCE flow: ?token_hash=xxx&type=invite
      if (tokenHash && type) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'invite' | 'email' | 'recovery' | 'signup',
          })
          if (error) {
            setError("Le lien de confirmation est invalide ou a expiré : " + error.message)
            return
          }
          router.push('/auth/set-password')
        } catch (err: any) {
          setError("Erreur lors de la validation du lien : " + err.message)
        }
        return
      }

      // Code flow
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setError("Le lien de confirmation est invalide ou a expiré.")
            return
          }
          router.push('/auth/set-password')
        } catch (err: any) {
          setError("Erreur lors de l'échange du code : " + err.message)
        }
        return
      }

      // Legacy hash flow: #access_token=...&refresh_token=...
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) {
            setError("La session d'invitation n'a pas pu être établie : " + error.message)
            return
          }
          router.push('/auth/set-password')
        } catch (err: any) {
          setError("Erreur lors de l'initialisation de la session : " + err.message)
        }
        return
      }

      setError("Lien de confirmation manquant ou invalide (jetons non trouvés).")
    }

    handleConfirm()
  }, [router])

  if (error) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
        <h2 className="text-2xl font-bold text-red-600">Erreur de validation</h2>
        <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 text-blue-600 hover:underline font-medium"
        >
          Retour à la page de connexion
        </button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
      <h2 className="text-2xl font-bold dark:text-zinc-100">Authentification en cours</h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Veuillez patienter pendant que nous validons votre accès...
      </p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <Card className="max-w-md w-full p-8 shadow-lg border dark:border-zinc-800 dark:bg-zinc-900">
        <Suspense fallback={
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold dark:text-zinc-100">Chargement...</h2>
          </div>
        }>
          <ConfirmContent />
        </Suspense>
      </Card>
    </div>
  )
}
