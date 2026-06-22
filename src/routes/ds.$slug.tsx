import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { getEntry, REGISTRY } from "@/lib/ds/registry";

// Structures & Codegen
import { useLinearQueue } from "@/lib/ds/structures/linear-queue";
import { linearQueueC } from "@/lib/ds/codegen/linear-queue";

import { useStack } from "@/lib/ds/structures/stack";
import { stackC } from "@/lib/ds/codegen/stack";

import { useCircularQueue } from "@/lib/ds/structures/circular-queue";
import { circularQueueC } from "@/lib/ds/codegen/circular-queue";

import { SPEED_MS, usePersistentState, type Speed } from "@/lib/ds/engine";
import {
  CodeExportPanel,
  ComplexityPanel,
  ConfigPanel,
  HighlightedCells,
  InputPanel,
  OperationsPanel,
  StatusBar,
  VariableMonitor,
  type InputField,
  type InputState,
} from "@/components/visualizer/Panels";

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
    return <LinearQueueVisualizer entry={entry} />;
  }
  if (entry.slug === "circular-queue") {
    return <CircularQueueVisualizer entry={entry} />;
  }
  if (entry.slug === "stack") {
    return <StackVisualizer entry={entry} />;
  }
  return <PlaygroundVisualizer entry={entry} />;
}

/* ==========================================
   Header Dropdown Component
   ========================================== */
function VisualizerHeader({ title, family, slug }: { title: string; family: string; slug: string }) {
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background">
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
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
          KPRIET DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING <span className="opacity-50 mx-2">|</span> Interactive C Generator
        </span>
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

  const onChange = (k: InputField, v: string) =>
    setInput((s) => ({ ...s, [k]: v }));

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const code = useMemo(() => linearQueueC(q.capacity), [q.capacity]);
  const highlightedLines = useMemo(() => getLinearQueueHighlightedLines(q.message), [q.message]);
  const teacherExp = useMemo(() => getLinearQueueTeacherExplanation(q.message), [q.message]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <VisualizerHeader title={entry.name} family={entry.family} slug={entry.slug} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={q.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => q.setCapacity(pendingCapacity)}
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
                  q.enqueue(v);
                  setInput((s) => ({ ...s, value: "" }));
                },
                disabled: q.animating || input.value === "",
              },
              {
                key: "dequeue",
                label: "Dequeue",
                tone: "danger",
                onClick: () => q.dequeue(),
                disabled: q.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => q.peek(),
                disabled: q.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  q.search(v);
                },
                disabled: q.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => q.display(),
                disabled: q.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  q.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: q.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => q.reset(),
                disabled: q.animating,
              },
              {
                key: "create",
                label: "Create",
                tone: "ghost",
                onClick: () => q.setCapacity(pendingCapacity),
                disabled: q.animating,
              },
            ]}
          />
        </aside>

        <section className="space-y-3">
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <VisualizerHeader title={entry.name} family={entry.family} slug={entry.slug} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={q.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => q.setCapacity(pendingCapacity)}
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
                  q.enqueue(v);
                  setInput((s) => ({ ...s, value: "" }));
                },
                disabled: q.animating || input.value === "",
              },
              {
                key: "dequeue",
                label: "Dequeue",
                tone: "danger",
                onClick: () => q.dequeue(),
                disabled: q.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => q.peek(),
                disabled: q.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  q.search(v);
                },
                disabled: q.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => q.display(),
                disabled: q.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  q.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: q.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => q.reset(),
                disabled: q.animating,
              },
              {
                key: "create",
                label: "Create",
                tone: "ghost",
                onClick: () => q.setCapacity(pendingCapacity),
                disabled: q.animating,
              },
            ]}
          />
        </aside>

        <section className="space-y-3">
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

  const onChange = (k: InputField, v: string) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const num = (valStr: string) => {
    const n = Number(valStr);
    return Number.isFinite(n) ? n : NaN;
  };

  const code = useMemo(() => stackC(s.capacity), [s.capacity]);
  const highlightedLines = useMemo(() => getStackHighlightedLines(s.message), [s.message]);
  const teacherExp = useMemo(() => getStackTeacherExplanation(s.message), [s.message]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <VisualizerHeader title={entry.name} family={entry.family} slug={entry.slug} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <ConfigPanel
            capacity={s.capacity}
            pendingCapacity={pendingCapacity}
            onPendingCapacity={setPendingCapacity}
            onApplyCapacity={() => s.setCapacity(pendingCapacity)}
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
                  s.push(v);
                  setInput((prev) => ({ ...prev, value: "" }));
                },
                disabled: s.animating || input.value === "",
              },
              {
                key: "pop",
                label: "Pop",
                tone: "danger",
                onClick: () => s.pop(),
                disabled: s.animating,
              },
              {
                key: "peek",
                label: "Peek",
                tone: "ghost",
                onClick: () => s.peek(),
                disabled: s.animating,
              },
              {
                key: "search",
                label: "Search",
                tone: "ghost",
                onClick: () => {
                  const v = num(input.searchKey);
                  if (!Number.isFinite(v)) return;
                  s.search(v);
                },
                disabled: s.animating || input.searchKey === "",
              },
              {
                key: "display",
                label: "Display",
                tone: "ghost",
                onClick: () => s.display(),
                disabled: s.animating,
              },
              {
                key: "random",
                label: "Random Fill",
                onClick: () => {
                  const n = num(input.randomN);
                  if (!Number.isFinite(n)) return;
                  s.randomFill(Math.max(1, Math.min(1024, n)));
                },
                disabled: s.animating,
              },
              {
                key: "reset",
                label: "Reset",
                tone: "ghost",
                onClick: () => s.reset(),
                disabled: s.animating,
              },
              {
                key: "create",
                label: "Create",
                tone: "ghost",
                onClick: () => s.setCapacity(pendingCapacity),
                disabled: s.animating,
              },
            ]}
          />
        </aside>

        <section className="space-y-3">
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
    </div>
  );
}

