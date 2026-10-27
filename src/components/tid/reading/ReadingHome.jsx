// Reading hub (WorkingEnglish skin): Cambridge tests, Essential Words, Workbook and the full library.
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Lock, ChevronDown, Leaf, Goal, CarFront, Drama, HeartPulse, Plane, BriefcaseBusiness, Building2, GraduationCap,
  Lightbulb, BookOpen, Clock, ClipboardCheck, WavesHorizontal, PawPrint, Brain, X,
} from 'lucide-react';
import { PX_ROOT, CamOrange } from './px';
import { SectionHeading, SkillHero } from '../weKit';
import {
  INDEX, INDEX_BY_ID, CATALOG, GAP_BY_ID, READING_QTYPES, normalizeQTypes, readProgress, pxProgress, HIDDEN_CAM_BOOKS, hasContent, readTypeStats,
} from './readingData';

const BOOK_COLORS = ['#F2683A', '#4F46E5', '#1F9D63'];
const PAGE_SIZE = 6;

const topicBg = topic => {
  const a = topic.toLowerCase();
  if (a.includes('history')) return '#DCF0FD';
  if (a.includes('science') || a.includes('natural') || a.includes('biology')) return '#FFF0C2';
  if (a.includes('environment')) return '#D4F5E4';
  if (a.includes('culture') || a.includes('society') || a.includes('art')) return '#F9C9D7';
  if (a.includes('technology') || a.includes('business')) return '#E2DDF7';
  if (a.includes('sport') || a.includes('transport') || a.includes('tourism')) return '#FFD3B0';
  if (a.includes('psychology')) return '#F3D9F0';
  if (a.includes('education') || a.includes('health')) return '#D6F0EC';
  return '#EEF0FF';
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
        <div role="dialog" aria-label="Làm passage này theo cách nào?" className={`absolute right-0 z-30 w-[360px] max-w-full rounded-2xl border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-3 shadow-[0_6px_0_#1E1B4B] ${up ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
          <span aria-hidden="true" className={`absolute right-[24px] h-4 w-4 rotate-45 bg-[#FFF8E7] ${up ? '-bottom-[10px] border-b-4 border-r-4' : '-top-[10px] border-l-4 border-t-4'} border-[#1E1B4B]`} />
          <p className="mb-2.5 px-1 text-xs font-extrabold uppercase tracking-[.06em] text-[#6B6790]">Làm passage này theo cách nào?</p>
          <p className="mb-2.5 truncate px-1 text-sm font-bold">{title}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {options.map(o => (
              <button
                key={o.mode}
                type="button"
                onClick={() => { setOpen(false); onPick(o.mode); }}
                className={`flex min-h-[92px] flex-col justify-center gap-1.5 rounded-xl border-[3px] border-[#1E1B4B] px-3 py-3 text-left shadow-[0_4px_0_#1E1B4B] transition-[transform,background-color] hover:-translate-y-0.5 ${o.dark ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' : 'bg-white text-[#1E1B4B] hover:bg-[#F8BE33]'}`}
              >
                <span className="px-display text-[15px] uppercase leading-none">{o.label}{o.dark ? ' ▶' : ''}</span>
                <span className={`text-xs font-semibold leading-snug ${o.dark ? 'text-white/85' : 'text-[#6B6790]'}`}>{o.hint}</span>
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
      className={`rounded-full border-[3px] border-[#1E1B4B] px-3.5 py-[9px] text-sm font-bold leading-none text-[#1E1B4B] transition-transform ${on ? '-translate-y-0.5 bg-[#F8BE33] shadow-[0_4px_0_#1E1B4B]' : 'bg-white'}`}>
      {label}
    </button>
  );

  const progressChip = p => {
    const x = pxProgress(p);
    return x ? (
      <span className={`whitespace-nowrap rounded-full border-2 border-[#1E1B4B] px-2.5 py-1 text-[11px] font-extrabold ${x.done ? 'bg-[#DCF0FD]' : 'bg-[#FFF0C2]'}`}>{x.done ? '✓ ' : ''}{x.text}</span>
    ) : null;
  };

  const smallBtn = (label, onClick, dark = false, disabled = false) => (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex-1 rounded-xl border-[3px] border-[#1E1B4B] px-4 py-2 text-center text-xs font-extrabold uppercase tracking-wide shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none ${dark ? 'bg-[#4F46E5] text-white' : 'bg-white text-[#1E1B4B] hover:bg-[#F8BE33]'}`}>
      {label}
    </button>
  );

  const offlineChip = (
    <span className="flex items-center gap-1 text-[11px] font-bold text-[#6B6790]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>
  );

  // Unit row inside an accordion (Essential Words / Workbook)
  const unitRow = (id, n, title, sub, actions) => (
    <div key={id} className="flex flex-col gap-3 rounded-2xl border-2 border-[#1E1B4B] bg-white px-4 py-3 shadow-[0_3px_0_#1E1B4B] md:flex-row md:items-center">
      <button type="button" onClick={() => hasContent(id) && onOpenTest({ testId: id, mode: 'practice' })} className="flex min-w-0 flex-1 items-center gap-3.5 text-left text-[#1E1B4B]">
        <span className="px-display grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border-2 border-[#1E1B4B] text-sm leading-none text-white" style={{ background: BOOK_COLORS[(n - 1) % 3] }}>{n}</span>
        <span className="min-w-0"><span className="block truncate text-base font-extrabold">{title}</span>{sub}</span>
      </button>
      <span className="flex shrink-0 items-center gap-2">{actions}</span>
    </div>
  );

  const unitCard = (key, unit, topic, count, Icon, open, toggle, rows) => (
    <div key={key} className="rounded-3xl border-[3px] border-[#1E1B4B] bg-[#FFF8E7] shadow-[0_6px_0_#1E1B4B]">
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left md:p-6">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-[#1E1B4B] ${open ? 'bg-[#F8BE33]' : 'bg-white'}`}><Icon className="h-7 w-7 text-[#1E1B4B]" strokeWidth={2.2} /></span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span className="px-display rounded-md border-2 border-[#1E1B4B] bg-white px-2 py-0.5 text-[11px] leading-none">UNIT {unit}</span>
            <span className="text-xs font-bold text-[#6B6790]">{count} Bài đọc</span>
          </span>
          <span className="block text-lg font-extrabold leading-tight md:text-xl">{topic}</span>
        </span>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}><ChevronDown className="h-5 w-5" /></span>
      </button>
      {open && <div className="flex flex-col gap-2.5 px-5 pb-6 md:px-6">{rows}</div>}
    </div>
  );

  const banner = (emoji, badge, title, desc, tags) => (
    <div className="mb-8 flex flex-col items-center gap-6 rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-[clamp(22px,3.4vw,36px)] shadow-[0_6px_0_#1E1B4B] md:flex-row">
      <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#F8BE33] text-5xl shadow-[0_5px_0_#1E1B4B]">{emoji}</span>
      <div className="text-center md:text-left">
        <span className="mb-3 inline-block -rotate-2 rounded-full border-[3px] border-[#1E1B4B] bg-[#F2683A] px-3.5 py-1 text-xs font-extrabold uppercase tracking-[.08em] text-white">{badge}</span>
        <h2 className="px-display m-0 mb-3 text-[clamp(24px,3vw,34px)] uppercase leading-[1.1]">{title}</h2>
        <p className="mb-5 max-w-2xl text-base font-semibold leading-relaxed text-[#3F3A6B]">{desc}</p>
        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {tags.map(t => <span key={t} className="rounded-full border-2 border-[#1E1B4B] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide">{t}</span>)}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'cambridge', label: `${maxBook} - ${minBook}`, cam: true },
    { id: 'essential', label: 'Essential Words' },
    { id: 'workbook', label: 'Workbook' },
  ];

  return (
    <div className={`${PX_ROOT} we-page`}>
      <SkillHero
        variant="reading"
        onBack={onBack}
        eyebrow="WorkingEnglish · Reading Room"
        title="Đọc"
        accent="Hiểu nhanh, trả lời chắc"
        subtitle="Cambridge đầy đủ, Essential Words và Workbook theo band. Lọc theo dạng câu hỏi như True/False/Not Given, điền từ, matching headings để luyện đúng điểm yếu."
        stats={[
          { value: `${minBook}–${maxBook}`, label: 'Cambridge' },
          { value: camTests.length, label: 'đề đầy đủ' },
          { value: INDEX.filter(r => !r.hidden).length, label: 'bài đọc' },
        ]}
      />

      <main className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-[clamp(20px,4vw,48px)] pb-[120px] pt-10">
        {/* promo: bilingual press */}
        <section className="we-card relative grid overflow-hidden lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col items-start gap-4 p-[clamp(24px,4vw,44px)]">
            <span className="we-chip -rotate-2 !bg-[#3ECF8E] uppercase">Mới · Song ngữ Anh–Việt</span>
            <h2 className="we-display m-0 text-[clamp(34px,4.4vw,56px)] uppercase">Đọc báo<br /><span className="text-[#4F46E5]">song ngữ</span></h2>
            <p className="m-0 max-w-[520px] text-[clamp(15px,1.4vw,17px)] font-semibold leading-[1.65] text-[var(--text-secondary)] [text-wrap:pretty]">Đổi gió sau những bài Cambridge: đọc tin thời sự, khoa học, kinh doanh với bản dịch từng câu, chạm vào từ mới để lưu thẳng vào sổ từ vựng.</p>
            <button type="button" onClick={onOpenPress} className="we-btn we-btn-indigo !px-6 !py-3.5 !text-base">Mở trang báo →</button>
          </div>
          <div aria-hidden="true" className="relative hidden min-h-[260px] place-items-center border-l-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] lg:grid">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 26px, rgba(30,27,75,.12) 26px 28px)' }} />
            {[['-8deg', '#fff', 'EN', 'Global markets rally as…'], ['5deg', '#DCF0FD', 'VI', 'Thị trường toàn cầu khởi sắc…']].map(([rot, bg, tag, line], k) => (
              <div key={tag} className="we-bob absolute w-[62%] rounded-2xl border-[2.5px] border-[#1E1B4B] p-4 shadow-[var(--we-pop)]" style={{ background: bg, rotate: rot, top: k ? '44%' : '14%', left: k ? '30%' : '10%', animationDelay: `${-k * 1.2}s` }}>
                <span className="we-chip !py-0 !text-[10px]">{tag}</span>
                <p className="mt-2 truncate text-sm font-extrabold">{line}</p>
                <span className="mt-2 block h-2 w-full rounded bg-[#1E1B4B]/15" />
                <span className="mt-1.5 block h-2 w-3/4 rounded bg-[#1E1B4B]/15" />
              </div>
            ))}
          </div>
        </section>

        <section id="tests" ref={testsRef} className="flex scroll-mt-24 flex-col gap-[26px]">
          {/* tabs + search + filters */}
          <div className="flex flex-col gap-3.5 rounded-3xl border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-[clamp(14px,2vw,20px)] shadow-[0_6px_0_#1E1B4B]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border-[3px] border-[#1E1B4B] bg-white p-1 sm:flex sm:w-auto sm:flex-none">
                {tabs.map(t => (
                  <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => { setTab(t.id); if (t.id === 'cambridge') setBook(null); }}
                    className={`px-display relative flex min-h-[42px] items-center justify-center gap-1.5 rounded-[11px] px-2 text-center text-[11px] uppercase leading-tight transition-opacity hover:opacity-85 sm:min-h-[38px] sm:gap-2 sm:whitespace-nowrap sm:px-3.5 sm:text-[13px] sm:leading-none ${tab === t.id ? 'bg-[#4F46E5] text-white' : 'bg-transparent text-[#1E1B4B]'}`}>
                    {t.cam && <CamOrange className="text-[9px]" />}
                    <span>{t.label}</span>
                    {t.isNew && <span className="absolute -right-1.5 -top-4 rotate-6 rounded-full border-2 border-[#1E1B4B] bg-[#F2683A] px-[7px] py-px text-[10px] font-extrabold text-white" style={{ fontFamily: 'var(--font-be-vietnam)' }}>NEW</span>}
                  </button>
                ))}
              </div>
              {tab === 'cambridge' && (
                <label className="flex min-h-[52px] flex-[1_1_240px] items-center gap-2.5 rounded-2xl border-[3px] border-[#1E1B4B] bg-white pl-3.5 pr-1.5">
                  <span aria-hidden="true" className="px-display text-base leading-none">⌕</span>
                  <input type="text" placeholder="Tìm bài reading..." value={query} onChange={e => setQuery(e.target.value)}
                    className="w-0 min-w-0 flex-1 border-none bg-transparent py-3 text-base font-semibold text-[#1E1B4B] outline-none placeholder:text-[#1E1B4B]/55" />
                  <button type="button" onClick={() => setSort(s => (s === 'desc' ? 'asc' : 'desc'))} title={`Sắp xếp: ${sort === 'desc' ? 'Mới nhất' : 'Cũ nhất'}`}
                    className="flex min-h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#4F46E5] px-3 text-[13px] leading-none text-white transition-colors hover:bg-[#4338CA]">
                    <b className="px-display text-xs uppercase"><span className="hidden sm:inline">Cam </span>{sort === 'desc' ? `${maxBook} → ${minBook}` : `${minBook} → ${maxBook}`}</b>
                    <span aria-hidden="true">⇅</span>
                  </button>
                </label>
              )}
            </div>
            {tab === 'cambridge' && (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-2xl bg-[#EEF0FF] px-3 py-2.5">
                  <div className="flex min-w-0 flex-[1_1_320px] items-center gap-2.5">
                    <span className="px-display flex-none text-xs leading-none">CAM</span>
                    <div className="px-noscroll flex min-w-0 flex-1 gap-[5px] overflow-x-auto pb-1 pt-0.5">
                      {[null, ...books].map(b => (
                        <button key={b ?? 'all'} type="button" aria-pressed={book === b} onClick={() => setBook(b)}
                          className={`px-display min-h-[38px] min-w-10 flex-[1_0_auto] whitespace-nowrap rounded-[10px] border-2 border-[#1E1B4B] px-2.5 text-center text-xs uppercase leading-none transition-colors hover:bg-[#FFF0C2] ${book === b ? '-translate-y-px bg-[#F8BE33] shadow-[0_3px_0_#1E1B4B]' : 'bg-white'}`}>
                          {b === null ? 'Tất cả' : b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-none">
                    <button type="button" onClick={() => setFilterOpen(o => !o)} aria-expanded={filterOpen} className="min-h-[38px] rounded-full border-2 border-[#1E1B4B] bg-white px-3.5 text-[13px] font-bold leading-none">{filterLabel}</button>
                    <button type="button" onClick={() => setStatsOpen(true)} className="inline-flex min-h-9 items-center text-[13px] font-bold text-[#4F46E5] underline underline-offset-[3px] transition-colors hover:text-[#F2683A]">Tỉ lệ đúng theo dạng của bạn →</button>
                  </div>
                </div>
                {filterOpen && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#6B6790]">Dạng câu hỏi — chọn nhiều dạng cùng lúc</p>
                      {qtypes.length > 1 && (
                        <div className="flex items-center gap-1 rounded-full border-2 border-[#1E1B4B] bg-white p-0.5">
                          {[['any', 'Bất kỳ dạng nào'], ['all', 'Có đủ mọi dạng']].map(([k, l]) => (
                            <button key={k} type="button" onClick={() => setMatchMode(k)} className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition-colors ${matchMode === k ? 'bg-[#4F46E5] text-white' : 'text-[#1E1B4B]/60 hover:text-[#1E1B4B]'}`}>{l}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chip('gap', 'Gap Filling', gapOnly, () => setGapOnly(g => !g), 'Chỉ những passage có câu điền từ — mở bài là chỉ còn câu điền từ, chấm ngay')}
                      {READING_QTYPES.map(t => chip(t, t, qtypes.includes(t), () => setQtypes(q => (q.includes(t) ? q.filter(x => x !== t) : [...q, t]))))}
                    </div>
                    {gapOnly && (
                      <div className="rounded-2xl border-[3px] border-[#1E1B4B] bg-white px-4 py-3 text-[13px] font-semibold leading-snug text-[#3F3A6B]">
                        <span className="font-extrabold text-[#1E1B4B]">Gap Filling: </span>mở bài là chỉ còn câu điền từ (note, table, summary, sentence…), chấm ngay tại chỗ, xem giải thích và vị trí đáp án từng câu.
                      </div>
                    )}
                    {filtering && (
                      <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-[#1E1B4B]/25 pt-3">
                        <p className="text-xs font-bold text-[#6B6790]">
                          <span className="font-extrabold text-[#1F9D63]">{matchedPassages}</span> bài đọc lẻ khớp<span> · </span>trong <span className="font-extrabold text-[#1E1B4B]">{list.length}</span> đề
                        </p>
                        <button type="button" onClick={() => { setQtypes([]); setGapOnly(false); }} className="ml-auto inline-flex min-h-9 items-center text-xs font-extrabold text-[#F2683A] transition-colors hover:text-[#C94E25]">✕ Xóa bộ lọc</button>
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
                        <span className="whitespace-nowrap rounded-full border-[3px] border-[#1E1B4B] bg-white px-3 py-[5px] text-xs font-extrabold uppercase tracking-[.04em]">★ {t.level}</span>
                        <span className="whitespace-nowrap rounded-full border-[3px] border-[#1E1B4B] bg-[#3ECF8E] px-3 py-[5px] text-xs font-extrabold uppercase tracking-[.04em]">3 passage · 40 câu · 60 phút</span>
                      </div>
                      {tp && (
                        <div className="flex flex-wrap gap-2">
                          <span className={`flex-none whitespace-nowrap rounded-full border-[3px] border-[#1E1B4B] px-3 py-[5px] text-xs font-extrabold uppercase ${tp.done ? 'bg-[#DCF0FD]' : 'bg-[#FFF0C2]'}`}>{tp.done ? '✓ ' : ''}{tp.text}</span>
                        </div>
                      )}
                    </>
                  );
                  return (
                    <article key={t.id} className="we-card relative flex flex-col gap-[22px] !rounded-[26px] p-[clamp(20px,3vw,28px)]">
                                            <div className="flex items-center gap-4 sm:gap-5">
                        <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice' })} aria-label={t.title}
                          className="relative flex h-[112px] w-[84px] flex-none flex-col items-center justify-between overflow-hidden rounded-[14px] border-[2.5px] border-[#1E1B4B] bg-[#4F46E5] py-2.5 text-white shadow-[var(--we-pop)] transition-transform hover:-translate-y-1 hover:-rotate-3 sm:h-[140px] sm:w-[104px]">
                          <span className="absolute inset-y-0 left-0 w-3 border-r-[2.5px] border-[#1E1B4B] bg-[#F8BE33]" />
                          <span className="pl-2 text-[10px] font-black tracking-[.2em]">IELTS</span>
                          <span className="we-display pl-2 text-[44px] leading-none sm:text-[54px]">{t.book}</span>
                          <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#1E1B4B]">TEST {t.test}</span>
                        </button>
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                          <h3 className="px-display m-0 flex items-center gap-2.5 text-[clamp(22px,2.4vw,28px)] uppercase leading-[1.2]">
                            <CamOrange className="text-[13px]" />
                            <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'practice' })} className="inline-block py-1.5 text-left uppercase text-[#1E1B4B] hover:text-[#4F46E5]">{t.book} - Test {t.test}</button>
                          </h3>
                          <div className="hidden flex-col gap-2.5 sm:flex">{badges}</div>
                        </div>
                      </div>
                      <div className="-mt-2 flex flex-col gap-2.5 sm:hidden">{badges}</div>
                      <div className="flex flex-col gap-2.5">
                        {filtering && hidden > 0 && <p className="pl-1 text-xs font-bold text-[#6B6790]">Đang ẩn {hidden} bài không khớp bộ lọc</p>}
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
                          const rowCls = open => `grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 border-[#1E1B4B] bg-white px-3.5 py-3.5 text-[#1E1B4B] transition-[transform,box-shadow,opacity] duration-100 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1E1B4B] sm:gap-4 sm:px-[18px] ${open ? '-translate-y-0.5 shadow-[0_5px_0_#1E1B4B]' : 'shadow-[0_3px_0_#1E1B4B]'} ${offline ? '' : 'opacity-70'}`;
                          const body = open => (
                            <>
                              <span aria-label={`Passage ${i + 1}`} className="relative h-10 w-9 flex-none">
                                <span aria-hidden="true" className="absolute left-[5px] top-[5px] h-[34px] w-[30px] rounded-[2px_6px_6px_2px] border-2 border-[#1E1B4B] bg-white shadow-[inset_-3px_0_0_#E6E2F5]" />
                                <span className="px-display absolute left-0 top-0 grid h-[34px] w-[30px] place-items-center rounded-[3px_7px_7px_3px] border-2 border-[#1E1B4B] pl-1 text-base leading-none text-white shadow-[inset_5px_0_0_rgba(0,0,0,.22)]" style={{ background: BOOK_COLORS[i % 3] }}>{i + 1}</span>
                              </span>
                              <span className="flex min-w-0 flex-col gap-[5px]">
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span className="min-w-0 truncate text-[17px] font-extrabold leading-[1.3]">{title}</span>
                                  {p.topic && <span className="hidden flex-none whitespace-nowrap rounded-md px-2 py-[3px] text-[11px] font-bold uppercase tracking-[.04em] sm:inline" style={{ background: topicBg(p.topic) }}>{p.topic}</span>}
                                </span>
                                {prog && <span className={`text-xs font-extrabold sm:hidden ${prog.done ? 'text-[#1F9D63]' : 'text-[#B45309]'}`}>{prog.done ? '✓' : '◔'} {prog.text}</span>}
                                {gap ? <GapGroupTags groups={gap.groups} /> : types.length > 0 && (
                                  <span className="text-[13px] leading-[1.45] text-[#6B6790] [text-wrap:pretty]">
                                    {types.map((ty, k) => <Fragment key={ty}>{k > 0 && '  ·  '}<span className={qtypes.includes(ty) ? 'font-extrabold text-[#1F9D63]' : undefined}>{ty}</span></Fragment>)}
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-2.5 sm:gap-3.5">
                                {prog ? (
                                  <span className="hidden w-24 flex-col items-end gap-[5px] sm:flex">
                                    <span className={`whitespace-nowrap text-xs font-extrabold ${prog.done ? 'text-[#1F9D63]' : 'text-[#B45309]'}`}>{prog.text}</span>
                                    <span className="block h-2 w-full overflow-hidden rounded-full border-[1.5px] border-[#1E1B4B] bg-[#EEF0FF]"><span className="block h-full" style={{ width: `${prog.pct}%`, background: prog.done ? '#3ECF8E' : '#F8BE33' }} /></span>
                                  </span>
                                ) : (
                                  <span className="hidden whitespace-nowrap text-xs font-bold text-[#6B6790] sm:inline">{offline ? 'Chưa làm' : 'Chưa có nội dung'}</span>
                                )}
                                <span aria-hidden="true" className={`grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-[#1E1B4B] text-sm font-extrabold transition-transform ${open ? 'rotate-90 bg-[#F8BE33]' : 'bg-[#FFF8E7]'}`}>→</span>
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
                          className="px-display flex items-center justify-center rounded-2xl border-[3px] border-[#1E1B4B] bg-white px-2.5 py-4 text-[15px] uppercase leading-none text-[#1E1B4B] shadow-[0_5px_0_#1E1B4B] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#F8BE33]">
                          Luyện tập
                        </button>
                        <button type="button" onClick={() => onOpenTest({ testId: t.id, mode: 'exam' })}
                          className="px-display flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1E1B4B] bg-[#4F46E5] px-2.5 py-4 text-[15px] uppercase leading-none text-white shadow-[0_5px_0_#1E1B4B] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#4338CA]">
                          ĐI THI ▶
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {list.length === 0 && <div className="rounded-3xl border-4 border-dashed border-[#1E1B4B] bg-[#FFF8E7] p-8 text-center font-extrabold">Không tìm thấy bài reading nào</div>}
              {pages > 1 && (
                <nav className="mt-10 flex flex-wrap justify-center gap-2">
                  <button type="button" disabled={page === 1} onClick={() => goPage(page - 1)} className="rounded-[14px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] px-3.5 py-2.5 text-sm font-extrabold shadow-[0_4px_0_#1E1B4B] disabled:opacity-50">Trước</button>
                  {Array.from({ length: pages }, (_, k) => k + 1).map(n => (
                    <button key={n} type="button" aria-current={page === n ? 'page' : undefined} onClick={() => goPage(n)} className={`px-display w-[46px] rounded-[14px] border-[3px] border-[#1E1B4B] py-2.5 text-sm shadow-[0_4px_0_#1E1B4B] ${page === n ? 'bg-[#F8BE33]' : 'bg-[#FFF8E7]'}`}>{n}</button>
                  ))}
                  <button type="button" disabled={page === pages} onClick={() => goPage(page + 1)} className="rounded-[14px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] px-3.5 py-2.5 text-sm font-extrabold shadow-[0_4px_0_#1E1B4B] disabled:opacity-50">Sau</button>
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
                      ? <span className="flex items-center gap-2 text-[11px] font-bold text-[#6B6790]"><Clock className="h-3 w-3" /> 20 mins · Trang {p.page ?? ''}</span>
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
              {banner('📖', 'Luyện theo band', 'IELTS Reading Workbook',
                `6 Units với ${wbPassages} bài đọc ngắn — phù hợp để luyện kỹ năng điền từ, True/False và đọc hiểu nhanh ở band 2.5 - 3.5.`,
                ['6 Units', `${wbPassages} Passages`, 'Band 2.5 - 3.5', 'Gap Filling'])}
              {CATALOG.workbookTests.map(w => {
                const ready = w.parts.every(p => hasContent(p.id));
                return (
                  <div key={w.id} className="mb-6 rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-6 shadow-[0_6px_0_#1E1B4B] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 rotate-6 place-items-center rounded-2xl border-[3px] border-[#1E1B4B] bg-[#3ECF8E]"><ClipboardCheck className="h-7 w-7 text-[#1E1B4B]" strokeWidth={2.2} /></span>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border-2 border-[#1E1B4B] bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase">Bài kiểm tra</span>
                            <span className="text-xs font-bold text-[#6B6790]">{w.questionCount} câu · {w.parts.length} phần · 60 phút</span>
                            {ready && progressChip(progress[w.id])}
                          </div>
                          <h3 className="text-xl font-extrabold leading-tight">{w.title}</h3>
                          {!ready && <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#6B6790]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>}
                        </div>
                      </div>
                      {ready && (
                        <div className="flex shrink-0 gap-3 md:w-80">
                          {smallBtn('Luyện tập', () => onOpenTest({ testId: w.id, mode: 'practice' }))}
                          {smallBtn('ĐI THI', () => onOpenTest({ testId: w.id, mode: 'exam' }), true)}
                        </div>
                      )}
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-2.5 border-t-2 border-dashed border-[#1E1B4B]/25 pt-5 md:grid-cols-2">
                      {w.parts.map((p, k) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-2xl border-2 border-[#1E1B4B] bg-white px-4 py-3">
                          <span className="px-display grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#1E1B4B] text-xs leading-none text-white" style={{ background: BOOK_COLORS[k % 3] }}>{k + 1}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold">{p.title}</p>
                            <p className="text-[11px] font-bold uppercase text-[#6B6790]">Part {k + 1} · Q{p.questions}</p>
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

// ---- local "accuracy by question type" ----
function TypeStatsModal({ onClose }) {
  const stats = readTypeStats();
  const rows = READING_QTYPES.map(t => ({ t, ...(stats[t] || { correct: 0, total: 0 }) }));
  const any = rows.some(r => r.total > 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-7 shadow-[0_6px_0_#1E1B4B]" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-[#1E1B4B] bg-white"><X className="h-4 w-4" /></button>
        <h3 className="px-display mb-1 text-xl uppercase">Tỉ lệ đúng theo dạng</h3>
        <p className="mb-5 text-xs font-semibold text-[#6B6790]">Tính từ các bài Reading bạn đã nộp (chỉ bài có đáp án) trên máy này.</p>
        {!any && <p className="rounded-2xl border-[3px] border-dashed border-[#1E1B4B]/40 bg-white p-5 text-center text-sm font-bold text-[#6B6790]">Chưa có dữ liệu — làm và nộp một passage có đáp án để xem thống kê nhé.</p>}
        <div className="flex flex-col gap-2.5">
          {rows.filter(r => r.total > 0).sort((a, b) => a.correct / a.total - b.correct / b.total).map(r => {
            const pct = Math.round((r.correct / r.total) * 100);
            return (
              <div key={r.t} className="rounded-2xl border-2 border-[#1E1B4B] bg-white px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-extrabold"><span>{r.t}</span><span className={pct >= 70 ? 'text-[#1F9D63]' : pct >= 50 ? 'text-[#B45309]' : 'text-[#F2683A]'}>{pct}% · {r.correct}/{r.total}</span></div>
                <span className="block h-2.5 overflow-hidden rounded-full border-[1.5px] border-[#1E1B4B] bg-[#EEF0FF]"><span className="block h-full" style={{ width: `${pct}%`, background: pct >= 70 ? '#3ECF8E' : pct >= 50 ? '#F8BE33' : '#F2683A' }} /></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- every reading test in the index, incl. series the hub tabs don't show ----
const SERIES = [
  ['all', 'Tất cả'], ['cam', 'Cambridge'], ['ew', 'Essential Words'], ['wb', 'Workbook'], ['vol', 'Đề Vol'], ['tid', 'Practice Set'],
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
    <section className="rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-[clamp(18px,3vw,28px)] shadow-[0_6px_0_#1E1B4B]">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center gap-4 text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-[#1E1B4B] bg-[#DCF0FD]"><BookOpen className="h-7 w-7" strokeWidth={2.2} /></span>
        <span className="min-w-0 flex-1">
          <span className="px-display block text-[clamp(18px,2vw,24px)] uppercase leading-tight">Thư viện đầy đủ · {rows.length} bài</span>
          <span className="text-xs font-bold text-[#6B6790]">{ready} bài có nội dung trên máy · {rows.length - ready} bài chưa có nội dung</span>
        </span>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}><ChevronDown className="h-5 w-5" /></span>
      </button>
      {open && (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {SERIES.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSeries(id)} aria-pressed={series === id}
                className={`rounded-full border-2 border-[#1E1B4B] px-3 py-1.5 text-xs font-extrabold ${series === id ? 'bg-[#F8BE33] shadow-[0_3px_0_#1E1B4B]' : 'bg-white'}`}>
                {label} <span className="opacity-60">{id === 'all' ? rows.length : rows.filter(r => r.series === id).length}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên bài..." className="min-h-11 flex-[1_1_240px] rounded-2xl border-[3px] border-[#1E1B4B] bg-white px-4 text-sm font-semibold outline-none" />
            <label className="flex cursor-pointer items-center gap-2 text-xs font-extrabold"><input type="checkbox" checked={onlyReady} onChange={e => setOnlyReady(e.target.checked)} className="h-4 w-4 accent-[#4F46E5]" /> Chỉ bài có nội dung</label>
          </div>
          <div className="flex flex-col gap-2">
            {shown.map(r => {
              const p = pxProgress(progress[r.id]);
              return (
                <div key={r.id} className={`flex flex-col gap-2 rounded-2xl border-2 border-[#1E1B4B] bg-white px-4 py-3 md:flex-row md:items-center ${r.content ? '' : 'opacity-75'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold">{r.title || r.id}</p>
                    <p className="truncate text-[11px] font-bold text-[#6B6790]">{r.id}{r.band ? ` · ${r.band}` : ''}{r.types?.length ? ` · ${normalizeQTypes(r.types).join(' · ')}` : ''}{r.q ? ` · ${r.q} câu` : ''}{r.content && !r.key ? ' · chưa có đáp án' : ''}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p && <span className={`whitespace-nowrap rounded-full border-2 border-[#1E1B4B] px-2.5 py-1 text-[11px] font-extrabold ${p.done ? 'bg-[#DCF0FD]' : 'bg-[#FFF0C2]'}`}>{p.text}</span>}
                    {r.content ? (
                      <>
                        <button type="button" onClick={() => onOpenTest({ testId: r.id, mode: 'practice' })} className="rounded-xl border-[3px] border-[#1E1B4B] bg-white px-3 py-1.5 text-xs font-extrabold uppercase shadow-[0_3px_0_#1E1B4B] hover:bg-[#F8BE33]">Luyện tập</button>
                        <button type="button" onClick={() => onOpenTest({ testId: r.id, mode: 'exam' })} className="rounded-xl border-[3px] border-[#1E1B4B] bg-[#4F46E5] px-3 py-1.5 text-xs font-extrabold uppercase text-white shadow-[0_3px_0_#1E1B4B]">Đi thi</button>
                      </>
                    ) : <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-[#6B6790]"><Lock className="h-3 w-3" /> Chưa có nội dung</span>}
                  </div>
                </div>
              );
            })}
            {!shown.length && <p className="p-6 text-center text-sm font-bold text-[#6B6790]">Không có bài nào khớp.</p>}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm font-extrabold">
              <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-[12px] border-[3px] border-[#1E1B4B] bg-white px-3 py-1.5 disabled:opacity-40">Trước</button>
              <span>{page} / {pages}</span>
              <button type="button" disabled={page === pages} onClick={() => setPage(p => p + 1)} className="rounded-[12px] border-[3px] border-[#1E1B4B] bg-white px-3 py-1.5 disabled:opacity-40">Sau</button>
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
      <div className="relative w-full max-w-md rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-7 text-center shadow-[0_6px_0_#1E1B4B]" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-[#1E1B4B] bg-white"><X className="h-4 w-4" /></button>
        <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border-[3px] border-[#1E1B4B] bg-[#F8BE33]"><Lock className="h-7 w-7" /></span>
        <h3 className="px-display mb-2 text-xl uppercase">Chưa có nội dung</h3>
        <p className="text-sm font-semibold text-[#6B6790]">Passage này chưa được tải về máy. Hãy thử các passage khác hoặc đọc báo song ngữ nhé!</p>
      </div>
    </div>
  );
}
