import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Play, Copy, Check, ChevronDown, ChevronUp, Mic, StopCircle, Volume2, VolumeX, SkipForward, AlertCircle } from 'lucide-react';
import SelfCheck, { TipsPanel } from './SelfCheck';
import { useLocalData, loadData, useRecorder, useSpaceToRecord, speak, stopSpeaking, VOICES, addHistory, fmtTime, readHistory, slug } from './speakingUtils';

const ForecastExam = lazy(() => import('./ForecastExam'));

// /practice/speaking/forecast — "BỘ DỰ ĐOÁN ĐỀ THI IELTS SPEAKING" (Quý 3 + Quý 2 / 2026)
const SETS = [
  { id: 'q3-2026', label: 'Quý 3 · Tháng 9–12/2026', file: 'forecast-q3-2026' },
  { id: 'q2-2026', label: 'Quý 2 · Tháng 5–8/2026', file: 'forecast-q2-2026' },
];
const GRID = 'bg-[#6f8f4b] bg-[length:24px_24px] bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)]';
const GRID_STYLE = { fontFamily: 'var(--font-nunito), sans-serif', backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '24px 24px' };

// Previous local attempts for one question (replaces the site's session history per question_key)
function Attempts({ list }) {
  if (!list?.length) return null;
  return (
    <div className="mt-2.5 space-y-2">
      {list.slice(0, 3).map((e, i) => (
        <div key={i} className="rounded-lg border-2 border-[#111] bg-[#fdf6e3]/70 p-3 shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#8a8672]">{new Date(e.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            {e.wpm > 0 && <span className="rounded bg-[#3b82f6] px-2 py-0.5 text-[11px] font-black text-white">{e.wpm} WPM</span>}
          </div>
          {e.transcript && <p className="line-clamp-3 text-xs italic leading-relaxed text-[#444]">"{e.transcript}"</p>}
        </div>
      ))}
    </div>
  );
}

// Practice modal ("IELTS Mock Interview" overlay of the forecast page)
function PracticeModal({ target, onClose, onSaveWord, roulette }) {
  const isP1 = target.type === 'p1';
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState('prep'); // p23: prep -> speak -> p3
  const [p3Idx, setP3Idx] = useState(0);
  const [done, setDone] = useState(false);
  const [voice, setVoice] = useState(VOICES[0]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(false);
  const [timer, setTimer] = useState(isP1 ? 45 : 60);

  const question = isP1 ? target.topic.questions[idx] : stage === 'p3' ? target.cue.part3[p3Idx] : target.cue.cueCard.replace(/^\d+\.\s*/, '');
  const partLabel = isP1 ? 'Part 1' : stage === 'p3' ? 'Part 3' : 'Part 2';

  const rec = useRecorder({
    maxSeconds: !isP1 && stage === 'speak' ? 120 : 60,
    onDone: r => {
      setResult(r);
      addHistory({ mode: 'forecast_practice', topic: isP1 ? target.topic.title : target.cue.cueCard, question, transcript: r.transcript, duration: r.duration, wpm: r.duration ? Math.round(r.transcript.split(/\s+/).filter(Boolean).length / r.duration * 60) : 0, key: slug(question) });
    },
  });
  useSpaceToRecord({ canStart: isP1 || stage !== 'prep', recording: rec.recording, start: rec.start, stop: rec.stop, cancel: rec.cancel });

  // countdown per question (45s P1 / 60s prep / 120s talk / 45s P3)
  useEffect(() => { setTimer(isP1 ? 45 : stage === 'prep' ? 60 : stage === 'speak' ? 120 : 45); setResult(null); setHint(false); }, [idx, stage, p3Idx, isP1]);
  useEffect(() => {
    if (timer <= 0 || rec.recording) return undefined;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, rec.recording]);
  useEffect(() => { if (!isP1 && stage === 'prep' && timer === 0) setStage('speak'); }, [timer, stage, isP1]);
  useEffect(() => { if (!muted && (isP1 || stage !== 'speak')) speak(question, voice); return () => stopSpeaking(); }, [question, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (rec.recording) rec.cancel();
    if (isP1) { if (idx < target.topic.questions.length - 1) setIdx(i => i + 1); else setDone(true); return; }
    if (stage === 'prep') setStage('speak');
    else if (stage === 'speak') { if (target.cue.part3.length) setStage('p3'); else setDone(true); }
    else if (p3Idx < target.cue.part3.length - 1) setP3Idx(i => i + 1); else setDone(true);
  };

  // Offline hint: cue ideas / vocab from the site's roulette deck when the question matches
  const tips = useMemo(() => {
    const all = [...(roulette?.p1 || []), ...(roulette?.p3 || [])];
    const hit = all.find(c => c.q.toLowerCase() === (question || '').toLowerCase());
    return hit ? { cues: hit.cues, vocab: hit.vocab } : null;
  }, [question, roulette]);

  const timerColor = timer > 15 ? 'text-emerald-600' : timer > 5 ? 'text-amber-500' : 'text-red-600';

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ ...GRID_STYLE, backgroundColor: '#6f8f4b' }}>
        <div className="w-full max-w-sm rounded-2xl border-4 border-[#111] bg-white p-10 text-center shadow-[8px_8px_0_rgba(0,0,0,0.15)]">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="mb-2 text-3xl font-black">Hoàn thành!</h2>
          <p className="mb-8 font-medium text-[#444]">Tuyệt vời! Luyện tiếp chủ đề khác nhé.</p>
          <button onClick={onClose} className="w-full border-2 border-[#111] bg-[#ffc926] px-8 py-3 font-black text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-amber-300">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#6f8f4b] p-2 md:p-6" style={GRID_STYLE}>
      <div className="z-10 flex flex-none flex-wrap items-center justify-between gap-3 rounded-[20px] border-4 border-[#111] bg-white px-4 py-3.5 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:px-7 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onClose} className="shrink-0 rounded-full p-2 text-[#8a8672] hover:bg-[#e8e4d4]"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#111] bg-herb-600 text-white shadow-[2px_2px_0_rgba(0,0,0,0.15)]"><Mic className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black uppercase tracking-tight text-[#111] md:text-lg">IELTS Mock Interview</h2>
            <p className="flex items-center text-[10px] font-bold uppercase tracking-widest text-herb-600"><span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-herb-500" /> Giám khảo IELTS (Band 9.0) Online</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-[11px] font-bold text-[#8a8672]">Giọng giám khảo</span>
            <div className="relative">
              <button onClick={() => setVoiceOpen(o => !o)} className="flex min-w-[150px] items-center justify-between gap-2 rounded-xl border-2 border-[#111] bg-white px-3 py-1.5 text-xs text-[#222] hover:bg-[#f4f1e6]">
                <span className="truncate">{voice}</span><ChevronDown className={`h-4 w-4 text-[#8a8672] transition-transform ${voiceOpen ? 'rotate-180' : ''}`} />
              </button>
              {voiceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setVoiceOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-[180px] rounded-2xl border-2 border-[#111] bg-white py-2 shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                    {VOICES.map(v => <button key={v} onClick={() => { setVoice(v); setVoiceOpen(false); speak(question, v); }} className={`w-full px-4 py-2 text-left text-sm transition-colors ${voice === v ? 'bg-herb-600 font-bold text-white' : 'text-[#222] hover:bg-[#f4f1e6]'}`}>{v}</button>)}
                  </div>
                </>
              )}
            </div>
          </div>
          <button onClick={() => { setMuted(m => !m); stopSpeaking(); }} title={muted ? 'Bật âm thanh giám khảo' : 'Tắt âm thanh giám khảo'} className="rounded-full p-2 text-[#8a8672] transition-colors hover:bg-[#e8e4d4]">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>
          <span className={`hidden px-1 font-mono text-lg font-black tabular-nums sm:inline ${rec.recording ? 'text-[#2f6fe0]' : timerColor}`}>{fmtTime(rec.recording ? rec.seconds : timer)}</span>
          <button onClick={onClose} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 md:px-4">Kết thúc</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 md:py-6">
        <div className="mx-auto max-w-3xl space-y-6 lg:max-w-5xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-herb-200 bg-herb-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-herb-700">{partLabel}</span>
            {isP1 && <span className="rounded-full bg-[#e8f0c9] px-2 py-0.5 text-[11px] font-bold text-[#444]">Câu {idx + 1} / {target.topic.questions.length}</span>}
            {!isP1 && stage === 'p3' && <span className="rounded-full bg-[#e8f0c9] px-2 py-0.5 text-[11px] font-bold text-[#444]">Câu {p3Idx + 1} / {target.cue.part3.length}</span>}
            {!isP1 && stage === 'prep' && <span className="rounded-full bg-[#e8f0c9] px-2 py-0.5 text-[11px] font-bold text-[#444]">⏱ Chuẩn bị — {timer}s</span>}
            {!isP1 && stage === 'speak' && <span className="rounded-full bg-[#e8f0c9] px-2 py-0.5 text-[11px] font-bold text-[#444]">🎤 Đang nói — 2 phút</span>}
          </div>
          <div className="flex flex-col items-start">
            <div className="relative inline-block max-w-[92%] rounded-3xl rounded-tl-none border-2 border-[#111] bg-[#fffdf5] p-5 shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:max-w-[80%]">
              <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#111] text-white">“</div>
              {isP1 && <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#8a8672]">{target.topic.title}</p>}
              <p className="text-base font-semibold leading-relaxed text-[#111] md:text-[17px]">{question}</p>
              {voice !== 'No Voice' && <button onClick={() => speak(question, voice)} className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#8a8672] transition-colors hover:text-herb-600"><Volume2 className="h-3.5 w-3.5" /> Nghe lại</button>}
            </div>
            {!isP1 && (stage === 'prep' || stage === 'speak') && (
              <div className="mt-3 w-full max-w-[92%] rounded-xl border-2 border-[#111] bg-[#fdf6e3] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:max-w-[80%]">
                <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[#8a8672]">You should say:</p>
                <ul className="space-y-1.5">{target.cue.bullets.map((b, i) => <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#111]"><span className="mt-0.5 shrink-0 text-amber-500">•</span> {b}</li>)}</ul>
                {stage === 'prep' && <p className="mt-3 text-xs font-medium text-[#8a8672]">Đọc và chuẩn bị ý tưởng. Nhấn "Bắt đầu nói" khi sẵn sàng.</p>}
              </div>
            )}
            {(isP1 || stage === 'p3') && (
              <div className="mt-4 w-full max-w-[92%] overflow-hidden rounded-xl border-2 border-[#111] bg-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:max-w-[80%]">
                <button onClick={() => setHint(h => !h)} className="flex w-full items-center justify-between bg-[#fdf6e3] p-3 text-left transition-colors hover:bg-[#f3e8cc] md:p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-[#8a6100]">💡 Gợi ý tham khảo</div>
                  {hint ? <ChevronUp className="h-5 w-5 text-amber-700" /> : <ChevronDown className="h-5 w-5 text-amber-700" />}
                </button>
                {hint && <div className="border-t-2 border-[#111] p-4"><TipsPanel tips={tips} onSaveWord={onSaveWord} voice={voice} /></div>}
              </div>
            )}
            {!isP1 && stage !== 'p3' && <div className="mt-4 w-full max-w-[92%] md:max-w-[80%]"><p className="text-[11px] font-bold italic text-white/80">Gợi ý chỉ hỗ trợ cho Part 1 & 3</p></div>}
          </div>

          {result?.transcript && (
            <div className="flex flex-col items-end">
              <div className="inline-block max-w-[92%] rounded-3xl rounded-tr-none border-2 border-[#111] bg-[#e8f0c9] p-5 text-right text-black shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:max-w-[80%]">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[3px] text-[#5f6a45]">Bài nói của bạn</p>
                <p className="text-sm font-medium leading-relaxed md:text-[16px]">{result.transcript}</p>
              </div>
            </div>
          )}

          {(isP1 || stage !== 'prep') && (
            <div className="mt-6 border-t-2 border-dashed border-[#c9c6b6] pt-6">
              {rec.recording ? (
                <div className="flex flex-col items-center rounded-xl border-2 border-[#bcd3f7] bg-[#eaf2ff] px-3 py-4">
                  <button onClick={rec.stop} aria-label="Dừng ghi âm" className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#111] bg-[#2f6fe0] text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-[#2559b8]">
                    <span className="spk-ring" /><StopCircle className="relative h-8 w-8" />
                  </button>
                  <span className="mt-3 font-mono text-2xl font-black tabular-nums text-[#2f6fe0]">{fmtTime(rec.seconds)}</span>
                  {rec.interim && <p className="mt-2 max-w-xl text-center text-sm italic text-[#2559b8]">{rec.interim}</p>}
                  <span className="mt-1.5 text-center text-[11px] font-black uppercase tracking-widest text-[#2559b8]">Đang ghi âm · bấm hoặc nhấn Space để dừng</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <button onClick={rec.start} title="Bấm để nói" className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#111] bg-[#ffc926] text-[#111] shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-px hover:bg-[#ffd84d]"><Mic className="h-7 w-7" /></button>
                  <span className="mt-1 text-[11px] font-black uppercase tracking-widest text-white">{result ? 'Ghi âm lại' : 'Bấm để nói'}</span>
                  <span className="text-[10px] font-medium text-white/80">hoặc nhấn Space · ghi âm xong tự động tự đánh giá</span>
                </div>
              )}
              {rec.error && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" /><span>{rec.error}</span>
                  <button onClick={() => rec.setError('')} className="ml-auto font-black hover:text-red-800">✕</button>
                </div>
              )}
              {result && <div className="mt-6"><SelfCheck part={isP1 ? 1 : stage === 'p3' ? 3 : 2} transcript={result.transcript} duration={result.duration} audioUrl={result.url} onResay={rec.start} resayDisabled={rec.recording} /></div>}
            </div>
          )}
        </div>
      </div>

      <div className="flex-none rounded-[20px] border-4 border-[#111] bg-white px-4 py-3 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:px-7">
        <div className="mx-auto flex max-w-3xl justify-end gap-3 lg:max-w-5xl">
          {(isP1 || stage !== 'prep') && !result && (
            <button onClick={next} className="flex items-center gap-2 rounded-xl border-2 border-[#111] bg-white px-4 py-2.5 text-sm font-bold text-[#444] transition-colors hover:bg-[#f4f1e6]"><SkipForward className="h-4 w-4" /> Bỏ qua</button>
          )}
          <button onClick={next} className="rounded-xl border-2 border-[#111] bg-[#6f8f4b] px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#5f7f3b]">
            {isP1 ? (idx < target.topic.questions.length - 1 ? 'Câu tiếp →' : 'Hoàn thành ✓')
              : stage === 'prep' ? 'Bắt đầu nói 🎤'
                : stage === 'speak' ? (target.cue.part3.length ? 'Sang Part 3 →' : 'Hoàn thành ✓')
                  : p3Idx < target.cue.part3.length - 1 ? 'Câu tiếp →' : 'Hoàn thành ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}

function P1Card({ topic, expanded, onToggle, copied, onCopy, onPractice, attempts }) {
  return (
    <div className="overflow-hidden border-2 border-[#111] bg-white shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
      <div onClick={onToggle} className="flex cursor-pointer items-center justify-between border-b-2 border-[#111] bg-[#f8f9fa] p-4 transition-colors hover:bg-[#f1f3f5]">
        <h3 className="pr-4 text-lg font-black text-[#111]">{topic.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onPractice(); }} className="flex items-center gap-1.5 rounded-xl border-2 border-[#111] bg-[#ffc926] px-3 py-1.5 text-xs font-bold text-[#111] shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-px hover:bg-[#ffd84d]"><Play className="h-3 w-3 fill-black" /> Luyện tập</button>
          <button onClick={e => { e.stopPropagation(); onCopy(); }} title="Copy questions" className="border-2 border-[#111] bg-white p-2 shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#e8e4d4]">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button>
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>
      {expanded && (
        <div className="bg-white p-4">
          <ul className="space-y-4">
            {topic.questions.map((q, i) => (
              <li key={i} className="font-medium text-[#111]">
                <div className="flex gap-3"><span className="shrink-0 font-bold text-amber-500">Q.</span><span>{q}</span></div>
                <div className="pl-7"><Attempts list={attempts[slug(q)]} /></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CueCard({ item, expanded, onToggle, copied, onCopy, onPractice, attempts }) {
  return (
    <div className="flex flex-col border-2 border-[#111] bg-white shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
      <div className="flex-grow bg-[#fdf6e3] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-base font-black leading-snug text-[#111]">{item.cueCard}</h3>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onPractice} className="flex items-center gap-1.5 rounded-xl border-2 border-[#111] bg-[#ffc926] px-3 py-1.5 text-xs font-bold text-[#111] shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-px hover:bg-[#ffd84d]"><Play className="h-3 w-3 fill-black" /> Luyện tập</button>
            <button onClick={onCopy} title="Copy all" className="border-2 border-[#111] bg-white p-2 shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#e8e4d4]">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button>
          </div>
        </div>
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#8a8672]">You should say:</p>
        <ul className="space-y-1.5">{item.bullets.map((b, i) => <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#111]"><span className="mt-0.5 shrink-0 text-amber-500">•</span> {b}</li>)}</ul>
        <Attempts list={attempts[slug(item.cueCard.replace(/^\d+\.\s*/, ''))]} />
      </div>
      {item.part3.length > 0 && (
        <div>
          <div onClick={onToggle} className="flex cursor-pointer items-center justify-between border-t-2 border-[#111] p-3 transition-colors hover:bg-[#f4f1e6]">
            <h4 className="text-sm font-black text-[#111]">Part 3 Questions ({item.part3.length})</h4>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {expanded && (
            <div className="border-t-2 border-[#111] bg-[#f4f1e6] p-4">
              <ul className="space-y-4">
                {item.part3.map((q, i) => (
                  <li key={i} className="text-sm font-medium text-[#111]">
                    <div className="flex gap-3"><span className="shrink-0 font-bold text-[#8a8672]">Q.</span><span>{q}</span></div>
                    <div className="pl-7"><Attempts list={attempts[slug(q)]} /></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Forecast({ onBack, onSaveWord }) {
  const [setId, setSetId] = useState(SETS[0].id);
  const set = SETS.find(s => s.id === setId);
  const [data, status] = useLocalData(() => loadData(set.file), [set.file]);
  const [roulette] = useLocalData(() => loadData('roulette'));
  const [tab, setTab] = useState('p1-compulsory');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(null);
  const [open, setOpen] = useState({});
  const [target, setTarget] = useState(null);
  const [exam, setExam] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);
  const attempts = useMemo(() => {
    const map = {};
    readHistory().filter(h => h.mode === 'forecast_practice').forEach(h => { const k = h.key || slug(h.question); (map[k] ||= []).push(h); });
    return map;
  }, [historyTick]);
  const topRef = useRef(null);

  const copy = (key, textValue) => { navigator.clipboard?.writeText(textValue); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const toggle = k => setOpen(o => ({ ...o, [k]: !o[k] }));

  if (status === 'loading') {
    return (
      <div className={`flex min-h-full items-center justify-center ${GRID}`}>
        <div className="animate-pulse rounded-[20px] border-4 border-[#111] bg-white px-6 py-3 font-quicksand text-xl font-extrabold text-[#111] shadow-[8px_8px_0_rgba(0,0,0,0.15)]">Đang tải dữ liệu...</div>
      </div>
    );
  }
  if (!data) return <div className={`min-h-full p-8 ${GRID}`}><div className="mx-auto max-w-4xl border-2 border-[#111] bg-red-50 p-8 font-bold text-red-600">Không thể tải dữ liệu. Vui lòng thử lại.</div></div>;

  const q = query.toLowerCase();
  const comp = data.part1.compulsory.filter(t => !q || t.title.toLowerCase().includes(q) || t.questions.some(x => x.toLowerCase().includes(q)));
  const spec = data.part1.specific.filter(t => !q || t.title.toLowerCase().includes(q) || t.questions.some(x => x.toLowerCase().includes(q)));
  const p23 = data.part2_3.filter(c => !q || c.cueCard.toLowerCase().includes(q) || c.bullets.some(x => x.toLowerCase().includes(q)) || c.part3.some(x => x.toLowerCase().includes(q)));
  const empty = <div className="rounded-2xl border-2 border-[#111] bg-white p-8 text-center font-bold text-[#8a8672] shadow-[4px_4px_0_rgba(0,0,0,0.15)]">Không tìm thấy kết quả nào</div>;

  return (
    <div ref={topRef} className={`min-h-full pb-20 text-[#111] ${GRID}`} style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
      <div className="px-3 pt-3 md:px-8 md:pt-6">
        <div className="mx-auto max-w-5xl rounded-[20px] border-4 border-[#111] bg-white p-4 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:p-8">
          <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 font-bold text-[#444] transition-colors hover:text-black"><ArrowLeft className="h-5 w-5" /> Về trang Speaking</button>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border-2 border-[#111] bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_rgba(0,0,0,0.15)]"><BookOpen className="h-4 w-4" />{data.meta.badge}</div>
              <h1 className="mb-2 font-quicksand text-3xl font-black uppercase leading-tight md:text-5xl">{data.meta.title}</h1>
              <div className="font-quicksand text-xl font-bold text-[#444] md:text-2xl">{data.meta.subtitle}</div>
              <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist">
                <span className="mr-1 text-xs font-black uppercase tracking-wider text-[#8a8672]">Bộ đề</span>
                {SETS.map((s, i) => (
                  <button key={s.id} role="tab" onClick={() => { setSetId(s.id); setOpen({}); }} className={`tid-press rounded-lg border-2 border-[#111] px-3 py-1.5 text-xs font-black transition-all ${s.id === setId ? 'bg-[#ffc926] text-[#111] shadow-[3px_3px_0_rgba(0,0,0,0.15)]' : 'bg-white text-[#444] shadow-[2px_2px_0_rgba(0,0,0,0.15)] hover:bg-[#f4f1e6]'}`}>
                    {s.label}{i === 0 ? ' · mới nhất' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 md:w-80">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-[#8a8672]" /></div>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm chủ đề..." className="block w-full border-2 border-[#111] bg-white py-3 pl-10 pr-3 font-medium shadow-[4px_4px_0_rgba(0,0,0,0.15)] focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-5xl p-4 md:p-8">
        <div className="tid-noscroll mb-8 flex items-center gap-4 overflow-x-auto pb-4 pt-2">
          {[['p1-compulsory', 'Part 1 Bắt buộc', comp.length], ['p1-specific', 'Part 1 Chủ đề', spec.length], ['p23', 'Part 2 + 3', p23.length]].map(([k, label, n]) => (
            <button key={k} onClick={() => setTab(k)} className={`tid-press shrink-0 whitespace-nowrap rounded-xl border-[3px] border-[#111] px-6 py-3 font-black uppercase transition-all ${tab === k ? '-translate-y-0.5 bg-[#ffc926] text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)]' : 'bg-white text-[#444] shadow-[2px_2px_0_rgba(0,0,0,0.15)] hover:bg-[#f4f1e6]'}`}>{label} ({n})</button>
          ))}
          <div className="min-w-4 flex-grow" />
          <button onClick={() => setExam(true)} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border-[3px] border-[#111] bg-[#c23b3b] px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0_#f96015] transition-all hover:-translate-y-0.5">🔥 Thi thật cực căng</button>
        </div>
        {tab === 'p1-compulsory' && <div className="space-y-4">{comp.length ? comp.map((t, i) => <P1Card key={`c${i}`} topic={t} expanded={!!open[t.title]} onToggle={() => toggle(t.title)} copied={copied === t.title} onCopy={() => copy(t.title, `${t.title}\n${t.questions.map(x => `• ${x}`).join('\n')}`)} onPractice={() => setTarget({ type: 'p1', topic: t })} attempts={attempts} />) : empty}</div>}
        {tab === 'p1-specific' && <div className="space-y-4">{spec.length ? spec.map((t, i) => <P1Card key={`s${i}`} topic={t} expanded={!!open[t.title]} onToggle={() => toggle(t.title)} copied={copied === t.title} onCopy={() => copy(t.title, `${t.title}\n${t.questions.map(x => `• ${x}`).join('\n')}`)} onPractice={() => setTarget({ type: 'p1', topic: t })} attempts={attempts} />) : empty}</div>}
        {tab === 'p23' && (p23.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {p23.map((c, i) => (
              <CueCard key={`p${i}`} item={c} expanded={!!open[c.cueCard]} onToggle={() => toggle(c.cueCard)} copied={copied === c.cueCard}
                onCopy={() => copy(c.cueCard, `Part 2: ${c.cueCard}\n\nYou should say:\n${c.bullets.map(x => `• ${x}`).join('\n')}${c.part3.length ? `\n\nPart 3 Questions:\n${c.part3.map(x => `• ${x}`).join('\n')}` : ''}`)}
                onPractice={() => setTarget({ type: 'p23', cue: c })} attempts={attempts} />
            ))}
          </div>
        ) : empty)}
      </div>
      {target && <PracticeModal target={target} roulette={roulette} onSaveWord={onSaveWord} onClose={() => { setTarget(null); setHistoryTick(t => t + 1); }} />}
      {exam && <Suspense fallback={null}><ForecastExam data={data} onClose={() => { setExam(false); setHistoryTick(t => t + 1); }} /></Suspense>}
    </div>
  );
}
