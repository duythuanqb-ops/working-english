// IELTS Listening area (WorkingEnglish skin). Sub-pages are local state routes (the app has no router).
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { FileText, Headphones, Mic2, MonitorPlay, Play, Search } from 'lucide-react';
import './listening.css';
import { LISTENING_INDEX } from './data';
import { CamOrange, PAGE_BG, PX_ROOT, pxProgress, useProgressMap } from './px';
import { SectionHeading, SkillHero, SoundBars } from '../weKit';

const DictationPlayer = lazy(() => import('./DictationPlayer'));
const CamTestPage = lazy(() => import('./CamTestPage'));
const PronunciationHub = lazy(() => import('./PronunciationHub'));
const PronunciationSet = lazy(() => import('./PronunciationSet'));
const YoutubeDictation = lazy(() => import('./YoutubeDictation'));

const PALETTE = ['#4F46E5', '#F2683A', '#3ECF8E', '#F8BE33', '#E06A96', '#7CC4F2'];
const bookColor = id => {
  const n = parseInt(id.replace(/\D/g, ''), 10);
  return PALETTE[(Number.isNaN(n) ? id.length : n) % PALETTE.length];
};
const LIGHT_BG = new Set(['#3ECF8E', '#F8BE33', '#7CC4F2']);

const FILTERS = [
  { id: 'all', name: 'Tất cả' }, { id: 'cambridge', name: 'Cambridge' }, { id: 'gap', name: 'Gap Filling' }, { id: 'spelling', name: 'Spelling' },
  { id: 'numbers', name: 'Numbers' }, { id: 'ipa', name: 'Pronunciation' }, { id: 'conversations', name: 'Conversations' },
];

const GAP_KIND = { note: 'Note', form: 'Form', table: 'Table', summary: 'Summary', sentence: 'Sentence', flowchart: 'Flow-chart', diagram: 'Diagram', short: 'Short answer' };

// Library volumes grouped like the site (Cambridge books newest first, then other categories by title).
function buildVolumes(library) {
  const map = {};
  for (const l of library) {
    const v = (map[l.category] ||= { id: l.category, title: l.categoryTitle, tests: {} });
    (v.tests[l.group] ||= []).push(l);
  }
  const vols = Object.values(map).sort((a, b) => {
    const ac = a.id.startsWith('cam'), bc = b.id.startsWith('cam');
    if (ac && bc) return b.id.localeCompare(a.id, undefined, { numeric: true });
    if (ac) return -1;
    if (bc) return 1;
    return a.title.localeCompare(b.title);
  });
  vols.forEach(v => Object.values(v.tests).forEach(list => list.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }))));
  return vols;
}

const pill = 'rounded-full border-2 border-[#1E1B4B] px-2.5 py-[3px]';

