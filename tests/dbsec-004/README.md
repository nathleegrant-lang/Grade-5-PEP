# G5-O2-DBSEC-004-EXEC-001 — isolated harness

Development infrastructure, NOT security certification. Production HOLD.
Manual-only workflow: .github/workflows/g5-dbsec-004-isolated.yml.
Separate branch; no application files or frozen candidate changed.

## Immutable inputs

Schema source: PEP-Control-Plane commit 40ce94c03641401bb35c6063b0ebf125107313ba,
evidence/G5-O2-DBSEC-004-REC-001/schema-catalog.json, project lhsefavnwjzxfpojsipn,
PostgreSQL 17.6, SHA-256 393b0d8a2e92f77c2fa157c941178ba7100054f784a506982e0ae12871276f2a.
DBSEC-003 source: Grade-5-PEP commit fcc064a3ebb54b8a7a71355d5024f9de77d33930,
candidate.sql, SHA-256 885860118abf7e5bd3f3c2b97c0e9dc2e6d465f96f8d65f2545d6c90c923289d.
Separate signup-role correction: exact recovered proposal bytes,
SHA-256 2a11d1a231e25fe22a402a788323a963a354cee6bcb70b55270a0870f06d863d.
The separate correction changes only the signup role expression to literal parent.
All three identities are checked before any SQL execution.

## Execution and independent reproduction

GitHub requires a workflow_dispatch definition on the repository default branch
before dispatch. Current main contains NO workflows. This task authorizes only
a separate branch: no default-branch registration/merge has been performed.
The connected GitHub API exposes rerun actions but no initial dispatch action.
No local PostgreSQL/Docker/gh executable is available. Therefore no run ID,
conclusion or downloadable Actions artifact is claimed at delivery.

Portfolio must authorize one concrete execution route: register only this reviewed
manual workflow through a production-safe default-branch change, or provide an
isolated Actions test repository with this harness and manual-dispatch authority.
Do not merge this application-derived branch into main as a workaround. Any default
branch registration must address automatic Vercel production consequences first.

Once registered safely, Independent QA can execute from an authorized GitHub session:

    gh workflow run g5-dbsec-004-isolated.yml --repo nathleegrant-lang/Grade-5-PEP --ref g5-o2-dbsec-004-exec-001 -f harness_sha=EXACT_REVIEWED_HARNESS_SHA

Or Actions → workflow → Run workflow → exact harness branch, input exact harness SHA.
The workflow checks checkout SHA against that input. No production credentials or
environment secrets are consumed. It starts postgres:17.6 with a distinct local
bootstrap role and synthetic-only password; the script refuses any host/database/user
other than 127.0.0.1/g5_dbsec_ci/harness_runner. Disposable runner/service only.

## Fail-closed order

1. Verify exact harness and input identities, actual server_version=17.6.
2. Rebuild roles/memberships, columns, constraints/indexes, exact functions/owners,
   triggers, ACL grantors/options, RLS and policies from the catalog. Production
   postgres is recreated as its captured NOSUPERUSER/BYPASSRLS role; local superuser
   is harness_runner. Builtin memberships are restored with captured grantor provenance.
3. Re-query protected catalog boundary. Compare every captured section; remove only
   OIDs/capture timestamp/local harness_runner role and normalize ordering/CRLF.
   Privilege, function-body and constraint differences remain material. Stop on any
   difference; candidate and correction are NOT executed after a baseline HOLD.
4. Seed synthetic identities/legacy anomalies, execute injected transactional failure
   and prove R1 full catalog rollback. Execute exact frozen candidate, preserve legacy
   snapshots and post-DDL catalog. Demonstrate original signup metadata gap synthetically.
5. Execute separate correction, test hostile signup metadata and existing matrix.
6. R2 explicitly restores baseline constraints/functions/policies/ACLs and compares
   complete catalog. Preserve every assertion, SQLSTATE and failed case.

Captured extensions include pg_stat_statements/uuid-ossp/pgcrypto/supabase_vault.
A vanilla service initially has only plpgsql. The comparison deliberately includes
extensions and will HOLD on those missing components; no permissive substitute,
allowlist exception or blanket normalization is installed. Portfolio/Independent QA
must adjudicate platform-only differences or authorize exact necessary extension
installation. This known gate is reported before any QA attempt, not hidden as PASS.

## Matrix and evidence

Executable assertions cover A1–A4, BC1–BC3, D1–D7, E1–E5, F1–F2, R1/R2:
role update/upsert, legitimate profile edit, actual trusted provisioning, siblings,
cross-family/forged/null identities, certificate ownership and NULL handling,
legacy snapshots, NO ACTION/deferred/cascade/ordered deletes, signup retry/ambiguity,
real concurrent sessions, EXECUTE grants, capacity/idempotency, admin reads and rollback.
Input QA-SPEC.md is retained. Failures remain failures; neither SQL input is patched.
No ordinary user assertion is executed as local bootstrap, except synthetic observation
after registration/reset role. Parent/server writes use captured actual SET ROLE plus
synthetic auth claims consumed by the exact auth.uid function.

Known certificate content forgery and wrong-parent-labelled historical visibility
are recorded as security gaps, not certified away by ownership tests. Runtime matrix
success cannot authorize release or resolve those separate Portfolio decisions.

Artifact name: g5-dbsec-004-HARNESS_SHA-RUN_ID, downloadable from the run's Artifacts
section. Includes actual harness SHA/tree, all SQL/stdout/stderr, server service logs,
full baseline/post/rollback catalogs and diffs, input hashes, test-results.json,
known-security-gaps.json, exception.txt and disposition.json. Retention 30 days.
Workflow upload uses always(), including mismatch/reconstruction failures.

Development checks performed: Python syntax; immutable input digests; manual-only
workflow YAML parse; six comparator adversarial drift tests. No PostgreSQL assertion
or security self-certification is claimed from these static checks.
