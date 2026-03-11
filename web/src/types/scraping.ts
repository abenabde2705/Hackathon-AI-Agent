import { z } from 'zod';

export const LinkedInScrapeRequestSchema = z.object({
  url: z.string().url().refine((url) => url.includes('linkedin.com/in/'), {
    message: 'Must be a valid LinkedIn profile URL',
  }),
  // Optional CSV metadata to persist alongside scraped data
  email: z.string().email().optional(),
  name: z.string().optional(),
  graduationYear: z.number().int().optional(),
  diploma: z.string().optional(),
});

export type LinkedInScrapeRequest = z.infer<typeof LinkedInScrapeRequestSchema>;

export interface LinkedInProfileData {
  name: string;
  title: string;
  company: string;
  location?: string;
  education: string;
  avatar_url?: string;
  linkedin_url: string;
  summary?: string;
}

export interface ScrapingResponse<T = LinkedInProfileData> {
  success: boolean;
  data?: T;
  error?: string;
}

// Minimal interface for Apify response
export interface ApifyScrapeResult {
  [key: string]: unknown;
}