function VolumeList({ volumes, progress, onOpenLesson }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="flex flex-col gap-3">
      {volumes.map(v => {
        const isCam = v.id.startsWith('cam');
        const book = isCam ? v.id.replace('cam', '') : null;
        const expanded = open === v.id;
        const all = Object.values(v.tests).flat();
        let done = 0, started = 0;
        all.forEach(l => { const p = progress[l.id]; if (p) { if (p.completed) done++; else if (p.done > 0) started++; } });
        return (
          <div key={v.id} className={`overflow-hidden rounded-[20px] border-[3px] border-[#1E1B4B] bg-white transition-shadow ${expanded ? 'shadow-[0_6px_0_#1E1B4B]' : ''}`}>
            <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : v.id)} className="flex w-full items-center gap-[18px] px-[18px] py-3.5 text-left transition-colors hover:bg-[#FFF0C2]">
              <span className="flex h-[82px] w-16 flex-none flex-col items-center justify-center gap-0.5 rounded-[10px] border-[3px] border-[#1E1B4B] shadow-[inset_6px_0_0_rgba(0,0,0,.18),0_4px_0_#1E1B4B]" style={{ background: bookColor(v.id), color: LIGHT_BG.has(bookColor(v.id)) ? '#1E1B4B' : '#FFF8E7' }}>
                <span className="text-[9px] font-extrabold tracking-widest opacity-80">{isCam ? 'CAM' : 'SKILL'}</span>
                <span className="px-display text-2xl leading-none">{book ?? v.id.charAt(0).toUpperCase()}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="px-display flex items-center gap-2 text-xl uppercase leading-[1.1]">
                  {isCam ? `Cambridge IELTS ${book}` : v.title}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                  <span className={`${pill} bg-[#FFF8E7]`}>{Object.keys(v.tests).length} Tests</span>
                  <span className={`${pill} bg-[#FFF8E7]`}>Listening</span>
                  {(done > 0 || started > 0) && <span className={`${pill} bg-[#D4F5E4]`}>{done}/{all.length} bài đã xong</span>}
                  {started > 0 && <span className={`${pill} bg-[#FFF0C2]`}>{started} đang dở</span>}
                </span>
              </span>
              <span aria-hidden="true" className={`px-display grid h-[42px] w-[42px] flex-none place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] text-base transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}>→</span>
            </button>
            {expanded && (
              <div className="space-y-7 border-t-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-4 [animation:pxFadeUp_.32s_ease-out_both] md:p-6">
                {Object.entries(v.tests).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([group, lessons]) => (
                  <div key={group}>
                    <div className="mb-3 flex items-center gap-4">
                      <h4 className="px-display text-sm uppercase">{group}</h4>
                      <div className="h-[3px] flex-1 rounded bg-[#1E1B4B]/15" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {lessons.map(l => {
                        const p = pxProgress(progress[l.id]);
                        return (
                          <button key={l.id} type="button" onClick={() => onOpenLesson(l.id)} className="flex items-center gap-3 rounded-2xl border-2 border-[#1E1B4B] bg-white px-3.5 py-3 text-left text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1E1B4B]">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#1E1B4B] bg-[#DCF0FD]"><FileText className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1 truncate font-extrabold">{l.title.split('-').pop()?.trim() || l.title}</span>
                            <span className={`hidden whitespace-nowrap rounded-full border-2 border-[#1E1B4B] px-2.5 py-0.5 text-[11px] font-extrabold sm:inline ${p ? (p.done ? 'bg-[#DCF0FD]' : 'bg-[#FFF0C2]') : 'bg-white'}`}>{p ? `${p.done ? '✓ ' : ''}${p.text}` : 'Dictation'}</span>
                            <span className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#1E1B4B] bg-[#F8BE33] px-3 py-1.5 text-[11px] font-extrabold uppercase"><Play className="h-3 w-3 fill-current" />Start</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GapTags({ groups }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {groups.map((g, i) => (
        <span key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800">
          {GAP_KIND[g.kind] ?? g.kind} · Q{g.nums[0]}{g.nums.length > 1 ? `–${g.nums[g.nums.length - 1]}` : ''}{g.withOptions ? ' · chọn từ danh sách' : ''}
        </span>
      ))}
    </span>
  );
}

