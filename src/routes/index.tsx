import { createFileRoute, Link } from "@tanstack/react-router";
import { FAMILIES, REGISTRY } from "@/lib/ds/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSViz — Data Structures Visualizer & C Code Generator" },
      {
        name: "description",
        content:
          "Interactive visualizer for queues, stacks, lists, trees, hashing, graphs, sorting and searching. Step through operations, watch state machines, export C code.",
      },
      { property: "og:title", content: "DSViz — Data Structures Visualizer" },
      {
        property: "og:description",
        content:
          "Visualize every step of every data-structure operation and export ready-to-compile C.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[var(--hl-peek)] font-semibold">
              KPRIET DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--hl-peek)] mt-1 opacity-60">
              dsviz.exe
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Data Structures Visualizer &amp; C Code Generator
            </h1>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            v0.1 · step-by-step · state-machine driven
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pick a structure. Configure capacity, type values, run operations one
          step at a time, watch the state machine transition, and export a
          ready-to-compile C program.
        </p>

        <div className="mt-10 space-y-10">
          {FAMILIES.map((family) => {
            const items = REGISTRY.filter((e) => e.family === family);
            return (
              <section key={family}>
                <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[var(--hl-insert)]">
                  {family}
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((entry) => {
                    const ready = entry.slug === "linear-queue" || entry.slug === "circular-queue" || entry.slug === "stack";
                    const cls = "block rounded-lg border p-4 transition-colors border-border bg-card hover:border-[var(--hl-peek)] hover:shadow-[0_0_24px_var(--hl-peek)]/20";
                    const inner = (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {entry.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                              ready
                                ? "bg-[var(--hl-peek)]/15 text-[var(--hl-peek)]"
                                : "bg-[var(--hl-insert)]/15 text-[var(--hl-insert)]"
                            }`}
                          >
                            {ready ? "ready" : "playground"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {entry.blurb}
                        </p>
                      </>
                    );
                    return (
                      <li key={entry.slug}>
                        <Link
                          to="/ds/$slug"
                          params={{ slug: entry.slug }}
                          className={cls}
                        >
                          {inner}
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

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] text-muted-foreground">
          // Highlights: amber = insert, red = delete, cyan = peek/search.
          Speeds: 700 / 350 / 100 ms.
        </div>
      </footer>
    </div>
  );
}
