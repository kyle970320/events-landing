import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGraph,
  connectNodes,
  deleteSelection,
  relatedIds,
} from "./graph-model.js";
test("overview has fourteen nodes across five stages and valid connections", () => {
  const g = createGraph();
  assert.equal(g.nodes.length, 14);
  assert.equal(g.edges.length, 15);
  const ids = new Set(g.nodes.map((n) => n.id));
  assert.equal(ids.size, 14);
  for (const e of g.edges) {
    assert(ids.has(e.source));
    assert(ids.has(e.target));
  }
});
test("connecting accepts a new edge, rejects duplicates, self links and missing endpoints", () => {
  const g = createGraph(),
    next = connectNodes(g, "documents", "export", "new");
  assert.equal(next.edges.length, 16);
  assert.equal(g.edges.length, 15);
  assert.equal(connectNodes(next, "documents", "export", "dup"), next);
  assert.equal(connectNodes(g, "documents", "documents", "self"), g);
  assert.equal(connectNodes(g, "missing", "reports", "bad"), g);
});
test("node deletion removes incoming and outgoing edges; edge deletion retains nodes", () => {
  const g = createGraph();
  const next = deleteSelection(g, { type: "node", id: "extract" });
  assert.equal(next.nodes.length, 13);
  assert(
    next.edges.every((e) => e.source !== "extract" && e.target !== "extract"),
  );
  const edgeOnly = deleteSelection(g, { type: "edge", id: g.edges[0].id });
  assert.equal(edgeOnly.nodes.length, 14);
  assert.equal(edgeOnly.edges.length, 14);
});
test("lineage traversal terminates with cycles and excludes disconnected nodes", () => {
  const g = createGraph();
  g.nodes.push({ id: "isolated" });
  g.edges.push({ id: "cycle", source: "extract", target: "documents" });
  const related = relatedIds(g, "structure");
  assert(related.has("documents"));
  assert(related.has("crm"));
  assert(!related.has("isolated"));
});
