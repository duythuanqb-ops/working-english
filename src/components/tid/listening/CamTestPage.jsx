// /practice/listening/cam-test/<testId>?mode=practice|real_test[&part=N&focus=gap]
// Part chooser (practice), exam-room gate (real test) and the test player.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Clock, FileText, Headphones, Pause, Play, Volume2 } from 'lucide-react';
import { LISTENING_INDEX, loadLesson, loadTest } from './data';
import { PAGE_BG, PX_ROOT, PxBackLink, saveProgress } from './px';
import { SoundBars } from '../weKit';

const PART_COLORS = [
  { bg: '#F8BE33', fg: '#1E1B4B', soft: '#FFF6DA' },
  { bg: '#5BA4E0', fg: '#1E1B4B', soft: '#E6F2FB' },
  { bg: '#F2683A', fg: '#FFFFFF', soft: '#FFEAE6' },
  { bg: '#7A58C2', fg: '#FFFFFF', soft: '#F0EAFB' },
];
const TYPE_LABEL = {
  table_completion: 'Table', note_completion: 'Note', form_completion: 'Form', sentence_completion: 'Sentence', summary_completion: 'Summary',
  flow_chart_completion: 'Flow-chart', flowchart_completion: 'Flow-chart', multiple_choice: 'MCQ', multiple_choice_multi: 'MCQ ×2', matching: 'Matching',
  map_labelling: 'Map/Plan', plan_labelling: 'Map/Plan', diagram_labelling: 'Diagram', short_answer: 'Short answer',
};
const GAP_TYPES = /^(note|table|form|sentence|flow_?chart|summary)_?completion$/;
const gapNums = s => [...String(s).matchAll(/\{(\d+)\}/g)].map(m => Number(m[1]));

/** Question numbers covered by a block. */
function blockNums(b) {
  const c = b.content || {};
  switch (b.type) {
    case 'multiple_choice': return (c.questions || []).map(q => q.qNum ?? q.number);
    case 'multiple_choice_multi': return Array.from({ length: c.count || 2 }, (_, k) => (c.qNum ?? 1) + k);
    case 'table_completion': return (c.tableRows || []).flat().flatMap(gapNums);
    case 'matching': return (c.items || c.questions || []).map(q => q.qNum ?? q.number);
    default: return gapNums(c.template || '');
  }
}
function typeRanges(section) {
  return section.blocks.map(b => { const n = blockNums(b).filter(Boolean); return n.length ? { type: TYPE_LABEL[b.type] || b.type, from: Math.min(...n), to: Math.max(...n) } : null; }).filter(Boolean);
}
const partRange = n => [(n - 1) * 10 + 1, n * 10];
const fmtClock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------- lesson transcripts (dictation lessons share Cam/Test/Part) ----------
function lessonIdFor(test, part) {
  const want = `cam${test.volume} - test ${test.testNumber} - part ${part}`;
  return LISTENING_INDEX.library.find(l => l.title.toLowerCase().replace(/\s+/g, ' ') === want)?.id ?? null;
}

// ---------- pages ----------
function PixelHeader({ badge, title, subtitle, onBack, backLabel, badgeIcon = true }) {
  return (
    <header className="we-skill-hero we-skill-hero--listening border-b-[3px] border-[#1E1B4B]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-[4%] opacity-60">
        <SoundBars count={18} className="!h-12" />
        <SoundBars count={18} className="!h-12" color="var(--we-coral)" />
      </div>
      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col items-center gap-3.5 px-5 pb-10 pt-7 text-center">
        <PxBackLink onClick={onBack} label={backLabel} />
        <span className="mt-2 inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-[#1E1B4B] bg-[#F8BE33] px-4 py-1.5 text-[13px] font-extrabold uppercase tracking-[.1em] text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B]">
          {badgeIcon && <Headphones className="h-4 w-4" />}{badge}
        </span>
        <h1 className="px-display px-outline m-0 max-w-full break-words text-[clamp(28px,5vw,48px)] uppercase leading-[1.15] [--px-drop:5px] [--px-stroke:7px]">{title}</h1>
        {subtitle && <p className="m-0 text-base font-bold text-[#FFF8E7]">{subtitle}</p>}
      </div>
    </header>
  );
}

