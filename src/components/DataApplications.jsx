import { useState } from 'react';
import { FileSearch, MessageSquare, Monitor, ArrowRight, Check, FileText } from 'lucide-react';
import './data-applications.css';
import { VocScene, KioskScene, HwpScene } from './ApplicationScenes.jsx';

const examples = [
  {
    label: '공고문 검색', icon: FileSearch,
    source: 'PDF 공고문', text: '“중소기업을 대상으로 디지털 전환 지원사업 참여 기업을 모집합니다. 접수 기간은 2026.11.01부터 11.15까지입니다.”',
    fields: [['지원 대상', '중소기업'], ['접수 시작일', '2026-11-01'], ['접수 마감일', '2026-11-15']],
    title: '조건에 맞는 공고만 찾기', description: '문서를 하나씩 열지 않고 지원 대상과 접수 기간으로 공고를 검색합니다.',
    view: '지원사업 검색', filters: ['지원 대상: 중소기업', '접수 중 · 2026.11.05 기준'],
    result: '2026 디지털 전환 지원사업', detail: '접수 마감 2026.11.15', action: '지원 대상·기간 일치',
  },
  {
    label: 'VOC 분류·대응', icon: MessageSquare,
    source: '고객 상담 기록', text: '“주문은 한 번만 했는데 카드 결제 문자가 두 번 왔어요. 중복으로 결제된 건지 확인 부탁드립니다.”',
    fields: [['문의 유형', '중복 결제'], ['이용 수단', '카드'], ['요청 내용', '결제 내역 확인']],
    title: '문의 유형을 분류하고 확인 항목 정리하기', description: '표현이 다른 상담 내용을 같은 유형으로 모아, 담당자가 확인할 내용을 정리합니다.',
    view: '고객 문의 관리', filters: ['유형: 중복 결제', '상태: 확인 대기'],
    result: 'VOC-001 · 중복 결제 문의', detail: '확인할 항목: 주문번호 · 카드 승인 내역', action: '결제 담당자 검토',
  },
  {
    label: '키오스크 이용 분석', icon: Monitor,
    source: '키오스크 조작 기록', text: '10:00:00 HOME · session_024\n10:00:08 CATEGORY · session_024\n10:00:23 DETAIL · session_024\n10:00:41 COMPLETE · session_024',
    fields: [['세션 ID', 'session_024'], ['첫·마지막 기록 간격', '41초'], ['완료 여부', '완료']],
    title: '화면별 이용 흐름 확인하기', description: '세션별 화면 이동과 완료 기록을 정리해, 실제 이용 경로와 완료 여부를 비교합니다.',
    view: '세션 분석', filters: ['단말기: K-03', '완료 로그 있음'],
    result: '홈 → 카테고리 → 상세 → 완료', detail: '첫 기록부터 마지막 기록까지 41초', action: '완료 경로 확인',
  },
  {
    label: 'HWP 구조화·변환', icon: FileText,
    title: '한글 문서를 테이블과 JSON으로',
    description: '보고서 속 항목을 분리하고 날짜·숫자 형식을 맞춰, 다른 시스템에서도 활용할 수 있게 정리합니다.',
  },
];

export default function DataApplications() {
  const [selected, setSelected] = useState(0);
  return <section className="section applications" id="applications" aria-labelledby="applications-title">
    <div className="wrap">
      <div className="section-head"><h2 id="applications-title">정리된 데이터가,<br />실제 업무에 쓰이도록.</h2><p>구조화된 데이터를 업무 목적에 맞게 활용합니다.<br />공고 검색부터 고객 대응, 이용 분석, 문서 변환까지 살펴보세요.</p></div>
      <div className="application-tabs" role="tablist" aria-label="데이터 활용 예시">{examples.map((item, index) => { const Icon = item.icon; return <button key={item.label} id={`application-tab-${index}`} type="button" role="tab" aria-selected={selected === index} aria-controls={`application-panel-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % examples.length : event.key === 'ArrowLeft' ? (index + examples.length - 1) % examples.length : event.key === 'Home' ? 0 : event.key === 'End' ? examples.length - 1 : null;
        if (next === null) return; event.preventDefault(); setSelected(next); document.getElementById(`application-tab-${next}`)?.focus();
      }}><Icon size={17} />{item.label}</button>; })}</div>
      <div className="application-panels">
      {examples.map((example, index) => <div key={example.label} className={`application-panel ${selected === index ? 'is-active' : ''}`} id={`application-panel-${index}`} role="tabpanel" aria-labelledby={`application-tab-${index}`} aria-hidden={selected !== index} inert={selected !== index}>
        <div className="application-context"><h3>{example.title}</h3><p>{example.description}</p></div>
        {index === 0 ? <><div className="application-flow">
          <article className="application-source"><div className="application-label">원본 <span>{example.source}</span></div><p>{example.text}</p></article>
          <ArrowRight className="application-arrow" size={20} aria-hidden="true" />
          <article className="application-fields"><div className="application-label">구조화된 항목</div><table aria-label={`${example.label} 추출 결과`}><tbody>{example.fields.map(([field, value]) => <tr key={field}><th scope="row">{field}</th><td>{value}</td></tr>)}</tbody></table></article>
          <ArrowRight className="application-arrow" size={20} aria-hidden="true" />
          <article className="application-work"><div className="application-work-bar"><span className="application-window-dot" />{example.view}</div><div className="application-work-body"><div className="application-filters">{example.filters.map(filter => <span key={filter}>{filter}</span>)}</div><h4>{example.result}</h4><p>{example.detail}</p><div className="application-outcome"><Check size={14} />{example.action}</div></div></article>
        </div>
        <div className="notice-results">
          <div className="notice-results-heading"><strong>조건에 맞는 공고를 한눈에</strong><span>중소기업 · 조회 기준일 2026.11.05 · 가상 결과 2건</span></div>
          <div className="notice-results-scroll"><table aria-label="구조화된 공고 검색 결과"><thead><tr><th>공고명</th><th>지원 대상</th><th>접수 기간</th><th>상태</th></tr></thead><tbody>
            <tr><td>2026 디지털 전환 지원사업</td><td>중소기업</td><td>2026.11.01 — 11.15</td><td><span>접수 중</span></td></tr>
            <tr><td>데이터 활용 바우처 지원사업</td><td>중소기업</td><td>2026.11.02 — 11.20</td><td><span>접수 중</span></td></tr>
          </tbody></table></div>
        </div></> : index === 1 ? <VocScene /> : index === 2 ? <KioskScene /> : <HwpScene />}
      </div>)}
      </div>
      <p className="application-note">가상 데이터를 사용한 활용 예시입니다. 검색·업무 시스템의 연결 범위는 도입 목적에 맞춰 설계합니다.</p>
    </div>
  </section>;
}
