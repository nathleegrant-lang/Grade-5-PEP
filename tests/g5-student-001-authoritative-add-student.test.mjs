import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const migration = readFileSync(
  "supabase/migrations/20260929033000_g5_student_001_authoritative_add_student.sql",
  "utf8",
)
const leastCorrection = readFileSync(
  "supabase/migrations/20260929115000_g5_student_002_fix_least.sql",
  "utf8",
)
const specialExpressionCorrection = readFileSync(
  "supabase/migrations/20260929121500_g5_student_002_corr_001_fix_coalesce.sql",
  "utf8",
)
const authContext = readFileSync("contexts/auth-context.tsx", "utf8")
const resultWriter = readFileSync("lib/student-test-results.ts", "utf8")
const dashboard = readFileSync("app/dashboard/page.tsx", "utf8")
const paymentMigration = readFileSync(
  "supabase/migrations/20260906000000_grade5_yearly_and_offline_cash.sql",
  "utf8",
)

class SyntheticStudentStore {
  constructor({ allowance = 1, subscriptionId = null } = {}) {
    this.allowance = allowance
    this.subscriptionId = subscriptionId
    this.students = []
    this.lock = Promise.resolve()
  }

  async add({ authenticated = true, role = "parent", callerId, requestedParentId = callerId, name, operationKey }) {
    const previous = this.lock
    let release
    this.lock = new Promise((resolve) => { release = resolve })
    await previous
    try {
      if (!authenticated) throw new Error("Authentication required")
      if (role !== "parent") throw new Error("Parent account required")
      if (requestedParentId !== callerId) throw new Error("Student ownership verification failed")

      const existing = this.students.find(
        (student) => student.parentId === callerId && student.operationKey === operationKey,
      )
      if (existing) {
        if (existing.name !== name.trim()) throw new Error("Student operation payload conflict")
        return existing
      }

      const count = this.students.filter(
        (student) => student.parentId === callerId && student.gradeLevel === 5,
      ).length
      if (count >= this.allowance) throw new Error("Student capacity reached")

      const student = Object.freeze({
        id: `student-${this.students.length + 1}`,
        parentId: callerId,
        name: name.trim(),
        gradeLevel: 5,
        subscriptionId: this.subscriptionId,
        operationKey,
      })
      this.students.push(student)
      return student
    } finally {
      release()
    }
  }
}

function executableSources(root) {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    if (statSync(path).isDirectory()) return executableSources(path)
    return /\.(?:c|m)?(?:j|t)sx?$/.test(entry) ? [path] : []
  })
}

test("forward migration repairs only the narrow trigger auth lookup boundary", () => {
  assert.match(migration, /add column if not exists creation_source text/)
  assert.match(migration, /create unique index if not exists uq_students_grade5_signup_parent[\s\S]+where creation_source = 'grade5_signup'/)
  assert.match(migration, /create or replace function public\.enforce_grade5_signup_student_source\(\)/)
  assert.match(migration, /returns trigger[\s\S]+security definer[\s\S]+set search_path = ''/)
  assert.match(migration, /from auth\.users u[\s\S]+u\.id = v_caller_id[\s\S]+u\.id = new\.parent_id/)
  assert.match(migration, /u\.email_confirmed_at is not null/)
  assert.match(migration, /new\.creation_source := 'grade5_signup'/)
  assert.match(migration, /alter function public\.enforce_grade5_signup_student_source\(\) owner to postgres/)
  assert.match(migration, /revoke all on function public\.enforce_grade5_signup_student_source\(\)[\s\S]+from public, anon, authenticated/)
  assert.match(migration, /create trigger enforce_grade5_signup_student_source[\s\S]+before insert on public\.students/)
  assert.doesNotMatch(migration, /grant\s+select\s+on\s+auth\.users/i)
})

