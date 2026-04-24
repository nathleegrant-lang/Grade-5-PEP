import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#0a3d4e] text-white py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <Image
          src="/images/logo.png"
          alt="Grade 5 PEP Logo"
          width={48}
          height={48}
          className="w-12 h-12 mx-auto mb-4"
        />
        <p className="text-teal-200 mb-2">
          Grade 5 PEP Practice - Supporting Jamaica&apos;s Primary Exit Profile Preparation
        </p>
        <p className="text-teal-300 text-sm">
          Aligned with the National Standards Curriculum (NSC)
        </p>
      </div>
    </footer>
  )
}
