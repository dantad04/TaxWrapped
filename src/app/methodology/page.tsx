import Link from "next/link";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#f8f4ea] px-5 py-8 text-[#162016] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.16em]">
          Australian Budget Wrapped
        </Link>
        <section className="space-y-4 border-2 border-[#162016] bg-white p-6 shadow-[6px_6px_0_#162016]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f6f50]">
            Placeholder
          </p>
          <h1 className="text-4xl font-black">Methodology</h1>
          <p className="text-lg leading-8 text-[#31402f]">
            This page will explain the tax estimate, proportional allocation
            method, assumptions, and limits in a future ticket.
          </p>
          <p className="font-semibold">
            This is an illustrative estimate. Taxes are not hypothecated.
          </p>
        </section>
      </div>
    </main>
  );
}
