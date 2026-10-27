// Card Blast — words fall, type the answer to shoot them down (rules, ranks, copy and colours from the site's blast module).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, X } from 'lucide-react';
import { gloss } from './decks';
import { getSetting, logActivity, setSetting } from './store';
import { WatchingSun } from './fcParts';
import { ttsService } from '../../../services/ttsService';

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

function buildPool(words = [], dir, diff) {
  const h = HINT_LETTERS[diff] ?? 1;
  const out = [];
  (words || []).forEach((w, i) => {
    const word = (w.w || '').trim();
    const g = gloss(w).trim();
    if (!word || !g) return;
    const prompt = dir === 'vi_en' ? g : word;
    const src = dir === 'vi_en' ? word : g;
    const acc = new Set();
    const add = x => {
      const v = norm(x);
      if (v) {
        acc.add(v);
        const ns = v.replace(/\s+/g, '');
        if (ns) acc.add(ns);
      }
    };
    const variants = x => { add(x); const t = x.replace(/\([^)]*\)/g, ' '); add(t); add(t.replace(/^(to|the|a|an)\s+/i, '')); add(t.replace(/^(sự|việc|cái|người|điều|những|các)\s+/i, '')); };
    variants(src);
    src.split(SPLIT).forEach(variants);
    const pieces = src.split(SPLIT).map(x => x.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    const answer = dir === 'vi_en' ? src : pieces.length ? pieces.reduce((a, b) => (b.length < a.length ? b : a)) : src;
    out.push({ id: String(i), prompt, answer, englishWord: word, accepts: [...acc], hint: hintCells(answer, h) });
  });
  return out;
}

const Stars = React.memo(() => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
    {[['10%', '15%', 6], ['25%', '30%', 4], ['15%', '60%', 8], ['40%', '80%', 5], ['65%', '75%', 6], ['80%', '40%', 4], ['55%', '20%', 5], ['30%', '45%', 6], ['75%', '85%', 7], ['50%', '65%', 4]].map(([top, left, size], i) => (
      <span
        key={i}
        style={{
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#EAF1FF',
          opacity: 0.8
        }}
      />
    ))}
  </div>
));
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

let sharedAudioCtx = null;
const getAudioCtx = () => {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

const playLaserSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {}
};

const playBoomSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

// Computes matched characters and identifies the next non-space character
function getMatchProgress(answer, accepts, typedStr) {
  const normTyped = norm(typedStr);
  const chars = Array.from(answer.trim());

  if (!normTyped) {
    const firstNonSpace = chars.findIndex(c => c !== ' ');
    return {
      matchedLen: 0,
      nextIdx: firstNonSpace >= 0 ? firstNonSpace : 0,
      isMatched: true
    };
  }

  const cleanTyped = normTyped.replace(/\s+/g, '');
  const hasMatch = accepts.some(a => {
    const normA = norm(a);
    return normA.startsWith(normTyped) || normA.replace(/\s+/g, '').startsWith(cleanTyped);
  });

  if (!hasMatch) {
    return { matchedLen: 0, nextIdx: 0, isMatched: false };
  }

  let tIdx = 0;
  let cIdx = 0;
  while (cIdx < chars.length && tIdx < cleanTyped.length) {
    const c = chars[cIdx];
    if (c === ' ') {
      cIdx++;
      continue;
    }
    const normC = norm(c);
    if (normC === cleanTyped[tIdx]) {
      tIdx++;
    }
    cIdx++;
  }

  let nextIdx = cIdx;
  while (nextIdx < chars.length && chars[nextIdx] === ' ') {
    nextIdx++;
  }

  return {
    matchedLen: cIdx,
    nextIdx: nextIdx < chars.length ? nextIdx : -1,
    isMatched: true
  };
}

