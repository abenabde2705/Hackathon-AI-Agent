import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Alumni Connect
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            La plateforme communautaire pour les anciens, le staff et les administrateurs.
          </p>
        </div>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Button size="lg" asChild className="h-12 px-8 text-base">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </main>
      
      <footer className="mt-auto flex gap-6 flex-wrap items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>© 2026 Alumni Community Platform</p>
      </footer>
    </div>
  )
}
