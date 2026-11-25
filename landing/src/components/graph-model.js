export const NODE_WIDTH = 196;
export const NODE_HEIGHT = 110;
export const LANE_GAP = 252;
export const WORLD_WIDTH = 1256;
export const WORLD_HEIGHT = 690;
export const lanes = [
  ["원본 연결", "문서 · 메시지 · 응답 · 표"],
  ["텍스트·필드 분리", "문자 인식과 항목 매핑"],
  ["데이터 정제·통합", "형식 통일과 테이블 생성"],
  ["조회·집계", "필터 · 통계 · 보고서"],
  ["내보내기·연동", "파일과 업무 시스템"],
];
export const kinds = {
  source: ["원본", "데이터 소스"],
  transform: ["필드 분리", "텍스트·필드 처리"],
  structure: ["정제·통합", "데이터 정제·통합"],
  analysis: ["조회·집계", "조회·집계"],
  result: ["내보내기", "내보내기·연동"],
};
export const kindLanes = {
  source: 0,
  transform: 1,
  structure: 2,
  analysis: 3,
  result: 4,
};
const node = (id, lane, y, kind, title, description, metric) => ({
  id,
  lane,
  x: 24 + lane * LANE_GAP,
  y,
  kind,
  title,
  description,
  metric,
});
export function createGraph() {
  const nodes = [
    node(
      "documents",
      0,
      100,
      "source",
      "PDF 공고문·문서",
      "계약서 · 신청서 · 보고서",
      "PDF · 이미지",
    ),
    node(
      "conversations",
      0,
      240,
      "source",
      "고객 문의·VOC",
      "문의 문장과 상담 대화",
      "상담 기록 · TXT",
    ),
    node(
      "responses",
      0,
      380,
      "source",
      "키오스크 조작 로그",
      "시간·세션·화면·행동 기록",
      "이벤트 로그",
    ),
    node(
      "sheets",
      0,
      520,
      "source",
      "엑셀·CSV 파일",
      "열 이름과 형식이 다른 표",
      "XLSX · CSV",
    ),
    node(
      "ocr",
      1,
      100,
      "transform",
      "문서 문자 인식",
      "스캔 이미지에서 텍스트 읽기",
      "이미지 → 텍스트",
    ),
    node(
      "extract",
      1,
      310,
      "transform",
      "이름·날짜·금액 분리",
      "본문의 값을 개별 필드로 분리",
      "이름 / 날짜 / 금액",
    ),
    node(
      "mapping",
      1,
      520,
      "transform",
      "열 이름·항목 매핑",
      "성명·고객명 → 이름으로 매핑",
      "원본 열 → 공통 필드",
    ),
    node(
      "normalize",
      2,
      240,
      "structure",
      "형식 통일·중복 제거",
      "날짜·단위 통일, 중복 행 정리",
      "2026.10.28 → 2026-10-28",
    ),
    node(
      "structure",
      2,
      430,
      "structure",
      "통합 테이블 생성",
      "공통 항목을 기준으로 데이터 통합",
      "이름 · 날짜 · 유형 · 금액",
    ),
    node(
      "analytics",
      3,
      240,
      "analysis",
      "조건 검색·유형별 집계",
      "기간·유형으로 필터하고 건수 집계",
      "필터 · 그룹별 통계",
    ),
    node(
      "reports",
      3,
      430,
      "analysis",
      "집계표·보고서 생성",
      "선택한 지표를 표와 차트로 구성",
      "집계표 · 리포트",
    ),
    node(
      "export",
      4,
      170,
      "result",
      "CSV·JSON 내보내기",
      "정리된 데이터를 파일로 저장",
      "CSV · JSON",
    ),
    node(
      "crm",
      4,
      350,
      "result",
      "CRM 고객 필드 연동",
      "이름·연락처·문의 유형 전달",
      "고객 레코드",
    ),
    node(
      "erp",
      4,
      530,
      "result",
      "ERP·사내 API 연동",
      "정의된 필드와 형식으로 전달",
      "업무 레코드 · API",
    ),
  ];
  const pairs = [
    ["documents", "ocr"],
    ["conversations", "extract"],
    ["responses", "extract"],
    ["sheets", "mapping"],
    ["ocr", "extract"],
    ["extract", "normalize"],
    ["mapping", "normalize"],
    ["normalize", "structure"],
    ["structure", "analytics"],
    ["structure", "reports"],
    ["analytics", "export"],
    ["analytics", "crm"],
    ["reports", "export"],
    ["structure", "crm"],
    ["structure", "erp"],
  ];
  return {
    nodes,
    edges: pairs.map(([source, target], i) => ({
      id: `edge-${i}`,
      source,
      target,
    })),
  };
}
export function connectNodes(graph, source, target, id) {
  if (
    source === target ||
    !graph.nodes.some((n) => n.id === source) ||
    !graph.nodes.some((n) => n.id === target) ||
    graph.edges.some((e) => e.source === source && e.target === target)
  )
    return graph;
  return { ...graph, edges: [...graph.edges, { id, source, target }] };
}
export function deleteSelection(graph, selection) {
  if (!selection) return graph;
  return selection.type === "node"
    ? {
        nodes: graph.nodes.filter((n) => n.id !== selection.id),
        edges: graph.edges.filter(
          (e) => e.source !== selection.id && e.target !== selection.id,
        ),
      }
    : { ...graph, edges: graph.edges.filter((e) => e.id !== selection.id) };
}
export function relatedIds(graph, selected) {
  if (!selected) return null;
  const ids = new Set([selected]);
  const queue = [selected];
  // Walk ancestors and descendants independently, excluding unrelated sibling branches.
  for (const direction of ["up", "down"]) {
    const visited = new Set([selected]);
    const pending = [...queue];
    while (pending.length) {
      const id = pending.shift();
      for (const edge of graph.edges) {
        const next =
          direction === "up"
            ? edge.target === id
              ? edge.source
              : null
            : edge.source === id
              ? edge.target
              : null;
        if (next && !visited.has(next)) {
          visited.add(next);
          ids.add(next);
          pending.push(next);
        }
      }
    }
  }
  return ids;
}
