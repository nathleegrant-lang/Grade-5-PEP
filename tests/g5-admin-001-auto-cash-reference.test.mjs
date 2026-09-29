import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync("supabase/migrations/20260929052000_g5_admin_001_automatic_cash_reference.sql", "utf8")
const route = readFileSync("app/api/admin/payments/route.ts", "utf8")
const page = readFileSync("app/admin/payments/page.tsx", "utf8")
const studentMigration = readFileSync("supabase/migrations/20260929033000_g5_student_001_authoritative_add_student.sql", "utf8")

class SyntheticCashStore {
  constructor() {
    this.rows = []
    this.subscriptions = []
    this.audit = []
    this.sequence = 0
    this.lock = Promise.resolve()
  }

  async record(input) {
    const previous = this.lock
    let release
    this.lock = new Promise((resolve) => { release = resolve })
    await previous
    try {
      const existing = this.rows.find((row) => row.operationKey === input.operationKey)
      if (existing) {
        const comparable = ["parentId", "planCode", "amount", "currency", "paidAt", "note"]
        if (comparable.some((key) => (existing[key] ?? "") !== (input[key] ?? "")) ||
            JSON.stringify(existing.studentIds ?? []) !== JSON.stringify(input.studentIds ?? [])) {
          throw new Error("Cash operation payload conflict")
        }
        return this.activate(existing)
      }

      if (!input.authorized) throw new Error("Forbidden")
      if (input.currency !== "JMD") throw new Error("Offline Cash currency must be JMD")
      if (input.amount !== input.planPrice) throw new Error("Actual amount does not match authoritative plan price")
      if ((input.studentIds ?? []).some((id) => !input.validStudentIds.includes(id))) {
        throw new Error("Student audit does not belong to parent")
      }
      if ((input.studentIds ?? []).length > input.capacity) throw new Error("Student audit exceeds plan entitlement")

      // Sequence gaps are allowed, but no payment row survives a failed transaction.
      const seq = ++this.sequence
      if (input.failBeforeInsert) throw new Error("synthetic failure")
      const date = input.paidAt.slice(0, 10).replaceAll("-", "")
      const reference = `CASH-${date}-${String(seq).padStart(6, "0")}`
      const row = Object.freeze({
        ...input,
        reference,
        referenceCode: reference,
      })
      this.rows.push(row)
      this.audit.push({ action: "offline_cash_recorded", reference })
      return this.activate(row)
    } finally {
      release()
    }
  }

  activate(row) {
    let subscription = this.subscriptions.find((item) => item.operationKey === row.operationKey)
    if (!subscription) {
      subscription = { operationKey: row.operationKey, paymentReference: row.reference }
      this.subscriptions.push(subscription)
    }
    return { paymentReference: row.reference, subscription }
  }
}

function valid(overrides = {}) {
  return {
    authorized: true,
    operationKey: "11111111-1111-4111-8111-111111111111",
    parentId: "parent-a",
    planCode: "standard_monthly",
    amount: 3000,
    planPrice: 3000,
    currency: "JMD",
    paidAt: "2026-09-29T12:00:00.000Z",
    note: "",
    studentIds: ["student-a"],
    validStudentIds: ["student-a"],
    capacity: 1,
    ...overrides,
  }
}

test("permanent reference is database-generated and cannot be supplied by Admin UI/API", () => {
  assert.doesNotMatch(page, /offlineReference|Unique Cash reference|permanent idempotency key/)
  assert.doesNotMatch(route, /offlineReference|p_offline_reference/)
  assert.match(page, /crypto\.randomUUID\(\)/)
  assert.match(route, /p_idempotency_key: body\.idempotencyKey/)
  assert.match(migration, /payment_reference :=[\s\S]+'CASH-'[\s\S]+to_char\(p_paid_at at time zone 'UTC', 'YYYYMMDD'\)[\s\S]+lpad\(reference_seq::text, 6, '0'\)/)
})

test("database sequence plus unique indexes are authoritative for permanent and operation identity", () => {
  assert.match(migration, /create sequence if not exists public\.grade5_cash_reference_seq/)
  assert.match(migration, /nextval\('public\.grade5_cash_reference_seq'::regclass\)/)
  assert.match(migration, /add column if not exists offline_idempotency_key uuid/)
  assert.match(migration, /create unique index if not exists payments_offline_idempotency_key_unique/)
  assert.match(migration, /offline_idempotency_key\)\s+where offline_idempotency_key is not null/)
})

