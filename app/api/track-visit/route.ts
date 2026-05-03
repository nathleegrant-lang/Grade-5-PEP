import { NextRequest, NextResponse } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"

type TrackVisitPayload = {
  page_path?: string
  session_id?: string
  user_agent?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as TrackVisitPayload
    const pagePath = payload.page_path ?? "/"
    const sessionId = payload.session_id

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error: insertError } = await supabase.from("site_visits").insert({
      page_path: pagePath,
      session_id: sessionId,
      user_agent: payload.user_agent ?? null,
    })

    if (insertError) {
      console.error("Failed to insert site visit", insertError)
      return NextResponse.json({ error: "Failed to track visit" }, { status: 500 })
    }

    const { count, error: countError } = await supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })

    if (countError) {
      console.error("Failed to fetch visit count", countError)
      return NextResponse.json({ error: "Failed to fetch visit count" }, { status: 500 })
    }

    return NextResponse.json({ totalVisits: count ?? 0 })
  } catch (error) {
    console.error("Unexpected error tracking visit", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { count, error } = await supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })

    if (error) {
      console.error("Failed to fetch visit count", error)
      return NextResponse.json({ error: "Failed to fetch visit count" }, { status: 500 })
    }

    return NextResponse.json({ totalVisits: count ?? 0 })
  } catch (error) {
    console.error("Unexpected error fetching visit count", error)
    return NextResponse.json({ error: "Failed to fetch visit count" }, { status: 500 })
  }
}
