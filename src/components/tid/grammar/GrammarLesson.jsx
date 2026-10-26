// Grammar lesson player — replica of theieltsdictionary.com/practice/grammar/[lessonId]:
// left nav (topics -> sub-topics), right pane with theory blocks / quiz (choice or typed) with explanations.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Maximize2, Menu, Minimize2, Volume2, VolumeX, X } from 'lucide-react';
import index from '../../../data/tid/grammar/index.json';
import { buildLesson, checkTyped } from './buildLesson';
import SaveWordPopup, { ClickableText } from '../vocabulary/SaveWordPopup';
import { GRID_BG } from './GrammarHub';

const lessonFiles = import.meta.glob('../../../data/tid/grammar/lessons/*.json');
const loadLesson = async id => {
  const f = lessonFiles[`../../../data/tid/grammar/lessons/${id}.json`];
  if (!f) return null;
  const m = await f();
  return m.default ?? m;
};

const QS = 'font-[family-name:var(--font-quicksand)]';
const TONES = { green: { bg: '#eef0e2', bar: '#5f6a45', label: '#5f6a45' }, amber: { bg: '#fdf6e3', bar: '#f96015', label: '#c2490d' }, red: { bg: '#f3e8cc', bar: '#d52518', label: '#d52518' } };

/** **bold** and ~~strike~~ inline markup (site's M component) with clickable English words. */
function Rich({ text, onWord }) {
  return String(text).split(/(~~[^~]+~~|\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.startsWith('~~') && p.endsWith('~~')) return <s key={i} className="text-[#a3335a]">{p.slice(2, -2)}</s>;
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-extrabold text-[#111]"><ClickableText text={p.slice(2, -2)} onWord={onWord} /></strong>;
    return <ClickableText key={i} text={p} onWord={onWord} />;
  });
}

/** "(a) Label: text" / "→ text" list-item formatting (site's D component). */
function Labeled({ text, onWord }) {
  const m = text.match(/^(\([a-z]\)|→)?\s*([^:]{2,48}):\s*(.+)$/);
  if (m) return <>{m[1] && <span className="mr-1 font-extrabold text-[#5f6a45]">{m[1]}</span>}<strong className="font-extrabold text-[#111]">{m[2]}:</strong> <Rich text={m[3]} onWord={onWord} /></>;
  const n = text.match(/^(\([a-z]\)|→)\s*(.+)$/);
  if (n) return <><span className="mr-1 font-extrabold text-[#5f6a45]">{n[1]}</span><Rich text={n[2]} onWord={onWord} /></>;
  return <Rich text={text} onWord={onWord} />;
}

