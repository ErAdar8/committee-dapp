export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="space-y-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome to Crypto Street
        </h1>

       <p className="text-lg text-slate-700 max-w-2xl mx-auto">

          A place built by people who chose to question the way the world works —
          and decided to do something about it.
        </p>
      </section>

      {/* Story Section */}
      <section className="space-y-4 max-w-3xl mx-auto text-center">
        <p className="text-slate-700">
          For years, decisions were made behind closed doors.  
          Promises were repeated, broken, and repeated again.  
          Power stayed centralized, while responsibility disappeared.
        </p>

        <p className="text-slate-700 ">
          Eventually, people understood something important:  
          the system wasn’t failing — it was functioning exactly as designed.
        </p>

        <p className="text-slate-700">
          So they stopped waiting for change.  
          They gathered, chose cooperation over control,
          and started building a different reality together.
        </p>

        <p className="text-slate-700">
          Not a country. Not a corporation.  
          A street.
        </p>
      </section>

      {/* Principles Intro */}
      <section className="pt-6 text-center">
        <p className="text-sm uppercase tracking-widest font-semibold text-slate-600">
          These are the guiding principles of the street
        </p>
      </section>

      {/* Concept Section */}
      <section className="grid md:grid-cols-3 gap-6 pt-2">
       <div className="rounded-xl border bg-white/60 backdrop-blur p-5">

  <h3 className="font-semibold mb-2 text-blue-800">
    Transparency
  </h3>
  <p className="text-sm text-blue-700">
    Decisions are public by default.  
    Anyone can verify what happened and why.
  </p>
</div>


      <div className="rounded-xl border bg-white/60 backdrop-blur p-5">

  <h3 className="font-semibold mb-2 text-purple-800">
    Decentralization
  </h3>
  <p className="text-sm text-purple-700">
    No politicians. No intermediaries.  
    Authority belongs to the people who live here.
  </p>
</div>


     <div className="rounded-xl border bg-white/60 backdrop-blur p-5">

  <h3 className="font-semibold mb-2 text-emerald-800">
    Code Over Promises
  </h3>
  <p className="text-sm text-emerald-700">
    Rules are enforced by code.  
    What is written is what executes.
  </p>
</div>

      </section>

      {/* Call to Action */}
      <section className="pt-6 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-slate-600 mb-2">
            Some people choose to join.  
            Others prefer to observe and learn.
          </p>
          <a
            href="/committees/list"
            className="inline-flex items-center rounded-lg px-5 py-2
                       bg-blue-50 text-blue-700 border border-blue-200
                       hover:bg-blue-100 transition text-sm font-medium"
          >
            Enter Crypto Street →
          </a>
        </div>
      </section>
    </div>
  );
}
