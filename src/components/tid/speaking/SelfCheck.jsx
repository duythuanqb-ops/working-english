import React, { useState } from 'react';
import { Sparkles, Volume2, RotateCcw, Lightbulb, BookmarkPlus, Check } from 'lucide-react';
import { analyzeSpeech, speak } from './speakingUtils';
import { aiService } from '../../../services/aiService';

// Offline stand-in for the site's AI "Examiner's Detailed Assessment": shows the transcript,
// fluency metrics computed locally and an IELTS self-check list (no AI band score).
const TARGET = { 1: [15, 45], 2: [90, 120], 3: [30, 75] };
const CHECKS = [
  ['FC', 'Fluency & Coherence', 'Nói liền mạch, ít ngập ngừng, có từ nối (firstly, on top of that, that said…)'],
  ['LR', 'Lexical Resource', 'Dùng collocation / idiom tự nhiên, tránh lặp từ'],
  ['GRA', 'Grammar', 'Kết hợp câu phức, mệnh đề quan hệ, câu điều kiện; ít lỗi thì'],
  ['P', 'Pronunciation', 'Phát âm rõ đuôi -s/-ed, trọng âm & ngữ điệu tự nhiên'],
];

export function TipsPanel({ tips, onSaveWord, voice }) {
  const [saved, setSaved] = useState({});
  if (!tips || (!tips.cues?.length && !tips.vocab?.length)) {
    return <div className="text-xs font-bold text-[#6B6790]">Chưa có gợi ý offline cho câu này.</div>;
  }
  return (
    <div className="space-y-3">
      {tips.cues?.length > 0 && (
        <div className="rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] p-3.5 shadow-[0_2px_0_#1E1B4B]">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#F2683A]">🧠 Ý tưởng triển khai câu trả lời</p>
          <ul className="m-0 list-none space-y-2 p-0">
            {tips.cues.map((c, i) => (
              <li key={i} className="text-sm font-bold leading-relaxed text-[#1E1B4B]">
                • <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tips.vocab?.length > 0 && (
        <div className="space-y-2">
          {tips.vocab.map((v, i) => (
            <div key={i} className="flex items-start justify-between gap-2 rounded-2xl border-[2px] border-[#1E1B4B] bg-white p-3 shadow-[0_2px_0_#1E1B4B]">
              <div className="min-w-0">
                <div className="text-sm font-black text-[#1E1B4B]">{v.t}</div>
                <p className="text-xs italic font-medium text-[#6B6790]">“{v.s}”</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => speak(v.s, voice)}
                  title="Nghe phát âm"
                  className="rounded-xl border-[1.5px] border-[#1E1B4B] bg-[#FFF8E7] p-1.5 text-[#1E1B4B] shadow-sm hover:bg-[#F8BE33]"
                >
                  <Volume2 size={13} strokeWidth={2.5} />
                </button>
                {onSaveWord && (
                  <button
                    type="button"
                    title="Lưu vào sổ từ vựng"
                    onClick={() => {
                      onSaveWord({ word: v.t, meaningVi: '', partOfSpeech: 'phrase', examples: [{ en: v.s, vi: '' }], tags: ['IELTS Speaking'] });
                      setSaved(s => ({ ...s, [i]: true }));
                    }}
                    className={`rounded-xl border-[1.5px] border-[#1E1B4B] p-1.5 text-xs font-black shadow-sm ${
                      saved[i] ? 'bg-[#3ECF8E] text-[#1E1B4B]' : 'bg-white text-[#1E1B4B] hover:bg-[#FFF8E7]'
                    }`}
                  >
                    {saved[i] ? <Check size={13} strokeWidth={2.5} /> : <BookmarkPlus size={13} strokeWidth={2.5} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SelfCheck({ part = 1, question, transcript, duration, audioUrl, voice, onResay, resayDisabled }) {
  const m = analyzeSpeech(transcript, duration);
  const [lo, hi] = TARGET[part] || TARGET[1];
  const [ticks, setTicks] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  const handleEvaluate = async () => {
    if (!transcript || transcript.trim().length < 5) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiService.evaluateSpeakingResponse(question || 'IELTS Speaking Question', transcript, part);
      setAiResult(res);
    } catch (err) {
      console.error('Speaking AI Error:', err);
      setAiError(err.message || 'Không thể kết nối AI Examiner');
    } finally {
      setAiLoading(false);
    }
  };

  const lengthNote = duration < lo ? `Câu trả lời hơi ngắn (${duration}s) — Part ${part} nên nói khoảng ${lo}–${hi}s, thêm lý do + ví dụ.`
    : duration > hi + 20 ? `Câu trả lời khá dài (${duration}s) — Part ${part} chỉ cần khoảng ${lo}–${hi}s.`
    : `Độ dài hợp lý (${duration}s) cho Part ${part}.`;
  const wpmNote = !m.wordCount ? 'Trình duyệt chưa nhận dạng được lời nói — hãy nghe lại bản thu để tự đánh giá.'
    : m.wpm < 90 ? 'Tốc độ hơi chậm — luyện nói liền mạch hơn.' : m.wpm > 170 ? 'Tốc độ khá nhanh — chú ý phát âm rõ từng ý.' : 'Tốc độ nói tự nhiên.';
  return (
    <div className="overflow-hidden rounded-3xl border-[2.5px] border-[#1E1B4B] bg-white text-left shadow-[0_4px_0_#1E1B4B]">
      <div className="flex items-center justify-between border-b-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-6 py-3.5">
        <span className="flex items-center text-xs font-black uppercase tracking-wider text-[#1E1B4B]">
          <Sparkles className="mr-2 h-4 w-4 text-[#F2683A]" /> Đánh giá &amp; Phân tích lời nói
        </span>
        <span className="rounded-full border-[1.5px] border-[#1E1B4B] bg-[#3ECF8E] px-3 py-1 text-xs font-black text-[#1E1B4B] shadow-sm">{m.wpm || '—'} WPM</span>
      </div>
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Thời gian', `${duration}s`], ['Số từ', m.wordCount], ['Tốc độ', m.wpm ? `${m.wpm} wpm` : '—'], ['Từ đệm', m.fillerCount]].map(([k, v]) => (
            <div key={k} className="rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FAF8F5] p-3 text-center shadow-[0_2px_0_#1E1B4B]">
              <div className="mb-1 text-[10px] font-black uppercase text-[#6B6790]">{k}</div>
              <div className="text-lg font-black text-[#1E1B4B]">{v}</div>
            </div>
          ))}
        </div>
        {audioUrl && <audio src={audioUrl} controls className="w-full rounded-xl" />}
        {transcript && (
          <div>
            <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#6B6790]">Nội dung nhận dạng giọng nói</div>
            <p className="rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFFDF8] p-4 text-sm font-bold leading-relaxed text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B]">
              “{transcript}”
            </p>
          </div>
        )}

        {/* AI Examiner Assessment Card */}
        <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFFDF5] p-4 shadow-[0_4px_0_#1E1B4B]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1E1B4B]/15 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#1E1B4B] bg-[#4F46E5] text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-quicksand text-[15px] font-black text-[#1E1B4B]">AI Examiner Nhận Xét & Chấm Band</h4>
                <p className="text-[11px] font-semibold text-[#6B6790]">Đánh giá theo 4 tiêu chí chuẩn IELTS Speaking</p>
              </div>
            </div>

            {!aiResult && !aiLoading && (
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!transcript || transcript.trim().length < 5}
                className="we-btn we-btn-sm we-btn-indigo"
                title={!transcript ? 'Cần có nội dung bài nói để chấm điểm' : 'Bấm để AI Examiner chấm điểm'}
              >
                <Sparkles size={14} /> Chấm điểm & Nâng Band
              </button>
            )}
          </div>

          {aiLoading && (
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4F46E5] border-t-transparent" />
              <span className="font-quicksand text-sm font-extrabold text-[#4F46E5]">AI Examiner đang nghe và phân tích bài nói của bạn...</span>
            </div>
          )}

          {aiError && (
            <div className="mt-3 flex items-center justify-between rounded-xl border-2 border-[#F2683A] bg-[#FFE1D4] p-3 text-xs font-bold text-[#F2683A]">
              <span>{aiError}</span>
              <button onClick={handleEvaluate} className="underline hover:opacity-80">Thử lại</button>
            </div>
          )}

          {aiResult && (
            <div className="mt-4 space-y-4">
              {/* Band Score & 4 Criteria badges */}
              <div className="flex flex-wrap items-center gap-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white p-3">
                <div className="flex items-center gap-2 rounded-lg border-2 border-[#1E1B4B] bg-[#F8BE33] px-3 py-1.5 shadow-[0_2px_0_#1E1B4B]">
                  <span className="text-[11px] font-extrabold uppercase text-[#1E1B4B]">Estimated</span>
                  <span className="font-quicksand text-lg font-black text-[#1E1B4B]">Band {aiResult.bandScore || '6.5'}</span>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
                  <div className="rounded-lg border border-[#1E1B4B]/20 bg-[#F8FAFC] px-2 py-1 text-center">
                    <span className="block text-[9px] font-bold text-[#6B6790]">Fluency (FC)</span>
                    <span className="font-quicksand text-sm font-extrabold text-[#1E1B4B]">{aiResult.fluency || '6.5'}</span>
                  </div>
                  <div className="rounded-lg border border-[#1E1B4B]/20 bg-[#F8FAFC] px-2 py-1 text-center">
                    <span className="block text-[9px] font-bold text-[#6B6790]">Lexical (LR)</span>
                    <span className="font-quicksand text-sm font-extrabold text-[#1E1B4B]">{aiResult.lexical || '6.5'}</span>
                  </div>
                  <div className="rounded-lg border border-[#1E1B4B]/20 bg-[#F8FAFC] px-2 py-1 text-center">
                    <span className="block text-[9px] font-bold text-[#6B6790]">Grammar (GRA)</span>
                    <span className="font-quicksand text-sm font-extrabold text-[#1E1B4B]">{aiResult.grammar || '6.0'}</span>
                  </div>
                  <div className="rounded-lg border border-[#1E1B4B]/20 bg-[#F8FAFC] px-2 py-1 text-center">
                    <span className="block text-[9px] font-bold text-[#6B6790]">Pronounce (P)</span>
                    <span className="font-quicksand text-sm font-extrabold text-[#1E1B4B]">{aiResult.pronunciation || '6.5'}</span>
                  </div>
                </div>
              </div>

              {/* General Feedback */}
              {aiResult.generalFeedback && (
                <p className="text-xs font-semibold leading-relaxed text-[#3F3A6B]">
                  💬 <strong className="text-[#1E1B4B]">Nhận xét chung:</strong> {aiResult.generalFeedback}
                </p>
              )}

              {/* Strengths & Improvements */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {aiResult.strengths?.length > 0 && (
                  <div className="rounded-xl border border-[#3ECF8E] bg-[#D4F5E4] p-2.5">
                    <span className="text-[10px] font-black uppercase text-[#18542A]">✓ Điểm làm tốt</span>
                    <ul className="mt-1 space-y-1 text-xs font-medium text-[#1E1B4B]">
                      {aiResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">• <span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResult.improvements?.length > 0 && (
                  <div className="rounded-xl border border-[#F2683A] bg-[#FFE1D4] p-2.5">
                    <span className="text-[10px] font-black uppercase text-[#C23B3B]">⚠ Cần cải thiện</span>
                    <ul className="mt-1 space-y-1 text-xs font-medium text-[#1E1B4B]">
                      {aiResult.improvements.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">• <span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Elevated Band 8.0+ Model Answer */}
              {aiResult.betterResponse && (
                <div className="rounded-xl border-2 border-[#4F46E5] bg-[#EEF2FF] p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#4F46E5]">
                      <Sparkles size={13} /> Phiên bản nâng cấp Band 8.0+
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(aiResult.betterResponse, voice)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#4F46E5]/40 bg-white px-2 py-0.5 text-[11px] font-bold text-[#4F46E5] shadow-sm hover:bg-[#4F46E5] hover:text-white"
                      title="Nghe phát âm câu mẫu"
                    >
                      <Volume2 size={12} /> Nghe
                    </button>
                  </div>
                  <p className="text-xs font-semibold italic leading-relaxed text-[#1E1B4B]">
                    “{aiResult.betterResponse}”
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-1.5 text-sm font-semibold text-[#333]">
          <li>⏱ {lengthNote}</li>
          <li>🎙 {wpmNote}</li>
          {m.fillerCount > 3 && <li>🧹 Dùng {m.fillerCount} từ đệm (um, like, actually…) — thử thay bằng khoảng dừng ngắn.</li>}
        </ul>
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#6B6790]">Checklist 4 tiêu chí IELTS</div>
          <div className="grid gap-2 md:grid-cols-2">
            {CHECKS.map(([k, name, desc]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border-[2px] border-[#1E1B4B] p-3 text-xs shadow-sm transition-all ${ticks[k] ? 'bg-[#D1FAE5]' : 'bg-white hover:bg-[#FFF8E7]'}`}>
                <input type="checkbox" className="mt-0.5 accent-[#4F46E5]" checked={!!ticks[k]} onChange={e => setTicks(t => ({ ...t, [k]: e.target.checked }))} />
                <span><strong className="text-[#1E1B4B]">{k} · {name}</strong><br /><span className="text-[#6B6790]">{desc}</span></span>
              </label>
            ))}
          </div>
        </div>
        {onResay && (
          <button
            onClick={onResay}
            disabled={resayDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] py-3.5 text-xs font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <RotateCcw size={14} strokeWidth={2.5} /> Trả lời lại câu này
          </button>
        )}
      </div>
    </div>
  );
}

export function HintToggle({ open, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-xs font-black text-[#4F46E5] transition-colors hover:underline">
      <Lightbulb size={13} strokeWidth={2.5} /> {open ? 'Ẩn gợi ý' : 'Gợi ý ý tưởng'}
    </button>
  );
}
