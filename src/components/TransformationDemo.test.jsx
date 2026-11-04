import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DataCanvas from './DataCanvas.jsx';
import { DataCenterHeader } from './DataCenterHero.jsx';
let host, root;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
describe('common editable canvas', () => {
  it('shows all 14 nodes without scenario tabs, playback or live-data overlays', () => {
    act(() => root.render(<DataCanvas />));
    expect(host.querySelectorAll('[data-node]').length).toBe(14);
    expect(host.querySelector('.canvas-step-strip')).toBeNull();
    expect(host.querySelector('.has-live-data')).toBeNull();
    expect(host.querySelector('.is-simulating')).toBeNull();
    expect(host.textContent).not.toContain('자동 재생');
    expect(host.querySelector('.canvas-filterbar')).toBeNull();
    expect(host.querySelector('.canvas-tabs')).toBeNull();
    expect(host.querySelector('.canvas-delete')).toBeNull();
    expect(host.textContent).toContain('이름·날짜·금액 분리');
  });
  it('permits deletion and undo immediately without pausing a demo', () => {
    act(() => root.render(<DataCanvas />));
    act(() => host.querySelector('[data-node="documents"]').click());
    expect(host.querySelector('[data-node="ocr"]').classList.contains('is-muted')).toBe(false);
    expect(host.querySelector('[data-node="export"]').classList.contains('is-muted')).toBe(true);
    expect(host.querySelector('[data-node="conversations"]').classList.contains('is-muted')).toBe(true);
    act(() => host.querySelector('[data-node="structure"]').click());
    expect(host.querySelectorAll('.canvas-node.is-muted').length).toBe(8);
    expect(host.querySelector('.canvas-node.is-selected')).toBeNull();
    act(() => host.querySelector('#example').dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })));
    expect(host.querySelectorAll('[data-node]').length).toBe(13);
    act(() => host.querySelector('[aria-label="실행 취소"]').click());
    expect(host.querySelectorAll('[data-node]').length).toBe(14);
  });
});
it('header background follows scroll position and clears again at the top', () => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  act(() => root.render(<DataCenterHeader />));
  expect(host.querySelector('.is-scrolled')).toBeNull();
  act(() => { Object.defineProperty(window, 'scrollY', { value: 200, configurable: true }); window.dispatchEvent(new Event('scroll')); });
  expect(host.querySelector('.is-scrolled')).not.toBeNull();
  act(() => { Object.defineProperty(window, 'scrollY', { value: 0, configurable: true }); window.dispatchEvent(new Event('scroll')); });
  expect(host.querySelector('.is-scrolled')).toBeNull();
});
