import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Clock, Target, ShieldAlert, Award, MessageSquare, Mic, Users, ArrowRight, Volume2, VolumeX, StopCircle, SkipForward, Square } from 'lucide-react';
import SelfCheck from './SelfCheck';
import { useRecorder, useSpaceToRecord, speak, stopSpeaking, addHistory, fmtTime, readHistory } from './speakingUtils';

// "🔥 Thi thật cực căng" — full 3-part exam built from the forecast set (same question selection as the site:
// compulsory P1 + 2 random P1 topics, one cue card with ≥5 Part 3 questions). Grading is replaced by self-check.
const EXAM_HISTORY = 'tid_speaking_exams_v1';

function buildExam(data) {
  const p1a = data.part1.compulsory.flatMap(t => t.questions.map(q => ({ part: 1, question: q }))).slice(0, 6);
  const picks = [...data.part1.specific].sort(() => 0.5 - Math.random()).slice(0, 2);
  const p1b = picks.flatMap(t => t.questions.map(q => ({ part: 1, question: q }))).slice(0, 6);
  const pool = data.part2_3.filter(c => c.part3.length >= 5);
  const cue = (pool.length ? pool : data.part2_3)[Math.floor(Math.random() * (pool.length || data.part2_3.length))];
  return { cue, items: [...p1a, ...p1b, { part: 2, question: cue.cueCard.replace(/^\d+\.\s*/, '') }, ...cue.part3.slice(0, 7).map(q => ({ part: 3, question: q }))] };
}

