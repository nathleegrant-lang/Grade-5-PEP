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
