import { ScrapingResponse, BrightDataScrapeResult } from '@/types/scraping';

/**
 * Client-side service to trigger LinkedIn scraping.
 */
export async function scrapeLinkedInProfile(url: string): Promise<ScrapingResponse<BrightDataScrapeResult[]>> {
  try {
    const response = await fetch('/api/scrape/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Scraping service error:', error);
    return {
      success: false,
      error: 'Failed to connect to the scraping service. Please try again later.',
    };
  }
}
