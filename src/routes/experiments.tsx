import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, FlaskConical, Code, Play, StepForward, RotateCcw,
  Plus, Trash2, ArrowUp, ArrowDown, ChevronRight, ChevronLeft,
  Compass, Globe, RefreshCw, User, Check, Book, Folder, File,
  FilePlus, FolderPlus, MapPin, Eye
} from "lucide-react";
import { useSimulationControls, SimulationControlToolbar } from "./ds.$slug";
import { sleep, SimulationCancelledError } from "@/lib/ds/engine";

const startSimOp = () => {
  if (typeof window !== "undefined") {
    const controls = (window as any).__simControls;
    if (controls) {
      controls.iterationCount = 0;
      controls.elapsedTime = 0;
      controls.isPaused = false;
      controls.animating = true;
      controls.simulationId = (controls.simulationId || 0) + 1;
      if (controls.onStepTriggered) {
        controls.onStepTriggered();
      }
    }
  }
};

const stopSimOp = () => {
  if (typeof window !== "undefined") {
    const controls = (window as any).__simControls;
    if (controls) {
      controls.animating = false;
      if (controls.onStepTriggered) {
        controls.onStepTriggered();
      }
    }
  }
};


// Route declaration
export const Route = createFileRoute("/experiments")({
  head: () => ({
    meta: [
      { title: "Experiments Lab — DSA Visualizer" },
      { name: "description", content: "Interactive simulations of real-world DSA applications: playlists, browser history, Dijkstra shortest path, Prims MST, sorting, file system trees, and hashing." }
    ]
  }),
  component: ExperimentsLab,
});

// Definitions of the 10 Experiments
interface ExperimentDef {
  id: number;
  title: string;
  desc: string;
  cCode: string;
}

const EXPERIMENTS: ExperimentDef[] = [
  {
    id: 1,
    title: "Music Playlist Manager",
    desc: "Simulate a music playlist using a doubly linked list. Songs can be added, deleted, played, or moved up/down dynamically to reorder the playlist.",
    cCode: `// C Implementation of a Doubly Linked List Music Playlist
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Song {
    int id;
    char title[100];
    struct Song* prev;
    struct Song* next;
};

struct Song* head = NULL;
struct Song* current_track = NULL;
int id_counter = 1;

struct Song* create_song(const char* title) {
    struct Song* new_song = (struct Song*)malloc(sizeof(struct Song));
    new_song->id = id_counter++;
    strcpy(new_song->title, title);
    new_song->prev = NULL;
    new_song->next = NULL;
    return new_song;
}

void add_song(const char* title) {
    struct Song* new_song = create_song(title);
    if (head == NULL) {
        head = new_song;
        current_track = new_song;
        return;
    }
    struct Song* temp = head;
    while (temp->next != NULL) {
        temp = temp->next;
    }
    temp->next = new_song;
    new_song->prev = temp;
}

void delete_song(int id) {
    if (head == NULL) return;
    struct Song* temp = head;
    while (temp != NULL && temp->id != id) {
        temp = temp->next;
    }
    if (temp == NULL) return; // Not found

    if (temp == head) {
        head = head->next;
        if (head) head->prev = NULL;
    } else {
        temp->prev->next = temp->next;
        if (temp->next) temp->next->prev = temp->prev;
    }
    
    if (current_track == temp) {
        current_track = temp->next ? temp->next : head;
    }
    free(temp);
}

void move_up(int id) {
    if (head == NULL || head->id == id) return;
    struct Song* temp = head;
    while (temp != NULL && temp->id != id) {
        temp = temp->next;
    }
    if (temp == NULL) return;

    struct Song* p = temp->prev;
    // Swap temp and p
    if (p->prev) p->prev->next = temp;
    else head = temp;

    temp->prev = p->prev;
    p->next = temp->next;
    if (temp->next) temp->next->prev = p;
    temp->next = p;
    p->prev = temp;
}

void move_down(int id) {
    if (head == NULL) return;
    struct Song* temp = head;
    while (temp != NULL && temp->id != id) {
        temp = temp->next;
    }
    if (temp == NULL || temp->next == NULL) return;

    struct Song* n = temp->next;
    // Swap temp and n
    if (temp->prev) temp->prev->next = n;
    else head = n;

    n->prev = temp->prev;
    temp->next = n->next;
    if (n->next) n->next->prev = temp;
    n->next = temp;
    temp->prev = n;
}

void play_next() {
    if (current_track && current_track->next) {
        current_track = current_track->next;
    }
}

void play_prev() {
    if (current_track && current_track->prev) {
        current_track = current_track->prev;
    }
}

int main(void) {
    add_song("Bohemian Rhapsody");
    add_song("Imagine");
    add_song("Hotel California");
    
    // Play next
    play_next();
    
    // Move "Hotel California" up
    move_up(3);
    
    // Delete song with id 2
    delete_song(2);
    
    return 0;
}`
  },
  {
    id: 2,
    title: "Browser History (Two Stacks)",
    desc: "Manage 'Back' and 'Forward' history operations in a simulated browser viewport using two stacks: Back Stack and Forward Stack.",
    cCode: `// C Implementation of Browser Back/Forward Stack Navigation
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STACK_SIZE 100

struct HistoryStack {
    char urls[MAX_STACK_SIZE][128];
    int top;
};

struct HistoryStack back_stack = { .top = -1 };
struct HistoryStack forward_stack = { .top = -1 };
char current_url[128] = "homepage.com";

void push(struct HistoryStack* s, const char* url) {
    if (s->top < MAX_STACK_SIZE - 1) {
        s->top++;
        strcpy(s->urls[s->top], url);
    }
}

char* pop(struct HistoryStack* s) {
    if (s->top >= 0) {
        return s->urls[s->top--];
    }
    return NULL;
}

void visit_url(const char* url) {
    // Push current URL to back stack
    push(&back_stack, current_url);
    // Set new current URL
    strcpy(current_url, url);
    // Clear forward stack
    forward_stack.top = -1;
}

void go_back() {
    if (back_stack.top >= 0) {
        push(&forward_stack, current_url);
        strcpy(current_url, pop(&back_stack));
    } else {
        printf("Cannot go back. History is empty.\\n");
    }
}

void go_forward() {
    if (forward_stack.top >= 0) {
        push(&back_stack, current_url);
        strcpy(current_url, pop(&forward_stack));
    } else {
        printf("Cannot go forward. Forward history is empty.\\n");
    }
}

int main(void) {
    visit_url("google.com");
    visit_url("github.com/kpr");
    
    go_back(); // Back to google.com
    go_forward(); // Forward to github.com/kpr
    
    return 0;
}`
  },
  {
    id: 3,
    title: "Bank Customer Service Queue",
    desc: "Simulate a live queue at a bank counter using the Queue ADT. Enqueue customers as they arrive, and dequeue them as they are served.",
    cCode: `// C Implementation of Bank Customer Queue simulation (Queue ADT)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define QUEUE_CAPACITY 8

struct Customer {
    int ticket_no;
    char name[64];
};

struct BankQueue {
    struct Customer items[QUEUE_CAPACITY];
    int front;
    int rear;
    int size;
};

struct BankQueue q = { .front = 0, .rear = -1, .size = 0 };
int ticket_counter = 100;

void enqueue(const char* name) {
    if (q.size >= QUEUE_CAPACITY) {
        printf("Queue overflow! The counter line is full.\\n");
        return;
    }
    q.rear = (q.rear + 1) % QUEUE_CAPACITY;
    q.items[q.rear].ticket_no = ++ticket_counter;
    strcpy(q.items[q.rear].name, name);
    q.size++;
}

struct Customer dequeue() {
    struct Customer empty = { .ticket_no = -1, .name = "" };
    if (q.size == 0) {
        printf("Queue underflow! No customers in queue.\\n");
        return empty;
    }
    struct Customer served = q.items[q.front];
    q.front = (q.front + 1) % QUEUE_CAPACITY;
    q.size--;
    return served;
}

int main(void) {
    enqueue("Ramji");
    enqueue("Alice");
    enqueue("Bob");
    
    struct Customer c1 = dequeue(); // Serves Ramji
    enqueue("Charlie");
    
    return 0;
}`
  },
  {
    id: 4,
    title: "Bubble Sort & Insertion Sort",
    desc: "Compare Bubble Sort and Insertion Sort algorithms visually. Step through comparisons, values shifting, and elements becoming sorted.",
    cCode: `// C Implementation of Bubble Sort & Insertion Sort
#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main(void) {
    int arr1[5] = {34, 12, 5, 67, 1};
    bubble_sort(arr1, 5);
    
    int arr2[5] = {34, 12, 5, 67, 1};
    insertion_sort(arr2, 5);
    return 0;
}`
  },
  {
    id: 5,
    title: "Shell Sort Visualizer",
    desc: "Visualize Shell Sort, a generalization of insertion sort that allows swaps of elements far apart, dynamically shrinking the gap size.",
    cCode: `// C Implementation of Shell Sort
#include <stdio.h>

void shell_sort(int arr[], int n) {
    // Start with a large gap, then reduce the gap
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // Do a gapped insertion sort for this gap size.
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                arr[j] = arr[j - gap];
            }
            arr[j] = temp;
        }
    }
}

int main(void) {
    int arr[8] = {19, 2, 45, 12, 8, 1, 99, 23};
    shell_sort(arr, 8);
    return 0;
}`
  },
  {
    id: 6,
    title: "Linear Search vs. Binary Search",
    desc: "Visualize the efficiency gap: step sequentially through Linear Search vs. halving the search space in Binary Search.",
    cCode: `// C Implementation of Linear and Binary Search
#include <stdio.h>

int linear_search(int arr[], int n, int key) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == key) return i;
    }
    return -1;
}

int binary_search(int arr[], int n, int key) {
    int low = 0;
    int high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == key) return mid;
        if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main(void) {
    int sorted_arr[8] = {5, 12, 23, 34, 45, 56, 67, 89};
    int index_lin = linear_search(sorted_arr, 8, 45);
    int index_bin = binary_search(sorted_arr, 8, 45);
    return 0;
}`
  },
  {
    id: 7,
    title: "Book Catalog Hash Table",
    desc: "Hash books by ISBN or title. Visualize chaining collisions, calculating bucket indices (ISBN % size), and bucket searches.",
    cCode: `// C Implementation of a Hash Table with Chaining for Books
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 8

struct Book {
    int isbn;
    char title[128];
    struct Book* next;
};

struct Book* hash_table[TABLE_SIZE] = { NULL };

int hash_function(int isbn) {
    return isbn % TABLE_SIZE;
}

void insert_book(int isbn, const char* title) {
    int index = hash_function(isbn);
    struct Book* new_book = (struct Book*)malloc(sizeof(struct Book));
    new_book->isbn = isbn;
    strcpy(new_book->title, title);
    
    // Insert at front of chaining list
    new_book->next = hash_table[index];
    hash_table[index] = new_book;
}

struct Book* search_book(int isbn) {
    int index = hash_function(isbn);
    struct Book* temp = hash_table[index];
    while (temp != NULL) {
        if (temp->isbn == isbn) return temp;
        temp = temp->next;
    }
    return NULL; // Not found
}

int main(void) {
    insert_book(1005, "The C Programming Language");
    insert_book(1008, "Data Structures 101");
    insert_book(1013, "Introduction to Algorithms");
    
    struct Book* b = search_book(1008);
    if (b) printf("Found Book: %s\\n", b->title);
    return 0;
}`
  },
  {
    id: 8,
    title: "Tree-based File System",
    desc: "Simulate a hierarchical folder file system explorer using a general tree. Add subdirectories, files, and animate Pre-order/Post-order/BFS tree traversals.",
    cCode: `// C Implementation of a General Tree File System Structure
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_CHILDREN 10

struct TreeNode {
    char name[64];
    int is_directory;
    struct TreeNode* children[MAX_CHILDREN];
    int child_count;
};

struct TreeNode* create_node(const char* name, int is_dir) {
    struct TreeNode* node = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    strcpy(node->name, name);
    node->is_directory = is_dir;
    node->child_count = 0;
    for (int i = 0; i < MAX_CHILDREN; i++) {
        node->children[i] = NULL;
    }
    return node;
}

void add_child(struct TreeNode* parent, const char* name, int is_dir) {
    if (parent->child_count < MAX_CHILDREN) {
        parent->children[parent->child_count++] = create_node(name, is_dir);
    } else {
        printf("Max children reached.\\n");
    }
}

void traverse_preorder(struct TreeNode* root, int depth) {
    if (!root) return;
    for (int i = 0; i < depth; i++) printf("  ");
    printf("%s (%s)\\n", root->name, root->is_directory ? "dir" : "file");
    for (int i = 0; i < root->child_count; i++) {
        traverse_preorder(root->children[i], depth + 1);
    }
}

int main(void) {
    struct TreeNode* root = create_node("Root", 1);
    add_child(root, "Documents", 1);
    add_child(root, "Downloads", 1);
    add_child(root->children[0], "resume.pdf", 0);
    
    traverse_preorder(root, 0);
    return 0;
}`
  },
  {
    id: 9,
    title: "City Roads Graph (Dijkstra)",
    desc: "Simulate city road networks as a weighted graph. Calculate and animate shortest routes between cities using Dijkstra's algorithm.",
    cCode: `// C Implementation of Dijkstra's Shortest Path Algorithm
#include <stdio.h>
#include <stdbool.h>

#define V 5
#define INF 99999

int get_min_distance(int dist[], bool visited[]) {
    int min = INF, min_index;
    for (int v = 0; v < V; v++) {
        if (!visited[v] && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

void dijkstra(int graph[V][V], int src, int dest) {
    int dist[V];
    bool visited[V];
    int parent[V];
    
    for (int i = 0; i < V; i++) {
        dist[i] = INF;
        visited[i] = false;
        parent[i] = -1;
    }
    
    dist[src] = 0;
    
    for (int count = 0; count < V - 1; count++) {
        int u = get_min_distance(dist, visited);
        visited[u] = true;
        
        for (int v = 0; v < V; v++) {
            if (!visited[v] && graph[u][v] && dist[u] != INF 
                && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }
    
    printf("Shortest distance from %d to %d is %d\\n", src, dest, dist[dest]);
}

int main(void) {
    int graph[V][V] = {
        {0, 4, 2, 0, 0},
        {4, 0, 1, 5, 0},
        {2, 1, 0, 8, 10},
        {0, 5, 8, 0, 3},
        {0, 0, 10, 3, 0}
    };
    dijkstra(graph, 0, 4);
    return 0;
}`
  },
  {
    id: 10,
    title: "Minimum Spanning Tree (Prim's)",
    desc: "Construct the cheapest layout of cities connection (Minimum Spanning Tree) step-by-step using Prim's algorithm.",
    cCode: `// C Implementation of Prim's Minimum Spanning Tree (MST)
#include <stdio.h>
#include <stdbool.h>

#define V 5
#define INF 99999

void prim_mst(int graph[V][V]) {
    int parent[V];
    int key[V];
    bool mst_set[V];
    
    for (int i = 0; i < V; i++) {
        key[i] = INF;
        mst_set[i] = false;
    }
    
    key[0] = 0;
    parent[0] = -1;
    
    for (int count = 0; count < V - 1; count++) {
        // Find minimum key vertex not yet in MST
        int min = INF, u;
        for (int v = 0; v < V; v++) {
            if (!mst_set[v] && key[v] < min) {
                min = key[v];
                u = v;
            }
        }
        
        mst_set[u] = true;
        
        // Update keys of adjacent vertices
        for (int v = 0; v < V; v++) {
            if (graph[u][v] && !mst_set[v] && graph[u][v] < key[v]) {
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }
    
    // Print MST
    int total_weight = 0;
    for (int i = 1; i < V; i++) {
        printf("%d - %d: %d\\n", parent[i], i, graph[i][parent[i]]);
        total_weight += graph[i][parent[i]];
    }
    printf("Total MST Weight: %d\\n", total_weight);
}

int main(void) {
    int graph[V][V] = {
        {0, 4, 2, 0, 0},
        {4, 0, 1, 5, 0},
        {2, 1, 0, 8, 10},
        {0, 5, 8, 0, 3},
        {0, 0, 10, 3, 0}
    };
    prim_mst(graph);
    return 0;
}`
  }
];

