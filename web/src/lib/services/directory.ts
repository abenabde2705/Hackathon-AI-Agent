import { createAdminClient } from '@/lib/supabase/admin';
import { AlumniEntry, ScrapedEntry } from '@/app/api/alumni/directory/route';

export async function getDirectoryEntries(): Promise<{ profiles: AlumniEntry[]; scraped: ScrapedEntry[] }> {
  const admin = createAdminClient();

  const [usersResult, profilesResult, scrapedResult] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('*').eq('role', 'alumni'),
    admin.from('scraped_profiles').select('*'),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (scrapedResult.error) throw scrapedResult.error;

  const emailMap = new Map(usersResult.data.users.map((u) => [u.id, u.email ?? null]));

  const profiles: AlumniEntry[] = (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    email: emailMap.get(p.id) ?? null,
    graduation_year: p.graduation_year,
    degree: p.degree,
    current_position: p.current_position,
    current_company: p.current_company,
    linkedin_url: p.linkedin_url,
    avatar_url: p.avatar_url,
    type: 'alumni',
  }));

  // Deduplicate: exclude scraped entries whose email or linkedin_url
  // already matches an existing alumni profile
  const alumniEmails = new Set(profiles.map((p) => p.email).filter(Boolean))
  const alumniLinkedins = new Set(profiles.map((p) => p.linkedin_url).filter(Boolean))

  const scraped: ScrapedEntry[] = (scrapedResult.data ?? [])
    .filter((s) => {
      if (s.email && alumniEmails.has(s.email)) return false
      if (s.linkedin_url && alumniLinkedins.has(s.linkedin_url)) return false
      return true
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email ?? null,
      graduation_year: s.graduation_year ?? null,
      title: s.title,
      company: s.company,
      linkedin_url: s.linkedin_url,
      avatar_url: s.avatar_url,
      education: s.diploma ?? s.education,
      type: 'scraped',
    }));

  return { profiles, scraped };
}
