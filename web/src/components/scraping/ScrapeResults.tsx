'use client'

import { LinkedInProfileData } from '@/types/scraping'
import { ProfileCard } from './ProfileCard'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Users } from 'lucide-react'

interface ScrapedResult {
  data: LinkedInProfileData
  error?: string
  id: string
}

interface ScrapeResultsProps {
  results: ScrapedResult[]
  onClear: () => void
}

export function ScrapeResults({ results, onClear }: ScrapeResultsProps) {
  if (results.length === 0) return null

  const successCount = results.filter(r => !r.error).length
  const errorCount = results.length - successCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Résultats de l&apos;extraction</h3>
            <p className="text-sm text-muted-foreground">
              {successCount} profil{successCount > 1 ? 's' : ''} extrait{successCount > 1 ? 's' : ''} avec succès
              {errorCount > 0 && ` • ${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={onClear} className="text-destructive hover:bg-destructive/5 border-destructive/20 hover:border-destructive/30">
            <Trash2 className="h-4 w-4 mr-2" />
            Tout effacer
          </Button>
          {successCount > 0 && (
            <Button size="sm" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md">
              <Download className="h-4 w-4 mr-2" />
              Exporter (CSV)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ProfileCard 
            key={result.id} 
            data={result.data} 
            error={result.error} 
          />
        ))}
      </div>
    </div>
  )
}
