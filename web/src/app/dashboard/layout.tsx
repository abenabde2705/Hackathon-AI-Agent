'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Briefcase, Calendar, Users, LogOut, GraduationCap, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Management', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Emplois', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'Événements', href: '/dashboard/events', icon: Calendar },
    { label: 'Annuaire', href: '/dashboard/directory', icon: Users },
  ]

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 flex flex-col relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Alumni<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[15px] font-bold transition-all duration-300',
                    active
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  <item.icon className={cn('h-4.5 w-4.5 transition-transform duration-300', active && 'scale-110')} />
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
            <Search className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Search...</span>
          </div>

          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Bell className="h-5 w-5 text-zinc-500" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
          </button>

          <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />

          <form action={signOut}>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-4 gap-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-8 py-10 z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
