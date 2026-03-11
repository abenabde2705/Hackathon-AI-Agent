'use client'

import { useState, useCallback, useMemo } from 'react'
import { Users, FileText, Loader2, ExternalLink, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import { AlumniEntry, ScrapedEntry } from '@/app/api/alumni/directory/route'
import { CsvAlumniRow } from '@/app/api/alumni/csv-urls/route'
import { scrapingClient } from '@/lib/services/scraping/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DirectoryRow =
  | (AlumniEntry & { type: 'alumni' })
  | (ScrapedEntry & { type: 'scraped' })

interface Props {
  initialProfiles: AlumniEntry[]
  initialScraped: ScrapedEntry[]
}

function getDisplayName(row: DirectoryRow): string {
  if (row.type === 'alumni') {
    const parts = [row.first_name, row.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : '—'
  }
  return row.name || '—'
}

function groupByPromo(rows: DirectoryRow[]): Map<string, DirectoryRow[]> {
  const map = new Map<string, DirectoryRow[]>()
  for (const row of rows) {
    const key = row.graduation_year ? String(row.graduation_year) : 'Sans promo'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  // Sort: descending years first, then "Sans promo"
  const sorted = new Map<string, DirectoryRow[]>()
  const years = [...map.keys()]
    .filter((k) => k !== 'Sans promo')
    .sort((a, b) => Number(b) - Number(a))
  for (const y of years) sorted.set(y, map.get(y)!)
  if (map.has('Sans promo')) sorted.set('Sans promo', map.get('Sans promo')!)
  return sorted
}

function AvatarCell({ url, name }: { url?: string | null; name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={32}
        height={32}
        className="rounded-full object-cover w-8 h-8"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
      {initials || '?'}
    </div>
  )
}

function DirectoryTable({ rows }: { rows: DirectoryRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10"></TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>LinkedIn</TableHead>
          <TableHead>Diplôme</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const name = getDisplayName(row)
          const degree = row.type === 'alumni' ? row.degree : row.education
          const position = row.type === 'alumni' ? row.current_position : row.title
          const company = row.type === 'alumni' ? row.current_company : row.company
          return (
            <TableRow key={row.id}>
              <TableCell>
                <AvatarCell url={row.avatar_url} name={name} />
              </TableCell>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {row.email || '—'}
              </TableCell>
              <TableCell>
                {row.linkedin_url ? (
                  <a
                    href={row.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell className="text-sm">{degree || '—'}</TableCell>
              <TableCell className="text-sm">{position || '—'}</TableCell>
              <TableCell className="text-sm">{company || '—'}</TableCell>
              <TableCell>
                {row.type === 'alumni' ? (
                  <Badge variant="default" className="bg-blue-600 hover:bg-blue-600">
                    Alumni
                  </Badge>
                ) : (
                  <Badge variant="secondary">Scrapé</Badge>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function DirectoryClient({ initialProfiles, initialScraped }: Props) {
  const [profiles] = useState<AlumniEntry[]>(initialProfiles)
  const [scraped, setScraped] = useState<ScrapedEntry[]>(initialScraped)
  const [csvRows, setCsvRows] = useState<CsvAlumniRow[]>([])
  const [isLoadingCsv, setIsLoadingCsv] = useState(false)
  const [isScrapingCsv, setIsScrapingCsv] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState(0)
  const [csvOpen, setCsvOpen] = useState(false)

  const { grouped, tabKeys, totalPromos } = useMemo(() => {
    const allRows: DirectoryRow[] = [
      ...profiles.map((p) => ({ ...p, type: 'alumni' as const })),
      ...scraped.map((s) => ({ ...s, type: 'scraped' as const })),
    ]
    const grouped = groupByPromo(allRows)
    const tabKeys = [...grouped.keys()]
    const totalPromos = tabKeys.filter((k) => k !== 'Sans promo').length
    return { grouped, tabKeys, totalPromos }
  }, [profiles, scraped])

  const loadCsvUrls = async () => {
    setIsLoadingCsv(true)
    try {
      const res = await fetch('/api/alumni/csv-urls')
      const data = await res.json()
      if (data.rows) setCsvRows(data.rows)
    } catch {
      alert('Erreur lors du chargement du CSV')
    } finally {
      setIsLoadingCsv(false)
    }
  }

  const handleScrape = useCallback(async () => {
    if (csvRows.length === 0) return
    setIsScrapingCsv(true)
    setScrapeProgress(0)

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i]
      const response = await scrapingClient.scrapeLinkedInProfile(row.linkedinUrl, row)

      if (response.success && response.data) {
        const newEntry: ScrapedEntry = {
          id: crypto.randomUUID(),
          name: response.data.name,
          email: row.email || null,
          graduation_year: row.graduationYear,
          title: response.data.title,
          company: response.data.company,
          linkedin_url: response.data.linkedin_url,
          avatar_url: response.data.avatar_url ?? null,
          education: row.diploma || response.data.education,
          type: 'scraped',
        }
        setScraped((prev) => [...prev, newEntry])
      }
      setScrapeProgress(i + 1)
    }

    setIsScrapingCsv(false)
    setCsvRows([])
  }, [csvRows])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Annuaire Alumni
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Explorez votre réseau de diplômés par promotion.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-black text-blue-600 leading-none">
              {profiles.length + scraped.length}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Total</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
              {profiles.length}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Alumni</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
              {scraped.length}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Scrapés</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
              {totalPromos}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Promos</span>
          </div>
        </div>
      </div>

      {/* CSV Import (modernized) */}
      <div className="group rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
        <button
          className="w-full flex items-center justify-between px-8 py-6 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
          onClick={() => setCsvOpen((v) => !v)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Collecte Automatisée</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Scraper depuis alumni_linkedin_profiles.csv</p>
            </div>
          </div>
          <div className={cn("w-8 h-8 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center transition-transform duration-300", csvOpen && "rotate-180")}>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </div>
        </button>

        {csvOpen && (
          <div className="px-8 py-8 space-y-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-300">
            <div className="max-w-2xl">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Importez massivement des données depuis le fichier source <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-lg text-blue-600 font-bold">alumni_linkedin_profiles.csv</code>. 
                Le système scannera les URLs LinkedIn pour enrichir les profils.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                variant="outline"
                onClick={loadCsvUrls}
                disabled={isLoadingCsv || isScrapingCsv}
                className="h-12 px-6 border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold transition-all shadow-sm group"
              >
                {isLoadingCsv ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-5 w-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                )}
                Charger la base source
              </Button>

              <Button
                onClick={handleScrape}
                disabled={csvRows.length === 0 || isScrapingCsv}
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                {isScrapingCsv ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processus {scrapeProgress}/{csvRows.length} profils...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-5 w-5" />
                    {csvRows.length > 0
                      ? `Lancer le Scraping (${csvRows.length})`
                      : 'Prêt à Scraper'}
                  </>
                )}
              </Button>
            </div>

            {csvRows.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 w-fit animate-in fade-in slide-in-from-left-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold">{csvRows.length} profils chargés et prêts</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promo tabs (modernized) */}
      {tabKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Annuaire vide</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-[280px] text-center">Utilisez le module de collecte ci-dessus pour remplir votre base.</p>
        </div>
      ) : (
        <Tabs defaultValue={tabKeys[0]} className="space-y-6">
          <TabsList className="h-auto p-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl flex-wrap justify-start gap-1">
            {tabKeys.map((key) => {
              const count = grouped.get(key)!.length
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md transition-all group"
                >
                  {key === 'Sans promo' ? 'Sans promo' : `Promo ${key}`}
                  <span className="ml-2.5 px-2 py-0.5 rounded-lg bg-zinc-200/50 dark:bg-zinc-700/50 text-[10px] font-black group-data-[state=active]:bg-blue-50 dark:group-data-[state=active]:bg-blue-900/30">
                    {count}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabKeys.map((key) => (
            <TabsContent key={key} value={key} className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800/50">
                        <TableHead className="w-12 px-6 py-5"></TableHead>
                        <TableHead className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">Diplômé</TableHead>
                        <TableHead className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">Email</TableHead>
                        <TableHead className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">Carrière</TableHead>
                        <TableHead className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">Type</TableHead>
                        <TableHead className="w-16 px-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped.get(key)!.map((row) => {
                        const name = getDisplayName(row)
                        const position = row.type === 'alumni' ? row.current_position : row.title
                        const company = row.type === 'alumni' ? row.current_company : row.company
                        return (
                          <TableRow key={row.id} className="group border-zinc-100 dark:border-zinc-800/50 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                            <TableCell className="px-6 py-5">
                              <div className="relative">
                                <AvatarCell url={row.avatar_url} name={name} />
                                {row.type === 'alumni' && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white dark:border-zinc-900 rounded-full" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-5">
                              <span className="font-bold text-zinc-900 dark:text-zinc-50 text-[15px] group-hover:text-blue-600 transition-colors">
                                {name}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-5">
                              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {row.email || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                  {position || '—'}
                                </span>
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                                  {company || 'Sans entreprise'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-5">
                              {row.type === 'alumni' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">
                                  Alumni
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
                                  Prospect
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-5">
                              {row.linkedin_url && (
                                <a
                                  href={row.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-100"
                                >
                                  <ExternalLink className="h-4.5 w-4.5" />
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
