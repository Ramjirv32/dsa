export const QUEUE_STATES = [
  "EMPTY",
  "PARTIALLY_FILLED",
  "FULL",
  "OVERFLOW",
  "UNDERFLOW",
  "ENQUEUE",
  "DEQUEUE",
] as const;
export type QueueState = (typeof QUEUE_STATES)[number];

export const STACK_STATES = [
  "EMPTY",
  "PARTIALLY_FILLED",
  "FULL",
  "PUSH",
  "POP",
  "OVERFLOW",
  "UNDERFLOW",
] as const;
export type StackState = (typeof STACK_STATES)[number];

export const LIST_STATES = [
  "HEAD_NULL",
  "TRAVERSING",
  "INSERTING",
  "DELETING",
  "SEARCHING",
  "FOUND",
  "NOT_FOUND",
] as const;
export type ListState = (typeof LIST_STATES)[number];

export const ARRAY_STATES = [
  "EMPTY",
  "INSERTING",
  "DELETING",
  "RESIZING",
  "SEARCHING",
  "FULL",
] as const;
export type ArrayState = (typeof ARRAY_STATES)[number];

export interface Transition<S extends string> {
  from: S | null;
  to: S;
  op: string;
  at: number; // timestamp
}