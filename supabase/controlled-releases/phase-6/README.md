# Grade 5 Yearly Phase 6 activation

The SQL in this directory is intentionally outside `supabase/migrations`.
Standard Phase 2 migration commands therefore cannot discover or execute it.

After the certified legacy backfill, dependency-zero verification, and deployment
of the subscription-only application, a separately authorized Phase 6 change must
promote `activate_grade5_yearly_plans.sql` into normal Supabase migration history
using `supabase migration new`. It must then be independently reviewed before any
production database execution.

Do not execute this file directly and do not copy it into `supabase/migrations`
during Phase 2.
