import { BrightDataScrapeResult } from '@/types/scraping';

const SCRAPE_URL = 'https://api.brightdata.com/datasets/v3/scrape';
const DATASET_ID = 'gd_l1viktl72bvl7bjuj0';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class BrightDataService {
  private static getApiKey(): string {
    const apiKeyRaw = process.env.BRIGHT_DATA_API_KEY;
    if (!apiKeyRaw || apiKeyRaw === 'your_bright_data_api_key_here') {
      throw new Error('BRIGHT_DATA_API_KEY is not configured or still using placeholder value.');
    }
    return apiKeyRaw.trim().replace(/^["'](.+)["']$/, '$1');
  }

  static async scrapeLinkedInProfile(profileUrl: string): Promise<BrightDataScrapeResult[]> {
    const apiKey = BrightDataService.getApiKey();

    // Step 1: Trigger scrape
    const triggerRes = await fetch(
      `${SCRAPE_URL}?dataset_id=${DATASET_ID}&notify=false&include_errors=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: [{ url: profileUrl }] }),
      }
    );

    if (!triggerRes.ok) {
      const errorText = await triggerRes.text();
      throw new Error(`Bright Data API failure (${triggerRes.status}): ${errorText}`);
    }

    const triggerData = await triggerRes.json();

    // BrightData may return results synchronously (array or single object) or a snapshot_id for async polling
    if (Array.isArray(triggerData)) {
      return triggerData;
    }

    const { snapshot_id } = triggerData;

    // Single profile object returned directly (no snapshot_id field)
    if (!snapshot_id) {
      return [triggerData];
    }

    // Step 2: Poll progress (max ~24s, 2s intervals)
    const POLL_INTERVAL_MS = 2000;
    const MAX_POLLS = 12;
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const progressRes = await fetch(
        `https://api.brightdata.com/datasets/v3/progress/${snapshot_id}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const { status } = await progressRes.json();
      if (status === 'ready') break;
      if (status === 'failed') throw new Error('Bright Data snapshot failed');
      if (i === MAX_POLLS - 1) throw new Error('Bright Data snapshot timed out');
    }

    // Step 3: Download results
    const downloadRes = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshot_id}?format=json`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!downloadRes.ok) {
      throw new Error(`Bright Data download failure (${downloadRes.status})`);
    }
    return downloadRes.json();
  }
}
