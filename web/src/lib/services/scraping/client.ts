import { LinkedInProfileData, ScrapingResponse } from '@/types/scraping';

export const scrapingClient = {
  async scrapeLinkedInProfile(url: string): Promise<ScrapingResponse> {
    try {
      const response = await fetch('/api/scrape/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();
      
      // Map Bright Data result to our LinkedInProfileData if necessary
      const rawData = Array.isArray(result.data) ? result.data[0] : result.data;

      // Helper to extract string from potential object (common in scraper results)
      const getStringValue = (val: unknown): string => {
        if (!val) return 'Non spécifié';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          return val.name || val.title || val.text || JSON.stringify(val);
        }
        return String(val);
      };

      const profile: LinkedInProfileData = {
        name: getStringValue(rawData?.name || rawData?.full_name || 'Inconnu'),
        title: getStringValue(rawData?.title || rawData?.occupation),
        company: getStringValue(rawData?.company || rawData?.current_company),
        location: typeof rawData?.location === 'object' ? rawData.location?.name || rawData.location?.text : rawData?.location,
        education: Array.isArray(rawData?.education) 
          ? getStringValue(rawData.education[0]?.school || rawData.education[0])
          : getStringValue(rawData?.education),
        avatar_url: rawData?.avatar_url || rawData?.profile_pic_url,
        linkedin_url: url,
        summary: rawData?.summary || rawData?.about,
      };

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error('Scraping client error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  },
};
