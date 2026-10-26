// Sentence-by-sentence dictation (listen & type) — port of theieltsdictionary.com /practice/listening/<lesson>.
// Media-agnostic: the caller passes a `media` controller (HTML audio for Cambridge lessons, YouTube for videos).
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Eye, Flame, Languages, Lightbulb, Moon, Music2, Pause, Play, RotateCcw, Sun } from 'lucide-react';
import { translateVi } from './data';
import { pxAsset, clearProgress, readProgress, saveProgress } from './px';
import WordPopup from './WordPopup';
import { ttsService } from '../../../services/ttsService';

const DRAFT_KEY = 'tid_dictation_draft_v1';
const THEME_KEY = 'tidDictTheme';
const EMPTY = {};
const WORD_RE = /([A-Za-z]+(?:[’'-][A-Za-z]+)*)/;

const fmt = s => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${r < 10 ? '0' : ''}${r}`;
};
const clean = s => s.replace(/[^\w\s]/g, '').toLowerCase().trim();
const segCount = s => s.split(/[-–—/]+/).filter(p => /[\p{L}\p{N}]/u.test(p)).length;
const sentenceText = c => c.content?.trim() || c.jsonContent.map(w => String(Array.isArray(w) ? w[0] ?? '' : w ?? '')).join(' ').trim();
const VN_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const stripVn = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/ư/g, 'w').replace(/Ư/g, 'W');

function levenshtein(a, b) {
  const d = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) d[i][0] = i;
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));
  return d[a.length][b.length];
}

function chime(ctxRef) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctxRef.current ||= new AC();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t = t0 + 0.09 * i;
      g.gain.setValueAtTime(1e-4, t); g.gain.linearRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.18);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
    });
  } catch { /* no audio */ }
}

// Sky backdrop (day / night) behind the card.
const CLOUDS = [{ n: 2, left: '3%', top: 18, w: 220 }, { n: 1, left: '30%', top: 4, w: 150 }, { n: 2, left: '57%', top: 60, w: 210 }, { n: 1, left: '76%', top: 8, w: 140 }, { n: 1, left: '-3%', top: 300, w: 170 }, { n: 2, left: '88%', top: 260, w: 190 }];
const STARS = Array.from({ length: 24 }, (_, t) => {
  const r = e => { const x = 233280 * Math.sin(9301 * t + 49297 * e); return x - Math.floor(x); };
  return { left: `${(96 * r(1) + 2).toFixed(1)}%`, top: `${(58 * r(2) + 2).toFixed(1)}%`, size: r(3) < 0.25 ? 3 : 2, warm: r(4) < 0.3, d: (2.3 + 2.2 * r(5)).toFixed(1), dl: (3 * r(6)).toFixed(1) };
});
function Sky({ night }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${night ? 'h-[440px] bg-[linear-gradient(180deg,#0B1230_0%,#16245A_55%,#24387A_82%,#1b1c1a_100%)] sm:h-[720px]' : 'h-[440px] bg-[linear-gradient(180deg,#5BADE8_0%,#86C3EE_55%,#BFE0F5_85%,#ffffff_100%)] sm:h-[720px]'}`}>
      {CLOUDS.map((c, i) => (
        <span key={i} className="absolute" style={{ left: c.left, top: c.top, width: c.w, height: c.w * 0.32, opacity: night ? 0.14 : 0.95, animation: `dctCloud ${14 + i * 2}s ease-in-out ${i * 0.7}s infinite alternate` }}>
          <span className="absolute inset-x-0 bottom-0 h-[45%] rounded-full bg-white" />
          <span className="absolute bottom-[20%] left-[18%] h-[70%] w-[34%] rounded-full bg-white" />
          {c.n === 2 && <span className="absolute bottom-[20%] left-[44%] h-full w-[42%] rounded-full bg-white" />}
        </span>
      ))}
      {night ? (
        <>
          {STARS.map((s, i) => <span key={i} className="dct-star absolute rounded-full" style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.warm ? '#FFE9A8' : '#FFFFFF', boxShadow: `0 0 ${3 * s.size}px ${s.warm ? '#FFE9A8' : '#FFFFFF'}`, animationDuration: `${s.d}s`, animationDelay: `${s.dl}s` }} />)}
          <span className="absolute right-[7%] top-3 h-11 w-11 overflow-hidden rounded-full bg-[#F3E7BE] shadow-[0_0_0_8px_rgba(243,231,190,.12),0_0_26px_6px_rgba(200,215,255,.22)] sm:right-[8%] sm:top-6 sm:h-20 sm:w-20">
            <span className="absolute left-[22%] top-[28%] h-[22%] w-[22%] rounded-full bg-[#E2D3A2]" />
            <span className="absolute left-[56%] top-[56%] h-[16%] w-[16%] rounded-full bg-[#E2D3A2]" />
            <span className="absolute left-[60%] top-[22%] h-[10%] w-[10%] rounded-full bg-[#E2D3A2]" />
          </span>
        </>
      ) : (
        <span className="absolute right-[7%] top-3 h-11 w-11 rounded-full bg-[#FFD45C] shadow-[0_0_0_8px_rgba(255,212,92,.35),0_0_0_16px_rgba(255,212,92,.15)] sm:right-[8%] sm:top-6 sm:h-20 sm:w-20" />
      )}
    </div>
  );
}

function Scrubber({ media }) {
  const { time, duration, seek } = media;
  const go = t => seek(Math.min(duration, Math.max(0, t)));
  return (
    <>
      <span className="shrink-0 whitespace-nowrap text-[12.5px] tabular-nums text-[color:var(--dct-4b4f47)]">{fmt(time)} / {fmt(duration)}</span>
      <div role="slider" tabIndex={0} aria-label="Tua trong câu" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(time)}
        className="relative h-6 min-w-[40px] flex-1 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dct-2e6b3f)]"
        onClick={e => { const r = e.currentTarget.getBoundingClientRect(); go((e.clientX - r.left) / r.width * duration); }}
        onKeyDown={e => { const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (d) go(time + d); else if (e.key === 'Home') go(0); else if (e.key === 'End') go(duration); else return; e.preventDefault(); }}>
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[color:var(--dct-e9e9e4)]" />
        <span className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[color:var(--dct-2e6b3f)] transition-[width] duration-100 ease-linear" style={{ width: `${duration > 0 ? (time / duration) * 100 : 0}%` }} />
      </div>
    </>
  );
}

/**
 * props: data {title, kicker, challenges[]}, storageId, media (controller), onBack, backLabel, onSaveWord, speechVoice
 * media: { node, playSentence(i), toggle(), pause(), playing, rate, setRate(r), time, duration, seek(t), playFrom(i, continuous, onIndex) , stopAll(), allIndex }
 */
