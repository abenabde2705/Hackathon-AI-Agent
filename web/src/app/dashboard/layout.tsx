'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Briefcase, Calendar, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Management', href: '/dashboard', icon: LayoutDashboard, adminOnly: true },
    { label: 'Emplois', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'Événements', href: '/dashboard/events', icon: Calendar },
    { label: 'Annuaire', href: '/dashboard/directory', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-blue-600">Alumni Connect</h1>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
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
