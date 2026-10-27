import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Activity, Award, Flame, Calendar, X, Shuffle, ArrowRight, Play, BookOpenCheck, Clapperboard, Mic2, Star, Video } from 'lucide-react';
import { SkillHero } from '../weKit';
import './speaking.css';
import { useLocalData, loadData, readHistory } from './speakingUtils';

// Speaking area (WorkingEnglish skin). Sub-pages are local state routes.
const MockInterview = lazy(() => import('./MockInterview'));
const Forecast = lazy(() => import('./Forecast'));
const Roulette = lazy(() => import('./Roulette'));
const Shadowing = lazy(() => import('./Shadowing'));
const ShadowingPlayer = lazy(() => import('./ShadowingPlayer'));
const Dubbing = lazy(() => import('./Dubbing'));
const DubbingPlayer = lazy(() => import('./DubbingPlayer'));

const INK = '#1E1B4B';

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
const ART_ICON = { book: BookOpenCheck, calendar: Calendar, cards: Shuffle, video: Video, dub: Clapperboard, score: Star };

function SkillTile({ no, title, desc, tag, cab, art, onClick, href }) {
  const Icon = ART_ICON[art] || Mic2;
  const inner = (
    <>
      <div className="relative flex items-center justify-between border-b-[2.5px] border-[#1E1B4B] p-4" style={{ background: cab }}>
        <span className="we-icon-tile h-14 w-14 rounded-2xl bg-white transition-transform duration-300 group-hover:-rotate-6"><Icon className="h-7 w-7" strokeWidth={2.5} /></span>
        <span className="we-display text-4xl text-[#1E1B4B]/30">{String(no).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="we-display text-2xl text-[#1E1B4B]">{title}</span>
          {tag && <span className="we-chip !py-0.5" style={{ background: tag.bg, color: tag.fg ?? INK }}>{tag.label}</span>}
        </div>
        <span className="flex-1 text-[15px] font-semibold leading-normal text-[var(--text-muted)] [text-wrap:pretty]">{desc}</span>
        <span className="we-btn we-btn-sm mt-1 self-start" style={{ background: cab }}>{href ? 'Mở tài liệu' : 'Bắt đầu'} <ArrowRight className="h-4 w-4" /></span>
      </div>
    </>
  );
  const cls = 'we-card we-card-hover group flex min-w-0 flex-col overflow-hidden text-left';
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

// "Chọn Chủ Đề" modal (Bộ đề thi thật) - WorkingEnglish Speaking Studio
function TopicPicker({ onClose, onStart }) {
  const [data] = useLocalData(() => loadData('topics'));
  const [part, setPart] = useState(1);
  const [sel, setSel] = useState(null);
  const custom = (data?.custom || []).filter(t => t.part === part);

  const selectedTopicName = useMemo(() => {
    if (!sel || !data) return '';
    return data.topics?.[sel]?.name || custom.find(t => t.id === sel)?.name || sel;
  }, [sel, data, custom]);

  const pickRandom = () => {
    if (!data) return;
    const ids = part === 1 ? data.categories.flatMap(c => c.topics.map(t => t.id)) : (part === 2 ? data.p2 : data.p3).map(t => t.id);
    const all = [...ids, ...custom.map(t => t.id)].filter(id => data.topics[id]);
    setSel(all[Math.floor(Math.random() * all.length)]);
  };

  const PART_TABS = [
    { p: 1, label: 'PART 1', sub: '50 chủ đề ngắn', color: '#F8BE33' },
    { p: 2, label: 'PART 2', sub: 'Cue card độc thoại', color: '#3ECF8E' },
    { p: 3, label: 'PART 3', sub: 'Thảo luận sâu Band 7+', color: '#7CC4F2' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full flex-col rounded-t-[32px] border-[3px] border-[#1E1B4B] bg-[#FFFDF8] shadow-[0_12px_0_#1E1B4B] sm:max-w-xl sm:rounded-[32px]">
        {/* Modal Header */}
        <div className="flex shrink-0 items-start justify-between border-b-[2.5px] border-[#1E1B4B] bg-[#FAF8F5] px-6 py-5 rounded-t-[29px]">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="we-sticker !py-0.5 !text-[10px] !bg-[#F43F5E] text-white">
                <Mic2 size={12} strokeWidth={2.5} /> SPEAKING STUDIO
              </span>
            </div>
            <h2 className="we-display text-2xl font-black uppercase tracking-tight text-[#1E1B4B]">
              CHỌN CHỦ ĐỀ PHỎNG VẤN
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#6B6790]">
              AI Examiner mô phỏng trực tiếp đề thi thật theo từng Part
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-all hover:bg-[#F8BE33] hover:-translate-y-0.5"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Part Selector Cards */}
        <div className="grid grid-cols-3 gap-2.5 px-6 pt-4">
          {PART_TABS.map(tab => {
            const on = part === tab.p;
            return (
              <button
                key={tab.p}
                type="button"
                onClick={() => { setPart(tab.p); setSel(null); }}
                className={`flex flex-col items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] p-2.5 text-center transition-all ${
                  on
                    ? 'shadow-[0_4px_0_#1E1B4B] -translate-y-0.5 text-[#1E1B4B]'
                    : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]'
                }`}
                style={{ backgroundColor: on ? tab.color : '#FFFFFF' }}
              >
                <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                <span className="mt-0.5 text-[11px] font-bold opacity-80">{tab.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Topics Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick Random Button */}
          <button
            type="button"
            onClick={pickRandom}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] py-2.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#F8BE33]"
          >
            <Shuffle className="h-4 w-4" strokeWidth={2.5} /> Chọn ngẫu nhiên một đề thi
          </button>

          {/* Custom Topics (if any) */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6790]">
                YOUR CUSTOM TOPICS
              </span>
              <span className="text-[10px] font-black uppercase text-[#F2683A]">⭐ Bộ đề thi thật</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {custom.map(t => {
                const on = sel === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSel(t.id)}
                    className={`flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] px-3 py-1.5 text-xs font-black transition-all ${
                      on
                        ? 'bg-[#4F46E5] text-white shadow-[0_3px_0_#1E1B4B] scale-105'
                        : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]'
                    }`}
                  >
                    {t.is_public && (
                      <span className="rounded-md border border-[#1E1B4B] bg-[#F8BE33] px-1 py-0.2 text-[8px] font-black uppercase text-[#1E1B4B]">
                        Đề thật
                      </span>
                    )}
                    {t.name}
                  </button>
                );
              })}
              {custom.length === 0 && <p className="text-xs italic text-[#6B6790]">Chưa có topic riêng.</p>}
            </div>
          </div>

          {/* Part 1 Categories & Topics */}
          {part === 1 && data && (
            <div className="space-y-4 pb-2">
              {data.categories.map(c => (
                <div key={c.label}>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#6B6790]">
                    {c.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {c.topics.map(t => {
                      const on = sel === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSel(t.id)}
                          className={`rounded-xl border-[2px] border-[#1E1B4B] px-3 py-1.5 text-xs font-bold transition-all ${
                            on
                              ? 'bg-[#4F46E5] text-white shadow-[0_3px_0_#1E1B4B] scale-105 font-black'
                              : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7] hover:-translate-y-0.5'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Part 2 Cue Cards */}
          {part === 2 && data && (
            <div className="pb-2">
              <div className="mb-4 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF0C2] p-3.5 shadow-[0_2px_0_#1E1B4B]">
                <p className="text-xs font-bold leading-relaxed text-[#1E1B4B]">
                  🎯 Giám khảo sẽ đưa ra đề bài độc thoại <strong>"Describe a ..."</strong> và bạn có <strong>1 phút chuẩn bị</strong> trước khi nói trong 2 phút.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.p2.map(t => {
                  const on = sel === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSel(t.id)}
                      className={`rounded-xl border-[2px] border-[#1E1B4B] px-3.5 py-2 text-xs font-bold transition-all ${
                        on
                          ? 'bg-[#3ECF8E] text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] scale-105 font-black'
                          : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7] hover:-translate-y-0.5'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Part 3 Discussion */}
          {part === 3 && data && (
            <div className="pb-2">
              <div className="mb-4 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#E0E7FF] p-3.5 shadow-[0_2px_0_#1E1B4B]">
                <p className="text-xs font-bold leading-relaxed text-[#1E1B4B]">
                  💡 Thảo luận sâu các vấn đề xã hội, so sánh đa chiều và phản biện học thuật. Yêu cầu phản xạ và tư duy <strong>Band 6.5+</strong>.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.p3.map(t => {
                  const on = sel === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSel(t.id)}
                      className={`rounded-xl border-[2px] border-[#1E1B4B] px-3.5 py-2 text-xs font-bold transition-all ${
                        on
                          ? 'bg-[#7CC4F2] text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] scale-105 font-black'
                          : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7] hover:-translate-y-0.5'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Start Button */}
        <div className="shrink-0 border-t-[2.5px] border-[#1E1B4B] bg-[#FAF8F5] px-6 py-4 rounded-b-[29px]">
          {sel ? (
            <button
              type="button"
              onClick={() => onStart(sel)}
              className="flex w-full items-center justify-between rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] px-5 py-3.5 text-base font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_0_#1E1B4B]"
            >
              <span className="truncate">Bắt đầu: {selectedTopicName}</span>
              <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex w-full cursor-not-allowed items-center justify-between rounded-2xl border-[2px] border-[#1E1B4B]/30 bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-400">
              <span>Chọn một chủ đề ở trên để bắt đầu</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
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
    <div className="rounded-[28px] border-4 border-[#1E1B4B] bg-[#FFF8E7] p-6 shadow-[0_10px_0_#1E1B4B] md:p-8">
      <div className="mb-6 flex items-end justify-between border-b-[3px] border-dashed border-[#1E1B4B]/25 pb-4">
        <h3 className="px-display flex items-center gap-2 text-2xl uppercase"><Calendar className="text-[#1E1B4B]/50" /> Lịch sử luyện tập</h3>
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
  const cards = [
    { title: 'Bộ đề thi thật', desc: 'Luyện tập với các bộ đề được sưu tập từ các bộ câu hỏi thi thật ở quá khứ', cab: '#F2683A', art: 'book', onClick: () => setPicker(true) },
    { title: 'Forecast Speaking', tag: { label: 'Quý 3 · Tháng 9-12, 2026', bg: '#F9A8C4' }, desc: 'Dự đoán và cập nhật bộ đề Speaking mới nhất — kèm bộ Quý 2 để ôn lại.', cab: '#F8BE33', art: 'calendar', onClick: () => go('forecast') },
    { title: 'Speaking Roulette', desc: 'Rút thẻ ngẫu nhiên, luyện tập P1/P2/P3 như thi thật.', cab: '#7CC4F2', art: 'cards', onClick: () => go('roulette') },
    { title: 'Shadowing Mode', desc: 'Nghe và nhại theo video YouTube để chuẩn hóa ngữ điệu.', cab: '#3ECF8E', art: 'video', onClick: () => go('shadowing') },
    { title: 'Lồng tiếng BBC · TED-Ed', tag: { label: 'MỚI', bg: '#F2683A', fg: '#FFFFFF' }, desc: 'Thu giọng từng câu, xem lại video với chính giọng của bạn.', cab: '#E06A96', art: 'dub', onClick: () => go('dubbing') },
    { title: 'Sample 8.0 Speaking', desc: 'Biên soạn bởi giáo viên 10 lần 8.5 IELTS', cab: '#A5B4FC', art: 'score', href: 'https://drive.google.com/file/d/1inr9drBzFyZz8sv4daPcEPZuueXt9YQ9/view?usp=sharing' },
  ];
  return (
    <div className="px-root we-page">
      <SkillHero
        variant="speaking"
        onBack={onBack}
        eyebrow="WorkingEnglish · Speaking Studio"
        title="Nói"
        accent="Tự tin từng câu"
        subtitle="Phỏng vấn thử theo đề thật, forecast theo quý, shadowing và lồng tiếng video. Ghi âm, nghe lại và sửa ngay chỗ còn vấp."
        stats={[
          { value: stats.week, label: 'phiên tuần này' },
          { value: stats.streak, label: 'ngày liên tiếp' },
        ]}
      />
      <main className="relative z-[1] mx-auto max-w-[1280px] px-[clamp(20px,4vw,48px)] pb-[120px] pt-10">
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {cards.map((c, i) => <SkillTile key={c.title} no={i + 1} {...c} />)}
        </div>
        <div className="mt-14 space-y-10">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Activity, bg: '#DCF0FD', value: stats.week, label: 'Phiên (tuần)' },
              { icon: Award, bg: '#D4F5E4', value: '-', label: 'Band TB (7 lần)' },
              { icon: Flame, bg: '#FFE1D4', value: stats.streak, label: 'Ngày liên tiếp' },
            ].map(s => (
              <div key={s.label} className="we-card flex min-w-[160px] flex-col items-center px-6 py-4">
                <span className="we-icon-tile mb-2 h-10 w-10" style={{ background: s.bg }}><s.icon className="h-5 w-5" strokeWidth={2.5} /></span>
                <span className="we-display text-3xl">{s.value}</span>
                <span className="mt-1 text-xs font-extrabold uppercase text-[var(--text-muted)]">{s.label}</span>
              </div>
            ))}
          </div>
          <HistoryPanel />
        </div>
      </main>
      {picker && <TopicPicker onClose={() => setPicker(false)} onStart={id => { setPicker(false); go('mock', id); }} />}
    </div>
  );
}

export default function SpeakingHub({ onBack, onSaveWord, speechVoice, onLookupDictionary, onTryInDoctor }) {
  const [route, setRoute] = useState({ page: 'hub' });
  const go = (page, id, mode) => setRoute({ page, id, mode });
  const home = () => go('hub');
  const common = { onSaveWord, speechVoice, onLookupDictionary, onTryInDoctor };
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
