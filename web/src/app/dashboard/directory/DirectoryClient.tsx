'use client'

import { useState, useCallback, useMemo } from 'react'
import { Users, FileText, Loader2, ExternalLink, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import { AlumniEntry, ScrapedEntry } from '@/app/api/alumni/directory/route'
import { scrapingClient } from '@/lib/services/scraping/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [csvUrls, setCsvUrls] = useState<string[]>([])
  const [isLoadingCsv, setIsLoadingCsv] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('')
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
      if (data.urls) setCsvUrls(data.urls)
    } catch {
      alert('Erreur lors du chargement du CSV')
    } finally {
      setIsLoadingCsv(false)
    }
  }

  const handleScrape = useCallback(async () => {
    if (csvUrls.length === 0) return
    setIsScrapingCsv(true)
    setScrapeProgress(0)

    const year = selectedYear ? parseInt(selectedYear, 10) : null

    for (let i = 0; i < csvUrls.length; i++) {
      const url = csvUrls[i]
      const response = await scrapingClient.scrapeLinkedInProfile(url)

      if (response.success && response.data) {
        const newEntry: ScrapedEntry = {
          id: crypto.randomUUID(),
          name: response.data.name,
          email: null,
          graduation_year: year,
          title: response.data.title,
          company: response.data.company,
          linkedin_url: response.data.linkedin_url,
          avatar_url: response.data.avatar_url ?? null,
          education: response.data.education,
          type: 'scraped',
        }
        setScraped((prev) => [...prev, newEntry])
      }
      setScrapeProgress(i + 1)
    }

    setIsScrapingCsv(false)
    setCsvUrls([])
  }, [csvUrls, selectedYear])

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Annuaire Alumni
          </h2>
          <p className="text-zinc-500 mt-1">
            Tous les alumni, regroupés par promotion.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{profiles.length + scraped.length}</div>
            <div className="text-blue-600 text-xs font-medium">Total</div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-100">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{profiles.length}</div>
            <div className="text-zinc-500 text-xs font-medium">Alumni</div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-100">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{scraped.length}</div>
            <div className="text-zinc-500 text-xs font-medium">Scrapés</div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-100">
            <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{totalPromos}</div>
            <div className="text-zinc-500 text-xs font-medium">Promos</div>
          </div>
        </div>
      </div>

      {/* CSV Import (collapsible) */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => setCsvOpen((v) => !v)}
        >
          <div className="flex items-center gap-3 font-semibold text-zinc-800 dark:text-zinc-100">
            <FileText className="h-4 w-4 text-blue-600" />
            Scraper depuis alumni_linkedin_profiles.csv
          </div>
          {csvOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {csvOpen && (
          <div className="px-5 py-4 space-y-4 bg-white dark:bg-zinc-900">
            <p className="text-sm text-muted-foreground">
              Charge les URLs depuis <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">alumni_linkedin_profiles.csv</code>,
              sélectionne la promo, puis lance le scraping.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <Button
                variant="outline"
                onClick={loadCsvUrls}
                disabled={isLoadingCsv || isScrapingCsv}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {isLoadingCsv ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Charger le CSV
              </Button>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Promo (graduation year)
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sans promo</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleScrape}
                disabled={csvUrls.length === 0 || isScrapingCsv}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isScrapingCsv ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {scrapeProgress}/{csvUrls.length} scrapés...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {csvUrls.length > 0
                      ? `Scraper ${csvUrls.length} URL${csvUrls.length > 1 ? 's' : ''} — Promo ${selectedYear || 'Sans promo'}`
                      : 'Scraper'}
                  </>
                )}
              </Button>
            </div>

            {csvUrls.length > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {csvUrls.length} URL{csvUrls.length > 1 ? 's' : ''} chargée{csvUrls.length > 1 ? 's' : ''} et prête{csvUrls.length > 1 ? 's' : ''} à scraper
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promo tabs */}
      {tabKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <Users className="h-12 w-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">Aucun alumni pour l&apos;instant.</p>
          <p className="text-sm text-zinc-400 mt-1">Importez un CSV ou invitez des alumni.</p>
        </div>
      ) : (
        <Tabs defaultValue={tabKeys[0]}>
          <TabsList className="flex-wrap h-auto gap-1 bg-zinc-100 dark:bg-zinc-800 p-1">
            {tabKeys.map((key) => {
              const count = grouped.get(key)!.length
              return (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                  {key === 'Sans promo' ? 'Sans promo' : `Promo ${key}`}
                  <span className="ml-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabKeys.map((key) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-auto">
                <DirectoryTable rows={grouped.get(key)!} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
