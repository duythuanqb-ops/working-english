// /practice/reading/song-ngu-bao — "Đọc Báo Song Ngữ" (Bilingual Press Portal), ported from theieltsdictionary.com.
// Three local states like the site: portal (6 newspapers) → newspaper home (article list) → bilingual reader.
// Server features are replaced locally: word glosses = the article's own [phrase]{nghĩa} marks + dictionaryService,
// saved articles / notes / saved words = localStorage.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Newspaper, Bookmark, BookmarkCheck, Eye, ExternalLink, ChevronLeft, ChevronRight, X, Volume2, Plus, Check,
  NotebookPen, Loader2, Trash2,
} from 'lucide-react';
import { asset } from '../shared';
import { dictionaryService } from '../../../services/dictionaryService';
import { ttsService } from '../../../services/ttsService';
import { loadArticleIndex, loadArticle } from './readingData';

const SOURCES = [
  { id: 'the-atlantic', name: 'The Atlantic', image: 'the_atlantic.webp', tagline: 'Văn phong học thuật, lập luận sắc bén & đa chiều', difficulty: 'Hard (7.0+)' },
  { id: 'the-new-york-times', name: 'The New York Times', image: 'the-new-york-time.webp', tagline: 'Văn hoá, xã hội & phong cách nghị luận chuẩn mực', difficulty: 'Medium-Hard (6.5+)' },
  { id: 'reuters', name: 'Reuters', image: 'reuters.webp', tagline: 'Tin tức chính xác, khách quan & thời sự toàn cầu', difficulty: 'Medium (5.5 - 6.5)' },
  { id: 'substack', name: 'Substack', image: 'subtack.webp', tagline: 'Blog cá nhân chất lượng, văn phong tự nhiên đời thường', difficulty: 'Easy-Medium (5.0 - 6.0)', isRecommended: true },
  { id: 'the-conversation', name: 'The Conversation', image: 'the-conversation.webp', tagline: 'Kiến thức học thuật, nghiên cứu khoa học & góc nhìn chuyên gia', difficulty: 'Medium-Hard (6.5+)' },
  { id: 'the-guardian', name: 'The Guardian', image: 'the-guardian.webp', tagline: 'Quan điểm tự do, bình luận xã hội & môi trường sâu sắc', difficulty: 'Medium-Hard (6.5+)' },
];

const FONTS = [
  { name: 'Fraunces', stack: "'Fraunces', Georgia, serif" }, { name: 'Lora', stack: "'Lora', Georgia, serif" },
  { name: 'Merriweather', stack: "'Merriweather', Georgia, serif" }, { name: 'Playfair Display', stack: "'Playfair Display', Georgia, serif" },
  { name: 'Crimson Pro', stack: "'Crimson Pro', Georgia, serif" }, { name: 'EB Garamond', stack: "'EB Garamond', Georgia, serif" },
  { name: 'Libre Caslon', stack: "'Libre Caslon Text', Georgia, serif" }, { name: 'Newsreader', stack: "'Newsreader', Georgia, serif" },
  { name: 'Roboto Serif', stack: "'Roboto Serif', Georgia, serif" }, { name: 'DM Serif Display', stack: "'DM Serif Display', Georgia, serif" },
  { name: 'Spectral', stack: "'Spectral', Georgia, serif" }, { name: 'IBM Plex Serif', stack: "'IBM Plex Serif', Georgia, serif" },
  { name: 'Bitter', stack: "'Bitter', Georgia, serif" }, { name: 'Inter (sans)', stack: "'Inter', system-ui, sans-serif" },
  { name: 'Source Sans (sans)', stack: "'Source Sans 3', system-ui, sans-serif" },
];
const GRID_BG = { backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' };
const PAGE = 12;

// The site shows a stable, inflated read count per article (FNV hash of the id + real count).
function views(id, n) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return 30000 + (h % 10000) + (n || 0);
}
const fmtK = n => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

