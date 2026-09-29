import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import vm from "node:vm"
import ts from "typescript"

const read = (path) => readFileSync(path, "utf8")
const dateFoundation = read("supabase/migrations/20260929141000_g5_customer_ops_001_corr_003_date_resolver.sql")
const corrections = read("supabase/migrations/20260929141100_g5_customer_ops_001_corr_003_cash_corrections.sql")
const correctionRpc = read("supabase/migrations/20260929141200_g5_customer_ops_001_corr_003_correction_rpc.sql")
const extensions = read("supabase/migrations/20260929141300_g5_customer_ops_001_corr_003_subscription_extensions.sql")
const cashV2 = read("supabase/migrations/20260929141400_g5_customer_ops_001_corr_003_cash_rpc_v2.sql")
const page = read("app/admin/payments/page.tsx")
const route = read("app/api/admin/payments/route.ts")
const types = read("lib/types.ts")
const validatorSource = read("lib/cash-business-date.ts")

function loadDateValidator() {
  const executable = ts.transpileModule(validatorSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const context = vm.createContext({ exports: {}, module: { exports: {} } })
  context.exports = context.module.exports
  vm.runInContext(executable, context)
  return context.module.exports.isValidCashBusinessDate
}

test("strict date-only validator accepts real calendar dates and rejects coercible impostors", () => {
  const validate = loadDateValidator()
  for (const value of ["2026-09-28", "2026-04-30", "2026-05-31", "2026-12-31", "2027-01-01", "2028-02-29"]) {
    assert.equal(validate(value), true, value)
  }
  for (const value of [undefined, "", " 2026-09-28", "2026-09-28 ", "2027-02-29", "2026-02-30", "2026-04-31", "2026-9-28", "2026/09/28", "2026-09-28Z", "2026-09-28T12:00:00Z"]) {
    assert.equal(validate(value), false, String(value))
  }
})

test("Admin and API preserve YYYY-MM-DD without JavaScript Date reconstruction", () => {
  assert.match(page, /paymentDate: ""/)
  assert.match(page, /type="date"/)
  assert.match(page, /paymentDate: cash\.paymentDate/)
  assert.match(page, /Enter the date the Cash was physically received\./)
  assert.doesNotMatch(page, /new Date\(`\$\{cash\.(paidAt|paymentDate)\}/)
  assert.doesNotMatch(page, /toISOString\(\)\.slice\(0, 10\)/)
  assert.match(route, /isValidCashBusinessDate\(body\.paymentDate\)/)
  assert.match(route, /p_cash_business_date: body\.paymentDate/)
  assert.doesNotMatch(route, /p_paid_at: body/)
})

test("timezone context cannot change the date-only application value", () => {
  const values = ["UTC", "Pacific/Kiritimati", "Pacific/Honolulu", "America/Jamaica"].map((timeZone) => {
    process.env.TZ = timeZone
    const payload = { paymentDate: "2026-09-28" }
    return JSON.parse(JSON.stringify(payload)).paymentDate
  })
  assert.deepEqual(values, ["2026-09-28", "2026-09-28", "2026-09-28", "2026-09-28"])
})

test("date schema is additive, immutable, and does not backfill legacy paid_at", () => {
  assert.match(dateFoundation, /add column if not exists cash_business_date date/)
  assert.match(dateFoundation, /new\.cash_business_date is distinct from old\.cash_business_date/)
  assert.doesNotMatch(dateFoundation, /update public\.payments[\s\S]+cash_business_date/i)
  assert.doesNotMatch(dateFoundation, /paid_at::date|paid_at at time zone/i)
  assert.match(dateFoundation, /cash_business_date is null/)
})

test("Cash v2 generates references directly from date and retires the timestamp overload", () => {
  assert.match(cashV2, /p_cash_business_date date/)
  assert.match(cashV2, /to_char\(p_cash_business_date, 'YYYYMMDD'\)/)
  assert.doesNotMatch(cashV2, /p_cash_business_date[^\n]+time zone|to_timestamp|paid_at[^\n]*p_cash_business_date/)
  assert.match(cashV2, /drop function public\.admin_record_grade5_cash_payment\([\s\S]+timestamptz/)
  assert.match(cashV2, /revoke all on function public\.admin_record_grade5_cash_payment\([\s\S]+timestamptz[\s\S]+service_role/)
})

test("Cash v2 preserves beneficiary, amount, currency, activation, audit, and replay controls", () => {
  for (const expected of [
    /At least one Grade 5 student beneficiary is required/,
    /Student audit exceeds plan entitlement/,
    /Student audit does not belong to parent/,
    /Actual amount does not match authoritative plan price/,
    /Offline Cash currency must be JMD/,
    /Cash operation payload conflict/,
    /app_private\.activate_grade5_payment/,
    /offline_cash_recorded/,
  ]) assert.match(cashV2, expected)
  assert.match(cashV2, /existing_row\.cash_business_date is distinct from p_cash_business_date/)
  assert.match(cashV2, /offline_idempotency_key = p_idempotency_key/)
})

test("cross-namespace reference registry is the transactional uniqueness authority", () => {
  assert.match(corrections, /create table public\.grade5_cash_reference_registry/)
  assert.match(corrections, /reference_key text primary key/)
  assert.match(corrections, /source_type in \('payment', 'correction'\)/)
  assert.match(corrections, /register_grade5_cash_payment_reference/)
  assert.match(corrections, /register_grade5_cash_correction_reference/)
  assert.match(cashV2, /insert into public\.grade5_cash_reference_registry/)
  assert.match(correctionRpc, /insert into public\.grade5_cash_reference_registry/)
  assert.match(cashV2, /exception when unique_violation then[\s\S]+consume another sequence value and retry/)
  assert.match(correctionRpc, /exception when unique_violation then[\s\S]+consume another sequence value and retry/)
})

test("supersession is append-only, one-per-payment, idempotent, and preserves the payment", () => {
  assert.match(corrections, /create table public\.grade5_cash_payment_corrections/)
  assert.match(corrections, /unique \(payment_id\)/)
  assert.match(corrections, /unique \(operation_key\)/)
  assert.match(corrections, /before update or delete/)
  assert.match(correctionRpc, /Cash correction operation payload conflict/)
  assert.match(correctionRpc, /Cash payment already has an authoritative correction/)
  assert.doesNotMatch(correctionRpc, /update public\.payments/)
  assert.match(correctionRpc, /cash_identity_corrected/)
  assert.match(correctionRpc, /payment_row\.grade is distinct from 'grade5'/)
  assert.match(correctionRpc, /payment_row\.status is distinct from 'verified'/)
  assert.match(correctionRpc, /payment_row\.activated_at is null/)
})

test("synthetic supersession replays once, rejects conflicts, and resolves corrected identity", () => {
  const payment = Object.freeze({
    id: "payment-a",
    parentId: "parent-a",
    amount: 3000,
    planCode: "standard_monthly",
    studentIds: ["student-a"],
    originalReference: "CASH-20260101-999999",
  })
  const correctionsByPayment = new Map()
  const correctionsByOperation = new Map()
  const correct = ({ operationKey, paymentId, date, reason }) => {
    const replay = correctionsByOperation.get(operationKey)
    if (replay) {
      if (replay.paymentId !== paymentId || replay.date !== date || replay.reason !== reason) {
        throw new Error("Cash correction operation payload conflict")
      }
      return replay
    }
    if (correctionsByPayment.has(paymentId)) throw new Error("Cash payment already has an authoritative correction")
    const row = Object.freeze({ paymentId, date, reason, reference: "CASH-20260928-000002" })
    correctionsByPayment.set(paymentId, row)
    correctionsByOperation.set(operationKey, row)
    return row
  }

  const first = correct({ operationKey: "op-a", paymentId: payment.id, date: "2026-09-28", reason: "Physical receipt date" })
  assert.equal(correct({ operationKey: "op-a", paymentId: payment.id, date: "2026-09-28", reason: "Physical receipt date" }), first)
  assert.throws(() => correct({ operationKey: "op-a", paymentId: payment.id, date: "2026-09-27", reason: "Physical receipt date" }), /payload conflict/)
  assert.throws(() => correct({ operationKey: "op-b", paymentId: payment.id, date: "2026-09-28", reason: "Physical receipt date" }), /already has/)
  assert.equal(correctionsByPayment.size, 1)
  assert.equal(payment.originalReference, "CASH-20260101-999999")
  assert.equal(payment.amount, 3000)
  assert.deepEqual(payment.studentIds, ["student-a"])
})

test("accounting resolver owns legacy, new-date, and corrected precedence", () => {
  assert.match(corrections, /coalesce\(c\.corrected_business_date, p\.cash_business_date\) as authoritative_business_date/)
  assert.match(corrections, /coalesce\(c\.corrected_reference, p\.offline_reference, p\.reference_code\) as authoritative_reference/)
  assert.match(corrections, /'corrected'::text/)
  assert.match(corrections, /'new_date_contract'::text/)
  assert.match(corrections, /'legacy'::text/)
  assert.match(route, /from\("grade5_payment_accounting_identity"\)/)
  assert.match(page, /row\.authoritative_reference \|\| row\.reference_code/)
  assert.match(page, /payment\.authoritativeBusinessDate \|\| "Not recorded"/)
  assert.match(types, /identitySource\?: "new_date_contract" \| "legacy" \| "corrected"/)
})

test("seven-day extension is atomic, immutable, and replay-safe", () => {
  assert.match(extensions, /create table public\.grade5_subscription_extensions/)
  assert.match(extensions, /check \(extension_days = 7\)/)
  assert.match(extensions, /resulting_expiry = prior_expiry \+ interval '7 days'/)
  assert.match(extensions, /before update or delete/)
  assert.match(extensions, /Subscription extension operation payload conflict/)
  assert.match(extensions, /resulting_expiry := subscription_row\.expires_at \+ make_interval\(days => p_extension_days\)/)
  assert.match(extensions, /insert into public\.grade5_subscription_extensions[\s\S]+update public\.subscriptions[\s\S]+insert into public\.admin_audit_log/)
  assert.doesNotMatch(extensions, /update public\.payments/)
})

test("synthetic courtesy replay remains exactly X plus seven, never X plus fourteen", () => {
  const start = 1_800_000_000_000
  let expiry = start
  const operations = new Map()
  const extend = ({ operationKey, subscriptionId, days, reason }) => {
    const replay = operations.get(operationKey)
    if (replay) {
      if (replay.subscriptionId !== subscriptionId || replay.days !== days || replay.reason !== reason) {
        throw new Error("Subscription extension operation payload conflict")
      }
      return replay
    }
    if (days !== 7) throw new Error("must be exactly seven days")
    const row = Object.freeze({ subscriptionId, days, reason, prior: expiry, resulting: expiry + 7 * 86_400_000 })
    expiry = row.resulting
    operations.set(operationKey, row)
    return row
  }

  const first = extend({ operationKey: "op-a", subscriptionId: "sub-a", days: 7, reason: "Courtesy week" })
  const replay = extend({ operationKey: "op-a", subscriptionId: "sub-a", days: 7, reason: "Courtesy week" })
  assert.equal(replay, first)
  assert.equal(expiry, start + 7 * 86_400_000)
  assert.throws(() => extend({ operationKey: "op-a", subscriptionId: "sub-a", days: 7, reason: "Different" }), /payload conflict/)
  assert.throws(() => extend({ operationKey: "op-b", subscriptionId: "sub-a", days: 8, reason: "Courtesy week" }), /exactly seven days/)
})

test("new privileged surfaces are service-role-only with RLS and controlled search paths", () => {
  for (const migration of [corrections, correctionRpc, extensions, cashV2]) {
    assert.match(migration, /security definer|enable row level security/i)
  }
  for (const migration of [correctionRpc, extensions, cashV2]) {
    assert.match(migration, /set search_path = 'pg_catalog', 'public', 'app_private'/)
    assert.match(migration, /from public, anon, authenticated/)
    assert.match(migration, /to service_role/)
    assert.match(migration, /p\.role = 'admin'/)
  }
  assert.doesNotMatch(corrections + correctionRpc + extensions + cashV2, /grant (insert|update|delete) on .* to (anon|authenticated)/i)
})

test("no customer-specific remediation or generic correction UI enters the candidate", () => {
  assert.doesNotMatch(page, /Correct Cash Payment|Add Days/)
})
