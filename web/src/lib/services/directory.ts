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

  const scraped: ScrapedEntry[] = (scrapedResult.data ?? []).map((s) => ({
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
