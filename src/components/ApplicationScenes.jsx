import { useState } from 'react';
import { Check, ArrowRight, Download, FileText, Clock3 } from 'lucide-react';

export function VocScene() {
  return <div className="voc-example">
    <article className="voc-conversation"><div className="scene-toolbar">상담 원문 <span>VOC-001</span></div><div className="voc-chat"><span className="scene-small-label">고객 · 14:32</span><p>주문은 한 번만 했는데 카드 결제 문자가 두 번 왔어요.</p><p>중복으로 결제된 건지 확인 부탁드립니다.</p><span className="voc-detected">분류 근거 <strong>두 번 결제</strong></span></div></article>
    <article className="voc-ticket"><div className="scene-toolbar">분류된 문의 <span>확인 대기</span></div><div className="voc-ticket-body"><span className="voc-category">결제 문의 / 중복 결제</span><h4>카드 승인 내역 확인 요청</h4><dl><div><dt>담당</dt><dd>결제 담당자</dd></div><div><dt>확인 대상</dt><dd>주문번호 · 카드 승인 내역</dd></div></dl><div className="voc-checklist"><strong>담당자 확인 항목</strong><span><i />동일 주문의 승인 건수 확인</span><span><i />취소·환불 처리 여부 확인</span><span><i />확인 결과 고객에게 안내</span></div><p className="scene-muted">문의 분류와 확인 항목을 정리하며, 환불 여부는 담당자가 판단합니다.</p></div></article>
  </div>;
}

export function KioskScene() {
  const steps = [['홈','10:00:00','시작'],['카테고리','10:00:08','+8초'],['상세','10:00:23','+15초'],['완료','10:00:41','+18초']];
  return <div className="kiosk-example"><div className="kiosk-summary"><div><span>분석 세션</span><strong>session_024</strong></div><div><span><Clock3 size={12} /> 첫·마지막 기록 간격</span><strong>41<small>초</small></strong></div><div><span>화면 기록</span><strong>4<small>개</small></strong></div><div><span>최종 상태</span><strong className="kiosk-complete"><Check size={18} /> 완료</strong></div></div><div className="kiosk-journey"><div className="scene-toolbar">기록된 화면 이동 경로 <span>단말기 K-03</span></div><ol>{steps.map(([label,time,elapsed],index) => <li key={label}><div className="kiosk-step"><span>{String(index+1).padStart(2,'0')}</span><strong>{label}</strong><small>{time}</small></div><span className="kiosk-elapsed">{elapsed}</span>{index < 3 && <ArrowRight className="kiosk-path-arrow" size={20} />}</li>)}</ol><p className="scene-muted">표시된 시간은 기록 사이의 간격입니다. 실제 화면 체류 시간이나 이탈 여부를 의미하지 않습니다.</p></div><div className="kiosk-log"><code>session_024</code><span>HOME → CATEGORY → DETAIL → COMPLETE</span><span><Check size={13} /> 시간순 정렬 완료</span></div></div>;
}

const record = { document: '교육 운영 결과보고서', program: '데이터 활용 교육', participants: 24, date: '2026-10-20' };
export function HwpScene() {
  const [format, setFormat] = useState('table');
  function download(type) {
    const json = type === 'json';
    const content = json ? JSON.stringify(record,null,2) : '\ufeff문서명,교육명,참여 인원,운영일\r\n교육 운영 결과보고서,데이터 활용 교육,24,2026-10-20\r\n';
    const url=URL.createObjectURL(new Blob([content],{type:json?'application/json':'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`hwp-structured-example.${type}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="hwp-example"><article className="hwp-document"><div className="scene-toolbar"><FileText size={14} /> 교육 운영 결과보고서.hwp</div><div className="hwp-paper"><span>교육 운영 결과보고서</span><h4>1. 교육 운영 개요</h4><p>교육명: <mark>데이터 활용 교육</mark></p><p>운영일: <mark>2026년 10월 20일</mark></p><h4>2. 참여 현황</h4><p>이번 교육에는 <mark>총 24명</mark>이 참여하였습니다.</p><div className="hwp-signature">운영 담당자 확인</div></div></article><article className="hwp-output"><div className="hwp-output-top"><div className="hwp-view-switch" aria-label="변환 결과 보기"><button aria-pressed={format==='table'} onClick={()=>setFormat('table')}>테이블</button><button aria-pressed={format==='json'} onClick={()=>setFormat('json')}>JSON</button></div><span><Check size={13} /> 날짜·숫자 형식 통일</span></div>{format==='table'?<div className="hwp-table-scroll"><table aria-label="HWP 구조화 결과"><thead><tr><th>항목</th><th>값</th><th>데이터 형식</th></tr></thead><tbody>{[['교육명',record.program,'텍스트'],['참여 인원','24','정수'],['운영일',record.date,'날짜']].map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i}>{value}</td>)}</tr>)}</tbody></table></div>:<pre className="hwp-json"><code>{JSON.stringify(record,null,2)}</code></pre>}<div className="hwp-export"><p>문장과 표에 있는 교육명·인원·날짜를 개별 항목으로 정리합니다.</p><div><button onClick={()=>download('csv')}><Download size={13} /> 예시 CSV</button><button onClick={()=>download('json')}><Download size={13} /> 예시 JSON</button></div></div></article></div>;
}
