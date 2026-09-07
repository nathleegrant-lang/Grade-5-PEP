# Grade 5 Yearly Phase 6 activation

The reviewed activation logic has been promoted to the normal migration:

`supabase/migrations/20260907043932_activate_grade5_yearly_plans.sql`

The former standalone SQL has been retired so there is only one executable
authority. The promoted migration remains unexecuted and requires independent
Phase 6 QA and separate Master production-deployment authorization.
