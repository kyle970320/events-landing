export const REFERENCE_DATE = '2026-11-05';
export const fields = [
  { key: 'title', label: '공고명', description: '지원사업의 공식 명칭', required: true },
  { key: 'organization', label: '주관 기관', description: '사업을 운영하는 기관', required: true },
  { key: 'target', label: '지원 대상', description: '신청할 수 있는 기업 유형', required: true },
  { key: 'start', label: '접수 시작일', description: 'YYYY-MM-DD 형식', required: true, type: 'date' },
  { key: 'end', label: '접수 마감일', description: 'YYYY-MM-DD 형식 · 원문에 없으면 비워두세요', type: 'date' },
];
export const documents = [
  { id: 'digital', file: '디지털전환_지원사업_공고.pdf', pages: 2, size: '248 KB', number: '제2026-104호', category: '디지털 전환',
    values: { title: '2026 디지털 전환 지원사업', organization: '한국기업혁신지원원', target: '중소기업', start: '2026-11-01', end: '2026-11-15' },
    sections: [
      { heading: '사업 개요', text: '기업의 디지털 역량을 높이고 지속 가능한 성장을 지원하기 위해 다음과 같이 참여 기업을 모집합니다.' },
      { heading: '사업명', text: '2026 디지털 전환 지원사업', field: 'title' },
      { heading: '주관 기관', text: '한국기업혁신지원원', field: 'organization' },
      { heading: '지원 대상', text: '국내에 사업장을 보유한 중소기업을 대상으로 합니다.', field: 'target' },
      { heading: '접수 기간', parts: [{ text: '2026.11.01', field: 'start' }, { text: '부터 ' }, { text: '2026.11.15', field: 'end' }, { text: '까지 온라인으로 신청해 주시기 바랍니다.' }] },
      { heading: '지원 내용', text: '업무 프로세스 진단, 데이터 활용 컨설팅 및 디지털 도구 도입을 지원합니다.' },
      { heading: '제출 서류', text: '사업자등록증, 사업계획서, 중소기업 확인서 각 1부.' },
    ] },
  { id: 'voucher', file: '데이터활용_바우처_모집안내.pdf', pages: 3, size: '312 KB', number: '제2026-118호', category: '데이터 활용',
    values: { title: '데이터 활용 바우처 지원사업', organization: '지역데이터진흥원', target: '중소기업', start: '2026-11-02', end: '2026-11-20' },
    sections: [
      { heading: '모집 안내', text: '데이터 구매·가공 및 업무 활용을 희망하는 기업의 참여를 기다립니다.' },
      { heading: '사업명', text: '데이터 활용 바우처 지원사업', field: 'title' },
      { heading: '주관 기관', text: '지역데이터진흥원', field: 'organization' },
      { heading: '참여 대상', text: '데이터 기반 서비스 개선을 추진하는 중소기업', field: 'target' },
      { heading: '신청 일정', parts: [{ text: '2026년 11월 2일', field: 'start' }, { text: ' ~ ' }, { text: '2026년 11월 20일', field: 'end' }] },
      { heading: '지원 내용', text: '데이터 수집, 정제, 구조화 및 활용 계획 수립에 필요한 서비스를 바우처 형태로 지원합니다.' },
      { heading: '접수 방법', text: '온라인 접수 후 제출 서류를 확인하며, 평가 결과는 개별 안내합니다.' },
    ] },
  { id: 'startup', file: '창업기업_성장지원_모집.pdf', pages: 2, size: '186 KB', number: '제2026-126호', category: '창업 지원',
    values: { title: '창업기업 성장 지원 프로그램', organization: '서울창업성장센터', target: '창업기업', start: '2026-11-03', end: '' },
    sections: [
      { heading: '프로그램 소개', text: '초기 창업기업의 제품과 서비스 고도화를 위한 성장 지원 프로그램을 운영합니다.' },
      { heading: '사업명', text: '창업기업 성장 지원 프로그램', field: 'title' },
      { heading: '운영 기관', text: '서울창업성장센터', field: 'organization' },
      { heading: '지원 자격', text: '창업 3년 이내 창업기업을 대상으로 합니다.', field: 'target' },
      { heading: '접수 기간', parts: [{ text: '2026. 11. 3.', field: 'start' }, { text: '부터 접수하며, 마감 일정은 별도 안내합니다.' }] },
      { heading: '지원 내용', text: '전문가 멘토링, 사업화 컨설팅, 투자 유치 역량 강화 프로그램을 제공합니다.' },
      { heading: '유의 사항', text: '추가 일정은 운영 기관의 후속 공지를 확인해 주세요.' },
    ] },
];
export function initialState() { return { processed: false, records: documents.map(doc => ({ id: doc.id, ...doc.values, reviewed: false })) }; }
export function validateRecord(record) {
  const errors = {};
  fields.forEach(field => { if (field.required && !String(record[field.key] || '').trim()) errors[field.key] = `${field.label}을(를) 입력해 주세요.`; });
  if (record.start && record.end && record.end < record.start) errors.end = '마감일은 시작일 이후여야 합니다.';
  return errors;
}
export function getStatus(record, date = REFERENCE_DATE) {
  if (!record.start || !record.end) return '일정 확인 필요';
  if (record.start > date) return '접수 예정';
  if (record.end < date) return '접수 마감';
  return '접수 중';
}
export function filterRecords(records, { query = '', target = '', status = '' } = {}) {
  const search = query.trim().toLowerCase();
  return records.filter(record => (!search || [record.title, record.organization, record.target].some(value => value.toLowerCase().includes(search))) && (!target || record.target === target) && (!status || getStatus(record) === status));
}
export function updateRecord(state, id, key, value) { return { ...state, records: state.records.map(record => record.id === id ? { ...record, [key]: value, reviewed: false } : record) }; }
// CSV quotes and spreadsheet-formula escaping apply to every user-editable value.
export function toCsv(records) {
  const escape = value => { let text = String(value ?? ''); if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
  return '\uFEFF' + [fields.map(field => field.label), ...records.map(record => fields.map(field => record[field.key]))].map(row => row.map(escape).join(',')).join('\r\n');
}
export function toJson(records) { return JSON.stringify(records.map(({ id, reviewed, ...values }) => values), null, 2); }
