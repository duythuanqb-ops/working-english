import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Languages, Loader2, PenLine, Search, X } from 'lucide-react';
import { SAMPLES, SAMPLE_READ_KEY, SAMPLE_TOPICS, SAMPLE_TOPIC_FALLBACK, SAMPLE_TOPIC_STYLE, SAMPLE_VIEW_KEY, loadSample, lsGet, lsSet,
  markSampleRead, paragraphLabels, paragraphsOf, stripVN } from './data';
import { ChipRail, FilterChip } from './ui';
import { SelectToSave } from './saveWord';

// /practice/writing/bai-mau — 150 Band 8.0 Task 2 samples grouped by 15 topics
export function SampleLibrary({ go, onOpen }) {
  const [topic, setTopic] = useState(null);
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const read = useMemo(() => new Set(lsGet(SAMPLE_READ_KEY, []) || []), []);

  const list = useMemo(() => {
    const n = stripVN(dq.trim());
    return SAMPLES.filter(s => (!topic || s.slug === topic) && (!n || stripVN(`${s.question} ${s.topicVi} ${s.topicEn}`).includes(n)));
  }, [topic, dq]);
  const groups = useMemo(() => {
    const m = new Map();
    for (const s of list) m.set(s.slug, [...(m.get(s.slug) ?? []), s]);
    return [...m.entries()];
  }, [list]);
  const readCount = SAMPLES.filter(s => read.has(s.id)).length;
  const filtered = topic !== null || q.trim() !== '';

  return (
    <div className="flex min-h-full flex-col bg-[#fafaf7]">
      <main className="mx-auto w-full max-w-[1200px] flex-grow px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] border-2 border-black bg-[#DDF7E8] px-5 py-5 shadow-[6px_6px_0_#000] sm:flex-row sm:items-center sm:px-7 sm:py-6">
          <div className="min-w-0 sm:pr-28">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#166534]">Sample 8.0 Writing</p>
            <h1 className="mt-1 text-[clamp(30px,4.6vw,48px)] font-black uppercase leading-none tracking-tighter text-black">Bài mẫu Band 8.0</h1>
            <p className="mt-2 max-w-[60ch] font-serif text-[15px] italic text-slate-700 sm:text-base">
              {SAMPLES.length} bài Task 2 theo {SAMPLE_TOPICS.length} chủ đề — đọc song ngữ Anh – Việt, xem bài chia đoạn ra sao, rồi luyện dịch lại chính bài đó.
            </p>
          </div>
          <span className="shrink-0 self-start rounded-xl border-2 border-black bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 sm:absolute sm:right-7 sm:top-1/2 sm:-translate-y-1/2" aria-label="Số bài đã đọc">
            <b className="mr-1 text-[20px] font-black text-[#166534]">{readCount}</b>/ {SAMPLES.length} đã đọc
          </span>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => go('home')} className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold text-black transition-colors hover:bg-[#FFFADD]">
            <ArrowLeft className="h-4 w-4" /> Luyện Writing
          </button>
          <label className="relative min-w-0 flex-1 sm:ml-auto sm:w-[clamp(220px,28vw,340px)] sm:flex-none">
            <span className="sr-only">Tìm bài mẫu</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo đề: university, pollution…"
              className="h-10 w-full rounded-xl border-2 border-black bg-white pl-9 pr-3 text-[14px] text-black placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#FFE787]" />
          </label>
        </div>

        <div className="mt-4">
          <ChipRail label="Chủ đề:">
            <FilterChip pressed={topic === null} onClick={() => setTopic(null)} color="#1F2A1A" icon="◈" label="Tất cả" count={SAMPLES.length} />
            {SAMPLE_TOPICS.map(t => {
              const st = SAMPLE_TOPIC_STYLE[t.slug] ?? SAMPLE_TOPIC_FALLBACK;
              return <FilterChip key={t.slug} pressed={topic === t.slug} onClick={() => setTopic(topic === t.slug ? null : t.slug)} color={st.color} icon={st.icon} label={t.vi} count={t.count} />;
            })}
          </ChipRail>
        </div>

        <div className="mt-4 flex min-h-[28px] flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-600" aria-live="polite">
          <span>Đang hiện <b className="text-black">{list.length}</b> / {SAMPLES.length} bài</span>
          {filtered && (
            <button type="button" onClick={() => { setTopic(null); setQ(''); }} className="inline-flex items-center gap-1 rounded-full border border-slate-400 px-2.5 py-0.5 font-bold text-slate-700 hover:border-black hover:text-black">
              <X className="h-3.5 w-3.5" /> Bỏ lọc
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-black bg-white px-6 py-10 text-center">
            <p className="font-bold text-slate-800">Không có bài nào khớp “{q.trim()}”.</p>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-9">
            {groups.map(([slug, items]) => {
              const st = SAMPLE_TOPIC_STYLE[slug] ?? SAMPLE_TOPIC_FALLBACK;
              return (
                <section key={slug}>
                  <h2 className="mb-3 flex items-baseline gap-2 text-[20px] font-black tracking-tight text-black">
                    <span aria-hidden="true">{st.icon}</span>{items[0].topicVi}<span className="text-[14px] font-bold text-slate-500">· {items[0].topicEn}</span>
                  </h2>
                  <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))]">
                    {items.map(s => (
                      <li key={s.id} className="min-w-0">
                        <button type="button" onClick={() => onOpen(s)}
                          className="group flex h-full w-full flex-col gap-3 rounded-2xl border-2 border-black bg-white p-4 text-left shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]">
                          <span className="flex w-full items-center gap-2 text-[12px] font-black uppercase tracking-wide">
                            <span className="rounded-md px-1.5 py-0.5 text-white" style={{ background: st.color }}>Bài {s.num}</span>
                            <span className="text-slate-500">{s.sentences} câu</span>
                            {read.has(s.id) && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#DDF7E8] px-2 py-0.5 text-[11px] text-[#166534]"><Check className="h-3 w-3" /> Đã đọc</span>}
                          </span>
                          <span className="line-clamp-4 font-[family-name:var(--font-newsreader)] text-[16.5px] leading-[1.5] text-slate-900 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{s.question}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// /practice/writing/bai-mau/<slug>/<num> — bilingual reader (port of the site's reader). Only the essays whose bodies
// exist offline (captured in the user's HAR) can be read; the others show the prompt + structure + writing practice.
const SERIF = 'font-[family-name:var(--font-newsreader)]';

function EmptyState({ title, body, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-10 text-center">
      <p className="font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-[14px] text-slate-600">{body}</p>
      {children}
    </div>
  );
}

export function SampleReader({ sample, onBack, onWrite, onOpen, onTranslate, onSaveWord, speechVoice }) {
  const st = SAMPLE_TOPIC_STYLE[sample.slug] ?? SAMPLE_TOPIC_FALLBACK;
  const [essay, setEssay] = useState(undefined); // undefined = loading, null = not offline
  const [view, setView] = useState(() => (lsGet(SAMPLE_VIEW_KEY, 'en') === 'both' ? 'both' : 'en'));
  const [open, setOpen] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let alive = true;
    setEssay(undefined); setOpen(null); setHover(null);
    (sample.hasBody ? loadSample(sample.id) : Promise.resolve(null)).then(e => {
      if (!alive) return;
      setEssay(e);
      if (e) markSampleRead(sample.id);
    });
    window.scrollTo?.({ top: 0 });
    return () => { alive = false; };
  }, [sample.id, sample.hasBody]);

  const idx = SAMPLES.findIndex(s => s.id === sample.id);
  const prev = idx > 0 && SAMPLES[idx - 1].slug === sample.slug ? SAMPLES[idx - 1] : null;
  const next = SAMPLES[idx + 1] ?? null;
  const nextIsTopic = next && next.slug !== sample.slug;

  useEffect(() => {
    const k = e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowLeft' && prev) onOpen(prev);
      else if (e.key === 'ArrowRight' && next) onOpen(next);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [prev, next, onOpen]);

  const sentences = essay?.sentences ?? [];
  const paras = useMemo(() => (essay ? paragraphsOf(sample.breaks, sentences) : []), [essay, sample.breaks, sentences]);
  const labels = paragraphLabels(paras.length);
  const words = sentences.reduce((n, s) => n + (s.answer.match(/[A-Za-z0-9'’-]+/g)?.length ?? 0), 0);
  const setV = v => { setOpen(null); setView(v); lsSet(SAMPLE_VIEW_KEY, v); };
  const hov = i => ({ onMouseEnter: () => setHover(i), onMouseLeave: () => setHover(h => (h === i ? null : h)) });
  // structure-only preview when the body is not offline
  const breaks = sample.breaks || [];
  const outline = breaks.length >= 3 ? paragraphLabels(breaks.length) : [];

  return (
    <div className="flex min-h-full flex-col bg-[#fafaf7]">
      <main className="mx-auto w-full max-w-[880px] flex-grow px-4 pb-20 pt-10 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 text-[14px] font-bold text-black transition-colors hover:bg-[#FFFADD]">
            <ArrowLeft className="h-4 w-4" /> Bài mẫu 8.0
          </button>
          <span className="inline-flex h-8 items-center rounded-full border-2 border-black bg-[#DDF7E8] px-3 text-[13px] font-bold text-[#166534]">{st.icon} {sample.topicVi}</span>
          <span className="text-[13px] font-semibold text-slate-500">Bài {sample.num}</span>
        </div>

        <section className="rounded-2xl border-2 border-black bg-[#FFFADD] px-5 py-4 shadow-[4px_4px_0_#000] sm:px-6">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#92400E]">Đề bài · Task 2</p>
          <p className={`${SERIF} mt-1.5 text-[18px] font-medium leading-[1.55] text-black sm:text-[19px]`}>{sample.question}</p>
        </section>

        {essay === undefined ? (
          <div className="flex items-center justify-center py-24 text-slate-500" role="status"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang mở bài mẫu…</div>
        ) : essay === null ? (
          <div className="mt-5">
            <EmptyState title="Bài mẫu này chưa có trong bản offline."
              body={`Bài gồm ${sample.sentences} câu${outline.length ? ` · ${outline.length} đoạn` : ''}. Bạn vẫn có thể luyện viết chính đề này rồi tự chấm theo band descriptors.`}>
              {outline.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {outline.map((l, i) => <span key={l} className="rounded-full border-2 border-black bg-[#FFFADD] px-3 py-1 text-[12.5px] font-bold">{l} · {(breaks[i + 1] ?? sample.sentences) - breaks[i]} câu</span>)}
                </div>
              )}
              <button type="button" onClick={() => onWrite(sample)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border-2 border-black bg-[#FFE787] px-5 text-[14px] font-extrabold shadow-[3px_3px_0_#000] hover:-translate-y-px">
                <PenLine className="h-4 w-4" /> Luyện viết đề này
              </button>
            </EmptyState>
          </div>
        ) : (
          <section aria-label="Bài viết">
            <div className="sticky top-0 z-20 -mx-4 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y-2 border-black bg-[#fafaf7]/95 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-xl sm:border-2">
              <div role="group" aria-label="Cách hiển thị" className="flex rounded-xl border-2 border-black bg-white p-0.5">
                {[['en', 'Tiếng Anh'], ['both', 'Song ngữ']].map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={view === k} onClick={() => setV(k)}
                    className="h-8 rounded-lg px-3.5 text-[13.5px] font-extrabold text-slate-700 transition-colors hover:not-aria-pressed:bg-[#FFFADD] aria-pressed:bg-black aria-pressed:text-white">{l}</button>
                ))}
              </div>
              <p className="text-[13px] font-semibold text-slate-600">{paras.length} đoạn · {words} từ · {sentences.length} câu</p>
              <p className="hidden text-[13px] text-slate-500 lg:ml-auto lg:block">{view === 'en' ? 'Bấm vào một câu để xem nghĩa tiếng Việt' : 'Trỏ vào một câu để thấy câu tương ứng'}</p>
            </div>
            {view === 'en' && <p className="mt-2 text-[13px] text-slate-500 lg:hidden">Chạm vào một câu để xem nghĩa tiếng Việt.</p>}
            <SelectToSave onSaveWord={onSaveWord} speechVoice={speechVoice}>
              <article lang="en" className="mt-5 rounded-2xl border-2 border-black bg-white px-5 py-6 shadow-[4px_4px_0_#000] sm:px-8 sm:py-8">
                {paras.map((p, pi) => (
                  <div key={pi} className={`grid gap-x-6 md:grid-cols-[88px_minmax(0,1fr)] ${pi ? 'mt-6' : ''}`}>
                    {labels[pi] ? <p className="mb-1.5 text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-400 md:mb-0 md:pt-[7px] md:text-right">{labels[pi]}</p> : <span className="hidden md:block" />}
                    <div className="min-w-0">
                      <p className={`${SERIF} text-[18.5px] leading-[1.75] text-slate-900 sm:text-[19.5px]`}>
                        {p.map(i => {
                          const hl = `rounded-[3px] transition-colors ${hover === i || open === i ? 'bg-[#FFE787]' : ''}`;
                          if (view === 'both') return <span key={i} className={hl} {...hov(i)}>{sentences[i].answer} </span>;
                          return (
                            <React.Fragment key={i}>
                              <span role="button" tabIndex={0} aria-expanded={open === i} onClick={() => setOpen(o => (o === i ? null : i))}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => (o === i ? null : i)); } }}
                                className={`${hl} cursor-pointer decoration-[#B45309]/40 decoration-dotted underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black`}>
                                {sentences[i].answer}{' '}
                              </span>
                              {open === i && (
                                <span lang="vi" className="my-2 block rounded-xl border-2 border-black bg-[#FFFADD] px-4 py-2.5 font-sans text-[15.5px] leading-[1.6] text-slate-800">
                                  <Languages className="mr-1.5 inline h-4 w-4 -translate-y-px text-[#B45309]" />{sentences[i].vi}
                                </span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </p>
                      {view === 'both' && (
                        <p lang="vi" className={`${SERIF} mt-2.5 border-l-4 border-[#7DE2AE] pl-4 text-[16.5px] italic leading-[1.7] text-slate-600`}>
                          {p.map(i => <span key={i} className={`rounded-[3px] transition-colors ${hover === i ? 'bg-[#FFE787] text-slate-900' : ''}`} {...hov(i)}>{sentences[i].vi} </span>)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </article>
            </SelectToSave>
          </section>
        )}

        <nav aria-label="Chuyển bài" className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:items-center">
          {prev ? (
            <button type="button" onClick={() => onOpen(prev)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-white px-4 text-[14px] font-bold text-black hover:bg-[#FFFADD]">
              <ArrowLeft className="h-4 w-4" /> Bài trước
            </button>
          ) : <span className="hidden sm:block" />}
          {essay && (
            <button type="button" onClick={() => onTranslate(sample, essay)}
              className="col-span-2 row-start-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#FFE787] px-4 text-[14px] font-extrabold text-black shadow-[3px_3px_0_#000] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[4px_4px_0_#000] sm:ml-auto">
              <PenLine className="h-4 w-4" /> Luyện dịch bài này (Việt → Anh)
            </button>
          )}
          {next && (
            <button type="button" onClick={() => onOpen(next)}
              className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-black px-4 text-[14px] font-bold text-white hover:bg-slate-800 ${prev ? '' : 'col-start-2'} ${essay ? '' : 'sm:ml-auto'}`}>
              {nextIsTopic ? `Sang: ${next.topicEn}` : 'Bài tiếp'} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </nav>
        <p className="mt-3 hidden text-center text-[12.5px] text-slate-500 sm:block">Phím ← → để chuyển bài</p>
      </main>
    </div>
  );
}
