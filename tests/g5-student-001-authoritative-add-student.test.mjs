import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync(
  "supabase/migrations/20260929033000_g5_student_001_authoritative_add_student.sql",
  "utf8",
)
const authContext = readFileSync("contexts/auth-context.tsx", "utf8")
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

  async add({ authenticated = true, role = "parent", callerId, requestedParentId = callerId, name }) {
    const previous = this.lock
    let release
    this.lock = new Promise((resolve) => { release = resolve })
    await previous
    try {
      if (!authenticated) throw new Error("Authentication required")
      if (role !== "parent") throw new Error("Parent account required")
      if (requestedParentId !== callerId) throw new Error("Student ownership verification failed")

      const normalized = name.trim().toLowerCase()
      const existing = this.students.find(
        (student) => student.parentId === callerId && student.name.toLowerCase() === normalized,
      )
      if (existing) return existing

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
      })
      this.students.push(student)
      return student
    } finally {
      release()
    }
  }
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
  assert.match(migration, /create or replace function public\.add_grade5_student\(p_full_name text\)/)
  assert.match(migration, /v_caller_id uuid := \(select auth\.uid\(\)\)/)
  assert.match(migration, /if v_caller_id is null/)
  assert.match(migration, /from public\.profiles p[\s\S]+p\.id = v_caller_id[\s\S]+p\.role = 'parent'/)
  assert.doesNotMatch(migration, /p_parent_id/)
  assert.match(migration, /Student ownership verification failed/)
  assert.match(migration, /grant execute on function public\.add_grade5_student\(text\)[\s\S]+to authenticated/)
  assert.match(migration, /revoke all on function public\.add_grade5_student\(text\)[\s\S]+from public, anon, authenticated/)
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
  assert.match(migration, /pg_catalog\.least\(s\.max_students, c\.max_students\)/)
  assert.match(migration, /s\.status = 'active'/)
  assert.match(migration, /s\.starts_at is null or s\.starts_at <= pg_catalog\.clock_timestamp\(\)/)
  assert.match(migration, /s\.expires_at > pg_catalog\.clock_timestamp\(\)/)
  assert.match(migration, /c\.code = 'free'/)
  assert.match(migration, /v_allowance := pg_catalog\.coalesce\(v_allowance, 1\)/)
  assert.match(migration, /v_student_count >= v_allowance/)
})

test("successful persistence fixes Grade 5, Parent, subscription, and returns one row", () => {
  assert.match(migration, /insert into public\.students[\s\S]+\(parent_id, subscription_id, full_name, grade_level\)/)
  assert.match(migration, /\(v_caller_id, v_subscription_id, v_student_name, 5\)/)
  assert.match(migration, /returning \* into v_created/)
  assert.match(migration, /return v_created/)
})

test("same-name retry is idempotent and ordinary additional children are not marked signup-origin", () => {
  assert.match(migration, /A retry after a lost\/controlled response returns the established row/)
  assert.match(migration, /pg_catalog\.lower\(pg_catalog\.btrim\(s\.full_name\)\) = pg_catalog\.lower\(v_student_name\)/)
  assert.match(migration, /if found then[\s\S]+return v_existing/)
  assert.match(migration, /v_signup_child is not null[\s\S]+lower\(v_signup_child\)[\s\S]+creation_source = 'grade5_signup'/)
})

test("application and all existing recovery paths use the authoritative RPC", () => {
  assert.match(authContext, /\.rpc\("add_grade5_student", \{ p_full_name: fullName \}\)/)
  assert.doesNotMatch(authContext, /\.from\("students"\)\s*\.insert/)
  assert.match(authContext, /for \(const name of names\)[\s\S]+createGrade5Student\(name\)/)
  assert.match(authContext, /\.from\("student_test_results"\)/)
  assert.match(authContext, /\.from\("certificates"\)/)
  assert.match(authContext, /createGrade5Student\(pendingChild\)/)
  assert.match(authContext, /createGrade5Student\(childName\.trim\(\)\)/)
  assert.match(authContext, /This plan allows up to/)
  assert.match(authContext, /Unable to add the student right now\. Please try again\./)
  assert.match(dashboard, /const result = await addStudent\(newStudentName\)/)
  assert.match(dashboard, /Student added successfully\./)
})

test("no browser service credential or general auth lookup is introduced", () => {
  assert.doesNotMatch(authContext, /service[_-]?role/i)
  assert.doesNotMatch(authContext, /SUPABASE_(SERVICE|SECRET)/)
  assert.doesNotMatch(migration, /returns setof auth\.users|returns auth\.users|p_user_id/)
  assert.match(migration, /set search_path = ''/g)
})

test("synthetic free allowance permits 0-of-1 once and refuses 1-of-1", async () => {
  const store = new SyntheticStudentStore()
  const created = await store.add({ callerId: "parent-a", name: "Student One" })
  assert.equal(created.gradeLevel, 5)
  assert.equal(created.parentId, "parent-a")
  assert.equal(store.students.length, 1)
  await assert.rejects(
    store.add({ callerId: "parent-a", name: "Student Two" }),
    /Student capacity reached/,
  )
  assert.equal(store.students.length, 1)
})

test("synthetic paid allowance preserves subscription linkage", async () => {
  const store = new SyntheticStudentStore({ allowance: 4, subscriptionId: "subscription-family" })
  for (const name of ["One", "Two", "Three", "Four"]) {
    const student = await store.add({ callerId: "parent-a", name })
    assert.equal(student.subscriptionId, "subscription-family")
  }
  await assert.rejects(store.add({ callerId: "parent-a", name: "Five" }), /Student capacity reached/)
  assert.equal(store.students.length, 4)
})

test("synthetic unauthenticated, non-Parent, and cross-Parent calls persist nothing", async () => {
  const store = new SyntheticStudentStore()
  await assert.rejects(store.add({ authenticated: false, callerId: "parent-a", name: "One" }), /Authentication required/)
  await assert.rejects(store.add({ role: "admin", callerId: "admin-a", name: "One" }), /Parent account required/)
  await assert.rejects(
    store.add({ callerId: "parent-a", requestedParentId: "parent-b", name: "One" }),
    /ownership verification failed/,
  )
  assert.equal(store.students.length, 0)
})

test("synthetic concurrent attempts cannot exceed authoritative capacity", async () => {
  const store = new SyntheticStudentStore()
  const results = await Promise.allSettled([
    store.add({ callerId: "parent-a", name: "One" }),
    store.add({ callerId: "parent-a", name: "Two" }),
  ])
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1)
  assert.equal(results.filter((result) => result.status === "rejected").length, 1)
  assert.equal(store.students.length, 1)
})

test("synthetic retry returns the established row without a duplicate", async () => {
  const store = new SyntheticStudentStore()
  const first = await store.add({ callerId: "parent-a", name: "One" })
  const retry = await store.add({ callerId: "parent-a", name: " One " })
  assert.equal(retry, first)
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
