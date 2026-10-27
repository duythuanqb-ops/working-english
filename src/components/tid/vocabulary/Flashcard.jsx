// Flashcard study player: 8 modes (Lật thẻ, Quiz, Listening, Điền vào chỗ trống, Đặt câu, Card Blast,
// Gõ từ, Tổng hợp), the "Tuỳ chỉnh" rail and the "Chế độ học" picker. Reviews are scheduled locally (store.js).
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowLeftRight, AudioLines, BookmarkPlus, Brain, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig,
  CircleHelp, ChartColumn, ClipboardCheck, Headphones, Keyboard, Layers, Lightbulb, Maximize2, Mic, Minimize2,
  MousePointerClick, PartyPopper, Quote, RotateCcw, Shapes, Shuffle, SlidersHorizontal, Tag, Target,
  TextCursorInput, Volume2,
} from 'lucide-react';
import { ttsService } from '../../../services/ttsService';
import { storageService } from '../../../services/storageService';
import { toNotebookWord } from './SaveWordPopup';
import { blankSentence, gloss, posLabel, shuffle } from './decks';
import { getCustomWords, getSetting, logActivity, markSetStudied, previewInterval, rateWord, setSetting, wordState } from './store';
import {
  ACCENT, CHIP, Choices, EDGE, Feedback, HelpModal, LINK, LetterCells, MUTE, POP, PrimaryBtn, RATINGS, Sparkle, THEMES, WatchingSun,
  WavyBadge, letters, themeVars,
} from './fcParts';
import Blast from './Blast';
import Tidians from './Tidians';

export const MODES = {
  flashcard: { label: 'Lật thẻ', desc: 'Tự nhớ nghĩa rồi lật thẻ, chấm mức độ nhớ.', color: '#4F46E5', Icon: Layers },
  quiz: { label: 'Quiz', desc: 'Trắc nghiệm nhanh, chọn 1 trong 4 đáp án (phím 1–4).', color: '#F8BE33', Icon: ClipboardCheck },
  listening: { label: 'Listening', desc: 'Nghe phát âm rồi gõ lại từ.', color: '#1F9D63', Icon: Headphones },
  fill_blank: { label: 'Điền vào chỗ trống', desc: 'Chọn từ phù hợp để điền vào câu ví dụ.', color: '#F2683A', Icon: TextCursorInput },
  sentence_build: { label: 'Đặt câu & Nói', desc: 'Đặt một câu có dùng từ này, gõ hoặc bấm mic để nói.', color: '#8B7CF6', Icon: Mic },
  blast: { label: 'Card Blast', desc: 'Chữ rơi xuống — gõ đáp án để bắn hạ.', color: '#7CC4F2', Icon: Target },
  type: { label: 'Gõ từ', desc: 'Đọc nghĩa tiếng Việt, gõ lại từ tiếng Anh.', color: '#3ECF8E', Icon: Keyboard },
  mixed: { label: 'Tổng hợp', desc: 'Mỗi thẻ một chế độ khác nhau.', color: '#E06A96', Icon: Shapes },
};
const MODE_ORDER = ['flashcard', 'quiz', 'listening', 'fill_blank', 'sentence_build', 'blast', 'type', 'mixed'];
const MIX = ['flashcard', 'quiz', 'listening', 'fill_blank', 'type'];
const RATE_ICON = { forgot: CircleHelp, hard: Brain, good: Lightbulb, easy: CircleCheckBig };
const RATE_BG = Object.fromEntries(RATINGS.map(r => [r.rating, r.color]));
const RATING_POS = { forgot: '12%', hard: '38%', good: '63%', easy: '88%' };
const DEFAULT_INTERVALS = { forgot: 'Ôn lại ngay', hard: 'Sau 2 ngày', good: 'Sau 5 ngày', easy: 'Thuộc lòng' };

const fontFor = (text, max, pad) => {
  const ws = String(text).trim().split(/\s+/);
  const a = Math.max(4, ...ws.map(x => x.length));
  const i = ws.length > 1 ? Math.max(a, Math.ceil(text.length / 2) + 1) : a;
  return `min(${max}px, calc((100cqi - ${pad}px) / ${(0.62 * i).toFixed(2)}))`;
};

function RailBtn({ on, onClick, label, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title || label} aria-label={title || label}
      className="flex min-h-[38px] md:min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-2 px-3 py-1.5 text-left transition-[translate,background-color,color,box-shadow] duration-150 hover:-translate-y-0.5"
      style={{ background: on ? 'var(--fc-rail-on)' : 'rgba(255,255,255,.1)', color: on ? 'var(--fc-rail-on-ink)' : '#fff', borderColor: on ? EDGE : 'rgba(255,255,255,.14)', boxShadow: on ? '0 3px 0 #0f0d2b' : 'none' }}>
      <span className="flex w-6 shrink-0 items-center justify-center">{children}</span>
      <span className="min-w-0 truncate text-[13.5px] font-bold leading-tight">{label}</span>
    </button>
  );
}

