// Luyện Shadowing catalog (= theieltsdictionary.com/practice/speaking/shadowing[?mode=dictation]).
// Mirrors the site's chunk 1wc3fxml-gjhq.js: sidebar categories/levels/stats, mode tabs, search, upload card, 30/page grid.
import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, History, Headset, Flag, Video, Mic, BookOpen, Music, MessageSquare, BookMarked, Globe, X, Headphones,
  User, CheckCircle, Zap, Menu, Keyboard, ListChecks, Search, Clock, ChevronLeft, ChevronRight, AlertCircle, ArrowRight, Loader2,
} from 'lucide-react';
import { useLocalData, loadShadowing } from './speakingUtils';

const CATS = [
  { id: 'all', name: 'Tất cả bài học', icon: LayoutGrid },
  { id: 'in-progress', name: 'Đang luyện dở', icon: History },
  { id: 'ielts-success', name: 'IELTS Speaking 🔥', icon: Headset },
  { id: 'pref', name: 'PreF listening', icon: Flag },
  { id: 'ted', name: 'TED-Ed', icon: Video },
  { id: 'ted-talk', name: 'TED Talk', icon: Mic },
  { id: 'real-easy', name: 'Real Easy English', icon: BookOpen },
  { id: 'bbc', name: 'BBC Learning English', icon: Music },
  { id: 'nutshell', name: 'Kurzgesagt', icon: MessageSquare },
];
const OWN = [{ id: 'my-videos', name: 'Của tôi', icon: BookMarked }, { id: 'community', name: 'Cộng đồng', icon: Globe }];
const LEVELS = [{ id: 'C1', name: 'Nâng cao', color: 'bg-red-500' }, { id: 'B2', name: 'Trung cấp', color: 'bg-green-500' }, { id: 'A2', name: 'Sơ cấp', color: 'bg-blue-500' }];
const CAT_NAME = { 'ielts-success': 'IELTS Speaking for Success', pref: 'PreF', ted: 'TED-Ed', 'ted-talk': 'TED Talk', 'real-easy': 'Real Easy English', bbc: 'BBC Learning English', nutshell: 'Kurzgesagt – In a Nutshell' };
const HEADINGS = { 'my-videos': 'Thư viện của tôi', community: 'Cộng đồng', 'in-progress': 'Đang luyện dở', 'ielts-success': 'IELTS Speaking 🔥', pref: 'PreF listening 🚩', ted: 'TED-Ed Lessons', 'ted-talk': 'TED Talk 🎤', 'real-easy': 'Real Easy English', bbc: 'BBC Learning English', nutshell: 'Kurzgesagt' };
const PAGE = 30;

// localStorage progress written by ShadowingPlayer (same key scheme as the site)
const KEY_RE = /^shadowing_(results|progress)(?:_v(\d+))?_(.+)$/;
function readProgress() {
  const map = {};
  try {
    for (const k of Object.keys(localStorage)) {
      const m = k.match(KEY_RE);
      if (!m) continue;
      const e = (map[m[3]] ||= { resultsCount: 0, currentIdx: 0, updatedAt: 0, scores: [] });
      const v = JSON.parse(localStorage.getItem(k) || '{}');
      if (m[1] === 'results') {
        e.resultsCount = Object.keys(v).length;
        Object.values(v).forEach(r => { const x = Array.isArray(r) ? r[0] : r; if (typeof x?.score === 'number') e.scores.push(x.score); });
      } else {
        if (typeof v.currentIdx === 'number') e.currentIdx = v.currentIdx;
        if (v.updatedAt) e.updatedAt = v.updatedAt;
      }
    }
  } catch { /* storage blocked */ }
  return map;
}

