import './partners.css';
const customers = [
 { name:'SK AX', project:'파라다이스 워커힐', period:'2025.12 ~ 현재', crop:[190,348,210,108] },
 { name:'파라다이스', project:'파라다이스 부산', period:'2026.10', crop:[681,348,210,109] },
 { name:'중소벤처기업진흥공단', project:'정책자금 문서 AI', period:'2026.08', crop:[1084,375,380,48] },
 { name:'엘리스', project:'AI 캠퍼스 교육', period:'2026.07 ~ 현재', crop:[1600,348,336,104] },
];
const partners = [
 ['광운대학교',[80,668,275,88]],['서울시립대학교',[395,683,300,58]],['강북청년창업마루',[720,684,300,58]],['창업진흥원',[1055,677,295,69]],['서울창조경제혁신센터',[1378,684,294,57]],['대전창조경제혁신센터',[1705,684,295,57]],
];
function Logo({name,crop}) {
 const [x,y,w,h]=crop;
 return <span className="partner-logo" role="img" aria-label={name} style={{aspectRatio:`${w}/${h}`}}><img src={`${import.meta.env.BASE_URL}images/customer-partner-reference.png`} alt="" loading="lazy" style={{width:`${2048/w*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`}} /></span>;
}
export default function Partners() {
 return <section className="section partners-section" aria-labelledby="partners-title"><div className="wrap"><div className="section-head"><h2 id="partners-title">함께 연결하고,<br />함께 만들어갑니다.</h2><p>데이터스케쳐스와 함께하는 고객사와 협력기관입니다.</p></div><h3>고객사</h3><div className="customer-grid">{customers.map(item=><article key={item.name}><div className="customer-logo-area"><Logo name={item.name} crop={item.crop} /></div><h4>{item.project}</h4><p>{item.period}</p></article>)}</div><h3 className="partner-subtitle">협력기관 및 창업지원 기관</h3><div className="partner-grid">{partners.map(([name,crop])=><div className="partner-cell" key={name}><Logo name={name} crop={crop} /></div>)}</div></div></section>;
}
