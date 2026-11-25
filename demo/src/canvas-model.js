export const WORLD = { width: 1430, height: 700 };
export const lanes = [
  {
    x: 40,
    label: "DATA SOURCES",
    title: "원본 자료",
    description: "흩어진 문서",
    count: "03",
  },
  {
    x: 320,
    label: "EXTRACTION",
    title: "항목 추출",
    description: "문장에서 필요한 정보로",
    count: "01",
  },
  {
    x: 600,
    label: "TRANSFORM",
    title: "형식 통일",
    description: "같은 기준으로 정리",
    count: "01",
  },
  {
    x: 880,
    label: "DATASET",
    title: "데이터셋",
    description: "검색할 수 있는 테이블",
    count: "01",
  },
  {
    x: 1160,
    label: "APPLICATION",
    title: "업무 활용",
    description: "조회와 내보내기",
    count: "01",
  },
];
export const nodes = [
  {
    id: "digital",
    type: "source",
    title: "디지털 전환 지원사업",
    x: 50,
    y: 125,
    w: 200,
    h: 148,
  },
  {
    id: "voucher",
    type: "source",
    title: "데이터 활용 바우처",
    x: 50,
    y: 310,
    w: 200,
    h: 148,
  },
  {
    id: "startup",
    type: "source",
    title: "창업기업 성장 지원",
    x: 50,
    y: 495,
    w: 200,
    h: 148,
  },
  {
    id: "extract",
    type: "extract",
    title: "공고 항목 추출",
    x: 330,
    y: 265,
    w: 200,
    h: 244,
  },
  {
    id: "normalize",
    type: "transform",
    title: "날짜·형식 통일",
    x: 610,
    y: 275,
    w: 200,
    h: 223,
  },
  {
    id: "dataset",
    type: "dataset",
    title: "공고 데이터셋",
    x: 890,
    y: 230,
    w: 200,
    h: 312,
  },
  {
    id: "search",
    type: "output",
    title: "공고 검색·다운로드",
    x: 1170,
    y: 285,
    w: 200,
    h: 208,
  },
];
export const edges = [
  { from: "digital", to: "extract", label: "원문 텍스트" },
  { from: "voucher", to: "extract", label: "" },
  { from: "startup", to: "extract", label: "" },
  { from: "extract", to: "normalize", label: "추출된 항목" },
  { from: "normalize", to: "dataset", label: "정규화된 레코드" },
  { from: "dataset", to: "search", label: "조건 조회" },
];
export function edgePath(edge) {
  const source = nodes.find((node) => node.id === edge.from);
  const target = nodes.find((node) => node.id === edge.to);
  const x1 = source.x + source.w,
    y1 = source.y + source.h / 2,
    x2 = target.x,
    y2 = target.y + target.h / 2;
  const middle = (x1 + x2) / 2;
  if (Math.abs(y2 - y1) < 16) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const direction = y2 > y1 ? 1 : -1;
  return `M ${x1} ${y1} H ${middle - 10} Q ${middle} ${y1} ${middle} ${y1 + direction * 10} V ${y2 - direction * 10} Q ${middle} ${y2} ${middle + 10} ${y2} H ${x2}`;
}
export function lineageFor(id) {
  const connected = new Set([id]);
  for (const direction of ["from", "to"]) {
    const queue = [id],
      seen = new Set([id]);
    while (queue.length) {
      const current = queue.shift();
      for (const edge of edges) {
        if (edge[direction] !== current) continue;
        const other = edge[direction === "from" ? "to" : "from"];
        if (!seen.has(other)) {
          seen.add(other);
          connected.add(other);
          queue.push(other);
        }
      }
    }
  }
  return connected;
}
export const clampZoom = (value) => Math.min(1.5, Math.max(0.35, value));
