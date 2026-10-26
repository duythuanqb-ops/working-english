// /practice/reading — the Reading hub (pixel theme), ported from theieltsdictionary.com.
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Lock, ChevronDown, Leaf, Goal, CarFront, Drama, HeartPulse, Plane, BriefcaseBusiness, Building2, GraduationCap,
  Lightbulb, BookOpen, Clock, ClipboardCheck, WavesHorizontal, PawPrint, Brain, X,
} from 'lucide-react';
import { HERO_ART, PROMO_ART } from './art';
import { PX_ROOT, PX_HERO_ART, PxImg, CamOrange, withCamOrange, PixelArt, PxBackLink, PX } from './px';
import {
  INDEX, INDEX_BY_ID, CATALOG, GAP_BY_ID, READING_QTYPES, normalizeQTypes, readProgress, pxProgress, HIDDEN_CAM_BOOKS, hasContent, readTypeStats,
} from './readingData';

const BOOK_COLORS = ['#D6363F', '#2F3A7A', '#2B7D45'];
const PAGE_SIZE = 6;

const topicBg = topic => {
  const a = topic.toLowerCase();
  if (a.includes('history')) return '#BFE0F7';
  if (a.includes('science') || a.includes('natural') || a.includes('biology')) return '#FFE08A';
  if (a.includes('environment')) return '#CDEBA8';
  if (a.includes('culture') || a.includes('society') || a.includes('art')) return '#F9C9D7';
  if (a.includes('technology') || a.includes('business')) return '#E2DDF7';
  if (a.includes('sport') || a.includes('transport') || a.includes('tourism')) return '#FFD3B0';
  if (a.includes('psychology')) return '#F3D9F0';
  if (a.includes('education') || a.includes('health')) return '#D6F0EC';
  return '#F3E8CC';
};

const gapKindLabel = k => ({ note: 'Note', summary: 'Summary', sentence: 'Sentence', table: 'Table', flow: 'Flow chart', short: 'Short answer', diagram: 'Diagram' }[k] || k);

function GapGroupTags({ groups }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {groups.map((g, i) => (
        <span key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800">
          {gapKindLabel(g.kind)} · Q{g.nums[0]}{g.nums.length > 1 ? `–${g.nums[g.nums.length - 1]}` : ''}{g.withOptions ? ' · chọn từ danh sách' : ''}
        </span>
      ))}
    </span>
  );
}

