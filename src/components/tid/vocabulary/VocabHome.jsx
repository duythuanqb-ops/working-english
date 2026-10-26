// /practice/vocabulary — "Xây dựng thói quen học từ vựng…" landing page + the "Từ vựng tuyển chọn" overlay.
import React from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, CircleCheck, ClipboardList, GraduationCap, Layers, Sparkles, Star, Target,
  Users, X, Zap,
} from 'lucide-react';
import { asset } from '../shared';

const A = p => asset(`assets/tid/vocabulary/${p}`);

export function Navbar({ onBack, right }) {
  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white/80 py-4 shadow-sm backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <button type="button" onClick={onBack} className="flex shrink-0 items-center gap-3 text-2xl font-extrabold tracking-tighter text-black">
          <span className="relative h-[48px] w-[48px] overflow-hidden rounded-xl border border-slate-100 shadow-sm"><img src={asset('assets/tid/logo.webp')} alt="" className="absolute inset-0 h-full w-full object-cover" /></span>
          <span className="hidden sm:block">Luyện Từ Vựng <span className="text-herb-500">Chuyên Sâu</span></span>
        </button>
        <div className="flex items-center gap-2">
          {right}
          <button type="button" onClick={onBack} className="flex h-10 items-center gap-1.5 rounded-full bg-slate-100 px-3.5 text-xs font-black text-slate-700 transition-all hover:bg-slate-200"><ArrowLeft size={15} /> Quay lại chọn kỹ năng</button>
        </div>
      </div>
    </nav>
  );
}

