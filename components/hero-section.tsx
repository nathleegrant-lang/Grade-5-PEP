import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#123b6d] via-[#174f8f] to-[#2563b8] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-sky-200">
            PEP PRACTICE — Grade 5
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Develop skills. Increase challenge. Grow independence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sky-50 md:text-xl">
            Strengthen learning, build confidence and prepare for PEP through purposeful Grade 5 practice.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/mock-tests">
              <Button className="bg-amber-400 px-6 text-[#102f57] hover:bg-amber-300">
                Start Practice
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white bg-white/5 px-6 text-white hover:bg-white hover:text-[#123b6d]">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm font-medium text-sky-100">
            Start where your child is. Progress as they grow.
          </p>
        </div>
      </div>
    </section>
  )
}
