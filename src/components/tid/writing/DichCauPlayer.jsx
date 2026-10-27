import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  Stethoscope,
  Type,
  Volume2,
} from 'lucide-react';
import { dichCauKey, lsDel, lsGet, lsSet } from './data';
import { Modal } from './ui';
import { SaveWordButton, exampleFor } from './saveWord';
import { ttsService } from '../../../services/ttsService';

const FONTS = [
  { id: 'nunito', label: 'Nunito · như Ngữ pháp', stack: 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif' },
  { id: 'manrope', label: 'Manrope · bản cũ', stack: 'var(--font-manrope), ui-sans-serif, system-ui, sans-serif' },
  { id: 'quicksand', label: 'Quicksand · chữ tròn', stack: 'var(--font-quicksand), ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', label: 'Inter · gọn gàng', stack: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif' },
  { id: 'jakarta', label: 'Plus Jakarta · học thuật', stack: 'var(--font-jakarta), ui-sans-serif, system-ui, sans-serif' },
  { id: 'jetbrains', label: 'JetBrains Mono · đều ô', stack: 'var(--font-jetbrains), ui-monospace, monospace' },
];
const FONT_KEY = 'dich_cau_font';
const tokenize = s => s.split(' ').filter(Boolean);
const norm = s => s.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
const isWord = t => /[a-zA-Z0-9]/.test(t);

// Mask a word, showing the prefix the learner typed correctly (always at least the first letter)
const mask = (word, typed) => {
  let k = 0;
  for (let i = 0; i < word.length; i++) {
    if (i < typed.length && typed[i].toLowerCase() === word[i].toLowerCase()) k = i + 1;
    else break;
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
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, ctx.currentTime + t);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.32);
    });
  } catch {
    /* ignore */
  }
}

