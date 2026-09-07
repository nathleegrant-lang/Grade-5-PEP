import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import test from "node:test"

const migration = readFileSync("supabase/migrations/20260906000000_grade5_yearly_and_offline_cash.sql", "utf8")
const backfillMigration = readFileSync("supabase/migrations/20260906224451_legacy_grade5_entitlement_backfill.sql", "utf8")
const adminPage = readFileSync("app/admin/payments/page.tsx", "utf8")
const pricingPage = readFileSync("app/pricing/page.tsx", "utf8")
const checkoutPage = readFileSync("app/checkout/page.tsx", "utf8")
const authContext = readFileSync("contexts/auth-context.tsx", "utf8")
const subscriptionsLibrary = readFileSync("lib/subscriptions.ts", "utf8")
const activationPath = "supabase/controlled-releases/phase-6/activate_grade5_yearly_plans.sql"
const activationMigration = readFileSync(activationPath, "utf8")
const activationReadme = readFileSync("supabase/controlled-releases/phase-6/README.md", "utf8")
const certifiedBackfillSha256 = "cd8ca6691b818ae138ba34e8c7e0efa02f7371d39179de4088e7fcd346d9e441"

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

function resolveEntitlement(subscription, now = new Date("2027-01-15T12:00:00Z")) {
  const active = Boolean(
    subscription &&
    subscription.status === "active" &&
    (!subscription.startsAt || new Date(subscription.startsAt) <= now) &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > now,
  )

  return {
    planCode: active ? subscription.planCode : "free",
    expiresAt: active ? subscription.expiresAt : undefined,
    maxStudents: active ? subscription.maxStudents : 1,
  }
}

const legacyEvidence = Object.freeze({
  paymentId: "d1e603ad-4b9c-4f4f-b213-1941bf228a1a",
  historicalSubscriptionId: "91d75058-6640-4b29-99f0-4e7b4df4c2ee",
  historicalPaymentId: "8422f298-e5a5-48e6-b710-e16a54d5c211",
  startsAt: "2026-09-06T03:19:38.035Z",
  expiresAt: "2026-09-13T03:19:38.035Z",
})

function legacyFixture() {
  return {
    payment: {
      id: legacyEvidence.paymentId,
      parentId: "synthetic-parent",
      grade: "grade5",
      planCode: "standard_weekly",
      amountJmd: 1000,
      method: "bank_transfer",
      status: "verified",
      verifiedAt: legacyEvidence.startsAt,
      referenceSha256: "79390986bbba18cf5c5377fce37cc1fa15f6c631e16a0d8ead4b70a4ae545efd",
    },
    subscriptions: [{
      id: legacyEvidence.historicalSubscriptionId,
      parentId: "synthetic-parent",
      grade: "grade5",
      planCode: "standard_weekly",
      status: "active",
      startsAt: "2026-04-29T03:09:37.248Z",
      expiresAt: "2026-05-06T03:09:37.248Z",
      maxStudents: 1,
      paymentId: legacyEvidence.historicalPaymentId,
    }],
    audit: [],
  }
}

