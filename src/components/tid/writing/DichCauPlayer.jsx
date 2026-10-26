import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, ChevronDown, ChevronLeft, Eye, EyeOff, Flame, Lightbulb, Maximize2, Minimize2, RotateCcw, Type } from 'lucide-react';
import { dichCauKey, lsDel, lsGet, lsSet } from './data';
import { Modal } from './ui';
import { SaveWordButton, exampleFor } from './saveWord';

// Faithful port of the site's "Dịch câu" player (/practice/writing/dich-cau/<id>).
const FONTS = [
  { id: 'nunito', label: 'Nunito · như Ngữ pháp', stack: 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif' },
  { id: 'manrope', label: 'Manrope · bản cũ', stack: 'var(--font-manrope), ui-sans-serif, system-ui, sans-serif' },
  { id: 'quicksand', label: 'Quicksand · chữ tròn', stack: 'var(--font-quicksand), ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', label: 'Inter · gọn gàng', stack: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif' },
  { id: 'jakarta', label: 'Plus Jakarta · học thuật', stack: 'var(--font-jakarta), ui-sans-serif, system-ui, sans-serif' },
  { id: 'jetbrains', label: 'JetBrains Mono · đều ô', stack: 'var(--font-jetbrains), ui-monospace, monospace' },
];
const FONT_KEY = 'dich_cau_font';
const ACCENT = '#c47a35';
const tokenize = s => s.split(' ').filter(Boolean);
const norm = s => s.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
const isWord = t => /[a-zA-Z0-9]/.test(t);
// Mask a word, showing the prefix the learner typed correctly (always at least the first letter)
const mask = (word, typed) => {
  let k = 0;
  for (let i = 0; i < word.length; i++) {
    if (i < typed.length && typed[i].toLowerCase() === word[i].toLowerCase()) k = i + 1; else break;
  }
  k = Math.max(k, 1);
  let rest = word.slice(k).replace(/[A-Za-z0-9]/g, '*');
  if (k < typed.length) rest = 'X' + rest.slice(1);
  return word.slice(0, k) + rest;
};
const toSets = (obj, n) => {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const i = Number(k);
    if (Number.isInteger(i) && i >= 0 && i < n && Array.isArray(v) && v.length) out[i] = new Set(v.map(Number));
  }
  return out;
};
const fromSets = m => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v]]));
const toSet = (arr, n) => new Set((Array.isArray(arr) ? arr : []).map(Number).filter(i => Number.isInteger(i) && i >= 0 && i < n));

function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [[523.25, 0], [659.25, 0.08], [783.99, 0.16]].forEach(([f, t]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(f, ctx.currentTime + t);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.32);
    });
  } catch { /* ignore */ }
}