function ExperimentsLab() {
  const [selectedId, setSelectedId] = useState(1);
  const [codeOpen, setCodeOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const sim = useSimulationControls(1800, () => {
    setResetKey(prev => prev + 1);
  });

  const activeExp = EXPERIMENTS.find(e => e.id === selectedId) || EXPERIMENTS[0];

  // Whenever the active experiment changes, reset controls
  useEffect(() => {
    sim.handleRestart();
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--hl-insert)] font-semibold">
                KPRIET DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
              </div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 mt-0.5">
                <FlaskConical className="h-5 w-5 text-[var(--hl-insert)]" />
                Experiments Sandbox
              </h1>
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            dsviz.exe // labs
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl px-4 py-6 w-full flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Left Sidebar containing 10 experiments */}
        <aside className="border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:pr-4 flex flex-col gap-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1 mb-1">
            Experiments List
          </div>
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2.5 md:pb-0 no-scrollbar select-none">
            {EXPERIMENTS.map((exp) => {
              const active = exp.id === selectedId;
              return (
                <button
                  key={exp.id}
                  onClick={() => {
                    setSelectedId(exp.id);
                    setCodeOpen(false);
                  }}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-[11px] font-medium font-mono transition-all flex items-center gap-1.5 border ${active
                    ? "bg-[var(--hl-insert)]/15 text-[var(--hl-insert)] border-[var(--hl-insert)]/40 font-bold shadow-[0_0_12px_rgba(20,184,166,0.05)]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/40"
                    }`}
                >
                  <span className="opacity-60">{exp.id}.</span>
                  <span>{exp.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Sandbox Container */}
        <section className="flex flex-col relative bg-card/30 border border-border/80 rounded-xl p-4 sm:p-6 min-h-[550px] shadow-sm overflow-visible">
          {/* Top panel with Description & Code Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 mb-6 gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">{activeExp.title}</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{activeExp.desc}</p>
            </div>

            {/* Float/Left-ish Corner CODE Button */}
            <button
              onClick={() => setCodeOpen(!codeOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[11px] font-bold border transition-all ${codeOpen
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:bg-accent hover:border-foreground"
                }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>{codeOpen ? "Hide C Code" : "C Code"}</span>
            </button>
          </div>

          {/* C Code Display Overlay (if codeOpen is true) */}
          {codeOpen ? (
            <div className="flex-1 flex flex-col bg-[var(--code-bg)] border border-border rounded-lg overflow-hidden animate-slide-up relative">
              <div className="flex justify-between items-center bg-card/60 px-4 py-2 border-b border-border text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <span>c-source-code.c</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeExp.cCode);
                      alert("C code copied to clipboard!");
                    }}
                    className="hover:text-foreground hover:underline transition-all cursor-pointer"
                  >
                    Copy Code
                  </button>
                  <span className="text-muted-foreground/30 font-light">|</span>
                  <button
                    onClick={() => {
                      const blob = new Blob([activeExp.cCode], { type: "text/x-c" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `experiment_${activeExp.id}.c`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="hover:text-foreground hover:underline transition-all cursor-pointer"
                  >
                    Download Code
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-foreground no-scrollbar whitespace-pre select-text">
                <code>{activeExp.cCode}</code>
              </pre>
            </div>
          ) : (
            /* Active Interactive Simulator Component */
            <div className="flex-1 flex flex-col justify-between gap-6">
              <div className="border border-border/80 rounded-xl p-4 bg-card/10">
                <SimulationControlToolbar
                  iterationCount={sim.iterationCount}
                  elapsedTime={sim.elapsedTime}
                  isPaused={sim.isPaused}
                  delayMs={sim.delayMs}
                  animating={sim.animating}
                  onPause={sim.handlePause}
                  onResume={sim.handleResume}
                  onRestart={sim.handleRestart}
                  onDelayChange={sim.handleDelayChange}
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <SimulatorWrapper key={`${activeExp.id}-${resetKey}`} id={activeExp.id} />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-7xl px-6 py-4 font-mono text-[10px] text-muted-foreground flex justify-between">
          <span>// Interactive Algorithms Experiments Panel.</span>
          <span>KPRIET CSE</span>
        </div>
      </footer>
    </div>
  );
}

// SIMULATOR CONTAINER ROUTER FOR THE 10 EXPERIMENTS
function SimulatorWrapper({ id }: { id: number }) {
  switch (id) {
    case 1:
      return <PlaylistSimulator />;
    case 2:
      return <BrowserHistorySimulator />;
    case 3:
      return <BankQueueSimulator />;
    case 4:
      return <SortingComparisonSimulator />;
    case 5:
      return <ShellSortSimulatorComponent />;
    case 6:
      return <SearchEfficiencySimulator />;
    case 7:
      return <BookCatalogHashSimulator />;
    case 8:
      return <FileSystemTreeSimulator />;
    case 9:
      return <DijkstraGraphSimulator />;
    case 10:
      return <PrimsMstSimulator />;
    default:
      return <div>Simulator not found</div>;
  }
}

/* ============================================================================
   EXPERIMENT 1: PLAYLIST SIMULATOR (DOUBLY LINKED LIST)
   ============================================================================ */
function PlaylistSimulator() {
  const [songs, setSongs] = useState<string[]>([
    "Bohemian Rhapsody",
    "Imagine",
    "Hotel California",
    "Stairway to Heaven"
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);

  const addSong = async () => {
    if (!newSongTitle.trim()) return;
    startSimOp();
    try {
      const newIdx = songs.length;
      setSongs([...songs, newSongTitle.trim()]);
      setNewSongTitle("");
      setPulseIndex(newIdx);
      await sleep(400);
      setPulseIndex(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const removeSong = async (idx: number) => {
    startSimOp();
    try {
      const updated = songs.filter((_, i) => i !== idx);
      setSongs(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      await sleep(350);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const moveUp = async (idx: number) => {
    if (idx === 0) return;
    startSimOp();
    try {
      const updated = [...songs];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      setSongs(updated);
      if (currentIndex === idx) setCurrentIndex(idx - 1);
      else if (currentIndex === idx - 1) setCurrentIndex(idx);
      setPulseIndex(idx - 1);
      await sleep(400);
      setPulseIndex(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const moveDown = async (idx: number) => {
    if (idx === songs.length - 1) return;
    startSimOp();
    try {
      const updated = [...songs];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      setSongs(updated);
      if (currentIndex === idx) setCurrentIndex(idx + 1);
      else if (currentIndex === idx + 1) setCurrentIndex(idx);
      setPulseIndex(idx + 1);
      await sleep(400);
      setPulseIndex(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Playlist Representation */}
      <div className="flex flex-wrap items-center gap-2 p-4 border border-border/80 bg-background/50 rounded-xl justify-center">
        {songs.map((song, idx) => {
          const isPlaying = currentIndex === idx;
          const isPulsing = pulseIndex === idx;
          return (
            <div key={idx} className="flex items-center">
              {idx > 0 && (
                <div className="flex items-center text-muted-foreground mx-1">
                  <ChevronLeft className="h-3 w-3 -mr-1" />
                  <div className="h-[2px] w-5 bg-foreground/30"></div>
                  <ChevronRight className="h-3 w-3 -ml-1" />
                </div>
              )}
              <div
                className={`relative p-3.5 rounded-lg border font-mono text-xs flex flex-col gap-1 transition-all duration-300 w-[140px] select-none ${isPlaying
                  ? "bg-[var(--hl-peek)]/10 border-[var(--hl-peek)] shadow-[0_0_15px_var(--hl-peek)]/30 scale-105"
                  : isPulsing
                    ? "border-[var(--hl-insert)] bg-[var(--hl-insert)]/5 scale-110"
                    : "bg-card border-border"
                  }`}
              >
                {/* Pointer tags */}
                <div className="absolute -top-2.5 left-1 flex gap-1 text-[9px] font-bold">
                  {idx === 0 && <span className="bg-foreground text-background px-1 rounded">HEAD</span>}
                  {idx === songs.length - 1 && <span className="bg-foreground/60 text-background px-1 rounded">TAIL</span>}
                  {isPlaying && <span className="bg-[var(--hl-peek)] text-background px-1 rounded">CURR</span>}
                </div>

                {/* Memory addresses Mock */}
                <div className="text-[9px] text-muted-foreground opacity-55">
                  Addr: 0x{(0x7000 + idx * 16).toString(16).toUpperCase()}
                </div>

                {/* Value */}
                <div className="font-bold truncate mt-1">{song}</div>

                {/* Links */}
                <div className="grid grid-cols-2 text-[8px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/60">
                  <span className="truncate">Prev: {idx === 0 ? "NULL" : "0x" + (0x7000 + (idx - 1) * 16).toString(16).toUpperCase()}</span>
                  <span className="truncate text-right">Next: {idx === songs.length - 1 ? "NULL" : "0x" + (0x7000 + (idx + 1) * 16).toString(16).toUpperCase()}</span>
                </div>

                {/* Hover options */}
                <div className="flex gap-1 justify-center mt-2.5">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 rounded bg-accent/40 text-foreground hover:bg-accent disabled:opacity-30">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === songs.length - 1} className="p-1 rounded bg-accent/40 text-foreground hover:bg-accent disabled:opacity-30">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeSong(idx)} className="p-1 rounded bg-[var(--hl-delete)]/15 text-[var(--hl-delete)] hover:bg-[var(--hl-delete)]/25">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {songs.length === 0 && (
          <div className="text-xs font-mono text-muted-foreground py-8">
            Playlist is empty. Add a track to begin.
          </div>
        )}
      </div>

      {/* Playlist controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/45 p-4 rounded-xl border border-border">
        {/* Media playing control */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs font-bold hover:bg-accent disabled:opacity-35"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev Track</span>
          </button>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(songs.length - 1, prev + 1))}
            disabled={currentIndex >= songs.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs font-bold hover:bg-accent disabled:opacity-35"
          >
            <span>Next Track</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Input to add tracks */}
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. Stairway to Heaven"
            value={newSongTitle}
            onChange={(e) => setNewSongTitle(e.target.value)}
            className="flex-1 sm:w-56 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:border-[var(--hl-insert)]"
          />
          <button
            onClick={addSong}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Track</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 2: BROWSER HISTORY SIMULATOR (TWO STACKS)
   ============================================================================ */
function BrowserHistorySimulator() {
  const [backStack, setBackStack] = useState<string[]>(["homepage.com", "google.com"]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("github.com/kpr");
  const [inputUrl, setInputUrl] = useState("");
  const [animating, setAnimating] = useState(false);
  const [transitionUrl, setTransitionUrl] = useState<string | null>(null);

  const visitUrl = async (url: string) => {
    if (!url.trim()) return;
    startSimOp();
    try {
      const formatted = url.includes(".") ? url.trim() : `${url.trim()}.com`;
      setBackStack(prev => [...prev, currentUrl]);
      setCurrentUrl(formatted);
      setForwardStack([]);
      setInputUrl("");
      await sleep(250);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const goBack = async () => {
    if (backStack.length === 0) return;
    startSimOp();
    setAnimating(true);
    try {
      const prev = backStack[backStack.length - 1];
      setTransitionUrl(currentUrl);

      await sleep(450);

      setBackStack(prevBack => prevBack.slice(0, -1));
      setForwardStack(prevForward => [...prevForward, currentUrl]);
      setCurrentUrl(prev);
      setTransitionUrl(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setAnimating(false);
      stopSimOp();
    }
  };

  const goForward = async () => {
    if (forwardStack.length === 0) return;
    startSimOp();
    setAnimating(true);
    try {
      const next = forwardStack[forwardStack.length - 1];
      setTransitionUrl(currentUrl);

      await sleep(450);

      setForwardStack(prevForward => prevForward.slice(0, -1));
      setBackStack(prevBack => [...prevBack, currentUrl]);
      setCurrentUrl(next);
      setTransitionUrl(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setAnimating(false);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Mock Web Browser Viewport */}
      <div className="border border-border/80 rounded-xl overflow-hidden shadow-md bg-background flex flex-col h-[280px]">
        {/* Address bar bar */}
        <div className="bg-card px-4 py-2 border-b border-border/80 flex items-center gap-3">
          {/* Browser navigation buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={goBack}
              disabled={backStack.length === 0 || animating}
              className="p-1 rounded hover:bg-accent text-foreground disabled:opacity-25 transition-colors"
              title="Go Back (Pop Back Stack, Push to Forward Stack)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goForward}
              disabled={forwardStack.length === 0 || animating}
              className="p-1 rounded hover:bg-accent text-foreground disabled:opacity-25 transition-colors"
              title="Go Forward (Pop Forward Stack, Push to Back Stack)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => visitUrl("homepage.com")}
              className="p-1 rounded hover:bg-accent text-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* URL address box */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && visitUrl(inputUrl)}
              placeholder="Enter URL to navigate..."
              className="flex-1 bg-background text-foreground text-xs px-3 py-1 rounded border border-border focus:outline-none focus:border-[var(--hl-peek)] font-mono"
            />
            <button
              onClick={() => visitUrl(inputUrl)}
              className="bg-[var(--hl-peek)] text-background px-3.5 py-1 rounded text-xs font-mono font-bold hover:opacity-90"
            >
              Go
            </button>
          </div>
        </div>

        {/* Browser viewport body simulation */}
        <div className="flex-1 bg-card/45 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden select-none">
          <Globe className="h-10 w-10 text-muted-foreground opacity-30 mb-2.5 animate-pulse" />
          <h3 className="font-mono text-base font-bold text-foreground">
            {transitionUrl ? (
              <span className="text-muted-foreground italic animate-pulse">Navigating from {transitionUrl}...</span>
            ) : (
              currentUrl
            )}
          </h3>
          <p className="text-[11px] text-muted-foreground font-mono mt-1 opacity-70">
            Current Active Page
          </p>
        </div>
      </div>

      {/* Two Stacks Stack Visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Back Stack */}
        <div className="border border-border/60 bg-card/25 p-4 rounded-xl flex flex-col justify-between h-[350px]">
          <div className="font-mono text-[10px] uppercase font-bold text-[var(--hl-peek)] mb-2 flex items-center justify-between">
            <span>Back Stack</span>
            <span className="text-[9px] opacity-75">LIFO // Pop to Go Back</span>
          </div>

          <div className="flex-1 flex flex-col-reverse gap-2.5 overflow-y-auto no-scrollbar pt-2">
            {backStack.map((url, idx) => {
              const isTop = idx === backStack.length - 1;
              const addr = (0x5A00 + idx * 16).toString(16).toUpperCase();
              return (
                <div
                  key={idx}
                  className={`relative p-3 rounded-lg border font-mono text-xs flex flex-col gap-1 transition-all duration-300 bg-card ${
                    isTop 
                      ? "border-[var(--hl-peek)] bg-[var(--hl-peek)]/5 shadow-[0_0_12px_rgba(20,184,166,0.15)] scale-[1.02]" 
                      : "border-border/60"
                  }`}
                >
                  {isTop && (
                    <div className="absolute -top-2.5 right-2 bg-[var(--hl-peek)] text-background text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                      TOP POINTER
                    </div>
                  )}
                  <div className="text-[9px] text-muted-foreground opacity-60">
                    Addr: 0x{addr} | Index: {idx}
                  </div>
                  <div className="font-bold truncate text-foreground">{url}</div>
                </div>
              );
            })}
            {backStack.length === 0 && (
              <div className="text-center py-12 text-[10px] font-mono text-muted-foreground opacity-60">
                [ Empty Back Stack ]
              </div>
            )}
          </div>
        </div>

        {/* Forward Stack */}
        <div className="border border-border/60 bg-card/25 p-4 rounded-xl flex flex-col justify-between h-[350px]">
          <div className="font-mono text-[10px] uppercase font-bold text-[var(--hl-insert)] mb-2 flex items-center justify-between">
            <span>Forward Stack</span>
            <span className="text-[9px] opacity-75">Pop to Go Forward</span>
          </div>

          <div className="flex-1 flex flex-col-reverse gap-2.5 overflow-y-auto no-scrollbar pt-2">
            {forwardStack.map((url, idx) => {
              const isTop = idx === forwardStack.length - 1;
              const addr = (0x6A00 + idx * 16).toString(16).toUpperCase();
              return (
                <div
                  key={idx}
                  className={`relative p-3 rounded-lg border font-mono text-xs flex flex-col gap-1 transition-all duration-300 bg-card ${
                    isTop 
                      ? "border-[var(--hl-insert)] bg-[var(--hl-insert)]/5 shadow-[0_0_12px_rgba(20,184,166,0.15)] scale-[1.02]" 
                      : "border-border/60"
                  }`}
                >
                  {isTop && (
                    <div className="absolute -top-2.5 right-2 bg-[var(--hl-insert)] text-background text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                      TOP POINTER
                    </div>
                  )}
                  <div className="text-[9px] text-muted-foreground opacity-60">
                    Addr: 0x{addr} | Index: {idx}
                  </div>
                  <div className="font-bold truncate text-foreground">{url}</div>
                </div>
              );
            })}
            {forwardStack.length === 0 && (
              <div className="text-center py-12 text-[10px] font-mono text-muted-foreground opacity-60">
                [ Empty Forward Stack ]
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 3: BANK QUEUE SIMULATOR (QUEUE ADT)
   ============================================================================ */
function BankQueueSimulator() {
  const [queue, setQueue] = useState<{ id: number; name: string }[]>([
    { id: 101, name: "Ramji" },
    { id: 102, name: "Alice" },
    { id: 103, name: "Bob" }
  ]);
  const [ticketCounter, setTicketCounter] = useState(104);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [servingCustomer, setServingCustomer] = useState<{ id: number; name: string } | null>(null);

  const arriveCustomer = async () => {
    if (!newCustomerName.trim()) return;
    startSimOp();
    try {
      setQueue([...queue, { id: ticketCounter, name: newCustomerName.trim() }]);
      setTicketCounter(prev => prev + 1);
      setNewCustomerName("");
      await sleep(350);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const serveCustomer = async () => {
    if (queue.length === 0) return;
    startSimOp();
    try {
      const head = queue[0];
      setServingCustomer(head);
      setQueue(prev => prev.slice(1));
      await sleep(2000);
      setServingCustomer(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Serving Desk layout */}
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 bg-card/45 p-5 rounded-xl border border-border">
        {/* Server Desk */}
        <div className="flex flex-col justify-center items-center border border-border/80 bg-background/50 rounded-lg p-4 text-center select-none min-h-[140px] relative">
          <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">COUNTER DESK</div>
          {servingCustomer ? (
            <div className="space-y-2 animate-pop">
              <div className="h-10 w-10 rounded-full bg-[var(--hl-peek)]/15 border border-[var(--hl-peek)] flex items-center justify-center text-foreground font-mono font-bold mx-auto">
                <User className="h-5 w-5 text-[var(--hl-peek)]" />
              </div>
              <div className="font-mono text-xs font-bold leading-tight">{servingCustomer.name}</div>
              <div className="font-mono text-[9px] text-muted-foreground">Ticket #{servingCustomer.id}</div>
              <div className="text-[8px] font-mono bg-green-500/10 text-green-500 rounded px-1.5 py-0.5 border border-green-500/20 font-bold uppercase animate-pulse">SERVED</div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <RefreshCw className="h-7 w-7 text-muted-foreground/30 animate-spin mx-auto" />
              <div className="font-mono text-[10px] text-muted-foreground font-bold">READY TO SERVE</div>
            </div>
          )}
        </div>

        {/* Customer queue linear list */}
        <div className="flex flex-col justify-center bg-background/30 rounded-lg border border-border/60 p-4 min-h-[140px] relative">
          <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">QUEUE LINE (FRONT → REAR)</div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            {queue.map((c, idx) => (
              <div key={c.id} className="relative flex flex-col items-center bg-card border border-border rounded-lg p-3 w-[100px] select-none text-center shadow-sm animate-pop">
                {/* Pointer indicators */}
                <div className="absolute -top-2.5 left-1 flex gap-0.5 text-[8px] font-bold">
                  {idx === 0 && <span className="bg-[var(--hl-peek)] text-background px-1 rounded">FRONT</span>}
                  {idx === queue.length - 1 && <span className="bg-[var(--hl-insert)] text-background px-1 rounded">REAR</span>}
                </div>

                <User className="h-4 w-4 text-muted-foreground opacity-60 mb-1" />
                <div className="font-mono text-[11px] font-bold truncate w-full">{c.name}</div>
                <div className="font-mono text-[8px] text-muted-foreground mt-0.5 opacity-60">#{c.id}</div>
                <div className="font-mono text-[9px] text-muted-foreground mt-1 bg-accent/40 rounded px-1 w-full">Idx: {idx}</div>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="text-center py-6 text-xs font-mono text-muted-foreground mx-auto">
                No customers in line.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Queue control options */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        {/* Dequeue / Serve */}
        <button
          onClick={serveCustomer}
          disabled={queue.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-peek)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
        >
          <Check className="h-4 w-4" />
          <span>Serve Next (Dequeue)</span>
        </button>

        {/* Enqueue / Arrive */}
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && arriveCustomer()}
            className="flex-1 sm:w-44 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:border-[var(--hl-insert)]"
          />
          <button
            onClick={arriveCustomer}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>Arrive (Enqueue)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 4: BUBBLE SORT & INSERTION SORT SIMULATOR
   ============================================================================ */
function SortingComparisonSimulator() {
  const [array, setArray] = useState<number[]>([45, 12, 85, 32, 70, 22, 55, 9]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState<"Bubble" | "Insertion" | "None">("None");

  const resetArray = () => {
    if (sorting) return;
    setArray(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
    setActiveIndices([]);
    setSortedIndices([]);
    setAlgorithm("None");
  };

  const runBubbleSort = async () => {
    if (sorting) return;
    startSimOp();
    setSorting(true);
    setAlgorithm("Bubble");
    setSortedIndices([]);

    try {
      const arr = [...array];
      const n = arr.length;

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          setActiveIndices([j, j + 1]);
          await sleep(650);

          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            setArray([...arr]);
            await sleep(450);
          }
        }
        setSortedIndices(prev => [...prev, n - i - 1]);
      }
      setSortedIndices(arr.map((_, i) => i));
      setActiveIndices([]);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setSorting(false);
      stopSimOp();
    }
  };

  const runInsertionSort = async () => {
    if (sorting) return;
    startSimOp();
    setSorting(true);
    setAlgorithm("Insertion");
    setSortedIndices([0]);

    try {
      const arr = [...array];
      const n = arr.length;

      for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        setActiveIndices([i]);
        await sleep(650);

        while (j >= 0 && arr[j] > key) {
          setActiveIndices([j, j + 1]);
          arr[j + 1] = arr[j];
          setArray([...arr]);
          await sleep(550);
          j--;
        }
        arr[j + 1] = key;
        setArray([...arr]);
        setSortedIndices(Array.from({ length: i + 1 }, (_, index) => index));
        await sleep(450);
      }
      setSortedIndices(arr.map((_, i) => i));
      setActiveIndices([]);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setSorting(false);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Bars visualization */}
      <div className="border border-border/80 bg-background/45 p-6 rounded-xl min-h-[190px] flex items-end justify-center gap-3 relative">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">
          ARRAY BARS {algorithm !== "None" && `(${algorithm} Sort)`}
        </div>

        {array.map((val, idx) => {
          const isActive = activeIndices.includes(idx);
          const isSorted = sortedIndices.includes(idx);
          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px]">
              <div
                style={{ height: `${val * 1.5}px` }}
                className={`w-full rounded-t-md border transition-all duration-300 ${isActive
                  ? "bg-[var(--hl-insert)] border-[var(--hl-insert)] shadow-[0_0_15px_var(--hl-insert)]/40"
                  : isSorted
                    ? "bg-green-500/25 border-green-500/50"
                    : "bg-[var(--hl-peek)]/10 border-border"
                  }`}
              ></div>
              <span className="font-mono text-[10px] font-bold mt-2">{val}</span>
              <span className="font-mono text-[8px] text-muted-foreground opacity-55">Idx: {idx}</span>
            </div>
          );
        })}
      </div>

      {/* Controller Buttons */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        <div className="flex gap-2">
          <button
            onClick={runBubbleSort}
            disabled={sorting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-peek)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Bubble Sort</span>
          </button>

          <button
            onClick={runInsertionSort}
            disabled={sorting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Insertion Sort</span>
          </button>
        </div>

        <button
          onClick={resetArray}
          disabled={sorting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background font-mono text-xs font-bold hover:bg-accent disabled:opacity-30"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Array</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 5: SHELL SORT SIMULATOR
   ============================================================================ */
function ShellSortSimulatorComponent() {
  const [array, setArray] = useState<number[]>([62, 8, 43, 91, 15, 29, 74, 5]);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [gap, setGap] = useState(0);
  const [sorting, setSorting] = useState(false);

  const resetArray = () => {
    if (sorting) return;
    setArray(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
    setActiveIndices([]);
    setGap(0);
  };

  const runShellSort = async () => {
    if (sorting) return;
    startSimOp();
    setSorting(true);

    try {
      const arr = [...array];
      const n = arr.length;

      for (let currentGap = Math.floor(n / 2); currentGap > 0; currentGap = Math.floor(currentGap / 2)) {
        setGap(currentGap);
        await sleep(800);

        for (let i = currentGap; i < n; i++) {
          const temp = arr[i];
          let j = i;

          setActiveIndices([j, j - currentGap]);
          await sleep(650);

          while (j >= currentGap && arr[j - currentGap] > temp) {
            arr[j] = arr[j - currentGap];
            setArray([...arr]);
            setActiveIndices([j, j - currentGap]);
            await sleep(650);
            j -= currentGap;
          }
          arr[j] = temp;
          setArray([...arr]);
        }
      }
      setGap(0);
      setActiveIndices([]);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setSorting(false);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Shell Sort container */}
      <div className="border border-border/80 bg-background/45 p-6 rounded-xl min-h-[190px] flex items-end justify-center gap-3 relative">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">
          ARRAY BARS {gap > 0 && `(Current Gap: ${gap})`}
        </div>

        {array.map((val, idx) => {
          const isActive = activeIndices.includes(idx);
          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px]">
              <div
                style={{ height: `${val * 1.5}px` }}
                className={`w-full rounded-t-md border transition-all duration-300 ${isActive
                  ? "bg-[var(--hl-insert)] border-[var(--hl-insert)]"
                  : "bg-[var(--hl-peek)]/10 border-border"
                  }`}
              ></div>
              <span className="font-mono text-[10px] font-bold mt-2">{val}</span>
              <span className="font-mono text-[8px] text-muted-foreground opacity-55">Idx: {idx}</span>
            </div>
          );
        })}
      </div>

      {/* gap indices loops connectors mockup */}
      {gap > 0 && (
        <div className="text-center font-mono text-[10px] text-[var(--hl-peek)] bg-[var(--hl-peek)]/5 p-2 rounded border border-[var(--hl-peek)]/20">
          Comparing elements at distance indices: (i, i - {gap})
        </div>
      )}

      {/* Control button */}
      <div className="flex items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        <button
          onClick={runShellSort}
          disabled={sorting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Run Shell Sort</span>
        </button>

        <button
          onClick={resetArray}
          disabled={sorting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background font-mono text-xs font-bold hover:bg-accent disabled:opacity-30"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Array</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 6: LINEAR & BINARY SEARCH COMPARISON SIMULATOR
   ============================================================================ */
function SearchEfficiencySimulator() {
  const [array] = useState<number[]>([5, 12, 23, 34, 45, 56, 67, 89]);
  const [searchKey, setSearchKey] = useState("45");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [range, setRange] = useState<{ low: number; high: number } | null>(null);
  const [message, setMessage] = useState("Choose a search algorithm to locate value.");
  const [searching, setSearching] = useState(false);

  const runLinearSearch = async () => {
    if (searching) return;
    startSimOp();
    setSearching(true);
    setRange(null);
    const key = Number(searchKey);
    let found = false;

    try {
      for (let i = 0; i < array.length; i++) {
        setHighlightIdx(i);
        setMessage(`Step ${i + 1}: Checking index ${i} (value ${array[i]})...`);
        await sleep(700);

        if (array[i] === key) {
          setMessage(`Success! Value ${key} found at index ${i} after ${i + 1} steps!`);
          found = true;
          break;
        }
      }

      if (!found) {
        setMessage(`Finished. Value ${key} not found after ${array.length} steps.`);
        setHighlightIdx(null);
      }
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setSearching(false);
      stopSimOp();
    }
  };

  const runBinarySearch = async () => {
    if (searching) return;
    startSimOp();
    setSearching(true);
    const key = Number(searchKey);
    let low = 0;
    let high = array.length - 1;
    let steps = 0;
    let found = false;

    try {
      while (low <= high) {
        steps++;
        setRange({ low, high });
        const mid = Math.floor((low + high) / 2);
        setHighlightIdx(mid);
        setMessage(`Step ${steps}: Checking mid index ${mid} (value ${array[mid]}) inside interval [${low}, ${high}]...`);
        await sleep(1000);

        if (array[mid] === key) {
          setMessage(`Success! Value ${key} found at index ${mid} after ${steps} binary steps!`);
          found = true;
          break;
        } else if (array[mid] < key) {
          setMessage(`${array[mid]} < ${key}. Shrink search range to right half.`);
          low = mid + 1;
        } else {
          setMessage(`${array[mid]} > ${key}. Shrink search range to left half.`);
          high = mid - 1;
        }
        await sleep(800);
      }

      if (!found) {
        setMessage(`Finished. Value ${key} not found after ${steps} steps.`);
        setHighlightIdx(null);
        setRange(null);
      }
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setSearching(false);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Array layout visualization */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-5 border border-border/80 bg-background/50 rounded-xl relative">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">SORTED SEARCH SPACE</div>

        {array.map((val, idx) => {
          const isHighlighted = highlightIdx === idx;
          const inRange = range ? (idx >= range.low && idx <= range.high) : true;

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border font-mono text-center flex flex-col gap-1 w-16 transition-all duration-300 ${isHighlighted
                ? "border-[var(--hl-insert)] bg-[var(--hl-insert)]/15 scale-110 shadow-[0_0_12px_var(--hl-insert)]/30 font-bold"
                : inRange
                  ? "bg-card border-border"
                  : "bg-muted-foreground/5 border-border/40 text-muted-foreground/40"
                }`}
            >
              <div className="text-[9px] opacity-60">Idx: {idx}</div>
              <div className="text-sm font-extrabold">{val}</div>
            </div>
          );
        })}
      </div>

      {/* message alert */}
      <div className="font-mono text-xs text-center border border-border bg-card/65 rounded p-2.5 text-foreground leading-relaxed">
        {message}
      </div>

      {/* controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        {/* search term input */}
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="number"
            placeholder="Search Value"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            disabled={searching}
            className="w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none"
          />

          <button
            onClick={runLinearSearch}
            disabled={searching || !searchKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hl-peek)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
          >
            <span>Linear Search</span>
          </button>

          <button
            onClick={runBinarySearch}
            disabled={searching || !searchKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
          >
            <span>Binary Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 7: BOOK CATALOG HASH TABLE SIMULATOR
   ============================================================================ */
interface BookRecord {
  isbn: number;
  title: string;
}

function BookCatalogHashSimulator() {
  const [table, setTable] = useState<BookRecord[][]>(
    Array.from({ length: 8 }, () => [])
  );
  const [isbnInput, setIsbnInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [searchedIsbn, setSearchedIsbn] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [highlightedBucket, setHighlightedBucket] = useState<number | null>(null);

  const insertBook = async () => {
    const isbn = Number(isbnInput);
    if (isNaN(isbn) || !titleInput.trim()) return;

    startSimOp();
    const hashIdx = isbn % 8;
    setHighlightedBucket(hashIdx);

    try {
      setTable(prev => {
        const updated = [...prev];
        // Check if ISBN already exists, update title
        const existing = updated[hashIdx].find(b => b.isbn === isbn);
        if (existing) {
          existing.title = titleInput.trim();
        } else {
          updated[hashIdx] = [...updated[hashIdx], { isbn, title: titleInput.trim() }];
        }
        return updated;
      });

      setIsbnInput("");
      setTitleInput("");
      await sleep(1500);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setHighlightedBucket(null);
      stopSimOp();
    }
  };

  const searchBook = async () => {
    const isbn = Number(searchedIsbn);
    if (isNaN(isbn)) return;

    startSimOp();
    const hashIdx = isbn % 8;
    setHighlightedBucket(hashIdx);

    try {
      const list = table[hashIdx];
      const found = list.find(b => b.isbn === isbn);

      if (found) {
        setSearchStatus(`Found in bucket ${hashIdx}: "${found.title}"`);
      } else {
        setSearchStatus(`ISBN ${isbn} not found (searched Bucket index ${hashIdx}).`);
      }

      await sleep(4500);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setHighlightedBucket(null);
      setSearchStatus(null);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Hash slots grid layout */}
      <div className="grid grid-cols-1 gap-2.5">
        {table.map((bucket, idx) => {
          const isHighlighted = highlightedBucket === idx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-lg border font-mono text-xs transition-all duration-300 ${isHighlighted
                ? "border-[var(--hl-insert)] bg-[var(--hl-insert)]/10"
                : "bg-card border-border/80"
                }`}
            >
              {/* Bucket address key index */}
              <div className="bg-background border border-border w-24 px-2 py-1 rounded text-center font-bold">
                Bucket {idx} (0x{(0x9000 + idx * 8).toString(16).toUpperCase()})
              </div>

              {/* Chained Linked list representation */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {bucket.map((book, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-1">
                    {bIdx > 0 && <span className="text-muted-foreground">→</span>}
                    <div className="bg-background border border-border px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                      <Book className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold truncate max-w-[120px]">{book.title}</span>
                      <span className="text-[9px] text-muted-foreground opacity-60">(ISBN: {book.isbn})</span>
                    </div>
                  </div>
                ))}
                {bucket.length === 0 && (
                  <span className="text-muted-foreground opacity-40 italic">NULL (Empty bucket list)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* search feedback status */}
      {searchStatus && (
        <div className="font-mono text-xs text-center border border-[var(--hl-peek)] bg-[var(--hl-peek)]/5 p-2 rounded border-dashed text-foreground animate-pop">
          {searchStatus}
        </div>
      )}

      {/* Input operations panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card/25 p-4 rounded-xl border border-border">
        {/* Insert Book */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">Insert New Book</div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="ISBN"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              className="w-16 px-2.5 py-1 rounded border border-border bg-background text-xs font-mono"
            />
            <input
              type="text"
              placeholder="Book Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded border border-border bg-background text-xs font-mono"
            />
            <button
              onClick={insertBook}
              className="bg-[var(--hl-insert)] text-background px-3 py-1 rounded text-xs font-mono font-bold hover:opacity-90"
            >
              Insert
            </button>
          </div>
        </div>

        {/* Search Book */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">Find Book by ISBN</div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter ISBN"
              value={searchedIsbn}
              onChange={(e) => setSearchedIsbn(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded border border-border bg-background text-xs font-mono"
            />
            <button
              onClick={searchBook}
              className="bg-[var(--hl-peek)] text-background px-4 py-1 rounded text-xs font-mono font-bold hover:opacity-90"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 8: FILE SYSTEM TREE SIMULATOR
   ============================================================================ */
interface FileNode {
  name: string;
  isDir: boolean;
  children: FileNode[];
}

function FileSystemTreeSimulator() {
  const [root, setRoot] = useState<FileNode>({
    name: "Root",
    isDir: true,
    children: [
      {
        name: "Documents",
        isDir: true,
        children: [
          { name: "resume.pdf", isDir: false, children: [] },
          { name: "notes.txt", isDir: false, children: [] }
        ]
      },
      {
        name: "Downloads",
        isDir: true,
        children: [
          { name: "setup.exe", isDir: false, children: [] }
        ]
      }
    ]
  });

  const [selectedPath, setSelectedPath] = useState<string[]>(["Root"]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [traversalList, setTraversalList] = useState<string[]>([]);
  const [activeNodeName, setActiveNodeName] = useState<string | null>(null);

  interface PointedNode {
    name: string;
    isDir: boolean;
    path: string[];
    x: number;
    y: number;
    parentX?: number;
    parentY?: number;
  }

  const computeTreeLayout = (
    node: FileNode,
    path: string[],
    xStart: number,
    xEnd: number,
    y: number,
    parentX?: number,
    parentY?: number,
    nodesList: PointedNode[] = []
  ): PointedNode[] => {
    const x = (xStart + xEnd) / 2;
    nodesList.push({ name: node.name, isDir: node.isDir, path, x, y, parentX, parentY });
    
    if (node.children && node.children.length > 0) {
      const nextY = y + 45;
      const childWidth = (xEnd - xStart) / node.children.length;
      node.children.forEach((child, i) => {
        const childXStart = xStart + i * childWidth;
        const childXEnd = childXStart + childWidth;
        computeTreeLayout(child, [...path, child.name], childXStart, childXEnd, nextY, x, y, nodesList);
      });
    }
    return nodesList;
  };

  // Helper to find a node by path
  const findNode = (node: FileNode, path: string[], depth = 0): FileNode | null => {
    if (node.name !== path[depth]) return null;
    if (depth === path.length - 1) return node;

    for (const child of node.children) {
      const found = findNode(child, path, depth + 1);
      if (found) return found;
    }
    return null;
  };

  const addNode = async (name: string, isDir: boolean) => {
    if (!name.trim()) return;
    startSimOp();
    const cleanName = name.trim();

    try {
      setRoot(prev => {
        const copy = JSON.parse(JSON.stringify(prev)); // Deep copy
        const target = findNode(copy, selectedPath);
        if (target && target.isDir) {
          // Prevent duplicate name
          if (!target.children.some(c => c.name === cleanName)) {
            target.children.push({ name: cleanName, isDir, children: [] });
          }
        }
        return copy;
      });

      if (isDir) setNewFolderName("");
      else setNewFileName("");
      await sleep(250);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  const deleteNode = async () => {
    if (selectedPath.length === 1) return; // Cannot delete Root
    startSimOp();

    try {
      setRoot(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        const parentPath = selectedPath.slice(0, -1);
        const targetName = selectedPath[selectedPath.length - 1];
        const parentNode = findNode(copy, parentPath);

        if (parentNode) {
          parentNode.children = parentNode.children.filter(c => c.name !== targetName);
        }
        return copy;
      });
      setSelectedPath(["Root"]);
      await sleep(250);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      stopSimOp();
    }
  };

  // Traversal animations (DFS Preorder)
  const getPreorder = (node: FileNode, list: string[] = []): string[] => {
    list.push(node.name);
    node.children.forEach(c => getPreorder(c, list));
    return list;
  };

  // DFS Postorder
  const getPostorder = (node: FileNode, list: string[] = []): string[] => {
    node.children.forEach(c => getPostorder(c, list));
    list.push(node.name);
    return list;
  };

  // BFS Level-order
  const getBfs = (node: FileNode): string[] => {
    const list: string[] = [];
    const queue: FileNode[] = [node];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      list.push(curr.name);
      curr.children.forEach(c => queue.push(c));
    }
    return list;
  };

  const animateTraversal = async (algorithm: "Preorder" | "Postorder" | "BFS") => {
    startSimOp();
    let order: string[] = [];
    if (algorithm === "Preorder") order = getPreorder(root);
    else if (algorithm === "Postorder") order = getPostorder(root);
    else order = getBfs(root);

    setTraversalList([]);
    try {
      for (const name of order) {
        setActiveNodeName(name);
        setTraversalList(prev => [...prev, name]);
        await sleep(650);
      }
      setActiveNodeName(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setActiveNodeName(null);
      stopSimOp();
    }
  };

  // Recursive Tree Rendering
  const renderTree = (node: FileNode, currentPath: string[]) => {
    const isSelected = JSON.stringify(currentPath) === JSON.stringify(selectedPath);
    const isActive = activeNodeName === node.name;

    return (
      <div key={node.name} className="ml-5 mt-1.5 font-mono text-xs select-none">
        <div
          onClick={() => node.isDir && setSelectedPath(currentPath)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-all duration-200 ${isSelected
            ? "bg-[var(--hl-insert)]/15 border-l-2 border-[var(--hl-insert)] font-bold text-[var(--hl-insert)]"
            : isActive
              ? "bg-[var(--hl-peek)] text-background scale-105"
              : "hover:bg-accent/40 text-foreground"
            }`}
        >
          {node.isDir ? (
            <Folder className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
          ) : (
            <File className="h-3.5 w-3.5 text-blue-400" />
          )}
          <span>{node.name}</span>
        </div>

        {node.children.map(child => renderTree(child, [...currentPath, child.name]))}
      </div>
    );
  };

  const layoutNodes = computeTreeLayout(root, ["Root"], 20, 560, 30);

  return (
    <div className="space-y-6">
      {/* Visual Tree Node Diagram */}
      <div className="border border-border/80 bg-background/50 rounded-xl p-4 relative min-h-[220px] flex flex-col justify-center items-center">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono uppercase">
          Hierarchical Tree Node Diagram
        </div>

        <div className="w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center py-2 mt-4">
          <svg className="w-[580px] h-[190px] flex-shrink-0" viewBox="0 0 580 190">
          {/* Draw Connection Edges */}
          {layoutNodes.map((node, i) => {
            if (node.parentX !== undefined && node.parentY !== undefined) {
              const isActive = activeNodeName === node.name || activeNodeName === (layoutNodes.find(ln => ln.x === node.parentX && ln.y === node.parentY)?.name);
              return (
                <line
                  key={`line-${i}`}
                  x1={node.parentX}
                  y1={node.parentY}
                  x2={node.x}
                  y2={node.y}
                  stroke={isActive ? "var(--hl-peek)" : "var(--border)"}
                  strokeWidth={isActive ? "2" : "1.25"}
                  className="transition-all duration-300"
                />
              );
            }
            return null;
          })}

          {/* Draw Tree Nodes */}
          {layoutNodes.map((node, i) => {
            const isSelected = JSON.stringify(node.path) === JSON.stringify(selectedPath);
            const isActive = activeNodeName === node.name;

            let fill = "fill-card";
            let stroke = "stroke-border";
            let textFill = "fill-foreground";

            if (isSelected) {
              fill = "fill-[var(--hl-insert)]/15";
              stroke = "stroke-[var(--hl-insert)]";
            }
            if (isActive) {
              fill = "fill-[var(--hl-peek)]";
              stroke = "stroke-[var(--hl-peek)]";
              textFill = "fill-background";
            }

            return (
              <g
                key={`node-${i}`}
                className="cursor-pointer group"
                onClick={() => node.isDir && setSelectedPath(node.path)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="13"
                  className={`transition-all duration-300 ${fill} ${stroke} stroke-2`}
                />
                
                {/* Node type letter icon (D for Directory, F for File) */}
                <text
                  x={node.x}
                  y={node.y + 3}
                  textAnchor="middle"
                  className={`font-mono text-[9px] font-bold select-none pointer-events-none ${textFill}`}
                >
                  {node.isDir ? "D" : "F"}
                </text>

                {/* Node Name Label */}
                <text
                  x={node.x}
                  y={node.y - 17}
                  textAnchor="middle"
                  className={`font-mono text-[8px] font-bold select-none pointer-events-none transition-all ${
                    isActive
                      ? "fill-[var(--hl-peek)] scale-105"
                      : isSelected
                      ? "fill-[var(--hl-insert)] font-black"
                      : "fill-muted-foreground group-hover:fill-foreground"
                  }`}
                >
                  {node.name.length > 8 ? node.name.slice(0, 7) + ".." : node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      </div>
      {/* File Explorer Sandbox Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4">
        {/* Explorer left tree view */}
        <div className="bg-card/45 border border-border p-4 rounded-xl min-h-[220px]">
          <div className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">File Tree</div>
          <div className="overflow-auto max-h-[260px] no-scrollbar">
            {renderTree(root, ["Root"])}
          </div>
        </div>

        {/* Explorer operations / traversal list */}
        <div className="bg-background/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Active Directory Path</div>
            <div className="font-mono text-xs bg-card border border-border px-3 py-1.5 rounded truncate font-bold text-foreground">
              {selectedPath.join(" / ")}
            </div>

            {/* Traversal history animation logs */}
            {traversalList.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className="text-[8px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Traversal Order</div>
                <div className="flex flex-wrap gap-1.5 bg-card/65 p-2 border border-border rounded font-mono text-[9px]">
                  {traversalList.map((name, i) => (
                    <div key={i} className="bg-[var(--hl-peek)] text-background px-1.5 py-0.5 rounded font-bold">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add file/folder controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-border/60">
            {/* Folder creation */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="New Folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-2 py-1 rounded border border-border bg-background text-[11px] font-mono"
              />
              <button
                onClick={() => addNode(newFolderName, true)}
                className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-1.5 rounded hover:bg-amber-500/20"
                title="Create Subfolder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* File creation */}
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="New File"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-2 py-1 rounded border border-border bg-background text-[11px] font-mono"
              />
              <button
                onClick={() => addNode(newFileName, false)}
                className="bg-blue-500/10 text-blue-500 border border-blue-500/20 p-1.5 rounded hover:bg-blue-500/20"
                title="Create File"
              >
                <FilePlus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Delete Folder */}
            <button
              onClick={deleteNode}
              disabled={selectedPath.length === 1}
              className="flex items-center justify-center gap-1.5 px-3 py-1 bg-[var(--hl-delete)]/10 text-[var(--hl-delete)] border border-[var(--hl-delete)]/20 rounded hover:bg-[var(--hl-delete)]/25 disabled:opacity-30 text-[11px] font-mono font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Traversal algorithm selection */}
      <div className="flex gap-2.5 items-center justify-start bg-card/25 p-3.5 rounded-xl border border-border">
        <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold tracking-widest mr-2">Animate Traversals:</span>
        <button
          onClick={() => animateTraversal("Preorder")}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-background font-mono text-[10px] font-bold hover:bg-accent"
        >
          <Compass className="h-3 w-3" />
          <span>DFS Preorder</span>
        </button>
        <button
          onClick={() => animateTraversal("Postorder")}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-background font-mono text-[10px] font-bold hover:bg-accent"
        >
          <Compass className="h-3 w-3" />
          <span>DFS Postorder</span>
        </button>
        <button
          onClick={() => animateTraversal("BFS")}
          className="flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-background font-mono text-[10px] font-bold hover:bg-accent"
        >
          <Compass className="h-3 w-3" />
          <span>BFS Levelorder</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 9: CITIES ROAD GRAPH (DIJKSTRA SHORTED ROUTE)
   ============================================================================ */
interface GraphNode {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

const GRAPH_NODES: GraphNode[] = [
  { id: 0, name: "London", x: 100, y: 70 },
  { id: 1, name: "Paris", x: 280, y: 140 },
  { id: 2, name: "Berlin", x: 500, y: 80 },
  { id: 3, name: "Rome", x: 420, y: 260 },
  { id: 4, name: "Madrid", x: 120, y: 250 }
];

const GRAPH_EDGES: GraphEdge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 8 },
  { from: 1, to: 2, weight: 3 },
  { from: 1, to: 3, weight: 6 },
  { from: 2, to: 3, weight: 2 },
  { from: 2, to: 4, weight: 10 },
  { from: 3, to: 4, weight: 4 }
];

function DijkstraGraphSimulator() {
  const [srcNode, setSrcNode] = useState(0);
  const [destNode, setDestNode] = useState(4);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [distances, setDistances] = useState<number[]>([0, 99, 99, 99, 99]);
  const [shortestPath, setShortestPath] = useState<number[]>([]);
  const [calculating, setCalculating] = useState(false);

  const runDijkstra = async () => {
    if (calculating) return;
    startSimOp();
    setCalculating(true);
    setVisitedNodes([]);
    setShortestPath([]);

    try {
      const V = GRAPH_NODES.length;
      const dist = Array(V).fill(99999);
      const parent = Array(V).fill(-1);
      const visited = Array(V).fill(false);

      dist[srcNode] = 0;
      setDistances([...dist]);

      for (let count = 0; count < V - 1; count++) {
        // Find min distance unvisited node
        let min = 99999;
        let u = -1;
        for (let v = 0; v < V; v++) {
          if (!visited[v] && dist[v] < min) {
            min = dist[v];
            u = v;
          }
        }

        if (u === -1) break;

        setCurrentNode(u);
        await sleep(1000);

        visited[u] = true;
        setVisitedNodes(prev => [...prev, u]);

        // Relax neighbors
        for (const edge of GRAPH_EDGES) {
          if (edge.from === u || edge.to === u) {
            const v = edge.from === u ? edge.to : edge.from;
            if (!visited[v]) {
              const newDist = dist[u] + edge.weight;
              if (newDist < dist[v]) {
                dist[v] = newDist;
                parent[v] = u;
                setDistances([...dist]);
                await sleep(700);
              }
            }
          }
        }
      }

      // Reconstruct shortest path to destination
      const path: number[] = [];
      let curr = destNode;
      while (curr !== -1) {
        path.push(curr);
        curr = parent[curr];
      }
      setShortestPath(path.reverse());
      setCurrentNode(null);
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setCalculating(false);
      setCurrentNode(null);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Weighted Graph Map View */}
      <div className="border border-border/80 bg-background/50 rounded-xl p-4 relative min-h-[340px] flex flex-col justify-center items-center">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">
          CITY ROAD NETWORK GRAPH
        </div>

        <div className="w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center py-2 mt-4">
          <svg className="w-[600px] h-[320px] flex-shrink-0" viewBox="0 0 600 320">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
            </marker>
          </defs>

          {/* Draw Roads Edges */}
          {GRAPH_EDGES.map((edge, idx) => {
            const fromNode = GRAPH_NODES.find(n => n.id === edge.from)!;
            const toNode = GRAPH_NODES.find(n => n.id === edge.to)!;

            // Check if edge is in shortest path
            let isShortest = false;
            for (let i = 0; i < shortestPath.length - 1; i++) {
              if (
                (shortestPath[i] === edge.from && shortestPath[i + 1] === edge.to) ||
                (shortestPath[i] === edge.to && shortestPath[i + 1] === edge.from)
              ) {
                isShortest = true;
              }
            }

            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isShortest ? "var(--hl-insert)" : "#e2e8f0"}
                  strokeWidth={isShortest ? 5.5 : 2.5}
                  className="transition-all duration-300"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 4}
                  className="font-mono text-[10px] fill-muted-foreground bg-background font-bold text-center"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw City Nodes */}
          {GRAPH_NODES.map((node) => {
            const isSource = node.id === srcNode;
            const isDest = node.id === destNode;
            const isCurrent = node.id === currentNode;
            const isVisited = visitedNodes.includes(node.id);
            const dist = distances[node.id];

            let fill = "bg-card";
            let stroke = "border-border";

            if (isCurrent) {
              fill = "bg-[var(--hl-insert)] text-background";
              stroke = "border-[var(--hl-insert)]";
            } else if (isSource) {
              fill = "bg-[var(--hl-peek)] text-background";
              stroke = "border-[var(--hl-peek)]";
            } else if (isDest) {
              fill = "bg-red-500/20 text-red-500";
              stroke = "border-red-500";
            } else if (isVisited) {
              fill = "bg-green-500/10 text-green-500";
              stroke = "border-green-500/40";
            }

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r="18"
                  className={`${fill} ${stroke} stroke-2 transition-all duration-300`}
                  fill={isCurrent ? "var(--hl-insert)" : isSource ? "var(--hl-peek)" : isDest ? "rgba(239, 68, 68, 0.2)" : "#fff"}
                  stroke={isCurrent ? "var(--hl-insert)" : isSource ? "var(--hl-peek)" : isDest ? "#ef4444" : "#cbd5e1"}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  className="font-mono text-[10px] font-bold fill-foreground"
                >
                  {node.name.slice(0, 3).toUpperCase()}
                </text>

                {/* Distance tag label */}
                <text
                  textAnchor="middle"
                  y="-22"
                  className="font-mono text-[9px] font-bold fill-muted-foreground"
                >
                  {dist === 99999 ? "∞" : `${dist}km`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      </div>

      {/* source destination selections */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 text-left">
            <span className="font-mono text-[9px] text-muted-foreground uppercase font-bold">Source City</span>
            <select
              value={srcNode}
              onChange={(e) => setSrcNode(Number(e.target.value))}
              disabled={calculating}
              className="bg-background border border-border rounded px-2.5 py-1 text-xs font-mono"
            >
              {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <span className="font-mono text-[9px] text-muted-foreground uppercase font-bold">Destination</span>
            <select
              value={destNode}
              onChange={(e) => setDestNode(Number(e.target.value))}
              disabled={calculating}
              className="bg-background border border-border rounded px-2.5 py-1 text-xs font-mono"
            >
              {GRAPH_NODES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={runDijkstra}
          disabled={calculating || srcNode === destNode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Compute Shortest Route</span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   EXPERIMENT 10: PRIM'S MINIMUM SPANNING TREE SIMULATOR
   ============================================================================ */
function PrimsMstSimulator() {
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [mstEdges, setMstEdges] = useState<GraphEdge[]>([]);
  const [calculating, setCalculating] = useState(false);

  const runPrims = async () => {
    if (calculating) return;
    startSimOp();
    setCalculating(true);
    setVisitedNodes([0]);
    setMstEdges([]);

    try {
      await sleep(1000);

      const V = GRAPH_NODES.length;
      const mstSet = Array(V).fill(false);
      mstSet[0] = true;

      for (let count = 0; count < V - 1; count++) {
        let minWeight = 99999;
        let nextEdge: GraphEdge | null = null;
        let nextNode = -1;

        // Find the cheapest edge connecting visited set to unvisited set
        for (const edge of GRAPH_EDGES) {
          const uVisited = mstSet[edge.from];
          const vVisited = mstSet[edge.to];

          if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
            if (edge.weight < minWeight) {
              minWeight = edge.weight;
              nextEdge = edge;
              nextNode = uVisited ? edge.to : edge.from;
            }
          }
        }

        if (nextEdge && nextNode !== -1) {
          mstSet[nextNode] = true;
          setVisitedNodes(prev => [...prev, nextNode]);
          setMstEdges(prev => [...prev, nextEdge!]);
          await sleep(1200);
        }
      }
    } catch (e) {
      if (!(e instanceof SimulationCancelledError)) throw e;
    } finally {
      setCalculating(false);
      stopSimOp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Weighted Graph Map View */}
      <div className="border border-border/80 bg-background/50 rounded-xl p-4 relative min-h-[340px] flex flex-col justify-center items-center">
        <div className="absolute top-2 left-2 text-[8px] font-bold text-muted-foreground tracking-widest font-mono">
          MINIMUM SPANNING TREE SPAN
        </div>

        <div className="w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center py-2 mt-4">
          <svg className="w-[600px] h-[320px] flex-shrink-0" viewBox="0 0 600 320">
          {/* Draw Roads Edges */}
          {GRAPH_EDGES.map((edge, idx) => {
            const fromNode = GRAPH_NODES.find(n => n.id === edge.from)!;
            const toNode = GRAPH_NODES.find(n => n.id === edge.to)!;

            // Check if edge is in MST spanning path
            const isMst = mstEdges.some(e =>
              (e.from === edge.from && e.to === edge.to) ||
              (e.from === edge.to && e.to === edge.from)
            );

            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isMst ? "var(--hl-insert)" : "#e2e8f0"}
                  strokeWidth={isMst ? 5.5 : 2.5}
                  className="transition-all duration-300"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 4}
                  className="font-mono text-[10px] fill-muted-foreground bg-background font-bold text-center"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw City Nodes */}
          {GRAPH_NODES.map((node) => {
            const isVisited = visitedNodes.includes(node.id);

            let fill = "bg-card";
            let stroke = "border-border";

            if (isVisited) {
              fill = "bg-[var(--hl-peek)] text-background";
              stroke = "border-[var(--hl-peek)]";
            }

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r="18"
                  className={`${fill} ${stroke} stroke-2 transition-all duration-300`}
                  fill={isVisited ? "var(--hl-peek)" : "#fff"}
                  stroke={isVisited ? "var(--hl-peek)" : "#cbd5e1"}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  className="font-mono text-[10px] font-bold fill-foreground"
                >
                  {node.name.slice(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      </div>

      {/* Control button */}
      <div className="flex items-center justify-between bg-card/25 p-4 rounded-xl border border-border">
        <button
          onClick={runPrims}
          disabled={calculating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--hl-insert)] text-background font-mono text-xs font-bold hover:opacity-90 disabled:opacity-30"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Run Prim's MST Algorithm</span>
        </button>

        <button
          onClick={() => {
            setVisitedNodes([]);
            setMstEdges([]);
          }}
          disabled={calculating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background font-mono text-xs font-bold hover:bg-accent disabled:opacity-30"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset MST</span>
        </button>
      </div>
    </div>
  );
}
