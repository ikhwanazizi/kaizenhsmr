# Testing the Admin Audit Log Gate

This page now validates access on the server before rendering the client table. Use these checks to confirm the behavior.

## Prerequisites
- A running dev server (`npm run dev`).
- Access to Supabase credentials and seed data that match your environment.
- Two test users:
  - **Super admin**: `profiles.role = "super_admin"`
  - **Regular admin**: any other role, e.g., `"admin"` or `"manager"`

## Scenarios
1. **Unauthenticated user is redirected**
   - Start from a fresh browser session or private window so no Supabase session cookie is present.
   - Visit `/admin/audit-log`.
   - You should be redirected to `/login` before any audit log data is requested.

2. **Non–super-admin sees a controlled denial**
   - Sign in as the regular admin user.
   - Confirm the sidebar does **not** show the "Audit Log" link (it is reserved for super admins).
   - Manually navigate to `/admin/audit-log`.
   - Expect to see the "Access Denied" view with a link back to the dashboard—no network calls for `admin_audit_log` should occur.

3. **Super admin sees the table data**
   - Sign in as the super admin user.
   - Navigate to `/admin/audit-log`.
   - The audit log table should render with entries ordered by `created_at` descending, including admin name, action, message, and timestamp columns.

## Optional sanity checks
- Trigger an admin action that writes to `admin_audit_log` (e.g., creating a user) and reload the page to verify the entry appears.
- Use the table search box to filter by action strings, and paginate through results if there are more than 20 entries.
