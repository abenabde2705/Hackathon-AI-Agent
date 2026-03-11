'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, GraduationCap, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { URLInputForm } from '@/components/scraping/URLInputForm'
import { ScrapeResults } from '@/components/scraping/ScrapeResults'
import { scrapingClient } from '@/lib/services/scraping/client'
import { LinkedInProfileData } from '@/types/scraping'
import { Button } from '@/components/ui/button'

interface ScrapedResult {
  data: LinkedInProfileData
  error?: string
  id: string
  from_cache?: boolean
}

export default function ScrapeAlumniPage() {
  const [results, setResults] = useState<ScrapedResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingCsv, setIsLoadingCsv] = useState(false)

  const handleScrape = async (urls: string[]) => {
    setIsProcessing(true)
    
    // Process URLs sequentially to avoid rate limits and for better UI feedback
    for (const url of urls) {
      // Avoid duplicate scrapes in the same session for the same URL
      if (results.some(r => r.data.linkedin_url === url && !r.error)) continue;

      const response = await scrapingClient.scrapeLinkedInProfile(url)
      
      const newResult: ScrapedResult = {
        id: Math.random().toString(36).substring(7),
        data: response.data || { name: 'Inconnu', title: '', company: '', education: '', linkedin_url: url },
        error: response.error,
        from_cache: response.from_cache,
      }
      
      setResults(prev => [newResult, ...prev])
    }
    
    setIsProcessing(false)
  }

  const loadFromCsv = async () => {
    setIsLoadingCsv(true)
    try {
      const response = await fetch('/api/alumni/csv-urls')
      const data = await response.json()
      
      if (data.urls && data.urls.length > 0) {
        handleScrape(data.urls)
      } else if (data.error) {
        alert(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to load CSV:', error)
      alert('Erreur lors du chargement du fichier CSV')
    } finally {
      setIsLoadingCsv(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/staff/alumni" 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;annuaire
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Magic Scraper <span className="text-blue-600">Alumni</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Enrichissez votre base de données avec les dernières infos professionnelles LinkedIn.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={loadFromCsv} 
            disabled={isProcessing || isLoadingCsv}
            variant="outline"
            className="bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {isLoadingCsv ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Charger depuis alumni_linkedin_profiles.csv
          </Button>

          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              {results.filter(r => !r.error).length} profils récupérés
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left column: Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs">1</span>
              Configuration
            </h2>
            <URLInputForm 
              onScrape={handleScrape} 
              isProcessing={isProcessing} 
            />
            
            <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Conseils :</h4>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Utilisez les URLs complètes</li>
                <li>L&apos;extraction peut prendre quelques secondes</li>
                <li>Les photos sont récupérées si publiques</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: Results */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs">2</span>
            Aperçu des profils
          </h2>
          
          {results.length === 0 && !isProcessing ? (
            <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-zinc-300" />
              </div>
              <p className="text-zinc-500 font-medium">Les profils extraits apparaîtront ici.</p>
              <p className="text-sm text-zinc-400 mt-1">Saisissez des URLs à gauche pour commencer.</p>
            </div>
          ) : (
            <ScrapeResults 
              results={results} 
              onClear={() => setResults([])} 
            />
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-12 text-blue-600 font-medium animate-pulse">
              <Sparkles className="h-6 w-6" />
              <span>Traitement en cours... de nouveaux profils arrivent !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