export default function DichCauPlayer({ exercise, onBack, onNext, nextLabel, onSaveWord, speechVoice }) {
  const sentences = exercise.sentences ?? [];
  const n = sentences.length;
  const storeKey = dichCauKey(exercise.exerciseId);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [manual, setManual] = useState({});
  const [allShown, setAllShown] = useState(new Set());
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const [err, setErr] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [flash, setFlash] = useState(new Set());
  const [submitted, setSubmitted] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [hintN, setHintN] = useState(3);
  const [resume, setResume] = useState(null);
  const [ready, setReady] = useState(false);
  const [askReset, setAskReset] = useState(false);
  const [pop, setPop] = useState(null);
  const [colloc, setColloc] = useState(new Set());
  const [split, setSplit] = useState(50);
  const [hover, setHover] = useState(null);
  const [font, setFont] = useState(() => lsGet(FONT_KEY, 'nunito') || 'nunito');
  const [shook, setShook] = useState(new Set());
  const [fs, setFs] = useState(false);
  const gridRef = useRef(null);
  const taRef = useRef(null);
  const popRef = useRef(null);
  const collocRef = useRef(null);
  const fontStack = (FONTS.find(f => f.id === font) ?? FONTS[0]).stack;

  // restore saved progress
  useEffect(() => {
    const s = lsGet(storeKey);
    if (!s || typeof s !== 'object') { setReady(true); return; }
    const cur = Math.min(Math.max(Number(s.currentIdx) || 0, 0), Math.max(n - 1, 0));
    const st = {
      currentIdx: cur, userInput: typeof s.userInput === 'string' ? s.userInput : '',
      revealedMap: toSets(s.revealedMap, n), manualRevealedMap: toSets(s.manualRevealedMap, n),
      allRevealedSet: toSet(s.allRevealedSet, n), submittedSet: toSet(s.submittedSet, n),
    };
    if (s.completed) {
      setIdx(cur); setRevealed(st.revealedMap); setManual(st.manualRevealedMap); setAllShown(st.allRevealedSet);
      setSubmitted(st.submittedSet); setCompleted(true); setReady(true);
    } else if (cur > 0 || st.userInput || st.submittedSet.size || st.allRevealedSet.size || Object.keys(st.revealedMap).length) {
      setResume(st);
    } else setReady(true);
  }, [storeKey, n]);

  // persist progress
  useEffect(() => {
    if (!ready || finished || completed) return;
    if (idx === 0 && !input && !Object.keys(revealed).length && !allShown.size && !submitted.size) return;
    lsSet(storeKey, { currentIdx: idx, userInput: input, revealedMap: fromSets(revealed), manualRevealedMap: fromSets(manual),
      allRevealedSet: [...allShown], submittedSet: [...submitted] });
  }, [ready, finished, completed, idx, input, revealed, manual, allShown, submitted, storeKey]);

  const cur = sentences[idx];
  const tokens = useMemo(() => (cur ? tokenize(cur.answer) : []), [cur]);
  const wordIdx = useMemo(() => tokens.reduce((a, t, i) => (isWord(t) && a.push(i), a), []), [tokens]);
  const targets = useMemo(() => wordIdx.map(i => norm(tokens[i])).filter(Boolean), [wordIdx, tokens]);
  const rev = revealed[idx] ?? new Set();
  const showAll = allShown.has(idx);
  const isDone = submitted.has(idx);
  const totalWords = Math.max(1, wordIdx.length);
  const typed = input.split(/\s+/).filter(Boolean);
  const okFlags = wordIdx.map((ti, k) => !!typed[k] && norm(tokens[ti]) === norm(typed[k]));
  const correct = okFlags.filter(Boolean).length;
  const firstBad = okFlags.indexOf(false);
  const firstBadTok = firstBad === -1 ? -1 : wordIdx[firstBad];
  const pct = Math.round((correct / totalWords) * 100);
  const collocText = useMemo(() => [...colloc].sort((a, b) => a - b).map(i => tokens[i]?.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase()).filter(Boolean).join(' '), [colloc, tokens]);

  const goTo = i => {
    setIdx(i); setInput(''); setWrong(false); setErr(''); setShowHint(false); setFlash(new Set()); setHintN(3);
    setPop(null); setColloc(new Set()); setShook(new Set()); setHover(null);
    setTimeout(() => taRef.current?.focus(), 50);
  };
  const reveal = i => {
    setRevealed(m => ({ ...m, [idx]: new Set([...(m[idx] ?? []), i]) }));
    setManual(m => ({ ...m, [idx]: new Set([...(m[idx] ?? []), i]) }));
    setFlash(new Set([i]));
    setTimeout(() => setFlash(new Set()), 700);
  };
  const matches = txt => {
    const w = txt.trim().split(/\s+/).map(norm).filter(Boolean);
    return w.length === targets.length && w.every((x, i) => x === targets[i]);
  };
  const submit = () => {
    if (!input.trim() || isDone) return;
    if (!matches(input)) {
      const w = input.trim().split(/\s+/).map(norm).filter(Boolean);
      const bad = w.findIndex((x, i) => x !== targets[i]);
      setErr(bad !== -1 && bad < targets.length
        ? `Từ thứ ${bad + 1} chưa đúng — em gõ “${w[bad]}”, đáp án là “${mask(targets[bad], w[bad])}”.`
        : w.length < targets.length ? `Bản dịch còn thiếu ${targets.length - w.length} từ — em mới gõ ${w.length}/${targets.length} từ.`
          : w.length > targets.length ? `Bản dịch đang dư ${w.length - targets.length} từ so với đáp án (${targets.length} từ).`
            : 'Chưa đúng — kiểm tra lại bản dịch (gõ đúng từng từ).');
      setWrong(true);
      return;
    }
    setWrong(false); setErr('');
    setSubmitted(s => new Set([...s, idx]));
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#4d6228', '#6A8042', '#fbbf24', '#f59e0b', '#10b981'] });
    chime();
  };
  const finish = () => {
    lsSet(storeKey, { currentIdx: n - 1, userInput: '', revealedMap: fromSets(revealed), manualRevealedMap: fromSets(manual),
      allRevealedSet: [...allShown], submittedSet: [...submitted], completed: true });
    setFinished(true);
  };
  const restart = () => {
    lsDel(storeKey);
    setIdx(0); setRevealed({}); setManual({}); setAllShown(new Set()); setInput(''); setShowHint(false); setFlash(new Set());
    setSubmitted(new Set()); setCompleted(false); setFinished(false); setHintN(3); setReady(true);
    setTimeout(() => taRef.current?.focus(), 50);
  };
  const answerResume = yes => {
    if (yes && resume) {
      setIdx(resume.currentIdx); setInput(resume.userInput); setRevealed(resume.revealedMap); setManual(resume.manualRevealedMap);
      setAllShown(resume.allRevealedSet); setSubmitted(resume.submittedSet);
    } else lsDel(storeKey);
    setResume(null); setReady(true);
  };

  // auto-submit once the typed translation is exactly right
  useEffect(() => {
    if (isDone || !input.trim() || !matches(input)) return undefined;
    const t = setTimeout(submit, 450);
    return () => clearTimeout(t);
  });

  // keyboard: Ctrl+Space reveals next word, Enter submits / goes next
  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (!isDone) {
          const i = tokens.findIndex((t, k) => isWord(t) && !rev.has(k) && !showAll);
          if (i !== -1) reveal(i);
        }
      }
      if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        if (isDone) { e.preventDefault(); if (idx < n - 1) goTo(idx + 1); else finish(); }
        else if (document.activeElement === taRef.current) { e.preventDefault(); submit(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => { if (!isDone) taRef.current?.focus(); }, [idx, isDone]);

  // close popovers on outside click
  useEffect(() => {
    if (!pop) return undefined;
    const h = e => { if (popRef.current && !popRef.current.contains(e.target)) setPop(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pop]);
  useEffect(() => {
    if (!colloc.size) return undefined;
    const h = e => { if (collocRef.current && !collocRef.current.contains(e.target) && !e.target.closest('[data-pill]')) setColloc(new Set()); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [colloc]);

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  const toggleFs = () => {
    try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch { /* ignore */ }
  };

  const startDrag = useCallback(e => {
    e.preventDefault();
    const el = gridRef.current;
    if (!el) return;
    const move = ev => { const r = el.getBoundingClientRect(); setSplit(Math.max(25, Math.min(75, ((ev.clientX - r.left) / r.width) * 100))); };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); document.body.style.userSelect = ''; };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, []);

  if (!cur) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 text-center" style={{ backgroundColor: '#6A8042' }}>
        <p className="text-xl font-black text-white">Không mở được bài này.</p>
        <p className="max-w-sm text-sm font-medium leading-relaxed text-white/75">Tiến độ đã lưu của bài không khớp với đề nữa. Bấm “Làm lại từ đầu” để xoá tiến độ cũ và bắt đầu lại nha.</p>
        <button type="button" onClick={restart} className="rounded-2xl bg-white px-6 py-3 text-sm font-black uppercase tracking-widest text-[#3a6a24]">Làm lại từ đầu</button>
        <button type="button" onClick={onBack} className="text-sm font-bold text-white/70 underline hover:text-white">← Quay lại</button>
      </div>
    );
  }

  const nextHidden = wordIdx.findIndex(i => !rev.has(i) && !showAll);
  const hasHidden = nextHidden !== -1;
  const hintWords = hasHidden ? wordIdx.slice(nextHidden, nextHidden + hintN).map(i => tokens[i]) : [];
  const moreHints = hasHidden && nextHidden + hintN < wordIdx.length;
  const card = { background: '#fff', borderRadius: 22, boxShadow: '0 16px 36px rgba(0,0,0,0.16)' };
  const kbd = 'bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-[#3a4526] shadow-[0_1px_2px_rgba(0,0,0,0.06)]';
  const hintsUsed = sentences.reduce((a, _, i) => a + (manual[i]?.size ?? 0), 0);

  return (
    <div className="min-h-full w-full box-border" style={{
      backgroundColor: '#6d8049',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
      backgroundSize: '28px 28px', fontFamily: fontStack, padding: '28px clamp(16px, 3vw, 40px) 40px',
    }}>
      {/* header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <button type="button" onClick={onBack} title="Quay lại" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"><ChevronLeft size={18} /></button>
          <div className="flex min-w-0 items-baseline gap-2.5">
            <span className="whitespace-nowrap font-[family-name:var(--font-quicksand)] text-[24px] font-extrabold uppercase leading-none text-white md:text-[26px]">Dịch câu</span>
            <span className="hidden whitespace-nowrap font-[family-name:var(--font-quicksand)] text-[11px] font-bold uppercase tracking-[3px] text-white/55 2xl:inline">The IELTS Dictionary</span>
          </div>
        </div>
        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5 xl:flex">
          {sentences.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} title={`Câu ${i + 1}`} className="rounded-full transition-all"
              style={{ width: i === idx ? 20 : 6, height: 6, background: i === idx ? '#fff' : submitted.has(i) ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <label title="Đổi phông chữ hiển thị" className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white sm:flex">
            <Type size={11} className="shrink-0" />
            <select value={font} onChange={e => { setFont(e.target.value); lsSet(FONT_KEY, e.target.value); }} className="cursor-pointer appearance-none bg-transparent text-[11px] font-bold text-current outline-none">
              {FONTS.map(f => <option key={f.id} value={f.id} className="bg-white text-[#3a4526]">{f.label}</option>)}
            </select>
            <ChevronDown size={11} className="-ml-0.5 shrink-0" />
          </label>
          <button type="button" onClick={toggleFs} title={fs ? 'Thoát toàn màn hình' : 'Toàn màn hình'} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
            {fs ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button type="button" onClick={() => setAskReset(true)} title="Làm lại bài này từ đầu" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white">
            <RotateCcw size={11} />Reset
          </button>
          <span className="hidden max-w-[220px] truncate text-sm font-semibold text-white/75 lg:inline">{exercise.title}</span>
          <span className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-[#3a4526]">Câu {idx + 1}/{n}</span>
        </div>
      </div>

      <div ref={gridRef} className="flex flex-col gap-4 md:grid md:grid-cols-[var(--dc-cols)] md:items-start md:gap-0" style={{ '--dc-cols': `${split}fr 5px ${100 - split}fr` }}>
        {/* left: sentence, word chips, hints, list */}
        <div className="order-2 flex min-w-0 flex-col px-[clamp(18px,2.2vw,34px)] pb-7 pt-[30px] md:order-none md:mr-2" style={card}>
          {(exercise.topic?.en || exercise.topic?.question) && (
            <div className="mb-6 rounded-2xl bg-[#f7f8f2] px-5 py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#8a9179]">ĐỀ BÀI</span>
                {exercise.topic?.taskType && <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-[#5c6650]">{exercise.topic.taskType}</span>}
              </div>
              {exercise.topic?.en && <p className="text-sm font-medium leading-relaxed text-[#1f2a1c]">{exercise.topic.en}</p>}
              {exercise.topic?.question && <p className="mt-2 text-xs italic leading-relaxed text-[#5c6650]">{exercise.topic.question}</p>}
            </div>
          )}
          <div className="mb-3.5 flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.1em] text-[#8a9179]">TIẾNG VIỆT → ENGLISH</div>
          <div className="mb-6 text-2xl font-bold leading-[1.4] text-[#1f2a1c]">{cur.vi}</div>
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold tracking-[0.08em] text-[#8a9179]">CÂU MẪU - NHỚ ĐÚNG ĐỂ MỞ TỪ:</span>
            {!isDone && (
              <button type="button" onClick={() => setAllShown(s => { const x = new Set(s); if (x.has(idx)) x.delete(idx); else x.add(idx); return x; })}
                className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold" style={{ color: ACCENT }}>
                {showAll ? <EyeOff size={13} /> : <Eye size={13} />}{showAll ? 'Ẩn gợi ý' : 'Hiện tất cả'}
              </button>
            )}
          </div>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {tokens.map((tok, i) => {
              if (!isWord(tok)) return <span key={i} className="self-center text-sm text-[#8a9179]">{tok}</span>;
              const core = tok.replace(/[^a-zA-Z0-9]/g, '');
              const tail = tok.slice(core.length);
              const open = isDone || showAll || rev.has(i);
              const fl = flash.has(i);
              const inColloc = colloc.has(i);
              const popped = pop?.ti === i;
              const k = wordIdx.indexOf(i);
              const typedW = (k >= 0 && k < typed.length ? typed[k] : '').replace(/[^a-zA-Z0-9]/g, '');
              const bad = !open && !!typedW && !core.toLowerCase().startsWith(typedW.toLowerCase());
              const shake = bad && !shook.has(i);
              const hov = !open && !bad && hover === i;
              const focusRing = !isDone && i === firstBadTok;
              const label = open ? tok : mask(core, typedW) + tail;
              const c = fl ? { bg: '#3a8f1f', border: '#3a8f1f', text: '#fff' }
                : inColloc ? { bg: '#fdf3dd', border: '#e0a53a', text: '#a2661a' }
                  : popped ? { bg: '#dff0c6', border: '#3a8f1f', text: '#2f7418' }
                    : open ? { bg: '#eaf6d8', border: '#7fb84a', text: '#3a8f1f' }
                      : bad ? { bg: '#fbe4e0', border: '#e0745a', text: '#c0402a' }
                        : hov ? { bg: '#fdeceb', border: '#e5a099', text: '#d84f3e' }
                          : { bg: 'rgba(238,240,248,0.5)', border: 'rgba(228,231,242,0.6)', text: '#b6bcd4' };
              return (
                <button key={i} type="button" data-pill="true"
                  onClick={e => {
                    if (!open) { reveal(i); if (window.matchMedia('(hover: hover)').matches) taRef.current?.focus(); return; }
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault(); setPop(null);
                      setColloc(s => { const x = new Set(s); if (x.has(i)) x.delete(i); else x.add(i); return x; });
                    } else {
                      setColloc(new Set());
                      if (popped) setPop(null);
                      else {
                        const r = e.currentTarget.getBoundingClientRect();
                        const right = r.left > window.innerWidth / 2;
                        setPop({ ti: i, x: right ? window.innerWidth - r.right : r.left, y: r.top, right });
                      }
                    }
                  }}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(h => (h === i ? null : h))}
                  onAnimationEnd={shake ? () => setShook(s => new Set(s).add(i)) : undefined}
                  title={open ? 'Bấm để lưu từ · Ctrl/⌘+Click để chọn collocation' : 'Bấm để mở từ này'}
                  className="box-border flex items-center gap-1.5 rounded-[20px] transition-[background-color,border-color,transform] duration-150"
                  style={{ padding: '9px 16px', minWidth: `${core.length + 2}ch`, background: c.bg, border: `1.5px solid ${c.border}`,
                    animation: shake ? 'chipShake 0.35s ease' : hov ? 'chipShake 0.4s ease' : 'none', transform: fl ? 'scale(1.06)' : undefined,
                    boxShadow: focusRing ? `0 0 0 3px ${ACCENT}40` : undefined }}>
                  <Eye size={14} className="shrink-0" style={{ color: c.text }} />
                  <span className="whitespace-pre text-base font-bold" style={{ fontFamily: fontStack, letterSpacing: '0.02em', color: c.text }}>{label}</span>
                </button>
              );
            })}
          </div>
          {colloc.size >= 2 && (
            <div ref={collocRef} className="mb-5 rounded-2xl border-[1.5px] border-[#e0a53a] bg-[#fdf6e6] px-5 py-4">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#a2661a]">COLLOCATION ĐÃ CHỌN</span>
                <span className="text-[10px] font-medium text-[#c39a5c]">(Ctrl+Click để thêm/bớt từ)</span>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {[...colloc].sort((a, b) => a - b).map(i => <span key={i} className="rounded-full border border-[#e6c68b] bg-white px-3 py-1.5 text-sm font-bold text-[#a2661a]">{tokens[i]?.replace(/[^a-zA-Z0-9'-]/g, '')}</span>)}
                <button type="button" onClick={() => setColloc(new Set())} title="Xóa hết" className="ml-1 text-xs font-extrabold text-[#c39a5c] hover:text-[#a2661a]">✕</button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-extrabold text-[#8a5514]">“{collocText}”</span>
                <SaveWordButton word={collocText} example={exampleFor(cur.answer, collocText)} onSaveWord={onSaveWord} speechVoice={speechVoice} />
              </div>
            </div>
          )}
          <div className="mb-6">
            <button type="button" onClick={() => setShowHint(h => !h)} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: ACCENT }}>
              <Lightbulb size={14} />{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
            </button>
            {showHint && (
              <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-[#eddcb6] bg-[#fdf6e6] px-5 py-4">
                {cur.hint && <p className="mb-2 border-b border-[#eddcb6] pb-2 text-xs font-medium italic text-[#a2661a]">💡 {cur.hint}</p>}
                {hasHidden ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#c08a3a]">Từ thứ {nextHidden + 1} trở đi:</span>
                      <span className="text-[10px] text-[#c39a5c]">số chữ cái mỗi từ</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      {hintWords.map((w, k) => {
                        const core = w.replace(/[^a-zA-Z0-9]/g, '');
                        const tail = w.slice(core.length);
                        return (
                          <div key={k} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#c39a5c]">Từ {nextHidden + k + 1}</span>
                            <div className="flex items-end gap-[3px]">
                              {core.split('').map((_, j) => <span key={j} className="block h-[2px] w-3 rounded-full bg-[#d3a047]" />)}
                              {tail && <span className="ml-0.5 text-sm font-bold leading-none text-[#a2661a]">{tail}</span>}
                            </div>
                            <span className="text-[9px] text-[#c39a5c]">{core.length} chữ</span>
                          </div>
                        );
                      })}
                      {moreHints && <button type="button" onClick={() => setHintN(h => h + 3)} className="mb-3 text-[11px] font-extrabold text-[#c08a3a] underline hover:text-[#a2661a]">+ Xem thêm</button>}
                    </div>
                  </>
                ) : <p className="text-xs font-bold text-[#3a8f1f]">✓ Bạn đã gõ đúng tất cả các từ!</p>}
              </div>
            )}
          </div>
          <div className="relative border-t border-[#eef0e4] pt-5">
            <div className="mb-3.5 text-[11px] font-extrabold tracking-[0.1em] text-[#8a9179]">CÁC CÂU CÒN LẠI</div>
            <div className="flex max-h-[420px] flex-col gap-1.5 overflow-y-auto pb-5">
              {sentences.map((s, i) => {
                if (i === idx) return null;
                const ok = submitted.has(i);
                return (
                  <button key={i} type="button" onClick={() => goTo(i)} className="flex items-start gap-3.5 rounded-[14px] px-4 py-3.5 text-left transition-colors hover:bg-[#f7f8f2]">
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold" style={{ background: ok ? '#7fb84a' : '#eef0e4', color: ok ? '#fff' : '#8a9179' }}>
                      {ok ? <CheckCircle size={13} /> : i + 1}
                    </span>
                    <span className="text-[15px] font-medium leading-[1.5]" style={{ color: ok ? '#3a8f1f' : '#4a5040' }}>{s.vi}</span>
                  </button>
                );
              })}
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-white/0 to-white/95" />
          </div>
          <div className="mt-5 flex flex-col gap-3.5 rounded-2xl bg-[#f7f8f2] px-6 py-5">
            {[['Mở từ gợi ý', ['Ctrl', 'Space']], ['Nộp / Sang câu tiếp', ['Enter']], ['Lưu collocation', ['Ctrl', 'Click']]].map(([l, keys]) => (
              <div key={l} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#5c6650]">{l}</span>
                <div className="flex items-center gap-1.5">
                  {keys.map((k, j) => <React.Fragment key={k}>{j > 0 && <span className="text-[#a8ae9c]">+</span>}<kbd className={kbd}>{k}</kbd></React.Fragment>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* splitter */}
        <div onMouseDown={startDrag} className="hidden cursor-ew-resize select-none items-stretch justify-center self-stretch md:flex">
          <div className="h-full w-[5px] rounded-sm bg-white/40 transition-colors hover:bg-white/70" />
        </div>

        {/* right: answer box */}
        <div className="sticky top-3 z-20 order-1 flex max-h-[58vh] min-w-0 flex-col self-stretch overflow-y-auto overscroll-contain px-[clamp(18px,2.2vw,34px)] pb-5 pt-5 md:top-4 md:order-none md:ml-2 md:max-h-[calc(100vh-2rem)] md:self-start md:pb-7 md:pt-[30px]" style={card}>
          {completed && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[#eaf3e0] px-5 py-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3a6a24]"><CheckCircle size={14} className="shrink-0" />Bạn đã hoàn thành bài này — bấm câu bất kỳ ở bên trái để ôn lại.</div>
              <button type="button" onClick={restart} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-[10px] font-extrabold text-[#5c6650] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:text-[#c0402a]">
                <RotateCcw size={11} />Làm lại từ đầu
              </button>
            </div>
          )}
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <span className="text-xs font-extrabold tracking-[0.08em] text-[#8a9179]">BÀI DỊCH CỦA EM:</span>
            <span className="whitespace-nowrap text-[11px] font-extrabold tabular-nums" style={{ color: correct === totalWords ? '#3a8f1f' : '#8a9179' }}>{correct}/{totalWords} từ đúng</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#eef0e4]">
            <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${pct}%`, background: pct === 100 ? '#7fb84a' : ACCENT }} />
          </div>
          <textarea ref={taRef} value={input} readOnly={isDone} autoCorrect="off" autoCapitalize="off" autoComplete="off" spellCheck={false} enterKeyHint="send"
            onChange={e => { if (!isDone) { setInput(e.target.value); setWrong(false); setErr(''); setShook(new Set()); } }}
            placeholder="Gõ bản dịch của bạn tại đây..."
            className="box-border max-h-[45vh] min-h-[110px] w-full resize-none overflow-y-auto rounded-2xl px-5 py-[18px] text-[17px] text-[#1f2a1c] outline-none transition-colors md:min-h-[160px] md:text-[19px]"
            style={{ fontFamily: fontStack, border: `2px solid ${wrong ? '#e0745a' : isDone ? '#7fb84a' : '#e4e7d6'}`, background: isDone ? '#f7f8f2' : wrong ? '#fdf2f0' : '#fbfcf8', cursor: isDone ? 'default' : 'text' }} />
          {wrong && (
            <div className="mt-4 rounded-xl bg-[#faeae5] px-5 py-3.5 text-[#a5402a]">
              <p className="text-sm font-bold">{err}</p>
              <p className="mt-1 text-xs font-medium text-[#c07059]">Chip đang viền cam bên trái là từ cần sửa · bấm 💡 Xem gợi ý nếu cần.</p>
            </div>
          )}
          {!isDone ? (
            <>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => { setInput(''); setWrong(false); setErr(''); setShook(new Set()); taRef.current?.focus(); }} title="Xoá bản dịch đang gõ (không mất tiến độ bài)"
                  className="rounded-[14px] bg-[#eef0e4] px-6 py-4 text-sm font-bold text-[#4a5636] transition-colors hover:bg-[#e4e7d6]">XOÁ HẾT</button>
                <button type="button" onClick={submit} disabled={!input.trim()} className="flex-1 rounded-[14px] px-6 py-4 text-sm font-extrabold tracking-[0.04em] transition-colors disabled:cursor-default"
                  style={{ background: input.trim() ? ACCENT : '#dfe3d4', color: input.trim() ? '#fff' : '#9aa08c' }}>NỘP (ENTER)</button>
              </div>
              <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#a8ae9c]">
                <span className="font-extrabold text-[#8a9179]">Enter</span> nộp · <span className="font-extrabold text-[#8a9179]">Shift+Enter</span> xuống dòng · <span className="font-extrabold text-[#8a9179]">Ctrl+Space</span> mở từ tiếp theo
              </p>
            </>
          ) : (
            <>
              <div className="mt-4 rounded-2xl bg-[#eaf3e0] px-5 py-4">
                <p className="mb-2 text-sm font-extrabold text-[#3a6a24]">🎉 Chính xác! Câu trả lời hoàn chỉnh:</p>
                <p className="text-[17px] font-semibold leading-relaxed text-[#1f2a1c]">{cur.answer}</p>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => idx > 0 && goTo(idx - 1)} disabled={idx === 0} className="rounded-[14px] bg-[#eef0e4] px-6 py-4 text-sm font-bold text-[#4a5636] transition-colors hover:bg-[#e4e7d6] disabled:opacity-40">← Câu trước</button>
                <button type="button" autoFocus onClick={() => (idx < n - 1 ? goTo(idx + 1) : finish())} className="flex-1 rounded-[14px] bg-[#5f7a35] px-6 py-4 text-sm font-extrabold tracking-[0.04em] text-white transition-colors hover:bg-[#527029]">
                  {idx < n - 1 ? 'CÂU TIẾP THEO (ENTER) →' : 'HOÀN THÀNH BÀI TẬP (ENTER) ✓'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {pop && colloc.size === 0 && createPortal(
        <div ref={popRef} className="fixed z-[9999]" style={{ top: pop.y - 8, ...(pop.right ? { right: pop.x } : { left: pop.x }), transform: 'translateY(-100%)' }}>
          <div className="flex min-w-[200px] flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
            <span className="text-sm font-black text-slate-700">"{norm(tokens[pop.ti] || '')}"</span>
            <SaveWordButton word={norm(tokens[pop.ti] || '')} example={exampleFor(cur.answer, norm(tokens[pop.ti] || ''))} onSaveWord={onSaveWord} speechVoice={speechVoice} />
            <div className="mt-1 w-full border-t border-slate-100 pt-2">
              <p className="text-center text-[10px] leading-snug text-slate-400">💡 <kbd className="rounded bg-slate-100 px-1 font-black text-slate-500">Ctrl/⌘</kbd>+<kbd className="rounded bg-slate-100 px-1 font-black text-slate-500">Click</kbd> nhiều từ để lưu collocation</p>
            </div>
          </div>
        </div>, document.body)}

      {finished && (
        <Modal onClose={onBack} className="max-w-md rounded-[40px]! p-10!">
          <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-herb-500 to-emerald-600" />
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-herb-50 shadow-inner"><Flame className="h-10 w-10 text-herb-600" /></div>
          <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-slate-800">Cực kỳ ấn tượng!</h2>
          <p className="mb-10 font-medium text-slate-500">Bạn vừa hoàn thành xuất sắc bài tập <span className="font-black text-herb-600">{exercise.title}</span>. Tiến độ của bạn đã được lưu lại!</p>
          <div className="mb-10 grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-gray-50 bg-slate-50 p-6"><div className="mb-1 text-4xl font-black text-herb-600">{n}</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng số câu</div></div>
            <div className="rounded-3xl border border-gray-50 bg-slate-50 p-6"><div className="mb-1 text-4xl font-black text-amber-500">{hintsUsed}</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Từ đã mở gợi ý</div></div>
          </div>
          {onNext && <button type="button" onClick={onNext} className="mb-3 block w-full rounded-3xl bg-herb py-5 text-sm font-black uppercase tracking-[2px] text-white shadow-xl hover:bg-herb-600">{nextLabel || 'Bài tiếp theo →'}</button>}
          <button type="button" onClick={onBack} className={`block w-full rounded-3xl py-5 text-sm font-black uppercase tracking-[2px] ${onNext ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-herb text-white shadow-xl hover:bg-herb-600'}`}>Quay lại thư viện</button>
        </Modal>
      )}
      {resume && (
        <Modal onClose={() => answerResume(true)}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 shadow-inner"><CheckCircle className="h-8 w-8 text-emerald-500" /></div>
          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-800">Tiếp tục bài làm?</h2>
          <p className="mb-8 font-medium text-slate-500">Bạn có một bài luyện dịch đang làm dở. Bạn có muốn tiếp tục từ nơi bạn đã dừng lại không?</p>
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => answerResume(true)} className="w-full rounded-2xl bg-herb py-4 font-black text-white hover:bg-herb-600">Tiếp tục bài cũ</button>
            <button type="button" onClick={() => answerResume(false)} className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-500 hover:bg-slate-200">Làm lại từ đầu</button>
          </div>
        </Modal>
      )}
      {askReset && (
        <Modal onClose={() => setAskReset(false)} className="max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 shadow-inner"><RotateCcw className="h-8 w-8 text-red-500" /></div>
          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-800">Làm lại bài này?</h2>
          <p className="mb-8 font-medium text-slate-500">Toàn bộ tiến độ của bài <span className="font-black text-slate-700">{exercise.title}</span> sẽ bị xoá và bạn sẽ bắt đầu lại từ câu đầu tiên. Bạn có chắc không?</p>
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => { restart(); setAskReset(false); }} className="w-full rounded-2xl bg-red-500 py-4 font-black text-white hover:bg-red-600">Xoá và làm lại</button>
            <button type="button" onClick={() => setAskReset(false)} className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-500 hover:bg-slate-200">Huỷ</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
