import { BrightDataScrapeResult } from '@/types/scraping';

const BRIGHT_DATA_API_URL = 'https://api.brightdata.com/datasets/v3/scrape';
const DATASET_ID = 'gd_l1viktl72bvl7bjuj0';

export class BrightDataService {
  /**
   * Triggers a scrape on Bright Data for a given LinkedIn profile URL.
   */
  static async scrapeLinkedInProfile(profileUrl: string): Promise<BrightDataScrapeResult[]> {
    const apiKeyRaw = process.env.BRIGHT_DATA_API_KEY;
    
    if (!apiKeyRaw || apiKeyRaw === 'your_bright_data_api_key_here') {
      throw new Error('BRIGHT_DATA_API_KEY is not configured or still using placeholder value.');
    }

    const apiKey = apiKeyRaw.trim().replace(/^["'](.+)["']$/, '$1');
    
    // Debug: mask key but show we have it
    console.log(`[BrightData] Using key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // Using both methods (Bearer + api_token param) to maximize compatibility
    const url = `${BRIGHT_DATA_API_URL}?dataset_id=${DATASET_ID}&notify=false&include_errors=true`;

const response = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: [{ url: profileUrl }],
  }),
});


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bright Data API failure (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Bright Data API returned non-JSON response (${response.status}): ${text.substring(0, 500)}`);
    }
  }
}
