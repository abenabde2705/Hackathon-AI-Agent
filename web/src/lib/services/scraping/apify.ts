import puppeteer from 'puppeteer';
import { ApifyScrapeResult } from '@/types/scraping';

const ACTOR_ID = '2SyF0bVxmgGr8IVCZ';
const APIFY_API_BASE = 'https://api.apify.com/v2';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function extractApifyToken(email: string, password: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();

    // Intercept Authorization header from any API request the console makes
    let apiToken: string | null = null;
    page.on('request', (req) => {
      const auth = req.headers()['authorization'];
      if (auth?.startsWith('Bearer ') && !apiToken) {
        apiToken = auth.replace('Bearer ', '').trim();
      }
    });

    // Login step 1: email
    await page.goto('https://console.apify.com/sign-in', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder="Email"]', { timeout: 15000 });
    await page.type('input[placeholder="Email"]', email);
    await page.click('button::-p-text(Next)');

    // Login step 2: password
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.type('input[type="password"]', password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]'),
    ]);

    // Wait for the console to make authenticated API calls and capture the token
    await sleep(5000);

    if (!apiToken) {
      // Trigger an API call by navigating to a page that loads data
      await page.goto('https://console.apify.com/actors', { waitUntil: 'networkidle2' });
      await sleep(5000);
    }

    if (!apiToken) throw new Error('Could not capture Apify API token from browser session');

    console.log('[APIFY] Token captured successfully');
    return apiToken;

  } finally {
    await browser.close();
  }
}

export class ApifyService {
  static async scrapeLinkedInProfile(profileUrl: string): Promise<ApifyScrapeResult[]> {
    const email = process.env.APIFY_EMAIL;
    const password = process.env.APIFY_PASSWORD;

    if (!email || !password)
      throw new Error('APIFY_EMAIL and APIFY_PASSWORD are not configured.');

    // Step 1: Login via Puppeteer and steal the Bearer token
    const token = await extractApifyToken(email, password);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: 'https://console.apify.com',
      Referer: `https://console.apify.com/actors/${ACTOR_ID}/input`,
    };

    // Step 2: Trigger actor run via API (now with a real token from UI session)
    const runRes = await fetch(`${APIFY_API_BASE}/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ profileUrls: [profileUrl] }),
    });
    const runData = await runRes.json();
    console.log('[APIFY] Run trigger response:', JSON.stringify(runData));

    if (!runData?.data?.id)
      throw new Error(`Apify trigger failed: ${JSON.stringify(runData)}`);

    const { id: runId, defaultDatasetId } = runData.data;

    // Step 3: Poll run status
    const POLL_INTERVAL_MS = 5000;
    const MAX_POLLS = 24;
    let finalDatasetId: string = defaultDatasetId;

    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const statusRes = await fetch(`${APIFY_API_BASE}/actor-runs/${runId}`, { headers });
      const { data } = await statusRes.json();
      console.log(`[APIFY] Run status (${i + 1}/${MAX_POLLS}): ${data.status}`);

      if (data.status === 'SUCCEEDED') { finalDatasetId = data.defaultDatasetId; break; }
      if (['FAILED', 'TIMED-OUT', 'ABORTED'].includes(data.status))
        throw new Error(`Apify run ${data.status.toLowerCase()}`);
      if (i === MAX_POLLS - 1) throw new Error('Apify run timed out after 2 minutes');
    }

    // Step 4: Fetch dataset results
    const dataRes = await fetch(`${APIFY_API_BASE}/datasets/${finalDatasetId}/items`, { headers });
    if (!dataRes.ok) throw new Error(`Dataset fetch failed (${dataRes.status})`);
    return dataRes.json();
  }
}
