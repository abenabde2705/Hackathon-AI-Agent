import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col gap-8 items-center sm:items-start max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Alumni Project Initialized</h1>
        <p className="text-xl text-muted-foreground">
          Your project is ready with Next.js 15, Supabase, Tailwind CSS 4, and TypeScript.
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button size="lg">Explore Platform</Button>
          <Button variant="outline" size="lg">Read Documentation</Button>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <p>© 2026 Alumni Community Platform</p>
      </footer>
    </div>
  )
}
