import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookmarkPlus, Check, Loader2, Volume2 } from 'lucide-react';
import { dictionaryService } from '../../../services/dictionaryService';
import { ttsService } from '../../../services/ttsService';

// Look the word up (app dictionary service) and push it into the app's vocab notebook.
export async function saveToNotebook(onSaveWord, word, example = '') {
  if (!onSaveWord || !word) return false;
  let info = null;
  try { info = await dictionaryService.lookup(word); } catch { /* offline / not found */ }
  onSaveWord({
    word: info?.word || word,
    ipa: info?.ipaUs || info?.ipaUk || info?.ipa || '',
    partOfSpeech: info?.partOfSpeech || (word.includes(' ') ? 'phrase' : 'noun'),
    meaningVi: info?.meaningVi || '',
    meaningEn: info?.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '',
    examples: example ? [{ en: example, vi: '' }] : (info?.bilingualExamples || []),
    synonyms: info?.synonyms || [],
    collocations: word.includes(' ') ? [word] : (info?.collocations || []),
    tags: ['IELTS', 'Writing'],
  });
  return true;
}

// Sentence of `text` that contains `word` (used as the saved example)
export const exampleFor = (text, word) => {
  const sents = (text || '').split(/(?<=[.!?])\s+/);
  return sents.find(s => s.toLowerCase().includes(word.toLowerCase())) || '';
};

// Button that saves a word/collocation (site: notebook "save word" button)
export function SaveWordButton({ word, example, onSaveWord, speechVoice, className = '' }) {
  const [state, setState] = useState('idle');
  useEffect(() => setState('idle'), [word]);
  const save = async () => {
    setState('busy');
    const ok = await saveToNotebook(onSaveWord, word, example);
    setState(ok ? 'done' : 'idle');
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" onClick={() => ttsService.speak(word, { voiceType: speechVoice || 'US' })} title="Nghe"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><Volume2 size={14} /></button>
      <button type="button" disabled={state !== 'idle' || !onSaveWord} onClick={save}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-colors ${state === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#6A8042] text-white hover:bg-[#5a6d37]'} disabled:cursor-default`}>
        {state === 'busy' ? <Loader2 size={13} className="animate-spin" /> : state === 'done' ? <Check size={13} /> : <BookmarkPlus size={13} />}
        {state === 'done' ? 'Đã lưu vào sổ' : 'Lưu vào sổ từ vựng'}
      </button>
    </div>
  );
}

// Wrap a block of English text: selecting 1–5 words shows a floating "save" pill.
export function SelectToSave({ children, onSaveWord, speechVoice, className = '' }) {
  const ref = useRef(null);
  const [sel, setSel] = useState(null);
  const onUp = useCallback(e => {
    if (e.target.closest?.('[data-save-pop]')) return;
    const s = window.getSelection();
    const text = s?.toString().trim().replace(/\s+/g, ' ');
    if (!text || !ref.current || !ref.current.contains(s.anchorNode) || text.split(' ').length > 5 || !/[a-z]/i.test(text)) { setSel(null); return; }
    const r = s.getRangeAt(0).getBoundingClientRect();
    const box = ref.current.getBoundingClientRect();
    const word = text.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
    setSel({ word, x: r.left - box.left + r.width / 2, y: r.top - box.top, example: exampleFor(ref.current.innerText, word) });
  }, []);
  return (
    <div ref={ref} onMouseUp={onUp} className={`relative ${className}`}>
      {children}
      {sel && (
        <div data-save-pop className="absolute z-30 -translate-x-1/2 -translate-y-full rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl" style={{ left: sel.x, top: sel.y - 8 }}>
          <p className="mb-2 text-center text-sm font-black text-slate-700">“{sel.word}”</p>
          <SaveWordButton word={sel.word} example={sel.example} onSaveWord={onSaveWord} speechVoice={speechVoice} />
        </div>
      )}
    </div>
  );
}
