// Small floating dictionary card: look up a word/phrase, play it, save it to the app's vocab notebook.
// (Stands in for the site's vocab popup which calls /api/vocab-word; here we use the app's dictionaryService.)
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkPlus, Check, Volume2, X } from 'lucide-react';
import { dictionaryService } from '../../../services/dictionaryService';
import { ttsService } from '../../../services/ttsService';

export default function WordPopup({ word, anchor, context, onClose, onSaveWord, speechVoice = 'US' }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pos, setPos] = useState({ left: anchor.x, top: anchor.bottom + 8 });
  const ref = useRef(null);

  useEffect(() => {
    let off = false;
    dictionaryService.lookup(word).then(d => { if (!off) setData(d); }).catch(() => { if (!off) setError(true); });
    return () => { off = true; };
  }, [word]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = Math.min(Math.max(12, anchor.x - w / 2), window.innerWidth - w - 12);
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
    if (!data || saved || !onSaveWord) return;
    onSaveWord({
      word: data.word,
      ipa: data.ipaUs || data.ipaUk || '',
      partOfSpeech: data.partOfSpeech || 'noun',
      meaningVi: data.meaningVi,
      meaningEn: data.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '',
      examples: context ? [{ en: context, vi: '', context: 'IELTS Listening' }, ...(data.bilingualExamples || [])] : data.bilingualExamples || [],
      synonyms: data.synonyms || [],
      antonyms: data.antonyms || [],
      collocations: data.collocations || [],
      tags: ['IELTS', 'Listening'],
    });
    setSaved(true);
  };

  return createPortal(
    <div ref={ref} role="dialog" className="tid-root fixed z-[1000] w-[300px] rounded-2xl border border-slate-200 bg-white p-4 text-[#1d211a] shadow-[0_18px_40px_rgba(20,40,80,.22)]" style={{ left: pos.left, top: pos.top }}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-bold">{word}</p>
          {data && <p className="font-mono text-[13px] text-slate-500">{speechVoice === 'UK' ? data.ipaUk : data.ipaUs}</p>}
        </div>
        <button type="button" onClick={() => ttsService.speak(word, { voiceType: speechVoice })} aria-label="Nghe" className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 hover:bg-emerald-50"><Volume2 className="h-4 w-4" /></button>
        <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-2 min-h-[40px] border-t border-slate-100 pt-2 text-[14.5px] leading-relaxed">
        {error ? <p className="text-amber-700">Chưa tra được từ này.</p>
          : !data ? <p className="flex items-center gap-2 text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />Đang tra...</p>
            : <p><span className="mr-1 text-[12px] font-semibold uppercase text-slate-400">{data.partOfSpeech}</span>{data.meaningVi}</p>}
      </div>
      {onSaveWord && (
        <button type="button" disabled={!data || saved} onClick={save} className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white transition-colors ${saved ? 'bg-emerald-600' : 'bg-[#2e6b3f] hover:bg-[#255833] disabled:opacity-50'}`}>
          {saved ? <><Check className="h-4 w-4" />Đã lưu vào sổ</> : <><BookmarkPlus className="h-4 w-4" />Lưu vào sổ từ vựng</>}
        </button>
      )}
    </div>,
    document.body,
  );
}
