import React, { Suspense, lazy, useState } from 'react';
import {
  Headphones,
  BookOpen,
  ArrowRight,
  Sparkles,
  Mic,
  PenTool,
  BookMarked
} from 'lucide-react';
import './tid.css';
import { asset } from './shared';

// Each area lives in its own folder and is code-split
const AREAS = {
  listening: lazy(() => import('./listening/ListeningHub')),
  reading: lazy(() => import('./reading/ReadingHub')),
  writing: lazy(() => import('./writing/WritingHub')),
  speaking: lazy(() => import('./speaking/SpeakingHub')),
  vocabulary: lazy(() => import('./vocabulary/VocabularyHub')),
  grammar: lazy(() => import('./grammar/GrammarHub')),
};

const SKILL_MODULES = [
  {
    id: 'vocabulary',
    focus: 'Vocabulary',
    title: 'Từ vựng & Flashcard',
    desc: 'Hơn 1,500 từ vựng cốt lõi theo chủ đề công sở và đề Cambridge. Ôn lặp lại ngắt quãng và mini game Blast luyện phản xạ.',
    icon: Sparkles,
    bg: '#4F46E5',
    tags: ['1,500+ từ', 'Spaced repetition', 'Blast game'],
    actionText: 'Vào học từ vựng'
  },
  {
    id: 'listening',
    focus: 'Listening',
    title: 'Nghe & Chép chính tả',
    desc: 'Dictation từng câu theo đề Cambridge và video YouTube, luyện tai bắt âm với bài phát âm IPA.',
    icon: Headphones,
    bg: '#2F3654',
    tags: ['Cambridge', 'Dictation', 'IPA'],
    actionText: 'Bắt đầu luyện nghe'
  },
  {
    id: 'reading',
    focus: 'Reading',
    title: 'Đọc hiểu & Báo song ngữ',
    desc: 'Đề Cambridge đầy đủ, lọc theo dạng câu hỏi, cùng báo song ngữ chạm để tra và lưu từ.',
    icon: BookOpen,
    bg: '#3ECF8E',
    ink: true,
    tags: ['Cambridge', 'T/F/NG', 'Song ngữ'],
    actionText: 'Vào luyện đọc'
  },
  {
    id: 'writing',
    focus: 'Writing',
    title: 'Viết & Dàn bài 9 bước',
    desc: 'Dàn ý 9 bước cho Task 1 và Task 2, kho cấu trúc nâng band, collocations công sở và bài mẫu 8.0+.',
    icon: PenTool,
    bg: '#F8BE33',
    ink: true,
    tags: ['Task 1 & 2', 'Bài mẫu', 'Dịch câu'],
    actionText: 'Bắt đầu luyện viết'
  },
  {
    id: 'speaking',
    focus: 'Speaking',
    title: 'Nói & Shadowing',
    desc: 'Đề Speaking Forecast theo quý, shadowing theo video, ghi âm so sánh và phỏng vấn thử.',
    icon: Mic,
    bg: '#F2683A',
    tags: ['Forecast', 'Shadowing', 'Mock test'],
    actionText: 'Luyện phản xạ nói'
  },
  {
    id: 'grammar',
    focus: 'Grammar',
    title: 'Ngữ pháp ứng dụng',
    desc: '7 chuyên đề then chốt từ thì đến mệnh đề quan hệ, đặt câu trong ngữ cảnh công sở.',
    icon: BookMarked,
    bg: '#E06A96',
    tags: ['7 chuyên đề', 'Bài tập', 'Ngữ cảnh'],
    actionText: 'Học ngữ pháp'
  }
];

function SkillCard({ item, index, onOpen }) {
  const Icon = item.icon;
  const fg = item.ink ? '#1E1B4B' : '#FFF8E7';
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="we-card we-card-hover we-pop-in group flex flex-col overflow-hidden text-left"
      style={{ '--we-rot': `${index % 2 ? 0.7 : -0.7}deg`, animationDelay: `${index * 60}ms` }}
    >
      <div className="relative flex items-start justify-between gap-3 border-b-[2.5px] border-[#1E1B4B] p-5" style={{ background: item.bg, color: fg }}>
        <span className="we-icon-tile h-14 w-14 rounded-2xl bg-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
          <Icon className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <span className="we-chip !bg-[#FFF8E7] uppercase">{item.focus}</span>
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-4 h-20 w-20 rounded-full border-[2.5px] border-current opacity-25" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="we-display text-[26px] text-[#1E1B4B]">{item.title}</h3>
        <p className="text-sm font-semibold leading-relaxed text-[var(--text-muted)]">{item.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => <span key={t} className="we-chip !bg-[#FFF8E7] !text-[11px]">{t}</span>)}
        </div>
        <span className="we-btn we-btn-sm mt-auto self-start !px-4 !py-2 group-hover:gap-3" style={{ background: item.bg, color: fg }}>
          {item.actionText}
          <ArrowRight className="h-4 w-4" strokeWidth={2.75} />
        </span>
      </div>
    </button>
  );
}

