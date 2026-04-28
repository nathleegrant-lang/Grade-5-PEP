import { Suspense } from "react"
import RegisterSuccessPageClient from "./register-success-page-client"

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <p className="text-slate-600 text-sm">
            Loading account success page...
          </p>
        </div>
      }
    >
      <RegisterSuccessPageClient />
    </Suspense>
  )
}
