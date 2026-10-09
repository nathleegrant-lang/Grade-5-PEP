# G5-O2-DBSEC-003 — isolated review candidate

Status: PREPARED — PORTFOLIO REVIEW / INDEPENDENT QA AUTHORIZATION REQUIRED.
Production HOLD. Candidate SQL has not been executed in any database.

## Authority and evidence

Protected application SHA 7bce46177784efe094ec24641667b375e5f9084d,
tree 940e8b37cf1ae71791f1c2bb183c4e26a3de3e55.
Only docs/security/G5-O2-DBSEC-003 files are added on a separate branch.
Grade 5 project lhsefavnwjzxfpojsipn was read through catalog metadata only.
Grade 4 project uqzrblxawybztsxxtnir is separate per Portfolio; it was not accessed or changed.
No customer rows, production DDL, application modification, deployment or QA certification.
Control Plane designs DBSEC-001/002 and PEP-OPS-001 were read before preparation.

## Caller census

caller-census.json contains the exhaustive frozen-blob search, all RPC/wrapper
references and ancestor-history hits with commit/path/line/source/classification.
protected-tree-manifest.json binds every searched file to its Git blob and SHA-256.
The frozen repository contains ZERO exact references: no executable legacy caller,
SQL definition, test, documentation or wrapper reference to ensure_grade5_signup_student.
The current application replacement is contexts/auth-context.tsx:137,
createGrade5Student(fullName, idempotencyKey), RPC add_grade5_student with
p_full_name and p_idempotency_key. Its server ownership/capacity contract remains unchanged.
Related source migration: supabase/migrations/20260929033000_g5_student_001_authoritative_add_student.sql,
enforce_grade5_signup_student_source, lines 17–63; this DIFFERENT function is a trigger.
Its signup partial unique index is lines 11–13. Subsequent add_student corrections
are migrations 20260929115000 and 20260929121500. Related tests are
tests/g5-student-001-authoritative-add-student.test.mjs; these are not legacy RPC callers.
Historical authentication caller: a029e8704042a930c4a6768db21d1a97efc26f35,
contexts/auth-context.tsx:60, loadUser, p_full_name=signupChildName from authenticated
user metadata, when resolvedStudents.length===0. Historical SQL definition/grants:
71c7326c6eb1833110ce524178e78801b493a5a6,
database/grade5_signup_student_event_invariant.sql (absent from frozen tree).
All 653 protected ancestor commits have zero exact references. The two supplemental
historical objects above are from other locally available Git refs, not the protected
candidate's ancestry. Their exact occurrences are listed separately in the machine census.
Source absence does not establish zero external/deployed historical callers or zero traffic.

## Proposed SQL and compatibility

| Boundary | Proposal | Compatibility / outstanding decision |
|---|---|---|
| A | Remove broad client profile UPDATE; grant full_name/email/phone only; trigger blocks untrusted role insert/change | SELECT and existing own-row RLS unchanged. postgres/service_role/supabase_auth_admin retain trusted operations; browser admins are not trusted DB principals. Profile updates that resend role/id/created_at will fail and need explicit compatibility adjudication. |
| B/C | students(id,parent_id) and results(id,student_id,parent_id) unique keys; NOT VALID composite result FK | New non-null ownership links enforced even for bypass-RLS writers. No legacy ownership repaired. Index construction takes locks; production sizes/maintenance window unverified. |
| D | Composite certificate student and result ownership FKs; new/changed identities cannot be null | Historical nulls remain untouched. Replace existing SET NULL FKs with deferrable NO ACTION explicitly; standalone deletion of referenced child/result will fail. Portfolio must approve this deletion-contract change before deployment. |
| E | Invoker signup wrapper resolves only designated signup event; rejects contradictory name and ambiguous existing unmarked children; otherwise uses existing capacity RPC | No name-only matching, arbitrary oldest-child selection or direct capacity bypass. Existing designated signup can be recovered among siblings. Zero-child registration creates one stable event; retries serialize with add_student. Legacy unmarked recovery requires explicit learner/operation route, never reassignment. Public/anon EXECUTE revoked; authenticated/service_role retained with auth.uid and parent checks. |
| F | Tighten only two INSERT policy checks to matching parent/student/result; preserve every SELECT policy | No new UPDATE/DELETE authorization. Composite constraints independently protect future write paths. Current parent and administrative read restrictions are retained verbatim. |

