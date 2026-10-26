// /practice/reading/<testId>?mode=practice|exam[&passage=n][&focus=gap] — the Reading test player.
// Two skins like the site: "practice" = TID desk skin (kk-exam-root), "exam" = computer-delivered IELTS skin (ielts-exam-root).
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Maximize2, Minimize2, Menu, Wifi, Bell, X, Loader2, Send, ChevronLeft, ChevronRight,
  Highlighter, Eraser, Underline, BookmarkPlus, Languages,
} from 'lucide-react';
import { asset } from '../shared';
import { dictionaryService } from '../../../services/dictionaryService';
import { ttsService } from '../../../services/ttsService';
import { loadPassage, passageIdsOf, GAP_BY_ID, saveProgress, readingBand, INDEX_BY_ID, qTypeLabel, recordTypeStats } from './readingData';
import { QCtx, QuestionSet, buildSets, isQCorrect } from './questions';

const KK = { ink: '#1a1a12', amber: '#e8b13a', green: '#5a7a3a', moss: '#a8c05f', desk: '#6f9552', cream: '#faf7ee', shadow: '0 4px 0 rgba(0,0,0,0.15)', ui: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" };
const KK_DESK = { backgroundColor: KK.desk, backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.18) 1px,transparent 1px)', backgroundSize: '20px 20px' };
const KK_PAPERS = ['#ffffff', '#faf7ee', '#f2ead8', '#fdf6e3', '#eef3e2'];
const kkCard = bg => ({ background: bg, border: `3px solid ${KK.ink}`, borderRadius: 18, boxShadow: KK.shadow });
const FONTS = [
  { name: 'Source Serif', stack: "'Source Serif 4', ui-serif, Georgia, Cambria, serif" },
  { name: 'Lora', stack: "'Lora', Georgia, serif" },
  { name: 'Merriweather', stack: "'Merriweather', Georgia, serif" },
  { name: 'Fraunces', stack: "'Fraunces', Georgia, serif" },
  { name: 'EB Garamond', stack: "'EB Garamond', Georgia, serif" },
  { name: 'Newsreader', stack: "'Newsreader', Georgia, serif" },
  { name: 'Spectral', stack: "'Spectral', Georgia, serif" },
  { name: 'IBM Plex Serif', stack: "'IBM Plex Serif', Georgia, serif" },
  { name: 'Bitter', stack: "'Bitter', Georgia, serif" },
  { name: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { name: 'Space Grotesk', stack: "'Space Grotesk', system-ui, sans-serif" },
  { name: 'Inter (sans)', stack: "'Inter', system-ui, sans-serif" },
  { name: 'Source Sans (sans)', stack: "'Source Sans 3', system-ui, sans-serif" },
  { name: 'JetBrains Mono', stack: "'JetBrains Mono', ui-monospace, monospace" },
];
const ARIAL = { name: 'Arial (như thi thật)', stack: 'Arial, Helvetica, sans-serif' };
const HL_COLORS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
const PREF_KEY = 'tid_reading_paper_pref';

function loadPref() { try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch { return {}; } }
function savePref(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ } }

// Marks the standfirst paragraph (italic lead) like the site does.
function markStandfirst(html) {
  const re = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const inner = m[2];
    const text = inner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!text) continue;
    const words = text.split(/\s+/).length;
    if (words > 120 || words < 3) break;
    const onlyItalic = /^\s*<(i|em)>[\s\S]*<\/(i|em)>\s*$/i.test(inner);
    if (!onlyItalic) return html;
    const open = m[0].slice(0, m[0].indexOf('>') + 1);
    const tagged = /\sclass\s*=\s*"/i.test(open) ? open.replace(/(\sclass\s*=\s*")/i, '$1tid-standfirst ') : open.replace(/^<p/i, '<p class="tid-standfirst"');
    return html.slice(0, m.index) + tagged + html.slice(m.index + open.length);
  }
  return html;
}

