"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Certificate {
  id: string;
  parent_id: string;
  student_name: string;
  subject: string;
  test_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  certificate_title: string;
  issued_at: string;
}

export default function CertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("parent_id", user.id)
          .order("issued_at", { ascending: false });

        if (error) throw error;
        setCertificates(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load certificates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { label: "Outstanding", color: "#b8860b" };
    if (percentage >= 80) return { label: "Excellent", color: "#2e7d32" };
    if (percentage >= 70) return { label: "Very Good", color: "#1565c0" };
    if (percentage >= 60) return { label: "Good", color: "#6a1b9a" };
    return { label: "Satisfactory", color: "#c62828" };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-amber-800 font-serif text-lg">Loading certificates…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 px-4">
        {/* Page Header */}
        <div className="max-w-5xl mx-auto mb-10 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-amber-900 tracking-tight">
                My Certificates
              </h1>
              <p className="text-amber-700 mt-1 text-sm">
                {certificates.length === 0
                  ? "No certificates earned yet."
                  : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} earned`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-amber-700 text-amber-800 font-semibold text-sm hover:bg-amber-100 transition-colors"
              >
                ← Back to Dashboard
              </button>
              {certificates.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition-colors shadow-md"
                >
                  🖨 Print / Download
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Print-only header */}
        <div className="hidden print:block text-center mb-8">
          <p className="text-sm text-gray-500">Shazonique's Inspiration — Grade 5 PEP Parent Portal</p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-24 print:hidden">
            <div className="text-6xl mb-4">🏅</div>
            <h2 className="text-xl font-serif font-semibold text-amber-900 mb-2">
              No Certificates Yet
            </h2>
            <p className="text-amber-700 text-sm">
              Complete tests in the portal to earn certificates of achievement.
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12 print:space-y-16">
            {certificates.map((cert, index) => {
              const grade = getGrade(cert.percentage);
              return (
                <div
                  key={cert.id}
                  className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200 print:shadow-none print:border print:break-inside-avoid print:page-break-inside-avoid"
                  style={{ pageBreakInside: "avoid" }}
                >
                  {/* Top decorative band */}
                  <div
                    className="h-3 w-full"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, #b8860b 0px, #b8860b 20px, #d4a017 20px, #d4a017 40px, #8b6914 40px, #8b6914 60px)",
                    }}
                  />

                  {/* Watermark */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                  >
                    <span
                      className="text-9xl font-black tracking-widest text-amber-100 rotate-[-30deg] opacity-30"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      AWARD
                    </span>
                  </div>

                  {/* Certificate Body */}
                  <div className="relative z-10 px-10 py-10 sm:px-16 sm:py-14">
                    {/* Brand & Title */}
                    <div className="text-center mb-8">
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold mb-1">
                        Shazonique's Inspiration
                      </p>
                      <div className="flex items-center justify-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-600" />
                        <span className="text-amber-500 text-lg">✦</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400 to-amber-600" />
                      </div>
                      <h2
                        className="text-4xl sm:text-5xl font-bold text-amber-900 leading-tight"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {cert.certificate_title || "Certificate of Achievement"}
                      </h2>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-amber-600" />
                        <span className="text-amber-500 text-lg">✦</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400 to-amber-600" />
                      </div>
                    </div>

                    {/* Awarded To */}
                    <div className="text-center mb-8">
                      <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                        This certificate is proudly awarded to
                      </p>
                      <p
                        className="text-4xl sm:text-5xl text-amber-800 font-semibold"
                        style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif" }}
                      >
                        {cert.student_name}
                      </p>
                      <p className="text-sm text-gray-400 mt-2 italic">Grade 5 Student</p>
                    </div>

                    {/* Performance Statement */}
                    <div className="text-center mb-8 max-w-2xl mx-auto">
                      <p className="text-base text-gray-600 leading-relaxed">
                        For demonstrating{" "}
                        <span className="font-semibold text-amber-800" style={{ color: grade.color }}>
                          {grade.label}
                        </span>{" "}
                        performance in
                      </p>
                      <p
                        className="text-xl font-semibold text-gray-800 mt-1"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {cert.subject} — {cert.test_name}
                      </p>
                    </div>

                    {/* Score Badge */}
                    <div className="flex justify-center mb-8">
                      <div
                        className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 shadow-lg"
                        style={{
                          borderColor: grade.color,
                          boxShadow: `0 0 0 4px #fff, 0 0 0 6px ${grade.color}22`,
                        }}
                      >
                        <span
                          className="text-4xl font-black leading-none"
                          style={{ color: grade.color, fontFamily: "Georgia, serif" }}
                        >
                          {cert.percentage}%
                        </span>
                        <span className="text-xs text-gray-500 mt-1 tracking-widest uppercase">
                          Score
                        </span>
                        <span className="text-sm font-semibold text-gray-700 mt-0.5">
                          {cert.score}/{cert.total_questions}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6 max-w-lg mx-auto">
                      <div className="flex-1 h-px bg-amber-200" />
                      <span className="text-amber-400 text-sm">✦ ✦ ✦</span>
                      <div className="flex-1 h-px bg-amber-200" />
                    </div>

                    {/* Footer Meta */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-2xl mx-auto text-center">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                          Date Issued
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDate(cert.issued_at)}
                        </p>
                      </div>

                      {/* Seal */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-inner border-4"
                          style={{
                            background: `radial-gradient(circle, ${grade.color}22, ${grade.color}44)`,
                            borderColor: grade.color,
                          }}
                        >
                          🏆
                        </div>
                        <p className="text-xs text-gray-400 mt-1 italic">Official Seal</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                          Certificate ID
                        </p>
                        <p className="text-xs font-mono text-gray-500">
                          #{cert.id.toString().slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom decorative band */}
                  <div
                    className="h-3 w-full"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, #8b6914 0px, #8b6914 20px, #d4a017 20px, #d4a017 40px, #b8860b 40px, #b8860b 60px)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Print-only footer note */}
        <div className="hidden print:block text-center mt-12">
          <p className="text-xs text-gray-400">
            Printed from Shazonique's Inspiration — Grade 5 PEP Parent Portal
          </p>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}
