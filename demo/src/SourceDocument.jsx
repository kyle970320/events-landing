import { useEffect, useRef } from "react";
import { fields } from "./model.js";
export function SourceDocument({
  document,
  activeField,
  onSelect,
  reading = false,
}) {
  const sourceRef = useRef(null);
  useEffect(() => {
    if (activeField) {
      const container = sourceRef.current;
      const value = container?.querySelector(`[data-field="${activeField}"]`);
      if (container && value)
        container.scrollTop = Math.max(
          0,
          value.offsetTop - container.clientHeight / 2,
        );
    }
  }, [activeField, document.id]);
  function sourceText(text, field) {
    return field ? (
      <button
        type="button"
        data-field={field}
        className={`source-value ${activeField === field ? "highlighted" : ""}`}
        onClick={() => onSelect(field)}
        aria-label={`${fields.find((item) => item.key === field)?.label} 원문: ${text}`}
      >
        {text}
      </button>
    ) : (
      text
    );
  }
  return (
    <div
      className={`document-scroll ${reading ? "is-reading" : ""}`}
      ref={sourceRef}
    >
      <article className="paper">
        <div className="paper-meta">
          <span>{document.values.organization}</span>
          <span>{document.number}</span>
        </div>
        <div className="paper-rule" />
        <span className="paper-kicker">참여기업 모집 공고</span>
        <h3>{document.values.title}</h3>
        <p className="paper-intro">
          다음과 같이 참여 기업을 모집하오니
          <br />
          관심 있는 기업의 많은 신청 바랍니다.
        </p>
        <div className="paper-sections">
          {document.sections.map((section, index) => (
            <section key={section.heading}>
              <h4>
                {String(index + 1).padStart(2, "0")}. {section.heading}
              </h4>
              <p>
                {section.parts
                  ? section.parts.map((part, i) => (
                      <span key={i}>{sourceText(part.text, part.field)}</span>
                    ))
                  : sourceText(section.text, section.field)}
              </p>
            </section>
          ))}
        </div>
        <div className="paper-footer">가상 공고문 · 시연용 텍스트 재구성</div>
      </article>
    </div>
  );
}