// Passage row → small "Làm passage này theo cách nào?" popover (practice / exam).
function PickMode({ title, onPick, className, children }) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const options = [
    { mode: 'practice', label: 'Luyện tập', hint: 'Không giới hạn giờ · xem giải ngay' },
    { mode: 'exam', label: 'Thi thật', hint: 'Giao diện phòng thi · tính giờ', dark: true },
  ];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open && ref.current) {
            const r = ref.current.getBoundingClientRect();
            const below = window.innerHeight - r.bottom;
            setUp(below < 200 && r.top > below);
          }
          setOpen(o => !o);
        }}
        className={`w-full text-left ${className(open)}`}
      >
        {children(open)}
      </button>
      {open && (
        <div role="dialog" aria-label="Làm passage này theo cách nào?" className={`absolute right-0 z-30 w-[360px] max-w-full rounded-2xl border-4 border-[#1F2A1A] bg-[#FDF5E0] p-3 shadow-[0_8px_0_#1F2A1A] ${up ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
          <span aria-hidden="true" className={`absolute right-[24px] h-4 w-4 rotate-45 bg-[#FDF5E0] ${up ? '-bottom-[10px] border-b-4 border-r-4' : '-top-[10px] border-l-4 border-t-4'} border-[#1F2A1A]`} />
          <p className="mb-2.5 px-1 text-xs font-extrabold uppercase tracking-[.06em] text-[#5A6450]">Làm passage này theo cách nào?</p>
          <p className="mb-2.5 truncate px-1 text-sm font-bold">{title}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {options.map(o => (
              <button
                key={o.mode}
                type="button"
                onClick={() => { setOpen(false); onPick(o.mode); }}
                className={`flex min-h-[92px] flex-col justify-center gap-1.5 rounded-xl border-[3px] border-[#1F2A1A] px-3 py-3 text-left shadow-[0_4px_0_#1F2A1A] transition-[transform,background-color] hover:-translate-y-0.5 ${o.dark ? 'bg-[#2F3A7A] text-white hover:bg-[#3B48A0]' : 'bg-white text-[#1F2A1A] hover:bg-[#F8BE33]'}`}
              >
                <span className="px-display text-[15px] uppercase leading-none">{o.label}{o.dark ? ' ▶' : ''}</span>
                <span className={`text-xs font-semibold leading-snug ${o.dark ? 'text-white/85' : 'text-[#5A6450]'}`}>{o.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const EW_ICONS = {
  1: { icon: Leaf }, 2: { icon: Goal }, 3: { icon: CarFront }, 4: { icon: Drama }, 5: { icon: HeartPulse }, 6: { icon: Plane },
  7: { icon: BriefcaseBusiness }, 8: { icon: Building2 }, 9: { icon: GraduationCap }, 10: { icon: Lightbulb },
};
const WB_ICONS = { 1: { icon: Building2 }, 2: { icon: WavesHorizontal }, 3: { icon: CarFront }, 4: { icon: Lightbulb }, 5: { icon: PawPrint }, 6: { icon: Brain } };

const searchNorm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/([a-z])(\d)/g, '$1 $2')
  .replace(/(\d)([a-z])/g, '$1 $2').replace(/[^a-z0-9]+/g, ' ').trim();

export default function ReadingHome({ onBack, onOpenTest, onOpenPress, initialGap = false }) {
  const [tab, setTab] = useState('cambridge');
  const [book, setBook] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('desc');
  const [qtypes, setQtypes] = useState([]);
  const [matchMode, setMatchMode] = useState('any');
  const [gapOnly, setGapOnly] = useState(initialGap);
  const [filterOpen, setFilterOpen] = useState(initialGap);
  const [page, setPage] = useState(1);
  const [openUnit, setOpenUnit] = useState(1);
  const [progress, setProgress] = useState(readProgress);
  const [statsOpen, setStatsOpen] = useState(false);
  const testsRef = useRef(null);

  useEffect(() => {
    const f = () => setProgress(readProgress());
    window.addEventListener('tid-reading-progress', f);
    return () => window.removeEventListener('tid-reading-progress', f);
  }, []);
  useEffect(() => { setPage(1); }, [query, book, qtypes, matchMode, sort, gapOnly]);

  const meta = useMemo(() => new Map(INDEX.map(r => [r.id, { title: r.title, types: normalizeQTypes(r.types) }])), []);
  const passagesOf = id => [1, 2, 3].map(n => `${id}-${n}`).filter(p => INDEX_BY_ID.has(p));
  const camTests = useMemo(
    () => CATALOG.cambridgeTests.filter(t => !HIDDEN_CAM_BOOKS.has(t.book) && passagesOf(t.id).length > 0),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const books = useMemo(() => [...new Set(camTests.map(t => t.book))].sort((a, b) => b - a), [camTests]);
  const minBook = Math.min(...books), maxBook = Math.max(...books);

  const typeFiltering = qtypes.length > 0;
  const filtering = typeFiltering || gapOnly;
  const passageMatches = pid => {
    if (gapOnly && !GAP_BY_ID.has(pid)) return false;
    if (!typeFiltering) return true;
    const t = meta.get(pid)?.types ?? [];
    return matchMode === 'all' ? qtypes.every(q => t.includes(q)) : qtypes.some(q => t.includes(q));
  };
  const visiblePassages = id => passagesOf(id).filter(passageMatches);

  const qWords = searchNorm(query).split(' ').filter(Boolean);
  const list = (book ? camTests.filter(t => t.book === book) : camTests)
    .slice()
    .sort((a, b) => (sort === 'desc' ? b.book - a.book || a.test - b.test : a.book - b.book || a.test - b.test))
    .filter(t => {
      if (qWords.length) {
        const hay = searchNorm([t.title, `cam ${t.book} test ${t.test}`, t.id, ...t.passages.flatMap((p, i) => [p.title, meta.get(`${t.id}-${i + 1}`)?.title ?? ''])].join(' '));
        const words = hay.split(' ');
        if (!qWords.every(w => (/^\d+$/.test(w) ? words.includes(w) : hay.includes(w)))) return false;
      }
      return visiblePassages(t.id).length > 0;
    });
  const pages = Math.ceil(list.length / PAGE_SIZE);
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const matchedPassages = list.reduce((n, t) => n + visiblePassages(t.id).length, 0);
  const goPage = p => {
    setPage(Math.min(Math.max(1, p), Math.max(1, pages)));
    testsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const testProgress = id => {
    const ps = passagesOf(id).map(p => progress[p]).filter(Boolean);
    if (!ps.length) return progress[id];
    const done = ps.reduce((n, p) => n + (p.done || 0), 0), total = ps.reduce((n, p) => n + (p.total || 0), 0);
    const completed = ps.length === passagesOf(id).length && ps.every(p => p.completed);
    return { done, total, completed, score: completed ? ps.reduce((n, p) => n + (p.score || 0), 0) : undefined };
  };

  const filterLabel = filterOpen ? 'Thu gọn ▲' : (qtypes.length + (gapOnly ? 1 : 0)) > 0 ? `Đang lọc · ${qtypes.length + (gapOnly ? 1 : 0)} dạng ▼` : 'Dạng bài ▼';
  const ewPassages = CATALOG.essentialWordsUnits.reduce((n, u) => n + u.passages.length, 0);
  const wbPassages = CATALOG.workbookUnits.reduce((n, u) => n + u.passages.length, 0);

  const chip = (key, label, on, onClick, title) => (
    <button key={key} type="button" onClick={onClick} aria-pressed={on} title={title}
      className={`rounded-full border-[3px] border-[#1F2A1A] px-3.5 py-[9px] text-sm font-bold leading-none text-[#1F2A1A] transition-transform ${on ? '-translate-y-0.5 bg-[#F8BE33] shadow-[0_4px_0_#1F2A1A]' : 'bg-white'}`}>
      {label}
    </button>
  );

  const progressChip = p => {
    const x = pxProgress(p);
    return x ? (
      <span className={`whitespace-nowrap rounded-full border-2 border-[#1F2A1A] px-2.5 py-1 text-[11px] font-extrabold ${x.done ? 'bg-[#BFE0F7]' : 'bg-[#FFE08A]'}`}>{x.done ? '✓ ' : ''}{x.text}</span>
    ) : null;
  };

  const smallBtn = (label, onClick, dark = false, disabled = false) => (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex-1 rounded-xl border-[3px] border-[#1F2A1A] px-4 py-2 text-center text-xs font-extrabold uppercase tracking-wide shadow-[0_3px_0_#1F2A1A] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none ${dark ? 'bg-[#2F3A7A] text-white' : 'bg-white text-[#1F2A1A] hover:bg-[#F8BE33]'}`}>
      {label}
    </button>
  );

  const offlineChip = (
    <span className="flex items-center gap-1 text-[11px] font-bold text-[#5A6450]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>
  );

  // Unit row inside an accordion (Essential Words / Workbook)
  const unitRow = (id, n, title, sub, actions) => (
    <div key={id} className="flex flex-col gap-3 rounded-2xl border-2 border-[#1F2A1A] bg-white px-4 py-3 shadow-[0_3px_0_#1F2A1A] md:flex-row md:items-center">
      <button type="button" onClick={() => hasContent(id) && onOpenTest({ testId: id, mode: 'practice' })} className="flex min-w-0 flex-1 items-center gap-3.5 text-left text-[#1F2A1A]">
        <span className="px-display grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border-2 border-[#1F2A1A] text-sm leading-none text-white" style={{ background: BOOK_COLORS[(n - 1) % 3] }}>{n}</span>
        <span className="min-w-0"><span className="block truncate text-base font-extrabold">{title}</span>{sub}</span>
      </button>
      <span className="flex shrink-0 items-center gap-2">{actions}</span>
    </div>
  );

  const unitCard = (key, unit, topic, count, Icon, open, toggle, rows) => (
    <div key={key} className="rounded-3xl border-4 border-[#1F2A1A] bg-[#FDF5E0] shadow-[0_6px_0_#1F2A1A]">
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left md:p-6">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-[#1F2A1A] ${open ? 'bg-[#F8BE33]' : 'bg-white'}`}><Icon className="h-7 w-7 text-[#1F2A1A]" strokeWidth={2.2} /></span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span className="px-display rounded-md border-2 border-[#1F2A1A] bg-white px-2 py-0.5 text-[11px] leading-none">UNIT {unit}</span>
            <span className="text-xs font-bold text-[#5A6450]">{count} Bài đọc</span>
          </span>
          <span className="block text-lg font-extrabold leading-tight md:text-xl">{topic}</span>
        </span>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[3px] border-[#1F2A1A] bg-[#F8BE33] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}><ChevronDown className="h-5 w-5" /></span>
      </button>
      {open && <div className="flex flex-col gap-2.5 px-5 pb-6 md:px-6">{rows}</div>}
    </div>
  );

  const banner = (emoji, badge, title, desc, tags) => (
    <div className="mb-8 flex flex-col items-center gap-6 rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(22px,3.4vw,36px)] shadow-[0_10px_0_#1F2A1A] md:flex-row">
      <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[22px] border-4 border-[#1F2A1A] bg-[#F8BE33] text-5xl shadow-[0_5px_0_#1F2A1A]">{emoji}</span>
      <div className="text-center md:text-left">
        <span className="mb-3 inline-block -rotate-2 rounded-full border-[3px] border-[#1F2A1A] bg-[#D6363F] px-3.5 py-1 text-xs font-extrabold uppercase tracking-[.08em] text-white">{badge}</span>
        <h2 className="px-display m-0 mb-3 text-[clamp(24px,3vw,34px)] uppercase leading-[1.1]">{title}</h2>
        <p className="mb-5 max-w-2xl text-base font-semibold leading-relaxed text-[#1F2A3A]">{desc}</p>
        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {tags.map(t => <span key={t} className="rounded-full border-2 border-[#1F2A1A] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide">{t}</span>)}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'cambridge', label: `${maxBook} - ${minBook}`, cam: true },
    { id: 'essential', label: 'Essential Words' },
    { id: 'workbook', label: 'TID Workbook' },
  ];

  return (
    <div className={`${PX_ROOT} relative min-h-full overflow-x-clip bg-[#43A05A] bg-[length:96px_96px]`} style={{ backgroundImage: `url('${PX('grass.svg')}')` }}>
      <header className="relative overflow-hidden bg-[linear-gradient(180deg,#174A3E,#1D5A4C_60%)] pb-[270px] sm:pb-[380px]">
        <PixelArt html={HERO_ART} className={PX_HERO_ART} />
        <div className="relative z-[3] mx-auto flex max-w-[1440px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,40px)] pt-[40px] text-center">
          <PxBackLink onClick={onBack} label="Quay lại chọn kỹ năng" />
          <span className="mt-2.5 inline-flex -rotate-2 items-center rounded-full border-[3px] border-[#1F2A1A] bg-[#D6363F] px-5 py-2 text-[clamp(15px,1.5vw,18px)] font-extrabold tracking-[.08em] text-white shadow-[0_4px_0_#1F2A1A]">IELTS READING PRACTICE</span>
          <h1 className="px-display px-outline m-0 text-[clamp(46px,8.8vw,124px)] uppercase leading-[1.1] [--px-drop:8px] [--px-stroke:clamp(6px,.9vw,10px)]">Luyện Reading</h1>
          <p className="m-0 max-w-[680px] rounded-[14px] border-[3px] border-[#1F2A1A] bg-[rgba(14,40,34,.85)] px-[18px] py-2.5 text-[clamp(16px,1.6vw,20px)] font-bold leading-normal text-[#FDF5E0] [text-wrap:pretty]">
            {withCamOrange(`Cambridge ${maxBook}-${minBook} đầy đủ & Essential Words for the IELTS — True/False/Not Given, điền từ, và nhiều dạng câu hỏi khác.`, 'mr-1 h-[1.15em] w-[1.15em] align-[-0.18em]')}
          </p>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-[clamp(20px,4vw,40px)] pb-[120px] pt-14">
        {/* promo: bilingual press */}
        <section className="relative grid overflow-hidden rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] shadow-[0_10px_0_#1F2A1A] lg:grid-cols-2">
          <div className="flex flex-col gap-[22px] border-b-4 border-[#1F2A1A] bg-[#FFB27A] p-[clamp(26px,4vw,48px)] lg:border-b-0 lg:border-r-4">
            <h2 className="px-display m-0 text-[clamp(38px,5vw,64px)] leading-[1.1]">ĐỌC BÁO<br /><span className="px-outline [--px-drop:0px] [--px-stroke:6px]">SONG NGỮ</span></h2>
            <p className="m-0 max-w-[520px] text-[clamp(16px,1.5vw,18px)] font-semibold leading-[1.65] [text-wrap:pretty]">Bên cạnh việc đọc test cambridge chán ời nà chánnn, các bạn có thể đọc các bài báo siêu thú vị từ các đầu báo xịn xò trong này nha</p>
            <button type="button" onClick={onOpenPress} className="px-display flex max-w-[420px] items-center justify-center gap-3 rounded-2xl border-4 border-[#1F2A1A] bg-[#2F3A7A] px-6 py-[18px] text-lg uppercase leading-none text-white shadow-[0_6px_0_#1F2A1A] transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-[#3B48A0] hover:shadow-[0_8px_0_#1F2A1A]">
              Explore ngay →
            </button>
          </div>
          <PixelArt html={PROMO_ART} className="grid min-h-[280px] sm:min-h-[320px]" />
        </section>

        <section id="tests" ref={testsRef} className="flex scroll-mt-24 flex-col gap-[26px]">
          {/* tabs + search + filters */}
          <div className="flex flex-col gap-3.5 rounded-3xl border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(14px,2vw,20px)] shadow-[0_8px_0_#1F2A1A]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border-[3px] border-[#1F2A1A] bg-white p-1 sm:flex sm:w-auto sm:flex-none">
                {tabs.map(t => (
                  <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => { setTab(t.id); if (t.id === 'cambridge') setBook(null); }}
                    className={`px-display relative flex min-h-[42px] items-center justify-center gap-1.5 rounded-[11px] px-2 text-center text-[11px] uppercase leading-tight transition-opacity hover:opacity-85 sm:min-h-[38px] sm:gap-2 sm:whitespace-nowrap sm:px-3.5 sm:text-[13px] sm:leading-none ${tab === t.id ? 'bg-[#2F3A7A] text-white' : 'bg-transparent text-[#1F2A1A]'}`}>
                    {t.cam && <CamOrange className="h-4 w-4 sm:h-5 sm:w-5" />}
                    <span>{t.label}</span>
                    {t.isNew && <span className="absolute -right-1.5 -top-4 rotate-6 rounded-full border-2 border-[#1F2A1A] bg-[#D6363F] px-[7px] py-px text-[10px] font-extrabold text-white" style={{ fontFamily: 'var(--font-be-vietnam)' }}>NEW</span>}
                  </button>
                ))}
              </div>
              {tab === 'cambridge' && (
                <label className="flex min-h-[52px] flex-[1_1_240px] items-center gap-2.5 rounded-2xl border-[3px] border-[#1F2A1A] bg-white pl-3.5 pr-1.5">
                  <span aria-hidden="true" className="px-display text-base leading-none">⌕</span>
                  <input type="text" placeholder="Tìm bài reading..." value={query} onChange={e => setQuery(e.target.value)}
                    className="w-0 min-w-0 flex-1 border-none bg-transparent py-3 text-base font-semibold text-[#1F2A1A] outline-none placeholder:text-[#1F2A1A]/55" />
                  <button type="button" onClick={() => setSort(s => (s === 'desc' ? 'asc' : 'desc'))} title={`Sắp xếp: ${sort === 'desc' ? 'Mới nhất' : 'Cũ nhất'}`}
                    className="flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#2F3A7A] px-3 text-[13px] leading-none text-white transition-colors hover:bg-[#3B48A0]">
                    <b className="px-display text-xs uppercase"><span className="hidden sm:inline">Cam </span>{sort === 'desc' ? `${maxBook} → ${minBook}` : `${minBook} → ${maxBook}`}</b>
                    <span aria-hidden="true">⇅</span>
                  </button>
                </label>
              )}
            </div>
            {tab === 'cambridge' && (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-2xl bg-[#F3E8CC] px-3 py-2.5">
                  <div className="flex min-w-0 flex-[1_1_320px] items-center gap-2.5">
                    <span className="px-display flex-none text-xs leading-none">CAM</span>
                    <div className="px-noscroll flex min-w-0 flex-1 gap-[5px] overflow-x-auto pb-1 pt-0.5">
                      {[null, ...books].map(b => (
                        <button key={b ?? 'all'} type="button" aria-pressed={book === b} onClick={() => setBook(b)}
                          className={`px-display min-h-[38px] min-w-10 flex-[1_0_auto] whitespace-nowrap rounded-[10px] border-2 border-[#1F2A1A] px-2.5 text-center text-xs uppercase leading-none transition-colors hover:bg-[#FFE08A] ${book === b ? '-translate-y-px bg-[#F8BE33] shadow-[0_3px_0_#1F2A1A]' : 'bg-white'}`}>
                          {b === null ? 'Tất cả' : b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-none">
                    <button type="button" onClick={() => setFilterOpen(o => !o)} aria-expanded={filterOpen} className="min-h-[38px] rounded-full border-2 border-[#1F2A1A] bg-white px-3.5 text-[13px] font-bold leading-none">{filterLabel}</button>
                    <button type="button" onClick={() => setStatsOpen(true)} className="inline-flex min-h-9 items-center text-[13px] font-bold text-[#2F3A7A] underline underline-offset-[3px] transition-colors hover:text-[#D6363F]">Tỉ lệ đúng theo dạng của bạn →</button>
                  </div>
                </div>
                {filterOpen && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#5A6450]">Dạng câu hỏi — chọn nhiều dạng cùng lúc</p>
                      {qtypes.length > 1 && (
                        <div className="flex items-center gap-1 rounded-full border-2 border-[#1F2A1A] bg-white p-0.5">
                          {[['any', 'Bất kỳ dạng nào'], ['all', 'Có đủ mọi dạng']].map(([k, l]) => (
                            <button key={k} type="button" onClick={() => setMatchMode(k)} className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors ${matchMode === k ? 'bg-[#2F3A7A] text-white' : 'text-[#1F2A1A]/60 hover:text-[#1F2A1A]'}`}>{l}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chip('gap', 'Gap Filling', gapOnly, () => setGapOnly(g => !g), 'Chỉ những passage có câu điền từ — mở bài là chỉ còn câu điền từ, chấm ngay')}
                      {READING_QTYPES.map(t => chip(t, t, qtypes.includes(t), () => setQtypes(q => (q.includes(t) ? q.filter(x => x !== t) : [...q, t]))))}
                    </div>
                    {gapOnly && (
                      <div className="rounded-2xl border-[3px] border-[#1F2A1A] bg-white px-4 py-3 text-[13px] font-semibold leading-snug text-[#1F2A3A]">
                        <span className="font-extrabold text-[#1F2A1A]">Gap Filling: </span>mở bài là chỉ còn câu điền từ (note, table, summary, sentence…), chấm ngay tại chỗ, xem giải thích và vị trí đáp án từng câu.
                      </div>
                    )}
                    {filtering && (
                      <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-[#1F2A1A]/25 pt-3">
                        <p className="text-xs font-bold text-[#5A6450]">
                          <span className="font-extrabold text-[#2E7D3A]">{matchedPassages}</span> bài đọc lẻ khớp<span> · </span>trong <span className="font-extrabold text-[#1F2A1A]">{list.length}</span> đề
                        </p>
                        <button type="button" onClick={() => { setQtypes([]); setGapOnly(false); }} className="ml-auto inline-flex min-h-9 items-center text-xs font-extrabold text-[#D6363F] transition-colors hover:text-[#A82A33]">✕ Xóa bộ lọc</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {tab === 'cambridge' && (
            <div>
              <div className="grid gap-[30px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,500px),1fr))]">
                {shown.map(t => {
                  const all = passagesOf(t.id);
                  const hidden = all.length - visiblePassages(t.id).length;
                  const tp = pxProgress(testProgress(t.id));
                  const anyContent = all.some(hasContent);
                  const badges = (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <span className="whitespace-nowrap rounded-full border-[3px] border-[#1F2A1A] bg-white px-3 py-[5px] text-xs font-extrabold uppercase tracking-[.04em]">★ {t.level}</span>
                        <span className="whitespace-nowrap rounded-full border-[3px] border-[#1F2A1A] bg-[#7DC242] px-3 py-[5px] text-xs font-extrabold uppercase tracking-[.04em]">Giao diện chuẩn thi thật 100%</span>
                      </div>
                      {tp && (
                        <div className="flex flex-wrap gap-2">
                          <span className={`flex-none whitespace-nowrap rounded-full border-[3px] border-[#1F2A1A] px-3 py-[5px] text-xs font-extrabold uppercase ${tp.done ? 'bg-[#BFE0F7]' : 'bg-[#FFE08A]'}`}>{tp.done ? '✓ ' : ''}{tp.text}</span>
                        </div>
                      )}
                    </>
                  );
                  return (
                    <article key={t.id} className="relative flex flex-col gap-[22px] rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(20px,3vw,28px)] shadow-[0_10px_0_#1F2A1A]">
                      <span className="px-display absolute -top-[18px] right-6 rotate-3 rounded-full border-[3px] border-[#1F2A1A] bg-[#F8BE33] px-3.5 pb-[5px] pt-1.5 text-[13px] leading-none">CAM {t.book}</span>
                      <div className="flex items-center gap-4 sm:gap-5">
                        <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice' })} aria-label={t.title}
                          className="relative flex h-[112px] w-[84px] flex-none flex-col overflow-hidden rounded-xl border-4 border-[#1F2A1A] bg-[#2F3A7A] p-2 text-left text-[#FDF5E0] shadow-[0_5px_0_#1F2A1A] transition-transform hover:-translate-y-0.5 sm:h-[148px] sm:w-[112px] sm:rounded-[14px] sm:p-2.5">
                          <CamOrange className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
                          <span className="px-display mt-1.5 text-lg leading-none sm:mt-2 sm:text-2xl">IELTS</span>
                          <span className="text-[9px] font-extrabold text-[#F8BE33] sm:text-[11px]">ACADEMIC</span>
                          <PxImg src="bush.svg" className="absolute -bottom-1 -right-1.5 w-12 sm:w-16" />
                          <span className="px-display relative mt-auto text-lg leading-none sm:text-2xl">{t.book}</span>
                        </button>
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                          <h3 className="px-display m-0 flex items-center gap-2.5 text-[clamp(20px,2.2vw,26px)] uppercase leading-[1.2]">
                            <CamOrange className="h-[1.25em] w-[1.25em]" />
                            <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice' })} className="inline-block py-1.5 text-left uppercase text-[#1F2A1A] hover:text-[#2F3A7A]">{t.book} - Test {t.test}</button>
                          </h3>
                          <div className="hidden flex-col gap-2.5 sm:flex">{badges}</div>
                        </div>
                      </div>
                      <div className="-mt-2 flex flex-col gap-2.5 sm:hidden">{badges}</div>
                      <div className="flex flex-col gap-2.5">
                        {filtering && hidden > 0 && <p className="pl-1 text-xs font-bold text-[#5A6450]">Đang ẩn {hidden} bài không khớp bộ lọc</p>}
                        {t.passages.map((p, i) => {
                          const pid = `${t.id}-${i + 1}`;
                          if (!all.includes(pid) || (filtering && !passageMatches(pid))) return null;
                          const types = meta.get(pid)?.types ?? [];
                          const gap = gapOnly ? GAP_BY_ID.get(pid) : null;
                          const rec = progress[gap ? `gap:${pid}` : pid];
                          const prog = rec && (rec.completed || rec.done > 0)
                            ? (() => {
                              const v = rec.completed ? rec.score : rec.done;
                              return typeof v === 'number' && rec.total
                                ? { done: rec.completed, text: `${v}/${rec.total} câu`, pct: Math.min(100, Math.round((v / rec.total) * 100)) }
                                : { done: rec.completed, text: rec.completed ? 'Đã xong' : 'Đang làm', pct: rec.completed ? 100 : 0 };
                            })()
                            : null;
                          const title = meta.get(pid)?.title || p.title;
                          const offline = hasContent(pid);
                          const rowCls = open => `grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 border-[#1F2A1A] bg-white px-3.5 py-3.5 text-[#1F2A1A] transition-[transform,box-shadow,opacity] duration-100 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1F2A1A] sm:gap-4 sm:px-[18px] ${open ? '-translate-y-0.5 shadow-[0_5px_0_#1F2A1A]' : 'shadow-[0_3px_0_#1F2A1A]'} ${offline ? '' : 'opacity-70'}`;
                          const body = open => (
                            <>
                              <span aria-label={`Passage ${i + 1}`} className="relative h-10 w-9 flex-none">
                                <span aria-hidden="true" className="absolute left-[5px] top-[5px] h-[34px] w-[30px] rounded-[2px_6px_6px_2px] border-2 border-[#1F2A1A] bg-white shadow-[inset_-3px_0_0_#E7DCC0]" />
                                <span className="px-display absolute left-0 top-0 grid h-[34px] w-[30px] place-items-center rounded-[3px_7px_7px_3px] border-2 border-[#1F2A1A] pl-1 text-base leading-none text-white shadow-[inset_5px_0_0_rgba(0,0,0,.22)]" style={{ background: BOOK_COLORS[i % 3] }}>{i + 1}</span>
                              </span>
                              <span className="flex min-w-0 flex-col gap-[5px]">
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span className="min-w-0 truncate text-[17px] font-extrabold leading-[1.3]">{title}</span>
                                  {p.topic && <span className="hidden flex-none whitespace-nowrap rounded-md px-2 py-[3px] text-[11px] font-bold uppercase tracking-[.04em] sm:inline" style={{ background: topicBg(p.topic) }}>{p.topic}</span>}
                                </span>
                                {prog && <span className={`text-xs font-extrabold sm:hidden ${prog.done ? 'text-[#2E7D3A]' : 'text-[#B45309]'}`}>{prog.done ? '✓' : '◔'} {prog.text}</span>}
                                {gap ? <GapGroupTags groups={gap.groups} /> : types.length > 0 && (
                                  <span className="text-[13px] leading-[1.45] text-[#5A6450] [text-wrap:pretty]">
                                    {types.map((ty, k) => <Fragment key={ty}>{k > 0 && '  ·  '}<span className={qtypes.includes(ty) ? 'font-extrabold text-[#2E7D3A]' : undefined}>{ty}</span></Fragment>)}
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-2.5 sm:gap-3.5">
                                {prog ? (
                                  <span className="hidden w-24 flex-col items-end gap-[5px] sm:flex">
                                    <span className={`whitespace-nowrap text-xs font-extrabold ${prog.done ? 'text-[#2E7D3A]' : 'text-[#B45309]'}`}>{prog.text}</span>
                                    <span className="block h-2 w-full overflow-hidden rounded-full border-[1.5px] border-[#1F2A1A] bg-[#E8EDE0]"><span className="block h-full" style={{ width: `${prog.pct}%`, background: prog.done ? '#4CAF5A' : '#F8BE33' }} /></span>
                                  </span>
                                ) : (
                                  <span className="hidden whitespace-nowrap text-xs font-bold text-[#66705C] sm:inline">{offline ? 'Chưa làm' : 'Chưa có nội dung'}</span>
                                )}
                                <span aria-hidden="true" className={`grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-[#1F2A1A] text-sm font-extrabold transition-transform ${open ? 'rotate-90 bg-[#F8BE33]' : 'bg-[#FDF5E0]'}`}>→</span>
                              </span>
                            </>
                          );
                          if (gap) {
                            return <button key={pid} type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice', passage: i + 1, gap: true })} className={`text-left ${rowCls(false)}`}>{body(false)}</button>;
                          }
                          return (
                            <PickMode key={pid} title={`Passage ${i + 1} · ${title}`} className={rowCls} onPick={mode => onOpenTest({ testId: t.id, mode, passage: i + 1 })}>
                              {body}
                            </PickMode>
                          );
                        })}
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-3.5">
                        <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice' })} title={anyContent ? undefined : 'Chưa có nội dung'}
                          className="px-display flex items-center justify-center rounded-2xl border-4 border-[#1F2A1A] bg-white px-2.5 py-4 text-[15px] uppercase leading-none text-[#1F2A1A] shadow-[0_5px_0_#1F2A1A] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#F8BE33]">
                          Luyện tập
                        </button>
                        <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'exam' })}
                          className="px-display flex items-center justify-center gap-2 rounded-2xl border-4 border-[#1F2A1A] bg-[#2F3A7A] px-2.5 py-4 text-[15px] uppercase leading-none text-white shadow-[0_5px_0_#1F2A1A] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#3B48A0]">
                          ĐI THI ▶
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {list.length === 0 && <div className="rounded-3xl border-4 border-dashed border-[#1F2A1A] bg-[#FDF5E0] p-8 text-center font-extrabold">Không tìm thấy bài reading nào</div>}
              {pages > 1 && (
                <nav className="mt-10 flex flex-wrap justify-center gap-2">
                  <button type="button" disabled={page === 1} onClick={() => goPage(page - 1)} className="rounded-[14px] border-[3px] border-[#1F2A1A] bg-[#FDF5E0] px-3.5 py-2.5 text-sm font-extrabold shadow-[0_4px_0_#1F2A1A] disabled:opacity-50">Trước</button>
                  {Array.from({ length: pages }, (_, k) => k + 1).map(n => (
                    <button key={n} type="button" aria-current={page === n ? 'page' : undefined} onClick={() => goPage(n)} className={`px-display w-[46px] rounded-[14px] border-[3px] border-[#1F2A1A] py-2.5 text-sm shadow-[0_4px_0_#1F2A1A] ${page === n ? 'bg-[#F8BE33]' : 'bg-[#FDF5E0]'}`}>{n}</button>
                  ))}
                  <button type="button" disabled={page === pages} onClick={() => goPage(page + 1)} className="rounded-[14px] border-[3px] border-[#1F2A1A] bg-[#FDF5E0] px-3.5 py-2.5 text-sm font-extrabold shadow-[0_4px_0_#1F2A1A] disabled:opacity-50">Sau</button>
                </nav>
              )}
            </div>
          )}

          {tab === 'essential' && (
            <div>
              {banner('📚', 'Tài liệu độc quyền', 'Essential Words for the IELTS',
                `Trọn bộ ${CATALOG.essentialWordsUnits.length} Units với ${ewPassages} bài đọc chuyên sâu, tập trung vào việc mở rộng vốn từ vựng học thuật theo các chủ đề phổ biến nhất trong kỳ thi IELTS.`,
                [`${CATALOG.essentialWordsUnits.length} Units`, `${ewPassages} Passages`, 'Academic Vocab', 'Standard Format'])}
              <div className="flex flex-col gap-4">
                {CATALOG.essentialWordsUnits.map(u => unitCard(`${u.unit}-${u.topic}`, u.unit, u.topic, 3, (EW_ICONS[u.unit] || { icon: BookOpen }).icon, openUnit === u.unit,
                  () => setOpenUnit(o => (o === u.unit ? null : u.unit)),
                  u.passages.map((p, k) => unitRow(p.id, k + 1, p.title,
                    hasContent(p.id)
                      ? <span className="flex items-center gap-2 text-[11px] font-bold text-[#5A6450]"><Clock className="h-3 w-3" /> 20 mins · Trang {p.page ?? ''}</span>
                      : offlineChip,
                    <>
                      {progressChip(progress[p.id])}
                      {smallBtn('Luyện tập', () => onOpenTest({ testId: p.id, mode: 'practice' }), false, !hasContent(p.id))}
                      {smallBtn('Vào thi', () => onOpenTest({ testId: p.id, mode: 'exam' }), true, !hasContent(p.id))}
                    </>))))}
              </div>
            </div>
          )}

          {tab === 'workbook' && (
            <div>
              {banner('📖', 'TID Reading Workbook', 'IELTS Reading Workbook',
                `6 Units với ${wbPassages} bài đọc ngắn — phù hợp để luyện kỹ năng điền từ, True/False và đọc hiểu nhanh ở band 2.5 - 3.5.`,
                ['6 Units', `${wbPassages} Passages`, 'Band 2.5 - 3.5', 'Gap Filling'])}
              {CATALOG.workbookTests.map(w => {
                const ready = w.parts.every(p => hasContent(p.id));
                return (
                  <div key={w.id} className="mb-6 rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-6 shadow-[0_8px_0_#1F2A1A] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 rotate-6 place-items-center rounded-2xl border-[3px] border-[#1F2A1A] bg-[#7DC242]"><ClipboardCheck className="h-7 w-7 text-[#1F2A1A]" strokeWidth={2.2} /></span>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border-2 border-[#1F2A1A] bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase">Bài kiểm tra</span>
                            <span className="text-xs font-bold text-[#5A6450]">{w.questionCount} câu · {w.parts.length} phần · 60 phút</span>
                            {ready && progressChip(progress[w.id])}
                          </div>
                          <h3 className="text-xl font-extrabold leading-tight">{w.title}</h3>
                          {!ready && <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#5A6450]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>}
                        </div>
                      </div>
                      {ready && (
                        <div className="flex shrink-0 gap-3 md:w-80">
                          {smallBtn('Luyện tập', () => onOpenTest({ testId: w.id, mode: 'practice' }))}
                          {smallBtn('ĐI THI', () => onOpenTest({ testId: w.id, mode: 'exam' }), true)}
                        </div>
                      )}
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-2.5 border-t-2 border-dashed border-[#1F2A1A]/25 pt-5 md:grid-cols-2">
                      {w.parts.map((p, k) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-2xl border-2 border-[#1F2A1A] bg-white px-4 py-3">
                          <span className="px-display grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#1F2A1A] text-xs leading-none text-white" style={{ background: BOOK_COLORS[k % 3] }}>{k + 1}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold">{p.title}</p>
                            <p className="text-[11px] font-bold uppercase text-[#5A6450]">Part {k + 1} · Q{p.questions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col gap-4">
                {CATALOG.workbookUnits.map(u => unitCard(u.unit, u.unit, u.topic, u.passages.length, (WB_ICONS[u.unit] || { icon: BookOpen }).icon, openUnit === u.unit + 100,
                  () => setOpenUnit(o => (o === u.unit + 100 ? null : u.unit + 100)),
                  u.passages.map((p, k) => unitRow(p.id, k + 1, p.title,
                    !hasContent(p.id) && offlineChip,
                    hasContent(p.id) && <>{progressChip(progress[p.id])}{smallBtn('Luyện tập', () => onOpenTest({ testId: p.id, mode: 'practice' }))}</>))))}
              </div>
            </div>
          )}
        </section>
        <FullLibrary progress={progress} onOpenTest={onOpenTest} />
      </main>
      {statsOpen && <TypeStatsModal onClose={() => setStatsOpen(false)} />}
    </div>
  );
}

// ---- local "accuracy by question type" (the site links to /history?tab=types) ----
function TypeStatsModal({ onClose }) {
  const stats = readTypeStats();
  const rows = READING_QTYPES.map(t => ({ t, ...(stats[t] || { correct: 0, total: 0 }) }));
  const any = rows.some(r => r.total > 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-7 shadow-[0_10px_0_#1F2A1A]" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-[#1F2A1A] bg-white"><X className="h-4 w-4" /></button>
        <h3 className="px-display mb-1 text-xl uppercase">Tỉ lệ đúng theo dạng</h3>
        <p className="mb-5 text-xs font-semibold text-[#5A6450]">Tính từ các bài Reading bạn đã nộp (chỉ bài có đáp án) trên máy này.</p>
        {!any && <p className="rounded-2xl border-[3px] border-dashed border-[#1F2A1A]/40 bg-white p-5 text-center text-sm font-bold text-[#5A6450]">Chưa có dữ liệu — làm và nộp một passage có đáp án để xem thống kê nhé.</p>}
        <div className="flex flex-col gap-2.5">
          {rows.filter(r => r.total > 0).sort((a, b) => a.correct / a.total - b.correct / b.total).map(r => {
            const pct = Math.round((r.correct / r.total) * 100);
            return (
              <div key={r.t} className="rounded-2xl border-2 border-[#1F2A1A] bg-white px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-extrabold"><span>{r.t}</span><span className={pct >= 70 ? 'text-[#2E7D3A]' : pct >= 50 ? 'text-[#B45309]' : 'text-[#D6363F]'}>{pct}% · {r.correct}/{r.total}</span></div>
                <span className="block h-2.5 overflow-hidden rounded-full border-[1.5px] border-[#1F2A1A] bg-[#E8EDE0]"><span className="block h-full" style={{ width: `${pct}%`, background: pct >= 70 ? '#4CAF5A' : pct >= 50 ? '#F8BE33' : '#D6363F' }} /></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- every test of the site's reading list (567 rows), incl. series the hub tabs don't show ----
const SERIES = [
  ['all', 'Tất cả'], ['cam', 'Cambridge'], ['ew', 'Essential Words'], ['wb', 'TID Workbook'], ['vol', 'Đề Vol'], ['tid', 'TID Practice Set'],
  ['topic', 'Theo chủ đề'], ['passage', 'Passage lẻ'], ['other', 'Khác'],
];
const LIB_PAGE = 30;
function FullLibrary({ progress, onOpenTest }) {
  const [open, setOpen] = useState(false);
  const [series, setSeries] = useState('all');
  const [onlyReady, setOnlyReady] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [series, onlyReady, q]);
  const rows = INDEX.filter(r => !r.hidden);
  const words = searchNorm(q).split(' ').filter(Boolean);
  const list = rows.filter(r => (series === 'all' || r.series === series) && (!onlyReady || r.content)
    && (!words.length || words.every(w => searchNorm(`${r.title} ${r.id}`).includes(w))));
  const ready = rows.filter(r => r.content).length;
  const pages = Math.max(1, Math.ceil(list.length / LIB_PAGE));
  const shown = list.slice((page - 1) * LIB_PAGE, page * LIB_PAGE);
  return (
    <section className="rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-[clamp(18px,3vw,28px)] shadow-[0_10px_0_#1F2A1A]">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center gap-4 text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-[#1F2A1A] bg-[#BFE0F7]"><BookOpen className="h-7 w-7" strokeWidth={2.2} /></span>
        <span className="min-w-0 flex-1">
          <span className="px-display block text-[clamp(18px,2vw,24px)] uppercase leading-tight">Thư viện đầy đủ · {rows.length} bài</span>
          <span className="text-xs font-bold text-[#5A6450]">{ready} bài có nội dung trên máy · {rows.length - ready} bài chưa có nội dung</span>
        </span>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[3px] border-[#1F2A1A] bg-[#F8BE33] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}><ChevronDown className="h-5 w-5" /></span>
      </button>
      {open && (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {SERIES.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSeries(id)} aria-pressed={series === id}
                className={`rounded-full border-2 border-[#1F2A1A] px-3 py-1.5 text-xs font-extrabold ${series === id ? 'bg-[#F8BE33] shadow-[0_3px_0_#1F2A1A]' : 'bg-white'}`}>
                {label} <span className="opacity-60">{id === 'all' ? rows.length : rows.filter(r => r.series === id).length}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên bài..." className="min-h-11 flex-[1_1_240px] rounded-2xl border-[3px] border-[#1F2A1A] bg-white px-4 text-sm font-semibold outline-none" />
            <label className="flex cursor-pointer items-center gap-2 text-xs font-extrabold"><input type="checkbox" checked={onlyReady} onChange={e => setOnlyReady(e.target.checked)} className="h-4 w-4 accent-[#2F3A7A]" /> Chỉ bài có nội dung</label>
          </div>
          <div className="flex flex-col gap-2">
            {shown.map(r => {
              const p = pxProgress(progress[r.id]);
              return (
                <div key={r.id} className={`flex flex-col gap-2 rounded-2xl border-2 border-[#1F2A1A] bg-white px-4 py-3 md:flex-row md:items-center ${r.content ? '' : 'opacity-75'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold">{r.title || r.id}</p>
                    <p className="truncate text-[11px] font-bold text-[#5A6450]">{r.id}{r.band ? ` · ${r.band}` : ''}{r.types?.length ? ` · ${normalizeQTypes(r.types).join(' · ')}` : ''}{r.q ? ` · ${r.q} câu` : ''}{r.content && !r.key ? ' · chưa có đáp án' : ''}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p && <span className={`whitespace-nowrap rounded-full border-2 border-[#1F2A1A] px-2.5 py-1 text-[11px] font-extrabold ${p.done ? 'bg-[#BFE0F7]' : 'bg-[#FFE08A]'}`}>{p.text}</span>}
                    {r.content ? (
                      <>
                        <button type="button" onClick={() => onOpenTest({ testId: r.id, mode: 'practice' })} className="rounded-xl border-[3px] border-[#1F2A1A] bg-white px-3 py-1.5 text-xs font-extrabold uppercase shadow-[0_3px_0_#1F2A1A] hover:bg-[#F8BE33]">Luyện tập</button>
                        <button type="button" onClick={() => onOpenTest({ testId: r.id, mode: 'exam' })} className="rounded-xl border-[3px] border-[#1F2A1A] bg-[#2F3A7A] px-3 py-1.5 text-xs font-extrabold uppercase text-white shadow-[0_3px_0_#1F2A1A]">Đi thi</button>
                      </>
                    ) : <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-[#5A6450]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>}
                  </div>
                </div>
              );
            })}
            {!shown.length && <p className="p-6 text-center text-sm font-bold text-[#5A6450]">Không có bài nào khớp.</p>}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm font-extrabold">
              <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-[12px] border-[3px] border-[#1F2A1A] bg-white px-3 py-1.5 disabled:opacity-40">Trước</button>
              <span>{page} / {pages}</span>
              <button type="button" disabled={page === pages} onClick={() => setPage(p => p + 1)} className="rounded-[12px] border-[3px] border-[#1F2A1A] bg-white px-3 py-1.5 disabled:opacity-40">Sau</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function OfflineNotice({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-7 text-center shadow-[0_10px_0_#1F2A1A]" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-[#1F2A1A] bg-white"><X className="h-4 w-4" /></button>
        <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border-4 border-[#1F2A1A] bg-[#F8BE33]"><Lock className="h-7 w-7" /></span>
        <h3 className="px-display mb-2 text-xl uppercase">Chưa có nội dung</h3>
        <p className="text-sm font-semibold text-[#5A6450]">Passage này chưa được tải về máy. Hãy thử các passage khác hoặc đọc báo song ngữ nhé!</p>
      </div>
    </div>
  );
}