/* ==========================================
   4. PLAYGROUND VISUALIZER (FALLBACK FOR ALL OTHERS)
   ========================================== */
function PlaygroundVisualizer({ entry }: { entry: any }) {
  const [capacity, setCapacity] = usePersistentState("pg-capacity", 8);
  const [pendingCapacity, setPendingCapacity] = useState(8);
  const [maxCapacity, setMaxCapacity] = useState(32);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(false);
  const [input, setInput] = useState<InputState>(emptyInput);

  // Local interactive slot state
  const [slots, setSlots] = usePersistentState<{ id: number; value: number | null }[]>("pg-slots", () =>
    Array.from({ length: 8 }, (_, i) => ({ id: i, value: null }))
  );
  const [highlight, setHighlight] = useState<{ index: number; kind: "insert" | "delete" | "peek" } | null>(null);
  const [message, setMessage] = usePersistentState(`pg-message`, `Interactive Playground initialized for ${entry.name}`);
  const [animating, setAnimating] = useState(false);

  const onChange = (k: InputField, v: string) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  const activeCount = slots.filter((s) => s.value !== null).length;
  const items = useMemo(() => slots.map((s) => s.value).filter((v): v is number => v !== null), [slots]);

  const code = useMemo(() => {
    const valuesStr = items.map((x) => String(x)).join(", ");
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
  }, [entry.name, capacity, items]);

  const insertAtFirst = async (val: number) => {
    if (animating) return;
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
        await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    }
    
    setMessage(`Inserting new value ${val} at index 0`);
    setHighlight({ index: 0, kind: "insert" });
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[0].value = val;
        return newSlots;
    });
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    setHighlight(null);
    setAnimating(false);
  };

  const insertAtEnd = async (val: number) => {
    if (animating) return;
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
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    setHighlight(null);
    setAnimating(false);
  };

  const insertAtMiddle = async (val: number) => {
    if (animating) return;
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
        await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    }

    setMessage(`Inserting new value ${val} at middle index ${idx}`);
    setHighlight({ index: idx, kind: "insert" });
    setSlots(prev => {
        const newSlots = [...prev];
        newSlots[idx].value = val;
        return newSlots;
    });
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    setHighlight(null);
    setAnimating(false);
  };

  const deleteAtFirst = async () => {
    if (animating) return;
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    setMessage(`Taking out value at index 0`);
    setHighlight({ index: 0, kind: "delete" });
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    
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
        await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    }
    
    setMessage(`Deleted at First and shifted array left.`);
    setHighlight(null);
    setAnimating(false);
  };

  const deleteAtEnd = async () => {
    if (animating) return;
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    const idx = actCount - 1;
    setMessage(`Taking out value at End (index ${idx})`);
    setHighlight({ index: idx, kind: "delete" });
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    
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
    let actCount = slots.filter(s => s.value !== null).length;
    if (actCount === 0) {
      setMessage("UNDERFLOW — Simulator is empty."); return;
    }
    setAnimating(true);
    const idx = Math.floor((actCount - 1) / 2);
    setMessage(`Taking out value at middle index ${idx}`);
    setHighlight({ index: idx, kind: "delete" });
    await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    
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
        await new Promise(r => setTimeout(r, SPEED_MS[speed]));
    }
    
    setMessage(`Deleted at Middle and shifted array left.`);
    setHighlight(null);
    setAnimating(false);
  };

  const searchOp = async (key: number) => {
    if (animating) return;
    setAnimating(true);
    let found = false;

    for (let i = 0; i < slots.length; i++) {
      if (slots[i].value === null) continue;
      
      setHighlight({ index: i, kind: "peek" });
      setMessage(`Searching index ${i} for value ${key}...`);
      await new Promise((r) => setTimeout(r, SPEED_MS[speed]));
      
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
    
    setTimeout(() => {
        setHighlight(null);
        setAnimating(false);
    }, 2000);
  };

  const randomFillOp = (n: number) => {
    if (animating) return;
    setAnimating(true);
    
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
    setHighlight(null);
    setAnimating(false);
  };

  const handleApplyCapacity = () => {
    const cap = Math.max(1, Math.min(32, pendingCapacity));
    setCapacity(cap);
    setSlots(Array.from({ length: cap }, (_, i) => ({ id: i, value: null })));
    setMessage(`Playground capacity updated to ${cap}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <VisualizerHeader title={entry.name} family={entry.family} slug={entry.slug} />

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
            actions={[
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
                tone: "danger",
                onClick: () => deleteAtFirst(),
                disabled: animating || activeCount === 0,
              },
              {
                key: "delMid",
                label: "Delete Middle",
                tone: "danger",
                onClick: () => deleteAtMiddle(),
                disabled: animating || activeCount === 0,
              },
              {
                key: "delEnd",
                label: "Delete End",
                tone: "danger",
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
                key: "reset",
                label: "Clear All",
                tone: "ghost",
                onClick: () => {
                  setSlots(Array.from({ length: capacity }, (_, i) => ({ id: i, value: null })));
                  setMessage("Playground cleared.");
                },
                disabled: animating,
              },
            ]}
          />
        </aside>

        <section className="space-y-3">
          <StatusBar message={message} state="PARTIALLY_FILLED" stepPending={false} onStep={() => {}} />

          <div className="rounded-lg border border-border bg-card p-4">
            <HighlightedCells slots={slots} highlight={highlight} />
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
    </div>
  );
}