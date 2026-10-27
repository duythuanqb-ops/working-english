// WorkingEnglish skill-page kit: hero, back button, Cambridge badge and the hand-drawn SVG scenes.
// Styles live in styles/workingenglish-pop.css (.we-skill-*, .we-page).
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const INK = '#1E1B4B';

export function WeBackLink({ onClick, label, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`we-btn we-btn-white we-btn-sm self-start !px-4 !py-2 ${className}`}>
      <ArrowLeft className="h-4 w-4" strokeWidth={2.75} />
      {label}
    </button>
  );
}

/** Small "CAM" tag used wherever a Cambridge book is referenced. */
export function CamBadge({ className = '' }) {
  return (
    <span aria-label="Cambridge" className={`inline-grid shrink-0 place-items-center rounded-md border-2 border-[#1E1B4B] bg-[#4F46E5] px-1 text-[0.6em] font-black leading-[1.5] tracking-wider text-white ${className}`}>
      CAM
    </span>
  );
}

/** Animated equalizer: the WorkingEnglish "listening" motif. */
export function SoundBars({ count = 14, className = '', color = 'var(--we-sun)' }) {
  return (
    <span aria-hidden="true" className={`we-bars ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ background: color, animationDelay: `${(i * 137) % 900}ms`, height: `${30 + ((i * 53) % 70)}%` }} />
      ))}
    </span>
  );
}

function ListeningScene() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <circle cx="190" cy="150" r="112" fill="#F8BE33" stroke={INK} strokeWidth="5" />
      <circle cx="190" cy="150" r="80" fill="none" stroke="#FFF8E7" strokeWidth="4" strokeDasharray="6 12" className="we-spin-slow" style={{ transformOrigin: '190px 150px' }} />
      {/* headphones */}
      <g className="we-bob">
        <path d="M110 165 C110 85 270 85 270 165" fill="none" stroke={INK} strokeWidth="22" strokeLinecap="round" />
        <path d="M110 165 C110 85 270 85 270 165" fill="none" stroke="#4F46E5" strokeWidth="11" strokeLinecap="round" />
        <rect x="86" y="150" width="50" height="78" rx="20" fill="#F2683A" stroke={INK} strokeWidth="5" />
        <rect x="244" y="150" width="50" height="78" rx="20" fill="#F2683A" stroke={INK} strokeWidth="5" />
        <rect x="98" y="166" width="12" height="44" rx="6" fill="#FFF8E7" opacity=".7" />
        <rect x="256" y="166" width="12" height="44" rx="6" fill="#FFF8E7" opacity=".7" />
      </g>
      {/* notes */}
      <g className="we-drift" fill={INK}>
        <path d="M44 92 v-38 l26 -7 v36" fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <ellipse cx="38" cy="94" rx="10" ry="8" />
        <ellipse cx="64" cy="85" rx="10" ry="8" />
      </g>
      <g className="we-drift" style={{ animationDelay: '-1.4s' }}>
        <path d="M318 70 v-34" stroke={INK} strokeWidth="5" />
        <path d="M318 36 q14 6 12 22" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="311" cy="72" rx="10" ry="8" fill="#FFF8E7" stroke={INK} strokeWidth="4" />
      </g>
      <g fill="#FFF8E7" stroke={INK} strokeWidth="3">
        <path d="M330 210 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" className="we-twinkle" />
        <path d="M40 200 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z" className="we-twinkle" style={{ animationDelay: '-.8s' }} />
      </g>
    </svg>
  );
}

function ReadingScene() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <rect x="64" y="40" width="250" height="220" rx="110" fill="#E0E7FF" stroke={INK} strokeWidth="5" />
      {/* newspaper card */}
      <g className="we-bob" style={{ animationDelay: '-.6s' }}>
        <g transform="rotate(-9 250 90)">
          <rect x="200" y="40" width="112" height="100" rx="10" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="212" y="54" width="60" height="10" rx="3" fill={INK} />
          <rect x="212" y="72" width="40" height="34" rx="4" fill="#3ECF8E" stroke={INK} strokeWidth="3" />
          <rect x="258" y="74" width="40" height="6" rx="3" fill="#C7C3DE" />
          <rect x="258" y="88" width="40" height="6" rx="3" fill="#C7C3DE" />
          <rect x="258" y="102" width="30" height="6" rx="3" fill="#C7C3DE" />
          <rect x="212" y="116" width="86" height="6" rx="3" fill="#C7C3DE" />
        </g>
      </g>
      {/* open book */}
      <g className="we-bob">
        <path d="M60 150 Q120 128 182 156 L182 262 Q120 236 60 254 Z" fill="#fff" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M304 150 Q244 128 182 156 L182 262 Q244 236 304 254 Z" fill="#FFF8E7" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M52 160 L52 262 Q118 242 182 270 Q246 242 312 262 L312 160" fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <g stroke="#C7C3DE" strokeWidth="6" strokeLinecap="round">
          <path d="M80 172 Q120 160 162 176" /><path d="M80 194 Q120 182 162 198" /><path d="M80 216 Q112 206 140 216" />
          <path d="M202 176 Q244 160 284 172" /><path d="M202 198 Q244 182 284 194" />
        </g>
        <path d="M220 214 Q248 202 284 214" stroke="#F8BE33" strokeWidth="10" strokeLinecap="round" />
      </g>
      {/* magnifier */}
      <g className="we-drift" style={{ animationDelay: '-2s' }}>
        <circle cx="86" cy="92" r="30" fill="#DCF0FD" stroke={INK} strokeWidth="6" />
        <path d="M108 114 L132 138" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d="M72 80 q8 -8 18 -6" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <path d="M330 220 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#F8BE33" stroke={INK} strokeWidth="3" className="we-twinkle" />
    </svg>
  );
}


function SpeakingScene() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <circle cx="180" cy="160" r="110" fill="#FFF8E7" stroke={INK} strokeWidth="5" />
      {/* speech bubbles */}
      <g className="we-bob" style={{ animationDelay: '-.8s' }}>
        <path d="M28 52 h116 a16 16 0 0 1 16 16 v40 a16 16 0 0 1 -16 16 h-74 l-22 20 v-20 h-20 a16 16 0 0 1 -16 -16 v-40 a16 16 0 0 1 16 -16z" fill="#fff" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <text x="86" y="98" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="26" fill={INK}>Hello!</text>
      </g>
      <g className="we-bob" style={{ animationDelay: '-2s' }}>
        <path d="M232 34 h90 a14 14 0 0 1 14 14 v34 a14 14 0 0 1 -14 14 h-10 v18 l-20 -18 h-60 a14 14 0 0 1 -14 -14 v-34 a14 14 0 0 1 14 -14z" fill="#F8BE33" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="252" cy="65" r="6" fill={INK} /><circle cx="277" cy="65" r="6" fill={INK} /><circle cx="302" cy="65" r="6" fill={INK} />
      </g>
      {/* microphone */}
      <g className="we-bob">
        <rect x="140" y="104" width="80" height="124" rx="40" fill="#4F46E5" stroke={INK} strokeWidth="6" />
        <g stroke="#FFF8E7" strokeWidth="5" strokeLinecap="round" opacity=".8">
          <path d="M158 140 h44" /><path d="M158 160 h44" /><path d="M158 180 h44" />
        </g>
        <path d="M120 190 a60 60 0 0 0 120 0" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <path d="M180 250 v26" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M146 280 h68" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      </g>
      {/* sound arcs */}
      <g fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" className="we-twinkle">
        <path d="M262 150 q16 22 0 44" /><path d="M284 136 q28 36 0 72" />
      </g>
      <g fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" className="we-twinkle" style={{ animationDelay: '-1.1s' }}>
        <path d="M98 150 q-16 22 0 44" /><path d="M76 136 q-28 36 0 72" />
      </g>
    </svg>
  );
}

function WritingScene() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <circle cx="190" cy="150" r="112" fill="#FFF0C2" stroke={INK} strokeWidth="5" />
      <g className="we-bob" style={{ animationDelay: '-1s' }}>
        <g transform="rotate(-6 170 160)">
          <rect x="88" y="54" width="170" height="214" rx="14" fill="#fff" stroke={INK} strokeWidth="5" />
          <rect x="88" y="54" width="170" height="40" rx="14" fill="#E06A96" stroke={INK} strokeWidth="5" />
          <text x="173" y="82" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="20" fill="#fff">TASK 2</text>
          <g stroke="#C7C3DE" strokeWidth="6" strokeLinecap="round">
            <path d="M108 120 h130" /><path d="M108 144 h130" /><path d="M108 168 h96" /><path d="M108 192 h130" /><path d="M108 216 h70" />
          </g>
          <path d="M108 120 h70" stroke="#4F46E5" strokeWidth="6" strokeLinecap="round" />
          <circle cx="226" cy="236" r="18" fill="#3ECF8E" stroke={INK} strokeWidth="4" />
          <text x="226" y="243" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="18" fill={INK}>8</text>
        </g>
      </g>
      {/* pencil */}
      <g className="we-drift">
        <g transform="rotate(38 280 150)">
          <rect x="262" y="40" width="34" height="150" rx="6" fill="#F8BE33" stroke={INK} strokeWidth="5" />
          <rect x="262" y="40" width="34" height="26" rx="6" fill="#F2683A" stroke={INK} strokeWidth="5" />
          <path d="M262 190 L279 228 L296 190 Z" fill="#FFF8E7" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M273 214 L279 228 L285 214 Z" fill={INK} />
        </g>
      </g>
      <path d="M40 210 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#fff" stroke={INK} strokeWidth="3" className="we-twinkle" />
    </svg>
  );
}

function GrammarScene() {
  const blocks = [
    { x: 54, y: 196, w: 92, c: '#4F46E5', t: 'If', fg: '#fff' },
    { x: 150, y: 196, w: 118, c: '#F8BE33', t: 'I had', fg: INK },
    { x: 92, y: 138, w: 130, c: '#3ECF8E', t: 'known,', fg: INK },
    { x: 226, y: 138, w: 92, c: '#fff', t: 'I', fg: INK },
    { x: 120, y: 80, w: 160, c: '#F2683A', t: "would've", fg: '#fff' },
  ];
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <circle cx="186" cy="150" r="114" fill="#FFF8E7" stroke={INK} strokeWidth="5" />
      {blocks.map((b, i) => (
        <g key={b.t} className="we-bob" style={{ animationDelay: `${-i * 0.5}s` }}>
          <rect x={b.x} y={b.y} width={b.w} height="50" rx="12" fill={b.c} stroke={INK} strokeWidth="5" />
          <text x={b.x + b.w / 2} y={b.y + 34} textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="24" fill={b.fg}>{b.t}</text>
        </g>
      ))}
      <g className="we-drift">
        <circle cx="300" cy="64" r="24" fill="#3ECF8E" stroke={INK} strokeWidth="5" />
        <path d="M289 64 l8 8 l15 -16" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M40 90 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#F8BE33" stroke={INK} strokeWidth="3" className="we-twinkle" />
    </svg>
  );
}

function VocabularyScene() {
  const cards = [
    { r: -14, x: 96, c: '#F2683A', w: 'focus', fg: '#fff' },
    { r: 0, x: 130, c: '#fff', w: 'resilient', fg: INK },
    { r: 13, x: 166, c: '#3ECF8E', w: 'leverage', fg: INK },
  ];
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      <circle cx="186" cy="156" r="112" fill="#F8BE33" stroke={INK} strokeWidth="5" />
      {cards.map((c, i) => (
        <g key={c.w} className="we-bob" style={{ animationDelay: `${-i * 0.7}s` }}>
          <g transform={`rotate(${c.r} ${c.x + 60} 240)`}>
            <rect x={c.x} y="70" width="120" height="164" rx="16" fill={c.c} stroke={INK} strokeWidth="5" />
            <text x={c.x + 60} y="150" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="21" fill={c.fg}>{c.w}</text>
            <rect x={c.x + 26} y="168" width="68" height="7" rx="3.5" fill={c.fg} opacity=".35" />
          </g>
        </g>
      ))}
      <g className="we-drift">
        <circle cx="306" cy="72" r="26" fill="#4F46E5" stroke={INK} strokeWidth="5" />
        <path d="M306 58 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1z" fill="#F8BE33" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <path d="M40 220 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#fff" stroke={INK} strokeWidth="3" className="we-twinkle" />
    </svg>
  );
}

const SCENES = { listening: ListeningScene, reading: ReadingScene, speaking: SpeakingScene, writing: WritingScene, grammar: GrammarScene, vocabulary: VocabularyScene };

/**
 * Split hero used by the skill hubs: copy on the left, a hand-drawn scene on the right,
 * finished with a wavy edge that melts into the cream page.
 */
export function SkillHero({ variant, onBack, backLabel = 'Chọn kỹ năng khác', eyebrow, title, accent, subtitle, stats = [], children }) {
  const Scene = SCENES[variant];
  return (
    <header className={`we-skill-hero we-skill-hero--${variant}`}>
      <div className="relative z-[2] mx-auto grid max-w-[1280px] items-center gap-6 px-[clamp(20px,4vw,48px)] pb-24 pt-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          {onBack && <WeBackLink onClick={onBack} label={backLabel} />}
          <span className="we-sticker">{eyebrow}</span>
          <h1 className="we-outline m-0 text-[clamp(48px,7.2vw,96px)] uppercase" style={{ '--we-stroke': 'clamp(6px,.8vw,9px)', '--we-drop': '7px' }}>
            {title}
            {accent && <span className="block text-[var(--we-sun)]">{accent}</span>}
          </h1>
          <p className="m-0 max-w-[600px] text-[clamp(16px,1.6vw,19px)] font-semibold leading-relaxed text-white/90 [text-wrap:pretty]">{subtitle}</p>
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {stats.map(s => (
                <span key={s.label} className="we-chip !gap-2 !bg-white/95 !px-3.5 !py-1.5 !text-[13px]">
                  <b className="we-display text-base text-[#4F46E5]">{s.value}</b>{s.label}
                </span>
              ))}
            </div>
          )}
          {children}
        </div>
        {Scene && (
          <div className="relative mx-auto hidden aspect-[6/5] w-full max-w-[460px] md:block">
            <Scene />
          </div>
        )}
      </div>
      <svg className="we-skill-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C 180 90 360 0 540 34 S 900 80 1080 30 S 1320 10 1440 44 V80 H0Z" fill="var(--we-cream)" stroke={INK} strokeWidth="4" />
      </svg>
    </header>
  );
}

/** Big section heading with an optional coloured tag, used down the skill pages. */
export function SectionHeading({ title, tag, tagColor = 'var(--we-coral)', right }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="we-display m-0 text-[clamp(26px,3vw,38px)] uppercase text-[var(--we-ink)]">{title}</h2>
      {tag && <span className="we-chip -rotate-2 !py-1 uppercase text-white" style={{ background: tagColor }}>{tag}</span>}
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}
