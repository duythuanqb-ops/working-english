// Vocabulary landing page (WorkingEnglish skin) + curated research analysis
import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  GraduationCap,
  Layers,
  Sparkles,
  Star,
  Target,
  Users,
  X,
  Zap,
  TrendingUp,
  Brain,
  Gamepad2,
  CheckCircle2,
  Award,
  BookMarked
} from 'lucide-react';
import { asset } from '../shared';
import { SkillHero } from '../weKit';

export default function VocabHome({
  onBack,
  onOpenSets,
  onOpenCurated,
  onOpenGrammar
}) {
  return (
    <div className="vc-home we-page pb-20">
      <SkillHero
        variant="vocabulary"
        onBack={onBack}
        eyebrow="WorkingEnglish · Word Lab"
        title="Từ vựng"
        accent="Nhớ lâu, dùng đúng"
        subtitle="Học từ qua ngữ cảnh thật, ôn lặp lại ngắt quãng và chơi Blast để luyện phản xạ, giúp từ mới chuyển thành vốn từ dùng được."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onOpenSets('topics')} className="we-btn"><Layers size={18} />Kho bộ từ mẫu<ArrowRight size={16} /></button>
          <button type="button" onClick={onOpenCurated} className="we-btn we-btn-white"><Target size={18} />2,442 từ cốt lõi</button>
          <button type="button" onClick={onOpenGrammar} className="we-btn we-btn-white"><GraduationCap size={18} />Học ngữ pháp</button>
        </div>
      </SkillHero>

      <main className="mx-auto w-full max-w-6xl px-[clamp(20px,4vw,48px)] pt-10">
        {/* 3 Core Scientific Methodology Pillars */}
        <div className="mb-12">
          <div className="mb-4 text-center sm:text-left">
            <h2 className="we-display text-2xl md:text-3xl text-[#1E1B4B]">
              3 Trụ Cột Ghi Nhớ Từ Vựng Khoa Học
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Dựa trên các nghiên cứu chuyên sâu về Second Language Acquisition (SLA)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1 */}
            <div className="we-card we-card-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <Brain size={24} />
              </div>
              <h3 className="we-display text-xl text-[#1E1B4B] mb-1.5">
                1. Context-Based Learning
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                Học từ vựng trong bài đọc hoặc bài nghe thực tế. Não bộ tạo liên kết ngữ nghĩa vững chắc hơn gấp 4 lần so với học danh sách từ rời rạc (decontextualized word lists).
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="we-card we-card-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="we-display text-xl text-[#1E1B4B] mb-1.5">
                2. Spaced Repetition (SRS)
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                Hệ thống Leitner Box tự động tính toán thời điểm sắp quên để nhắc ôn lại (1 → 3 → 7 → 14 → 30 ngày), đưa từ vựng từ trí nhớ ngắn hạn sang trí nhớ dài hạn vĩnh viễn.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="we-card we-card-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 mb-4">
                <Gamepad2 size={24} />
              </div>
              <h3 className="we-display text-xl text-[#1E1B4B] mb-1.5">
                3. Active Recall & Phản Xạ Nhanh
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                Chế độ tự che nghĩa / che từ và Mini Game Blast thử thách gõ từ rơi tự do giúp kích hoạt phản xạ gõ và nhận diện mặt từ trong 3 giây dưới áp lực thời gian.
              </p>
            </div>
          </div>
        </div>

        {/* Curated Vocabulary Collections */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                <Award size={14} />
                <span>Kho Bộ Từ Tuyển Chọn</span>
              </div>
              <h2 className="we-display text-3xl text-[#1E1B4B]">
                Hơn 1,500+ Từ Vựng Theo Từng Chủ Đề Trọng Điểm
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenSets}
              className="we-btn we-btn-sm self-start"
            >
              <span>Xem Tất Cả Các Bộ Từ</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Cambridge Reading */}
            <div className="we-card we-card-hover group relative flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen size={20} />
                  </div>
                  <span className="we-chip">
                    15+ Tập Cam
                  </span>
                </div>
                <h3 className="we-display text-xl text-[#1E1B4B] mb-1">
                  1,500 Từ Vựng IELTS Reading
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                  Trích xuất trực tiếp từ các bài đọc Cambridge IELTS 10–20, có phiên âm IPA, định nghĩa và câu ví dụ song ngữ.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSets}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:gap-2.5 transition-all"
              >
                <span>Học ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: Business English */}
            <div className="we-card we-card-hover group relative flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Award size={20} />
                  </div>
                  <span className="we-chip">
                    Công Sở & TOEIC
                  </span>
                </div>
                <h3 className="we-display text-xl text-[#1E1B4B] mb-1">
                  Từ Vựng Tiếng Anh Công Sở
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                  Emails, Meetings, Negotiations, Marketing, Finance & Management. Chuẩn format giao tiếp doanh nghiệp đa quốc gia.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSets}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:gap-2.5 transition-all"
              >
                <span>Học ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 3: Oxford 3000 & 5000 */}
            <div className="we-card we-card-hover group relative flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Target size={20} />
                  </div>
                  <span className="we-chip">
                    CEFR A1 – C1
                  </span>
                </div>
                <h3 className="we-display text-xl text-[#1E1B4B] mb-1">
                  Oxford 3000™ & 5000™ Cốt Lõi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                  Bộ từ vựng nền tảng quan trọng nhất của tiếng Anh do Đại học Oxford chuẩn hóa theo các mức độ từ cơ bản đến nâng cao.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSets}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 group-hover:gap-2.5 transition-all"
              >
                <span>Học ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Modern Executive Research Modal: "Từ Vựng Tuyển Chọn" (2,442 Core Words Analysis) */