function Sidebar({ cat, setCat, level, setLevel, stats, open, setOpen, onHome }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-100 bg-white transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [scrollbar-width:none] lg:sticky lg:translate-x-0 [&::-webkit-scrollbar]:hidden ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="relative p-6">
          <button onClick={() => setOpen(false)} className="absolute right-6 top-6 rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"><X size={16} /></button>
          <button onClick={onHome} className="group mb-8 flex w-fit items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-herb-600 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-transform group-hover:scale-105"><Headphones size={20} /></div>
            <div>
              <h1 className="font-black leading-tight text-slate-800 transition-colors group-hover:text-herb-600">Luyện Shadowing</h1>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Chọn chủ đề luyện nói</p>
            </div>
          </button>
          <nav className="mb-8 space-y-1">
            {CATS.map(c => {
              const on = cat === c.id, prog = c.id === 'in-progress';
              const cls = prog
                ? (on ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-600 ring-1 ring-blue-100/50 hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm')
                : (on ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700');
              return (
                <button key={c.id} onClick={() => setCat(c.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${cls}`}>
                  <div className={prog ? (on ? 'text-blue-600' : 'text-blue-500') : ''}><c.icon size={16} /></div>
                  <span className="flex-1 text-left">{c.name}</span>
                  {prog && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                    </span>
                  )}
                </button>
              );
            })}
            <hr className="my-2 border-slate-100" />
            {OWN.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${cat === c.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <c.icon size={16} />{c.name}
              </button>
            ))}
          </nav>
          <div className="mb-8 border-t border-slate-50 pt-8">
            <h3 className="mb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">CẤP ĐỘ</h3>
            <div className="space-y-1">
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(level === l.id ? 'all' : l.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-xs font-bold transition-all ${level === l.id ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  <div className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />{l.id} - {l.name}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-8">
            <h3 className="mb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">TỔNG QUAN</h3>
            <div className="space-y-4 px-4">
              {[
                [Headphones, 'text-slate-400', <span className="text-slate-900">{stats.total}</span>, ' Bài học'],
                [User, 'text-slate-400', <span className="text-slate-900">{stats.learning}</span>, ' Đang học'],
                [CheckCircle, 'text-slate-400', <span className="text-slate-900">{stats.completed}</span>, ' Đã hoàn thành'],
                [Zap, 'text-amber-500', <span className="font-black text-amber-600">{stats.avgAccuracy}%</span>, ' Trung bình'],
              ].map(([Icon, ic, v, l], i) => (
                <div key={i} className="flex items-center gap-3">
                  <Icon size={14} className={ic} />
                  <div className="text-xs font-bold text-slate-600">{v}{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function LessonCard({ lesson, onOpen }) {
  const lv = lesson.level || '';
  return (
    <button type="button" onClick={onOpen} className="group relative flex flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white text-left transition-all hover:border-herb-500/30 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="relative m-2 aspect-[4/3] self-stretch overflow-hidden rounded-[24px]">
        <img src={lesson.thumbnail_url} alt={lesson.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className={`absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white ${lv.startsWith('C') ? 'bg-red-600' : lv.startsWith('B') ? 'bg-herb-600' : 'bg-blue-600'}`}>{lv}</div>
        {lesson.is_community
          ? <div className="absolute right-3 top-3 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white">Cộng đồng</div>
          : lesson.is_custom ? <div className="absolute right-3 top-3 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white">Của tôi</div> : null}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white"><Clock size={10} /> {lesson.duration || '--:--'}</div>
      </div>
      <div className="px-5 py-4 pb-6">
        <h3 className="mb-2 line-clamp-2 h-10 text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-herb-600">{lesson.title}</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-bold text-slate-400">{lesson.segments || 0} phân đoạn</div>
          {!lesson.hasSubs && <div className="flex max-w-[55%] items-center gap-1 truncate text-[10px] font-semibold text-amber-600"><AlertCircle size={9} className="shrink-0" /><span className="truncate">chưa có phụ đề offline</span></div>}
        </div>
      </div>
    </button>
  );
}

function UploadCard({ onClick }) {
  return (
    <div onClick={onClick} className="group relative col-span-1 cursor-pointer overflow-hidden rounded-3xl border border-orange-100/50 shadow-sm transition-all hover:shadow-md md:col-span-2" style={{ background: 'linear-gradient(135deg, #fff5e6 0%, #ffedd6 100%)' }}>
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-300 opacity-40 mix-blend-multiply blur-[80px] filter" />
      <div className="absolute -bottom-32 left-10 h-48 w-48 rounded-full bg-yellow-300 opacity-30 mix-blend-multiply blur-[60px] filter" />
      <div className="relative flex h-full p-6 md:p-8">
        <div className="flex w-[60%] flex-col justify-center pr-4">
          <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-white/80 px-3 py-1 shadow-sm">
            <span className="text-orange-500">✨</span><span className="text-[10px] font-black tracking-wider text-orange-600">MỚI</span>
          </div>
          <h3 className="mb-3 text-[22px] font-black leading-[1.1] text-slate-800 md:text-[28px]">Luyện với <br />nội dung <span className="text-orange-500">bạn</span> <br />yêu thích</h3>
          <p className="mb-6 max-w-[95%] text-xs font-medium leading-relaxed text-slate-600 md:text-sm">Upload video hoặc audio của riêng bạn để luyện Shadowing và Dictation với tid.</p>
          <span className="inline-flex w-fit flex-col items-center justify-center rounded-2xl bg-[#f97316] px-6 py-2.5 font-black text-white shadow-[4px_4px_0_rgba(200,80,0,0.4)] transition-transform group-hover:scale-105">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wide md:text-sm"><span className="text-lg font-normal">+</span> UPLOAD VIDEO / AUDIO</span>
            <span className="mt-0.5 text-[10px] font-bold text-white/90">Bắt đầu ngay</span>
          </span>
        </div>
        <div className="relative flex w-[40%] items-center justify-center">
          <div className="absolute right-[5%] top-[15%] z-10 flex h-16 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-500 group-hover:-translate-y-2 md:h-20 md:w-32">
            <svg className="h-8 w-8 text-orange-400 md:h-10 md:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          </div>
          <div className="absolute bottom-[20%] right-[20%] z-20 h-20 w-28 rounded-xl border border-white/50 bg-white/90 p-2 shadow-xl transition-transform duration-500 group-hover:translate-y-2 md:h-24 md:w-36">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-orange-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 shadow-inner md:h-10 md:w-10"><svg className="ml-0.5 h-4 w-4 text-white md:h-5 md:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg></div>
              <div className="absolute bottom-1 right-2 rounded bg-green-500 px-1.5 py-0.5 text-[8px] font-black text-white">CC</div>
            </div>
          </div>
          <div className="absolute left-[5%] top-[5%] flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg transition-transform duration-500 group-hover:rotate-0 md:h-16 md:w-16"><Headphones className="h-6 w-6 text-white md:h-8 md:w-8" /></div>
          <div className="absolute bottom-[25%] left-0 flex h-10 w-10 -rotate-12 items-center justify-center rounded-full bg-purple-500 shadow-lg transition-transform duration-500 group-hover:scale-110 md:h-12 md:w-12">
            <svg className="h-4 w-4 text-white md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// "Thêm Video / Audio": offline build can only open videos whose subtitles are bundled locally.
function AddVideoModal({ lessons, onClose, onOpen }) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [found, setFound] = useState(null);
  const check = () => {
    const m = url.trim().match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || url.trim().match(/^([\w-]{11})$/);
    if (!m) { setErr('Link YouTube không hợp lệ'); return; }
    const hit = lessons.find(l => l.youtube_id === m[1]);
    if (hit) { setFound(hit); setTimeout(() => onOpen(hit.youtube_id), 1500); return; }
    setErr('Bản offline chưa thể tải phụ đề YouTube mới (cần máy chủ TID). Hãy chọn một bài có sẵn trong thư viện nhé.');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,1)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800">Thêm Video / Audio</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Dán link YouTube để luyện Shadowing/Dictation</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <input value={url} onChange={e => { setUrl(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && check()} autoFocus placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-medium transition-colors focus:border-emerald-500 focus:outline-none" />
          {found && (
            <div className="space-y-2.5 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center text-sm">
              <p className="font-black text-blue-900">Video này đã có sẵn trên hệ thống rồi nha 👇</p>
              <p className="text-xs font-medium text-blue-800">Bạn không cần thêm lại, hệ thống sẽ đưa bạn đến video ngay bây giờ...</p>
              <button onClick={() => onOpen(found.youtube_id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-blue-700">ĐI TỚI VIDEO BÂY GIỜ</button>
            </div>
          )}
          {err && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"><AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" /><p className="text-xs font-medium text-red-600">{err}</p></div>}
          <p className="text-[11px] font-medium text-slate-400">Video cần có <strong>phụ đề tiếng Anh</strong> (CC) để hoạt động. Video tin tức, TED, BBC, YouTube Edu thường có.</p>
          <button onClick={check} disabled={!url.trim() || !!found} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[3px_3px_0_rgba(0,0,0,0.8)] transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
            {found ? <><Loader2 size={14} className="animate-spin" /> Đang mở...</> : <><ArrowRight size={14} /> Bắt đầu luyện tập</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shadowing({ onBack, onOpen, initialMode = 'shadowing' }) {
  const [index] = useLocalData(() => loadShadowing('index'));
  const [cat, setCatRaw] = useState('all');
  const [level, setLevelRaw] = useState('all');
  const [mode, setMode] = useState(initialMode);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [sideOpen, setSideOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const progress = useMemo(() => readProgress(), []);

  useEffect(() => { const t = setTimeout(() => setQuery(q), 400); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); }, [query]);
  const setCat = c => { setPage(1); setCatRaw(c); setSideOpen(false); };
  const setLevel = l => { setPage(1); setLevelRaw(l); setSideOpen(false); };

  const lessons = index || [];
  const filtered = useMemo(() => {
    let list = lessons;
    if (cat === 'in-progress') {
      list = list.filter(l => {
        const p = progress[l.youtube_id];
        if (!p || !l.segments) return false;
        return p.resultsCount > 0 ? p.resultsCount < l.segments : p.currentIdx > 0 && p.currentIdx < l.segments - 1;
      }).sort((a, b) => (progress[b.youtube_id]?.updatedAt || 0) - (progress[a.youtube_id]?.updatedAt || 0));
    } else if (cat === 'my-videos') list = [];
    else if (cat === 'community') list = list.filter(l => l.is_community);
    else if (cat === 'all') list = list.filter(l => l.is_community || !l.is_custom);
    else if (CAT_NAME[cat]) list = list.filter(l => l.category === CAT_NAME[cat]);
    if (level !== 'all') list = list.filter(l => l.level === level);
    const s = query.trim().toLowerCase();
    if (s) list = list.filter(l => l.title.toLowerCase().includes(s));
    return list;
  }, [lessons, cat, level, query, progress]);

  const stats = useMemo(() => {
    let learning = 0, completed = 0, sum = 0, n = 0;
    for (const [id, p] of Object.entries(progress)) {
      if (!p.resultsCount) continue;
      learning++;
      const l = lessons.find(x => x.youtube_id === id);
      if (l && l.segments > 0 && p.resultsCount >= l.segments) completed++;
      p.scores.forEach(s => { sum += s; n++; });
    }
    return { total: filtered.length, learning, completed, avgAccuracy: n ? Math.round(sum / n) : 0 };
  }, [progress, lessons, filtered.length]);

  const pages = Math.ceil(filtered.length / PAGE);
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);
  const open = l => onOpen(l.youtube_id, mode === 'quiz' ? 'dictation' : mode);
  const showUpload = !query.trim() && cat !== 'in-progress';
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => { if (i > 0 && arr[i - 1] !== n - 1) acc.push('...'); acc.push(n); return acc; }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar cat={cat} setCat={setCat} level={level} setLevel={setLevel} stats={stats} open={sideOpen} setOpen={setSideOpen} onHome={onBack} />
      <main className="w-full max-w-full flex-1 overflow-hidden p-4 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 lg:mb-12">
            <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"><ChevronLeft size={16} /> Speaking</button>
            <div className="mb-2 flex items-center gap-3">
              <button onClick={() => setSideOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"><Menu size={20} /></button>
              <h2 className="text-2xl font-black text-slate-800 lg:text-3xl">Luyện Shadowing</h2>
            </div>
            <p className="mb-6 text-sm font-medium text-slate-500 lg:text-base">Chọn chủ đề để luyện kỹ năng nói một cách tự nhiên</p>
            <div className="inline-flex items-center rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
              {[['shadowing', Headphones, 'Shadowing'], ['dictation', Keyboard, 'Dictation'], ['quiz', ListChecks, 'Quiz']].map(([id, Icon, label]) => (
                <button key={id} onClick={() => setMode(id)} className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${mode === id ? 'bg-herb-600 text-white shadow-lg shadow-herb-200' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-800">{HEADINGS[cat] || 'Tất cả bài học'}</h3>
              <span className="flex items-baseline gap-1 rounded-full border border-herb-200/60 bg-herb-50 px-3.5 py-1.5 text-[11px] font-bold text-herb-700 shadow-sm">
                <span className="text-sm font-black text-herb-600">{filtered.length}</span> bài học
              </span>
            </div>
            <div className="relative w-full md:w-64 lg:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search size={16} className="text-slate-400" /></div>
              <input type="text" placeholder="Tìm bài học theo tên..." value={q} onChange={e => setQ(e.target.value)} className="w-full rounded-xl border-2 border-black py-2 pl-10 pr-10 text-sm font-medium shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all focus:outline-none focus:ring-2 focus:ring-herb-500/20" />
              {q && <button onClick={() => setQ('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
            </div>
          </div>
          {mode === 'quiz' && <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700">Quiz nghe hiểu theo video chưa có trong bản offline — chọn bài để luyện Dictation thay thế.</p>}

          {!index ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-[32px] border border-slate-100 bg-white" />)}
            </div>
          ) : shown.length > 0 || (page === 1 && showUpload) ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {showUpload && <UploadCard onClick={() => setAdding(true)} />}
              {shown.map(l => <LessonCard key={l.youtube_id} lesson={l} onOpen={() => open(l)} />)}
            </div>
          ) : cat === 'in-progress' ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"><History size={32} className="text-slate-300" /></div>
              <p className="text-lg font-black">Chưa có video nào đang luyện dở</p>
              <p className="text-sm">Bắt đầu một video bất kỳ để nó xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"><Search size={32} className="text-slate-300" /></div>
              <p className="text-lg font-black">Không tìm thấy bài học nào</p>
              <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc chọn chủ đề khác</p>
            </div>
          )}

          {pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1.5 rounded-xl border-2 border-black px-5 py-2.5 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={16} /> Trước</button>
              <div className="flex items-center gap-1.5">
                {pageNums.map((n, i) => n === '...'
                  ? <span key={`e${i}`} className="px-1 text-sm font-bold text-slate-400">…</span>
                  : <button key={n} onClick={() => setPage(n)} className={`h-9 w-9 rounded-xl border-2 text-sm font-black transition-all ${page === n ? 'border-black bg-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.3)]' : 'border-slate-200 hover:border-black hover:bg-slate-50'}`}>{n}</button>)}
              </div>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1.5 rounded-xl border-2 border-black px-5 py-2.5 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30">Tiếp <ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </main>
      {adding && <AddVideoModal lessons={lessons} onClose={() => setAdding(false)} onOpen={id => { setAdding(false); onOpen(id, mode === 'quiz' ? 'dictation' : mode); }} />}
    </div>
  );
}
