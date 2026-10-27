import React from 'react';
import { ArrowRight, BookMarked, Languages, PenLine } from 'lucide-react';
import { SkillHero } from '../weKit';

const CARDS = [
  { page: 'translation', icon: Languages, title: 'Luyện dịch', hint: 'Dịch câu và dịch essay Band 8–9, so với bản mẫu từng câu.', bg: '#F8BE33', rot: '-0.8deg' },
  { page: 'tests', icon: PenLine, title: 'Luyện viết', hint: 'Đề thi thật Task 1 & 2, dàn ý 9 bước và tự chấm band.', bg: '#7CC4F2', rot: '0.6deg' },
  { page: 'samples', icon: BookMarked, title: 'Bài mẫu 8.0', hint: '150 bài mẫu Task 2 song ngữ, lưu cấu trúc hay vào sổ.', bg: '#3ECF8E', rot: '-0.5deg' },
];

export default function WritingHome({ onBack, go }) {
  return (
    <div className="we-page w-full">
      <SkillHero
        variant="writing"
        onBack={onBack}
        eyebrow="WorkingEnglish · Writing Lab"
        title="Viết"
        accent="Mạch lạc, đúng band"
        subtitle="Dàn ý 9 bước cho Task 1 và Task 2, kho cấu trúc nâng band, luyện dịch câu và thư viện bài mẫu song ngữ."
      />
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-[clamp(20px,4vw,48px)] pb-[120px] pt-10 md:grid-cols-3">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <button key={c.page} type="button" onClick={() => go(c.page)}
              className="we-card we-card-hover we-pop-in group flex min-h-[300px] flex-col overflow-hidden text-left"
              style={{ '--we-rot': c.rot, animationDelay: `${i * 70}ms` }}>
              <div className="relative grid h-36 place-items-center overflow-hidden border-b-[2.5px] border-[#1E1B4B]" style={{ background: c.bg }}>
                <span aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 22px, rgba(30,27,75,.18) 22px 24px)' }} />
                <span className="we-icon-tile relative h-20 w-20 rounded-[22px] bg-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="h-10 w-10" strokeWidth={2.25} />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="we-display text-[28px] text-[#1E1B4B]">{c.title}</span>
                <span className="flex-1 text-[15px] font-semibold leading-relaxed text-[var(--text-muted)]">{c.hint}</span>
                <span className="we-btn we-btn-sm mt-2 self-start" style={{ background: c.bg }}>Vào luyện <ArrowRight className="h-4 w-4" /></span>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
