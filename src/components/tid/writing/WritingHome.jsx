import React, { useMemo } from 'react';
import { asset } from '../shared';
import { HERO_ART_HTML } from './heroArt';
import { PxBackButton } from './ui';

const px = name => asset(`assets/tid/writing/pixel/${name}`);

// Same three cards as /practice/writing (faces: idle -> hover)
const CARDS = [
  { page: 'translation', face: ['face-cheeky.webp', 'face-starry.webp'], sign: 'Luyện dịch', hint: 'Dịch câu · dịch essay Band 8–9', bg: '#FFD45C', signBg: '#FF9EB1', tilt: -4, lean: -3 },
  { page: 'tests', face: ['face-content.webp', 'face-laugh.webp'], sign: 'Luyện viết', hint: 'Đề thi thật Task 1 & 2 · tự chấm band', bg: '#A9E2FA', signBg: '#FFE066', tilt: 3, lean: 3 },
  { page: 'samples', face: ['face-wow.webp', 'face-love.webp'], sign: 'Sample 8.0 Writing', hint: '150 bài mẫu Task 2 · song ngữ', bg: '#7DE2AE', signBg: '#C7B2FF', tilt: -3, lean: -3 },
];

export default function WritingHome({ onBack, go }) {
  const heroHtml = useMemo(() => ({ __html: HERO_ART_HTML.replace('__DINO__', px('dino-plain.webp')) }), []);
  return (
    <div className="wr-px-root min-h-full w-full overflow-x-clip bg-white">
      <header className="relative overflow-hidden bg-[linear-gradient(180deg,#F7A35C_0%,#F9C27A_45%,#FCE0A8_75%,#FDEBC4_100%)] pb-[320px] sm:pb-[440px]">
        <div aria-hidden="true" className="wr-px-art pointer-events-none absolute inset-0 max-sm:[zoom:0.72]" dangerouslySetInnerHTML={heroHtml} />
        <div className="relative z-[3] mx-auto flex max-w-[1440px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,40px)] pt-[40px] text-center">
          <PxBackButton onClick={onBack} label="Quay lại chọn kỹ năng" />
          <span className="mt-2.5 inline-flex -rotate-2 items-center rounded-full border-[3px] border-[#1F2A1A] bg-[#D6362E] px-5 py-2 text-[clamp(15px,1.5vw,18px)] font-extrabold tracking-[.08em] text-white shadow-[0_4px_0_#1F2A1A]">
            IELTS WRITING PRACTICE
          </span>
          <h1 className="wr-px-display wr-px-outline m-0 flex flex-wrap justify-center gap-x-[.35em] text-[clamp(46px,8.4vw,120px)] uppercase leading-[1.1] [--px-drop:8px] [--px-stroke:clamp(6px,.9vw,10px)]">
            <span>Thư viện</span>
            <span className="text-[#F8BE33]">Writing</span>
          </h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-[clamp(18px,2.4vw,32px)] px-[clamp(16px,4vw,40px)] pb-[120px] pt-14 md:grid-cols-3">
        {CARDS.map(c => (
          <div key={c.page} role="link" tabIndex={0} onClick={() => go(c.page)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go(c.page))} aria-label={`${c.sign} — ${c.hint}`}
            className="group relative block h-[clamp(270px,34vw,440px)] min-w-0 cursor-pointer overflow-hidden rounded-[28px] border-4 border-[#1F2A1A] text-left shadow-[0_10px_0_#1F2A1A] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_14px_0_#1F2A1A] active:translate-y-1 active:shadow-[0_6px_0_#1F2A1A]"
            style={{ background: c.bg, '--tilt': `${c.tilt}deg`, '--tilt-hover': `${-(0.6 * c.tilt)}deg`, '--lean': `${c.lean}deg` }}>
            <span className="relative z-[2] m-3.5 inline-flex max-w-[calc(100%-28px)] items-center rounded-full border-2 border-[#1F2A1A] bg-white/85 px-3 py-1 text-[13px] font-bold leading-snug text-[#1F2A1A] sm:text-sm">{c.hint}</span>
            <span className="absolute bottom-[3%] left-1/2 aspect-square h-[78%] max-w-[96%] -translate-x-1/2 transition-[translate,scale,rotate] duration-300 ease-[cubic-bezier(.3,1.7,.5,1)] group-hover:-translate-y-2.5 group-hover:scale-[1.06] group-hover:rotate-[var(--lean)] group-focus-visible:-translate-y-2.5 group-focus-visible:scale-[1.06] group-focus-visible:rotate-[var(--lean)]">
              <img src={px(c.face[0])} alt="" draggable={false} className="absolute inset-0 size-full object-contain object-bottom group-hover:opacity-0" />
              <img src={px(c.face[1])} alt="" draggable={false} className="absolute inset-0 size-full object-contain object-bottom opacity-0 group-hover:opacity-100" />
              <span aria-hidden="true"
                className="absolute inset-x-[4%] bottom-[19%] flex rotate-[var(--tilt)] items-center justify-center border-4 border-[#1F2A1A] px-2.5 py-[clamp(12px,1.4vw,20px)] text-center font-[family-name:var(--font-space-mono)] text-[clamp(20px,2.3vw,32px)] font-bold leading-[1.1] tracking-[.02em] text-white transition-[translate,scale,rotate] duration-300 ease-[cubic-bezier(.3,1.7,.5,1)] [text-shadow:-2px_0_0_#1F2A1A,2px_0_0_#1F2A1A,0_-2px_0_#1F2A1A,0_2px_0_#1F2A1A,3px_3px_0_#1F2A1A] [text-wrap:balance] shadow-[inset_-5px_-5px_0_rgba(31,42,26,.22),inset_5px_5px_0_rgba(255,255,255,.65),5px_5px_0_#1F2A1A] group-hover:-translate-y-1 group-hover:scale-[1.08] group-hover:rotate-[var(--tilt-hover)] md:text-[clamp(16px,2.3vw,32px)]"
                style={{ background: c.signBg }}>
                {c.sign}
                <img src={px('dino-claw.webp')} alt="" className="absolute left-[12%] top-[calc(clamp(24px,2.8vw,38px)*-0.55)] w-[clamp(24px,2.8vw,38px)]" />
                <img src={px('dino-claw.webp')} alt="" className="absolute right-[12%] top-[calc(clamp(24px,2.8vw,38px)*-0.55)] w-[clamp(24px,2.8vw,38px)]" />
              </span>
            </span>
          </div>
        ))}
      </main>
    </div>
  );
}
