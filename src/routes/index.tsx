import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FlaskConical, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSViz — Data Structures Visualizer & C Code Generator" },
      {
        name: "description",
        content:
          "Interactive visualizer and playground for Data Structures and Real-World Experiments with automatic C code export.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="border-b border-border bg-card/30 backdrop-blur">
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
            v1.0 · step-by-step · dynamic animations
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 flex-1 flex flex-col justify-center items-center w-full">
        <div className="text-center max-w-xl mb-12">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Welcome to the interactive DS &amp; Algorithms platform. Choose to either learn step-by-step visualizations of core data structures or run interactive systems programming experiments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Option 1: Learning */}
          <Link
            to="/learning/dsa"
            className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-8 flex flex-col justify-between hover:border-[var(--hl-peek)] hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 text-[var(--hl-peek)]">
              <BookOpen className="h-32 w-32" />
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--hl-peek)]/10 text-[var(--hl-peek)]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Learning Portal</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step-by-step visualizers for basic data structures including Arrays, Linked Lists, Stacks, and Queues. View memory slots, trace pointers, and generate C code.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-mono text-xs text-[var(--hl-peek)] font-semibold">
              <span>EXPLORE TOPICS</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>

          {/* Option 2: Experiments */}
          <Link
            to="/experiments"
            className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-8 flex flex-col justify-between hover:border-[var(--hl-insert)] hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 text-[var(--hl-insert)]">
              <FlaskConical className="h-32 w-32" />
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--hl-insert)]/10 text-[var(--hl-insert)]">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Experiments Lab</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hands-on simulations of 10 real-world applications of data structures: music playlists, browser histories, Dijkstra shortest path, Prim's trees, hashing books, and sorting.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-mono text-xs text-[var(--hl-insert)] font-semibold">
              <span>LAUNCH LABS</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border bg-card/10">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>// Highlights: amber = insert, red = delete, cyan = peek/search.</span>
          <span>KPRIET Department of CSE</span>
        </div>
      </footer>
    </div>
  );
}