const WordCard = React.memo(function WordCard({
  item,
  isAimed,
  isNearest,
  wasHit,
  typed,
  diff,
  aimRatio,
  isWarning
}) {
  const answerChars = useMemo(() => Array.from(item.answer.trim()), [item.answer]);
  const baseHintCount = HINT_LETTERS[diff] ?? 1;

  const matchInfo = useMemo(() => {
    if (isAimed) return getMatchProgress(item.answer, item.accepts, typed);
    if (isNearest) return getMatchProgress(item.answer, item.accepts, '');
    return { matchedLen: 0, nextIdx: -1, isMatched: false };
  }, [isAimed, isNearest, item.answer, item.accepts, typed]);

  return (
    <>
      <div
        className={`pointer-events-auto max-w-[260px] rounded-[16px] px-3.5 py-2 text-[15px] font-black leading-tight shadow-xl ${wasHit ? 'scale-105 brightness-125' : ''}`}
        style={{
          background: isAimed ? '#F6C453' : isNearest ? '#163261' : '#132A54',
          color: isAimed ? '#1E1B4B' : '#EAF1FF',
          border: `2px solid ${isAimed ? '#F6C453' : isNearest ? '#8A8AF6' : isWarning ? '#F87171' : '#2E5AA8'}`,
          boxShadow: isAimed
            ? '0 0 22px rgba(246,196,83,0.55)'
            : isNearest
            ? '0 0 16px rgba(138,138,246,0.45)'
            : '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <div className="flex items-center justify-center gap-1.5">
          {isNearest && !isAimed && (
            <span className="text-[13px] animate-bounce" title="Mục tiêu gần nhất">🎯</span>
          )}
          <span>{item.prompt}</span>
        </div>
        {isAimed && (
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-black/20">
            <div className="h-full bg-[#1E1B4B]" style={{ width: `${aimRatio * 100}%` }} />
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-[4px]">
        {answerChars.map((ch, i) => {
          if (ch === ' ') {
            return (
              <span key={i} className="flex h-[24px] w-2.5 items-center justify-center text-[#5F7AA8] opacity-60">
                ·
              </span>
            );
          }

          const isTyped = matchInfo.isMatched && i < matchInfo.matchedLen;
          const isNext = (isAimed || isNearest) && i === matchInfo.nextIdx;
          const isHinted = !isAimed && !isNearest && i < baseHintCount;

          if (isTyped) {
            return (
              <span
                key={i}
                className="flex h-[24px] min-w-[16px] items-center justify-center rounded-[5px] bg-[#4ADE80]/20 border border-[#4ADE80] px-1 text-[13px] font-black leading-none text-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.7)]"
              >
                {ch.toUpperCase()}
              </span>
            );
          }

          if (isNext) {
            return (
              <div key={i} className="relative flex flex-col items-center">
                <span
                  className="flex h-[26px] min-w-[18px] -translate-y-[2px] items-center justify-center rounded-[6px] bg-[#F6C453]/35 border-2 border-[#F6C453] px-1.5 text-[14px] font-black leading-none text-[#F6C453] animate-pulse shadow-[0_0_16px_rgba(246,196,83,0.95)] scale-110 z-10"
                >
                  {ch.toUpperCase()}
                </span>
                <span className="absolute -bottom-2 text-[9px] text-[#F6C453] leading-none animate-bounce">
                  ▲
                </span>
              </div>
            );
          }

          if (isHinted) {
            return (
              <span
                key={i}
                className="flex h-[24px] min-w-[16px] items-center justify-center border-b-2 border-[#5F7AA8] px-1 text-[12px] font-bold leading-none text-[#8BA6CA]"
              >
                {ch.toUpperCase()}
              </span>
            );
          }

          return (
            <span
              key={i}
              className="flex h-[24px] min-w-[16px] items-end justify-center border-b-2 border-[#40608F]/80 pb-0.5 text-[12px] font-black text-transparent"
            >
              _
            </span>
          );
        })}
      </div>
    </>
  );
}, (prev, next) => {
  return (
    prev.item?.key === next.item?.key &&
    prev.isAimed === next.isAimed &&
    prev.isNearest === next.isNearest &&
    prev.wasHit === next.wasHit &&
    prev.typed === next.typed &&
    prev.isWarning === next.isWarning &&
    prev.diff === next.diff &&
    Math.abs((prev.aimRatio || 0) - (next.aimRatio || 0)) < 0.05
  );
});

const GameHeader = React.memo(function GameHeader({
  score,
  level,
  streak,
  record,
  diffLabel,
  speed,
  paused,
  onTogglePause,
  lives
}) {
  return (
    <div className="flex h-[62px] shrink-0 items-center gap-6 pl-6 pr-[122px]" style={{ background: '#0B1B3D', borderBottom: '1px solid #1E3A5F' }}>
      <div><div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">ĐIỂM</div><div className="text-[21px] font-black leading-none text-[#F6C453]">{score}</div></div>
      <div><div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">CẤP</div><div className="text-[21px] font-black leading-none text-[#8A8AF6]">{level}</div></div>
      <div>
        <div className="text-[9.5px] font-black tracking-[.14em] text-[#5F7AA8]">CHUỖI{record > 0 && <span className="text-[#40608F]"> · KỶ LỤC {record}</span>}</div>
        <div className="flex items-baseline gap-[6px]">
          <div className="text-[21px] font-black leading-none" style={{ color: streak >= STREAK_STEP ? '#4ADE80' : '#E6EDFF' }}>{streak >= STREAK_STEP ? '🔥' : ''}{streak}</div>
          <span className="text-[10px] font-black text-[#5F7AA8]">liên tục</span>
          {streak >= STREAK_STEP && <span className="rounded-full px-[6px] py-[2px] text-[10.5px] font-black" style={{ background: 'rgba(74,222,128,.16)', color: '#4ADE80' }}>x{Math.min(5, 1 + Math.floor(streak / STREAK_STEP))}</span>}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full px-[9px] py-[4px] text-[10px] font-black tracking-[.1em] lg:inline" style={{ background: '#132A54', color: '#8BA6CA' }}>{diffLabel} · TỐC ĐỘ {speed}</span>
        <button type="button" onMouseDown={e => e.preventDefault()} onClick={onTogglePause} title={paused ? 'Chơi tiếp (Esc)' : 'Tạm dừng (Esc)'} className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] transition-colors" style={btnDark}>
          {paused ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}
        </button>
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map(n => <svg key={n} width="19" height="19" viewBox="0 0 24 24" fill={n < lives ? '#F56565' : 'rgba(255,255,255,.15)'}><path d="M12 21s-7.6-4.8-9.6-9.1A5.4 5.4 0 0 1 12 6.4a5.4 5.4 0 0 1 9.6 5.5C19.6 16.2 12 21 12 21Z" /></svg>)}
        </div>
      </div>
    </div>
  );
});

const Spaceship = React.memo(function Spaceship({ angle }) {
  return (
    <div
      className="pointer-events-none absolute bottom-3 left-1/2 z-20"
      style={{
        transform: `translateX(-50%) rotate(${angle}deg)`,
        transformOrigin: '50% 65%',
        willChange: 'transform'
      }}
    >
      <svg
        width="54"
        height="54"
        viewBox="0 0 44 44"
        className="overflow-visible"
        aria-hidden
      >
        <path d="M19 35 L22 43 L25 35 Z" fill="#F6C453" opacity="0.95" />
        <path d="M20 35 L22 40 L24 35 Z" fill="#FFFFFF" />
        <ellipse cx="14" cy="37" rx="2" ry="4" fill="#ED7A13" opacity="0.75" />
        <ellipse cx="30" cy="37" rx="2" ry="4" fill="#ED7A13" opacity="0.75" />
        <path
          d="M22 3 L37 37 L22 30 L7 37 Z"
          fill="#8A8AF6"
          stroke="#EAF1FF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="22" cy="22" rx="3.5" ry="6" fill="#1D3A78" stroke="#EAF1FF" strokeWidth="1" />
        <circle cx="22" cy="10" r="2.5" fill="#F6C453" />
        <line x1="22" y1="3" x2="22" y2="10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
});

const GameBottomBar = React.memo(function GameBottomBar({
  noMatch,
  aim,
  aimNextChar,
  nearestItem,
  nearestFirstChar,
  dirLabel,
  typed,
  over,
  flash,
  inputRef,
  handleInputChange,
  onKeyDown
}) {
  return (
    <div className="shrink-0 px-6 pb-5 pt-3" style={{ background: '#0B1B3D', borderTop: '1px solid #1E3A5F' }}>
      <div className="mb-2 h-[18px] truncate px-4 text-center text-[11px] font-black tracking-[.12em]">
        {noMatch ? (
          <span className="text-[#FCA5A5] animate-pulse">✘ CHƯA ĐÚNG — BẤM BACKSPACE ĐỂ XÓA SỬA HOẶC ENTER ĐỂ GÕ LẠI</span>
        ) : aim ? (
          <span className="text-[#F6C453] drop-shadow-[0_0_8px_rgba(246,196,83,0.5)]">
            🎯 ĐANG NGẮM: {aim.answer.toUpperCase()}
            {aimNextChar ? (
              <span className="ml-2 inline-flex items-center rounded-md bg-[#F6C453]/25 px-2 py-0.5 text-[#F6C453] border border-[#F6C453]">
                PHÍM TIẾP: {aimNextChar.toUpperCase()}
              </span>
            ) : null}
          </span>
        ) : nearestItem ? (
          <span className="text-[#8A8AF6]">
            🎯 MỤC TIÊU GẦN NHẤT: {nearestItem.prompt.toUpperCase()}
            {nearestFirstChar ? (
              <span className="ml-2 inline-flex items-center rounded-md bg-[#8A8AF6]/25 px-2 py-0.5 text-[#E6EDFF] border border-[#8A8AF6]">
                GÕ [{nearestFirstChar.toUpperCase()}] ĐỂ BẮN
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-[#5F7AA8]">{dirLabel ? 'GÕ TỪ TIẾNG ANH' : 'GÕ NGHĨA TIẾNG VIỆT — KHÔNG DẤU CŨNG ĐƯỢC'}</span>
        )}
      </div>
      <input
        ref={inputRef}
        value={typed}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        disabled={over}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={over ? '—' : 'Gõ đáp án…'}
        className={`mx-auto block w-full max-w-[560px] rounded-[16px] border-2 px-5 py-3 text-center text-[19px] font-black outline-none transition-colors ${noMatch ? 'border-[#F87171] text-[#FCA5A5]' : aim ? 'border-[#F6C453] text-[#EAF1FF]' : 'border-[#2E5AA8] text-[#EAF1FF] focus:border-[#F6C453]'}`}
        style={{ background: '#132A54' }}
      />
      <div className="mt-2 h-[20px] truncate text-center text-[13px] font-bold">
        {flash && <span style={{ color: flash.ok ? '#86EFAC' : '#FCA5A5' }}>{flash.ok ? '✔' : '✘'} {flash.prompt} → <span className="text-[#E6EDFF]">{flash.answer}</span></span>}
      </div>
    </div>
  );
});

export default function Blast({ words = [], full, onToggleFull, onExit, speak }) {
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
  const [lasers, setLasers] = useState([]);
  const [hitWords, setHitWords] = useState({});
  const [typed, setTyped] = useState('');
  const [stats, setStats] = useState({ score: 0, hits: 0, streak: 0, best: 0, lives: 3 });
  const [missed, setMissed] = useState([]);
  const [flash, setFlash] = useState(null);
  const [noMatch, setNoMatch] = useState(false);
  const inputRef = useRef(null);
  const playAreaRef = useRef(null);
  const playAreaSizeRef = useRef({ width: 800, height: 600 });
  const st = useRef({ items: [], last: 0, spawnIn: 0, queue: [], lives: 3 });
  const pool = useMemo(() => buildPool(words, dir, diff), [words, dir, diff]);
  const level = Math.floor(stats.hits / 8) + 1;
  const mult = SPEEDS.find(s => s.id === speed)?.mult ?? 1;
  const save = (k, v, set) => { set(v); setSetting(k, v); };
  const running = playing && !over && !paused && count === 0;

  // Audio speech pronunciation for English words
  const speakEnglishWord = useCallback((item) => {
    if (!item) return;
    const wordToSpeak = item.englishWord || (dir === 'vi_en' ? item.answer : item.prompt);
    if (!wordToSpeak) return;
    if (typeof speak === 'function') {
      speak(wordToSpeak);
    } else {
      ttsService.speak(wordToSpeak, 'US');
    }
  }, [speak, dir]);

  const speakEnglishWordRef = useRef(speakEnglishWord);
  speakEnglishWordRef.current = speakEnglishWord;

  // Observe play area size changes without forcing reflows during animation frames
  useEffect(() => {
    if (!playAreaRef.current) return;
    const updateSize = () => {
      if (playAreaRef.current) {
        const { clientWidth, clientHeight } = playAreaRef.current;
        if (clientWidth && clientHeight) {
          playAreaSizeRef.current = { width: clientWidth, height: clientHeight };
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(playAreaRef.current);
    return () => ro.disconnect();
  }, [playing]);

  const start = () => {
    if (!pool.length) return;
    st.current = { items: [], last: 0, spawnIn: 0, queue: [], lives: 3, typed: '' };
    setItems([]); setMissed([]); setFlash(null); setTyped(''); setLasers([]); setHitWords({}); setStats({ score: 0, hits: 0, streak: 0, best: 0, lives: 3 });
    setOver(false); setPaused(false); setPlaying(true); setCount(3);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  useEffect(() => { if (count <= 0) return; const t = setTimeout(() => setCount(c => c - 1), 750); return () => clearTimeout(t); }, [count]);
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
        if (p) {
          const used = s.items.map(i => i.x);
          let x = 16 + Math.random() * 68;
          for (let k = 0; k < 6 && used.some(u => Math.abs(u - x) < 18); k++) x = 16 + Math.random() * 68;
          s.items.push({ ...p, key: `${p.id}-${now}`, x, y: 0 });
          s.spawnIn = (fall / maxOn) * (0.75 + Math.random() * 0.5);
        }
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

        // Phát âm tiếng Anh khi từ rơi đi qua vạch
        if (escaped[0]) {
          speakEnglishWordRef.current?.(escaped[0]);
        }

        // Tự động làm trắng input khi từ đang ngắm rơi qua vạch đáy
        const curTyped = norm(s.typed || '');
        if (curTyped) {
          const curClean = curTyped.replace(/\s+/g, '');
          const wasAimingEscaped = escaped.some(e =>
            e.accepts.some(a => {
              const normA = norm(a);
              return normA.startsWith(curTyped) || normA.replace(/\s+/g, '').startsWith(curClean);
            })
          );
          if (wasAimingEscaped) {
            s.typed = '';
            setTyped('');
          }
        }
      }
      setItems([...s.items]);
      if (s.lives > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, pool, mult, level]);

  // Keys string to prevent redundant computations on animation frames
  const itemKeys = useMemo(() => items.map(i => i.key).join(','), [items]);

  // ---- typing: a match shoots the word, a dead prefix clears the box ----
  const aim = useMemo(() => {
    const t = norm(typed);
    if (!t) return null;
    const tClean = t.replace(/\s+/g, '');
    let best = null;
    st.current.items.forEach(it => it.accepts.forEach(a => {
      const normA = norm(a);
      const aClean = normA.replace(/\s+/g, '');
      if ((normA.length >= t.length && normA.startsWith(t)) || (aClean.length >= tClean.length && aClean.startsWith(tClean))) {
        const r = Math.max(t.length / normA.length, tClean.length / aClean.length);
        if (!best || r > best.r) best = { key: it.key, r, answer: it.answer };
      }
    }));
    return best;
  }, [typed, itemKeys]);

  // Identify nearest falling item or currently aimed item
  const nearestItem = useMemo(() => {
    if (!items.length) return null;
    if (aim) {
      const targeted = items.find(it => it.key === aim.key);
      if (targeted) return targeted;
    }
    return items[0] || null;
  }, [aim?.key, itemKeys]);

  // Calculate arrow angle pointing to nearestItem without forcing synchronous layout reflow
  const arrowAngle = useMemo(() => {
    if (!nearestItem) return 0;
    const { width, height } = playAreaSizeRef.current;
    const shipX = width / 2;
    const shipY = height - 24;
    let targetX = (nearestItem.x / 100) * width;
    targetX = Math.max(140, Math.min(width - 140, targetX));
    const targetY = (nearestItem.y * (height - 70)) + 24;
    const dx = targetX - shipX;
    const dy = targetY - shipY;
    const rad = Math.atan2(dx, -dy);
    return Math.round(rad * (180 / Math.PI));
  }, [nearestItem?.key, nearestItem?.x, Math.round((nearestItem?.y || 0) * 100)]);

  // Fire laser and update typing
  const handleInputChange = (e) => {
    const val = e.target.value.slice(0, 48);
    const newNorm = norm(val);
    const newClean = newNorm.replace(/\s+/g, '');

    if (!newNorm) {
      setTyped('');
      if (st.current) st.current.typed = '';
      return;
    }

    // Check if newNorm hits and finishes a word completely!
    const hitItem = st.current.items.find(it =>
      it.accepts.some(a => {
        const normA = norm(a);
        return normA === newNorm || normA.replace(/\s+/g, '') === newClean;
      })
    );

    if (hitItem) {
      playLaserSound();
      playBoomSound();
      speakEnglishWord(hitItem);

      let targetXPercent = hitItem.x;
      const width = playAreaSizeRef.current.width || 800;
      if (width) {
        const rawX = (hitItem.x / 100) * width;
        const clampedX = Math.max(140, Math.min(width - 140, rawX));
        targetXPercent = (clampedX / width) * 100;
      }

      const laserId = `${Date.now()}-${Math.random()}`;
      setLasers(prev => [
        ...prev,
        {
          id: laserId,
          x1: 50,
          y1: 94,
          x2: targetXPercent,
          y2: Math.max(10, Math.min(88, hitItem.y * 100))
        }
      ]);
      setTimeout(() => setLasers(prev => prev.filter(l => l.id !== laserId)), 250);

      // Remove from items and trigger boom
      st.current.items = st.current.items.filter(i => i !== hitItem);
      setItems(st.current.items.map(it => ({ ...it })));
      setBooms(b => [...b, { key: hitItem.key, x: hitItem.x, y: hitItem.y }]);
      setTimeout(() => setBooms(b => b.filter(x => x.key !== hitItem.key)), 500);

      // Auto-clear input immediately!
      setTyped('');
      if (st.current) st.current.typed = '';
      setFlash({ ok: true, prompt: hitItem.prompt, answer: hitItem.answer });
      setStats(v => {
        const streak = v.streak + 1;
        const best = Math.max(v.best, streak);
        if (best > record) save('blast_record', best, setRecord);
        return {
          ...v,
          streak,
          best,
          hits: v.hits + 1,
          score: v.score + 10 * Math.min(5, 1 + Math.floor(streak / STREAK_STEP))
        };
      });
      return;
    }

    // Normal typing: check if it matches a prefix of a word
    let targetItem = null;
    if (aim) {
      const cur = st.current.items.find(it => it.key === aim.key);
      if (cur && cur.accepts.some(a => {
        const normA = norm(a);
        return normA.startsWith(newNorm) || normA.replace(/\s+/g, '').startsWith(newClean);
      })) {
        targetItem = cur;
      }
    }
    if (!targetItem) {
      const matched = st.current.items.filter(it =>
        it.accepts.some(a => {
          const normA = norm(a);
          return normA.startsWith(newNorm) || normA.replace(/\s+/g, '').startsWith(newClean);
        })
      );
      if (matched.length) {
        targetItem = matched.sort((a, b) => b.y - a.y)[0];
      }
    }

    if (targetItem) {
      playLaserSound();
      const laserId = `${Date.now()}-${Math.random()}`;
      let targetXPercent = targetItem.x;
      const width = playAreaSizeRef.current.width || 800;
      if (width) {
        const rawX = (targetItem.x / 100) * width;
        const clampedX = Math.max(140, Math.min(width - 140, rawX));
        targetXPercent = (clampedX / width) * 100;
      }
      setLasers(prev => [
        ...prev,
        {
          id: laserId,
          x1: 50,
          y1: 94,
          x2: targetXPercent,
          y2: Math.max(10, Math.min(88, targetItem.y * 100))
        }
      ]);
      setHitWords(prev => ({ ...prev, [targetItem.key]: Date.now() }));
      setTimeout(() => setLasers(prev => prev.filter(l => l.id !== laserId)), 250);
    }

    setTyped(val);
    if (st.current) st.current.typed = val;
  };

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTyped('');
      if (st.current) st.current.typed = '';
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = norm(typed);
    if (!t) return;
    const tClean = t.replace(/\s+/g, '');
    const hit = st.current.items.find(it =>
      it.accepts.some(a => {
        const normA = norm(a);
        return normA === t || normA.replace(/\s+/g, '') === tClean;
      })
    );
    if (hit) {
      playBoomSound();
      speakEnglishWord(hit);
      st.current.items = st.current.items.filter(i => i !== hit);
      setItems(st.current.items.map(it => ({ ...it })));
      setBooms(b => [...b, { key: hit.key, x: hit.x, y: hit.y }]);
      setTimeout(() => setBooms(b => b.filter(x => x.key !== hit.key)), 500);
      setTyped('');
      if (st.current) st.current.typed = '';
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
    setNoMatch(true);
  }, [typed, aim, running]);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 2500); return () => clearTimeout(t); }, [flash]);

  // Derived next characters for status bar (cached on itemKeys to prevent 60fps re-runs)
  const aimItem = useMemo(() => {
    if (!aim) return null;
    return items.find(it => it.key === aim.key) || null;
  }, [aim?.key, itemKeys]);

  const aimProgress = useMemo(() => {
    if (!aimItem) return null;
    return getMatchProgress(aimItem.answer, aimItem.accepts, typed);
  }, [aimItem?.key, typed]);

  const aimNextChar = useMemo(() => {
    if (!aimItem || !aimProgress || aimProgress.nextIdx < 0) return null;
    const chars = Array.from(aimItem.answer.trim());
    return chars[aimProgress.nextIdx] || null;
  }, [aimItem?.key, aimProgress]);

  const nearestFirstChar = useMemo(() => {
    if (!nearestItem) return null;
    const prog = getMatchProgress(nearestItem.answer, nearestItem.accepts, '');
    if (prog.nextIdx < 0) return null;
    const chars = Array.from(nearestItem.answer.trim());
    return chars[prog.nextIdx] || null;
  }, [nearestItem?.key]);

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
          <GameHeader
            score={stats.score}
            level={level}
            streak={stats.streak}
            record={record}
            diffLabel={DIFFS.find(d => d.id === diff)?.label.toUpperCase()}
            speed={speed}
            paused={paused}
            onTogglePause={() => setPaused(p => !p)}
            lives={stats.lives}
          />
          <div className="relative h-[4px] shrink-0 bg-[#132A54]">
            <div className="absolute inset-y-0 left-0 bg-[#8A8AF6]" style={{ width: `${((stats.hits % 8) / 8) * 100}%` }} />
          </div>
          <div ref={playAreaRef} className="relative flex-1 overflow-hidden" onMouseDown={e => { e.preventDefault(); inputRef.current?.focus(); }}>
            <Stars />

            {/* Laser beams overlay */}
            {lasers.length > 0 && (
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden">
                {lasers.map(l => (
                  <g key={l.id} className="vc-shot">
                    {/* Outer laser glow */}
                    <line
                      x1={`${l.x1}%`}
                      y1={`${l.y1}%`}
                      x2={`${l.x2}%`}
                      y2={`${l.y2}%`}
                      stroke="#F6C453"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    {/* Mid cyan/purple beam */}
                    <line
                      x1={`${l.x1}%`}
                      y1={`${l.y1}%`}
                      x2={`${l.x2}%`}
                      y2={`${l.y2}%`}
                      stroke="#8A8AF6"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Core white beam */}
                    <line
                      x1={`${l.x1}%`}
                      y1={`${l.y1}%`}
                      x2={`${l.x2}%`}
                      y2={`${l.y2}%`}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Muzzle flash at ship nozzle */}
                    <circle cx={`${l.x1}%`} cy={`${l.y1}%`} r="8" fill="#F6C453" opacity="0.8" />
                    <circle cx={`${l.x1}%`} cy={`${l.y1}%`} r="3.5" fill="#FFFFFF" />

                    {/* Impact spark at target word */}
                    <circle cx={`${l.x2}%`} cy={`${l.y2}%`} r="14" fill="#F6C453" opacity="0.6" />
                    <circle cx={`${l.x2}%`} cy={`${l.y2}%`} r="8" fill="#ED7A13" opacity="0.8" />
                    <circle cx={`${l.x2}%`} cy={`${l.y2}%`} r="3.5" fill="#FFFFFF" />
                  </g>
                ))}
              </svg>
            )}

            {/* Hardware-accelerated falling words */}
            {items.map(it => {
              const isAimed = aim?.key === it.key;
              const isNearest = !aim && nearestItem?.key === it.key;
              const wasHit = hitWords[it.key] && (Date.now() - hitWords[it.key] < 220);
              const playAreaH = playAreaSizeRef.current.height || 600;
              const yPx = Math.round(it.y * (playAreaH - 70));

              return (
                <div
                  key={it.key}
                  className="pointer-events-none absolute text-center"
                  style={{
                    left: `clamp(140px, ${it.x}%, calc(100% - 140px))`,
                    top: 0,
                    transform: `translate3d(-50%, ${yPx}px, 0)`,
                    willChange: 'transform',
                    zIndex: isAimed ? 15 : isNearest ? 12 : 5
                  }}
                >
                  <WordCard
                    item={it}
                    isAimed={isAimed}
                    isNearest={isNearest}
                    wasHit={wasHit}
                    typed={isAimed ? typed : ''}
                    diff={diff}
                    aimRatio={isAimed ? aim.r : 0}
                    isWarning={it.y > 0.75}
                  />
                </div>
              );
            })}

            {booms.map(b => {
              const playAreaH = playAreaSizeRef.current.height || 600;
              const yPx = Math.round(b.y * (playAreaH - 70));
              return (
                <span
                  key={b.key}
                  className="vc-boom pointer-events-none absolute h-20 w-20 rounded-full z-25"
                  style={{
                    left: `clamp(140px, ${b.x}%, calc(100% - 140px))`,
                    top: 0,
                    transform: `translate3d(-50%, ${yPx}px, 0)`,
                    background: 'radial-gradient(#F6C453,#ED7A13 55%,transparent 70%)'
                  }}
                />
              );
            })}

            {/* Spaceship arrow rotating smoothly with will-change */}
            <Spaceship angle={arrowAngle} />

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
          <GameBottomBar
            noMatch={noMatch}
            aim={aim}
            aimNextChar={aimNextChar}
            nearestItem={nearestItem}
            nearestFirstChar={nearestFirstChar}
            dirLabel={dirLabel}
            typed={typed}
            over={over}
            flash={flash}
            inputRef={inputRef}
            handleInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
    </div>
  );
}
