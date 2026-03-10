'use client'

import Link from 'next/link'
import { LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Admin Panel
          </h1>
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Vers Dashboard Staff
            </Link>
          </nav>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-600 dark:text-zinc-400">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
