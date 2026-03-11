import { NextRequest, NextResponse } from 'next/server';
import { LinkedInScrapeRequestSchema, ScrapingResponse } from '@/types/scraping';
import { BrightDataService } from '@/lib/services/scraping/bright-data';
import { createAdminClient } from '@/lib/supabase/admin';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Input Validation
    const body = await request.json();
    const validatedData = LinkedInScrapeRequestSchema.parse(body);

    // 2. Trigger Scrape
    const result = await BrightDataService.scrapeLinkedInProfile(validatedData.url);
    const rawData = (Array.isArray(result) ? result[0] : result) as Record<string, unknown>;

    // 3. Extract relevant fields from BrightData response
    const scrapedName =
      (rawData?.name as string) ||
      (rawData?.first_name && rawData?.last_name
        ? `${rawData.first_name} ${rawData.last_name}`
        : null);

    const title =
      (rawData?.title as string) ||
      (rawData?.headline as string) ||
      (rawData?.occupation as string) ||
      null;

    const company =
      (rawData?.current_company_name as string) ||
      (rawData?.current_company && typeof rawData.current_company === 'object'
        ? ((rawData.current_company as Record<string, unknown>).name as string)
        : (rawData?.current_company as string)) ||
      null;

    const avatar_url =
      (rawData?.avatar as string) || (rawData?.avatar_url as string) || null;

    const education =
      (rawData?.educations_details as string) || null;

    // 4. Save to Supabase (upsert by linkedin_url, non-blocking)
    try {
      const admin = createAdminClient();
      await admin.from('scraped_profiles').upsert(
        {
          linkedin_url: validatedData.url,
          name: validatedData.name || scrapedName,
          email: validatedData.email || null,
          graduation_year: validatedData.graduationYear || null,
          diploma: validatedData.diploma || null,
          title,
          company,
          avatar_url,
          education,
          scraped_at: new Date().toISOString(),
        },
        { onConflict: 'linkedin_url' }
      );
    } catch (dbError) {
      console.error('[SCRAPE_LINKEDIN] DB save failed (non-blocking):', dbError);
    }

    // 5. Return Result
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
