// Dashboard pages: Tổng quan, Thống kê, Lịch sử — WorkingEnglish "Pop" style (we-* classes in styles/workingenglish-pop.css)
import React, { useState } from 'react';
import {
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Flame,
  Layers,
  Lightbulb,
  RotateCcw,
  X,
  ArrowRight,
  CheckCircle2,
  Zap,
  BookOpen
} from 'lucide-react';
import { index } from './decks';
import {
  buckets,
  dayKey,
  deckKnownPct,
  dismissSet,
  dueSets,
  getActivity,
  getSetReviews,
  getSrs,
  streak,
  useStore
} from './store';

const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DOW_FULL = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const fmt = (t) =>
  new Date(t).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const INK = 'var(--we-ink)';

function SectionTitle({ icon: Icon, tile, title, sub, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="we-icon-tile h-10 w-10" style={{ background: tile }}>
          <Icon size={19} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-base font-extrabold md:text-lg" style={{ color: INK }}>{title}</h2>
          {sub && <p className="text-xs font-semibold text-[var(--text-muted)]">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Overview({ onPick, onReview }) {
  useStore();
  const b = buckets();
  const all = b.solid + b.mid + b.weak + b.none;
  const due = dueSets();
  const act = getActivity();
  const currentStreak = streak();
  const todayAct = act[dayKey()] || 0;

  // Dynamic greeting based on current hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Chào buổi sáng!'
      : hour < 18
      ? 'Chào buổi chiều!'
      : 'Chào buổi tối!';

  const pct = (n) => (all > 0 ? Math.round((n / all) * 100) : 0);
  const masteryCards = [
    { label: 'Nhớ chắc', sub: 'Ôn lại sau ≥ 21 ngày', count: b.solid, bg: 'var(--we-mint-soft)', fill: 'var(--we-mint)', icon: CheckCircle2, rot: '-1.2deg' },
    { label: 'Hơi nhớ', sub: 'Khoảng 2 – 20 ngày', count: b.mid, bg: 'var(--we-sun-soft)', fill: 'var(--we-sun)', icon: Lightbulb, rot: '0.8deg' },
    { label: 'Đang học', sub: 'Mới ôn ≤ 1 ngày', count: b.weak, bg: 'var(--we-indigo-soft)', fill: 'var(--we-indigo)', icon: Brain, rot: '-0.6deg' },
    { label: 'Chưa nhớ', sub: 'Cần củng cố thêm', count: b.none, bg: 'var(--we-coral-soft)', fill: 'var(--we-coral)', icon: CircleHelp, rot: '1.2deg' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. Night-sky hero */}
      <section className="we-hero we-pop-in px-6 pb-14 pt-8 md:px-10 md:pt-10">
        <span className="we-hero-moon" aria-hidden="true" />
        <span className="we-hero-hill" aria-hidden="true" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="we-sticker">WorkingEnglish · {greeting}</span>
            <h1 className="we-outline mt-6 text-4xl md:text-5xl lg:text-6xl" style={{ '--we-stroke': '6px' }}>
              Tiến độ học tập
            </h1>
            <p className="mt-4 max-w-xl text-sm font-bold leading-relaxed text-[var(--we-cream)] md:text-base">
              {all > 0
                ? `Bạn đã tích lũy ${all} từ vựng. Giữ vững chuỗi học để ghi nhớ bền vững nhé!`
                : 'Bắt đầu hành trình nâng cao vốn từ vựng công sở chuẩn quốc tế ngay hôm nay!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onPick} className="we-btn we-btn-white">
              <Layers className="h-4 w-4" />
              <span>Khám phá bộ từ</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {due.length > 0 && (
              <button type="button" onClick={() => onReview(due[0])} className="we-btn we-float" style={{ '--we-rot': '-2deg' }}>
                <Zap className="h-4 w-4 fill-current" />
                <span>Ôn ngay ({due.length})</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Leitner mastery buckets */}
      <section>
        <SectionTitle
          icon={BookOpen}
          tile="var(--we-indigo-soft)"
          title="Mức độ ghi nhớ (Leitner Box)"
          right={<span className="we-chip">Tổng cộng: {all} từ</span>}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {masteryCards.map((card, i) => {
            const Icon = card.icon;
            const p = pct(card.count);
            return (
              <div
                key={card.label}
                className="we-card we-card-hover we-pop-in flex flex-col justify-between p-5"
                style={{ background: card.bg, '--we-rot': card.rot, animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <span className="we-icon-tile" style={{ background: card.fill }}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <span className="we-display text-4xl leading-none" style={{ color: INK }}>{card.count}</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-extrabold" style={{ color: INK }}>{card.label}</h3>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">{card.sub}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="we-bar flex-1">
                    <span style={{ width: `${p}%`, background: card.fill }} />
                  </div>
                  <span className="text-xs font-extrabold" style={{ color: INK }}>{p}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Due sets */}
      <section className="we-card p-5 md:p-6">
        <SectionTitle
          icon={RotateCcw}
          tile="var(--we-coral-soft)"
          title="Bộ từ đến hạn ôn hôm nay"
          right={<span className="we-chip" style={{ background: due.length ? 'var(--we-coral)' : 'var(--we-mint-soft)', color: due.length ? '#fff' : INK }}>{due.length} bộ cần ôn</span>}
        />

        {due.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {due.map((d) => (
              <div
                key={d.set_ref}
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--we-ink)] bg-[var(--we-cream)] p-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold" style={{ color: INK }}>{d.set_name}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">Chu kỳ ôn lần {d.stage + 1}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" onClick={() => onReview(d)} className="we-btn we-btn-sm we-btn-indigo">
                    <RotateCcw size={12} />
                    <span>Ôn ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissSet(d.set_ref)}
                    title="Bỏ qua hôm nay"
                    aria-label="Bỏ qua hôm nay"
                    className="we-btn we-btn-sm we-btn-ghost h-8 w-8 !p-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--we-mint)] bg-[var(--we-mint-soft)] px-4 py-3 text-sm font-bold" style={{ color: INK }}>
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f9d63]" />
            <span>Tuyệt vời! Bạn không có bộ từ nào bị quá hạn hôm nay 🎉</span>
          </div>
        )}
      </section>

      {/* 4. Streak & monthly calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <StreakCard streak={currentStreak} todayAct={todayAct} act={act} />
        <CalendarCard act={act} />
      </div>
    </div>
  );
}

function StreakCard({ streak, todayAct, act }) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return (
    <section className="we-card flex flex-col justify-between p-5 md:p-6">
      <SectionTitle
        icon={Flame}
        tile="var(--we-sun)"
        title="Chuỗi ngày học"
        sub={todayAct > 0 ? 'Hôm nay đã học, chuỗi đang tăng tốc! 🔥' : 'Học một bài hôm nay để duy trì chuỗi nhé!'}
        right={<span className="we-chip">+{todayAct} lượt hôm nay</span>}
      />

      <div className="my-4 flex justify-center">
        <div
          className="we-float flex flex-col items-center rounded-[22px] border-[3px] border-[var(--we-ink)] bg-[var(--we-coral)] px-10 py-5 text-center shadow-[var(--we-pop)]"
          style={{ '--we-rot': '-2deg' }}
        >
          <div className="flex items-center gap-2">
            <Flame size={34} className="fill-[var(--we-sun)] text-[var(--we-ink)]" />
            <span className="we-outline text-5xl" style={{ '--we-stroke': '5px', '--we-drop': '4px' }}>{streak}</span>
          </div>
          <span className="mt-2 text-xs font-extrabold uppercase tracking-wider text-white">Ngày học liên tiếp</span>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Tuần này</div>
        <div className="grid grid-cols-7 gap-1.5">
          {DOW.map((d, i) => {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            const on = !!act[dayKey(day)];
            const isToday = dayKey(day) === dayKey();
            return (
              <div
                key={d}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-2 ${
                  isToday ? 'border-[var(--we-ink)] bg-[var(--we-sun-soft)] shadow-[var(--we-pop-sm)]' : 'border-transparent'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-extrabold ${
                    on ? 'border-[var(--we-ink)] bg-[var(--we-coral)] text-white' : 'border-[var(--we-line)] bg-white text-[var(--text-tertiary)]'
                  }`}
                >
                  {on ? <Flame size={13} className="fill-white" /> : i + 1}
                </span>
                <span className="text-[11px] font-extrabold" style={{ color: INK }}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalendarCard({ act }) {
  const [off, setOff] = useState(0);
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + off, 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const todayN = act[dayKey()] || 0;

  return (
    <section className="we-card flex flex-col justify-between p-5 md:p-6">
      <div>
        <SectionTitle
          icon={CalendarDays}
          tile="var(--we-sky-soft)"
          title="Lịch học tập"
          sub={`Tháng ${first.getMonth() + 1} · ${first.getFullYear()}`}
          right={
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setOff((o) => o - 1)} className="we-btn we-btn-sm we-btn-white h-8 w-8 !p-0" aria-label="Tháng trước">
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOff((o) => Math.min(0, o + 1))}
                className="we-btn we-btn-sm we-btn-white h-8 w-8 !p-0 disabled:pointer-events-none disabled:opacity-40"
                disabled={off >= 0}
                aria-label="Tháng sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          }
        />

        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-[var(--text-muted)]">
          {DOW.map((d) => (
            <span key={d} className="py-1">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: lead }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = new Date(first.getFullYear(), first.getMonth(), i + 1);
            const n = act[dayKey(d)] || 0;
            const isToday = dayKey(d) === dayKey();
            return (
              <div
                key={i}
                title={n ? `${n} lượt học` : undefined}
                className={`relative flex h-9 items-center justify-center rounded-xl border-2 text-xs font-extrabold ${
                  isToday
                    ? 'border-[var(--we-ink)] bg-[var(--we-sun)] text-[var(--we-ink)] shadow-[var(--we-pop-sm)]'
                    : n > 0
                    ? 'border-[var(--we-ink)] bg-[var(--we-mint)] text-[var(--we-ink)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--we-cream)]'
                }`}
              >
                <span>{i + 1}</span>
                {n > 1 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--we-ink)]" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-[var(--we-line)] pt-3 text-xs font-semibold text-[var(--text-muted)]">
        <span>{DOW_FULL[now.getDay()]}, {fmt(now)}</span>
        <span className="font-extrabold text-[var(--we-indigo)]">
          Hôm nay: {todayN ? `${todayN} lượt học` : 'Chưa ghi nhận'}
        </span>
      </div>
    </section>
  );
}

export function Stats() {
  useStore();
  const srs = getSrs();
  const b = buckets();
  const learned = Object.keys(srs).length;
  const currentStreak = streak();

  const kpis = [
    { label: 'Tổng từ đã học', val: learned, bg: 'var(--we-indigo)', fg: '#fff', icon: BookOpen, rot: '-1deg' },
    { label: 'Đã nhớ chắc', val: b.solid, bg: 'var(--we-mint)', fg: INK, icon: CheckCircle2, rot: '1deg' },
    { label: 'Cần ôn luyện', val: b.due, bg: 'var(--we-coral)', fg: '#fff', icon: RotateCcw, rot: '-0.8deg' },
    { label: 'Chuỗi ngày', val: `${currentStreak} ngày`, bg: 'var(--we-sun)', fg: INK, icon: Flame, rot: '0.8deg' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="we-card we-card-hover we-pop-in p-5"
              style={{ background: k.bg, color: k.fg, '--we-rot': k.rot, animationDelay: `${i * 60}ms` }}
            >
              <span className="we-icon-tile mb-3 h-10 w-10 bg-white">
                <Icon size={19} strokeWidth={2.5} />
              </span>
              <div className="text-xs font-extrabold uppercase tracking-wider opacity-85">{k.label}</div>
              <div className="we-display mt-1 text-3xl">{k.val}</div>
            </div>
          );
        })}
      </div>

      <section className="we-card p-5 md:p-6">
        <SectionTitle
          icon={Layers}
          tile="var(--we-indigo-soft)"
          title="Tiến độ thuộc bộ từ theo chủ đề"
          sub="Tỷ lệ ghi nhớ tự động tính theo tiến trình học tập của bạn"
          right={<span className="we-chip" style={{ background: 'var(--we-indigo-soft)' }}>{index.tabs.length} danh mục lớn</span>}
        />

        <div className="flex flex-col gap-8">
          {index.tabs.map((t) => (
            <div key={t.id}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="we-display text-sm uppercase" style={{ color: INK }}>{t.label}</h3>
                <div className="h-[3px] flex-1 rounded bg-[var(--we-line)]" />
                <span className="we-chip">{t.total} từ</span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {index.cards[t.id]?.map((c) => {
                  const p = deckKnownPct(c.id, c.count);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-2xl border-2 border-[var(--we-ink)] bg-white p-3 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--we-pop-sm)]"
                    >
                      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-[var(--we-ink)]" style={{ background: c.color || 'var(--we-indigo)' }} />
                      <span className="min-w-0 flex-1 truncate text-sm font-extrabold" style={{ color: INK }}>{c.title}</span>
                      <div className="we-bar w-24">
                        <span style={{ width: `${p}%`, background: 'var(--we-mint)' }} />
                      </div>
                      <span className="w-10 text-right text-xs font-extrabold" style={{ color: INK }}>{p}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function History({ onReview }) {
  useStore();
  const rows = Object.values(getSetReviews()).sort(
    (a, b) =>
      (b.last_reviewed_at || b.studied_at) - (a.last_reviewed_at || a.studied_at)
  );

  return (
    <section className="we-card p-5 md:p-6">
      <SectionTitle
        icon={RotateCcw}
        tile="var(--we-sun-soft)"
        title="Lịch sử luyện tập bộ từ"
        sub="Lịch ôn lặp lại ngắt quãng: 1 → 3 → 7 → 14 → 30 → 60 ngày"
        right={<span className="we-chip">{rows.length} phiên học</span>}
      />

      {!rows.length ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[var(--text-tertiary)]" />
          <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">Chưa có phiên học nào được ghi lại.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const due = r.next_due <= Date.now();
            return (
              <div
                key={r.set_ref}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--we-ink)] bg-[var(--we-cream)] p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold" style={{ color: INK }}>{r.set_name}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    Học {fmt(r.studied_at)}
                    {r.last_reviewed_at ? ` · Ôn lại ${fmt(r.last_reviewed_at)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="we-chip" style={{ background: due ? 'var(--we-coral)' : 'var(--we-mint-soft)', color: due ? '#fff' : INK }}>
                    {due ? 'Đến hạn ôn ngay' : `Ôn lại vào ${fmt(r.next_due)}`}
                  </span>
                  <button type="button" onClick={() => onReview(r)} className="we-btn we-btn-sm we-btn-indigo">
                    <RotateCcw size={14} />
                    <span>Luyện lại</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
