import { useMemo, useState, useEffect, type ReactNode } from "react";
import type { Highlight, Speed } from "@/lib/ds/engine";
import { highlightClass, memAddress } from "@/lib/ds/engine";
import type { Transition } from "@/lib/ds/states";

export function PanelCard({
  title,
  children,
  right,
  className = "",
  compact = false,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-card text-card-foreground ${className}`}
    >
      <header
        className={`flex items-center justify-between border-b border-border ${
          compact ? "px-2.5 py-1.5" : "px-3 py-2"
        }`}
      >
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {right}
      </header>
      <div className={compact ? "p-2.5" : "p-3"}>{children}</div>
    </section>
  );
}

export function ConfigPanel({
  capacity,
  pendingCapacity,
  onPendingCapacity,
  onApplyCapacity,
  maxCapacity,
  onMaxCapacity,
  speed,
  onSpeed,
  autoPlay,
  onAutoPlay,
  stepMode,
  onStepMode,
  animating,
}: {
  capacity: number;
  pendingCapacity: number;
  onPendingCapacity: (n: number) => void;
  onApplyCapacity: () => void;
  maxCapacity: number;
  onMaxCapacity: (n: number) => void;
  speed: Speed;
  onSpeed: (s: Speed) => void;
  autoPlay: boolean;
  onAutoPlay: (v: boolean) => void;
  stepMode: boolean;
  onStepMode: (v: boolean) => void;
  animating: boolean;
}) {
  return (
    <PanelCard title="Configuration">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <Field label="Initial Capacity">
          <input
            type="number"
            min={1}
            max={maxCapacity}
            value={pendingCapacity}
            onChange={(e) => onPendingCapacity(Number(e.target.value))}
            className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
          />
        </Field>
        <Field label="Max Capacity">
          <input
            type="number"
            min={1}
            max={64}
            value={maxCapacity}
            onChange={(e) => onMaxCapacity(Number(e.target.value))}
            className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
          />
        </Field>
        <Field label="Animation Speed">
          <select
            value={speed}
            onChange={(e) => onSpeed(e.target.value as Speed)}
            className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
          >
            <option value="slow">Slow (700 ms)</option>
            <option value="normal">Normal (350 ms)</option>
            <option value="fast">Fast (100 ms)</option>
          </select>
        </Field>
        <Field label="Mode">
          <div className="flex flex-col gap-1">
            <Toggle label="Auto Play" value={autoPlay} onChange={onAutoPlay} />
            <Toggle label="Step Mode" value={stepMode} onChange={onStepMode} />
          </div>
        </Field>
        <div className="col-span-2 flex items-center justify-between">
          <span className="font-mono text-muted-foreground">
            current capacity = {capacity}
          </span>
          <button
            onClick={onApplyCapacity}
            disabled={animating}
            className="rounded bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            Apply &amp; Reset
          </button>
        </div>
      </div>
    </PanelCard>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-xs ${
        value
          ? "border-[var(--hl-peek)] text-[var(--hl-peek)]"
          : "border-border text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className="font-bold">{value ? "ON" : "OFF"}</span>
    </button>
  );
}

export interface InputState {
  value: string;
  index: string;
  priority: string;
  position: string;
  searchKey: string;
  deleteKey: string;
  updateValue: string;
  randomN: string;
}

export type InputField = keyof InputState;

export function InputPanel({
  state,
  onChange,
  fields,
}: {
  state: InputState;
  onChange: (k: InputField, v: string) => void;
  fields: { key: InputField; label: string; placeholder?: string }[];
}) {
  return (
    <PanelCard title="User Input">
      <div className="grid grid-cols-2 gap-2 text-xs">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {f.label}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={state[f.key]}
              placeholder={f.placeholder ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
            />
          </label>
        ))}
      </div>
    </PanelCard>
  );
}

export interface OpAction {
  key: string;
  label: string;
  onClick: () => void;
  tone?: "primary" | "danger" | "ghost";
  disabled?: boolean;
}

export function OperationsPanel({ actions }: { actions: OpAction[] }) {
  return (
    <PanelCard title="Operations">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => {
          const base =
            "rounded border px-2 py-1.5 font-mono text-xs font-semibold transition-colors disabled:opacity-40";
          const tone =
            a.tone === "danger"
              ? "border-[var(--hl-delete)] text-[var(--hl-delete)] hover:bg-[var(--hl-delete)]/10"
              : a.tone === "ghost"
                ? "border-border text-muted-foreground hover:bg-accent"
                : "border-[var(--hl-peek)] text-[var(--hl-peek)] hover:bg-[var(--hl-peek)]/10";
          return (
            <button
              key={a.key}
              onClick={a.onClick}
              disabled={a.disabled}
              className={`${base} ${tone}`}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}

export function VariableMonitor({
  vars,
  compact = false,
}: {
  vars: { name: string; value: string | number; accent?: "front" | "rear" | "top" }[];
  compact?: boolean;
}) {
  return (
    <PanelCard title="Variable Monitor" compact={compact}>
      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        {vars.map((v) => {
          const color =
            v.accent === "front"
              ? "text-[var(--pointer-front)]"
              : v.accent === "rear"
                ? "text-[var(--pointer-rear)]"
                : v.accent === "top"
                  ? "text-[var(--pointer-top)]"
                  : "text-foreground";
          return (
            <div key={v.name} className="flex flex-col overflow-hidden rounded border border-border bg-[var(--code-bg)] shadow-sm">
              <div className="bg-muted/30 border-b border-border px-2 py-1.5 text-[10px] uppercase text-muted-foreground tracking-wider font-semibold text-center">
                {v.name}
              </div>
              <div className={`px-2 py-2 text-center text-sm font-bold bg-background ${color}`}>
                {v.value}
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

export function MemoryView({
  slots,
  baseAddress = 0x1000,
}: {
  slots: { value: number | null }[];
  baseAddress?: number;
}) {
  return (
    <PanelCard title="Memory View">
      <div className="max-h-48 overflow-auto">
        <table className="w-full font-mono text-xs">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left">Address</th>
              <th className="text-left">Index</th>
              <th className="text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="py-0.5 text-[var(--hl-peek)]">{memAddress(baseAddress, i)}</td>
                <td>[{i}]</td>
                <td>{s.value ?? <span className="text-muted-foreground">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

export function ComplexityPanel({
  rows,
  compact = false,
}: {
  rows: { op: string; time: string; space: string }[];
  compact?: boolean;
}) {
  return (
    <PanelCard title="Complexity" compact={compact}>
      <table className={`w-full font-mono ${compact ? "text-[11px]" : "text-xs"}`}>
        <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="text-left">Op</th>
            <th className="text-left">Time</th>
            <th className="text-left">Space</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.op} className="border-t border-border/40">
              <td className="py-0.5">{r.op}</td>
              <td className="text-[var(--hl-peek)] font-semibold">{r.time}</td>
              <td>{r.space}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelCard>
  );
}

export function StateMachinePanel<S extends string>({
  current,
  previous,
  history,
}: {
  current: S;
  previous: S | null;
  history: Transition<S>[];
}) {
  return (
    <PanelCard title="State Machine">
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded border border-border bg-[var(--code-bg)] p-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Previous
          </div>
          <div className="text-foreground/70">{previous ?? "—"}</div>
        </div>
        <div className="rounded border border-[var(--hl-peek)] bg-[var(--code-bg)] p-2 shadow-[0_0_12px_var(--hl-peek)]/30">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Current
          </div>
          <div className="font-bold text-[var(--hl-peek)]">{current}</div>
        </div>
      </div>
      <div className="max-h-40 overflow-auto rounded border border-border bg-[var(--code-bg)]">
        <ul className="divide-y divide-border font-mono text-[11px]">
          {history.length === 0 ? (
            <li className="p-2 text-muted-foreground">No transitions yet.</li>
          ) : (
            [...history].reverse().map((t, i) => (
              <li key={history.length - i} className="flex justify-between gap-2 p-1.5">
                <span className="text-muted-foreground">
                  {t.from ?? "·"} → <span className="text-foreground">{t.to}</span>
                </span>
                <span className="text-[var(--hl-insert)]">{t.op}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </PanelCard>
  );
}

export function CodeExportPanel({
  code,
  filename,
  onCodeChange,
  highlightedLines = [],
}: {
  code: string;
  filename: string;
  onCodeChange?: (newCode: string) => void;
  highlightedLines?: number[];
}) {
  const [editedCode, setEditedCode] = useState(code);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const download = (content: string, name: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const gutter = document.getElementById("code-gutter");
    if (gutter) {
      gutter.scrollTop = textarea.scrollTop;
    }
  };

  const linesCount = editedCode.split("\n").length;

  return (
    <PanelCard
      title="Code Export"
      right={
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => navigator.clipboard.writeText(editedCode)}
            className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Copy
          </button>
          <button
            onClick={() => {
              download(editedCode, filename, "text/x-c");
            }}
            className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Download
          </button>
        </div>
      }
    >
      <div className="flex rounded border border-border bg-[var(--code-bg)] font-mono text-[11px] leading-5 h-72 overflow-hidden shadow-inner">
        <div
          id="code-gutter"
          className="w-10 shrink-0 select-none text-right text-muted-foreground/30 py-2 pr-2 border-r border-border bg-muted/5 overflow-hidden font-mono text-[11px] leading-5 flex flex-col no-scrollbar"
        >
          {Array.from({ length: linesCount }, (_, i) => {
            const lineNum = i + 1;
            const isHL = highlightedLines.includes(lineNum);
            return (
              <span
                key={lineNum}
                className={`block w-full transition-all duration-200 pr-1 ${
                  isHL
                    ? "bg-[var(--hl-insert)]/25 text-[var(--hl-insert)] font-semibold border-r-2 border-[var(--hl-insert)]"
                    : ""
                }`}
              >
                {lineNum}
              </span>
            );
          })}
        </div>
        <textarea
          value={editedCode}
          onChange={(e) => {
            const val = e.target.value;
            setEditedCode(val);
            onCodeChange?.(val);
          }}
          onScroll={handleScroll}
          className="flex-1 w-full bg-transparent text-foreground outline-none resize-none py-2 px-3 focus:ring-0 focus:outline-none border-none overflow-auto font-mono text-[11px] leading-5 whitespace-pre font-normal code-scrollbar"
          spellCheck={false}
        />
      </div>
    </PanelCard>
  );
}

export function StatusBar({
  message,
  state,
  stepPending,
  onStep,
}: {
  message: string;
  state: string;
  stepPending: boolean;
  onStep: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="rounded bg-[var(--hl-peek)]/15 px-2 py-0.5 text-[var(--hl-peek)]">
          {state}
        </span>
        <span className="text-foreground">{message}</span>
      </div>
      {stepPending ? (
        <button
          onClick={onStep}
          className="rounded bg-[var(--hl-insert)] px-3 py-1 text-xs font-bold text-[oklch(0.18_0.02_260)]"
        >
          ▶ Next Step
        </button>
      ) : null}
    </div>
  );
}

export function HighlightedCells({
  slots,
  front = -2,
  rear = -2,
  top = -2,
  highlight,
  layout = "linear",
}: {
  slots: { id: number; value: number | null }[];
  front?: number;
  rear?: number;
  top?: number;
  highlight: Highlight | null;
  layout?: "linear" | "stack" | "circular";
}) {
  const CHUNK_SIZE = 10;

  const renderCell = (slot: { id: number; value: number | null }, i: number, style?: React.CSSProperties, className?: string) => {
    const isHL = highlight?.index === i;
    const isEmpty = slot.value === null;
    return (
      <div key={slot.id} className={`flex flex-col items-center gap-1.5 ${className || ""}`} style={style}>
        <div className="h-5 font-mono text-[10px] text-center w-max">
          {i === front && (
            <span className="text-[var(--pointer-front)] font-semibold block animate-slide-down">▼ front</span>
          )}
          {i === top && (
            <span className="text-[var(--pointer-rear)] font-semibold block animate-slide-down">▼ top</span>
          )}
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-lg border text-lg font-mono font-bold transition-all duration-300 ${
            isEmpty
              ? "border-dashed border-border bg-[var(--cell-bg-empty)] text-muted-foreground"
              : "border-border bg-[var(--cell-bg)] text-foreground shadow-sm animate-pop"
          } ${isHL ? highlightClass(highlight!.kind) : ""}`}
        >
          {slot.value ?? ""}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">[{i}]</div>
        <div className="h-5 font-mono text-[10px] text-center w-max">
          {i === rear && (
            <span className="text-[var(--pointer-rear)] font-semibold block animate-slide-up">▲ rear</span>
          )}
        </div>
      </div>
    );
  };

  if (layout === "circular") {
    const capacity = slots.length;
    // Calculate radius to prevent overlap: circum = cap * 80px -> r = circum / 2PI
    const radius = Math.max(100, (capacity * 80) / (2 * Math.PI));
    const containerSize = radius * 2 + 160; // 160px padding for labels
    const center = containerSize / 2;

    return (
      <div className="w-full overflow-auto scrollbar-none no-scrollbar flex items-center justify-center py-8">
        <div 
          className="relative" 
          style={{ width: containerSize, height: containerSize }}
        >
          {slots.map((slot, i) => {
            const angle = (i * 2 * Math.PI) / capacity - Math.PI / 2; // start from top
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return renderCell(slot, i, {
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
            });
          })}
        </div>
      </div>
    );
  }

  if (layout === "stack") {
    // Render from bottom to top
    return (
      <div className="flex flex-col-reverse items-center gap-2 py-4 w-full max-h-[600px] overflow-y-auto scrollbar-none no-scrollbar">
        {slots.map((slot, i) => {
          const isHL = highlight?.index === i;
          const isEmpty = slot.value === null;
          return (
            <div key={slot.id} className="flex items-center gap-3">
              <div className="w-16 text-right font-mono text-[10px] text-muted-foreground">[{i}]</div>
              <div
                className={`flex h-12 w-32 items-center justify-center rounded-sm border text-lg font-mono font-bold transition-all duration-300 ${
                  isEmpty
                    ? "border-dashed border-border bg-[var(--cell-bg-empty)] text-muted-foreground"
                    : "border-border bg-[var(--cell-bg)] text-foreground shadow-sm animate-pop"
                } ${isHL ? highlightClass(highlight!.kind) : ""}`}
              >
                {slot.value ?? ""}
              </div>
              <div className="w-16 font-mono text-[10px]">
                {i === top && (
                  <span className="text-[var(--pointer-rear)] font-semibold block animate-pop">◀ top</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // layout === "linear"
  const chunks = [];
  for (let i = 0; i < slots.length; i += CHUNK_SIZE) {
    chunks.push(slots.slice(i, i + CHUNK_SIZE));
  }

  return (
    <div className="flex flex-col items-center gap-8 py-4 w-full overflow-x-auto scrollbar-none no-scrollbar">
      {chunks.map((chunk, chunkIdx) => (
        <div key={chunkIdx} className="flex flex-wrap min-w-max items-end justify-center gap-2.5 mx-auto">
          {chunk.map((slot, localIdx) => {
            const i = chunkIdx * CHUNK_SIZE + localIdx;
            return renderCell(slot, i);
          })}
        </div>
      ))}
    </div>
  );
}