function PracticeHome({ onOpen, onLookupDictionary, onTryInDoctor, onStartReview }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <section className="we-hero we-pop-in mb-8 px-6 pb-12 pt-8 text-center md:px-10">
        <span className="we-hero-moon" aria-hidden="true" />
        <span className="we-hero-hill" aria-hidden="true" />
        <span className="we-sticker">WorkingEnglish · Luyện 4 kỹ năng</span>
        <h1 className="we-outline mx-auto mt-5 max-w-4xl text-[clamp(36px,5.4vw,68px)]" style={{ '--we-stroke': '6px' }}>
          Hôm nay luyện kỹ năng nào?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-relaxed text-white/90 md:text-base">
          Chọn một kỹ năng để bắt đầu. Toàn bộ từ vựng và tiến độ được đồng bộ xuyên suốt với Sổ từ và Flashcard.
        </p>

        {/* Quick Link bar */}
        {(onLookupDictionary || onTryInDoctor || onStartReview) && (
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
            {onLookupDictionary && (
              <button
                type="button"
                onClick={() => onLookupDictionary('')}
                className="we-btn we-btn-sm !bg-white !text-[#1E1B4B] !text-xs"
              >
                📖 Tra từ điển
              </button>
            )}
            {onTryInDoctor && (
              <button
                type="button"
                onClick={() => onTryInDoctor('')}
                className="we-btn we-btn-sm !bg-white !text-[#1E1B4B] !text-xs"
              >
                🩺 Bác sĩ ngữ pháp
              </button>
            )}
            {onStartReview && (
              <button
                type="button"
                onClick={onStartReview}
                className="we-btn we-btn-sm !bg-[#FEF08A] !text-[#1E1B4B] !text-xs"
              >
                🎯 Ôn tập Flashcard
              </button>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SKILL_MODULES.map((item, i) => (
          <SkillCard key={item.id} item={item} index={i} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function TidModule({
  onSaveWord,
  onRemoveWord,
  speechVoice,
  tidRoute,
  onClearTidRoute,
  initialTopicId,
  onLookupDictionary,
  onTryInDoctor,
  onStartReview
}) {
  const [area, setArea] = useState(() => {
    if (tidRoute?.area) return tidRoute.area;
    if (initialTopicId) {
      if (initialTopicId.startsWith('p1-') || initialTopicId.startsWith('p2-') || initialTopicId.startsWith('p3-') || initialTopicId.startsWith('custom-')) {
        return 'speaking';
      }
      return 'vocabulary';
    }
    return null;
  });

  React.useEffect(() => {
    if (tidRoute?.area) {
      setArea(tidRoute.area);
    } else if (initialTopicId && !area) {
      if (initialTopicId.startsWith('p1-') || initialTopicId.startsWith('p2-') || initialTopicId.startsWith('p3-') || initialTopicId.startsWith('custom-')) {
        setArea('speaking');
      } else {
        setArea('vocabulary');
      }
    }
  }, [tidRoute, initialTopicId]);

  const effectiveRoute = React.useMemo(() => {
    if (tidRoute) return tidRoute;
    if (initialTopicId) {
      if (initialTopicId.startsWith('p1-') || initialTopicId.startsWith('p2-') || initialTopicId.startsWith('p3-') || initialTopicId.startsWith('custom-')) {
        return { area: 'speaking', view: 'mock', topicId: initialTopicId };
      }
      return { area: 'vocabulary', view: 'dash', page: 'flashcard', sessionSel: [initialTopicId] };
    }
    return null;
  });

  const Area = area && AREAS[area];

  return (
    <div className="tid-root w-full min-h-full bg-[var(--we-cream)] text-[#1E1B4B]">
      {Area ? (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center p-20 text-center font-bold text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1E1B4B] border-t-transparent" />
                <span>Đang tải học liệu...</span>
              </div>
            </div>
          }
        >
          <Area
            onBack={() => {
              setArea(null);
              if (onClearTidRoute) onClearTidRoute();
            }}
            onSaveWord={onSaveWord}
            onRemoveWord={onRemoveWord}
            speechVoice={speechVoice}
            tidRoute={effectiveRoute}
            onLookupDictionary={onLookupDictionary}
            onTryInDoctor={onTryInDoctor}
            onStartReview={onStartReview}
          />
        </Suspense>
      ) : (
        <PracticeHome
          onOpen={setArea}
          onLookupDictionary={onLookupDictionary}
          onTryInDoctor={onTryInDoctor}
          onStartReview={onStartReview}
        />
      )}
    </div>
  );
}
