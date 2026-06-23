import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { BookOpen, Code, Play, Pause, RotateCcw } from "lucide-react";
import { getEntry, REGISTRY } from "@/lib/ds/registry";

// Structures & Codegen
import { useLinearQueue } from "@/lib/ds/structures/linear-queue";
import { linearQueueC } from "@/lib/ds/codegen/linear-queue";

import { useStack } from "@/lib/ds/structures/stack";
import { stackC } from "@/lib/ds/codegen/stack";

import { useCircularQueue } from "@/lib/ds/structures/circular-queue";
import { circularQueueC } from "@/lib/ds/codegen/circular-queue";

import { SPEED_MS, usePersistentState, type Speed, sleep } from "@/lib/ds/engine";
import {
  CodeExportPanel,
  ComplexityPanel,
  ConfigPanel,
  HighlightedCells,
  AddressTablePanel,
  InputPanel,
  OperationsPanel,
  StatusBar,
  VariableMonitor,
  type InputField,
  type InputState,
} from "@/components/visualizer/Panels";

export function useSimulationControls(initialDelay = 1800, onResetCallback?: () => void) {
  const [iterationCount, setIterationCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [delayMs, setDelayMs] = useState(initialDelay);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.onStepTriggered = () => {
          setIterationCount(controls.iterationCount);
          setElapsedTime(controls.elapsedTime);
          setAnimating(controls.animating || false);
        };
        controls.delayMs = delayMs;
      }
    }
  }, [delayMs]);

  const startOperation = useCallback(() => {
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.iterationCount = 0;
        controls.elapsedTime = 0;
        controls.isPaused = false;
        controls.animating = true;
        controls.simulationId = (controls.simulationId || 0) + 1;
        setAnimating(true);
      }
    }
    setIsPaused(false);
    setIterationCount(0);
    setElapsedTime(0);
  }, []);

  const handlePause = useCallback(() => {
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.isPaused = true;
        setIsPaused(true);
      }
    }
  }, []);

  const handleResume = useCallback(() => {
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.isPaused = false;
        setIsPaused(false);
        controls.pauseResolver?.();
      }
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.isPaused = false;
        setIsPaused(false);
        controls.pauseResolver?.();
        controls.iterationCount = 0;
        controls.elapsedTime = 0;
        controls.animating = false;
        controls.simulationId = (controls.simulationId || 0) + 1;
        setAnimating(false);
      }
    }
    setIterationCount(0);
    setElapsedTime(0);
    if (onResetCallback) {
      onResetCallback();
    }
  }, [onResetCallback]);

  const handleDelayChange = useCallback((val: number) => {
    setDelayMs(val);
    if (typeof window !== "undefined") {
      const controls = (window as any).__simControls;
      if (controls) {
        controls.delayMs = val;
      }
    }
  }, []);

  return {
    iterationCount,
    elapsedTime,
    isPaused,
    delayMs,
    animating,
    startOperation,
    handlePause,
    handleResume,
    handleRestart,
    handleDelayChange,
  };
}

