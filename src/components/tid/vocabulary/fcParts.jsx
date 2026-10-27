// Small building blocks of the flashcard page (WorkingEnglish skin).
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const ACCENT = { bg: 'var(--fc-bg, #4F46E5)', ink: 'var(--fc-ink, #fff)', face: 'var(--fc-face, #ffffff)', faceInk: 'var(--fc-face-ink, #1E1B4B)', exInk: 'var(--fc-ex-ink, #3F3A6B)', btn: 'var(--fc-btn, #1E1B4B)' };
export const MUTE = '#6B6790';
export const CHIP = '#FFF0C2';
export const LINK = '#D9532A';
/** Ink outline + hard drop shared by every flashcard surface. */
export const EDGE = '#1E1B4B';
export const POP = '0 4px 0 #1E1B4B';

/** Card colour themes ("Màu"). */
export const THEMES = [
  ['Vàng nắng', '#F8BE33', '#1E1B4B'], ['Indigo', '#4F46E5', '#fff'], ['Tím', '#8B7CF6', '#fff'], ['Xanh lá', '#1F9D63', '#fff'],
  ['Coral', '#F2683A', '#fff'], ['Hồng', '#E06A96', '#fff'], ['Đêm', '#2F3654', '#fff'], ['Mint', '#3ECF8E', '#1E1B4B'],
  ['Da trời', '#7CC4F2', '#1E1B4B'], ['Oải hương', '#C4B5FD', '#1E1B4B'], ['Đào', '#FFB4A2', '#1E1B4B'], ['Kem', '#FFF0C2', '#1E1B4B'],
].map(([name, bg, ink]) => ({ name, bg, ink, face: '#ffffff', fInk: '#1E1B4B', exInk: '#3F3A6B' }))
  .concat([{ name: 'Tối', bg: '#14122E', ink: '#ffffff', face: '#2F3654', fInk: '#FFF8E7', exInk: '#C9C6E6', black: true }]);
export const themeVars = t => ({
  '--fc-bg': t.bg, '--fc-ink': t.ink, '--fc-face': t.face, '--fc-face-ink': t.fInk, '--fc-ex-ink': t.exInk,
  '--fc-rail': t.black ? '#22263F' : '#2F3654', '--fc-rail-on': '#F8BE33',
  '--fc-rail-on-ink': '#1E1B4B', '--fc-btn': t.black ? '#4F46E5' : '#1E1B4B',
});

// Wavy badge behind the mode icons (site: WavyBadge, viewBox 100).
const WAVE = (() => {
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2;
    const r = 45.5 + 3.5 * Math.cos(a * 8);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
})();
export function WavyBadge({ size = 40, fill, children, className = '' }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0" aria-hidden><path d={WAVE} fill={fill} /></svg>
      <span className="relative flex items-center justify-center">{children}</span>
    </span>
  );
}

/** WorkingEnglish mascot: a winking flashcard that peeks over the stage. */
export function WatchingSun({ size = 62 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="pointer-events-none inline-block">
      <rect x="8" y="10" width="46" height="46" rx="12" fill="#F8BE33" stroke="#1E1B4B" strokeWidth="4" transform="rotate(-8 31 33)" />
      <rect x="8" y="6" width="46" height="46" rx="12" fill="#fff" stroke="#1E1B4B" strokeWidth="4" transform="rotate(6 31 29)" />
      <circle cx="24" cy="27" r="3.6" fill="#1E1B4B" />
      <path d="M35 27 q4 -4 8 0" fill="none" stroke="#1E1B4B" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M23 36 q8 7 16 0" fill="none" stroke="#1E1B4B" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="19" cy="34" r="3" fill="#F2683A" opacity=".7" /><circle cx="44" cy="34" r="3" fill="#F2683A" opacity=".7" />
    </svg>
  );
}

