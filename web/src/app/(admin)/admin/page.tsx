import { LinkedInScraper } from '@/components/shared/linkedin-scraper';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-zinc-500">Bienvenue dans l&apos;interface d&apos;administration.</p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
            <h3 className="font-semibold">Utilisateurs</h3>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Outils de Scraping</h2>
          <LinkedInScraper />
        </section>
      </div>
    </div>
  )
}
