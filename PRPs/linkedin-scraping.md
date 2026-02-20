# LinkedIn Scraping with Bright Data PRP

## Goal
Enable the backend to securely scrape LinkedIn profile data using Bright Data's Dataset API so that alumni profiles can be enriched with up-to-date professional information.

## Why
**Business Justification:**
- **Alumni/Admin benefit:** Automates the process of keeping alumni professional history accurate without manual entry.
- **Problem solved:** LinkedIn's anti-scraping measures make direct scraping difficult; Bright Data provides a reliable, managed solution.
- **Impact:** Higher data quality for the job board and networking features.

**Priority:** High

## What
### Feature Description
A secure backend service and API endpoint that accepts a LinkedIn URL, communicates with Bright Data's `gd_l1viktl72bvl7bjuj0` dataset, and returns the parsed profile data.

### Scope
**In Scope:**
- Secure environment variable management for `BRIGHT_DATA_API_KEY`.
- Modular service class `BrightDataService` for API interaction.
- Next.js API route (`POST /api/scrape/linkedin`) with Supabase authentication.
- Error handling for invalid URLs, auth failures, and API errors.
- TypeScript interfaces for the scraping request and response.

**Out of Scope:**
- Frontend UI (Phase 2).
- Storing the result in the database.

### User Stories
1. As a system service, I want to trigger a LinkedIn scrape via an API call so that I can retrieve professional data for a profile.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `web/src/lib/supabase/server.ts` | Pattern for server-side Supabase client and auth checks. |
| `ai_docs/services.md` | Guidance on service placement and naming conventions. |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `.env.example` | MODIFY | Added `BRIGHT_DATA_API_KEY`. |
| `web/src/lib/services/scraping/bright-data.ts` | CREATE | Core logic for calling Bright Data API. |
| `web/src/app/api/scrape/linkedin/route.ts` | CREATE | API endpoint for the scraping service. |
| `web/src/types/scraping.ts` | CREATE | TypeScript types for inputs and Bright Data responses. |

### Existing Patterns to Follow
- Use `fetch` for external API calls.
- Use `createClient` from `@/lib/supabase/server` for authorization.
- Use `zod` for request body validation.

## Implementation Details

### API Endpoints
#### `POST /api/scrape/linkedin`
**Purpose:** Trigger a LinkedIn scrape for a specific profile.

**Request Body:**
```typescript
{
  "url": "https://www.linkedin.com/in/username/"
}
```
**Response (Success):**
```typescript
{
  "success": true,
  "data": [ { ... profile data ... } ]
}
```

## Validation Criteria

### Functional Requirements
- [x] Successfully triggers Bright Data scrape for a valid LinkedIn URL.
- [x] Correctly handles `BRIGHT_DATA_API_KEY` from environment variables.
- [x] Returns 400 for invalid LinkedIn URLs.
- [x] Returns 401 if the user is not authenticated.
- [x] Returns 502/500 with descriptive error if Bright Data API fails.

### Technical Requirements
- [x] TypeScript compiles without errors (`pnpm build` or `tsc`).
- [x] API Key is never exposed to the client-side.
- [x] Input validation using `zod`.

### Testing Steps
1. Set `BRIGHT_DATA_API_KEY` in `.env.local`.
2. Ensure you are logged in (to get a valid Supabase session).
3. Call `POST /api/scrape/linkedin` with a valid JSON body.
4. Verify the result matches the Bright Data schema.
