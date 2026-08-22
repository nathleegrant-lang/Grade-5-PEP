import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#102f57] via-[#0d5665] to-[#0d7c78] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-9 md:grid-cols-[1.05fr_0.95fr] md:py-11">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">
            PEP PRACTICE — Grade 5
          </p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-[3.45rem]">
            <span className="block text-white">Develop skills.</span>
            <span className="block text-[#ffc928]">Increase challenge.</span>
            <span className="block text-[#ffc928]">Grow independence.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cyan-50 md:text-lg">
            Strengthen learning, build confidence and prepare for PEP through purposeful Grade 5 practice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/mock-tests">
              <Button className="bg-[#ffc107] px-7 font-semibold text-[#102f57] hover:bg-[#ffd04a]">
                Start Practice
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white bg-white/5 px-7 text-white hover:bg-white hover:text-[#102f57]">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-cyan-50">
            Start where your child is. Progress as they grow.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border-4 border-white/30 bg-white/10 shadow-2xl">
          <Image
            src="/images/student_withworksheet.jpg"
            alt="Grade 5 learner practising independently using digital learning resources"
            width={900}
            height={650}
            className="h-[300px] w-full object-cover sm:h-[340px] md:h-[360px]"
            priority
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102f57]/85 via-[#102f57]/30 to-transparent px-5 pb-4 pt-16">
            <p className="text-sm font-semibold text-white">Purposeful practice. Growing independence.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
