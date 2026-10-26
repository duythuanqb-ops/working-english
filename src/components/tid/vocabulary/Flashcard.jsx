// /practice/flashcard — the study player: 8 modes (Lật thẻ, Quiz, Listening, Điền vào chỗ trống, Tidians, Card Blast,
// Gõ từ, Tổng hợp), the "Tuỳ chỉnh" rail and the "Chế độ học" picker. Reviews are scheduled locally (store.js).
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight, AudioLines, BookmarkPlus, Brain, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig,
  CircleHelp, ChartColumn, ClipboardCheck, Headphones, Keyboard, Layers, Lightbulb, Maximize2, Mic, Minimize2,
  MousePointerClick, PartyPopper, Quote, RotateCcw, Shapes, Shuffle, SlidersHorizontal, Tag, Target,
  TextCursorInput, Volume2,
} from 'lucide-react';
import { ttsService } from '../../../services/ttsService';
import { toNotebookWord } from './SaveWordPopup';
import { blankSentence, gloss, posLabel, shuffle } from './decks';
import { getSetting, logActivity, markSetStudied, previewInterval, rateWord, setSetting } from './store';
import {
  ACCENT, CHIP, Choices, Feedback, HelpModal, LINK, LetterCells, MUTE, PrimaryBtn, RATINGS, Sparkle, THEMES, WatchingSun,
  WavyBadge, letters, themeVars,
} from './fcParts';
import Blast from './Blast';
import Tidians from './Tidians';

export const MODES = {
  flashcard: { label: 'Lật thẻ', desc: 'Tự nhớ nghĩa rồi lật thẻ, chấm mức độ nhớ.', color: '#5b6ee0', Icon: Layers },
  quiz: { label: 'Quiz', desc: 'Trắc nghiệm nhanh, chọn 1 trong 4 đáp án (phím 1–4).', color: '#e8912d', Icon: ClipboardCheck },
  listening: { label: 'Listening', desc: 'Nghe phát âm rồi gõ lại từ.', color: '#2c8a6e', Icon: Headphones },
  fill_blank: { label: 'Điền vào chỗ trống', desc: 'Chọn từ phù hợp để điền vào câu ví dụ.', color: '#d45b4a', Icon: TextCursorInput },
  sentence_build: { label: 'Tidians', desc: 'Đặt một câu có dùng từ này, gõ hoặc bấm mic để nói.', color: '#8f5bd0', Icon: Mic },
  blast: { label: 'Card Blast', desc: 'Chữ rơi xuống — gõ đáp án để bắn hạ.', color: '#3f86e0', Icon: Target },
  type: { label: 'Gõ từ', desc: 'Đọc nghĩa tiếng Việt, gõ lại từ tiếng Anh.', color: '#1f9bb0', Icon: Keyboard },
  mixed: { label: 'Tổng hợp', desc: 'Mỗi thẻ một chế độ khác nhau.', color: '#d4549c', Icon: Shapes },
};
const MODE_ORDER = ['flashcard', 'quiz', 'listening', 'fill_blank', 'sentence_build', 'blast', 'type', 'mixed'];
const MIX = ['flashcard', 'quiz', 'listening', 'fill_blank', 'type'];
const RATE_ICON = { forgot: CircleHelp, hard: Brain, good: Lightbulb, easy: CircleCheckBig };
const RATE_BG = { forgot: '#a8482a', hard: '#8a6410', good: '#46591f', easy: '#2e607f' };

const fontFor = (text, max, pad) => {
  const ws = String(text).trim().split(/\s+/);
  const a = Math.max(4, ...ws.map(x => x.length));
  const i = ws.length > 1 ? Math.max(a, Math.ceil(text.length / 2) + 1) : a;
  return `min(${max}px, calc((100cqi - ${pad}px) / ${(0.62 * i).toFixed(2)}))`;
};

