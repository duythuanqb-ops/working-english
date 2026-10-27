// IELTS Grammar area (WorkingEnglish skin): topic list + lesson player.
import React, { lazy, Suspense, useState } from 'react';
import { ArrowRight, Clock, FileText, Hash, MapPin, RotateCcw, Zap } from 'lucide-react';
import index from '../../../data/tid/grammar/index.json';
import { SectionHeading, SkillHero } from '../weKit';

const GrammarLesson = lazy(() => import('./GrammarLesson'));
const ICONS = { Clock, Zap, RotateCcw, Hash, FileText, MapPin };

export const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.18) 1px,transparent 1px)',
  backgroundSize: '24px 24px',
};

function Hub({ onOpen, onBack }) {
  const offline = id => !index.available.includes(id);
  return (
    <div className="we-page">
      <SkillHero
        variant="grammar"
        onBack={onBack}
        eyebrow="WorkingEnglish · Grammar Gym"
        title="Ngữ pháp"
        accent="Ráp câu chuẩn band 7+"
        subtitle="25 chủ đề từ dạng thức từ tới cấu trúc nâng cao. Mỗi mục có lý thuyết ngắn gọn và bài trắc nghiệm giải thích từng câu."
        stats={[
          { value: index.grm.length, label: 'chủ đề toàn tập' },
          { value: index.advanced.length, label: 'bài nâng cao' },
        ]}
      />
      <main className="mx-auto flex max-w-[1100px] flex-col gap-10 px-[clamp(20px,4vw,48px)] pb-24 pt-10">
        <section className="we-card p-5 md:p-7">
          <SectionHeading title="Ngữ pháp toàn tập" tag="Từ cơ bản" tagColor="#4F46E5" />
          <p className="mb-5 mt-2 max-w-2xl text-[14px] font-semibold leading-[1.7] text-[var(--text-muted)]">Mỗi chủ đề gồm nhiều mục nhỏ có lý thuyết và bài tập riêng, kèm bài tổng hợp trộn tất cả các mục.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {index.grm.map((l, i) => (
              <button key={l.id} onClick={() => onOpen(l.lesson_id)} className="group flex items-center gap-3.5 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] px-4 py-3 text-left transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-[#FFF0C2] hover:shadow-[var(--we-pop-sm)]">
                <span className="we-display grid h-9 w-9 flex-none place-items-center rounded-xl border-[2.5px] border-[#1E1B4B] text-sm" style={{ background: ['#F8BE33', '#3ECF8E', '#7CC4F2', '#E06A96'][i % 4] }}>{i + 1}</span>
                <span className="min-w-0 flex-1 text-[14px] font-extrabold">{l.title}</span>
                {offline(l.lesson_id) && <span title="Nội dung bài này chưa có trong dữ liệu offline" className="we-chip !border-dashed !py-0 !text-[10px] !text-[var(--text-muted)]">chưa có offline</span>}
                <ArrowRight size={16} strokeWidth={2.75} className="flex-none transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </section>

        <section className="we-card p-5 md:p-7">
          <SectionHeading title="Nâng cao" tag="Band 7+" />
          <div className="mt-5 flex flex-col gap-3">
            {index.advanced.map(l => {
              const Icon = ICONS[l.icon] || Hash;
              return (
                <button key={l.lessonId} onClick={() => onOpen(l.lessonId)} className="group flex items-center justify-between gap-4 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white px-4 py-4 text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--we-pop)]">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="we-icon-tile h-12 w-12" style={{ background: l.iconBg, color: l.iconColor }}><Icon size={20} strokeWidth={2.5} /></span>
                    <div className="min-w-0">
                      <span className="we-chip !py-0 !text-[10px]">{l.band}</span>
                      {offline(l.lessonId) && <span className="we-chip ml-1.5 !border-dashed !py-0 !text-[10px] !text-[var(--text-muted)]">chưa có offline</span>}
                      <h3 className="we-display mt-1 text-lg">{l.title}</h3>
                      <p className="mt-0.5 max-w-xl text-[13px] font-semibold leading-[1.6] text-[var(--text-muted)]">{l.desc}</p>
                    </div>
                  </div>
                  <span className="we-btn we-btn-sm flex-none">Học ngay <ArrowRight size={14} /></span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function GrammarHub({ onBack, onSaveWord, speechVoice }) {
  const [lessonId, setLessonId] = useState(null);
  if (lessonId) {
    return (
      <Suspense fallback={<div className="flex h-full items-center justify-center bg-[var(--we-cream)] font-bold text-[#1E1B4B]">Đang tải…</div>}>
        <GrammarLesson lessonId={lessonId} onExit={() => setLessonId(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />
      </Suspense>
    );
  }
  return <Hub onOpen={setLessonId} onBack={onBack} />;
}
