import { createFileRoute, Link } from "@tanstack/react-router";
import { FAMILIES, REGISTRY } from "@/lib/ds/registry";
import { ArrowLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/learning/dsa")({
  head: () => ({
    meta: [
      { title: "Learning Portal — DSA Visualizer" },
      { name: "description", content: "Learn basic data structures step-by-step with interactive visualizations and C code generation." }
    ]
  }),
  component: LearningDSA,
});

function LearningDSA() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--hl-peek)] font-semibold">
                KPRIET DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
              </div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 mt-0.5">
                <BookOpen className="h-5 w-5 text-[var(--hl-peek)]" />
                DSA Learning Portal
              </h1>
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            dsviz.exe // learning
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Select a fundamental data structure to visualize its memory slots, interact with operations, trace pointers, and generate ready-to-run C source code.
        </p>

        <div className="mt-8 space-y-10">
          {FAMILIES.map((family) => {
            const items = REGISTRY.filter((e) => e.family === family);
            return (
              <section key={family} className="animate-slide-up">
                <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-[var(--hl-insert)] font-bold">
                  {family}
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((entry) => {
                    const ready = entry.slug === "linear-queue" || entry.slug === "circular-queue" || entry.slug === "stack";
                    const cls = "block rounded-lg border p-5 transition-all duration-300 border-border bg-card hover:border-[var(--hl-peek)] hover:shadow-[0_0_24px_var(--hl-peek)]/10 hover:-translate-y-0.5 group";
                    return (
                      <li key={entry.slug}>
                        <Link
                          to="/ds/$slug"
                          params={{ slug: entry.slug }}
                          className={cls}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-semibold text-foreground group-hover:text-[var(--hl-peek)] transition-colors">
                              {entry.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                                ready
                                  ? "bg-[var(--hl-peek)]/15 text-[var(--hl-peek)]"
                                  : "bg-[var(--hl-insert)]/15 text-[var(--hl-insert)]"
                              }`}
                            >
                              {ready ? "ready" : "playground"}
                            </span>
                          </div>
                          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                            {entry.blurb}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] text-muted-foreground flex justify-between">
          <span>// Highlights: amber = insert, red = delete, cyan = peek/search.</span>
          <span>KPRIET CSE</span>
        </div>
      </footer>
    </div>
  );
}
