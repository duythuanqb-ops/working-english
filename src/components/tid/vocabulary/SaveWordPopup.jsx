// Floating mini-dictionary used by the vocabulary & grammar areas: click a word -> look it up with the app's
// dictionaryService, play it, and save it to the app's vocab notebook (stands in for the site's /api/vocab-word).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkPlus, Check, Loader2, Volume2, X } from 'lucide-react';
import { dictionaryService } from '../../../services/dictionaryService';
import { ttsService } from '../../../services/ttsService';

/** Build the app's notebook word object from whatever we know locally (+ optional dictionary lookup). */
export function toNotebookWord({ word, ipa, pos, meaningVi, meaningEn, example, exampleVi, synonyms, antonyms, tags, context }, dict) {
  return {
    word: dict?.word || word,
    ipa: ipa || dict?.ipaUk || dict?.ipaUs || '',
    partOfSpeech: pos || dict?.partOfSpeech || 'noun',
    meaningVi: meaningVi || dict?.meaningVi || '',
    meaningEn: meaningEn || dict?.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '',
    examples: [
      ...(example ? [{ en: example, vi: exampleVi || '', context: context || 'IELTS Dictionary' }] : []),
      ...((dict?.bilingualExamples || []).slice(0, 2)),
    ],
    synonyms: synonyms || dict?.synonyms || [],
    antonyms: antonyms || dict?.antonyms || [],
    collocations: dict?.collocations || [],
    tags: tags || ['IELTS'],
  };
}

export default function SaveWordPopup({ word, anchor, context, tag = 'Grammar', onClose, onSaveWord, speechVoice = 'UK' }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pos, setPos] = useState({ left: anchor.x, top: anchor.bottom + 8 });
  const ref = useRef(null);

  useEffect(() => {
    let off = false;
    setData(null); setError(false); setSaved(false);
    dictionaryService.lookup(word).then(d => { if (!off) setData(d); }).catch(() => { if (!off) setError(true); });
    return () => { off = true; };
  }, [word]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const left = Math.min(Math.max(12, anchor.x - w / 2), window.innerWidth - w - 12);
    let top = anchor.bottom + 8;
    if (top + h > window.innerHeight - 12) top = Math.max(12, anchor.top - h - 8);
    setPos({ left, top });
  }, [anchor, data, error]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    const onDown = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => window.addEventListener('mousedown', onDown), 0);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown); clearTimeout(t); };
  }, [onClose]);

  const save = () => {
    if (saved || !onSaveWord) return;
    onSaveWord(toNotebookWord({ word, example: context, context: `IELTS ${tag}`, tags: ['IELTS', tag] }, data));
    setSaved(true);
  };

  return createPortal(
    <div ref={ref} role="dialog" className="tid-root fixed z-[1000] w-[300px] rounded-2xl border-2 border-[#111] bg-white p-4 text-[#1b1d22] shadow-[6px_6px_0_rgba(0,0,0,.15)]" style={{ left: pos.left, top: pos.top }}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[20px] font-extrabold leading-tight">{data?.word || word}</div>
          {(data?.ipaUk || data?.ipaUs) && <div className="text-[13px] font-semibold text-[#8a8672]">/{(data.ipaUk || data.ipaUs).replace(/\//g, '')}/</div>}
        </div>
        <button onClick={() => ttsService.speak(word, { voiceType: speechVoice })} aria-label="Phát âm" className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111] bg-[#f4f1e6]"><Volume2 size={16} /></button>
        <button onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#555] hover:bg-[#f4f1e6]"><X size={16} /></button>
      </div>
      <div className="mt-2 min-h-[40px] text-[14px] leading-[1.55] text-[#333]">
        {!data && !error && <span className="flex items-center gap-2 text-[#8a8672]"><Loader2 size={14} className="animate-spin" /> Đang tra từ…</span>}
        {error && <span className="text-[#8a8672]">Không tra được nghĩa — vẫn có thể lưu từ này.</span>}
        {data && (
          <>
            {data.partOfSpeech && <span className="mr-1.5 rounded-md bg-[#e8f0c9] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#5f6a45]">{data.partOfSpeech}</span>}
            <span className="font-semibold">{data.meaningVi}</span>
          </>
        )}
      </div>
      {onSaveWord && (
        <button onClick={save} disabled={saved} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#111] px-3 py-2 text-[13px] font-extrabold ${saved ? 'bg-[#e3f5e8] text-[#18542a]' : 'bg-[#ffc926] text-[#111] hover:-translate-y-0.5 transition-transform'}`}>
          {saved ? <><Check size={15} /> Đã lưu vào sổ từ vựng</> : <><BookmarkPlus size={15} /> Lưu vào sổ từ vựng</>}
        </button>
      )}
    </div>,
    document.body,
  );
}

const VI_CHARS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
/** True when a sentence is (very likely) English rather than Vietnamese. */
export const isEnglish = s => /[a-z]/i.test(s) && !VI_CHARS.test(s);

/**
 * Renders text with every English word clickable (Vietnamese sentences stay plain).
 * onWord(word, anchorRect, sentence)
 */
export function ClickableText({ text, onWord, className = '' }) {
  if (!onWord || !text) return <span className={className}>{text}</span>;
  // split into sentence-ish chunks so mixed VI/EN cells only make the English part clickable
  const chunks = String(text).split(/(?<=[.!?;])\s+/);
  return (
    <span className={className}>
      {chunks.map((chunk, ci) => (
        <React.Fragment key={ci}>
          {ci > 0 && ' '}
          {isEnglish(chunk)
            ? chunk.split(/([A-Za-z][A-Za-z'’-]*)/).map((tok, i) => (i % 2 === 1
              ? (
                <span
                  key={i}
                  role="button"
                  tabIndex={-1}
                  onClick={e => { e.stopPropagation(); onWord(tok.replace(/[’']s$/, ''), e.currentTarget.getBoundingClientRect(), chunk); }}
                  className="cursor-pointer rounded-[3px] transition-colors hover:bg-[#ffe066]"
                >{tok}</span>
              )
              : <React.Fragment key={i}>{tok}</React.Fragment>))
            : chunk}
        </React.Fragment>
      ))}
    </span>
  );
}
