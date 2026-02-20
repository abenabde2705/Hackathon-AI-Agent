import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LinkedInScrapeRequestSchema, ScrapingResponse } from '@/types/scraping';
import { BrightDataService } from '@/lib/services/scraping/bright-data';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ScrapingResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Input Validation
    const body = await request.json();
    const validatedData = LinkedInScrapeRequestSchema.parse(body);

    // 3. Trigger Scrape
    const result = await BrightDataService.scrapeLinkedInProfile(validatedData.url);

    // 4. Return Result
    return NextResponse.json<ScrapingResponse>(
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

    if (error instanceof Error && error.message?.includes('Bright Data API failure')) {
      return NextResponse.json<ScrapingResponse>(
        { success: false, error: 'External API failure' },
        { status: 502 }
      );
    }

    return NextResponse.json<ScrapingResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
