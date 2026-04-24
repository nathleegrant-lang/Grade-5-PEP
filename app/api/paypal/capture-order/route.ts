import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_API = "https://api-m.paypal.com"

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, plan } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const accessToken = await getAccessToken()

    // Capture the payment
    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const captureData = await response.json()

    if (captureData.status === "COMPLETED") {
      // Calculate subscription expiry
      const now = new Date()
      const expiryDate =
        plan === "yearly"
          ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const captureId =
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id
      const amountValue = parseFloat(
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.value || (plan === "yearly" ? "65" : "6.5")
      )
      const payerEmail = captureData.payer?.email_address
      const payerName =
        `${captureData.payer?.name?.given_name || ""} ${captureData.payer?.name?.surname || ""}`.trim()

      // Save payment record
      await supabase.from("payments").insert({
        user_id: user.id,
        paypal_order_id: orderID,
        paypal_capture_id: captureId,
        plan,
        amount: amountValue,
        currency: "USD",
        status: "completed",
        payer_email: payerEmail,
        payer_name: payerName,
        completed_at: now.toISOString(),
      })

      // Update profile subscription
      await supabase
        .from("profiles")
        .update({
          subscription: plan,
          subscription_started: now.toISOString(),
          subscription_expiry: expiryDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", user.id)

      return NextResponse.json({
        success: true,
        subscription: plan,
        expiryDate: expiryDate.toISOString(),
        transactionId: captureData.id,
        payerEmail,
      })
    } else {
      // Save failed payment record
      await supabase.from("payments").insert({
        user_id: user.id,
        paypal_order_id: orderID,
        plan,
        amount: plan === "yearly" ? 65 : 6.5,
        currency: "USD",
        status: "failed",
      })

      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[v0] Error capturing order:", error)
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    )
  }
}
