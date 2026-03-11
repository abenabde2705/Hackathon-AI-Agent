'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set('search', search)
      else params.delete('search')
      router.push(`?${params.toString()}`)
    }, 500)
    return () => clearTimeout(timer)
  }, [search, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    
    if (key === 'type') setType(value)
    if (key === 'sort') setSort(value)
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-zinc-900 p-4 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="flex-1 space-y-2 w-full">
        <label className="text-sm font-medium px-1">Recherche</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Titre, entreprise..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 w-full md:w-48">
        <label className="text-sm font-medium px-1">Type de contrat</label>
        <select 
          value={type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
        >
          <option value="all">Tous les types</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Freelance">Freelance</option>
        </select>
      </div>

      <div className="space-y-2 w-full md:w-48">
        <label className="text-sm font-medium px-1">Trier par</label>
        <select 
          value={sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
        >
          <option value="newest">Plus récent</option>
          <option value="oldest">Plus ancien</option>
        </select>
      </div>
    </div>
  )
}
