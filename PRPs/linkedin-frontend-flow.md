# LinkedIn Alumni Scraping Frontend PRP

## Goal
Implement a complete frontend flow for scraping LinkedIn alumni profiles, allowing staff to input URLs and view structured professional data in a modern, card-based interface.

## Why
**Business Justification:**
- **Efficiency:** Automates the collection of alumni professional data.
- **Data Quality:** Ensures profile information is up-to-date by fetching directly from LinkedIn.
- **User Experience:** Provides a clean, visual way to verify scraped data before any further processing (like saving to the database).

## What
### Feature Description
A new dashboard page for staff to trigger LinkedIn scraping and view results.

### Scope Boundaries
**In Scope:**
- Multiple URL input (one per line).
- Integration with the existing `POST /api/scrape/linkedin` endpoint.
- Responsive, card-based results display.
- Loading states (per profile or global).
- Error handling for failed scrapes or invalid URLs.
- Basic "Bulk CSV Import" preparation (modular components).

**Out of Scope:**
- Automatically saving results to the database (will be handled in a separate step/PRP).
- Advanced CSV parsing (already exists in other pages, but integration here is for the future).

### User Stories
1. As a staff member, I want to paste one or more LinkedIn URLs into a text field.
2. As a staff member, I want to click "Scrape" and see a loading indicator while data is being fetched.
3. As a staff member, I want to see a card for each profile containing their photo, name, job title, company, and education.
4. As a staff member, I want to be notified if a specific URL failed to scrape.

## Technical Context

### Files to Reference (read-only)
- `web/src/app/api/scrape/linkedin/route.ts` - Backend endpoint.
- `web/src/lib/services/scraping/bright-data.ts` - Backend service logic.
- `web/src/app/(staff)/alumni/import/page.tsx` - Reference for CSV import UI patterns.
- `web/src/components/ui/card.tsx` - UI component for cards.

### Files to Implement/Modify
- `web/src/types/scraping.ts` - **Modify**: Add `LinkedInProfileData` and update `ScrapingResponse`.
- `web/src/lib/services/scraping/client.ts` - **Create**: Frontend service to handle fetch calls to the scraping API.
- `web/src/app/(staff)/alumni/scrape/page.tsx` - **Create**: Main page for the scraping flow.
- `web/src/components/ui/textarea.tsx` - **Create**: Standard UI component for multi-line input.
- `web/src/components/scraping/URLInputForm.tsx` - **Create**: Form component for URL input.
- `web/src/components/scraping/ProfileCard.tsx` - **Create**: Display component for a single profile.
- `web/src/components/scraping/ScrapeResults.tsx` - **Create**: List component for results.
- `web/src/app/(staff)/alumni/page.tsx` - **Modify**: Add link to the new scraping page.

### Existing Patterns to Follow
- Use Tailwind CSS 4 for styling.
- Use `lucide-react` for icons.
- Use `shadcn/ui` components (Card, Button, Input, Textarea).
- Follow the "client service" pattern for data fetching.

## Implementation Details

### Data Types (`web/src/types/scraping.ts`)
```typescript
export interface LinkedInProfileData {
  name: string;
  title: string;
  company: string;
  education: string;
  avatar_url?: string;
  linkedin_url: string;
}

export interface ScrapingResponse<T = LinkedInProfileData> {
  success: boolean;
  data?: T | T[];
  error?: string;
}
```

### Components

#### `ProfileCard`
- Display `avatar_url` in an `Avatar` component (or circle img).
- Show `name` in bold.
- Show `title` and `company` below name.
- Show `education` with an icon (e.g., `GraduationCap`).
- Link to the `linkedin_url`.
- Handle "not found" or "error" states visually.

#### `URLInputForm`
- `Textarea` for multiple URLs.
- Validation: ensure each line is a valid LinkedIn URL.
- Submit button with loading state.

## Validation Criteria

### Functional Requirements
- [ ] Accepts multiple URLs and triggers sequential or parallel API calls.
- [ ] Displays loading spinner during scraping.
- [ ] Successfully renders profile cards with data from the API.
- [ ] Handles API errors (400, 401, 500) gracefully with toast or alert messages.
- [ ] UI is responsive and works on mobile/desktop.

### Technical Requirements
- [ ] TypeScript compiles without errors.
- [ ] No direct calls to external APIs from the client (must go through `/api/scrape/linkedin`).
- [ ] Efficient state management for multiple results.

### Testing Steps
1. Navigate to `/staff/alumni/scrape`.
2. Input 2-3 valid LinkedIn URLs.
3. Verify that cards appear with correct information.
4. Input an invalid URL and verify the error handling.
5. Check responsiveness by resizing the browser.
