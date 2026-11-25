import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import {
  fields,
  validateRecord,
  getStatus,
  filterRecords,
  toCsv,
  toJson,
  REFERENCE_DATE,
} from "./model.js";
const rawDates = {
  digital: { start: "2026.11.01", end: "2026.11.15" },
  voucher: { start: "2026년 11월 2일", end: "2026년 11월 20일" },
  startup: { start: "2026. 11. 3.", end: "" },
};
function Button({ children, primary = false, className = "", ...props }) {
  return (
    <button
      className={`button ${primary ? "primary" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function ExtractedFields({
  record,
  selected,
  complete,
  revealed,
  phase,
  activeField,
  setActiveField,
  onChange,
}) {
  const errors = complete ? validateRecord(record) : {};
  return (
    <section
      className="panel extraction-panel live-extraction"
      aria-labelledby="extraction-title"
    >
      <div className="panel-heading">
        <h2 id="extraction-title">
          <Sparkles size={17} /> 구조화된 항목
        </h2>
        <Badge tone={complete ? "blue" : ""}>
          {complete ? "추출 완료" : revealed ? `${revealed} / 5` : "추출 대기"}
        </Badge>
      </div>
      <div className="live-fields">
        {fields.map((field, index) => {
          const visible = complete || index < revealed;
          const rawDate =
            field.type === "date" ? rawDates[selected][field.key] : null;
          const normalized = phase === "normalizing" || complete;
          return (
            <div
              key={field.key}
              className={`live-field ${visible ? "is-revealed" : "is-waiting"} ${activeField === field.key ? "live-field-active" : ""}`}
            >
              <div className="live-field-label">
                <label htmlFor={`field-${field.key}`}>{field.label}</label>
                {visible && (
                  <span>
                    {!record[field.key] ? (
                      <Badge tone="amber">원문에 없음</Badge>
                    ) : normalized && field.type === "date" ? (
                      <span className="field-ready">
                        <Check size={12} /> 형식 통일
                      </span>
                    ) : (
                      <Check size={13} />
                    )}
                  </span>
                )}
              </div>
              {!visible ? (
                <div
                  className="field-placeholder"
                  aria-label={`${field.label} 추출 대기`}
                >
                  <span />
                  <span />
                </div>
              ) : complete ? (
                <input
                  id={`field-${field.key}`}
                  type={field.type || "text"}
                  value={record[field.key]}
                  placeholder={
                    field.key === "end" ? "원문에서 확인되지 않음" : ""
                  }
                  aria-invalid={Boolean(errors[field.key])}
                  aria-describedby={
                    errors[field.key] ? `error-${field.key}` : undefined
                  }
                  onFocus={() => setActiveField(field.key)}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              ) : (
                <div
                  className={`live-value ${normalized && field.type === "date" ? "value-normalized" : ""}`}
                >
                  {field.type === "date" && !normalized
                    ? rawDate || "원문에서 확인되지 않음"
                    : record[field.key] || "원문에서 확인되지 않음"}
                </div>
              )}
              {visible && field.type === "date" && rawDate && normalized && (
                <span className="date-transformation">
                  <del>{rawDate}</del>
                  <span>YYYY-MM-DD</span>
                </span>
              )}
              {errors[field.key] && (
                <span className="field-error" id={`error-${field.key}`}>
                  {errors[field.key]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="live-field-footnote">
        <Info size={15} />
        <p>
          {complete
            ? !record.end
              ? "마감일은 원문에 없어 비워뒀어요. 항목은 바로 수정할 수 있습니다."
              : "항목을 누르면 원문 근거가 표시됩니다. 수정한 값은 아래 결과에 바로 반영돼요."
            : "문장의 정보가 항목별 데이터로 바뀌는 과정을 확인하세요."}
        </p>
      </div>
    </section>
  );
}
export function DataResults({ state, selected, openDocument, notify }) {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("csv");
  const records = filterRecords(state.records, { query, target, status });
  const hasErrors = records.some(
    (record) => Object.keys(validateRecord(record)).length > 0,
  );
  function download() {
    if (!records.length || hasErrors) return;
    const content = format === "csv" ? toCsv(records) : toJson(records);
    const url = URL.createObjectURL(
      new Blob([content], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8"
            : "application/json;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `d-sket-notices.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`${records.length}건을 ${format.toUpperCase()}로 내려받았습니다.`);
  }
  return (
    <section
      className={`panel results-panel inline-results ${state.processed ? "results-ready" : ""}`}
      aria-labelledby="results-title"
    >
      <div className="results-heading">
        <div>
          <h2 id="results-title">
            <Table2 size={20} />{" "}
            {state.processed
              ? "3개의 문서가 검색 가능한 데이터로 바뀌었어요."
              : "정리된 데이터가 이곳에 모입니다."}
          </h2>
          <p>
            {state.processed ? (
              <>
                조건을 바꿔 바로 검색해보세요.{" "}
                <span>접수 상태 기준일 {REFERENCE_DATE}</span>
              </>
            ) : (
              "변환이 끝나면 이 화면에서 바로 검색하고 내려받을 수 있어요."
            )}
          </p>
        </div>
        {state.processed && (
          <div className="export-controls">
            <label className="sr-only" htmlFor="export-format">
              다운로드 형식
            </label>
            <div className="select-wrap">
              <select
                id="export-format"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <ChevronDown size={14} />
            </div>
            <Button
              primary
              onClick={download}
              disabled={!records.length || hasErrors}
            >
              <Download size={16} /> 내려받기
            </Button>
          </div>
        )}
      </div>
      {!state.processed ? (
        <div className="result-preview" aria-label="결과 대기">
          <div className="preview-head">
            <span>공고명</span>
            <span>지원 대상</span>
            <span>접수 기간</span>
            <span>접수 상태</span>
          </div>
          {[0, 1, 2].map((index) => (
            <div className="preview-row" key={index}>
              <span />
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="search-input">
              <Search size={18} />
              <label className="sr-only" htmlFor="search">
                공고명·기관·대상 검색
              </label>
              <input
                id="search"
                placeholder="공고명, 기관, 대상 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="검색어 지우기">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="select-wrap">
              <select
                aria-label="지원 대상 필터"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="">지원 대상 전체</option>
                {[...new Set(state.records.map((record) => record.target))]
                  .filter(Boolean)
                  .map((value) => (
                    <option key={value}>{value}</option>
                  ))}
              </select>
              <ChevronDown size={14} />
            </div>
            <div className="select-wrap">
              <select
                aria-label="접수 상태 필터"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">접수 상태 전체</option>
                {["접수 중", "접수 예정", "접수 마감", "일정 확인 필요"].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
              <ChevronDown size={14} />
            </div>
            <span className="result-count">{records.length}건</span>
          </div>
          {hasErrors && (
            <p className="result-error" role="alert">
              필수 항목 또는 접수 기간을 확인해 주세요. 값을 수정하면 다운로드할
              수 있어요.
            </p>
          )}
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>공고명 / 주관 기관</th>
                  <th>지원 대상</th>
                  <th>접수 기간</th>
                  <th>접수 상태</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className={selected === record.id ? "selected-result" : ""}
                  >
                    <td>
                      <button
                        className="record-link"
                        onClick={() => openDocument(record.id)}
                      >
                        {record.title || "공고명 입력 필요"}
                        <ChevronRight size={14} />
                      </button>
                      <span className="table-organization">
                        {record.organization || "주관 기관 입력 필요"}
                      </span>
                    </td>
                    <td>
                      <Badge>{record.target || "확인 필요"}</Badge>
                    </td>
                    <td className="date-cell">
                      {record.start || "미확인"}
                      <span> ~ {record.end || "마감일 미확인"}</span>
                    </td>
                    <td>
                      <Badge
                        tone={
                          Object.keys(validateRecord(record)).length
                            ? "amber"
                            : getStatus(record) === "접수 중"
                              ? "blue"
                              : "amber"
                        }
                      >
                        {Object.keys(validateRecord(record)).length
                          ? "입력 확인 필요"
                          : getStatus(record)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!records.length && (
              <div className="no-results">
                <Search size={24} />
                <h3>조건에 맞는 공고가 없어요.</h3>
                <Button
                  onClick={() => {
                    setQuery("");
                    setTarget("");
                    setStatus("");
                  }}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
          <div className="table-footer">
            <span>
              공고명을 누르면 위에서 원본과 추출값을 비교할 수 있어요.
            </span>
            <span>현재 결과 {records.length}건 다운로드</span>
          </div>
        </>
      )}
    </section>
  );
}
