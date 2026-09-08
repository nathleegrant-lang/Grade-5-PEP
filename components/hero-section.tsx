import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Grade5EnergyBackdrop, grade5Visual } from "@/components/grade5-visual-system"

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-white">
      <Grade5EnergyBackdrop />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-yellow-300 sm:text-sm">
            PEP PRACTICE — Grade 5
          </p>
          <h1 className="text-4xl font-black leading-[1.04] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
            <span className="block text-white">Develop skills.</span>
            <span className="block text-yellow-300">Increase challenge.</span>
            <span className="block text-yellow-300">Grow independence.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/95 md:text-lg">
            Strengthen learning, build confidence and prepare for PEP through purposeful Grade 5 practice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/mock-tests">
              <Button className={`px-7 font-bold shadow-lg shadow-blue-950/10 ${grade5Visual.goldButton}`}>
                Start Practice
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white bg-white px-7 font-bold text-blue-700 shadow-lg shadow-blue-950/10 hover:bg-blue-50 hover:text-blue-800">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-white/90">
            Start where your child is. Progress as they grow.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border-4 border-white/70 bg-white shadow-2xl shadow-blue-950/20">
          <Image
            src="/images/student_withworksheet.jpg"
            alt="Grade 5 learner practising independently using digital learning resources"
            width={900}
            height={650}
            className="h-[300px] w-full object-cover sm:h-[340px] md:h-[360px]"
            priority
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent px-5 pb-4 pt-16">
            <p className="text-sm font-semibold text-white">Purposeful practice. Growing independence.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
