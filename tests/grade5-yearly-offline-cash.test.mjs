import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync("supabase/migrations/20260906000000_grade5_yearly_and_offline_cash.sql", "utf8")
const adminPage = readFileSync("app/admin/payments/page.tsx", "utf8")
const pricingPage = readFileSync("app/pricing/page.tsx", "utf8")
const checkoutPage = readFileSync("app/checkout/page.tsx", "utf8")

const plans = {
  standard_monthly: { months: 1, days: 0, maxStudents: 1 },
  standard_yearly: { months: 12, days: 0, maxStudents: 1 },
  premium_family_monthly: { months: 1, days: 0, maxStudents: 4 },
  premium_family_yearly: { months: 12, days: 0, maxStudents: 4 },
}

function addCalendarMonths(date, months) {
  const result = new Date(date)
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const end = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate()
  result.setUTCDate(Math.min(day, end))
  return result
}

function activate(state, reference, planCode, now) {
  if (state.receipts.has(reference)) return state.receipts.get(reference)
  const base = state.terms.reduce((latest, term) => term.expiresAt > latest ? term.expiresAt : latest, now)
  const plan = plans[planCode]
  const result = {
    planCode,
    maxStudents: plan.maxStudents,
    startsAt: base,
    expiresAt: addCalendarMonths(base, plan.months),
  }
  state.terms.push(result)
  state.receipts.set(reference, result)
  return result
}

test("yearly plans are authoritative 12-calendar-month products", () => {
  assert.match(migration, /'standard_yearly', 30000, 12, 0, 1/)
  assert.match(migration, /'premium_family_yearly', 100000, 12, 0, 4/)
  assert.doesNotMatch(migration, /365\s*days/i)
})

test("calendar arithmetic handles leap day and month end", () => {
  assert.equal(addCalendarMonths(new Date("2028-02-29T12:00:00Z"), 12).toISOString(), "2029-02-28T12:00:00.000Z")
  assert.equal(addCalendarMonths(new Date("2027-01-31T12:00:00Z"), 1).toISOString(), "2027-02-28T12:00:00.000Z")
  assert.equal(addCalendarMonths(new Date("2027-08-31T12:00:00Z"), 12).toISOString(), "2028-08-31T12:00:00.000Z")
})

test("same-plan renewal and monthly-to-yearly preserve paid time", () => {
  const state = { terms: [], receipts: new Map() }
  const first = activate(state, "A", "standard_monthly", new Date("2027-01-15T12:00:00Z"))
  const renewal = activate(state, "B", "standard_monthly", new Date("2027-01-20T12:00:00Z"))
  const yearly = activate(state, "C", "standard_yearly", new Date("2027-01-21T12:00:00Z"))
  assert.equal(renewal.startsAt, first.expiresAt)
  assert.equal(yearly.startsAt, renewal.expiresAt)
  assert.equal(yearly.expiresAt.toISOString(), "2028-03-15T12:00:00.000Z")
})

test("family monthly to family yearly remains a four-student entitlement", () => {
  const state = { terms: [], receipts: new Map() }
  activate(state, "F1", "premium_family_monthly", new Date("2027-05-10T12:00:00Z"))
  const yearly = activate(state, "F2", "premium_family_yearly", new Date("2027-05-12T12:00:00Z"))
  assert.equal(yearly.maxStudents, 4)
  assert.equal(yearly.startsAt.toISOString(), "2027-06-10T12:00:00.000Z")
})

test("early family-to-individual purchase cannot reduce the active family term", () => {
  const state = { terms: [], receipts: new Map() }
  const family = activate(state, "FAMILY", "premium_family_monthly", new Date("2027-05-10T12:00:00Z"))
  const individual = activate(state, "INDIVIDUAL", "standard_yearly", new Date("2027-05-12T12:00:00Z"))
  assert.equal(family.maxStudents, 4)
  assert.equal(individual.maxStudents, 1)
  assert.equal(individual.startsAt, family.expiresAt)
})

test("replaying an idempotency reference never adds time", () => {
  const state = { terms: [], receipts: new Map() }
  const first = activate(state, "CASH-001", "standard_yearly", new Date("2027-01-01T12:00:00Z"))
  const replay = activate(state, "CASH-001", "standard_yearly", new Date("2027-01-02T12:00:00Z"))
  assert.equal(replay, first)
  assert.equal(state.terms.length, 1)
  assert.match(migration, /unique index[^;]+lower\(offline_reference\)/s)
  assert.match(migration, /for update/)
  assert.match(migration, /pg_advisory_xact_lock/)
})

test("bank approval and Cash recording share the private activation core", () => {
  const calls = migration.match(/app_private\.activate_grade5_payment\(/g) || []
  assert.ok(calls.length >= 4)
  assert.match(adminPage, /action: "activate"/)
  assert.match(adminPage, /action: "record_cash"/)
})

test("parent payment mutation is closed and protected insert fields are constrained", () => {
  assert.match(migration, /revoke update on public\.payments from anon, authenticated/)
  assert.match(migration, /status = 'pending'/)
  assert.match(migration, /verified_at is null/)
  assert.match(migration, /method = 'bank_transfer'/)
})

test("Cash is absent from public Pricing and Checkout", () => {
  assert.doesNotMatch(pricingPage, /cash/i)
  assert.doesNotMatch(checkoutPage, /cash/i)
  assert.match(adminPage, /Record Offline Payment/)
})
