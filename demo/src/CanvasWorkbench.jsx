import { useEffect, useRef, useState } from "react";
import {
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  FileText,
  Focus,
  GitFork,
  Info,
  Maximize2,
  Minimize2,
  Minus,
  Network,
  Play,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Workflow,
  X,
} from "lucide-react";
import {
  documents,
  fields,
  initialState,
  updateRecord,
  REFERENCE_DATE,
} from "./model.js";
import {
  WORLD,
  lanes,
  nodes,
  edges,
  edgePath,
  lineageFor,
  clampZoom,
} from "./canvas-model.js";
import { SourceDocument } from "./SourceDocument.jsx";
import { DataResults, ExtractedFields } from "./InspectorParts.jsx";

const SESSION_KEY = "dsket-demo-v1";
const icons = {
  source: FileText,
  extract: Sparkles,
  transform: Braces,
  dataset: Database,
  output: Search,
};
const typeLabels = {
  source: "DATA SOURCE",
  extract: "EXTRACTION",
  transform: "TRANSFORM",
  dataset: "DATASET",
  output: "APPLICATION",
};
function readSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (
      typeof value?.processed === "boolean" &&
      value.records?.length === documents.length &&
      documents.every((doc) =>
        value.records.some(
          (record) =>
            record.id === doc.id &&
            fields.every((field) => typeof record[field.key] === "string"),
        ),
      )
    )
      return value;
  } catch {
    /* Storage is optional. */
  }
  return initialState();
}
function Tool({ label, children, ...props }) {
  return (
    <button className="graph-tool" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}
function NodeContents({ node, state, phase, revealed, selected, logic }) {
  const complete = state.processed;
  const assembled = complete || phase === "assembling";
  if (logic)
    return (
      <div className="node-logic">
        {node.type === "source" ? (
          <>
            <span>
              입력 형식 <b>PDF 원문</b>
            </span>
            <span>
              수집 방식 <b>준비된 샘플</b>
            </span>
            <span>
              처리 단위 <b>문서 1건</b>
            </span>
          </>
        ) : node.type === "extract" ? (
          <>
            <span>
              추출 기준 <b>핵심 항목 5개</b>
            </span>
            <span>
              매핑 <b>원문 → 필드</b>
            </span>
            <span>
              근거 추적 <b>원문 구간 연결</b>
            </span>
          </>
        ) : node.type === "transform" ? (
          <>
            <span>
              날짜 형식 <b>YYYY-MM-DD</b>
            </span>
            <span>
              누락된 값 <b>추정 없이 공란</b>
            </span>
          </>
        ) : node.type === "dataset" ? (
          <>
            <span>
              테이블 <b>공고 데이터</b>
            </span>
            <span>
              스키마 <b>필드 5개</b>
            </span>
            <span>
              레코드 수 <b>3건</b>
            </span>
            <span>
              수정 반영 <b>즉시 적용</b>
            </span>
          </>
        ) : (
          <>
            <span>
              필터 <b>대상 · 기간</b>
            </span>
            <span>
              출력 형식 <b>CSV · JSON</b>
            </span>
            <span>
              상태 기준일 <b>{REFERENCE_DATE}</b>
            </span>
          </>
        )}
      </div>
    );
  if (node.type === "source") {
    const doc = documents.find((doc) => doc.id === node.id);
    return (
      <>
        <p className="node-description">{doc.file}</p>
        <div
          className={`node-document ${phase === "reading" ? "node-scanning" : ""}`}
        >
          <i />
          <i />
          <i />
        </div>
        <div className="node-footer">
          <span>
            {complete
              ? "원문 연결됨"
              : phase === "reading"
                ? "원문 읽는 중"
                : "샘플 준비됨"}
          </span>
          <span>PDF</span>
        </div>
      </>
    );
  }
  if (node.type === "extract") {
    const record = state.records.find((record) => record.id === selected);
    return (
      <>
        <p className="node-description">문장 속 정보를 항목별로 분리</p>
        <div className="node-field-list">
          {fields.map((field, index) => (
            <span
              key={field.key}
              className={complete || index < revealed ? "node-field-ready" : ""}
            >
              <span>{field.label}</span>
              <b>
                {complete || index < revealed
                  ? field.type === "date"
                    ? "날짜 발견"
                    : record[field.key]
                  : "—"}
              </b>
              {(complete || index < revealed) && <Check size={10} />}
            </span>
          ))}
        </div>
        <div className="node-footer">
          <span>
            {complete
              ? "5개 항목 추출 완료"
              : revealed
                ? `${revealed} / 5 항목 추출`
                : "대기 중"}
          </span>
          <span>5 FIELDS</span>
        </div>
      </>
    );
  }
  if (node.type === "transform")
    return (
      <>
        <p className="node-description">표현이 달라도 같은 형식으로</p>
        <div
          className={`node-date ${phase === "normalizing" || complete ? "node-date-ready" : ""}`}
        >
          <span>2026년 11월 2일</span>
          <b>
            {phase === "normalizing" || complete ? "2026-11-02" : "YYYY-MM-DD"}
          </b>
        </div>
        <div className="node-null">
          <Info size={11} />
          <span>없는 마감일은 비워둡니다</span>
        </div>
        <div className="node-footer">
          <span>
            {complete
              ? "형식 통일 완료"
              : phase === "normalizing"
                ? "날짜 정리 중"
                : "대기 중"}
          </span>
          <span>ISO DATE</span>
        </div>
      </>
    );
  if (node.type === "dataset")
    return (
      <>
        <p className="node-description">검색·집계할 수 있는 구조로</p>
        <div className="node-table">
          <div>
            <span>공고명</span>
            <span>지원 대상</span>
          </div>
          {state.records.map((record) => (
            <div
              key={record.id}
              className={assembled ? "node-record-ready" : ""}
            >
              <span>
                {assembled ? record.title.replace("2026 ", "") : <i />}
              </span>
              <span>{assembled ? record.target : <i />}</span>
            </div>
          ))}
        </div>
        <div className="node-dataset-summary">
          <strong>{assembled ? "3" : "0"}</strong>
          <span>레코드 · 5개 필드</span>
        </div>
        <div className="node-footer">
          <span>{complete ? "활용 준비 완료" : "결과 대기"}</span>
          <span>TABLE</span>
        </div>
      </>
    );
  return (
    <>
      <p className="node-description">필요한 공고만 찾고 가져가기</p>
      <div className="node-query">
        <Search size={12} />
        <span>중소기업 · 접수 중</span>
      </div>
      <div className="node-output-count">
        {complete ? "조건 검색 가능" : "데이터를 기다리는 중"}
      </div>
      <div className="node-formats">
        <span>CSV</span>
        <span>JSON</span>
      </div>
      <div className="node-footer">
        <span>{complete ? "눌러서 결과 확인" : "결과 대기"}</span>
        <Download size={11} />
      </div>
    </>
  );
}
export default function CanvasWorkbench() {
  const [state, setState] = useState(readSession);
  const [phase, setPhase] = useState("idle");
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState("digital");
  const [selection, setSelection] = useState(null);
  const [inspector, setInspector] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [trace, setTrace] = useState(false);
  const [logic, setLogic] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [toast, setToast] = useState("");
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const timers = useRef([]);
  const toastTimer = useRef(null);
  const detailRef = useRef(null);
  const busy = phase !== "idle" && phase !== "complete",
    complete = state.processed;
  const visibleLineage = trace && selection ? lineageFor(selection) : null;
  const selectedNode = nodes.find((node) => node.id === selection);
  const doc = documents.find((doc) => doc.id === selected);
  const record = state.records.find((record) => record.id === selected);
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      /* Optional persistence. */
    }
  }, [state]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(toastTimer.current);
    },
    [],
  );
  function fit() {
    const rect = viewportRef.current?.getBoundingClientRect();
    const width = rect?.width || 1200,
      height = rect?.height || 700;
    const zoom = Math.min(
      1.15,
      Math.max(
        0.35,
        Math.min((width - 60) / WORLD.width, (height - 60) / WORLD.height),
      ),
    );
    setView({
      x: (width - WORLD.width * zoom) / 2,
      y: (height - WORLD.height * zoom) / 2,
      zoom,
    });
  }
  useEffect(() => {
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const escape = (event) => {
      if (event.key === "Escape") {
        setInspector(false);
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    if (inspector) detailRef.current?.focus();
  }, [inspector, selection]);
  useEffect(() => {
    const target = viewportRef.current;
    const wheel = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoomBy(event.deltaY > 0 ? 0.9 : 1.1);
      }
    };
    target.addEventListener("wheel", wheel, { passive: false });
    return () => target.removeEventListener("wheel", wheel);
  }, []);
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }
  function openNode(node) {
    setSelection(node.id);
    if (node.type === "source") setSelected(node.id);
    setInspector(true);
    setActiveField(null);
  }
  function run() {
    if (busy) return;
    setInspector(false);
    setQuery("");
    setKind("all");
    setTrace(false);
    setLogic(false);
    setPhase("reading");
    setRevealed(0);
    setActiveField(null);
    setState((current) => ({ ...current, processed: false }));
    timers.current.forEach(clearTimeout);
    timers.current = fields.map((field, index) =>
      setTimeout(
        () => {
          setPhase("extracting");
          setRevealed(index + 1);
          setActiveField(field.key);
        },
        650 + index * 550,
      ),
    );
    timers.current.push(
      setTimeout(() => {
        setPhase("normalizing");
        setActiveField("start");
      }, 3550),
    );
    timers.current.push(setTimeout(() => setPhase("assembling"), 4350));
    timers.current.push(
      setTimeout(() => {
        setPhase("complete");
        setState((current) => ({ ...current, processed: true }));
        setActiveField(null);
        notify(
          "3건의 공고가 연결됐어요. 마지막 검색 노드를 눌러 활용해보세요.",
        );
      }, 5200),
    );
  }
  function reset() {
    timers.current.forEach(clearTimeout);
    setState(initialState());
    setPhase("idle");
    setRevealed(0);
    setActiveField(null);
    setInspector(false);
    setSelection(null);
    notify("샘플을 처음 상태로 되돌렸어요.");
  }
  function activeNode(node) {
    return phase === "reading"
      ? node.type === "source"
      : phase === "extracting"
        ? node.id === "extract"
        : phase === "normalizing"
          ? node.id === "normalize"
          : phase === "assembling"
            ? node.id === "dataset"
            : complete
              ? node.id === "search"
              : false;
  }
  function edgeStatus(edge) {
    if (complete) return "edge-complete";
    if (phase === "reading") return "";
    if (edge.to === "extract") return "edge-live";
    if (
      edge.to === "normalize" &&
      ["normalizing", "assembling"].includes(phase)
    )
      return "edge-live";
    if (edge.to === "dataset" && phase === "assembling") return "edge-live";
    return "";
  }
  function dimmed(node) {
    return (
      (query.trim() &&
        !`${node.title} ${typeLabels[node.type]} ${node.type === "source" ? documents.find((doc) => doc.id === node.id).file : ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())) ||
      (kind !== "all" && node.type !== kind) ||
      (visibleLineage && !visibleLineage.has(node.id))
    );
  }
  function zoomBy(factor) {
    const rect = viewportRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 1200) / 2,
      cy = (rect?.height || 700) / 2;
    setView((current) => {
      const zoom = clampZoom(current.zoom * factor);
      return {
        x: cx - ((cx - current.x) * zoom) / current.zoom,
        y: cy - ((cy - current.y) * zoom) / current.zoom,
        zoom,
      };
    });
  }
  function startPan(event) {
    if (event.button !== 0 || event.target.closest("button,input,select"))
      return;
    dragRef.current = {
      px: event.clientX,
      py: event.clientY,
      x: view.x,
      y: view.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function movePan(event) {
    const drag = dragRef.current;
    if (drag)
      setView((current) => ({
        ...current,
        x: drag.x + event.clientX - drag.px,
        y: drag.y + event.clientY - drag.py,
      }));
  }
  const isResult =
    selectedNode?.type === "dataset" || selectedNode?.type === "output";
  const phaseText = complete
    ? "변환 완료 · 노드를 눌러 원문과 결과를 확인하세요"
    : phase === "reading"
      ? "원본 문서 읽는 중"
      : phase === "extracting"
        ? `${fields[Math.max(0, revealed - 1)].label} 추출 중 · ${revealed} / 5`
        : phase === "normalizing"
          ? "날짜 형식을 YYYY-MM-DD로 통일하는 중"
          : phase === "assembling"
            ? "3건의 레코드를 데이터셋으로 묶는 중"
            : "샘플을 실행하면 연결선을 따라 데이터가 이동합니다";
  return (
    <main className={`graph-workbench ${expanded ? "graph-expanded" : ""}`}>
      <div className="graph-topbar">
        <div
          className="graph-view-tabs"
          role="tablist"
          aria-label="캔버스 보기"
        >
          <button
            role="tab"
            aria-selected={!logic}
            className={!logic ? "is-active" : ""}
            onClick={() => setLogic(false)}
          >
            <GitFork size={15} /> 데이터 계보
          </button>
          <button
            role="tab"
            aria-selected={logic}
            className={logic ? "is-active" : ""}
            onClick={() => setLogic(true)}
          >
            <Workflow size={15} /> 처리 로직
          </button>
        </div>
        <h1 className="graph-project-name">공고문 구조화 워크플로우</h1>
        <div className="graph-main-tools">
          <Tool label="전체 노드 맞춤" onClick={fit}>
            <Focus size={16} />
          </Tool>
          <Tool
            label={expanded ? "전체 화면 닫기" : "크게 보기"}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Tool>
          <Tool label="샘플 초기화" onClick={reset} disabled={busy}>
            <RotateCcw size={15} />
          </Tool>
          <button className="graph-run" onClick={run} disabled={busy}>
            <Play size={13} />
            {busy ? "실행 중" : complete ? "다시 실행" : "샘플 실행"}
          </button>
        </div>
      </div>
      <div className="graph-filterbar">
        <div className="graph-node-search">
          <Search size={14} />
          <label className="sr-only" htmlFor="node-search">
            노드 검색
          </label>
          <input
            id="node-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="노드 검색…"
          />
          {query && (
            <Tool label="노드 검색 지우기" onClick={() => setQuery("")}>
              <X size={12} />
            </Tool>
          )}
        </div>
        <div className="graph-kind">
          <select
            aria-label="노드 유형"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">모든 유형</option>
            <option value="source">원본 자료</option>
            <option value="extract">항목 추출</option>
            <option value="transform">형식 통일</option>
            <option value="dataset">데이터셋</option>
            <option value="output">업무 활용</option>
          </select>
          <ChevronDown size={12} />
        </div>
        <button
          className={`graph-trace ${trace ? "is-active" : ""}`}
          onClick={() => {
            if (!selection) setSelection("digital");
            setTrace(!trace);
          }}
          aria-pressed={trace}
        >
          <Network size={14} /> 계보 추적
        </button>
        <span className="graph-count">7 노드 · 6 연결</span>
      </div>
      <div className="graph-legend">
        <span>노드 유형</span>
        {[
          ["source", "원본"],
          ["extract", "추출"],
          ["transform", "정제"],
          ["dataset", "데이터셋"],
          ["output", "활용"],
        ].map(([type, label]) => (
          <span key={type}>
            <i className={`kind-${type}`} />
            {label}
          </span>
        ))}
        <span
          className={`graph-live-status ${busy ? "is-running" : ""}`}
          role="status"
          aria-live="polite"
        >
          <i />
          {phaseText}
        </span>
      </div>
      <div
        className="graph-viewport"
        ref={viewportRef}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <div
          className="graph-world"
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})`,
          }}
        >
          {lanes.map((lane, index) => (
            <div
              key={lane.label}
              className="graph-lane"
              style={{ left: lane.x, width: 220 }}
            >
              <div className="graph-lane-title">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{lane.label}</h2>
                  <p>{lane.description}</p>
                </div>
                <b>{lane.count}</b>
              </div>
              <div className="graph-lane-body" />
            </div>
          ))}
          <svg
            className="graph-edges"
            width={WORLD.width}
            height={WORLD.height}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="edge-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const status = edgeStatus(edge);
              const from = nodes.find((node) => node.id === edge.from),
                to = nodes.find((node) => node.id === edge.to);
              return (
                <g
                  key={`${edge.from}-${edge.to}`}
                  className={`${status} ${dimmed(from) || dimmed(to) ? "edge-dimmed" : ""}`}
                >
                  <path
                    className="graph-edge"
                    d={edgePath(edge)}
                    markerEnd="url(#edge-arrow)"
                  />
                  {status === "edge-live" && (
                    <path className="graph-edge-flow" d={edgePath(edge)} />
                  )}
                  <text
                    x={(from.x + from.w + to.x) / 2}
                    y={Math.min(from.y + from.h / 2, to.y + to.h / 2) - 14}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {nodes.map((node) => {
            const Icon = icons[node.type];
            const active = activeNode(node);
            return (
              <button
                key={node.id}
                className={`graph-node kind-${node.type} ${selection === node.id ? "node-selected" : ""} ${active ? "node-executing" : ""} ${complete ? "node-completed" : ""} ${dimmed(node) ? "node-dimmed" : ""}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.w,
                  height: node.h,
                }}
                aria-label={`${node.title} 노드 열기`}
                aria-pressed={selection === node.id}
                onClick={() => openNode(node)}
              >
                <span className="node-port node-port-in" />
                <span className="node-port node-port-out" />
                <span className="node-type">
                  <Icon size={11} />
                  {typeLabels[node.type]}
                  <small>
                    {active && !complete
                      ? "실행 중"
                      : complete
                        ? "완료"
                        : "SAMPLE"}
                  </small>
                </span>
                <strong className="node-title">{node.title}</strong>
                <NodeContents
                  {...{ node, state, phase, revealed, selected, logic }}
                />
              </button>
            );
          })}
        </div>
        <div className="graph-zoom-controls">
          <Tool label="축소" onClick={() => zoomBy(0.85)}>
            <Minus size={15} />
          </Tool>
          <output aria-label="확대 비율">{Math.round(view.zoom * 100)}%</output>
          <Tool label="확대" onClick={() => zoomBy(1.15)}>
            <Plus size={15} />
          </Tool>
          <span />
          <Tool label="화면에 맞추기" onClick={fit}>
            <Focus size={15} />
          </Tool>
        </div>
        <span className="graph-canvas-hint">
          드래그로 이동 · Ctrl/⌘ + 휠로 확대 · 노드를 눌러 상세 보기
        </span>
        <button
          className="graph-minimap"
          aria-label="미니맵 전체 보기"
          title="전체 그래프 맞춤"
          onClick={fit}
        >
          <svg
            viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
            aria-hidden="true"
          >
            {nodes.map((node) => (
              <rect
                key={node.id}
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="7"
                fill={
                  activeNode(node)
                    ? "#1647fc"
                    : selection === node.id
                      ? "#789cf8"
                      : "#aebbcf"
                }
              />
            ))}
          </svg>
        </button>
      </div>
      <footer className="graph-footer">
        <span>
          <Info size={12} /> 가상 데이터 기반 시연 · 실제 파일 업로드·AI 분석
          없음
        </span>
        <a href="mailto:company@data-sketchers.com?subject=%5BD-SKET%5D%20데이터%20구조화%20도입%20문의">
          우리 데이터로 상담하기
        </a>
      </footer>
      {inspector && selectedNode && (
        <aside
          ref={detailRef}
          tabIndex={-1}
          className={`graph-inspector ${isResult ? "inspector-results" : ""}`}
          aria-label={`${selectedNode.title} 상세`}
        >
          <div className="inspector-header">
            <div>
              <span>{typeLabels[selectedNode.type]}</span>
              <h2>{selectedNode.title}</h2>
            </div>
            <Tool label="상세 닫기" onClick={() => setInspector(false)}>
              <X size={19} />
            </Tool>
          </div>
          <div className="inspector-content">
            {selectedNode.type === "source" ? (
              <>
                <div className="inspector-note">
                  원문과 추출값을 한곳에서 비교합니다.
                </div>
                <div className="inspector-source">
                  <SourceDocument
                    document={doc}
                    activeField={activeField}
                    onSelect={setActiveField}
                    reading={phase === "reading"}
                  />
                </div>
                <ExtractedFields
                  {...{
                    record,
                    selected,
                    complete,
                    revealed,
                    phase,
                    activeField,
                    setActiveField,
                  }}
                  onChange={(key, value) =>
                    setState((current) =>
                      updateRecord(current, selected, key, value),
                    )
                  }
                />
              </>
            ) : selectedNode.type === "extract" ||
              selectedNode.type === "transform" ? (
              <>
                <div className="inspector-note">
                  {selectedNode.type === "transform"
                    ? "날짜 표현을 통일하고, 원문에 없는 값은 비워둡니다."
                    : "각 항목의 값과 원문 근거를 확인할 수 있어요."}
                </div>
                <div className="inspector-doc-select">
                  <label htmlFor="inspector-document">확인할 공고문</label>
                  <select
                    id="inspector-document"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                  >
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.values.title}
                      </option>
                    ))}
                  </select>
                </div>
                <ExtractedFields
                  {...{
                    record,
                    selected,
                    complete,
                    revealed,
                    phase,
                    activeField,
                    setActiveField,
                  }}
                  onChange={(key, value) =>
                    setState((current) =>
                      updateRecord(current, selected, key, value),
                    )
                  }
                />
                <div className="inspector-source compact-source">
                  <SourceDocument
                    document={doc}
                    activeField={activeField}
                    onSelect={setActiveField}
                  />
                </div>
              </>
            ) : (
              <DataResults
                state={state}
                selected={selected}
                openDocument={(id) => {
                  setSelected(id);
                  setSelection(id);
                  setActiveField("title");
                }}
                notify={notify}
              />
            )}
          </div>
        </aside>
      )}
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <CheckCircle2 size={17} />
            {toast}
          </>
        )}
      </div>
    </main>
  );
}
