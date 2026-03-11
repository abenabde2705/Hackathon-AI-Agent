'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, GraduationCap, ArrowRight, Mail, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-bounce-slow">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Bon retour !
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Connectez-vous pour accéder à votre espace Alumni.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest px-1"
          >
            Email professionnel
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nom@exemple.com"
              required
              disabled={isLoading}
              className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="password"
              className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest"
            >
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Oublié ?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-14 pl-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-2xl animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all group"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center pt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Nouveau ici ?{' '}
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-all"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
