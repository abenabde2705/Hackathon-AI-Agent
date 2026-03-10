import { createAdminClient } from '@/lib/supabase/admin';
import { LinkedInProfileData } from '@/types/scraping';

export async function getCachedProfile(url: string): Promise<LinkedInProfileData | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('scraped_profiles')
    .select('name, title, company, location, education, avatar_url, summary, linkedin_url')
    .eq('linkedin_url', url)
    .single();

  if (error || !data) return null;

  return data as LinkedInProfileData;
}

export async function saveScrapedProfile(url: string, data: LinkedInProfileData): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('scraped_profiles')
    .upsert(
      {
        linkedin_url: url,
        name: data.name,
        title: data.title,
        company: data.company,
        location: data.location ?? null,
        education: data.education,
        avatar_url: data.avatar_url ?? null,
        summary: data.summary ?? null,
        scraped_at: new Date().toISOString(),
      },
      { onConflict: 'linkedin_url' }
    );
}
