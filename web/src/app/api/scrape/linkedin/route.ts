import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScrapeRequestSchema, ScrapingResponse } from '@/types/scraping';
import { BrightDataService } from '@/lib/services/scraping/bright-data';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check (TEMPORARILY DISABLED FOR POSTMAN TESTING)
    /*
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ScrapingResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    */

    // 2. Input Validation
    const body = await request.json();
    const validatedData = LinkedInScrapeRequestSchema.parse(body);

    // 3. Trigger Scrape
    const result = await BrightDataService.scrapeLinkedInProfile(validatedData.url);

    // 4. Return Result
    return NextResponse.json<ScrapingResponse<typeof result>>(
      { success: true, data: result }
    );

  } catch (error: unknown) {
    console.error('[SCRAPE_LINKEDIN_ERROR]:', error);

    if (error instanceof ZodError) {
      return NextResponse.json<ScrapingResponse>(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('BRIGHT_DATA_API_KEY is not configured')) {
        return NextResponse.json<ScrapingResponse>(
          { success: false, error: 'Scraping service not configured. Please check BRIGHT_DATA_API_KEY in your .env.local file.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Bright Data API failure')) {
        return NextResponse.json<ScrapingResponse>(
          { success: false, error: `External API failure: ${error.message}` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json<ScrapingResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
