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
      const getStringValue = (val: any): string => {
        if (!val) return 'Non spécifié';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          return val.name || val.title || val.text || JSON.stringify(val);
        }
        return String(val);
      };

      // Extract name with fallbacks
      const name = rawData?.name || 
                   rawData?.full_name || 
                   (rawData?.first_name && rawData?.last_name ? `${rawData.first_name} ${rawData.last_name}` : 'Inconnu');

      // Extract education with fallbacks
      let education = 'Non spécifié';
      if (rawData?.educations_details) {
        education = getStringValue(rawData.educations_details);
      } else if (Array.isArray(rawData?.education) && rawData.education.length > 0) {
        const firstEdu = rawData.education[0];
        education = getStringValue(firstEdu?.school || firstEdu?.title || firstEdu);
      }

      const profile: LinkedInProfileData = {
        name: getStringValue(name),
        title: getStringValue(rawData?.title || rawData?.headline || rawData?.occupation),
        company: getStringValue(rawData?.current_company_name || rawData?.company || rawData?.current_company),
        location: getStringValue(rawData?.location || rawData?.city || rawData?.country_code),
        education: education,
        avatar_url: rawData?.avatar || rawData?.avatar_url || rawData?.profile_pic_url,
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