/** Floating ring/dot decoration (site: Sparkle). */
export const Sparkle = ({ size, delay = 0, className = '', fill = false }) => (
  <span aria-hidden className={`td-float pointer-events-none absolute rounded-full ${className}`}
    style={{ width: size * 0.8, height: size * 0.8, background: fill ? '#fff' : 'transparent', border: fill ? 0 : `${size / 7}px solid #fff`, opacity: 0.9, animationDelay: `-${delay}ms` }} />
);

export function Feedback({ ok, children }) {
  return <span className="max-w-full self-start rounded-[12px] border-2 bg-white px-3 py-2 text-[14.5px] font-extrabold leading-snug" style={{ color: ok ? '#1F9D63' : '#D9532A', borderColor: EDGE, boxShadow: '0 3px 0 #1E1B4B' }}>{children}</span>;
}
export function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex h-[52px] shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[16px] border-[2.5px] px-[18px] text-[14.5px] font-extrabold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{ background: ACCENT.btn, borderColor: EDGE, boxShadow: '0 4px 0 rgba(30,27,75,.45)' }}>{children}</button>
  );
}
export function Choices({ choices, onPick }) {
  return (
    <div className="mt-1.5 flex w-full max-w-[460px] flex-col gap-2">
      {choices.map((c, i) => {
        const solid = c.state === 'right' || c.state === 'wrong';
        return (
          <button key={`${i}-${c.text}`} type="button" onClick={() => onPick(i)}
            className="flex cursor-pointer items-center gap-3 rounded-[16px] border-[2.5px] px-4 py-[10px] text-left transition-[translate,background-color,opacity] duration-150 hover:-translate-y-0.5"
            style={{ background: c.state === 'right' ? '#3ECF8E' : c.state === 'wrong' ? '#F2683A' : ACCENT.face, color: c.state === 'wrong' ? '#fff' : ACCENT.faceInk, opacity: c.state === 'dim' ? 0.6 : 1, borderColor: EDGE, boxShadow: POP }}>
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] border-2 text-[12.5px] font-extrabold" style={{ background: solid ? 'rgba(255,255,255,.35)' : '#FFF0C2', borderColor: EDGE }}>{i + 1}</span>
            <span className="min-w-0 text-[16px] font-extrabold leading-[1.25] [overflow-wrap:anywhere]">{c.text}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- letter cells (Listening / Gõ từ) ----------
const VN = { â: 'aa', ê: 'ee', ô: 'oo', ă: 'aw', ơ: 'ow', ư: 'uw', đ: 'dd' };
export const foldChar = c => c.toLowerCase().replace(/[’‘]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
export const isLetter = c => /^[a-z0-9'-]$/.test(foldChar(c));
export const letters = s => [...s].filter(isLetter).map(foldChar).join('');
function cleanTyped(v, max) {
  let out = '';
  for (const ch of v.toLowerCase().replace(/[’‘]/g, "'")) {
    const c = ch.normalize('NFD').replace(/[̣̀́̃̉]/g, '').normalize('NFC');
    out += VN[c] ?? c;
  }
  return out.replace(/[^a-z0-9'-]/g, '').slice(0, max);
}

export function LetterCells({ word, typed, checked, wrong, onChange, onEnter, inputRef, hint }) {
  const n = letters(word).length;
  const [focus, setFocus] = useState(false);
  const sz = n > 16 ? { w: 26, gap: 4 } : n > 10 ? { w: 34, gap: 6 } : { w: 44, gap: 10 };
  const longest = Math.max(1, ...word.split(/\s+/).map(x => x.length));
  const gap = `min(${sz.gap}px, 1.6cqi)`;
  const cell = `min(${sz.w}px, calc((100cqi - ${longest - 1} * ${gap}) / ${longest}))`;
  const t = typed.toLowerCase();
  let k = 0;
  const groups = word.split(/\s+/).filter(Boolean).map(part => [...part].map(ch => {
    if (!isLetter(ch)) return { ch, fixed: true, line: 'transparent', fg: MUTE };
    const i = k++;
    const v = t[i] || '';
    const caret = i === t.length && !checked && focus;
    const show = checked || wrong;
    const ok = show && v === foldChar(ch);
    const bad = show && !ok;
    const peek = hint && !v && !checked && (i === 0 || i === n - 1);
    return {
      ch: (bad && checked) || peek ? ch.toLowerCase() : v, peek, caret: caret && !v,
      bg: caret ? 'rgba(128,128,140,.1)' : 'transparent',
      fg: ok ? '#1F9D63' : bad ? '#D9532A' : undefined,
      line: ok ? '#3ECF8E' : bad ? '#F2683A' : caret ? ACCENT.bg : 'rgba(30,27,75,.25)',
    };
  }));
  return (
    <>
      <div onClick={e => { e.stopPropagation(); inputRef.current?.focus(); }} className="relative z-[2] mt-2.5 flex max-w-full flex-wrap items-end py-1.5" style={{ columnGap: `calc(${gap} * 2.5)`, rowGap: 12 }}>
        {groups.map((g, gi) => (
          <div key={gi} className="flex flex-nowrap" style={{ gap }}>
            {g.map((c, ci) => (
              <span key={ci} className="relative flex items-end justify-center rounded-[3px] pb-[5px] font-extrabold leading-none transition-[border-color,background-color] duration-150"
                style={{ width: c.fixed ? `calc(${cell} * 0.5)` : cell, height: `calc(${cell} * 1.5)`, fontSize: `calc(${cell} * 0.9)`, borderBottom: `4px solid ${c.line}`, background: c.bg, color: c.fg ?? ACCENT.faceInk, opacity: c.peek ? 0.4 : 1 }}>
                {c.caret && <span aria-hidden className="fc-caret absolute bottom-[7px] left-1/2 -ml-px w-[2.5px] rounded-full" style={{ height: `calc(${cell} * 0.9)`, background: ACCENT.faceInk }} />}
                {c.ch}
              </span>
            ))}
          </div>
        ))}
        <input ref={inputRef} value={typed} readOnly={checked} autoFocus autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          onChange={e => onChange(cleanTyped(e.target.value, n))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } e.stopPropagation(); }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} aria-label={`Gõ ${n} chữ cái`}
          className="absolute inset-0 h-full w-full cursor-text text-[16px] opacity-0" />
      </div>
      <span className="relative z-[2] text-[12.5px] font-bold" style={{ color: MUTE }}>
        {checked ? 'Enter để sang từ tiếp theo' : focus ? `${n} chữ cái · Enter để kiểm tra` : <><span style={{ color: ACCENT.faceInk }}>Gõ phím bất kỳ</span> hoặc bấm vào dòng kẻ để gõ tiếp · {n} chữ cái</>}
      </span>
    </>
  );
}

// ---------- "WorkingEnglish giúp bạn nhớ từ như thế nào?" ----------
export const RATINGS = [
  { rating: 'forgot', label: 'Quên', kb: '1', color: '#F2683A', when: 'Nhìn mà không ra nghĩa', then: 'Mai gặp lại từ này ngay' },
  { rating: 'hard', label: 'Mơ hồ', kb: '2', color: '#D98A1B', when: 'Nhớ được nhưng phải nghĩ lâu', then: 'Vài ngày nữa gặp lại, gần như lần vừa rồi' },
  { rating: 'good', label: 'Nhớ', kb: '3', color: '#1F9D63', when: 'Ra nghĩa trong vài giây', then: 'Lần sau gặp lại cách xa hơn hẳn lần này' },
  { rating: 'easy', label: 'Nhớ rồi', kb: '4', color: '#4F46E5', when: 'Bật ra ngay, không phải nghĩ', then: 'Lâu nhất mới phải gặp lại' },
];
export function HelpModal({ onClose, Icons }) {
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const H = ({ children }) => <p className="m-0 mb-2.5 text-[10.5px] font-black uppercase tracking-[0.16em] text-[#6B6790]">{children}</p>;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(30,27,75,.55)] p-4" onClick={onClose}>
      <div className="td-pop max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF8E7] p-7 text-[#1E1B4B] shadow-[0_8px_0_#1E1B4B]" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="we-display m-0 text-[30px]">WorkingEnglish giúp bạn nhớ từ như thế nào?</h2>
            <p className="m-0 mt-1.5 text-[15px] font-semibold text-[#6B6790]">Mỗi từ trong sổ tay mang theo một cái hẹn riêng — và chính bạn là người đặt nó.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#1E1B4B] bg-white"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-5 text-[15px] font-semibold leading-relaxed">
          <section><H>Vì sao lại có lịch ôn</H>Học xong một từ, chỉ vài ngày sau là bạn bắt đầu quên. Ôn lại quá sớm thì phí công vì bạn vẫn còn nhớ rõ; để quá lâu mới ôn thì gần như phải học lại từ đầu. WorkingEnglish canh nhắc bạn <strong>đúng lúc bạn sắp quên</strong> — nhớ ra được ở đúng lúc đó thì từ sẽ ở lại trong đầu bạn lâu hơn nhiều so với đọc đi đọc lại.</section>
          <section>
            <H>Bốn nút bạn bấm</H>
            <div className="flex flex-col gap-2">
              {RATINGS.map(r => {
                const I = Icons[r.rating];
                return (
                  <div key={r.rating} className="flex items-center gap-3 rounded-[16px] border-2 border-[#1E1B4B] bg-white px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1E1B4B] text-white" style={{ background: r.color }}><I size={18} /></span>
                    <span className="min-w-0 flex-1"><b>{r.label}</b> — {r.when}<span className="block text-[13px] text-[#6B6790]">{r.then}</span></span>
                  </div>
                );
              })}
            </div>
            <p className="m-0 mt-2.5">Con số nhỏ in trên mỗi nút chính là ngày bạn sẽ gặp lại từ này nếu bấm nút đó. <strong>Bạn luôn thấy trước rồi mới chọn</strong> — lịch hẹn luôn hiện sẵn.</p>
          </section>
          <section>
            <H>Một từ mới, lần nào bạn cũng bấm “Nhớ”</H>
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold tabular-nums">
              {[1, 3, 8, 20, 50, 125, 313].map((d, i) => <React.Fragment key={d}>{i > 0 && <span className="text-[#6B6790]">→</span>}<span className="rounded-full border-2 border-[#1E1B4B] bg-[#4F46E5] px-2.5 py-1 text-white">{d} ngày</span></React.Fragment>)}
            </div>
            Chỉ bảy lần xem lại là thuộc, và gần hết bảy lần đó dồn vào nửa năm đầu — lúc từ còn dễ rơi nhất. Về sau gần một năm nó mới ghé lại một lần cho chắc.
          </section>
          <section><H>Vì sao lịch của bạn khác bạn cùng lớp</H>WorkingEnglish theo dõi <strong>riêng từng từ của riêng bạn</strong>. Từ nào bạn hay quên thì nó cho gặp lại dày hơn; từ nào bạn lúc nào cũng nhớ thì nó thưa dần cho bạn đỡ mất thời gian.</section>
          <section><H>Lỡ quên thì sao</H>Không sao đâu, cũng chẳng bị trừ gì cả. Từ đó chỉ quay về đầu hàng và mai bạn gặp lại nó. <strong>Cứ bấm thật đúng những gì bạn thấy</strong> — nếu bấm “Nhớ rồi” cho cả những từ còn lơ mơ, bạn chỉ đang đẩy chúng đi xa vài tháng, rồi gặp lại y như chưa từng học bao giờ.</section>
        </div>
        <button type="button" onClick={onClose} className="we-btn we-btn-indigo mt-6 h-12 w-full">Đã hiểu</button>
      </div>
    </div>
  );
}
