import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Horizontal scrolling chip row with a label (site: ChipRail)
export function ChipRail({ label, children }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setEdges(e => (e.left === left && e.right === right ? e : { left, right }));
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(update) : null;
    mo?.observe(el, { childList: true, subtree: true, characterData: true });
    return () => { ro?.disconnect(); mo?.disconnect(); };
  }, [update]);
  const scroll = d => {
    const el = ref.current;
    if (el) el.scrollBy({ left: d * Math.max(200, 0.7 * el.clientWidth), behavior: 'smooth' });
  };
  const mask = edges.left && edges.right
    ? 'linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%)'
    : edges.right ? 'linear-gradient(to right, #000 calc(100% - 48px), transparent 100%)'
      : edges.left ? 'linear-gradient(to right, transparent 0, #000 40px)' : undefined;
  const btn = 'absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#000] hover:bg-[#FFFADD] sm:flex';
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-[13px] font-black uppercase tracking-wide text-slate-500 sm:w-[112px]">{label}</span>
      <div className="relative min-w-0 flex-1">
        <div ref={ref} onScroll={update} role="group" aria-label={label.replace(/:$/, '')}
          className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1.5 pl-0.5 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}>
          {children}
        </div>
        {edges.left && <button type="button" onClick={() => scroll(-1)} aria-label="Cuộn sang trái" className={`${btn} left-0`}><ChevronLeft className="h-4 w-4" /></button>}
        {edges.right && <button type="button" onClick={() => scroll(1)} aria-label="Cuộn sang phải" className={`${btn} right-0`}><ChevronRight className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}

export function FilterChip({ pressed, onClick, color, icon, label, count }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} style={{ '--chip': color }}
      className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-black bg-white px-3.5 py-[5px] text-[13.5px] font-bold leading-5 text-[var(--chip)] transition-[transform,box-shadow,background-color] hover:not-aria-pressed:bg-[#FFFADD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chip)] focus-visible:ring-offset-2 aria-pressed:bg-[var(--chip)] aria-pressed:text-white aria-pressed:shadow-[2px_2px_0_#000]">
      {icon && <span aria-hidden="true" className="text-[12px] leading-none">{icon}</span>}
      {label}
      <span className="rounded-full bg-slate-100 px-1.5 text-[12px] font-bold text-slate-600 group-aria-pressed:bg-white/25 group-aria-pressed:text-white">{count}</span>
    </button>
  );
}

// Pixel-style back pill (site: PxBackLink)
export function PxBackButton({ onClick, label, className = '' }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 self-start rounded-full border-[3px] border-[#1E1B4B] bg-[#FFF8E7] px-4 text-[15px] font-bold text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] transition-[transform,box-shadow,background-color] hover:bg-[#F8BE33] active:translate-y-0.5 active:shadow-[0_2px_0_#1E1B4B] ${className}`}>
      <span aria-hidden="true">←</span>{label}
    </button>
  );
}

// Small modal shell
export function Modal({ onClose, children, className = 'max-w-md' }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`wr-pop relative w-full overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ProgressChip({ record, className = '' }) {
  if (!record) return null;
  return record.completed
    ? <span className={`inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 ${className}`}>✓ Đã xong</span>
    : <span className={`inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700 ${className}`}>Đang làm {record.done}/{record.total}</span>;
}
