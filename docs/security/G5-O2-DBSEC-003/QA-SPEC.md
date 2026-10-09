# Independent synthetic PostgreSQL 17 specification

NOT EXECUTED. Portfolio must authorize Independent QA. Never point this at production.
Use disposable local PostgreSQL 17 with synthetic auth.users, auth.uid() and Supabase
roles/grants/RLS/functions/triggers reconstructed from the non-identifying catalog snapshot
and protected source migrations. No production dump, credentials, keys or records.
Fixture must include the current add_grade5_student capacity/subscription configuration
and existing signup-source/creation-identity triggers, not permissive stub substitutes.
Capture server version and full catalog identity. Fail immediately on schema mismatch.

Create two parents P1/P2, admin A, siblings S11/S12, P2 child S21 with same name as S11,
valid results R11/R12/R21, linked certificates, and historical null/mismatched fixtures
BEFORE applying candidate. Run using actual SET ROLE authenticated/anon/service_role
and synthetic per-session auth.uid; never run parent assertions as postgres.
Each denied test must verify SQLSTATE and zero committed changes with savepoints.

| ID | Execution | Required result |
|---|---|---|
| A1 | P1 updates own role to admin, including profile upsert payload | Denied; role unchanged; admin SELECT policies do not become available |
| A2 | P1 updates full_name/email/phone, SELECT *, then P2 profile edit | Own legitimate edit/read succeeds; other-parent edit denied/zero rows |
| A3 | anon/PUBLIC direct UPDATE/INSERT admin role | Denied; no table/inherited-column grant bypass |
| A4 | Trusted service_role/postgres role edit and supported auth-user profile provisioning | Trusted contract succeeds; inspect definer paths for user_metadata-controlled admin grant |
| BC1 | P1 inserts result with S11 then S12 | Succeeds; siblings' foreign keys stay separate |
| BC2 | P1 inserts/updates result with S21, forged parent, null/nonexistent student | Denied; new-write guard, ownership FK and RLS separately demonstrated |
| BC3 | service_role writes cross-parent result; changes student owner referenced by result | Ownership FK denies even bypass-RLS; no orphaned relationship |
| D1 | Valid P1 certificate linking S11/R11 | Succeeds with matching three-column link |
| D2 | Certificate S11/R12; S11/R21; S21/P1; forged result or parent | Denied for sibling and cross-family substitutions |
| D3 | New certificate null student only, null result only, both null | Denied; MATCH SIMPLE loophole closed |
| D4 | Seeded null/partial/mismatched legacy records; apply NOT VALID candidate | No ownership/null changes; no implicit validation or attribution; catalog convalidated=false |
| D5 | Unchanged legacy non-identity update; clearing a valid reference; partial legacy reassignment | Existing null identity not guessed; identity-clearing denied; full reassignment must satisfy FKs; report update behavior precisely |
| D6 | Delete referenced student; delete result with certificate | Fails atomically with NO ACTION; no SET NULL attribution loss |
| D7 | Delete synthetic auth user with CASCADE; explicitly remove cert→result→student; deferred constraints | Verify complete statement/transaction referential closure; fail QA on surviving mismatch or unexpected cascade contract |
| E1 | Zero-child parent calls legacy RPC twice | One designated child, same UUID; legitimate capacity RPC and Parent gate preserved |
| E2 | Concurrent legacy retries and concurrent add_grade5_student | Shared advisory lock serializes; capacity and partial signup uniqueness preserved |
| E3 | Marked signup among siblings; identical names across parents | Returns only caller's designated event; never oldest child/name-only match |
| E4 | Existing unmarked child(ren), mismatched retry name, invalid/empty name | Explicit ambiguity/conflict error; zero new child and no reassignment |
| E5 | anon/PUBLIC/no auth.uid/non-Parent calls; inspect has_function_privilege | No unauthenticated EXECUTE or authorization bypass; service_role needs authenticated Parent identity |
| F1 | P1/P2 reads of students/results/certs, admin reports | Existing policy visibility unchanged; report seeded wrong-parent legacy exposure separately |
| F2 | Valid direct inserts and frozen O2 handler-shaped inserts/retries | Ownership writes succeed; duplicate/retry behavior unchanged; RLS wrong-parent insertion fails |
| R1 | Error halfway through DDL transaction | Entire migration rolled back including grants/policies/constraints/functions |
| R2 | Full synthetic rollback restoring captured definitions/ACLs and removing added objects | Catalog matches baseline; prove security regression is understood, no production rollback executed |

Run FK tests both with authenticated RLS and with trusted bypass-RLS role to distinguish
policy protection from database integrity. Exercise current frozen add_student regression
contracts: active/free capacity, operation-key retry, conflicting name, pending registration,
student count, grade and existing creation-identity trigger. No Grade 4 database.
Inspect EXPLAIN/plans and lock timing using synthetic volume, and role membership,
column privileges, trigger ownership/prosecdef and search_path. Obtain independent QA
report with exact candidate SQL SHA-256, exact failures, SQLSTATEs, counts and catalog diffs.
Passing this synthetic suite alone does not certify live legacy integrity or release.
