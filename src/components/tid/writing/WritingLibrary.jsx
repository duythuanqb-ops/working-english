import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, Sparkles, X } from 'lucide-react';
import { CHART_TYPES, QUESTION_TYPES, TASK2_TOPICS, TESTS, TOPIC_BY_KEY, TYPE_BY_KEY, getHistory, lsGet, lsSet, stripVN } from './data';
import { ChipRail, FilterChip } from './ui';

const TASK_KEY = 'tid_writing_library_task';
const DARK = '#1E3006';
const PAGE = 24;

// Search haystack, same composition as the site
const ITEMS = TESTS.map(t => ({
  ...t,
  haystack: stripVN([t.id, t.title, t.prompt, TYPE_BY_KEY[t.type]?.label ?? '', TOPIC_BY_KEY[t.topic]?.label ?? ''].join(' ')),
}));

function TestCard({ item, status, onOpen }) {
  const type = TYPE_BY_KEY[item.type];
  const topic = item.task === 2 ? TOPIC_BY_KEY[item.topic] : null;
  const t1 = item.task === 1;
  return (
    <div style={{ '--type': type?.color ?? DARK }}
      className="group relative flex min-h-[176px] min-w-0 overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]">
      <span className={`relative w-[35%] shrink-0 overflow-hidden border-r-2 border-black ${t1 ? 'bg-[#fafaf7]' : 'bg-[#FFFADD]'}`}>
        {item.image ? (
          <img src={item.image} alt="" loading="lazy"
            className={`absolute inset-0 h-full w-full ${t1 ? 'object-contain p-2.5 mix-blend-multiply opacity-90 transition-opacity group-hover:opacity-100' : 'object-cover transition-transform duration-300 group-hover:scale-[1.03]'}`} />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--type)_22%,transparent)_0_24%,transparent_25%),radial-gradient(circle_at_15%_90%,color-mix(in_srgb,var(--type)_16%,transparent)_0_30%,transparent_31%)]">
            <span aria-hidden="true" className="text-[48px] font-black leading-none text-[var(--type)]">{type?.icon ?? '✎'}</span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Task {item.task}</span>
          </span>
        )}
        {type && (
          <span title={type.label} className="absolute left-0 top-0 max-w-[92%] truncate rounded-br-lg border-b-2 border-r-2 border-black bg-[var(--type)] px-2.5 py-1 text-[11px] font-bold text-white">
            {type.short ?? type.label}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5 sm:px-5 sm:py-4">
        <button type="button" onClick={() => onOpen(item)} className="text-left after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none">
          <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-[#1E3006] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-2">{item.title}</span>
        </button>
        <span className="line-clamp-3 text-[13px] leading-relaxed text-slate-600">{item.prompt}</span>
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {topic && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11.5px] font-bold text-slate-700">
              <span aria-hidden="true">{topic.icon}</span>{topic.label}
            </span>
          )}
          {!status && <span className="rounded-full border border-dashed border-slate-400 px-2 py-0.5 text-[11.5px] font-bold text-slate-500">Chưa làm</span>}
          {status && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full border border-black bg-[#6A8042] px-2 py-0.5 text-[11.5px] font-bold text-white">
                <span aria-hidden="true">✓</span> Đã viết · {status.n} lần
              </span>
              {status.band != null && (
                <span title="Band tự chấm gần nhất" className="rounded-full border border-black bg-[#FFE787] px-2 py-0.5 text-[11.5px] font-black text-[#1E3006]">Band {Number(status.band).toFixed(1)}</span>
              )}
            </>
          )}
        </span>
      </span>
    </div>
  );
}

