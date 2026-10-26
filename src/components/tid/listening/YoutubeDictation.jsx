// "Luyện dictation video YouTube" — site: /practice/speaking/shadowing?mode=dictation (library) and the per-video
// dictation player. Uses captions saved locally; the video itself streams from YouTube.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock, Keyboard, Search, X } from 'lucide-react';
import DictationCore from './DictationCore';
import { loadYoutube, loadYoutubeIndex } from './data';

// ---- YouTube IFrame API loader ----
let ytApi;
function loadYtApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApi) return ytApi;
  ytApi = new Promise(resolve => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return ytApi;
}

/** Media controller that plays caption segments [start,end) of a YouTube video. */
function useYoutubeMedia(youtubeId, segments) {
  const host = useRef(null);
  const player = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [rate, setRateState] = useState(1);
  const [time, setTime] = useState(0);
  const [allIndex, setAllIndex] = useState(null);
  const seg = useRef({ i: 0, chain: false, continuous: false });
  const pending = useRef(null);

  const playSeg = useCallback((i, chain = false, continuous = false) => {
    const p = player.current;
    const s = segments[i];
    if (!s) return;
    seg.current = { i, chain, continuous };
    if (!p || !ready) { pending.current = i; return; }
    p.seekTo(s.start, true);
    p.playVideo();
  }, [segments, ready]);

  useEffect(() => {
    let off = false;
    loadYtApi().then(YT => {
      if (off || !host.current) return;
      player.current = new YT.Player(host.current, {
        videoId: youtubeId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, cc_load_policy: 0, iv_load_policy: 3 },
        events: {
          onReady: () => { if (!off) setReady(true); },
          onStateChange: e => setPlaying(e.data === 1),
        },
      });
    });
    return () => { off = true; try { player.current?.destroy(); } catch { /* ignore */ } };
  }, [youtubeId]);

  useEffect(() => {
    if (ready && pending.current !== null) { const i = pending.current; pending.current = null; playSeg(i, seg.current.chain, seg.current.continuous); }
  }, [ready, playSeg]);

  // Poll position to stop at the segment end (YT has no timeupdate event)
  useEffect(() => {
    if (!ready) return undefined;
    const t = setInterval(() => {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      const s = segments[seg.current.i];
      const now = p.getCurrentTime();
      setTime(Math.max(0, now - s.start));
      if (p.getPlayerState?.() === 1 && now >= s.end) {
        const c = seg.current;
        if (c.chain && c.continuous && c.i + 1 < segments.length) { setAllIndex(c.i + 1); seg.current = { ...c, i: c.i + 1 }; return; }
        p.pauseVideo();
        if (c.chain) { setAllIndex(null); seg.current.chain = false; }
      }
    }, 100);
    return () => clearInterval(t);
  }, [ready, segments]);

  const cur = segments[seg.current.i] || { start: 0, end: 0 };
  return {
    node: null,
    frame: <div className="lis-yt-frame aspect-video w-full overflow-hidden rounded-2xl bg-black"><div ref={host} /></div>,
    playing,
    rate,
    time,
    duration: Math.max(0, cur.end - cur.start),
    allIndex,
    playSentence: i => { setAllIndex(null); playSeg(i); },
    toggle: () => {
      const p = player.current;
      if (!p) return;
      if (playing) p.pauseVideo();
      else { const s = segments[seg.current.i]; if (p.getCurrentTime() >= s.end - 0.05 || p.getCurrentTime() < s.start) p.seekTo(s.start, true); p.playVideo(); }
    },
    setRate: r => { setRateState(r); player.current?.setPlaybackRate?.(r); },
    seek: t => player.current?.seekTo(cur.start + t, true),
    playFrom: (i, continuous) => { setAllIndex(i); playSeg(i, true, continuous); },
    stopAll: () => { seg.current.chain = false; setAllIndex(null); player.current?.pauseVideo?.(); },
  };
}

// Dictation challenge shape from caption text
function toChallenges(segments) {
  return segments.map(s => {
    const words = s.text.split(/\s+/).filter(Boolean);
    return { content: s.text, jsonContent: words, solution: words.map(w => [w]), translation: s.vi || undefined, audioSrc: '' };
  });
}

