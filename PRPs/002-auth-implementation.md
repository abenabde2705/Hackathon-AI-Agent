# Authentication & Role-Based Redirection PRP

> This PRP covers the implementation of the core authentication system, automatic profile synchronization, and role-based routing for the Alumni platform.

## Goal
Enable users to securely register and authenticate with the platform, ensuring every user has a profile record and is automatically directed to the appropriate dashboard (Alumni, Staff, or Admin).

## Why
**Business Justification:**
- **Security:** Standardizes access control across the application.
- **Onboarding:** Automates profile creation to reduce friction for new alumni.
- **UX:** Provides a tailored entry point for different user roles, improving efficiency and perceived quality.

**Priority:** High

## What

### Feature Description
- **Supabase Auth Integration:** Email/Password flow using Next.js Server Actions.
- **Auto-Profile Creation:** A PostgreSQL trigger that creates a `profiles` entry whenever a new user confirms their email or signs up.
- **Role Redirection:** Intelligent routing logic that detects the user's role post-login and sends them to the correct path.
- **Premium UI/UX:** A modern, polished authentication interface built with Tailwind CSS 4 and existing UI primitives.

### Scope
**In Scope:**
- Login Page (`/login`) and Signup Page (`/signup`).
- Database migration for the `handle_new_user` trigger.
- Server Actions for `signIn`, `signUp`, and `signOut`.
- Middleware updates for route protection and role-based redirection.
- `alumni` role as default during signup.

**Out of Scope:**
- Third-party OAuth (LinkedIn/Google).
- Password recovery/reset flow (to be handled in a separate PRP).

### User Stories
1. **As a new Alumnus**, I want to create an account so I can join the community.
2. **As a Staff member**, I want to log in and be immediately taken to my management dashboard.
3. **As any user**, I want clear feedback if my credentials are wrong or if the system is loading.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `web/src/lib/supabase/server.ts` | Server-side Supabase client factory. |
| `web/src/lib/supabase/middleware.ts` | Session refresh logic. |
| `ai_docs/database.md` | Profile and Role definitions. |
| `web/src/components/ui/button.tsx` | Standardized button component. |
| `web/src/components/ui/input.tsx` | Standardized input component. |
| `web/src/components/ui/card.tsx` | Standardized card component. |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_auth_trigger.sql` | CREATE | SQL trigger for auto-profile creation. |
| `web/src/app/(auth)/login/page.tsx` | CREATE | Polished login interface. |
| `web/src/app/(auth)/signup/page.tsx` | CREATE | Polished signup interface (default role: `alumni`). |
| `web/src/app/auth/actions.ts` | CREATE | Server actions for Auth logic. |
| `web/src/middleware.ts` | MODIFY | Implement role-based redirection logic. |

## Implementation Details

### Database Trigger
```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'alumni');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### UI-UX Design Specs (Pro Max)
- **Layout:** Centered `Card` with a max-width of `400px`.
- **Styling:** 
  - Use `bg-background/60 backdrop-blur-md` for a modern "glass" effect if layout permits.
  - Subtle gradients on the primary button (`bg-linear-to-r from-primary to-primary/80`).
  - Spacing: Consistent `space-y-6` between form groups.
- **Feedback:** 
  - Button `loading` state with a spinner.
  - Form validation using native HTML5 + descriptive error messages below inputs.
  - "Success" state after signup directing user to check their email.

### Redirection Logic
- **Alumni:** Redirection to `/alumni/jobs`.
- **Staff:** Redirection to `/staff`.
- **Admin:** Redirection to `/admin`.

## Validation Criteria

### Functional Requirements
- [ ] New user signup creates a row in `auth.users` and `public.profiles`.
- [ ] Login redirects `alumni` users to `/alumni/jobs`.
- [ ] Login redirects `staff` users to `/staff`.
- [ ] Logout clears the session and redirects to `/login`.
- [ ] Middleware blocks unauthenticated access to `/(alumni)`, `/(staff)`, and `/(admin)`.

### Technical Requirements
- [ ] TypeScript compiles without errors.
- [ ] Use of `createServerClient` in Server Actions.
- [ ] Proper error handling (try/catch) in all auth actions.
- [ ] Tailwind 4 utility classes used correctly.

### Testing Steps
1. **Signup Test:** Register a new user and verify the `profiles` table in Supabase Dashboard.
2. **Role Test:** Manually change a user's role to `staff` in the database and verify they are redirected to `/staff` upon login.
3. **Security Test:** Attempt to access `/admin` without being logged in (should redirect to `/login`).

---
**Created:** 2026-02-19
**Status:** Ready
