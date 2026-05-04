import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export interface SaveStudentTestResultInput {
  parentId: string
  studentId?: string | null
  studentName?: string | null
  grade: "grade5"
  subject: string
  testName: string
  difficulty: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: string
}

export async function saveStudentTestResult(input: SaveStudentTestResultInput) {
  const supabase = getSupabaseBrowserClient()

  let resolvedStudentId = input.studentId ?? null
  const resolvedStudentName = (input.studentName || "Student").trim() || "Student"

  if (!resolvedStudentId && resolvedStudentName && input.parentId) {
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("parent_id", input.parentId)
      .ilike("full_name", resolvedStudentName)
      .maybeSingle()

    if (existingStudent?.id) {
      resolvedStudentId = existingStudent.id
    } else {
      const { data: createdStudent } = await supabase
        .from("students")
        .insert({
          parent_id: input.parentId,
          full_name: resolvedStudentName,
          grade_level: 5,
        })
        .select("id")
        .single()

      resolvedStudentId = createdStudent?.id ?? null
    }
  }

  const { data: testResult, error } = await supabase
    .from("student_test_results")
    .insert({
      parent_id: input.parentId,
      student_id: resolvedStudentId,
      grade: input.grade,
      subject: input.subject,
      test_name: input.testName,
      difficulty: input.difficulty,
      score: input.score,
      total_questions: input.totalQuestions,
      percentage: input.percentage,
      completed_at: input.completedAt,
    })
    .select("id")
    .single()

  if (error) {
    throw error
  }

  const qualifiesForCertificate =
    input.percentage >= 80 && input.totalQuestions >= 40

  if (qualifiesForCertificate) {
    const { error: certificateError } = await supabase
      .from("certificates")
      .insert({
        parent_id: input.parentId,
        student_id: resolvedStudentId,
        test_result_id: testResult.id,
        grade: input.grade,
        student_name: resolvedStudentName,
        subject: input.subject,
        test_name: input.testName,
        score: input.score,
        total_questions: input.totalQuestions,
        percentage: input.percentage,
        issued_at: input.completedAt,
      })

    if (certificateError) {
      throw certificateError
    }
  }
}
