// Dashboard pages built from local data: Tổng quan (vocab / streak / calendar cards of /dashboard), Thống kê, Lịch sử.
import React, { useState } from 'react';
import { Brain, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, CircleHelp, Flame, Layers, Lightbulb, RotateCcw, X } from 'lucide-react';
import { WavyBadge, WatchingSun } from './fcParts';
import { index } from './decks';
import { buckets, dayKey, deckKnownPct, dismissSet, dueSets, getActivity, getSetReviews, getSrs, streak, useStore } from './store';

const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DOW_FULL = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const fmt = t => new Date(t).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

function Float({ size, style, ring = true, color = '#fff' }) {
  return <span aria-hidden className="td-float pointer-events-none absolute rounded-full" style={{ width: size, height: size, background: ring ? 'transparent' : color, border: ring ? `${size / 5.7}px solid ${color}` : 0, opacity: 0.9, ...style }} />;
}

function VocabCard({ onPick, onReview }) {
  const b = buckets();
  const all = b.solid + b.mid + b.weak + b.none;
  const due = dueSets();
  const tiles = [
    ['Nhớ chắc', b.solid, '#20b486', CircleCheck, { left: '4%', top: 0, rotate: '-3deg' }],
    ['Hơi nhớ', b.mid, '#ffc02e', Lightbulb, { left: '51%', top: 8, rotate: '2deg' }],
    ['Hmmmm', b.weak, '#4f7cf7', Brain, { left: '2%', top: 124, rotate: '2deg' }],
    ['Chưa nhớ', b.none, '#f0512d', CircleHelp, { left: '50%', top: 132, rotate: '-2deg' }],
  ];
  return (
    <section className="td-pop relative isolate flex min-h-[340px] flex-col gap-2 overflow-hidden rounded-[30px] bg-[#9b5de5] px-6 pt-6 text-white">
      <span className="pointer-events-none absolute -right-[70px] -top-[70px] -z-10 h-[200px] w-[200px] rounded-full" style={{ background: 'rgba(255,255,255,.14)' }} />
      <Float size={16} color="#ffc02e" style={{ right: 30, top: 30 }} />
      <Float size={7} ring={false} style={{ right: 64, top: 62, animationDelay: '-600ms' }} />
      <h2 className="relative m-0 text-[clamp(26px,2.2vw,32px)] font-bold leading-none tracking-[-0.03em]">Từ vựng của bạn.</h2>
      <p className="m-0 text-[14.5px] font-semibold leading-normal text-[#f1e7fc]">{all ? `${all} từ đã học · ${b.due} từ đến hạn ôn` : 'Chưa có từ nào — chọn một bộ từ để bắt đầu'}</p>
      <div className="relative -mx-2 mt-1 min-h-[266px] flex-1" title="Nhớ chắc: ôn lại sau ≥ 21 ngày · Hơi nhớ: 2–20 ngày · Hmmmm: ≤ 1 ngày · Chưa nhớ: chưa thuộc lần nào">
        {tiles.map(([label, n, color, Icon, pos]) => (
          <div key={label} className="absolute flex h-32 w-[47%] flex-col gap-2.5 rounded-[22px] bg-[var(--d-card)] p-3.5 text-[var(--d-ink)] shadow-[0_20px_34px_-16px_rgba(60,20,110,.5)] transition-transform duration-[250ms] hover:-translate-y-2 hover:!rotate-0" style={pos}>
            <div className="flex items-center justify-between gap-1">
              <WavyBadge size={40} fill={color}><Icon className="h-[18px] w-[18px] text-white" /></WavyBadge>
              <span className="font-bold leading-none tracking-[-0.03em]" style={{ fontSize: 30 }}>{n}</span>
            </div>
            <span className="truncate text-[16px] font-extrabold">{label}</span>
            <div className="h-2 overflow-hidden rounded bg-[var(--d-surf2)]"><div className="h-full rounded transition-[width] duration-[1200ms]" style={{ width: `${all ? (n / all) * 100 : 0}%`, background: color }} /></div>
          </div>
        ))}
      </div>
      <div className="relative -mx-1 mb-5 flex flex-col gap-2 rounded-[22px] bg-white/15 p-3">
        <span className="text-[12px] font-bold tracking-[0.14em] text-[#f1e7fc]">CẦN ÔN HÔM NAY</span>
        {due.length ? due.slice(0, 3).map(d => (
          <div key={d.set_ref} className="flex items-center gap-2">
            <button type="button" onClick={() => onReview(d)} className="flex min-w-0 flex-1 items-center gap-2 rounded-[12px] bg-white/15 px-3 py-2 text-left text-[13.5px] font-bold hover:bg-white/25">
              <RotateCcw size={14} className="shrink-0" /><span className="truncate">{d.set_name}</span><span className="ml-auto shrink-0 text-[11px] opacity-80">lần {d.stage + 1}</span>
            </button>
            <button type="button" onClick={() => dismissSet(d.set_ref)} aria-label="Bỏ qua" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"><X size={14} /></button>
          </div>
        )) : <span className="text-[13.5px] font-semibold text-[#f1e7fc]">Hôm nay không có từ nào đến hạn 🎉</span>}
        <button type="button" onClick={onPick} className="flex cursor-pointer items-center gap-2 self-start rounded-[14px] bg-[#1b1d22] px-4 py-2.5 text-[14px] font-extrabold text-white transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.8,.5,1)] hover:-translate-y-0.5"><Layers className="h-4 w-4" />Chọn bộ từ</button>
      </div>
    </section>
  );
}

