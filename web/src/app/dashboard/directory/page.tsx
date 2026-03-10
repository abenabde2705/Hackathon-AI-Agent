import { DirectoryClient } from './DirectoryClient'
import { getDirectoryEntries } from '@/lib/services/directory'

export default async function DirectoryPage() {
  try {
    const { profiles, scraped } = await getDirectoryEntries()
    return <DirectoryClient initialProfiles={profiles} initialScraped={scraped} />
  } catch {
    return <DirectoryClient initialProfiles={[]} initialScraped={[]} />
  }
}
