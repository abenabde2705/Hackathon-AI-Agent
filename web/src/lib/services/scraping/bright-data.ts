import { BrightDataScrapeResult } from '@/types/scraping';

const BRIGHT_DATA_API_URL = 'https://api.brightdata.com/datasets/v3/scrape';
const DATASET_ID = 'gd_l1viktl72bvl7bjuj0';

export class BrightDataService {
  private static apiKey = process.env.BRIGHT_DATA_API_KEY;

  /**
   * Triggers a scrape on Bright Data for a given LinkedIn profile URL.
   * This uses the Dataset API in a synchronous-like manner (waiting for response).
   */
  static async scrapeLinkedInProfile(profileUrl: string): Promise<BrightDataScrapeResult[]> {
    if (!this.apiKey) {
      throw new Error('BRIGHT_DATA_API_KEY is not configured');
    }

    const response = await fetch(`${BRIGHT_DATA_API_URL}?dataset_id=${DATASET_ID}&notify=false&include_errors=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [
          { url: profileUrl }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bright Data API failure (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  }
}