function StreakCard() {
  const act = getActivity();
  const n = streak();
  const today = new Date();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return (
    <section className="td-pop relative isolate flex min-h-[340px] flex-col gap-1.5 overflow-hidden rounded-[30px] bg-[#4f7cf7] px-[22px] pb-[18px] pt-[22px] text-white">
      <span className="pointer-events-none absolute left-1/2 top-[52%] -z-10 -ml-[150px] -mt-[150px] h-[300px] w-[300px] rounded-full" style={{ background: 'rgba(255,255,255,.12)' }} />
      <span className="td-float pointer-events-none absolute right-4 top-3 z-[4]"><WatchingSun size={50} /></span>
      <Float size={7} ring={false} color="#ffc02e" style={{ left: 22, top: '46%' }} />
      <h2 className="relative z-[5] m-0 text-[26px] font-bold leading-none tracking-[-0.03em]">Chuỗi ngày học.</h2>
      <span className="relative z-[5] self-start rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold">{act[dayKey()] ? 'Hôm nay đã học — giữ chuỗi nhé!' : 'Học một bài hôm nay để bắt đầu chuỗi mới'}</span>
      <div className="relative flex min-h-[170px] flex-1 items-center justify-center">
        <span className="absolute h-[200px] w-[260px] rounded-[50%] border-2 border-dashed border-white/30" />
        <span className="absolute h-[150px] w-[200px] rounded-[50%] border-2 border-white/20" />
        <div className="td-bob relative flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-white leading-none text-[#1b1d22] shadow-[0_14px_24px_-10px_rgba(20,40,120,.45)]">
          <span className="-mt-0.5 flex items-end gap-px"><Flame size={30} className="text-[#f0512d]" /><span className="font-bold tracking-[-0.05em]" style={{ fontSize: 46 }}>{n}</span></span>
          <span className="mt-1.5 text-[11.5px] font-extrabold text-[#5a5f6b]">ngày liên tiếp</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 rounded-[22px] bg-white/15 p-2">
        {DOW.map((d, i) => {
          const day = new Date(monday); day.setDate(monday.getDate() + i);
          const on = !!act[dayKey(day)];
          const isToday = dayKey(day) === dayKey();
          return (
            <div key={d} className="relative flex flex-col items-center gap-1 rounded-[15px] py-1.5" style={{ background: isToday ? 'rgba(255,255,255,.18)' : 'transparent' }}>
              <div className="relative z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white/70" style={{ background: on ? '#ffc02e' : 'rgba(255,255,255,.2)', borderStyle: isToday ? 'dashed' : 'solid' }}>{on && <Flame size={13} className="text-[#1b1d22]" />}</div>
              <span className="relative z-[2] text-[11px] font-extrabold">{d}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CalendarCard() {
  const [off, setOff] = useState(0);
  const act = getActivity();
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + off, 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const todayN = act[dayKey()] || 0;
  return (
    <section className="td-pop relative isolate flex flex-col gap-3 rounded-[30px] bg-[var(--d-surf)] px-5 py-[22px] text-[var(--d-ink)]">
      <div className="pointer-events-none absolute -top-[18px] right-7 rotate-[8deg]"><span className="td-bob flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-white text-[#e5482a] shadow-[0_12px_12px_rgba(0,0,0,.18)]"><CalendarDays size={32} /></span></div>
      <div className="flex flex-wrap items-end gap-3.5">
        <h2 className="m-0 text-[24px] font-bold leading-[1.05] tracking-[-0.03em]">Hoạt động học tập.<br /><span className="text-[var(--d-mute)]">Tháng {first.getMonth() + 1} · {first.getFullYear()}</span></h2>
        <div className="flex-1" />
        <span className="max-w-full rounded-xl px-3.5 py-2 text-[14px] font-extrabold leading-[1.35]" style={{ background: '#ffc02e', color: '#1b1d22' }}>{DOW_FULL[now.getDay()]}, {fmt(now)} · Hôm nay · {todayN ? `${todayN} lượt học` : 'chưa học'}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOff(o => o - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--d-surf2)]" aria-label="Tháng trước"><ChevronLeft size={16} /></button>
        <button type="button" onClick={() => setOff(o => Math.min(0, o + 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--d-surf2)]" aria-label="Tháng sau"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DOW.map(d => <span key={d} className="text-center text-[12.5px] font-extrabold text-[var(--d-mute)]">{d}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(first.getFullYear(), first.getMonth(), i + 1);
          const n = act[dayKey(d)] || 0;
          const isToday = dayKey(d) === dayKey();
          return (
            <span key={i} title={n ? `${n} lượt học` : undefined} className="relative flex h-10 items-center justify-center">
              {(n > 0 || isToday) && <span className="absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full" style={{ background: n ? `rgba(32,180,134,${Math.min(0.9, 0.25 + n / 40)})` : 'transparent', boxShadow: isToday ? 'inset 0 0 0 2.5px #ffc02e' : 'none' }} />}
              <span className="relative text-[15px] font-extrabold">{i + 1}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

export function Overview({ onPick, onReview }) {
  useStore();
  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[22px] bg-[#1b1d22] px-5 py-3 text-white">
        <span className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffc02e] text-[#1b1d22]"><Flame size={18} /></span>
          <span className="leading-tight"><span className="block text-[11px] font-black uppercase tracking-widest text-white/60">Từ vựng · Ôn tập</span><span className="block text-[15px] font-black">Học một bộ từ mỗi ngày để giữ chuỗi</span></span>
        </span>
        <span className="text-[13px] font-bold text-white/80">{streak()} ngày liên tiếp · hôm nay +{getActivity()[dayKey()] || 0}</span>
        <button type="button" onClick={onPick} className="ml-auto text-[12px] font-black uppercase tracking-wide text-[#ffc02e] hover:underline">Chọn bộ từ →</button>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <VocabCard onPick={onPick} onReview={onReview} />
        <StreakCard />
      </div>
      <CalendarCard />
    </div>
  );
}

export function Stats() {
  useStore();
  const srs = getSrs();
  const b = buckets();
  const learned = Object.keys(srs).length;
  return (
    <div className="flex flex-col gap-5 pb-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[['Từ đã học', learned, '#4f7cf7'], ['Nhớ chắc', b.solid, '#20b486'], ['Đến hạn ôn', b.due, '#f0512d'], ['Chuỗi ngày', streak(), '#ffc02e']].map(([l, v, c]) => (
          <div key={l} className="td-pop rounded-[24px] bg-[var(--d-surf)] p-5 text-[var(--d-ink)]">
            <div className="text-[12px] font-extrabold uppercase tracking-[.12em] text-[var(--d-mute)]">{l}</div>
            <div className="mt-2 text-[40px] font-bold leading-none tracking-[-0.03em]" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {index.tabs.map(t => (
        <section key={t.id} className="rounded-[26px] bg-[var(--d-surf)] p-5 text-[var(--d-ink)]">
          <h3 className="m-0 mb-3 text-[18px] font-bold">{t.label} <span className="text-[13px] font-bold text-[var(--d-mute)]">· {t.total} từ</span></h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 md:grid-cols-2">
            {index.cards[t.id].map(c => {
              const p = deckKnownPct(c.id, c.count);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{c.title}</span>
                  <div className="h-2 w-28 overflow-hidden rounded bg-[var(--d-surf2)]"><div className="h-full rounded bg-[#20b486]" style={{ width: `${p}%` }} /></div>
                  <span className="w-10 text-right text-[12.5px] font-extrabold text-[var(--d-mute)]">{p}%</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function History({ onReview }) {
  useStore();
  const rows = Object.values(getSetReviews()).sort((a, b) => (b.last_reviewed_at || b.studied_at) - (a.last_reviewed_at || a.studied_at));
  return (
    <section className="rounded-[26px] bg-[var(--d-surf)] p-5 text-[var(--d-ink)]">
      <h3 className="m-0 text-[22px] font-bold tracking-[-0.02em]">Lịch sử làm bài</h3>
      <p className="m-0 mb-4 mt-1 text-[14px] font-semibold text-[var(--d-mute)]">Các bộ từ bạn đã học và lịch ôn lại (1 → 3 → 7 → 14 → 30 → 60 ngày).</p>
      {!rows.length && <p className="m-0 py-8 text-center text-[14px] font-semibold text-[var(--d-mute)]">Chưa có phiên học nào.</p>}
      <div className="flex flex-col gap-2">
        {rows.map(r => {
          const due = r.next_due <= Date.now();
          return (
            <div key={r.set_ref} className="flex flex-wrap items-center gap-3 rounded-[16px] bg-[var(--d-surf2)] px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{r.set_name}</span>
              <span className="text-[12.5px] font-bold text-[var(--d-mute)]">Học {fmt(r.studied_at)}{r.last_reviewed_at ? ` · ôn ${fmt(r.last_reviewed_at)}` : ''}</span>
              <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold" style={{ background: due ? '#ffe1d6' : '#dcf5e6', color: due ? '#c2410c' : '#18542a' }}>{due ? 'Đến hạn ôn' : `Ôn lại ${fmt(r.next_due)}`}</span>
              <button type="button" onClick={() => onReview(r)} className="flex h-9 items-center gap-1.5 rounded-[12px] bg-[#1b1d22] px-3 text-[13px] font-extrabold text-white"><RotateCcw size={14} />Ôn</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
