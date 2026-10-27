import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, BookMarked, BookOpen, ChevronRight, CloudOff, Layers, Lock, PenLine, Sparkles, Target, CheckCircle2, Zap } from 'lucide-react';
import { DICHCAU, SAMPLES, SAMPLE_TOPICS, dichCauProgress } from './data';
import { Modal, ProgressChip } from './ui';

const STEPS = [
  {
    id: 'Bước 1',
    title: 'Cấu trúc câu cơ bản',
    desc: 'Luyện dịch các câu đơn từ Việt sang Anh. Tập trung vào việc sử dụng đúng thì, mạo từ và cấu trúc câu S-V-O cơ bản.',
    tag: null,
    icon: PenLine,
    color: '#7CC4F2',
    accentText: 'text-[#1E1B4B]',
  },
  {
    id: 'Bước 2',
    title: 'Collocations & Vocab',
    desc: 'Dịch từ Anh sang Việt để nắm vững các cụm từ (collocations) và từ vựng học thuật theo ngữ cảnh thực tế.',
    tag: { text: 'VOCAB', bg: '#FEE2E2', border: '#EF4444' },
    icon: Sparkles,
    color: '#F2683A',
    accentText: 'text-white',
  },
  {
    id: 'Bước 3',
    title: 'Dịch đoạn văn Band 6.5',
    desc: 'Luyện dịch các đoạn văn ngắn từ Việt sang Anh với mục tiêu đạt độ chính xác và mạch lạc ở mức Band 6.5.',
    tag: { text: 'BAND 6.5', bg: '#FEF3C7', border: '#F59E0B' },
    icon: Target,
    color: '#F8BE33',
    accentText: 'text-[#1E1B4B]',
  },
  {
    id: 'Bước 4',
    title: 'Dịch đoạn văn Band 8.0',
    desc: 'Thử thách dịch các đoạn văn phức tạp, yêu cầu sử dụng từ vựng ít phổ biến và cấu trúc câu linh hoạt của Band 8.0.',
    tag: { text: 'BAND 8.0', bg: '#E0E7FF', border: '#6366F1' },
    icon: Award,
    color: '#4F46E5',
    accentText: 'text-white',
  },
  {
    id: 'Bước 5',
    title: 'Dịch Essay hoàn chỉnh',
    desc: 'Luyện dịch nguyên một bài Essay từ dàn ý tiếng Việt sang bài viết tiếng Anh học thuật hoàn chỉnh.',
    tag: { text: 'PREMIUM', bg: '#FCE7F3', border: '#EC4899' },
    icon: Layers,
    color: '#E06A96',
    accentText: 'text-white',
  },
  {
    id: 'Band 8',
    title: 'Dịch Essay Band 8 theo chủ đề',
    desc: '150 bài mẫu Band 8 chia theo 15 chủ đề Task 2 — bước đệm trước khi lên Band 9. Dịch từng câu từ Việt sang Anh, xong bài tự chuyển sang bài kế tiếp.',
    tag: { text: 'BAND 8', bg: '#E0E7FF', border: '#6366F1' },
    icon: BookMarked,
    color: '#4F46E5',
    accentText: 'text-white',
    band: 8,
  },
  {
    id: 'Band 9',
    title: 'Dịch Essay Band 9 theo chủ đề',
    desc: '150 bài mẫu Band 9 chia theo 15 chủ đề Task 2. Dịch từng câu từ Việt sang Anh, xong bài tự chuyển sang bài kế tiếp.',
    tag: { text: 'BAND 9', bg: '#D1FAE5', border: '#10B981' },
    icon: BookOpen,
    color: '#3ECF8E',
    accentText: 'text-[#1E1B4B]',
    band: 9,
  },
];

