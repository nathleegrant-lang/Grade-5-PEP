import { NextRequest, NextResponse } from "next/server"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_API = "https://api-m.paypal.com" // Live API

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    
    const prices: Record<string, { amount: string; description: string }> = {
      monthly: { amount: "6.50", description: "Grade 5 PEP Premium - Monthly" },
      yearly: { amount: "65.00", description: "Grade 5 PEP Premium - Yearly" },
    }

    const selectedPlan = prices[plan]
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: selectedPlan.amount,
            },
            description: selectedPlan.description,
          },
        ],
        application_context: {
          brand_name: "Grade 5 PEP",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${request.headers.get("origin")}/payment-success`,
          cancel_url: `${request.headers.get("origin")}/pricing`,
        },
      }),
    })

    const order = await response.json()
    
    if (order.error) {
      console.error("PayPal Error:", order)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json({ orderID: order.id })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
