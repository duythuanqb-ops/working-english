// IELTS Listening area — mirrors theieltsdictionary.com/practice/listening and its sub-pages.
// Sub-pages are local state routes (the app has no router).
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { FileText, Play } from 'lucide-react';
import './listening.css';
import { LISTENING_INDEX } from './data';
import { HERO_ART_HTML } from './heroArt';
import { CamOrange, GRASS_BG, PX_HERO_ART, PX_ROOT, PixelArt, PxBackLink, PxImg, pxProgress, useProgressMap, withCamOrange } from './px';

const DictationPlayer = lazy(() => import('./DictationPlayer'));
const CamTestPage = lazy(() => import('./CamTestPage'));
const PronunciationHub = lazy(() => import('./PronunciationHub'));
const PronunciationSet = lazy(() => import('./PronunciationSet'));
const YoutubeDictation = lazy(() => import('./YoutubeDictation'));

const BOOK_COLORS = {
  cam20: '#C8641E', cam19: '#2F3A50', cam18: '#1F2A3A', cam17: '#5A3AA8', cam16: '#2E7D3A', cam15: '#B83A44', cam14: '#8A3A6A',
  cam13: '#4C2E8A', cam12: '#1E6A5A', cam11: '#2F3A7A', cam10: '#8A4A1E', cam9: '#5A6450', spelling: '#E8505B', numbers: '#3E9B5A',
  ipa: '#7E4AC8', conversations: '#2F7AB0',
};

const CARD_STYLES = [
  { bg: '#8A68C8', fg: '#FFFFFF', chip: 'rgba(31,42,26,.42)', pattern: 'radial-gradient(circle at 85% 20%,rgba(255,255,255,.18) 0 70px,transparent 71px),radial-gradient(circle at 10% 90%,rgba(255,255,255,.14) 0 110px,transparent 111px)', rot: '-3deg', dy: '14px' },
  { bg: '#F2683A', fg: '#FFFFFF', chip: 'rgba(31,42,26,.42)', pattern: 'radial-gradient(ellipse at 20% 10%,rgba(255,190,120,.45) 0 90px,transparent 91px),radial-gradient(circle at 90% 80%,rgba(255,255,255,.14) 0 90px,transparent 91px)', rot: '2deg', dy: '-6px' },
  { bg: '#E06A96', fg: '#FFFFFF', chip: 'rgba(31,42,26,.42)', pattern: 'radial-gradient(circle at 80% 30%,rgba(255,255,255,.2) 0 80px,transparent 81px),radial-gradient(ellipse at 0 70%,rgba(255,255,255,.16) 0 100px,transparent 101px)', rot: '-2deg', dy: '10px' },
  { bg: '#F8D24A', fg: '#1F2A1A', chip: 'rgba(31,42,26,.18)', pattern: 'radial-gradient(circle at 70% 60%,rgba(255,255,255,.3) 0 100px,transparent 101px),radial-gradient(circle at 10% 10%,rgba(255,170,40,.25) 0 70px,transparent 71px)', rot: '3deg', dy: '0px' },
];

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