export function SimulationControlToolbar({
  iterationCount,
  elapsedTime,
  isPaused,
  delayMs,
  animating,
  onPause,
  onResume,
  onRestart,
  onDelayChange,
}: {
  iterationCount: number;
  elapsedTime: number;
  isPaused: boolean;
  delayMs: number;
  animating: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onDelayChange: (ms: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border bg-card/60 backdrop-blur rounded-xl shadow-sm mb-4 animate-fade-in">
      {/* Left: Metrics */}
      <div className="flex items-center gap-6 font-mono text-xs text-foreground">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Iterations:</span>
          <span className="font-extrabold text-[var(--hl-peek)] text-sm">{iterationCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Iteration Time:</span>
          <span className="font-extrabold text-[var(--hl-insert)] text-sm">{elapsedTime} ms</span>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center gap-2">
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 shadow transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Continue</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            disabled={!animating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30 shadow transition-all cursor-pointer"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}
        
        <button
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs font-bold hover:bg-accent transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Right: Speed Slider */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">Speed Delay:</span>
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={delayMs}
          onChange={(e) => onDelayChange(Number(e.target.value))}
          className="flex-1 sm:w-32 accent-[var(--hl-peek)] cursor-pointer h-1.5 bg-border rounded-lg appearance-none"
        />
        <span className="font-mono text-xs text-muted-foreground min-w-[50px] text-right font-semibold">{delayMs}ms</span>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/ds/$slug")({
  head: ({ params }) => {
    const entry = getEntry(params.slug);
    const title = entry ? `${entry.name} — DSViz` : "DSViz";
    const desc = entry
      ? `Visualize ${entry.name} step-by-step, watch the state machine, and export C code.`
      : "Data Structures Visualizer";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const entry = getEntry(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-sm bg-background text-foreground font-mono">
      <Link to="/" className="text-[var(--hl-peek)] underline">
        ← Back to all structures
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="p-6 font-mono text-sm bg-background text-foreground">
      <p className="text-[var(--hl-delete)]">Error: {error.message}</p>
      <button onClick={reset} className="mt-2 underline">
        Retry
      </button>
    </div>
  ),
  component: VisualizerPage,
});

// Common empty state for input panels
const emptyInput: InputState = {
  value: "",
  index: "",
  priority: "",
  position: "",
  searchKey: "",
  deleteKey: "",
  updateValue: "",
  randomN: "5",
};

function VisualizerPage() {
  const { entry } = Route.useLoaderData() as any;

  if (entry.slug === "linear-queue") {
    return <LinearQueueVisualizer key={entry.slug} entry={entry} />;
  }
  if (entry.slug === "circular-queue") {
    return <CircularQueueVisualizer key={entry.slug} entry={entry} />;
  }
  if (entry.slug === "stack") {
    return <StackVisualizer key={entry.slug} entry={entry} />;
  }
  return <PlaygroundVisualizer key={entry.slug} entry={entry} />;
}

/* ==========================================
   Header Dropdown Component
   ========================================== */
function VisualizerHeader({ 
  title, 
  family, 
  slug,
  onToggleCode,
  codeOpen
}: { 
  title: string; 
  family: string; 
  slug: string;
  onToggleCode?: () => void;
  codeOpen?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← dsviz
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--hl-peek)]">
            {family}
          </span>
          <span className="text-muted-foreground">/</span>
          <select
            value={slug}
            onChange={(e) => {
              navigate({ to: "/ds/$slug", params: { slug: e.target.value } });
            }}
            className="bg-transparent border border-border rounded px-2.5 py-0.5 text-xs text-foreground font-mono font-medium focus:ring-0 focus:outline-none focus:border-[var(--hl-peek)] cursor-pointer"
          >
            {REGISTRY.map((r) => (
              <option key={r.slug} value={r.slug} className="bg-card text-foreground">
                {r.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          {onToggleCode && (
            <button
              onClick={onToggleCode}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border font-mono text-[10px] font-bold transition-all uppercase tracking-wider ${
                codeOpen
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:bg-accent hover:border-foreground"
              }`}
            >
              <Code size={12} />
              <span>{codeOpen ? "Hide C Code" : "Show C Code"}</span>
            </button>
          )}
          
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
            KPRIET DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING <span className="opacity-50 mx-2">|</span> Interactive C Generator
          </span>
        </div>
      </div>
    </header>
  );
}

/* ==========================================
   1. LINEAR QUEUE VISUALIZER
   ========================================== */
function getLinearQueueHighlightedLines(message: string): number[] {
  const msg = message.toLowerCase();
  if (msg.includes("capacity set to") || msg.includes("initialized")) {
    return [7, 9, 10, 11];
  }
  if (msg.includes("overflow") || (msg.includes("enqueue") && msg.includes("step 1"))) {
    return [25];
  }
  if (msg.includes("step 2") && msg.includes("front = 0")) {
    return [26];
  }
  if (msg.includes("step 3") || msg.includes("step 4") || msg.includes("queue[")) {
    return [27];
  }
  if (msg.includes("enqueued")) {
    return [28, 29];
  }
  if (msg.includes("underflow") || (msg.includes("dequeue") && msg.includes("is_empty()"))) {
    return [33];
  }
  if (msg.includes("step 1") && msg.includes("read queue")) {
    return [34];
  }
  if (msg.includes("step 2") && (msg.includes("clear") || msg.includes("front++") || msg.includes("front=rear=-1"))) {
    return [35, 36];
  }
  if (msg.includes("dequeued")) {
    return [37, 38];
  }
  if (msg.includes("peek")) {
    return [41, 42, 43];
  }
  if (msg.includes("compare queue") || msg.includes("search")) {
    return [47, 48, 49];
  }
  if (msg.includes("display")) {
    return [52, 53, 54, 55, 56];
  }
  return [];
}

function getLinearQueueTeacherExplanation(message: string): { code: string; tip: string } | null {
  const msg = message.toLowerCase();
  if (msg.includes("check is_full()")) {
    return {
      code: "if (is_full())",
      tip: "Check for overflow: In an array-based queue, we can only insert if the rear pointer has not reached CAPACITY - 1."
    };
  }
  if (msg.includes("queue empty, set front = 0")) {
    return {
      code: "if (is_empty()) front = 0;",
      tip: "Initialization: For the very first element inserted, set the front pointer to 0 so it points to the start of the queue."
    };
  }
  if (msg.includes("rear++")) {
    return {
      code: "queue[++rear] = value;",
      tip: "Increment rear: Move the rear pointer to the next slot where the value will be stored."
    };
  }
  if (msg.includes("queue[") && msg.includes("] =")) {
    return {
      code: "queue[++rear] = value;",
      tip: "Insertion: Assign the value to the element in the array at the rear pointer index."
    };
  }
  if (msg.includes("enqueued")) {
    return {
      code: "state = is_full() ? Q_FULL : Q_PARTIALLY_FILLED;",
      tip: "Finished: Enqueue operation completed successfully. The queue state has been updated accordingly."
    };
  }
  if (msg.includes("overflow")) {
    return {
      code: "if (is_full()) { printf(\"Overflow\\n\"); return; }",
      tip: "Overflow: The rear pointer has reached CAPACITY - 1. We cannot enqueue more values. This is a limitation of linear queues."
    };
  }
  if (msg.includes("underflow")) {
    return {
      code: "if (is_empty()) { printf(\"Underflow\\n\"); return -1; }",
      tip: "Underflow: The queue is completely empty (front is -1). We cannot remove any elements."
    };
  }
  if (msg.includes("read queue")) {
    return {
      code: "int v = queue[front];",
      tip: "FIFO Rule: We always remove the element that has been in the queue the longest, located at the front index."
    };
  }
  if (msg.includes("clear queue")) {
    return {
      code: "queue[front] = 0; // conceptually empty",
      tip: "Clear slot: Empty the cell at the front index."
    };
  }
  if (msg.includes("front=rear=-1")) {
    return {
      code: "front = rear = -1;",
      tip: "Reset: The queue is now completely empty. We reset both pointers to -1 so the next insertion starts at index 0."
    };
  }
  if (msg.includes("front++")) {
    return {
      code: "front++;",
      tip: "Shift front: Move the front pointer one step to the right to point to the next element in line."
    };
  }
  if (msg.includes("dequeued")) {
    return {
      code: "return v; // return element",
      tip: "Finished: Dequeue operation completed successfully. The front pointer has advanced."
    };
  }
  if (msg.includes("peek")) {
    return {
      code: "return queue[front];",
      tip: "Peek: Read the front element without removing it. If the queue is empty, return -1."
    };
  }
  if (msg.includes("compare queue")) {
    return {
      code: "if (queue[i] == key)",
      tip: "Linear Search: Iterating through each active slot from front to rear to check if it matches the key."
    };
  }
  return null;
}

function LinearQueueVisualizer({ entry }: { entry: any }) {
  const [pendingCapacity, setPendingCapacity] = useState(10);
  const [maxCapacity, setMaxCapacity] = useState(32);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(false);
  const [input, setInput] = useState<InputState>(emptyInput);

  const q = useLinearQueue({
    initialCapacity: 10,
    speed,
    stepMode,
  });

  const sim = useSimulationControls(1800, () => q.reset());

  const onChange = (k: InputField, v: string) =>
    setInput((s) => ({ ...s, [k]: v }));

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const code = useMemo(() => linearQueueC(q.capacity), [q.capacity]);
  const highlightedLines = useMemo(() => getLinearQueueHighlightedLines(q.message), [q.message]);
  const teacherExp = useMemo(() => getLinearQueueTeacherExplanation(q.message), [q.message]);
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <VisualizerHeader 
        title={entry.name} 
        family={entry.family} 
        slug={entry.slug} 
        onToggleCode={() => setCodeOpen(!codeOpen)}
        codeOpen={codeOpen}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={q.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => {
              q.setCapacity(pendingCapacity);
              sim.handleRestart();
            }}
            maxCapacity={maxCapacity}
            onMaxCapacity={setMaxCapacity}
            speed={speed}
            onSpeed={setSpeed}
            autoPlay={autoPlay}
            onAutoPlay={setAutoPlay}
            stepMode={stepMode}
            onStepMode={setStepMode}
            animating={q.animating}
          />
          <InputPanel
            state={input}
            onChange={onChange}
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 25" },
              { key: "searchKey", label: "Search Key" },
              { key: "randomN", label: "Random N" },
            ]}
          />
          <OperationsPanel
            actions={[
              {
                key: "enqueue",
                label: "Enqueue",
                onClick: () => {
                  const v = num(input.value);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  q.enqueue(v);
                  setInput((s) => ({ ...s, value: "" }));
                },
                disabled: q.animating || input.value === "",
              },
              {
                key: "dequeue",
                label: "Dequeue",
                tone: "danger",
                onClick: () => {
                  sim.startOperation();
                  q.dequeue();
                },
                disabled: q.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  q.peek();
                },
                disabled: q.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  q.search(v);
                },
                disabled: q.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  q.display();
                },
                disabled: q.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  sim.startOperation();
                  q.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: q.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => {
                  sim.handleRestart();
                },
                disabled: q.animating,
              },
            ]}
          />
          <AddressTablePanel
            slots={q.slots}
            layout="linear-queue"
            front={q.front}
            rear={q.rear}
          />
        </aside>

        <section className="space-y-3">
          <SimulationControlToolbar
            iterationCount={sim.iterationCount}
            elapsedTime={sim.elapsedTime}
            isPaused={sim.isPaused}
            delayMs={sim.delayMs}
            animating={q.animating}
            onPause={sim.handlePause}
            onResume={sim.handleResume}
            onRestart={sim.handleRestart}
            onDelayChange={sim.handleDelayChange}
          />
          <StatusBar
            message={q.message}
            state={q.state}
            stepPending={q.stepPending}
            onStep={q.nextStep}
          />
          <div className="rounded-lg border border-border bg-card p-4">
            <HighlightedCells
              slots={q.slots}
              front={q.front}
              rear={q.rear}
              highlight={q.highlight}
            />
          </div>

          {teacherExp && (
            <div className="rounded-lg border border-[var(--hl-peek)]/30 bg-[var(--hl-peek)]/5 p-3 flex items-start gap-3 transition-all duration-300 animate-slide-down shadow-sm">
              <div className="rounded bg-[var(--hl-peek)]/15 p-1.5 text-[var(--hl-peek)] shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--hl-peek)] font-mono">
                    C Code Trace
                  </span>
                  <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-border text-[11px] font-semibold text-foreground font-mono">
                    {teacherExp.code}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {teacherExp.tip}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <VariableMonitor
              compact
              vars={[
                { name: "front", value: q.front, accent: "front" },
                { name: "rear", value: q.rear, accent: "rear" },
                {
                  name: "size",
                  value: q.front === -1 ? 0 : q.rear - q.front + 1,
                },
                { name: "capacity", value: q.capacity },
                { name: "is_empty()", value: q.front === -1 ? "true" : "false" },
                {
                  name: "is_full()",
                  value: q.rear === q.capacity - 1 ? "true" : "false",
                },
              ]}
            />
            <ComplexityPanel
              compact
              rows={[
                { op: "enqueue", time: "O(1)", space: "O(1)" },
                { op: "dequeue", time: "O(1)", space: "O(1)" },
                { op: "peek", time: "O(1)", space: "O(1)" },
                { op: "search", time: "O(n)", space: "O(1)" },
                { op: "storage", time: "—", space: "O(n)" },
              ]}
            />
          </div>
          <CodeExportPanel
            code={code}
            filename="linear_queue.c"
            highlightedLines={highlightedLines}
            onCodeChange={(newCode) => {
              const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
              if (match) {
                const cap = parseInt(match[1], 10);
                if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== q.capacity) {
                  q.setCapacity(cap);
                  setPendingCapacity(cap);
                }
              }
            }}
          />
        </section>
      </main>

      {codeOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col p-4 pt-16 animate-slide-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="font-mono text-xs uppercase font-bold text-muted-foreground">C Implementation Code</h3>
            <button 
              onClick={() => setCodeOpen(false)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodeExportPanel
              code={code}
              filename="linear_queue.c"
              highlightedLines={highlightedLines}
              onCodeChange={(newCode) => {
                const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
                if (match) {
                  const cap = parseInt(match[1], 10);
                  if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== q.capacity) {
                    q.setCapacity(cap);
                    setPendingCapacity(cap);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   2. CIRCULAR QUEUE VISUALIZER
   ========================================== */
function getCircularQueueHighlightedLines(message: string): number[] {
  const msg = message.toLowerCase();
  if (msg.includes("capacity set to") || msg.includes("initialized")) {
    return [7, 9, 10, 11];
  }
  if (msg.includes("overflow") || (msg.includes("enqueue") && msg.includes("step 1"))) {
    return [30];
  }
  if (msg.includes("step 2") && msg.includes("empty")) {
    return [31, 32];
  }
  if (msg.includes("step 2") && msg.includes("rear = (rear + 1)")) {
    return [33, 34];
  }
  if (msg.includes("step 3") || msg.includes("queue[")) {
    return [35];
  }
  if (msg.includes("enqueued")) {
    return [36, 37];
  }
  if (msg.includes("underflow") || (msg.includes("dequeue") && msg.includes("is_empty()"))) {
    return [41];
  }
  if (msg.includes("step 1") && msg.includes("read queue")) {
    return [42];
  }
  if (msg.includes("step 2") && msg.includes("clear queue")) {
    return [42];
  }
  if (msg.includes("front=rear=-1")) {
    return [44, 45];
  }
  if (msg.includes("front = (front + 1)")) {
    return [47, 48];
  }
  if (msg.includes("dequeued")) {
    return [50];
  }
  if (msg.includes("peek")) {
    return [53, 54, 55];
  }
  if (msg.includes("compare queue") || msg.includes("search")) {
    return [58, 59, 60, 61, 62, 63];
  }
  if (msg.includes("display")) {
    return [66, 67, 68, 70, 71, 72];
  }
  return [];
}

function getCircularQueueTeacherExplanation(message: string): { code: string; tip: string } | null {
  const msg = message.toLowerCase();
  if (msg.includes("check is_full()")) {
    return {
      code: "if (front != -1 && (rear + 1) % CAPACITY == front)",
      tip: "Overflow check: In a circular queue, the slot after rear wraps around. If it equals front, the queue is full."
    };
  }
  if (msg.includes("empty, set front = rear = 0")) {
    return {
      code: "front = rear = 0;",
      tip: "Initialization: Inserting the first element set both front and rear pointers to index 0."
    };
  }
  if (msg.includes("rear = (rear + 1) % capacity")) {
    return {
      code: "rear = (rear + 1) % CAPACITY;",
      tip: "Wrap-around: rear wraps around to index 0 if it reaches CAPACITY - 1, reusing freed spaces."
    };
  }
  if (msg.includes("queue[") && msg.includes("] =")) {
    return {
      code: "queue[rear] = value;",
      tip: "Insertion: Assign the enqueued value to the slot at the current rear index."
    };
  }
  if (msg.includes("underflow")) {
    return {
      code: "if (is_empty()) { printf(\"Underflow\\n\"); return -1; }",
      tip: "Underflow: Circular queue is empty (front == -1), so no elements can be dequeued."
    };
  }
  if (msg.includes("read queue")) {
    return {
      code: "int v = queue[front];",
      tip: "FIFO Rule: Retrieve the value at the front index."
    };
  }
  if (msg.includes("front=rear=-1")) {
    return {
      code: "front = rear = -1;",
      tip: "Empty reset: The queue is now empty. Reset both pointers to -1."
    };
  }
  if (msg.includes("front = (front + 1) % capacity")) {
    return {
      code: "front = (front + 1) % CAPACITY;",
      tip: "Shift front: The front pointer wraps around to reuse previous slots."
    };
  }
  return null;
}

function CircularQueueVisualizer({ entry }: { entry: any }) {
  const [pendingCapacity, setPendingCapacity] = useState(8);
  const [maxCapacity, setMaxCapacity] = useState(32);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(false);
  const [input, setInput] = useState<InputState>(emptyInput);

  const q = useCircularQueue({
    initialCapacity: 8,
    speed,
    stepMode,
  });

  const sim = useSimulationControls(1800, () => q.reset());

  const onChange = (k: InputField, v: string) =>
    setInput((s) => ({ ...s, [k]: v }));

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const code = useMemo(() => circularQueueC(q.capacity), [q.capacity]);
  const highlightedLines = useMemo(() => getCircularQueueHighlightedLines(q.message), [q.message]);
  const teacherExp = useMemo(() => getCircularQueueTeacherExplanation(q.message), [q.message]);

  const size = useMemo(() => {
    if (q.front === -1) return 0;
    if (q.rear >= q.front) return q.rear - q.front + 1;
    return q.capacity - (q.front - q.rear - 1);
  }, [q.front, q.rear, q.capacity]);

  const isFull = useMemo(() => {
    return q.front !== -1 && (q.rear + 1) % q.capacity === q.front;
  }, [q.front, q.rear, q.capacity]);

  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <VisualizerHeader 
        title={entry.name} 
        family={entry.family} 
        slug={entry.slug} 
        onToggleCode={() => setCodeOpen(!codeOpen)}
        codeOpen={codeOpen}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={q.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => {
              q.setCapacity(pendingCapacity);
              sim.handleRestart();
            }}
            maxCapacity={maxCapacity}
            onMaxCapacity={setMaxCapacity}
            speed={speed}
            onSpeed={setSpeed}
            autoPlay={autoPlay}
            onAutoPlay={setAutoPlay}
            stepMode={stepMode}
            onStepMode={setStepMode}
            animating={q.animating}
          />
          <InputPanel
            state={input}
            onChange={onChange}
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 17" },
              { key: "searchKey", label: "Search Key" },
              { key: "randomN", label: "Random N" },
            ]}
          />
          <OperationsPanel
            actions={[
              {
                key: "enqueue",
                label: "Enqueue",
                onClick: () => {
                  const v = num(input.value);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  q.enqueue(v);
                  setInput((s) => ({ ...s, value: "" }));
                },
                disabled: q.animating || input.value === "",
              },
              {
                key: "dequeue",
                label: "Dequeue",
                tone: "danger",
                onClick: () => {
                  sim.startOperation();
                  q.dequeue();
                },
                disabled: q.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  q.peek();
                },
                disabled: q.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  q.search(v);
                },
                disabled: q.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  q.display();
                },
                disabled: q.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  sim.startOperation();
                  q.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: q.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => {
                  sim.handleRestart();
                },
                disabled: q.animating,
              },
            ]}
          />
          <AddressTablePanel
            slots={q.slots}
            layout="circular"
            front={q.front}
            rear={q.rear}
          />
        </aside>

        <section className="space-y-3">
          <SimulationControlToolbar
            iterationCount={sim.iterationCount}
            elapsedTime={sim.elapsedTime}
            isPaused={sim.isPaused}
            delayMs={sim.delayMs}
            animating={q.animating}
            onPause={sim.handlePause}
            onResume={sim.handleResume}
            onRestart={sim.handleRestart}
            onDelayChange={sim.handleDelayChange}
          />
          <StatusBar
            message={q.message}
            state={q.state}
            stepPending={q.stepPending}
            onStep={q.nextStep}
          />
          <div className="rounded-lg border border-border bg-card p-4">
            <HighlightedCells
              slots={q.slots}
              front={q.front}
              rear={q.rear}
              highlight={q.highlight}
              layout="circular"
            />
          </div>

          {teacherExp && (
            <div className="rounded-lg border border-[var(--hl-peek)]/30 bg-[var(--hl-peek)]/5 p-3 flex items-start gap-3 transition-all duration-300 animate-slide-down shadow-sm">
              <div className="rounded bg-[var(--hl-peek)]/15 p-1.5 text-[var(--hl-peek)] shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--hl-peek)] font-mono">
                    C Code Trace
                  </span>
                  <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-border text-[11px] font-semibold text-foreground font-mono">
                    {teacherExp.code}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {teacherExp.tip}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <VariableMonitor
              compact
              vars={[
                { name: "front", value: q.front, accent: "front" },
                { name: "rear", value: q.rear, accent: "rear" },
                { name: "size", value: size },
                { name: "capacity", value: q.capacity },
                { name: "is_empty()", value: q.front === -1 ? "true" : "false" },
                { name: "is_full()", value: isFull ? "true" : "false" },
              ]}
            />
            <ComplexityPanel
              compact
              rows={[
                { op: "enqueue", time: "O(1)", space: "O(1)" },
                { op: "dequeue", time: "O(1)", space: "O(1)" },
                { op: "peek", time: "O(1)", space: "O(1)" },
                { op: "search", time: "O(n)", space: "O(1)" },
                { op: "storage", time: "—", space: "O(n)" },
              ]}
            />
          </div>
          <CodeExportPanel
            code={code}
            filename="circular_queue.c"
            highlightedLines={highlightedLines}
            onCodeChange={(newCode) => {
              const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
              if (match) {
                const cap = parseInt(match[1], 10);
                if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== q.capacity) {
                  q.setCapacity(cap);
                  setPendingCapacity(cap);
                }
              }
            }}
          />
        </section>
      </main>

      {codeOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col p-4 pt-16 animate-slide-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="font-mono text-xs uppercase font-bold text-muted-foreground">C Implementation Code</h3>
            <button 
              onClick={() => setCodeOpen(false)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodeExportPanel
              code={code}
              filename="circular_queue.c"
              highlightedLines={highlightedLines}
              onCodeChange={(newCode) => {
                const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
                if (match) {
                  const cap = parseInt(match[1], 10);
                  if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== q.capacity) {
                    q.setCapacity(cap);
                    setPendingCapacity(cap);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   3. SIMPLE STACK VISUALIZER
   ========================================== */
function getStackHighlightedLines(message: string): number[] {
  const msg = message.toLowerCase();
  if (msg.includes("capacity set to") || msg.includes("initialized")) {
    return [6, 8, 9];
  }
  if (msg.includes("overflow") || (msg.includes("push") && msg.includes("step 1"))) {
    return [22];
  }
  if (msg.includes("step 2") && msg.includes("top++")) {
    return [23];
  }
  if (msg.includes("step 3") || msg.includes("stack[")) {
    return [23];
  }
  if (msg.includes("pushed")) {
    return [24, 25];
  }
  if (msg.includes("underflow") || (msg.includes("pop") && msg.includes("is_empty()"))) {
    return [29];
  }
  if (msg.includes("step 1") && msg.includes("read stack")) {
    return [30];
  }
  if (msg.includes("step 2") && msg.includes("clear stack")) {
    return [30];
  }
  if (msg.includes("popped")) {
    return [30, 31, 32];
  }
  if (msg.includes("peek")) {
    return [36, 37];
  }
  if (msg.includes("compare stack") || msg.includes("search")) {
    return [41, 42];
  }
  if (msg.includes("display")) {
    return [46, 47, 48, 49];
  }
  return [];
}

function getStackTeacherExplanation(message: string): { code: string; tip: string } | null {
  const msg = message.toLowerCase();
  if (msg.includes("check is_full()")) {
    return {
      code: "if (is_full())",
      tip: "Overflow check: In an array-based stack, we can only push if top has not reached CAPACITY - 1."
    };
  }
  if (msg.includes("top++")) {
    return {
      code: "stack[++top] = value;",
      tip: "Increment top: Move the top pointer up to the next available index."
    };
  }
  if (msg.includes("stack[") && msg.includes("] =")) {
    return {
      code: "stack[++top] = value;",
      tip: "Push: Store the element in the array at the new top index."
    };
  }
  if (msg.includes("pushed")) {
    return {
      code: "state = is_full() ? S_FULL : S_PARTIALLY_FILLED;",
      tip: "Finished: Push operation completed successfully. The stack has grown."
    };
  }
  if (msg.includes("overflow")) {
    return {
      code: "if (is_full()) { printf(\"Overflow\\n\"); return; }",
      tip: "Overflow: The stack is full (top == CAPACITY - 1). Cannot push more elements."
    };
  }
  if (msg.includes("underflow")) {
    return {
      code: "if (is_empty()) { printf(\"Underflow\\n\"); return -1; }",
      tip: "Underflow: The stack is empty (top == -1). Cannot pop any elements."
    };
  }
  if (msg.includes("read stack")) {
    return {
      code: "int v = stack[top--];",
      tip: "LIFO Rule: We always remove the element most recently added, which is located at the top index."
    };
  }
  if (msg.includes("popped")) {
    return {
      code: "int v = stack[top--];",
      tip: "Pop and decrement: Retrieve the top element, then decrement the top pointer."
    };
  }
  if (msg.includes("peek")) {
    return {
      code: "return stack[top];",
      tip: "Peek: Read the top element without removing it. If the stack is empty, return -1."
    };
  }
  if (msg.includes("compare stack")) {
    return {
      code: "if (stack[i] == key)",
      tip: "Stack Search: Searching down from top to bottom index to find a matching key."
    };
  }
  return null;
}

function StackVisualizer({ entry }: { entry: any }) {
  const [pendingCapacity, setPendingCapacity] = useState(10);
  const [maxCapacity, setMaxCapacity] = useState(32);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(false);
  const [input, setInput] = useState<InputState>(emptyInput);

  const s = useStack({
    initialCapacity: 10,
    speed,
    stepMode,
  });

  const sim = useSimulationControls(1800, () => s.reset());

  const onChange = (k: InputField, v: string) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const num = (valStr: string) => {
    const n = Number(valStr);
    return Number.isFinite(n) ? n : NaN;
  };

  const code = useMemo(() => stackC(s.capacity), [s.capacity]);
  const highlightedLines = useMemo(() => getStackHighlightedLines(s.message), [s.message]);
  const teacherExp = useMemo(() => getStackTeacherExplanation(s.message), [s.message]);

  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <VisualizerHeader 
        title={entry.name} 
        family={entry.family} 
        slug={entry.slug} 
        onToggleCode={() => setCodeOpen(!codeOpen)}
        codeOpen={codeOpen}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={s.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => {
              s.setCapacity(pendingCapacity);
              sim.handleRestart();
            }}
            maxCapacity={maxCapacity}
            onMaxCapacity={setMaxCapacity}
            speed={speed}
            onSpeed={setSpeed}
            autoPlay={autoPlay}
            onAutoPlay={setAutoPlay}
            stepMode={stepMode}
            onStepMode={setStepMode}
            animating={s.animating}
          />
          <InputPanel
            state={input}
            onChange={onChange}
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 42" },
              { key: "searchKey", label: "Search Key" },
              { key: "randomN", label: "Random N" },
            ]}
          />
          <OperationsPanel
            actions={[
              {
                key: "push",
                label: "Push",
                onClick: () => {
                  const v = num(input.value);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  s.push(v);
                  setInput((prev) => ({ ...prev, value: "" }));
                },
                disabled: s.animating || input.value === "",
              },
              {
                key: "pop",
                label: "Pop",
                tone: "danger",
                onClick: () => {
                  sim.startOperation();
                  s.pop();
                },
                disabled: s.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  s.peek();
                },
                disabled: s.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  sim.startOperation();
                  s.search(v);
                },
                disabled: s.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => {
                  sim.startOperation();
                  s.display();
                },
                disabled: s.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  sim.startOperation();
                  s.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: s.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => {
                  sim.handleRestart();
                },
                disabled: s.animating,
              },
            ]}
          />
          <AddressTablePanel
            slots={s.slots}
            layout="stack"
            top={s.top}
          />
        </aside>

        <section className="space-y-3">
          <SimulationControlToolbar
            iterationCount={sim.iterationCount}
            elapsedTime={sim.elapsedTime}
            isPaused={sim.isPaused}
            delayMs={sim.delayMs}
            animating={s.animating}
            onPause={sim.handlePause}
            onResume={sim.handleResume}
            onRestart={sim.handleRestart}
            onDelayChange={sim.handleDelayChange}
          />
          <StatusBar
            message={s.message}
            state={s.state}
            stepPending={s.stepPending}
            onStep={s.nextStep}
          />
          <div className="rounded-lg border border-border bg-card p-4">
            <HighlightedCells
              slots={s.slots}
              top={s.top}
              highlight={s.highlight}
              layout="stack"
            />
          </div>

          {teacherExp && (
            <div className="rounded-lg border border-[var(--hl-peek)]/30 bg-[var(--hl-peek)]/5 p-3 flex items-start gap-3 transition-all duration-300 animate-slide-down shadow-sm">
              <div className="rounded bg-[var(--hl-peek)]/15 p-1.5 text-[var(--hl-peek)] shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--hl-peek)] font-mono">
                    C Code Trace
                  </span>
                  <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-border text-[11px] font-semibold text-foreground font-mono">
                    {teacherExp.code}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {teacherExp.tip}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <VariableMonitor
              compact
              vars={[
                { name: "top", value: s.top, accent: "rear" },
                { name: "size", value: s.top + 1 },
                { name: "capacity", value: s.capacity },
                { name: "is_empty()", value: s.top === -1 ? "true" : "false" },
                {
                  name: "is_full()",
                  value: s.top === s.capacity - 1 ? "true" : "false",
                },
              ]}
            />
            <ComplexityPanel
              compact
              rows={[
                { op: "push", time: "O(1)", space: "O(1)" },
                { op: "pop", time: "O(1)", space: "O(1)" },
                { op: "peek", time: "O(1)", space: "O(1)" },
                { op: "search", time: "O(n)", space: "O(1)" },
                { op: "storage", time: "—", space: "O(n)" },
              ]}
            />
          </div>
          <CodeExportPanel
            code={code}
            filename="stack.c"
            highlightedLines={highlightedLines}
            onCodeChange={(newCode) => {
              const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
              if (match) {
                const cap = parseInt(match[1], 10);
                if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== s.capacity) {
                  s.setCapacity(cap);
                  setPendingCapacity(cap);
                }
              }
            }}
          />
        </section>
      </main>

      {codeOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col p-4 pt-16 animate-slide-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="font-mono text-xs uppercase font-bold text-muted-foreground">C Implementation Code</h3>
            <button 
              onClick={() => setCodeOpen(false)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodeExportPanel
              code={code}
              filename="stack.c"
              highlightedLines={highlightedLines}
              onCodeChange={(newCode) => {
                const match = newCode.match(/#define\s+CAPACITY\s+(\d+)/);
                if (match) {
                  const cap = parseInt(match[1], 10);
                  if (!isNaN(cap) && cap >= 1 && cap <= 64 && cap !== s.capacity) {
                    s.setCapacity(cap);
                    setPendingCapacity(cap);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   4. PLAYGROUND VISUALIZER (FALLBACK FOR ALL OTHERS)
   ========================================== */
function PlaygroundVisualizer({ entry }: { entry: any }) {
  const [capacity, setCapacity] = usePersistentState(`pg-capacity-${entry.slug}`, 8);
  const [pendingCapacity, setPendingCapacity] = useState(8);
  const [maxCapacity, setMaxCapacity] = useState(32);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(false);
  const [input, setInput] = useState<InputState>(emptyInput);

  // Local interactive slot state
  const [slots, setSlots] = usePersistentState<{ id: number; value: number | null }[]>(`pg-slots-${entry.slug}`, () =>
    Array.from({ length: 8 }, (_, i) => ({ id: i, value: null }))
  );
  const [highlight, setHighlight] = useState<{ index: number; kind: "insert" | "delete" | "peek" } | null>(null);
  const [message, setMessage] = usePersistentState(`pg-message-${entry.slug}`, `Interactive Playground initialized for ${entry.name}`);
  const [animating, setAnimating] = useState(false);

  const sim = useSimulationControls(1800, () => {
    setSlots(Array.from({ length: capacity }, (_, i) => ({ id: i, value: null })));
    setMessage("Playground cleared.");
    setHighlight(null);
  });

  const onChange = (k: InputField, v: string) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const activeCount = slots.filter((s) => s.value !== null).length;
  const items = useMemo(() => slots.map((s) => s.value).filter((v): v is number => v !== null), [slots]);

  const code = useMemo(() => {
    const valuesStr = items.map((x) => String(x)).join(", ");

    if (entry.slug === "singly-linked-list") {
      return `// C Implementation of Singly Linked List
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

// Global head pointer
struct Node* head = NULL;

// Helper to create a new node
struct Node* create_node(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (!newNode) {
        printf("Memory allocation failed\\n");
        exit(1);
    }
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

// Insert at the beginning of the list
void insert_first(int value) {
    struct Node* newNode = create_node(value);
    newNode->next = head;
    head = newNode;
    printf("Inserted %d at head\\n", value);
}

// Insert at the end of the list
void insert_end(int value) {
    struct Node* newNode = create_node(value);
    if (head == NULL) {
        head = newNode;
        printf("Inserted %d as head\\n", value);
        return;
    }
    struct Node* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = newNode;
    printf("Inserted %d at end\\n", value);
}

// Delete the first node
void delete_first() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    head = head->next;
    printf("Deleted head node with value %d\\n", temp->data);
    free(temp);
}

// Delete the last node
void delete_end() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    if (head->next == NULL) {
        printf("Deleted only node with value %d\\n", head->data);
        free(head);
        head = NULL;
        return;
    }
    struct Node* temp = head;
    while (temp->next->next != NULL) {
        temp = temp->next;
    }
    printf("Deleted end node with value %d\\n", temp->next->data);
    free(temp->next);
    temp->next = NULL;
}

// Print the linked list
void print_list() {
    struct Node* temp = head;
    printf("List: ");
    while (temp != NULL) {
        printf("%d -> ", temp->data);
        temp = temp->next;
    }
    printf("NULL\\n");
}

int main(void) {
    // Current visualized elements:
    ${items.length === 0 ? "// List is currently empty" : items.map(v => `insert_end(${v});`).join("\n    ")}
    
    print_list();
    return 0;
}
`;
    }

    if (entry.slug === "doubly-linked-list") {
      return `// C Implementation of Doubly Linked List
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* prev;
    struct Node* next;
};

// Global head and tail pointers
struct Node* head = NULL; // front pointer
struct Node* tail = NULL; // rear pointer

struct Node* create_node(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (!newNode) {
        printf("Memory allocation failed\\n");
        exit(1);
    }
    newNode->data = value;
    newNode->prev = NULL;
    newNode->next = NULL;
    return newNode;
}

void insert_first(int value) {
    struct Node* newNode = create_node(value);
    newNode->next = head;
    if (head != NULL) {
        head->prev = newNode;
    } else {
        tail = newNode;
    }
    head = newNode;
    printf("Inserted %d at head/front\\n", value);
}

void insert_end(int value) {
    struct Node* newNode = create_node(value);
    newNode->prev = tail;
    if (tail != NULL) {
        tail->next = newNode;
    } else {
        head = newNode;
    }
    tail = newNode;
    printf("Inserted %d at tail/rear\\n", value);
}

void delete_first() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    head = head->next;
    if (head != NULL) {
        head->prev = NULL;
    } else {
        tail = NULL;
    }
    printf("Deleted front node with value %d\\n", temp->data);
    free(temp);
}

void delete_end() {
    if (tail == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = tail;
    tail = tail->prev;
    if (tail != NULL) {
        tail->next = NULL;
    } else {
        head = NULL;
    }
    printf("Deleted rear node with value %d\\n", temp->data);
    free(temp);
}

void print_list() {
    struct Node* temp = head;
    printf("List (Forward): NULL <-> ");
    while (temp != NULL) {
        printf("%d <-> ", temp->data);
        temp = temp->next;
    }
    printf("NULL\\n");
}

int main(void) {
    // Current visualized elements:
    ${items.length === 0 ? "// List is currently empty" : items.map(v => `insert_end(${v});`).join("\n    ")}
    
    print_list();
    return 0;
}
`;
    }

    if (entry.slug === "circular-singly-list") {
      return `// C Implementation of Circular Singly Linked List
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

struct Node* head = NULL;

struct Node* create_node(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (!newNode) {
        printf("Memory allocation failed\\n");
        exit(1);
    }
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

void insert_first(int value) {
    struct Node* newNode = create_node(value);
    if (head == NULL) {
        head = newNode;
        newNode->next = head;
    } else {
        struct Node* temp = head;
        while (temp->next != head) {
            temp = temp->next;
        }
        newNode->next = head;
        temp->next = newNode;
        head = newNode;
    }
    printf("Inserted %d at circular head\\n", value);
}

void insert_end(int value) {
    struct Node* newNode = create_node(value);
    if (head == NULL) {
        head = newNode;
        newNode->next = head;
    } else {
        struct Node* temp = head;
        while (temp->next != head) {
            temp = temp->next;
        }
        temp->next = newNode;
        newNode->next = head;
    }
    printf("Inserted %d at circular end\\n", value);
}

void delete_first() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    if (head->next == head) {
        free(head);
        head = NULL;
    } else {
        struct Node* last = head;
        while (last->next != head) {
            last = last->next;
        }
        head = head->next;
        last->next = head;
        free(temp);
    }
    printf("Deleted circular head\\n");
}

void delete_end() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    if (head->next == head) {
        free(head);
        head = NULL;
    } else {
        struct Node* prev = NULL;
        while (temp->next != head) {
            prev = temp;
            temp = temp->next;
        }
        prev->next = head;
        free(temp);
    }
    printf("Deleted circular end\\n");
}

void print_list() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    printf("List (Circular): ");
    do {
        printf("%d -> ", temp->data);
        temp = temp->next;
    } while (temp != head);
    printf("(back to head: %d)\\n", head->data);
}

int main(void) {
    // Current visualized elements:
    ${items.length === 0 ? "// List is currently empty" : items.map(v => `insert_end(${v});`).join("\n    ")}
    
    print_list();
    return 0;
}
`;
    }

    if (entry.slug === "circular-doubly-list") {
      return `// C Implementation of Circular Doubly Linked List
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* prev;
    struct Node* next;
};

struct Node* head = NULL; // Head / front pointer

struct Node* create_node(int value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    if (!newNode) {
        printf("Memory allocation failed\\n");
        exit(1);
    }
    newNode->data = value;
    newNode->prev = NULL;
    newNode->next = NULL;
    return newNode;
}

void insert_first(int value) {
    struct Node* newNode = create_node(value);
    if (head == NULL) {
        head = newNode;
        newNode->next = head;
        newNode->prev = head;
    } else {
        struct Node* last = head->prev;
        newNode->next = head;
        newNode->prev = last;
        last->next = newNode;
        head->prev = newNode;
        head = newNode;
    }
    printf("Inserted %d at circular front\\n", value);
}

void insert_end(int value) {
    struct Node* newNode = create_node(value);
    if (head == NULL) {
        head = newNode;
        newNode->next = head;
        newNode->prev = head;
    } else {
        struct Node* last = head->prev;
        newNode->next = head;
        newNode->prev = last;
        last->next = newNode;
        head->prev = newNode;
    }
    printf("Inserted %d at circular rear\\n", value);
}

void delete_first() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    if (head->next == head) {
        free(head);
        head = NULL;
    } else {
        struct Node* last = head->prev;
        head = head->next;
        head->prev = last;
        last->next = head;
        free(temp);
    }
    printf("Deleted circular front node\\n");
}

void delete_end() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* last = head->prev;
    if (head->next == head) {
        free(head);
        head = NULL;
    } else {
        struct Node* secondLast = last->prev;
        secondLast->next = head;
        head->prev = secondLast;
        free(last);
    }
    printf("Deleted circular rear node\\n");
}

void print_list() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }
    struct Node* temp = head;
    printf("List (Circular Doubly): ");
    do {
        printf("%d <-> ", temp->data);
        temp = temp->next;
    } while (temp != head);
    printf("(loops back)\\n");
}

int main(void) {
    // Current visualized elements:
    ${items.length === 0 ? "// List is currently empty" : items.map(v => `insert_end(${v});`).join("\n    ")}
    
    print_list();
    return 0;
}
`;
    }

    if (entry.slug === "dynamic-array") {
      return `// C Implementation of Dynamic Array (std::vector style)
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

int* data = NULL;
int count = 0;
int capacity = ${capacity};

void init_array() {
    data = (int*)malloc(capacity * sizeof(int));
    if (!data) {
        printf("Initialization failed\\n");
        exit(1);
    }
}

void resize() {
    int old_cap = capacity;
    capacity *= 2; // Double capacity
    data = (int*)realloc(data, capacity * sizeof(int));
    if (!data) {
        printf("Reallocation failed\\n");
        exit(1);
    }
    printf("Resized array from %d to %d slots\\n", old_cap, capacity);
}

void insert_end(int value) {
    if (count >= capacity) {
        resize();
    }
    data[count++] = value;
    printf("Appended %d to dynamic array\\n", value);
}

void delete_end() {
    if (count == 0) {
        printf("Array is empty\\n");
        return;
    }
    count--;
    printf("Removed last element\\n");
}

int main(void) {
    init_array();
    
    // Current visualized elements:
    ${items.length === 0 ? "// Array is currently empty" : items.map(v => `insert_end(${v});`).join("\n    ")}
    
    printf("Size: %d, Capacity: %d\\n", count, capacity);
    free(data);
    return 0;
}
`;
    }

    if (entry.slug === "binary-search") {
      return `// C Implementation of Binary Search
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

#define CAPACITY ${capacity}

int data[CAPACITY] = {${valuesStr}};
int count = ${items.length};

// Binary Search function
int binary_search(int key) {
    int low = 0;
    int high = count - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (data[mid] == key) {
            return mid; // Found key at mid
        }
        if (data[mid] < key) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1; // Key not found
}

void insert_sorted(int value) {
    if (count >= CAPACITY) {
        printf("Error: Array is full\\n");
        return;
    }
    // Check sorted order
    if (count > 0 && value < data[count - 1]) {
        printf("Error: Values must be sorted. Insertion rejected.\\n");
        return;
    }
    data[count++] = value;
    printf("Inserted %d at end (retains sorted order)\\n", value);
}

int main(void) {
    printf("Array elements: ");
    for (int i = 0; i < count; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");

    int key = 25; // Search example
    int index = binary_search(key);
    if (index != -1) {
        printf("Key %d found at index %d\\n", key, index);
    } else {
        printf("Key %d not found in the array\\n", key);
    }
    return 0;
}
`;
    }

    if (entry.slug === "linear-search") {
      return `// C Implementation of Linear Search
// Generated for ${entry.name}
#include <stdio.h>
#include <stdlib.h>

#define CAPACITY ${capacity}

int data[CAPACITY] = {${valuesStr}};
int count = ${items.length};

// Linear Search function
int linear_search(int key) {
    for (int i = 0; i < count; i++) {
        if (data[i] == key) {
            return i; // Found key at index i
        }
    }
    return -1; // Key not found
}

void insert_element(int value) {
    if (count >= CAPACITY) {
        printf("Error: Array is full\\n");
        return;
    }
    data[count++] = value;
    printf("Inserted %d at index %d\\n", value, count - 1);
}

int main(void) {
    printf("Array elements: ");
    for (int i = 0; i < count; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");

    int key = 25; // Search example
    int index = linear_search(key);
    if (index != -1) {
        printf("Key %d found at index %d\\n", key, index);
    } else {
        printf("Key %d not found in the array\\n", key);
    }
    return 0;
}
`;
    }

    // Default static-array or search
    return `// Auto-generated by Data Structures Visualizer
// ${entry.name} Simulator — capacity ${capacity}
#include <stdio.h>
#include <stdlib.h>

#define CAPACITY ${capacity}

int data[CAPACITY] = {${valuesStr}};
int count = ${items.length};

// Custom interactive operations for ${entry.name}
void insert_element(int index, int value) {
    if (count >= CAPACITY) {
        printf("Error: Structure is full\\n");
        return;
    }
    if (index < 0 || index > count) {
        printf("Error: Index out of bounds\\n");
        return;
    }
    for (int i = count; i > index; i--) {
        data[i] = data[i - 1];
    }
    data[index] = value;
    count++;
    printf("Inserted %d at index %d\\n", value, index);
}

void delete_element(int index) {
    if (index < 0 || index >= count) {
        printf("Error: Index out of bounds\\n");
        return;
    }
    int removed = data[index];
    for (int i = index; i < count - 1; i++) {
        data[i] = data[i + 1];
    }
    count--;
    printf("Deleted %d from index %d\\n", removed, index);
}

void print_structure(void) {
    printf("[");
    for (int i = 0; i < count; i++) {
        printf(" %d", data[i]);
    }
    printf(" ]  size=%d capacity=%d\\n", count, CAPACITY);
}

int main(void) {
    print_structure();
    return 0;
}
`;
  }, [entry.slug, entry.name, capacity, items]);

  const insertAtFirst = async (val: number) => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    
    if (actCount >= capacity) {
      setMessage("OVERFLOW — Simulator is full.");
      return;
    }
    
    setAnimating(true);
    for(let i = actCount; i > 0; i--) {
        setMessage(`Shifting element from index ${i-1} to ${i}...`);
        setHighlight({ index: i, kind: "peek" });
        setSlots(prev => {
            const newSlots = [...prev];
            newSlots[i].value = newSlots[i - 1].value;
            newSlots[i - 1].value = null;
            return newSlots;
        });
        await sleep(sim.delayMs);
    }
    
    setMessage(`Inserting new value ${val} at index 0`);
    setHighlight({ index: 0, kind: "insert" });
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[0].value = val;
        return newSlots;
    });
    await sleep(sim.delayMs);
    setHighlight(null);
    setAnimating(false);
  };

  const insertAtEnd = async (val: number) => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount >= capacity) {
      setMessage("OVERFLOW — Simulator is full.");
      return;
    }
    setAnimating(true);
    const idx = actCount;
    setMessage(`Inserting new value ${val} at End (index ${idx})`);
    setHighlight({ index: idx, kind: "insert" });
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[idx].value = val;
        return newSlots;
    });
    await sleep(sim.delayMs);
    setHighlight(null);
    setAnimating(false);
  };

  const insertAtMiddle = async (val: number) => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    
    if (actCount >= capacity) {
      setMessage("OVERFLOW — Simulator is full."); 
      return;
    }
    
    setAnimating(true);
    const idx = Math.floor(actCount / 2);
    
    for(let i = actCount; i > idx; i--) {
        setMessage(`Shifting element from index ${i-1} to ${i}...`);
        setHighlight({ index: i, kind: "peek" });
        setSlots(prev => {
            const newSlots = [...prev];
            newSlots[i].value = newSlots[i - 1].value;
            newSlots[i - 1].value = null;
            return newSlots;
        });
        await sleep(sim.delayMs);
    }

    setMessage(`Inserting new value ${val} at middle index ${idx}`);
    setHighlight({ index: idx, kind: "insert" });
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[idx].value = val;
        return newSlots;
    });
    await sleep(sim.delayMs);
    setHighlight(null);
    setAnimating(false);
  };

  const deleteAtFirst = async () => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    setMessage(`Taking out value at index 0`);
    setHighlight({ index: 0, kind: "delete" });
    await sleep(sim.delayMs);
    
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[0].value = null;
        return newSlots;
    });
    
    for(let i = 1; i < actCount; i++) {
        setMessage(`Shifting element from index ${i} to ${i-1}...`);
        setHighlight({ index: i - 1, kind: "peek" });
        setSlots(prev => {
            const newSlots = [...prev];
            newSlots[i - 1].value = newSlots[i].value;
            newSlots[i].value = null;
            return newSlots;
        });
        await sleep(sim.delayMs);
    }
    
    setMessage(`Deleted at First and shifted array left.`);
    setHighlight(null);
    setAnimating(false);
  };

  const deleteAtEnd = async () => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    const idx = actCount - 1;
    setMessage(`Taking out value at End (index ${idx})`);
    setHighlight({ index: idx, kind: "delete" });
    await sleep(sim.delayMs);
    
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[idx].value = null;
        return newSlots;
    });
    
    setMessage(`Deleted at End.`);
    setHighlight(null);
    setAnimating(false);
  };

  const deleteAtMiddle = async () => {
    if (animating) return;
    sim.startOperation();
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    const idx = Math.floor((actCount - 1) / 2);
    setMessage(`Taking out value at middle index ${idx}`);
    setHighlight({ index: idx, kind: "delete" });
    await sleep(sim.delayMs);
    
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[idx].value = null;
        return newSlots;
    });
    
    for(let i = idx + 1; i < actCount; i++) {
        setMessage(`Shifting element from index ${i} to ${i-1}...`);
        setHighlight({ index: i - 1, kind: "peek" });
        setSlots(prev => {
            const newSlots = [...prev];
            newSlots[i - 1].value = newSlots[i].value;
            newSlots[i].value = null;
            return newSlots;
        });
        await sleep(sim.delayMs);
    }
    
    setMessage(`Deleted at Middle and shifted array left.`);
    setHighlight(null);
    setAnimating(false);
  };

  const searchOp = async (key: number) => {
    if (animating) return;
    sim.startOperation();
    setAnimating(true);

    if (entry.slug === "binary-search") {
      let low = 0;
      const activeVals = slots.map(s => s.value).filter(val => val !== null);
      let high = activeVals.length - 1;
      let found = false;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        setHighlight({ index: mid, kind: "peek" });
        setMessage(`Checking index ${mid} (${slots[mid].value}) in range [${low}, ${high}]...`);
        await sleep(sim.delayMs);

        if (slots[mid].value === key) {
          setHighlight({ index: mid, kind: "insert" });
          setMessage(`Found ${key} at index ${mid}!`);
          found = true;
          break;
        } else if ((slots[mid].value as number) < key) {
          setMessage(`${slots[mid].value} < ${key}. Moving low pointer to ${mid + 1}.`);
          low = mid + 1;
        } else {
          setMessage(`${slots[mid].value} > ${key}. Moving high pointer to ${mid - 1}.`);
          high = mid - 1;
        }
        await sleep(sim.delayMs);
      }

      if (!found) {
        setMessage(`Value ${key} not found.`);
        setHighlight(null);
      }

      await sleep(2000);
      setHighlight(null);
      setAnimating(false);
      return;
    }

    let found = false;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].value === null) continue;
      
      setHighlight({ index: i, kind: "peek" });
      setMessage(`Searching index ${i} for value ${key}...`);
      await sleep(sim.delayMs);
      
      if (slots[i].value === key) {
        setHighlight({ index: i, kind: "insert" });
        setMessage(`Found ${key} at index ${i}!`);
        found = true;
        break;
      }
    }

    if (!found) {
      setMessage(`Value ${key} not found.`);
      setHighlight(null);
    }
    
    await sleep(2000);
    setHighlight(null);
    setAnimating(false);
  };

  const randomFillOp = (n: number) => {
    if (animating) return;
    setAnimating(true);
    
    if (entry.slug === "binary-search") {
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        vals.push(Math.floor(Math.random() * 90) + 10);
      }
      vals.sort((a, b) => a - b);
      setSlots((prev) => {
        return prev.map((s, idx) => {
          if (idx < n) {
            return { ...s, value: vals[idx] };
          }
          return { ...s, value: null };
        });
      });
      setMessage(`Randomly filled ${n} sorted slots`);
    } else {
      setSlots((prev) => {
          let count = 0;
          return prev.map(s => {
              if (s.value === null && count < n) {
                  count++;
                  return { ...s, value: Math.floor(Math.random() * 100) };
              }
              return s;
          });
      });
      setMessage(`Randomly filled ${n} slots`);
    }
    
    setHighlight(null);
    setAnimating(false);
  };

  const handleApplyCapacity = () => {
    const cap = Math.max(1, Math.min(maxCapacity, pendingCapacity));
    setCapacity(cap);
    setSlots(Array.from({ length: cap }, (_, i) => ({ id: i, value: null })));
    setMessage(`Playground capacity updated to ${cap}`);
  };

  const isSearchSlug = entry.slug === "linear-search" || entry.slug === "binary-search";

  const actions = isSearchSlug
    ? [
        {
          key: "insert",
          label: "Insert",
          onClick: () => {
            const v = input.value === "" ? Math.floor(Math.random() * 100) : Number(input.value);
            if (isNaN(v)) return;
            // Check sort order for binary search
            if (entry.slug === "binary-search" && activeCount > 0) {
              const activeVals = slots.map(s => s.value).filter(val => val !== null) as number[];
              const lastVal = activeVals[activeVals.length - 1];
              if (v < lastVal) {
                setMessage(`Cannot insert ${v}. For Binary Search, elements must be in sorted order (ascending). Please enter a value >= ${lastVal}.`);
                return;
              }
            }
            insertAtEnd(v);
            setInput((prev) => ({ ...prev, value: "" }));
          },
          disabled: animating,
        },
        {
          key: "delete",
          label: "Delete",
          tone: "danger" as const,
          onClick: () => deleteAtEnd(),
          disabled: animating || activeCount === 0,
        },
        {
          key: "search",
          label: entry.slug === "binary-search" ? "Binary Search" : "Linear Search",
          onClick: () => {
            const k = Number(input.searchKey);
            if (isNaN(k)) return;
            searchOp(k);
          },
          disabled: animating || input.searchKey === "",
        },
        {
          key: "randomFill",
          label: "Random Fill",
          onClick: () => {
            const n = Number(input.randomN) || capacity;
            randomFillOp(Math.max(1, Math.min(1024, n)));
          },
          disabled: animating,
        },
        {
          key: "clear",
          label: "Clear All",
          tone: "ghost" as const,
          onClick: () => {
            setSlots(Array.from({ length: capacity }, (_, i) => ({ id: i, value: null })));
            setMessage("Playground cleared.");
          },
          disabled: animating,
        }
      ]
    : [
        {
          key: "insFirst",
          label: "Insert First",
          onClick: () => {
            const v = input.value === "" ? Math.floor(Math.random() * 100) : Number(input.value);
            if (isNaN(v)) return;
            insertAtFirst(v);
            setInput((prev) => ({ ...prev, value: "" }));
          },
          disabled: animating,
        },
        {
          key: "insMid",
          label: "Insert Middle",
          onClick: () => {
            const v = input.value === "" ? Math.floor(Math.random() * 100) : Number(input.value);
            if (isNaN(v)) return;
            insertAtMiddle(v);
            setInput((prev) => ({ ...prev, value: "" }));
          },
          disabled: animating,
        },
        {
          key: "insEnd",
          label: "Insert End",
          onClick: () => {
            const v = input.value === "" ? Math.floor(Math.random() * 100) : Number(input.value);
            if (isNaN(v)) return;
            insertAtEnd(v);
            setInput((prev) => ({ ...prev, value: "" }));
          },
          disabled: animating,
        },
        {
          key: "delFirst",
          label: "Delete First",
          tone: "danger" as const,
          onClick: () => deleteAtFirst(),
          disabled: animating || activeCount === 0,
        },
        {
          key: "delMid",
          label: "Delete Middle",
          tone: "danger" as const,
          onClick: () => deleteAtMiddle(),
          disabled: animating || activeCount === 0,
        },
        {
          key: "delEnd",
          label: "Delete End",
          tone: "danger" as const,
          onClick: () => deleteAtEnd(),
          disabled: animating || activeCount === 0,
        },
        {
          key: "search",
          label: "Linear Search",
          onClick: () => {
            const k = Number(input.searchKey);
            if (isNaN(k)) return;
            searchOp(k);
          },
          disabled: animating || input.searchKey === "",
        },
        {
          key: "randomFill",
          label: "Random Fill",
          onClick: () => {
            const n = Number(input.randomN) || capacity;
            randomFillOp(Math.max(1, Math.min(1024, n)));
          },
          disabled: animating,
        },
        {
          key: "clear",
          label: "Clear All",
          tone: "ghost" as const,
          onClick: () => {
            setSlots(Array.from({ length: capacity }, (_, i) => ({ id: i, value: null })));
            setMessage("Playground cleared.");
          },
          disabled: animating,
        }
      ];

  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <VisualizerHeader 
        title={entry.name} 
        family={entry.family} 
        slug={entry.slug} 
        onToggleCode={() => setCodeOpen(!codeOpen)}
        codeOpen={codeOpen}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={handleApplyCapacity}
            maxCapacity={maxCapacity}
            onMaxCapacity={setMaxCapacity}
            speed={speed}
            onSpeed={setSpeed}
            autoPlay={autoPlay}
            onAutoPlay={setAutoPlay}
            stepMode={stepMode}
            onStepMode={setStepMode}
            animating={animating}
          />
          <InputPanel
            state={input}
            onChange={onChange}
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 99" },
              { key: "searchKey", label: "Search Key" },
              { key: "randomN", label: "Random N" },
            ]}
          />
          <OperationsPanel
            actions={actions}
          />
          <AddressTablePanel
            slots={slots}
            layout={entry.slug}
          />
        </aside>

        <section className="space-y-3">
          <SimulationControlToolbar
            iterationCount={sim.iterationCount}
            elapsedTime={sim.elapsedTime}
            isPaused={sim.isPaused}
            delayMs={sim.delayMs}
            animating={animating}
            onPause={sim.handlePause}
            onResume={sim.handleResume}
            onRestart={sim.handleRestart}
            onDelayChange={sim.handleDelayChange}
          />
          <StatusBar message={message} state="PARTIALLY_FILLED" stepPending={false} onStep={() => {}} />

          <div className="rounded-lg border border-border bg-card p-4">
            <HighlightedCells slots={slots} highlight={highlight} layout={entry.slug} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <VariableMonitor
              compact
              vars={[
                { name: "count", value: activeCount, accent: "front" },
                { name: "capacity", value: capacity },
                { name: "is_empty", value: activeCount === 0 ? "true" : "false" },
                { name: "is_full", value: activeCount === capacity ? "true" : "false" },
              ]}
            />
            <ComplexityPanel
              compact
              rows={[
                { op: "insert", time: "O(1) / O(n)", space: "O(1)" },
                { op: "delete", time: "O(1) / O(n)", space: "O(1)" },
                { op: "storage", time: "—", space: "O(n)" },
              ]}
            />
          </div>
          <CodeExportPanel
            code={code}
            filename={`${entry.slug.replace("-", "_")}.c`}
            highlightedLines={highlight?.index !== undefined ? [23, 24, 25, 36, 37] : []}
          />
        </section>
      </main>

      {codeOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col p-4 pt-16 animate-slide-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="font-mono text-xs uppercase font-bold text-muted-foreground">C Implementation Code</h3>
            <button 
              onClick={() => setCodeOpen(false)}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodeExportPanel
              code={code}
              filename={`${entry.slug.replace("-", "_")}.c`}
              highlightedLines={highlight?.index !== undefined ? [23, 24, 25, 36, 37] : []}
            />
          </div>
        </div>
      )}
    </div>
  );
}