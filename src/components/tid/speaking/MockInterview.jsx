import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Clock,
  ListChecks,
  Mic,
  Mic2,
  PartyPopper,
  Play,
  RotateCcw,
  Sparkles,
  Stethoscope,
  StopCircle,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react';
import SelfCheck, { TipsPanel, HintToggle } from './SelfCheck';
import { useLocalData, loadData, useRecorder, useSpaceToRecord, speak, stopSpeaking, VOICES, addHistory, fmtTime, slug } from './speakingUtils';

function cueToText(cue) {
  return `${cue.title}\n\nYou should say:\n${cue.bullets.map(b => `- ${b}`).join('\n')}${cue.closing ? `\n\n${cue.closing}` : ''}`;
}

function ExaminerText({ cue, text }) {
  if (cue) {
    return (
      <div className="space-y-3">
        <p className="text-xl md:text-2xl font-black text-[#1E1B4B] leading-snug">{cue.title}</p>
        <div className="rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] p-4 shadow-[0_2px_0_#1E1B4B]">
          <p className="text-xs font-black uppercase tracking-wider text-[#F2683A] mb-2">You should say:</p>
          <ul className="space-y-2 pl-2">
            {cue.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-base md:text-lg font-bold text-[#1E1B4B]">
                <span className="text-[#F2683A] font-black">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        {cue.closing && <p className="text-sm md:text-base font-bold italic text-[#6B6790]">{cue.closing}</p>}
      </div>
    );
  }
  return <p className="text-xl md:text-2xl font-black text-[#1E1B4B] leading-relaxed">{text}</p>;
}

export default function MockInterview({ topicId, onBack, onSaveWord, onLookupDictionary, onTryInDoctor }) {
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
    addHistory({
      mode: 'ai_practice',
      topic: topic?.name,
      question: q,
      transcript: answer,
      duration,
      wpm: duration ? Math.round((answer.split(/\s+/).filter(Boolean).length / duration) * 60) : 0,
    });
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

  // Ask a previous question again, then resume where we were
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

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--we-cream,#FFFDF8)] font-black text-[#1E1B4B]">
        Đang tải câu hỏi thi thử…
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--we-cream,#FFFDF8)] p-6 text-center text-[#1E1B4B]">
        <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] p-6 shadow-[0_4px_0_#1E1B4B]">
          <p className="text-xl font-black">Topic không tồn tại hoặc đã bị xoá.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] px-6 py-3 font-black text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-[600px] flex-col overflow-hidden p-3 md:p-5"
      style={{
        backgroundColor: 'var(--we-cream, #FFFDF8)',
        backgroundImage: 'radial-gradient(rgba(30, 27, 75, 0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        fontFamily: 'var(--font-nunito), sans-serif',
      }}
    >
      {/* Top Header Bar */}
      <div className="z-10 flex flex-none flex-wrap items-center justify-between gap-3 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white px-4 py-3 shadow-[0_4px_0_#1E1B4B]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Thoát"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#F8BE33]"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="we-sticker !py-0.5 !text-[10px] !bg-[#4F46E5] text-white">
              <Mic2 size={12} strokeWidth={2.5} /> IELTS SPEAKING STUDIO
            </span>
            <span className="hidden truncate text-xs font-black text-[#1E1B4B] md:inline">
              · {topic.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Preview & Dropdown */}
          <div className="hidden items-center gap-1.5 md:flex" title="Giọng giám khảo">
            <button
              type="button"
              onClick={() => speak("Hello, I'm your IELTS examiner. Are you ready to begin?", voice)}
              title="Nghe thử giọng giám khảo"
              className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-[#F8BE33] text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5"
            >
              <Play size={14} strokeWidth={2.5} className="ml-0.5 fill-current" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setVoiceOpen(o => !o)}
                className="flex h-9 min-w-[170px] items-center justify-between gap-2 rounded-xl border-[2px] border-[#1E1B4B] bg-white px-3 text-xs font-black text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]"
              >
                <span className="truncate">{voice}</span>
                <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform ${voiceOpen ? 'rotate-180' : ''}`} />
              </button>
              {voiceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setVoiceOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[210px] rounded-2xl border-[2.5px] border-[#1E1B4B] bg-white py-2 shadow-[0_6px_0_#1E1B4B]">
                    <div className="mb-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#6B6790]">
                      Chọn giọng giám khảo
                    </div>
                    {VOICES.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setVoice(v);
                          setVoiceOpen(false);
                          speak("Hello, I'm your IELTS examiner. Are you ready to begin?", v);
                        }}
                        className={`flex w-full items-center px-3.5 py-2 text-left text-xs font-black transition-colors ${
                          voice === v ? 'bg-[#4F46E5] text-white' : 'text-[#1E1B4B] hover:bg-[#FFF8E7]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={() => { setMuted(m => !m); stopSpeaking(); }}
            title={muted ? 'Bật âm thanh giám khảo' : 'Tắt âm thanh giám khảo'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-[#1E1B4B] bg-white text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:bg-[#FFF8E7]"
          >
            {muted ? <VolumeX size={16} strokeWidth={2.5} /> : <Volume2 size={16} strokeWidth={2.5} />}
          </button>

          {/* Question Counter Pill */}
          {part !== 2 && asked > 0 && (
            <div className="flex h-9 items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FFF8E7] px-3 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B]">
              <ListChecks size={14} strokeWidth={2.5} />
              <span>Câu {Math.min(asked, total)}/{total}</span>
            </div>
          )}

          {/* Finish Button */}
          <button
            type="button"
            onClick={onBack}
            className="h-9 rounded-xl border-[2px] border-[#1E1B4B] bg-[#FEE2E2] px-3.5 text-xs font-black uppercase text-[#991B1B] shadow-[0_2px_0_#1E1B4B] transition-transform hover:-translate-y-0.5 hover:bg-[#EF4444] hover:text-white"
          >
            Kết thúc
          </button>
        </div>
      </div>

      {/* Recording Error Alert */}
      {rec.error && (
        <div className="z-20 mt-3 flex items-center gap-3 rounded-2xl border-[2px] border-[#EF4444] bg-[#FEE2E2] p-3.5 text-sm font-black text-[#991B1B] shadow-[0_2px_0_#EF4444]">
          <AlertCircle size={18} className="shrink-0 text-[#EF4444]" />
          <span>{rec.error}</span>
          <button type="button" onClick={() => rec.setError('')} className="ml-auto font-black hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Conversation Stage */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto scroll-smooth py-4 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`w-full max-w-3xl ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              {/* Examiner Message Card */}
              {m.role === 'examiner' && (
                <div className="w-full rounded-3xl border-[2.5px] border-[#1E1B4B] bg-white p-5 shadow-[0_5px_0_#1E1B4B] md:p-6 text-left">
                  {/* Examiner Header */}
                  <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b-[2px] border-[#1E1B4B]/15 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[2px] border-[#1E1B4B] bg-[#F8BE33] shadow-[0_2px_0_#1E1B4B]">
                        <Mic2 size={20} strokeWidth={2.5} className="text-[#1E1B4B]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
                            IELTS EXAMINER
                          </span>
                          <span className="rounded-full border border-[#1E1B4B] bg-[#FFF8E7] px-2 py-0.2 text-[9px] font-black uppercase text-[#1E1B4B]">
                            PART {part}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#6B6790]">Giám khảo mô phỏng bản xứ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {voice !== 'No Voice' && (
                        <button
                          type="button"
                          onClick={() => speak(m.content.replace('You should say:', ''), voice)}
                          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1E1B4B] bg-[#FFF8E7] px-2.5 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B] hover:bg-[#F8BE33]"
                          title="Nghe lại câu hỏi"
                        >
                          <Volume2 size={13} strokeWidth={2.5} /> Nghe lại
                        </button>
                      )}
                      {!m.isClosing && i === lastExaminerIdx && (
                        <button
                          type="button"
                          onClick={() => setHintOpen(h => ({ ...h, [i]: !h[i] }))}
                          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1E1B4B] bg-[#E0E7FF] px-2.5 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B] hover:bg-[#F8BE33]"
                        >
                          <Sparkles size={13} strokeWidth={2.5} className="text-[#4F46E5]" />
                          {hintOpen[i] ? 'Ẩn gợi ý' : 'Gợi ý ý tưởng & từ vựng'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <ExaminerText cue={m.cue} text={m.content} />

                  {/* Hints / Tips Panel */}
                  {hintOpen[i] && (
                    <div className="mt-4 border-t-[2px] border-dashed border-[#1E1B4B]/20 pt-4">
                      <TipsPanel tips={tipsFor(m)} onSaveWord={onSaveWord} voice={voice} />
                    </div>
                  )}
                </div>
              )}

              {/* User Candidate Message Card */}
              {m.role === 'user' && (
                <div className="flex flex-col items-end">
                  <div className="w-full rounded-3xl border-[2.5px] border-[#1E1B4B] bg-[#E0E7FF] p-5 shadow-[0_4px_0_#1E1B4B] md:p-6 text-left">
                    <div className="mb-2 flex items-center justify-between border-b border-[#1E1B4B]/20 pb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
                        BÀI TRẢ LỜI CỦA BẠN (CANDIDATE)
                      </span>
                      {m.duration > 0 && (
                        <span className="rounded-full border border-[#1E1B4B] bg-white px-2.5 py-0.5 text-[10px] font-black text-[#1E1B4B]">
                          ⏱ {m.duration}s
                        </span>
                      )}
                    </div>
                    <p className="text-base md:text-lg font-bold leading-relaxed text-[#1E1B4B]">
                      {m.content}
                    </p>

                    {/* Quick Cross-Screen Action */}
                    {onTryInDoctor && m.content && m.content !== '🎤 Voice' && (
                      <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-[#1E1B4B]/15">
                        <button
                          type="button"
                          onClick={() => onTryInDoctor(m.content)}
                          className="inline-flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#1E1B4B] bg-white px-3 py-1 text-xs font-black text-[#1E1B4B] shadow-[0_1px_0_#1E1B4B] hover:bg-[#F8BE33]"
                        >
                          <Stethoscope size={13} strokeWidth={2.5} className="text-[#4F46E5]" />
                          Phân tích ngữ pháp với Bác sĩ ngữ pháp
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SelfCheck Analysis Component */}
                  {(() => {
                    const prevExam = msgs.slice(0, i).reverse().find(x => x.role === 'examiner');
                    const questionText = prevExam?.q || prevExam?.cue?.title || prevExam?.content || topic?.name;
                    return (
                      <div className="mt-4 w-full">
                        <SelfCheck
                          part={m.part}
                          question={questionText}
                          transcript={m.content === '🎤 Voice' ? '' : m.content}
                          duration={m.duration || 0}
                          audioUrl={m.audioUrl}
                          voice={voice}
                          onResay={() => resay(i)}
                          resayDisabled={rec.recording}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Recording Dock */}
      <div className="z-10 mt-3 flex-none rounded-3xl border-[3px] border-[#1E1B4B] bg-white px-4 py-3.5 shadow-[0_6px_0_#1E1B4B] md:px-6 md:py-4">
        <div className="mx-auto max-w-4xl">
          {finished ? (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] shadow-[0_2px_0_#1E1B4B]">
                  <PartyPopper size={24} strokeWidth={2.5} className="text-[#1E1B4B]" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-[#1E1B4B]">
                    {part === 2 ? 'Hoàn thành phần thi Part 2!' : `Hoàn thành trọn vẹn ${total}/${total} câu! 🎉`}
                  </h3>
                  <p className="text-xs font-semibold text-[#6B6790]">
                    Xem lại nhận xét chi tiết và chấm điểm band của AI Examiner ở trên nha.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#F8BE33] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] hover:-translate-y-0.5"
              >
                <ArrowLeft size={14} strokeWidth={2.5} /> Chọn topic khác
              </button>
            </div>
          ) : (
            <>
              {/* Part 2 1-Minute Prep Countdown */}
              {part === 2 && !rec.recording && !answered.length && (
                <div className="mb-3 flex items-center justify-center">
                  {prepUsed ? (
                    prep > 0 ? (
                      <div className="flex items-center gap-4 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF0C2] px-5 py-2.5 shadow-[0_3px_0_#1E1B4B]">
                        <Clock size={18} strokeWidth={2.5} className="text-[#F2683A]" />
                        <span className="text-2xl font-black tabular-nums text-[#1E1B4B]">{fmtTime(prep)}</span>
                        <span className="text-xs font-black uppercase tracking-wider text-[#1E1B4B]">
                          Chuẩn bị ý tưởng…
                        </span>
                        <button
                          type="button"
                          onClick={() => setPrep(0)}
                          className="rounded-xl border border-[#1E1B4B] bg-white px-2.5 py-1 text-xs font-black text-[#1E1B4B] hover:bg-[#F8BE33]"
                        >
                          Bỏ qua — nói luôn
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#3ECF8E] px-5 py-2 text-sm font-black text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B]">
                        Hết giờ chuẩn bị — Bấm Mic và bắt đầu nói ngay nha! 🎤
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setPrepUsed(true); setPrep(60); }}
                      className="flex items-center gap-2 rounded-2xl border-[2.5px] border-[#1E1B4B] bg-[#FFF8E7] px-5 py-2.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] hover:bg-[#F8BE33]"
                    >
                      <Clock size={16} strokeWidth={2.5} /> 1 phút chuẩn bị dàn ý
                    </button>
                  )}
                </div>
              )}

              {/* Main Recording Row */}
              <div className="flex flex-wrap items-center gap-3 md:gap-5">
                {/* Large Tactile Mic Button */}
                <button
                  type="button"
                  onClick={() => (rec.recording ? rec.stop() : rec.start())}
                  disabled={prep > 0}
                  aria-label={rec.recording ? 'Dừng ghi âm' : 'Bấm để nói'}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#1E1B4B] shadow-[0_3px_0_#1E1B4B] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0.5 ${
                    rec.recording ? 'bg-[#EF4444] text-white animate-pulse' : 'bg-[#3ECF8E] text-[#1E1B4B]'
                  }`}
                >
                  {rec.recording ? <StopCircle size={26} strokeWidth={2.5} /> : <Mic size={26} strokeWidth={2.5} />}
                </button>

                {/* Status indicator */}
                <div className="flex shrink-0 flex-col">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      rec.recording ? 'text-[#EF4444]' : 'text-[#1E1B4B]'
                    }`}
                  >
                    {prep > 0
                      ? `⏱ Chuẩn bị: 00:${String(prep).padStart(2, '0')}`
                      : rec.recording
                        ? (part === 2 ? `⏱ ${fmtTime(rec.seconds)} · Space để dừng` : `Đang ghi âm · ${fmtTime(rec.seconds)}`)
                        : 'Bấm Mic để trả lời'}
                  </span>
                  {rec.recording ? (
                    <button
                      type="button"
                      onClick={rec.cancel}
                      className="mt-1 flex items-center gap-1 rounded-lg border border-[#1E1B4B] bg-white px-2 py-0.5 text-[10px] font-black text-[#1E1B4B] shadow-sm hover:bg-[#FEE2E2]"
                    >
                      <RotateCcw size={10} strokeWidth={2.5} /> Huỷ &amp; nói lại
                    </button>
                  ) : (
                    <span className="hidden items-center gap-1 text-[11px] font-bold text-[#6B6790] sm:flex">
                      hoặc nhấn phím <kbd className="rounded-md border border-[#1E1B4B] bg-[#FFF8E7] px-1.5 py-0.2 font-mono text-[10px] text-[#1E1B4B]">Space</kbd>
                    </span>
                  )}
                </div>

                {/* Fallback Text Input & Send */}
                <div className="relative min-w-[240px] flex-1">
                  <textarea
                    value={rec.recording ? rec.interim : text}
                    onChange={e => setText(e.target.value)}
                    readOnly={rec.recording}
                    placeholder={rec.recording ? '🎙️ Đang nghe giọng nói của bạn... Hãy nói to và rõ ràng.' : 'Nhập câu trả lời hoặc bấm Mic để nói...'}
                    rows={1}
                    className="w-full resize-none rounded-2xl border-[2px] border-[#1E1B4B] bg-[#FFFDF8] px-4 py-3 pr-32 text-sm font-bold text-[#1E1B4B] outline-none shadow-inner"
                  />
                  {!rec.recording && text.trim() && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() =>
                          submit({
                            transcript: text.trim(),
                            duration: Math.max(10, Math.round(text.trim().split(/\s+/).length / 2.2)),
                            url: null,
                          })
                        }
                        className="flex items-center gap-1.5 rounded-xl border-[2px] border-[#1E1B4B] bg-[#F8BE33] px-3.5 py-1.5 text-xs font-black uppercase text-[#1E1B4B] shadow-[0_2px_0_#1E1B4B] hover:-translate-y-0.5"
                      >
                        <Sparkles size={13} strokeWidth={2.5} /> Gửi trả lời
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
