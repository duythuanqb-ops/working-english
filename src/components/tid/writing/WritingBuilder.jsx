import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Layers, Search, Sparkles, X } from 'lucide-react';
import { BUILDER, countWords, loadBuilder, lsGet, lsSet, stripVN } from './data';
import { ChipRail, FilterChip } from './ui';
import { SelectToSave } from './saveWord';
import { aiService } from '../../../services/aiService';

// Writing Builder. On the site this page is gated (TIDian / Writing plan); here it is rebuilt from the `writing_tasks`
// rows that carry a logical frame (Introduction / Overview / Body…): the learner writes section by section and can
// reveal the model paragraph for each part.
const SOURCES = [
  { key: 'builder', label: 'Builder', icon: '✦', color: '#B45309' },
  { key: 'task1', label: 'Đề thi thật · Livestream', icon: '◷', color: '#1D4ED8' },
];
const TIPS = {
  Introduction: 'Paraphrase đề bài: đổi động từ (show → illustrate/compare), đổi danh từ, giữ nguyên mốc thời gian & đối tượng.',
  Overview: 'Nêu 2 xu hướng / đặc điểm nổi bật nhất, không đưa số liệu chi tiết. Bắt đầu bằng “Overall, …”.',
  Overall: 'Nêu 2 xu hướng / đặc điểm nổi bật nhất, không đưa số liệu chi tiết. Bắt đầu bằng “Overall, …”.',
  'Body 1': 'Nhóm dữ liệu thứ nhất: mô tả + so sánh, có số liệu dẫn chứng cụ thể.',
  'Body 2': 'Nhóm dữ liệu còn lại: mô tả các thay đổi/so sánh còn lại với số liệu.',
  'Body 3': 'Phần dữ liệu bổ sung (nếu có) — giữ cấu trúc so sánh rõ ràng.',
};
const PAGE = 24;

