import { LinkedInScraper } from '@/components/shared/linkedin-scraper';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mon Profil
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Gérez vos informations professionnelles et personnelles.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Section LinkedIn Scraper */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Importation LinkedIn</h2>
          </div>
          <LinkedInScraper />
        </section>

        {/* Placeholder for future profile sections */}
        <section className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">Informations du Profil</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Les autres sections de votre profil seront bientôt disponibles (expérience, formation, compétences).
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
