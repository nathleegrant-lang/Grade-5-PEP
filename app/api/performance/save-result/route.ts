import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Supabase public environment variables are missing" },
        { status: 500 },
      )
    }

    const authClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const db = getSupabaseAdminClient()

    const { data: student } = await db
      .from("students")
      .select("id")
      .eq("parent_id", user.id)
      .limit(1)
      .maybeSingle()

    const percentage = Math.round(Number(body.percentage || 0))

    const { data, error } = await db
      .from("student_test_results")
      .insert({
        parent_id: user.id,
        student_id: student?.id ?? null,
        grade: "grade5",
        subject: body.subject || "Language Arts",
        test_name: body.test_name || "Performance Task - Easy 1",
        difficulty: body.difficulty || "Easy",
        score: percentage,
        total_questions: 1,
        correct_answers: percentage,
        percentage,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[performance/save-result]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    console.error("[performance/save-result]", error)
    return NextResponse.json(
      { error: "Failed to save performance result" },
      { status: 500 },
    )
  }
}
