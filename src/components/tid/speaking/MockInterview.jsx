import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Play, ChevronDown, Volume2, VolumeX, ListChecks, Quote, Mic, StopCircle, RotateCcw, Clock, PartyPopper, Sparkles, AlertCircle } from 'lucide-react';
import SelfCheck, { TipsPanel, HintToggle } from './SelfCheck';
import { useLocalData, loadData, useRecorder, useSpaceToRecord, speak, stopSpeaking, VOICES, addHistory, fmtTime, slug } from './speakingUtils';

// /practice/speaking/[topicId] — "IELTS MOCK INTERVIEW". The site's examiner is an AI on the server;
// here questions come from the local topic bank and each answer gets an offline self-check.
const GRID_BG = {
  fontFamily: 'var(--font-nunito), sans-serif',
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

function cueToText(cue) {
  return `${cue.title}\n\nYou should say:\n${cue.bullets.map(b => `- ${b}`).join('\n')}${cue.closing ? `\n\n${cue.closing}` : ''}`;
}

function ExaminerText({ cue, text }) {
  if (cue) {
    return (
      <>
        <p className="mb-2 text-sm font-medium leading-relaxed md:text-[17px]">{cue.title}</p>
        <p className="mb-2 text-sm font-medium leading-relaxed md:text-[17px]">You should say:</p>
        <ul className="my-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed md:text-[17px]" style={{ listStyle: 'disc' }}>
          {cue.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        {cue.closing && <p className="text-sm font-medium leading-relaxed md:text-[17px]">{cue.closing}</p>}
      </>
    );
  }
  return <p className="text-sm font-medium leading-relaxed md:text-[17px]">{text}</p>;
}

export default function MockInterview({ topicId, onBack, onSaveWord }) {
  const [data, status] = useLocalData(() => loadData('topics'));
  const topic = data?.topics?.[topicId];
  const part = topic?.part || (topicId?.startsWith('p2-') || topicId?.startsWith('custom-2-') ? 2 : topicId?.startsWith('p3-') || topicId?.startsWith('custom-3-') ? 3 : 1);
  const total = part === 2 ? 1 : Math.min(10, topic?.questions?.length || 0);

  const [msgs, setMsgs] = useState([]);
  const [asked, setAsked] = useState(0);
  const [finished, setFinished] = useState(false);
  const [voice, setVoice] = useState(VOICES[0]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [text, setText] = useState('');
  const [hintOpen, setHintOpen] = useState({});
  const [prep, setPrep] = useState(null); // Part 2: seconds left in the 1-minute preparation
  const [prepUsed, setPrepUsed] = useState(false);
  const scrollRef = useRef(null);
  const lastSpoken = useRef(0);

  // Opening question
  useEffect(() => {
    if (!topic || msgs.length) return;
    if (part === 2) setMsgs([{ role: 'examiner', content: cueToText(topic.cue), cue: topic.cue }]);
    else setMsgs([{ role: 'examiner', content: topic.questions[0], q: topic.questions[0] }]);
    setAsked(1);
  }, [topic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read new examiner turns aloud
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (!last || msgs.length === lastSpoken.current) return;
    lastSpoken.current = msgs.length;
    if (last.role === 'examiner' && !muted) speak(last.content.replace('You should say:', ''), voice);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), []);

  // 1-minute preparation countdown (Part 2)
  useEffect(() => {
    if (!prep) return undefined;
    const t = setTimeout(() => setPrep(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [prep]);

  const lastExaminer = [...msgs].reverse().find(m => m.role === 'examiner');

  const submit = ({ transcript, duration, url }) => {
    const answer = transcript || '';
    const q = lastExaminer?.q || lastExaminer?.cue?.title || lastExaminer?.content;
    addHistory({ mode: 'ai_practice', topic: topic?.name, question: q, transcript: answer, duration, wpm: duration ? Math.round(answer.split(/\s+/).filter(Boolean).length / duration * 60) : 0 });
    const user = { role: 'user', content: answer || (url ? '🎤 Voice' : ''), audioUrl: url, duration, questionKey: slug(q), part };
    let next = null;
    let done = false;
    if (lastExaminer?.retry) {
      next = lastExaminer.retry.resumeTo;
      done = !!next?.isClosing;
    } else if (part === 2) {
      done = true;
      next = { role: 'examiner', content: "That's the end of Part 2 — well done! 🎉", isClosing: true };
    } else if (asked >= total) {
      done = true;
      next = { role: 'examiner', content: `That's the end of this topic — you've answered all ${total} questions. Well done! 🎉`, isClosing: true };
    } else {
      const nq = topic.questions[asked];
      next = { role: 'examiner', content: nq, q: nq };
      setAsked(a => a + 1);
    }
    setMsgs(m => [...m, user, ...(next ? [next] : [])]);
    if (done) setFinished(true);
    setText('');
  };

  const rec = useRecorder({ maxSeconds: part === 2 ? 120 : 0, onDone: r => submit(r) });
  useSpaceToRecord({ canStart: !finished && !(prep > 0) && !!topic, recording: rec.recording, start: rec.start, stop: rec.stop, cancel: rec.cancel });

  // Ask a previous question again, then resume where we were (site's "Trả lời lại câu này")
  const resay = idx => {
    const q = msgs.slice(0, idx).reverse().find(m => m.role === 'examiner');
    if (!q || rec.recording) return;
    const last = msgs[msgs.length - 1];
    const resumeTo = last?.role === 'examiner' ? { ...last, retry: undefined } : null;
    setMsgs(m => [...m, { role: 'examiner', content: q.content, q: q.q, cue: q.cue, retry: { resumeTo } }]);
    setFinished(false);
  };

  const tipsFor = m => {
    if (m.cue) return { cues: m.cue.bullets, vocab: topic?.vocab || [] };
    const t = topic?.tips?.find(x => x.q === m.q) || null;
    if (t) return t;
    const first = topic?.tips?.[0];
    return first ? { cues: [], vocab: first.vocab } : null;
  };

  const answered = msgs.filter(m => m.role === 'user');
  const lastExaminerIdx = msgs.map(m => m.role).lastIndexOf('examiner');

  if (status === 'loading') return <div className="flex h-full items-center justify-center bg-[#6f8f4b] font-black text-white" style={GRID_BG}>Đang tải…</div>;
  if (!topic) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#6f8f4b]" style={GRID_BG}>
        <div className="rounded-2xl border-2 border-[#111] bg-[#fce3df] p-4 font-bold text-[#d52518]">Topic không tồn tại hoặc đã bị xoá.</div>
        <button onClick={onBack} className="rounded-xl border-2 border-[#111] bg-white px-4 py-2 font-bold">← Quay lại</button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden bg-[#6f8f4b] p-2 md:p-4" style={GRID_BG}>
      {/* Top bar */}
      <div className="z-10 flex flex-none flex-wrap items-center justify-between gap-2 rounded-2xl border-[3px] border-[#111] bg-white px-3 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onBack} aria-label="Thoát" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#111] bg-[#f4f1e6] text-[#111] transition-transform hover:-translate-y-0.5"><ArrowLeft size={18} /></button>
          <h2 className="flex min-w-0 items-center gap-2 font-quicksand text-sm font-extrabold uppercase tracking-tight text-[#111] md:text-base">
            <span aria-hidden className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#2f8f3f]" />
            <span className="truncate">IELTS Mock Interview</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 md:flex" title="Giọng giám khảo">
            <button onClick={() => speak("Hello, I'm your IELTS examiner. Are you ready to begin?", voice)} title="Nghe thử giọng giám khảo" className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-[#ffc926] text-[#111] transition-colors hover:-translate-y-0.5"><Play size={14} className="ml-0.5 fill-current" /></button>
            <div className="relative">
              <button onClick={() => setVoiceOpen(o => !o)} className="flex h-9 min-w-[180px] items-center justify-between gap-2 rounded-xl border-2 border-[#111] bg-white px-3 text-sm font-bold text-[#111] focus:shadow-[3px_3px_0_#ffc926] focus:outline-none">
                <span className="truncate">{voice}</span><ChevronDown size={16} className={`transition-transform ${voiceOpen ? 'rotate-180' : ''}`} />
              </button>
              {voiceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setVoiceOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[220px] rounded-2xl border-[3px] border-[#111] bg-white py-2 shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
                    <div className="mb-1 px-4 py-2 text-[11px] font-bold uppercase tracking-[3px] text-[#8a8672]">Select a voice</div>
                    {VOICES.map(v => (
                      <button key={v} onClick={() => { setVoice(v); setVoiceOpen(false); speak("Hello, I'm your IELTS examiner. Are you ready to begin?", v); }} className={`flex w-full items-center px-4 py-2.5 text-left text-[15px] font-bold transition-colors ${voice === v ? 'bg-[#2f5fa8] text-white' : 'text-[#111] hover:bg-[#ffd6e0]'}`}>{v}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <button onClick={() => { setMuted(m => !m); stopSpeaking(); }} title={muted ? 'Bật âm thanh giám khảo' : 'Tắt âm thanh giám khảo'} className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-white text-[#111] transition-transform hover:-translate-y-0.5">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {part !== 2 && asked > 0 && (
            <div className="flex h-9 items-center gap-1.5 rounded-xl border-2 border-[#111] bg-[#e8f0c9] px-2.5 text-[#111]">
              <ListChecks size={12} />
              <span className="font-quicksand text-[11px] font-extrabold uppercase tabular-nums tracking-wide">Câu {Math.min(asked, total)}/{total}</span>
            </div>
          )}
          <button onClick={onBack} className="tid-press h-9 rounded-xl border-2 border-[#111] bg-[#fce3df] px-3 font-quicksand text-sm font-extrabold text-[#c23b3b]">Kết thúc</button>
        </div>
      </div>

      {rec.error && (
        <div className="relative z-20 mx-4 mt-6 flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-[#111] bg-[#fce3df] p-4 text-sm font-bold text-[#d52518] md:mx-10">
          <div className="absolute bottom-0 left-0 top-0 w-[5px] bg-[#c23b3b]" />
          <AlertCircle size={20} className="ml-2 shrink-0 text-[#c23b3b]" /><span>{rec.error}</span>
          <button onClick={() => rec.setError('')} className="ml-auto rounded-xl p-2 text-[#c23b3b] hover:bg-[#f3d0cb]">✕</button>
        </div>
      )}

      {/* Conversation */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-8 overflow-y-auto scroll-smooth px-2 py-4 md:px-8 md:py-6">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] md:max-w-[75%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`relative inline-block p-5 text-left ${m.role === 'user'
                ? 'rounded-2xl rounded-tr-none border-2 border-[#111] bg-[#e8f0c9] text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)]'
                : m.cue ? 'rounded-2xl border-2 border-[#111] bg-[#ffc926] text-[#111] shadow-[4px_4px_0_rgba(0,0,0,1)]'
                  : 'rounded-2xl rounded-tl-none border-2 border-[#111] bg-[#fffdf5] text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)]'}`}>
                {m.role === 'examiner' && (
                  <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111] bg-[#111] text-[#ffc926]"><Quote size={12} className="fill-current" /></div>
                )}
                {m.retry && <div className="mb-2 flex w-fit items-center gap-1.5 rounded-full border-2 border-[#111] bg-[#ffe787] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[2px]"><RotateCcw size={11} /> Trả lời lại</div>}
                {m.role === 'user' && m.content === '🎤 Voice'
                  ? <p className="flex items-center gap-2 text-sm font-medium leading-relaxed opacity-80 md:text-[17px]"><Mic size={16} /> Voice recording</p>
                  : m.role === 'examiner' ? <ExaminerText cue={m.cue} text={m.content} /> : <p className="text-sm font-medium leading-relaxed md:text-[17px]">{m.content}</p>}
                {m.role === 'examiner' && (
                  <div className="mt-3 flex items-center gap-3">
                    {voice !== 'No Voice' && <button onClick={() => speak(m.content.replace('You should say:', ''), voice)} title="Nghe lại câu này" className="flex items-center gap-1.5 text-[11px] font-bold text-[#5f6a45] hover:text-[#111] hover:underline"><Volume2 size={13} />Nghe lại</button>}
                    {!m.isClosing && i === lastExaminerIdx && <HintToggle open={!!hintOpen[i]} onClick={() => setHintOpen(h => ({ ...h, [i]: !h[i] }))} />}
                  </div>
                )}
                {m.role === 'examiner' && hintOpen[i] && (
                  <div className="mt-4 border-t-[3px] border-[#111] pt-3"><TipsPanel tips={tipsFor(m)} onSaveWord={onSaveWord} voice={voice} /></div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="mt-4 text-left">
                  <SelfCheck part={m.part} transcript={m.content === '🎤 Voice' ? '' : m.content} duration={m.duration || 0} audioUrl={m.audioUrl} onResay={() => resay(i)} resayDisabled={rec.recording} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="z-10 mt-2 flex-none rounded-2xl border-[3px] border-[#111] bg-white px-3 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.15)] md:px-5 md:py-2.5">
        <div className="mx-auto max-w-4xl">
          {finished ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-5 sm:text-left">
              <div aria-hidden className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#111] bg-[#e3f5e8] sm:flex"><PartyPopper size={20} className="text-[#18542a]" /></div>
              <div className="min-w-0 max-w-xl">
                <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
                  <span className="font-quicksand text-[13px] font-extrabold uppercase tracking-tight text-[#111] md:text-sm">{part === 2 ? 'Hoàn thành bài Part 2! 🎉' : `Hoàn thành ${total}/${total} câu của topic này! 🎉`}</span>
                  <span className="inline-block rounded-full border-2 border-[#111] bg-[#e8f0c9] px-2.5 py-0.5 text-[12px] font-bold text-[#111]">Bạn đã hoàn thành {answered.length} câu</span>
                </p>
                <p className="mt-1 text-[13px] font-medium leading-snug text-[#555]">Xem lại phần tự đánh giá phía trên, nghe lại bản thu và luyện lại những câu chưa tốt.</p>
              </div>
              <button onClick={onBack} className="tid-press flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border-[3px] border-[#111] bg-[#111] px-4 py-2 font-quicksand text-xs font-extrabold uppercase tracking-[2px] text-[#ffc926] shadow-[4px_4px_0_#f96015] md:px-5"><ArrowLeft size={14} /> Chọn topic khác</button>
            </div>
          ) : (
            <>
              {part === 2 && !rec.recording && !answered.length && (
                <div className="mb-2 flex items-center justify-center">
                  {prepUsed ? (prep > 0 ? (
                    <div className="flex items-center gap-4 rounded-xl border-2 border-[#111] bg-white px-5 py-2.5 shadow-[3px_3px_0_rgba(0,0,0,1)]">
                      <span className="font-quicksand text-2xl font-extrabold tabular-nums tracking-wider text-[#111]">{fmtTime(prep)}</span>
                      <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#8a8672]">Chuẩn bị ý tưởng…</span>
                      <button onClick={() => setPrep(0)} className="whitespace-nowrap text-xs font-bold text-[#5f6a45] underline underline-offset-2 hover:text-[#111]">Bỏ qua — nói luôn</button>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-[#111] bg-[#ffc926] px-5 py-2.5 font-quicksand text-sm font-extrabold uppercase tracking-wide text-[#111] shadow-[3px_3px_0_rgba(0,0,0,1)]">Hết giờ chuẩn bị — bấm mic và bắt đầu nói! 🎤</div>
                  )) : (
                    <button onClick={() => { setPrepUsed(true); setPrep(60); }} className="tid-press flex items-center gap-2 rounded-xl border-2 border-[#111] bg-white px-5 py-2.5 font-quicksand text-sm font-extrabold uppercase tracking-wide shadow-[3px_3px_0_rgba(0,0,0,1)]"><Clock size={16} /> 1 phút chuẩn bị</button>
                  )}
                </div>
              )}
              <div className="relative flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => (rec.recording ? rec.stop() : rec.start())}
                  disabled={prep > 0}
                  aria-label={rec.recording ? 'Dừng ghi âm' : 'Bấm để nói'}
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#111] shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${rec.recording ? 'bg-[#2f6fe0] text-white' : 'bg-[#6f8f4b] text-white hover:-translate-y-0.5'}`}
                >
                  {rec.recording ? <StopCircle size={22} /> : <Mic size={22} />}
                  {rec.recording && <span className="spk-ring" />}
                </button>
                <div className="flex shrink-0 flex-col gap-1">
                  <span className={`whitespace-nowrap text-[11px] font-black uppercase tracking-[2px] ${rec.recording ? 'text-[#2559b8]' : 'text-[#111]'}`}>
                    {prep > 0 ? `⏱ Chuẩn bị: 00:${String(prep).padStart(2, '0')}` : rec.recording ? (part === 2 ? `⏱ ${fmtTime(rec.seconds)} · Space để dừng` : `Đang ghi · ${fmtTime(rec.seconds)}`) : 'Bấm để nói'}
                  </span>
                  {rec.recording ? (
                    <button type="button" onClick={rec.cancel} title="Nói vấp? Huỷ bản đang ghi rồi nói lại — phím Esc" className="tid-press flex items-center gap-1.5 self-start rounded-lg border-2 border-[#111] bg-white px-2 py-0.5 font-quicksand text-[10px] font-extrabold uppercase tracking-wide text-[#111] shadow-[2px_2px_0_rgba(0,0,0,1)]"><RotateCcw size={11} /> Nói lại từ đầu</button>
                  ) : (
                    <span className="hidden items-center gap-1 whitespace-nowrap text-[10px] font-bold tracking-wide text-[#5f6a45] sm:flex">hoặc nhấn <kbd className="rounded-md border-2 border-[#111] bg-[#f4f1e6] px-1.5 py-0.5 font-mono text-[10px] text-[#111]">Space</kbd></span>
                  )}
                </div>
                <div className="group relative flex-1">
                  <textarea
                    value={rec.recording ? rec.interim : text}
                    onChange={e => setText(e.target.value)}
                    readOnly={rec.recording}
                    placeholder={rec.recording ? 'Đang ghi âm... Hãy nói câu trả lời của bạn.' : 'Nhập câu trả lời hoặc bấm Mic để nói...'}
                    rows={1}
                    className="relative z-0 w-full resize-none rounded-xl border-2 border-[#111] bg-[#fffdf5] px-4 py-2.5 pr-36 text-[15px] font-medium text-[#111] outline-none transition-all focus:shadow-[3px_3px_0_#ffc926]"
                  />
                  {!rec.recording && text.trim() && (
                    <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
                      <button onClick={() => submit({ transcript: text.trim(), duration: Math.max(10, Math.round(text.trim().split(/\s+/).length / 2.2)), url: null })} className="tid-press flex items-center gap-2 rounded-lg border-2 border-[#111] bg-[#111] px-4 py-1.5 font-quicksand text-xs font-extrabold uppercase tracking-wide text-[#ffc926] shadow-[3px_3px_0_#f96015]">
                        <Sparkles size={16} /> Gửi trả lời
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
