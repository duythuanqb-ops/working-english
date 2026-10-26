import React, { useCallback, useEffect, useState } from 'react';
import './writing.css';
import WritingHome from './WritingHome';
import WritingLibrary from './WritingLibrary';
import WritingEditor from './WritingEditor';
import { BuilderLibrary, BuilderWorkspace } from './WritingBuilder';
import { SampleLibrary, SampleReader } from './SampleLibrary';
import { BandEssays, TranslationHub } from './TranslationHub';
import DichCauPlayer from './DichCauPlayer';
import { DICHCAU, SAMPLES, loadDichCau, loadSample } from './data';

// /practice/writing area. Sub-pages are kept on a small history stack (the app has no router):
//   home → tests → editor | builder → builderWork
//        → samples → sample → translate (essay Việt → Anh)
//        → translation (?step) → dichcau | band8/band9 → editor | translate
const Loading = () => <div className="p-20 text-center font-bold text-slate-400">Đang tải…</div>;

// Band-8 essay → exercise shape of the Dịch câu player
const essayExercise = (sample, essay) => ({
  exerciseId: `band8_${sample.id}`,
  title: `${sample.topicEn} · Bài ${sample.num}`,
  band: 'Band 8',
  topic: { en: essay.question, question: 'Dịch từng câu tiếng Việt sang tiếng Anh. Nhấn vào từ để xem gợi ý.', taskType: `Band 8 – ${sample.topicVi}` },
  sentences: essay.sentences.map(s => ({ vi: s.vi, hint: '', answer: s.answer })),
});

// Band-8 sample → test object for the writing editor
const sampleTest = s => ({ id: s.id, task: 2, title: s.question, prompt: s.question, image: null, type: null, topic: null, fromSample: true });

function useLoaded(loader, id) {
  const [state, setState] = useState({ id: null, data: null });
  useEffect(() => {
    let alive = true;
    loader(id).then(d => alive && setState({ id, data: d }));
    return () => { alive = false; };
  }, [loader, id]);
  return state.id === id ? state.data : undefined;
}

function DichCauRoute({ id, onBack, onNext, onSaveWord, speechVoice }) {
  const data = useLoaded(loadDichCau, id);
  if (data === undefined) return <Loading />;
  if (!data) return <div className="p-20 text-center font-bold text-slate-500">Bài này chưa có trong dữ liệu offline.</div>;
  const list = DICHCAU.filter(e => e.band === data.band && !e.locked).sort((a, b) => a.order - b.order);
  const next = list[list.findIndex(e => e.id === id) + 1];
  return <DichCauPlayer key={id} exercise={data} onBack={onBack} onSaveWord={onSaveWord} speechVoice={speechVoice}
    onNext={next ? () => onNext(next.id) : null} nextLabel={next ? `Bài tiếp: ${next.title}` : undefined} />;
}

function EssayTranslateRoute({ sample, onBack, onNext, onSaveWord, speechVoice }) {
  const essay = useLoaded(loadSample, sample.id);
  if (essay === undefined) return <Loading />;
  if (!essay) return <div className="p-20 text-center font-bold text-slate-500">Bài mẫu này chưa có trong dữ liệu offline.</div>;
  const next = SAMPLES.slice(SAMPLES.findIndex(s => s.id === sample.id) + 1).find(s => s.hasBody);
  return <DichCauPlayer key={sample.id} exercise={essayExercise(sample, essay)} onBack={onBack} onSaveWord={onSaveWord} speechVoice={speechVoice}
    onNext={next ? () => onNext(next) : null} nextLabel={next ? `Bài tiếp: ${next.topicEn} · Bài ${next.num}` : undefined} />;
}

export default function WritingHub({ onBack, onSaveWord, speechVoice }) {
  const [stack, setStack] = useState([{ name: 'home' }]);
  const page = stack[stack.length - 1];
  const push = useCallback(p => setStack(s => [...s, p]), []);
  const replace = useCallback(p => setStack(s => [...s.slice(0, -1), p]), []);
  const pop = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  // go(name) from a top-level page: jump to that section (home resets the stack)
  const go = useCallback(name => {
    if (name === 'home') setStack([{ name: 'home' }]);
    else if (name === 'band8' || name === 'band9') push({ name: 'band', band: Number(name.slice(4)) });
    else push({ name, step: null });
  }, [push]);

  // scroll the module container back to the top on every page change
  useEffect(() => {
    document.querySelector('.tid-root')?.scrollTo?.({ top: 0 });
  }, [page]);

  const common = { onSaveWord, speechVoice };
  switch (page.name) {
    case 'tests':
      return <WritingLibrary go={go} onOpenTest={t => push({ name: 'editor', test: t })} />;
    case 'editor':
      return <WritingEditor key={page.test.id} test={page.test} onBack={pop} go={go} {...common} />;
    case 'builder':
      return <BuilderLibrary go={name => (name === 'tests' ? pop() : go(name))} onOpen={item => push({ name: 'builderWork', item })} />;
    case 'builderWork':
      return <BuilderWorkspace key={page.item.id} item={page.item} onBack={pop} {...common} />;
    case 'samples':
      return <SampleLibrary go={go} onOpen={s => push({ name: 'sample', sample: s })} />;
    case 'sample':
      return <SampleReader sample={page.sample} onBack={pop} onOpen={s => replace({ name: 'sample', sample: s })}
        onWrite={s => push({ name: 'editor', test: sampleTest(s) })} onTranslate={s => push({ name: 'translate', sample: s })} {...common} />;
    case 'translate':
      return <EssayTranslateRoute sample={page.sample} onBack={pop} onNext={s => replace({ name: 'translate', sample: s })} {...common} />;
    case 'translation':
      return <TranslationHub go={go} step={page.step} setStep={step => replace({ name: 'translation', step })}
        onOpenExercise={id => push({ name: 'dichcau', id })} />;
    case 'dichcau':
      return <DichCauRoute id={page.id} onBack={pop} onNext={id => replace({ name: 'dichcau', id })} {...common} />;
    case 'band':
      return <BandEssays band={page.band} onBack={pop} onWrite={s => push({ name: 'editor', test: sampleTest(s) })}
        onTranslate={s => push({ name: 'translate', sample: s })} />;
    default:
      return <WritingHome onBack={onBack} go={go} />;
  }
}
