// The ten illustration variants of the dashboard "Bộ từ" cards (cycled per card, copied from the site's DOM).
import React from 'react';
import {
  AlarmClock, AlertTriangle, BarChart3, BookOpen, Brain, Building2, Frown, Globe, GraduationCap, Leaf, Megaphone,
  Stethoscope, TreeDeciduous, Trophy, Users, Volume2,
} from 'lucide-react';

const INK = '#1b1d22';
/** Darken a #rrggbb colour (used for icons / dots drawn on the card colour). */
export function shade(hex, f = 0.55) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f));
  return `rgb(${c.join(',')})`;
}
const ICONS = {
  'topic-2': Users, 'topic-4': BarChart3, 'topic-5': Stethoscope, 'topic-6': GraduationCap, 'topic-7': Building2,
  'topic-8': Megaphone, 'topic-9': Globe, 'topic-1': Leaf,
  'idiom-3': AlarmClock, 'idiom-5': Trophy, 'idiom-6': Frown, 'idiom-12': AlarmClock, 'idiom-14': Brain, 'idiom-15': AlertTriangle,
  'oxford-b1': TreeDeciduous,
};
const iconFor = card => ICONS[card.id] || BookOpen;

const GRID = { background: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px) 0 0/30px 30px', maskImage: 'linear-gradient(transparent,#000 45%)' };
const SWATCH = ['#9fd3ef', '#ffba3b', '#ff7a3d', '#8587f8'];
const ROWS = [{ w: '74%', o: 0.55, f: 13.5 }, { w: '82%', o: 0.8, f: 13.5 }, { w: '96%', o: 1, f: 15, s: '0 12px 24px -10px rgba(27,29,34,.35)' }, { w: '86%', o: 0.8, f: 13.5 }];
const TILES = [[0, -6], [10, 4], [-4, -3], [8, 5], [-2, -4], [10, 3], [0, -5], [6, 4]];
const PATH = [['10%', 14], ['50%', 62], ['14%', 110], ['52%', 158]];
const STICK = [['6%', '6%', -5], ['52%', '2%', 6], ['10%', '40%', 4], ['50%', '52%', -4]];

export default function CardArt({ card, pct = 0, label }) {
  const w = card.words || [];
  const dark = shade(card.color);
  const Icon = iconFor(card);
  const art = card.art;
  return (
    <div className="relative mt-3.5 min-h-[220px] flex-1">
      <span aria-hidden className="absolute inset-0" style={GRID} />
      {art === 'list' && (
        <div className="absolute left-[11%] right-[11%] top-2 -bottom-3.5 flex flex-col items-center gap-1.5 rounded-t-[20px] px-3 pt-3" style={{ background: 'rgba(255,255,255,.55)' }}>
          {ROWS.map((r, i) => w[i] && (
            <div key={i} className="flex items-center gap-2.5 rounded-[12px] bg-white px-3 py-[9px] font-bold" style={{ width: r.w, opacity: r.o, fontSize: r.f, boxShadow: r.s || 'none' }}>
              <span className="h-[18px] w-[18px] flex-none rounded-[5px]" style={{ background: SWATCH[i] }} />
              <span className="min-w-0 flex-1 truncate text-left">{w[i]}</span>
              {i === 2 && (card.level || pct > 0) && <span className="text-[13px] font-bold text-[#1f9d55]">{card.level || `+${pct}%`}</span>}
            </div>
          ))}
        </div>
      )}
      {art === 'letters' && (
        <>
          <div className="absolute inset-x-0 top-10 flex flex-nowrap justify-center gap-1.5 px-3.5">
            {(card.letters || 'VOCAB').slice(0, 8).split('').map((ch, i) => {
              const on = i === 1 || i === 4;
              const [y, r] = TILES[i % TILES.length];
              return (
                <span key={i} className="flex h-[44px] w-[38px] flex-none items-center justify-center rounded-[9px] text-[21px] font-bold"
                  style={{ background: on ? '#1f6f96' : '#fff', color: on ? '#fff' : INK, transform: `translateY(${y}px) rotate(${r}deg)`, boxShadow: '0 4px 0 rgba(27,29,34,.22),0 10px 18px -8px rgba(27,29,34,.35)' }}>{ch}</span>
              );
            })}
          </div>
          <div className="absolute inset-x-0 bottom-[22px] flex flex-wrap justify-center gap-2 px-[18px]">
            {w.slice(0, 2).map(x => <span key={x} className="max-w-[46%] truncate rounded-full px-3 py-[5px] text-[12.5px] font-bold" style={{ background: 'rgba(255,255,255,.7)' }}>{x}</span>)}
          </div>
        </>
      )}
      {art === 'rings' && (
        <>
          <span className="absolute left-1/2 -bottom-[170px] -ml-[170px] h-[340px] w-[340px] rounded-full" style={{ background: 'rgba(255,255,255,.22)' }} />
          <span className="absolute left-1/2 -bottom-[120px] -ml-[120px] h-[240px] w-[240px] rounded-full" style={{ background: 'rgba(255,255,255,.32)' }} />
          <span className="absolute left-1/2 -bottom-[70px] -ml-[70px] h-[140px] w-[140px] rounded-full bg-white" style={{ boxShadow: '0 10px 30px -8px rgba(27,29,34,.25)' }} />
          <div className="absolute inset-x-0 bottom-3.5 flex flex-col items-center gap-0.5">
            <Icon size={26} color={dark} strokeWidth={2.2} />
            <span className="text-[13px] font-bold" style={{ color: dark }}>{label}</span>
          </div>
        </>
      )}
      {art === 'chat' && (
        <div className="absolute inset-x-[18px] top-2.5 bottom-4 flex flex-col justify-end gap-2">
          <span className="max-w-[86%] self-start truncate rounded-[18px_18px_18px_4px] bg-white px-3.5 py-[9px] text-[14px] font-bold" style={{ boxShadow: '0 8px 16px -10px rgba(27,29,34,.35)' }}>{card.chat?.[0] || `Nghĩa của “${w[0]}”?`}</span>
          <span className="max-w-[86%] self-end truncate rounded-[18px_18px_4px_18px] px-3.5 py-[9px] text-[14px] font-bold text-white" style={{ background: INK }}>{card.chat?.[1] || `Xem cùng “${w[1] || w[0]}”`}</span>
          <span className="flex gap-1 self-start rounded-[18px_18px_18px_4px] bg-white px-3.5 py-3">
            {[1, 0.6, 0.3].map(o => <span key={o} className="h-[7px] w-[7px] rounded-full" style={{ background: dark, opacity: o }} />)}
          </span>
        </div>
      )}
      {art === 'docs' && (
        <>
          <div className="absolute left-[12%] -bottom-[30px] flex h-[170px] w-[44%] -rotate-[9deg] flex-col gap-2 rounded-[14px] bg-[#f4f4f6] px-3.5 py-[18px]" style={{ boxShadow: '0 10px 24px -12px rgba(27,29,34,.35)' }}>
            <span className="h-2 w-[70%] rounded bg-[#d6d8de]" /><span className="h-2 w-1/2 rounded bg-[#d6d8de]" />
          </div>
          <div className="absolute right-[12%] -bottom-[30px] flex h-[170px] w-[44%] rotate-[9deg] flex-col items-end gap-2 rounded-[14px] bg-[#f4f4f6] px-3.5 py-[18px]" style={{ boxShadow: '0 10px 24px -12px rgba(27,29,34,.35)' }}>
            <span className="h-2 w-[60%] rounded bg-[#d6d8de]" /><span className="h-2 w-[40%] rounded bg-[#d6d8de]" />
          </div>
          <div className="absolute left-1/2 -bottom-6 -ml-[25%] flex h-[200px] w-1/2 flex-col items-start gap-[9px] rounded-[16px_30px_16px_16px] bg-white px-4 py-[18px] text-left" style={{ boxShadow: '0 16px 30px -12px rgba(27,29,34,.4)' }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: card.color }}><Icon size={18} color={INK} /></span>
            <span className="w-full truncate text-[15px] font-bold">{w[0]}</span>
            <span className="h-2 w-[85%] rounded bg-[#e4e6ea]" /><span className="h-2 w-[60%] rounded bg-[#e4e6ea]" />
          </div>
        </>
      )}
      {art === 'donut' && (
        <div className="absolute left-1/2 top-[18px] -ml-[85px] flex h-[170px] w-[170px] items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${dark} 0deg, ${dark} ${Math.max(3, pct)}%, rgba(255,255,255,.55) 0deg)`, boxShadow: '0 16px 30px -14px rgba(27,29,34,.4)' }}>
          <div className="flex h-[124px] w-[124px] flex-col items-center justify-center gap-0.5 rounded-full bg-white">
            <Icon size={20} color={dark} />
            <span className="text-[22px] font-bold tracking-[-0.02em]">{pct}%</span>
            <span className="text-[11px] font-bold text-[#8b909b]">Đã thuộc</span>
          </div>
        </div>
      )}
      {art === 'stats' && (
        <div className="absolute inset-x-[8%] top-[26px] -bottom-4 grid grid-cols-2 gap-2.5 rounded-t-[22px] bg-white p-3.5 text-left">
          {[['Đã thuộc', `${pct}%`, '#e5482a', true], [card.unitWord || 'Tổng từ', card.count, '#ffb31f', false]].map(([t, v, c, bar]) => (
            <div key={t} className="flex flex-col gap-1 rounded-[14px] bg-[#f4f5f7] p-3">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[11px] font-bold text-[#8b909b]">{t}</span>
                <span className="flex gap-[3px]">{[0, 1, 2].map(k => <span key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />)}</span>
              </div>
              <span className="text-[24px] font-bold tracking-[-0.02em]">{v}</span>
              {bar
                ? <div className="mt-auto h-[22px] overflow-hidden rounded-[6px] bg-[#dfe1e6]"><div className="h-full bg-[#e5482a]" style={{ width: `${Math.max(3, pct)}%` }} /></div>
                : <div className="mt-auto h-[22px] rounded-[6px] bg-[#ffb31f]" />}
            </div>
          ))}
        </div>
      )}
      {art === 'path' && (
        <>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute left-0 top-0 h-[210px] w-full">
            <polyline points="24,14 64,37 28,60 66,83" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="1.4" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </svg>
          {PATH.map(([left, top], i) => w[i] && (
            <span key={i} className="absolute flex max-w-[48%] items-center gap-2 whitespace-nowrap rounded-full bg-white py-1 pl-1 pr-3.5 text-[13.5px] font-bold" style={{ left, top, boxShadow: '0 8px 16px -10px rgba(27,29,34,.4)' }}>
              <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[12px] font-bold" style={{ background: i === 0 ? dark : '#fff', color: i === 0 ? '#fff' : INK, border: `1.5px solid ${dark}` }}>{i + 1}</span>
              <span className="truncate">{w[i]}</span>
            </span>
          ))}
        </>
      )}
      {art === 'stickers' && (
        <>
          <span className="absolute left-1/2 -bottom-[150px] -ml-[150px] h-[300px] w-[300px] rounded-full" style={{ background: 'rgba(255,255,255,.25)' }} />
          <span className="absolute left-1/2 -bottom-[95px] -ml-[95px] h-[190px] w-[190px] rounded-full" style={{ background: 'rgba(255,255,255,.35)' }} />
          {STICK.map(([left, top, rot], i) => w[i] && (
            <span key={i} className="absolute max-w-[44%] truncate whitespace-nowrap rounded-[4px] border-[1.5px] bg-white px-3 py-1.5 text-[13.5px] font-bold" style={{ left, top, transform: `rotate(${rot}deg)`, borderColor: INK, boxShadow: `3px 3px 0 ${INK}` }}>{w[i]}</span>
          ))}
        </>
      )}
      {art === 'wordcard' && (
        <div className="absolute inset-x-[10%] top-4 -bottom-5 flex flex-col gap-[9px] rounded-t-[20px] bg-white px-[18px] pt-[18px] text-left" style={{ boxShadow: '0 -6px 24px -12px rgba(27,29,34,.3)' }}>
          <div className="flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate text-[22px] font-bold tracking-[-0.02em]">{w[0]}</span>
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: card.color }}><Volume2 size={15} /></span>
          </div>
          <span className="h-[7px] w-[92%] rounded bg-[#e8eaee]" /><span className="h-[7px] w-[70%] rounded bg-[#e8eaee]" />
          <span className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8b909b]">Liên quan</span>
          <div className="flex flex-wrap gap-1.5">
            {w.slice(1, 3).map((x, i) => <span key={x} className={`max-w-full truncate rounded-[8px] px-[9px] py-1 text-[12.5px] font-bold ${i ? 'bg-[#f1f3f7]' : ''}`} style={i ? undefined : { background: card.color }}>{x}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
