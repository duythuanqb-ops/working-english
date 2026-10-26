import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Activity, Award, Flame, Calendar, X, Shuffle, ArrowRight, Play } from 'lucide-react';
import './speaking.css';
import { asset } from '../shared';
import { HERO_HTML, SNOW_HTML } from './heroArt';
import { useLocalData, loadData, readHistory } from './speakingUtils';

// Sub-pages mirror theieltsdictionary.com/practice/speaking/*
const MockInterview = lazy(() => import('./MockInterview'));
const Forecast = lazy(() => import('./Forecast'));
const Roulette = lazy(() => import('./Roulette'));
const Shadowing = lazy(() => import('./Shadowing'));
const ShadowingPlayer = lazy(() => import('./ShadowingPlayer'));
const Dubbing = lazy(() => import('./Dubbing'));
const DubbingPlayer = lazy(() => import('./DubbingPlayer'));

const INK = '#1F2A1A';
const BASE = asset('');
const heroHtml = { __html: HERO_HTML.replaceAll('{{BASE}}', BASE) };
const snowHtml = { __html: SNOW_HTML.replaceAll('{{BASE}}', BASE) };
const abs = s => ({ position: 'absolute', ...s });

const CHIP = {
  blue: ['bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 'bg-blue-600 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  violet: ['bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', 'bg-violet-600 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  pink: ['bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100', 'bg-pink-600 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  cyan: ['bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100', 'bg-cyan-600 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  amber: ['bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', 'bg-amber-500 text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  emerald: ['bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', 'bg-emerald-600 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
  slate: ['bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200', 'bg-slate-800 text-white border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'],
};
const MODE_LABEL = { ai_practice: 'Mock Interview', speaking_roulette: 'Speaking Roulette', forecast_practice: 'Forecast Speaking', shadowing: 'Shadowing', dubbing: 'Lồng tiếng' };

// Screen art inside each cable-car card
function CardArt({ art }) {
  const b = `3px solid ${INK}`;
  switch (art) {
    case 'book':
      return (
        <>
          <div className="px-display flex items-center justify-center text-center text-[9px] leading-[1.2]" style={abs({ top: 'calc(50% - 45px)', left: '52%', width: '34%', height: 90, background: '#F8BE33', border: b, borderRadius: 8, transform: 'rotate(8deg)' })}>REAL<br />IELTS<br />QUESTIONS</div>
          <div className="flex flex-col items-center justify-center gap-0.5 text-[#FDF5E0]" style={abs({ top: 'calc(50% - 50px)', left: '22%', width: '36%', height: 100, background: '#2F3A7A', border: b, borderRadius: 8, boxShadow: 'inset 6px 0 0 rgba(0,0,0,.25)', transform: 'rotate(-6deg)', animation: 'pxsFloat 4s ease-in-out infinite' })}>
            <span className="text-[8px] font-extrabold tracking-[.2em]">IELTS</span>
            <span className="px-display text-[11px]">SPEAKING</span>
          </div>
        </>
      );
    case 'calendar':
      return (
        <div className="flex flex-col gap-[3px] text-[10px] font-bold" style={abs({ top: '50%', left: '50%', marginLeft: -90, width: 180, background: '#FDF5E0', border: b, borderRadius: 10, padding: '8px 10px', transform: 'translateY(-50%) rotate(3deg)' })}>
          <span className="px-display border-b-2 border-dashed border-[#1F2A1A]/30 pb-[3px] text-[9px]">SEP - DEC 2026</span>
          {['September', 'October', 'November'].map(m => <span key={m} className="flex justify-between"><span>{m}</span><span className="opacity-60">5:00 AM</span></span>)}
          <span className="mt-0.5 rounded-md bg-[#1F2A1A] p-[3px] text-center text-[9px] text-[#FDF5E0]">Set Reminder</span>
        </div>
      );
    case 'cards':
      return (
        <>
          <div className="text-[9px] font-extrabold text-[#FDF5E0]" style={abs({ left: '50%', top: 'calc(50% - 42px)', marginLeft: -6, width: 70, height: 96, background: '#E8505B', border: b, borderRadius: 10, transform: 'rotate(12deg)', padding: 6 })}>PART 2</div>
          <div className="flex flex-col text-[9px] font-extrabold" style={abs({ left: '50%', top: 'calc(50% - 54px)', marginLeft: -62, width: 70, height: 96, background: '#F8BE33', border: b, borderRadius: 10, transform: 'rotate(-8deg)', padding: 6, animation: 'pxsFloat 3s ease-in-out infinite' })}>
            PART 1<span className="px-display m-auto text-[32px]">?</span>
          </div>
        </>
      );
    case 'video':
      return (
        <div className="grid place-items-center overflow-hidden" style={abs({ inset: '18px 26px', background: '#FFFFFF', border: b, borderRadius: 10 })}>
          <span className="grid h-[30px] w-11 place-items-center rounded-[9px] border-[3px] border-[#1F2A1A] bg-[#E8505B] text-xs text-white">▶</span>
          <span style={abs({ left: 0, right: 0, bottom: 0, height: 9, background: INK })} />
          <span style={abs({ left: 0, bottom: 0, width: '30%', height: 9, background: '#E8505B' })} />
        </div>
      );
    case 'dub':
      return (
        <div className="flex flex-col gap-1.5" style={abs({ inset: '14px 22px' })}>
          <div className="grid flex-1 place-items-center rounded-[10px] bg-[#1F2A1A]">
            <span className="grid h-7 w-10 place-items-center rounded-lg border-[3px] border-[#FDF5E0] bg-[#E8505B] text-[11px] text-white">▶</span>
          </div>
          <div className="grid grid-cols-9 gap-[3px]">
            {['#4E9A35', '#4E9A35', '#FFFFFF', '#F8BE33', '#F8BE33', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'].map((c, i) => <span key={i} className="h-[7px] rounded-[3px]" style={{ background: c }} />)}
          </div>
        </div>
      );
    case 'score':
      return (
        <div className="flex items-center justify-center gap-3 text-[#FDF5E0]" style={abs({ inset: 0 })}>
          <span className="rotate-180 text-xs font-extrabold tracking-[.2em] [writing-mode:vertical-rl]">SAMPLE</span>
          <span className="px-display text-[56px] leading-none text-[#F8BE33]">8.0</span>
        </div>
      );
    default:
      return null;
  }
}

function CableCard({ no, title, desc, tag, cab, screen, pattern, art, swingDelay, onClick, href }) {
  const inner = (
    <>
      <span aria-hidden className="absolute -left-[18px] -right-[18px] top-[18px] h-[5px] rounded-[3px] bg-[#1F2A1A] shadow-[0_2px_0_rgba(255,255,255,.4)]" />
      <div className="px-cab relative flex w-full flex-1 flex-col items-center [animation:pxsCab_4.6s_ease-in-out_infinite] [transform-origin:50%_0] group-hover:[animation-play-state:paused]" style={{ animationDelay: swingDelay }}>
        <div aria-hidden className="relative -mt-2 flex h-5 w-[54px] items-start justify-around rounded-lg border-[3px] border-[#1F2A1A] bg-[#3A4A5A] px-1.5">
          <span className="-mt-[9px] h-3.5 w-3.5 rounded-full border-[3px] border-[#1F2A1A] bg-[#C9D4DE]" />
          <span className="-mt-[9px] h-3.5 w-3.5 rounded-full border-[3px] border-[#1F2A1A] bg-[#C9D4DE]" />
        </div>
        <div aria-hidden className="h-[30px] w-2 border-x-[3px] border-[#1F2A1A] bg-[#3A4A5A]" />
        <div aria-hidden className="flex h-7 w-[62%] items-center justify-center rounded-t-2xl border-4 border-b-0 border-[#1F2A1A] shadow-[inset_0_5px_0_rgba(255,255,255,.35)]" style={{ background: cab }}>
          <span className="px-display rounded-[5px] border-2 border-[#1F2A1A] bg-[#FDF5E0] px-2 py-[3px] text-xs leading-none text-[#1F2A1A]">{String(no).padStart(2, '0')}</span>
        </div>
        <div className="relative flex w-full flex-1 flex-col gap-3.5 rounded-[20px] border-4 border-[#1F2A1A] p-4 shadow-[0_8px_0_rgba(15,34,56,.35),inset_0_-6px_0_rgba(0,0,0,.15)] transition-transform group-hover:-translate-y-1" style={{ background: cab }}>
          <div aria-hidden className="relative h-[200px] overflow-hidden rounded-xl border-4 border-[#1F2A1A] shadow-[inset_0_0_0_3px_rgba(255,255,255,.5)]" style={{ backgroundColor: screen, backgroundImage: pattern }}>
            <CardArt art={art} />
            <span className="pointer-events-none absolute -top-[30px] left-[14%] h-[220px] w-3.5 rotate-[30deg] bg-white/35" />
            <span className="pointer-events-none absolute -top-[30px] left-[24%] h-[220px] w-[5px] rotate-[30deg] bg-white/30" />
          </div>
          <div className="flex flex-1 flex-col gap-2.5 rounded-xl border-[3px] border-[#1F2A1A] bg-[#FDF5E0] p-[18px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-display text-2xl uppercase leading-[1.2] text-[#1F2A1A]">{title}</span>
              {tag && <span className="rounded-md border-2 border-[#1F2A1A] px-2 py-[5px] text-[13px] font-extrabold leading-none" style={{ background: tag.bg, color: tag.fg ?? INK }}>{tag.label}</span>}
            </div>
            <div className="flex items-end gap-3">
              <span className="flex-1 text-lg font-semibold leading-normal text-[#1F2A3A] [text-wrap:pretty]">{desc}</span>
              <span aria-hidden className="grid h-[46px] w-[46px] flex-none place-items-center rounded-xl border-[3px] border-[#1F2A1A] bg-[#1F2A1A] text-lg font-extrabold leading-none text-[#FDF5E0]">→</span>
            </div>
          </div>
        </div>
        <div aria-hidden className="h-2.5 w-[46%] rounded-b-lg border-[3px] border-t-0 border-[#1F2A1A] bg-[#3A4A5A]" />
      </div>
    </>
  );
  const cls = 'group relative flex min-w-0 flex-col items-center pt-5 text-left text-[#1F2A1A] cursor-pointer';
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

// "Chọn Chủ Đề" modal (Bộ đề thi thật)
function TopicPicker({ onClose, onStart }) {
  const [data] = useLocalData(() => loadData('topics'));
  const [part, setPart] = useState(1);
  const [sel, setSel] = useState(null);
  const custom = (data?.custom || []).filter(t => t.part === part);
  const pickRandom = () => {
    if (!data) return;
    const ids = part === 1 ? data.categories.flatMap(c => c.topics.map(t => t.id)) : (part === 2 ? data.p2 : data.p3).map(t => t.id);
    const all = [...ids, ...custom.map(t => t.id)].filter(id => data.topics[id]);
    setSel(all[Math.floor(Math.random() * all.length)]);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-3xl border-2 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] sm:max-w-lg sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
          <div>
            <h2 className="text-2xl font-black leading-none">Chọn Chủ Đề</h2>
            <p className="mt-1 text-xs font-medium text-slate-400">AI examiner sẽ hỏi theo part bạn chọn</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 transition-colors hover:bg-slate-200"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex shrink-0 gap-2 px-6 pb-3">
          {[1, 2, 3].map(p => (
            <button key={p} onClick={() => { setPart(p); setSel(null); }} className={`flex-1 rounded-xl border-2 py-2 text-sm font-black transition-all ${part === p ? 'border-black bg-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'}`}>
              Part {p}
              <span className={`mt-0.5 block text-[10px] font-medium ${part === p ? 'text-slate-300' : 'text-slate-400'}`}>{p === 1 ? '50 topics' : p === 2 ? 'Cue card' : 'Discussion'}</span>
            </button>
          ))}
        </div>
        <div className="mx-6 mb-3 shrink-0 border-t-2 border-slate-100" />
        <div className="flex-1 overflow-y-auto px-6">
          <button onClick={pickRandom} className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-2.5 text-sm font-bold text-slate-500 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
            <Shuffle className="h-4 w-4" /> Ngẫu nhiên
          </button>
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Custom Topics</p>
              <span className="text-[10px] font-bold text-amber-600">🔒 Thêm topic mới (Premium)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {custom.map(t => (
                <button key={t.id} onClick={() => setSel(t.id)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${sel === t.id ? 'border-black bg-slate-800 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}>
                  {t.is_public && <span className="rounded bg-amber-100 px-1 text-[9px] uppercase text-amber-800">TID</span>}{t.name}
                </button>
              ))}
              {custom.length === 0 && <p className="text-xs italic text-slate-400">Chưa có topic nào.</p>}
            </div>
          </div>
          {part === 1 && data && (
            <div className="space-y-5 pb-4">
              {data.categories.map(c => (
                <div key={c.label}>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.topics.map(t => <button key={t.id} onClick={() => setSel(t.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${CHIP[c.color][sel === t.id ? 1 : 0]}`}>{t.name}</button>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {part === 2 && data && (
            <div className="pb-4">
              <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-relaxed text-slate-600">Giám khảo sẽ đưa ra cue card kiểu <strong>"Describe a ..."</strong> và cho bạn 1 phút chuẩn bị trước khi nói.</p>
              <div className="flex flex-wrap gap-2">
                {data.p2.map(t => <button key={t.id} onClick={() => setSel(t.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${sel === t.id ? 'border-black bg-blue-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{t.name}</button>)}
              </div>
            </div>
          )}
          {part === 3 && data && (
            <div className="pb-4">
              <p className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs font-medium leading-relaxed text-slate-600">Thảo luận chủ đề trừu tượng — giám khảo hỏi quan điểm, so sánh xã hội, lập luận phản biện. Cần <strong>band 6.5+</strong>.</p>
              <div className="flex flex-wrap gap-2">
                {data.p3.map(t => <button key={t.id} onClick={() => setSel(t.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${sel === t.id ? 'border-black bg-violet-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{t.name}</button>)}
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 border-t-2 border-slate-100 px-6 py-4">
          {sel ? (
            <button onClick={() => onStart(sel)} className="flex w-full items-center justify-between rounded-xl border-2 border-black bg-blue-600 px-5 py-4 text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]">
              Bắt đầu luyện tập <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-100 px-5 py-4 text-lg font-black text-slate-400">
              Chọn một chủ đề để bắt đầu <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryPanel() {
  const [all, setAll] = useState(false);
  const [playing, setPlaying] = useState(null);
  const rows = useMemo(() => readHistory(), []);
  if (!rows.length) return null;
  const shown = all ? rows : rows.slice(0, 5);
  return (
    <div className="rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-6 shadow-[0_10px_0_#1F2A1A] md:p-8">
      <div className="mb-6 flex items-end justify-between border-b-[3px] border-dashed border-[#1F2A1A]/25 pb-4">
        <h3 className="px-display flex items-center gap-2 text-2xl uppercase"><Calendar className="text-[#1F2A1A]/50" /> Lịch sử luyện tập</h3>
        {rows.length > 5 && <button onClick={() => setAll(a => !a)} className="font-bold text-blue-600 hover:underline">{all ? 'Thu gọn' : 'Xem tất cả'}</button>}
      </div>
      <div className="space-y-3">
        {shown.map((r, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded border-2 border-black bg-blue-200 px-2 py-1 text-xs font-bold uppercase text-blue-900 shadow-[1px_1px_0_rgba(0,0,0,1)]">{MODE_LABEL[r.mode] || 'Speaking'}</span>
                <span className="truncate font-bold text-slate-800">{r.topic || 'Speaking Practice'}</span>
              </div>
              <span className="hidden text-sm font-medium text-slate-500 md:block">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            {r.question && <div className="text-sm font-bold text-slate-800">Q: {r.question}</div>}
            {r.transcript && <div className="line-clamp-3 text-sm italic text-slate-500">"{r.transcript}"</div>}
            {r.wpm > 0 && <div className="text-xs font-bold text-slate-400">{r.wpm} WPM · {r.duration}s</div>}
            {playing === i && <span className="hidden" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function HubHome({ onBack, go }) {
  const [picker, setPicker] = useState(false);
  const stats = useMemo(() => {
    const rows = readHistory();
    const weekAgo = Date.now() - 7 * 864e5;
    const days = new Set(rows.map(r => r.created_at.slice(0, 10)));
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      if (days.has(d)) streak++; else if (i > 0) break;
    }
    return { week: rows.filter(r => new Date(r.created_at).getTime() > weekAgo).length, streak };
  }, []);
  const stripes = 'repeating-linear-gradient(135deg,transparent 0 8px,rgba(255,255,255,.35) 8px 14px)';
  const cards = [
    { title: 'Bộ đề thi thật', desc: 'Luyện tập với các bộ đề được sưu tập từ các bộ câu hỏi thi thật ở quá khứ', cab: '#E8505B', screen: '#C8DDF7', art: 'book', onClick: () => setPicker(true) },
    { title: 'Forecast Speaking', tag: { label: 'Quý 3 · Tháng 9-12, 2026', bg: '#F9A8C4' }, desc: 'Dự đoán và cập nhật bộ đề Speaking mới nhất — kèm bộ Quý 2 để ôn lại.', cab: '#F8BE33', screen: '#F6C9D8', art: 'calendar', onClick: () => go('forecast') },
    { title: 'Speaking Roulette', desc: 'Rút thẻ ngẫu nhiên, luyện tập P1/P2/P3 như thi thật.', cab: '#5BA4E0', screen: '#2E5E8A', pattern: 'radial-gradient(rgba(255,255,255,.25) 2px,transparent 2px)', art: 'cards', onClick: () => go('roulette') },
    { title: 'Shadowing Mode', desc: 'Nghe và nhại theo video YouTube để chuẩn hóa ngữ điệu.', cab: '#6FBF4A', screen: '#DCEFFA', pattern: stripes, art: 'video', onClick: () => go('shadowing') },
    { title: 'Lồng tiếng BBC · TED-Ed', tag: { label: 'MỚI', bg: '#D6363F', fg: '#FFFFFF' }, desc: 'Thu giọng từng câu, xem lại video với chính giọng của bạn.', cab: '#F28C38', screen: '#A6D8F4', pattern: stripes, art: 'dub', onClick: () => go('dubbing') },
    { title: 'Sample 8.0 Speaking', desc: 'Biên soạn bởi giáo viên 10 lần 8.5 IELTS', cab: '#9B7BD8', screen: '#1F2A1A', art: 'score', href: 'https://drive.google.com/file/d/1inr9drBzFyZz8sv4daPcEPZuueXt9YQ9/view?usp=sharing' },
  ];
  const swing = ['0s', '-1.4s', '-2.9s', '-0.7s', '-3.6s', '-2.1s'];
  return (
    <div className="px-root min-h-full overflow-x-clip bg-[#1E3A5C] bg-[radial-gradient(rgba(255,255,255,.08)_2px,transparent_2px)] bg-[length:24px_24px]">
      <header className="relative overflow-hidden bg-[linear-gradient(180deg,#8CC8EC_0%,#CFE9F8_60%,#EAF6FC_100%)] pb-[340px] sm:pb-[470px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 max-sm:[zoom:0.72]" dangerouslySetInnerHTML={heroHtml} />
        <div className="relative z-[5] mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-[clamp(20px,4vw,40px)] pt-[60px] text-center">
          <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border-[3px] border-[#1F2A1A] bg-[#FDF5E0] px-4 text-[15px] font-bold text-[#1F2A1A] shadow-[0_4px_0_#1F2A1A] transition-[transform,box-shadow,background-color] hover:bg-[#F8BE33] active:translate-y-0.5 active:shadow-[0_2px_0_#1F2A1A]">
            <span aria-hidden>←</span>Quay lại chọn kỹ năng
          </button>
          <span className="mt-2.5 -rotate-2 rounded-full border-[3px] border-[#1F2A1A] bg-white px-4 py-[7px] text-sm font-extrabold tracking-[.08em]">SPEAKING PRACTICE HUB</span>
          <h1 className="px-display px-outline m-0 text-[clamp(40px,7.4vw,104px)] leading-[1.15] [--px-drop:8px] [--px-stroke:clamp(6px,.9vw,10px)] [text-shadow:0_8px_0_#1F2A1A,0_0_40px_rgba(255,255,255,.7)]">IELTS SPEAKING</h1>
        </div>
      </header>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" dangerouslySetInnerHTML={snowHtml} />
        <main className="relative z-[1] mx-auto max-w-[1400px] px-[clamp(20px,4vw,40px)] pb-[160px] pt-14">
          <div className="grid gap-x-9 gap-y-12 pt-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
            {cards.map((c, i) => <CableCard key={c.title} no={i + 1} swingDelay={swing[i % swing.length]} {...c} />)}
          </div>
          <div className="mt-20 space-y-10">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Activity, color: 'text-[#2F6FB0]', value: stats.week, label: 'Sessions (Tuần)' },
                { icon: Award, color: 'text-[#2E7D3A]', value: '-', label: 'Avg Band (7 lần)' },
                { icon: Flame, color: 'text-[#E8505B]', value: stats.streak, label: 'Ngày liên tiếp' },
              ].map(s => (
                <div key={s.label} className="flex min-w-[150px] flex-col items-center rounded-2xl border-4 border-[#1F2A1A] bg-[#FDF5E0] px-6 py-4 shadow-[0_6px_0_#1F2A1A]">
                  <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
                  <span className="px-display text-3xl leading-none">{s.value}</span>
                  <span className="mt-2 text-xs font-extrabold uppercase text-[#5A6450]">{s.label}</span>
                </div>
              ))}
            </div>
            <HistoryPanel />
          </div>
        </main>
      </div>
      {picker && <TopicPicker onClose={() => setPicker(false)} onStart={id => { setPicker(false); go('mock', id); }} />}
    </div>
  );
}

export default function SpeakingHub({ onBack, onSaveWord, speechVoice }) {
  const [route, setRoute] = useState({ page: 'hub' });
  const go = (page, id, mode) => setRoute({ page, id, mode });
  const home = () => go('hub');
  const common = { onSaveWord, speechVoice };
  let view;
  switch (route.page) {
    case 'mock': view = <MockInterview topicId={route.id} onBack={home} {...common} />; break;
    case 'forecast': view = <Forecast onBack={home} {...common} />; break;
    case 'roulette': view = <Roulette onBack={home} {...common} />; break;
    case 'shadowing': view = <Shadowing initialMode={route.mode} onBack={home} onOpen={(id, mode) => go('shadowPlayer', id, mode)} />; break;
    case 'shadowPlayer': view = <ShadowingPlayer key={route.id} videoId={route.id} initialMode={route.mode} onBack={() => go('shadowing', null, route.mode)} {...common} />; break;
    case 'dubbing': view = <Dubbing onBack={home} onOpen={id => go('dubPlayer', id)} />; break;
    case 'dubPlayer': view = <DubbingPlayer key={route.id} videoId={route.id} onBack={() => go('dubbing')} {...common} />; break;
    default: view = <HubHome onBack={onBack} go={go} />;
  }
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Đang tải…</div>}>
      {view}
    </Suspense>
  );
}
