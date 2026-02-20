'use client';

import { useState } from 'react';
import { Loader2, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LinkedInScrapeRequestSchema, BrightDataScrapeResult } from '@/types/scraping';
import { scrapeLinkedInProfile } from '@/lib/services/scraping/client';
import { cn } from '@/lib/utils';

export function LinkedInScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BrightDataScrapeResult[] | null>(null);

  async function handleScrape() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Frontend validation
    const validation = LinkedInScrapeRequestSchema.safeParse({ url });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const response = await scrapeLinkedInProfile(url);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'An unexpected error occurred');
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          Enrichir mon profil
        </CardTitle>
        <CardDescription>
          Collez l&apos;URL de votre profil LinkedIn pour importer automatiquement vos expériences et formations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="https://www.linkedin.com/in/votre-profil/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className={cn(error && "border-destructive focus-visible:ring-destructive")}
          />
          <Button onClick={handleScrape} disabled={isLoading || !url}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importation...
              </>
            ) : (
              'Importer'
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 p-3 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              Profil récupéré avec succès !
            </div>
            
            <div className="rounded-lg border bg-zinc-50 dark:bg-zinc-900 p-4">
              <h4 className="text-sm font-semibold mb-2">Aperçu des données :</h4>
              <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            <p className="text-xs text-zinc-500 italic">
              Note: Ces données pourront être utilisées pour pré-remplir votre profil dans la prochaine étape.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