function ListeningHome({ ui, setUi, go, onBack }) {
  const { query, filter, book, showAll } = ui;
  const set = patch => setUi(s => ({ ...s, ...patch }));
  const progress = useProgressMap('listening');
  const [showStats, setShowStats] = useState(false);
  const volumes = useMemo(() => buildVolumes(LISTENING_INDEX.library), []);
  const camTests = LISTENING_INDEX.camTests;
  const books = useMemo(() => [...new Set(camTests.map(t => t.volume))].sort((a, b) => a - b), [camTests]);
  const activeBook = book !== null && books.includes(book) ? book : books[books.length - 1];
  const bookTests = camTests.filter(t => t.volume === activeBook).sort((a, b) => a.testNumber - b.testNumber);

  const q = query.toLowerCase();
  const filtered = volumes.filter(v =>
    (v.title.toLowerCase().includes(q) || Object.values(v.tests).some(ls => ls.some(l => l.title.toLowerCase().includes(q)))) &&
    (filter === 'all' || (filter === 'cambridge' ? v.id.startsWith('cam') : v.id === filter)));
  const shown = showAll || query ? filtered : filtered.slice(0, 6);
  const gq = query.trim().toLowerCase();
  const gapItems = LISTENING_INDEX.gap.filter(g => !gq || `${g.title} ${g.series} cam ${g.book} test ${g.testNumber} part ${g.part}`.toLowerCase().includes(gq));
  const gapSeries = [...new Set(gapItems.map(g => g.series))];

  const totalLessons = LISTENING_INDEX.library.length;
  const doneCount = Object.values(progress).filter(p => p.completed).length;
  const ctas = [
    { key: 'yt', title: 'Dictation YouTube', desc: 'Dán link video bất kỳ, nghe và chép lại từng câu.', icon: MonitorPlay, bg: '#F2683A', fg: '#fff', onClick: () => go({ name: 'yt' }) },
    { key: 'cam', title: 'Dictation Cambridge', desc: 'Chép chính tả theo từng part của đề Cambridge.', icon: Headphones, bg: '#F8BE33', fg: '#1E1B4B', onClick: () => { set({ filter: 'cambridge' }); document.getElementById('library-archives')?.scrollIntoView({ behavior: 'smooth' }); } },
    { key: 'ipa', title: 'Phát âm IPA', desc: 'Luyện tai phân biệt từng âm và cặp âm dễ nhầm.', icon: Mic2, bg: '#7CC4F2', fg: '#1E1B4B', onClick: () => go({ name: 'pron' }) },
  ];

  return (
    <div className={`${PX_ROOT} relative min-h-screen w-full overflow-x-clip`} style={PAGE_BG}>
      <SkillHero
        variant="listening"
        onBack={onBack}
        eyebrow="WorkingEnglish · Listening Lab"
        title="Nghe"
        accent="Bắt trọn từng âm"
        subtitle="Nghe chép chính tả theo đề Cambridge, video YouTube và bài phát âm IPA. Mỗi câu sai là một âm bạn sẽ không bỏ lỡ lần sau."
        stats={[
          { value: books.length, label: 'bộ Cambridge' },
          { value: totalLessons, label: 'bài dictation' },
          { value: doneCount, label: 'bài đã xong' },
        ]}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-[clamp(20px,4vw,48px)] pb-[120px] pt-10">
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ctas.map((c, i) => {
            const Icon = c.icon;
            return (
              <button key={c.key} type="button" onClick={c.onClick} className="we-card we-card-hover we-pop-in group flex items-start gap-4 p-5 text-left" style={{ '--we-rot': `${(i - 1) * 0.8}deg`, animationDelay: `${i * 70}ms` }}>
                <span className="we-icon-tile h-14 w-14 rounded-2xl transition-transform group-hover:-rotate-6" style={{ background: c.bg, color: c.fg }}><Icon className="h-6 w-6" strokeWidth={2.5} /></span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="we-display text-xl">{c.title}</span>
                  <span className="text-sm font-semibold leading-snug text-[var(--text-muted)]">{c.desc}</span>
                </span>
                <span aria-hidden="true" className="we-display mt-1 text-xl transition-transform group-hover:translate-x-1">→</span>
              </button>
            );
          })}
        </section>

        {bookTests.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading
              title="Đề thi đầy đủ"
              tag="Thi thật"
              right={<button type="button" onClick={() => setShowStats(true)} className="we-btn we-btn-sm we-btn-white">Lịch sử làm bài →</button>}
            />
            <div className="flex flex-wrap items-center gap-2 rounded-[22px] border-[2.5px] border-[#1E1B4B] bg-white p-2.5 shadow-[var(--we-pop-sm)]">
              <span className="we-display px-2 text-sm uppercase">Cambridge</span>
              {books.map(b => (
                <button key={b} type="button" aria-pressed={b === activeBook} onClick={() => set({ book: b })} className="we-toggle min-w-[48px]">{b}</button>
              ))}
            </div>

            <div key={activeBook} className="grid grid-cols-1 gap-5 [animation:pxFadeUp_.32s_ease-out_both] sm:grid-cols-2 xl:grid-cols-4">
              {bookTests.map((t, i) => {
                const color = PALETTE[i % PALETTE.length];
                const dark = !LIGHT_BG.has(color);
                const p = pxProgress(progress[`cam:${t.testId}`]);
                return (
                  <article key={t.testId} className="we-card we-card-hover flex flex-col overflow-hidden">
                    {/* cassette label */}
                    <div className="relative flex flex-col gap-3 border-b-[2.5px] border-[#1E1B4B] p-4" style={{ background: color, color: dark ? '#FFF8E7' : '#1E1B4B' }}>
                      <div className="flex items-center justify-between">
                        <span className="we-chip !py-0.5"><CamOrange className="text-[10px]" /> {t.volume}</span>
                        {!t.hasAudio && <span className="we-chip !bg-[#1E1B4B] !py-0.5 !text-white">No audio</span>}
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <span className="we-display text-[44px] leading-[.9]">Test {t.testNumber}</span>
                        <span className="flex items-center gap-2 rounded-full border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] px-2 py-1.5" aria-hidden="true">
                          <span className="h-4 w-4 rounded-full border-[2.5px] border-[#1E1B4B] bg-white" />
                          <SoundBars count={5} className="!h-4 !gap-[2px] [&>i]:!w-[3px]" color="#1E1B4B" />
                          <span className="h-4 w-4 rounded-full border-[2.5px] border-[#1E1B4B] bg-white" />
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <p className="text-sm font-semibold text-[var(--text-muted)]">4 part · 40 câu · 30 phút</p>
                      {p ? (
                        <span className={`we-chip self-start ${p.done ? '!bg-[#D4F5E4]' : '!bg-[#FFF0C2]'}`}>{p.done ? '✓ ' : ''}{p.text}</span>
                      ) : (
                        <span className="we-chip self-start !border-dashed !text-[var(--text-muted)]">Chưa làm</span>
                      )}
                      <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                        <button type="button" onClick={() => go({ name: 'camtest', testId: t.testId, mode: 'practice' })} className="we-btn we-btn-sm we-btn-white">Luyện tập</button>
                        <button type="button" onClick={() => go({ name: 'camtest', testId: t.testId, mode: 'real_test' })} className="we-btn we-btn-sm we-btn-indigo"><Play className="h-3 w-3 fill-current" />Thi thật</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section id="library-archives" className="we-card flex scroll-mt-24 flex-col gap-5 p-[clamp(20px,3vw,32px)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading title="Kho bài nghe" />
            <label className="flex min-h-[48px] w-full items-center gap-2.5 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] px-4 focus-within:shadow-[var(--we-pop-sm)] sm:w-auto sm:flex-[0_1_340px]">
              <Search className="h-4 w-4 shrink-0" strokeWidth={2.75} />
              <input type="text" className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-semibold text-[#1E1B4B] outline-none placeholder:text-[#1E1B4B]/50" placeholder="Tìm bài nghe (VD: Cam 20)..." value={query} onChange={e => set({ query: e.target.value })} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (f.id === 'ipa'
              ? <button key={f.id} type="button" onClick={() => go({ name: 'pron' })} className="we-toggle">{f.name}</button>
              : <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => set({ filter: f.id })} className="we-toggle">{f.name}</button>))}
          </div>

          {filter === 'gap' ? (
            <div className="flex flex-col gap-7">
              <div className="rounded-2xl border-[2.5px] border-dashed border-[#1E1B4B] bg-[#FFF0C2] px-5 py-4 text-[14px] font-semibold leading-snug">
                <span className="font-extrabold">Gap Filling: </span>
                mở part là chỉ còn câu điền từ (form, note, table, flow-chart…), chấm ngay tại chỗ, bấm từng câu để nghe lại đúng đoạn chứa đáp án kèm script.
                <span className="font-extrabold"> {LISTENING_INDEX.gap.length} part · {LISTENING_INDEX.gap.reduce((s, g) => s + g.total, 0)} câu.</span>
              </div>
              {gapItems.length === 0 ? (
                <p className="py-10 text-center text-sm font-bold text-[#1E1B4B]/50">Không có part nào khớp tìm kiếm.</p>
              ) : gapSeries.map(series => (
                <div key={series}>
                  <h3 className="we-display mb-3 text-lg uppercase">{series.replace('Cambridge', 'Cambridge IELTS')}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gapItems.filter(g => g.series === series).map(g => {
                      const p = pxProgress(progress[`gap:${g.id}`]);
                      return (
                        <button key={g.id} type="button" onClick={() => go({ name: 'camtest', testId: g.testId, mode: 'practice', part: g.part, focus: 'gap' })} className="we-card we-card-hover group flex flex-col gap-2 !rounded-2xl p-4 text-left">
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="we-display text-[13px] uppercase">Test {g.testNumber} · Part {g.part}</span>
                            {p && <span className={`we-chip !text-[10px] ${p.done ? '!bg-[#D4F5E4]' : '!bg-[#FFF0C2]'}`}>{p.done ? '✓ ' : ''}{p.text}</span>}
                          </div>
                          <span className="line-clamp-2 text-[15px] font-extrabold leading-snug">{g.title}</span>
                          <GapTags groups={g.groups} />
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#4F46E5]">
                            {g.total} câu · Luyện ngay <span className="transition-transform group-hover:translate-x-0.5">→</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {shown.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border-[2.5px] border-dashed border-[#1E1B4B] bg-[#FFF8E7] px-6 py-10 text-center">
                  <p className="font-extrabold">Không có bài nghe nào khớp “{query || FILTERS.find(f => f.id === filter)?.name}”.</p>
                  <button type="button" onClick={() => set({ query: '', filter: 'all' })} className="we-btn we-btn-sm">Xem tất cả bài nghe</button>
                </div>
              ) : (
                <VolumeList volumes={shown} progress={progress} onOpenLesson={id => go({ name: 'lesson', id })} />
              )}
              {!showAll && !query && filtered.length > 11 && (
                <div className="flex flex-col items-center gap-4 border-t-2 border-dashed border-[#1E1B4B]/25 pt-6">
                  <p className="text-sm font-semibold text-[#1E1B4B]/60">Còn nhiều bài nghe khác trong kho...</p>
                  <button type="button" onClick={() => set({ showAll: true })} className="we-btn">Xem toàn bộ kho ↓</button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      {showStats && <StatsModal progress={progress} onClose={() => setShowStats(false)} />}
    </div>
  );
}

// Listening history: progress saved on this device.
function StatsModal({ progress, onClose }) {
  const tests = LISTENING_INDEX.camTests;
  const rows = Object.entries(progress)
    .filter(([id]) => id.startsWith('cam:') || id.startsWith('gap:'))
    .map(([id, p]) => {
      const [kind, testId, part] = id.split(':');
      const t = tests.find(x => x.testId === testId);
      return { id, label: `${t?.testName ?? testId}${part ? ` · ${part.replace('p', 'Part ')}` : ''}`, kind: kind === 'gap' ? 'Gap Filling' : 'Full test', p };
    });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,27,75,.55)] p-4" onClick={onClose}>
      <div className="w-full max-w-lg we-card !rounded-[26px] bg-[#FFF8E7] p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="we-display m-0 text-2xl">Lịch sử Listening</h3>
          <button type="button" onClick={onClose} className="px-display grid h-9 w-9 place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-white">×</button>
        </div>
        {rows.length === 0 ? (
          <p className="text-[14px] font-semibold text-[#1E1B4B]/70">Chưa có bài nào được nộp trên máy này. Làm một đề Full Test hoặc Gap Filling rồi quay lại đây.</p>
        ) : (
          <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {rows.map(r => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border-[3px] border-[#1E1B4B] bg-white px-4 py-2.5">
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-extrabold">{r.label}</span><span className="text-[11px] font-bold uppercase tracking-wider text-[#1E1B4B]/50">{r.kind}</span></span>
                <span className="whitespace-nowrap rounded-full border-2 border-[#1E1B4B] bg-[#DCF0FD] px-2.5 py-0.5 text-[12px] font-extrabold">{r.p.done}/{r.p.total} câu</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[12px] font-semibold text-[#1E1B4B]/55">Bản offline chỉ lưu số câu bạn đã làm trên máy này.</p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#1E1B4B] border-t-transparent" />
    </div>
  );
}

export default function ListeningHub({ onBack, onSaveWord, speechVoice }) {
  const [route, setRoute] = useState({ name: 'home' });
  const [homeUi, setHomeUi] = useState({ query: '', filter: 'all', book: null, showAll: false });
  const go = r => setRoute(r);
  const home = () => setRoute({ name: 'home' });

  useEffect(() => {
    window.scrollTo?.(0, 0);
    document.querySelector('.tid-root')?.scrollTo?.(0, 0);
  }, [route]);

  const common = { onSaveWord, speechVoice };
  let page;
  switch (route.name) {
    case 'lesson': page = <DictationPlayer key={route.id} lessonId={route.id} onBack={home} {...common} />; break;
    case 'camtest': page = <CamTestPage key={`${route.testId}-${route.mode}-${route.part}`} testId={route.testId} mode={route.mode} initialPart={route.part} focus={route.focus} onBack={home} go={go} {...common} />; break;
    case 'pron': page = <PronunciationHub onBack={home} onOpen={id => go({ name: 'pronSet', id })} />; break;
    case 'pronSet': page = <PronunciationSet key={route.id} setId={route.id} onBack={() => go({ name: 'pron' })} />; break;
    case 'yt': page = <YoutubeDictation onBack={home} {...common} />; break;
    default: page = <ListeningHome ui={homeUi} setUi={setHomeUi} go={go} onBack={onBack} />;
  }
  return <div className="tid-listening w-full"><Suspense fallback={<Loading />}>{page}</Suspense></div>;
}
