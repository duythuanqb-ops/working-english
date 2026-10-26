import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, BookMarked, BookOpen, ChevronRight, CloudOff, Layers, Lock, PenLine, Sparkles, Target } from 'lucide-react';
import { DICHCAU, SAMPLES, SAMPLE_TOPICS, dichCauProgress } from './data';
import { Modal, ProgressChip } from './ui';

const STEPS = [
  { id: 'Bước 1', title: 'Cấu trúc câu cơ bản', desc: 'Luyện dịch các câu đơn từ Việt sang Anh. Tập trung vào việc sử dụng đúng thì, mạo từ và cấu trúc câu S-V-O cơ bản.', tag: null, icon: PenLine, iconBg: 'bg-blue-50 text-blue-500 border-blue-100', hoverBorder: 'hover:border-blue-300 hover:shadow-blue-100' },
  { id: 'Bước 2', title: 'Collocations & Vocab', desc: 'Dịch từ Anh sang Việt để nắm vững các cụm từ (collocations) và từ vựng học thuật theo ngữ cảnh thực tế.', tag: { text: 'VOCAB', bg: 'bg-red-50 text-red-500 border-red-100' }, icon: Sparkles, iconBg: 'bg-rose-50 text-rose-500 border-rose-100', hoverBorder: 'hover:border-rose-300 hover:shadow-rose-100' },
  { id: 'Bước 3', title: 'Dịch đoạn văn Band 6.5', desc: 'Luyện dịch các đoạn văn ngắn từ Việt sang Anh với mục tiêu đạt độ chính xác và mạch lạc ở mức Band 6.5.', tag: { text: 'BAND 6.5', bg: 'bg-amber-50 text-amber-600 border-amber-100' }, icon: Target, iconBg: 'bg-amber-50 text-amber-500 border-amber-100', hoverBorder: 'hover:border-amber-300 hover:shadow-amber-100' },
  { id: 'Bước 4', title: 'Dịch đoạn văn Band 8.0', desc: 'Thử thách dịch các đoạn văn phức tạp, yêu cầu sử dụng từ vựng ít phổ biến và cấu trúc câu linh hoạt của Band 8.0.', tag: { text: 'BAND 8.0', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' }, icon: Award, iconBg: 'bg-indigo-50 text-indigo-500 border-indigo-100', hoverBorder: 'hover:border-indigo-300 hover:shadow-indigo-100' },
  { id: 'Bước 5', title: 'Dịch Essay hoàn chỉnh', desc: 'Luyện dịch nguyên một bài Essay từ dàn ý tiếng Việt sang bài viết tiếng Anh học thuật hoàn chỉnh.', tag: { text: 'PREMIUM', bg: 'bg-purple-50 text-purple-600 border-purple-100' }, icon: Layers, iconBg: 'bg-purple-50 text-purple-500 border-purple-100', hoverBorder: 'hover:border-purple-300 hover:shadow-purple-100' },
  { id: 'Band 8', title: 'Dịch Essay Band 8 theo chủ đề', desc: '150 bài mẫu Band 8 chia theo 15 chủ đề Task 2 — bước đệm trước khi lên Band 9. Dịch từng câu từ Việt sang Anh, xong bài tự chuyển sang bài kế tiếp.', tag: { text: 'BAND 8', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' }, icon: BookMarked, iconBg: 'bg-indigo-50 text-indigo-500 border-indigo-100', hoverBorder: 'hover:border-indigo-300 hover:shadow-indigo-100', band: 8 },
  { id: 'Band 9', title: 'Dịch Essay Band 9 theo chủ đề', desc: '150 bài mẫu Band 9 chia theo 15 chủ đề Task 2. Dịch từng câu từ Việt sang Anh, xong bài tự chuyển sang bài kế tiếp.', tag: { text: 'BAND 9', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }, icon: BookOpen, iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100', hoverBorder: 'hover:border-emerald-300 hover:shadow-emerald-100', band: 9 },
];

// Purple mosaic decoration of the "Tự tạo" card
function Mosaic() {
  const [c1, c2, c3, c4, c5] = ['bg-[#A28EC8]', 'bg-[#4B3D84]', 'bg-[#7664A9]', 'bg-[#3D2F6B]', 'bg-[#2B204F]'];
  const cell = (outer, inner, shape) => <div className={`relative overflow-hidden ${outer}`}><div className={`absolute ${shape} ${inner}`} /></div>;
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

  return (
    <div className="min-h-full w-full overflow-x-clip bg-[#fafaf7] pb-20 pt-12 font-sans">
      <main className="mx-auto max-w-5xl px-6">
        <div className="mb-10">
          <button type="button" onClick={() => go('home')} className="mb-6 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600">
            <ArrowLeft className="mr-2 h-4 w-4" />Trở về Luyện Writing
          </button>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-pink-500">
            <PenLine size={16} /><span className="uppercase tracking-widest">Translation Hub</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">Tập dịch <span className="text-pink-500">IELTS</span></h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-500">Luyện tập dịch từ Việt sang Anh giúp bạn củng cố ngữ pháp, từ vựng và tư duy viết chuẩn học thuật.</p>
        </div>

        {step === null ? (
          <div className="flex flex-col gap-4">
            {STEPS.map(s => {
              const Icon = s.icon;
              const list = DICHCAU.filter(e => e.band === s.id);
              const done = list.filter(e => progress[e.id]?.completed).length;
              const started = list.filter(e => progress[e.id] && !progress[e.id].completed).length;
              return (
                <div key={s.id} onClick={() => (s.band ? go(`band${s.band}`) : setStep(s.id))}
                  className={`group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md ${s.hoverBorder}`}>
                  <div className="flex items-center gap-5">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${s.iconBg}`}><Icon size={24} /></div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{s.id}</span>
                        {s.tag && <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider ${s.tag.bg}`}>{s.tag.text}</span>}
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900">{s.title}</h3>
                      <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors group-hover:text-slate-600">
                    {s.band ? (
                      <><span>Học ngay</span><ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          <span>{list.length} mục</span>
                          {done > 0 && <span className="text-emerald-600">· {done} xong</span>}
                          {started > 0 && <span className="text-amber-500">· {started} dở</span>}
                        </span>
                        <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <button type="button" onClick={() => setStep(null)} className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-pink-500 transition-colors hover:text-pink-700">
                <ChevronRight size={14} className="rotate-180" />Quay lại danh sách bước
              </button>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {STEPS.filter(s => !s.band).map(s => {
                const on = step === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => setStep(s.id)}
                    className={`flex flex-col items-start rounded-xl border-2 px-4 py-2.5 text-left transition-all ${on ? 'border-pink-500 bg-pink-500 text-white shadow-[3px_3px_0_rgba(0,0,0,1)]' : 'border-black bg-white text-slate-700 hover:border-pink-400 hover:text-pink-700'}`}>
                    <span className="text-xs font-black uppercase tracking-widest">{s.id}</span>
                    <span className={`text-[11px] font-bold ${on ? 'text-pink-100' : 'text-slate-500'}`}>{s.title.split(' Band')[0]}</span>
                  </button>
                );
              })}
            </div>
            <p className="mb-4 text-[11px] font-black uppercase tracking-[3px] text-pink-400">{items.length} CHỦ ĐỀ</p>
            {step === 'Bước 5' && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
                <p className="text-sm font-bold text-amber-900">
                  <Lock size={14} className="mr-1.5 inline align-[-2px]" />Bài <span className="font-black">Education</span> là bài học thử miễn phí. {items.length - 1} bài Essay còn lại dành cho TIDians &amp; Premium nha 💛
                </p>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {items.map((e, i) => {
                const locked = e.locked;
                const card = (
                  <div className={`group flex items-center justify-between rounded-2xl border-2 p-5 text-left shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all ${locked ? 'border-slate-300 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-400' : 'border-pink-400 bg-pink-50 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 bg-white text-sm font-black ${locked ? 'border-slate-300 text-slate-400' : 'border-pink-300 text-pink-500'}`}>{i + 1}</div>
                      <div>
                        <h3 className={`text-base font-black ${locked ? 'text-slate-500' : 'text-slate-900'}`}>{e.title}</h3>
                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${locked ? 'bg-amber-100 text-amber-700' : 'bg-pink-200 text-pink-800'}`}>
                          {locked ? 'TIDian & Premium' : `${step} · Nhấn từ để xem gợi ý`}
                        </span>
                        {!locked && <ProgressChip record={progress[e.id]} className="ml-2 align-middle" />}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${locked ? 'text-slate-400 group-hover:text-slate-600' : 'text-pink-400 group-hover:text-pink-600'}`}>
                      {locked && <Lock size={14} className="shrink-0" />}{locked ? 'Mở khoá' : 'Thử ngay'}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
                return (
                  <button key={e.id} type="button" className="block w-full text-left" onClick={() => (locked ? setLockOpen(true) : onOpenExercise(e.id))}>{card}</button>
                );
              })}
              {items.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-pink-200 py-10 text-center">
                  <PenLine size={32} className="mx-auto mb-3 text-pink-200" />
                  <p className="text-sm font-bold text-slate-400">Chưa có bài tập nào trong mục này.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tự tạo — AI generation is server-side on the site */}
        <div className="group relative mb-8 mt-10 flex flex-col justify-center overflow-hidden rounded-2xl bg-[#4B3D84] p-8 shadow-md transition-all md:p-10">
          <Mosaic />
          <div className="relative z-10 w-full md:w-[65%]">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[13px] font-black uppercase tracking-widest text-white/60">TỰ TẠO</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">TIDIAN &amp; PREMIUM</span>
            </div>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-white md:text-4xl">Tự tạo bài của chính mình</h2>
            <p className="mb-6 font-medium leading-relaxed text-white/85">Tự tạo bài dịch bằng AI chỉ có trên website (cần máy chủ AI) — bản offline chưa hỗ trợ tính năng này 💛</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-bold text-white"><Lock size={15} />Chỉ có trên website</span>
          </div>
        </div>
      </main>
      {lockOpen && (
        <Modal onClose={() => setLockOpen(false)}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50"><Lock className="h-8 w-8 text-amber-500" /></div>
          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-800">Dành riêng cho TIDians</h2>
          <p className="mb-6 font-medium text-slate-500">Bài này nằm trong gói Writing / Premium trên website nên nội dung chưa có trong dữ liệu offline.</p>
          <button type="button" onClick={() => setLockOpen(false)} className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200">Đóng</button>
        </Modal>
      )}
    </div>
  );
}

const NUM_COLORS = ['bg-emerald-50 text-emerald-500 border-emerald-100', 'bg-sky-50 text-sky-500 border-sky-100', 'bg-amber-50 text-amber-500 border-amber-100',
  'bg-rose-50 text-rose-500 border-rose-100', 'bg-indigo-50 text-indigo-500 border-indigo-100'];

// /practice/writing/translation/band8 | band9 — topic grid, then the topic's 10 essays
export function BandEssays({ band, onBack, onWrite, onTranslate }) {
  const [topic, setTopic] = useState(null);
  const accent = band === 8 ? 'text-indigo-600' : 'text-emerald-600';
  const essays = topic && band === 8 ? SAMPLES.filter(s => s.slug === topic.slug) : [];
  return (
    <div className="min-h-full w-full bg-[#fafaf7] pb-20 pt-12">
      <main className="mx-auto max-w-5xl px-6">
        <button type="button" onClick={() => (topic ? setTopic(null) : onBack())} className="mb-6 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600">
          <ArrowLeft className="mr-2 h-4 w-4" />{topic ? `Trở về Band ${band}` : 'Trở về Translation Hub'}
        </button>
        <div className={`mb-3 flex items-center gap-2 text-sm font-bold ${accent}`}>
          <BookOpen size={16} /><span className="uppercase tracking-widest">Band {band} sample essays</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">
          {topic ? topic.en : 'Dịch Essay'} <span className={accent}>{topic ? topic.vi : `Band ${band}`}</span>
        </h1>
        <p className="mb-10 mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-500">
          150 bài mẫu Band {band} chia theo 15 chủ đề Task 2. Chọn một chủ đề, dịch từng câu từ Việt sang Anh — làm xong một bài sẽ tự chuyển sang bài kế tiếp.
        </p>
        {!topic ? (
          <div className="grid gap-4 md:grid-cols-2">
            {SAMPLE_TOPICS.map((t, i) => (
              <button key={t.slug} type="button" onClick={() => setTopic(t)}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-bold ${NUM_COLORS[i % NUM_COLORS.length]}`}>{i + 1}</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{t.en}</h3>
                    <p className="text-sm font-medium text-slate-400">{t.vi} · {t.count} bài</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        ) : (
          <>
            {!essays.some(s => s.hasBody) && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-4">
                <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <p className="text-sm font-medium leading-relaxed text-slate-500">
                  Câu song ngữ của các bài Band {band} {band === 8 ? 'trong chủ đề này ' : ''}chưa có trong bản offline nên chưa dịch từng câu được. {band === 8 ? 'Bạn có thể luyện viết trực tiếp các đề bên dưới.' : 'Hãy luyện với Bước 1–5 ở Translation Hub.'}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {(band === 8 ? essays : Array.from({ length: topic.count }, (_, i) => ({ id: `b9-${i}`, num: i + 1 }))).map(s => (
                <button key={s.id} type="button" disabled={!s.question} onClick={() => (s.hasBody ? onTranslate(s) : onWrite(s))}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all enabled:hover:border-slate-300 enabled:hover:shadow-md disabled:opacity-60">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-500">{s.num}</span>
                  <span className="flex-1 text-[15px] font-medium leading-snug text-slate-700">{s.question || `Bài ${s.num} · ${topic.en}`}</span>
                  {s.question && (
                    <span className={`flex shrink-0 items-center gap-1 text-xs font-bold ${s.hasBody ? accent : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {s.hasBody ? `Dịch ${s.sentences} câu` : 'Luyện viết'} <ArrowRight size={14} />
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
