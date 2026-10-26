// /practice/listening/pronunciation/<pair> — hear one word, pick it from the minimal pair.
// Audio: recorded UK/US clips from the lesson data (falls back to the app's TTS when a clip fails).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadPronunciation } from './data';
import { ttsService } from '../../../services/ttsService';

const randomPicks = qs => qs.map(q => Math.floor(Math.random() * q.length));

function Quiz({ set, onBack }) {
  const n = set.questions.length;
  const [answers, setAnswers] = useState(() => set.questions.map(() => 0));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(() => set.questions.map(() => null));
  const [accent, setAccent] = useState('en-GB');
  const [playingWord, setPlayingWord] = useState(null);
  const [done, setDone] = useState(false);
  const audio = useRef(null);
  const autoplay = useRef(false);

  useEffect(() => { setAnswers(randomPicks(set.questions)); }, [set]);

  const q = set.questions[i];
  const target = q?.[answers[i] ?? 0];
  const answered = picked[i] !== null;
  const correct = answered && picked[i] === answers[i];
  const ipaOf = o => (accent === 'en-GB' ? o.ipaUK : o.ipaUS) || o.ipaUK || o.ipaUS;

  const play = useCallback(opt => {
    if (!opt) return;
    ttsService.stop();
    audio.current?.pause();
    const src = accent === 'en-GB' ? opt.audioUK : opt.audioUS;
    setPlayingWord(opt.word);
    const fallback = () => ttsService.speak(opt.word, { voiceType: accent === 'en-GB' ? 'UK' : 'US', onEnd: () => setPlayingWord(w => (w === opt.word ? null : w)) });
    if (!src) { fallback(); return; }
    const a = new Audio(src);
    audio.current = a;
    a.addEventListener('ended', () => setPlayingWord(w => (w === opt.word ? null : w)));
    a.play().catch(fallback);
  }, [accent]);

  useEffect(() => { if (autoplay.current && !done && !answered) play(target); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [i]);
  useEffect(() => () => { ttsService.stop(); audio.current?.pause(); }, []);

  const score = useMemo(() => picked.reduce((s, p, k) => (p !== null && p === answers[k] ? s + 1 : s), 0), [picked, answers]);

  if (done) {
    const pct = Math.round((score / n) * 100);
    const wrong = picked.map((p, k) => ({ k, p })).filter(({ k, p }) => p !== null && p !== answers[k]);
    return (
      <div className="min-h-screen bg-[#fafaf7] font-sans">
        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Kết quả · {set.contrast}</p>
            <h1 className="mb-6 text-5xl font-black uppercase tracking-tighter text-moss">{score}/{n}</h1>
            <div className="mb-6 h-4 border-2 border-black bg-slate-100"><div className={`h-full ${pct >= 80 ? 'bg-herb-500' : pct >= 50 ? 'bg-[#FFE787]' : 'bg-radiate'}`} style={{ width: `${pct}%` }} /></div>
            <p className="mb-8 font-newsreader italic leading-relaxed text-slate-600">
              {pct >= 80 ? 'Tai đã tách được cặp âm này. Thử cặp khác để mở rộng vùng nghe.' : pct >= 50 ? 'Đã nghe ra phần lớn. Làm lại một lượt nữa để âm ngấm chắc hơn.' : 'Cặp âm này còn lẫn — làm lại và bấm 🔊 nghe từng từ trước khi chọn.'}
            </p>
            {wrong.length > 0 && (
              <div className="mb-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Câu còn nhầm</p>
                <div className="space-y-2">
                  {wrong.map(({ k }) => {
                    const right = set.questions[k][answers[k]], chosen = set.questions[k][picked[k]];
                    return (
                      <div key={k} className="flex items-center gap-3 border-2 border-slate-200 p-3">
                        <button type="button" onClick={() => play(right)} aria-label={`Nghe lại ${right.word}`} className="h-9 w-9 shrink-0 border-2 border-black bg-[#FFE787] font-black transition-colors hover:bg-[#ED7A13]">🔊</button>
                        <span className="font-black text-moss">{right.word} <span className="font-mono text-sm font-normal text-slate-400">/{ipaOf(right)}/</span></span>
                        <span className="ml-auto text-xs font-black uppercase text-slate-300">bạn chọn: {chosen.word}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => { ttsService.stop(); audio.current?.pause(); autoplay.current = false; setAnswers(randomPicks(set.questions)); setPicked(set.questions.map(() => null)); setI(0); setDone(false); }} className="border-2 border-black bg-moss px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">Làm lại</button>
              <button type="button" onClick={onBack} className="border-2 border-black bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-moss shadow-[4px_4px_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">Chọn cặp âm khác</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] font-sans">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 transition-colors hover:text-moss">← Tất cả cặp âm</button>
          <div className="flex border-2 border-black">
            {['en-GB', 'en-US'].map(a => (
              <button key={a} type="button" onClick={() => setAccent(a)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${accent === a ? 'bg-moss text-white' : 'bg-white text-slate-400 hover:text-moss'}`}>{a === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}</button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h1 className="text-2xl font-black tracking-tight text-moss">{set.contrast}</h1>
            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Câu {i + 1}/{n}</span>
          </div>
          <div className="h-2 border-2 border-black bg-slate-100"><div className="h-full bg-herb-500 transition-all duration-300" style={{ width: `${((i + (answered ? 1 : 0)) / n) * 100}%` }} /></div>
        </div>
        <div className="mb-6 border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <p className="mb-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Bấm để nghe · rồi chọn từ bạn nghe được</p>
          <button type="button" onClick={() => { autoplay.current = true; play(target); }} aria-label="Nghe từ" className={`mx-auto h-24 w-24 border-2 border-black text-4xl shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-[3px_3px_0_rgba(0,0,0,1)] ${playingWord === target?.word ? 'scale-105 bg-[#ED7A13]' : 'bg-[#FFE787] hover:bg-[#ED7A13]'}`}>🔊</button>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4">
          {q.map((o, k) => {
            const isAns = k === answers[i], isPick = picked[i] === k;
            const tone = answered ? (isAns ? 'bg-herb-200' : isPick ? 'bg-red-100' : 'bg-white opacity-50') : 'bg-white hover:-translate-y-1 cursor-pointer';
            return (
              <div key={o.word + k} className={`${tone} flex flex-col border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,1)] transition-all`}>
                <button type="button" disabled={answered} onClick={() => { autoplay.current = true; setPicked(p => p.map((v, x) => (x === i ? k : v))); play(target); }} className="p-6 disabled:cursor-default">
                  <span className="block text-2xl font-black lowercase tracking-tight text-moss">{o.word}</span>
                  <span className="mt-1 block font-mono text-sm text-slate-400">/{ipaOf(o)}/</span>
                </button>
                {answered && <button type="button" onClick={() => play(o)} className={`border-t-2 border-black py-2.5 text-xs font-black uppercase tracking-widest text-moss transition-colors ${playingWord === o.word ? 'bg-[#ED7A13]' : 'hover:bg-[#FFE787]'}`}>🔊 nghe từ này</button>}
              </div>
            );
          })}
        </div>
        {answered && (
          <div className={`flex items-center gap-4 border-2 border-black p-5 shadow-[5px_5px_0_rgba(0,0,0,1)] ${correct ? 'bg-herb-100' : 'bg-[#FFFADD]'}`}>
            <span className="text-3xl">{correct ? '✓' : '✗'}</span>
            <p className="flex-1 font-newsreader italic text-slate-700">
              {correct ? <>Đúng — đó là <strong className="font-black not-italic text-moss">{target.word}</strong>.</> : <>Từ vừa đọc là <strong className="font-black not-italic text-moss">{target.word}</strong>. Nghe lại cả hai để thấy chỗ khác nhau.</>}
            </p>
            <button type="button" onClick={() => { if (i + 1 >= n) setDone(true); else { autoplay.current = true; setI(i + 1); } }} className="shrink-0 whitespace-nowrap border-2 border-black bg-moss px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">{i + 1 >= n ? 'Xem kết quả' : 'Câu tiếp →'}</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PronunciationSet({ setId, onBack }) {
  const [set, setSet] = useState(undefined);
  useEffect(() => { loadPronunciation().then(all => setSet(all.find(s => s.id === setId) || null)); }, [setId]);
  if (set === undefined) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" /></div>;
  if (!set) return <div className="p-16 text-center font-bold text-slate-500">Không tìm thấy cặp âm này.</div>;
  return <Quiz set={set} onBack={onBack} />;
}
