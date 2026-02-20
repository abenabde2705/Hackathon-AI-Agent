import { z } from 'zod';

export const LinkedInScrapeRequestSchema = z.object({
  url: z.string().url().refine((url) => url.includes('linkedin.com/in/'), {
    message: 'Must be a valid LinkedIn profile URL',
  }),
});

export type LinkedInScrapeRequest = z.infer<typeof LinkedInScrapeRequestSchema>;

export interface ScrapingResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Minimal interface for Bright Data response based on requirement
export interface BrightDataScrapeResult {
  [key: string]: unknown;
}