export default function ForecastExam({ data, onClose }) {
  const [phase, setPhase] = useState('intro'); // intro | test | result | history
  const [exam, setExam] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [muted, setMuted] = useState(false);
  const [prep, setPrep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const item = exam?.items[idx];
  const recIdx = useRef(0);
  const answersRef = useRef({});
  answersRef.current = answers;

  const rec = useRecorder({
    maxSeconds: item?.part === 2 ? 120 : 60,
    onDone: r => setAnswers(a => ({ ...a, [recIdx.current]: r })),
  });
  const startRec = () => { recIdx.current = idx; rec.start(); };
  useSpaceToRecord({ canStart: phase === 'test' && !prep, recording: rec.recording, start: startRec, stop: rec.stop, cancel: rec.cancel });

  useEffect(() => {
    if (phase !== 'test' || !item) return undefined;
    if (item.part === 2) setPrep(60);
    if (!muted) speak(item.question, 'British (Anh-Anh)');
    return () => stopSpeaking();
  }, [phase, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== 'test') return undefined;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (!prep) return undefined;
    const t = setTimeout(() => setPrep(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [prep]);

  const start = () => { setExam(buildExam(data)); setIdx(0); setAnswers({}); setElapsed(0); setPhase('test'); };
  const finish = () => {
    const finalAnswers = answersRef.current;
    rec.cancel();
    stopSpeaking();
    const list = exam.items.map((it, i) => ({ ...it, transcript: finalAnswers[i]?.transcript || '', duration: finalAnswers[i]?.duration || 0 }));
    list.filter(x => x.duration).forEach(x => addHistory({ mode: 'forecast_practice', topic: 'Thi thử Forecast', question: x.question, transcript: x.transcript, duration: x.duration, wpm: x.duration ? Math.round(x.transcript.split(/\s+/).filter(Boolean).length / x.duration * 60) : 0 }));
    try {
      const prev = JSON.parse(localStorage.getItem(EXAM_HISTORY) || '[]');
      localStorage.setItem(EXAM_HISTORY, JSON.stringify([{ at: new Date().toISOString(), cue: exam.cue.cueCard, answered: list.filter(x => x.duration).length, total: list.length, elapsed }, ...prev].slice(0, 30)));
    } catch { /* ignore */ }
    setPhase('result');
  };
  const next = () => {
    const wasRecording = rec.recording;
    if (wasRecording) rec.stop();
    if (idx < exam.items.length - 1) setIdx(i => i + 1); else setTimeout(() => finish(), wasRecording ? 400 : 0);
  };

  const pastExams = useMemo(() => { try { return JSON.parse(localStorage.getItem(EXAM_HISTORY) || '[]'); } catch { return []; } }, [phase]);
  const answered = exam ? exam.items.filter((_, i) => answers[i]).length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#6f8f4b]" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="sticky top-0 z-20 mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-4xl items-center justify-between rounded-[20px] border-4 border-[#111] bg-white px-4 py-3.5 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:mt-6 md:w-[calc(100%-4rem)] md:px-7 md:py-4">
        <h2 className="flex items-center gap-2 font-quicksand text-xl font-extrabold"><span className="text-red-600">🔥 Thi thật cực căng</span></h2>
        <div className="flex items-center gap-4">
          {phase === 'test' && (
            <button onClick={() => { setMuted(m => !m); stopSpeaking(); }} title={muted ? 'Bật âm thanh giám khảo' : 'Tắt âm thanh giám khảo'} className="rounded-full border-2 border-[#111] bg-white p-2 shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-[#e8e4d4]">
              {muted ? <VolumeX className="h-5 w-5 text-[#8a8672]" /> : <Volume2 className="h-5 w-5 text-black" />}
            </button>
          )}
          <button onClick={() => { rec.cancel(); stopSpeaking(); onClose(); }} className="rounded-full border-2 border-[#111] bg-[#f4f1e6] p-2 shadow-[2px_2px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-[#e8e4d4]"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl p-4 pb-24 md:p-8">
        {phase === 'intro' && (
          <div className="rounded-[20px] border-4 border-[#111] bg-[#faf9f2] p-5 shadow-[8px_8px_0_rgba(0,0,0,0.15)] md:p-8">
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-quicksand text-3xl font-extrabold text-[#111]">Chọn Chế Độ</h1>
              <p className="font-medium text-[#8a8672]">Giám khảo sẽ hỏi theo mode bạn chọn</p>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="cursor-not-allowed rounded-xl border-2 border-[#111] bg-white p-4 text-center opacity-60"><div className="font-bold text-[#8a8672]">Ngẫu nhiên</div><div className="mt-1 text-xs text-[#8a8672]">Mix topics</div></div>
              <div className="relative overflow-hidden rounded-xl border-2 border-[#111] bg-red-600 p-4 text-center shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-center gap-2 font-black text-white">Thi thật cực căng<span className="rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-black leading-none text-red-600">NEW</span></div>
                <div className="mt-1 text-xs font-medium text-red-100">Exam simulation</div>
              </div>
              <div className="cursor-not-allowed rounded-xl border-2 border-[#111] bg-white p-4 text-center opacity-60"><div className="font-bold text-[#8a8672]">Tùy chỉnh</div><div className="mt-1 text-xs text-[#8a8672]">Custom</div></div>
            </div>
            <div className="mb-8 flex items-start gap-4 rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <div className="shrink-0 rounded-full bg-red-100 p-2"><Target className="h-5 w-5 text-red-600" /></div>
              <div>
                <div className="mb-1 flex items-center gap-2 font-bold text-red-800">Thi thật cực căng<span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">NEW</span></div>
                <p className="text-sm font-medium leading-relaxed text-red-700">Mô phỏng sát đề thi thật: full 3 phần, thời gian chuẩn, không gợi ý, tự đánh giá chi tiết sau khi thi.</p>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-[#8a8672]">Cấu hình chế độ thi</h3>
              <div className="divide-y-2 divide-black rounded-xl border-2 border-[#111] bg-white shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                {[[Clock, 'Thời lượng', '11–14 phút'], [Target, 'Độ khó', 'Khó'], [Target, 'Độ dài câu trả lời', 'Chuẩn (đề thi thật)'], [ShieldAlert, 'Trợ giúp', 'Tắt hoàn toàn'], [Award, 'Phản hồi', 'Tự đánh giá (offline)']].map(([I, k, v]) => (
                  <div key={k} className="flex items-center justify-between p-4"><div className="flex items-center gap-3 font-bold"><I className="h-5 w-5 text-red-500" /> {k}</div><div className="text-sm font-bold text-red-600">{v}</div></div>
                ))}
              </div>
            </div>
            <div className="mb-8 flex flex-col gap-4 rounded-xl border-2 border-red-200 bg-red-50 p-5 md:flex-row">
              <div className="shrink-0 self-start rounded-full border-2 border-red-200 bg-white p-2"><ShieldAlert className="h-6 w-6 text-red-500" /></div>
              <div>
                <h4 className="mb-2 font-bold text-red-800">Lưu ý</h4>
                <ul className="space-y-2 text-sm font-medium text-red-700">
                  <li>• Không có gợi ý trong quá trình thi.</li><li>• Không xem trước câu hỏi.</li>
                  <li>• Sau khi thi, nghe lại bản thu và tự chấm theo 4 tiêu chí IELTS.</li><li>• Nên thi trong môi trường yên tĩnh, không gián đoạn.</li>
                </ul>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-[#8a8672]">Nội dung thi bao gồm</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[['Part 1', '4–5 phút', MessageSquare, 'text-blue-600', 'text-blue-400', 'Giới thiệu &', 'câu hỏi quen thuộc'], ['Part 2', '3–4 phút', Mic, 'text-purple-600', 'text-purple-400', 'Nói dài (2 phút)', '+ 1 phút chuẩn bị'], ['Part 3', '4–5 phút', Users, 'text-rose-600', 'text-rose-400', 'Thảo luận sâu &', 'câu hỏi mở rộng']].map(([p, t, I, c1, c2, l1, l2]) => (
                  <div key={p} className="flex flex-col items-center rounded-xl border-2 border-[#111] bg-white p-5 text-center shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                    <div className={`mb-1 font-black ${c1}`}>{p}</div><div className="mb-4 text-xs font-medium text-[#8a8672]">{t}</div>
                    <I className={`mb-3 h-8 w-8 ${c2}`} /><div className="text-sm font-bold text-[#222]">{l1}<br />{l2}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={start} className="tid-press flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#111] bg-[#c23b3b] py-4 font-quicksand text-lg font-extrabold text-white shadow-[4px_4px_0_#f96015]">Bắt đầu thi thật cực căng <ArrowRight className="h-6 w-6" /></button>
            <button onClick={() => setPhase('history')} className="tid-press mt-4 w-full rounded-xl border-[3px] border-[#111] bg-white py-4 font-quicksand text-lg font-extrabold text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.15)]">📋 Lịch sử bài thi</button>
            <p className="mt-4 text-center text-sm font-medium text-[#8a8672]">Bạn đã sẵn sàng? Hãy tập trung và làm hết sức nhé!</p>
          </div>
        )}

        {phase === 'history' && (
          <div className="rounded-[20px] border-4 border-[#111] bg-[#faf9f2] p-6 shadow-[8px_8px_0_rgba(0,0,0,0.15)]">
            <h3 className="mb-4 font-quicksand text-2xl font-extrabold">📋 Lịch sử bài thi</h3>
            {pastExams.length === 0 ? <p className="font-bold text-[#8a8672]">Chưa có bài thi nào.</p> : (
              <div className="space-y-3">{pastExams.map((e, i) => (
                <div key={i} className="rounded-xl border-2 border-[#111] bg-white p-4">
                  <div className="text-xs font-bold text-[#8a8672]">{new Date(e.at).toLocaleString('vi-VN')} · {fmtTime(e.elapsed)}</div>
                  <div className="font-bold">{e.cue}</div>
                  <div className="text-sm text-[#555]">Đã trả lời {e.answered}/{e.total} câu</div>
                </div>
              ))}</div>
            )}
            <button onClick={() => setPhase('intro')} className="tid-press mt-6 rounded-xl border-[3px] border-[#111] bg-white px-6 py-3 font-extrabold">← Quay lại</button>
          </div>
        )}

        {phase === 'test' && item && (
          <div className="flex flex-col items-center pt-10">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-block rounded-full bg-black px-4 py-1.5 text-sm font-black uppercase text-white">Part {item.part}</div>
              <div className="mb-2 font-bold tabular-nums text-white/80">Câu {idx + 1}/{exam.items.length}</div>
              <div className="h-10 font-quicksand text-4xl font-extrabold tabular-nums text-white">{fmtTime(elapsed)}</div>
            </div>
            <div className="relative mb-12 flex min-h-[200px] w-full max-w-2xl items-center justify-center rounded-[20px] border-4 border-[#111] bg-[#fffdf5] p-8 shadow-[8px_8px_0_rgba(0,0,0,0.15)]">
              {item.part === 2 && prep > 0 ? (
                <div className="text-center">
                  <div className="mb-2 text-2xl font-black text-red-500">1 Phút Chuẩn Bị</div>
                  <p className="font-medium text-[#444]">Bạn có 1 phút để ghi chú trước khi nói. ({prep}s)</p>
                  <div className="mt-6 border-2 border-[#111] bg-[#fdf6e3] p-6 text-left">
                    <div className="text-center text-xl font-black">{item.question}</div>
                    <ul className="mt-3 space-y-1">{exam.cue.bullets.map((b, i) => <li key={i} className="text-sm font-medium">• {b}</li>)}</ul>
                  </div>
                  <button onClick={() => setPrep(0)} className="mt-4 text-xs font-bold text-[#5f6a45] underline">Bỏ qua — nói luôn</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#c9c6b6] bg-[#f4f1e6]">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${rec.recording ? 'animate-pulse bg-[#dbe6ff]' : 'bg-amber-400'}`}><Mic className={`h-8 w-8 ${rec.recording ? 'text-[#2f6fe0]' : 'text-[#111]'}`} /></div>
                  </div>
                  {rec.recording ? (
                    <div className="w-[min(360px,68vw)] text-center">
                      <div className="mb-1 font-bold text-[#2f6fe0]">Đang ghi âm...</div>
                      <div className="text-3xl font-black text-[#111]">{fmtTime(rec.seconds)}</div>
                    </div>
                  ) : (
                    <p className="max-w-xs text-center font-medium text-[#8a8672]">{answers[idx] ? '✓ Đã ghi âm câu này — bấm "Câu tiếp" hoặc ghi lại.' : 'Hãy lắng nghe giám khảo và bấm "Bắt đầu nói" để trả lời.'}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 px-3 sm:gap-4">
              <button onClick={() => speak(item.question, 'British (Anh-Anh)')} className="tid-press flex items-center gap-2 rounded-xl border-[3px] border-[#111] bg-white px-5 py-4 font-black text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.25)]"><Volume2 className="h-5 w-5" /> Nghe lại câu hỏi</button>
              {rec.recording
                ? <button onClick={rec.stop} className="tid-press flex items-center gap-2 rounded-xl border-[3px] border-[#111] bg-[#c23b3b] px-8 py-4 font-black text-white shadow-[4px_4px_0_#f96015]"><Square className="h-5 w-5" /> Dừng</button>
                : <button onClick={startRec} disabled={prep > 0} className="tid-press flex items-center gap-2 rounded-xl border-[3px] border-[#111] bg-[#111] px-8 py-4 font-black text-[#ffc926] shadow-[4px_4px_0_#f96015] disabled:opacity-50"><Mic className="h-5 w-5" /> Bắt đầu nói</button>}
              <button onClick={next} className="tid-press flex items-center gap-2 rounded-xl border-[3px] border-[#111] bg-white px-5 py-4 font-black text-[#111] shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
                {idx < exam.items.length - 1 ? <><SkipForward className="h-5 w-5" /> Câu tiếp</> : <><StopCircle className="h-5 w-5" /> Dừng & Nộp</>}
              </button>
            </div>
            <p className="mb-0 mt-3 text-xs font-bold text-white/85">hoặc nhấn <kbd className="rounded-md border-2 border-[#111] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#111]">Space</kbd></p>
            {rec.error && <p className="mt-2 max-w-md rounded-xl border-2 border-[#111] bg-red-600 px-4 py-2 text-center text-sm font-bold text-white">{rec.error}</p>}
            <div className="mt-12"><button onClick={() => { if (rec.recording) { rec.stop(); setTimeout(finish, 400); } else finish(); }} className="text-sm font-bold text-white/80 underline underline-offset-4 transition-colors hover:text-white">Kết thúc bài thi sớm</button></div>
          </div>
        )}

        {phase === 'result' && exam && (
          <div className="space-y-6">
            <div className="pt-[4vh]">
              <h2 className="mb-1 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Kết quả bài</h2>
              <div className="mb-6 text-6xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">Speaking</div>
              <p className="max-w-md text-lg font-medium leading-relaxed text-white/80">Bạn đã trả lời {answered}/{exam.items.length} câu trong {fmtTime(elapsed)}. Nghe lại từng câu và tự chấm theo 4 tiêu chí nhé!</p>
            </div>
            {answered === 0 && <div className="rounded-xl border-2 border-[#111] bg-[#fdf6e3] p-6 font-bold text-[#8a6100]">Bạn chưa trả lời câu nào nên chưa có gì để đánh giá — hãy nói ít nhất một câu nhé.</div>}
            {exam.items.map((it, i) => (
              <div key={i} className="rounded-[20px] border-4 border-[#111] bg-[#faf9f2] p-5 shadow-[8px_8px_0_rgba(0,0,0,0.15)]">
                <div className="mb-2 flex items-center gap-2"><span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">Part {it.part}</span><span className="text-xs font-bold text-[#8a8672]">Câu {i + 1}</span></div>
                <p className="mb-3 font-bold text-[#111]">{it.question}</p>
                {answers[i] ? <SelfCheck part={it.part} transcript={answers[i].transcript} duration={answers[i].duration} audioUrl={answers[i].url} /> : <p className="text-sm italic text-[#8a8672]">(Bạn không trả lời câu này)</p>}
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setPhase('intro')} className="tid-press rounded-xl border-[3px] border-[#111] bg-white px-6 py-3 font-extrabold">Thi lại</button>
              <button onClick={onClose} className="tid-press rounded-xl border-[3px] border-[#111] bg-[#111] px-6 py-3 font-extrabold text-[#ffc926] shadow-[4px_4px_0_#f96015]">Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
