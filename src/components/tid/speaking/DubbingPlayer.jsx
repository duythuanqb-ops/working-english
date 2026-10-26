// Lồng tiếng player (= theieltsdictionary.com/practice/speaking/long-tieng/<youtubeId>).
// The site's player chunk was not captured, so this is rebuilt from the catalog copy ("1 · Nghe câu gốc / 2 · Thu giọng cùng nhịp /
// 3 · 🎬 Xem lại cảnh bằng giọng bạn"), its storage scheme (dub_takes_v1_<id>, ≈9 câu / cảnh) and the catalog's visual style.
// Takes are stored locally in IndexedDB (the site uploads them to R2).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clapperboard, Mic, Square, Play, Volume2, Languages, Check, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalData, loadDubbing, compareSentence, speak } from './speakingUtils';
import { useYouTube } from './useYouTube';

const PER_SCENE = 9;
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

// ---- tiny IndexedDB blob store ----
const idb = (() => {
  let p;
  const open = () => (p ||= new Promise((res, rej) => {
    const r = indexedDB.open('tid-dubbing', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('takes');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('takes', mode); const q = fn(t.objectStore('takes')); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); }); };
  return { get: k => tx('readonly', s => s.get(k)), put: (k, v) => tx('readwrite', s => s.put(v, k)), del: k => tx('readwrite', s => s.delete(k)) };
})();

