type GenericRow = Record<string, unknown>

export const getString = (row: GenericRow, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return fallback
}

export const getId = (row: GenericRow, keys: string[], fallbackPrefix: string, index: number) =>
  getString(row, keys) || `${fallbackPrefix}-${index}`

export const normalizeName = (value: string) => value.trim().toLowerCase()

export function resolveResultStudentMatch(
  result: GenericRow,
  studentsById: Map<string, GenericRow>,
  studentsByNameAndParent: Map<string, string>,
): { matchedStudentId: string; matchedParentId: string; matchedStudentName: string } | null {
  const studentId = getString(result, ["student_id"])
  const parentId = getString(result, ["parent_id"])
  const studentName = getString(result, ["student_name", "full_name", "name", "student", "learner_name"])

  if (studentId && studentsById.has(studentId)) {
    const student = studentsById.get(studentId) || {}
    return {
      matchedStudentId: studentId,
      matchedParentId: parentId || getString(student, ["parent_id"]),
      matchedStudentName: getString(student, ["full_name", "name", "student_name"], studentName),
    }
  }

  if (parentId && studentName) {
    const byParentAndName = studentsByNameAndParent.get(`${parentId}::${normalizeName(studentName)}`)
    if (byParentAndName) {
      return { matchedStudentId: byParentAndName, matchedParentId: parentId, matchedStudentName: studentName }
    }
  }

  if (studentName) {
    for (const [key, sid] of studentsByNameAndParent.entries()) {
      const [, existingName] = key.split("::")
      if (existingName === normalizeName(studentName)) {
        const student = studentsById.get(sid) || {}
        return {
          matchedStudentId: sid,
          matchedParentId: parentId || getString(student, ["parent_id"]),
          matchedStudentName: studentName,
        }
      }
    }
  }

  return null
}

