import Link from "next/link";
import type { ReactNode } from "react";

interface TransparencyPageShellProps {
  eyebrow: string;
  title: string;
  deck: string;
  tone: "blue" | "green" | "magenta" | "red";
  posterWord: string;
  children: ReactNode;
}

interface TransparencySectionProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}

export function TransparencyPageShell({
  eyebrow,
  title,
  deck,
  tone,
  posterWord,
  children,
}: TransparencyPageShellProps) {
  return (
    <main className={`transparency-shell transparency-tone-${tone}`}>
      <div className="transparency-frame">
        <div aria-hidden="true" className="transparency-lines" />
        <div aria-hidden="true" className="transparency-slab" />
        <div aria-hidden="true" className="transparency-poster-word">
          {posterWord}
        </div>

        <nav className="transparency-nav" aria-label="Transparency navigation">
          <Link href="/">Back to wrap</Link>
          <Link href="/methodology">Method</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>

        <header className="transparency-hero">
          <p className="transparency-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{deck}</p>
        </header>

        <div className="transparency-content">{children}</div>
      </div>
    </main>
  );
}

export function TransparencySection({
  eyebrow,
  title,
  children,
}: TransparencySectionProps) {
  return (
    <section className="transparency-panel">
      {eyebrow && <p className="transparency-panel-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <div className="transparency-prose">{children}</div>
    </section>
  );
}

export function TransparencyCallout({ children }: { children: ReactNode }) {
  return <aside className="transparency-callout">{children}</aside>;
}
