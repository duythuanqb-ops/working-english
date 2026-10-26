import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Circle, Clock, Pause, Play, RotateCcw, Send, Sparkles } from 'lucide-react';
import { TOPIC_BY_KEY, TYPE_BY_KEY, countWords, getHistory, loadTest, lsDel, lsGet, lsSet, recordAttempt } from './data';
import { criteriaFor, overallBand, quickChecks } from './bands';
import { SelectToSave } from './saveWord';

const fmt = s => {
  const neg = s < 0;
  const a = Math.abs(s);
  return `${neg ? '-' : ''}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};

// Writing exam editor: prompt (+ chart) | essay with timer & word count -> local self-assessment + model answer.
export default function WritingEditor({ test, onBack, go, onSaveWord, speechVoice }) {
  const [detail, setDetail] = useState(null);
  const draftKey = `tid_writing_draft_${test.id}`;
  const [text, setText] = useState(() => lsGet(draftKey, '') || '');
  const limit = test.task === 1 ? 20 * 60 : 40 * 60;
  const [left, setLeft] = useState(limit);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('sample');
  const [showData, setShowData] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadTest(test.id).then(d => alive && setDetail(d));
    return () => { alive = false; };
  }, [test.id]);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // autosave draft
  useEffect(() => {
    const t = setTimeout(() => (text ? lsSet(draftKey, text) : lsDel(draftKey)), 400);
    return () => clearTimeout(t);
  }, [text, draftKey]);

  const words = countWords(text);
  const min = test.task === 1 ? 150 : 250;
  const type = TYPE_BY_KEY[test.type];
  const topic = TOPIC_BY_KEY[test.topic];
  const criteria = criteriaFor(test.task);
  const band = overallBand(scores);
  const stats = useMemo(() => (submitted ? quickChecks(text, test.task) : null), [submitted, text, test.task]);
  const prev = getHistory()[test.id];
  const sampleHtml = detail?.sampleHtml || '';
  const guideHtml = detail?.guideHtml || '';

  const submit = () => {
    if (!text.trim()) return;
    setRunning(false);
    setSubmitted(true);
    setTab(sampleHtml ? 'sample' : guideHtml ? 'guide' : 'sample');
  };
  const saveResult = () => {
    recordAttempt(test.id, band);
    setSaved(true);
  };
  const restart = () => {
    setSubmitted(false); setScores({}); setSaved(false); setLeft(limit); setRunning(false);
    setTimeout(() => taRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-full bg-[#fafaf7]">
      {/* top bar */}
      <div className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button type="button" onClick={onBack} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold text-black hover:bg-[#FFFADD]">
            <ArrowLeft className="h-4 w-4" />{test.fromSample ? 'Bài mẫu' : 'Thư viện đề'}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 rounded-lg border-2 border-black bg-black px-2 py-1 text-[11px] font-black uppercase tracking-wider text-white">Task {test.task}</span>
            {type && <span className="shrink-0 rounded-lg border-2 border-black px-2 py-1 text-[11px] font-black text-white" style={{ background: type.color }}>{type.short ?? type.label}</span>}
            <span className="truncate text-[15px] font-extrabold text-[#1E3006]">{test.title}</span>
          </div>
          <div className={`inline-flex h-10 items-center gap-2 rounded-xl border-2 border-black px-3 font-[family-name:var(--font-jetbrains)] text-[15px] font-black ${left < 0 ? 'bg-red-100 text-red-700' : left < 300 ? 'bg-amber-100 text-amber-800' : 'bg-white text-black'}`}>
            <Clock className="h-4 w-4" />{fmt(left)}
            {!submitted && (
              <button type="button" onClick={() => setRunning(r => !r)} title={running ? 'Tạm dừng' : 'Bắt đầu tính giờ'} className="ml-1 rounded-md p-0.5 hover:bg-black/10">
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            )}
          </div>
          <div className={`inline-flex h-10 items-center rounded-xl border-2 border-black px-3 text-[14px] font-black ${words >= min ? 'bg-[#DDF7E8] text-[#166534]' : 'bg-white text-slate-700'}`}>
            {words} <span className="ml-1 font-bold text-slate-500">/ {min} từ</span>
          </div>
          {!submitted ? (
            <button type="button" onClick={submit} disabled={!text.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-[#FFE787] px-4 text-[14px] font-black text-black shadow-[3px_3px_0_#000] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[4px_4px_0_#000] disabled:opacity-50">
              <Send className="h-4 w-4" />Nộp bài & tự chấm
            </button>
          ) : (
            <button type="button" onClick={restart} className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-4 text-[14px] font-black hover:bg-[#FFFADD]">
              <RotateCcw className="h-4 w-4" />Viết tiếp / làm lại
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* prompt */}
        <section className="min-w-0 self-start rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000] lg:sticky lg:top-[84px]">
          <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-[#FFE4EA] px-5 py-3 rounded-t-[14px]">
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#9F1239]">Writing Task {test.task}</span>
            {topic && <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[11.5px] font-bold">{topic.icon} {topic.label}</span>}
            {prev && <span className="rounded-full border border-black bg-[#6A8042] px-2 py-0.5 text-[11.5px] font-bold text-white">✓ Đã viết · {prev.n} lần{prev.band != null ? ` · Band ${Number(prev.band).toFixed(1)}` : ''}</span>}
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-5 py-4">
            <p className="text-[13px] font-semibold italic text-slate-500">You should spend about {test.task === 1 ? 20 : 40} minutes on this task.</p>
            <div className="mt-3 rounded-xl border-2 border-dashed border-slate-300 bg-[#fafaf7] px-4 py-3 font-[family-name:var(--font-newsreader)] text-[17px] font-semibold leading-relaxed text-slate-900">
              {test.prompt}
            </div>
            {test.task === 2 && <p className="mt-3 text-[13px] italic text-slate-600">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>}
            <p className="mt-3 text-[13px] font-semibold italic text-slate-500">Write at least {min} words.</p>
            {test.image && test.task === 1 && (
              <img src={test.image} alt="Task 1 chart" className="mt-4 w-full rounded-xl border-2 border-black bg-white object-contain" />
            )}
            {detail?.chartDescription && (
              <div className="mt-4">
                <button type="button" onClick={() => setShowData(s => !s)} className="inline-flex items-center gap-1.5 text-[13px] font-black text-[#B45309] hover:underline">
                  <BarChart3 className="h-4 w-4" />{showData ? 'Ẩn dữ liệu biểu đồ' : 'Xem dữ liệu biểu đồ (dạng chữ)'}
                </button>
                {showData && <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-[family-name:var(--font-jetbrains)] text-[12px] leading-relaxed text-slate-700">{detail.chartDescription}</pre>}
              </div>
            )}
          </div>
        </section>

        {/* essay / result */}
        <section className="min-w-0">
          {!submitted ? (
            <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
              <div className="mb-2 flex items-center justify-between text-[12px] font-black uppercase tracking-[0.15em] text-slate-500">
                <span>Bài viết của bạn</span>
                <span className="normal-case tracking-normal text-slate-400">Bản nháp được tự lưu trên máy</span>
              </div>
              <textarea ref={taRef} value={text} onChange={e => { setText(e.target.value); if (!running && left === limit) setRunning(true); }}
                spellCheck={false} placeholder="Bắt đầu viết bài tại đây… (đồng hồ tự chạy khi bạn gõ)"
                className="min-h-[calc(100vh-260px)] w-full resize-y rounded-xl border-2 border-slate-200 bg-[#fffdf5] px-5 py-4 font-[family-name:var(--font-newsreader)] text-[18px] leading-[1.75] text-slate-900 outline-none focus:border-black" />
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.min(100, (words / min) * 100)}%`, background: words >= min ? '#6A8042' : '#F8BE33' }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* stats + checks */}
              <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#9F1239]">Kiểm tra nhanh</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[[stats.words, 'từ'], [stats.paras, 'đoạn'], [stats.sentences, 'câu'], [stats.avgLen, 'từ / câu']].map(([v, l]) => (
                    <div key={l} className="rounded-xl border-2 border-black bg-[#fafaf7] px-3 py-2 text-center">
                      <div className="text-[22px] font-black text-[#1E3006]">{v}</div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{l}</div>
                    </div>
                  ))}
                </div>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {stats.checks.map(c => (
                    <li key={c.label} className="flex items-start gap-2 text-[14px]">
                      {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6A8042]" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                      <span className={c.ok ? 'font-semibold text-slate-800' : 'font-semibold text-red-700'}>{c.label}</span>
                      {c.detail && <span className="text-slate-500">· {c.detail}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* self assessment */}
              <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#9F1239]">Tự chấm theo band descriptors</p>
                    <p className="mt-1 text-[13px] text-slate-600">So bài của bạn với bài mẫu, chọn mô tả đúng nhất cho từng tiêu chí.</p>
                  </div>
                  <div className="rounded-xl border-2 border-black bg-[#FFE787] px-4 py-2 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wider">Overall</div>
                    <div className="text-[28px] font-black leading-none text-[#1E3006]">{band != null ? band.toFixed(1) : '–'}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {criteria.map(c => (
                    <div key={c.key}>
                      <p className="mb-2 text-[14px] font-black text-[#1E3006]">{c.label} <span className="text-slate-400">({c.short})</span>{scores[c.key] != null && <span className="ml-2 rounded-md bg-black px-1.5 py-0.5 text-[12px] text-white">{scores[c.key]}</span>}</p>
                      <div className="grid gap-1.5">
                        {[9, 8, 7, 6, 5, 4].map(b => (
                          <button key={b} type="button" onClick={() => { setScores(s => ({ ...s, [c.key]: b })); setSaved(false); }}
                            className={`flex items-start gap-3 rounded-xl border-2 px-3 py-2 text-left text-[13px] leading-snug transition-colors ${scores[c.key] === b ? 'border-black bg-[#DDF7E8] shadow-[2px_2px_0_#000]' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                            <span className={`mt-px w-7 shrink-0 rounded-md text-center text-[13px] font-black ${scores[c.key] === b ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'}`}>{b}</span>
                            <span className="text-slate-700">{c.bands[b]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={saveResult} disabled={band == null || saved}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#6A8042] text-[14px] font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-60">
                  <CheckCircle2 className="h-4 w-4" />{saved ? 'Đã lưu kết quả' : band == null ? 'Chấm đủ 4 tiêu chí để lưu' : `Lưu kết quả · Band ${band.toFixed(1)}`}
                </button>
              </div>

              {/* your essay */}
              <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Bài của bạn</p>
                <div className="whitespace-pre-wrap font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.75] text-slate-900">{text}</div>
              </div>

              {/* model answer / guide */}
              <div className="rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000]">
                <div className="flex gap-1 border-b-2 border-black p-2">
                  {[['sample', 'Bài mẫu', Sparkles], ['guide', 'Hướng dẫn viết', BookOpen]].map(([k, l, Icon]) => (
                    <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[14px] font-extrabold text-slate-700 hover:bg-[#FFFADD] aria-pressed:bg-black aria-pressed:text-white">
                      <Icon className="h-4 w-4" />{l}
                    </button>
                  ))}
                </div>
                <div className="px-5 py-4">
                  {tab === 'sample' && (sampleHtml ? (
                    <SelectToSave onSaveWord={onSaveWord} speechVoice={speechVoice}>
                      <p className="mb-2 text-[12px] text-slate-500">Bôi đen một từ/cụm từ để lưu vào sổ từ vựng.</p>
                      <div className="wr-guide font-[family-name:var(--font-newsreader)] text-[17px] text-slate-900" dangerouslySetInnerHTML={{ __html: sampleHtml }} />
                    </SelectToSave>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="font-bold text-slate-700">Đề này chưa có bài mẫu trong dữ liệu offline.</p>
                      {test.task === 2 && (
                        <button type="button" onClick={() => go('samples')} className="mt-3 rounded-xl border-2 border-black bg-[#DDF7E8] px-4 py-2 text-[14px] font-bold shadow-[3px_3px_0_#000]">Xem thư viện Bài mẫu Band 8.0</button>
                      )}
                    </div>
                  ))}
                  {tab === 'guide' && (guideHtml
                    ? <div className="wr-guide text-[15px] text-slate-800" dangerouslySetInnerHTML={{ __html: guideHtml }} />
                    : <p className="py-4 text-center font-bold text-slate-700">Đề này chưa có hướng dẫn viết.</p>)}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
