import { useRef } from "react";
import DataCanvas from "./components/DataCanvas.jsx";
import DataApplications from "./components/DataApplications.jsx";
import Partners from "./components/Partners.jsx";
import DataCenterHero, { DataCenterHeader } from "./components/DataCenterHero.jsx";

function Hero() {
  return (
    <section className="hero" id="original-landing">
      <div className="wrap">
        <div className="section-head canvas-section-heading"><h2>원본에서 활용까지,<br />데이터의 흐름을 설계하세요.</h2><p>문서·상담·조작 기록을 연결하고,<br />항목 추출부터 정제·조회·연동까지<br />하나의 캔버스에서 구성합니다.</p></div>
        <DataCanvas />
        <p className="demo-note">
          설명을 위한 가상 데이터 및 변환 예시입니다. 지원 형식과 처리 방식은
          도입 범위에 따라 설계합니다.
        </p>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2>
              형식은 달라도,
              <br />
              활용하는 흐름은 하나로.
            </h2>
          </div>
          <p>
            추출할 항목과 활용 목적부터 정합니다.
            <br />
            데이터의 특성과 업무 목적에 맞춰
            <br />
            수집부터 활용까지의 흐름을 설계합니다.
          </p>
        </div>
        <div className="steps">
          <article className="step">
            <span className="num">01 / COLLECT</span>
            <h3>흩어진 원본 수집</h3>
            <p>
              문서, 자유 응답, 업무 기록 등<br />
              처리할 자료와 수집 범위를 정합니다.
            </p>
          </article>
          <article className="step">
            <span className="num">02 / EXTRACT</span>
            <h3>이름·날짜·금액 추출</h3>
            <p>
              이름, 날짜, 금액 등 항목을 정하고
              <br />
              문장과 표에서 값을 추출합니다.
            </p>
          </article>
          <article className="step">
            <span className="num">03 / STRUCTURE</span>
            <h3>일관된 형태로 정리</h3>
            <p>
              표기와 분류 기준을 맞추고
              <br />
              검색·집계할 수 있는 표로 정리합니다.
            </p>
          </article>
          <article className="step">
            <span className="num">04 / CONNECT</span>
            <h3>실제 업무로 연결</h3>
            <p>
              정리된 정보를 검색·분석하거나
              <br />
              보고서와 사내 시스템에 활용합니다.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="section" id="usecases">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2>
              데이터가 있는 곳에,
              <br />
              새로운 쓰임을.
            </h2>
          </div>
          <p>
            다음은 적용할 수 있는 업무 시나리오입니다.
            <br />
            보유 데이터와 활용 목적에 따라
            <br />
            구체적인 도입 범위를 함께 정합니다.
          </p>
        </div>
        <div className="usecases">
          <article className="case">
            <h3>기업 문서·업무 자료</h3>
            <p>
              문서의 이름·날짜·금액을 정리해
              <br />
              자료 검색·비교와 정기 보고에 활용합니다.
            </p>
          </article>
          <article className="case">
            <h3>고객 문의·상담 기록</h3>
            <p>
              서술형 기록을 문의 내용과 요청 유형별로
              <br />
              분류해 담당자의 고객 대응을 돕습니다.
            </p>
          </article>
          <article className="case">
            <h3>행사·설문 데이터</h3>
            <p>
              참가자의 자유 응답과 현장 기록을
              <br />
              정리해 분석과 후속 연락에 활용합니다.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="company-footer">
      <div className="wrap company-footer-main">
        <div className="company-footer-brand"><strong>DATA SKETCHERS</strong><p>주식회사 데이터스케쳐스 · D-SKET</p><span>사업자등록번호 349-81-03411</span></div>
        <address>
          <div><strong>서울 본사</strong><span>서울시 강북구 노해로23길 123<br />강북창업센터 504호</span></div>
          <div><strong>기술연구소</strong><span>서울시 동대문구 서울시립대로 117<br />서울시립대 SI STATION #2 404호</span></div>
        </address>
        <div className="company-footer-links"><a href="mailto:company@data-sketchers.com">company@data-sketchers.com</a><a href="https://data-sketchers.com/" target="_blank" rel="noopener noreferrer">회사 홈페이지 ↗</a><a href="https://d-sket.io/" target="_blank" rel="noopener noreferrer">D-SKET ↗</a></div>
      </div>
      <div className="wrap company-footer-bottom">© {new Date().getFullYear()} DATA SKETCHERS. All rights reserved.</div>
    </footer>
  );
}

function ContactSection({ onContact }) {
  return (
    <section className="cta" id="contact">
      <div className="wrap">
        <div>
          <h2>어떤 데이터를 활용하고 싶으신가요?</h2>
          <p>보유한 자료와 업무에서 겪는 어려움을 알려주세요.</p>
        </div>
        <button className="btn" onClick={onContact}>
          데이터 활용 상담하기{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </section>
  );
}

function ContactDialog({ dialogRef, onClose }) {
  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;
    const { left, right, top, bottom } =
      event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < left ||
      event.clientX > right ||
      event.clientY < top ||
      event.clientY > bottom
    )
      onClose();
  }
  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="dialog-title"
    >
      <button className="close" aria-label="닫기" onClick={onClose}>
        ×
      </button>
      <h2 id="dialog-title">데이터 활용 상담</h2>
      <p>
        보유한 자료의 형식과 활용 목적을 알려주시면, 적용할 수 있는 기능과 범위를 함께 검토합니다.
      </p>
      <p>
        아래 이메일로 자료의 종류와 문의 내용을 보내주세요.
        <br />
        <a href="mailto:company@data-sketchers.com">company@data-sketchers.com</a>
      </p>
      <button className="btn" onClick={onClose}>
        확인
      </button>
    </dialog>
  );
}

export default function App() {
  const dialogRef = useRef(null);
  return (
    <>
      <DataCenterHeader />
      <DataCenterHero />
      <main>
        <Hero />
        <DataApplications />
        <Process />
        <UseCases />
        <Partners />
        <ContactSection onContact={() => dialogRef.current?.showModal()} />
      </main>
      <Footer />
      <ContactDialog
        dialogRef={dialogRef}
        onClose={() => dialogRef.current?.close()}
      />
    </>
  );
}
