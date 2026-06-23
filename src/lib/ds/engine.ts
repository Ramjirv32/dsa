import { useState, useEffect } from "react";
export type Speed = "slow" | "normal" | "fast";

export function usePersistentState<T>(key: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        if (item) return JSON.parse(item);
      }
    } catch (e) {
      console.warn("Error reading localStorage", e);
    }
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (e) {
      console.warn("Error writing localStorage", e);
    }
  }, [key, state]);

  return [state, setState] as const;
}

export const SPEED_MS: Record<Speed, number> = {
  slow: 700,
  normal: 350,
  fast: 100,
};

export class SimulationCancelledError extends Error {
  constructor() {
    super("Simulation cancelled");
    this.name = "SimulationCancelledError";
  }
}

if (typeof window !== "undefined") {
  (window as any).__simControls = (window as any).__simControls || {
    isPaused: false,
    delayMs: 350,
    iterationCount: 0,
    elapsedTime: 0,
    onStepTriggered: null,
    pauseResolver: null,
    simulationId: 0,
  };
}

export async function sleep(ms: number): Promise<void> {
  const controls = typeof window !== "undefined" ? (window as any).__simControls : null;
  const startId = controls ? controls.simulationId : 0;
  
  let targetDelay = controls ? controls.delayMs : ms;
  let accumulated = 0;
  
  while (accumulated < targetDelay) {
    if (controls) {
      if (controls.simulationId !== startId) {
        throw new SimulationCancelledError();
      }
      targetDelay = controls.delayMs;
      
      if (controls.isPaused) {
        await new Promise<void>((r) => {
          controls.pauseResolver = r;
        });
        continue;
      }
    }
    
    const chunk = Math.min(25, targetDelay - accumulated);
    await new Promise((r) => setTimeout(r, chunk));
    accumulated += chunk;
    
    if (controls) {
      if (controls.simulationId !== startId) {
        throw new SimulationCancelledError();
      }
      controls.elapsedTime += chunk;
      if (controls.onStepTriggered) {
        controls.onStepTriggered();
      }
    }
  }
  
  if (controls) {
    if (controls.simulationId !== startId) {
      throw new SimulationCancelledError();
    }
    controls.iterationCount += 1;
    if (controls.onStepTriggered) {
      controls.onStepTriggered();
    }
  }
}

export type HighlightKind = "insert" | "delete" | "peek" | null;

export interface Highlight {
  index: number;
  kind: Exclude<HighlightKind, null>;
}

export function highlightClass(kind: HighlightKind): string {
  switch (kind) {
    case "insert":
      return "ring-2 ring-[var(--hl-insert)] shadow-[0_0_16px_var(--hl-insert)]";
    case "delete":
      return "ring-2 ring-[var(--hl-delete)] shadow-[0_0_16px_var(--hl-delete)]";
    case "peek":
      return "ring-2 ring-[var(--hl-peek)] shadow-[0_0_16px_var(--hl-peek)]";
    default:
      return "";
  }
}

/** Generate N random integers in [min, max] */
export function randomInts(n: number, min = 1, max = 99): number[] {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  );
}

/** Format pretend memory addresses for a slot index */
export function memAddress(base: number, index: number, stride = 4): string {
  return "0x" + (base + index * stride).toString(16).toUpperCase().padStart(4, "0");
}