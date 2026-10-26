// Lồng tiếng catalog (= theieltsdictionary.com/practice/speaking/long-tieng), copied from chunk 3m6dmdtu5zo7v.js.
import React, { useMemo } from 'react';
import { ArrowLeft, Clapperboard, Loader2 } from 'lucide-react';
import { useLocalData, loadDubbing } from './speakingUtils';

const SECTIONS = [
  { category: 'Real Easy English', title: 'Real Easy English', blurb: 'Hội thoại BBC ngắn, hai người nói chậm và rõ — dễ nhập vai nhất.', accent: '#FFE787' },
  { category: 'BBC Learning English', title: 'BBC Learning English', blurb: '6 Minute English và các chương trình hội thoại của BBC.', accent: '#cde088' },
  { category: 'TED-Ed', title: 'TED-Ed', blurb: 'Bài giảng hoạt hình — bạn là người dẫn chuyện.', accent: '#ff9eb5' },
];

// Number of recorded takes per video, from the player's localStorage (dub_takes_v<N>_<youtubeId>)
export function readTakeCounts() {
  const m = new Map();
  try {
    for (const k of Object.keys(localStorage)) {
      const r = k.match(/^dub_takes_v\d+_(.+)$/);
      if (!r) continue;
      const n = Object.values(JSON.parse(localStorage.getItem(k) || '{}')).filter(e => typeof e?.audioKey === 'string').length;
      m.set(r[1], Math.max(m.get(r[1]) || 0, n));
    }
  } catch { /* storage blocked */ }
  return m;
}

export default function Dubbing({ onBack, onOpen }) {
  const [list, status] = useLocalData(() => loadDubbing('index'));
  const takes = useMemo(() => readTakeCounts(), []);
  const groups = useMemo(() => {
    const g = new Map();
    for (const v of [...(list || [])].sort((a, b) => a.title.localeCompare(b.title))) {
      if (!v.youtube_id) continue;
      g.set(v.category || '', [...(g.get(v.category || '') || []), v]);
    }
    return g;
  }, [list]);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1E3006]">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1E3006]"><ArrowLeft size={16} /> Speaking</button>
        <div className="relative mb-10 overflow-hidden rounded-[28px] border-2 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, #1E3006 28px, #1E3006 30px)' }} />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-700"><Clapperboard size={14} /> Chế độ mới · Speaking</div>
              <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">Lồng tiếng</h1>
              <p className="mt-4 max-w-xl font-newsreader text-lg italic text-slate-600">Thu giọng từng câu, rồi xem lại video với chính giọng của bạn thay cho nhân vật. Mỗi bài chia thành các cảnh ngắn — thu xong một cảnh là xem được ngay.</p>
            </div>
            <ol className="space-y-1.5 text-sm font-bold text-slate-700 md:text-right">
              <li>1 · Nghe câu gốc</li>
              <li>2 · Thu giọng cùng nhịp</li>
              <li>3 · 🎬 Xem lại cảnh bằng giọng bạn</li>
            </ol>
          </div>
        </div>
        {status === 'loading' && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6A8042]" size={40} /></div>}
        {status === 'error' && <p className="text-center font-bold text-[#c0392b]">Không tải được danh sách. Bạn thử lại sau nhé.</p>}
        {status === 'ready' && SECTIONS.map(sec => {
          const items = groups.get(sec.category) || [];
          if (!items.length) return null;
          return (
            <section key={sec.category} className="mb-12">
              <div className="mb-5 flex flex-wrap items-end gap-4">
                <h2 className="border-2 border-black px-3 py-1 text-2xl font-black uppercase tracking-tighter shadow-[3px_3px_0_rgba(0,0,0,1)] sm:text-3xl" style={{ background: sec.accent }}>{sec.title}</h2>
                <p className="text-sm font-medium text-slate-600">{sec.blurb} <span className="text-slate-400">· {items.length} bài</span></p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(v => {
                  const n = Number(v.segments) || 0, done = takes.get(v.youtube_id) || 0;
                  const scenes = n ? Math.max(1, Math.round(n / 9)) : null;
                  return (
                    <button key={v.youtube_id} onClick={() => onOpen(v.youtube_id)} className="group flex flex-col overflow-hidden rounded-2xl border-2 border-black bg-white text-left shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]">
                      <div className="relative aspect-video overflow-hidden border-b-2 border-black bg-slate-100">
                        <img src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                        <span className="absolute left-2 top-2 rounded-md border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{v.level || 'B2'}</span>
                        {done > 0 && n > 0 && done >= n && <span className="absolute right-2 top-2 rounded-md bg-[#6A8042] px-2 py-0.5 text-[10px] font-black text-white">✓ Hoàn thành</span>}
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full border-2 border-black bg-[#FFE787] px-4 py-1.5 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)]">🎬 Lồng tiếng</span>
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <h3 className="line-clamp-2 font-black leading-snug">{v.title || v.youtube_id}</h3>
                        <div className="mt-auto text-xs font-bold text-slate-500">
                          {n ? `${n} câu` : '—'}{scenes ? ` · ≈${scenes} cảnh` : ''}
                          {done > 0 && <span className="text-[#6A8042]"> · đã thu {done}</span>}
                          {!v.hasSubs && <span className="text-amber-600"> · chưa có phụ đề offline</span>}
                        </div>
                        {done > 0 && n > 0 && <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-[#6A8042]" style={{ width: `${Math.min(100, done / n * 100)}%` }} /></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
