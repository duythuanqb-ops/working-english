import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Mic, Square, Volume2, Sparkles, Loader2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { blankSentence, gloss } from './decks';
import { logActivity, rateWord } from './store';
import { ACCENT, CHIP, Feedback, MUTE, PrimaryBtn, WatchingSun } from './fcParts';
import { aiService } from '../../../services/aiService';

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function Tidians({ words, order, deckLabel, speak, onBack }) {
  const [pos, setPos] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [listening, setListening] = useState(false);
  const [count, setCount] = useState({ done: 0, good: 0 });
  const recRef = useRef(null);
  const w = words[order[pos]] || words[0];
  const finished = pos >= order.length;

  useEffect(() => {
    setText('');
    setResult(null);
    setAiAnalysis(null);
    setIsAnalyzing(false);
    setShowSample(false);
  }, [pos]);
  useEffect(() => () => recRef.current?.abort?.(), []);

  const submit = async () => {
    const s = text.trim();
    if (!s) return;
    const used = !!blankSentence(s, w.w) || s.toLowerCase().includes(w.w.toLowerCase());
    const len = s.split(/\s+/).length;
    const ok = used && len >= 5;
    setResult({ ok, used, len });
    setCount(c => ({ done: c.done + 1, good: c.good + (ok ? 1 : 0) }));
    rateWord(w.w, ok ? 'good' : 'hard', w.deckId);
    logActivity();

    // Trigger AI evaluation in background
    setIsAnalyzing(true);
    try {
      const analysis = await aiService.evaluateSentence(w.w, s);
      setAiAnalysis(analysis);
    } catch (err) {
      console.warn('AI sentence analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const mic = () => {
    if (!SR) return;
    if (listening) { recRef.current?.stop(); return; }
    const r = new SR();
    r.lang = 'en-US'; r.interimResults = true;
    r.onresult = e => setText([...e.results].map(x => x[0].transcript).join(' '));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r; r.start(); setListening(true);
  };

  return (
    <section className="td-pop @container relative flex min-h-[500px] flex-col overflow-hidden rounded-[30px]" style={{ background: ACCENT.bg, color: ACCENT.ink }}>
      <span aria-hidden className="pointer-events-none absolute -right-[90px] -top-[90px] h-[300px] w-[300px] rounded-full bg-white/[.14]" />
      <span aria-hidden className="td-bob pointer-events-none absolute left-[2%] top-[10px] z-[3]"><WatchingSun size={62} /></span>
      <div className="relative flex flex-wrap items-center gap-2 px-6 pl-[90px] pt-6">
        <span className="inline-flex h-[30px] items-center rounded-[10px] bg-white/35 px-2.5 text-[12.5px] font-extrabold">{deckLabel}</span>
        <span className="text-[12.5px] font-extrabold tracking-[.1em] opacity-80">{finished ? 'Hoàn thành' : `Từ ${pos + 1}/${order.length}`}</span>
        <button type="button" onClick={onBack} className="ml-auto h-[30px] rounded-[10px] bg-black/[.08] px-3 text-[12.5px] font-extrabold hover:bg-black/[.14]">Quay lại lật thẻ</button>
      </div>
      {finished ? (
        <div className="relative m-auto flex max-w-[460px] flex-col items-center gap-3 p-8 text-center">
          <h2 className="m-0 text-[40px] font-bold tracking-[-0.03em]">Xong phiên!</h2>
          <p className="m-0 text-[15px] font-semibold opacity-85">Bạn đã hoàn thành phiên luyện đặt câu.</p>
          <div className="mt-2 flex gap-3">
            {[['Số câu đã đặt', count.done], ['Câu đúng', count.good]].map(([l, v]) => (
              <div key={l} className="rounded-[18px] bg-white px-5 py-3 text-[#1E1B4B]"><div className="text-[28px] font-bold leading-none">{v}</div><div className="mt-1 text-[12px] font-bold text-[#6B6790]">{l}</div></div>
            ))}
          </div>
          <p className="m-0 text-[14px] font-semibold opacity-80">Làm lại bộ này để luyện thêm, hoặc quay về lật thẻ và chọn chế độ khác.</p>
          <div className="flex gap-2"><PrimaryBtn onClick={() => { setPos(0); setCount({ done: 0, good: 0 }); }}>Ôn phiên mới</PrimaryBtn><button type="button" onClick={onBack} className="h-[52px] rounded-[16px] bg-white/35 px-5 text-[14.5px] font-extrabold">Quay lại lật thẻ</button></div>
        </div>
      ) : (
        <div className="relative grid flex-1 grid-cols-1 gap-5 p-6 pt-4 @min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-3 rounded-[0_28px_28px_0] border-[3px] border-l-0 border-[#1E1B4B] bg-white p-7 pl-9 text-[#1E1B4B] shadow-[0_26px_40px_-22px_rgba(30,27,75,.45)]">
            <span className="text-[14.5px] font-extrabold tracking-[.14em]" style={{ color: MUTE }}>LUYỆN ĐẶT CÂU</span>
            <div className="flex items-center gap-3">
              <span className="break-words text-[44px] font-bold leading-[1.1] tracking-[-0.02em]">{w.w}</span>
              <button type="button" onClick={() => speak(w.w)} aria-label="Phát âm" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full" style={{ background: CHIP }}><Volume2 size={18} /></button>
            </div>
            <span className="text-[20px] font-bold" style={{ color: ACCENT.exInk }}>{gloss(w)}</span>
            {showSample && w.ex && (
              <div className="mt-1 flex gap-2.5">
                <span className="w-1 shrink-0 rounded-sm" style={{ background: ACCENT.bg }} />
                <div><p className="m-0 text-[17px] font-semibold italic leading-[1.45]" style={{ color: ACCENT.exInk }}>“{w.ex}”</p>{w.exVi && <p className="m-0 text-[14px]" style={{ color: MUTE }}>{w.exVi}</p>}</div>
              </div>
            )}
            {w.ex && (
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSample(s => !s)} className="text-[13px] font-extrabold underline underline-offset-[3px]" style={{ color: '#c9590a' }}>Xem ví dụ mẫu</button>
                <button type="button" onClick={() => speak(w.ex)} className="text-[13px] font-extrabold underline underline-offset-[3px]" style={{ color: '#c9590a' }}>Nghe câu mẫu</button>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h2 className="m-0 text-[40px] font-bold leading-[.98] tracking-[-0.035em]">Đặt câu &amp; Nói.</h2>
            <p className="m-0 max-w-[360px] text-[14.5px] font-semibold leading-[1.45] opacity-85">Đặt một câu có dùng từ này, gõ hoặc bấm mic để nói.</p>
            <label className="text-[12px] font-extrabold tracking-[.1em] opacity-75">CÂU CỦA BẠN</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={`Viết một câu tiếng Anh có dùng “${w.w}”…`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              className="w-full resize-none rounded-[18px] border-[2.5px] border-[#1E1B4B] bg-white px-4 py-3 text-[16px] font-semibold text-[#1E1B4B] outline-none placeholder:text-[#6B6790]" />
            <div className="flex flex-wrap items-center gap-2">
              <PrimaryBtn onClick={submit} disabled={!text.trim()}>Nộp bài (Enter)</PrimaryBtn>
              {SR && <button type="button" onClick={mic} className="inline-flex h-[52px] items-center gap-1.5 rounded-[16px] bg-white/25 px-4 text-[14px] font-extrabold hover:bg-white/40">{listening ? <><Square size={15} /> Dừng thu âm</> : <><Mic size={16} /> Bắt đầu nói</>}</button>}
            </div>
            {result && (
              <div className="flex flex-col gap-2">
                <Feedback ok={result.ok}>
                  {result.ok ? 'Rất tốt! Câu của bạn đã dùng đúng từ này.' : !result.used ? `Cần cải thiện một chút — câu chưa có từ “${w.w}”.` : 'Cần cải thiện một chút — viết thành một câu đầy đủ hơn nhé.'}
                </Feedback>

                {isAnalyzing && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/30 px-3 py-2 text-[12.5px] font-bold text-[#1E1B4B]">
                    <Loader2 size={15} className="animate-spin text-[#4F46E5]" />
                    <span>AI đang phân tích ngữ pháp & độ tự nhiên...</span>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="flex flex-col gap-2 rounded-[18px] border-2 border-[#1E1B4B] bg-white p-3.5 text-[#1E1B4B] shadow-[0_4px_0_#1E1B4B]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-extrabold text-[13px] text-[#4F46E5]">
                        <Sparkles size={15} />
                        <span>AI Nhận Xét & Chấm Điểm</span>
                      </div>
                      <span className="rounded-md bg-[#FFF0C2] px-2 py-0.5 text-[12px] font-black">
                        {aiAnalysis.score}/10
                      </span>
                    </div>

                    <p className="m-0 text-[13px] font-medium leading-relaxed text-[#334155]">
                      {aiAnalysis.feedbackVi}
                    </p>

                    {aiAnalysis.betterVersion && aiAnalysis.betterVersion !== text.trim() && (
                      <div className="rounded-lg bg-slate-50 p-2 text-[12.5px]">
                        <span className="font-bold text-[#0F172A]">Câu sửa chuẩn: </span>
                        <span className="font-medium text-[#475569]">{aiAnalysis.betterVersion}</span>
                      </div>
                    )}

                    {aiAnalysis.proVersion && (
                      <div className="flex items-start justify-between gap-2 rounded-lg bg-[#EEF2FF] p-2 text-[12.5px]">
                        <div>
                          <div className="font-extrabold text-[#4F46E5]">Phiên bản Nâng Band 8.0+:</div>
                          <div className="font-medium text-[#1E1B4B]">"{aiAnalysis.proVersion}"</div>
                          {aiAnalysis.proExplanationVi && (
                            <div className="mt-0.5 text-[11px] text-[#6366F1]">{aiAnalysis.proExplanationVi}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(aiAnalysis.proVersion)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-[#C7D2FE] text-[#4F46E5] hover:bg-[#E0E7FF]"
                          title="Nghe phát âm phiên bản nâng cao"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-1 flex items-center gap-2">
              <button type="button" onClick={() => setPos(p => Math.max(0, p - 1))} aria-label="Từ trước" className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-white/25 hover:bg-white/40"><ChevronLeft size={20} /></button>
              <button type="button" onClick={() => setPos(p => p + 1)} className="flex h-[42px] items-center gap-1 rounded-[14px] bg-white/25 px-4 text-[14px] font-extrabold hover:bg-white/40">Từ tiếp theo <ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
