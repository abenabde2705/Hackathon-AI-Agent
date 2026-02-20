'use client'

import { LinkedInProfileData } from '@/types/scraping'
import { Card } from '@/components/ui/card'
import { ExternalLink, GraduationCap, Building2, MapPin, Briefcase } from 'lucide-react'

interface ProfileCardProps {
  data: LinkedInProfileData
  error?: string
}

export function ProfileCard({ data, error }: ProfileCardProps) {
  if (error) {
    return (
      <Card className="p-4 border-destructive/50 bg-destructive/5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-destructive">Échec de l&apos;extraction</p>
          <p className="text-xs text-muted-foreground break-all">{data.linkedin_url}</p>
          <p className="text-xs text-destructive">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
      <div className="p-5">
        <div className="flex gap-4 items-start">
          {/* Avatar Container */}
          <div className="relative flex-shrink-0">
            {data.avatar_url ? (
              <img 
                src={data.avatar_url} 
                alt={data.name} 
                className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
                <span className="text-xl font-bold text-zinc-400">
                  {data.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <a 
              href={data.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="Voir sur LinkedIn"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Info Container */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate leading-tight">
              {data.name}
            </h4>
            
            <div className="mt-1 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
              <Briefcase className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{data.title}</span>
            </div>

            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{data.company}</span>
            </div>

            {data.location && (
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start text-sm">
            <GraduationCap className="h-4 w-4 mr-2 mt-0.5 text-zinc-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-0.5">Éducation</span>
              <p className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-2">
                {data.education}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
