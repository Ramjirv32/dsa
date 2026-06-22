import { useCallback, useRef, useState } from "react";
import { SPEED_MS, sleep, usePersistentState, type Highlight, type Speed } from "../engine";
import type { QueueState, Transition } from "../states";

export interface StackSlot {
  id: number;
  value: number | null;
}

export interface UseStackOptions {
  initialCapacity: number;
  speed: Speed;
  stepMode: boolean;
}

export interface UseStack {
  capacity: number;
  slots: StackSlot[];
  top: number; // -1 when empty
  highlight: Highlight | null;
  state: QueueState;
  prevState: QueueState | null;
  history: Transition<QueueState>[];
  message: string;
  animating: boolean;
  stepPending: boolean;
  nextStep: () => void;
  setCapacity: (n: number) => void;
  reset: () => void;
  push: (v: number) => Promise<void>;
  pop: () => Promise<void>;
  peek: () => Promise<void>;
  search: (key: number) => Promise<void>;
  display: () => Promise<void>;
  randomFill: (n: number) => Promise<void>;
}

function makeSlots(cap: number): StackSlot[] {
  return Array.from({ length: cap }, (_, i) => ({ id: i, value: null }));
}

export function useStack(opts: UseStackOptions): UseStack {
  const [capacity, setCapacityState] = usePersistentState("st-capacity", opts.initialCapacity);
  const [slots, setSlots] = usePersistentState<StackSlot[]>("st-slots", () => makeSlots(opts.initialCapacity));
  const [top, setTop] = usePersistentState("st-top", -1);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [state, setState] = usePersistentState<QueueState>("st-state", "EMPTY");
  const [prevState, setPrevState] = usePersistentState<QueueState | null>("st-prevState", null);
  const [history, setHistory] = usePersistentState<Transition<QueueState>[]>("st-history", []);
  const [message, setMessage] = usePersistentState<string>("st-message", "Stack initialized — EMPTY");
  const [animating, setAnimating] = useState(false);
  const [stepPending, setStepPending] = useState(false);
  const lock = useRef(false);
  const stepResolver = useRef<(() => void) | null>(null);
  const nextIdRef = useRef(opts.initialCapacity);

  const stepHold = useCallback(async () => {
    if (!opts.stepMode) return;
    setStepPending(true);
    await new Promise<void>((res) => {
      stepResolver.current = () => {
        stepResolver.current = null;
        setStepPending(false);
        res();
      };
    });
  }, [opts.stepMode]);

  const nextStep = useCallback(() => {
    stepResolver.current?.();
  }, []);

  const transition = useCallback((to: QueueState, op: string) => {
    setState((cur) => {
      setPrevState(cur);
      setHistory((h) => [...h, { from: cur, to, op, at: Date.now() }].slice(-50));
      return to;
    });
  }, []);

  const wait = useCallback(async () => {
    await sleep(SPEED_MS[opts.speed]);
    await stepHold();
  }, [opts.speed, stepHold]);

  const guard = useCallback(
    async (fn: () => Promise<void>) => {
      if (lock.current) return;
      lock.current = true;
      setAnimating(true);
      try {
        await fn();
      } finally {
        setHighlight(null);
        setAnimating(false);
        lock.current = false;
      }
    },
    [],
  );

  const setCapacity = useCallback((n: number) => {
    if (lock.current) return;
    const cap = Math.max(1, Math.min(1024, Math.floor(n)));
    setCapacityState(cap);
    setSlots(makeSlots(cap));
    nextIdRef.current = cap;
    setTop(-1);
    setHighlight(null);
    setPrevState(null);
    setHistory([]);
    setState("EMPTY");
    setMessage(`Capacity set to ${cap} — EMPTY`);
  }, []);

  const reset = useCallback(() => {
    setCapacity(capacity);
  }, [capacity, setCapacity]);

  const push = useCallback(
    (value: number) =>
      guard(async () => {
        if (top === capacity - 1) {
          transition("OVERFLOW", `push(${value})`);
          setMessage(`OVERFLOW — cannot push ${value}, top == CAP-1`);
          await wait();
          transition("FULL", "recover");
          return;
        }
        transition("ENQUEUE", `push(${value})`); // Use ENQUEUE state mapping
        setMessage(`Step 1 — check is_full(): false`);
        await wait();
        const t = top + 1;
        setTop(t);
        setMessage(`Step 2 — top++ → ${t}`);
        await wait();
        const id = nextIdRef.current++;
        setSlots((s) => s.map((slot, i) => (i === t ? { id, value } : slot)));
        setHighlight({ index: t, kind: "insert" });
        setMessage(`Step 3 — stack[${t}] = ${value}`);
        await wait();
        const isFull = t === capacity - 1;
        transition(isFull ? "FULL" : "PARTIALLY_FILLED", "push done");
        setMessage(`pushed ${value} (top=${t}, size=${t + 1})`);
      }),
    [top, capacity, guard, transition, wait],
  );

  const pop = useCallback(
    () =>
      guard(async () => {
        if (top === -1) {
          transition("UNDERFLOW", `pop()`);
          setMessage(`UNDERFLOW — stack is empty`);
          await wait();
          transition("EMPTY", "recover");
          return;
        }
        transition("DEQUEUE", `pop()`);
        const v = slots[top].value;
        setHighlight({ index: top, kind: "delete" });
        setMessage(`Step 1 — read stack[${top}] = ${v}`);
        await wait();
        const t = top;
        setSlots((s) => s.map((slot, i) => (i === t ? { ...slot, value: null } : slot)));
        setMessage(`Step 2 — clear stack[${t}]`);
        await wait();
        const nextTop = t - 1;
        setTop(nextTop);
        transition(nextTop === -1 ? "EMPTY" : "PARTIALLY_FILLED", "pop done");
        setMessage(`popped ${v} — top-- → ${nextTop}`);
      }),
    [top, slots, guard, transition, wait],
  );

  const peek = useCallback(
    () =>
      guard(async () => {
        if (top === -1) {
          setMessage(`peek() — stack is EMPTY`);
          return;
        }
        setHighlight({ index: top, kind: "peek" });
        setMessage(`peek() — stack[${top}] = ${slots[top].value}`);
        await wait();
      }),
    [top, slots, guard, wait],
  );

  const search = useCallback(
    (key: number) =>
      guard(async () => {
        if (top === -1) {
          setMessage(`search(${key}) — stack is EMPTY → NOT FOUND`);
          return;
        }
        // Search from top down
        for (let i = top; i >= 0; i--) {
          setHighlight({ index: i, kind: "peek" });
          setMessage(`search(${key}) — compare stack[${i}] = ${slots[i].value}`);
          await wait();
          if (slots[i].value === key) {
            setMessage(`FOUND ${key} at index ${i} (distance from top = ${top - i})`);
            await wait();
            return;
          }
        }
        setMessage(`NOT FOUND — ${key} is not in the stack`);
      }),
    [top, slots, guard, wait],
  );

  const display = useCallback(
    () =>
      guard(async () => {
        if (top === -1) {
          setMessage(`display() → [ ]`);
          return;
        }
        const parts: string[] = [];
        for (let i = 0; i <= top; i++) {
          setHighlight({ index: i, kind: "peek" });
          parts.push(String(slots[i].value));
          setMessage(`display() → [ ${parts.join(", ")} ]`);
          await wait();
        }
      }),
    [top, slots, guard, wait],
  );

  const randomFill = useCallback(
    (n: number) =>
      guard(async () => {
        const room = capacity - 1 - top;
        const count = Math.min(n, room);
        for (let i = 0; i < count; i++) {
          const v = Math.floor(Math.random() * 99) + 1;
          const newTop = top + 1 + i;
          setTop(newTop);
          const id = nextIdRef.current++;
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          setSlots((s) => s.map((slot, idx) => (idx === newTop ? { id, value: v } : slot)));
          setHighlight({ index: newTop, kind: "insert" });
          setMessage(`random push ${v} → index ${newTop}`);
          transition(newTop === capacity - 1 ? "FULL" : "PARTIALLY_FILLED", `push(${v})`);
          await wait();
        }
        if (count < n) {
          setMessage(`random fill stopped — stack FULL after ${count} of ${n}`);
        }
      }),
    [capacity, top, guard, transition, wait],
  );

  return {
    capacity,
    slots,
    top,
    highlight,
    state,
    prevState,
    history,
    message,
    animating,
    stepPending,
    nextStep,
    setCapacity,
    reset,
    push,
    pop,
    peek,
    search,
    display,
    randomFill,
  };
}
