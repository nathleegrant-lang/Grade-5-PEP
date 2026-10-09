import { submitAssessmentResult } from "@/lib/assessment-result-handler"
export const POST = (request: Request) => submitAssessmentResult(request)