export function CuratedPage({ onClose, onExplore }) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="we-card relative my-8 w-full max-w-4xl overflow-hidden !rounded-[28px] bg-[#FFFDF6] p-6 md:p-8 text-[#1E1B4B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="we-chip !bg-[#F8BE33] mb-2">
            <Target size={14} />
            <span>Nghiên Cứu Học Thuật Độc Quyền</span>
          </div>
          <h2 className="we-display text-3xl md:text-4xl text-[#1E1B4B]">
            Nghiên Cứu 2,442 Từ Cốt Lõi Chiếm 93.3% Đề Thi
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Sau khi phân tích 40 đề Reading trong Cambridge IELTS 7–18 với tổng cộng 116,165 từ vựng
          </p>
        </div>

        {/* Core Stats Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#E0E7FF] p-5 shadow-[var(--we-pop-sm)]">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              Nhóm từ thường gặp (≥ 5 lần)
            </div>
            <div className="text-4xl font-black text-indigo-900">2,442 từ</div>
            <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
              Chỉ 2,442 từ này đã chiếm tới <strong className="text-indigo-700 font-bold">93.3%</strong> toàn bộ nội dung xuất hiện trong đề thi. Học nhóm này trước giúp bạn tiết kiệm 80% thời gian tra từ điển!
            </p>
            <div className="mt-4 flex gap-2">
              <span className="we-chip !bg-[#E0E7FF]">
                1,061 từ: xuất hiện ≥ 16 lần
              </span>
              <span className="we-chip !bg-[#E0E7FF]">
                1,381 từ: 5–15 lần
              </span>
            </div>
          </div>

          <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nhóm từ ít gặp (&lt; 5 lần)
            </div>
            <div className="text-4xl font-black text-slate-700">4,750 từ</div>
            <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
              Chiếm vỏn vẹn <strong className="text-slate-700 font-bold">6.7%</strong> nội dung đề thi. Đây là các từ chuyên ngành sinh học, khảo cổ học... không nên tốn quá nhiều thời gian học thuộc lòng.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="we-chip">
                942 từ: 3–4 lần
              </span>
              <span className="we-chip">
                3,808 từ: 1–2 lần
              </span>
            </div>
          </div>
        </div>

        {/* Conclusion Pill */}
        <div className="rounded-2xl border-[2.5px] border-dashed border-[#1F9D63] bg-[#D4F5E4] p-4 mb-6 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-emerald-900 leading-relaxed font-medium">
            <strong>Lời khuyên học thuật:</strong> Toàn bộ 2,442 từ cốt lõi này đã được hệ thống phân tách sẵn vào các bộ Flashcard theo từng bài đọc Cambridge để bạn có thể học ngay mà không cần tốn công tổng hợp!
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="we-btn we-btn-white"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onExplore) onExplore();
            }}
            className="we-btn we-btn-indigo"
          >
            <BookOpen size={16} />
            <span>Mở Kho Bộ Từ Cambridge Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
