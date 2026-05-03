import Image from "next/image"
import Link from "next/link"

import { VisitorCounter } from "@/components/visitor-counter"

const GRADE_4_URL = "https://grade-4-pep.vercel.app/"
const SUPPORT_EMAIL = "shazincorps@gmail.com"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="rounded-2xl bg-black/80 p-3 shadow-lg ring-1 ring-white/10">
              <Image
                src="/images/shazoniques-inspiration-logo.png"
                alt="Shazonique's Inspiration logo"
                width={300}
                height={140}
                className="h-auto w-[220px] sm:w-[260px]"
                priority
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Managed and owned by Shazonique&apos;s Inspiration
              </p>
              <p className="mt-1 text-sm text-slate-300">
                A heart&apos;s home of hope
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Grade 5 PEP</p>
              <p className="mt-1 text-sm text-slate-300">
                Jamaica Primary Exit Profile preparation support
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Explore Other Grades
              </p>

              <a
                href={GRADE_4_URL}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 text-center"
              >
                Visit Grade 4 PEP
              </a>

              <button
                type="button"
                disabled
                className="block w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed border border-slate-700"
              >
                Grade 6 PEP — Coming Soon
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Parent Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Support
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                For Grade 5 PEP support and payment confirmation, please email your
                receipt along with your child&apos;s name and subject to:
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-block font-medium text-sky-300 hover:text-sky-200 transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>

              <p className="text-xs text-slate-400">
                Each grade programme is sold separately.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-slate-400 space-y-2">
          <p>© {new Date().getFullYear()} Grade 5 PEP. All rights reserved.</p>
          <VisitorCounter />
        </div>
      </div>
    </footer>
  )
}