function runSyntheticLegacyBackfill(state) {
  const payment = state.payment
  const paymentFactsMatch =
    payment.id === legacyEvidence.paymentId &&
    payment.grade === "grade5" &&
    payment.planCode === "standard_weekly" &&
    payment.amountJmd === 1000 &&
    payment.method === "bank_transfer" &&
    payment.status === "verified" &&
    payment.verifiedAt === legacyEvidence.startsAt &&
    payment.referenceSha256 === "79390986bbba18cf5c5377fce37cc1fa15f6c631e16a0d8ead4b70a4ae545efd"
  if (!paymentFactsMatch) throw new Error("payment facts changed")

  const linked = state.subscriptions.find((row) => row.paymentId === payment.id)
  if (linked) {
    const exact = linked.parentId === payment.parentId &&
      linked.planCode === "standard_weekly" &&
      linked.startsAt === legacyEvidence.startsAt &&
      linked.expiresAt === legacyEvidence.expiresAt &&
      linked.maxStudents === 1
    if (!exact) throw new Error("conflicting linked subscription")
    return linked
  }

  if (state.subscriptions.some((row) =>
    row.id !== legacyEvidence.historicalSubscriptionId &&
    row.status === "active" && row.expiresAt > legacyEvidence.startsAt)) {
    throw new Error("another effective subscription")
  }

  const historical = state.subscriptions.find((row) => row.id === legacyEvidence.historicalSubscriptionId)
  if (!historical || historical.status !== "active" ||
      historical.expiresAt !== "2026-05-06T03:09:37.248Z" ||
      historical.paymentId !== legacyEvidence.historicalPaymentId) {
    throw new Error("historical state changed")
  }

  historical.status = "expired"
  const subscription = {
    id: "synthetic-backfilled-subscription",
    parentId: payment.parentId,
    grade: "grade5",
    planCode: "standard_weekly",
    status: "active",
    startsAt: legacyEvidence.startsAt,
    expiresAt: legacyEvidence.expiresAt,
    maxStudents: 1,
    paymentId: payment.id,
  }
  state.subscriptions.push(subscription)
  state.audit.push({ actionType: "legacy_payment_subscription_backfilled", entitlementExtended: false })
  return subscription
}

test("yearly plans are authoritative 12-calendar-month products", () => {
  assert.match(migration, /'standard_yearly', 30000, 12, 0, 1/)
  assert.match(migration, /'premium_family_yearly', 100000, 12, 0, 4/)
  assert.doesNotMatch(migration, /365\s*days/i)
})

test("yearly products are installed dormant in both configuration and public pricing", () => {
  assert.match(migration, /'standard_yearly', 30000, 12, 0, 1, false/)
  assert.match(migration, /'premium_family_yearly', 100000, 12, 0, 4, false/)
  assert.match(migration, /'standard_yearly',[\s\S]+1, 'Yearly Value', false, false\)/)
  assert.match(migration, /'premium_family_yearly',[\s\S]+4, null, false, false\)/)
  assert.doesNotMatch(migration, /'standard_yearly', 30000, 12, 0, 1, true/)
  assert.doesNotMatch(migration, /'premium_family_yearly', 100000, 12, 0, 4, true/)
})

test("public pricing and checkout fail closed when paid plan lookup fails", () => {
  assert.match(pricingPage, /\.eq\("is_active", true\)/)
  assert.match(pricingPage, /PRICING_TIERS\.filter\(\(tier\) => tier\.id === "free"\)/)
  assert.doesNotMatch(pricingPage, /useState<PricingTier\[]>\(PRICING_TIERS\)/)
  assert.match(checkoutPage, /\.eq\("is_active", true\)/)
  assert.match(checkoutPage, /planId === "free"/)
  assert.doesNotMatch(checkoutPage, /find\(\(tier\) => tier\.id === planId\)/)
})

