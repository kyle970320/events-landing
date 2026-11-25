import { Link, Navigate, Route, Routes } from "react-router";
import CanvasWorkbench from "./CanvasWorkbench.jsx";
import "./canvas-workbench.css";
function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="데이터 작업실 홈">
        <span className="logo-crop">
          <img
            src={`${import.meta.env.BASE_URL}images/data-sketchers-logo.png`}
            alt="DATA SKETCHERS"
          />
        </span>
        <span className="brand-divider" />
        <span className="brand-product">데이터 작업실</span>
      </Link>
      <div className="header-actions">
        <Badge tone="blue">INTERACTIVE DEMO</Badge>
        <a className="text-link intro-link" href="/">
          서비스 소개
        </a>
        <a className="button small" href="/#contact">
          도입 문의
        </a>
      </div>
    </header>
  );
}
export default function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={<CanvasWorkbench />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