// Waves pattern + book icon of the orange "Từ vựng tuyển chọn" card (inline SVG on the site).
const Waves = () => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400" aria-hidden>
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-100 ${i * 30} Q100 ${i * 30 - 15} 300 ${i * 30} T700 ${i * 30}`} fill="none" stroke="white" strokeWidth="1.5" />)}
  </svg>
);
const Book = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="4" y1="17" x2="20" y2="17" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export default function VocabHome({ onBack, onOpenSets, onOpenCurated, onOpenGrammar }) {
  return (
    <div className="vc-home min-h-full bg-[#f8f8f4] selection:bg-herb-200 selection:text-herb-900">
      <Navbar onBack={onBack} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        <div className="td-pop">
          <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-all hover:gap-3 hover:text-herb-600"><ArrowLeft className="h-4 w-4" />Về trang chủ</button>
          <h1 className="mb-8 max-w-4xl text-5xl font-medium leading-[1.1] tracking-tight text-[#18181b] md:text-7xl">Xây dựng thói quen học từ<br />vựng 1 cách khoa học và<br />bền vững hiệu quả</h1>
        </div>
        <div className="mb-16 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-herb-900/5">
          <img src={A('vocab-page.webp')} alt="Đọc · Nghe · Ghi lại · Đặt câu · Ghi nhớ lâu hơn" className="h-auto w-full object-cover transition-transform duration-1000 hover:scale-[1.02]" />
        </div>
        <section className="mt-10 max-w-4xl text-[#252525]">
          <div className="space-y-8 text-[20px] font-medium leading-[1.6] text-slate-600 md:text-[22px]">
            <p>Về mặt khoa học (đặc biệt trong lĩnh vực <span className="border-b-2 border-herb-400 font-bold text-slate-900">second language acquisition</span>), có vài điểm cần làm rõ.</p>
            <p>Việc học từ vựng theo bộ quiz được tạo sẵn (<span className="italic text-slate-400">decontextualized word lists</span>) thường kém hiệu quả hơn so với học trong ngữ cảnh, vì não khó tạo liên kết ý nghĩa nên rất dễ quên, dẫn đến nản.</p>
            <div className="group relative overflow-hidden rounded-[2rem] border border-herb-100 bg-herb-50 p-8 font-semibold text-herb-900">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-herb-200 opacity-20 transition-transform duration-700 group-hover:scale-150" />
              <Sparkles className="mb-4 text-herb-500" />
              <p>Chúng mình khuyên bạn nên học từ vựng thông qua bài đọc hoặc nghe<br />(<span className="text-herb-600 underline decoration-2 underline-offset-4">context-based learning</span>). Khi gặp cụm từ mới, hãy note lại vào sổ từ vựng và cố gắng tự đặt câu với nó (<span className="italic text-herb-600">contextualized learning + generative use</span>). Việc này giúp bạn hiểu cách dùng từ trong ngữ cảnh và ghi nhớ lâu hơn.</p>
            </div>
            <p>Vì vậy, điểm mấu chốt không nằm ở việc bạn lấy từ vựng từ đâu, mà là cách bạn xử lý chúng, hay còn gọi là <span className="font-bold text-slate-900">depth of processing</span>.</p>
            <p className="text-lg text-slate-400">Tuy nhiên, tụi mình vẫn sẽ để một số bộ từ vựng mẫu ở dưới để hộ trợ việc học từ vựng của các bạn nha</p>
          </div>
        </section>
        <div className="mt-24 border-t border-slate-200 pb-40 pt-20">
          <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-herb-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-herb-700"><Zap size={12} />Cambridge Resource</div>
              <h3 className="mb-2 text-4xl font-bold text-slate-900">1500 Từ vựng IELTS Reading</h3>
              <p className="text-lg font-medium text-slate-500">Hệ thống từ vựng cốt lõi được trích xuất từ 15+ tập Cambridge IELTS.</p>
            </div>
            <div className="flex items-center gap-6">
              <button type="button" onClick={onOpenSets} className="group flex items-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-600 shadow-sm transition-all hover:border-herb-500 hover:text-herb-600 hover:shadow-md active:scale-95">
                <Layers size={18} className="text-herb-500" />Học Flashcard<ChevronRight size={16} className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-herb-500" />
              </button>
              <button type="button" onClick={onOpenGrammar} className="group flex items-center gap-2 whitespace-nowrap rounded-2xl border border-violet-200 bg-violet-50 px-5 py-2.5 font-bold text-violet-700 shadow-sm transition-all hover:border-violet-400 hover:bg-violet-100 hover:shadow-md active:scale-95">
                <GraduationCap size={18} className="text-violet-500" />Học Grammar<ChevronRight size={16} className="text-violet-300 transition-all group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </button>
              <div className="hidden -space-x-3 lg:flex">
                {[0, 1, 2, 3].map(i => <div key={i} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200"><img src={A(`avatar-${i}.svg`)} alt="" /></div>)}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-herb-500 text-[10px] font-bold text-white">+2k</div>
              </div>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <button type="button" onClick={onOpenCurated} className="group relative flex select-none flex-col justify-between overflow-hidden rounded-[2.5rem] text-left transition-transform hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, rgb(200, 96, 26) 0%, rgb(212, 114, 42) 40%, rgb(191, 85, 16) 100%)' }}>
              <Waves />
              <div className="relative z-10 flex h-full flex-col justify-between p-8">
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">VOCABULARY COLLECTION</span>
                  <h2 className="text-3xl font-semibold leading-[1.12] text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>Từ vựng<br />tuyển chọn</h2>
                  <div className="h-px w-20 bg-white/30" />
                  <p className="mb-1 text-[14px] font-medium leading-relaxed text-white/85">Tổng hợp tất cả các từ vựng<br />để đạt <span className="font-semibold text-white">9.0 IELTS Reading.</span></p>
                  <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#fff8f2] px-5 py-2.5 text-[14px] font-bold text-[#c8601a] shadow-sm"><BookOpen size={16} />Truy cập ngay<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></div>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"><Star size={13} className="fill-amber-300 text-amber-300" />5</div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"><CircleCheck size={13} className="text-emerald-300" />98%</div>
                  </div>
                  <div className="opacity-80"><Book /></div>
                </div>
              </div>
            </button>
            <div className="relative col-span-1 flex min-h-[380px] flex-col justify-center overflow-hidden rounded-[2.5rem] bg-[#6B8D41] p-8 shadow-lg shadow-[#6B8D41]/20 sm:col-span-2 md:p-12 lg:col-span-2">
              <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <div className="relative z-10 flex max-w-[60%] flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center justify-center rounded-lg bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#6B8D41] shadow-sm">WORKING ENGLISH</div>
                <h2 className="mb-5 font-[family-name:var(--font-nunito)] text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-[56px]">Kho từ vựng<br />khổng lồ</h2>
                <p className="mb-8 max-w-[95%] text-[15px] font-medium leading-relaxed text-white/90">Hàng ngàn từ vựng IELTS theo chủ đề, có ví dụ và audio, giúp bạn học nhanh và nhớ lâu hơn.</p>
                <button type="button" onClick={onOpenSets} className="group inline-flex w-fit items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-[#6B8D41] shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.02] active:scale-95">Truy cập<ArrowRight size={18} className="text-[#6B8D41] transition-transform group-hover:translate-x-1" /></button>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-[60%]">
                <div className="pointer-events-auto absolute right-[160px] top-[8%] z-20 max-w-[180px] -translate-y-[25px] rounded-[20px] rounded-br-sm bg-white px-5 py-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.15)] md:right-[200px] md:top-[12%] md:max-w-[200px]">
                  <p className="relative z-10 text-[13px] font-bold leading-[1.4] text-herb-900 md:text-[14px]">Học từ vựng mỗi ngày<br />– tiến bộ hơn mỗi ngày!<br /><span className="mt-0.5 inline-block text-base">✨</span></p>
                  <div className="absolute -bottom-[8px] right-8 h-5 w-5 rotate-45 rounded-[2px] bg-white" />
                </div>
                <div className="absolute -bottom-[130px] -right-[80px] md:-bottom-[170px] md:-right-[100px]">
                  <img src={A('sun.svg')} alt="" className="h-[550px] w-[550px] max-w-none" style={{ transform: 'rotate(-4.48deg)', transformOrigin: '50% 100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** /practice/vocabulary/tuyen-chon — "Từ vựng tuyển chọn" (copy from the captured page). */
export function CuratedPage({ onClose, onExplore }) {
  const Panel = ({ className = '', children }) => <div className={`rounded-[28px] border border-white/10 bg-[#3d5a26]/80 shadow-xl backdrop-blur-sm ${className}`}>{children}</div>;
  const IconBox = ({ children }) => <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-[#cfe0b4]">{children}</span>;
  return (
    <div className="vc-home relative min-h-full overflow-hidden bg-[#4f7232] font-[family-name:var(--font-quicksand)] text-white" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px),radial-gradient(circle at 20% 30%,#6f9447,#3e5c25 70%)', backgroundSize: '64px 64px,64px 64px,100% 100%' }}>
      <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"><X size={22} /></button>
      <div className="relative mx-auto max-w-[980px] px-6 pb-20 pt-16">
        <div className="relative mb-10 flex items-start justify-between">
          <div className="text-center" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            <div className="text-[64px] font-black leading-none tracking-tight md:text-[84px]">TỪ VỰNG</div>
            <div className="mt-1 text-[30px] font-black md:text-[36px]">✦ TUYỂN CHỌN ✦</div>
          </div>
          <div className="relative hidden md:block">
            <span className="absolute -top-2 right-6 z-10 w-[180px] rounded-[18px] bg-white px-4 py-2 text-center text-[13px] font-bold text-[#1e3006] shadow-lg">Học đúng để tiết kiệm thời gian</span>
            <img src={A('watching-sun.svg')} alt="" className="mt-10 h-[220px] w-[220px]" />
          </div>
        </div>
        <Panel className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <div className="flex gap-3"><IconBox><BookOpen size={20} /></IconBox><p className="m-0 text-[15px] leading-relaxed text-white/90">Sau khi phân tích 40 đề Reading trong Cambridge IELTS 7–18, đội ngũ học thuật rút ra được,</p></div>
            <p className="m-0 mt-6 text-[15px] text-white/70">Có tổng cộng</p>
            <div className="text-[64px] font-black leading-none" style={{ fontFamily: 'var(--font-playfair), serif' }}>116,165</div>
            <p className="m-0 mt-2 text-[15px] text-white/85">từ trong bộ sách huyền thoại này.</p>
          </div>
          <div>
            <div className="flex gap-3"><IconBox><Users size={20} /></IconBox><p className="m-0 text-[15px] leading-relaxed text-white/90">Nhưng chỉ có <b>7,192</b> từ khác nhau được sử dụng để “chế biến” ra 40 đề, trong đó:</p></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[['2.442 từ', 'xuất hiện từ 5 lần trở lên', ['1.061 từ: 16 lần trở lên', '1.381 từ: 5–15 lần'], 'Chiếm 93.3%', '#4ade80'], ['4.750 từ', 'xuất hiện dưới 5 lần', ['942 từ: 3–4 lần', '3.808 từ: 1–2 lần'], 'Chiếm 6.7%', '#fbbf24']].map(([h, s, l, c, col]) => (
                <div key={h} className="rounded-[20px] bg-black/20 p-4">
                  <div className="text-[20px] font-black">{h}</div>
                  <div className="text-[13px] text-white/70">{s}</div>
                  {l.map(x => <div key={x} className="mt-1.5 text-[12px] text-white/55">{x}</div>)}
                  <span className="mt-3 inline-block rounded-full border px-2.5 py-1 text-[12px] font-bold" style={{ borderColor: col, color: col }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel className="mt-5 flex items-center gap-4 p-6">
          <IconBox><Target size={20} /></IconBox>
          <p className="m-0 text-[15px] leading-relaxed text-white/90">Nghiên cứu rút ra được rằng, chỉ <b>2,442 từ</b> xuất hiện thường xuyên đã chiếm tới <b>93.3%</b> nội dung đề thi, nên học thuộc 2,442 từ thường gặp trước khi học IELTS để tránh lãng phí thời gian, công sức tra từ điển và ghi nhớ những từ không cần thiết.</p>
        </Panel>
        <Panel className="mt-5 flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <IconBox><ClipboardList size={20} /></IconBox>
          <div className="flex-1">
            <p className="m-0 text-[15px] text-white/90">File Flashcard đã tổng hợp toàn bộ từ vựng này, chia theo 3 cấp độ:</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[['Thường thấy, (≥ 5 lần)', '#4ade80', '#14532d'], ['Trung bình (3–4 lần)', '#fbbf24', '#713f12'], ['Hiếm thấy (1–2 lần)', '#fca5a5', '#7f1d1d']].map(([t, c, bg]) => <span key={t} className="rounded-full border px-3 py-1 text-[13px] font-bold" style={{ borderColor: c, color: c, background: `${bg}99` }}>{t}</span>)}
            </div>
          </div>
          <button type="button" onClick={onExplore} className="flex items-center gap-3 rounded-[20px] border border-white/20 bg-[#6f9a3e] px-5 py-4 text-left transition-transform hover:-translate-y-0.5">
            <IconBox><BookOpen size={18} /></IconBox>
            <span><span className="block text-[12px] font-black tracking-wide">KHÁM PHÁ</span><span className="block text-[12px] font-black tracking-wide">KHO TỪ VỰNG IELTS →</span><span className="block text-[11px] text-white/70">Từ vựng theo từng bài đọc Cambridge</span></span>
          </button>
        </Panel>
      </div>
    </div>
  );
}