test("subscriptions are the sole paid-entitlement authority", () => {
  assert.match(authContext, /const active = isSubscriptionActive\(subscription\)/)
  assert.match(authContext, /maxStudents: subscription\?\.maxStudents \?\? 1/)
  assert.doesNotMatch(authContext, /isPaymentAccessActive|latestVerifiedPayment|calculatePaymentExpiry/)
  assert.doesNotMatch(authContext, /\.from\("payments"\)/)
  assert.doesNotMatch(subscriptionsLibrary, /isPaymentAccessActive|calculateExpiryFromStart|setMonth\(/)

  const individual = resolveEntitlement({
    status: "active",
    planCode: "standard_yearly",
    startsAt: "2027-01-01T00:00:00Z",
    expiresAt: "2028-01-01T00:00:00Z",
    maxStudents: 1,
  })
  const family = resolveEntitlement({
    status: "active",
    planCode: "premium_family_yearly",
    startsAt: "2027-01-01T00:00:00Z",
    expiresAt: "2028-01-01T00:00:00Z",
    maxStudents: 4,
  })
  assert.deepEqual(individual, {
    planCode: "standard_yearly",
    expiresAt: "2028-01-01T00:00:00Z",
    maxStudents: 1,
  })
  assert.equal(family.maxStudents, 4)
})

test("verified payment alone, expired subscription, and future subscription remain Free", () => {
  assert.deepEqual(resolveEntitlement(null), {
    planCode: "free",
    expiresAt: undefined,
    maxStudents: 1,
  })
  assert.equal(resolveEntitlement({
    status: "expired",
    planCode: "standard_yearly",
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2027-01-01T00:00:00Z",
    maxStudents: 1,
  }).planCode, "free")
  assert.equal(resolveEntitlement({
    status: "active",
    planCode: "premium_family_yearly",
    startsAt: "2027-02-01T00:00:00Z",
    expiresAt: "2028-02-01T00:00:00Z",
    maxStudents: 4,
  }).planCode, "free")
})

test("Phase 6 activation is assertion-gated and outside automatic Phase 2 migrations", () => {
  const automaticMigrations = readdirSync("supabase/migrations")
  assert.equal(automaticMigrations.some((name) => /activate_grade5_yearly_plans/.test(name)), false)
  assert.match(activationReadme, /intentionally outside `supabase\/migrations`/)
  assert.match(activationMigration, /price_jmd = 30000/)
  assert.match(activationMigration, /duration_months = 12/)
  assert.match(activationMigration, /duration_days = 0/)
  assert.match(activationMigration, /max_students = 1/)
  assert.match(activationMigration, /price_jmd = 100000/)
  assert.match(activationMigration, /max_students = 4/)
  assert.match(activationMigration, /configuration_count <> 2/)
  assert.match(activationMigration, /pricing_count <> 2/)
  assert.match(activationMigration, /set is_public = true/)
  assert.match(activationMigration, /set is_active = true/)
  assert.doesNotMatch(activationMigration, /insert into|delete from|update public\.(?!grade5_plan_configuration|pricing_plans)/i)
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

test("all payment activation audit writes use the production audit schema", () => {
  assert.match(migration, /admin_user_id, action_type, target_table, target_id, details/g)
  assert.match(backfillMigration, /admin_user_id, action_type, target_table, target_id, details/)
  assert.doesNotMatch(migration, /\(administrator_id, action, entity_type, entity_id, details\)/)
  assert.match(migration, /'payment_activated', 'payment'/)
  assert.match(migration, /'offline_cash_recorded', 'payment'/)
  assert.match(backfillMigration, /'legacy_payment_subscription_backfilled'/)
})

test("legacy backfill is bound to the accepted payment evidence", () => {
  assert.equal(createHash("sha256").update(backfillMigration).digest("hex"), certifiedBackfillSha256)
  assert.match(backfillMigration, /d1e603ad-4b9c-4f4f-b213-1941bf228a1a/)
  assert.match(backfillMigration, /79390986bbba18cf5c5377fce37cc1fa15f6c631e16a0d8ead4b70a4ae545efd/)
  assert.match(backfillMigration, /91d75058-6640-4b29-99f0-4e7b4df4c2ee/)
  assert.match(backfillMigration, /8422f298-e5a5-48e6-b710-e16a54d5c211/)
  assert.match(backfillMigration, /'standard_weekly'/)
  assert.match(backfillMigration, /1000\.00::numeric/)
  assert.match(backfillMigration, /'bank_transfer'/)
  assert.match(backfillMigration, /'verified'/)
  assert.match(backfillMigration, /2026-09-06 03:19:38\.035\+00/)
  assert.match(backfillMigration, /2026-09-13 03:19:38\.035\+00/)
})

test("legacy backfill preserves the exact entitlement and never adds time", () => {
  assert.match(backfillMigration, /preserved_start, preserved_expiry, 1, target_payment_id/)
  assert.match(backfillMigration, /'entitlementExtended', false/g)
  assert.doesNotMatch(backfillMigration, /make_interval|interval\s+'7 days'|greatest\s*\(/i)
  assert.doesNotMatch(backfillMigration, /clock_timestamp\(\).*interval|now\(\).*interval/is)
})

test("legacy backfill has transactional replay and conflict safeguards", () => {
  assert.match(backfillMigration, /^begin;/)
  assert.match(backfillMigration, /for update/g)
  assert.match(backfillMigration, /pg_advisory_xact_lock/)
  assert.match(backfillMigration, /subscriptions_payment_id_unique/)
  assert.match(backfillMigration, /on public\.subscriptions \(payment_id\)\s+where payment_id is not null/s)
  assert.match(backfillMigration, /'idempotent', true/)
  assert.match(backfillMigration, /Conflicting subscription already linked/)
  assert.match(backfillMigration, /Another effective Grade 5 subscription already exists/)
  assert.match(backfillMigration, /Legacy payment facts no longer match/)
  assert.match(backfillMigration, /Legacy payment activation state no longer matches/)
  assert.match(backfillMigration, /Historical subscription no longer matches/)
  assert.match(backfillMigration, /set status = 'expired'/)
  assert.match(backfillMigration, /activated_at = preserved_start/)
  assert.match(backfillMigration, /commit;\s*$/)
})

test("legacy backfill privileged function is not executable by public clients", () => {
  assert.match(backfillMigration, /security definer/)
  assert.match(backfillMigration, /revoke all on function app_private\.backfill_legacy_grade5_entitlement\(uuid, uuid\)\s+from public, anon, authenticated/s)
  assert.match(backfillMigration, /grant execute on function app_private\.backfill_legacy_grade5_entitlement\(uuid, uuid\)\s+to service_role/s)
  assert.match(backfillMigration, /role = 'admin'/)
})

test("synthetic legacy backfill preserves entitlement and replay is idempotent", () => {
  const state = legacyFixture()
  const first = runSyntheticLegacyBackfill(state)
  const replay = runSyntheticLegacyBackfill(state)
  assert.equal(first, replay)
  assert.equal(first.startsAt, legacyEvidence.startsAt)
  assert.equal(first.expiresAt, legacyEvidence.expiresAt)
  assert.equal(first.maxStudents, 1)
  assert.equal(state.subscriptions.length, 2)
  assert.equal(state.subscriptions[0].status, "expired")
  assert.equal(state.audit.length, 1)
  assert.equal(state.audit[0].entitlementExtended, false)
})

test("synthetic legacy backfill refuses changed payment facts", () => {
  const state = legacyFixture()
  state.payment.amountJmd = 2000
  assert.throws(() => runSyntheticLegacyBackfill(state), /payment facts changed/)
  assert.equal(state.subscriptions.length, 1)
  assert.equal(state.subscriptions[0].status, "active")
})

test("synthetic legacy backfill refuses a newly effective subscription", () => {
  const state = legacyFixture()
  state.subscriptions.push({
    id: "unexpected-effective-subscription",
    parentId: state.payment.parentId,
    status: "active",
    expiresAt: "2026-10-01T00:00:00.000Z",
    paymentId: "another-payment",
  })
  assert.throws(() => runSyntheticLegacyBackfill(state), /another effective subscription/)
  assert.equal(state.subscriptions[0].status, "active")
})

test("synthetic legacy backfill refuses changed historical state", () => {
  const state = legacyFixture()
  state.subscriptions[0].expiresAt = "2026-05-07T03:09:37.248Z"
  assert.throws(() => runSyntheticLegacyBackfill(state), /historical state changed/)
  assert.equal(state.subscriptions.length, 1)
})
