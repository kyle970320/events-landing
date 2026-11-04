import { useCallback, useEffect, useRef, useState } from "react";
import {
  GitFork,
  Workflow,
  Undo2,
  Redo2,
  Columns3,
  Maximize2,
  Minimize2,
  Download,
  SlidersHorizontal,
  Search,
  Plus,
  Minus,
  Scan,
  Trash2,
  X,
  Database,
  Braces,
  Layers3,
  GitBranch,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  lanes,
  kinds,
  kindLanes,
  LANE_GAP,
  NODE_WIDTH as NW,
  NODE_HEIGHT as NH,
  WORLD_WIDTH as WW,
  WORLD_HEIGHT as WH,
  createGraph,
  connectNodes,
  deleteSelection,
} from "./graph-model.js";
import "./data-canvas.css";

const icons = {
  source: Database,
  transform: Braces,
  structure: Layers3,
  result: Workflow,
  analysis: Columns3,
};
const clone = (graph) => structuredClone(graph);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
function Tool({ label, children, ...props }) {
  return (
    <button
      type="button"
      className="canvas-tool"
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
export default function DataCanvas() {
  const locked = false;
  const [graph, setGraph] = useState(createGraph);
  const renderedNodesRef = useRef(null);
  const graphRef = useRef(graph);
  graphRef.current = graph;
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.6 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [selection, setSelection] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [trace, setTrace] = useState(false);
  const [tab, setTab] = useState("lineage");
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState({ past: [], future: [] });
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState("source");
  const [showSettings, setShowSettings] = useState(false);
  const shellRef = useRef(null),
    viewportRef = useRef(null),
    gesture = useRef(null),
    dialogRef = useRef(null);
  const record = useCallback(
    (before) =>
      setHistory((h) => ({
        past: [...h.past.slice(-39), clone(before)],
        future: [],
      })),
    [],
  );
  const commit = useCallback(
    (next) => {
      if (locked || next === graphRef.current) return;
      record(graphRef.current);
      graphRef.current = next;
      setGraph(next);
    },
    [record, locked],
  );
  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el || !el.clientWidth || !el.clientHeight) return;
    const nodes = renderedNodesRef.current || graphRef.current.nodes;
    const maxX = Math.max(WW, ...nodes.map((n) => n.x + (n.width || NW) + 30));
    const maxY = Math.max(WH, ...nodes.map((n) => n.y + (n.height || NH) + 20));
    const zoom = Math.min(
      (el.clientWidth - 36) / maxX,
      (el.clientHeight - 24) / maxY,
      1.2,
    );
    setView({ x: (el.clientWidth - maxX * zoom) / 2, y: 5, zoom });
  }, []);
  useEffect(() => {
    fit();
  }, [fit]);
  useEffect(() => {
    const observer = new ResizeObserver(fit);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [fit]);
  useEffect(() => {
    if (showAdd) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [showAdd]);
  const undo = useCallback(() => {
    if (locked || !history.past.length) return;
    const previous = history.past.at(-1);
    setHistory({
      past: history.past.slice(0, -1),
      future: [clone(graphRef.current), ...history.future],
    });
    graphRef.current = previous;
    setGraph(previous);
    setSelection(null);
    setConnecting(null);
  }, [history, locked]);
  const redo = useCallback(() => {
    if (locked || !history.future.length) return;
    const next = history.future[0];
    setHistory({
      past: [...history.past, clone(graphRef.current)],
      future: history.future.slice(1),
    });
    graphRef.current = next;
    setGraph(next);
    setSelection(null);
    setConnecting(null);
  }, [history, locked]);
  const remove = useCallback(() => {
    if (!selection) return;
    commit(deleteSelection(graphRef.current, selection));
    setSelection(null);
    setConnecting(null);
    setMessage("선택한 항목을 삭제했습니다. 실행 취소로 복원할 수 있습니다.");
  }, [selection, commit]);
  function keyDown(e) {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
    if (e.key === "Escape") {
      setConnecting(null);
      setSelection(null);
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    }
  }
  function point(e) {
    const r = viewportRef.current.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: (e.clientX - r.left - v.x) / v.zoom,
      y: (e.clientY - r.top - v.y) / v.zoom,
    };
  }
  function startNode(e, node) {
    if (locked || e.button !== 0 || e.target.closest("button")) return;
    e.stopPropagation();
    shellRef.current.focus({ preventScroll: true });
    setSelection({ type: "node", id: node.id });
    const p = point(e);
    gesture.current = {
      type: "node",
      id: node.id,
      x: p.x,
      y: p.y,
      startX: node.x,
      startY: node.y,
      before: clone(graphRef.current),
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function startPan(e) {
    if (
      e.button !== 0 ||
      e.target.closest("button,.canvas-node,.canvas-edge-hit")
    )
      return;
    shellRef.current.focus({ preventScroll: true });
    setSelection(null);
    gesture.current = {
      type: "pan",
      x: e.clientX,
      y: e.clientY,
      startX: view.x,
      startY: view.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const g = gesture.current;
    if (connecting) setCursor(point(e));
    if (!g) return;
    if (g.type === "pan")
      setView((v) => ({
        ...v,
        x: g.startX + e.clientX - g.x,
        y: g.startY + e.clientY - g.y,
      }));
    if (g.type === "node") {
      const p = point(e),
        dx = p.x - g.x,
        dy = p.y - g.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) g.moved = true;
      const next = {
        ...graphRef.current,
        nodes: graphRef.current.nodes.map((n) =>
          n.id === g.id
            ? {
                ...n,
                x: Math.max(0, g.startX + dx),
                y: Math.max(62, g.startY + dy),
              }
            : n,
        ),
      };
      graphRef.current = next;
      setGraph(next);
    }
  }
  function end(e) {
    const g = gesture.current;
    gesture.current = null;
    if (g?.type === "node" && g.moved) record(g.before);
    if (g?.type === "port") {
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("[data-input]")?.dataset.input;
      if (target) finishConnection(g.source, target);
    }
  }
  function finishConnection(source, target) {
    const next = connectNodes(
      graphRef.current,
      source,
      target,
      `edge-${crypto.randomUUID()}`,
    );
    if (next !== graphRef.current) {
      commit(next);
      setMessage("노드를 연결했습니다.");
    } else setMessage("같은 노드 또는 이미 연결된 노드입니다.");
    setConnecting(null);
    setCursor(null);
  }
  function startPort(e, id) {
    if (locked) return;
    e.stopPropagation();
    setConnecting(id);
    setCursor(point(e));
    gesture.current = { type: "port", source: id };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function zoomBy(factor, anchor) {
    const v = viewRef.current;
    const r = viewportRef.current;
    const cx = anchor?.x ?? r.clientWidth / 2,
      cy = anchor?.y ?? r.clientHeight / 2;
    const zoom = clamp(v.zoom * factor, 0.2, 1.8),
      ratio = zoom / v.zoom;
    setView({ x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio, zoom });
  }
  useEffect(() => {
    const el = viewportRef.current;
    function wheel(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const v = viewRef.current;
      const z = clamp(v.zoom * Math.exp(-e.deltaY * 0.008), 0.2, 1.8);
      const ratio = z / v.zoom;
      const cx = e.clientX - r.left,
        cy = e.clientY - r.top;
      setView({
        x: cx - (cx - v.x) * ratio,
        y: cy - (cy - v.y) * ratio,
        zoom: z,
      });
    }
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  function layout() {
    const next = {
      ...graph,
      nodes: graph.nodes.map((n) => {
        const group = graph.nodes.filter((other) => other.lane === n.lane);
        const index = group.findIndex((other) => other.id === n.id);
        const maxCount = Math.max(
          3,
          ...lanes.map(
            (_, i) => graph.nodes.filter((other) => other.lane === i).length,
          ),
        );
        return {
          ...n,
          x: 24 + n.lane * LANE_GAP,
          y: 100 + ((maxCount - group.length) / 2 + index) * 140,
        };
      }),
    };
    commit(next);
    setMessage("단계별로 노드를 정렬했습니다.");
    requestAnimationFrame(fit);
  }
  function addNode(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const lane = kindLanes[newKind];
    const y = Math.max(
      100,
      ...graph.nodes.filter((n) => n.lane === lane).map((n) => n.y + NH + 30),
    );
    const added = {
      id: crypto.randomUUID(),
      lane,
      x: 24 + lane * LANE_GAP,
      y,
      kind: newKind,
      title: newTitle.trim(),
      description: "사용자 정의 노드",
      metric: "새 노드",
      mock: true,
    };
    commit({ ...graph, nodes: [...graph.nodes, added] });
    setSelection({ type: "node", id: added.id });
    setShowAdd(false);
    setNewTitle("");
    setSearch("");
    setKindFilter("all");
    setMessage("새 노드를 추가했습니다.");
    requestAnimationFrame(fit);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "d-sket-data-lineage.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("현재 캔버스를 JSON 파일로 내보냈습니다.");
  }
  const displayNodes = graph.nodes;
  renderedNodesRef.current = displayNodes;
  const visible = displayNodes.filter(
    (n) =>
      (kindFilter === "all" || n.kind === kindFilter) &&
      `${n.title} ${n.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const visibleIds = new Set(visible.map((n) => n.id));
  const traced = selection?.type === "node"
    ? new Set([selection.id, ...graph.edges.flatMap(edge =>
        edge.source === selection.id ? [edge.target] : edge.target === selection.id ? [edge.source] : []
      )])
    : null;
  const selectedNode =
    selection?.type === "node"
      ? graph.nodes.find((n) => n.id === selection.id)
      : null;
  const selectedEdge =
    selection?.type === "edge"
      ? graph.edges.find((e) => e.id === selection.id)
      : null;
  const edges = graph.edges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target),
  );
  const nodeMap = new Map(displayNodes.map((n) => [n.id, n]));
  const worldWidth = Math.max(
    WW,
    ...displayNodes.map((n) => n.x + (n.width || NW) + 35),
  );
  const worldHeight = Math.max(
    WH,
    ...displayNodes.map((n) => n.y + (n.height || NH) + 25),
  );
  function edgePath(from, to) {
    const x1 = from.x + (from.width || NW),
      y1 = from.y + (from.height || NH) / 2,
      x2 = to.x,
      y2 = to.y + (to.height || NH) / 2;
    if (x2 < x1) {
      const bottom =
        Math.max(from.y + (from.height || NH), to.y + (to.height || NH)) + 30;
      return `M${x1},${y1} H${x1 + 25} V${bottom} H${x2 - 25} V${y2} H${x2}`;
    }
    const mid = x1 + (x2 - x1) / 2;
    return `M${x1},${y1} H${mid} V${y2} H${x2}`;
  }
  return (
    <div
      className={`data-canvas ${expanded ? "is-expanded" : ""} ${locked ? "is-simulating" : ""}`}
      id="example"
      ref={shellRef}
      tabIndex={0}
      onKeyDown={keyDown}
      aria-label="데이터 구조화 편집 캔버스"
    >
      <div className="canvas-topbar">
        <div className="canvas-actions">
          <Tool
            label="실행 취소"
            disabled={locked || !history.past.length}
            onClick={undo}
          >
            <Undo2 size={14} />
          </Tool>
          <Tool
            label="다시 실행"
            disabled={locked || !history.future.length}
            onClick={redo}
          >
            <Redo2 size={14} />
          </Tool>
          <span className="canvas-divider" />
          <button
            className="canvas-text-tool"
            disabled={locked}
            onClick={layout}
          >
            <Columns3 size={14} />
            <span>자동 정렬</span>
          </button>
          <Tool
            label={expanded ? "캔버스 접기" : "캔버스 크게 보기"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Tool>
          <Tool label="캔버스 JSON 내보내기" onClick={download}>
            <Download size={14} />
          </Tool>
          <Tool
            label="캔버스 설정"
            disabled={locked}
            aria-expanded={showSettings}
            onClick={() => setShowSettings((v) => !v)}
          >
            <SlidersHorizontal size={14} />
          </Tool>
        </div>
      </div>
      <div className="canvas-legend">
        <span>노드 유형</span>
        {Object.entries(kinds).map(([key, [label]]) => (
          <span className={`legend-item kind-${key}`} key={key}>
            <i />
            {label}
          </span>
        ))}
      </div>
      <div
        className="canvas-stage"

        ref={viewportRef}
        onPointerDown={startPan}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={() => {
          if (gesture.current?.type === "node" && gesture.current.moved)
            record(gesture.current.before);
          gesture.current = null;
        }}
        onClickCapture={(e) => {
          if (locked && e.target.closest(".canvas-node,.canvas-edge-hit")) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <div
          className="canvas-world"
          style={{
            width: worldWidth,
            height: worldHeight,
            transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})`,
          }}
        >
          {lanes.map(([title, desc], i) => (
            <div
              key={title}
              className="canvas-lane"
              style={{ left: 10 + i * LANE_GAP, height: worldHeight - 12 }}
            >
              <div className="lane-heading">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
                <b>
                  {String(
                    graph.nodes.filter((n) => n.lane === i).length,
                  ).padStart(2, "0")}
                </b>
              </div>
              <div className="lane-body" />
            </div>
          ))}
          <svg
            className="canvas-edges"
            width={worldWidth}
            height={worldHeight}
            aria-label="노드 연결선"
          >
            <defs>
              <marker
                id="lineage-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M0 0 L10 5 L0 10"
                  fill="none"
                  stroke="context-stroke"
                  strokeWidth="1.5"
                />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodeMap.get(edge.source),
                to = nodeMap.get(edge.target);
              const active =
                edge.id === selectedEdge?.id ||
                (selection?.type === "node" &&
                  (edge.target === selection.id ||
                    edge.source === selection.id));
              const faded = traced && !active;
              return (
                <g
                  key={edge.id}
                  className={`canvas-edge ${active ? "is-active" : ""} ${faded ? "is-dimmed" : ""}`}
                >
                  <path
                    d={edgePath(from, to)}
                    markerEnd="url(#lineage-arrow)"
                  />
                  <path
                    className="canvas-edge-hit"
                    d={edgePath(from, to)}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    aria-label={`${from.title} → ${to.title} 연결 선택`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setSelection({ type: "edge", id: edge.id });
                      shellRef.current.focus({ preventScroll: true });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelection({ type: "edge", id: edge.id });
                      }
                    }}
                  />
                </g>
              );
            })}
            {connecting && cursor && nodeMap.has(connecting) && (
              <path
                className="pending-edge"
                d={`M${nodeMap.get(connecting).x + NW},${nodeMap.get(connecting).y + NH / 2} L${cursor.x},${cursor.y}`}
              />
            )}
          </svg>
          {visible.map((n) => {
            const Icon = icons[n.kind];
            const selected =
              selection?.type === "node" && selection.id === n.id;
            return (
              <article
                key={n.id}
                data-node={n.id}
                className={`canvas-node kind-${n.kind} ${traced && !traced.has(n.id) ? "is-muted" : ""} ${tab === "logic" ? "logic-view" : ""}`}
                style={{
                  left: n.x,
                  top: n.y,
                  width: n.width || NW,
                  height: n.height || NH,
                }}
                onPointerDown={(e) => startNode(e, n)}
                onClick={() => setSelection({ type: "node", id: n.id })}
                tabIndex={0}
                aria-label={`${n.title} 노드`}
                onKeyDown={(e) => {
                  if (locked || e.target !== e.currentTarget) return;
                  if (e.key === "Enter") {
                    setSelection({ type: "node", id: n.id });
                    return;
                  }
                  const delta = {
                    ArrowLeft: [-10, 0],
                    ArrowRight: [10, 0],
                    ArrowUp: [0, -10],
                    ArrowDown: [0, 10],
                  }[e.key];
                  if (delta) {
                    e.preventDefault();
                    commit({
                      ...graph,
                      nodes: graph.nodes.map((node) =>
                        node.id === n.id
                          ? {
                              ...node,
                              x: Math.max(0, node.x + delta[0]),
                              y: Math.max(62, node.y + delta[1]),
                            }
                          : node,
                      ),
                    });
                  }
                }}
              >
                <button
                  disabled={locked}
                  className={`canvas-port input ${connecting ? "can-connect" : ""}`}
                  data-input={n.id}
                  aria-label={`${n.title} 입력 연결`}
                  title="다른 노드의 출력 포트에서 연결"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connecting) finishConnection(connecting, n.id);
                    else
                      setMessage(
                        "연결할 노드의 오른쪽 출력 포트를 먼저 선택하세요.",
                      );
                  }}
                />
                <div className="node-eyeline">
                  <span>
                    <Icon size={13} />
                    {kinds[n.kind][1]}
                  </span>
                </div>
                <strong className="node-title">{n.title}</strong>
                <span className="node-description">
                  {tab === "logic"
                    ? `${kinds[n.kind][0]} · 입력 → 처리 → 출력`
                    : n.description}
                </span>
                <div className="node-footer">
                  <span>
                    <i />
                    {n.metric}
                  </span>
                </div>
                {n.kind === "structure" && (
                  <ArrowRight className="decision-arrow" size={16} />
                )}
                <button
                  disabled={locked}
                  className={`canvas-port output ${connecting === n.id ? "is-connecting" : ""}`}
                  aria-label={`${n.title} 출력 연결`}
                  title="드래그하거나 선택 후 대상 입력 포트를 누르세요"
                  onPointerDown={(e) => startPort(e, n.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.detail === 0) setConnecting(n.id);
                  }}
                />
              </article>
            );
          })}
        </div>
        {!visible.length && (
          <div className="canvas-empty">
            일치하는 노드가 없습니다.
            <button
              onClick={() => {
                setSearch("");
                setKindFilter("all");
              }}
            >
              필터 초기화
            </button>
          </div>
        )}
        <div className="canvas-zoom" onPointerDown={(e) => e.stopPropagation()}>
          <Tool label="축소" onClick={() => zoomBy(1 / 1.2)}>
            <Minus size={14} />
          </Tool>
          <span>{Math.round(view.zoom * 100)}%</span>
          <Tool label="확대" onClick={() => zoomBy(1.2)}>
            <Plus size={14} />
          </Tool>
          <span className="canvas-divider" />
          <Tool label="화면에 맞추기" onClick={fit}>
            <Scan size={14} />
          </Tool>
        </div>
        <div className="canvas-hint">
          {connecting
            ? "대상 노드의 왼쪽 포트를 선택하세요 · Esc 취소"
            : "드래그로 이동 · Ctrl/⌘ + 스크롤로 확대 · 포트로 연결"}
        </div>
        <div
          className="canvas-minimap"
          aria-label="전체 노드 미니맵"
          onPointerDown={(e) => {
            e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            setView((v) => ({
              ...v,
              x:
                viewportRef.current.clientWidth / 2 -
                ((e.clientX - r.left) / r.width) * worldWidth * v.zoom,
              y:
                viewportRef.current.clientHeight / 2 -
                ((e.clientY - r.top) / r.height) * worldHeight * v.zoom,
            }));
          }}
        >
          <svg viewBox={`0 0 ${worldWidth} ${worldHeight}`}>
            {displayNodes.map((n) => (
              <rect
                key={n.id}
                x={n.x}
                y={n.y}
                width={n.width || NW}
                height={n.height || NH}
                className={n.kind === "structure" ? "mini-selected" : ""}
              />
            ))}
            <rect
              className="minimap-viewport"
              x={-view.x / view.zoom}
              y={-view.y / view.zoom}
              width={(viewportRef.current?.clientWidth ?? 1000) / view.zoom}
              height={(viewportRef.current?.clientHeight ?? 550) / view.zoom}
            />
          </svg>
        </div>
      </div>
      <span className="sr-only" role="status">{message}</span>
      {showSettings && (
        <div className="canvas-settings">
          <div>
            <strong>캔버스 설정</strong>
            <Tool label="설정 닫기" onClick={() => setShowSettings(false)}>
              <X size={14} />
            </Tool>
          </div>
          <p>
            변경 내용은 현재 화면에서만 유지됩니다.
            <br />
            새로고침하면 기본 예시로 돌아갑니다.
          </p>
          <button
            onClick={() => {
              commit(createGraph());
              setSelection(null);
              setConnecting(null);
              setShowSettings(false);
              setSearch("");
              setKindFilter("all");
              requestAnimationFrame(fit);
              setMessage("기본 예시를 복원했습니다.");
            }}
          >
            <RotateCcw size={13} />
            기본 예시 복원
          </button>
        </div>
      )}
      <dialog
        className="canvas-add-dialog"
        ref={dialogRef}
        onCancel={() => setShowAdd(false)}
        onClose={() => setShowAdd(false)}
      >
        <form onSubmit={addNode}>
          <div className="add-dialog-heading">
            <h3>노드 추가</h3>
            <Tool label="노드 추가 닫기" onClick={() => setShowAdd(false)}>
              <X size={17} />
            </Tool>
          </div>
          <label>
            노드 이름
            <input
              autoFocus
              required
              maxLength={36}
              placeholder="예: 고객 문의 데이터"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </label>
          <label>
            노드 유형
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value)}
            >
              {Object.entries(kinds).map(([key, [label]]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p>선택한 유형의 단계에 노드를 추가합니다.</p>
          <button
            className="canvas-submit"
            type="submit"
            disabled={!newTitle.trim()}
          >
            노드 추가
          </button>
        </form>
      </dialog>
    </div>
  );
}
