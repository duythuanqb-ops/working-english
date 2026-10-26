// Card Blast — words fall, type the answer to shoot them down (rules, ranks, copy and colours from the site's blast module).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, X } from 'lucide-react';
import { gloss } from './decks';
import { getSetting, logActivity, setSetting } from './store';
import { WatchingSun } from './fcParts';

const HINT_LETTERS = { easy: 2, normal: 1, hard: 0 };
const SPEEDS = [{ id: 1, label: 'Rất chậm', mult: 0.55 }, { id: 2, label: 'Chậm', mult: 0.75 }, { id: 3, label: 'Vừa', mult: 1 }, { id: 4, label: 'Nhanh', mult: 1.35 }, { id: 5, label: 'Rất nhanh', mult: 1.8 }];
const STREAK_STEP = 5;
const RANKS = [
  { min: 0, name: 'Tân binh', emoji: '🌱', color: '#8BA6CA', note: 'Mới nhập môn — chơi thêm vài ván nữa nhé!' },
  { min: 5, name: 'Xạ thủ tập sự', emoji: '🎯', color: '#7BC97B', note: 'Tay đã quen phím rồi đấy.' },
  { min: 15, name: 'Xạ thủ', emoji: '🔫', color: '#4ADE80', note: 'Gõ nhanh và chắc — giữ nhịp này.' },
  { min: 30, name: 'Thiện xạ', emoji: '⭐', color: '#F6C453', note: 'Từ vựng bật ra gần như không cần nghĩ.' },
  { min: 50, name: 'Bắn tỉa', emoji: '🏆', color: '#ED7A13', note: 'Rất ít người đi được tới đây.' },
  { min: 80, name: 'Huyền thoại', emoji: '👑', color: '#E142F4', note: 'Đẳng cấp huyền thoại. Thử mức Siêu khó xem sao?' },
];
const rankFor = n => [...RANKS].reverse().find(r => n >= r.min) ?? RANKS[0];
const nextRank = n => { const r = RANKS.find(x => n < x.min); return r ? { rank: r, remaining: r.min - n } : null; };

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const SPLIT = /[,;/|]|\bhoặc\b/i;
const hintCells = (answer, n) => {
  if (n <= 0) return [];
  let k = 0;
  return Array.from(answer.trim()).slice(0, 22).map(ch => (ch === ' ' ? ' ' : k < n ? (k++, ch) : ''));
};
const DIFFS = ['easy', 'normal', 'hard'].map(id => {
  const n = HINT_LETTERS[id];
  const cells = hintCells('improve', n);
  return { id, label: id === 'easy' ? 'Dễ' : id === 'normal' ? 'Bình thường' : 'Siêu khó', desc: n > 0 ? `Hé ${n} chữ đầu` : 'Không gợi ý gì', sample: cells.length ? cells.map(c => (c === '' ? '_' : c)).join(' ') : 'không có ô nào' };
});

function buildPool(words, dir, diff) {
  const h = HINT_LETTERS[diff] ?? 1;
  const out = [];
  words.forEach((w, i) => {
    const word = (w.w || '').trim();
    const g = gloss(w).trim();
    if (!word || !g) return;
    const prompt = dir === 'vi_en' ? g : word;
    const src = dir === 'vi_en' ? word : g;
    const acc = new Set();
    const add = x => { const v = norm(x); if (v) acc.add(v); };
    const variants = x => { add(x); const t = x.replace(/\([^)]*\)/g, ' '); add(t); add(t.replace(/^(to|the|a|an)\s+/i, '')); add(t.replace(/^(sự|việc|cái|người|điều|những|các)\s+/i, '')); };
    variants(src);
    src.split(SPLIT).forEach(variants);
    const pieces = src.split(SPLIT).map(x => x.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    const answer = dir === 'vi_en' ? src : pieces.length ? pieces.reduce((a, b) => (b.length < a.length ? b : a)) : src;
    out.push({ id: String(i), prompt, answer, accepts: [...acc], hint: hintCells(answer, h) });
  });
  return out;
}