function DoneCard({ total, known, review, onReviewUnknown, onRestart, onChangeMode, onExit }) {
  const pct = total ? Math.round((known / total) * 100) : 0;
  const all = known === total && total > 0;
  const p = 2 * Math.PI * 24;
  return (
    <div className="td-pop absolute inset-0 z-50 flex flex-col overflow-y-auto rounded-[26px] border-[3px] border-[#1E1B4B] bg-white px-5 py-5 text-center text-[#1E1B4B] shadow-[0_6px_0_#1E1B4B]">
      <div className="m-auto flex w-full flex-col items-center">
        <WavyBadge size={60} fill="#3ECF8E" className="mb-2.5"><PartyPopper size={26} strokeWidth={2.2} className="text-white" /></WavyBadge>
        <h2 className="we-display mb-1.5 text-[28px] md:text-[34px]">{all ? `Bạn đã nhớ toàn bộ ${total} từ! 🎉` : 'Hoàn thành!'}</h2>
        <p className="mb-4 text-[15px] font-semibold text-[#6B6790]">Thống kê phiên học của bạn</p>
        <div className="mb-5 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-2 flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="#FFF0C2" strokeWidth="6" />
                <circle cx="30" cy="30" r="24" fill="none" stroke="#4F46E5" strokeWidth="6" strokeDasharray={p} strokeDashoffset={p * (1 - pct / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-[14px] font-bold">{pct}%</span>
            </div>
            <span className="text-[12px] font-bold text-[#6B6790]">Độ chính xác</span>
          </div>
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full border-2 border-[#1E1B4B] bg-[#3ECF8E]" /><span className="text-[14px] font-bold">{known} Đã nhớ</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full border-2 border-[#1E1B4B] bg-[#F2683A]" /><span className="text-[14px] font-bold">{review} Cần ôn lại</span></div>
          </div>
        </div>
        <div className="flex w-full max-w-[280px] flex-col gap-2">
          {!all && review > 0 && <button type="button" onClick={onReviewUnknown} className="we-btn we-btn-indigo w-full">Ôn những từ chưa nhớ</button>}
          <button type="button" onClick={onRestart} className="we-btn we-btn-white w-full">Học lại từ đầu</button>
          <button type="button" onClick={onChangeMode} className="w-full rounded-[16px] px-4 py-2.5 text-[15px] font-bold text-[#1E1B4B] transition-colors hover:bg-[#FFF0C2]">Đổi chế độ luyện tập</button>
          <button type="button" onClick={onExit} className="w-full rounded-[16px] px-4 py-2.5 text-[15px] font-bold text-[#6B6790] transition-colors hover:bg-[#FFF0C2]">Hoàn tất</button>
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
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[14px] font-bold leading-[1.35] transition-[filter] hover:brightness-95" style={{ background: CHIP, color: '#1E1B4B' }}>
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

export default function Flashcard({ session, initialMode = 'flashcard', onPickSet, onExit, onSaveWord, onRemoveWord, speechVoice }) {
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
  const [rated, setRated] = useState({});
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
  // Dynamically scale to fit both width and viewport height cleanly without crushing modes
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return undefined;
    const fit = () => {
      if (full) { setZoom(1); return; }
      const widthScale = el.clientWidth / 1120;
      const vh = window.innerHeight;
      const heightScale = vh < 850 ? Math.max(0.72, (vh - 110) / 800) : 1;
      const finalScale = Math.max(0.65, Math.min(1, Math.min(widthScale, heightScale)));
      setZoom(finalScale);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [full]);

  const words = session.words;
  const total = order.length;
  const w = words[order[pos]] || words[0];
  const currentRating = (w && w.w ? rated[w.w] : null) || (w && w.w && wordState(w.w)?.last) || null;
  const sub = mode === 'mixed' ? MIX[(order[pos] * 7 + 3) % MIX.length] : mode;
  const theme = THEMES[prefs.theme] || THEMES[0];
  const setPref = (k, v) => setPrefs(p => { const n = { ...p, [k]: v }; setSetting('fc_prefs', n); return n; });
  const speak = useCallback(text => ttsService.speak(text, { voiceType: prefs.voice }), [prefs.voice]);

  useEffect(() => {
    setOrder(session.words.map((_, i) => i));
    setPos(0);
    setDone(false);
    setFlipped(false);
    setTally({ known: new Set(), review: new Set(), unknown: new Set() });
    const map = {};
    session.words.forEach(wordObj => {
      const wText = wordObj?.w || wordObj?.word;
      if (wText && storageService.isWordSaved(wText)) {
        map[wText] = true;
      }
    });
    setSaved(map);
  }, [session]);
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
    if (!word?.w) return;
    rateWord(word.w, rating, word.deckId);
    setTally(t => {
      const n = { known: new Set(t.known), review: new Set(t.review), unknown: new Set(t.unknown) };
      [n.known, n.review, n.unknown].forEach(s => s.delete(idx));
      (rating === 'forgot' ? n.unknown : rating === 'hard' ? n.review : n.known).add(idx);
      return n;
    });
  }, [order, pos, words]);

  const rate = useCallback(rating => {
    if (!w?.w) return;
    record(rating);
    setRated(prev => ({ ...prev, [w.w]: rating }));
  }, [w, record]);

  // ----- quiz / fill-in options -----
  const options = useMemo(() => {
    if (!w || (sub !== 'quiz' && sub !== 'fill_blank')) return [];
    const viFront = prefs.front === 'vi';
    const answer = sub === 'quiz' ? (viFront ? w.w : gloss(w)) : w.w;
    let pool = [...new Set(words.filter(x => x !== w).map(x => (sub === 'quiz' && !viFront ? gloss(x) : x.w)).filter(x => x && x !== answer))];
    if (pool.length < 3) {
      const extra = getCustomWords()
        .map(x => (sub === 'quiz' && !viFront ? gloss(x) : x.w))
        .filter(x => x && x !== answer && !pool.includes(x));
      pool = [...pool, ...extra];
    }
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
    speak(w.w);
    record(wrongs || hint ? 'forgot' : 'good');
  };
  const giveUp = () => { setChecked(true); setFlipped(true); speak(w.w); record('forgot'); };

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
    if (!full) {
      const el = rootRef.current;
      if (!document.fullscreenElement && el?.requestFullscreen) {
        el.requestFullscreen().then(() => setFull(true)).catch(() => setFull(true));
      } else {
        setFull(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setFull(false);
    }
  };

  useEffect(() => {
    const f = () => {
      if (!document.fullscreenElement) {
        setFull(false);
      } else {
        setFull(true);
      }
    };
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  useEffect(() => {
    if (!full) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
        setFull(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [full]);

  const startMode = m => { setMode(m); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); logActivity(0); };
  const reviewUnknown = () => {
    const ids = [...tally.unknown, ...tally.review];
    if (!ids.length) return;
    setOrder(ids); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() });
  };
  const restart = () => { setOrder(words.map((_, i) => i)); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); };
  const doShuffle = () => { setOrder(shuffle(words.map((_, i) => i))); setPos(0); setDone(false); setTally({ known: new Set(), review: new Set(), unknown: new Set() }); };
  const isSaved = Boolean(w?.w && (saved[w.w] ?? storageService.isWordSaved(w.w)));

  const toggleSaveWord = () => {
    if (!w?.w) return;
    if (isSaved) {
      if (onRemoveWord) {
        onRemoveWord(w.w);
      } else {
        storageService.deleteWordByText(w.w);
      }
      setSaved(s => ({ ...s, [w.w]: false }));
    } else {
      if (onSaveWord) {
        onSaveWord(toNotebookWord({
          word: w.w,
          ipa: w.ipa,
          pos: w.pos,
          meaningVi: w.vi,
          meaningEn: w.en,
          example: w.ex,
          exampleVi: w.exVi,
          synonyms: w.syn,
          antonyms: w.ant,
          tags: ['IELTS', w.deck].filter(Boolean),
          context: 'Flashcard · Luyện Từ'
        }));
      }
      setSaved(s => ({ ...s, [w.w]: true }));
    }
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
  const faceBase = 'absolute inset-0 rounded-[0_28px_28px_0] border-[3px] border-l-0 border-[#1E1B4B] flex flex-col shadow-[0_6px_0_#1E1B4B] @container';
  const faceStyle = {
    background: ACCENT.face,
    color: ACCENT.faceInk,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d',
  };
  const SpeakBtn = ({ size = 42 }) => (
    <button type="button" onClick={e => { e.stopPropagation(); speak(w.w); }} aria-label="Phát âm" title="Phát âm"
      className="flex cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-[1.08]" style={{ width: size, height: size, background: CHIP, color: '#1E1B4B' }}><Volume2 size={18} /></button>
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
          ? <span className="relative font-bold leading-[1.35] [text-wrap:pretty]" style={{ fontSize: 'clamp(22px, 5.4cqi, 40px)' }}>{blank.before}<span className="mx-1 inline-block min-w-[3.2em] border-b-[3px]" style={{ borderColor: ACCENT.bg }}>{solved ? <span style={{ color: '#1F9D63' }}>{blank.removed}</span> : ' '}</span>{blank.after}</span>
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
        {onSaveWord && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); toggleSaveWord(); }}
            title={isSaved ? 'Bỏ lưu khỏi sổ từ vựng (bấm để huỷ)' : 'Lưu vào sổ từ vựng của app'}
            className={`flex h-10 cursor-pointer items-center gap-1.5 rounded-[12px] px-3.5 text-[13.5px] font-extrabold transition-all duration-200 ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
                : 'hover:brightness-95'
            }`}
            style={!isSaved ? { background: CHIP, color: '#1E1B4B' } : {}}
          >
            {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
            <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        )}
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
        <section className="td-pop @container relative flex flex-col overflow-hidden rounded-[26px] border-[3px] transition-colors duration-300 min-h-[360px] @min-[700px]:min-h-[390px]" style={{ background: ACCENT.bg, color: ACCENT.ink, borderColor: EDGE, boxShadow: '0 6px 0 #1E1B4B' }}>
          <span aria-hidden className="pointer-events-none absolute -right-[90px] -top-[90px] h-[300px] w-[300px] rounded-full bg-white/[.14]" />
          <span aria-hidden className="pointer-events-none absolute bottom-[6%] right-[4%] h-[110px] w-[150px] @max-[699px]:hidden" style={{ background: 'radial-gradient(rgba(255,255,255,.6) 2.2px,transparent 2.6px) 0 0/16px 16px' }} />
          <Sparkle size={30} className="right-[32%] top-[7%] @max-[699px]:hidden" />
          <Sparkle size={11} fill delay={450} className="right-[28%] top-[13%] @max-[699px]:hidden" />
          <Sparkle size={22} delay={900} className="bottom-[9%] left-[47%] z-[3] @max-[699px]:hidden" />
          <span aria-hidden className="td-bob pointer-events-none absolute left-[2%] top-[8px] z-[3]"><WatchingSun size={58} /></span>
          <span aria-hidden className="pointer-events-none absolute left-[30%] top-[40px] z-[3] h-[24px] w-[90px] -rotate-[5deg] rounded-[4px] border-2 border-[#1E1B4B] bg-[#F8BE33] @max-[699px]:hidden" />
          <div className="relative grid flex-1 grid-cols-1 @min-[700px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* left: the card */}
            <div className="relative min-h-[340px] @min-[700px]:min-h-[370px]">
              <span aria-hidden className="pointer-events-none absolute bottom-[64px] left-[-30px] right-[34px] top-[34px] -rotate-3 rounded-[0_26px_26px_0] border-[2.5px] border-[#1E1B4B] bg-white/55 @max-[699px]:hidden" />
              <span aria-hidden className="pointer-events-none absolute bottom-[48px] left-[-30px] right-[20px] top-[50px] rotate-2 rounded-[0_26px_26px_0] border-[2.5px] border-[#1E1B4B] bg-white/80 @max-[699px]:hidden" />
              {done ? (
                <div className="absolute bottom-[32px] left-[-20px] right-[26px] top-[48px]">
                  <DoneCard total={total} known={tally.known.size} review={tally.unknown.size + tally.review.size} onReviewUnknown={reviewUnknown} onRestart={restart}
                    onChangeMode={() => document.getElementById('vc-modes')?.scrollIntoView({ behavior: 'smooth' })} onExit={onExit} />
                </div>
              ) : (
                <div className={`absolute bottom-2.5 left-[-20px] right-[20px] top-3 touch-pan-y @min-[700px]:bottom-[20px] @min-[700px]:top-[30px] ${canFlip ? 'cursor-pointer' : ''}`} style={{ perspective: 1200 }}
                  onClick={() => canFlip && setFlipped(f => !f)}>
                  <div
                    className="absolute inset-0 transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
                    style={{
                      transformStyle: 'preserve-3d',
                      WebkitTransformStyle: 'preserve-3d',
                      transform: `rotateY(${flipped ? 180 : 0}deg)`,
                      willChange: 'transform',
                    }}
                  >
                    <div
                      className={`${faceBase} justify-center gap-[10px] pl-[50px] pr-[30px] pt-[24px] ${typing ? 'overflow-y-auto pb-[24px]' : 'overflow-hidden pb-[60px]'}`}
                      style={{
                        ...faceStyle,
                        pointerEvents: flipped ? 'none' : 'auto',
                        transform: 'rotateY(0deg)',
                      }}
                    >
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'radial-gradient(rgba(128,128,140,.16) 1.2px,transparent 1.6px) 0 0/22px 22px' }} />
                      <span aria-hidden className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-[2px] opacity-55" style={{ background: ACCENT.bg }} />
                      <span aria-hidden className="td-float pointer-events-none absolute right-[88px] top-[30px] h-[18px] w-[18px] rounded-full opacity-80" style={{ border: `3px solid ${ACCENT.bg}` }} />
                      {front}
                    </div>
                    <div
                      className={`${faceBase} overflow-y-auto pb-[20px] pl-[50px] pr-[30px] pt-[22px]`}
                      style={{
                        ...faceStyle,
                        transform: 'rotateY(180deg)',
                        pointerEvents: flipped ? 'auto' : 'none',
                      }}
                    >
                      <span aria-hidden className="pointer-events-none absolute bottom-0 left-[34px] top-0 w-[2px] opacity-55" style={{ background: ACCENT.bg }} />
                      {back}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* right: title, progress, answers */}
            <div className="relative flex flex-col justify-center gap-2 px-3 pb-3 pt-2 @min-[700px]:pb-[16px] @min-[700px]:pl-[16px] @min-[700px]:pr-[22px] @min-[700px]:pt-[16px]">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={onPickSet} title="Chọn bộ từ khác" className="inline-flex h-[26px] min-w-0 max-w-full items-center gap-1 rounded-full border-2 border-[#1E1B4B] bg-white px-2.5 text-[11.5px] font-extrabold text-[#1E1B4B] transition-transform hover:-translate-y-0.5">
                  <span className="truncate">{deckLabel}</span><ChevronDown size={12} className="shrink-0" />
                </button>
                <span className="text-[11.5px] font-extrabold tracking-[.08em] opacity-80">Thẻ {Math.min(pos + 1, total)}/{total}</span>
              </div>
              <div className="flex items-start justify-between gap-2.5">
                <h2 className="we-display m-0 leading-[.98]" style={{ fontSize: 'clamp(28px, 4.6cqi, 42px)' }}>{title}</h2>
                <span aria-hidden className="pointer-events-none relative mr-1 mt-0.5 hidden shrink-0 rotate-[8deg] @min-[900px]:block">
                  <span className="block whitespace-nowrap rounded-[14px] border-2 border-[#1E1B4B] bg-white px-2.5 py-1 text-[12px] font-extrabold text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]">{done ? 'Giỏi quá!' : remaining > 0 ? `Còn ${remaining} từ nữa!` : 'Thuộc cả bộ rồi!'}</span>
                  <span className="absolute -bottom-[6px] left-[16px] h-2 w-3 bg-white" style={{ clipPath: 'polygon(0 0,100% 0,20% 100%)' }} />
                </span>
              </div>
              <p className="m-0 max-w-[330px] text-[13px] font-semibold leading-[1.3] opacity-85">{desc}</p>
              <div className="relative max-w-[330px]">
                <div className="h-[12px] overflow-hidden rounded-full border-2 border-[#1E1B4B] bg-white"><div className="h-full border-r-2 border-[#1E1B4B] bg-[#3ECF8E] transition-[width] duration-500" style={{ width: progress }} /></div>
                <svg aria-hidden viewBox="0 0 120 30" width="120" height="30" className="pointer-events-none absolute -top-[12px] left-[calc(100%-64px)] hidden opacity-70 @min-[900px]:block"><path d="M3 15 Q 13 3 23 15 T 43 15 T 63 15 T 83 15 T 103 15 T 117 12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></svg>
              </div>
              {sub === 'flashcard' && !done && (
                <>
                  <div className="flex flex-wrap gap-1">
                    {[[CircleCheckBig, 'Đã nhớ', tally.known.size], [CircleAlert, 'Cần ôn tập', tally.review.size], [CircleHelp, 'Chưa nhớ', tally.unknown.size]].map(([I, l, n]) => (
                      <span key={l} className="inline-flex h-6 items-center gap-1 rounded-full border-2 border-[#1E1B4B] bg-white px-2 text-[10.5px] font-extrabold text-[#1E1B4B]"><I size={11} />{l}<span className="opacity-60">{n}</span></span>
                    ))}
                    <span className="inline-flex h-6 items-center gap-1 rounded-full border-2 border-[#1E1B4B] bg-[#F8BE33] px-2 text-[10.5px] font-extrabold text-[#1E1B4B]"><ChartColumn size={11} />Thống kê</span>
                  </div>
                  {tip && (
                    <div className="flex max-w-[400px] items-start gap-1.5 rounded-[12px] border-2 border-dashed border-[#1E1B4B] bg-[#FFF0C2] px-2.5 py-1.5 text-[10.5px] font-bold leading-snug text-[#1E1B4B]">
                      <span className="flex-1">Mẹo: Chọn mức độ nhớ để lên lịch ôn tập thông minh (hoặc bấm phím 1–4).</span>
                      <button type="button" onClick={() => { setTip(false); setSetting('fc_tip_closed', true); }} aria-label="Đóng" className="cursor-pointer text-[12px] font-black leading-none">✕</button>
                    </div>
                  )}
                  <div className="mt-0.5 flex w-full max-w-[420px] flex-col gap-1">
                    <div className="flex items-center justify-between px-1 text-[11px] font-extrabold opacity-85">
                      <span>Đánh dấu mức nhớ từ này:</span>
                      {currentRating && (
                        <span className="flex items-center gap-1 rounded-full border-2 border-[#1E1B4B] bg-[#3ECF8E] px-2 py-0.5 text-[10px] font-bold text-[#1E1B4B]">
                          <Check size={10} strokeWidth={3} /> Đã ghi nhận mức nhớ
                        </span>
                      )}
                    </div>
                    <div className="flex w-full gap-2.5">
                      <div className="relative w-[22px] shrink-0" title="Thước đo mức độ nhớ từ">
                        <span className="absolute bottom-[4px] left-[8px] top-[4px] w-[5px] rounded-[3px] opacity-90" style={{ background: `linear-gradient(${RATINGS.map(r => r.color).join(',')})`, boxShadow: '0 0 0 2px #1E1B4B' }} />
                        <span className="absolute left-[0px] -mt-2.5 h-5 w-5 rounded-full bg-white transition-[top] duration-300" style={{ top: currentRating ? RATING_POS[currentRating] : '50%', boxShadow: '0 0 0 3px #1E1B4B' }} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="pl-1 text-[9.5px] font-extrabold opacity-70">Quên</span>
                        {RATINGS.map(r => {
                          const I = RATE_ICON[r.rating];
                          const isSelected = currentRating === r.rating;
                          return (
                            <button key={r.rating} type="button" onClick={() => rate(r.rating)} title={`${r.when} — ${r.then}`}
                              className={`flex h-[38px] cursor-pointer items-center gap-2 rounded-full border-2 pl-1 pr-2.5 text-left transition-all duration-[180ms] hover:-translate-y-0.5 ${isSelected ? '-translate-y-0.5' : ''}`}
                              style={{
                                background: isSelected ? '#FFF0C2' : ACCENT.face,
                                color: ACCENT.faceInk,
                                borderColor: EDGE,
                                boxShadow: isSelected ? `0 4px 0 ${RATE_BG[r.rating]}` : '0 2px 0 #1E1B4B',
                              }}>
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#1E1B4B] text-white" style={{ background: RATE_BG[r.rating] }}><I size={14} /></span>
                              <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{r.label}</span>
                              {isSelected ? (
                                <span className="flex items-center gap-1 rounded-full border-2 border-[#1E1B4B] px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ background: RATE_BG[r.rating] }}>
                                  <Check size={10} strokeWidth={3} /> Đã chọn
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="whitespace-nowrap text-[10.5px] font-bold opacity-75">{previewInterval(w?.w, r.rating) || DEFAULT_INTERVALS[r.rating]}</span>
                                  <span className="rounded-[6px] border-[1.5px] border-[#1E1B4B]/40 bg-[#FFF8E7] px-1.5 py-0.5 text-[9.5px] font-mono font-bold">Phím {r.kb}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                        <span className="pl-1 text-[9.5px] font-extrabold opacity-70">Nhớ chắc</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full max-w-[400px] items-center gap-1.5 @min-[900px]:pl-[34px]">
                    <button type="button" onClick={prev} aria-label="Thẻ trước (←)" title="Thẻ trước (←)" className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-2 border-[#1E1B4B] bg-white text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"><ChevronLeft size={18} strokeWidth={2.4} /></button>
                    <button type="button" onClick={() => setFlipped(f => !f)} className="flex h-[38px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[12px] border-2 border-[#1E1B4B] text-[13.5px] font-extrabold text-white shadow-[0_3px_0_rgba(30,27,75,.45)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5" style={{ background: ACCENT.btn }}>
                      <RotateCcw size={15} strokeWidth={2.4} className="shrink-0" /> {flipped ? 'Lật lại' : 'Lật thẻ'}
                      <span className="hidden rounded-[6px] bg-white/15 px-[6px] py-[1px] text-[10.5px] font-bold @min-[900px]:inline">Space</span>
                    </button>
                    <button type="button" onClick={next} aria-label="Thẻ tiếp (→)" title="Thẻ tiếp (→)" className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-2 border-[#1E1B4B] bg-white text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"><ChevronRight size={18} strokeWidth={2.4} /></button>
                    <button type="button" onClick={() => setHelp(true)} aria-label="WorkingEnglish giúp bạn học từ vựng như thế nào?" title="WorkingEnglish giúp bạn học từ vựng như thế nào?" className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-2 border-[#1E1B4B] bg-[#F8BE33] text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"><CircleHelp size={17} strokeWidth={2.4} /></button>
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
                      <button type="button" onClick={reveal} className="inline-flex h-10 cursor-pointer items-center rounded-[14px] border-2 border-[#1E1B4B] bg-white px-4 text-[13.5px] font-extrabold text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5">Xem đáp án</button>
                    </div>
                  ) : <span className="text-[12px] font-extrabold opacity-70">Phím 1–4 để chọn đáp án</span>}
                </>
              )}
              {typing && !done && (
                <>
                  <div className="flex max-w-[360px] flex-wrap items-center gap-2">
                    {!hint && !checked && (
                      <button type="button" onClick={() => setHint(true)} title="Hé chữ đầu và chữ cuối — thẻ sẽ tính là chưa nhớ" className="inline-flex h-[52px] cursor-pointer items-center gap-1.5 rounded-[16px] border-[2.5px] border-[#1E1B4B] bg-white px-4 text-[14px] font-extrabold text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"><Lightbulb size={16} strokeWidth={2.4} /> Gợi ý</button>
                    )}
                    <PrimaryBtn onClick={checked ? next : check} disabled={!checked && !typed}>{checked ? 'Tiếp →' : wrongs > 0 ? 'Kiểm tra lại' : 'Kiểm tra'}</PrimaryBtn>
                    {!checked && wrongs > 0 && <button type="button" onClick={giveUp} className="inline-flex h-[52px] cursor-pointer items-center rounded-[16px] border-[2.5px] border-[#1E1B4B] bg-white px-4 text-[14px] font-extrabold text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] transition-transform hover:-translate-y-0.5">Xem đáp án</button>}
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
    <div ref={outerRef} className="w-full min-h-0 pb-10">
      <div
        ref={rootRef}
        className={`@container flex flex-col gap-3 transition-all duration-300 ${
          full
            ? 'fixed inset-0 z-[100] h-screen w-screen overflow-y-auto bg-[var(--d-bg)] p-4 md:p-6'
            : 'w-full'
        }`}
        style={{ ...themeVars(theme), zoom: full ? 1 : zoom }}
      >
        {/* 1. Header Navigation Bar (Back button, Deck selector, Progress, Fullscreen toggle) */}
        <header className="flex shrink-0 items-center justify-between gap-3 px-1 py-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="we-btn we-btn-sm we-btn-white group h-10"
              title="Quay lại danh sách bộ từ"
            >
              <ArrowLeft size={15} strokeWidth={2.75} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              onClick={onPickSet}
              className="we-btn we-btn-sm we-btn-white h-10"
              title="Đổi bộ từ khác"
            >
              <Layers size={14} className="shrink-0 text-[#4F46E5]" />
              <span className="truncate max-w-[180px] md:max-w-[300px]">{deckLabel}</span>
              <ChevronDown size={14} className="opacity-60 shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-full border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] px-3 py-1.5 text-xs font-extrabold text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]">
              <span className="opacity-70">Thẻ:</span>
              <span className="font-black">{Math.min(pos + 1, total)}</span>
              <span className="opacity-70">/</span>
              <span>{total}</span>
            </div>

            {full && (
              <button
                type="button"
                onClick={toggleFull}
                className="we-btn we-btn-sm we-btn-indigo h-10"
                title="Thu nhỏ toàn màn hình (Esc)"
              >
                <Minimize2 size={14} /> <span>Thu nhỏ</span>
              </button>
            )}
          </div>
        </header>

        {/* 2. Main Work Area: Stage + Tuỳ chỉnh Rail */}
        <div className={`grid min-h-0 flex-1 grid-cols-1 gap-2.5 ${mode === 'blast' || mode === 'sentence_build' ? '' : '@min-[900px]:grid-cols-[minmax(0,1fr)_160px]'}`}>
          {stage}
          {mode !== 'blast' && mode !== 'sentence_build' && (
            <section aria-label="Tuỳ chỉnh" className="relative z-20 flex flex-col justify-between gap-1.5 overflow-visible rounded-[22px] border-[3px] px-2.5 py-3 text-white transition-colors duration-300" style={{ background: 'var(--fc-rail)', borderColor: EDGE, boxShadow: '0 6px 0 #1E1B4B' }}>
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="we-display flex items-center gap-1.5 text-[19px] text-[#F8BE33]">Tuỳ chỉnh<SlidersHorizontal size={15} className="text-white/80" /></span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-1.5 @min-[900px]:grid-cols-1">
                <RailBtn label="Giọng đọc" title={`Giọng đọc: ${prefs.voice === 'UK' ? 'Anh – Anh' : 'Anh – Mỹ'} (bấm để đổi)`} onClick={() => setPref('voice', prefs.voice === 'UK' ? 'US' : 'UK')}><span className="text-[14.5px] font-black leading-none">{prefs.voice}</span></RailBtn>
                <RailBtn label="Mặt trước" title={`Mặt trước thẻ: ${prefs.front === 'en' ? 'tiếng Anh' : 'tiếng Việt'}`} onClick={() => { setPref('front', prefs.front === 'en' ? 'vi' : 'en'); setFlipped(false); }}><span className="text-[14.5px] font-black leading-none">{prefs.front.toUpperCase()}</span></RailBtn>
                <RailBtn label="Phiên âm" on={prefs.ipa} onClick={() => setPref('ipa', !prefs.ipa)}><AudioLines size={18} /></RailBtn>
                <RailBtn label="Ví dụ" on={prefs.example} onClick={() => setPref('example', !prefs.example)}><Quote size={18} /></RailBtn>
                <RailBtn label="Syn/Ant" title="Đồng nghĩa / trái nghĩa" on={prefs.rel} onClick={() => setPref('rel', !prefs.rel)}><ArrowLeftRight size={18} /></RailBtn>
                <RailBtn label="Tự đọc" title="Tự động phát âm khi sang thẻ" on={prefs.auto ? true : false} onClick={() => setPref('auto', !prefs.auto)}><Volume2 size={18} /></RailBtn>
                <RailBtn label="Trộn" title="Trộn thứ tự thẻ — bắt đầu lại từ thẻ 1" onClick={doShuffle}><Shuffle size={18} /></RailBtn>
                <div className="relative">
                  <RailBtn label="Màu" title={`Màu thẻ: ${theme.name}`} on={false} onClick={() => setPalette(p => !p)}><span className="block h-5 w-5 rounded-full border-2 border-white" style={{ background: theme.bg }} /></RailBtn>
                  {palette && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setPalette(false)} />
                      <div className="absolute bottom-full right-0 z-50 mb-2 w-full min-w-[150px] rounded-[18px] border-[2.5px] border-[#1E1B4B] bg-white p-2.5 shadow-[0_4px_0_#1E1B4B]">
                        <div className="grid grid-cols-4 gap-1.5 justify-items-center">
                          {THEMES.map((t, i) => (
                            <button key={t.name} type="button" title={t.name} onClick={() => { setPref('theme', i); setPalette(false); }} className="h-7 w-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                              style={{ background: t.bg, boxShadow: i === prefs.theme ? '0 0 0 2px #fff, 0 0 0 4.5px #1E1B4B' : 'inset 0 0 0 2px #1E1B4B' }} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <RailBtn label={full ? 'Thu nhỏ' : 'Phóng to'} title={full ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'} on={full} onClick={toggleFull}>{full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</RailBtn>
              </div>
            </section>
          )}
        </div>

        {/* 3. Original Chế độ học section with rich cards */}
        <section id="vc-modes" className="flex shrink-0 flex-col gap-3 rounded-[22px] border-[3px] border-[var(--d-edge)] bg-[var(--d-surf)] px-4 py-4 shadow-[0_6px_0_var(--d-edge)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
            <span className="we-display text-[22px] text-[var(--d-ink)]">Chế độ học</span>
            <span className="text-[12px] font-bold text-[var(--d-mute)]">Chọn một chế độ để bắt đầu phiên mới</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {MODE_ORDER.map(m => {
              const d = MODES[m];
              const on = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => startMode(m)}
                  className="relative flex cursor-pointer flex-col gap-1.5 overflow-hidden rounded-[16px] border-[2.5px] border-[var(--d-edge)] p-2.5 text-left transition-[translate,box-shadow,background-color] duration-200 hover:-translate-y-1 active:translate-y-0.5"
                  style={{
                    '--fc-mode': d.color,
                    background: on ? '#FFF0C2' : 'var(--d-surf)',
                    boxShadow: on ? `0 4px 0 ${d.color}, 0 4px 0 2.5px var(--d-edge)` : '0 3px 0 var(--d-edge)',
                  }}
                >
                  <span aria-hidden className="pointer-events-none absolute -bottom-[22px] -right-[22px] h-[64px] w-[64px] rounded-full border-[2.5px] border-[var(--d-edge)] opacity-20" style={{ background: d.color }} />
                  <span className="relative flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[11px] border-2 border-[#1E1B4B] text-[#1E1B4B]" style={{ background: d.color }}><d.Icon size={16} strokeWidth={2.5} /></span>
                    <span className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2 border-[var(--d-edge)] text-white ${on ? 'bg-[#4F46E5]' : 'bg-[var(--d-surf)]'}`}>
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                  </span>
                  <span className="relative flex flex-col gap-0.5">
                    <span className="truncate text-[14px] font-extrabold leading-tight text-[var(--d-ink)]">{d.label}</span>
                    <span className="line-clamp-1 text-[10.5px] font-semibold leading-tight text-[var(--d-mute)]">{d.desc}</span>
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
