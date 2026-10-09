# G5-LEARNER-UX-001-O2-IMPLEMENT-001

Development implementation and verification; Independent QA required. Production HOLD.

## Identity and scope

Isolated branch: g5-o2-implement-001.
Baseline SHA: de672d5b53b8991ea1937439a27afcb8a62d609d.
Baseline tree: e544a9688d0a4ed388afb916bda7d7506c599f01.
GitHub main commit and Git database tree were independently read and matched the local checkout before implementation.

Authoritative census: PEP-Control-Plane evidence/G5-LEARNER-UX-001-O2-CENSUS-TRANSPORT-001.json at e830c416fdd3406bb4e05bbaa8f1394e723cea36.
SHA-256: 2c040089d9de5ee3fb81007129aee3a845ba4cc2721159f5c8968ccabd5740e8.
Coverage: docs/evidence/g5-o2-implement-001-coverage.json records all 225 accepted entries, their original paths/functions/lines, new call sites and disposition.
142 shared saver calls; 78 direct Performance writes; two central result writes; one certificate write; two related API callers. No omitted census entry.

## Correction

Parent selects an existing student explicitly. Selection survives navigation in parent-scoped session storage, is checked against the loaded owned-student list and has no first-child default. Each affected assessment captures parent/child at start. A later selection or account change cannot reattribute the attempt. Anonymous previews remain available and do not write learner results.

All 142 shared callers send explicit captured child and stable completion identity to authenticated server submission. All 78 direct Performance writers use the authenticated Performance submission endpoint; existing percentage scoring, AI marking, category and one-question storage convention remain unchanged. The existing Performance API caller sends its captured child explicitly. Server verifies the bearer user, database-backed Parent role and Grade 5 child ownership before any write. Missing/malformed identity is rejected, contradictory parent identity is rejected, and unavailable/unowned students are rejected without writing results or creating students.

The browser saver no longer writes result/certificate tables or resolves/creates students by name. Auth initialization no longer recreates students from legacy assessment/certificate names. Explicit add-student and pending-registration creation remain on their unchanged authoritative capacity RPC; authentication, registration, subscription, entitlement and payment mechanics are preserved.

Results and genuine issued certificates are fetched by both authenticated parent and explicitly selected child, with Grade 5 scope. Missing/contradictory legacy ownership is excluded without repair. Certificates must reference a matching owned result with unchanged >=80% AND >=40 question eligibility. Neither dashboard nor certificate page synthesizes an award from scores. Responses carry child identity; requests cancel on switching, and displays are gated by the loaded child ID before effects run. Admin authorization remains database-role-gated; attribution uses matching parent and child, with no name or sole-child fallback.

Deterministic result/certificate IDs support exact retry and concurrent duplicate suppression using existing row IDs. Conflicting retry payloads fail closed. A certificate-write failure reports failure and a same-attempt retry reuses the result and completes issuance without duplicating it. Timestamp comparison tolerates PostgreSQL timezone serialization.

## Development verification

- 344/344 selected security, assessment architecture/runner, student-capacity and commercial regression checks PASS, including 225 per-entry subtests.
- Actual handler execution with synthetic authentication/database stubs covers two siblings; same name across families; missing, forged, contradictory and unowned identity; parent/admin boundaries; child switching; issued certificate attribution; ambiguous legacy; duplicate/concurrent retry; failed result writes and partial certificate-write retry.
- Actual browser saver to server handler execution tests cover shared and all direct Performance caller paths; Performance score maps to the endpoint percentage without changing marking.
- Question/task top-level constants on all 221 affected assessment pages are byte-identical AST text to baseline. No bank, marking endpoint, timing constants, entitlement, commercial code or database changes.
- Focused server/client/dashboard/certificate/auth-context TypeScript verification PASS: tsconfig.o2-verification.json.
- Whole-repository TypeScript comparison: baseline 369 diagnostics, candidate 367, zero introduced diagnostics after line/column normalization; two pre-existing dashboard/certificate defects removed.
- Whole historical suite: 362 tests, 355 PASS, seven FAIL. Six failure titles already fail on baseline. The seventh is O1-06's historical assertion that Mock Test files remain immutable, which conflicts with this explicitly authorized caller correction. O1/O4 fixed-candidate boundary tests are retained unchanged and are not represented as passing regression gates.
- git diff --check PASS; zero overlap with seven frozen UX-001 paths; PR #95 and frozen candidate unchanged.

## Failures found and corrected

Generated imports initially matched an English comment containing “import”; corrected insertion to the first TypeScript ImportDeclaration.
Parenthesized start guards initially triggered automatic-semicolon continuation in 55 pages; corrected to a statement-safe capture guard. Final type comparison has no introduced errors.
The first direct Performance bridge omitted percentage because legacy writes supply score; corrected bridge to preserve score as percentage. Every direct writer's client-to-handler test now verifies stored score and percentage.
Legacy student-creation source assertion was replaced with the stronger accepted O2 contract forbidding assessment/name recovery while retaining explicit capacity and pending-registration assertions.

## Limitations and independent gates

These are deterministic synthetic application regressions, not PostgreSQL/RLS or actual production exposure evidence. No customer rows were accessed and no database/RLS/migration or production changes were made.

Default Turbopack build could not use this workspace's external node_modules symlink. Discovered supported webpack build also failed because the environment cannot fetch the unchanged Nunito Google Font. No build configuration or font source was changed. Full production build remains unverified and must be completed by Independent QA in an authorized network-capable environment.

Live Grade 5 PostgreSQL/RLS remains unverified and mandatory before release. In particular QA must confirm existing student/result/certificate column types, ID uniqueness/primary keys (required for retry concurrency), timestamp behavior, foreign keys/grants/RLS, and direct Data API denial of cross-parent writes/reads. No new schema or policy is assumed to have been installed.

Independent rendered assessment/dashboard/certificate interaction checks remain required. O3 learning-progress persistence stays outside this bounded correction; dashboard no longer displays parent-wide local topic progress as child results. No expansion of curriculum, questions, UX-001, production, customer remediation or database scope is authorized.

Freeze and durable transport identities, complete changed-file hashes and Independent QA handoff are recorded in the Control Plane. Do not merge or deploy this candidate without Portfolio authorization.