export default function DubbingPlayer({ videoId, onBack }) {
  const [subs, status] = useLocalData(() => loadDubbing(videoId), [videoId]);
  const [index] = useLocalData(() => loadDubbing('index'));
  const meta = index?.find(v => v.youtube_id === videoId);
  const segs = useMemo(() => (subs || []).map((s, i) => ({ ...s, i, end: s.start + s.dur })), [subs]);
  const scenes = useMemo(() => {
    const n = Math.max(1, Math.round(segs.length / PER_SCENE));
    const size = Math.ceil(segs.length / n) || 1;
    return Array.from({ length: n }, (_, k) => segs.slice(k * size, (k + 1) * size)).filter(s => s.length);
  }, [segs]);
  const storeKey = `dub_takes_v1_${videoId}`;
  const [takes, setTakes] = useState(() => { try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { return {}; } });
  const [urls, setUrls] = useState({});
  const [scene, setScene] = useState(0);
  const [active, setActive] = useState(0);
  const [showVi, setShowVi] = useState(false);
  const [recIdx, setRecIdx] = useState(null);
  const [live, setLive] = useState('');
  const [err, setErr] = useState('');
  const [dubbing, setDubbing] = useState(false);
  const yt = useYouTube(videoId);
  const rec = useRef({});
  const audioRef = useRef(null);
  const stopRef = useRef(null);

  const list = scenes[scene] || [];
  const recordedInScene = list.filter(s => takes[s.i]).length;
  const total = Object.keys(takes).length;

  useEffect(() => { try { localStorage.setItem(storeKey, JSON.stringify(takes)); } catch { /* full */ } }, [takes, storeKey]);
  // load blobs for the visible scene
  useEffect(() => {
    let off = false;
    list.forEach(s => {
      const t = takes[s.i];
      if (!t || urls[s.i]) return;
      idb.get(t.audioKey).then(b => { if (!off && b) setUrls(u => ({ ...u, [s.i]: URL.createObjectURL(b) })); }).catch(() => {});
    });
    return () => { off = true; };
  }, [list, takes]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAll = useCallback(() => { stopRef.current?.(); stopRef.current = null; setDubbing(false); yt.pause(); yt.mute(false); audioRef.current?.pause(); }, [yt]);

  // play one original sentence, then pause
  const playOriginal = useCallback(s => {
    stopAll();
    setActive(s.i);
    yt.seek(s.start); yt.play();
    const iv = setInterval(() => { if (yt.time() >= s.end - 0.05) { clearInterval(iv); yt.pause(); } }, 80);
    stopRef.current = () => clearInterval(iv);
  }, [yt, stopAll]);

  const playTake = useCallback(i => {
    const a = audioRef.current;
    if (!a || !urls[i]) return;
    a.src = urls[i]; a.currentTime = 0; a.play().catch(() => {});
  }, [urls]);

  // record "cùng nhịp": the original line is muted & replayed so you can follow the lips; auto-stops after the line's length
  const startRec = useCallback(async s => {
    stopAll(); setErr(''); setLive('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
      const r = { chunks: [], text: '', idx: s.i };
      rec.current = r;
      const mr = new MediaRecorder(stream);
      r.mr = mr;
      mr.ondataavailable = e => e.data.size && r.chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearTimeout(r.timer); clearInterval(r.iv);
        try { r.sr?.stop(); } catch { /* noop */ }
        yt.pause(); yt.mute(false);
        setRecIdx(null);
        const blob = new Blob(r.chunks, { type: mr.mimeType || 'audio/webm' });
        if (blob.size < 1000) { setErr('Mình chưa nghe được giọng của bạn 🎤 Thử thu lại to, rõ hơn nhé!'); return; }
        const key = `${videoId}:${s.i}`;
        await idb.put(key, blob).catch(() => {});
        setUrls(u => ({ ...u, [s.i]: URL.createObjectURL(blob) }));
        const score = r.text.trim() ? compareSentence(s.text, r.text).score : null;
        setTakes(t => ({ ...t, [s.i]: { audioKey: key, score, at: Date.now() } }));
      };
      setRecIdx(s.i); setActive(s.i);
      yt.mute(true); yt.seek(s.start); yt.play();
      mr.start();
      if (SR) {
        const sr = new SR();
        sr.lang = 'en-US'; sr.continuous = true; sr.interimResults = true;
        sr.onresult = e => { let t = ''; for (let k = 0; k < e.results.length; k++) t += e.results[k][0].transcript; r.text = t; setLive(t); };
        sr.onerror = () => {};
        r.sr = sr;
        try { sr.start(); } catch { /* noop */ }
      }
      r.iv = setInterval(() => { if (yt.time() >= s.end) yt.pause(); }, 80);
      r.timer = setTimeout(() => { try { mr.state !== 'inactive' && mr.stop(); } catch { /* noop */ } }, (s.dur + 1.5) * 1000);
    } catch {
      setErr('Không thể truy cập Micro. Vui lòng kiểm tra quyền thiết bị.');
    }
  }, [yt, videoId, stopAll]);
  const stopRec = () => { try { rec.current.mr?.state !== 'inactive' && rec.current.mr?.stop(); } catch { /* noop */ } };
  useEffect(() => () => { const r = rec.current; if (r.mr) { r.mr.onstop = null; try { r.mr.stop(); r.mr.stream?.getTracks().forEach(t => t.stop()); } catch { /* noop */ } } stopRef.current?.(); }, []);

  const removeTake = i => {
    idb.del(`${videoId}:${i}`).catch(() => {});
    setTakes(t => { const n = { ...t }; delete n[i]; return n; });
    setUrls(u => { const n = { ...u }; delete n[i]; return n; });
  };

  // 🎬 replay the scene: video muted on lines you recorded (your take plays instead), original sound elsewhere
  const playScene = useCallback(() => {
    if (!list.length) return;
    stopAll();
    setDubbing(true);
    const first = list[0], last = list[list.length - 1];
    let fired = -1;
    yt.seek(first.start); yt.play();
    const iv = setInterval(() => {
      const t = yt.time();
      const cur = list.find(s => t >= s.start - 0.05 && t < s.end);
      if (cur && cur.i !== fired) {
        fired = cur.i;
        setActive(cur.i);
        if (urls[cur.i]) { yt.mute(true); playTake(cur.i); } else yt.mute(false);
      }
      if (t >= last.end + 0.3) { clearInterval(iv); yt.pause(); yt.mute(false); setDubbing(false); }
    }, 60);
    stopRef.current = () => clearInterval(iv);
  }, [list, yt, urls, playTake, stopAll]);

  if (status === 'error' || (status === 'ready' && !segs.length)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#fafaf7] p-10 text-center text-[#1E3006]">
        <div className="text-5xl">🎬</div>
        <h2 className="text-2xl font-black">{meta?.title || videoId}</h2>
        <p className="max-w-md text-sm font-medium text-slate-500">Bài này chưa có phụ đề trong bản offline (phụ đề được tạo trên máy chủ TID). Hãy chọn một bài khác nhé.</p>
        <button onClick={onBack} className="rounded-xl border-2 border-black bg-white px-5 py-2.5 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)]">← Lồng tiếng</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1E3006]">
      <audio ref={audioRef} className="hidden" />
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button onClick={() => { stopAll(); onBack(); }} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1E3006]"><ArrowLeft size={16} /> Lồng tiếng</button>
          <span className="ml-auto inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-700"><Clapperboard size={14} /> Chế độ mới · Speaking</span>
        </div>
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <span className="rounded-md border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{meta?.level || 'B2'}</span>
          <h1 className="min-w-0 flex-1 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{meta?.title || videoId}</h1>
          <span className="text-xs font-bold text-slate-500">{segs.length} câu · {scenes.length} cảnh · <span className="text-[#6A8042]">đã thu {total}</span></span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="lg:sticky lg:top-4">
              <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-black bg-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
                <div ref={yt.hostRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
                {!yt.ready && <div className="absolute inset-0 flex items-center justify-center text-white"><Loader2 className="animate-spin" size={32} /></div>}
                {dubbing && <span className="absolute left-3 top-3 rounded-full border-2 border-black bg-[#FFE787] px-3 py-1 text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,1)]">🎬 Đang phát bằng giọng bạn</span>}
              </div>
              <div className="mt-4 rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Cảnh {scene + 1} / {scenes.length}</span>
                  <div className="flex gap-2">
                    <button disabled={scene === 0} onClick={() => { stopAll(); setScene(s => s - 1); }} className="grid h-8 w-8 place-items-center rounded-lg border-2 border-black bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button disabled={scene >= scenes.length - 1} onClick={() => { stopAll(); setScene(s => s + 1); }} className="grid h-8 w-8 place-items-center rounded-lg border-2 border-black bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scenes.map((sc, k) => {
                    const done = sc.filter(s => takes[s.i]).length;
                    return (
                      <button key={k} onClick={() => { stopAll(); setScene(k); }} title={`${done}/${sc.length} câu đã thu`}
                        className={`h-8 min-w-8 rounded-lg border-2 px-2 text-xs font-black transition-all ${k === scene ? 'border-black bg-[#1E3006] text-white' : done === sc.length ? 'border-[#6A8042] bg-[#6A8042]/15 text-[#4c5729]' : done ? 'border-black bg-[#FFE787]' : 'border-slate-200 bg-white text-slate-500 hover:border-black'}`}>
                        {k + 1}
                      </button>
                    );
                  })}
                </div>
                <button onClick={dubbing ? stopAll : playScene} disabled={!recordedInScene && !dubbing}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#FFE787] py-3 text-sm font-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                  {dubbing ? <><Square size={16} /> Dừng</> : <>🎬 Xem lại cảnh bằng giọng bạn</>}
                </button>
                <p className="mt-2 text-center text-[11px] font-bold text-slate-400">{recordedInScene}/{list.length} câu trong cảnh đã thu — câu chưa thu sẽ phát tiếng gốc.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="border-2 border-black bg-[#cde088] px-3 py-1 text-lg font-black uppercase tracking-tighter shadow-[3px_3px_0_rgba(0,0,0,1)]">Cảnh {scene + 1}</h2>
              <button onClick={() => setShowVi(v => !v)} className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-black transition-all ${showVi ? 'border-black bg-[#1E3006] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-black'}`}><Languages size={14} /> Dịch nghĩa</button>
            </div>
            {err && <div className="mb-3 rounded-xl border-2 border-[#e98b86] bg-[#fbeceb] px-4 py-2.5 text-sm font-bold text-[#c0392b]">{err}</div>}
            <div className="space-y-3">
              {list.map(s => {
                const t = takes[s.i], isRec = recIdx === s.i;
                return (
                  <div key={s.i} onClick={() => setActive(s.i)} className={`rounded-2xl border-2 bg-white p-4 transition-all ${active === s.i ? 'border-black shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'border-slate-200'}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-black text-slate-400">#{s.i + 1}</span>
                      {s.speaker && <span className="rounded-md border border-black bg-[#FFE787] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">{s.speaker}</span>}
                      <span className="text-[10px] font-bold text-slate-400">{s.dur.toFixed(1)}s</span>
                      {t && <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-black text-[#6A8042]"><Check size={13} /> Đã thu{typeof t.score === 'number' && ` · ${t.score}%`}</span>}
                    </div>
                    <p className="font-bold leading-snug">{s.text}</p>
                    {s.ipa && active === s.i && <p className="mt-1 font-mono text-xs text-slate-500">{s.ipa}</p>}
                    {showVi && s.vi && <p className="mt-1.5 text-sm font-medium text-slate-500">{s.vi}</p>}
                    {isRec && <p className="mt-2 text-sm italic text-slate-500">{live ? `“${live}”` : 'Đang nghe…'}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={e => { e.stopPropagation(); playOriginal(s); }} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-black hover:bg-slate-50"><Play size={13} /> Câu gốc</button>
                      <button onClick={e => { e.stopPropagation(); speak(s.text, 'British'); }} title="Nghe giọng đọc chậm (TTS)" className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-500 hover:border-black"><Volume2 size={13} /></button>
                      {isRec ? (
                        <button onClick={e => { e.stopPropagation(); stopRec(); }} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#E8505B] px-3 py-1.5 text-xs font-black text-white"><Square size={13} /> Dừng thu</button>
                      ) : (
                        <button disabled={recIdx !== null} onClick={e => { e.stopPropagation(); startRec(s); }} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#1E3006] px-3 py-1.5 text-xs font-black text-white hover:bg-[#2c4410] disabled:opacity-40"><Mic size={13} /> {t ? 'Thu lại' : 'Thu giọng'}</button>
                      )}
                      {t && urls[s.i] && <button onClick={e => { e.stopPropagation(); playTake(s.i); }} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#6A8042] bg-[#6A8042]/10 px-3 py-1.5 text-xs font-black text-[#4c5729]"><Play size={13} /> Bản thu</button>}
                      {t && <button onClick={e => { e.stopPropagation(); removeTake(s.i); }} title="Xoá bản thu" className="inline-flex items-center rounded-lg border-2 border-slate-200 px-2 py-1.5 text-xs font-black text-slate-400 hover:border-black"><RotateCcw size={13} /></button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
