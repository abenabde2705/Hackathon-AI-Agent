import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // The CSV file is in web/public/data/ which gets copied to Docker
    const csvPath = path.join(process.cwd(), 'public', 'data', 'alumni_linkedin_profiles.csv');

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const urlIndex = headers.indexOf('url');

    if (urlIndex === -1) {
      return NextResponse.json({ error: 'url column not found in CSV' }, { status: 400 });
    }

    const urls = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        return values[urlIndex]?.trim();
      })
      .filter(url => url && url.includes('linkedin.com/in/'));

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return NextResponse.json({ error: 'Failed to read CSV' }, { status: 500 });
  }
}
