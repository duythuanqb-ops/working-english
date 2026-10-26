// "Tidians" (Luyện Đặt Câu / Luyện Nói) — write or say a sentence using the word.
// The site grades with AI (premium); offline we self-check: the sentence must use the word and be a real sentence,
// then the sample sentence is shown for comparison. Speech input uses the Web Speech API when available.
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Mic, Square, Volume2 } from 'lucide-react';
import { blankSentence, gloss } from './decks';
import { logActivity, rateWord } from './store';
import { ACCENT, CHIP, Feedback, MUTE, PrimaryBtn, WatchingSun } from './fcParts';

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function Tidians({ words, order, deckLabel, speak, onBack }) {
  const [pos, setPos] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [listening, setListening] = useState(false);
  const [count, setCount] = useState({ done: 0, good: 0 });
  const recRef = useRef(null);
  const w = words[order[pos]] || words[0];
  const finished = pos >= order.length;

  useEffect(() => { setText(''); setResult(null); setShowSample(false); }, [pos]);
  useEffect(() => () => recRef.current?.abort?.(), []);

  const submit = () => {
    const s = text.trim();
    if (!s) return;
    const used = !!blankSentence(s, w.w) || s.toLowerCase().includes(w.w.toLowerCase());
    const len = s.split(/\s+/).length;
    const ok = used && len >= 5;
    setResult({ ok, used, len });
    setCount(c => ({ done: c.done + 1, good: c.good + (ok ? 1 : 0) }));
    rateWord(w.w, ok ? 'good' : 'hard', w.deckId);
    logActivity();
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
              <div key={l} className="rounded-[18px] bg-white px-5 py-3 text-[#1b1d22]"><div className="text-[28px] font-bold leading-none">{v}</div><div className="mt-1 text-[12px] font-bold text-[#6b7080]">{l}</div></div>
            ))}
          </div>
          <p className="m-0 text-[14px] font-semibold opacity-80">Làm lại bộ này để luyện thêm, hoặc quay về lật thẻ và chọn chế độ khác.</p>
          <div className="flex gap-2"><PrimaryBtn onClick={() => { setPos(0); setCount({ done: 0, good: 0 }); }}>Ôn phiên mới</PrimaryBtn><button type="button" onClick={onBack} className="h-[52px] rounded-[16px] bg-white/35 px-5 text-[14.5px] font-extrabold">Quay lại lật thẻ</button></div>
        </div>
      ) : (
        <div className="relative grid flex-1 grid-cols-1 gap-5 p-6 pt-4 @min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-3 rounded-[0_28px_28px_0] bg-white p-7 pl-9 text-[#1b1d22] shadow-[0_26px_40px_-22px_rgba(27,29,34,.45)]">
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
            <h2 className="m-0 text-[40px] font-bold leading-[.98] tracking-[-0.035em]">Tidians.</h2>
            <p className="m-0 max-w-[360px] text-[14.5px] font-semibold leading-[1.45] opacity-85">Đặt một câu có dùng từ này, gõ hoặc bấm mic để nói.</p>
            <label className="text-[12px] font-extrabold tracking-[.1em] opacity-75">CÂU CỦA BẠN</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={`Viết một câu tiếng Anh có dùng “${w.w}”…`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              className="w-full resize-none rounded-[18px] bg-white px-4 py-3 text-[16px] font-semibold text-[#1b1d22] outline-none placeholder:text-[#8b909b]" />
            <div className="flex flex-wrap items-center gap-2">
              <PrimaryBtn onClick={submit} disabled={!text.trim()}>Nộp bài (Enter)</PrimaryBtn>
              {SR && <button type="button" onClick={mic} className="inline-flex h-[52px] items-center gap-1.5 rounded-[16px] bg-white/25 px-4 text-[14px] font-extrabold hover:bg-white/40">{listening ? <><Square size={15} /> Dừng thu âm</> : <><Mic size={16} /> Bắt đầu nói</>}</button>}
            </div>
            {result && (
              <Feedback ok={result.ok}>
                {result.ok ? 'Rất tốt! Câu của bạn đã dùng đúng từ này.' : !result.used ? `Cần cải thiện một chút — câu chưa có từ “${w.w}”.` : 'Cần cải thiện một chút — viết thành một câu đầy đủ hơn nhé.'}
              </Feedback>
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
