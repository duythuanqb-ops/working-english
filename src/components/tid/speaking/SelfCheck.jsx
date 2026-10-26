import React, { useState } from 'react';
import { Sparkles, Volume2, RotateCcw, Lightbulb, BookmarkPlus, Check } from 'lucide-react';
import { analyzeSpeech, speak } from './speakingUtils';

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
    return <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#8a8672]">Chưa có gợi ý offline cho câu này.</div>;
  }
  return (
    <div className="space-y-3">
      {tips.cues?.length > 0 && (
        <div className="rounded-xl border-2 border-[#111] bg-[#eef3df] p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[2px] text-[#4a6b2a]">🧠 Ý tưởng trả lời</p>
          <ul className="m-0 list-none space-y-1.5 p-0">
            {tips.cues.map((c, i) => <li key={i} className="text-sm leading-relaxed text-[#333]"><strong className="text-[#3d4a2a]">{c}</strong></li>)}
          </ul>
        </div>
      )}
      {tips.vocab?.length > 0 && (
        <div className="space-y-2">
          {tips.vocab.map((v, i) => (
            <div key={i} className="flex items-start justify-between gap-2 rounded-xl border-2 border-[#111] bg-[#fdf6e3] p-3">
              <div className="min-w-0">
                <div className="text-sm font-black text-[#111]">{v.t}</div>
                <p className="text-sm italic text-[#555]">“{v.s}”</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => speak(v.s, voice)} title="Nghe" className="rounded-lg border-2 border-[#111] bg-white p-1.5"><Volume2 size={13} /></button>
                {onSaveWord && (
                  <button
                    title="Lưu vào sổ từ vựng"
                    onClick={() => { onSaveWord({ word: v.t, meaningVi: '', partOfSpeech: 'phrase', examples: [{ en: v.s, vi: '' }], tags: ['IELTS Speaking'] }); setSaved(s => ({ ...s, [i]: true })); }}
                    className={`rounded-lg border-2 border-[#111] p-1.5 ${saved[i] ? 'bg-[#e3f5e8] text-[#18542a]' : 'bg-white'}`}
                  >
                    {saved[i] ? <Check size={13} /> : <BookmarkPlus size={13} />}
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

export default function SelfCheck({ part = 1, transcript, duration, audioUrl, onResay, resayDisabled }) {
  const m = analyzeSpeech(transcript, duration);
  const [lo, hi] = TARGET[part] || TARGET[1];
  const [ticks, setTicks] = useState({});
  const lengthNote = duration < lo ? `Câu trả lời hơi ngắn (${duration}s) — Part ${part} nên nói khoảng ${lo}–${hi}s, thêm lý do + ví dụ.`
    : duration > hi + 20 ? `Câu trả lời khá dài (${duration}s) — Part ${part} chỉ cần khoảng ${lo}–${hi}s.`
    : `Độ dài hợp lý (${duration}s) cho Part ${part}.`;
  const wpmNote = !m.wordCount ? 'Trình duyệt chưa nhận dạng được lời nói — hãy nghe lại bản thu để tự đánh giá.'
    : m.wpm < 90 ? 'Tốc độ hơi chậm — luyện nói liền mạch hơn.' : m.wpm > 170 ? 'Tốc độ khá nhanh — chú ý phát âm rõ từng ý.' : 'Tốc độ nói tự nhiên.';
  return (
    <div className="overflow-hidden rounded-2xl border-[3px] border-[#111] bg-white text-left shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between bg-[#111] px-6 py-3">
        <span className="flex items-center font-quicksand text-[11px] font-extrabold uppercase tracking-[3px] text-[#ffc926]">
          <Sparkles className="mr-2 h-3 w-3" /> Tự đánh giá (offline)
        </span>
        <span className="rounded-full border-2 border-[#111] bg-[#e8f0c9] px-3 py-1 font-quicksand text-xs font-extrabold text-[#111]">{m.wpm || '—'} WPM</span>
      </div>
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Thời gian', `${duration}s`], ['Số từ', m.wordCount], ['Tốc độ', m.wpm ? `${m.wpm} wpm` : '—'], ['Từ đệm', m.fillerCount]].map(([k, v]) => (
            <div key={k} className="rounded-xl border-2 border-[#111] bg-[#f4f1e6] p-3 text-center">
              <div className="mb-1 text-[10px] font-bold uppercase text-[#8a8672]">{k}</div>
              <div className="font-quicksand text-lg font-extrabold text-[#111]">{v}</div>
            </div>
          ))}
        </div>
        {audioUrl && <audio src={audioUrl} controls className="w-full" />}
        {transcript && (
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[3px] text-[#8a8672]">Mình nghe thấy</div>
            <p className="relative overflow-hidden rounded-2xl border-2 border-[#111] bg-[#faf9f2] p-4 text-sm font-medium leading-relaxed text-[#222]">
              <span className="absolute bottom-0 left-0 top-0 w-[5px] bg-[#5f6a45]" />“{transcript}”
            </p>
          </div>
        )}
        <ul className="space-y-1.5 text-sm font-semibold text-[#333]">
          <li>⏱ {lengthNote}</li>
          <li>🎙 {wpmNote}</li>
          {m.fillerCount > 3 && <li>🧹 Dùng {m.fillerCount} từ đệm (um, like, actually…) — thử thay bằng khoảng dừng ngắn.</li>}
        </ul>
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[3px] text-[#8a8672]">Checklist 4 tiêu chí IELTS</div>
          <div className="grid gap-2 md:grid-cols-2">
            {CHECKS.map(([k, name, desc]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-xl border-2 border-[#111] p-3 text-xs ${ticks[k] ? 'bg-[#e3f5e8]' : 'bg-white'}`}>
                <input type="checkbox" className="mt-0.5" checked={!!ticks[k]} onChange={e => setTicks(t => ({ ...t, [k]: e.target.checked }))} />
                <span><strong className="text-[#111]">{k} · {name}</strong><br /><span className="text-[#555]">{desc}</span></span>
              </label>
            ))}
          </div>
        </div>
        {onResay && (
          <button
            onClick={onResay}
            disabled={resayDisabled}
            className="tid-press flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#111] bg-[#111] py-3 font-quicksand text-sm font-extrabold text-[#ffc926] shadow-[4px_4px_0_#f96015] disabled:opacity-50"
          >
            <RotateCcw size={14} /> Trả lời lại câu này
          </button>
        )}
      </div>
    </div>
  );
}

export function HintToggle({ open, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[11px] font-bold text-[#5f6a45] transition-colors hover:text-[#111] hover:underline">
      <Lightbulb size={13} /> {open ? 'Ẩn gợi ý' : 'Gợi ý'}
    </button>
  );
}