const Stars = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[['10%', '15%', 14, 3, 0], ['25%', '30%', 10, 4, 1], ['15%', '60%', 18, 3.5, 0.5], ['40%', '80%', 12, 4.5, 2], ['65%', '75%', 16, 3, 1.5], ['80%', '40%', 10, 5, 0.8], ['55%', '20%', 14, 4, 2.5], ['30%', '45%', 12, 3.2, 1.2], ['75%', '85%', 14, 3.8, 0.3], ['50%', '65%', 10, 4.2, 1.8]].map(([top, left, size, dur, delay], i) => (
      <svg key={i} viewBox="0 0 24 24" style={{ position: 'absolute', top, left, width: size, height: size, animation: `tidTwinkle ${dur}s ease-in-out ${delay}s infinite` }}>
        <path d="M12 0C12.7 6.4 17.6 11.3 24 12 17.6 12.7 12.7 17.6 12 24 11.3 17.6 6.4 12.7 0 12 6.4 11.3 11.3 6.4 12 0Z" fill="#EAF1FF" />
      </svg>
    ))}
  </div>
);
const btnDark = { border: '1px solid #1E3A5F', background: '#132A54', color: '#8BA6CA' };
const opt = on => ({ background: on ? '#1D3A78' : '#0F1F45', border: on ? '2px solid #F6C453' : '2px solid #1E3A5F' });

