"use client"
import { useAuth } from "@/contexts/auth-context"
export function LearnerSelector() {
  const { user, students, selectedStudentId, selectStudent } = useAuth()
  if (!user) return null
  return <div className="mx-auto max-w-5xl px-4 py-3">
    <label className="font-semibold" htmlFor="assessment-student">Student </label>
    <select id="assessment-student" className="rounded border border-slate-400 bg-white p-2 text-slate-900 focus:outline-blue-700"
      value={selectedStudentId || ""} onChange={event => selectStudent(event.target.value)}>
      <option value="">Choose a student</option>
      {students.map(student => <option key={student.id} value={student.id}>{student.fullName}</option>)}
    </select>
    <p className="mt-1 text-sm text-slate-700">Choose the student before starting. An assessment stays with the student chosen at its start.</p>
  </div>
}
