import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { grade5Visual } from "@/components/grade5-visual-system"

export function WelcomeCard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={`h-full overflow-hidden rounded-3xl ${grade5Visual.whiteSurface}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image src="/images/grade5-student-practice.jpg" alt="Grade 5 learner practising independently with a laptop and notebook" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-blue-700/25 to-transparent" />
        </div>
        <CardContent className="p-7 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">For Students</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Practise with growing independence</h3>
          <p className="mt-3 leading-relaxed text-slate-600">Review what you are learning at school, challenge yourself across Grade 5 subjects, learn from your results and build confidence for the PEP journey.</p>
          <Link href="/mock-tests" className="mt-5 inline-block"><Button className={`font-bold ${grade5Visual.primaryButton}`}>Start Practice</Button></Link>
        </CardContent>
      </Card>

      <Card className={`h-full overflow-hidden rounded-3xl ${grade5Visual.whiteSurface}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image src="/images/grade5-parent-support.jpg" alt="Parent supporting a Grade 5 learner who is actively working on a laptop" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-emerald-500/25 to-transparent" />
        </div>
        <CardContent className="p-7 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">For Parents</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Support learning and appropriate challenge</h3>
          <p className="mt-3 leading-relaxed text-slate-600">Strengthen what your child is learning at school, encourage regular purposeful practice and use the progress information already available to support confidence and growth.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard"><Button className="bg-emerald-600 font-bold text-white hover:bg-emerald-700">View Dashboard</Button></Link><Link href="/pricing"><Button variant="outline" className="border-blue-200 bg-white font-bold text-blue-700 hover:bg-blue-50">View Pricing</Button></Link></div>
        </CardContent>
      </Card>
    </div>
  )
}