SQL is an isolated candidate.sql, not an installed Supabase migration. Supabase CLI is
unavailable here; no timestamped migration was invented. QA/authorized implementer must
use supported migration creation after review. Single transaction, lock/statement timeouts,
no IF NOT EXISTS masking drift, no data backfill, no VALIDATE CONSTRAINT.
Target metadata must match database-metadata.json before any future application.

## Nullable references and deletion

NOT VALID permits pre-existing inconsistent relationships to remain unverified;
it does not exempt new writes from FK enforcement. MATCH SIMPLE permits NULLs,
so insert/identity-change triggers independently reject missing references.
Unchanged legacy null identities are retained, never guessed, repaired or issued anew.
Existing bad complete relationships may cause future related updates/deletes to fail.
The candidate intentionally blocks SET NULL severing attribution. No trigger-depth,
user-controlled configuration or JWT metadata exception is used to bypass integrity.
Auth-user cascading deletion and explicit ordered dependent deletion require synthetic
statement/transaction tests; no customer deletion/repair operation is authorized.
Certificate eligibility/scoring and immutable O2 application remain unchanged.

## Rollback and release ordering

Before COMMIT, any error rolls back all DDL/grants. For isolated QA, compare complete
before/after schema, policy, trigger and ACL snapshots and discard the synthetic database.
Post-commit rollback requires separately reviewed SQL restoring exact original profile
ACLs, original legacy function definition/ACL, and original two INSERT policies from
database-metadata.json; remove the three new triggers/functions, composite FKs then keys;
restore the three original single FKs with ON DELETE SET NULL. No record changes are needed.
Do not auto-run such rollback in production: it reopens the security gap and changes deletion
semantics. Any post-candidate writes may require separately authorized compatibility review.
No production rollback or release is authorized by this artifact.
Required ordering: Portfolio review of this candidate and deletion/recovery choices →
independent isolated PostgreSQL QA → separately authorized legacy-consistency process →
validated release plan/maintenance window → Portfolio release decision. NOT VALID is
not full historical integrity certification and cannot close the legacy release blocker.

## Unresolved risks / limits

- No executable PostgreSQL/psql or Supabase CLI is available locally. SQL is unexecuted;
  parser, grant inheritance, triggers, constraint ordering and concurrency require QA.
- Legacy ownership/null consistency and actual historical exposure are unknown;
  unchanged read policies may still expose wrongly parent-labelled historical rows.
  This candidate does not contain/quarantine production data or certify confidentiality.
- Catalog snapshots do not exhaust every privileged function, inherited role,
  view, alternate schema, external client or deployed legacy consumer. Trusted definer
  paths writing profiles must be checked for unsafe user-controlled role assignment.
- No production traffic, customer record inspection or automated repair is authorized.
- Signup creation_source provenance is historically a mutable column. A marked event
  cannot be proven authentic from its marker alone; historical ambiguous provenance remains
  a recovery-review risk, never a basis for assigning result ownership.
- Existing direct Data API certificate issuance can still fabricate scores/eligibility
  while satisfying ownership. DBSEC-D here binds references only; broader issued-certificate
  content integrity requires a specific Portfolio decision if demanded for release.
- Grade 4 is separate by supplied project identity; no claim of independent deployment
  configuration verification or Grade 4 behavioral QA is made.

## Primary references consulted

https://www.postgresql.org/docs/17/ddl-constraints.html
https://supabase.com/docs/guides/database/postgres/column-level-security
https://supabase.com/docs/guides/database/postgres/row-level-security
Supabase changelog Markdown fetch was unsupported by the retrieval service; current
column-security/RLS documentation was retrieved through Supabase documentation search.
