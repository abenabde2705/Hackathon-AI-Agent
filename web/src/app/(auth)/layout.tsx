export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-zinc-950 p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
          style={{ 
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-500 hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)]">
          <div className="px-10 py-12">
            {children}
          </div>
          {/* Subtle bottom accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest animate-fade-in">
          &copy; 2026 AlumniHub Platform &bull; Made with &hearts;
        </p>
      </div>
    </div>
  )
}