test("legacy spoofable RPC signature is removed and replacement remains service-role only", () => {
  assert.match(migration, /drop function if exists public\.admin_record_grade5_cash_payment\([\s\S]+timestamptz, text, uuid, text, uuid\[\][\s\S]+\)/)
  assert.match(migration, /revoke all on function public\.admin_record_grade5_cash_payment\([\s\S]+from public, anon, authenticated/)
  assert.match(migration, /grant execute on function public\.admin_record_grade5_cash_payment\([\s\S]+to service_role/)
})

test("Cash identity is immutable while receipt remains a separate identifier", () => {
  assert.match(migration, /new\.offline_reference is distinct from old\.offline_reference/)
  assert.match(migration, /new\.reference_code is distinct from old\.reference_code/)
  assert.match(migration, /new\.offline_idempotency_key is distinct from old\.offline_idempotency_key/)
  assert.match(migration, /Cash payment identity is immutable/)
  assert.doesNotMatch(migration, /receipt_number\s*:=\s*payment_reference|receipt_number[^\n]+payment_reference/)
})

test("same logical operation replays one payment and one subscription", async () => {
  const store = new SyntheticCashStore()
  const first = await store.record(valid())
  const replay = await store.record(valid())
  assert.equal(replay.paymentReference, first.paymentReference)
  assert.equal(store.rows.length, 1)
  assert.equal(store.subscriptions.length, 1)
  assert.equal(store.audit.length, 1)
})

test("concurrent double-submit with same operation key produces one payment", async () => {
  const store = new SyntheticCashStore()
  const [a, b] = await Promise.all([store.record(valid()), store.record(valid())])
  assert.equal(a.paymentReference, b.paymentReference)
  assert.equal(store.rows.length, 1)
  assert.equal(store.subscriptions.length, 1)
})

test("distinct legitimate operations receive distinct canonical references", async () => {
  const store = new SyntheticCashStore()
  const a = await store.record(valid())
  const b = await store.record(valid({ operationKey: "22222222-2222-4222-8222-222222222222" }))
  assert.match(a.paymentReference, /^CASH-20260929-\d{6,}$/)
  assert.match(b.paymentReference, /^CASH-20260929-\d{6,}$/)
  assert.notEqual(a.paymentReference, b.paymentReference)
})

test("conflicting replay is rejected rather than reusing identity for another payment", async () => {
  const store = new SyntheticCashStore()
  await store.record(valid())
  await assert.rejects(store.record(valid({ amount: 1000, planPrice: 1000 })), /payload conflict/)
  assert.equal(store.rows.length, 1)
  assert.equal(store.subscriptions.length, 1)
})

test("failed operation leaves no payment/subscription and same operation can retry", async () => {
  const store = new SyntheticCashStore()
  await assert.rejects(store.record(valid({ failBeforeInsert: true })), /synthetic failure/)
  assert.equal(store.rows.length, 0)
  assert.equal(store.subscriptions.length, 0)
  const retry = await store.record(valid())
  assert.match(retry.paymentReference, /^CASH-20260929-\d{6,}$/)
  assert.equal(store.rows.length, 1)
})

test("authorization, amount/currency, and student-beneficiary controls remain", async () => {
  for (const [overrides, message] of [
    [{ authorized: false }, /Forbidden/],
    [{ currency: "USD" }, /currency must be JMD/],
    [{ amount: 2999 }, /authoritative plan price/],
    [{ studentIds: ["student-b"] }, /does not belong to parent/],
    [{ studentIds: ["student-a", "student-b"], validStudentIds: ["student-a", "student-b"] }, /exceeds plan entitlement/],
  ]) {
    const store = new SyntheticCashStore()
    await assert.rejects(store.record(valid(overrides)), message)
    assert.equal(store.rows.length, 0)
    assert.equal(store.subscriptions.length, 0)
  }
  assert.match(migration, /Student audit exceeds plan entitlement/)
  assert.match(migration, /Student audit does not belong to parent/)
  assert.match(migration, /Actual amount does not match authoritative plan price/)
})

test("activation core and audit contract are reused, not redesigned", () => {
  assert.match(migration, /app_private\.activate_grade5_payment\(payment_id, p_administrator_id\)/)
  assert.match(migration, /'offline_cash_recorded', 'payment'/)
  assert.match(migration, /jsonb_build_object\([\s\S]+'reference', payment_reference/)
  assert.match(migration, /activation_result \|\| jsonb_build_object\('paymentReference', payment_reference\)/)
  assert.doesNotMatch(migration, /create table[^;]+receipt/i)
})

test("Admin displays generated reference and Audit note remains separate and optional", () => {
  assert.match(page, /Reference \$\{result\.paymentReference\}\. Receipt \$\{result\.receiptNumber\}/)
  assert.match(page, /Audit note \(optional\)/)
  assert.match(route, /p_note: body\.note \|\| null/)
  assert.match(migration, /offline_idempotency_key, note, status/)
})

test("G5-STUDENT-001 remains present and is not rewritten by the Admin migration", () => {
  assert.match(studentMigration, /Student operation payload conflict/)
  assert.match(studentMigration, /creation_idempotency_key/)
  assert.doesNotMatch(migration, /alter table public\.students|create or replace function public\.add_grade5_student/)
})
