export interface DSEntry {
  slug: string;
  name: string;
  family: string;
  blurb: string;
  status: "ready" | "soon";
}

export const FAMILIES = [
  "Queues",
  "Stacks",
  "Arrays",
  "Linked Lists",
  "Searching",
] as const;

export const REGISTRY: DSEntry[] = [
  { slug: "linear-queue", name: "Linear Queue", family: "Queues", blurb: "Array-based FIFO with front/rear pointers", status: "ready" },
  { slug: "circular-queue", name: "Circular Queue", family: "Queues", blurb: "Ring buffer reusing freed slots", status: "ready" },
  { slug: "deque", name: "Deque", family: "Queues", blurb: "Double-ended queue", status: "soon" },
  { slug: "circular-deque", name: "Circular Deque", family: "Queues", blurb: "Wrap-around double-ended queue", status: "soon" },

  { slug: "stack", name: "Simple Stack", family: "Stacks", blurb: "Classic array-based LIFO", status: "ready" },

  { slug: "static-array", name: "Static Array", family: "Arrays", blurb: "Fixed-capacity array with index ops", status: "ready" },
  { slug: "dynamic-array", name: "Dynamic Array", family: "Arrays", blurb: "Capacity-doubling growable array", status: "ready" },

  { slug: "singly-linked-list", name: "Singly Linked List", family: "Linked Lists", blurb: "Forward-only chained nodes", status: "ready" },
  { slug: "doubly-linked-list", name: "Doubly Linked List", family: "Linked Lists", blurb: "Bidirectional chained nodes", status: "ready" },
  { slug: "circular-singly-list", name: "Circular Singly List", family: "Linked Lists", blurb: "Tail loops back to head", status: "ready" },
  { slug: "circular-doubly-list", name: "Circular Doubly List", family: "Linked Lists", blurb: "Both directions wrap around", status: "ready" },

  { slug: "linear-search", name: "Linear Search", family: "Searching", blurb: "Scan every element", status: "ready" },
  { slug: "binary-search", name: "Binary Search", family: "Searching", blurb: "Halve a sorted range", status: "ready" },
];

export function getEntry(slug: string): DSEntry | undefined {
  return REGISTRY.find((e) => e.slug === slug);
}