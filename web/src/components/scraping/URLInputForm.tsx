'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Search, Loader2 } from 'lucide-react'

interface URLInputFormProps {
  onScrape: (urls: string[]) => void
  isProcessing: boolean
}

export function URLInputForm({ onScrape, isProcessing }: URLInputFormProps) {
  const [urlsText, setUrlsText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const urls = urlsText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && url.includes('linkedin.com/in/'))
    
    if (urls.length > 0) {
      onScrape(urls)
    }
  }

  return (
    <Card className="p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            URLs de profil LinkedIn
          </label>
          <p className="text-xs text-muted-foreground">
            Entrez une URL par ligne (format: https://www.linkedin.com/in/username/)
          </p>
          <Textarea
            placeholder="https://www.linkedin.com/in/jean-dupont/&#10;https://www.linkedin.com/in/marie-curie/"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            className="min-h-[120px] font-mono text-xs"
            disabled={isProcessing}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.98]" 
          disabled={isProcessing || !urlsText.trim()}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extraction en cours...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Lancer l&apos;extraction
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
