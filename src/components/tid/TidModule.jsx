import React, { Suspense, lazy, useState } from 'react';
import { Headphones, BookOpen, ArrowRight, MessageSquare } from 'lucide-react';
import './tid.css';
import { asset } from './shared';

// Each area lives in its own folder and is code-split, mirroring theieltsdictionary.com/practice/*
const AREAS = {
  listening: lazy(() => import('./listening/ListeningHub')),
  reading: lazy(() => import('./reading/ReadingHub')),
  writing: lazy(() => import('./writing/WritingHub')),
  speaking: lazy(() => import('./speaking/SpeakingHub')),
  vocabulary: lazy(() => import('./vocabulary/VocabularyHub')),
  grammar: lazy(() => import('./grammar/GrammarHub')),
};

const CARDS = [
  { id: 'listening', focus: 'Listening Focus', title: 'IELTS LISTENING', desc: 'Luyện nghe chuẩn đề Cambridge, tăng tốc bắt âm mỗi ngày.', bg: 'assets/tid/background-listening-no-text.webp' },
  { id: 'reading', focus: 'Reading Focus', title: 'IELTS READING', desc: 'Rèn kỹ năng đọc hiểu, scan từ khóa và xử lý bẫy hiệu quả.', bg: 'assets/tid/background-reading-no-text.webp', extra: 'Vào luyện Reading ngay' },
  { id: 'writing', focus: 'Writing Focus', title: 'IELTS WRITING', desc: 'Nâng cấu trúc bài viết, ideas và grammar theo đúng tiêu chí.', bg: 'assets/tid/background-writting-no-text.webp' },
  { id: 'speaking', focus: 'Speaking Focus', title: 'IELTS SPEAKING', desc: 'Luyện phản xạ nói, mở rộng ý và tăng độ tự nhiên khi thi.', bg: 'assets/tid/background-listening-no-text.webp' },
  { id: 'vocabulary', focus: 'Vocabulary Focus', title: 'IELTS VOCABULARY', desc: 'Mở rộng vốn từ theo chủ đề, học collocation và ghi nhớ từ vựng bền vững mỗi ngày.', bg: 'assets/tid/background-vocabulary.webp', wide: true },
];

function SkillCard({ card, onOpen }) {
  return (
    <button onClick={() => onOpen(card.id)} className={`w-full text-left ${card.wide ? 'md:col-span-2' : ''}`}>
      <div className="group relative h-full overflow-hidden rounded-[32px] border border-herb-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform min-h-[340px]">
        <img src={asset(card.bg)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b5a37]/85 via-[#0b5a37]/55 to-transparent" />
        <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-between p-8 md:p-10">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[2px] text-white backdrop-blur-sm">
              <Headphones className="h-3.5 w-3.5" /> {card.focus}
            </div>
            <h2 className="text-2xl font-black leading-[1] tracking-tight text-white md:text-4xl">{card.title}</h2>
            <p className="mt-2 max-w-[360px] text-sm font-semibold leading-relaxed text-white/90 md:max-w-[400px] md:text-base">{card.desc}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-3 rounded-full bg-[#0c4d2f] px-5 py-3 text-sm font-black text-white shadow-xl shadow-black/20 transition-all duration-300 group-hover:bg-[#0a4329]">
              <Headphones className="h-4 w-4" /> Bắt đầu luyện tập ngay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            {card.extra && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur-sm">
                <BookOpen className="h-4 w-4" /> {card.extra}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function PracticeHome({ onOpen }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-16 lg:px-8">
      <div className="mb-16 space-y-4 text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-moss md:text-5xl">
          Hệ Thống Luyện Đề <span className="text-herb-600">IELTS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-500">
          Chọn một kỹ năng để bắt đầu. Luyện tập với áp lực thời gian như thi thật và nhận kết quả chấm chữa ngay lập tức.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {CARDS.map(c => <SkillCard key={c.id} card={c} onOpen={onOpen} />)}
        <button onClick={() => onOpen('grammar')} className="group rounded-[32px] border border-herb-100 bg-white p-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-moss">Grammar</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Hệ thống ngữ pháp IELTS từ B1–B6: tenses, passive voice, relative clauses và hơn thế nữa. Click vào từ trong ví dụ để lưu vào sổ từ vựng.</p>
          <span className="mt-8 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[2px] text-herb-700">Vào luyện tập <ArrowRight className="h-5 w-5" /></span>
        </button>
        <div className="rounded-[32px] border border-herb-100 bg-white p-8 opacity-60 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-herb-400 to-herb-700 text-white shadow-lg">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-moss">Cộng đồng học tập</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Bảng tin hỏi bài, giải đáp câu khó, chia sẻ kinh nghiệm học cùng giáo viên và bạn học. (Tính năng sắp ra mắt)</p>
        </div>
      </div>
    </div>
  );
}

export default function TidModule({ onSaveWord, speechVoice, tidRoute, onClearTidRoute }) {
  const [area, setArea] = useState(() => tidRoute?.area || null);

  React.useEffect(() => {
    if (tidRoute?.area) {
      setArea(tidRoute.area);
    }
  }, [tidRoute]);

  const Area = area && AREAS[area];
  return (
    <div className="tid-root h-full overflow-y-auto bg-[#fbfcf8]">
      {Area ? (
        <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Đang tải…</div>}>
          <Area
            onBack={() => {
              setArea(null);
              if (onClearTidRoute) onClearTidRoute();
            }}
            onSaveWord={onSaveWord}
            speechVoice={speechVoice}
            tidRoute={tidRoute}
          />
        </Suspense>
      ) : (
        <PracticeHome onOpen={setArea} />
      )}
    </div>
  );
}