function VideoDictation({ video, data, onBack, onSaveWord, speechVoice }) {
  const challenges = useMemo(() => toChallenges(data.segments), [data]);
  const media = useYoutubeMedia(video.youtubeId, data.segments);
  return (
    <div className="relative">
      <DictationCore data={{ title: video.title, kicker: 'YouTube Dictation', challenges }} storageId={`yt:${video.youtubeId}`} media={{ ...media, node: null }} onBack={onBack} backLabel="Thư viện" onSaveWord={onSaveWord} speechVoice={speechVoice} />
      {/* Video floats above the sky, beside the dictation card */}
      <div className="pointer-events-auto fixed bottom-4 right-4 z-40 w-[320px] rounded-2xl bg-white p-1.5 shadow-[0_18px_40px_rgba(20,40,80,.25)] max-sm:w-[220px]">{media.frame}</div>
    </div>
  );
}

const levelTone = l => (l?.startsWith('C') ? 'bg-red-600' : l?.startsWith('B') ? 'bg-herb-600' : 'bg-blue-600');

export default function YoutubeDictation({ onBack, onSaveWord, speechVoice }) {
  const [list, setList] = useState(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => { loadYoutubeIndex().then(setList); }, []);
  useEffect(() => {
    if (!open) { setData(null); return; }
    let off = false;
    loadYoutube(open.youtubeId).then(d => { if (!off) setData(d); });
    return () => { off = true; };
  }, [open]);

  if (open) {
    if (!data) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-herb-600 border-t-transparent" /></div>;
    return <VideoDictation key={open.youtubeId} video={open} data={data} onBack={() => setOpen(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />;
  }

  const cats = list ? ['all', ...new Set(list.map(v => v.category))] : ['all'];
  const q = query.trim().toLowerCase();
  const shown = (list || []).filter(v => (cat === 'all' || v.category === cat) && (!q || v.title.toLowerCase().includes(q)));

  return (
    <div className="min-h-screen w-full bg-[#fafaf7] font-sans">
      <main className="mx-auto w-full max-w-7xl p-4 lg:p-12">
        <div className="mb-8 lg:mb-12">
          <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[2px] text-slate-400 hover:text-moss"><ArrowLeft className="h-4 w-4" />Listening Hub</button>
          <h2 className="mb-2 text-2xl font-black text-slate-800 lg:text-3xl">Luyện Dictation</h2>
          <p className="mb-6 text-sm font-medium text-slate-500 lg:text-base">Nghe từng câu trong video YouTube rồi gõ lại — chấm từng từ ngay tại chỗ.</p>
          <div className="inline-flex items-center rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
            <span className="flex items-center gap-2 rounded-xl bg-herb-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-herb-200"><Keyboard size={14} /> Dictation</span>
          </div>
        </div>
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black text-slate-800">{cat === 'all' ? 'Tất cả bài học' : cat}</h3>
            <span className="flex items-baseline gap-1 rounded-full border border-herb-200/60 bg-herb-50 px-3.5 py-1.5 text-[11px] font-bold text-herb-700 shadow-sm"><span className="text-sm font-black text-herb-600">{shown.length}</span> bài học</span>
          </div>
          <div className="relative w-full md:w-64 lg:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search size={16} className="text-slate-400" /></div>
            <input type="text" placeholder="Tìm bài học theo tên..." value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl border-2 border-black py-2 pl-10 pr-10 text-sm font-medium shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all focus:outline-none focus:ring-2 focus:ring-herb-500/20" />
            {query && <button type="button" onClick={() => setQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {cats.map(c => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-xl border-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${cat === c ? 'border-black bg-herb-600 text-white shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'border-slate-200 bg-white text-slate-500 hover:border-black'}`}>{c === 'all' ? 'Tất cả' : c}</button>
          ))}
        </div>
        {!list ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-herb-600 border-t-transparent" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map(v => (
              <button key={v.id} type="button" onClick={() => setOpen(v)} className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white text-left transition-all hover:border-herb-500/30 hover:shadow-xl hover:shadow-slate-200/50">
                <div className="relative m-2 aspect-[4/3] overflow-hidden rounded-[24px]">
                  <img src={v.thumbnail} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {v.level && <div className={`absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white ${levelTone(v.level)}`}>{v.level}</div>}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md"><Clock size={10} /> {v.duration}</div>
                </div>
                <div className="px-5 py-4 pb-6">
                  <h3 className="mb-2 line-clamp-2 h-10 text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-herb-600">{v.title}</h3>
                  <div className="text-[10px] font-bold text-slate-400">{v.segments || 0} phân đoạn</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