test("authoritative RPC authenticates the Parent and makes parent spoofing impossible", () => {
  assert.match(migration, /create or replace function public\.add_grade5_student\([\s\S]+p_full_name text,[\s\S]+p_idempotency_key uuid/)
  assert.match(migration, /v_caller_id uuid := \(select auth\.uid\(\)\)/)
  assert.match(migration, /if v_caller_id is null/)
  assert.match(migration, /from public\.profiles p[\s\S]+p\.id = v_caller_id[\s\S]+p\.role = 'parent'/)
  assert.doesNotMatch(migration, /p_parent_id/)
  assert.match(migration, /Student ownership verification failed/)
  assert.match(migration, /drop function if exists public\.add_grade5_student\(text\)/)
  assert.match(migration, /grant execute on function public\.add_grade5_student\(text, uuid\)[\s\S]+to authenticated/)
  assert.match(migration, /revoke all on function public\.add_grade5_student\(text, uuid\)[\s\S]+from public, anon, authenticated/)
})

test("RLS and ownership policies remain while direct browser INSERT is closed", () => {
  assert.match(migration, /alter table public\.students enable row level security/)
  assert.match(migration, /revoke insert on table public\.students from anon, authenticated/)
  assert.doesNotMatch(migration, /disable row level security/i)
  assert.doesNotMatch(migration, /drop policy/i)
  assert.doesNotMatch(migration, /grant all/i)
})

test("capacity is configuration-backed, effective-subscription-aware, and transactionally serialized", () => {
  assert.match(migration, /pg_catalog\.pg_advisory_xact_lock/)
  assert.match(migration, /v_caller_id::text \|\| ':grade5:students'/)
  assert.match(migration, /join public\.grade5_plan_configuration c on c\.code = s\.plan_code/)
  assert.match(specialExpressionCorrection, /select s\.id, least\(s\.max_students, c\.max_students\)/)
  assert.doesNotMatch(specialExpressionCorrection, /pg_catalog\.least\(/)
  assert.match(specialExpressionCorrection, /v_allowance := coalesce\(v_allowance, 1\)/)
  assert.doesNotMatch(specialExpressionCorrection, /pg_catalog\.coalesce\(/)
  assert.match(migration, /s\.status = 'active'/)
  assert.match(migration, /s\.starts_at is null or s\.starts_at <= pg_catalog\.clock_timestamp\(\)/)
  assert.match(migration, /s\.expires_at > pg_catalog\.clock_timestamp\(\)/)
  assert.match(migration, /c\.code = 'free'/)
  assert.match(migration, /v_allowance := pg_catalog\.coalesce\(v_allowance, 1\)/)
  assert.match(migration, /v_student_count >= v_allowance/)
})

test("G5-STUDENT-002 changes only the invalid least qualification in the RPC contract", () => {
  const functionContract = (sql) => sql.match(
    /create or replace function public\.add_grade5_student\([\s\S]+?grant execute on function public\.add_grade5_student\(text, uuid\)[\s\S]+?to authenticated;/,
  )?.[0]
  const productionContract = functionContract(migration)
  const correctedContract = functionContract(leastCorrection)

  assert.ok(productionContract)
  assert.ok(correctedContract)
  assert.equal(
    correctedContract,
    productionContract.replace(
      "pg_catalog.least(s.max_students, c.max_students)",
      "least(s.max_students, c.max_students)",
    ),
  )
})

test("CORR-001 changes only the invalid coalesce qualification in the RPC contract", () => {
  const functionContract = (sql) => sql.match(
    /create or replace function public\.add_grade5_student\([\s\S]+?grant execute on function public\.add_grade5_student\(text, uuid\)[\s\S]+?to authenticated;/,
  )?.[0]
  const failedContract = functionContract(leastCorrection)
  const correctedContract = functionContract(specialExpressionCorrection)

  assert.ok(failedContract)
  assert.ok(correctedContract)
  assert.equal(
    correctedContract,
    failedContract.replace(
      "pg_catalog.coalesce(v_allowance, 1)",
      "coalesce(v_allowance, 1)",
    ),
  )
})

test("corrected RPC schema-qualifies only legitimate pg_catalog callables", () => {
  const rpc = specialExpressionCorrection.match(
    /create or replace function public\.add_grade5_student\([\s\S]+?\$\$;/,
  )?.[0]
  assert.ok(rpc)

  const qualifiedCallables = [...rpc.matchAll(/pg_catalog\.([a-z_][a-z0-9_]*)\s*\(/g)]
    .map((match) => match[1])
  assert.deepEqual(
    [...new Set(qualifiedCallables)].sort(),
    ["btrim", "clock_timestamp", "count", "hashtextextended", "pg_advisory_xact_lock"].sort(),
  )
  assert.doesNotMatch(rpc, /pg_catalog\.(?:coalesce|greatest|least)\s*\(/i)
})

test("successful persistence fixes Grade 5, Parent, subscription, and returns one row", () => {
  assert.match(migration, /insert into public\.students[\s\S]+\(parent_id, subscription_id, full_name, grade_level, creation_idempotency_key\)/)
  assert.match(migration, /\(v_caller_id, v_subscription_id, v_student_name, 5, p_idempotency_key\)/)
  assert.match(migration, /returning \* into v_created/)
  assert.match(migration, /return v_created/)
})

test("operation keys, not names, are the immutable retry identity", () => {
  assert.match(migration, /add column if not exists creation_idempotency_key uuid/)
  assert.match(migration, /create unique index if not exists uq_students_parent_creation_operation[\s\S]+\(parent_id, creation_idempotency_key\)/)
  assert.match(migration, /s\.creation_idempotency_key = p_idempotency_key/)
  assert.match(migration, /v_existing\.full_name is distinct from v_student_name/)
  assert.match(migration, /Student operation payload conflict[\s\S]+errcode = '22000'/)
  assert.match(migration, /if p_idempotency_key is null then[\s\S]+Student operation identity required/)
  assert.doesNotMatch(migration, /lower\(pg_catalog\.btrim\(s\.full_name\)\) = pg_catalog\.lower\(v_student_name\)/)
  assert.match(migration, /if found then[\s\S]+return v_existing/)
  assert.match(migration, /create trigger protect_student_creation_identity[\s\S]+before update on public\.students/)
  assert.match(migration, /v_signup_child is not null[\s\S]+lower\(v_signup_child\)[\s\S]+creation_source = 'grade5_signup'/)
})

test("explicit student creation uses the authoritative RPC; O2 never creates students from assessment records", () => {
  assert.match(authContext, /\.rpc\("add_grade5_student", \{[\s\S]+p_full_name: fullName,[\s\S]+p_idempotency_key: idempotencyKey/)
  assert.doesNotMatch(authContext, /\.from\("students"\)\s*\.insert/)
  assert.doesNotMatch(authContext, /grade5-student-recovery|\.from\("student_test_results"\)|\.from\("certificates"\)/)
  assert.match(authContext, /grade5-pending-registration:\$\{authUser\.id\}/)
  assert.match(authContext, /pendingAddOperation\.current = \{ name: trimmedName, key: crypto\.randomUUID\(\) \}/)
  assert.match(authContext, /createGrade5Student\(trimmedName, pendingAddOperation\.current\.key\)/)
  assert.match(authContext, /pendingAddOperation\.current = null/)
  assert.doesNotMatch(resultWriter, /add_grade5_student|grade5_student_result_recovery_|\.from\("students"\)/)
  assert.match(resultWriter, /studentId: string/)
  assert.match(resultWriter, /\/api\/assessment\/results/)
  assert.match(authContext, /This plan allows up to/)
  assert.match(authContext, /Unable to add the student right now\. Please try again\./)
  assert.match(dashboard, /const result = await addStudent\(newStudentName\)/)
  assert.match(dashboard, /Student added successfully\./)
})

test("no executable browser or app path directly inserts a student", () => {
  const directInsert = /\.from\(["']students["']\)\s*\.\s*(?:insert|upsert)\s*\(/s
  const offenders = ["app", "components", "contexts", "lib"]
    .flatMap(executableSources)
    .filter((path) => directInsert.test(readFileSync(path, "utf8")))
  assert.deepEqual(offenders, [])
})

test("no browser service credential or general auth lookup is introduced", () => {
  assert.doesNotMatch(authContext, /service[_-]?role/i)
  assert.doesNotMatch(authContext, /SUPABASE_(SERVICE|SECRET)/)
  assert.doesNotMatch(migration, /returns setof auth\.users|returns auth\.users|p_user_id/)
  assert.match(migration, /set search_path = ''/g)
})

test("synthetic free allowance permits 0-of-1 once and refuses 1-of-1", async () => {
  const store = new SyntheticStudentStore()
  const created = await store.add({ callerId: "parent-a", name: "Student One", operationKey: "operation-1" })
  assert.equal(created.gradeLevel, 5)
  assert.equal(created.parentId, "parent-a")
  assert.equal(store.students.length, 1)
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "Student Two", operationKey: "operation-2" }),
    /Student capacity reached/,
  )
  assert.equal(store.students.length, 1)
})

test("synthetic paid allowance preserves subscription linkage", async () => {
  const store = new SyntheticStudentStore({ allowance: 4, subscriptionId: "subscription-family" })
  for (const [index, name] of ["One", "Two", "Three", "Four"].entries()) {
    const student = await store.add({ callerId: "parent-a", name, operationKey: `operation-${index}` })
    assert.equal(student.subscriptionId, "subscription-family")
  }
  await assert.rejects(store.add({ callerId: "parent-a", name: "Five", operationKey: "operation-5" }), /Student capacity reached/)
  assert.equal(store.students.length, 4)
})

test("synthetic unauthenticated, non-Parent, and cross-Parent calls persist nothing", async () => {
  const store = new SyntheticStudentStore()
  await assert.rejects(store.add({ authenticated: false, callerId: "parent-a", name: "One", operationKey: "operation-1" }), /Authentication required/)
  await assert.rejects(store.add({ role: "admin", callerId: "admin-a", name: "One", operationKey: "operation-1" }), /Parent account required/)
  await assert.rejects(
    store.add({ callerId: "parent-a", requestedParentId: "parent-b", name: "One", operationKey: "operation-1" }),
    /ownership verification failed/,
  )
  assert.equal(store.students.length, 0)
})

test("synthetic concurrent attempts cannot exceed authoritative capacity", async () => {
  const store = new SyntheticStudentStore()
  const results = await Promise.allSettled([
    store.add({ callerId: "parent-a", name: "One", operationKey: "operation-1" }),
    store.add({ callerId: "parent-a", name: "Two", operationKey: "operation-2" }),
  ])
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1)
  assert.equal(results.filter((result) => result.status === "rejected").length, 1)
  assert.equal(store.students.length, 1)
})

test("exact and canonically equivalent replays return the established student", async () => {
  const store = new SyntheticStudentStore({ allowance: 2 })
  const first = await store.add({ callerId: "parent-a", name: " John Brown ", operationKey: "operation-1" })
  const retry = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  assert.equal(retry, first)
  const exactRetry = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  assert.equal(exactRetry, first)
  assert.equal(store.students.length, 1)
})

test("conflicting replay is rejected without changing the established operation", async () => {
  const store = new SyntheticStudentStore({ allowance: 2 })
  const first = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "Jane Brown", operationKey: "operation-1" }),
    /Student operation payload conflict/,
  )
  assert.equal(first.name, "John Brown")
  assert.equal(first.operationKey, "operation-1")
  assert.equal(store.students.length, 1)
  assert.equal(store.students.some((student) => student.name === "Jane Brown"), false)
})

test("a new operation key permits a same-name student when capacity permits", async () => {
  const store = new SyntheticStudentStore({ allowance: 2 })
  const first = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  const namesake = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-2" })
  assert.notEqual(namesake.id, first.id)
  assert.equal(store.students.length, 2)
})

test("valid replay succeeds and conflicting replay conflicts at full capacity", async () => {
  const store = new SyntheticStudentStore({ allowance: 1 })
  const first = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  const replay = await store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-1" })
  assert.equal(replay, first)
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "Jane Brown", operationKey: "operation-1" }),
    /Student operation payload conflict/,
  )
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "John Brown", operationKey: "operation-2" }),
    /Student capacity reached/,
  )
  assert.equal(store.students.length, 1)
})

