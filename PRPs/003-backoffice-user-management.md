# Backoffice User Management & Import PRP

> This PRP covers the implementation of a closed user management system, disabling public signup and enabling staff/admin to invite alumni via manual forms or CSV imports.

## Goal
Transition from a public signup model to a managed invitation model where only authorized staff and admins can onboard new alumni, ensuring data quality and platform security.

## Why
**Business Justification:**
- **Verification:** Ensures only verified alumni can join the platform.
- **Data Pre-population:** Allows the school to pre-fill academic records (degree, graduation year).
- **Control:** Restricts administrative access; staff can create alumni, but only admins can create other staff.

**Priority:** High

## What

### Feature Description
- **Closed System:** Removal of the public registration page.
- **Invitation Flow:** Uses Supabase Auth Admin API to invite users. Invited users receive an email to set their password.
- **Single User Creation:** Form for staff/admin to create a single account.
- **Bulk Import (CSV):** Tool to parse a CSV and invite multiple alumni at once.
- **Role-Based Permissions:** 
    - `Staff` can create `Alumni`.
    - `Admin` can create `Alumni` and `Staff`.

### Scope
**In Scope:**
- Deletion of `/signup` route.
- Implementation of `web/src/lib/supabase/admin.ts` (requires `SUPABASE_SERVICE_ROLE_KEY`).
- User list and management UI in `web/src/app/(staff)/users`.
- CSV parser (client-side) for the following fields: `first_name`, `last_name`, `email`, `linkedin_url`, `graduation_year`, `degree`.
- Error handling for duplicate emails or malformed CSVs.

**Out of Scope:**
- Real-time import progress bars (using simple state for MVP).
- Advanced CSV column mapping (strict headers required).

### User Stories
1. **As a Staff member**, I want to create an account for a new graduate so they can access the network.
2. **As an Admin**, I want to onboard a new staff member to help manage the platform.
3. **As a Staff member**, I want to upload a CSV of 50 students to invite them all in one click.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `web/src/lib/supabase/server.ts` | Existing server client pattern. |
| `supabase/migrations/20260219000000_auth_trigger.sql` | Automatic profile creation trigger. |
| `ai_docs/database.md` | Schema for `profiles` table. |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `web/src/lib/supabase/admin.ts` | CREATE | Admin client with `service_role` key. |
| `web/src/app/(staff)/users/actions.ts` | CREATE | Server Actions for `inviteUser` and `bulkInvite`. |
| `web/src/app/(staff)/users/page.tsx` | CREATE | User list and creation dashboard. |
| `web/src/app/(staff)/users/import/page.tsx` | CREATE | CSV upload and preview component. |
| `web/src/app/(auth)/signup/page.tsx` | DELETE | Disable public signup. |
| `web/src/middleware.ts` | MODIFY | Clean up signup-related redirection. |

## Implementation Details

### Supabase Admin Client
```typescript
// web/src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

### Business Logic: Role Check
In `inviteUser` server action:
1. Get the current user's role.
2. If `staff` and target role is not `alumni` -> Throw Error.
3. If `admin` -> Allow `staff` or `alumni`.

### CSV Format (Headers)
`first_name`, `last_name`, `email`, `linkedin_url`, `graduation_year`, `degree`

## Validation Criteria

### Functional Requirements
- [ ] Public `/signup` is inaccessible.
- [ ] Staff can successfully invite an Alumnus via email.
- [ ] Staff cannot invite another Staff (permission error).
- [ ] CSV import validates headers and shows a preview of data.
- [ ] Profiles are correctly updated with CSV data after the Auth invite is sent.
- [ ] Invited users can set their password via the email link.

### Technical Requirements
- [ ] Service role key is never exposed to the client.
- [ ] Server Actions use `createAdminClient` only for auth operations.
- [ ] Proper `revalidatePath('/(staff)/users')` after actions.
- [ ] TypeScript types reflect the `profiles` schema accurately.

### Testing Steps
1. **Permission Test:** Log in as `staff`, try to create a `staff` user (should fail).
2. **Single Invite:** Create one `alumni` and check if the email invitation is sent in Supabase.
3. **CSV Test:** Upload a CSV with 3 rows. Verify all 3 appear in `profiles` and receive invitations.
4. **Security Test:** Verify `SUPABASE_SERVICE_ROLE_KEY` is not in the browser bundle.

---
**Created:** 2026-02-19
**Status:** Ready