export default function DichCauPlayer({
  exercise,
  onBack,
  onNext,
  nextLabel,
  onSaveWord,
  speechVoice = 'US',
  onLookupDictionary,
  onTryInDoctor,
}) {
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
    if (!s || typeof s !== 'object') {
      setReady(true);
      return;
    }
    const curIdx = Math.min(Math.max(Number(s.currentIdx) || 0, 0), Math.max(n - 1, 0));
    const st = {
      currentIdx: curIdx,
      userInput: typeof s.userInput === 'string' ? s.userInput : '',
      revealedMap: toSets(s.revealedMap, n),
      manualRevealedMap: toSets(s.manualRevealedMap, n),
      allRevealedSet: toSet(s.allRevealedSet, n),
      submittedSet: toSet(s.submittedSet, n),
    };
    if (s.completed) {
      setIdx(curIdx);
      setRevealed(st.revealedMap);
      setManual(st.manualRevealedMap);
      setAllShown(st.allRevealedSet);
      setSubmitted(st.submittedSet);
      setCompleted(true);
      setReady(true);
    } else if (curIdx > 0 || st.userInput || st.submittedSet.size || st.allRevealedSet.size || Object.keys(st.revealedMap).length) {
      setResume(st);
    } else {
      setReady(true);
    }
  }, [storeKey, n]);

  // persist progress
  useEffect(() => {
    if (!ready || finished || completed) return;
    if (idx === 0 && !input && !Object.keys(revealed).length && !allShown.size && !submitted.size) return;
    lsSet(storeKey, {
      currentIdx: idx,
      userInput: input,
      revealedMap: fromSets(revealed),
      manualRevealedMap: fromSets(manual),
      allRevealedSet: [...allShown],
      submittedSet: [...submitted],
    });
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
  const collocText = useMemo(
    () =>
      [...colloc]
        .sort((a, b) => a - b)
        .map(i => tokens[i]?.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase())
        .filter(Boolean)
        .join(' '),
    [colloc, tokens]
  );

  const playSentenceAudio = useCallback((text) => {
    if (!text) return;
    try {
      ttsService.speak(text, speechVoice);
    } catch {
      /* ignore */
    }
  }, [speechVoice]);

  const goTo = i => {
    setIdx(i);
    setInput('');
    setWrong(false);
    setErr('');
    setShowHint(false);
    setFlash(new Set());
    setHintN(3);
    setPop(null);
    setColloc(new Set());
    setShook(new Set());
    setHover(null);
    setTimeout(() => taRef.current?.focus(), 60);
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
      setErr(
        bad !== -1 && bad < targets.length
          ? `Từ thứ ${bad + 1} chưa đúng — em gõ “${w[bad]}”, đáp án là “${mask(targets[bad], w[bad])}”.`
          : w.length < targets.length
            ? `Bản dịch còn thiếu ${targets.length - w.length} từ — em mới gõ ${w.length}/${targets.length} từ.`
            : w.length > targets.length
              ? `Bản dịch đang dư ${w.length - targets.length} từ so với đáp án (${targets.length} từ).`
              : 'Chưa đúng — kiểm tra lại bản dịch (gõ đúng từng từ).'
      );
      setWrong(true);
      return;
    }
    setWrong(false);
    setErr('');
    setSubmitted(s => new Set([...s, idx]));
    confetti({
      particleCount: 160,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#F8BE33', '#3ECF8E', '#F2683A', '#1E1B4B'],
    });
    chime();
    playSentenceAudio(cur.answer);
  };

  const finish = () => {
    lsSet(storeKey, {
      currentIdx: n - 1,
      userInput: '',
      revealedMap: fromSets(revealed),
      manualRevealedMap: fromSets(manual),
      allRevealedSet: [...allShown],
      submittedSet: [...submitted],
      completed: true,
    });
    setFinished(true);
  };

  const restart = () => {
    lsDel(storeKey);
    setIdx(0);
    setRevealed({});
    setManual({});
    setAllShown(new Set());
    setInput('');
    setShowHint(false);
    setFlash(new Set());
    setSubmitted(new Set());
    setCompleted(false);
    setFinished(false);
    setHintN(3);
    setReady(true);
    setTimeout(() => taRef.current?.focus(), 60);
  };

  const answerResume = yes => {
    if (yes && resume) {
      setIdx(resume.currentIdx);
      setInput(resume.userInput);
      setRevealed(resume.revealedMap);
      setManual(resume.manualRevealedMap);
      setAllShown(resume.allRevealedSet);
      setSubmitted(resume.submittedSet);
    } else {
      lsDel(storeKey);
    }
    setResume(null);
    setReady(true);
  };

  // auto-submit once the typed translation is exactly right
  useEffect(() => {
    if (isDone || !input.trim() || !matches(input)) return undefined;
    const t = setTimeout(submit, 400);
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
        if (isDone) {
          e.preventDefault();
          if (idx < n - 1) goTo(idx + 1);
          else finish();
        } else if (document.activeElement === taRef.current) {
          e.preventDefault();
          submit();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!isDone) taRef.current?.focus();
  }, [idx, isDone]);

  // close popovers on outside click
  useEffect(() => {
    if (!pop) return undefined;
    const h = e => {
      if (popRef.current && !popRef.current.contains(e.target)) setPop(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pop]);

  useEffect(() => {
    if (!colloc.size) return undefined;
    const h = e => {
      if (collocRef.current && !collocRef.current.contains(e.target) && !e.target.closest('[data-pill]')) {
        setColloc(new Set());
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [colloc]);

  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFs = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch {
      /* ignore */
    }
  };

  const startDrag = useCallback(e => {
    e.preventDefault();
    const el = gridRef.current;
    if (!el) return;
    const move = ev => {
      const r = el.getBoundingClientRect();
      setSplit(Math.max(25, Math.min(75, ((ev.clientX - r.left) / r.width) * 100)));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, []);

  if (!cur) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-5 bg-[var(--we-cream,#FFFDF8)] px-6 text-center text-[#1E1B4B]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] shadow-[0_3px_0_#1E1B4B]">
          <HelpCircle className="h-8 w-8 text-[#F2683A]" />
        </div>
        <p className="text-2xl font-black">Không mở được bài này.</p>
        <p className="max-w-md text-sm font-semibold leading-relaxed text-[#6B6790]">
          Tiến độ đã lưu của bài không khớp với dữ liệu nữa. Bấm “Làm lại từ đầu” để xoá tiến độ cũ và bắt đầu lại nha.
        </p>
        <button
          type="button"
          onClick={restart}
          className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] hover:-translate-y-0.5"
        >
          Làm lại từ đầu
        </button>
        <button type="button" onClick={onBack} className="text-sm font-bold text-[#4F46E5] underline hover:text-[#1E1B4B]">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const nextHidden = wordIdx.findIndex(i => !rev.has(i) && !showAll);
  const hasHidden = nextHidden !== -1;
  const hintWords = hasHidden ? wordIdx.slice(nextHidden, nextHidden + hintN).map(i => tokens[i]) : [];
  const moreHints = hasHidden && nextHidden + hintN < wordIdx.length;
  const hintsUsed = sentences.reduce((a, _, i) => a + (manual[i]?.size ?? 0), 0);

  return (
    <div
      className="min-h-full w-full box-border pb-16 pt-5"
      style={{
        backgroundColor: 'var(--we-cream, #FFFDF8)',
        backgroundImage: 'radial-gradient(rgba(30, 27, 75, 0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        fontFamily: fontStack,
        padding: '20px clamp(16px, 2.5vw, 36px) 48px',
      }}
    >
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white p-3.5 shadow-[0_4px_0_#1E1B4B] sm:p-4">
        {/* Left: Back & Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            title="Quay lại"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#F8BE33]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="we-display text-xl font-black uppercase text-[#1E1B4B] md:text-2xl">
              DỊCH CÂU
            </span>
            <span className="hidden truncate text-xs font-bold text-[#6B6790] md:inline">
              · {exercise.title}
            </span>
          </div>
        </div>

        {/* Center: Dot Progress Bar */}
        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5 lg:flex">
          {sentences.map((_, i) => {
            const isCur = i === idx;
            const isDoneSentence = submitted.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                title={`Câu ${i + 1}`}
                className="h-2.5 rounded-full border-[1.5px] border-[#1E1B4B] transition-all hover:scale-125"
                style={{
                  width: isCur ? 24 : 10,
                  backgroundColor: isCur ? '#F8BE33' : isDoneSentence ? '#3ECF8E' : '#FAF8F5',
                }}
              />
            );
          })}
        </div>

        {/* Right: Controls & Badge */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Font Selector */}
          <label
            title="Đổi phông chữ hiển thị"
            className="hidden cursor-pointer items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-2.5 py-1.5 text-[11px] font-bold text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#F8BE33] sm:flex"
          >
            <Type size={12} strokeWidth={2.5} />
            <select
              value={font}
              onChange={e => {
                setFont(e.target.value);
                lsSet(FONT_KEY, e.target.value);
              }}
              className="cursor-pointer appearance-none bg-transparent font-bold outline-none"
            >
              {FONTS.map(f => (
                <option key={f.id} value={f.id} className="bg-white text-[#1E1B4B]">
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown size={11} strokeWidth={2.5} className="-ml-0.5" />
          </label>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFs}
            title={fs ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
          >
            {fs ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setAskReset(true)}
            title="Làm lại bài này từ đầu"
            className="flex items-center gap-1 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FEE2E2]"
          >
            <RotateCcw size={11} strokeWidth={2.5} />
            Reset
          </button>

          {/* Current Question Badge */}
          <span className="whitespace-nowrap rounded-xl border-[2px] border-[#1E1B4B] bg-[#F8BE33] px-3 py-1.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B]">
            Câu {idx + 1}/{n}
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div
        ref={gridRef}
        className="flex flex-col gap-5 md:grid md:grid-cols-[var(--dc-cols)] md:items-start md:gap-0"
        style={{ '--dc-cols': `${split}fr 6px ${100 - split}fr` }}
      >
        {/* LEFT COLUMN: Prompt, Masked Words, Hints, Remaining List */}
        <div className="order-2 flex min-w-0 flex-col rounded-3xl border-[2.5px] border-[#1E1B4B] bg-white p-5 shadow-[0_5px_0_#1E1B4B] md:order-none md:mr-3 md:p-7">
          {/* Topic Context Box (if available) */}
          {(exercise.topic?.en || exercise.topic?.question) && (
            <div className="mb-5 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] p-4 shadow-[0_2px_0_#1E1B4B]">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F2683A]">
                  ĐỀ BÀI
                </span>
                {exercise.topic?.taskType && (
                  <span className="rounded-full border border-[#1E1B4B] bg-white px-2 py-0.5 text-[10px] font-black text-[#1E1B4B]">
                    {exercise.topic.taskType}
                  </span>
                )}
              </div>
              {exercise.topic?.en && (
                <p className="text-sm font-bold text-[#1E1B4B] leading-relaxed">{exercise.topic.en}</p>
              )}
              {exercise.topic?.question && (
                <p className="mt-1 text-xs italic font-medium text-[#6B6790] leading-relaxed">
                  {exercise.topic.question}
                </p>
              )}
            </div>
          )}

          {/* Prompt Section */}
          <div className="mb-1 flex items-center gap-2">
            <span className="we-sticker !py-0.5 !text-[10px] !bg-[#4F46E5] text-white">
              TIẾNG VIỆT → ENGLISH
            </span>
          </div>

          <div className="mb-5 text-2xl font-black leading-snug text-[#1E1B4B] md:text-3xl">
            {cur.vi}
          </div>

          {/* Word Reveal Header */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6B6790]">
              CÂU MẪU - NHỚ ĐÚNG ĐỂ MỞ TỪ:
            </span>
            {!isDone && (
              <button
                type="button"
                onClick={() =>
                  setAllShown(s => {
                    const x = new Set(s);
                    if (x.has(idx)) x.delete(idx);
                    else x.add(idx);
                    return x;
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1E1B4B] bg-white px-2.5 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B] hover:bg-[#FFF8E7]"
              >
                {showAll ? <EyeOff size={13} strokeWidth={2.5} /> : <Eye size={13} strokeWidth={2.5} />}
                {showAll ? 'Ẩn gợi ý' : 'Hiện tất cả'}
              </button>
            )}
          </div>

          {/* Masked Word Chips */}
          <div className="mb-6 flex flex-wrap gap-2.5">
            {tokens.map((tok, i) => {
              if (!isWord(tok)) {
                return (
                  <span key={i} className="self-center text-lg font-black text-[#1E1B4B]">
                    {tok}
                  </span>
                );
              }
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
              const label = open ? tok : mask(core, typedW) + tail;

              // Brutalist color palette for chips
              let chipStyle = {
                bg: '#FAF8F5',
                border: '#1E1B4B',
                text: '#1E1B4B',
                shadow: '0 2px 0 #1E1B4B',
              };

              if (fl) {
                chipStyle = { bg: '#3ECF8E', border: '#1E1B4B', text: '#1E1B4B', shadow: '0 3px 0 #1E1B4B' };
              } else if (inColloc) {
                chipStyle = { bg: '#F8BE33', border: '#1E1B4B', text: '#1E1B4B', shadow: '0 3px 0 #1E1B4B' };
              } else if (popped) {
                chipStyle = { bg: '#D1FAE5', border: '#1E1B4B', text: '#065F46', shadow: '0 3px 0 #1E1B4B' };
              } else if (open) {
                chipStyle = { bg: '#D1FAE5', border: '#1E1B4B', text: '#065F46', shadow: '0 2px 0 #1E1B4B' };
              } else if (bad) {
                chipStyle = { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', shadow: '0 2px 0 #EF4444' };
              } else if (hov) {
                chipStyle = { bg: '#FFF8E7', border: '#1E1B4B', text: '#1E1B4B', shadow: '0 3px 0 #1E1B4B' };
              }

              return (
                <button
                  key={i}
                  type="button"
                  data-pill="true"
                  onClick={e => {
                    if (!open) {
                      reveal(i);
                      if (window.matchMedia('(hover: hover)').matches) taRef.current?.focus();
                      return;
                    }
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      setPop(null);
                      setColloc(s => {
                        const x = new Set(s);
                        if (x.has(i)) x.delete(i);
                        else x.add(i);
                        return x;
                      });
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
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(h => (h === i ? null : h))}
                  onAnimationEnd={shake ? () => setShook(s => new Set(s).add(i)) : undefined}
                  title={open ? 'Bấm để tra/lưu từ · Ctrl/⌘+Click để chọn collocation' : 'Bấm để mở từ này'}
                  className="box-border flex items-center gap-1.5 rounded-2xl transition-all duration-150"
                  style={{
                    padding: '8px 14px',
                    minWidth: `${core.length + 2}ch`,
                    backgroundColor: chipStyle.bg,
                    border: `2px solid ${chipStyle.border}`,
                    boxShadow: chipStyle.shadow,
                    animation: shake ? 'chipShake 0.35s ease' : hov ? 'chipShake 0.4s ease' : 'none',
                    transform: fl ? 'scale(1.05)' : undefined,
                  }}
                >
                  <Eye size={13} strokeWidth={2.5} style={{ color: chipStyle.text }} />
                  <span
                    className="whitespace-pre text-base font-black tracking-wider"
                    style={{ fontFamily: fontStack, color: chipStyle.text }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Collocation Box (if 2+ words selected) */}
          {colloc.size >= 2 && (
            <div ref={collocRef} className="mb-6 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] p-4 shadow-[0_3px_0_#1E1B4B]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E1B4B]">
                  COLLOCATION ĐÃ CHỌN (Ctrl+Click để thêm/bớt từ)
                </span>
                <button
                  type="button"
                  onClick={() => setColloc(new Set())}
                  className="text-xs font-black text-[#1E1B4B] hover:text-[#EF4444]"
                >
                  ✕ Xóa
                </button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {[...colloc]
                  .sort((a, b) => a - b)
                  .map(i => (
                    <span
                      key={i}
                      className="rounded-xl border-[1.5px] border-[#1E1B4B] bg-white px-2.5 py-1 text-xs font-black text-[#1E1B4B]"
                    >
                      {tokens[i]?.replace(/[^a-zA-Z0-9'-]/g, '')}
                    </span>
                  ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-black text-[#1E1B4B]">“{collocText}”</span>
                <SaveWordButton
                  word={collocText}
                  example={exampleFor(cur.answer, collocText)}
                  onSaveWord={onSaveWord}
                  speechVoice={speechVoice}
                />
                {onLookupDictionary && (
                  <button
                    type="button"
                    onClick={() => onLookupDictionary(collocText)}
                    className="inline-flex items-center gap-1 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-2.5 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#F8BE33]"
                  >
                    <BookOpen size={12} strokeWidth={2.5} /> Tra từ điển
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hint Accordion */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowHint(h => !h)}
              className="inline-flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-3.5 py-1.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#F8BE33]"
            >
              <Lightbulb size={13} strokeWidth={2.5} className="text-[#F59E0B]" />
              {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý số chữ cái'}
            </button>

            {showHint && (
              <div className="mt-3 flex flex-col gap-2 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] p-4 shadow-[0_2px_0_#1E1B4B]">
                {cur.hint && (
                  <p className="mb-2 border-b border-[#1E1B4B]/20 pb-2 text-xs font-bold text-[#1E1B4B]">
                    💡 {cur.hint}
                  </p>
                )}
                {hasHidden ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E1B4B]">
                        Từ thứ {nextHidden + 1} trở đi (số chữ cái mỗi từ):
                      </span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3 pt-1">
                      {hintWords.map((w, k) => {
                        const core = w.replace(/[^a-zA-Z0-9]/g, '');
                        const tail = w.slice(core.length);
                        return (
                          <div key={k} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-black uppercase text-[#6B6790]">
                              Từ {nextHidden + k + 1}
                            </span>
                            <div className="flex items-end gap-[3px]">
                              {core.split('').map((_, j) => (
                                <span
                                  key={j}
                                  className="block h-[3px] w-3 rounded-full border border-[#1E1B4B] bg-[#F8BE33]"
                                />
                              ))}
                              {tail && (
                                <span className="ml-0.5 text-xs font-black text-[#1E1B4B]">{tail}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#1E1B4B]">{core.length} chữ</span>
                          </div>
                        );
                      })}
                      {moreHints && (
                        <button
                          type="button"
                          onClick={() => setHintN(h => h + 3)}
                          className="mb-1 text-xs font-black text-[#4F46E5] underline hover:text-[#1E1B4B]"
                        >
                          + Xem thêm
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-black text-[#10B981]">✓ Bạn đã gõ đúng tất cả các từ!</p>
                )}
              </div>
            )}
          </div>

          {/* Remaining Sentences List */}
          <div className="relative border-t-[2px] border-dashed border-[#1E1B4B]/20 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#6B6790]">
                CÁC CÂU CÒN LẠI ({sentences.filter((_, i) => submitted.has(i)).length}/{n} xong)
              </span>
            </div>
            <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pb-4 pr-1">
              {sentences.map((s, i) => {
                if (i === idx) return null;
                const ok = submitted.has(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`flex items-start gap-3 rounded-2xl border-[2px] border-[#1E1B4B] p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_3px_0_#1E1B4B] ${
                      ok ? 'bg-[#F0FDF4]' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1E1B4B] text-[11px] font-black ${
                        ok ? 'bg-[#3ECF8E] text-[#1E1B4B]' : 'bg-[#FAF8F5] text-[#1E1B4B]'
                      }`}
                    >
                      {ok ? <CheckCircle2 size={12} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold leading-relaxed ${
                        ok ? 'text-[#065F46]' : 'text-[#1E1B4B]'
                      }`}
                    >
                      {s.vi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shortcuts Box */}
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FAF8F5] p-3.5">
            {[
              ['Mở từ gợi ý tiếp theo', ['Ctrl', 'Space']],
              ['Nộp bài / Sang câu tiếp', ['Enter']],
              ['Lưu collocation nhiều từ', ['Ctrl', 'Click']],
            ].map(([label, keys]) => (
              <div key={label} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#6B6790]">{label}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, j) => (
                    <React.Fragment key={k}>
                      {j > 0 && <span className="text-xs font-black text-[#1E1B4B]">+</span>}
                      <kbd className="rounded-lg border-[1.5px] border-[#1E1B4B] bg-white px-2 py-0.5 text-[10px] font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B]">
                        {k}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRAG SPLITTER (Desktop) */}
        <div
          onMouseDown={startDrag}
          className="hidden cursor-ew-resize select-none items-stretch justify-center self-stretch md:flex"
        >
          <div className="h-full w-[6px] rounded-full border border-[#1E1B4B]/30 bg-[#1E1B4B]/20 transition-colors hover:bg-[#F8BE33]" />
        </div>

        {/* RIGHT COLUMN: User Input, Progress, Submit & Next */}
        <div className="sticky top-4 z-20 order-1 flex max-h-[85vh] min-w-0 flex-col self-stretch overflow-y-auto overscroll-contain rounded-3xl border-[2.5px] border-[#1E1B4B] bg-white p-5 shadow-[0_5px_0_#1E1B4B] md:top-4 md:order-none md:ml-3 md:max-h-[calc(100vh-6rem)] md:self-start md:p-7">
          {/* Completed All Banner */}
          {completed && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#D1FAE5] p-3.5 shadow-[0_2px_0_#1E1B4B]">
              <div className="flex items-center gap-2 text-xs font-black text-[#065F46]">
                <CheckCircle size={15} strokeWidth={2.5} />
                Bạn đã hoàn thành bài này — bấm câu bất kỳ ở bên trái để ôn lại.
              </div>
              <button
                type="button"
                onClick={restart}
                className="flex shrink-0 items-center gap-1 rounded-xl border-[1.5px] border-[#1E1B4B] bg-white px-2.5 py-1 text-[10px] font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B] hover:bg-[#FEE2E2]"
              >
                <RotateCcw size={10} strokeWidth={2.5} />
                Làm lại
              </button>
            </div>
          )}

          {/* Accuracy Status Header */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#1E1B4B]">
              BÀI DỊCH CỦA EM:
            </span>
            <span
              className={`rounded-full border-[1.5px] border-[#1E1B4B] px-2.5 py-0.5 text-xs font-black shadow-[0_1px_0_#1E1B4B] ${
                correct === totalWords ? 'bg-[#3ECF8E] text-[#1E1B4B]' : 'bg-[#FFF8E7] text-[#1E1B4B]'
              }`}
            >
              {correct}/{totalWords} từ đúng
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 h-3.5 w-full overflow-hidden rounded-full border-[2px] border-[#1E1B4B] bg-[#FAF8F5]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${pct}%`,
                backgroundColor: pct === 100 ? '#3ECF8E' : '#F8BE33',
              }}
            />
          </div>

          {/* Translation Textarea */}
          <textarea
            ref={taRef}
            value={input}
            readOnly={isDone}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            onChange={e => {
              if (!isDone) {
                setInput(e.target.value);
                setWrong(false);
                setErr('');
                setShook(new Set());
              }
            }}
            placeholder="Gõ bản dịch của bạn tại đây..."
            className="box-border min-h-[130px] w-full resize-none overflow-y-auto rounded-2xl p-4 text-lg font-bold text-[#1E1B4B] outline-none transition-colors shadow-inner md:min-h-[170px] md:text-xl"
            style={{
              fontFamily: fontStack,
              border: `2.5px solid ${wrong ? '#EF4444' : isDone ? '#10B981' : '#1E1B4B'}`,
              backgroundColor: isDone ? '#F0FDF4' : wrong ? '#FEF2F2' : '#FFFDF8',
              cursor: isDone ? 'default' : 'text',
            }}
          />

          {/* Error Message */}
          {wrong && (
            <div className="mt-3 rounded-2xl border-[2px] border-[#EF4444] bg-[#FEE2E2] p-3.5 text-[#991B1B] shadow-[0_2px_0_#EF4444]">
              <p className="text-sm font-black">{err}</p>
              <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                💡 Chip đang viền đỏ bên trái là từ cần sửa · Bấm "Xem gợi ý" nếu cần trợ giúp nha.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isDone ? (
            <>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setWrong(false);
                    setErr('');
                    setShook(new Set());
                    taRef.current?.focus();
                  }}
                  title="Xoá bản dịch đang gõ"
                  className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FAF8F5] px-5 py-3.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
                >
                  XOÁ HẾT
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!input.trim()}
                  className={`flex-1 rounded-2xl border-[2.5px] border-[#1E1B4B] px-6 py-3.5 text-sm font-black uppercase tracking-wider shadow-[0_4px_0_#1E1B4B] transition-all ${
                    input.trim()
                      ? 'bg-[#F8BE33] text-[#1E1B4B] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#1E1B4B]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  NỘP (ENTER)
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] font-bold text-[#6B6790]">
                Nhấn <span className="font-black text-[#1E1B4B]">Enter</span> để nộp · <span className="font-black text-[#1E1B4B]">Ctrl+Space</span> mở từ tiếp theo
              </p>
            </>
          ) : (
            <>
              {/* Success Callout */}
              <div className="mt-4 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#D1FAE5] p-4 shadow-[0_3px_0_#1E1B4B]">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-black text-[#065F46]">
                    🎉 Chính xác! Đáp án chuẩn:
                  </span>
                  <button
                    type="button"
                    onClick={() => playSentenceAudio(cur.answer)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#1E1B4B] bg-white px-2 py-1 text-[11px] font-black text-[#1E1B4B] hover:bg-[#FFF8E7]"
                    title="Nghe lại phát âm chuẩn"
                  >
                    <Volume2 size={13} strokeWidth={2.5} /> Nghe lại
                  </button>
                </div>
                <p className="text-lg font-black leading-relaxed text-[#1E1B4B]">
                  {cur.answer}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => idx > 0 && goTo(idx - 1)}
                  disabled={idx === 0}
                  className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white px-4 py-3.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7] disabled:opacity-40"
                >
                  ← Câu trước
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => (idx < n - 1 ? goTo(idx + 1) : finish())}
                  className="flex-1 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_0_#1E1B4B]"
                >
                  {idx < n - 1 ? 'CÂU TIẾP THEO (ENTER) →' : 'HOÀN THÀNH BÀI TẬP (ENTER) ✓'}
                </button>
              </div>

              {/* Cross-Screen Shortcuts */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#1E1B4B]/15 pt-3">
                {onTryInDoctor && (
                  <button
                    type="button"
                    onClick={() => onTryInDoctor(cur.answer)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-3 py-1.5 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#F8BE33]"
                  >
                    <Stethoscope size={13} strokeWidth={2.5} className="text-[#4F46E5]" />
                    Phân tích với Bác sĩ ngữ pháp
                  </button>
                )}
                {onLookupDictionary && (
                  <button
                    type="button"
                    onClick={() => onLookupDictionary(norm(targets[0] || ''))}
                    className="inline-flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-3 py-1.5 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
                  >
                    <BookOpen size={13} strokeWidth={2.5} className="text-[#F2683A]" />
                    Mở Từ điển
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popover for word click */}
      {pop && colloc.size === 0 && createPortal(
        <div
          ref={popRef}
          className="fixed z-[9999]"
          style={{
            top: pop.y - 10,
            ...(pop.right ? { right: pop.x } : { left: pop.x }),
            transform: 'translateY(-100%)',
          }}
        >
          <div className="flex min-w-[220px] flex-col items-center gap-2 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white p-3.5 shadow-[0_6px_0_#1E1B4B]">
            <span className="text-base font-black text-[#1E1B4B]">
              "{norm(tokens[pop.ti] || '')}"
            </span>
            <div className="flex items-center gap-2">
              <SaveWordButton
                word={norm(tokens[pop.ti] || '')}
                example={exampleFor(cur.answer, norm(tokens[pop.ti] || ''))}
                onSaveWord={onSaveWord}
                speechVoice={speechVoice}
              />
              {onLookupDictionary && (
                <button
                  type="button"
                  onClick={() => {
                    onLookupDictionary(norm(tokens[pop.ti] || ''));
                    setPop(null);
                  }}
                  className="rounded-xl border-[1.5px] border-[#1E1B4B] bg-[#FFF8E7] px-2.5 py-1 text-xs font-black text-[#1E1B4B] hover:bg-[#F8BE33]"
                >
                  Tra từ
                </button>
              )}
            </div>
            <div className="mt-1 w-full border-t border-[#1E1B4B]/10 pt-2">
              <p className="text-center text-[10px] font-bold text-[#6B6790]">
                💡 Giữ <kbd className="rounded bg-slate-100 px-1 font-black text-[#1E1B4B]">Ctrl/⌘</kbd> + click nhiều từ để chọn cụm collocation
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Finished Celebration Modal */}
      {finished && (
        <Modal onClose={onBack} className="max-w-md !p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] shadow-[0_4px_0_#1E1B4B]">
            <Flame className="h-10 w-10 text-[#1E1B4B]" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-3xl font-black uppercase tracking-tight text-[#1E1B4B]">
            CỰC KỲ XUẤT SẮC!
          </h2>
          <p className="mb-6 font-semibold leading-relaxed text-[#6B6790]">
            Bạn vừa hoàn thành trọn vẹn bài tập{' '}
            <span className="font-black text-[#1E1B4B]">{exercise.title}</span>. Tiến độ đã được lưu lại!
          </p>
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] p-4 shadow-[0_3px_0_#1E1B4B]">
              <div className="text-3xl font-black text-[#1E1B4B]">{n}</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#6B6790]">
                Tổng số câu
              </div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] p-4 shadow-[0_3px_0_#1E1B4B]">
              <div className="text-3xl font-black text-[#F2683A]">{hintsUsed}</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#6B6790]">
                Từ đã mở gợi ý
              </div>
            </div>
          </div>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="mb-3 block w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] py-4 text-sm font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] hover:-translate-y-0.5"
            >
              {nextLabel || 'Bài tiếp theo →'}
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className={`block w-full rounded-2xl border-[2.5px] border-[#1E1B4B] py-3.5 text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#1E1B4B] hover:-translate-y-0.5 ${
              onNext ? 'bg-white text-[#1E1B4B]' : 'bg-[#F8BE33] text-[#1E1B4B]'
            }`}
          >
            Quay lại thư viện
          </button>
        </Modal>
      )}

      {/* Resume Modal */}
      {resume && (
        <Modal onClose={() => answerResume(true)}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#D1FAE5] shadow-[0_3px_0_#1E1B4B]">
            <CheckCircle className="h-8 w-8 text-[#065F46]" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1E1B4B]">Tiếp tục bài làm?</h2>
          <p className="mb-6 font-semibold leading-relaxed text-[#6B6790]">
            Bạn có bài luyện dịch đang làm dở. Bạn có muốn tiếp tục từ câu {resume.currentIdx + 1} không?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => answerResume(true)}
              className="w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] py-3.5 font-black text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] hover:-translate-y-0.5"
            >
              Tiếp tục bài cũ
            </button>
            <button
              type="button"
              onClick={() => answerResume(false)}
              className="w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white py-3.5 font-bold text-[#6B6790] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]"
            >
              Làm lại từ đầu
            </button>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {askReset && (
        <Modal onClose={() => setAskReset(false)} className="max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FEE2E2] shadow-[0_3px_0_#1E1B4B]">
            <RotateCcw className="h-8 w-8 text-[#EF4444]" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1E1B4B]">Làm lại bài này?</h2>
          <p className="mb-6 font-semibold leading-relaxed text-[#6B6790]">
            Toàn bộ tiến độ của bài <span className="font-black text-[#1E1B4B]">{exercise.title}</span> sẽ bị xoá và bắt đầu lại từ câu 1. Bạn có chắc không?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                restart();
                setAskReset(false);
              }}
              className="w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#EF4444] py-3.5 font-black text-white shadow-[0_3px_0_#1E1B4B] hover:-translate-y-0.5"
            >
              Xoá và làm lại
            </button>
            <button
              type="button"
              onClick={() => setAskReset(false)}
              className="w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white py-3.5 font-bold text-[#6B6790] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]"
            >
              Huỷ
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