function SpeedPicker({ speed, onSpeed, compact }) {
  return (
    <div className={compact ? 'w-full max-w-[360px]' : 'mb-6 w-full max-w-[560px]'}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-black tracking-[.14em] text-[#5F7AA8]">TỐC ĐỘ RƠI</span>
        <span className="text-[11.5px] font-black text-[#F6C453]">{SPEEDS.find(s => s.id === speed)?.label}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SPEEDS.map(({ id, label }) => (
          <button key={id} type="button" title={label} onMouseDown={e => e.preventDefault()} onClick={() => onSpeed(id)} className="flex flex-col items-center justify-end gap-[5px] rounded-[12px] pb-[7px] pt-2 transition-all" style={opt(speed === id)}>
            <span className="block w-[7px] rounded-full" style={{ height: 6 + 3.5 * id, background: speed === id ? '#F6C453' : '#40608F' }} />
            <span className="text-[10.5px] font-black leading-none" style={{ color: speed === id ? '#F6C453' : '#5F7AA8' }}>{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Blast({ words, full, onToggleFull, onExit }) {
  const [dir, setDir] = useState(() => getSetting('blast_dir', 'vi_en'));
  const [diff, setDiff] = useState(() => getSetting('blast_diff', 'normal'));
  const [speed, setSpeed] = useState(() => getSetting('blast_speed', 3));
  const [record, setRecord] = useState(() => getSetting('blast_record', 0));
  const [playing, setPlaying] = useState(false);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [booms, setBooms] = useState([]);
  const [typed, setTyped] = useState('');
  const [stats, setStats] = useState({ score: 0, hits: 0, streak: 0, best: 0, lives: 3 });
  const [missed, setMissed] = useState([]);
  const [flash, setFlash] = useState(null);
  const [noMatch, setNoMatch] = useState(false);
  const inputRef = useRef(null);
  const st = useRef({ items: [], last: 0, spawnIn: 0, queue: [], lives: 3 });
  const pool = useMemo(() => buildPool(words, dir, diff), [words, dir, diff]);
  const level = Math.floor(stats.hits / 8) + 1;
  const mult = SPEEDS.find(s => s.id === speed)?.mult ?? 1;
  const save = (k, v, set) => { set(v); setSetting(k, v); };

  const start = () => {
    if (!pool.length) return;
    st.current = { items: [], last: 0, spawnIn: 0, queue: [], lives: 3 };
    setItems([]); setMissed([]); setFlash(null); setTyped(''); setStats({ score: 0, hits: 0, streak: 0, best: 0, lives: 3 });
    setOver(false); setPaused(false); setPlaying(true); setCount(3);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  useEffect(() => { if (count <= 0) return; const t = setTimeout(() => setCount(c => c - 1), 750); return () => clearTimeout(t); }, [count]);

  const running = playing && !over && !paused && count === 0;
  // ---- game loop ----
  useEffect(() => {
    if (!running) return;
    let raf;
    const s = st.current;
    s.last = performance.now();
    const fall = 10500 / (mult * (1 + 0.09 * (level - 1))); // ms from top to bottom
    const maxOn = Math.min(6, 2 + Math.floor(level / 2));
    const tick = now => {
      const dt = Math.min(64, now - s.last);
      s.last = now;
      s.spawnIn -= dt;
      if (s.spawnIn <= 0 && s.items.length < maxOn) {
        if (!s.queue.length) s.queue = [...pool].sort(() => Math.random() - 0.5);
        const p = s.queue.pop();
        const used = s.items.map(i => i.x);
        let x = 8 + Math.random() * 74;
        for (let k = 0; k < 6 && used.some(u => Math.abs(u - x) < 16); k++) x = 8 + Math.random() * 74;
        s.items.push({ ...p, key: `${p.id}-${now}`, x, y: 0 });
        s.spawnIn = (fall / maxOn) * (0.75 + Math.random() * 0.5);
      }
      const escaped = [];
      s.items.forEach(it => { it.y += dt / fall; });
      s.items = s.items.filter(it => (it.y >= 1 ? (escaped.push(it), false) : true));
      if (escaped.length) {
        s.lives = Math.max(0, s.lives - escaped.length);
        setMissed(m => [...m, ...escaped.filter(e => !m.some(x => x.prompt === e.prompt)).map(e => ({ prompt: e.prompt, answer: e.answer }))]);
        setFlash({ ok: false, prompt: escaped[0].prompt, answer: escaped[0].answer });
        setStats(v => ({ ...v, streak: 0, lives: s.lives }));
        if (s.lives === 0) { setOver(true); logActivity(); }
      }
      setItems([...s.items]);
      if (s.lives > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, pool, mult, level]);

  // ---- typing: a match shoots the word, a dead prefix clears the box ----
  const aim = useMemo(() => {
    const t = norm(typed);
    if (!t) return null;
    let best = null;
    items.forEach(it => it.accepts.forEach(a => { if (a.length >= t.length && a.startsWith(t)) { const r = t.length / a.length; if (!best || r > best.r) best = { key: it.key, r, answer: it.answer }; } }));
    return best;
  }, [typed, items]);
  useEffect(() => {
    if (!running) return;
    const t = norm(typed);
    if (!t) return;
    const hit = st.current.items.find(it => it.accepts.includes(t));
    if (hit) {
      st.current.items = st.current.items.filter(i => i !== hit);
      setItems([...st.current.items]);
      setBooms(b => [...b, { key: hit.key, x: hit.x, y: hit.y }]);
      setTimeout(() => setBooms(b => b.filter(x => x.key !== hit.key)), 500);
      setTyped('');
      setFlash({ ok: true, prompt: hit.prompt, answer: hit.answer });
      setStats(v => {
        const streak = v.streak + 1;
        const best = Math.max(v.best, streak);
        if (best > record) save('blast_record', best, setRecord);
        return { ...v, streak, best, hits: v.hits + 1, score: v.score + 10 * Math.min(5, 1 + Math.floor(streak / STREAK_STEP)) };
      });
    }
  }, [typed, running]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!running || !typed.trim() || aim) { setNoMatch(false); return; }
    const a = setTimeout(() => setNoMatch(true), 220);
    const b = setTimeout(() => { setTyped(''); setNoMatch(false); }, 800);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [typed, aim, running]);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 2500); return () => clearTimeout(t); }, [flash]);

  // Esc = pause; any key focuses the input; pause when the window loses focus
  useEffect(() => {
    if (!playing || over) return;
    const k = e => {
      if (e.key === 'Escape') { e.preventDefault(); setPaused(p => !p); return; }
      if (paused) { setPaused(false); inputRef.current?.focus(); return; }
      if (document.activeElement !== inputRef.current && e.key.length === 1 && !e.metaKey && !e.ctrlKey) inputRef.current?.focus();
    };
    const blur = () => setPaused(true);
    window.addEventListener('keydown', k);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', k); window.removeEventListener('blur', blur); };
  }, [playing, over, paused]);

  const Corner = (
    <>
      <button type="button" onClick={onToggleFull} title={full ? 'Thoát toàn màn hình' : 'Toàn màn hình'} className="pointer-events-auto absolute right-[70px] top-[14px] z-[40] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[12px] transition-colors" style={btnDark}>{full ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
      <button type="button" onClick={onExit} title="Quay lại lật thẻ" className="pointer-events-auto absolute right-[22px] top-[14px] z-[40] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[12px] transition-colors" style={btnDark}><X size={18} /></button>
    </>
  );
  const dirLabel = dir === 'vi_en';
  const rank = rankFor(stats.hits);
  const nr = nextRank(stats.hits);

  return (
    <div className={`td-pop relative overflow-hidden ${full ? 'min-h-[calc(100vh-180px)]' : 'min-h-[680px]'} rounded-[26px] text-white @min-[700px]:rounded-[30px]`} style={{ background: '#070F26' }}>
      {Corner}
      {!playing ? (
        <div className="absolute inset-0 overflow-y-auto">
          <Stars />
          <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-8 py-12 text-center">
            <div className="mb-1"><WatchingSun size={110} /></div>
            <h2 className="font-[family-name:var(--font-nunito)] text-[32px] font-black text-white">Card Blast</h2>
            <p className="mb-7 mt-2 max-w-[520px] text-[15px] leading-relaxed text-[#8BA6CA]">Chữ rơi từ trên xuống — <strong className="text-[#E6EDFF]">gõ đáp án</strong> là tàu tự bắn hạ. Để lọt một từ xuống đáy là mất một mạng.</p>
            <div className="mb-6 grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
              {[['vi_en', 'Việt → Anh', 'Nghĩa rơi xuống · gõ từ tiếng Anh'], ['en_vi', 'Anh → Việt', 'Từ rơi xuống · gõ nghĩa tiếng Việt']].map(([id, t, d]) => (
                <button key={id} type="button" onClick={() => save('blast_dir', id, setDir)} className="rounded-[18px] px-4 py-3 text-left transition-all" style={opt(dir === id)}>
                  <div className="font-[family-name:var(--font-nunito)] text-[16px] font-black" style={{ color: dir === id ? '#F6C453' : '#E6EDFF' }}>{t}</div>
                  <div className="mt-[2px] text-[12.5px] font-bold text-[#8BA6CA]">{d}</div>
                </button>
              ))}
            </div>
            <div className="mb-6 w-full max-w-[560px]">
              <div className="mb-2 text-left text-[10px] font-black tracking-[.14em] text-[#5F7AA8]">MỨC ĐỘ</div>
              <div className="grid grid-cols-3 gap-3">
                {DIFFS.map(d => (
                  <button key={d.id} type="button" onClick={() => save('blast_diff', d.id, setDiff)} className="rounded-[18px] px-3 py-3 text-left transition-all" style={opt(diff === d.id)}>
                    <div className="font-[family-name:var(--font-nunito)] text-[15px] font-black" style={{ color: diff === d.id ? '#F6C453' : '#E6EDFF' }}>{d.label}</div>
                    <div className="mt-[2px] text-[11.5px] font-bold text-[#8BA6CA]">{d.desc}</div>
                    <div className="mt-[6px] whitespace-nowrap text-[11px] font-black tracking-[.08em]" style={{ color: diff === d.id ? '#F6C453' : '#40608F' }}>{d.sample}</div>
                  </button>
                ))}
              </div>
            </div>
            <SpeedPicker speed={speed} onSpeed={v => save('blast_speed', v, setSpeed)} />
            <button type="button" onClick={start} disabled={!pool.length} className="w-full max-w-[400px] rounded-full bg-[#4353FF] px-12 py-3 text-[17px] font-black text-white shadow-[0_4px_14px_0_rgba(67,83,255,0.39)] transition-all hover:bg-[#3242E6] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">Chơi</button>
            {pool.length
              ? <p className="mt-4 text-[12.5px] font-bold text-[#5F7AA8]">{pool.length} từ trong bộ · 3 mạng · nhanh dần theo cấp</p>
              : <p className="mt-4 max-w-[420px] text-[13px] font-bold text-[#FCA5A5]">Bộ thẻ này chưa có nghĩa tiếng Việt nên chưa chơi được — chọn bộ thẻ khác nhé.</p>}
            <ul className="mt-7 max-w-[430px] space-y-[6px] text-left text-[13px] font-bold text-[#8BA6CA]">
              <li>⌨️ Gõ đáp án rồi thôi — không cần bấm Enter, khớp là bắn.</li>
              <li>🇻🇳 Chiều Anh → Việt gõ <strong className="text-[#E6EDFF]">không dấu</strong> vẫn tính (“cai thien” = “cải thiện”).</li>
              <li>🎯 Từ đang gõ dở sáng vàng kèm vạch tiến độ — nhìn vào đó để biết mình đang ngắm viên nào.</li>
              <li>🔤 Hàng ô trống dưới mỗi chữ cho biết đáp án dài mấy ký tự (trừ mức Siêu khó).</li>
              <li>⏸️ Bấm <strong className="text-[#E6EDFF]">Esc</strong> để tạm dừng — chỉnh lại tốc độ ngay giữa ván, không mất mạng.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex h-[62px] shrink-0 items-center gap-6 pl-6 pr-[122px]" style={{ background: '#0B1B3D', borderBottom: '1px solid #1E3A5F' }}>
            <div><div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">ĐIỂM</div><div className="text-[21px] font-black leading-none text-[#F6C453]">{stats.score}</div></div>
            <div><div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">CẤP</div><div className="text-[21px] font-black leading-none text-[#8A8AF6]">{level}</div></div>
            <div>
              <div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">CHUỖI{record > 0 && <span className="text-[#40608F]"> · KỶ LỤC {record}</span>}</div>
              <div className="flex items-baseline gap-[6px]">
                <div className="text-[21px] font-black leading-none" style={{ color: stats.streak >= STREAK_STEP ? '#4ADE80' : '#E6EDFF' }}>{stats.streak >= STREAK_STEP ? '🔥' : ''}{stats.streak}</div>
                <span className="text-[10px] font-black text-[#5F7AA8]">liên tục</span>
                {stats.streak >= STREAK_STEP && <span className="rounded-full px-[6px] py-[2px] text-[10.5px] font-black" style={{ background: 'rgba(74,222,128,.16)', color: '#4ADE80' }}>x{Math.min(5, 1 + Math.floor(stats.streak / STREAK_STEP))}</span>}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden rounded-full px-[9px] py-[4px] text-[10px] font-black tracking-[.1em] lg:inline" style={{ background: '#132A54', color: '#8BA6CA' }}>{DIFFS.find(d => d.id === diff)?.label.toUpperCase()} · TỐC ĐỘ {speed}</span>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setPaused(p => !p)} title={paused ? 'Chơi tiếp (Esc)' : 'Tạm dừng (Esc)'} className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] transition-colors" style={btnDark}>
                {paused ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}
              </button>
              <div className="flex items-center gap-[5px]">
                {[0, 1, 2].map(n => <svg key={n} width="19" height="19" viewBox="0 0 24 24" fill={n < stats.lives ? '#F56565' : 'rgba(255,255,255,.15)'}><path d="M12 21s-7.6-4.8-9.6-9.1A5.4 5.4 0 0 1 12 6.4a5.4 5.4 0 0 1 9.6 5.5C19.6 16.2 12 21 12 21Z" /></svg>)}
              </div>
            </div>
          </div>
          <div className="relative h-[4px] shrink-0 bg-[#132A54]"><div className="absolute inset-y-0 left-0 bg-[#8A8AF6] transition-all" style={{ width: `${((stats.hits % 8) / 8) * 100}%` }} /></div>
          <div className="relative flex-1 overflow-hidden" onMouseDown={e => { e.preventDefault(); inputRef.current?.focus(); }}>
            <Stars />
            {items.map(it => {
              const aimed = aim?.key === it.key;
              return (
                <div key={it.key} className="absolute -translate-x-1/2 text-center" style={{ left: `${it.x}%`, top: `calc(${it.y * 100}% - ${it.y * 70}px)` }}>
                  <div className="max-w-[240px] rounded-[14px] px-3.5 py-2 text-[15px] font-black leading-tight shadow-lg"
                    style={{ background: aimed ? '#F6C453' : '#132A54', color: aimed ? '#1b1d22' : '#EAF1FF', border: `2px solid ${aimed ? '#F6C453' : it.y > 0.75 ? '#F87171' : '#2E5AA8'}` }}>
                    {it.prompt}
                    {aimed && <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-black/20"><div className="h-full bg-[#1b1d22]" style={{ width: `${aim.r * 100}%` }} /></div>}
                  </div>
                  {it.hint.length > 0 && (
                    <div className="mt-1 flex justify-center gap-[3px]">
                      {it.hint.map((c, i) => (c === ' ' ? <span key={i} className="w-2" /> : <span key={i} className="flex h-[16px] w-[11px] items-end justify-center border-b-2 border-[#40608F] text-[11px] font-black leading-none text-[#8BA6CA]">{c}</span>))}
                    </div>
                  )}
                </div>
              );
            })}
            {booms.map(b => <span key={b.key} className="vc-boom pointer-events-none absolute h-16 w-16 -translate-x-1/2 rounded-full" style={{ left: `${b.x}%`, top: `calc(${b.y * 100}% - ${b.y * 70}px)`, background: 'radial-gradient(#F6C453,#ED7A13 55%,transparent 70%)' }} />)}
            <svg width="44" height="44" viewBox="0 0 44 44" className="absolute bottom-2 left-1/2 -translate-x-1/2" aria-hidden><path d="M22 3 L36 38 L22 30 L8 38 Z" fill="#8A8AF6" stroke="#EAF1FF" strokeWidth="2" strokeLinejoin="round" /></svg>
            {!over && count > 0 && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center" style={{ background: 'rgba(5,13,31,.7)' }}>
                <div key={count} className="td-pop font-[family-name:var(--font-nunito)] text-[86px] font-black leading-none text-[#F6C453]">{count}</div>
                <div className="text-[13.5px] font-black tracking-[.14em] text-[#8BA6CA]">{dirLabel ? 'SẴN SÀNG — GÕ TỪ TIẾNG ANH' : 'SẴN SÀNG — GÕ NGHĨA TIẾNG VIỆT'}</div>
              </div>
            )}
            {!over && paused && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: 'rgba(5,13,31,.86)' }}>
                <div className="font-[family-name:var(--font-nunito)] text-[24px] font-black text-white">Tạm dừng</div>
                <p className="max-w-[380px] text-[13.5px] font-bold text-[#8BA6CA]">Chữ đứng yên, không ai mất mạng. Chỉnh tốc độ ngay tại đây rồi chơi tiếp.</p>
                <SpeedPicker compact speed={speed} onSpeed={v => save('blast_speed', v, setSpeed)} />
                <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setPaused(false); inputRef.current?.focus(); }} className="mt-1 rounded-full bg-[#4353FF] px-8 py-2.5 font-black text-white transition-all hover:bg-[#3242E6] active:scale-95">Chơi tiếp</button>
              </div>
            )}
            {over && (
              <div className="absolute inset-0 z-20 overflow-y-auto" style={{ background: 'rgba(5,13,31,.92)' }}>
                <div className="flex min-h-full flex-col items-center justify-center px-8 py-8 text-center">
                  <h2 className="font-[family-name:var(--font-nunito)] text-[30px] font-black text-[#E53E3E]">Hết mạng</h2>
                  <div className="td-pop mb-5 mt-4 w-full max-w-[460px] rounded-[22px] px-5 py-4" style={{ background: 'linear-gradient(160deg,#12285A,#0C1A3C)', border: `2px solid ${rank.color}` }}>
                    <div className="text-[9.5px] font-black tracking-[.18em] text-[#5F7AA8]">CHỨNG NHẬN ĐẲNG CẤP</div>
                    <div className="mt-2 flex items-center justify-center gap-3"><span className="text-[34px] leading-none">{rank.emoji}</span><span className="font-[family-name:var(--font-nunito)] text-[28px] font-black leading-none" style={{ color: rank.color }}>{rank.name}</span></div>
                    <div className="mt-2 text-[12.5px] font-bold text-[#8BA6CA]">{rank.note}</div>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <span className="rounded-full px-[10px] py-[5px] text-[11px] font-black" style={{ background: 'rgba(74,222,128,.14)', color: '#4ADE80' }}>🔥 chuỗi dài nhất {stats.best}</span>
                      <span className="rounded-full px-[10px] py-[5px] text-[11px] font-black" style={{ background: '#132A54', color: '#8BA6CA' }}>{DIFFS.find(d => d.id === diff)?.label} · tốc độ {speed}</span>
                      {stats.best >= record && stats.best > 0 && <span className="rounded-full px-[10px] py-[5px] text-[11px] font-black" style={{ background: 'rgba(246,196,83,.16)', color: '#F6C453' }}>⭐ kỷ lục mới!</span>}
                    </div>
                    {nr && <div className="mt-3 text-[11.5px] font-bold text-[#5F7AA8]">Còn <strong style={{ color: nr.rank.color }}>{nr.remaining} từ</strong> nữa là lên <strong style={{ color: nr.rank.color }}>{nr.rank.name}</strong></div>}
                  </div>
                  <div className="mb-6 flex items-center gap-7">
                    {[['ĐIỂM', stats.score, '#F6C453'], ['BẮN TRÚNG', stats.hits, '#4ADE80'], ['CHUỖI DÀI NHẤT', stats.best, '#8A8AF6'], ['CẤP', level, '#E6EDFF']].map(([l, v, c]) => (
                      <div key={l}><div className="text-[26px] font-black leading-none" style={{ color: c }}>{v}</div><div className="mt-1 text-[9.5px] font-black tracking-[.12em] text-[#5F7AA8]">{l}</div></div>
                    ))}
                  </div>
                  {missed.length > 0 && (
                    <div className="mb-6 w-full max-w-[460px] rounded-[18px] p-4 text-left" style={{ background: '#0F1F45', border: '1px solid #1E3A5F' }}>
                      <div className="mb-2 text-[10px] font-black tracking-[.12em] text-[#5F7AA8]">TỪ ĐỂ LỌT — ÔN LẠI</div>
                      <div className="max-h-[168px] space-y-[6px] overflow-y-auto pr-1">
                        {missed.slice(-8).map((m, i) => <div key={i} className="flex items-center justify-between gap-3 text-[13.5px] font-bold"><span className="truncate text-[#FCA5A5]">{m.prompt}</span><span className="shrink-0 text-[#E6EDFF]">{m.answer}</span></div>)}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button type="button" autoFocus onClick={start} className="flex items-center gap-2 rounded-xl bg-[#4353FF] px-8 py-3.5 font-black text-white shadow-[0_4px_0_#153E75] transition-all hover:bg-[#3242E6] active:translate-y-[4px] active:shadow-[0_0px_0_#153E75]"><RotateCcw size={19} /> Chơi lại</button>
                    <button type="button" onClick={() => { setPlaying(false); setOver(false); }} className="rounded-xl px-7 py-3.5 font-black transition-colors" style={btnDark}>Đổi chiều · mức</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="shrink-0 px-6 pb-5 pt-3" style={{ background: '#0B1B3D', borderTop: '1px solid #1E3A5F' }}>
            <div className="mb-2 h-[15px] truncate px-4 text-center text-[10px] font-black tracking-[.14em]">
              {noMatch ? <span className="text-[#FCA5A5]">✘ KHÔNG KHỚP TỪ NÀO — ĐANG DỌN Ô GÕ…</span> : aim ? <span className="text-[#F6C453]">🎯 ĐANG NGẮM: {aim.answer.toUpperCase()}</span> : <span className="text-[#5F7AA8]">{dirLabel ? 'GÕ TỪ TIẾNG ANH' : 'GÕ NGHĨA TIẾNG VIỆT — KHÔNG DẤU CŨNG ĐƯỢC'}</span>}
            </div>
            <input ref={inputRef} value={typed} onChange={e => setTyped(e.target.value.slice(0, 48))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setTyped(''); } }}
              disabled={over} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder={over ? '—' : 'Gõ đáp án…'}
              className={`mx-auto block w-full max-w-[560px] rounded-[16px] border-2 px-5 py-3 text-center text-[19px] font-black outline-none transition-colors ${noMatch ? 'border-[#F87171]' : aim ? 'border-[#F6C453]' : 'border-[#2E5AA8] focus:border-[#F6C453]'}`}
              style={{ background: '#132A54', color: '#EAF1FF' }} />
            <div className="mt-2 h-[20px] truncate text-center text-[13px] font-bold">
              {flash && <span style={{ color: flash.ok ? '#86EFAC' : '#FCA5A5' }}>{flash.ok ? '✔' : '✘'} {flash.prompt} → <span className="text-[#E6EDFF]">{flash.answer}</span></span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