// Purple mosaic decoration of the "Tự tạo" card
function Mosaic() {
  const [c1, c2, c3, c4, c5] = ['bg-[#A28EC8]', 'bg-[#4B3D84]', 'bg-[#7664A9]', 'bg-[#3D2F6B]', 'bg-[#2B204F]'];
  const cell = (outer, inner, shape) => (
    <div className={`relative overflow-hidden ${outer}`}>
      <div className={`absolute ${shape} ${inner}`} />
    </div>
  );
  return (
    <div className="pointer-events-none absolute right-0 top-0 grid h-full w-[70%] grid-cols-4 grid-rows-3 opacity-[0.85] mix-blend-multiply sm:w-[55%] md:w-[45%]">
      {cell('', c3, 'bottom-0 right-0 h-[80%] w-[80%] rounded-tl-full')}
      {cell(c2, c1, 'bottom-0 left-0 h-[120%] w-[120%] rounded-tr-full')}
      {cell(c3, c4, 'left-0 top-0 h-full w-full rounded-br-full')}
      {cell(c4, c2, 'right-0 top-0 h-full w-full rounded-bl-full')}
      {cell('', c5, 'right-0 top-1/2 h-[100%] w-[60%] -translate-y-1/2 rounded-l-full')}
      <div className={`relative overflow-hidden ${c4}`}>
        <div className={`absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full ${c1}`} />
        <div className={`absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full ${c2}`} />
      </div>
      {cell(c1, c3, 'bottom-0 right-0 h-full w-full rounded-tl-full')}
      {cell(c5, c1, 'left-0 top-0 h-full w-full rounded-br-full')}
      {cell('', c2, 'right-0 top-0 h-[90%] w-[90%] rounded-bl-full')}
      {cell(c1, c2, 'left-0 top-0 h-full w-full rounded-br-full')}
      {cell(c2, c5, 'bottom-0 right-0 h-full w-full rounded-tl-full')}
      {cell(c4, c3, 'left-0 top-0 h-full w-full rounded-br-full')}
    </div>
  );
}

