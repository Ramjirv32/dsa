import { useCallback, useRef, useState } from "react";
import { SPEED_MS, sleep, usePersistentState, type Highlight, type Speed } from "../engine";
import type { QueueState, Transition } from "../states";

export interface QueueSlot {
  id: number;
  value: number | null;
}

export interface UseCircularQueueOptions {
  initialCapacity: number;
  speed: Speed;
  stepMode: boolean;
}

export interface UseCircularQueue {
  capacity: number;
  slots: QueueSlot[];
  front: number; // -1 when empty
  rear: number; // -1 when empty
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
  enqueue: (v: number) => Promise<void>;
  dequeue: () => Promise<void>;
  peek: () => Promise<void>;
  search: (key: number) => Promise<void>;
  display: () => Promise<void>;
  randomFill: (n: number) => Promise<void>;
}

function makeSlots(cap: number): QueueSlot[] {
  return Array.from({ length: cap }, (_, i) => ({ id: i, value: null }));
}

export function useCircularQueue(opts: UseCircularQueueOptions): UseCircularQueue {
  const [capacity, setCapacityState] = usePersistentState("cq-capacity", opts.initialCapacity);
  const [slots, setSlots] = usePersistentState<QueueSlot[]>("cq-slots", () => makeSlots(opts.initialCapacity));
  const [front, setFront] = usePersistentState("cq-front", -1);
  const [rear, setRear] = usePersistentState("cq-rear", -1);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [state, setState] = usePersistentState<QueueState>("cq-state", "EMPTY");
  const [prevState, setPrevState] = usePersistentState<QueueState | null>("cq-prevState", null);
  const [history, setHistory] = usePersistentState<Transition<QueueState>[]>("cq-history", []);
  const [message, setMessage] = usePersistentState<string>("cq-message", "Circular Queue initialized — EMPTY");
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
    setFront(-1);
    setRear(-1);
    setHighlight(null);
    setPrevState(null);
    setHistory([]);
    setState("EMPTY");
    setMessage(`Capacity set to ${cap} — EMPTY`);
  }, []);

  const reset = useCallback(() => {
    setCapacity(capacity);
  }, [capacity, setCapacity]);

  const enqueue = useCallback(
    (value: number) =>
      guard(async () => {
        const isFull = front !== -1 && (rear + 1) % capacity === front;
        if (isFull) {
          transition("OVERFLOW", `enqueue(${value})`);
          setMessage(`OVERFLOW — cannot enqueue ${value}, queue is FULL`);
          await wait();
          transition("FULL", "recover");
          return;
        }
        transition("ENQUEUE", `enqueue(${value})`);
        setMessage(`Step 1 — check is_full(): false`);
        await wait();
        let f = front;
        let r = rear;
        if (f === -1) {
          f = 0;
          r = 0;
          setFront(0);
          setRear(0);
          setMessage(`Step 2 — queue empty, set front = rear = 0`);
          await wait();
        } else {
          r = (rear + 1) % capacity;
          setRear(r);
          setMessage(`Step 2 — rear = (rear + 1) % capacity → ${r}`);
          await wait();
        }
        const id = nextIdRef.current++;
        setSlots((s) => s.map((slot, i) => (i === r ? { id, value } : slot)));
        setHighlight({ index: r, kind: "insert" });
        setMessage(`Step 3 — queue[${r}] = ${value}`);
        await wait();
        const nowFull = (r + 1) % capacity === f;
        transition(nowFull ? "FULL" : "PARTIALLY_FILLED", "enqueue done");
        setMessage(`enqueued ${value} (front=${f}, rear=${r})`);
      }),
    [front, rear, capacity, guard, transition, wait],
  );

  const dequeue = useCallback(
    () =>
      guard(async () => {
        if (front === -1) {
          transition("UNDERFLOW", `dequeue()`);
          setMessage(`UNDERFLOW — queue is empty`);
          await wait();
          transition("EMPTY", "recover");
          return;
        }
        transition("DEQUEUE", `dequeue()`);
        const v = slots[front].value;
        setHighlight({ index: front, kind: "delete" });
        setMessage(`Step 1 — read queue[${front}] = ${v}`);
        await wait();
        const f = front;
        setSlots((s) => s.map((slot, i) => (i === f ? { ...slot, value: null } : slot)));
        setMessage(`Step 2 — clear queue[${f}]`);
        await wait();
        if (f === rear) {
          setFront(-1);
          setRear(-1);
          transition("EMPTY", "dequeue done");
          setMessage(`dequeued ${v} — queue now EMPTY (front=rear=-1)`);
        } else {
          const nextFront = (f + 1) % capacity;
          setFront(nextFront);
          transition("PARTIALLY_FILLED", "dequeue done");
          setMessage(`dequeued ${v} — front = (front + 1) % capacity → ${nextFront}`);
        }
      }),
    [front, rear, slots, capacity, guard, transition, wait],
  );

  const peek = useCallback(
    () =>
      guard(async () => {
        if (front === -1) {
          setMessage(`peek() — queue is EMPTY`);
          return;
        }
        setHighlight({ index: front, kind: "peek" });
        setMessage(`peek() — queue[${front}] = ${slots[front].value}`);
        await wait();
      }),
    [front, slots, guard, wait],
  );

  const search = useCallback(
    (key: number) =>
      guard(async () => {
        if (front === -1) {
          setMessage(`search(${key}) — queue is EMPTY → NOT FOUND`);
          return;
        }
        let i = front;
        for (;;) {
          setHighlight({ index: i, kind: "peek" });
          setMessage(`search(${key}) — compare queue[${i}] = ${slots[i].value}`);
          await wait();
          if (slots[i].value === key) {
            setMessage(`FOUND ${key} at index ${i}`);
            await wait();
            return;
          }
          if (i === rear) break;
          i = (i + 1) % capacity;
        }
        setMessage(`NOT FOUND — ${key} is not in the queue`);
      }),
    [front, rear, slots, capacity, guard, wait],
  );

  const display = useCallback(
    () =>
      guard(async () => {
        if (front === -1) {
          setMessage(`display() → [ ]`);
          return;
        }
        const parts: string[] = [];
        let i = front;
        for (;;) {
          setHighlight({ index: i, kind: "peek" });
          parts.push(String(slots[i].value));
          setMessage(`display() → [ ${parts.join(", ")} ]`);
          await wait();
          if (i === rear) break;
          i = (i + 1) % capacity;
        }
      }),
    [front, rear, slots, capacity, guard, wait],
  );

  const randomFill = useCallback(
    (n: number) =>
      guard(async () => {
        // Circular queue fill logic
        let count = 0;
        let r = rear;
        let f = front;
        for (let i = 0; i < n; i++) {
          const isFull = f !== -1 && (r + 1) % capacity === f;
          if (isFull) break;
          const v = Math.floor(Math.random() * 99) + 1;
          if (f === -1) {
            f = 0;
            r = 0;
            setFront(0);
          } else {
            r = (r + 1) % capacity;
          }
          setRear(r);
          const id = nextIdRef.current++;
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          setSlots((s) => s.map((slot, idx) => (idx === r ? { id, value: v } : slot)));
          setHighlight({ index: r, kind: "insert" });
          setMessage(`random enqueue ${v} → index ${r}`);
          transition((r + 1) % capacity === f ? "FULL" : "PARTIALLY_FILLED", `enqueue(${v})`);
          await wait();
          count++;
        }
        if (count < n) {
          setMessage(`random fill stopped — queue FULL after ${count} of ${n}`);
        }
      }),
    [capacity, rear, front, guard, transition, wait],
  );

  return {
    capacity,
    slots,
    front,
    rear,
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
    enqueue,
    dequeue,
    peek,
    search,
    display,
    randomFill,
  };
}
