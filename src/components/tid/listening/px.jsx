// Pixel-theme building blocks shared by the listening pages (ported from theieltsdictionary.com "px" kit).
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { asset } from '../shared';

export const PX_ROOT = 'px-root';
export const PX_HERO_ART = 'pointer-events-none absolute inset-0 max-sm:[zoom:0.72]';
export const pxAsset = name => asset(`assets/tid/listening/pixel/${name}`);
export const GRASS_BG = { backgroundImage: `url('${pxAsset('grass.svg')}')`, backgroundSize: '96px 96px' };

/** Rewrites site asset paths + font vars inside verbatim pixel-art markup. */
export function localizeArt(html) {
  return html
    .replace(/\/assets\/pixel\//g, pxAsset(''))
    .replace(/var\(--font-be-vietnam\)/g, '"Be Vietnam Pro"')
    .replace(/var\(--font-bungee\)/g, '"Bungee"');
}

export function PxImg({ src, alt = '', className, style }) {
  return <img src={pxAsset(src)} alt={alt} className={className} style={style} draggable={false} />;
}

export function CamOrange({ className = 'h-[1.1em] w-[1.1em]' }) {
  return <PxImg src="orange.svg" alt="Cambridge" className={`inline-block shrink-0 ${className}`} />;
}

/** Replaces every "Cambridge" in a label by the orange icon (site behaviour). */
export function withCamOrange(text, cls) {
  const parts = text.split('Cambridge');
  if (parts.length === 1) return text;
  return parts.flatMap((p, i) => (i === 0 ? [p] : [<CamOrange key={i} className={cls} />, p]));
}

/** Animated art layer; animations only run when visible (like the site). */
export const PixelArt = memo(function PixelArt({ html, className = 'pointer-events-none absolute inset-0' }) {
  const inner = useMemo(() => ({ __html: localizeArt(html) }), [html]);
  const ref = useRef(null);
  const [idle, setIdle] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setIdle(true), 300);
    return () => clearTimeout(t);
  }, []);
  return <div ref={ref} aria-hidden="true" className={`px-art ${className}`} data-px-live={idle && visible ? '' : undefined} dangerouslySetInnerHTML={inner} />;
});

export function PxBackLink({ onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 self-start rounded-full border-[3px] border-[#1F2A1A] bg-[#FDF5E0] px-4 text-[15px] font-bold text-[#1F2A1A] shadow-[0_4px_0_#1F2A1A] transition-[transform,box-shadow,background-color] hover:bg-[#F8BE33] active:translate-y-0.5 active:shadow-[0_2px_0_#1F2A1A] ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}

// ---- local progress store (same key scheme as the site: tid_progress_v1:<skill>:<id>) ----
const PROGRESS_KEY = 'tid_progress_v1';
export const PROGRESS_EVENT = 'tid-practice-progress';

export function readProgress(skill, id) {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}:${skill}:${id}`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p.done !== 'number' || typeof p.total !== 'number') return null;
    return { done: p.done, total: p.total, completed: !!p.completed, score: typeof p.score === 'number' ? p.score : undefined };
  } catch {
    return null;
  }
}

export function saveProgress(skill, id, rec) {
  try {
    localStorage.setItem(`${PROGRESS_KEY}:${skill}:${id}`, JSON.stringify({
      done: Math.max(0, Math.round(rec.done)),
      total: Math.max(0, Math.round(rec.total)),
      completed: !!rec.completed,
      ...(typeof rec.score === 'number' ? { score: rec.score } : {}),
      at: Date.now(),
    }));
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch { /* storage unavailable */ }
}

export function clearProgress(skill, id) {
  try {
    localStorage.removeItem(`${PROGRESS_KEY}:${skill}:${id}`);
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch { /* ignore */ }
}

export function useProgressMap(skill) {
  const [map, setMap] = useState({});
  useEffect(() => {
    const load = () => {
      const out = {};
      try {
        const prefix = `${PROGRESS_KEY}:${skill}:`;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            const id = k.slice(prefix.length);
            const p = readProgress(skill, id);
            if (p) out[id] = p;
          }
        }
      } catch { /* ignore */ }
      setMap(out);
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener(PROGRESS_EVENT, load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener(PROGRESS_EVENT, load);
    };
  }, [skill]);
  return map;
}

export function pxProgress(p) {
  if (!p || (!p.completed && p.done <= 0)) return null;
  if (p.completed) return { done: true, text: typeof p.score === 'number' && p.total > 0 ? `Đã xong ${p.score}/${p.total}` : 'Đã xong' };
  return { done: false, text: p.total > 0 ? `Đang làm ${p.done}/${p.total}` : 'Đang làm dở' };
}
