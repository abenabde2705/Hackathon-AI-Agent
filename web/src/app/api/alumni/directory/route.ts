import { NextResponse } from 'next/server';
import { getDirectoryEntries } from '@/lib/services/directory';

export interface AlumniEntry {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  graduation_year: number | null;
  degree: string | null;
  current_position: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  type: 'alumni';
}

export interface ScrapedEntry {
  id: string;
  name: string | null;
  email: null;
  graduation_year: number | null;
  title: string | null;
  company: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  education: string | null;
  type: 'scraped';
}

export async function GET() {
  try {
    const data = await getDirectoryEntries();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[DIRECTORY_API_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
