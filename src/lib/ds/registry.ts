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
  { slug: "queue-two-stacks", name: "Queue via 2 Stacks", family: "Queues", blurb: "FIFO built from two LIFOs", status: "soon" },

  { slug: "stack", name: "Simple Stack", family: "Stacks", blurb: "Classic array-based LIFO", status: "ready" },
  { slug: "stack-two-queues", name: "Stack via 2 Queues", family: "Stacks", blurb: "LIFO built from two FIFOs", status: "soon" },

  { slug: "static-array", name: "Static Array", family: "Arrays", blurb: "Fixed-capacity array with index ops", status: "soon" },
  { slug: "dynamic-array", name: "Dynamic Array", family: "Arrays", blurb: "Capacity-doubling growable array", status: "soon" },

  { slug: "singly-linked-list", name: "Singly Linked List", family: "Linked Lists", blurb: "Forward-only chained nodes", status: "soon" },
  { slug: "doubly-linked-list", name: "Doubly Linked List", family: "Linked Lists", blurb: "Bidirectional chained nodes", status: "soon" },
  { slug: "circular-singly-list", name: "Circular Singly List", family: "Linked Lists", blurb: "Tail loops back to head", status: "soon" },
  { slug: "circular-doubly-list", name: "Circular Doubly List", family: "Linked Lists", blurb: "Both directions wrap around", status: "soon" },

  { slug: "linear-search", name: "Linear Search", family: "Searching", blurb: "Scan every element", status: "soon" },
  { slug: "binary-search", name: "Binary Search", family: "Searching", blurb: "Halve a sorted range", status: "soon" },
];

export function getEntry(slug: string): DSEntry | undefined {
  return REGISTRY.find((e) => e.slug === slug);
}