function PartChooser({ test, onPick, onBack }) {
  const ranges = useMemo(() => new Map(test.sections.map(s => [s.sectionNumber, typeRanges(s)])), [test]);
  return (
    <div className={`${PX_ROOT} min-h-screen `} style={PAGE_BG}>
      <PixelHeader badge="Luyện tập" title={test.testName} subtitle="Chọn phần muốn luyện nghe" onBack={onBack} backLabel="Quay lại danh sách đề" />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {test.sections.map((s, i) => {
            const c = PART_COLORS[i % 4];
            const r = ranges.get(s.sectionNumber) ?? [];
            const [a, b] = partRange(s.sectionNumber);
            return (
              <button key={s.sectionNumber} type="button" onClick={() => onPick(s.sectionNumber)} className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border-[3px] border-[#1E1B4B] bg-white text-left shadow-[0_6px_0_#1E1B4B] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_6px_0_#1E1B4B] active:translate-y-0.5 active:shadow-[0_4px_0_#1E1B4B]">
                <span className="flex items-center justify-between gap-3 border-b-4 border-[#1E1B4B] px-4 py-3" style={{ background: c.bg, color: c.fg }}>
                  <span className="px-display text-lg leading-none">PART {s.sectionNumber}</span>
                  <span className="text-xs font-extrabold">Q {a}–{b}</span>
                </span>
                <span className="flex flex-1 flex-col gap-3 p-4" style={{ background: c.soft }}>
                  <span className="line-clamp-2 text-[17px] font-extrabold leading-snug text-[#1E1B4B]">{s.title || `Section ${s.sectionNumber}`}</span>
                  {r.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {r.map(t => (
                        <span key={`${t.type}-${t.from}`} className="rounded-md border-2 border-[#1E1B4B] bg-white px-1.5 py-0.5 text-[11px] font-extrabold uppercase leading-tight text-[#1E1B4B]">
                          <span className="whitespace-nowrap">{t.type}</span> <span className="whitespace-nowrap">{t.from === t.to ? t.from : `${t.from}–${t.to}`}</span>
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-auto flex items-center justify-between gap-3 pt-1">
                    <span className="text-[13px] font-bold text-[#6B6790]">10 câu</span>
                    <span aria-hidden="true" className="px-display grid h-9 w-9 place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] text-sm text-[#1E1B4B] transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => onPick('full')} className="group mt-6 flex w-full cursor-pointer items-center gap-4 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#4F46E5] px-5 py-4 text-left text-white shadow-[0_6px_0_#1E1B4B] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_6px_0_#1E1B4B]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] text-[#1E1B4B]"><BookOpen className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="px-display block text-lg uppercase leading-tight">Toàn bài (Full test)</span>
            <span className="text-sm font-semibold text-white/80">Part 1 → 4 · 40 câu</span>
          </span>
          <span aria-hidden="true" className="px-display text-xl transition-transform group-hover:translate-x-1">→</span>
        </button>
      </main>
    </div>
  );
}

function ExamGate({ test, onStart, onBack }) {
  const [mode, setMode] = useState(() => { try { return localStorage.getItem('tid_exam_mode_pref') === 'hard' ? 'hard' : 'normal'; } catch { return 'normal'; } });
  const [count, setCount] = useState(null);
  const fsOk = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const hard = mode === 'hard';
  const pick = m => { setMode(m); try { localStorage.setItem('tid_exam_mode_pref', m); } catch { /* ignore */ } };
  const rules = [
    { icon: '♫', text: <>Tai nghe sẵn sàng · <b>40:00</b> đếm theo giờ thật, không dừng</> },
    { icon: '✕', text: 'Không từ điển, không công cụ dịch' },
    ...(hard ? [
      { warn: true, icon: '!', text: 'Mọi lần rời màn hình thi được ghi vào báo cáo Liêm chính (lưu trên máy của bạn)' },
      { warn: true, icon: '⤢', text: fsOk ? <>Vào là chuyển toàn màn hình. <b>Thoát quá 10 giây → bài tự nộp.</b></> : 'Thiết bị không hỗ trợ toàn màn hình — bài thi vẫn tính bình thường' },
    ] : []),
  ];
  const start = async () => {
    let fs = false;
    if (hard && fsOk) { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); fs = true; } catch { fs = false; } }
    setCount(3);
    let n = 3;
    const t = setInterval(() => { n -= 1; if (n <= 0) { clearInterval(t); onStart({ hard, fullscreen: fs }); } else setCount(n); }, 800);
  };
  const card = m => {
    const on = mode === m, ring = m === 'hard' ? '#F2683A' : '#F8BE33';
    return (
      <button key={m} type="button" role="radio" aria-checked={on} disabled={count !== null} onClick={() => pick(m)}
        className="flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#1E1B4B] p-0 text-left text-[#1E1B4B] transition-[transform,box-shadow] duration-150 sm:rounded-[24px] sm:border-4"
        style={{ boxShadow: on ? `0 8px 0 #1E1B4B, 0 0 0 5px ${ring}` : '0 5px 0 #1E1B4B', transform: on ? 'translateY(-3px)' : 'none' }}>
        <div className="grid h-[86px] place-items-center sm:h-[120px]" style={{ background: m === 'hard' ? 'linear-gradient(180deg,#3A1F2A,#F2683A)' : 'linear-gradient(180deg,#6BB9EA,#BCE2F6)' }}>
          <span className="text-4xl sm:text-5xl">{m === 'hard' ? '🔥' : '🎧'}</span>
        </div>
        <div className="flex flex-1 flex-col gap-1 border-t-[3px] border-[#1E1B4B] px-2.5 py-2.5 sm:gap-1.5 sm:border-t-4 sm:px-5 sm:py-3.5" style={{ background: on ? (m === 'hard' ? '#FFE1DA' : '#FFF0C2') : '#FFFFFF' }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="grid h-5 w-5 flex-none place-items-center rounded-full border-[3px] border-[#1E1B4B] bg-white sm:h-[26px] sm:w-[26px] sm:border-4"><span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ background: on ? '#1E1B4B' : 'transparent' }} /></span>
            <span className={`px-display whitespace-nowrap text-[15px] leading-[1.1] sm:text-xl lg:text-[22px] ${m === 'hard' ? 'text-[#F2683A]' : ''}`}>{m === 'hard' ? 'Thi cực căng' : 'Thi thường'}</span>
            <span className={`ml-auto hidden flex-none whitespace-nowrap rounded-full border-2 border-[#1E1B4B] px-2.5 py-1 text-[11px] font-extrabold tracking-[.06em] md:inline-block ${m === 'hard' ? 'bg-[#F2683A] text-white' : 'bg-[#DCF0FD]'}`}>{m === 'hard' ? 'BÙNG CHÁY' : 'CHILL'}</span>
          </div>
          <span className="text-xs font-semibold leading-snug sm:text-[15px]">{m === 'hard' ? 'Toàn màn hình + Liêm chính' : 'Đồng hồ chuẩn, giao diện thi thật'}</span>
        </div>
      </button>
    );
  };
  return (
    <div className={`${PX_ROOT} min-h-screen select-none `} style={PAGE_BG}>
      <div className="relative min-h-full overflow-x-clip">
        <div aria-hidden="true" className="we-skill-hero we-skill-hero--reading absolute inset-x-0 top-0 h-[300px] border-b-[3px] border-[#1E1B4B]" />
        <main className="relative z-[2] mx-auto max-w-[1080px] px-[clamp(12px,3vw,40px)] pb-8 pt-5">
          <PxBackLink onClick={onBack} label="Quay lại danh sách đề" />
          <section className="mt-4 flex flex-col items-center gap-4 rounded-[30px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-[clamp(18px,2.4vw,30px)] shadow-[0_6px_0_#1E1B4B]">
            <div className="flex max-w-full flex-col items-center gap-2.5 text-center">
              <span className="-rotate-2 rounded-full border-[3px] border-[#1E1B4B] bg-[#F2683A] px-4 py-1 text-[13px] font-extrabold tracking-[.1em] text-white">PHÒNG THI IELTS LISTENING</span>
              <h1 className="px-display px-outline m-0 max-w-full break-words text-[clamp(19px,2.6vw,34px)] leading-[1.12] [--px-drop:5px] [--px-stroke:7px]">{test.testName}</h1>
            </div>
            <div role="radiogroup" aria-label="Chế độ thi" className="grid w-full grid-cols-2 gap-3 sm:gap-5">{card('normal')}{card('hard')}</div>
            <ul className="grid w-full gap-1.5 sm:grid-cols-2 sm:gap-2.5">
              {rules.map((r, i) => (
                <li key={i} className={`flex items-center gap-2.5 rounded-xl border-2 border-[#1E1B4B] px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:border-[3px] sm:px-3.5 sm:py-2.5 ${r.warn ? 'bg-[#FFF0C2]' : 'bg-white'}`}>
                  <span aria-hidden="true" className={`grid h-7 w-7 flex-none place-items-center rounded-lg border-2 border-[#1E1B4B] text-sm font-black leading-none sm:h-[30px] sm:w-[30px] sm:rounded-[10px] sm:border-[3px] ${r.warn ? 'bg-[#F8BE33]' : 'bg-[#DCF0FD]'}`}>{r.icon}</span>
                  <span className="text-[13px] font-semibold leading-snug sm:text-[15px]">{r.text}</span>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-3 z-10 w-full">
              {count !== null ? (
                <div className="flex w-full flex-col items-center gap-1 rounded-[18px] border-[3px] border-[#1E1B4B] bg-white py-2.5 shadow-[0_6px_0_#1E1B4B]">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#1E1B4B]/60">Chuẩn bị bắt đầu trong</p>
                  <div className="px-display px-outline text-5xl leading-none [--px-drop:4px] [--px-stroke:6px]">{count}</div>
                </div>
              ) : (
                <button type="button" onClick={start} className="px-display flex w-full cursor-pointer items-center justify-center gap-3 rounded-[18px] border-[3px] border-[#1E1B4B] px-5 py-[18px] text-center text-[clamp(17px,2vw,21px)] leading-[1.2] text-white shadow-[0_6px_0_#1E1B4B] transition-[transform,box-shadow] hover:-translate-y-0.5" style={{ background: hard ? '#F2683A' : '#4F46E5' }}>
                  Vào phòng thi{hard ? ' · Thi cực căng' : ''} →
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NoQuestions({ testId, onBack, go }) {
  const meta = LISTENING_INDEX.camTests.find(t => t.testId === testId);
  const parts = meta ? [1, 2, 3, 4].map(p => ({ p, id: lessonIdFor(meta, p) })) : [];
  return (
    <div className={`${PX_ROOT} min-h-screen `} style={PAGE_BG}>
      <PixelHeader badge="Thi thật" title={meta?.testName || testId} subtitle="Đề này chưa có câu hỏi trong dữ liệu offline" onBack={onBack} backLabel="Quay lại danh sách đề" />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <div className="rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-6 shadow-[0_6px_0_#1E1B4B]">
          <p className="text-[15px] font-semibold leading-relaxed">Câu hỏi, đáp án và audio của đề thi này chưa được tải về máy (việc tải dữ liệu từ trang gốc đã dừng). Bạn vẫn có thể luyện nghe-chép chính tả từng part của đề này với transcript đầy đủ:</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {parts.filter(x => x.id).map(({ p, id }) => (
              <button key={p} type="button" onClick={() => go({ name: 'lesson', id })} className="flex items-center gap-3 rounded-2xl border-[3px] border-[#1E1B4B] bg-white px-4 py-3 text-left font-extrabold shadow-[0_4px_0_#1E1B4B] transition-transform hover:-translate-y-0.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1E1B4B]" style={{ background: PART_COLORS[p - 1].bg }}><FileText className="h-4 w-4" /></span>
                Part {p} · Dictation
                <span className="ml-auto px-display">→</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- question blocks ----------
function GapInput({ n, value, onChange, disabled, focus }) {
  return (
    <span className="mx-0.5 inline-flex items-baseline gap-1 align-baseline">
      <span className="text-[12px] font-extrabold text-[#4F46E5]">({n})</span>
      <input id={`q-${n}`} type="text" value={value || ''} disabled={disabled} onChange={e => onChange(n, e.target.value)} onFocus={() => focus(n)} autoComplete="off" spellCheck={false}
        className="h-8 w-[150px] rounded-md border-2 border-[#1E1B4B]/30 bg-white px-2 text-[15px] font-semibold text-[#1E1B4B] outline-none transition-colors focus:border-[#4F46E5] disabled:bg-slate-50" />
    </span>
  );
}

function RichLine({ text, ctx }) {
  // **bold**, and {n} gaps
  const parts = String(text).split(/(\{\d+\}|\*\*[^*]+\*\*)/g).filter(p => p !== '');
  return parts.map((p, i) => {
    const g = p.match(/^\{(\d+)\}$/);
    if (g) return <GapInput key={i} n={Number(g[1])} value={ctx.answers[g[1]]} onChange={ctx.setAnswer} disabled={ctx.locked} focus={ctx.setFocusQ} />;
    const b = p.match(/^\*\*([^*]+)\*\*$/);
    if (b) return <strong key={i} className="font-extrabold">{b[1]}</strong>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

function TemplateBlock({ template, ctx }) {
  return (
    <div className="space-y-1.5 text-[15.5px] leading-[2]">
      {String(template).split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        const bullet = /^[-•–]\s*/.test(t);
        const body = t.replace(/^[-•–]\s*/, '');
        if (/^\*\*[^*]+\*\*$/.test(t)) return <p key={i} className="pt-2 text-[16px] font-extrabold">{t.replace(/\*\*/g, '')}</p>;
        return <p key={i} className={bullet ? 'flex gap-2 pl-3' : ''}>{bullet && <span className="select-none">•</span>}<span><RichLine text={body} ctx={ctx} /></span></p>;
      })}
    </div>
  );
}

function TableBlock({ content, ctx }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14.5px] leading-[1.9]">
        {content.tableHeaders && (
          <thead><tr>{content.tableHeaders.map((h, i) => <th key={i} className="border-2 border-[#1E1B4B] bg-[#FFF0C2] px-3 py-2 text-left font-extrabold">{h}</th>)}</tr></thead>
        )}
        <tbody>
          {content.tableRows.map((row, r) => (
            <tr key={r}>{row.map((cell, c) => (
              <td key={c} className="border-2 border-[#1E1B4B] px-3 py-2 align-top">
                {String(cell).split('\n').filter(s => s.trim()).map((l, k) => <div key={k}><RichLine text={l.replace(/^-\s*/, '• ')} ctx={ctx} /></div>)}
              </td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function McqBlock({ content, ctx }) {
  return (
    <div className="space-y-5">
      {(content.questions || []).map(q => {
        const n = q.qNum ?? q.number;
        return (
          <div key={n} id={`q-${n}`} className="scroll-mt-28">
            <p className="text-[15.5px] font-bold"><span className="mr-2 inline-grid h-7 min-w-7 place-items-center rounded-lg bg-[#1E1B4B] px-1.5 text-[13px] text-white">{n}</span>{q.text}</p>
            <div className="mt-2 grid gap-1.5 pl-9">
              {q.options.map((o, k) => {
                const L = LETTERS[k];
                const on = ctx.answers[n] === L;
                return (
                  <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-2 text-[15px] transition-colors ${on ? 'border-[#4F46E5] bg-[#EEF1FF]' : 'border-transparent hover:bg-[#FFF8E6]'}`}>
                    <input type="radio" name={`q${n}`} className="sr-only" checked={on} disabled={ctx.locked} onChange={() => { ctx.setAnswer(n, L); ctx.setFocusQ(n); }} />
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[12px] font-extrabold ${on ? 'border-[#4F46E5] bg-[#4F46E5] text-white' : 'border-[#1E1B4B]/40'}`}>{L}</span>
                    <span>{o}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function McqMultiBlock({ content, ctx }) {
  const first = content.qNum ?? 1, count = content.count || 2;
  const nums = Array.from({ length: count }, (_, k) => first + k);
  const chosen = (ctx.answers[first] || '').split(',').filter(Boolean);
  const toggle = id => {
    if (ctx.locked) return;
    let next = chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen, id];
    if (next.length > count) next = next.slice(next.length - count);
    ctx.setAnswer(first, next.sort().join(','));
    nums.slice(1).forEach(n => ctx.setAnswer(n, next.length ? '·' : ''));
    ctx.setFocusQ(first);
  };
  return (
    <div id={`q-${first}`} className="scroll-mt-28">
      <p className="text-[15.5px] font-bold"><span className="mr-2 inline-grid h-7 place-items-center rounded-lg bg-[#1E1B4B] px-2 text-[13px] text-white">{first}–{nums[nums.length - 1]}</span>{content.text}</p>
      <div className="mt-2 grid gap-1.5 pl-9">
        {content.options.map(o => {
          const on = chosen.includes(o.id);
          return (
            <button key={o.id} type="button" onClick={() => toggle(o.id)} className={`flex items-start gap-3 rounded-xl border-2 px-3 py-2 text-left text-[15px] transition-colors ${on ? 'border-[#4F46E5] bg-[#EEF1FF]' : 'border-transparent hover:bg-[#FFF8E6]'}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 text-[12px] font-extrabold ${on ? 'border-[#4F46E5] bg-[#4F46E5] text-white' : 'border-[#1E1B4B]/40'}`}>{o.id}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchingBlock({ content, ctx }) {
  const opts = content.options || [];
  return (
    <div className="space-y-3">
      {opts.length > 0 && (
        <div className="rounded-xl border-2 border-[#1E1B4B]/20 bg-white p-3 text-[14.5px]">
          {opts.map((o, k) => <p key={k}><b className="mr-2">{o.id ?? LETTERS[k]}</b>{o.text ?? o}</p>)}
        </div>
      )}
      {(content.items || content.questions || []).map(q => {
        const n = q.qNum ?? q.number;
        return (
          <div key={n} id={`q-${n}`} className="flex items-center gap-3 text-[15px]">
            <span className="inline-grid h-7 min-w-7 place-items-center rounded-lg bg-[#1E1B4B] px-1.5 text-[13px] font-bold text-white">{n}</span>
            <span className="flex-1">{q.text}</span>
            <select value={ctx.answers[n] || ''} disabled={ctx.locked} onChange={e => ctx.setAnswer(n, e.target.value)} className="h-9 rounded-lg border-2 border-[#1E1B4B]/30 bg-white px-2 font-bold">
              <option value="">–</option>
              {opts.map((o, k) => { const id = o.id ?? LETTERS[k]; return <option key={id} value={id}>{id}</option>; })}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function Block({ block, ctx }) {
  const c = block.content || {};
  let body;
  if (block.type === 'table_completion') body = <TableBlock content={c} ctx={ctx} />;
  else if (block.type === 'multiple_choice') body = <McqBlock content={c} ctx={ctx} />;
  else if (block.type === 'multiple_choice_multi') body = <McqMultiBlock content={c} ctx={ctx} />;
  else if (block.type === 'matching' || /labell?ing/.test(block.type)) body = <MatchingBlock content={c} ctx={ctx} />;
  else body = <TemplateBlock template={c.template || ''} ctx={ctx} />;
  const nums = blockNums(block).filter(Boolean);
  return (
    <section className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-white p-5 shadow-[0_5px_0_#1E1B4B]">
      {nums.length > 0 && <p className="px-display text-[13px] uppercase text-[#4F46E5]">Questions {Math.min(...nums)}{nums.length > 1 ? `–${Math.max(...nums)}` : ''}</p>}
      {block.instruction && <p className="mt-1 text-[14.5px] font-semibold italic text-[#1E1B4B]/75">{block.instruction}</p>}
      {block.heading && <h3 className="mt-3 text-center text-[17px] font-extrabold">{block.heading}</h3>}
      <div className="mt-4">{body}</div>
    </section>
  );
}

// ---------- transcript panel ----------
function Transcript({ test, part }) {
  const [lesson, setLesson] = useState(undefined);
  const audio = useRef(null);
  const [playing, setPlaying] = useState(null);
  useEffect(() => {
    const id = lessonIdFor(test, part);
    if (!id) { setLesson(null); return undefined; }
    let off = false;
    loadLesson(id).then(l => { if (!off) setLesson(l); });
    return () => { off = true; audio.current?.pause(); };
  }, [test, part]);
  const play = (c, i) => {
    audio.current?.pause();
    if (playing === i) { setPlaying(null); return; }
    const a = new Audio(c.audioSrc);
    audio.current = a;
    a.onended = () => setPlaying(null);
    a.play().catch(() => setPlaying(null));
    setPlaying(i);
  };
  if (lesson === undefined) return <p className="text-sm font-semibold text-slate-500">Đang tải script…</p>;
  if (!lesson) return <p className="text-sm font-semibold text-slate-500">Chưa có transcript cho part này.</p>;
  return (
    <ol className="space-y-1">
      {lesson.challenges.map((c, i) => (
        <li key={i} className={`flex items-start gap-2 rounded-lg px-1.5 py-1 ${playing === i ? 'bg-[#EAF7E1]' : ''}`}>
          <button type="button" onClick={() => play(c, i)} title="Nghe lại đoạn này" className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1E1B4B]/10 hover:bg-[#F8BE33]">
            {playing === i ? <Pause className="h-3 w-3" /> : <Play className="ml-0.5 h-3 w-3 fill-current" />}
          </button>
          <span className="text-[14.5px] leading-relaxed">{c.content}</span>
        </li>
      ))}
    </ol>
  );
}

// ---------- test player ----------
function TestRunner({ test, mode, part, focus, hard, onExit }) {
  const real = mode === 'real_test';
  const sections = useMemo(() => {
    const list = part === 'full' || real ? test.sections : test.sections.filter(s => s.sectionNumber === part);
    if (focus !== 'gap') return list;
    return list.map(s => ({ ...s, blocks: s.blocks.filter(b => GAP_TYPES.test(b.type)) }));
  }, [test, part, real, focus]);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [focusQ, setFocusQ] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioPart, setAudioPart] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [aTime, setATime] = useState(0);
  const [aDur, setADur] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const audio = useRef(null);
  const LIMIT = 40 * 60;

  const section = sections[cur];
  const allNums = useMemo(() => sections.flatMap(s => s.blocks.flatMap(blockNums)).filter(Boolean), [sections]);
  const answered = n => !!(answers[n] && answers[n] !== '');
  const setAnswer = useCallback((n, v) => setAnswers(a => ({ ...a, [n]: v })), []);
  const ctx = { answers, setAnswer, locked: submitted, setFocusQ };

  // clock
  useEffect(() => {
    if (submitted) return undefined;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [submitted]);
  useEffect(() => { if (real && elapsed >= LIMIT && !submitted) doSubmit(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [elapsed]);

  // hard mode: count leaving the exam screen
  useEffect(() => {
    if (!hard || submitted) return undefined;
    const onVis = () => { if (document.hidden) setLeaves(n => n + 1); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [hard, submitted]);

  // audio: real test plays part 1→4 continuously; practice follows the selected part
  const audioIdx = real ? audioPart : cur;
  useEffect(() => {
    const a = audio.current;
    const s = sections[audioIdx];
    if (!a || !s) return;
    a.src = s.audioSrc;
    if (real || playing) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioIdx]);
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  useEffect(() => () => { audio.current?.pause(); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); }, []);

  const onEnded = () => {
    if (real && audioPart + 1 < sections.length) { setAudioPart(audioPart + 1); setCur(audioPart + 1); } else setPlaying(false);
  };

  const doSubmit = () => {
    setConfirm(false);
    setSubmitted(true);
    audio.current?.pause();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    const done = allNums.filter(answered).length;
    const id = focus === 'gap' ? `gap:${test.testId}:p${part}` : `cam:${test.testId}`;
    saveProgress('listening', id, { done, total: allNums.length, completed: true });
    window.scrollTo?.(0, 0);
  };

  const jump = n => {
    const si = sections.findIndex(s => s.blocks.some(b => blockNums(b).includes(n)));
    if (si >= 0) setCur(si);
    setFocusQ(n);
    setTimeout(() => document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const remaining = Math.max(0, LIMIT - elapsed);
  const nums = section ? section.blocks.flatMap(blockNums).filter(Boolean) : [];
  const answeredCount = allNums.filter(answered).length;

  return (
    <div className="min-h-screen bg-[#F4F1E6] font-be-vietnam text-[#1E1B4B]">
      <audio ref={audio} preload="none" onEnded={onEnded} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setATime(e.currentTarget.currentTime)} onDurationChange={e => setADur(e.currentTarget.duration || 0)} className="hidden" />

      {/* top bar */}
      <header className="sticky top-0 z-30 border-b-4 border-[#1E1B4B] bg-[#1E1B4B] text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 py-2.5">
          <button type="button" onClick={onExit} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-[13px] font-bold hover:bg-white/20"><ChevronLeft className="h-4 w-4" />Thoát</button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#F8BE33]">{real ? (hard ? 'Thi thật · Thi cực căng' : 'Thi thật') : focus === 'gap' ? 'Gap Filling' : 'Luyện tập'}</p>
            <p className="truncate text-[15px] font-extrabold">{test.testName}{!real && part !== 'full' ? ` · Part ${part}` : ''}</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-[18px] font-bold tabular-nums ${real && remaining < 300 ? 'bg-[#F2683A]' : 'bg-white/10'}`}>
            <Clock className="h-4 w-4" />{real ? fmtClock(remaining) : fmtClock(elapsed)}
          </div>
          {!submitted && <button type="button" onClick={() => setConfirm(true)} className="h-9 rounded-xl bg-[#F8BE33] px-4 text-[14px] font-extrabold text-[#1E1B4B] shadow-[0_3px_0_#000] hover:-translate-y-0.5">Nộp bài</button>}
        </div>
        {/* audio bar */}
        <div className="border-t border-white/10 bg-[#2A3524]">
          <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2">
            {real ? (
              <span className="inline-flex items-center gap-2 text-[13px] font-bold"><Headphones className="h-4 w-4 text-[#F8BE33]" />{playing ? `Đang phát Part ${sections[audioPart]?.sectionNumber}` : submitted ? 'Đã nộp bài' : 'Audio phát liên tục — không tua, không dừng'}</span>
            ) : (
              <button type="button" onClick={() => { const a = audio.current; if (!a) return; if (playing) a.pause(); else a.play().catch(() => {}); }} className="grid h-9 w-9 place-items-center rounded-full bg-[#F8BE33] text-[#1E1B4B]" aria-label={playing ? 'Tạm dừng' : 'Phát'}>
                {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
              </button>
            )}
            {!real && (
              <>
                <span className="w-[92px] shrink-0 text-[12px] tabular-nums text-white/70">{fmtClock(aTime)} / {fmtClock(aDur)}</span>
                <input type="range" min={0} max={aDur || 0} step={0.1} value={aTime} onChange={e => { if (audio.current) audio.current.currentTime = +e.target.value; }} className="h-1.5 flex-1 accent-[#F8BE33]" aria-label="Tua audio" />
              </>
            )}
            {real && <span className="flex-1" />}
            <span className="inline-flex items-center gap-1.5"><Volume2 className="h-4 w-4 text-white/70" /><input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(+e.target.value)} className="w-24 accent-[#F8BE33]" aria-label="Âm lượng" /></span>
          </div>
        </div>
      </header>

      {submitted && (
        <div className="mx-auto max-w-[1240px] px-4 pt-5">
          <div className="rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-5 shadow-[0_6px_0_#1E1B4B]">
            <p className="px-display text-[20px]">Đã nộp bài · {answeredCount}/{allNums.length} câu đã trả lời</p>
            <p className="mt-1 text-[14px] font-semibold text-[#1E1B4B]/70">
              Đáp án chính thức và giải thích của đề chưa có trong dữ liệu offline (việc tải từ trang gốc đã dừng), nên bài chưa được chấm tự động. Đối chiếu bài làm của bạn với script bên cạnh — bấm ▶ để nghe lại từng đoạn.
              {hard && leaves > 0 ? ` · Báo cáo Liêm chính: rời màn hình ${leaves} lần.` : ''}
            </p>
          </div>
        </div>
      )}

      <div className={`mx-auto grid max-w-[1240px] gap-5 px-4 py-5 ${submitted ? 'lg:grid-cols-[minmax(0,1fr)_420px]' : ''}`}>
        <main className="min-w-0 space-y-5 pb-28">
          {section && (
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="px-display text-[22px] uppercase">Part {section.sectionNumber}</h2>
              <span className="text-[14px] font-bold text-[#1E1B4B]/60">Questions {partRange(section.sectionNumber).join('–')}{section.title ? ` · ${section.title}` : ''}</span>
            </div>
          )}
          {section?.blocks.map((b, i) => <Block key={`${cur}-${i}`} block={b} ctx={ctx} />)}
          {section && section.blocks.length === 0 && <p className="font-semibold text-slate-500">Part này không có câu điền từ.</p>}
        </main>
        {submitted && section && (
          <aside className="lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
            <div className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-white p-4 shadow-[0_5px_0_#1E1B4B]">
              <p className="px-display mb-3 text-[14px] uppercase">Script · Part {section.sectionNumber}</p>
              <Transcript test={test} part={section.sectionNumber} />
            </div>
          </aside>
        )}
      </div>

      {/* bottom navigator */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-[#1E1B4B] bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 overflow-x-auto px-4 py-2.5">
          <button type="button" disabled={cur === 0} onClick={() => setCur(cur - 1)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-[#1E1B4B] disabled:opacity-30" aria-label="Part trước"><ChevronLeft className="h-4 w-4" /></button>
          {sections.map((s, si) => {
            const ns = s.blocks.flatMap(blockNums).filter(Boolean);
            const done = ns.filter(answered).length;
            return (
              <div key={s.sectionNumber} className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-2 py-1 ${si === cur ? 'border-[#1E1B4B] bg-[#FFF0C2]' : 'border-transparent'}`}>
                <button type="button" onClick={() => setCur(si)} className="whitespace-nowrap text-[13px] font-extrabold">Part {s.sectionNumber}<span className="ml-1 text-[11px] font-bold text-[#1E1B4B]/50">{done}/{ns.length}</span></button>
                {si === cur && ns.map(n => (
                  <button key={n} type="button" onClick={() => jump(n)} className={`h-7 min-w-7 rounded-md px-1 text-[12px] font-bold tabular-nums ${focusQ === n ? 'ring-2 ring-[#4F46E5]' : ''} ${answered(n) ? 'bg-[#4F46E5] text-white' : 'bg-[#1E1B4B]/8 text-[#1E1B4B] hover:bg-[#1E1B4B]/15'}`}>{n}</button>
                ))}
              </div>
            );
          })}
          <button type="button" disabled={cur === sections.length - 1} onClick={() => setCur(cur + 1)} className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-[#1E1B4B] disabled:opacity-30" aria-label="Part sau"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </footer>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[24px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-6 text-center shadow-[0_6px_0_#1E1B4B]">
            <p className="px-display text-[20px]">Nộp bài và xem đáp án?</p>
            <p className="mt-2 text-[14px] font-semibold text-[#1E1B4B]/70">Bạn đã trả lời {answeredCount}/{allNums.length} câu.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirm(false)} className="h-11 rounded-xl border-[3px] border-[#1E1B4B] bg-white font-extrabold">Hủy</button>
              <button type="button" onClick={doSubmit} className="h-11 rounded-xl border-[3px] border-[#1E1B4B] bg-[#4F46E5] font-extrabold text-white">Nộp bài</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CamTestPage({ testId, mode, initialPart, focus, onBack, go }) {
  const [test, setTest] = useState(undefined);
  const [part, setPart] = useState(initialPart ?? null);
  const [exam, setExam] = useState(null);
  useEffect(() => {
    let off = false;
    loadTest(testId).then(t => { if (!off) setTest(t); }).catch(() => { if (!off) setTest(null); });
    return () => { off = true; };
  }, [testId]);

  if (test === undefined) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#1E1B4B] border-t-transparent" /></div>;
  if (!test) return <NoQuestions testId={testId} onBack={onBack} go={go} />;
  if (mode === 'real_test') {
    if (!exam) return <ExamGate test={test} onBack={onBack} onStart={setExam} />;
    return <TestRunner test={test} mode="real_test" part="full" hard={exam.hard} onExit={onBack} />;
  }
  if (part === null) return <PartChooser test={test} onBack={onBack} onPick={setPart} />;
  return <TestRunner test={test} mode="practice" part={part} focus={focus} onExit={() => (initialPart ? onBack() : setPart(null))} />;
}
