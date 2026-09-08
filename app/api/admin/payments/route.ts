import { NextRequest, NextResponse } from "next/server"
import { authorizeAdminRequest } from "@/lib/admin-request"
import type { PlanCode } from "@/lib/types"

type AdminPaymentAction =
  | { action: "activate"; paymentId: string }
  | { action: "reject"; paymentId: string; reason: string }
  | {
      action: "record_cash"
      parentId: string
      planCode: PlanCode
      actualAmountJmd: number
      currency: string
      paidAt: string
      offlineReference: string
      note?: string
      studentIds?: string[]
    }

type ParentLookupRow = {
  id: string
  full_name: string | null
  email: string | null
}

type StudentLookupRow = {
  id: string
  full_name: string | null
}

export async function GET(request: NextRequest) {
  const authorized = await authorizeAdminRequest(request.headers.get("authorization"))
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode")

    if (mode === "parents") {
      const query = searchParams.get("q")?.trim() || ""
      if (query.length < 2) {
        return NextResponse.json({ error: "Enter at least 2 characters to search." }, { status: 400 })
      }

      const pattern = `%${query}%`
      const [nameResult, emailResult] = await Promise.all([
        authorized.db
          .from("profiles")
          .select("id, full_name, email")
          .eq("role", "parent")
          .ilike("full_name", pattern)
          .limit(25),
        authorized.db
          .from("profiles")
          .select("id, full_name, email")
          .eq("role", "parent")
          .ilike("email", pattern)
          .limit(25),
      ])

      if (nameResult.error) throw nameResult.error
      if (emailResult.error) throw emailResult.error

      const unique = new Map<string, ParentLookupRow>()
      for (const row of [...(nameResult.data || []), ...(emailResult.data || [])] as ParentLookupRow[]) {
        unique.set(row.id, row)
      }

      const customers = Array.from(unique.values())
        .map((row) => ({
          id: row.id,
          name: row.full_name?.trim() || "Unnamed parent",
          email: row.email?.trim() || "No email",
        }))
        .sort((a, b) => `${a.name} ${a.email}`.localeCompare(`${b.name} ${b.email}`))
        .slice(0, 25)

      return NextResponse.json({ customers })
    }

    if (mode === "students") {
      const parentId = searchParams.get("parentId")?.trim() || ""
      if (!parentId) {
        return NextResponse.json({ error: "Parent is required." }, { status: 400 })
      }

      const { data, error } = await authorized.db
        .from("students")
        .select("id, full_name")
        .eq("parent_id", parentId)
        .eq("grade_level", 5)
        .order("full_name", { ascending: true })

      if (error) throw error

      const students = ((data || []) as StudentLookupRow[]).map((row) => ({
        id: row.id,
        name: row.full_name?.trim() || "Unnamed student",
      }))

      return NextResponse.json({ students })
    }

    return NextResponse.json({ error: "Unsupported lookup mode." }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  const authorized = await authorizeAdminRequest(request.headers.get("authorization"))
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = (await request.json()) as AdminPaymentAction

    if (body.action === "activate") {
      const { data, error } = await authorized.db.rpc("admin_activate_grade5_payment", {
        p_payment_id: body.paymentId,
        p_administrator_id: authorized.adminId,
      })
      if (error) throw error
      return NextResponse.json({ result: data })
    }

    if (body.action === "record_cash") {
      if (!body.parentId || !body.offlineReference || !body.paidAt) {
        return NextResponse.json({ error: "Parent, reference, and paid date are required." }, { status: 400 })
      }
      const { data, error } = await authorized.db.rpc("admin_record_grade5_cash_payment", {
        p_parent_id: body.parentId,
        p_plan_code: body.planCode,
        p_actual_amount_jmd: body.actualAmountJmd,
        p_currency: body.currency || "JMD",
        p_paid_at: body.paidAt,
        p_offline_reference: body.offlineReference,
        p_administrator_id: authorized.adminId,
        p_note: body.note || null,
        p_student_ids: body.studentIds || null,
      })
      if (error) throw error
      return NextResponse.json({ result: data })
    }

    if (body.action === "reject") {
      if (!body.reason?.trim()) {
        return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 })
      }
      const { error } = await authorized.db
        .from("payments")
        .update({ status: "rejected", rejection_reason: body.reason.trim() })
        .eq("id", body.paymentId)
        .eq("status", "pending")
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment operation failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