export default function WritingLibrary({ go, onOpenTest }) {
  const [task, setTask] = useState(() => (lsGet(TASK_KEY) === 2 ? 2 : 1));
  const [chart, setChart] = useState(null);
  const [qtype, setQtype] = useState(null);
  const [topic, setTopic] = useState(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const history = useMemo(() => getHistory(), []);

  const pickTask = t => { setTask(t); setLimit(PAGE); lsSet(TASK_KEY, t); };

  const view = useMemo(() => {
    const needle = stripVN(q.trim().replace(/\s+/g, ' '));
    const done = it => !!history[it.id];
    const pool = ITEMS.filter(it => (status === 'all' || (status === 'done' ? done(it) : !done(it))) && (!needle || it.haystack.includes(needle)));
    const t1 = pool.filter(it => it.task === 1);
    const t2 = pool.filter(it => it.task === 2);
    const countBy = (arr, f) => arr.reduce((m, it) => { const k = f(it); if (k) m[k] = (m[k] ?? 0) + 1; return m; }, {});
    if (task === 1) {
      return { t1: t1.length, t2: t2.length, typeAll: t1.length, typeCounts: countBy(t1, it => it.type), list: chart ? t1.filter(it => it.type === chart) : t1 };
    }
    const byTopic = topic ? t2.filter(it => it.topic === topic) : t2;
    const byType = qtype ? t2.filter(it => it.type === qtype) : t2;
    return {
      t1: t1.length, t2: t2.length,
      typeAll: byTopic.length, typeCounts: countBy(byTopic, it => it.type),
      topicAll: byType.length, topicCounts: countBy(byType, it => it.topic),
      list: qtype ? byTopic.filter(it => it.type === qtype) : byTopic,
    };
  }, [q, status, task, chart, qtype, topic, history]);

  const practiced = ITEMS.filter(it => history[it.id]).length;
  const filtered = (task === 1 ? chart !== null : qtype !== null || topic !== null) || status !== 'all' || q.trim() !== '';
  const clear = () => { if (task === 1) setChart(null); else { setQtype(null); setTopic(null); } setStatus('all'); setQ(''); setLimit(PAGE); };
  const shown = view.list.slice(0, limit);
  const rest = view.list.length - shown.length;

  return (
    <div className="flex min-h-full flex-col bg-[#fafaf7]">
      <main className="mx-auto w-full max-w-[1360px] flex-grow px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 rounded-[20px] border-2 border-black bg-[#FFE4EA] px-5 py-5 shadow-[6px_6px_0_#000] sm:flex-row sm:items-center sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#9F1239]">Thư viện đề</p>
            <h1 className="mt-1 text-[clamp(34px,5vw,52px)] font-black uppercase leading-none tracking-tighter text-black">Writing</h1>
            <p className="mt-2 font-serif text-[15px] italic text-slate-700 sm:text-base">{ITEMS.length} đề · Task 1 theo dạng biểu đồ, Task 2 theo dạng đề</p>
          </div>
          <div className="flex shrink-0 gap-2 sm:ml-auto" aria-label="Tiến độ của bạn">
            <span className="rounded-xl border-2 border-black bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700"><b className="mr-1 text-[20px] font-black text-[#3F5A1F]">{practiced}</b>đã luyện</span>
            <span className="rounded-xl border-2 border-black bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700"><b className="mr-1 text-[20px] font-black text-black">{ITEMS.length - practiced}</b>chưa làm</span>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <div className="flex items-center justify-between gap-3 lg:contents">
            <button type="button" onClick={() => go('home')} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold text-black transition-colors hover:bg-[#FFFADD]">
              <ArrowLeft className="h-4 w-4" />Luyện Writing
            </button>
            <button type="button" onClick={() => go('builder')} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border-2 border-black bg-[#FFE787] px-3.5 text-[14px] font-bold text-black shadow-[3px_3px_0_#000] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[4px_4px_0_#000] lg:order-last">
              <Sparkles className="h-4 w-4 text-[#B45309]" />Writing Builder
            </button>
          </div>
          <div role="group" aria-label="Chọn Task" className="flex shrink-0 rounded-xl border-2 border-black bg-white p-1 lg:w-auto">
            {[1, 2].map(t => (
              <button key={t} type="button" aria-pressed={task === t} onClick={() => pickTask(t)}
                className="h-9 flex-1 whitespace-nowrap rounded-lg px-4 text-[14px] font-extrabold text-slate-700 transition-colors hover:not-aria-pressed:bg-[#FFFADD] aria-pressed:bg-black aria-pressed:text-white lg:flex-none">
                Task {t}<span className="font-bold opacity-75"> · {t === 1 ? view.t1 : view.t2}</span>
              </button>
            ))}
          </div>
          <div className="flex min-w-0 items-center gap-3 lg:contents">
            <select value={status} onChange={e => { setStatus(e.target.value); setLimit(PAGE); }} aria-label="Lọc theo trạng thái"
              className="h-10 shrink-0 cursor-pointer rounded-xl border-2 border-black bg-white pl-3 pr-8 text-[14px] font-bold text-black">
              <option value="all">Tất cả đề</option>
              <option value="todo">Chưa làm</option>
              <option value="done">Đã luyện</option>
            </select>
            <label className="relative min-w-0 flex-1 lg:ml-auto lg:w-[clamp(200px,22vw,300px)] lg:flex-none">
              <span className="sr-only">Tìm đề</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Tìm đề: chủ đề, từ khoá…"
                className="h-10 w-full rounded-xl border-2 border-black bg-white pl-9 pr-3 text-[14px] text-black placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#FFE787]" />
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {task === 1 ? (
            <ChipRail label="Loại biểu đồ:">
              <FilterChip pressed={chart === null} onClick={() => { setChart(null); setLimit(PAGE); }} color={DARK} icon="◈" label="Tất cả" count={view.typeAll} />
              {CHART_TYPES.map(t => {
                const n = view.typeCounts[t.key] ?? 0;
                return n || chart === t.key ? (
                  <FilterChip key={t.key} pressed={chart === t.key} onClick={() => { setChart(chart === t.key ? null : t.key); setLimit(PAGE); }} color={t.color} icon={t.icon} label={t.label} count={n} />
                ) : null;
              })}
            </ChipRail>
          ) : (
            <>
              <ChipRail label="Dạng bài:">
                <FilterChip pressed={qtype === null} onClick={() => { setQtype(null); setLimit(PAGE); }} color={DARK} icon="◈" label="Tất cả" count={view.typeAll} />
                {QUESTION_TYPES.map(t => {
                  const n = view.typeCounts[t.key] ?? 0;
                  return n || qtype === t.key ? (
                    <FilterChip key={t.key} pressed={qtype === t.key} onClick={() => { setQtype(qtype === t.key ? null : t.key); setLimit(PAGE); }} color={t.color} icon={t.icon} label={t.label} count={n} />
                  ) : null;
                })}
              </ChipRail>
              <ChipRail label="Chủ đề:">
                <FilterChip pressed={topic === null} onClick={() => { setTopic(null); setLimit(PAGE); }} color={DARK} icon="◈" label="Tất cả" count={view.topicAll} />
                {TASK2_TOPICS.map(t => {
                  const n = view.topicCounts[t.key] ?? 0;
                  return n || topic === t.key ? (
                    <FilterChip key={t.key} pressed={topic === t.key} onClick={() => { setTopic(topic === t.key ? null : t.key); setLimit(PAGE); }} color="#4F6131" icon={t.icon} label={t.label} count={n} />
                  ) : null;
                })}
              </ChipRail>
            </>
          )}
        </div>

        <div className="mt-4 flex min-h-[28px] flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-600" aria-live="polite">
          <span>{view.list.length === 0 ? 'Không có đề nào' : <>Đang hiện <b className="text-black">{shown.length}</b> / {view.list.length} đề Task {task}</>}</span>
          {filtered && (
            <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-full border border-slate-400 px-2.5 py-0.5 font-bold text-slate-700 hover:border-black hover:text-black">
              <X className="h-3.5 w-3.5" />Xoá bộ lọc
            </button>
          )}
        </div>

        <div className="mt-3 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))]">
          {view.list.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-black bg-white px-6 py-10 text-center">
              <p className="font-bold text-slate-800">Không có đề khớp bộ lọc.</p>
              {filtered && <button type="button" onClick={clear} className="mt-4 rounded-xl border-2 border-black bg-white px-4 py-2 text-[14px] font-bold shadow-[3px_3px_0_#000] hover:bg-[#FFFADD]">Xoá bộ lọc</button>}
            </div>
          ) : shown.map(it => <TestCard key={it.id} item={it} status={history[it.id] ?? null} onOpen={onOpenTest} />)}
        </div>

        {rest > 0 && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={() => setLimit(l => l + PAGE)}
              className="rounded-xl border-2 border-black bg-white px-5 py-2.5 text-[14px] font-extrabold text-black shadow-[4px_4px_0_#000] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[5px_5px_0_#000]">
              Xem thêm {Math.min(PAGE, rest)} đề · còn {rest}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
