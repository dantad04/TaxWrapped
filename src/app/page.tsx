import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f4ea] text-[#162016]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <nav
          aria-label="Primary"
          className="flex items-center justify-between gap-4 border-b border-[#162016]/20 pb-4 text-sm font-semibold"
        >
          <Link href="/" className="tracking-[0.18em] uppercase">
            ABW
          </Link>
          <div className="flex gap-3 text-xs sm:text-sm">
            <Link href="/methodology">Methodology</Link>
            <Link href="/sources">Sources</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </nav>

        <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <p className="inline-flex border border-[#162016] bg-[#f1c84b] px-3 py-1 text-xs font-bold tracking-[0.16em] uppercase">
              Commonwealth tax estimate
            </p>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] sm:text-7xl">
                Your Australian Budget Wrapped
              </h1>
              <p className="max-w-2xl text-xl font-medium leading-8 text-[#31402f]">
                Estimate how your Commonwealth tax maps across Australian
                Government spending.
              </p>
            </div>
            <Link
              href="/methodology"
              className="inline-flex min-h-12 items-center justify-center border-2 border-[#162016] bg-[#1f6f50] px-7 text-base font-bold text-white shadow-[5px_5px_0_#162016] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#f1c84b]"
            >
              Start
            </Link>
          </div>

          <div
            aria-hidden="true"
            className="grid aspect-square max-w-sm grid-cols-2 grid-rows-2 gap-3 justify-self-center sm:max-w-md"
          >
            <div className="border-2 border-[#162016] bg-[#f1c84b]" />
            <div className="border-2 border-[#162016] bg-[#ef6f53]" />
            <div className="border-2 border-[#162016] bg-[#1f6f50]" />
            <div className="border-2 border-[#162016] bg-[#d9e4d0]" />
          </div>
        </div>

        <p className="border-t border-[#162016]/20 pt-4 text-sm font-semibold text-[#31402f]">
          This is an estimate. Taxes are not hypothecated.
        </p>
      </section>
    </main>
  );
}
