// Shared building blocks for the listening pages (WorkingEnglish skin) + the local progress store.
import { useEffect, useState } from 'react';

export { WeBackLink as PxBackLink, CamBadge as CamOrange } from '../weKit';

export const PX_ROOT = 'px-root';
/** Cream dotted page background shared by every listening screen. */
export const PAGE_BG = {
  backgroundColor: '#FFF8E7',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='1.5' fill='%231e1b4b' fill-opacity='.09'/%3E%3C/svg%3E")`,
  backgroundSize: '22px 22px',
};

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