// ---- localStorage helpers ----
const SAVED_KEY = 'tid_saved_articles';
const WORDS_KEY = 'tid_press_words_v1';
const NOTE_KEY = id => `tid_press_note_${id}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

// ---- text helpers (ports of the site's Q / Y / K) ----
function renderInline(text) {
  return text.split(/(\*\*.*?\*\*|\*.*?\*|\[IMG:.*?\])/g).filter(Boolean).map((p, i) => {
    if (p.startsWith('[IMG:') && p.endsWith(']')) return <img loading="lazy" decoding="async" key={i} src={p.slice(5, -1)} className="my-3 max-w-full rounded-lg" alt="" />;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}
// "[make life worth living]{khiến cuộc sống đáng sống}" → clean text + word-index → meaning map (+ phrase list)
function parseGlosses(src) {
  const re = /\[(.*?)\]\{(.*?)\}/g;
  let clean = '', last = 0, m;
  const spans = [];
  while ((m = re.exec(src))) {
    if (m[1].startsWith('IMG:')) continue;
    clean += src.slice(last, m.index);
    const start = clean.length;
    clean += m[1];
    spans.push({ start, end: clean.length, meaning: m[2].trim(), phrase: m[1] });
    last = re.lastIndex;
  }
  clean += src.slice(last);
  const map = {};
  if (spans.length) {
    const w = /\S+/g;
    let k = 0, t;
    while ((t = w.exec(clean))) {
      const s = t.index, e = s + t[0].length;
      const hit = spans.find(x => s < x.end && e > x.start);
      if (hit) map[k] = hit;
      k++;
    }
  }
  return { clean, map };
}
function tokenize(text) {
  const marks = [];
  const re = /\*\*.*?\*\*|\*.*?\*|\[IMG:.*?\]/g;
  let m;
  while ((m = re.exec(text))) {
    const type = m[0].startsWith('**') ? 'bold' : m[0].startsWith('[IMG:') ? 'img' : 'italic';
    marks.push({ start: m.index, end: m.index + m[0].length, type, url: type === 'img' ? m[0].slice(5, -1) : undefined });
  }
  const out = [];
  const seenImg = new Set();
  const w = /\S+/g;
  let t, k = 0;
  while ((t = w.exec(text))) {
    const s = t.index, e = s + t[0].length;
    const mk = marks.find(x => s < x.end && e > x.start);
    if (mk?.type === 'img') {
      out.push({ k, img: !seenImg.has(mk.start), url: mk.url, t: '' });
      seenImg.add(mk.start);
    } else out.push({ k, t: t[0].replace(/\*/g, ''), format: mk?.type || 'text' });
    k++;
  }
  return out;
}
const bare = w => w.replace(/[.,!?;:'"()[\]{}‘’“”…—–-]+$|^[.,!?;:'"()[\]{}‘’“”…—–-]+/g, '');
function sentenceOf(text, word) {
  const w = word.toLowerCase();
  const parts = text.replace(/([.!?])\s+/g, '$1\u0001').split('\u0001');
  return (parts.find(p => p.toLowerCase().includes(w)) || '').trim();
}

// ===================================================================================== portal
function Portal({ onBack, counts, onPick }) {
  return (
    <div className="relative min-h-full flex-grow bg-herb px-4 pb-24 pt-12 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0 z-0" style={GRID_BG} />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <button type="button" onClick={onBack} className="group inline-flex items-center text-sm font-bold text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />Quay lại Reading
          </button>
        </div>
        <header className="mb-16 text-center md:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-gleam">
            <Newspaper className="h-3.5 w-3.5" /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Bilingual Press Portal</span>
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">Đọc Báo Song Ngữ</h1>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-white/80">Tuyển tập các bài viết song ngữ Anh - Việt từ những đầu báo uy tín nhất thế giới, giúp bạn nâng cao từ vựng học thuật và phản xạ đọc hiểu tự nhiên.</p>
        </header>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {SOURCES.map(s => (
            <div key={s.id} onClick={() => onPick(s)} title={`${s.name} · ${counts[s.id] || 0} bài · ${s.tagline} · ${s.difficulty}`}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[36px] border-4 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_0_rgba(0,0,0,1)]">
              {s.isRecommended && <div className="absolute right-4 top-4 z-10 rotate-3 rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0_rgba(0,0,0,1)]">Recommended by TID</div>}
              <div className="relative aspect-[3/4] w-full overflow-hidden border-b-4 border-black bg-white">
                <img loading="lazy" decoding="async" src={asset(`assets/tid/reading/press/${s.image}`)} alt={s.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================================================================================== newspaper home
function NewspaperHome({ source, articles, saved, onToggleSave, onOpen, onBack }) {
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [onlySaved, setOnlySaved] = useState(false);
  const all = articles;
  const sorted = sort === 'popular' ? [...all].sort((a, b) => views(b.id, b.viewCount) - views(a.id, a.viewCount)) : sort === 'oldest' ? [...all].reverse() : all;
  const list = onlySaved ? sorted.filter(a => saved.has(a.id)) : sorted;
  const pages = Math.ceil(list.length / PAGE);
  const shown = list.slice(page * PAGE, page * PAGE + PAGE);
  const hero = all[0];
  const savedCount = all.filter(a => saved.has(a.id)).length;
  const goto = p => { setPage(p); document.getElementById('press-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const btn = 'inline-flex items-center gap-1.5 border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none';

  return (
    <div className="min-h-full flex-grow bg-white pb-24 pt-6 text-slate-800">
      <div className="border-y border-slate-100 bg-slate-50 px-4 py-3.5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex items-center text-sm font-bold text-slate-500 transition-colors hover:text-herb"><ArrowLeft className="mr-2 h-4 w-4" />Quay lại danh sách báo</button>
          <button type="button" onClick={() => { setOnlySaved(v => !v); setPage(0); }} className={`${btn} ${onlySaved ? 'bg-amber-400 text-black' : 'bg-white text-slate-700 hover:bg-amber-50'}`}>
            {onlySaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}Đã lưu{savedCount > 0 ? ` (${savedCount})` : ''}
          </button>
        </div>
      </div>
      <div className="relative border-b border-slate-100 px-4 py-12 text-center">
        <div className="font-serif text-4xl font-extrabold uppercase tracking-tighter text-[#1e3006] md:text-5xl">{source.name}</div>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{source.tagline} · {source.difficulty}</p>
      </div>
      <div className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        {hero && (
          <div onClick={() => onOpen(hero)} className="group relative mb-16 aspect-[16/9] max-h-[600px] w-full cursor-pointer overflow-hidden rounded-[32px] shadow-lg">
            {hero.image && <img loading="lazy" decoding="async" src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />}
            <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/65" />
            <div className="absolute inset-0 mx-auto flex max-w-4xl flex-col items-center justify-center p-8 text-center">
              {hero.category && <span className="mb-4 rounded-full border border-[#a3cf62]/20 bg-[#a3cf62]/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#a3cf62]">{hero.category}</span>}
              <h2 className="mb-4 font-serif text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">{hero.title}</h2>
              <h3 className="mb-6 font-serif text-lg italic tracking-wide text-white/90 md:text-2xl">{hero.titleVi}</h3>
              <p className="mb-8 hidden max-w-2xl text-sm font-medium leading-relaxed text-slate-200 opacity-95 md:block md:text-base">{hero.excerpt}</p>
              <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#a3cf62]">
                <span>Click to read bilingual article</span>
                <span className="flex items-center gap-1.5 text-white/80"><Eye className="h-3.5 w-3.5" /> {fmtK(views(hero.id, hero.viewCount))} lượt đọc</span>
              </div>
            </div>
          </div>
        )}
        <div id="press-list" className="mb-8 flex scroll-mt-6 flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setSort(s => (s === 'newest' ? 'oldest' : 'newest')); setPage(0); }} className={`${btn} bg-white text-slate-700 hover:bg-slate-50`}>{sort === 'oldest' ? '↑ Cũ nhất' : '↓ Mới nhất'}</button>
          <button type="button" onClick={() => { setSort('popular'); setPage(0); }} className={`${btn} ${sort === 'popular' ? 'bg-amber-100' : 'bg-white'} text-slate-700 hover:bg-slate-50`}>🔥 Nhiều lượt đọc</button>
          <span className="ml-auto text-xs font-bold text-slate-400">{list.length} bài viết</span>
        </div>
        {onlySaved && list.length === 0 && (
          <div className="mb-20 rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">Chưa có bài nào được lưu.</p>
            <p className="mt-1 text-xs text-slate-400">Nhấn biểu tượng 🔖 trên thẻ bài, hoặc nút “Lưu bài” khi đang đọc.</p>
          </div>
        )}
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {shown.map(a => (
            <div key={a.id} className="group relative flex cursor-pointer flex-col">
              <button type="button" onClick={e => { e.stopPropagation(); onToggleSave(a.id); }} aria-pressed={saved.has(a.id)} title={saved.has(a.id) ? 'Bỏ lưu' : 'Lưu bài'}
                className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] transition-colors ${saved.has(a.id) ? 'bg-amber-400 text-black' : 'bg-white text-slate-700 hover:bg-amber-50'}`}>
                {saved.has(a.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </button>
              <div onClick={() => onOpen(a)} className="flex flex-grow flex-col">
                <div className="relative mb-5 aspect-[3/2] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                  {a.image && <img src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-herb">📖 {a.category}</span>
                <h3 className="mb-2 flex flex-wrap items-start gap-1.5 font-serif text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-herb">
                  {a.title}
                  {a.sourceUrl && (
                    <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title={a.sourceUrl}
                      className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-500 transition-colors hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700">
                      {a.sourceLabel || <ExternalLink size={10} />}{a.sourceLabel && <ExternalLink size={9} />}
                    </a>
                  )}
                </h3>
                <h4 className="mb-4 font-serif text-sm italic leading-snug text-slate-500">{a.titleVi}</h4>
                <p className="mb-5 line-clamp-3 text-xs font-medium leading-relaxed text-slate-500">{a.excerpt}</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>By {a.author}</span>
                  <div className="flex items-center gap-3">
                    {lsGet(NOTE_KEY(a.id), '') && <span className="flex items-center gap-1 text-[#6b7c3a]" title="Bài này có ghi chú của bạn"><NotebookPen className="h-3 w-3" /> Ghi chú</span>}
                    <span className="flex items-center gap-1" title="Lượt đọc"><Eye className="h-3 w-3" /> {fmtK(views(a.id, a.viewCount))} lượt đọc</span>
                    <span>{a.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {pages > 1 && (
          <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
            <button type="button" disabled={page === 0} onClick={() => goto(Math.max(0, page - 1))} className={`${btn} bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30`}><ChevronLeft className="h-4 w-4" /> Trước</button>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} type="button" onClick={() => goto(i)} className={`h-9 w-9 border-2 border-black text-sm font-black shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${i === page ? 'bg-[#1e3006] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'}`}>{i + 1}</button>
              ))}
            </div>
            <button type="button" disabled={page === pages - 1} onClick={() => goto(Math.min(pages - 1, page + 1))} className={`${btn} bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30`}>Tiếp <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================================== reader
function Paragraph({ text, pi, dark, font, size, activeId, onHover, onLeave, onPick }) {
  const { clean, map } = useMemo(() => parseGlosses(text), [text]);
  const toks = useMemo(() => tokenize(clean), [clean]);
  return (
    <p className="mb-6 leading-relaxed" style={{ fontSize: `${size}px`, fontFamily: font }}>
      {toks.map(tk => {
        if (tk.img) return <img loading="lazy" decoding="async" key={tk.k} src={tk.url} className="my-3 max-w-full rounded-lg" alt="" />;
        if (!tk.t) return null;
        const id = `${pi}.${tk.k}`;
        const gloss = map[tk.k];
        const on = activeId === id;
        let el = (
          <span id={`tok-${id}`} className={`cursor-pointer rounded px-0.5 transition-colors duration-100 ${on ? 'bg-[#a3cf62]/40 text-[#1e3a06] underline decoration-[#6b7c3a]/60' : dark ? 'text-slate-200' : 'text-slate-700'} ${gloss ? 'border-b border-dashed border-[#a3cf62]' : ''}`}>{tk.t}</span>
        );
        if (tk.format === 'bold') el = <strong>{el}</strong>;
        else if (tk.format === 'italic') el = <em>{el}</em>;
        return (
          <span key={tk.k} className="relative inline-block"
            onMouseEnter={e => gloss && onHover(id, e.currentTarget.firstChild, gloss, clean)}
            onMouseLeave={onLeave}
            onClick={e => onPick(id, e.currentTarget.firstChild, tk.t, gloss, clean)}>
            {el}{' '}
          </span>
        );
      })}
    </p>
  );
}

function NotesPanel({ article, onClose, append }) {
  const [text, setText] = useState(() => lsGet(NOTE_KEY(article.id), ''));
  const [at, setAt] = useState(null);
  useEffect(() => {
    if (!append) return;
    setText(t => `${t}${t ? (t.endsWith('\n') ? '\n' : '\n\n') : ''}${append.text}\n`);
  }, [append]);
  useEffect(() => {
    const h = setTimeout(() => { lsSet(NOTE_KEY(article.id), text); setAt(new Date()); }, 500);
    return () => clearTimeout(h);
  }, [text, article.id]);
  return (
    <aside aria-label="Ghi chú của bạn" className="fixed right-0 top-0 z-[165] flex h-full w-full flex-col border-l-4 border-black bg-[#fbf8f1] text-slate-800 shadow-[-6px_0_0_rgba(0,0,0,0.15)] md:w-[22rem]">
      <div className="flex items-start justify-between gap-3 border-b-2 border-black bg-[#FFE787] px-5 pb-4 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1E3006]"><NotebookPen className="h-3.5 w-3.5" /> Ghi chú của bạn</div>
          <p className="mt-1 line-clamp-2 font-serif text-sm italic leading-snug text-slate-700">{article.title}</p>
        </div>
        <button type="button" onClick={onClose} title="Đóng" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-slate-100"><X size={16} /></button>
      </div>
      <div className="relative min-h-0 flex-grow">
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 20000))} spellCheck={false}
          placeholder={'Ghi lại ý chính, cấu trúc hay, từ muốn nhớ…\n\nMẹo: bấm vào một từ hoặc bôi đen một cụm trong bài, rồi chọn “Chép vào ghi chú”.'}
          className="absolute inset-0 h-full w-full resize-none bg-transparent px-5 pb-6 pt-[6px] font-serif text-base text-slate-800 outline-none placeholder:italic placeholder:text-slate-400"
          style={{ lineHeight: '32px', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, #e6dcc6 31px, #e6dcc6 32px)', backgroundAttachment: 'local' }} />
      </div>
      <div className="flex items-center justify-between gap-3 border-t-2 border-black px-5 py-3 text-[11px] font-bold text-slate-500">
        <span>{at ? `Đã lưu · ${at.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Chỉ mình bạn xem được'}</span>
      </div>
    </aside>
  );
}

function Reader({ meta, saved, onToggleSave, onBack, onSaveWord }) {
  const [body, setBody] = useState(null);
  const [font, setFont] = useState(FONTS[0].stack);
  const [size, setSize] = useState(17);
  const [dark, setDark] = useState(false);
  const [ratio, setRatio] = useState(0.5);
  const [tip, setTip] = useState(null); // {x,y,top,bottom,word,text,sentence,pinned,loading,saved}
  const [pinnedId, setPinnedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [words, setWords] = useState(() => lsGet(WORDS_KEY, []));
  const [wordsOpen, setWordsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [append, setAppend] = useState(null);
  const [fs, setFs] = useState(false);
  const wrapRef = useRef(null), enRef = useRef(null), viRef = useRef(null), lock = useRef(null), hoverT = useRef(null), seq = useRef(0);

  useEffect(() => {
    let dead = false;
    setBody(null);
    loadArticle(meta.id).then(a => { if (!dead) setBody(a?.content || []); });
    return () => { dead = true; };
  }, [meta.id]);
  useEffect(() => {
    const f = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  useEffect(() => lsSet(WORDS_KEY, words), [words]);
  useEffect(() => {
    if (!tip?.pinned) return undefined;
    const close = e => { if (!e.target.closest?.('[data-press-tip]') && !e.target.closest?.('[id^="tok-"]')) { setTip(null); setPinnedId(null); } };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [tip?.pinned]);

  const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, top: r.top, bottom: r.bottom }; };
  const lookupInto = async (word, mySeq) => {
    try {
      const r = await dictionaryService.lookup(word);
      if (seq.current !== mySeq) return;
      const def = r?.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '';
      setTip(t => (t ? { ...t, loading: false, text: r?.meaningVi || t.text || 'Chưa tra được nghĩa', ipa: r?.ipaUs || r?.ipaUk || '', pos: r?.partOfSpeech || '', def, res: r } : t));
    } catch {
      if (seq.current === mySeq) setTip(t => (t ? { ...t, loading: false, text: t.text || 'Chưa tra được nghĩa', error: !t.text } : t));
    }
  };

  const onHover = (id, el, gloss, clean) => {
    if (pinnedId) return;
    clearTimeout(hoverT.current);
    setHoverId(id);
    setTip({ ...rectOf(el), word: gloss.phrase, text: gloss.meaning, sentence: sentenceOf(clean, gloss.phrase), pinned: false });
  };
  const onLeave = () => {
    if (pinnedId) return;
    hoverT.current = setTimeout(() => { setHoverId(null); setTip(t => (t && !t.pinned ? null : t)); }, 80);
  };
  const onPick = (id, el, raw, gloss, clean) => {
    const sel = (window.getSelection()?.toString() || '').trim();
    if (sel && /\s/.test(sel)) return; // phrase selection handled on mouseup
    if (pinnedId === id) { setPinnedId(null); setTip(null); return; }
    const word = gloss ? gloss.phrase : bare(raw);
    if (!word) return;
    const mySeq = ++seq.current;
    setPinnedId(id);
    setTip({ ...rectOf(el), word, text: gloss?.meaning || '', sentence: sentenceOf(clean, word), pinned: true, loading: !gloss, gloss: !!gloss });
    if (!gloss) lookupInto(word, mySeq);
  };
  // select 2–12 words in the EN pane → phrase popup
  const onMouseUp = () => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return;
    const phrase = s.toString().replace(/\s+/g, ' ').trim();
    const n = phrase ? phrase.split(' ').length : 0;
    if (n < 2 || n > 12 || phrase.length > 100) return;
    const r = s.getRangeAt(0).getBoundingClientRect();
    if (!r.width && !r.height) return;
    const block = s.anchorNode?.parentElement?.closest('p');
    const mySeq = ++seq.current;
    setPinnedId('sel');
    setTip({ x: r.left + r.width / 2, top: r.top, bottom: r.bottom, word: bare(phrase), text: '', sentence: block ? sentenceOf(block.textContent || '', phrase.split(' ')[0]) : '', pinned: true, loading: true });
    lookupInto(bare(phrase), mySeq);
  };

  const saveTip = () => {
    if (!tip || tip.saved || tip.loading) return;
    const entry = { word: tip.word, meaning: tip.text, sentence: tip.sentence, at: Date.now() };
    setWords(w => [entry, ...w.filter(x => x.word.toLowerCase() !== tip.word.toLowerCase())]);
    onSaveWord?.({
      word: tip.word, ipa: tip.ipa || '', partOfSpeech: tip.pos || (/\s/.test(tip.word) ? 'phrase' : 'noun'), meaningVi: tip.text || '',
      meaningEn: tip.def || '', examples: tip.sentence ? [{ en: tip.sentence, vi: '' }] : [], synonyms: tip.res?.synonyms || [], tags: ['IELTS Reading', 'Đọc báo song ngữ'],
    });
    setTip(t => ({ ...t, saved: true }));
  };

  // proportional scroll sync between the EN and VI panes
  const sync = from => () => {
    if (lock.current && lock.current !== from) { lock.current = null; return; }
    const a = from === 'en' ? enRef.current : viRef.current, b = from === 'en' ? viRef.current : enRef.current;
    if (!a || !b) return;
    const ra = a.scrollHeight - a.clientHeight, rb = b.scrollHeight - b.clientHeight;
    if (ra <= 0 || rb <= 0) return;
    lock.current = from;
    b.scrollTop = (a.scrollTop / ra) * rb;
  };
  const drag = e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = ev => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (box) setRatio(Math.max(0.22, Math.min(0.78, (ev.clientX - box.left) / box.width)));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const pane = `${dark ? 'bg-[#1c1c1e] text-slate-100' : 'bg-[#fbf8f1] text-slate-800'} rounded-[18px] p-8 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.06)] flex flex-col relative overflow-y-auto tid-noscroll transition-colors duration-300`;
  const chip = 'bg-black/15 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 sm:px-5 sm:py-2 cursor-pointer font-black transition-colors flex items-center gap-2';
  const isSaved = saved.has(meta.id);
  const hasNote = !!lsGet(NOTE_KEY(meta.id), '');
  const content = body || [];

  // tooltip placement (same rules as the site)
  let tipStyle = null, arrow = null;
  if (tip) {
    const pinned = tip.pinned, W = window.innerWidth, half = pinned ? 150 : 60;
    const below = tip.top < (pinned ? 350 : 40) + 80;
    const bg = pinned ? '#1e3006' : '#3d6b24';
    tipStyle = { background: bg, top: below ? tip.bottom + (pinned ? 12 : 6) : tip.top - (pinned ? 12 : 6), whiteSpace: pinned ? 'normal' : 'nowrap', minWidth: pinned ? 260 : undefined, maxWidth: pinned ? Math.min(320, W - 40) : W - 40 };
    arrow = { position: 'absolute', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', ...(below ? { borderBottom: `8px solid ${bg}`, bottom: '100%' } : { borderTop: `8px solid ${bg}`, top: '100%' }) };
    if (tip.x - half < 20) { tipStyle.left = 20; tipStyle.transform = `translateY(${below ? '0%' : '-100%'})`; arrow.left = `${Math.max(15, tip.x - 20)}px`; arrow.transform = 'translateX(-50%)'; }
    else if (tip.x + half > W - 20) { tipStyle.right = 20; tipStyle.transform = `translateY(${below ? '0%' : '-100%'})`; arrow.right = `${Math.max(15, W - 20 - tip.x)}px`; arrow.transform = 'translateX(50%)'; }
    else { tipStyle.left = tip.x; tipStyle.transform = `translate(-50%, ${below ? '0%' : '-100%'})`; arrow.left = '50%'; arrow.transform = 'translateX(-50%)'; }
  }

  return (
    <div className={`relative flex min-h-full flex-col overflow-hidden bg-[#6b7c3a] p-6 pb-12 pt-8 text-white transition-[padding] duration-300 ${notesOpen ? 'lg:pr-[23rem]' : ''}`}>
      <div className="pointer-events-none absolute inset-0 z-0" style={GRID_BG} />
      <div className={`${fs ? 'max-w-none' : 'max-w-7xl'} relative z-10 mx-auto flex w-full flex-grow flex-col`}>
        <div className="mb-8 flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={onBack} title="Quay lại" className="mr-1 flex cursor-pointer items-center justify-center text-white transition-colors hover:text-white/80"><ArrowLeft className="h-7 w-7" /></button>
            <span className="whitespace-nowrap font-serif text-2xl font-bold italic text-white sm:text-3xl">đọc song ngữ</span>
            <span className="hidden font-black text-white/40 sm:inline">•</span>
            <span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-white/80 sm:inline sm:text-xs">WORKING ENGLISH</span>
          </div>
          <div className="ml-auto flex select-none flex-wrap items-center gap-2 text-[10px] font-bold text-white sm:gap-3 sm:text-xs">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 sm:px-4">
              <span className="font-black uppercase tracking-wider text-white/50">FONT</span>
              <select value={font} onChange={e => setFont(e.target.value)} className="max-w-[90px] cursor-pointer border-none bg-transparent pr-1 font-bold text-white outline-none sm:max-w-[130px]">
                {FONTS.map(f => <option key={f.name} value={f.stack} className="bg-slate-900 text-white" style={{ fontFamily: f.stack }}>{f.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 sm:gap-3 sm:px-4">
              <span className="font-black uppercase tracking-wider text-white/50">CỠ CHỮ</span>
              <button type="button" onClick={() => setSize(s => Math.max(12, s - 1))} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black hover:bg-white/25">-</button>
              <span className="w-4 text-center font-mono text-sm">{size}</span>
              <button type="button" onClick={() => setSize(s => Math.min(28, s + 1))} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black hover:bg-white/25">+</button>
            </div>
            <button type="button" onClick={() => setWordsOpen(true)} className={chip}>📖 {words.length} từ</button>
            <button type="button" onClick={() => onToggleSave(meta.id)} aria-pressed={isSaved}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 font-black transition-colors sm:px-5 sm:py-2 ${isSaved ? 'border-black/20 bg-amber-400 text-black hover:bg-amber-300' : 'border-white/10 bg-black/15 hover:bg-white/10'}`}>
              {isSaved ? <><BookmarkCheck className="h-3.5 w-3.5" /> Đã lưu</> : <><Bookmark className="h-3.5 w-3.5" /> Lưu bài</>}
            </button>
            <button type="button" onClick={() => setNotesOpen(o => !o)} aria-pressed={notesOpen}
              className={`relative flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 font-black transition-colors sm:px-5 sm:py-2 ${notesOpen ? 'border-black/20 bg-[#FFE787] text-black' : 'border-white/10 bg-black/15 hover:bg-white/10'}`}>
              <NotebookPen className="h-3.5 w-3.5" /> Ghi chú
              {hasNote && !notesOpen && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-black/40 bg-[#FFE787]" />}
            </button>
            <button type="button" onClick={() => setDark(d => !d)} className={chip}>{dark ? '☀️ Sáng' : '🌙 Tối'}</button>
            <button type="button" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}))} className={chip}>{fs ? '✕ Thu nhỏ' : '⛶ Toàn màn hình'}</button>
          </div>
        </div>

        {/* desktop: side by side */}
        <div ref={wrapRef} className="hidden flex-grow items-stretch md:flex" style={{ minHeight: '80vh' }}>
          <div ref={enRef} data-en-pane="" onMouseUp={onMouseUp} onScroll={sync('en')} className={pane} style={{ flex: ratio, minWidth: 0, minHeight: '80vh', maxHeight: '88vh' }}>
            <div className="absolute right-8 top-6 z-10 rounded-full bg-[#EBF3FE] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#2F80ED]">EN</div>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#6b7c3a]">English<span className={`ml-2 font-bold normal-case tracking-normal ${dark ? 'text-white/35' : 'text-slate-400'}`}>· rê chuột vào từ để xem nghĩa, bôi đen nhiều từ để lưu cả cụm</span></span>
            <h1 className={`mb-8 flex flex-wrap items-start gap-2 font-serif text-3xl font-black leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              {meta.title}
              {meta.sourceUrl && <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" title={meta.sourceUrl} className="mt-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400 transition-colors hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-blue-300">{meta.sourceLabel || <ExternalLink size={10} />}{meta.sourceLabel && <ExternalLink size={9} />}</a>}
            </h1>
            <div className="flex-grow">
              {!body && <div className="animate-pulse space-y-4">{[100, 92, 97, 88, 95].map((w, i) => <div key={i} className={`h-4 rounded ${dark ? 'bg-white/10' : 'bg-slate-200'}`} style={{ width: `${w}%` }} />)}</div>}
              {content.map((c, i) => (
                <Paragraph key={i} pi={i} text={c.en || ''} dark={dark} font={font} size={size} activeId={pinnedId || hoverId} onHover={onHover} onLeave={onLeave} onPick={onPick} />
              ))}
            </div>
          </div>
          <div onPointerDown={drag} className="group z-20 flex w-8 flex-shrink-0 cursor-col-resize select-none items-center justify-center">
            <div className="h-14 w-[3px] rounded-full bg-white/25 transition-colors group-hover:bg-white/60" />
          </div>
          <div ref={viRef} onScroll={sync('vi')} className={pane} style={{ flex: 1 - ratio, minWidth: 0, minHeight: '80vh', maxHeight: '88vh' }}>
            <div className="absolute right-8 top-6 rounded-full bg-[#FDF0ED] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#EB5757]">VI</div>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#6b7c3a]">Tiếng Việt</span>
            <h1 className={`mb-8 font-serif text-3xl font-extrabold italic leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{meta.titleVi}</h1>
            <div className="flex-grow">
              {content.map((c, i) => <p key={i} className={`mb-6 leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: `${size}px`, fontFamily: font }}>{renderInline(c.vi || '')}</p>)}
            </div>
          </div>
        </div>

        {/* mobile: stacked */}
        <div className="flex flex-grow flex-col gap-6 md:hidden">
          <div data-en-pane="" onMouseUp={onMouseUp} onTouchEnd={onMouseUp} className={`${dark ? 'bg-[#1c1c1e] text-slate-100' : 'bg-[#fbf8f1] text-slate-800'} relative rounded-[18px] p-6 shadow transition-colors duration-300`}>
            <div className="absolute right-5 top-4 rounded-full bg-[#EBF3FE] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#2F80ED]">EN</div>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#6b7c3a]">English</span>
            <h1 className={`mb-6 font-serif text-2xl font-black leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{meta.title}</h1>
            {content.map((c, i) => <Paragraph key={i} pi={i} text={c.en || ''} dark={dark} font={font} size={size} activeId={pinnedId || hoverId} onHover={onHover} onLeave={onLeave} onPick={onPick} />)}
          </div>
          <div className={`${dark ? 'bg-[#1c1c1e] text-slate-100' : 'bg-[#fbf8f1] text-slate-800'} relative rounded-[18px] p-6 shadow transition-colors duration-300`}>
            <div className="absolute right-5 top-4 rounded-full bg-[#FDF0ED] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#EB5757]">VI</div>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#6b7c3a]">Tiếng Việt</span>
            <h1 className={`mb-6 font-serif text-2xl font-extrabold italic leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{meta.titleVi}</h1>
            {content.map((c, i) => <p key={i} className={`mb-4 leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: `${size}px`, fontFamily: font }}>{renderInline(c.vi || '')}</p>)}
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider text-white/50 sm:flex-row">
          <span>By {meta.author} · {meta.readTime}</span>
          <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" /> {fmtK(views(meta.id, meta.viewCount))} lượt đọc</span>
        </div>
      </div>

      {/* word tooltip / pinned popup */}
      {tip && (
        <div data-press-tip="" className={`fixed z-[200] transition-all duration-150 ${tip.pinned ? 'pointer-events-auto rounded-2xl border-2 border-[#1e3006] shadow-[4px_4px_0_rgba(0,0,0,0.8)]' : 'pointer-events-none rounded-lg shadow-lg'}`} style={tipStyle}>
          {tip.pinned ? (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#a3cf62]">EN{tip.ipa && <span className="font-mono lowercase tracking-normal text-white/40">{tip.ipa}</span>}{tip.loading && <Loader2 className="h-3 w-3 animate-spin" />}</div>
                  <div className="flex items-center gap-2 font-serif text-base font-black italic text-white">
                    {tip.word}
                    <button type="button" onClick={e => { e.stopPropagation(); ttsService.speak(tip.word); }} title="Nghe phát âm" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white"><Volume2 size={12} /></button>
                  </div>
                </div>
                <div className="min-w-[110px] flex-1 text-right">
                  <div className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-[#a3cf62]">{tip.gloss ? 'VI · theo câu' : 'VI'}</div>
                  <div className="text-sm font-bold text-white/90">{tip.loading ? 'Đang dịch…' : tip.text}</div>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setTip(null); setPinnedId(null); }} title="Đóng" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/25 hover:text-white"><X size={11} /></button>
              </div>
              {tip.def && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-3 text-[13px] font-semibold leading-relaxed text-white/95">
                  {tip.pos && <span className="mb-1.5 mr-2 inline-block rounded bg-[#a3cf62]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#a3cf62]">{tip.pos}</span>}
                  {tip.def}
                </div>
              )}
              <div className="mt-1 flex w-full flex-col gap-2">
                <button type="button" onClick={e => { e.stopPropagation(); saveTip(); }} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#a3cf62] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#1e3006] transition-colors hover:bg-[#b8df74]">
                  {tip.loading ? 'Đang dịch…' : tip.saved ? <><Check size={11} />Đã lưu</> : <><Plus size={11} />{/\s/.test(tip.word) ? 'Lưu cụm' : 'Lưu từ'}</>}
                </button>
                {!tip.loading && (
                  <button type="button" onClick={e => { e.stopPropagation(); setAppend({ id: Date.now(), text: `• ${tip.word}${tip.text && !tip.error ? ` — ${tip.text}` : ''}` }); setNotesOpen(true); setTip(null); setPinnedId(null); }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FFE787] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#1e3006] transition-colors hover:bg-[#fff0b0]">
                    <NotebookPen size={11} />Chép vào ghi chú
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black text-white"><span>{tip.text}</span></div>
          )}
          <div style={arrow} />
        </div>
      )}

      {notesOpen && <NotesPanel article={meta} append={append} onClose={() => setNotesOpen(false)} />}

      {/* saved words drawer */}
      {wordsOpen && (
        <>
          <div className="fixed inset-0 z-[170] bg-black/40" onClick={() => setWordsOpen(false)} />
          <aside className="fixed right-0 top-0 z-[171] flex h-full w-full flex-col border-l-4 border-black bg-white text-slate-800 md:w-[24rem]">
            <div className="flex items-center justify-between border-b-2 border-black bg-[#a3cf62] px-5 py-4">
              <span className="text-sm font-black uppercase tracking-widest text-[#1e3006]">📖 Từ đã lưu ({words.length})</span>
              <button type="button" onClick={() => setWordsOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {words.length === 0 && <p className="py-10 text-center text-sm font-bold text-slate-400">Chưa có từ nào. Bấm vào một từ trong bài rồi chọn “Lưu từ”.</p>}
              {words.map(w => (
                <div key={w.word} className="mb-2 flex items-start gap-3 rounded-xl border-2 border-slate-200 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base font-black italic">{w.word}</p>
                    <p className="text-sm font-semibold text-[#3d6b24]">{w.meaning}</p>
                    {w.sentence && <p className="mt-1 line-clamp-2 text-[11px] italic text-slate-400">{w.sentence}</p>}
                  </div>
                  <button type="button" onClick={() => setWords(ws => ws.filter(x => x.word !== w.word))} title="Xoá" className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <p className="border-t border-slate-100 px-5 py-3 text-[11px] font-semibold text-slate-400">Từ đã lưu cũng được thêm vào Sổ từ vựng của app.</p>
          </aside>
        </>
      )}
    </div>
  );
}

// ===================================================================================== entry
export default function PressPortal({ onBack, onSaveWord }) {
  const [index, setIndex] = useState(null);
  const [source, setSource] = useState(null);
  const [article, setArticle] = useState(null);
  const [saved, setSaved] = useState(() => new Set(lsGet(SAVED_KEY, [])));
  const topRef = useRef(null);

  useEffect(() => { loadArticleIndex().then(setIndex); }, []);
  useEffect(() => { topRef.current?.scrollIntoView?.({ block: 'start' }); }, [source, article]);
  const toggleSave = useCallback(id => {
    setSaved(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      lsSet(SAVED_KEY, [...n]);
      return n;
    });
  }, []);

  const counts = useMemo(() => {
    const c = {};
    for (const a of index || []) c[a.sourceId] = (c[a.sourceId] || 0) + 1;
    return c;
  }, [index]);
  const bySource = useMemo(() => (source ? (index || []).filter(a => a.sourceId === source.id) : []), [index, source]);

  return (
    <div ref={topRef} className="flex min-h-full flex-col">
      {article ? (
        <Reader meta={article} saved={saved} onToggleSave={toggleSave} onBack={() => setArticle(null)} onSaveWord={onSaveWord} />
      ) : source ? (
        index ? <NewspaperHome source={source} articles={bySource} saved={saved} onToggleSave={toggleSave} onOpen={setArticle} onBack={() => setSource(null)} />
          : <div className="grid flex-1 place-items-center p-20"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <Portal onBack={onBack} counts={counts} onPick={setSource} />
      )}
    </div>
  );
}
