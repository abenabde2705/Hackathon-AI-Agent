import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface CsvAlumniRow {
  email: string;
  firstName: string;
  lastName: string;
  graduationYear: number | null;
  diploma: string;
  linkedinUrl: string;
}

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'alumni_linkedin_profiles.csv');

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    const rawHeaders = lines[0].split(',').map(h => h.trim());

    // Map normalized header → column index
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const headerIndex = (candidates: string[]) => {
      for (const c of candidates) {
        const idx = rawHeaders.findIndex(h => normalize(h) === normalize(c));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const emailIdx       = headerIndex(['Email']);
    const firstNameIdx   = headerIndex(['Prénom', 'Prenom', 'FirstName']);
    const lastNameIdx    = headerIndex(['Nom', 'LastName']);
    const promoIdx       = headerIndex(['Promo(Année)', 'Promo', 'Année', 'GraduationYear']);
    const diplomaIdx     = headerIndex(['Diplôme', 'Diplome', 'Diploma']);
    const linkedinIdx    = headerIndex(['LinkedIn URL', 'LinkedInURL', 'url']);

    if (linkedinIdx === -1) {
      return NextResponse.json({ error: 'LinkedIn URL column not found in CSV' }, { status: 400 });
    }

    const rows: CsvAlumniRow[] = lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const linkedinUrl = values[linkedinIdx] ?? '';
        if (!linkedinUrl.includes('linkedin.com/in/')) return null;

        const promoRaw = promoIdx !== -1 ? values[promoIdx] : '';
        const year = parseInt(promoRaw, 10);

        return {
          email:          emailIdx !== -1     ? values[emailIdx]     : '',
          firstName:      firstNameIdx !== -1 ? values[firstNameIdx] : '',
          lastName:       lastNameIdx !== -1  ? values[lastNameIdx]  : '',
          graduationYear: isNaN(year)         ? null                 : year,
          diploma:        diplomaIdx !== -1   ? values[diplomaIdx]   : '',
          linkedinUrl,
        } satisfies CsvAlumniRow;
      })
      .filter((r): r is CsvAlumniRow => r !== null);

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return NextResponse.json({ error: 'Failed to read CSV' }, { status: 500 });
  }
}
