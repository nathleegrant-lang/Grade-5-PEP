export function SubjectCards() {
  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
          Start Practicing
        </h3>
        <p className="text-gray-600">
          Choose a subject below to begin your review and online practice.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link key={subject.title} href={subject.href}>
            <Card className="h-full cursor-pointer border border-white/70 bg-white/90 transition-all hover:border-[#0d4a5f] hover:shadow-lg">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-lg ${subject.iconBg} flex items-center justify-center mb-4`}
                >
                  <subject.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-[#0d4a5f] mb-2">
                  {subject.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {subject.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