export default function DictationCore({ data, storageId, media, onBack, backLabel = 'Listening', onSaveWord, speechVoice }) {
  const challenges = data.challenges;
  const total = challenges.length;
  const [night, setNight] = useState(() => { try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch { return false; } });
  const [idx, setIdx] = useState(0);
  const [freeInput, setFreeInput] = useState({});
  const [boxes, setBoxes] = useState({});
  const [stats, setStats] = useState({});
  const [inputMode, setInputMode] = useState('boxes');
  const [showResult, setShowResult] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [hintIdx, setHintIdx] = useState(-1);
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState(false);
  const [view, setView] = useState('practice');
  const [finished, setFinished] = useState(false);
  const [reportClosed, setReportClosed] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [resumeAt, setResumeAt] = useState(null);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [skipWarn, setSkipWarn] = useState(false);
  const [shake, setShake] = useState(false);
  const [imeWarn, setImeWarn] = useState(false);
  const [translations, setTranslations] = useState({});
  const [trFailed, setTrFailed] = useState({});
  const [trLoading, setTrLoading] = useState(null);
  const [popup, setPopup] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const inputs = useRef({});
  const boxWrap = useRef(null);
  const audioCtx = useRef(null);
  const chimed = useRef(false);
  const progressList = useRef(null);
  const skipTimer = useRef(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const cur = challenges[idx];
  const free = freeInput[idx] ?? '';
  const setFree = v => setFreeInput(s => ({ ...s, [idx]: v }));
  const box = boxes[idx] ?? EMPTY;
  const setBox = fn => setBoxes(s => ({ ...s, [idx]: typeof fn === 'function' ? fn(s[idx] ?? EMPTY) : fn }));
  const draftKey = `${DRAFT_KEY}:${storageId}`;

  const toggleNight = () => { const n = !night; setNight(n); try { localStorage.setItem(THEME_KEY, n ? 'dark' : 'light'); } catch { /* ignore */ } };

  // Word slots for the current sentence
  const slots = useMemo(() => cur.solution.map((accepted, i) => {
    const primary = String((Array.isArray(cur.jsonContent[i]) ? cur.jsonContent[i][0] : cur.jsonContent[i]) ?? '');
    const answer = primary.replace(/[^\p{L}\p{N}]/gu, '');
    if (/\p{N}/u.test(primary)) {
      const tokens = [...(primary.match(/[.,;:!?]+$/)?.[0] ?? '')].map(ch => ({ type: 'static', char: ch }));
      return { primary, tokens, slotCount: 1, number: true, answer, accepted };
    }
    const tokens = [];
    let s = 0;
    for (const ch of primary) {
      if (/[\p{L}\p{N}]/u.test(ch)) tokens.push({ type: 'letter', slot: s++, correct: ch });
      else tokens.push({ type: 'static', char: ch });
    }
    return { primary, tokens, slotCount: s, number: false, answer, accepted };
  }), [cur]);

  const order = useMemo(() => {
    const o = [];
    slots.forEach((w, wi) => {
      if (w.number) o.push({ wi, key: `${wi}-n` });
      else for (let s = 0; s < w.slotCount; s++) o.push({ wi, key: `${wi}-${s}` });
    });
    return o;
  }, [slots]);

  const numberValue = (b, wi, len) => b[`${wi}-n`] ?? Array.from({ length: len }, (_, k) => b[`${wi}-${k}`] || '').join('');
  const boxWords = useMemo(() => slots.map((w, wi) => (w.number ? numberValue(box, wi, w.answer.length).replace(/\s+/g, '') : Array.from({ length: w.slotCount }, (_, k) => box[`${wi}-${k}`] || '').join(''))), [slots, box]);
  const accepts = (w, v) => w.accepted.map(clean).includes(clean(v));

  const focusKey = k => { const el = k && inputs.current[k]; if (el) { el.focus(); el.select(); } };
  const moveBy = (k, d) => focusKey(order[order.findIndex(o => o.key === k) + d]?.key);
  const nextWord = wi => focusKey(order.find(o => o.wi > wi)?.key);
  const backspace = k => {
    const prev = order[order.findIndex(o => o.key === k) - 1];
    if (!prev) return;
    setBox(b => ({ ...b, [prev.key]: prev.key.endsWith('-n') ? numberValue(b, prev.wi, slots[prev.wi].answer.length).slice(0, -1) : '' }));
    focusKey(prev.key);
  };

  // Compare the user's input with the solution (port of the site's checker)
  const result = useMemo(() => {
    const typed = inputMode === 'boxes' ? [] : free.trim().split(/\s+/).filter(w => clean(w) !== '');
    const userWords = [], words = [];
    let p = 0, anyWrong = false, firstErr = -1, typos = 0, complete = true;
    const prim = i => (Array.isArray(cur.jsonContent[i]) ? cur.jsonContent[i][0] : cur.jsonContent[i]);
    for (let i = 0; i < cur.solution.length; i++) {
      const acc = cur.solution[i].map(clean);
      const text = prim(i);
      if ((slots[i]?.slotCount ?? 0) === 0) { userWords.push(''); words.push({ text, status: 'correct' }); continue; }
      const alt = inputMode === 'free' ? cur.altGroups?.[i] : null;
      if (alt) {
        const direct = acc.includes(clean(typed[p] || ''));
        const form = alt.forms.find(f => {
          const n = f.trim().split(/\s+/).filter(Boolean).length;
          return n !== 0 && !(p + n > typed.length) && !(direct && n <= 1) && clean(typed.slice(p, p + n).join(' ')) === clean(f);
        });
        if (form) {
          p += form.trim().split(/\s+/).filter(Boolean).length;
          for (let k = 0; k < alt.span; k++) { userWords.push(k === 0 ? form : ''); words.push({ text: prim(i + k), status: 'correct' }); }
          i += alt.span - 1;
          continue;
        }
      }
      let take = 1;
      if (inputMode === 'free' && typed[p]) {
        const maxTake = Math.min(segCount(String(text ?? '')), typed.length - p);
        let best = Infinity;
        for (let n = 1; n <= maxTake && best > 0; n++) {
          const joined = clean(typed.slice(p, p + n).join(''));
          const d = Math.min(...acc.map(a => levenshtein(joined, a)));
          if (d < best) { best = d; take = n; }
        }
      }
      const got = inputMode === 'boxes' ? [boxWords[i] || ''] : typed.slice(p, p + take);
      if (inputMode === 'free') p += take;
      const joinedRaw = got.join(' ');
      userWords.push(joinedRaw);
      const c = clean(got.join(''));
      if (joinedRaw) {
        let ok = false, near = false;
        for (const a of acc) { if (c === a) { ok = true; break; } if (a.length >= 4 && levenshtein(c, a) <= 1) near = true; }
        const w = slots[i];
        const full = inputMode !== 'boxes' || (w.number ? c.length >= w.answer.length : joinedRaw.length === w.slotCount);
        if (ok) words.push({ text, status: 'correct' });
        else if (full) {
          anyWrong = true;
          if (firstErr === -1) firstErr = i;
          if (near) { words.push({ text, userText: joinedRaw, status: 'typo' }); typos++; } else words.push({ text: joinedRaw, status: 'incorrect' });
        } else { if (firstErr === -1) firstErr = i; complete = false; words.push({ text, status: 'pending', masked: !showFull }); }
      } else { if (firstErr === -1) firstErr = i; complete = false; words.push({ text, status: 'pending', masked: !showFull }); }
    }
    return { words, allCorrect: complete && !anyWrong, anyWrong, firstErr, userWords, typos };
  }, [free, cur, showFull, inputMode, boxWords, slots]);
  const { words: resultWords, allCorrect, anyWrong, typos } = result;

  // Load sentence audio when the sentence changes
  useEffect(() => {
    setHintIdx(-1);
    chimed.current = false;
    const t = setTimeout(() => {
      media.playSentence(idx);
      if (inputMode === 'boxes') boxWrap.current?.querySelector('input')?.focus();
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Ctrl = replay, Alt+H = hint
  const hintRef = useRef(() => {});
  const keysOn = useRef(true);
  useEffect(() => {
    let ctrlAlone = false;
    const down = e => {
      if (e.key === 'Control') { if (!e.repeat) ctrlAlone = true; return; }
      ctrlAlone = false;
      if (e.altKey && e.code === 'KeyH' && keysOn.current) { e.preventDefault(); hintRef.current(); }
    };
    const up = e => {
      if (e.key === 'Control' && ctrlAlone && keysOn.current) {
        media.playSentence(idxRef.current);
        setToast(true);
        setTimeout(() => setToast(false), 2000);
      }
      if (e.key === 'Control') ctrlAlone = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  // Correct sentence → chime, confetti-less combo counter
  useEffect(() => {
    if (!allCorrect || statsRef.current[idx]?.solved || chimed.current) return;
    chimed.current = true;
    chime(audioCtx);
    if (hintIdx === -1 && typos === 0) setCombo(c => c + 1); else setCombo(0);
  }, [allCorrect, hintIdx, typos, idx]);

  const requestTranslation = useCallback(async (text, i) => {
    if (!text || translations[i] || trLoading === i) return;
    setTrLoading(i);
    try {
      const vi = await translateVi(text);
      setTranslations(s => ({ ...s, [i]: vi }));
    } catch {
      setTrFailed(s => ({ ...s, [i]: true }));
    } finally {
      setTrLoading(l => (l === i ? null : l));
    }
  }, [translations, trLoading]);

  useEffect(() => {
    if (allCorrect && !cur.translation && !translations[idx] && !trFailed[idx]) requestTranslation(sentenceText(cur), idx);
  }, [allCorrect, cur, idx, translations, trFailed, requestTranslation]);

  const solvedCount = useMemo(() => Object.values(stats).filter(s => s.solved).length, [stats]);
  const totalTypos = useMemo(() => Object.values(stats).reduce((s, x) => s + x.typos, 0), [stats]);
  const hintedCount = useMemo(() => Object.values(stats).filter(s => s.hinted).length, [stats]);
  const doneCount = solvedCount + (allCorrect && !stats[idx]?.solved ? 1 : 0);

  // Resume draft
  useEffect(() => {
    setWasCompleted(!!readProgress('listening', storageId)?.completed);
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        const at = Math.min(Math.max(0, Number(d?.currentIndex) || 0), Math.max(0, total - 1));
        if (d?.inputByIndex) setFreeInput(d.inputByIndex);
        if (d?.boxValuesByIndex) setBoxes(d.boxValuesByIndex);
        if (d?.statsByIndex) setStats(d.statsByIndex);
        if (at > 0 || (d?.statsByIndex && Object.keys(d.statsByIndex).length > 0)) { setIdx(at); setResumeAt(at + 1); }
      }
    } catch { /* ignore */ }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Save draft (debounced)
  useEffect(() => {
    if (!loaded || finished) return undefined;
    if (!(idx > 0 || Object.values(freeInput).some(v => (v || '').trim()) || Object.keys(boxes).length || Object.keys(stats).length)) return undefined;
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify({ currentIndex: idx, inputByIndex: freeInput, boxValuesByIndex: boxes, statsByIndex: stats, at: Date.now() })); } catch { /* ignore */ }
      saveProgress('listening', storageId, { done: doneCount, total, completed: false });
    }, 600);
    return () => clearTimeout(t);
  }, [loaded, finished, idx, freeInput, boxes, stats, doneCount, draftKey, storageId, total]);

  useEffect(() => {
    if (!finished) return;
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    saveProgress('listening', storageId, { done: solvedCount, total, completed: true, score: solvedCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const reportOpen = finished && !reportClosed;
  keysOn.current = view === 'practice' && !reportOpen;

  const recordStats = () => setStats(s => ({ ...s, [idx]: { typos, hinted: hintIdx !== -1 || !!s[idx]?.hinted, solved: allCorrect } }));
  const clearSkipWarn = () => { setSkipWarn(false); if (skipTimer.current) clearTimeout(skipTimer.current); };
  const next = (force = false) => {
    if (!allCorrect && !force && !skipWarn) {
      setShake(true); setSkipWarn(true);
      setTimeout(() => setShake(false), 500);
      if (skipTimer.current) clearTimeout(skipTimer.current);
      skipTimer.current = setTimeout(() => setSkipWarn(false), 6000);
      return;
    }
    recordStats();
    clearSkipWarn();
    if (idx < total - 1) setIdx(idx + 1);
    else { setFinished(true); setReportClosed(false); }
  };
  const goTo = i => { if (i === idx || i < 0 || i > total - 1) return; recordStats(); clearSkipWarn(); setIdx(i); };

  const hint = () => {
    const at = resultWords.findIndex(w => w.status !== 'correct');
    if (at < 0) return;
    setHintIdx(h => Math.max(h, at));
    if (inputMode === 'boxes') {
      const w = slots[at];
      setBox(b => {
        const n = { ...b };
        if (w.number) n[`${at}-n`] = w.answer;
        else for (const tk of w.tokens) if (tk.type === 'letter') n[`${at}-${tk.slot}`] = tk.correct;
        return n;
      });
      setTimeout(() => nextWord(at), 0);
    } else {
      const head = slots.slice(0, at + 1).map(w => w.primary);
      const u = result.userWords[at] ?? '';
      const shifted = !!u && (cur.solution[at + 1] ?? []).map(clean).includes(clean(u));
      const rest = result.userWords.slice(shifted ? at : at + 1).filter(Boolean);
      setFree(`${[...head, ...rest].join(' ')} `);
    }
  };
  hintRef.current = hint;

  const restart = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    clearProgress('listening', storageId);
    setResumeAt(null); setIdx(0); setFreeInput({}); setBoxes({}); setStats({}); setHintIdx(-1); setCombo(0); setRevealAll(false); clearSkipWarn();
  };

  // Progress list keeps the current sentence in view
  useEffect(() => {
    const el = progressList.current, cur2 = el?.querySelector('[aria-current="step"]');
    if (!el || !cur2) return;
    const top = cur2.offsetTop, bottom = top + cur2.offsetHeight;
    if (top < el.scrollTop || bottom > el.scrollTop + el.clientHeight) el.scrollTop = top - (el.clientHeight - cur2.offsetHeight) / 2;
  }, [idx, view]);

  const openWord = (word, key, target, context) => {
    const r = target.getBoundingClientRect();
    setPopup({ word, key, anchor: { x: r.left + r.width / 2, top: r.top, bottom: r.bottom }, context });
  };
  const onTranscriptMouseUp = () => setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const host = (node instanceof Element ? node : node.parentElement)?.closest('[data-dict-sentence]');
    if (!host) return;
    const text = sel.toString().replace(/\s+/g, ' ').trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    if (!text.includes(' ') || text.split(' ').length > 8) return;
    const r = range.getBoundingClientRect();
    sel.removeAllRanges();
    setPopup({ word: text, key: `sel:${Date.now()}`, anchor: { x: r.left + r.width / 2, top: r.top, bottom: r.bottom }, context: host.textContent ?? '' });
  }, 10);

  const lastIdx = total - 1;
  const camTag = data.title.match(/^Cam\s?\d+/i)?.[0].replace(/\s/, '') ?? null;
  const titleText = data.title.replace(/\s+-\s+/g, ' · ');
  const boxesWrong = inputMode === 'boxes' && slots.some((w, i) => { const v = boxWords[i]; return !(!v || accepts(w, v)) && (w.number ? clean(v).length >= w.answer.length : v.length === w.slotCount); });
  const showBad = showResult && (inputMode === 'boxes' ? boxesWrong : anyWrong);
  const status = allCorrect ? { tone: 'ok', text: 'Chính xác!' }
    : skipWarn ? { tone: 'warn', text: 'Câu chưa xong — bấm “Câu tiếp theo” lần nữa để bỏ qua.' }
      : showBad ? { tone: 'bad', text: 'Chưa chính xác, thử lại nhé.' }
        : { tone: 'idle', text: inputMode === 'boxes' ? 'Nghe và điền vào ô.' : 'Nghe và gõ lại cả câu.' };
  const statusCls = { idle: 'text-[color:var(--dct-6b6f66)]', ok: 'text-[color:var(--dct-2e6b3f)] font-semibold', bad: 'text-[color:var(--dct-c62828)] font-semibold', warn: 'text-[color:var(--dct-b45309)] font-semibold' }[status.tone];
  const practiceWords = resultWords.map((w, i) => ({ ...w, i })).filter(w => (w.status === 'correct' || (showFull && w.status !== 'incorrect')) && /[A-Za-z]/.test(w.text));
  const anyVisible = resultWords.some(w => !w.masked && (w.status === 'correct' || showFull || (w.status === 'incorrect' && showResult)));
  const navBtn = 'flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] text-[color:var(--dct-1d211a)] transition-colors hover:bg-[color:var(--dct-f6f6f3)] disabled:opacity-35';
  const boxBase = 'rounded-[6px] border-0 border-b-[3px] text-center font-semibold outline-none transition-colors caret-[color:var(--dct-e36f1e)]';
  const boxTone = s => (s === 'correct' ? 'bg-[color:var(--dct-eaf3ec)] border-[color:var(--dct-2e6b3f)] text-[color:var(--dct-2e6b3f)]'
    : s === 'wrong' ? 'bg-[color:var(--dct-fdecec)] border-[color:var(--dct-d64545)] text-[color:var(--dct-c62828)]'
      : s === 'filled' ? 'bg-[color:var(--dct-f3f3ef)] border-[color:var(--dct-b9bcb1)] text-[color:var(--dct-1d211a)] focus:border-[color:var(--dct-e36f1e)] focus:bg-[color:var(--dct-fff1e6)]'
        : 'bg-[color:var(--dct-f3f3ef)] border-[color:var(--dct-dcdcd5)] text-[color:var(--dct-1d211a)] focus:border-[color:var(--dct-e36f1e)] focus:bg-[color:var(--dct-fff1e6)]');
  const canHint = !allCorrect && resultWords.some(w => w.status !== 'correct');
  const transcriptOpen = finished || wasCompleted || revealAll;

  const onBoxChange = (key, raw) => {
    let v = raw.normalize('NFC');
    if (VN_MARKS.test(v)) { setImeWarn(true); v = stripVn(v); }
    if (v.length > 1) {
      const chars = Array.from(v.replace(/\s/g, ''));
      const patch = {};
      let k = order.findIndex(o => o.key === key);
      for (let c = 0; c < chars.length && k < order.length; k++) {
        const o = order[k];
        const n = o.key.endsWith('-n') ? slots[o.wi].answer.length : 1;
        patch[o.key] = chars.slice(c, c + n).join('');
        c += n;
      }
      setBox(b => ({ ...b, ...patch }));
      focusKey(order[Math.min(k, order.length - 1)]?.key);
    } else {
      setBox(b => ({ ...b, [key]: v }));
      if (v) moveBy(key, 1);
    }
  };

  return (
    <div className={`lis-dct relative min-h-screen w-full bg-[color:var(--dct-ffffff)] text-[color:var(--dct-1d211a)] ${night ? 'dct-night' : ''}`}>
      <Sky night={night} />
      {media.node}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[color:var(--dct-2e6b3f)] px-4 py-2 text-sm font-semibold text-[color:var(--dct-ffffff)] shadow-lg">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />Đang phát lại câu
        </div>
      )}
      <div inert={reportOpen} className="relative mx-auto w-full max-w-[1240px] px-3 pb-8 pt-3 sm:px-6 sm:pt-5 lg:py-6">
        <div className="relative rounded-[22px] bg-[color:var(--dct-ffffff)] px-4 pb-5 pt-4 shadow-[0_24px_60px_rgba(20,40,80,.16)] sm:rounded-[26px] sm:px-7 sm:pb-6 sm:pt-5">
          <header className="flex flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4">
            <button type="button" onClick={onBack} aria-label={`Quay về ${backLabel}`} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] px-3 text-[14px] font-semibold text-[color:var(--dct-1d211a)] transition-colors hover:bg-[color:var(--dct-f6f6f3)]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">{backLabel}</span>
            </button>
            <span aria-hidden="true" className="relative flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-[14px] border border-[color:var(--dct-efe4d2)] bg-[color:var(--dct-fff6e9)] sm:h-[54px] sm:w-[54px]">
              <span className="dct-bob relative block h-[88%] w-[88%]">
                <img src={pxAsset('dino.webp')} alt="" draggable={false} className="h-full w-full [image-rendering:pixelated]" />
                <img src={pxAsset('headset.svg')} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-[color:var(--dct-6b6f66)]">{data.kicker || 'Listening Dictation'}{camTag ? <> · <span className="text-[color:var(--dct-1d211a)]">{camTag}</span></> : null}</p>
              <h1 className="font-newsreader text-[clamp(22px,2.6vw,30px)] font-bold leading-[1.15] tracking-[-0.01em] [text-wrap:balance] sm:truncate">{titleText}</h1>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <span className="hidden whitespace-nowrap rounded-full bg-[color:var(--dct-f1f7f2)] px-3 py-1 text-[13px] text-[color:var(--dct-2e6b3f)] md:inline">Đã xong <b className="font-semibold tabular-nums">{doneCount}/{total}</b></span>
              <div role="group" aria-label="Chế độ xem" className="flex flex-1 rounded-xl bg-[color:var(--dct-f1f1ec)] p-1 sm:flex-none">
                {[['practice', 'Luyện tập'], ['transcript', 'Transcript']].map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={view === k} onClick={() => { if (k === 'practice') media.stopAll(); setView(k); }} className="h-9 flex-1 rounded-lg px-4 text-[14px] font-semibold text-[color:var(--dct-6b6f66)] transition-colors hover:text-[color:var(--dct-1d211a)] aria-pressed:bg-[color:var(--dct-ffffff)] aria-pressed:text-[color:var(--dct-1d211a)] aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,.08)] sm:flex-none">{l}</button>
                ))}
              </div>
              <button type="button" role="switch" aria-checked={night} aria-label="Chế độ ban đêm" title={night ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'} onClick={toggleNight} className="relative flex h-11 w-[76px] shrink-0 items-center rounded-full border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-f1f1ec)] p-[3px] transition-colors">
                <span aria-hidden="true" className={`absolute top-[3px] h-[36px] w-[34px] rounded-full bg-[color:var(--dct-ffffff)] shadow-[0_1px_3px_rgba(0,0,0,.18)] transition-[left] duration-200 ease-out ${night ? 'left-[37px]' : 'left-[3px]'}`} />
                <Sun aria-hidden="true" className={`relative z-[1] mx-auto h-4 w-4 transition-colors ${night ? 'text-[#878A82]' : 'text-[#E8742C]'}`} strokeWidth={2.4} />
                <Moon aria-hidden="true" className={`relative z-[1] mx-auto h-4 w-4 transition-colors ${night ? 'text-[#E8B54A]' : 'text-[#8A8D85]'}`} strokeWidth={2.4} />
              </button>
            </div>
          </header>

          {resumeAt !== null && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[color:var(--dct-f3d9a8)] bg-[color:var(--dct-fff8eb)] px-3.5 py-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-[13.5px] text-[color:var(--dct-7c4a03)]">Đã mở lại đúng chỗ bạn dừng — <b>câu {resumeAt}/{total}</b>.</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setResumeAt(null)} className="h-8 rounded-lg border border-[color:var(--dct-f3d9a8)] bg-[color:var(--dct-ffffff)] px-3 text-[13px] font-semibold text-[color:var(--dct-7c4a03)] hover:bg-[color:var(--dct-fff1d6)]">Học tiếp</button>
                <button type="button" onClick={restart} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[color:var(--dct-e36f1e)] px-3 text-[13px] font-semibold text-[color:var(--dct-ffffff)] hover:bg-[color:var(--dct-c95f16)]"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Làm lại từ đầu</button>
              </div>
            </div>
          )}

          {view === 'transcript' && (
            <section className="mt-4 border-t border-[color:var(--dct-efefea)] pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-semibold">Transcript cả bài <span className="font-normal text-[color:var(--dct-6b6f66)]">· {total} câu</span></h2>
                <div className="flex flex-wrap items-center gap-2">
                  {!transcriptOpen && (
                    <button type="button" onClick={() => setRevealAll(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] px-4 text-[14px] font-semibold hover:bg-[color:var(--dct-f6f6f3)]"><Eye className="h-4 w-4" aria-hidden="true" />Hiện cả bài</button>
                  )}
                  <button type="button" onClick={() => (media.allIndex !== null ? media.stopAll() : media.playFrom(0, true))} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[color:var(--dct-2e6b3f)] px-4 text-[14px] font-semibold text-[color:var(--dct-ffffff)] hover:bg-[color:var(--dct-255833)]">
                    {media.allIndex !== null ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
                    {media.allIndex !== null ? 'Dừng' : 'Nghe cả bài'}
                  </button>
                </div>
              </div>
              {!transcriptOpen && <p className="mt-3 text-[14px] text-[color:var(--dct-6b6f66)]">Câu chưa làm được che lại để không lộ đáp án — làm xong câu nào, câu đó hiện ra. Xong cả bài là xem được toàn bộ.</p>}
              <p className="mt-2 flex items-center gap-2 text-[14px] text-[color:var(--dct-2e6b3f)]"><BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />Bấm vào một từ (hoặc bôi đen một cụm) để tra nghĩa và lưu vào sổ từ vựng.</p>
              <ol className="mt-4 space-y-0.5" onMouseUp={onTranscriptMouseUp}>
                {challenges.map((c, i) => {
                  const text = sentenceText(c);
                  const visible = transcriptOpen || i in stats || (i === idx && allCorrect);
                  const tr = c.translation || translations[i];
                  const playing = media.allIndex === i;
                  return (
                    <li key={i} className={`flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors sm:gap-4 ${playing ? 'bg-[color:var(--dct-f1f7f2)]' : 'hover:bg-[color:var(--dct-f8f8f5)]'}`}>
                      <button type="button" onClick={() => (playing ? media.stopAll() : media.playFrom(i, false))} aria-label={playing ? `Dừng câu ${i + 1}` : `Nghe câu ${i + 1}`} className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${playing ? 'bg-[color:var(--dct-2e6b3f)] text-[color:var(--dct-ffffff)]' : 'bg-[color:var(--dct-f1f1ec)] text-[color:var(--dct-4b4f47)] hover:bg-[color:var(--dct-eaf3ec)] hover:text-[color:var(--dct-2e6b3f)]'}`}>
                        {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />}
                      </button>
                      <span className="mt-2 w-6 shrink-0 text-right text-[12px] font-semibold tabular-nums text-[color:var(--dct-a3a69c)]">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        {visible ? (
                          <p data-dict-sentence="" className="text-[16.5px] font-medium leading-relaxed sm:text-[17px]">
                            {text.split(WORD_RE).map((part, k) => {
                              if (k % 2 === 0) return <Fragment key={k}>{part}</Fragment>;
                              const key = `t:${i}:${k}`;
                              return (
                                <span key={k} onClick={e => { const s = window.getSelection()?.toString().trim() ?? ''; if (!s || s === part) openWord(part, key, e.currentTarget, text); }} className={`cursor-pointer rounded-[4px] px-[1px] transition-colors ${popup?.key === key ? 'bg-herb-100 text-herb-700' : 'hover:bg-herb-50 hover:text-herb-700'}`}>{part}</span>
                              );
                            })}
                          </p>
                        ) : (
                          <p className="select-none text-[16.5px] font-semibold leading-relaxed tracking-widest text-[color:var(--dct-d4d6cf)]">
                            {text.split(/\s+/).filter(Boolean).map(w => '•'.repeat(Math.max(w.replace(/[^\p{L}\p{N}]/gu, '').length, 2))).join(' ')}
                          </p>
                        )}
                        {visible && tr && <p className="mt-0.5 text-[14.5px] leading-relaxed text-[color:var(--dct-6b6f66)]">{tr}</p>}
                        {visible && !tr && text && (
                          <button type="button" onClick={() => { setTrFailed(s => ({ ...s, [i]: false })); requestTranslation(text, i); }} disabled={trLoading === i} className="mt-0.5 text-[13px] font-semibold text-[color:var(--dct-2e6b3f)] underline-offset-4 hover:underline disabled:opacity-60">
                            {trLoading === i ? 'Đang dịch...' : trFailed[i] ? 'Chưa tải được bản dịch — thử lại' : 'Xem bản dịch'}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          <div className={view === 'practice' ? 'mt-4 grid grid-cols-1 gap-5 border-t border-[color:var(--dct-efefea)] pt-4 lg:grid-cols-[minmax(0,1fr)_316px] lg:gap-7' : 'hidden'}>
            <section aria-label="Làm bài" className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => goTo(idx - 1)} disabled={idx === 0} aria-label="Câu trước" className={navBtn}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
                  <span className="min-w-[58px] text-center text-[14.5px] font-semibold tabular-nums">{idx + 1} / {total}</span>
                  <button type="button" onClick={() => next(true)} disabled={idx === lastIdx} aria-label="Câu sau" className={navBtn}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                </div>
                <div className="order-last flex min-w-0 basis-full items-center gap-2.5 rounded-xl border border-[color:var(--dct-e6e6e1)] py-1.5 pl-1.5 pr-2.5 sm:order-none sm:basis-auto sm:flex-1">
                  <button type="button" onClick={media.toggle} aria-label={media.playing ? 'Tạm dừng' : 'Phát câu này'} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--dct-2e6b3f)] text-[color:var(--dct-ffffff)] transition-colors hover:bg-[color:var(--dct-255833)] active:scale-95">
                    {media.playing ? <Pause className="h-4 w-4 fill-current" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />}
                  </button>
                  <Scrubber media={media} />
                  <div role="group" aria-label="Tốc độ phát" className="flex shrink-0 rounded-lg bg-[color:var(--dct-f1f1ec)] p-0.5">
                    {[0.6, 0.8, 1].map(r => (
                      <button key={r} type="button" aria-pressed={media.rate === r} onClick={() => media.setRate(r)} className="h-7 rounded-md px-1.5 text-[12.5px] font-semibold tabular-nums text-[color:var(--dct-6b6f66)] transition-colors hover:text-[color:var(--dct-1d211a)] aria-pressed:bg-[color:var(--dct-ffffff)] aria-pressed:text-[color:var(--dct-2e6b3f)] aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,.08)] sm:px-2">{r}×</button>
                    ))}
                  </div>
                </div>
                <div role="group" aria-label="Cách nhập" className="ml-auto flex rounded-xl bg-[color:var(--dct-f1f1ec)] p-1 sm:ml-0">
                  {[['boxes', 'Ô chữ', () => setInputMode('boxes')], ['free', 'Tự gõ', () => { setFree(boxWords.join(' ').trimEnd()); setInputMode('free'); }]].map(([k, l, fn]) => (
                    <button key={k} type="button" aria-pressed={inputMode === k} onClick={fn} className="h-8 rounded-lg px-3 text-[13.5px] font-semibold text-[color:var(--dct-6b6f66)] transition-colors hover:text-[color:var(--dct-1d211a)] aria-pressed:bg-[color:var(--dct-ffffff)] aria-pressed:text-[color:var(--dct-1d211a)] aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,.08)]">{l}</button>
                  ))}
                </div>
              </div>

              <div className={`relative mt-3 rounded-2xl border px-4 pb-3 pt-4 transition-colors sm:px-5 ${allCorrect ? 'border-[color:var(--dct-2e6b3f)] bg-[color:var(--dct-fbfdfb)]' : showBad ? 'border-[color:var(--dct-d64545)]' : 'border-[color:var(--dct-e6e6e1)]'} ${shake ? '[animation:lisShake_.4s_ease-in-out]' : ''}`}>
                {combo >= 3 && (
                  <span className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-[color:var(--dct-e36f1e)] px-3 py-1 text-[12px] font-bold text-[color:var(--dct-ffffff)] shadow"><Flame className="h-3.5 w-3.5" aria-hidden="true" />Combo x{combo}</span>
                )}
                {inputMode === 'boxes' ? (
                  <div ref={boxWrap} className="flex flex-wrap gap-x-3.5 gap-y-2.5 sm:gap-x-4">
                    {slots.map((w, wi) => {
                      if (w.number) {
                        const key = `${wi}-n`;
                        const val = numberValue(box, wi, w.answer.length);
                        const v = boxWords[wi];
                        const ok = v !== '' && accepts(w, v);
                        const st = v ? (ok ? 'correct' : showResult && clean(v).length >= w.answer.length ? 'wrong' : 'filled') : 'empty';
                        const multi = segCount(w.primary) > 1;
                        return (
                          <div key={wi} className="flex max-w-full items-end gap-1">
                            <input ref={el => { inputs.current[key] = el; }} type="text" inputMode={/^\d+$/.test(w.answer) && !multi ? 'numeric' : 'text'} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-label={`Số, ${w.answer.length} ký tự`} placeholder="số" value={val}
                              onChange={e => { const r = e.target.value; setBox(b => ({ ...b, [key]: r })); if (accepts(w, r.replace(/\s+/g, ''))) moveBy(key, 1); }}
                              onKeyDown={e => {
                                const t = e.currentTarget;
                                if (e.key === 'Enter') { e.preventDefault(); next(false); } else if (e.key === 'Backspace' && !t.value) { e.preventDefault(); backspace(key); } else if (e.key === 'ArrowLeft' && t.selectionStart === 0 && t.selectionEnd === 0) { e.preventDefault(); moveBy(key, -1); } else if (e.key === 'ArrowRight' && t.selectionStart === t.value.length) { e.preventDefault(); moveBy(key, 1); } else if (e.key === ' ' && !(multi && t.value)) { e.preventDefault(); if (t.value) nextWord(wi); }
                              }}
                              style={{ width: `calc(${Math.max(w.answer.length, 2) + 1}ch + 22px)` }}
                              className={`${boxBase} ${boxTone(st)} h-[40px] px-2 text-[19px] tabular-nums placeholder:text-[13px] placeholder:font-medium placeholder:text-[color:var(--dct-a3a69c)] sm:h-[44px] sm:text-[20px]`} />
                            {w.tokens.map((tk, k) => (tk.type === 'static' ? <span key={k} className="self-end pb-1 text-[20px] font-semibold text-[color:var(--dct-a3a69c)]">{tk.char}</span> : null))}
                          </div>
                        );
                      }
                      return (
                        <div key={wi} className="flex max-w-full flex-wrap items-end gap-1">
                          {w.tokens.map((tk, k) => {
                            if (tk.type === 'static') return <span key={k} className="self-end px-[1px] pb-1 text-[20px] font-semibold text-[color:var(--dct-a3a69c)]">{tk.char}</span>;
                            const key = `${wi}-${tk.slot}`;
                            const val = box[key] || '';
                            const filled = w.slotCount > 0 && Array.from({ length: w.slotCount }).every((_, s) => (box[`${wi}-${s}`] || '') !== '');
                            let st = val ? 'filled' : 'empty';
                            if (showResult && filled) st = accepts(w, boxWords[wi]) || val.toLowerCase() === tk.correct.toLowerCase() ? 'correct' : 'wrong';
                            return (
                              <input key={k} ref={el => { inputs.current[key] = el; }} type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-label={`Từ ${wi + 1}, chữ ${tk.slot + 1}`} value={val}
                                onChange={e => onBoxChange(key, e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') { e.preventDefault(); next(false); } else if (e.key === 'Backspace') { if (val) setBox(b => ({ ...b, [key]: '' })); else { e.preventDefault(); backspace(key); } } else if (e.key === 'ArrowLeft') { e.preventDefault(); moveBy(key, -1); } else if (e.key === 'ArrowRight') { e.preventDefault(); moveBy(key, 1); } else if (e.key === ' ') { e.preventDefault(); if (tk.slot > 0 || val) nextWord(wi); }
                                }}
                                className={`${boxBase} ${boxTone(st)} h-[40px] w-[29px] text-[19px] sm:h-[44px] sm:w-[33px] sm:text-[20px]`} />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <textarea className="h-28 w-full resize-none bg-transparent text-[20px] font-medium leading-relaxed outline-none placeholder:text-[color:var(--dct-a3a69c)] sm:text-[21px]" placeholder="Nghe và gõ lại câu tại đây..." value={free}
                    onChange={e => { setFree(e.target.value); if (VN_MARKS.test(e.target.value)) setImeWarn(true); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); next(false); } }} autoFocus />
                )}
                {imeWarn && (
                  <p role="status" className="mt-3 flex items-start gap-2 rounded-xl bg-[color:var(--dct-fff8eb)] px-3 py-2 text-[13px] leading-snug text-[color:var(--dct-7c4a03)]">
                    <span aria-hidden="true">⌨️</span>
                    <span className="min-w-0 flex-1">Bộ gõ tiếng Việt đang bật — chữ “ư” trong ô được hiểu là “w”. Gõ tiếng Anh mượt nhất khi chuyển bàn phím sang ABC / English (macOS: Ctrl + Space, Windows: Ctrl + Shift).</span>
                    <button type="button" onClick={() => setImeWarn(false)} aria-label="Ẩn nhắc bộ gõ" className="shrink-0 rounded px-1 font-semibold hover:bg-[color:var(--dct-fff1d6)]">✕</button>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[color:var(--dct-efefea)] pt-2.5 text-[13px] text-[color:var(--dct-6b6f66)]">
                  <span className="min-w-0">
                    <span className="lg:hidden">{inputMode === 'boxes' ? 'Gõ là tự nhảy ô · số gõ liền một ô.' : 'Gõ lại cả câu, Enter để sang câu.'}</span>
                    <span className="hidden items-center gap-x-2.5 gap-y-1 lg:inline-flex lg:flex-wrap">
                      {[['Ctrl', 'nghe lại'], ['Enter', 'câu tiếp'], ['Alt+H', 'gợi ý'], ['Space', 'từ kế']].map(([k, l]) => (
                        <span key={k} className="inline-flex items-center gap-1"><kbd className="rounded-[5px] border border-[color:var(--dct-dcdcd5)] bg-[color:var(--dct-ffffff)] px-1.5 font-sans text-[11.5px] font-semibold leading-[18px] text-[color:var(--dct-1d211a)] shadow-[0_1px_0_#dcdcd5]">{k}</kbd>{l}</span>
                      ))}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={hint} disabled={!canHint} title="Gợi ý một từ (Alt+H)" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color:var(--dct-f3d9a8)] bg-[color:var(--dct-fff8eb)] px-3 text-[13px] font-semibold text-[color:var(--dct-7c4a03)] transition-colors hover:bg-[color:var(--dct-fff1d6)] disabled:opacity-40"><Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />Gợi ý 1 từ</button>
                    <button type="button" onClick={() => { if (inputMode === 'boxes') { setBox({}); focusKey(order[0]?.key); } else setFree(''); }} className="h-8 rounded-lg px-2.5 text-[13px] font-semibold text-[color:var(--dct-1d211a)] transition-colors hover:bg-[color:var(--dct-f6f6f3)]">Xoá hết</button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite" className={`text-[15px] transition-transform ${statusCls} ${shake ? 'scale-[1.03]' : ''}`}>{status.text}</p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  {!allCorrect && <button type="button" onClick={() => next(true)} className="h-11 rounded-xl border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] px-5 text-[15px] font-semibold transition-colors hover:bg-[color:var(--dct-f6f6f3)]">Bỏ qua</button>}
                  <button type="button" onClick={() => next(false)} className={`h-11 rounded-xl px-5 text-[15px] font-semibold text-[color:var(--dct-ffffff)] transition-colors active:scale-[.98] ${allCorrect ? 'col-span-2 bg-[color:var(--dct-2e6b3f)] hover:bg-[color:var(--dct-255833)]' : skipWarn ? 'bg-[color:var(--dct-e36f1e)] hover:bg-[color:var(--dct-c95f16)]' : 'bg-[color:var(--dct-1d211a)] hover:bg-black'}`}>
                    {idx === lastIdx ? 'Xong bài →' : 'Câu tiếp theo →'}
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--dct-9cc5a6)] bg-[color:var(--dct-f1f7f2)] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[color:var(--dct-2e6b3f)]">Đáp án{!anyVisible && <span className="ml-2 font-medium normal-case tracking-normal text-[color:var(--dct-6b6f66)]">· điền đúng để hiện từng từ</span>}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {[['Hiện kết quả ngay', showResult, () => setShowResult(!showResult)], ['Hiện đáp án đầy đủ', showFull, () => setShowFull(!showFull)]].map(([l, on, fn]) => (
                      <label key={l} className="flex cursor-pointer items-center gap-2 text-[13.5px] text-[color:var(--dct-1d211a)]">
                        <input type="checkbox" role="switch" checked={on} onChange={fn} className="peer sr-only" />
                        <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-[color:var(--dct-cfd3c8)] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-[color:var(--dct-ffffff)] after:shadow after:transition-transform after:content-[''] peer-checked:bg-[color:var(--dct-2e6b3f)] peer-checked:after:translate-x-4" />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
                <p className="mt-1.5 flex min-h-[30px] flex-wrap gap-x-2 text-[18px] font-semibold leading-relaxed">
                  {resultWords.map((w, i) => {
                    if (w.masked) return <span key={i} className="text-[color:var(--dct-c9cbc3)]">{'•'.repeat(Math.max(String(w.text).replace(/[^\w]/g, '').length, 2))}</span>;
                    if (w.status === 'correct' || showFull) return <span key={i} className="text-[color:var(--dct-1d211a)]">{w.text}</span>;
                    if (w.status === 'incorrect' && showResult) return <span key={i} className="text-[color:var(--dct-c62828)] line-through decoration-2">{w.text}</span>;
                    return null;
                  })}
                </p>
              </div>
            </section>

            <aside className="grid content-start gap-3">
              <section className="rounded-2xl bg-[color:var(--dct-f6f6f3)] px-4 py-3.5">
                <header className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--dct-e8f0fe)] text-[color:var(--dct-1d4ed8)]"><Languages className="h-4 w-4" /></span>
                  <h2 className="text-[15.5px] font-semibold">Dịch nghĩa</h2>
                  <span className="ml-auto rounded-full bg-[color:var(--dct-e8f0fe)] px-2 py-0.5 text-[11.5px] font-semibold text-[color:var(--dct-1d4ed8)]">Tiếng Việt</span>
                </header>
                <div className="mt-2 flex min-h-[44px] items-center border-t border-[color:var(--dct-e6e6e1)] pt-2.5">
                  {(allCorrect || showFull) && (cur.translation || translations[idx]) ? <p className="text-[15.5px] leading-relaxed">{cur.translation || translations[idx]}</p>
                    : trLoading === idx ? <p className="flex items-center gap-2 text-[14px] text-[color:var(--dct-6b6f66)]"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--dct-2e6b3f)] border-t-transparent" />Đang dịch...</p>
                      : trFailed[idx] ? <p className="text-[14px] text-[color:var(--dct-b45309)]">Chưa tải được bản dịch. <button type="button" onClick={() => setTrFailed(s => { const n = { ...s }; delete n[idx]; return n; })} className="font-semibold text-[color:var(--dct-2e6b3f)] underline underline-offset-4">Thử lại</button></p>
                        : <p className="text-[13.5px] text-[color:var(--dct-8a8d84)]">Hoàn thành câu để xem bản dịch.</p>}
                </div>
              </section>
              <section className="rounded-2xl bg-[color:var(--dct-f6f6f3)] px-4 py-3.5">
                <header className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:var(--dct-fff1e6)] text-[color:var(--dct-c2410c)]"><Music2 className="h-4 w-4" /></span>
                  <h2 className="text-[15.5px] font-semibold">Luyện phát âm</h2>
                </header>
                <p className="mt-0.5 text-[12.5px] text-[color:var(--dct-6b6f66)]">Bấm vào từ để nghe, tra nghĩa, lưu vào sổ.</p>
                <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[color:var(--dct-e6e6e1)] pt-2.5">
                  {practiceWords.length === 0 ? <p className="text-[13.5px] text-[color:var(--dct-8a8d84)]">Từ sẽ hiện sau khi bạn điền đúng.</p>
                    : practiceWords.map(w => {
                      const key = `p:${idx}:${w.i}`;
                      const word = String(w.text).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
                      return (
                        <button key={w.i} type="button" onClick={e => { ttsService.speak(word, { voiceType: speechVoice || 'US' }); openWord(word, key, e.currentTarget, sentenceText(cur)); }}
                          className={`rounded-lg border px-2 py-0.5 text-[14.5px] font-semibold transition-colors ${popup?.key === key ? 'border-[color:var(--dct-1d211a)] bg-[color:var(--dct-1d211a)] text-[color:var(--dct-ffffff)]' : 'border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] hover:border-[color:var(--dct-1d211a)]'}`}>{w.text}</button>
                      );
                    })}
                </div>
              </section>
              <section className="rounded-2xl bg-[color:var(--dct-f6f6f3)] px-4 py-3.5">
                <header className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[15.5px] font-semibold">Tiến độ bài</h2>
                  <span className="text-[12.5px] tabular-nums text-[color:var(--dct-6b6f66)]">{doneCount}/{total} câu đúng</span>
                </header>
                <ol ref={progressList} className="relative mt-2.5 flex max-h-[300px] flex-wrap gap-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {challenges.map((_, i) => {
                    const s = stats[i];
                    const isCur = i === idx;
                    const ok = (isCur && allCorrect) || !!s?.solved;
                    const label = ok ? (s?.hinted ? 'đúng, có gợi ý' : 'đúng') : s ? 'chưa đúng' : 'chưa làm';
                    const tone = isCur ? 'bg-[color:var(--dct-1d211a)] text-[color:var(--dct-ffffff)]'
                      : ok ? (s?.hinted ? 'bg-[color:var(--dct-ffe7c2)] text-[color:var(--dct-7c4a03)] hover:bg-[color:var(--dct-ffd99a)]' : 'bg-[color:var(--dct-cfe6d5)] text-[color:var(--dct-1f5a33)] hover:bg-[color:var(--dct-b9dcc2)]')
                        : s ? 'bg-[color:var(--dct-fbd9d3)] text-[color:var(--dct-9a2b12)] hover:bg-[color:var(--dct-f7c4ba)]' : 'bg-[color:var(--dct-ffffff)] text-[color:var(--dct-8a8d84)] hover:bg-[color:var(--dct-ecece6)] hover:text-[color:var(--dct-1d211a)]';
                    return (
                      <li key={i}>
                        <button type="button" onClick={() => goTo(i)} aria-current={isCur ? 'step' : undefined} aria-label={`Câu ${i + 1}: ${label}`} title={`Câu ${i + 1}: ${label}`} className={`flex h-[26px] w-[26px] items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-colors ${tone}`}>{i + 1}</button>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-[color:var(--dct-6b6f66)]">
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--dct-cfe6d5)]" />Đúng</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--dct-ffe7c2)]" />Có gợi ý</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--dct-fbd9d3)]" />Bỏ qua</span>
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {popup && <WordPopup key={popup.key} word={popup.word} anchor={popup.anchor} context={popup.context} onClose={() => setPopup(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d211a]/30 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-[color:var(--dct-ffffff)] p-7 text-center shadow-2xl sm:p-9">
            <span className="dct-bob relative mx-auto block h-20 w-20">
              <img src={pxAsset('dino.webp')} alt="" className="h-full w-full [image-rendering:pixelated]" />
              <img src={pxAsset('headset.svg')} alt="" className="absolute inset-0 h-full w-full" />
            </span>
            <h2 className="mt-3 font-newsreader text-[30px] font-bold leading-tight">Xong bài rồi!</h2>
            <p className="mt-2 text-[15px] text-[color:var(--dct-6b6f66)] [text-wrap:balance]">Bạn vừa hoàn thành <b className="text-[color:var(--dct-1d211a)]">{titleText}</b>.</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {[['Câu đúng', `${solvedCount}/${total}`, 'text-[color:var(--dct-2e6b3f)]'], ['Lỗi chính tả', String(totalTypos), 'text-[color:var(--dct-c2410c)]'], ['Gợi ý đã dùng', `${hintedCount} câu`, 'text-[color:var(--dct-7c4a03)]'], ['Chưa đúng', String(total - solvedCount), 'text-[color:var(--dct-1d211a)]']].map(([l, v, c]) => (
                <div key={l} className="rounded-2xl bg-[color:var(--dct-f6f6f3)] px-2 py-4">
                  <div className={`text-[26px] font-bold tabular-nums ${c}`}>{v}</div>
                  <div className="mt-0.5 text-[12.5px] text-[color:var(--dct-6b6f66)]">{l}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={onBack} className="mt-6 block w-full rounded-xl bg-[color:var(--dct-2e6b3f)] py-3.5 text-[15px] font-semibold text-[color:var(--dct-ffffff)] hover:bg-[color:var(--dct-255833)]">Tiếp tục rèn luyện</button>
            <button type="button" onClick={() => { setReportClosed(true); setView('transcript'); }} className="mt-2.5 block w-full rounded-xl border border-[color:var(--dct-e6e6e1)] bg-[color:var(--dct-ffffff)] py-3.5 text-[15px] font-semibold hover:bg-[color:var(--dct-f6f6f3)]">Xem transcript cả bài</button>
          </div>
        </div>
      )}
    </div>
  );
}