const pill = 'rounded-full border-2 border-[#1F2A1A] px-2.5 py-[3px]';
const filterCls = active => `rounded-full border-[3px] border-[#1F2A1A] px-4 py-2.5 text-[13px] font-extrabold uppercase leading-none tracking-[.06em] text-[#1F2A1A] transition-transform ${active ? '-translate-y-0.5 bg-[#F8BE33] shadow-[0_4px_0_#1F2A1A]' : 'bg-white hover:bg-[#FFF3CF]'}`;

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
          <div key={v.id} className={`overflow-hidden rounded-[20px] border-[3px] border-[#1F2A1A] bg-white transition-shadow ${expanded ? 'shadow-[0_6px_0_#1F2A1A]' : ''}`}>
            <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : v.id)} className="flex w-full items-center gap-[18px] px-[18px] py-3.5 text-left transition-colors hover:bg-[#FFF3CF]">
              <span className="flex h-[82px] w-16 flex-none flex-col items-center justify-center gap-0.5 rounded-[10px] border-[3px] border-[#1F2A1A] text-[#FDF5E0] shadow-[inset_6px_0_0_rgba(0,0,0,.25),0_4px_0_#1F2A1A]" style={{ background: BOOK_COLORS[v.id] ?? '#475569' }}>
                {isCam ? <CamOrange className="h-[18px] w-[18px]" /> : <span className="text-[9px] font-extrabold tracking-widest opacity-70">SKILL</span>}
                <span className="px-display text-2xl leading-none">{book ?? v.id.charAt(0).toUpperCase()}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="px-display flex items-center gap-2 text-xl uppercase leading-[1.1]">
                  {isCam ? <><CamOrange className="h-[22px] w-[22px]" />{book}</> : v.title}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                  <span className={`${pill} bg-[#FDF5E0]`}>{Object.keys(v.tests).length} Tests</span>
                  <span className={`${pill} bg-[#FDF5E0]`}>Listening</span>
                  {(done > 0 || started > 0) && <span className={`${pill} bg-[#CDEBA8]`}>{done}/{all.length} bài đã xong</span>}
                  {started > 0 && <span className={`${pill} bg-[#FFE08A]`}>{started} đang dở</span>}
                </span>
              </span>
              <span aria-hidden="true" className={`px-display grid h-[42px] w-[42px] flex-none place-items-center rounded-xl border-[3px] border-[#1F2A1A] bg-[#F8BE33] text-base transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}>→</span>
            </button>
            {expanded && (
              <div className="space-y-7 border-t-[3px] border-[#1F2A1A] bg-[#FDF5E0] p-4 [animation:pxFadeUp_.32s_ease-out_both] md:p-6">
                {Object.entries(v.tests).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([group, lessons]) => (
                  <div key={group}>
                    <div className="mb-3 flex items-center gap-4">
                      <h4 className="px-display text-sm uppercase">{group}</h4>
                      <div className="h-[3px] flex-1 rounded bg-[#1F2A1A]/15" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {lessons.map(l => {
                        const p = pxProgress(progress[l.id]);
                        return (
                          <button key={l.id} type="button" onClick={() => onOpenLesson(l.id)} className="flex items-center gap-3 rounded-2xl border-2 border-[#1F2A1A] bg-white px-3.5 py-3 text-left text-[#1F2A1A] shadow-[0_3px_0_#1F2A1A] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1F2A1A]">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#1F2A1A] bg-[#BFE0F7]"><FileText className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1 truncate font-extrabold">{l.title.split('-').pop()?.trim() || l.title}</span>
                            <span className={`hidden whitespace-nowrap rounded-full border-2 border-[#1F2A1A] px-2.5 py-0.5 text-[11px] font-extrabold sm:inline ${p ? (p.done ? 'bg-[#BFE0F7]' : 'bg-[#FFE08A]') : 'bg-white'}`}>{p ? `${p.done ? '✓ ' : ''}${p.text}` : 'Dictation'}</span>
                            <span className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#1F2A1A] bg-[#F8BE33] px-3 py-1.5 text-[11px] font-extrabold uppercase"><Play className="h-3 w-3 fill-current" />Start</span>
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

  const ctas = [
    { key: 'yt', label: 'Luyện dictation video youtube ở đây', icon: '▶', iconBg: '#E8505B', dark: true, onClick: () => go({ name: 'yt' }) },
    { key: 'cam', label: 'Luyện dictation Cambridge ở đây', icon: '♪', iconBg: '#F8BE33', onClick: () => { set({ filter: 'cambridge' }); document.getElementById('library-archives')?.scrollIntoView({ behavior: 'smooth' }); } },
    { key: 'ipa', label: 'Luyện phát âm IPA ở đây', icon: 'Ə', iconBg: '#BFE0F7', onClick: () => go({ name: 'pron' }) },
  ];

  return (
    <div className={`${PX_ROOT} relative min-h-screen w-full overflow-x-clip bg-[#43A05A]`} style={GRASS_BG}>
      <header className="relative overflow-hidden bg-[#353D5C] pb-[390px] sm:pb-[540px]">
        <PixelArt html={HERO_ART_HTML} className={PX_HERO_ART} />
        <div className="relative z-[3] mx-auto flex max-w-[1440px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,40px)] pt-[32px] text-center">
          <PxBackLink onClick={onBack} label="Quay lại chọn kỹ năng" />
          <span className="mt-2.5 inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-[#1F2A1A] bg-[#D6363F] px-4 py-[7px] text-sm font-extrabold tracking-[.08em] text-white">LISTENING PRACTICE HUB</span>
          <h1 className="px-display px-outline m-0 text-[clamp(44px,8.4vw,112px)] leading-[1.15] [--px-drop:8px] [--px-stroke:clamp(6px,.9vw,10px)]">IELTS LISTENING</h1>
          <p className="m-0 max-w-[780px] text-[clamp(18px,2vw,24px)] font-bold leading-[1.55] text-[#FDF5E0] [text-shadow:0_3px_0_#1F2A1A,2px_0_0_#1F2A1A,-2px_0_0_#1F2A1A,0_-2px_0_#1F2A1A] [text-wrap:pretty]">
            {withCamOrange('Luyện nghe chép chính tả IELTS Listening với dữ liệu đề thi Cambridge mới nhất. Rèn luyện kỹ năng bắt âm và tránh sai sót.', 'h-[1.1em] w-[1.1em] align-[-0.18em]')}
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-[clamp(20px,4vw,40px)] pb-[120px] pt-14">
        <section className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
          {ctas.map(c => (
            <button key={c.key} type="button" onClick={c.onClick} className={`flex items-center gap-3.5 rounded-[20px] border-4 border-[#1F2A1A] px-5 py-[18px] text-left shadow-[0_7px_0_#1F2A1A] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_10px_0_#1F2A1A] ${c.dark ? 'bg-[#2F3A7A] text-white' : 'bg-[#FDF5E0] text-[#1F2A1A]'}`}>
              <span aria-hidden="true" className="px-display grid h-[46px] w-[46px] flex-none place-items-center rounded-xl border-[3px] border-[#1F2A1A] text-lg text-[#1F2A1A]" style={{ background: c.iconBg }}>{c.icon}</span>
              <span className="px-display flex flex-1 flex-wrap items-center gap-1.5 text-[15px] uppercase leading-[1.3]">{withCamOrange(c.label, 'h-[22px] w-[22px]')}</span>
              <span aria-hidden="true" className="px-display flex-none text-lg">→</span>
            </button>
          ))}
        </section>

        {bookTests.length > 0 && (
          <section className="flex flex-col gap-[22px]">
            <div className="flex flex-col gap-4 rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(22px,3.4vw,36px)] shadow-[0_10px_0_#1F2A1A]">
              <div className="flex flex-wrap items-center gap-3.5">
                <CamOrange className="h-10 w-10" />
                <h2 className="px-display m-0 text-[clamp(26px,3.4vw,40px)] leading-[1.1]">FULL TESTS</h2>
                <span className="-rotate-3 rounded-full border-[3px] border-[#1F2A1A] bg-[#D6363F] px-3.5 py-[5px] text-[13px] font-extrabold uppercase tracking-[.08em] text-white">Thi thật</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-display text-[13px] uppercase">Bộ đề</span>
                <div className="flex flex-wrap gap-1.5">
                  {books.map(b => (
                    <button key={b} type="button" aria-pressed={b === activeBook} onClick={() => set({ book: b })} className={`px-display min-h-[38px] min-w-[52px] rounded-xl border-[3px] border-[#1F2A1A] px-2 text-[13px] leading-none text-[#1F2A1A] transition-colors hover:bg-[#FFE08A] sm:min-w-[58px] ${b === activeBook ? '-translate-y-0.5 bg-[#F8BE33] shadow-[0_4px_0_#1F2A1A]' : 'bg-white'}`}>{b}</button>
                  ))}
                </div>
                <span aria-hidden="true" className="hidden text-lg font-extrabold opacity-50 xl:inline">|</span>
                <button type="button" onClick={() => setShowStats(true)} className="inline-flex min-h-9 items-center text-[13px] font-extrabold text-[#1F2A1A] underline underline-offset-[3px] transition-colors hover:text-[#C2410C]">Tỉ lệ đúng theo dạng câu hỏi của bạn →</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <h3 className="px-display px-outline m-0 flex items-center gap-3 text-[clamp(28px,4vw,46px)] leading-[1.1] [--px-drop:5px] [--px-stroke:7px]">
                <CamOrange className="h-[1em] w-[1em]" /><span>IELTS {activeBook}</span>
              </h3>
              <span className="rounded-full border-[3px] border-[#1F2A1A] bg-[#BFE0F7] px-3 py-[5px] text-xs font-extrabold uppercase tracking-[.06em]">Giao diện giống thi thật 100%</span>
            </div>
            <div key={activeBook} className="grid grid-cols-2 gap-3 pb-2.5 pt-2 [animation:pxFadeUp_.32s_ease-out_both] sm:gap-5 lg:grid-cols-4 lg:gap-4 xl:flex xl:justify-center xl:gap-x-6 xl:pt-[18px]">
              {bookTests.map((t, i) => {
                const st = CARD_STYLES[(t.testNumber - 1) % CARD_STYLES.length];
                const p = pxProgress(progress[`cam:${t.testId}`]);
                const plays = 35000 + 1000 * t.volume + 123 * t.testNumber;
                return (
                  <article key={t.testId} className="relative flex min-h-[300px] min-w-0 flex-col gap-2.5 overflow-hidden rounded-[22px] p-3.5 shadow-[0_10px_22px_rgba(31,42,26,.28)] transition-[transform,translate] duration-200 [z-index:var(--z)] focus-within:z-[9] hover:z-[9] max-xl:hover:-translate-y-1 sm:min-h-[340px] sm:gap-3.5 sm:rounded-[28px] sm:p-[22px] sm:shadow-[0_14px_28px_rgba(31,42,26,.28)] xl:min-h-[360px] xl:max-w-[290px] xl:flex-[1_1_0] xl:[transform:rotate(var(--rot))_translateY(var(--dy))] xl:hover:[transform:rotate(0deg)_translateY(-14px)_scale(1.03)]"
                    style={{ backgroundColor: st.bg, backgroundImage: st.pattern, color: st.fg, '--rot': st.rot, '--dy': st.dy, '--z': i + 1 }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white px-[11px] py-1.5 text-[13px] font-extrabold leading-none text-[#1F2A1A]">{String(t.testNumber).padStart(2, '0')}</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/85 py-[5px] pl-1.5 pr-2.5 text-xs font-extrabold leading-none text-[#1F2A1A]"><CamOrange className="h-4 w-4" />{t.volume}</span>
                    </div>
                    <div className="px-display text-[34px] leading-[.95] tracking-[-.01em] sm:text-[clamp(40px,4.4vw,56px)]">TEST<br />{t.testNumber}</div>
                    {p && <span className={`self-start rounded-full bg-white px-[11px] py-[5px] text-xs font-extrabold ${p.done ? 'text-[#2E7D3A]' : 'text-[#B45309]'}`}>{p.done ? '✓ ' : ''}{p.text}</span>}
                    {!t.hasAudio && <span className="self-start rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-extrabold uppercase">No audio</span>}
                    <PxImg src="headphones.svg" className="pointer-events-none absolute -right-3.5 top-[24%] w-16 rotate-[14deg] opacity-[.28] sm:w-24" />
                    <div className="relative mt-auto flex flex-col gap-3">
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-extrabold sm:text-xs">
                        <span className="whitespace-nowrap rounded-full px-2.5 py-1" style={{ background: st.chip }}>
                          <span className="sm:hidden">★ {plays.toLocaleString('en-US')}</span>
                          <span className="hidden sm:inline">★ {plays.toLocaleString('en-US')} lượt nghe</span>
                        </span>
                        <span className="whitespace-nowrap rounded-full px-2.5 py-1" style={{ background: st.chip }}>✓ 80%</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => go({ name: 'camtest', testId: t.testId, mode: 'practice' })} className="flex min-h-10 flex-[1_1_90px] items-center justify-center whitespace-nowrap rounded-full bg-white px-2 text-sm font-extrabold leading-none text-[#1F2A1A] transition-colors hover:bg-[#FDF5E0]">Luyện tập</button>
                        <button type="button" onClick={() => go({ name: 'camtest', testId: t.testId, mode: 'real_test' })} className="flex min-h-10 flex-[1_1_90px] items-center justify-center whitespace-nowrap rounded-full bg-[#1F2A1A] px-2 text-sm font-extrabold leading-none text-white transition-colors hover:bg-[#2F3A7A]">Thi thật ▶</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section id="library-archives" className="flex scroll-mt-24 flex-col gap-5 rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(22px,3.4vw,36px)] shadow-[0_10px_0_#1F2A1A]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="px-display m-0 text-[clamp(24px,3vw,34px)] leading-[1.1]">LIBRARY ARCHIVES</h2>
            <label className="flex min-h-[50px] w-full items-center gap-2.5 rounded-2xl border-[3px] border-[#1F2A1A] bg-white px-4 sm:w-auto sm:flex-[0_1_340px]">
              <span aria-hidden="true" className="px-display text-base leading-none">⌕</span>
              <input type="text" className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-semibold text-[#1F2A1A] outline-none placeholder:text-[#1F2A1A]/55" placeholder="Tìm bài nghe (VD: Cam 20)..." value={query} onChange={e => set({ query: e.target.value })} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (f.id === 'ipa'
              ? <button key={f.id} type="button" onClick={() => go({ name: 'pron' })} className={filterCls(false)}>{f.name}</button>
              : <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => set({ filter: f.id })} className={filterCls(filter === f.id)}>{f.name}</button>))}
          </div>

          {filter === 'gap' ? (
            <div className="flex flex-col gap-7">
              <div className="rounded-2xl border-[3px] border-[#1F2A1A] bg-white px-5 py-4 text-[14px] font-semibold leading-snug text-[#1F2A3A]">
                <span className="font-extrabold text-[#1F2A1A]">Gap Filling: </span>
                mở part là chỉ còn câu điền từ (form, note, table, flow-chart…), chấm ngay tại chỗ, bấm từng câu để nghe lại đúng đoạn chứa đáp án kèm script.
                <span className="font-extrabold text-[#1F2A1A]"> {LISTENING_INDEX.gap.length} part · {LISTENING_INDEX.gap.reduce((s, g) => s + g.total, 0)} câu.</span>
              </div>
              {gapItems.length === 0 ? (
                <p className="py-10 text-center text-sm font-bold text-[#1F2A1A]/50">Không có part nào khớp tìm kiếm.</p>
              ) : gapSeries.map(series => (
                <div key={series}>
                  <h3 className="px-display mb-3 text-lg uppercase">{series.replace('Cambridge', 'Cambridge IELTS')}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gapItems.filter(g => g.series === series).map(g => {
                      const p = pxProgress(progress[`gap:${g.id}`]);
                      return (
                        <button key={g.id} type="button" onClick={() => go({ name: 'camtest', testId: g.testId, mode: 'practice', part: g.part, focus: 'gap' })} className="group flex flex-col gap-2 rounded-2xl border-[3px] border-[#1F2A1A] bg-white p-4 text-left text-[#1F2A1A] shadow-[0_4px_0_#1F2A1A] transition-transform hover:-translate-y-0.5">
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="px-display text-[11px] uppercase">Test {g.testNumber} · Part {g.part}</span>
                            {p && <span className={`whitespace-nowrap rounded-full border-2 border-[#1F2A1A] px-2 py-0.5 text-[10px] font-extrabold ${p.done ? 'bg-[#BFE0F7]' : 'bg-[#FFE08A]'}`}>{p.done ? '✓ ' : ''}{p.text}</span>}
                          </div>
                          <span className="line-clamp-2 text-[15px] font-extrabold leading-snug">{g.title}</span>
                          <GapTags groups={g.groups} />
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#2F3A7A]">
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
                <div className="flex flex-col items-center gap-3 rounded-2xl border-[3px] border-dashed border-[#1F2A1A] bg-white px-6 py-10 text-center">
                  <p className="font-extrabold">Không có bài nghe nào khớp “{query || FILTERS.find(f => f.id === filter)?.name}”.</p>
                  <button type="button" onClick={() => set({ query: '', filter: 'all' })} className={filterCls(false)}>Xem tất cả bài nghe</button>
                </div>
              ) : (
                <VolumeList volumes={shown} progress={progress} onOpenLesson={id => go({ name: 'lesson', id })} />
              )}
              {!showAll && !query && filtered.length > 11 && (
                <div className="flex flex-col items-center gap-4 border-t-2 border-dashed border-[#1F2A1A]/25 pt-6">
                  <p className="text-sm font-semibold text-[#1F2A1A]/60">Khám phá thêm các bài nghe khác trong kho lưu trữ...</p>
                  <button type="button" onClick={() => set({ showAll: true })} className="px-display rounded-2xl border-4 border-[#1F2A1A] bg-[#F8BE33] px-8 py-4 text-sm uppercase shadow-[0_5px_0_#1F2A1A] transition-transform hover:-translate-y-0.5">Xem thêm tài liệu Cambridge ↓</button>
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

// Offline stand-in for the site's dashboard?tab=history&skill=listening: progress saved on this device.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[24px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-6 shadow-[0_8px_0_#1F2A1A]" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="px-display m-0 text-xl">LỊCH SỬ LISTENING</h3>
          <button type="button" onClick={onClose} className="px-display grid h-9 w-9 place-items-center rounded-xl border-[3px] border-[#1F2A1A] bg-white">×</button>
        </div>
        {rows.length === 0 ? (
          <p className="text-[14px] font-semibold text-[#1F2A1A]/70">Chưa có bài nào được nộp trên máy này. Làm một đề Full Test hoặc Gap Filling rồi quay lại đây.</p>
        ) : (
          <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {rows.map(r => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border-[3px] border-[#1F2A1A] bg-white px-4 py-2.5">
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-extrabold">{r.label}</span><span className="text-[11px] font-bold uppercase tracking-wider text-[#1F2A1A]/50">{r.kind}</span></span>
                <span className="whitespace-nowrap rounded-full border-2 border-[#1F2A1A] bg-[#BFE0F7] px-2.5 py-0.5 text-[12px] font-extrabold">{r.p.done}/{r.p.total} câu</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[12px] font-semibold text-[#1F2A1A]/55">Tỉ lệ đúng theo dạng câu hỏi cần đáp án chính thức do máy chủ chấm — bản offline chỉ lưu số câu bạn đã làm.</p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#1F2A1A] border-t-transparent" />
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