function RailBtn({ on, onClick, label, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title || label} aria-label={title || label}
      className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[18px] px-[14px] py-2.5 text-left transition-[scale,background-color,color] duration-150 hover:scale-[1.05]"
      style={{ background: on ? 'var(--fc-rail-on, #fff)' : on === false ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.16)', color: on ? 'var(--fc-rail-on-ink, #f0613d)' : '#fff' }}>
      <span className="flex w-7 shrink-0 items-center justify-center">{children}</span>
      <span className="min-w-0 truncate text-[14.5px] font-extrabold leading-[1.15]">{label}</span>
    </button>
  );
}

function DoneCard({ total, known, review, onReviewUnknown, onRestart, onChangeMode, onExit }) {
  const pct = total ? Math.round((known / total) * 100) : 0;
  const all = known === total && total > 0;
  const p = 2 * Math.PI * 24;
  return (
    <div className="td-pop absolute inset-0 z-50 flex flex-col overflow-y-auto rounded-[26px] bg-white px-5 py-5 text-center text-[#1b1d22] shadow-[0_26px_40px_-22px_rgba(27,29,34,.45)]">
      <div className="m-auto flex w-full flex-col items-center">
        <WavyBadge size={60} fill="#20b486" className="mb-2.5"><PartyPopper size={26} strokeWidth={2.2} className="text-white" /></WavyBadge>
        <h2 className="mb-1.5 text-[26px] font-bold leading-tight tracking-[-0.03em] md:text-[30px]">{all ? `Bạn đã nhớ toàn bộ ${total} từ! 🎉` : 'Hoàn thành!'}</h2>
        <p className="mb-4 text-[15px] font-semibold text-[#6b7080]">Thống kê phiên học của bạn</p>
        <div className="mb-5 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-2 flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="#f1f3f7" strokeWidth="6" />
                <circle cx="30" cy="30" r="24" fill="none" stroke="#ffc02e" strokeWidth="6" strokeDasharray={p} strokeDashoffset={p * (1 - pct / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-[14px] font-bold">{pct}%</span>
            </div>
            <span className="text-[12px] font-bold text-[#6b7080]">Độ chính xác</span>
          </div>
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#5D6B2D]" /><span className="text-[14px] font-bold">{known} Đã nhớ</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#C2693B]" /><span className="text-[14px] font-bold">{review} Cần ôn lại</span></div>
          </div>
        </div>
        <div className="flex w-full max-w-[280px] flex-col gap-2">
          {!all && review > 0 && <button type="button" onClick={onReviewUnknown} className="w-full rounded-[16px] bg-[var(--d-accent)] px-4 py-3 text-[15px] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,.18)] transition-transform hover:-translate-y-[2px]">Ôn những từ chưa nhớ</button>}
          <button type="button" onClick={onRestart} className="w-full rounded-[16px] border border-[#e4e7ed] bg-white px-4 py-3 text-[15px] font-bold text-[#1b1d22] transition-colors hover:bg-[#f1f3f7]">Học lại từ đầu</button>
          <button type="button" onClick={onChangeMode} className="w-full rounded-[16px] px-4 py-2.5 text-[15px] font-bold text-[#1b1d22] transition-colors hover:bg-[#f1f3f7]">Đổi chế độ luyện tập</button>
          <button type="button" onClick={onExit} className="w-full rounded-[16px] px-4 py-2.5 text-[15px] font-bold text-[#6b7080] transition-colors hover:bg-[#f1f3f7]">Hoàn tất</button>
        </div>
      </div>
    </div>
  );
}

function Relations({ w, speak }) {
  const rows = [['ĐỒNG NGHĨA', w.syn], ['TRÁI NGHĨA', w.ant], ['WORD FORM', w.forms]].filter(r => r[1]?.length);
  if (!rows.length) return null;
  return (
    <div className="mt-1 flex flex-col gap-2">
      {rows.map(([label, list]) => (
        <div key={label} className="flex flex-wrap items-baseline gap-1.5 @min-[440px]:flex-nowrap @min-[440px]:gap-2.5">
          <span className="mr-1 shrink-0 text-[11.5px] font-extrabold tracking-[.1em] @min-[440px]:mr-0 @min-[440px]:w-[96px]" style={{ color: MUTE }}>{label}</span>
          <div className="contents @min-[440px]:flex @min-[440px]:min-w-0 @min-[440px]:flex-wrap @min-[440px]:gap-1.5">
            {list.map(x => {
              const word = typeof x === 'string' ? x : x.word;
              return (
                <button key={word} type="button" onClick={e => { e.stopPropagation(); speak(word); }} title={`Nghe “${word}”`}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[14px] font-bold leading-[1.35] transition-[filter] hover:brightness-95" style={{ background: CHIP, color: '#1b1d22' }}>
                  {word}{x.pos && <span className="ml-1 text-[11.5px] font-extrabold" style={{ color: LINK }}>{x.pos}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Flashcard({ session, initialMode = 'flashcard', onPickSet, onExit, onSaveWord, speechVoice }) {
  const [mode, setMode] = useState(initialMode);
  const [order, setOrder] = useState(() => session.words.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [tally, setTally] = useState({ known: new Set(), review: new Set(), unknown: new Set() });
  const [prefs, setPrefs] = useState(() => getSetting('fc_prefs', { voice: speechVoice === 'US' ? 'US' : 'UK', front: 'en', ipa: true, example: true, rel: true, auto: false, theme: 0 }));
  const [tip, setTip] = useState(() => !getSetting('fc_tip_closed', false));
  const [help, setHelp] = useState(false);
  const [palette, setPalette] = useState(false);
  const [full, setFull] = useState(false);
  const [saved, setSaved] = useState({});
  // per-card answer state
  const [picked, setPicked] = useState([]);
  const [solved, setSolved] = useState(false);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [wrongs, setWrongs] = useState(0);
  const [hint, setHint] = useState(false);
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const outerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  // like the site, scale the whole player down instead of collapsing to the mobile layout
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return undefined;
    const fit = () => setZoom(full ? 1 : Math.max(0.6, Math.min(1, el.clientWidth / 1080)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);

  const words = session.words;
  const total = order.length;
  const w = words[order[pos]] || words[0];
  const sub = mode === 'mixed' ? MIX[(order[pos] * 7 + 3) % MIX.length] : mode;
  const theme = THEMES[prefs.theme] || THEMES[0];
  const setPref = (k, v) => setPrefs(p => { const n = { ...p, [k]: v }; setSetting('fc_prefs', n); return n; });
  const speak = useCallback(text => ttsService.speak(text, { voiceType: prefs.voice }), [prefs.voice]);

  useEffect(() => { setOrder(session.words.map((_, i) => i)); setPos(0); setDone(false); setFlipped(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); }, [session]);
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const resetCard = () => { setFlipped(false); setPicked([]); setSolved(false); setTyped(''); setChecked(false); setWrongs(0); setHint(false); };
  useEffect(resetCard, [pos, mode, order]);
  // auto pronounce (and always in Listening)
  useEffect(() => {
    if (done || mode === 'blast' || mode === 'sentence_build' || !w) return;
    if (sub === 'listening' || prefs.auto) { const t = setTimeout(() => speak(w.w), 250); return () => clearTimeout(t); }
  }, [pos, sub, done, mode, w, prefs.auto, speak]);

  const next = useCallback(() => {
    if (pos + 1 >= total) { setDone(true); markSetStudied(session.key, session.title, session.sel); }
    else setPos(p => p + 1);
  }, [pos, total, session]);
  const prev = () => setPos(p => Math.max(0, p - 1));

  const record = useCallback((rating, idx = order[pos]) => {
    const word = words[idx];
    rateWord(word.w, rating, word.deckId);
    setTally(t => {
      const n = { known: new Set(t.known), review: new Set(t.review), unknown: new Set(t.unknown) };
      [n.known, n.review, n.unknown].forEach(s => s.delete(idx));
      (rating === 'forgot' ? n.unknown : rating === 'hard' ? n.review : n.known).add(idx);
      return n;
    });
  }, [order, pos, words]);
  const rate = rating => { record(rating); next(); };

  // ----- quiz / fill-in options -----
  const options = useMemo(() => {
    if (!w || (sub !== 'quiz' && sub !== 'fill_blank')) return [];
    const viFront = prefs.front === 'vi';
    const answer = sub === 'quiz' ? (viFront ? w.w : gloss(w)) : w.w;
    const pool = [...new Set(words.filter(x => x !== w).map(x => (sub === 'quiz' && !viFront ? gloss(x) : x.w)).filter(x => x && x !== answer))];
    const picks = shuffle(pool, order[pos] * 31 + 7).slice(0, 3);
    return shuffle([answer, ...picks], order[pos] * 17 + 1).map(text => ({ text, right: text === answer }));
  }, [w, sub, words, order, pos, prefs.front]);
  const blank = useMemo(() => (w ? blankSentence(w.ex, w.w) : null), [w]);

  const choose = i => {
    const c = options[i];
    if (!c || solved) return;
    if (c.right) {
      setSolved(true);
      record(picked.length ? 'forgot' : 'good');
      setFlipped(true);
      if (!picked.length) setTimeout(() => next(), 1100);
    } else if (!picked.includes(c.text)) setPicked(p => [...p, c.text]);
  };
  const reveal = () => { if (!solved) { setSolved(true); record('forgot'); setFlipped(true); } };

  // ----- listening / type -----
  const check = () => {
    if (checked) return next();
    if (!typed) return;
    if (letters(typed) !== letters(w.w)) { setWrongs(n => n + 1); return; }
    setChecked(true); setFlipped(true);
    record(wrongs || hint ? 'forgot' : 'good');
  };
  const giveUp = () => { setChecked(true); setFlipped(true); record('forgot'); };

  // ----- keyboard -----
  useEffect(() => {
    if (done || mode === 'blast' || mode === 'sentence_build') return;
    const onKey = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (sub === 'flashcard') {
        if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
        else if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
        else if (['1', '2', '3', '4'].includes(e.key)) rate(RATINGS[+e.key - 1].rating);
      } else if (sub === 'quiz' || sub === 'fill_blank') {
        if (['1', '2', '3', '4'].includes(e.key)) choose(+e.key - 1);
        else if (e.key === 'Enter' && solved) next();
        else if (e.key === 'ArrowRight' && solved) next();
      } else if (e.key.length === 1 && /[a-z'-]/i.test(e.key) && !checked) {
        inputRef.current?.focus();
      } else if (e.key === 'Enter' && checked) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const toggleFull = () => {
    const el = rootRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.().then(() => setFull(true)).catch(() => setFull(f => !f));
    else document.exitFullscreen?.().finally(() => setFull(false));
  };
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f); }, []);

  const startMode = m => { setMode(m); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); logActivity(0); };
  const reviewUnknown = () => {
    const ids = [...tally.unknown, ...tally.review];
    if (!ids.length) return;
    setOrder(ids); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() });
  };
  const restart = () => { setOrder(words.map((_, i) => i)); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); };
  const doShuffle = () => { setOrder(shuffle(words.map((_, i) => i))); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); };
  const saveWord = () => {
    if (!onSaveWord || saved[w.w]) return;
    onSaveWord(toNotebookWord({ word: w.w, ipa: w.ipa, pos: w.pos, meaningVi: w.vi, meaningEn: w.en, example: w.ex, exampleVi: w.exVi, synonyms: w.syn, antonyms: w.ant, tags: ['IELTS', w.deck].filter(Boolean), context: 'IELTS Dictionary · Flashcard' }));
    setSaved(s => ({ ...s, [w.w]: true }));
  };

  const remaining = Math.max(0, total - tally.known.size);
  const M = MODES[mode === 'mixed' ? sub : mode];
  const title = `${M.label}.`;
  const desc = mode === 'mixed' ? `Tổng hợp · ${M.desc}` : M.desc;
  const deckLabel = `${session.title} (${words.length})`;
  const progress = `${Math.max(1, Math.round(((pos + 1) / Math.max(1, total)) * 100))}%`;
  const viFront = prefs.front === 'vi';
  const tags = (
    <div className="pointer-events-none absolute bottom-[22px] left-[50px] right-[26px] z-[1] flex flex-wrap items-center gap-2">
      <span className="flex h-7 max-w-full items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold" style={{ background: ACCENT.bg, color: ACCENT.ink }}><Layers size={13} strokeWidth={2.4} className="shrink-0" /><span className="truncate">{w?.deck}</span></span>
      {w?.pos && <span className="flex h-7 items-center gap-1.5 rounded-full bg-[rgba(128,128,140,.12)] px-3 text-[12px] font-bold text-[#7a7f8c]"><Tag size={12} />{posLabel(w.pos)}</span>}
    </div>
  );
  const faceBase = 'absolute inset-0 rounded-[0_28px_28px_0] flex flex-col shadow-[0_26px_40px_-22px_rgba(27,29,34,.45)] @container';
  const faceStyle = { background: ACCENT.face, color: ACCENT.faceInk, backfaceVisibility: 'hidden' };
  const SpeakBtn = ({ size = 42 }) => (
    <button type="button" onClick={e => { e.stopPropagation(); speak(w.w); }} aria-label="Phát âm" title="Phát âm"
      className="flex cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-[1.08]" style={{ width: size, height: size, background: CHIP, color: '#1b1d22' }}><Volume2 size={18} /></button>
  );
  const Eyebrow = ({ children, right }) => (
    <div className="relative flex items-center justify-between gap-2.5">
      <span className="text-[14.5px] font-extrabold tracking-[.14em]" style={{ color: MUTE }}>{children}</span>
      <div className="flex shrink-0 gap-2">{right}</div>
    </div>
  );
  const typing = sub === 'listening' || sub === 'type';

  // ---------- front face ----------
  let front;
  if (!w) front = null;
  else if (sub === 'flashcard' || sub === 'quiz') {
    const showVi = sub === 'flashcard' ? viFront : viFront;
    front = (
      <>
        <Eyebrow right={!showVi && <SpeakBtn />}>{showVi ? 'NGHĨA TIẾNG VIỆT' : 'TIẾNG ANH'}</Eyebrow>
        {showVi
          ? <span className="relative font-bold leading-[1.22] tracking-[-0.01em] [text-wrap:pretty]" style={{ fontSize: gloss(w).length > 60 ? 24 : gloss(w).length > 30 ? 32 : 'clamp(32px, 9cqi, 58px)' }}>{gloss(w)}</span>
          : <>
            <span className="relative break-words font-bold leading-[1.22] tracking-[-0.01em] [text-wrap:pretty]" style={{ fontSize: fontFor(w.w, 96, 90) }}>{w.w}</span>
            {prefs.ipa && w.ipa && <span className="relative break-words font-semibold" style={{ fontSize: 'min(30px, 7cqi)', color: MUTE }}>/{w.ipa}/</span>}
          </>}
        {sub === 'flashcard' && <span className="relative mt-2 flex items-center gap-2 text-[16px] font-bold" style={{ color: MUTE }}><MousePointerClick size={18} className="shrink-0" />Bấm thẻ hoặc Space để lật</span>}
        {tags}
      </>
    );
  } else if (sub === 'fill_blank') {
    front = (
      <>
        <Eyebrow>ĐIỀN VÀO CHỖ TRỐNG</Eyebrow>
        {blank
          ? <span className="relative font-bold leading-[1.35] [text-wrap:pretty]" style={{ fontSize: 'clamp(22px, 5.4cqi, 40px)' }}>{blank.before}<span className="mx-1 inline-block min-w-[3.2em] border-b-[3px]" style={{ borderColor: ACCENT.bg }}>{solved ? <span style={{ color: '#20a86f' }}>{blank.removed}</span> : ' '}</span>{blank.after}</span>
          : <span className="relative font-bold leading-[1.35]" style={{ fontSize: 'clamp(22px, 5.4cqi, 40px)' }}>Từ nào có nghĩa là “{gloss(w)}”?</span>}
        <span className="relative mt-2 flex items-center gap-2 text-[16px] font-bold" style={{ color: MUTE }}><Lightbulb size={18} className="shrink-0" />Nghĩa: {gloss(w)}</span>
        {tags}
      </>
    );
  } else if (typing) {
    front = (
      <>
        <Eyebrow right={sub === 'listening' && <SpeakBtn />}>{sub === 'listening' ? 'NGHE VÀ GÕ LẠI' : 'NGHĨA TIẾNG VIỆT'}</Eyebrow>
        {sub === 'listening'
          ? <>
            <button type="button" onClick={e => { e.stopPropagation(); speak(w.w); }} aria-label="Nghe lại" title="Nghe lại" className="relative cursor-pointer self-start transition-transform hover:scale-105">
              <WavyBadge size={76} fill="#2c8a6e"><Headphones size={32} className="text-white" /></WavyBadge>
            </button>
            <span className="relative text-[24px] font-bold">Bấm để nghe lại</span>
          </>
          : <span className="relative break-words font-bold leading-[1.22] tracking-[-0.01em] [text-wrap:pretty]" style={{ fontSize: gloss(w).length > 60 ? 24 : gloss(w).length > 30 ? 32 : 'clamp(32px, 9cqi, 58px)' }}>{gloss(w)}</span>}
        <LetterCells word={w.w} typed={typed} checked={checked} wrong={wrongs > 0 && !checked} hint={hint} inputRef={inputRef}
          onChange={v => { setTyped(v); }} onEnter={check} />
      </>
    );
  }

  // ---------- back face ----------
  const back = w && (
    <div className="relative my-auto flex flex-col gap-3">
      <Eyebrow right={<>
        {onSaveWord && <button type="button" onClick={e => { e.stopPropagation(); saveWord(); }} title="Lưu vào sổ từ vựng của app"
          className="flex h-10 cursor-pointer items-center gap-1.5 rounded-[12px] px-3.5 text-[13.5px] font-extrabold transition-[filter] hover:brightness-95" style={{ background: CHIP, color: '#1b1d22' }}>
          {saved[w.w] ? <Check size={16} /> : <BookmarkPlus size={16} />}{saved[w.w] ? 'Đã lưu' : 'Lưu'}
        </button>}
        <SpeakBtn size={40} />
      </>}>{sub === 'flashcard' ? (viFront ? 'TIẾNG ANH' : 'NGHĨA TIẾNG VIỆT') : 'TIẾNG ANH'}</Eyebrow>
      {sub === 'flashcard' && !viFront
        ? <span className="font-bold leading-[1.2] tracking-[-0.005em] [text-wrap:pretty]" style={{ fontSize: 'clamp(30px, 8cqi, 52px)' }}>{gloss(w)}</span>
        : <>
          <span className="break-words font-bold leading-[1.15] tracking-[-0.01em] [text-wrap:pretty]" style={{ fontSize: fontFor(w.w, 76, 90) }}>{w.w}</span>
          <span className="text-[22px] font-bold leading-snug" style={{ color: ACCENT.exInk }}>{[prefs.ipa && w.ipa && `/${w.ipa}/`, gloss(w)].filter(Boolean).join(' · ')}</span>
        </>}
      {w.en && <p className="m-0 text-[15px] font-semibold leading-[1.45]" style={{ color: MUTE }}>{w.en}</p>}
      {prefs.example && w.ex && (
        <div className="mt-1 flex gap-2.5">
          <span className="w-1 shrink-0 rounded-sm" style={{ background: ACCENT.bg }} />
          <div className="min-w-0">
            {sub === 'flashcard' && <div className="mb-1.5 text-[12px] font-extrabold tracking-[.1em]" style={{ color: MUTE }}>VÍ DỤ</div>}
            <p className="m-0 mb-1.5 text-[18px] font-semibold italic leading-[1.45] [text-wrap:pretty]" style={{ color: ACCENT.exInk }}>“{w.ex}”</p>
            {w.exVi && <p className="m-0 text-[15px] leading-[1.45]" style={{ color: MUTE }}>{w.exVi}</p>}
          </div>
        </div>
      )}
      {prefs.rel && <Relations w={w} speak={speak} />}
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-bold" style={{ color: MUTE }}>{w.unit ? `${w.deck} · ${w.unit}` : ''}</span>
        <span className="shrink-0 text-xs font-bold" style={{ color: MUTE }}>↺ Chạm để lật lại</span>
      </div>
    </div>
  );

  const canFlip = sub === 'flashcard' || solved || checked;
  const stage = mode === 'blast'
    ? <Blast words={words} full={full} onToggleFull={toggleFull} onExit={() => startMode('flashcard')} speak={speak} />
    : mode === 'sentence_build'
      ? <Tidians words={words} order={order} deckLabel={deckLabel} speak={speak} onBack={() => startMode('flashcard')} />
      : (
        <section className="td-pop @container relative flex flex-col overflow-hidden rounded-[26px] transition-colors duration-300 @min-[700px]:min-h-[500px] @min-[700px]:rounded-[30px]" style={{ background: ACCENT.bg, color: ACCENT.ink }}>
          <span aria-hidden className="pointer-events-none absolute -right-[90px] -top-[90px] h-[300px] w-[300px] rounded-full bg-white/[.14]" />
          <span aria-hidden className="pointer-events-none absolute bottom-[6%] right-[4%] h-[110px] w-[150px] @max-[699px]:hidden" style={{ background: 'radial-gradient(rgba(255,255,255,.6) 2.2px,transparent 2.6px) 0 0/16px 16px' }} />
          <Sparkle size={30} className="right-[32%] top-[7%] @max-[699px]:hidden" />
          <Sparkle size={11} fill delay={450} className="right-[28%] top-[13%] @max-[699px]:hidden" />
          <Sparkle size={22} delay={900} className="bottom-[9%] left-[47%] z-[3] @max-[699px]:hidden" />
          <span aria-hidden className="td-bob pointer-events-none absolute left-[2%] top-[10px] z-[3] drop-shadow-[0_8px_10px_rgba(107,74,0,.28)]"><WatchingSun size={62} /></span>
          <span aria-hidden className="pointer-events-none absolute left-[30%] top-[46px] z-[3] h-[26px] w-[96px] -rotate-[5deg] border-x-[3px] border-dashed border-black/[.08] bg-white/75 @max-[699px]:hidden" />
          <div className="relative grid flex-1 grid-cols-1 @min-[700px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* left: the card */}
            <div className="relative min-h-[420px]">
              <span aria-hidden className="pointer-events-none absolute bottom-[64px] left-[-30px] right-[34px] top-[34px] -rotate-3 rounded-[0_26px_26px_0] bg-white/45 @max-[699px]:hidden" />
              <span aria-hidden className="pointer-events-none absolute bottom-[48px] left-[-30px] right-[20px] top-[50px] rotate-2 rounded-[0_26px_26px_0] bg-white/70 @max-[699px]:hidden" />
              {done ? (
                <div className="absolute bottom-[32px] left-[-20px] right-[26px] top-[48px]">
                  <DoneCard total={total} known={tally.known.size} review={tally.unknown.size + tally.review.size} onReviewUnknown={reviewUnknown} onRestart={restart}
                    onChangeMode={() => document.getElementById('vc-modes')?.scrollIntoView({ behavior: 'smooth' })} onExit={onExit} />
                </div>
              ) : (
                <div className={`absolute bottom-3 left-[-20px] right-[26px] top-4 touch-pan-y @min-[700px]:bottom-[40px] @min-[700px]:top-[60px] ${canFlip ? 'cursor-pointer' : ''}`} style={{ perspective: 1600 }}
                  onClick={() => canFlip && setFlipped(f => !f)}>
                  <div className="absolute inset-0 transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(.3,1.3,.5,1)]" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${flipped ? 180 : 0}deg)` }}>
                    <div className={`${faceBase} justify-center gap-[10px] pl-[50px] pr-[30px] pt-[28px] ${typing ? 'overflow-y-auto pb-[28px]' : 'overflow-hidden pb-[72px]'}`} style={{ ...faceStyle, pointerEvents: flipped ? 'none' : 'auto', visibility: flipped ? 'hidden' : 'visible', transition: 'visibility 0s linear .27s' }}>
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'radial-gradient(rgba(128,128,140,.16) 1.2px,transparent 1.6px) 0 0/22px 22px' }} />
                      <span aria-hidden className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-[2px] opacity-55" style={{ background: ACCENT.bg }} />
                      <span aria-hidden className="pointer-events-none absolute bottom-[6px] right-[26px] text-[120px] font-bold leading-none tracking-[-0.06em] opacity-[.22]" style={{ color: ACCENT.bg }}>{String(pos + 1).padStart(2, '0')}</span>
                      <span aria-hidden className="td-float pointer-events-none absolute right-[88px] top-[30px] h-[18px] w-[18px] rounded-full opacity-80" style={{ border: `3px solid ${ACCENT.bg}` }} />
                      {front}
                    </div>
                    <div className={`${faceBase} overflow-y-auto pb-[22px] pl-[50px] pr-[30px] pt-[26px]`} style={{ ...faceStyle, transform: 'rotateY(180deg)', pointerEvents: flipped ? 'auto' : 'none', visibility: flipped ? 'visible' : 'hidden', transition: 'visibility 0s linear .27s' }}>
                      <span aria-hidden className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-[2px] opacity-55" style={{ background: ACCENT.bg }} />
                      {back}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* right: title, progress, answers */}
            <div className="relative flex flex-col justify-center gap-3 px-4 pb-5 pt-3 @min-[700px]:pb-[30px] @min-[700px]:pl-[20px] @min-[700px]:pr-[34px] @min-[700px]:pt-[34px]">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={onPickSet} title="Chọn bộ từ khác" className="inline-flex h-[30px] min-w-0 max-w-full items-center gap-1 rounded-[10px] bg-white/35 px-2.5 text-[12.5px] font-extrabold transition-colors hover:bg-white/55">
                  <span className="truncate">{deckLabel}</span><ChevronDown size={14} className="shrink-0" />
                </button>
                <span className="text-[12.5px] font-extrabold tracking-[.1em] opacity-80">Thẻ {Math.min(pos + 1, total)}/{total}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="m-0 font-bold leading-[.98] tracking-[-0.035em]" style={{ fontSize: 'clamp(32px, 6cqi, 48px)' }}>{title}</h2>
                <span aria-hidden className="pointer-events-none relative mr-1 mt-1 hidden shrink-0 rotate-[8deg] @min-[900px]:block">
                  <span className="block whitespace-nowrap rounded-[18px] bg-white px-[14px] py-2 text-[14px] font-extrabold text-[#1b1d22] shadow-[0_10px_18px_-10px_rgba(27,29,34,.4)]">{done ? 'Giỏi quá!' : remaining > 0 ? `Còn ${remaining} từ nữa nè!` : 'Thuộc cả bộ rồi!'}</span>
                  <span className="absolute -bottom-[7px] left-[18px] h-3 w-4 bg-white" style={{ clipPath: 'polygon(0 0,100% 0,20% 100%)' }} />
                </span>
              </div>
              <p className="m-0 max-w-[330px] text-[14.5px] font-semibold leading-[1.45] opacity-85">{desc}</p>
              <div className="relative max-w-[330px]">
                <div className="h-[7px] overflow-hidden rounded-[4px] bg-white/40"><div className="h-full rounded-[4px] transition-[width] duration-500" style={{ width: progress, background: ACCENT.ink }} /></div>
                <svg aria-hidden viewBox="0 0 120 30" width="120" height="30" className="pointer-events-none absolute -top-[12px] left-[calc(100%-64px)] hidden opacity-70 @min-[900px]:block"><path d="M3 15 Q 13 3 23 15 T 43 15 T 63 15 T 83 15 T 103 15 T 117 12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></svg>
              </div>
              {sub === 'flashcard' && !done && (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {[[CircleCheckBig, 'Đã nhớ', tally.known.size], [CircleAlert, 'Cần ôn tập', tally.review.size], [CircleHelp, 'Chưa nhớ', tally.unknown.size]].map(([I, l, n]) => (
                      <span key={l} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/25 px-2.5 text-[12px] font-extrabold"><I size={13} />{l}<span className="opacity-70">{n}</span></span>
                    ))}
                    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/25 px-2.5 text-[12px] font-extrabold"><ChartColumn size={13} />Thống kê</span>
                  </div>
                  {tip && (
                    <div className="flex max-w-[400px] items-start gap-2 rounded-[14px] bg-white/80 px-3 py-2 text-[12.5px] font-bold leading-snug text-[#1b1d22]">
                      <span className="flex-1">Mẹo: phím 1–4 để chấm mức độ nhớ, Space để lật, ← → để đổi thẻ. Lịch ôn được lưu ngay trên máy của bạn.</span>
                      <button type="button" onClick={() => { setTip(false); setSetting('fc_tip_closed', true); }} aria-label="Đóng" className="cursor-pointer text-[15px] font-black leading-none">✕</button>
                    </div>
                  )}
                  <div className="mt-1 flex w-full max-w-[400px] gap-[14px]">
                    <div className="relative w-[28px] shrink-0">
                      <span className="absolute bottom-[6px] left-[11px] top-[6px] w-[6px] rounded-[3px] opacity-90" style={{ background: 'linear-gradient(#a8482a 0%,#8a6410 33%,#46591f 67%,#2e607f 100%)' }} />
                      <span className="absolute left-[2px] -mt-3 h-6 w-6 rounded-full bg-white transition-[top] duration-300" style={{ top: '50%', boxShadow: '0 0 0 4px rgba(255,255,255,.6),0 6px 10px -4px rgba(27,29,34,.4)' }} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="pl-1.5 text-[10.5px] font-extrabold opacity-70">Quên</span>
                      {RATINGS.map(r => {
                        const I = RATE_ICON[r.rating];
                        return (
                          <button key={r.rating} type="button" onClick={() => rate(r.rating)} title={`${r.when} — ${r.then}`}
                            className="flex h-[56px] cursor-pointer items-center gap-[10px] rounded-full pl-2 pr-4 text-left shadow-[0_10px_18px_-14px_rgba(27,29,34,.5)] transition-[translate] duration-[180ms] hover:-translate-x-1"
                            style={{ background: ACCENT.face, color: ACCENT.faceInk }}>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ background: RATE_BG[r.rating] }}><I size={18} /></span>
                            <span className="min-w-0 flex-1 truncate text-[16px] font-bold">{r.label}</span>
                            <span className="whitespace-nowrap text-[11px] font-extrabold opacity-70">{previewInterval(w?.w, r.rating) || r.kb}</span>
                          </button>
                        );
                      })}
                      <span className="pl-1.5 text-[10.5px] font-extrabold opacity-70">Nhớ chắc</span>
                    </div>
                  </div>
                  <div className="flex w-full max-w-[400px] items-center gap-2 @min-[900px]:pl-[42px]">
                    <button type="button" onClick={prev} aria-label="Thẻ trước (←)" title="Thẻ trước (←)" className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-white/25 transition-colors hover:bg-white/40"><ChevronLeft size={20} strokeWidth={2.4} /></button>
                    <button type="button" onClick={() => setFlipped(f => !f)} className="flex h-[42px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-[14.5px] font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: ACCENT.btn }}>
                      <RotateCcw size={16} strokeWidth={2.4} className="shrink-0" /> {flipped ? 'Lật lại' : 'Lật thẻ'}
                      <span className="hidden rounded-[7px] bg-white/15 px-[7px] py-[2px] text-[11px] font-bold @min-[900px]:inline">Space</span>
                    </button>
                    <button type="button" onClick={next} aria-label="Thẻ tiếp (→)" title="Thẻ tiếp (→)" className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-white/25 transition-colors hover:bg-white/40"><ChevronRight size={20} strokeWidth={2.4} /></button>
                    <button type="button" onClick={() => setHelp(true)} aria-label="TID giúp bạn học từ vựng như thế nào?" title="TID giúp bạn học từ vựng như thế nào?" className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-black/[.08] transition-colors hover:bg-black/[.14]"><CircleHelp size={19} strokeWidth={2.4} /></button>
                  </div>
                </>
              )}
              {(sub === 'quiz' || sub === 'fill_blank') && !done && (
                <>
                  <Choices choices={options.map(o => ({ text: o.text, state: solved ? (o.right ? 'right' : picked.includes(o.text) ? 'wrong' : 'dim') : picked.includes(o.text) ? 'wrong' : 'idle' }))} onPick={choose} />
                  {solved ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Feedback ok>{picked.length ? `Đúng rồi — sau ${picked.length} lần chọn sai` : 'Chính xác!'}</Feedback>
                      {picked.length > 0 && <PrimaryBtn onClick={next}>Tiếp →</PrimaryBtn>}
                    </div>
                  ) : picked.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Feedback ok={false}>Chưa đúng — chọn lại nhé</Feedback>
                      <button type="button" onClick={reveal} className="inline-flex h-10 cursor-pointer items-center rounded-[14px] bg-white/25 px-4 text-[13.5px] font-extrabold transition-colors hover:bg-white/40">Xem đáp án</button>
                    </div>
                  ) : <span className="text-[12px] font-extrabold opacity-70">Phím 1–4 để chọn đáp án</span>}
                </>
              )}
              {typing && !done && (
                <>
                  <div className="flex max-w-[360px] flex-wrap items-center gap-2">
                    {!hint && !checked && (
                      <button type="button" onClick={() => setHint(true)} title="Hé chữ đầu và chữ cuối — thẻ sẽ tính là chưa nhớ" className="inline-flex h-[52px] cursor-pointer items-center gap-1.5 rounded-[16px] bg-white/25 px-4 text-[14px] font-extrabold transition-colors hover:bg-white/40"><Lightbulb size={16} strokeWidth={2.4} /> Gợi ý</button>
                    )}
                    <PrimaryBtn onClick={checked ? next : check} disabled={!checked && !typed}>{checked ? 'Tiếp →' : wrongs > 0 ? 'Kiểm tra lại' : 'Kiểm tra'}</PrimaryBtn>
                    {!checked && wrongs > 0 && <button type="button" onClick={giveUp} className="inline-flex h-[52px] cursor-pointer items-center rounded-[16px] bg-white/25 px-4 text-[14px] font-extrabold transition-colors hover:bg-white/40">Xem đáp án</button>}
                  </div>
                  {!checked && wrongs > 0 && <Feedback ok={false}>Chưa đúng — sửa các ô đỏ rồi kiểm tra lại</Feedback>}
                  {checked && <Feedback ok={letters(typed) === letters(w.w)}>{letters(typed) === letters(w.w) ? (wrongs > 0 ? `Đúng rồi — sau ${wrongs} lần sai` : hint ? 'Đúng rồi (có dùng gợi ý)' : 'Chính xác!') : `Đáp án: ${w.w}`}</Feedback>}
                </>
              )}
              {done && <p className="m-0 max-w-[330px] text-[14.5px] font-bold opacity-85">Phiên học đã được lưu — bộ từ này sẽ nhắc bạn ôn lại đúng hẹn.</p>}
            </div>
          </div>
        </section>
      );

  return (
    <div ref={outerRef} className="w-full">
    <div ref={rootRef} className={`@container flex flex-col gap-4 ${full ? 'h-full overflow-y-auto bg-[var(--d-bg)] p-4' : ''}`} style={{ ...themeVars(theme), zoom }}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 @min-[900px]:grid-cols-[minmax(0,1fr)_176px]">
        {stage}
        <section aria-label="Tuỳ chỉnh" className="relative grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] content-start gap-2 rounded-[26px] px-[14px] py-4 text-white transition-colors duration-300 @min-[900px]:grid-cols-1" style={{ background: 'var(--fc-rail, #f0613d)' }}>
          <span className="col-span-full flex items-center gap-1.5 px-1 pb-1.5 text-[18px] font-bold tracking-[-0.02em]">Tuỳ chỉnh.<SlidersHorizontal size={16} className="opacity-90" /></span>
          <RailBtn label="Giọng đọc" title={`Giọng đọc: ${prefs.voice === 'UK' ? 'Anh – Anh' : 'Anh – Mỹ'} (bấm để đổi)`} onClick={() => setPref('voice', prefs.voice === 'UK' ? 'US' : 'UK')}><span className="text-[17px] font-extrabold leading-[22px]">{prefs.voice}</span></RailBtn>
          <RailBtn label="Mặt trước" title={`Mặt trước thẻ: ${prefs.front === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`} onClick={() => { setPref('front', prefs.front === 'en' ? 'vi' : 'en'); setFlipped(false); }}><span className="text-[17px] font-extrabold leading-[22px]">{prefs.front.toUpperCase()}</span></RailBtn>
          <RailBtn label="Phiên âm" on={prefs.ipa} onClick={() => setPref('ipa', !prefs.ipa)}><AudioLines size={20} /></RailBtn>
          <RailBtn label="Ví dụ" on={prefs.example} onClick={() => setPref('example', !prefs.example)}><Quote size={20} /></RailBtn>
          <RailBtn label="Syn/Ant" title="Đồng nghĩa / trái nghĩa" on={prefs.rel} onClick={() => setPref('rel', !prefs.rel)}><ArrowLeftRight size={20} /></RailBtn>
          <RailBtn label="Tự đọc" title="Tự động phát âm khi sang thẻ" on={prefs.auto ? true : false} onClick={() => setPref('auto', !prefs.auto)}><Volume2 size={20} /></RailBtn>
          <RailBtn label="Trộn" title="Trộn thứ tự thẻ — bắt đầu lại từ thẻ 1" onClick={doShuffle}><Shuffle size={20} /></RailBtn>
          <div className="relative">
            <RailBtn label="Màu" title={`Màu thẻ: ${theme.name}`} on={false} onClick={() => setPalette(p => !p)}><span className="block h-6 w-6 rounded-full" style={{ background: theme.bg, boxShadow: '0 0 0 2px #fff' }} /></RailBtn>
            {palette && (
              <div className="absolute right-0 top-[58px] z-[60] grid w-[220px] grid-cols-5 gap-2 rounded-[18px] bg-white p-3 shadow-2xl">
                {THEMES.map((t, i) => (
                  <button key={t.name} type="button" title={t.name} onClick={() => { setPref('theme', i); setPalette(false); }} className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                    style={{ background: t.bg, boxShadow: i === prefs.theme ? '0 0 0 3px #1b1d22' : 'inset 0 0 0 1px rgba(0,0,0,.08)' }} />
                ))}
              </div>
            )}
          </div>
          <RailBtn label={full ? 'Thu nhỏ' : 'Phóng to'} title={full ? 'Thoát toàn màn hình' : 'Toàn màn hình'} on={false} onClick={toggleFull}>{full ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</RailBtn>
        </section>
      </div>
      <section id="vc-modes" className="flex shrink-0 flex-col gap-2.5 rounded-[26px] bg-[var(--d-surf)] px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-1">
          <span className="text-[20px] font-bold tracking-[-0.02em] text-[var(--d-ink)]">Chế độ học.</span>
          <span className="text-[13px] font-bold text-[var(--d-mute)]">Chọn một chế độ để bắt đầu phiên mới</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2.5">
          {MODE_ORDER.map(m => {
            const d = MODES[m];
            const on = m === mode;
            return (
              <button key={m} type="button" onClick={() => startMode(m)}
                className="relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-[20px] p-3 text-left transition-[translate,scale,box-shadow,background-color] duration-[450ms] [transition-timing-function:cubic-bezier(.34,1.8,.5,1)] hover:-translate-y-2 hover:scale-[1.02] active:-translate-y-0.5 active:scale-[.98]"
                style={{ '--fc-mode': d.color, background: on ? 'color-mix(in oklab, var(--d-accent) 14%, var(--d-surf))' : 'var(--d-surf)', boxShadow: on ? 'inset 0 0 0 2px var(--d-accent)' : 'none' }}>
                <span aria-hidden className="pointer-events-none absolute -bottom-[26px] -right-[26px] h-[90px] w-[90px] rounded-full opacity-[.14]" style={{ background: d.color }} />
                <span className="relative flex items-start justify-between">
                  <WavyBadge size={40} fill={d.color}><d.Icon size={18} className="text-white" /></WavyBadge>
                  <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 text-white ${on ? 'border-[var(--d-accent)] bg-[var(--d-accent)]' : 'border-[var(--d-line)]'}`}>{on && <Check size={13} strokeWidth={3} />}</span>
                </span>
                <span className="relative flex flex-col gap-1">
                  <span className="text-[15px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--d-ink)]">{d.label}</span>
                  <span className="line-clamp-2 text-[11.5px] font-semibold leading-[1.35] text-[var(--d-mute)]">{d.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
      {help && <HelpModal onClose={() => setHelp(false)} Icons={RATE_ICON} />}
    </div>
    </div>
  );
}