// ----- DOM helpers for highlighting / evidence -----
function textNodesIn(root) {
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) out.push(n);
  return out;
}
function wrapRange(range, make) {
  const nodes = textNodesIn(range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer)
    .filter(n => range.intersectsNode(n));
  const wrapped = [];
  for (const n of nodes) {
    let s = n === range.startContainer ? range.startOffset : 0;
    let e = n === range.endContainer ? range.endOffset : n.length;
    if (e <= s || !n.textContent.slice(s, e).trim()) continue;
    let node = n;
    if (s > 0) node = node.splitText(s);
    if (e - s < node.length) node.splitText(e - s);
    const el = make();
    node.parentNode.insertBefore(el, node);
    el.appendChild(node);
    wrapped.push(el);
  }
  return wrapped;
}
function unwrap(el) {
  const p = el.parentNode;
  if (!p) return;
  while (el.firstChild) p.insertBefore(el.firstChild, el);
  p.removeChild(el);
  p.normalize();
}
const normCh = c => (c === '’' || c === '‘' ? "'" : c === '“' || c === '”' ? '"' : c === '–' || c === '—' ? '-' : c.toLowerCase());
function findEvidence(root, quote) {
  const nodes = textNodesIn(root);
  let flat = '', map = [];
  nodes.forEach((n, ni) => {
    const t = n.textContent;
    for (let i = 0; i < t.length; i++) {
      const c = /\s/.test(t[i]) ? ' ' : normCh(t[i]);
      if (c === ' ' && flat.endsWith(' ')) continue;
      flat += c; map.push([ni, i]);
    }
  });
  const q = quote.split('').map(c => (/\s/.test(c) ? ' ' : normCh(c))).join('').replace(/\s+/g, ' ').replace(/^[\s.,;:…"']+|[\s.,;:…"']+$/g, '');
  if (q.length < 8) return null;
  let idx = flat.indexOf(q);
  if (idx < 0) {
    // try the longest fragment around an ellipsis
    const frag = q.split(/…|\.\.\./).map(s => s.trim()).sort((a, b) => b.length - a.length)[0];
    if (!frag || frag.length < 12) return null;
    idx = flat.indexOf(frag);
    if (idx < 0) return null;
    return { nodes, start: map[idx], end: map[idx + frag.length - 1] };
  }
  return { nodes, start: map[idx], end: map[idx + q.length - 1] };
}

// ----- passage pane (memoised; DOM is mutated for highlights) -----
const PassagePane = memo(function PassagePane({ html, cd, paneRef, onMouseUp }) {
  return (
    <div className={cd ? 'absolute left-0 top-0 h-full min-h-0 w-full select-none overflow-y-auto md:pr-3' : 'kk-part-in kk-scroll absolute left-0 top-0 h-full min-h-0 w-full select-none overflow-y-auto px-5 md:px-9'} style={{ scrollbarGutter: 'stable' }}>
      <article ref={paneRef} onMouseUp={onMouseUp} className={cd ? 'pb-20 pt-4' : 'pb-20 pt-9'}>
        <div
          className={cd ? 'tid-cd-passage max-w-none select-text' : 'reading-prose max-w-none select-text'}
          style={{ fontSize: 'var(--reading-font-size)', fontFamily: 'var(--reading-font-family)' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}, (a, b) => a.html === b.html && a.cd === b.cd);

function Clock({ seconds, exam, cd }) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  if (cd) {
    return exam
      ? <span className={`whitespace-nowrap text-[14px] leading-6 ${seconds < 300 ? 'font-bold text-red-500' : ''}`}>{m} minutes remaining</span>
      : <span className="whitespace-nowrap text-[14px] leading-6">{m}:{String(s).padStart(2, '0')} · không giới hạn giờ</span>;
  }
  return <>{m}:{String(s).padStart(2, '0')}</>;
}

export default function ReadingPlayer({ testId, mode = 'practice', passage, gap = false, onBack, onSaveWord }) {
  const cd = mode === 'exam';
  const [parts, setParts] = useState(null);
  const [missing, setMissing] = useState([]);
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState({}); // { partIdx: { qid: value } }
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(null);
  const [pickRow, setPickRow] = useState(null);
  const pref = useMemo(loadPref, []);
  const [fontSize, setFontSize] = useState(pref.size || (cd ? 16 : 17));
  const [font, setFont] = useState(pref.font || (cd ? ARIAL.stack : FONTS[0].stack));
  const [paper, setPaper] = useState(pref.paper || KK_PAPERS[1]);
  const [menu, setMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [split, setSplit] = useState(50);
  const [toolbar, setToolbar] = useState(null);
  const [lookup, setLookup] = useState(null);
  const [locatedId, setLocatedId] = useState(null);
  const [toast, setToast] = useState('');
  const paneRef = useRef(null);
  const splitRef = useRef(null);
  const savedHtml = useRef({});
  const qScroll = useRef(null);

  // ---- load passages ----
  useEffect(() => {
    let dead = false;
    (async () => {
      let ids = passageIdsOf(testId);
      if (passage) {
        const only = ids.filter(id => id.endsWith(`-${passage}`));
        if (only.length) ids = only;
      }
      const loaded = await Promise.all(ids.map(loadPassage));
      if (dead) return;
      const ok = [], miss = [];
      loaded.forEach((p, i) => {
        if (!p) { miss.push(ids[i]); return; }
        let qs = p.questions;
        if (gap) {
          const g = GAP_BY_ID.get(p.id);
          const nums = new Set((g?.groups || []).flatMap(x => x.nums));
          if (nums.size) qs = qs.filter(q => nums.has(Number(q.id)));
        }
        const num = Number((p.id.match(/-(\d+)$/) || [])[1]) || i + 1;
        ok.push({ ...p, passageNumber: ids.length > 1 || /^cam-|^tid-\d/.test(p.id) ? num : 1, html: markStandfirst(p.html), questions: qs.map(q => ({ ...q, id: Number.isFinite(Number(q.id)) ? Number(q.id) : q.id })) });
      });
      setParts(ok);
      setMissing(miss);
    })();
    return () => { dead = true; };
  }, [testId, passage, gap]);

  const part = parts?.[active];
  const sets = useMemo(() => (part ? buildSets(part.questions) : []), [part]);
  const allSets = useMemo(() => (parts || []).map(p => buildSets(p.questions)), [parts]);
  const partAnswers = answers[active] || {};
  const totalQ = (parts || []).reduce((n, p) => n + p.questions.length, 0);
  const answeredQ = (parts || []).reduce((n, p, i) => n + p.questions.filter(q => (answers[i] || {})[q.id]).length, 0);
  const keyed = (parts || []).every(p => p.hasKey);
  const qFrom = part?.questions[0]?.id, qTo = part?.questions[part.questions.length - 1]?.id;

  // ---- timer ----
  const limit = cd ? (parts && parts.length > 1 ? 60 * 60 : 20 * 60) : 0;
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!parts?.length || showResults) return undefined;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [parts, showResults]);
  const clockSec = cd ? Math.max(0, limit - elapsed) : elapsed;

  const setAnswer = useCallback((qid, v) => {
    if (showResults) return;
    setAnswers(a => ({ ...a, [active]: { ...(a[active] || {}), [qid]: v } }));
  }, [active, showResults]);

  // keep progress (done/total) as the learner answers
  useEffect(() => {
    if (!parts || showResults) return;
    parts.forEach((p, i) => {
      const done = p.questions.filter(q => (answers[i] || {})[q.id]).length;
      if (done) saveProgress(gap ? `gap:${p.id}` : p.id, { done, total: p.questions.length, completed: false });
    });
  }, [answers]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(() => {
    if (!parts) return;
    let correct = 0;
    const perPart = parts.map((p, i) => {
      let c = 0;
      for (const s of allSets[i]) for (const q of s.qs) if (isQCorrect(s, q, answers[i] || {})) c++;
      correct += c;
      return c;
    });
    parts.forEach((p, i) => saveProgress(gap ? `gap:${p.id}` : p.id, {
      done: p.questions.filter(q => (answers[i] || {})[q.id]).length, total: p.questions.length, completed: true,
      score: p.hasKey ? perPart[i] : undefined,
    }));
    // per-type accuracy only for passages that have an answer key
    recordTypeStats(parts.flatMap((p, i) => (p.hasKey ? allSets[i].flatMap(s => s.qs.map(q => ({ type: qTypeLabel(s, q), ok: isQCorrect(s, q, answers[i] || {}) }))) : [])));
    setShowResults(true);
    setResult({ rawScore: correct, total: totalQ, band: readingBand(correct, totalQ), keyed, gap });
  }, [parts, allSets, answers, totalQ, keyed, gap]);

  // exam auto-submit
  useEffect(() => { if (cd && limit && elapsed >= limit && !showResults && parts?.length) submit(); }, [cd, limit, elapsed, showResults, parts, submit]);

  const switchPart = i => {
    if (paneRef.current) savedHtml.current[active] = paneRef.current.firstChild?.innerHTML;
    setToolbar(null); setLocatedId(null); setPickRow(null);
    setActive(i);
  };
  const jumpTo = (qid, pi = active) => {
    if (pi !== active) switchPart(pi);
    setCurrent(qid);
    setTimeout(() => document.getElementById(`question-${qid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  // ---- highlight toolbar ----
  const onMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !paneRef.current) { return; }
    const range = sel.getRangeAt(0);
    if (!paneRef.current.contains(range.commonAncestorContainer)) return;
    const text = sel.toString().trim();
    if (!text) return;
    const r = range.getBoundingClientRect();
    setToolbar({ x: r.left + r.width / 2, y: r.top, text, range: range.cloneRange() });
  }, []);
  useEffect(() => {
    if (!toolbar) return undefined;
    const close = e => { if (!e.target.closest?.('.tid-hl-toolbar')) setToolbar(null); };
    const t = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', close); };
  }, [toolbar]);

  const applyMark = kind => {
    if (!toolbar) return;
    const { range } = toolbar;
    if (kind === 'erase') {
      const root = paneRef.current;
      root.querySelectorAll('.highlight-item').forEach(el => { if (range.intersectsNode(el)) unwrap(el); });
    } else {
      wrapRange(range, () => {
        const s = document.createElement('span');
        s.className = 'highlight-item';
        if (kind === 'underline') Object.assign(s.style, { textDecoration: 'underline', textDecorationColor: '#ef4444', textDecorationThickness: '2px' });
        else s.style.background = kind;
        return s;
      });
    }
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  };

  const sentenceOf = (range, word) => {
    const block = range.startContainer.parentElement?.closest('p,li,td,div');
    const txt = (block?.textContent || '').replace(/\s+/g, ' ');
    const sents = txt.match(/[^.!?]+[.!?]*/g) || [txt];
    return (sents.find(s => s.toLowerCase().includes(word.toLowerCase())) || '').trim();
  };

  const doLookup = async () => {
    if (!toolbar) return;
    const word = toolbar.text.replace(/[^\p{L}\p{N}' -]/gu, '').trim();
    const example = sentenceOf(toolbar.range, word);
    setLookup({ word, x: toolbar.x, y: toolbar.y, loading: true, example });
    setToolbar(null);
    try {
      const res = await dictionaryService.lookup(word);
      setLookup(l => (l && l.word === word ? { ...l, loading: false, res } : l));
    } catch {
      setLookup(l => (l && l.word === word ? { ...l, loading: false, res: null } : l));
    }
  };

  const saveWord = async (word, res, example) => {
    if (!onSaveWord || !word) return;
    let r = res;
    if (r === undefined) { try { r = await dictionaryService.lookup(word); } catch { r = null; } }
    onSaveWord({
      word: r?.word || word,
      ipa: r?.ipaUs || r?.ipaUk || '',
      partOfSpeech: r?.partOfSpeech || 'noun',
      meaningVi: r?.meaningVi || '',
      meaningEn: r?.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '',
      examples: example ? [{ en: example, vi: '' }] : [],
      synonyms: r?.synonyms || [],
      tags: ['IELTS Reading'],
    });
    setToast(`Đã lưu "${word}" vào sổ từ vựng`);
    setTimeout(() => setToast(''), 2200);
  };

  // ---- locate evidence in passage ----
  const clearEvidence = () => paneRef.current?.querySelectorAll('.tid-evidence').forEach(unwrap);
  const onLocate = q => {
    clearEvidence();
    if (locatedId === q.id) { setLocatedId(null); return; }
    const quotes = [...(q.explanation || '').matchAll(/[“"]([^”"\n]{10,})[”"]/g)].map(m => m[1]);
    let first = null;
    for (const qt of quotes) {
      const hit = findEvidence(paneRef.current, qt);
      if (!hit) continue;
      const range = document.createRange();
      range.setStart(hit.nodes[hit.start[0]], hit.start[1]);
      range.setEnd(hit.nodes[hit.end[0]], hit.end[1] + 1);
      const els = wrapRange(range, () => { const s = document.createElement('span'); s.className = 'tid-evidence'; return s; });
      first ||= els[0];
    }
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); setLocatedId(q.id); }
    else { setToast('Không tìm thấy đoạn trích trong bài'); setTimeout(() => setToast(''), 2000); }
  };

  // ---- split drag ----
  const startDrag = e => {
    e.preventDefault();
    const box = splitRef.current?.getBoundingClientRect();
    if (!box) return;
    const move = ev => setSplit(Math.min(75, Math.max(25, ((ev.clientX - box.left) / box.width) * 100)));
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  useEffect(() => {
    const f = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  useEffect(() => savePref({ size: fontSize, font, paper }), [fontSize, font, paper]);
  useEffect(() => () => ttsService.stop?.(), []);

  const wrongList = useMemo(() => {
    if (!showResults || !parts) return [];
    const out = [];
    parts.forEach((p, i) => allSets[i].forEach(s => s.qs.forEach(q => { if (!isQCorrect(s, q, answers[i] || {})) out.push({ pi: i, qid: q.id }); })));
    return out;
  }, [showResults, parts, allSets, answers]);
  const nextWrong = () => {
    if (!wrongList.length) return;
    const idx = wrongList.findIndex(w => w.pi > active || (w.pi === active && w.qid > (current ?? -1)));
    const w = wrongList[idx >= 0 ? idx : 0];
    jumpTo(w.qid, w.pi);
  };

  const ctx = {
    answers: partAnswers, setAnswer, showResults: showResults && keyed, cd, current, setCurrent, pickRow, setPickRow,
    onLocate: showResults ? onLocate : null, locatedId,
  };

  // ---------- render ----------
  if (!parts) {
    return <div className="fixed inset-0 z-[60] grid place-items-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }
  if (!parts.length) {
    return (
      <div className="px-root fixed inset-0 z-[60] grid place-items-center p-6" style={KK_DESK}>
        <div className="max-w-md rounded-[28px] border-4 border-[#1F2A1A] bg-[#FDF5E0] p-8 text-center shadow-[0_10px_0_#1F2A1A]">
          <h2 className="px-display mb-3 text-2xl uppercase">Chưa có nội dung</h2>
          <p className="mb-6 text-sm font-semibold text-[#5A6450]">
            {INDEX_BY_ID.get(missing[0])?.title ? `“${INDEX_BY_ID.get(missing[0]).title}” ` : 'Bài này '}
            chưa được tải về máy nên chưa thể luyện offline. Hãy chọn passage khác nhé.
          </p>
          <button type="button" onClick={onBack} className="px-display rounded-2xl border-4 border-[#1F2A1A] bg-[#F8BE33] px-6 py-3 uppercase shadow-[0_5px_0_#1F2A1A]">← Quay lại</button>
        </div>
      </div>
    );
  }

  const partHtml = savedHtml.current[active] || part.html;
  const qStatus = (pi, q, s) => {
    const v = (answers[pi] || {})[q.id];
    if (showResults && keyed) return isQCorrect(s, q, answers[pi] || {}) ? 'ok' : 'bad';
    return v ? 'done' : 'todo';
  };

  const submitBtnLabel = cd ? 'Nộp bài' : 'Kiểm Tra';

  return (
    <QCtx.Provider value={ctx}>
      <div
        className={`fixed inset-0 z-[60] ${cd ? 'ielts-exam-root flex h-full flex-col overflow-hidden bg-white leading-[1.5em] text-black' : 'kk-exam-root box-border flex h-full flex-col gap-3 overflow-hidden p-3 leading-[1.5em] text-[#1a1a12] md:gap-4 md:p-6'}`}
        style={cd ? undefined : { ...KK_DESK, fontFamily: KK.ui }}
      >
        {cd ? (
          <>
            <header className="z-30 flex shrink-0 items-center border-b border-[#c1c1c1] bg-white">
              <button type="button" onClick={onBack} title="Thoát" className="flex shrink-0 items-center p-4 py-3.5">
                <span className="relative h-[36px] w-[36px] overflow-hidden rounded-lg border border-slate-100 shadow-sm">
                  <img src={asset('assets/tid/logo.webp')} alt="WorkingEnglish Logo" className="h-full w-full object-cover" />
                </span>
              </button>
              <div className="min-w-0 flex-1 self-start px-4 pt-[3px]">
                <div className="mb-1 truncate text-[16px] font-bold leading-6">{part.title}</div>
                <div className="flex items-center gap-2">{showResults ? <span className="text-[15px] font-bold text-[#007e64]">Báo cáo kết quả</span> : <Clock seconds={clockSec} exam={cd} cd />}</div>
              </div>
              <div className="ml-auto mr-1 flex h-full shrink-0 items-center">
                {showResults && wrongList.length > 0 && keyed && (
                  <button type="button" onClick={nextWrong} className="mr-2 hidden rounded bg-[#418ec8] px-4 py-2 text-sm font-bold text-white hover:bg-[#3578b0] sm:block">Câu sai tiếp ({wrongList.length})</button>
                )}
                <div aria-hidden="true" className="hidden aspect-square h-full items-center justify-center p-2.5 sm:flex"><Wifi className="h-7 w-7" strokeWidth={2.25} /></div>
                <div aria-hidden="true" className="hidden aspect-square h-full items-center justify-center p-2.5 sm:flex"><Bell className="h-7 w-7" strokeWidth={2} /></div>
                <div className="relative h-full">
                  <button type="button" onClick={() => setMenu(m => !m)} title="Tuỳ chọn hiển thị" aria-expanded={menu} className={`flex aspect-square h-full cursor-pointer items-center justify-center p-2.5 ${menu ? 'bg-black/10' : 'hover:bg-black/5'}`}><Menu className="h-7 w-7" strokeWidth={2} /></button>
                  {menu && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-64 cursor-auto rounded-[6px] border border-[#d5d5d5] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-600">Cỡ chữ</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setFontSize(s => Math.max(12, s - 1))} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d5d5d5] hover:bg-black/5">−</button>
                          <span className="w-6 text-center font-mono text-sm tabular-nums">{fontSize}</span>
                          <button type="button" onClick={() => setFontSize(s => Math.min(28, s + 1))} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d5d5d5] hover:bg-black/5">+</button>
                        </div>
                      </div>
                      <span className="mb-1.5 block text-[12px] font-bold text-slate-600">Kiểu chữ</span>
                      <div className="-mx-1 flex max-h-56 flex-col gap-0.5 overflow-y-auto px-1">
                        {[ARIAL, ...FONTS].map(f => (
                          <button key={f.name} type="button" onClick={() => setFont(f.stack)} style={{ fontFamily: f.stack }}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[15px] transition-colors ${font === f.stack ? 'bg-[#418ec8] text-white' : 'text-slate-800 hover:bg-black/5'}`}>
                            <span>{f.name}</span>{font === f.stack && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => { toggleFullscreen(); setMenu(false); }} className="mt-3 flex w-full items-center gap-2 rounded-md border border-[#d5d5d5] px-2.5 py-2 text-[14px] text-slate-800 hover:bg-black/5">
                        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}{fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>
            <div className="m-4 mb-0 shrink-0 rounded-[4px] border border-[#d5d5d5] bg-[#f1f2ec] p-4 text-[16px] leading-6">
              <div className="font-bold">Part {part.passageNumber}</div>
              <div>Read the text and answer questions {qFrom}-{qTo}</div>
              {missing.length > 0 && <div className="mt-1 text-[14px] text-[#a32a1c]">{missing.length} passage của đề này chưa có nội dung trên máy nên được bỏ qua.</div>}
            </div>
          </>
        ) : (
          <header style={kkCard(paper)} className="z-30 flex shrink-0 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-3 py-2 md:px-4">
              <button type="button" onClick={onBack} title="Quay lại danh sách" style={{ border: `2.5px solid ${KK.ink}` }} className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-white transition-colors hover:bg-[#e8b13a]"><ArrowLeft className="h-4 w-4" strokeWidth={2.5} /></button>
              <div className="kk-scroll kk-hbar order-last flex w-full min-w-0 items-center gap-1.5 overflow-x-auto py-[3px] lg:order-none lg:w-auto lg:flex-1">
                {parts.map((p, pi) => {
                  const isActive = pi === active;
                  const st = allSets[pi].flatMap(s => s.qs.map(q => qStatus(pi, q, s)));
                  const qList = allSets[pi].flatMap(s => s.qs);
                  const done = st.filter(x => x === 'done' || x === 'ok').length, bad = st.filter(x => x === 'bad').length;
                  const todo = st.map((x, k) => (x === 'todo' || x === 'bad' ? k : -1)).filter(k => k >= 0);
                  const chips = isActive ? qList.map((_, k) => k) : todo.length > 0 && todo.length <= 6 ? todo : [];
                  return (
                    <React.Fragment key={p.id}>
                      {pi > 0 && <span aria-hidden="true" style={{ background: 'rgba(26,26,18,0.3)' }} className="mx-0.5 h-[22px] w-[2px] shrink-0 rounded-full" />}
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => switchPart(pi)} title={`Part ${p.passageNumber}`}
                          style={isActive ? { background: KK.ink, color: KK.cream } : { background: 'rgba(26,26,18,0.07)', color: KK.ink }}
                          className={`flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide transition-colors ${isActive ? '' : 'opacity-75 hover:opacity-100'}`}>
                          Part {p.passageNumber}
                          {showResults && keyed
                            ? (bad === 0 ? <CheckCircle2 className="h-[13px] w-[13px] text-[#3f6b2c]" strokeWidth={2.6} /> : <span style={{ background: '#c0392b', color: '#fff' }} className="rounded-full px-1.5 py-px text-[10.5px] font-bold normal-case tabular-nums">{bad} sai</span>)
                            : !isActive && (todo.length === 0 ? <CheckCircle2 className="h-[13px] w-[13px]" strokeWidth={2.6} /> : <span className="font-semibold tabular-nums opacity-75">{done}/{qList.length}</span>)}
                        </button>
                        {chips.length > 0 && (
                          <div className="kk-chips-in flex items-center gap-[3px]">
                            {chips.map(k => {
                              const q = qList[k], s = st[k];
                              return (
                                <button key={q.id} type="button" onClick={() => jumpTo(q.id, pi)} title={`Câu ${q.id}`}
                                  style={{ border: `2px solid ${isActive ? KK.ink : 'rgba(26,26,18,0.45)'}`, background: s === 'ok' ? '#d8ead0' : s === 'bad' ? '#f6d6d0' : s === 'done' ? KK.amber : '#fff', color: KK.ink, opacity: isActive ? 1 : 0.85 }}
                                  className={`flex shrink-0 select-none items-center justify-center rounded-[7px] font-bold transition-transform hover:-translate-y-[2px] ${isActive ? 'h-[22px] w-[22px] text-[11px]' : 'h-[20px] w-[20px] text-[10px]'}`}>
                                  {q.id}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="kk-scroll kk-hbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto lg:flex-none">
                <div className="hidden shrink-0 gap-1.5 sm:flex lg:hidden xl:flex">
                  {KK_PAPERS.map(c => <button key={c} type="button" onClick={() => setPaper(c)} title={`Màu giấy ${c}`} style={{ background: c, border: paper === c ? `2.5px solid ${KK.ink}` : '2px solid rgba(26,26,18,0.3)' }} className="h-[18px] w-[18px] cursor-pointer rounded-[5px]" />)}
                </div>
                <select value={font} onChange={e => setFont(e.target.value)} aria-label="Kiểu chữ" className="kk-select max-w-[108px] shrink-0">
                  {FONTS.every(f => f.stack !== font) && <option value={font}>Mặc định</option>}
                  {FONTS.map(f => <option key={f.name} value={f.stack}>{f.name}</option>)}
                </select>
                <select value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))} aria-label="Cỡ chữ" className="kk-select max-w-[64px] shrink-0">
                  {[14, 15, 16, 17, 18, 19, 21, 23].map(s => <option key={s} value={s}>{s}px</option>)}
                </select>
                <button type="button" onClick={toggleFullscreen} title="Toàn màn hình" style={{ border: `2.5px solid ${KK.ink}` }} className="hidden h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[9px] bg-white transition-colors hover:bg-[#e8b13a] md:flex">
                  {fullscreen ? <Minimize2 className="h-4 w-4" strokeWidth={2.5} /> : <Maximize2 className="h-4 w-4" strokeWidth={2.5} />}
                </button>
                <div style={{ border: `2.5px solid ${KK.ink}` }} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-2.5 py-[5px] text-[12px] font-semibold">
                  {showResults ? <><span style={{ background: '#3f6b2c' }} className="h-[7px] w-[7px] rounded-full" />Báo cáo</> : <><span style={{ background: '#3f6b2c' }} className="h-[7px] w-[7px] rounded-full" /><Clock seconds={clockSec} /></>}
                </div>
                {missing.length > 0 && <span title={missing.join(', ')} className="shrink-0 whitespace-nowrap rounded-[9px] border-2 border-dashed border-[#c0392b]/60 bg-white/70 px-2 py-[5px] text-[11px] font-bold text-[#a32a1c]">{missing.length} passage chưa có nội dung</span>}
                {!keyed && <span className="shrink-0 whitespace-nowrap rounded-[9px] border-2 border-dashed border-[#1a1a12]/50 bg-white/70 px-2 py-[5px] text-[11px] font-bold">Chưa có đáp án offline</span>}
                {showResults && keyed && wrongList.length > 0 && (
                  <button type="button" onClick={nextWrong} title="Nhảy tới câu sai kế tiếp (tự sang Part khác)" style={{ color: '#a32a1c', border: '2.5px solid #c0392b' }} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-3 py-[7px] text-[13px] font-bold transition-transform hover:-translate-y-[1px]">
                    Câu sai tiếp<span style={{ background: '#c0392b' }} className="rounded-full px-1.5 text-[11px] text-white tabular-nums">{wrongList.length}</span><ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
                  </button>
                )}
                {showResults ? (
                  <button type="button" onClick={() => { setShowResults(false); setAnswers({}); setResult(null); setElapsed(0); clearEvidence(); setLocatedId(null); }} style={{ background: KK.green, color: KK.cream, border: `2.5px solid ${KK.ink}` }} className="shrink-0 whitespace-nowrap rounded-[9px] px-4 py-[7px] text-[13px] font-bold transition-transform hover:-translate-y-[1px]">Làm lại</button>
                ) : (
                  <button type="button" onClick={submit} disabled={answeredQ === 0} style={{ background: KK.amber, color: KK.ink, border: `2.5px solid ${KK.ink}` }} className="shrink-0 whitespace-nowrap rounded-[9px] px-4 py-[7px] text-[13px] font-bold transition-transform hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0">{submitBtnLabel}</button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* split view */}
        <div ref={splitRef} className={cd ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 md:flex-row md:px-8' : 'flex min-h-0 flex-1 flex-col gap-3 overflow-hidden md:flex-row md:gap-0'}>
          <div style={{ flex: `${split} 1 0px` }} className={`flex min-w-0 flex-col overflow-hidden ${cd ? 'pb-2 md:pb-0' : ''}`}>
            <div style={{ ...(cd ? {} : kkCard(paper)), '--reading-font-size': `${fontSize}px`, '--reading-font-family': font }} className={`relative w-full flex-1 ${cd ? '' : 'overflow-hidden'}`}>
              <PassagePane key={`p-${active}`} html={partHtml} cd={cd} paneRef={paneRef} onMouseUp={onMouseUp} />
            </div>
          </div>
          <div onMouseDown={startDrag} className="group z-20 hidden w-8 flex-shrink-0 cursor-col-resize select-none items-center justify-center md:flex">
            <div className={`h-14 w-[3px] rounded-full transition-colors ${cd ? 'bg-slate-300 group-hover:bg-slate-500' : 'bg-white/40 group-hover:bg-white/80'}`} />
          </div>
          <div style={{ flex: `${100 - split} 1 0px`, ...(cd ? {} : kkCard(paper)) }} className="flex min-w-0 flex-col overflow-hidden">
            <div ref={qScroll} className={`kk-scroll min-h-0 flex-1 overflow-y-auto ${cd ? 'px-1 pb-24 pt-2 md:pl-4' : 'px-5 pb-24 pt-7 md:px-8'}`}>
              <div className="flex flex-col gap-10">
                {sets.map(s => <QuestionSet key={`${active}-${s.key}`} set={s} />)}
              </div>
              {showResults && !keyed && (
                <p className="mt-8 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                  Bài này chưa có đáp án offline — hãy tự đối chiếu với bài đọc nhé.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* computer-delivered footer navigation */}
        {cd && (
          <footer className="flex shrink-0 items-stretch border-t border-[#c1c1c1] bg-white text-[16px]">
            <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
              {parts.map((p, pi) => {
                const isActive = pi === active;
                const qList = allSets[pi].flatMap(s => s.qs.map(q => ({ q, s })));
                const answered = qList.filter(({ q }) => (answers[pi] || {})[q.id]).length;
                return (
                  <div key={p.id} className={`flex shrink-0 items-center gap-3 px-4 py-2.5 ${isActive ? 'flex-1' : 'cursor-pointer hover:bg-black/5'}`} onClick={() => !isActive && switchPart(pi)}>
                    <span className="whitespace-nowrap font-bold">Part {p.passageNumber}</span>
                    {isActive ? (
                      <div className="flex flex-wrap items-center gap-0.5">
                        {qList.map(({ q, s }) => {
                          const st = qStatus(pi, q, s);
                          return (
                            <button key={q.id} type="button" onClick={() => jumpTo(q.id)}
                              className={`cd-navnum ${current === q.id ? 'cd-navnum-cur' : ''} ${st === 'ok' ? 'cd-navnum-ok' : st === 'bad' ? 'cd-navnum-bad' : ''}`}
                              style={st === 'done' ? { textDecoration: 'underline', textUnderlineOffset: 3 } : undefined}>
                              {q.id}
                            </button>
                          );
                        })}
                      </div>
                    ) : <span className="whitespace-nowrap text-[15px] text-slate-600">{answered} of {qList.length}</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-1 border-l border-[#c1c1c1] px-3">
              <button type="button" disabled={active === 0} onClick={() => switchPart(active - 1)} className="grid h-10 w-10 place-items-center rounded bg-[#e6e6e6] hover:bg-[#d4d4d4] disabled:opacity-40"><ChevronLeft className="h-6 w-6" /></button>
              <button type="button" disabled={active === parts.length - 1} onClick={() => switchPart(active + 1)} className="grid h-10 w-10 place-items-center rounded bg-black text-white hover:bg-[#262626] disabled:opacity-40"><ChevronRight className="h-6 w-6" /></button>
              {showResults ? (
                <button type="button" onClick={onBack} className="ml-2 inline-flex h-10 items-center gap-2 rounded-[2px] bg-[#418ec8] px-4 text-[15px] font-bold text-white hover:bg-[#3578b0]">Thoát</button>
              ) : (
                <button type="button" onClick={submit} disabled={answeredQ === 0} className="ml-2 inline-flex h-10 items-center gap-2 rounded-[2px] bg-black px-4 text-[16px] text-white hover:bg-[#262626] disabled:opacity-50"><Send className="h-5 w-5" strokeWidth={1.75} />{submitBtnLabel}</button>
              )}
            </div>
          </footer>
        )}

        {/* selection toolbar */}
        {toolbar && (
          <div className="tid-hl-toolbar fixed z-[90] flex -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-1 rounded-xl border-2 border-black bg-white px-2 py-1.5 shadow-[3px_3px_0_rgba(0,0,0,1)]" style={{ left: toolbar.x, top: toolbar.y }}>
            <Highlighter className="mr-0.5 h-4 w-4 text-slate-500" />
            {HL_COLORS.map(c => <button key={c} type="button" onClick={() => applyMark(c)} className="h-6 w-6 rounded-md border border-black/20" style={{ background: c }} title="Tô màu" />)}
            <button type="button" onClick={() => applyMark('underline')} title="Gạch chân" className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100"><Underline className="h-4 w-4" /></button>
            <button type="button" onClick={() => applyMark('erase')} title="Xoá đánh dấu" className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100"><Eraser className="h-4 w-4" /></button>
            {toolbar.text.split(/\s+/).length <= 5 && (
              <>
                <span className="mx-0.5 h-5 w-px bg-slate-200" />
                <button type="button" onClick={doLookup} title="Tra từ" className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-bold hover:bg-slate-100"><Languages className="h-4 w-4" />Tra</button>
                {onSaveWord && <button type="button" onClick={() => { const w = toolbar.text.trim(); saveWord(w, undefined, sentenceOf(toolbar.range, w)); setToolbar(null); }} title="Lưu vào sổ từ vựng" className="flex h-7 items-center gap-1 rounded-md bg-[#a3cf62] px-2 text-[12px] font-black text-[#1e3006] hover:bg-[#b8df74]"><BookmarkPlus className="h-4 w-4" />Lưu</button>}
              </>
            )}
          </div>
        )}

        {/* dictionary popup */}
        {lookup && (
          <div className="fixed z-[95] w-[320px] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-2xl border-2 border-[#1e3006] bg-[#2d4a12] p-4 text-white shadow-[4px_4px_0_rgba(0,0,0,0.8)]" style={{ left: Math.min(Math.max(lookup.x, 170), window.innerWidth - 170), top: Math.max(lookup.y, 220) }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-[#a3cf62]">{lookup.res?.partOfSpeech || 'Từ vựng'} {lookup.res?.ipaUs && <span className="font-mono normal-case tracking-normal text-white/50">{lookup.res.ipaUs}</span>}</div>
                <button type="button" onClick={() => ttsService.speak(lookup.word)} className="font-serif text-base font-black italic text-white hover:underline">{lookup.word} 🔊</button>
              </div>
              <button type="button" onClick={() => setLookup(null)} className="grid h-6 w-6 place-items-center rounded-full bg-white/10 hover:bg-white/25"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-2 text-sm font-bold text-white/90">{lookup.loading ? 'Đang tra…' : lookup.res?.meaningVi || 'Không tìm thấy nghĩa.'}</div>
            {lookup.example && <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] italic leading-relaxed text-white/60">{lookup.example}</div>}
            {onSaveWord && (
              <button type="button" disabled={lookup.loading} onClick={() => { saveWord(lookup.word, lookup.res, lookup.example); setLookup(null); }} className="mt-3 w-full rounded-lg bg-[#a3cf62] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#1e3006] hover:bg-[#b8df74] disabled:opacity-50">+ Lưu vào sổ từ vựng</button>
            )}
          </div>
        )}

        {toast && <div className="fixed bottom-6 left-1/2 z-[400] -translate-x-1/2 border-2 border-black bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-[4px_4px_0_rgba(0,0,0,1)]">{toast}</div>}

        {/* result modal */}
        {result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md" onClick={() => setResult(null)}>
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={e => e.stopPropagation()} style={{ fontFamily: KK.ui }}>
              <div className="relative bg-[#1a2a3a] p-10 text-white">
                <button type="button" onClick={() => setResult(null)} className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"><X size={18} /></button>
                <h2 className="mb-7 text-3xl font-black tracking-tight text-white">{result.gap ? 'Kết Quả Gap Filling' : 'Kết Quả Bài Thi'}</h2>
                {result.keyed ? (
                  <div className="grid grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                      <div className="mb-2 text-[10px] font-black uppercase tracking-widest opacity-50">Điểm Số</div>
                      <div className="text-5xl font-black">{result.rawScore} <span className="text-xl opacity-30">/ {result.total}</span></div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                      <div className="mb-2 text-[10px] font-black uppercase tracking-widest opacity-50">Band Score</div>
                      <div className="text-5xl font-black">{result.gap ? `${Math.round((result.rawScore / Math.max(1, result.total)) * 100)}%` : `Band ${result.band}`}</div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/10 p-6 text-base font-semibold">Đã nộp bài ({answeredQ}/{totalQ} câu đã trả lời). Bài này chưa có đáp án offline nên chưa chấm điểm được — hãy tự đối chiếu với bài đọc.</p>
                )}
                {result.keyed && result.total < 40 && !result.gap && <p className="mt-4 text-xs font-semibold text-white/50">Band quy đổi theo tỉ lệ trên thang 40 câu.</p>}
              </div>
              <div className="border-t border-slate-100 p-6">
                <button type="button" onClick={() => setResult(null)} className="w-full rounded-2xl bg-[#1a2a3a] py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-[#24384c]">Xem Lại Bài Thi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </QCtx.Provider>
  );
}
