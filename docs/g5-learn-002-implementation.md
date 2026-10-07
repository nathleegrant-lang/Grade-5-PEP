# G5-LEARN-002 — implementation and Development verification

Baseline: `44d20a4f00f9ea5c7bb2622e35249a5eca7a0d18`, tree `b1cd2fd28e5645813f64e6474b0db44b650600ba`.
Authority: current PEP Control Plane G5-LEARN-002 accepted specification and curriculum_mapping_decision, 2026-10-07. Production is unauthorized. Development evidence does not certify Independent QA.

## Behavior and scope

`/learn` provides Grade → Subject → Term → Topic → Learning Activities → Practice navigation. Each existing subject page gains only a Browse Term Topics link. The 16 existing broad lessons, questions, old Quiz, scoring, callbacks and separate Mock Test routes remain unchanged.

The Grade 5 adapter uses the 45 AS-003 identities, term placement, labels and order. No legacy lesson is associated with any of them. All term-topic activities are explicitly unavailable; every Practice reference is missing and the Grade 5 certified registry is empty. Legacy lessons and Mock Tests remain separate links. Learning availability never establishes Practice eligibility.

Taxonomy copied without edits from `G5-LEARN-001_grade5_curriculum_taxonomy(1).json`, Library `libfile_8c6542cad190819186db7cf88257ce56`, 41696 bytes, SHA-256 `e28a2d0881ff271a08d5ecfb128706ffc606659ffffebbd2a07cbcb73b88bbfe`. The taxonomy's bank-target fields are never used to authorize questions.

Shared contracts own hierarchy, supplied activity descriptors/slots, certified-provider inputs, transient runner/results and O4-N actions. Explicit semantic certification, approved certification identity, exact scope/set/revision, freshness and topic-practice mode are required by the supplied registry provider. Missing/held/stale/unknown references short-circuit before provider invocation. Provider errors, invalid results and a ten-second provider deadline return unavailable; there is no bank fallback. Leaving a topic aborts/ignores late results. Repeated Practice selection cannot clear a resolved result into indefinite loading.

The new runner uses the original scoring semantics: one point for the selected correct answer, answer lock, explanations, rounded `(score / questions.length) * 100`, and unchanged feedback thresholds. Completed results offer Try Again, Review Topic and Choose Another Topic. Retry resets transient state for the same supplied questions; review retains the topic, and choosing another topic retains the subject/term. No real questions are wired into the new runner.

Learner identity is optional, explicit input. Stored result context cannot omit an explicitly resolved learner at the type boundary; no stored-result operation is implemented. Progress-event shapes are optional/no-op with no history, storage, recovery or persistence implementation. No auth, database, migration, payment, assessment/question-bank, Mock Test runner or Grade 4/6 application file is changed. Grade 4/6 synthetic fixture adapters use their own curriculum and labels.

## Development verification

- Focused executable tests: **17/17 PASS** (`node --test tests/g5-learn-002-architecture.test.mjs`). Actual compiled component handlers, navigation, certified gate, unavailable states, runner scoring/retry/O4 transitions, cancellation, optional sink, explicit learner type boundary and Grade 4/6 fixture rendering verified.
- Strict TypeScript on new contracts/provider/adapter/shell/runner: **PASS**. Command: `node node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --jsx react-jsx --esModuleInterop --resolveJsonModule lib/learning/contracts.ts lib/learning/navigation.ts lib/learning/practice-provider.ts lib/learning/grade5/manifest.ts components/learning/learning-shell.tsx components/learning/practice-runner.tsx`.
- Full TypeScript: **FAIL at both baseline and candidate** with **369 diagnostics** and byte-identical diagnostic logs. Existing assessment/dashboard/certificate/premium-gate errors are retained. No new diagnostic remains. The existing `ignoreBuildErrors` setting was not changed. No full production build is claimed.
- Broader suite: **117/123 PASS**. Untouched baseline: **105/106 PASS**. Baseline O1-10 historical changed-path test fails. Five additional historical O4 assertions reject the four new navigation links through whole-file comparisons and the old six-file scope boundary; their executed callbacks/scoring/reset checks pass before those assertions. New focused tests prove that removing each exact navigation-link insertion restores the four subject files byte-for-byte and that old Quiz is byte-identical to the released baseline. No old test was weakened or modified.
- Actual local Next.js `/learn` route: **RENDER/INTERACTION VERIFIED** at 1280×900 and 390×844 in Chromium. Science → Term 1 → Forces & Work → Learning unavailable → Practice unavailable → repeated Practice → Learning → topic/term/subject breadcrumbs; separate legacy/Mock Test links; keyboard Enter selection; no horizontal overflow or page errors. Desktop/mobile screenshots inspected.
- Browser scope: anonymous local fixture configuration only; no real Supabase credentials. External browser requests blocked; existing footer visit tracking mocked in the browser, with no server mutating requests. No live auth, production or persistence verification claimed. An earlier local check detected the pre-existing footer POST; no admin key was present and the configured URL was loopback. Subsequent check mocked it before server dispatch.
- Local route compiled with webpack after Turbopack cache persistence errors. Lockfile dependencies were installed; pnpm reported ignored sharp build scripts. No dependency/lockfile mutation or build-script approval was made.
- `git diff --check`: PASS. Candidate boundary: four one-line navigation entries, new learning route/style, shared shell/runner/contracts/provider/navigation, Grade 5 adapter/exact taxonomy, focused test and this report.

## Independent QA handoff

Fresh Independent QA must review the exact frozen SHA/tree and direct parent, verify all candidate blobs against the prepared contents, inspect the mapping and semantic firewalls, rerun focused tests and assess the documented broader-suite/typecheck limitations. Development has not performed or claimed independent certification. QA must not edit the frozen candidate. Production remains held pending fresh QA and Portfolio release authorization.