export function BuilderLibrary({ go, onOpen }) {
  const [src, setSrc] = useState(null);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const drafts = useMemo(() => lsGet('tid_writing_builder_done', {}) || {}, []);
  const list = useMemo(() => {
    const n = stripVN(q.trim());
    return BUILDER.filter(b => (!src || b.kind === src) && (!n || stripVN(b.title).includes(n)));
  }, [src, q]);
  const shown = list.slice(0, limit);
  const rest = list.length - shown.length;
  return (
    <div className="min-h-full bg-[#fafaf7]">
      <main className="mx-auto w-full max-w-[1360px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 rounded-[20px] border-2 border-black bg-[#FFF4C2] px-5 py-5 shadow-[6px_6px_0_#000] sm:flex-row sm:items-center sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#B45309]">Writing Builder</p>
            <h1 className="mt-1 text-[clamp(34px,5vw,52px)] font-black uppercase leading-none tracking-tighter text-black">Tạo bài Writing</h1>
            <p className="mt-2 font-serif text-[15px] italic text-slate-700 sm:text-base">{BUILDER.length} đề Task 1 có dàn ý mẫu · viết từng phần Introduction → Overview → Body</p>
          </div>
          <span className="shrink-0 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 sm:ml-auto">
            <b className="mr-1 text-[20px] font-black text-[#B45309]">{Object.keys(drafts).length}</b>bài đã ghép
          </span>
        </section>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => go('tests')} className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold hover:bg-[#FFFADD]">
            <ArrowLeft className="h-4 w-4" />Quay lại thư viện Writing
          </button>
          <label className="relative min-w-0 flex-1 sm:ml-auto sm:w-[clamp(220px,28vw,340px)] sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Tìm đề: population, process…"
              className="h-10 w-full rounded-xl border-2 border-black bg-white pl-9 pr-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#FFE787]" />
          </label>
        </div>
        <div className="mt-4">
          <ChipRail label="Nguồn đề:">
            <FilterChip pressed={src === null} onClick={() => setSrc(null)} color="#1E3006" icon="◈" label="Tất cả" count={BUILDER.length} />
            {SOURCES.map(s => <FilterChip key={s.key} pressed={src === s.key} onClick={() => { setSrc(src === s.key ? null : s.key); setLimit(PAGE); }} color={s.color} icon={s.icon} label={s.label} count={BUILDER.filter(b => b.kind === s.key).length} />)}
          </ChipRail>
        </div>
        <div className="mt-4 flex items-center gap-3 text-[13px] text-slate-600">
          <span>Đang hiện <b className="text-black">{shown.length}</b> / {list.length} đề</span>
          {(src || q) && <button type="button" onClick={() => { setSrc(null); setQ(''); }} className="inline-flex items-center gap-1 rounded-full border border-slate-400 px-2.5 py-0.5 font-bold text-slate-700 hover:border-black"><X className="h-3.5 w-3.5" />Xoá bộ lọc</button>}
        </div>
        <div className="mt-3 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))]">
          {shown.map(b => (
            <button key={b.id} type="button" onClick={() => onOpen(b)}
              className="group flex min-h-[150px] overflow-hidden rounded-2xl border-2 border-black bg-white text-left shadow-[4px_4px_0_#000] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]">
              <span className="relative w-[35%] shrink-0 border-r-2 border-black bg-[#fafaf7]">
                {b.image && <img src={b.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-2.5 mix-blend-multiply" />}
                <span className="absolute left-0 top-0 rounded-br-lg border-b-2 border-r-2 border-black px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: b.kind === 'builder' ? '#B45309' : '#1D4ED8' }}>{b.kind === 'builder' ? 'Builder' : 'Task 1'}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5">
                {b.tag && <span className="self-start rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">{b.tag}</span>}
                <span className="line-clamp-3 text-[15px] font-extrabold leading-snug text-[#1E3006] group-hover:underline">{b.title.replace(/^\s*\[[^\]]+\]\s*-?\s*/, '')}</span>
                <span className="mt-auto flex items-center gap-2 text-[12px] font-bold text-slate-500">
                  <Layers className="h-3.5 w-3.5" />{b.sections} phần
                  {drafts[b.id] && <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-black bg-[#6A8042] px-2 py-0.5 text-[11px] text-white"><Check className="h-3 w-3" />Đã ghép bài</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
        {rest > 0 && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={() => setLimit(l => l + PAGE)} className="rounded-xl border-2 border-black bg-white px-5 py-2.5 text-[14px] font-extrabold shadow-[4px_4px_0_#000] hover:-translate-y-px">Xem thêm {Math.min(PAGE, rest)} đề · còn {rest}</button>
          </div>
        )}
      </main>
    </div>
  );
}

export function BuilderWorkspace({ item, onBack, onSaveWord, speechVoice }) {
  const [data, setData] = useState(null);
  const key = `tid_writing_builder_${item.id}`;
  const [parts, setParts] = useState(() => lsGet(key, {}) || {});
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState({});
  const [assembled, setAssembled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => { loadBuilder(item.id).then(setData); }, [item.id]);
  useEffect(() => { const t = setTimeout(() => lsSet(key, parts), 300); return () => clearTimeout(t); }, [parts, key]);

  if (!data) return <div className="p-20 text-center font-bold text-slate-400">Đang tải…</div>;
  const frame = data.frame;
  const sec = frame[step];
  const essay = frame.map((f, i) => (parts[i] || '').trim()).filter(Boolean).join('\n\n');
  const model = frame.map(f => f.paragraphs.join(' ')).join('\n\n');
  const assemble = () => {
    setAssembled(true);
    const done = lsGet('tid_writing_builder_done', {}) || {};
    done[item.id] = Date.now();
    lsSet('tid_writing_builder_done', done);
  };

  const handleAIEvaluate = async () => {
    if (!essay.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const promptText = (data.prompt && data.prompt.length) ? data.prompt.join(' ') : data.title;
      const res = await aiService.evaluateWritingEssay(promptText, essay, 'task1');
      setAiResult(res);
    } catch (err) {
      console.error('Builder AI Error:', err);
      setAiError(err.message || 'Không thể kết nối AI Examiner');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#fafaf7]">
      <div className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold hover:bg-[#FFFADD]"><ArrowLeft className="h-4 w-4" />Writing Builder</button>
          <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-[#1E3006]">{data.title}</span>
          <span className="inline-flex h-10 items-center rounded-xl border-2 border-black px-3 text-[14px] font-black">{countWords(essay)} <span className="ml-1 font-bold text-slate-500">/ 150 từ</span></span>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="self-start rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000] lg:sticky lg:top-[84px]">
          <div className="rounded-t-[14px] border-b-2 border-black bg-[#FFF4C2] px-5 py-3 text-[12px] font-black uppercase tracking-[0.2em] text-[#B45309]">Writing Task 1</div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-5 py-4">
            {data.prompt.length > 0 ? data.prompt.map((p, i) => <p key={i} className="mb-2 font-[family-name:var(--font-newsreader)] text-[17px] font-semibold leading-relaxed">{p}</p>)
              : <p className="font-[family-name:var(--font-newsreader)] text-[17px] font-semibold leading-relaxed">{data.title}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>}
            <p className="mt-2 text-[13px] font-semibold italic text-slate-500">Write at least 150 words.</p>
            {data.image && <img src={data.image} alt="Task 1 chart" className="mt-4 w-full rounded-xl border-2 border-black bg-white object-contain" />}
          </div>
        </section>
        <section className="min-w-0">
          {/* stepper */}
          <div className="mb-4 flex flex-wrap gap-2">
            {frame.map((f, i) => (
              <button key={i} type="button" onClick={() => { setStep(i); setAssembled(false); }}
                className={`flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-[13px] font-black transition-all ${!assembled && step === i ? 'border-black bg-black text-white shadow-[3px_3px_0_#B45309]' : 'border-black bg-white hover:bg-[#FFFADD]'}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${(parts[i] || '').trim() ? 'bg-[#6A8042] text-white' : 'bg-slate-200 text-slate-600'}`}>{(parts[i] || '').trim() ? <Check className="h-3 w-3" /> : i + 1}</span>
                {f.name}
              </button>
            ))}
            <button type="button" onClick={assemble} className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-3.5 py-2 text-[13px] font-black ${assembled ? 'bg-[#FFE787] shadow-[3px_3px_0_#000]' : 'bg-white hover:bg-[#FFFADD]'}`}>
              <Sparkles className="h-4 w-4 text-[#B45309]" />Ghép bài
            </button>
          </div>
          {!assembled ? (
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[22px] font-black text-[#1E3006]">{sec.name}</h2>
                <span className="text-[13px] font-bold text-slate-500">{countWords(parts[step] || '')} từ</span>
              </div>
              {TIPS[sec.name.split(' +')[0]] && <p className="mt-2 rounded-xl bg-[#FFFADD] px-4 py-2.5 text-[13.5px] leading-relaxed text-slate-700">💡 {TIPS[sec.name.split(' +')[0]]}</p>}
              <textarea value={parts[step] || ''} onChange={e => setParts(p => ({ ...p, [step]: e.target.value }))} spellCheck={false}
                placeholder={`Viết phần ${sec.name} tại đây…`}
                className="mt-4 min-h-[220px] w-full resize-y rounded-xl border-2 border-slate-200 bg-[#fffdf5] px-5 py-4 font-[family-name:var(--font-newsreader)] text-[18px] leading-[1.75] outline-none focus:border-black" />
              <button type="button" onClick={() => setShown(s => ({ ...s, [step]: !s[step] }))} className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-black text-[#B45309] hover:underline">
                {shown[step] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{shown[step] ? 'Ẩn đoạn mẫu' : 'Xem đoạn mẫu'}
              </button>
              {shown[step] && (
                <SelectToSave onSaveWord={onSaveWord} speechVoice={speechVoice} className="mt-3 rounded-xl border-2 border-dashed border-[#B45309] bg-[#FFF4C2]/50 px-4 py-3">
                  {sec.paragraphs.map((p, i) => <p key={i} className="mb-2 font-[family-name:var(--font-newsreader)] text-[17px] leading-relaxed last:mb-0">{p}</p>)}
                </SelectToSave>
              )}
              <div className="mt-5 flex justify-between gap-3">
                <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="rounded-xl border-2 border-black bg-white px-4 py-2 text-[14px] font-bold disabled:opacity-40">← Phần trước</button>
                {step < frame.length - 1
                  ? <button type="button" onClick={() => setStep(s => s + 1)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FFE787] px-4 py-2 text-[14px] font-black shadow-[3px_3px_0_#000]">Phần tiếp theo<ArrowRight className="h-4 w-4" /></button>
                  : <button type="button" onClick={assemble} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#6A8042] px-4 py-2 text-[14px] font-black text-white shadow-[3px_3px_0_#000]"><Sparkles className="h-4 w-4" />Ghép bài hoàn chỉnh</button>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Bài của bạn · {countWords(essay)} từ</p>
                  {essay && !aiResult && !aiLoading && (
                    <button
                      type="button"
                      onClick={handleAIEvaluate}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FFE787] px-3 py-1.5 text-[12.5px] font-black shadow-[2px_2px_0_#000] hover:-translate-y-px"
                    >
                      <Sparkles size={14} className="text-[#B45309]" /> AI Examiner Chấm Bài Ghép
                    </button>
                  )}
                </div>
                {essay ? <div className="mt-3 whitespace-pre-wrap font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.75]">{essay}</div>
                  : <p className="mt-2 text-slate-500">Bạn chưa viết phần nào — chọn một phần ở trên để bắt đầu.</p>}
              </div>

              {/* AI Evaluation for Builder */}
              {aiLoading && (
                <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-black bg-[#FFFDF5] p-6 shadow-[4px_4px_0_#000]">
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#4F46E5] border-t-transparent" />
                  <span className="font-quicksand text-sm font-extrabold text-[#4F46E5]">AI Examiner đang phân tích cấu trúc bài ghép và chấm điểm...</span>
                </div>
              )}

              {aiError && (
                <div className="flex items-center justify-between rounded-xl border-2 border-red-400 bg-red-50 p-3.5 text-[13px] font-bold text-red-700">
                  <span>{aiError}</span>
                  <button onClick={handleAIEvaluate} className="underline hover:opacity-80">Thử lại</button>
                </div>
              )}

              {aiResult && (
                <div className="rounded-2xl border-2 border-black bg-[#FFFDF5] p-5 shadow-[4px_4px_0_#000]">
                  <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3">
                    <Sparkles size={18} className="text-[#4F46E5]" />
                    <h3 className="font-quicksand text-[16px] font-black text-[#1E3006]">AI Examiner Nhận Xét Bài Ghép</h3>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="rounded-xl border-2 border-black bg-[#F8BE33] px-3.5 py-1.5 shadow-[2px_2px_0_#000]">
                      <span className="block text-[10px] font-black uppercase text-[#1E3006]">Estimated</span>
                      <span className="font-quicksand text-xl font-black text-[#1E3006]">Band {aiResult.bandScore || '6.5'}</span>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center">
                        <span className="block text-[9px] font-bold text-slate-500">Task Ach (TA)</span>
                        <span className="font-quicksand text-sm font-black text-[#1E3006]">{aiResult.taskResponse || '6.5'}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center">
                        <span className="block text-[9px] font-bold text-slate-500">Coherence (CC)</span>
                        <span className="font-quicksand text-sm font-black text-[#1E3006]">{aiResult.coherenceCohesion || '6.5'}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center">
                        <span className="block text-[9px] font-bold text-slate-500">Lexical (LR)</span>
                        <span className="font-quicksand text-sm font-black text-[#1E3006]">{aiResult.lexicalResource || '6.5'}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-center">
                        <span className="block text-[9px] font-bold text-slate-500">Grammar (GRA)</span>
                        <span className="font-quicksand text-sm font-black text-[#1E3006]">{aiResult.grammaticalRange || '6.0'}</span>
                      </div>
                    </div>
                  </div>

                  {aiResult.generalFeedback && (
                    <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-700">
                      💬 <strong className="font-bold text-[#1E3006]">Nhận xét:</strong> {aiResult.generalFeedback}
                    </p>
                  )}

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {aiResult.strengths?.length > 0 && (
                      <div className="rounded-xl border border-[#6A8042] bg-[#E3F5E8] p-3">
                        <span className="text-[10px] font-black uppercase text-[#18542A]">✓ Điểm mạnh</span>
                        <ul className="mt-1 space-y-1 text-xs font-medium text-slate-800">
                          {aiResult.strengths.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResult.improvements?.length > 0 && (
                      <div className="rounded-xl border border-[#B45309] bg-[#FFF4C2] p-3">
                        <span className="text-[10px] font-black uppercase text-[#B45309]">⚠ Cần cải thiện</span>
                        <ul className="mt-1 space-y-1 text-xs font-medium text-slate-800">
                          {aiResult.improvements.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.2em] text-[#B45309]">Bài mẫu · {countWords(model)} từ</p>
                <SelectToSave onSaveWord={onSaveWord} speechVoice={speechVoice}>
                  {frame.map((f, i) => (
                    <div key={i} className="mb-3">
                      <span className="mb-1 inline-block rounded-md bg-[#FFF4C2] px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-[#B45309]">{f.name}</span>
                      {f.paragraphs.map((p, j) => <p key={j} className="font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.75]">{p}</p>)}
                    </div>
                  ))}
                </SelectToSave>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