// /practice/writing/translation (+ ?step=Bước N)
export function TranslationHub({ go, step, setStep, onOpenExercise }) {
  const [lockOpen, setLockOpen] = useState(false);
  const progress = useMemo(() => Object.fromEntries(DICHCAU.map(e => [e.id, dichCauProgress(e.id, e.count)])), []);
  const items = step ? DICHCAU.filter(e => e.band === step).sort((a, b) => a.order - b.order) : [];

  // Summary counts
  const totalCompleted = useMemo(() => Object.values(progress).filter(p => p?.completed).length, [progress]);

  return (
    <div className="min-h-full w-full overflow-x-clip bg-[var(--we-cream,#FFFDF8)] pb-24 pt-8 font-sans text-[#1E1B4B]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top Hero Banner */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => go('home')}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Trở về Luyện Writing
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <span className="we-sticker !py-1 !text-xs !bg-[#F43F5E]">
              <PenLine size={14} className="stroke-[2.5]" />
              TRANSLATION HUB
            </span>
            {totalCompleted > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#1E1B4B] bg-[#3ECF8E] px-3 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B]">
                <CheckCircle2 size={13} strokeWidth={2.5} /> Đã hoàn thành {totalCompleted} bài
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <h1 className="text-4xl font-black uppercase tracking-tight text-[#1E1B4B] md:text-5xl">
              TẬP DỊCH{' '}
              <span className="inline-block -rotate-1 rounded-2xl border-[3px] border-[#1E1B4B] bg-[#F8BE33] px-3.5 py-0.5 text-[#1E1B4B] shadow-[3px_3px_0_#1E1B4B]">
                IELTS
              </span>
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#6B6790]">
            Luyện tập dịch từ Việt sang Anh giúp bạn củng cố ngữ pháp, từ vựng và tư duy viết chuẩn học thuật từng câu chuẩn xác.
          </p>
        </div>

        {step === null ? (
          /* STEP LIST VIEW (Ảnh 1) */
          <div className="flex flex-col gap-4">
            {STEPS.map(s => {
              const Icon = s.icon;
              const list = DICHCAU.filter(e => e.band === s.id);
              const done = list.filter(e => progress[e.id]?.completed).length;
              const started = list.filter(e => progress[e.id] && !progress[e.id].completed).length;

              return (
                <div
                  key={s.id}
                  onClick={() => (s.band ? go(`band${s.band}`) : setStep(s.id))}
                  className="group relative flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white p-5 shadow-[0_4px_0_#1E1B4B] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_7px_0_#1E1B4B] sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                    {/* Icon Tile */}
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3"
                      style={{ backgroundColor: s.color }}
                    >
                      <Icon size={26} strokeWidth={2.5} className={s.accentText} />
                    </div>

                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#1E1B4B]/70">
                          {s.id}
                        </span>
                        {s.tag && (
                          <span
                            className="rounded-full border-[1.5px] border-[#1E1B4B] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B]"
                            style={{ backgroundColor: s.tag.bg }}
                          >
                            {s.tag.text}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-[#1E1B4B] transition-colors group-hover:text-[#4F46E5]">
                        {s.title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm font-semibold leading-relaxed text-[#6B6790]">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Status & Arrow */}
                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#1E1B4B]/10 pt-3 sm:border-t-0 sm:pt-0">
                    {s.band ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-3.5 py-2 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-colors group-hover:bg-[#F8BE33]">
                        <span>Học ngay</span>
                        <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#FAF8F5] px-2.5 py-1 text-xs font-black text-[#1E1B4B]">
                            {list.length} mục
                          </span>
                          {done > 0 && (
                            <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#3ECF8E] px-2.5 py-1 text-xs font-black text-[#1E1B4B]">
                              ✓ {done} xong
                            </span>
                          )}
                          {started > 0 && (
                            <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#F8BE33] px-2.5 py-1 text-xs font-black text-[#1E1B4B]">
                              ⚡ {started} dở
                            </span>
                          )}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-colors group-hover:bg-[#F8BE33]">
                          <ChevronRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TOPIC LIST VIEW (Ảnh 2) */
          <div className="flex flex-col gap-6">
            {/* Back Button */}
            <div>
              <button
                type="button"
                onClick={() => setStep(null)}
                className="inline-flex items-center gap-2 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
              >
                <ArrowLeft size={14} strokeWidth={2.5} />
                Quay lại danh sách bước
              </button>
            </div>

            {/* Step Selector Pills */}
            <div className="flex flex-wrap gap-2.5">
              {STEPS.filter(s => !s.band).map(s => {
                const on = step === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={`flex flex-col items-start rounded-2xl border-[2.5px] border-[#1E1B4B] px-4 py-2.5 text-left transition-all ${
                      on
                        ? 'bg-[#F8BE33] text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B] -translate-y-0.5'
                        : 'bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7] hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">{s.id}</span>
                    <span className="text-xs font-bold opacity-80">{s.title.split(' Band')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Heading & Subtitle */}
            <div className="flex items-center justify-between gap-3">
              <span className="we-sticker !py-1 !text-xs !bg-[#4F46E5] !rotate-0 text-white">
                {items.length} CHỦ ĐỀ
              </span>
              <span className="text-xs font-bold text-[#6B6790]">
                Nhấn vào bài để bắt đầu luyện dịch từng câu
              </span>
            </div>

            {step === 'Bước 5' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] px-5 py-4 shadow-[0_3px_0_#1E1B4B]">
                <p className="text-sm font-bold text-[#1E1B4B]">
                  <Lock size={15} strokeWidth={2.5} className="mr-1.5 inline align-[-2px] text-[#F2683A]" />
                  Bài <span className="font-black text-[#1E1B4B]">Education</span> là bài học thử miễn phí. {items.length - 1} bài Essay còn lại dành cho TIDians &amp; Premium nha 💛
                </p>
              </div>
            )}

            {/* Exercise List */}
            <div className="flex flex-col gap-3.5">
              {items.map((e, i) => {
                const locked = e.locked;
                const rec = progress[e.id];
                const isDone = rec?.completed;
                const isDoing = rec && !rec.completed;

                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => (locked ? setLockOpen(true) : onOpenExercise(e.id))}
                    className={`group relative flex w-full items-center justify-between rounded-2xl border-[2.5px] border-[#1E1B4B] p-4 text-left shadow-[0_4px_0_#1E1B4B] transition-all duration-200 sm:p-5 ${
                      locked
                        ? 'bg-slate-100 opacity-75'
                        : isDone
                          ? 'bg-[#F0FDF4] hover:-translate-y-1 hover:shadow-[0_6px_0_#1E1B4B]'
                          : 'bg-white hover:-translate-y-1 hover:shadow-[0_6px_0_#1E1B4B]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Number Tile */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2px] border-[#1E1B4B] text-base font-black shadow-[0_2px_0_#1E1B4B] ${
                          isDone
                            ? 'bg-[#3ECF8E] text-[#1E1B4B]'
                            : isDoing
                              ? 'bg-[#F8BE33] text-[#1E1B4B]'
                              : 'bg-[#FFF8E7] text-[#1E1B4B]'
                        }`}
                      >
                        {i + 1}
                      </div>

                      <div>
                        <h3 className="text-base font-black text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors sm:text-lg">
                          {e.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#1E1B4B]/30 bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-bold text-[#6B6790]">
                            {locked ? 'TIDian & Premium' : `${step} · Nhấn từ để xem gợi ý`}
                          </span>
                          {isDone && (
                            <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#3ECF8E] px-2 py-0.5 text-[10px] font-black uppercase text-[#1E1B4B]">
                              ✓ Đã xong
                            </span>
                          )}
                          {isDoing && (
                            <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#F8BE33] px-2 py-0.5 text-[10px] font-black uppercase text-[#1E1B4B]">
                              ⚡ Đang làm {rec.done}/{rec.total}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] px-3.5 py-2 text-xs font-black shadow-[0_2px_0_#1E1B4B] transition-transform group-hover:scale-105 ${
                          locked
                            ? 'bg-white text-slate-500'
                            : isDone
                              ? 'bg-[#3ECF8E] text-[#1E1B4B]'
                              : 'bg-[#F8BE33] text-[#1E1B4B]'
                        }`}
                      >
                        {locked ? (
                          <>
                            <Lock size={12} strokeWidth={2.5} />
                            Mở khoá
                          </>
                        ) : isDone ? (
                          'Luyện lại'
                        ) : (
                          'Thử ngay'
                        )}
                        <ArrowRight size={13} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                );
              })}

              {items.length === 0 && (
                <div className="rounded-2xl border-[2.5px] border-dashed border-[#1E1B4B]/30 bg-white py-12 text-center shadow-[0_3px_0_#1E1B4B]">
                  <PenLine size={36} className="mx-auto mb-3 text-[#6B6790]" />
                  <p className="text-sm font-bold text-[#6B6790]">Chưa có bài tập nào trong mục này.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tự tạo bài của chính mình — Banner */}
        <div className="group relative mb-8 mt-12 flex flex-col justify-center overflow-hidden rounded-3xl border-[3px] border-[#1E1B4B] bg-[#2B204F] p-8 shadow-[0_6px_0_#1E1B4B] md:p-10">
          <Mosaic />
          <div className="relative z-10 w-full md:w-[65%]">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full border-2 border-white/40 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#F8BE33]">
                TỰ TẠO
              </span>
              <span className="rounded-full border-2 border-white/30 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                TIDIAN &amp; PREMIUM
              </span>
            </div>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Tự tạo bài của chính mình
            </h2>
            <p className="mb-6 font-medium leading-relaxed text-white/85">
              Tự tạo bài dịch bằng AI chỉ có trên website (cần máy chủ AI) — bản offline chưa hỗ trợ tính năng này 💛
            </p>
            <span className="inline-flex items-center gap-2 rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-5 py-2.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]">
              <Lock size={14} strokeWidth={2.5} />
              Chỉ có trên website
            </span>
          </div>
        </div>
      </main>

      {/* Lock Modal */}
      {lockOpen && (
        <Modal onClose={() => setLockOpen(false)}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]">
            <Lock className="h-8 w-8 text-[#F2683A]" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1E1B4B]">Dành riêng cho TIDians</h2>
          <p className="mb-6 font-medium leading-relaxed text-[#6B6790]">
            Bài này nằm trong gói Writing / Premium trên website nên nội dung chưa có trong dữ liệu offline.
          </p>
          <button
            type="button"
            onClick={() => setLockOpen(false)}
            className="w-full rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] py-3.5 text-sm font-black text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"
          >
            Đã hiểu, đóng lại
          </button>
        </Modal>
      )}
    </div>
  );
}

const NUM_COLORS = ['bg-[#7CC4F2]', 'bg-[#3ECF8E]', 'bg-[#F8BE33]', 'bg-[#F2683A]', 'bg-[#4F46E5]'];

// /practice/writing/translation/band8 | band9 — topic grid, then the topic's 10 essays
export function BandEssays({ band, onBack, onWrite, onTranslate }) {
  const [topic, setTopic] = useState(null);
  const accent = band === 8 ? 'text-[#4F46E5]' : 'text-[#10B981]';
  const essays = topic && band === 8 ? SAMPLES.filter(s => s.slug === topic.slug) : [];

  return (
    <div className="min-h-full w-full bg-[var(--we-cream,#FFFDF8)] pb-24 pt-8 text-[#1E1B4B]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => (topic ? setTopic(null) : onBack())}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#FFF8E7]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          {topic ? `Trở về Band ${band}` : 'Trở về Translation Hub'}
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="we-sticker !py-1 !text-xs !bg-[#4F46E5] text-white">
            <BookOpen size={14} strokeWidth={2.5} />
            BAND {band} SAMPLE ESSAYS
          </span>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight text-[#1E1B4B] md:text-5xl">
          {topic ? topic.en : 'Dịch Essay'}{' '}
          <span className={`inline-block -rotate-1 rounded-2xl border-[3px] border-[#1E1B4B] px-3.5 py-0.5 shadow-[3px_3px_0_#1E1B4B] ${band === 8 ? 'bg-[#4F46E5] text-white' : 'bg-[#3ECF8E] text-[#1E1B4B]'}`}>
            {topic ? topic.vi : `Band ${band}`}
          </span>
        </h1>

        <p className="mb-10 mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#6B6790]">
          150 bài mẫu Band {band} chia theo 15 chủ đề Task 2. Chọn một chủ đề, dịch từng câu từ Việt sang Anh — làm xong một bài sẽ tự chuyển sang bài kế tiếp.
        </p>

        {!topic ? (
          <div className="grid gap-4 md:grid-cols-2">
            {SAMPLE_TOPICS.map((t, i) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTopic(t)}
                className="group flex items-center justify-between rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white p-5 text-left shadow-[0_4px_0_#1E1B4B] transition-all hover:-translate-y-1 hover:shadow-[0_6px_0_#1E1B4B]"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border-[2px] border-[#1E1B4B] text-sm font-black shadow-[0_2px_0_#1E1B4B] ${
                      NUM_COLORS[i % NUM_COLORS.length]
                    } ${i % NUM_COLORS.length === 4 ? 'text-white' : 'text-[#1E1B4B]'}`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#1E1B4B] group-hover:text-[#4F46E5] transition-colors">{t.en}</h3>
                    <p className="text-xs font-bold text-[#6B6790]">{t.vi} · {t.count} bài</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] group-hover:bg-[#F8BE33]">
                  <ChevronRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {!essays.some(s => s.hasBody) && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border-[2px] border-dashed border-[#1E1B4B]/40 bg-[#FFF8E7] px-5 py-4 shadow-[0_2px_0_#1E1B4B]">
                <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-[#1E1B4B]" strokeWidth={2.5} />
                <p className="text-sm font-bold leading-relaxed text-[#1E1B4B]">
                  Câu song ngữ của các bài Band {band} {band === 8 ? 'trong chủ đề này ' : ''}chưa có trong bản offline nên chưa dịch từng câu được. {band === 8 ? 'Bạn có thể luyện viết trực tiếp các đề bên dưới.' : 'Hãy luyện với Bước 1–5 ở Translation Hub.'}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {(band === 8 ? essays : Array.from({ length: topic.count }, (_, i) => ({ id: `b9-${i}`, num: i + 1 }))).map(s => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!s.question}
                  onClick={() => (s.hasBody ? onTranslate(s) : onWrite(s))}
                  className="group flex w-full items-center justify-between rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white p-5 text-left shadow-[0_4px_0_#1E1B4B] transition-all enabled:hover:-translate-y-1 enabled:hover:shadow-[0_6px_0_#1E1B4B] disabled:opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#FAF8F5] text-sm font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B]">
                      {s.num}
                    </span>
                    <span className="text-[15px] font-bold leading-snug text-[#1E1B4B]">
                      {s.question || `Bài ${s.num} · ${topic.en}`}
                    </span>
                  </div>
                  {s.question && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] px-3 py-1.5 text-xs font-black shadow-[0_2px_0_#1E1B4B] ${
                        s.hasBody ? 'bg-[#F8BE33] text-[#1E1B4B]' : 'bg-[#FAF8F5] text-[#6B6790]'
                      }`}
                    >
                      {s.hasBody ? `Dịch ${s.sentences} câu` : 'Luyện viết'} <ArrowRight size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
