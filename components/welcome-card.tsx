import { Card, CardContent } from "@/components/ui/card"

export function WelcomeCard() {
  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
          Welcome to Grade 5 PEP!
        </h3>
        <p className="text-gray-600 leading-relaxed">
          This website is designed to support students and parents with engaging practice activities in
          <strong> Language Arts (Literacy)</strong> and <strong>Mathematics (Numeracy)</strong>. 
          Grade 5 students will also explore <strong>Science</strong> and <strong>Social Studies</strong> concepts 
          aligned with the National Standards Curriculum. Each section offers opportunities to review concepts, 
          strengthen skills, and prepare with confidence for the PEP examination.
        </p>
      </CardContent>
    </Card>
  )
}