function Block({ block: b, onWord }) {
  switch (b.kind) {
    case 'heading':
      return <h3 className={`mb-3 mt-5 ${QS} text-[17px] font-extrabold text-[#111] first:mt-0`}>{b.text}</h3>;
    case 'text':
      return <p className="mb-4 text-[15px] leading-[1.8] text-[#222]"><Labeled text={b.text} onWord={onWord} /></p>;
    case 'note': {
      const t = TONES[b.tone] || TONES.green;
      return (
        <div className="mb-4 flex gap-3.5 rounded-2xl border-2 border-[#111] px-5 py-4 md:px-6" style={{ background: t.bg }}>
          <div className="w-[5px] flex-none rounded" style={{ background: t.bar }} />
          <div>
            {b.title && <div className={`mb-1.5 ${QS} text-[12px] font-bold uppercase tracking-[1px]`} style={{ color: t.label }}>{b.title}</div>}
            <div className="whitespace-pre-line text-[14px] leading-[1.7] text-[#333]"><Rich text={b.text} onWord={onWord} /></div>
          </div>
        </div>
      );
    }
    case 'list':
      return (
        <div className="mb-4">
          {b.title && <div className={`mb-2 ${QS} text-[14px] font-bold text-[#111]`}>{b.title}</div>}
          {b.items.map((it, i) => (
            <div key={i} className="mb-1.5 flex gap-2 text-[14px] leading-[1.7] text-[#222]">
              <span className="flex-none font-bold text-[#5f6a45]">•</span>
              <span><Labeled text={it} onWord={onWord} /></span>
            </div>
          ))}
        </div>
      );
    case 'formula':
      return (
        <div className="mb-4 rounded-xl border-2 border-dashed border-[#111] bg-white px-4 py-3.5">
          {b.items[0]?.label && <div className={`mb-1.5 ${QS} text-[12px] font-bold uppercase tracking-[1px] text-[#8a8672]`}>{b.items[0].label}</div>}
          <div className="flex flex-col gap-1.5">{b.items.map((f, i) => <div key={i} className="font-mono text-[15px] font-bold text-[#111]">{f.pattern}</div>)}</div>
        </div>
      );
    case 'examples':
      return (
        <div className="mb-4 flex flex-col gap-2.5">
          {b.items.map((e, i) => (
            <div key={i} className="rounded-xl bg-[#eef0e2] px-4 py-3">
              <div className="text-[14px] font-semibold text-[#111]"><Rich text={e.en} onWord={onWord} /></div>
              {e.vi && <div className="mt-0.5 text-[13px] text-[#555]">{e.vi}</div>}
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className="mb-5 overflow-x-auto">
          <div className="min-w-[520px] overflow-hidden rounded-xl border-2 border-[#111]">
            <div className="flex bg-[#111]">{b.headers.map((h, i) => <div key={i} className={`flex-1 px-3.5 py-2.5 ${QS} text-[13px] font-bold text-[#ffc926]`}>{h}</div>)}</div>
            {b.rows.map((r, i) => (
              <div key={i} className="flex border-t border-[#ddd]">
                {r.map((c, j) => <div key={j} className="flex-1 border-r border-[#ddd] px-3.5 py-2.5 text-[13px] leading-[1.5] text-[#333] last:border-r-0"><Rich text={c} onWord={onWord} /></div>)}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

/** Tiny WebAudio blips like the site's hover/correct/wrong sounds. */
function useBlips(enabled) {
  const ctx = useRef(null);
  const beep = useCallback((freq, dur, vol) => {
    if (!enabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx.current ||= new AC();
      const c = ctx.current, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq; g.gain.value = vol;
      o.connect(g).connect(c.destination);
      g.gain.exponentialRampToValueAtTime(1e-4, c.currentTime + dur);
      o.start(); o.stop(c.currentTime + dur);
    } catch { /* audio unavailable */ }
  }, [enabled]);
  return useMemo(() => ({
    hover: () => beep(1400, 0.05, 0.012),
    correct: () => { beep(1500, 0.08, 0.02); setTimeout(() => beep(1900, 0.1, 0.016), 70); },
    wrong: () => { beep(320, 0.14, 0.018); setTimeout(() => beep(240, 0.16, 0.015), 90); },
  }), [beep]);
}

function useFullscreen(ref) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggle = () => (document.fullscreenElement ? document.exitFullscreen() : ref.current?.requestFullscreen?.())?.catch?.(() => {});
  return [on, toggle];
}

const CSS = `
@keyframes tidCtaBounce { 0%,60%,100% { transform: translateY(0) scale(1); } 75% { transform: translateY(-8px) scale(1.05); } 90% { transform: translateY(0) scale(1); } }
.grm-cta { animation: tidCtaBounce 5s ease-in-out infinite; }
.grm-cta:hover { animation-play-state: paused; transform: scale(1.06); }
.grm-nav { background: var(--tid-bg, transparent); transition: transform .15s, box-shadow .15s, background .15s; }
.grm-nav:hover { background: #ffd6e0; transform: translateY(-2px); box-shadow: 3px 3px 0 rgba(0,0,0,0.15); }
.grm-opt { transition: transform .15s, box-shadow .15s; }
.grm-opt:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 rgba(0,0,0,0.15); }
.grm-press { transition: transform .15s; }
.grm-press:hover { transform: translateY(-2px); }
.grm-noscroll { scrollbar-width: none; }
.grm-noscroll::-webkit-scrollbar { display: none; }
`;

export default function GrammarLesson({ lessonId, onExit, onSaveWord, speechVoice }) {
  const rootRef = useRef(null);
  const paneRef = useRef(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topicId, setTopicId] = useState(null);
  const [subId, setSubId] = useState(null);
  const [openTopic, setOpenTopic] = useState(undefined);
  const [view, setView] = useState('theory');
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(true);
  const [menu, setMenu] = useState(false);
  const [premium, setPremium] = useState(false);
  const [popup, setPopup] = useState(null);
  const [fs, toggleFs] = useFullscreen(rootRef);
  const blip = useBlips(sound);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadLesson(lessonId).then(l => { if (alive) { setLesson(l); setLoading(false); } }).catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [lessonId]);

  const topics = useMemo(() => (lesson ? buildLesson(lesson) : []), [lesson]);
  const topic = topics.find(t => t.id === topicId) ?? topics[0] ?? null;
  const sub = topic?.subs.find(s => s.id === subId) ?? topic?.subs[0] ?? null;
  const expanded = openTopic === undefined ? topics[0]?.id ?? null : openTopic;
  const quiz = sub?.quiz ?? [];
  const hasQuiz = quiz.length > 0, hasTheory = (sub?.blocks.length ?? 0) > 0;
  const mode = hasQuiz ? (hasTheory ? view : 'quiz') : 'theory';
  const q = quiz[qi], ans = answers[qi], answered = ans !== undefined, last = qi === quiz.length - 1;
  const score = Object.values(answers).filter(a => a.correct).length;

  const scroll = to => requestAnimationFrame(() => { const el = paneRef.current; el?.scrollTo({ top: to === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' }); });
  const openSub = (tid, s) => {
    setTopicId(tid); setSubId(s.id); setQi(0); setAnswers({}); setTyped(''); setDone(false);
    setView(s.quiz.length > 0 ? 'quiz' : 'theory'); setMenu(false); paneRef.current?.scrollTo({ top: 0 });
  };
  const answer = a => { setAnswers(p => ({ ...p, [qi]: a })); a.correct ? blip.correct() : blip.wrong(); scroll('bottom'); };
  const submitTyped = () => { if (!answered && q && typed.trim()) answer({ typed, correct: checkTyped(typed, q.answerText) }); };
  const next = () => { last ? setDone(true) : setQi(i => i + 1); setTyped(''); scroll('top'); };

  // keyboard: 1-5 choose option, Enter -> next
  useEffect(() => {
    const onKey = e => {
      if (mode !== 'quiz' || done || !q || e.target.tagName === 'INPUT') return;
      const n = Number(e.key);
      if (!answered && q.options.length && n >= 1 && n <= q.options.length) answer({ pick: n - 1, correct: n - 1 === q.correct });
      else if (answered && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onWord = useCallback((word, rect, sentence) => setPopup({ word, anchor: rect, context: sentence }), []);
  const meta = index.grm.find(l => l.lesson_id === lessonId) || index.advanced.find(l => l.lessonId === lessonId);

  if (loading) {
    return <div className="flex h-full min-h-[600px] items-center justify-center bg-[#6f8f4b]"><Loader2 className="animate-spin text-white" size={40} /></div>;
  }
  if (!lesson || topics.length === 0) {
    return (
      <div className="flex h-full min-h-[600px] flex-col items-center justify-center gap-4 bg-[#6f8f4b] px-6 text-center" style={GRID_BG}>
        <p className={`${QS} text-xl font-extrabold text-white`}>Không tải được bài học này.</p>
        {meta && <p className="max-w-md text-[14px] font-semibold text-white/80">“{meta.title}” chưa có trong dữ liệu offline của ứng dụng (bài học chưa được tải về từ website).</p>}
        <button onClick={onExit} className="rounded-xl border-[3px] border-[#111] bg-white px-5 py-2.5 text-sm font-bold text-[#111]">Quay lại Grammar</button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex h-full min-h-[640px] flex-col overflow-hidden bg-[#6f8f4b] p-3 md:p-7" style={{ fontFamily: 'var(--font-nunito), sans-serif', ...GRID_BG }}>
      <style>{CSS}</style>
      <header className="mx-auto mb-4 flex w-full max-w-[1500px] flex-none flex-wrap items-center justify-between gap-3 rounded-[20px] border-4 border-[#111] bg-white px-4 py-3.5 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:mb-5 md:px-7 md:py-5">
        <div className="flex items-center gap-3">
          <button onClick={onExit} aria-label="Quay lại Grammar" className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border-2 border-[#111] bg-[#f4f1e6] text-[#111] transition-transform hover:-translate-y-0.5"><ArrowLeft size={16} /></button>
          <h1 className={`${QS} text-[17px] font-extrabold leading-tight text-[#111] md:text-[26px]`}>NGỮ PHÁP TIẾNG ANH CHUYÊN SÂU</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSound(s => !s)} aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-white text-[#111] transition-transform hover:-translate-y-0.5">{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
          <button onClick={toggleFs} title={fs ? 'Thoát toàn màn hình' : 'Toàn màn hình'} className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-white text-[#111] transition-transform hover:-translate-y-0.5">{fs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button onClick={() => setMenu(m => !m)} aria-label="Mục lục" className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-white text-[#111] lg:hidden">{menu ? <X size={16} /> : <Menu size={16} />}</button>
          <span className="grm-cta hidden items-center gap-2 whitespace-nowrap rounded-xl bg-[#f5a623] px-4 py-2 text-[15px] font-extrabold text-[#111] sm:flex">Khoá học IELTS đảm bảo đầu ra <span className="underline">( tìm hiểu thêm )</span></span>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 items-stretch gap-6">
        <nav className={`grm-noscroll h-full overflow-y-auto rounded-[20px] border-4 border-[#111] bg-white p-3.5 shadow-[8px_8px_0_rgba(0,0,0,0.12)] lg:block lg:w-[300px] lg:flex-none ${menu ? 'block w-full' : 'hidden'}`}>
          {topics.map(t => {
            const open = expanded === t.id;
            return (
              <div key={t.id} className="border-b border-[#e2e2de] last:border-b-0">
                <div onClick={() => setOpenTopic(open ? null : t.id)} onMouseEnter={blip.hover} className="grm-nav flex cursor-pointer items-center justify-between rounded-[10px] px-2.5 py-3.5" style={{ '--tid-bg': open ? '#ffc926' : 'transparent' }}>
                  <div>
                    <div className={`${QS} text-[14px] font-bold text-[#111]`}>{t.number}. {t.title}</div>
                    <div className="mt-px text-[11px] font-semibold text-[#666]">{t.subtitle}</div>
                  </div>
                  <span className="text-[12px] text-[#555]">{open ? '▾' : '▸'}</span>
                </div>
                {open && (
                  <div className="flex flex-col gap-0.5 pb-2 pl-2.5 pt-1">
                    {t.subs.map(s => {
                      const info = [s.subtitle, s.quiz.length ? `${s.quiz.length} câu` : ''].filter(Boolean).join(' · ');
                      return (
                        <div key={s.id} onClick={() => openSub(t.id, s)} onMouseEnter={blip.hover} className="grm-nav cursor-pointer rounded-lg px-3 py-2.5" style={{ '--tid-bg': s.id === sub?.id ? '#e8f0c9' : 'transparent' }}>
                          <div className="text-[13px] font-semibold text-[#222]">{s.title}</div>
                          {info && <div className="mt-px text-[11px] font-semibold text-[#777]">{info}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <section ref={paneRef} className={`grm-noscroll h-full min-w-0 flex-1 overflow-y-auto rounded-[20px] border-4 border-[#111] bg-white p-5 shadow-[8px_8px_0_rgba(0,0,0,0.12)] md:p-8 ${menu ? 'hidden lg:block' : 'block'}`}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className={`mb-1 ${QS} text-[13px] font-bold uppercase tracking-[0.5px] text-[#8a8672]`}>{topic?.title}</div>
              <h2 className={`${QS} flex flex-wrap items-center gap-2 text-[20px] font-extrabold text-[#111] md:text-[26px]`}><span>{sub?.title}</span></h2>
              {sub?.subtitle && <p className="mt-1 text-[13px] font-semibold text-[#8a8672]">{sub.subtitle}</p>}
            </div>
            <div className="flex flex-none flex-wrap items-center gap-2.5">
              {hasQuiz && hasTheory && ['theory', 'quiz'].map(v => (
                <button key={v} onClick={() => setView(v)} onMouseEnter={blip.hover} className={`grm-press cursor-pointer whitespace-nowrap rounded-xl border-[3px] border-[#111] px-5 py-2.5 ${QS} text-[13px] font-bold`} style={{ background: mode === v ? '#2f5fa8' : '#fff', color: mode === v ? '#fff' : '#111' }}>
                  {v === 'theory' ? 'LÝ THUYẾT' : 'BÀI TẬP'}
                </button>
              ))}
              <button onClick={() => setPremium(true)} onMouseEnter={blip.hover} className={`grm-press flex flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border-[3px] border-[#111] bg-[#ffc926] px-4 py-2.5 ${QS} text-[13px] font-bold text-[#111] shadow-[2px_2px_0_#111]`}>
                <span>✨ TẠO BÀI TẬP</span><span className="rounded-md bg-[#111] px-1.5 py-0.5 text-[10px] font-extrabold text-[#ffc926]">PRO</span>
              </button>
            </div>
          </div>

          {mode === 'theory' && (hasTheory ? sub.blocks.map((b, i) => <Block key={i} block={b} onWord={onWord} />) : <p className="text-[15px] text-[#666]">Mục này chưa có phần lý thuyết.</p>)}

          {mode === 'quiz' && hasQuiz && (done ? (
            <div className="px-5 py-12 text-center">
              <div className={`mb-2.5 ${QS} text-[20px] font-extrabold text-[#111]`}>HOÀN THÀNH!</div>
              <div className={`mb-6 inline-block rounded-2xl border-[3px] border-[#111] bg-[#ffc926] px-7 py-4 ${QS} text-[22px] font-extrabold text-[#111]`}>Điểm: {score} / {quiz.length}</div>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => { setQi(0); setAnswers({}); setTyped(''); setDone(false); paneRef.current?.scrollTo({ top: 0 }); }} className={`grm-press cursor-pointer rounded-xl border-[3px] border-[#111] bg-[#111] px-6 py-3 ${QS} text-[14px] font-bold text-[#ffc926] shadow-[4px_4px_0_#f96015]`}>LÀM LẠI →</button>
                {hasTheory && <button onClick={() => setView('theory')} className={`grm-press cursor-pointer rounded-xl border-[3px] border-[#111] bg-white px-6 py-3 ${QS} text-[14px] font-bold text-[#111]`}>ÔN LẠI LÝ THUYẾT</button>}
              </div>
            </div>
          ) : q && (
            <>
              {sub?.intro && <div className="mb-5 rounded-xl border-2 border-dashed border-[#c9c6b6] bg-[#faf9f2] px-4 py-3 text-[13px] font-semibold leading-[1.6] text-[#5f6a45]">{sub.intro}</div>}
              <div className="mb-2 text-[13px] font-bold text-[#8a8672]">CÂU {qi + 1} / {quiz.length}<span className="ml-2 font-semibold text-[#b3b0a2]">(đề số {q.number})</span></div>
              <div className="mb-5 h-2 overflow-hidden rounded-md border-2 border-[#111] bg-[#eee]"><div className="h-full bg-[#6b8944] transition-[width] duration-300" style={{ width: `${Math.round(((qi + (answered ? 1 : 0)) / quiz.length) * 100)}%` }} /></div>
              <div className="mb-6 text-[17px] font-bold leading-[1.5] text-[#111] md:text-[18px]"><ClickableText text={q.text} onWord={onWord} /></div>
              {q.options.length > 0 ? (
                <div className="mb-7 flex flex-col gap-3">
                  {q.options.map((o, i) => {
                    let border = '#111', bg = '#fff', chipBg = '#f4f1e6', chipFg = '#111';
                    if (answered) {
                      if (i === q.correct) { border = '#18542a'; bg = '#f3fbf1'; chipBg = '#18542a'; chipFg = '#fff'; }
                      else if (i === ans?.pick) { border = '#d52518'; bg = '#fdf3f2'; chipBg = '#d52518'; chipFg = '#fff'; }
                    }
                    return (
                      <div key={i} onClick={() => !answered && answer({ pick: i, correct: i === q.correct })} onMouseEnter={answered ? undefined : blip.hover} className={`grm-opt flex items-center gap-3.5 rounded-2xl border-[3px] px-4 py-3 ${answered ? 'cursor-default' : 'cursor-pointer'}`} style={{ borderColor: border, background: bg }}>
                        <div className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border-2 border-[#111] ${QS} text-[15px] font-extrabold`} style={{ background: chipBg, color: chipFg }}>{o.letter}</div>
                        <div className="text-[15px] font-semibold text-[#111]">{o.text}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mb-7 flex flex-wrap items-center gap-3">
                  <input value={answered ? ans?.typed ?? '' : typed} onChange={e => setTyped(e.target.value)} onKeyDown={e => e.key === 'Enter' && (answered ? next() : submitTyped())} disabled={answered} placeholder="Nhập đáp án…" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 rounded-xl border-[3px] px-4 py-3 text-[15px] font-semibold text-[#111] outline-none disabled:bg-[#faf9f5]" style={{ borderColor: answered ? (ans?.correct ? '#18542a' : '#d52518') : '#111' }} />
                  {!answered && <button onClick={submitTyped} onMouseEnter={blip.hover} className={`grm-press cursor-pointer rounded-xl border-[3px] border-[#111] bg-[#111] px-6 py-3 ${QS} text-[14px] font-bold text-[#ffc926] shadow-[4px_4px_0_#f96015]`}>KIỂM TRA</button>}
                </div>
              )}
              {answered && (
                <div className="mb-5 flex gap-3.5 rounded-2xl border-2 border-[#111] px-5 py-4" style={{ background: ans?.correct ? '#e3f5e8' : '#fce3df' }}>
                  <div className="w-[5px] flex-none rounded" style={{ background: ans?.correct ? '#2f8f3f' : '#c23b3b' }} />
                  <div>
                    <div className={`mb-1.5 ${QS} text-[13px] font-extrabold tracking-[0.5px]`} style={{ color: ans?.correct ? '#2f8f3f' : '#c23b3b' }}>{ans?.correct ? '✓ CHÍNH XÁC' : '✗ CHƯA ĐÚNG'}</div>
                    {q.options.length === 0 && <div className="mb-1.5 text-[14px] font-bold text-[#111]">Đáp án: {q.answerText}</div>}
                    <div className="text-[14px] leading-[1.7] text-[#333]">{q.explanation || `Đáp án đúng là "${q.answerText}".`}</div>
                  </div>
                </div>
              )}
              {answered && <button onClick={next} className={`grm-press cursor-pointer rounded-xl border-[3px] border-[#111] bg-[#111] px-6 py-3 ${QS} text-[14px] font-bold text-[#ffc926] shadow-[4px_4px_0_#f96015]`}>{last ? 'XEM KẾT QUẢ →' : 'CÂU TIẾP THEO →'}</button>}
            </>
          ))}
        </section>
      </div>

      {premium && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setPremium(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-[24px] border-[3px] border-[#111] bg-white p-7 text-center shadow-[8px_8px_0_#111]">
            <div className={`${QS} mb-2 text-[22px] font-extrabold text-[#111]`}>Tạo bài tập bằng AI</div>
            <p className="text-[15px] leading-relaxed text-[#444]">Tính năng tạo bài tập bằng AI là quyền dành riêng cho gói <span className="font-bold text-amber-600">TIDian đầy đủ</span>.</p>
            <p className="mt-2 text-[13px] text-[#8a8672]">(Không có trong bản offline — hãy luyện các bài tập có sẵn trong mỗi mục.)</p>
            <button onClick={() => setPremium(false)} className={`mt-5 rounded-xl border-[3px] border-[#111] bg-[#ffc926] px-6 py-2.5 ${QS} text-[14px] font-bold text-[#111]`}>Đã hiểu</button>
          </div>
        </div>
      )}
      {popup && <SaveWordPopup {...popup} tag="Grammar" onClose={() => setPopup(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />}
    </div>
  );
}
