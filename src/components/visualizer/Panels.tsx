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
            max={1024}
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
  layout?: string;
}) {
  const CHUNK_SIZE = 10;

  const isSingly = layout === "singly-linked-list";
  const isDoubly = layout === "doubly-linked-list" || layout === "circular-doubly-list";
  const isCircularList = layout === "circular-singly-list" || layout === "circular-doubly-list";
  const isLinkedList = isSingly || layout === "doubly-linked-list" || layout === "linear-queue";
  const isCircular = layout === "circular" || isCircularList;
  const isQueue = layout === "linear-queue" || layout === "circular";
  const isStack = layout === "stack";
  const isCompound = isLinkedList || isCircularList || isQueue || isStack;

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

  const renderCompoundCell = (i: number, style?: React.CSSProperties, className?: string) => {
    const slot = slots[i];
    if (!slot) return null;
    const isHL = highlight?.index === i;
    const isEmpty = slot.value === null;
    const address = "0x" + (0x3000 + i * 16).toString(16).toUpperCase();

    // Resolve pointer tags
    const tags: string[] = [];
    if (layout === "circular" || layout === "linear-queue") {
      if (i === front) tags.push("FR");
      if (i === rear) tags.push("RR");
    } else if (isCircularList || isLinkedList) {
      const active = slots
        .map((s, idx) => ({ s, idx }))
        .filter((x) => x.s.value !== null);
      if (active.length > 0) {
        if (i === active[0].idx) tags.push("HD");
        if (i === active[active.length - 1].idx) tags.push("TL");
      }
    } else if (layout === "stack") {
      if (i === top) tags.push("TP");
    }

    // Resolve next/prev addresses
    let nextAddr = "NULL";
    let prevAddr = "NULL";

    if (!isEmpty) {
      if (layout === "linear-queue" || layout === "circular") {
        const activeIdxs: number[] = [];
        if (front !== -1) {
          if (layout === "linear-queue") {
            for (let idx = front; idx <= rear; idx++) activeIdxs.push(idx);
          } else {
            // circular queue
            let curr = front;
            while (curr !== rear) {
              activeIdxs.push(curr);
              curr = (curr + 1) % slots.length;
            }
            activeIdxs.push(rear);
          }
        }
        const pos = activeIdxs.indexOf(i);
        if (pos !== -1 && pos < activeIdxs.length - 1) {
          nextAddr = "0x" + (0x3000 + activeIdxs[pos + 1] * 16).toString(16).toUpperCase();
        }
      } else if (layout === "stack") {
        if (top !== -1 && i <= top && i > 0) {
          nextAddr = "0x" + (0x3000 + (i - 1) * 16).toString(16).toUpperCase();
        }
      } else {
        // Linked list (singly/doubly, linear/circular)
        const active = slots
          .map((s, idx) => ({ s, idx }))
          .filter((x) => x.s.value !== null);
        const pos = active.findIndex((x) => x.idx === i);
        if (pos !== -1) {
          if (pos < active.length - 1) {
            nextAddr = "0x" + (0x3000 + active[pos + 1].idx * 16).toString(16).toUpperCase();
          } else if (isCircularList) {
            nextAddr = "0x" + (0x3000 + active[0].idx * 16).toString(16).toUpperCase();
          }
          
          if (isDoubly) {
            if (pos > 0) {
              prevAddr = "0x" + (0x3000 + active[pos - 1].idx * 16).toString(16).toUpperCase();
            } else if (layout === "circular-doubly-list") {
              prevAddr = "0x" + (0x3000 + active[active.length - 1].idx * 16).toString(16).toUpperCase();
            }
          }
        }
      }
    }

    const boxWidth = isDoubly ? "w-32" : "w-24";

    return (
      <div 
        key={slot.id} 
        className={`flex flex-col rounded-lg border-2 shadow-sm transition-all duration-300 ${boxWidth} h-18 bg-[var(--cell-bg)] overflow-hidden ${
          isHL ? highlightClass(highlight!.kind) : "border-border"
        } ${className || ""}`}
        style={style}
      >
        {/* Top bar: Address and pointer tags */}
        <div className="flex items-center justify-between px-1.5 py-0.5 bg-muted/30 border-b border-border select-none">
          <span className="font-mono text-[9px] text-[var(--hl-peek)] font-semibold">{address}</span>
          <div className="flex gap-0.5">
            {tags.map((t) => (
              <span 
                key={t} 
                className={`text-[8px] font-extrabold px-1 rounded-sm uppercase tracking-wide leading-none py-0.5 ${
                  t === "FR" || t === "HD"
                    ? "bg-[var(--pointer-front)]/10 text-[var(--pointer-front)] border border-[var(--pointer-front)]/20 animate-pulse"
                    : t === "RR" || t === "TL"
                    ? "bg-[var(--pointer-rear)]/10 text-[var(--pointer-rear)] border border-[var(--pointer-rear)]/20 animate-pulse"
                    : "bg-[var(--hl-peek)]/10 text-[var(--hl-peek)] border border-[var(--hl-peek)]/20 animate-pulse"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Content columns */}
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center bg-[var(--cell-bg-empty)] border-dashed text-[10px] text-muted-foreground/50 font-mono select-none">
            empty
          </div>
        ) : (
          <div className="flex-1 flex divide-x divide-border font-mono text-[10px]">
            {isDoubly && (
              <div className="flex-1 flex flex-col items-center justify-center bg-muted/5 py-0.5">
                <span className="text-[7px] text-muted-foreground/60 font-bold uppercase tracking-wider">prev</span>
                <span className="font-semibold text-foreground/80 text-[9px] overflow-hidden text-ellipsis w-full text-center px-0.5">
                  {prevAddr}
                </span>
              </div>
            )}

            <div className="flex-[1.2] flex flex-col items-center justify-center bg-background py-0.5">
              <span className="text-[7px] text-muted-foreground/60 font-bold uppercase tracking-wider">data</span>
              <span className="text-sm font-extrabold text-foreground leading-none mt-0.5">{slot.value}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-muted/5 py-0.5">
              <span className="text-[7px] text-muted-foreground/60 font-bold uppercase tracking-wider">next</span>
              <span className="font-semibold text-foreground/80 text-[9px] overflow-hidden text-ellipsis w-full text-center px-0.5">
                {nextAddr}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLinkedList) {
    const active = slots
      .map((slot, index) => ({ slot, index }))
      .filter((x) => x.slot.value !== null);

    const isLQ = layout === "linear-queue";

    if (active.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-lg bg-[var(--cell-bg-empty)] text-center w-full min-h-[160px]">
          <div className="font-mono text-sm text-muted-foreground mb-4">
            {isLQ ? "Queue is Empty" : "Linked List is Empty"}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-[var(--pointer-front)]/10 px-2 py-0.5 text-[var(--pointer-front)] font-semibold border border-[var(--pointer-front)]/20">
                {isLQ ? "front" : "head / front"}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="text-[var(--hl-delete)] font-semibold">{isLQ ? "-1" : "NULL"}</span>
            </div>
            {(isDoubly || isLQ) && (
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-[var(--pointer-rear)]/10 px-2 py-0.5 text-[var(--pointer-rear)] font-semibold border border-[var(--pointer-rear)]/20">
                  {isLQ ? "rear" : "tail / rear"}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-[var(--hl-delete)] font-semibold">{isLQ ? "-1" : "NULL"}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-6 w-full overflow-x-auto scrollbar-none no-scrollbar">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 min-w-max px-4">
          {active.map((item, idx) => {
            const i = item.index;
            const isLast = idx === active.length - 1;

            return (
              <React.Fragment key={item.slot.id}>
                <div className="animate-fade-in">
                  {renderCompoundCell(i)}
                </div>
                {!isLast ? (
                  <div className="flex items-center justify-center text-black dark:text-white select-none font-extrabold text-2xl font-mono mx-0.5 animate-fade-in">
                    {isDoubly ? "⇄" : "→"}
                  </div>
                ) : (
                  isCircularList && (
                    <div className="flex items-center justify-center select-none font-mono ml-1 animate-fade-in">
                      <span className="text-xs text-black dark:text-white font-semibold border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 rounded px-1.5 py-0.5 animate-pulse">
                        ↩ loop
                      </span>
                    </div>
                  )
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  if (isCircular) {
    const capacity = slots.length;
    const boxWidth = layout === "circular-doubly-list" ? 128 : 96;
    const radius = Math.max(150, (capacity * (boxWidth + 40)) / (2 * Math.PI));
    const containerSize = radius * 2 + 180;
    const center = containerSize / 2;

    const active = slots
      .map((slot, index) => ({ slot, index }))
      .filter((x) => x.slot.value !== null);

    // Resolve pointers
    let frontPtr = -2;
    let rearPtr = -2;
    let frontLabel = "front";
    let rearLabel = "rear";

    if (layout === "circular") {
      frontPtr = front;
      rearPtr = rear;
    } else if (isCircularList && active.length > 0) {
      frontPtr = active[0].index;
      rearPtr = active[active.length - 1].index;
      frontLabel = "head";
      rearLabel = "tail";
    }

    const hubText = layout === "circular" ? "Ring" : layout === "circular-singly-list" ? "S-Ring" : "D-Ring";

    return (
      <div className="w-full overflow-auto scrollbar-none no-scrollbar flex flex-col items-center justify-center py-6">
        <div 
          className="relative animate-fade-in" 
          style={{ width: containerSize, height: containerSize }}
        >
          {/* SVG Track and Pointers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 text-black dark:text-white">
            <defs>
              <marker
                id="arrow-black"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
              </marker>
              <marker
                id="arrow-front"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--pointer-front)" />
              </marker>
              <marker
                id="arrow-rear"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--pointer-rear)" />
              </marker>
            </defs>

            {/* Circular track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="opacity-60"
            />

            {/* Circular queue connection arrows between consecutive active slots */}
            {layout === "circular" && active.length > 1 && (() => {
              const lines: React.ReactNode[] = [];
              for (let idx = 0; idx < active.length; idx++) {
                const curr = active[idx];
                // For circular queue, next active may not be adjacent slot-wise;
                // but we draw the logical next pointer: curr→next in active order
                const next = active[(idx + 1) % active.length];
                // Only draw for non-wrap if queue didn't wrap, else draw all
                const isLast = idx === active.length - 1;
                // draw all arrows including wrap-around
                const angleCurr = (curr.index * 2 * Math.PI) / capacity - Math.PI / 2;
                const x1 = center + radius * Math.cos(angleCurr);
                const y1 = center + radius * Math.sin(angleCurr);
                const angleNext = (next.index * 2 * Math.PI) / capacity - Math.PI / 2;
                const x2 = center + radius * Math.cos(angleNext);
                const y2 = center + radius * Math.sin(angleNext);
                const dx = x2 - x1; const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 40) {
                  const halfBox = 48;
                  const startX = x1 + (dx * halfBox) / len;
                  const startY = y1 + (dy * halfBox) / len;
                  const endX = x2 - (dx * halfBox) / len;
                  const endY = y2 - (dy * halfBox) / len;
                  const mx = (startX + endX) / 2;
                  const my = (startY + endY) / 2;
                  const cx2 = mx - center; const cy2 = my - center;
                  const cLen = Math.sqrt(cx2 * cx2 + cy2 * cy2);
                  const ctrlX = cLen > 0 ? mx + (cx2 / cLen) * 28 : mx;
                  const ctrlY = cLen > 0 ? my + (cy2 / cLen) * 28 : my;
                  lines.push(
                    <path
                      key={`cq-${curr.index}-${next.index}`}
                      d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={isLast ? "4 3" : undefined}
                      markerEnd="url(#arrow-black)"
                      className="animate-fade-in"
                    />
                  );
                }
              }
              return lines;
            })()}

            {/* List connection arrows between active elements */}
            {isCircularList && active.length > 0 && (() => {
              const lines: React.ReactNode[] = [];
              for (let idx = 0; idx < active.length; idx++) {
                const curr = active[idx];
                const next = active[(idx + 1) % active.length];
                
                if (active.length === 1) {
                  const angle = (curr.index * 2 * Math.PI) / capacity - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  lines.push(
                    <path
                      key={`loop-${curr.index}`}
                      d={`M ${x - 10} ${y - 30} C ${x - 30} ${y - 60}, ${x + 30} ${y - 60}, ${x + 10} ${y - 30}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      markerEnd="url(#arrow-black)"
                    />
                  );
                  continue;
                }

                // Calculate positions
                const angleCurr = (curr.index * 2 * Math.PI) / capacity - Math.PI / 2;
                const x1 = center + radius * Math.cos(angleCurr);
                const y1 = center + radius * Math.sin(angleCurr);

                const angleNext = (next.index * 2 * Math.PI) / capacity - Math.PI / 2;
                const x2 = center + radius * Math.cos(angleNext);
                const y2 = center + radius * Math.sin(angleNext);

                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);

                if (len > 60) {
                  const startX = x1 + (dx * 45) / len;
                  const startY = y1 + (dy * 45) / len;
                  const endX = x2 - (dx * 45) / len;
                  const endY = y2 - (dy * 45) / len;

                  const mx = (startX + endX) / 2;
                  const my = (startY + endY) / 2;
                  const cx = mx - center;
                  const cy = my - center;
                  const cLen = Math.sqrt(cx * cx + cy * cy);
                  const pushDist = 30;
                  const ctrlX = mx + (cx / cLen) * pushDist;
                  const ctrlY = my + (cy / cLen) * pushDist;

                  lines.push(
                    <g key={`conn-${curr.index}-${next.index}`} className="animate-fade-in text-black dark:text-white">
                      <path
                        d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        markerEnd="url(#arrow-black)"
                      />
                      {layout === "circular-doubly-list" && (
                        <path
                          d={`M ${endX} ${endY} Q ${ctrlX} ${ctrlY} ${startX} ${startY}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          markerEnd="url(#arrow-black)"
                        />
                      )}
                    </g>
                  );
                }
              }
              return lines;
            })()}

            {/* Front/Head pointer arrow */}
            {frontPtr >= 0 && frontPtr < capacity && (() => {
              const angle = (frontPtr * 2 * Math.PI) / capacity - Math.PI / 2;
              const xEnd = center + (radius - 45) * Math.cos(angle);
              const yEnd = center + (radius - 45) * Math.sin(angle);
              const xText = center + (radius - 85) * Math.cos(angle);
              const yText = center + (radius - 85) * Math.sin(angle);
              return (
                <g className="animate-fade-in">
                  <line
                    x1={center}
                    y1={center}
                    x2={xEnd}
                    y2={yEnd}
                    stroke="var(--pointer-front)"
                    strokeWidth="2"
                    markerEnd="url(#arrow-front)"
                  />
                  <rect
                    x={xText - 22}
                    y={yText - 9}
                    width="44"
                    height="18"
                    rx="3"
                    fill="var(--card)"
                    stroke="var(--pointer-front)"
                    strokeWidth="1"
                    className="opacity-95"
                  />
                  <text
                    x={xText}
                    y={yText + 1}
                    fill="var(--pointer-front)"
                    fontSize="9px"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {frontLabel}
                  </text>
                </g>
              );
            })()}

            {/* Rear/Tail pointer arrow */}
            {rearPtr >= 0 && rearPtr < capacity && (() => {
              const angle = (rearPtr * 2 * Math.PI) / capacity - Math.PI / 2;
              const xEnd = center + (radius - 45) * Math.cos(angle);
              const yEnd = center + (radius - 45) * Math.sin(angle);
              const xText = center + (radius - 85) * Math.cos(angle);
              const yText = center + (radius - 85) * Math.sin(angle);
              return (
                <g className="animate-fade-in">
                  <line
                    x1={center}
                    y1={center}
                    x2={xEnd}
                    y2={yEnd}
                    stroke="var(--pointer-rear)"
                    strokeWidth="2"
                    markerEnd="url(#arrow-rear)"
                  />
                  <rect
                    x={xText - 20}
                    y={yText - 9}
                    width="40"
                    height="18"
                    rx="3"
                    fill="var(--card)"
                    stroke="var(--pointer-rear)"
                    strokeWidth="1"
                    className="opacity-95"
                  />
                  <text
                    x={xText}
                    y={yText + 1}
                    fill="var(--pointer-rear)"
                    fontSize="9px"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {rearLabel}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Center Hub */}
          <div 
            className="absolute rounded-full border-2 border-border bg-card flex items-center justify-center shadow-inner z-10 select-none"
            style={{
              left: `${center}px`,
              top: `${center}px`,
              width: "56px",
              height: "56px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase">{hubText}</span>
          </div>

          {/* Cells arranged in circle */}
          {slots.map((slot, i) => {
            const angle = (i * 2 * Math.PI) / capacity - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <div 
                key={slot.id} 
                className="absolute flex flex-col items-center justify-center z-20"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {renderCompoundCell(i)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isStack) {
    const activeStack = slots
      .map((slot, index) => ({ slot, index }))
      .filter((x) => x.slot.value !== null);
    return (
      <div className="flex flex-col-reverse items-center py-4 w-full max-h-[600px] overflow-y-auto scrollbar-none no-scrollbar">
        {slots.map((slot, i) => {
          const isActive = slot.value !== null;
          const isNotBottom = i > 0 && slots[i - 1]?.value !== null;
          return (
            <div key={slot.id} className="flex flex-col items-center">
              {isActive && isNotBottom && (
                <div className="flex items-center justify-center text-black dark:text-white select-none font-bold text-xl my-1 animate-fade-in">
                  <span className="leading-none">↑</span>
                </div>
              )}
              <div className="flex items-center gap-3 animate-fade-in">
                {renderCompoundCell(i)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // layout === "linear" / others (Arrays)
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

export function AddressTablePanel({
  slots,
  layout,
  front = -2,
  rear = -2,
  top = -2,
}: {
  slots: { id: number; value: number | null }[];
  layout: string;
  front?: number;
  rear?: number;
  top?: number;
}) {
  const active = slots
    .map((slot, index) => ({ slot, index }))
    .filter((x) => x.slot.value !== null);

  if (active.length === 0) {
    return (
      <PanelCard title="Address Table">
        <div className="text-xs text-muted-foreground text-center py-4 font-mono select-none">
          No active values (Empty)
        </div>
      </PanelCard>
    );
  }

  const isCircularList = layout === "circular-singly-list" || layout === "circular-doubly-list";
  const isLinkedList = layout === "singly-linked-list" || layout === "doubly-linked-list" || isCircularList;

  return (
    <PanelCard title="Address Table">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground select-none">
              <th className="py-1.5 px-2">Value</th>
              <th className="py-1.5 px-2">Address</th>
              <th className="py-1.5 px-2">Pointers</th>
            </tr>
          </thead>
          <tbody>
            {active.map(({ slot, index }) => {
              const address = "0x" + (0x3000 + index * 16).toString(16).toUpperCase();
              
              // Resolve pointer tags
              const tags: string[] = [];
              if (layout === "circular" || layout === "linear-queue") {
                if (index === front) tags.push("front");
                if (index === rear) tags.push("rear");
              } else if (isLinkedList) {
                if (index === active[0].index) tags.push("head");
                if (index === active[active.length - 1].index) tags.push("tail");
              } else if (layout === "stack") {
                if (index === top) tags.push("top");
              }

              return (
                <tr key={slot.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 px-2 font-semibold text-foreground">{slot.value}</td>
                  <td className="py-1.5 px-2 text-[var(--hl-peek)]">{address}</td>
                  <td className="py-1.5 px-2 select-none">
                    {tags.length > 0 ? (
                      <span className="flex gap-1">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              t === "front" || t === "head"
                                ? "bg-[var(--pointer-front)]/10 text-[var(--pointer-front)] border border-[var(--pointer-front)]/20"
                                : t === "rear" || t === "tail"
                                ? "bg-[var(--pointer-rear)]/10 text-[var(--pointer-rear)] border border-[var(--pointer-rear)]/20"
                                : "bg-[var(--hl-peek)]/10 text-[var(--hl-peek)] border border-[var(--hl-peek)]/20"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}