test("concurrent same-key calls create one student and cross-Parent keys never replay another Parent", async () => {
  const store = new SyntheticStudentStore({ allowance: 2 })
  const [first, retry] = await Promise.all([
    store.add({ callerId: "parent-a", name: "One", operationKey: "shared-operation" }),
    store.add({ callerId: "parent-a", name: "One", operationKey: "shared-operation" }),
  ])
  assert.equal(first, retry)
  const otherParent = await store.add({ callerId: "parent-b", name: "One", operationKey: "shared-operation" })
  assert.notEqual(otherParent.id, first.id)
  assert.equal(otherParent.parentId, "parent-b")
})

test("concurrent conflicting same-key payloads establish one operation and reject the other", async () => {
  const store = new SyntheticStudentStore({ allowance: 2 })
  const results = await Promise.allSettled([
    store.add({ callerId: "parent-a", name: "John Brown", operationKey: "shared-operation" }),
    store.add({ callerId: "parent-a", name: "Jane Brown", operationKey: "shared-operation" }),
  ])
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1)
  const rejected = results.find((result) => result.status === "rejected")
  assert.match(rejected.reason.message, /Student operation payload conflict/)
  assert.equal(store.students.length, 1)
  assert.equal(store.students[0].operationKey, "shared-operation")
})

test("a failed operation reserves neither a student nor its operation key", async () => {
  const store = new SyntheticStudentStore({ allowance: 0 })
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "One", operationKey: "retry-after-failure" }),
    /Student capacity reached/,
  )
  assert.equal(store.students.length, 0)
  store.allowance = 1
  const created = await store.add({
    callerId: "parent-a",
    name: "One",
    operationKey: "retry-after-failure",
  })
  assert.equal(created.operationKey, "retry-after-failure")
  assert.equal(store.students.length, 1)
})

test("student creation contains no payment, subscription activation, or offline-Cash behavior", () => {
  assert.doesNotMatch(migration, /update public\.payments|insert into public\.payments/i)
  assert.doesNotMatch(migration, /insert into public\.subscriptions|update public\.subscriptions/i)
  assert.doesNotMatch(migration, /activate_grade5_payment|admin_record_grade5_cash_payment|offline_reference/i)
  assert.match(paymentMigration, /create or replace function app_private\.activate_grade5_payment/)
})

test("G5-ADMIN-001 is not incorporated into the student correction", () => {
  assert.doesNotMatch(migration + authContext, /offline_idempotency_key|grade5_cash_reference_seq/)
})
