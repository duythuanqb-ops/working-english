// IELTS Grammar area — replica of theieltsdictionary.com/practice/grammar (+ /practice/grammar/[lessonId]).
import React, { lazy, Suspense, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, FileText, Hash, MapPin, RotateCcw, Zap } from 'lucide-react';
import index from '../../../data/tid/grammar/index.json';
import { asset } from '../shared';

const GrammarLesson = lazy(() => import('./GrammarLesson'));
const ICONS = { Clock, Zap, RotateCcw, Hash, FileText, MapPin };

export const GRID_BG = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.18) 1px,transparent 1px)',
  backgroundSize: '24px 24px',
};

function Navbar({ onBack }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <img src={asset('assets/tid/logo.webp')} alt="" className="h-9 w-9 rounded-lg" />
          <span className="font-[family-name:var(--font-quicksand)] text-[19px] font-bold text-[#1e3006]">The IELTS <span className="text-[#6a8042]">Dictionary</span></span>
        </div>
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 shadow-sm transition-colors hover:border-[#6a8042] hover:text-[#6a8042]">
          <ArrowLeft size={15} /> Quay lại chọn kỹ năng
        </button>
      </div>
    </header>
  );
}

function Hub({ onOpen, onBack }) {
  return (
    <div className="min-h-full bg-[#6f8f4b]" style={{ fontFamily: 'var(--font-nunito), sans-serif', ...GRID_BG }}>
      <Navbar onBack={onBack} />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-8 md:px-6">
        <div className="mb-6 rounded-[20px] border-4 border-[#111] bg-white px-6 py-6 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:px-8 md:py-7">
          <p className="font-[family-name:var(--font-quicksand)] text-[13px] font-bold uppercase tracking-[3px] text-[#8a8672]">Ngữ pháp IELTS</p>
          <h1 className="mt-1 font-[family-name:var(--font-quicksand)] text-[28px] font-extrabold leading-tight text-[#111] md:text-[36px]">GRAMMAR REFERENCE</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-[#444]">25 chủ đề ngữ pháp cho IELTS, từ dạng thức từ tới các cấu trúc Band 7+. Mỗi mục có lý thuyết chi tiết và bài tập trắc nghiệm giải thích từng câu.</p>
        </div>

        <div className="mb-12 rounded-[20px] border-4 border-[#111] bg-white p-5 shadow-[8px_8px_0_rgba(0,0,0,0.12)] md:p-7">
          <p className="font-[family-name:var(--font-quicksand)] text-[12px] font-bold uppercase tracking-[3px] text-[#8a8672]">Toàn tập</p>
          <h2 className="mt-1 font-[family-name:var(--font-quicksand)] text-[22px] font-extrabold text-[#111]">NGỮ PHÁP TOÀN TẬP</h2>
          <p className="mb-5 mt-2 max-w-2xl text-[14px] leading-[1.7] text-[#555]">Mỗi chủ đề gồm nhiều mục nhỏ có lý thuyết chi tiết và bài tập riêng — kể cả bài tổng hợp trộn tất cả các mục.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {index.grm.map((l, i) => (
              <button key={l.id} onClick={() => onOpen(l.lesson_id)} className="group flex items-center gap-3.5 rounded-2xl border-2 border-[#111] bg-[#fffdf5] px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:bg-[#ffd6e0] hover:shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border-2 border-[#111] bg-[#e8f0c9] font-[family-name:var(--font-quicksand)] text-[13px] font-extrabold text-[#111]">{i + 1}</span>
                <span className="min-w-0 flex-1 font-[family-name:var(--font-quicksand)] text-[14px] font-bold text-[#111]">{l.title}</span>
                {!index.available.includes(l.lesson_id) && <span title="Nội dung bài này chưa có trong dữ liệu offline" className="flex-none rounded-full border border-[#d6d3c4] px-2 py-px text-[10px] font-bold text-[#8a8672]">chưa có offline</span>}
                <ArrowRight size={15} className="flex-none text-[#5f6a45] transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border-4 border-[#111] bg-white p-5 shadow-[8px_8px_0_rgba(0,0,0,0.12)] md:p-7">
          <p className="font-[family-name:var(--font-quicksand)] text-[12px] font-bold uppercase tracking-[3px] text-[#8a8672]">Nâng cao</p>
          <h2 className="mb-5 mt-1 font-[family-name:var(--font-quicksand)] text-[22px] font-extrabold text-[#111]">ADVANCED GRAMMAR</h2>
          <div className="flex flex-col gap-3">
            {index.advanced.map(l => {
              const Icon = ICONS[l.icon] || Hash;
              return (
                <button key={l.lessonId} onClick={() => onOpen(l.lessonId)} className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-[#111] bg-[#fffdf5] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:bg-[#ffd6e0] hover:shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border-2 border-[#111]" style={{ background: l.iconBg, color: l.iconColor }}><Icon size={20} /></span>
                    <div className="min-w-0">
                      <span className="inline-block rounded-full border-2 border-[#111] bg-white px-2 py-px text-[10px] font-extrabold tracking-wider text-[#111]">{l.band}</span>
                      {!index.available.includes(l.lessonId) && <span className="ml-1.5 inline-block rounded-full border border-[#d6d3c4] px-2 py-px text-[10px] font-bold text-[#8a8672]">chưa có offline</span>}
                      <h3 className="mt-1 font-[family-name:var(--font-quicksand)] text-[16px] font-extrabold text-[#111]">{l.title}</h3>
                      <p className="mt-0.5 max-w-xl text-[13px] leading-[1.6] text-[#555]">{l.desc}</p>
                    </div>
                  </div>
                  <span className="flex flex-none items-center gap-1.5 text-[13px] font-bold text-[#5f6a45]">Học ngay <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GrammarHub({ onBack, onSaveWord, speechVoice }) {
  const [lessonId, setLessonId] = useState(null);
  if (lessonId) {
    return (
      <Suspense fallback={<div className="flex h-full items-center justify-center bg-[#6f8f4b] font-bold text-white">Đang tải…</div>}>
        <GrammarLesson lessonId={lessonId} onExit={() => setLessonId(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />
      </Suspense>
    );
  }
  return <Hub onOpen={setLessonId} onBack={onBack} />;
}
