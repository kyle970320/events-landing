import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Database, Pause, Play } from 'lucide-react';
import './data-center-hero.css';

export function DataCenterHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div className={`dc-header ${scrolled ? 'is-scrolled' : ''}`}>
    <svg width="0" height="0" aria-hidden="true" className="dc-logo-filters">
      <defs><filter id="dc-logo-remove-white" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 0 3" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter></defs>
    </svg>
    <div className="dc-nav">
      <a className="dc-brand" href="#" aria-label="DATA SKETCHERS 홈">
        <span className="dc-wordmark"><img src={`${import.meta.env.BASE_URL}images/data-sketchers-logo.png`} alt="DATA SKETCHERS" /></span>
        <span className="dc-mobile-mark"><img src={`${import.meta.env.BASE_URL}images/data-sketchers-mark.png`} alt="DATA SKETCHERS" /></span>
      </a>
      <nav aria-label="히어로 메뉴"><a href="#process">데이터 구조화</a><a href="#usecases">활용 사례</a><a href="#example">워크플로우</a></nav>
      <a className="dc-nav-contact" href="#contact">도입 문의 <ArrowUpRight size={13} /></a>
    </div>
  </div>;
}

export default function DataCenterHero() {
  const video = useRef(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!motion || !video.current) return;
    const player = video.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !paused) player.play().catch(() => {});
      else player.pause();
    });
    observer.observe(player);
    return () => observer.disconnect();
  }, [motion, paused]);
  function togglePlayback() {
    if (paused) video.current?.play().then(() => setPaused(false)).catch(() => {});
    else { video.current?.pause(); setPaused(true); }
  }
  return <section className="dc-hero" aria-labelledby="dc-title">
    <div className="dc-stage">
      <img src={`${import.meta.env.BASE_URL}images/data-center-hero.png`} width="1400" height="900" fetchPriority="high" decoding="async" alt="PDF·HWP 문서, VOC, 키오스크가 컨베이어로 데이터 센터에 들어가고, 반대편으로 데이터베이스가 나오는 3D 렌더 이미지" />
      {motion && <video ref={video} className={`dc-video ${ready ? 'is-ready' : ''}`} src={`${import.meta.env.BASE_URL}images/data-center-hero-hq.mp4`} autoPlay loop muted playsInline preload="auto" aria-hidden="true" onPlaying={() => setReady(true)} onError={() => setReady(false)} />}
    </div>
    <div className="dc-copy">
      <h1 id="dc-title">흩어진 데이터,<br />이제 쓸 수 있는<br /><span>데이터로.</span></h1>
      <p>PDF·HWP 문서, 고객의 목소리, 키오스크 기록.<br />서로 다른 원본에서 항목과 값을 추출해<br />검색과 분석에 활용할 수 있는 데이터로 정리합니다.</p>
      <a className="dc-primary" href="#example"><span className="dc-cta-icon"><Database size={17} /></span><span>데이터 구조화 과정 보기</span><span className="dc-cta-arrow"><ArrowUpRight size={18} /></span></a>
    </div>
    <div className="dc-bottom"><a href="#original-landing"><ArrowDown size={14} /> 더 알아보기</a><div><span>PDF · HWP · KIOSK · VOC <span aria-hidden="true">→</span> STRUCTURED DATA</span>{motion && ready && <button className="dc-playback" onClick={togglePlayback} aria-label={paused ? "애니메이션 재생" : "애니메이션 일시정지"}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>}</div></div>
  </section>;
}
