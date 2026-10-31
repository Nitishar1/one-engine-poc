interface EdgeLike {
  source: string;
  target: string;
}

/** True when `to` is reachable from `from` following edge direction. */
export function canReach(from: string, to: string, edges: EdgeLike[]): boolean {
  const adjacency = new Map<string, string[]>();
  edges.forEach((e) => adjacency.set(e.source, [...(adjacency.get(e.source) ?? []), e.target]));
  const stack = [from];
  const seen = new Set<string>();
  while (stack.length) {
    const current = stack.pop() as string;
    if (current === to) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...(adjacency.get(current) ?? []));
  }
  return false;
}

/** Ids of every node reachable from `start` (including itself). */
export function reachableFrom(start: string, edges: EdgeLike[]): Set<string> {
  const reached = new Set<string>([start]);
  let frontier = [start];
  while (frontier.length) {
    const next: string[] = [];
    for (const e of edges) {
      if (frontier.includes(e.source) && !reached.has(e.target)) {
        reached.add(e.target);
        next.push(e.target);
      }
    }
    frontier = next;
  }
  return reached;
}
