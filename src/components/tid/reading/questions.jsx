// Question rendering for the Reading player — handles every block type the site's editor produces:
// TFNG / YNNG, multiple choice (single + "choose TWO"), matching information / headings / features / sentence endings,
// note / summary (with or without a phrase list) / sentence / table / flow-chart completion and short answers.
import React, { Fragment, createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const QCtx = createContext(null);

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv'];
const GAP_ANY = /\b(\d+)\s*(?:_{3,}|[.…_]{3,})/;
const gapRe = n => new RegExp(`\\b${n}\\s*(?:_{3,}|[.\\u2026_]{3,})`);

// ---------- answer checking (port of the site's il()/matchesAnswerKey) ----------
const norm = v => (Array.isArray(v) ? v.join(',') : v == null ? '' : String(v)).trim().toLowerCase()
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ');
const loose = s => s.replace(/^[\s"'.,;:!?()-]+|[\s"'.,;:!?()-]+$/g, '').replace(/\s+/g, ' ');
function keyVariants(key) {
  // "(the) river" → ["the river", "river"]; "A/B" or "A OR B" → alternatives
  const alts = key.split(/\s*\/\s*|\s+or\s+/i).filter(Boolean);
  const out = new Set();
  for (const a of alts) {
    out.add(loose(a.replace(/[()]/g, '')));
    out.add(loose(a.replace(/\([^)]*\)/g, ' ')));
  }
  return [...out].filter(Boolean);
}
const TF_ALIASES = { t: 'true', f: 'false', ng: 'not given', y: 'yes', n: 'no', notgiven: 'not given' };
function matchesKey(user, key) {
  let u = loose(user), k = loose(key);
  u = TF_ALIASES[u.replace(/\s/g, '')] || u;
  k = TF_ALIASES[k.replace(/\s/g, '')] || k;
  if (u === k) return true;
  return keyVariants(key).some(v => v === u);
}
export function isCorrect(user, key) {
  const u = norm(user), k = norm(key);
  if (!u || !k) return false;
  if (k.includes('|')) return k.split('|').some(x => matchesKey(u, x));
  if (k.includes(',') && u.includes(',')) {
    const s = x => x.split(',').map(loose).filter(Boolean).sort().join(',');
    if (s(u) === s(k)) return true;
  }
  return matchesKey(u, k);
}
const letters = v => {
  if (Array.isArray(v)) return v.map(x => String(x).trim().toUpperCase()).filter(Boolean);
  const s = String(v || '').trim();
  return /^[A-Ha-h](\s*[,|]\s*[A-Ha-h])*$/.test(s) ? s.split(/[,|]/).map(x => x.trim().toUpperCase()) : s ? [s] : [];
};

// ---------- grouping questions into instruction sets ----------
function splitHeading(html) {
  if (!html) return { headingHtml: null, instructionsHtml: '' };
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    for (const el of doc.body.querySelectorAll('p,h1,h2,h3,h4,h5,h6,div,span,strong,b')) {
      const t = el.textContent?.trim() || '';
      if (/^Questions?\s+\d+(?:\s*[–—−-]\s*\d+)?$/i.test(t)) {
        const block = el.closest('p,h1,h2,h3,h4,h5,h6,div') || el;
        const headingHtml = block.outerHTML;
        block.remove();
        return { headingHtml, instructionsHtml: doc.body.innerHTML.trim() };
      }
    }
  } catch { /* ignore */ }
  return { headingHtml: null, instructionsHtml: html };
}

function tableHtml(b) {
  const cell = s => s.replace(/\[(\d+)\]/g, (_, n) => `${n}_______`).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const cols = b.tableHeaders?.length || Math.max(...(b.tableRows || [[]]).map(r => r.length), 1);
  let h = '';
  if (b.tableTitle) h += `<p style="text-align:center;font-weight:bold;margin-bottom:10px">${b.tableTitle}</p>`;
  h += '<table style="border-collapse:collapse;width:100%;font-size:14px">';
  if (b.tableShowHeaders !== false && b.tableHeaders?.length) {
    h += '<thead>';
    if (b.tableInlineTitle) h += `<tr><th colspan="${cols}" style="border:1px solid #555;padding:8px 12px;background:#e8e8e8;font-weight:bold;text-align:center">${b.tableInlineTitle}</th></tr>`;
    h += `<tr>${b.tableHeaders.map(x => `<th style="border:1px solid #555;padding:8px 12px;background:#f5f5f5;font-weight:bold;text-align:center">${x}</th>`).join('')}</tr></thead>`;
  } else if (b.tableInlineTitle) {
    h += `<thead><tr><th colspan="${cols}" style="border:1px solid #555;padding:8px 12px;background:#e8e8e8;font-weight:bold;text-align:center">${b.tableInlineTitle}</th></tr></thead>`;
  }
  const rows = b.tableRows || [];
  const span = rows.map(() => 1);
  let last = -1;
  rows.forEach((r, i) => { if ((r[0] ?? '').trim() === '^') { span[i] = 0; if (last >= 0) span[last]++; } else { last = i; span[i] = 1; } });
  h += '<tbody>';
  rows.forEach((r, i) => {
    h += '<tr>';
    r.forEach((c, j) => {
      if (j === 0 && span[i] === 0) return;
      const txt = (c ?? '').trim().split(/\r?\n/).map(cell).join('<br/>');
      const rs = j === 0 && span[i] > 1 ? ` rowspan="${span[i]}"` : '';
      const st = j === 0 ? 'border:1px solid #555;padding:8px 12px;vertical-align:middle;font-weight:bold;text-align:center;background:#fafafa' : 'border:1px solid #555;padding:8px 12px;vertical-align:middle';
      h += `<td${rs} style="${st}">${txt}</td>`;
    });
    h += '</tr>';
  });
  return `${h}</tbody></table>`;
}

function phraseList(qs) {
  const q0 = qs[0];
  const phrases = (q0.phraseOptions?.length ? q0.phraseOptions : q0.block?.phraseOptions || []).map(s => String(s).trim()).filter(Boolean);
  if (phrases.length) return phrases.map((p, i) => ({ value: String.fromCharCode(65 + i), label: p }));
  return null;
}

// Option list (value/label) for a dropdown gap block.
function choiceOptions(kind, qs, html) {
  const b = qs[0].block || {};
  if (kind === 'matching-heading') {
    let n = (b.headings || []).filter(Boolean).length;
    if (!n) n = (html.match(/<li/gi) || []).length;
    return ROMAN.slice(0, n || 8).map(r => ({ value: r, label: r }));
  }
  if (kind === 'matching-feature' || kind === 'sentence-ending') {
    let ls = [...html.matchAll(/<strong>\s*([A-Z])\.?\s*<\/strong>/g)].map(m => m[1]);
    if (!ls.length) {
      const src = kind === 'matching-feature' ? b.featureOptions : b.sentenceEndings;
      ls = (src || []).filter(Boolean).map((_, i) => String.fromCharCode(65 + i));
    }
    ls = [...new Set(ls)];
    return ls.length ? ls.map(l => ({ value: l, label: l })) : null;
  }
  return null;
}

export function buildSets(questions) {
  const sets = [];
  for (const q of questions) {
    const key = q.blockId || q.groupId || `solo-${q.id}`;
    const last = sets[sets.length - 1];
    if (last && last.key === key) last.qs.push(q); else sets.push({ key, qs: [q] });
  }
  return sets.map(s => {
    const q0 = s.qs[0];
    const bt = q0.block?.type || q0.displayType || '';
    const groupHtml = s.qs.find(q => q.groupHtml)?.groupHtml || '';
    let kind, html = '', options = null, phrases = null;
    if (q0.type === 'tfng' || q0.type === 'ynng') kind = q0.type;
    else if (q0.type === 'matching-info' && bt !== 'matching-heading') kind = 'matching-info';
    else if (bt === 'multiple-choice-2' || q0.displayType === 'multiple-choice-2') kind = 'mc2';
    else if (q0.type === 'multiple-choice') kind = 'mc';
    else {
      if (bt === 'table-completion' && q0.block?.tableRows?.length) html = tableHtml(q0.block);
      else html = s.qs.find(q => q.questionHtml)?.questionHtml || '';
      if (html) {
        kind = 'html';
        const sub = bt === 'matching-heading' || q0.displayType === 'matching-heading' ? 'matching-heading'
          : bt === 'matching-feature' ? 'matching-feature' : bt === 'sentence-ending' ? 'sentence-ending' : '';
        options = choiceOptions(sub, s.qs, html);
        phrases = phraseList(s.qs);
        if (phrases) options = phrases;
        else if (sub === 'matching-feature' && !options) options = null;
      } else kind = 'plain';
    }
    return { ...s, kind, html, options, phrases, groupHtml, ...splitHeading(groupHtml) };
  });
}

// ---------- small pieces ----------
function Explanation({ q }) {
  const ctx = useContext(QCtx);
  const text = q.explanation || '';
  const lines = text.split('\n');
  return (
    <span className="mt-2 block rounded-md border border-slate-200 bg-white px-3 py-2.5 font-normal">
      {text ? (
        <span className="block text-[13.5px] leading-relaxed text-slate-800">
          {lines.map((l, i) => {
            const t = l.trim();
            if (!t) return <span key={i} className="block h-1.5" />;
            const head = /^(Bước\s*\d+.*:|Keyword[s]?:|Từ khoá:|Phân tích:|Kết luận:|Bài viết:|Câu hỏi:|Lý do.*:|=>|⇒|→)/i.test(t);
            return <span key={i} className={`block ${head ? 'mt-1 font-bold text-slate-900' : ''}`}>{t}</span>;
          })}
        </span>
      ) : <span className="text-[13px] italic text-slate-400">Chưa có giải thích cho câu này.</span>}
      {text && ctx.onLocate && (
        <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={e => { e.stopPropagation(); ctx.onLocate(q); }}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${ctx.locatedId === q.id ? 'border-amber-500 bg-amber-200 text-amber-900' : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>
            {ctx.locatedId === q.id ? '✕ Bỏ đánh dấu' : '📍 Vị trí trong bài'}
          </button>
        </span>
      )}
    </span>
  );
}

function ResultLine({ q, user, compact }) {
  const [open, setOpen] = useState(false);
  const ok = isCorrect(user, q.answer);
  const ans = String(q.answer ?? '').split('|').join(' / ');
  return (
    <div className={`mt-2 rounded border px-3 py-2 text-[12px] font-medium ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'} ${compact ? '' : 'ml-0 lg:ml-8'}`}>
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-1 text-left">
        {ok ? <><CheckCircle2 size={14} className="-mt-0.5 mr-1 inline" /> Correct</> : <>Answer: <b className="ml-1">{ans || '—'}</b></>}
        <span className="ml-auto text-[11px] font-black underline underline-offset-2">{open ? 'Thu gọn' : 'Xem giải'}</span>
      </button>
      {open && <Explanation q={q} />}
    </div>
  );
}

// Inline result for a gap (green/red underline + popover with explanation)
function GapResult({ q, user, label }) {
  const [open, setOpen] = useState(false);
  const ok = isCorrect(user, q.answer);
  const ans = String(q.answer ?? '').split('|').join(' / ');
  return (
    <span className="relative mx-1 inline-flex items-center gap-1 align-middle" id={`question-${q.id}`}>
      <span className="kk-slotnum">{q.id}</span>
      <span className={`border-b-2 px-1 text-[15px] font-semibold leading-6 ${ok ? 'border-emerald-400 text-emerald-800' : 'border-red-400 text-red-700'}${!user ? ' italic text-slate-400' : ''}`}>{label || user || '—'}</span>
      {!ok && ans && <span className="shrink-0 rounded-md border border-emerald-600/40 bg-emerald-50 px-1.5 text-[13px] font-bold leading-5 text-emerald-800">→ {ans}</span>}
      <button type="button" onClick={() => setOpen(o => !o)} title="Xem đáp án + giải thích"
        className={ok ? 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 hover:bg-emerald-200' : `inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full border px-2 text-[11px] font-black leading-none ${open ? 'border-red-600 bg-red-600 text-white' : 'border-red-300 bg-red-50 text-red-700 hover:border-red-600'}`}>
        {ok ? '✓' : <>✗ <span>Xem giải</span> ›</>}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-30 mt-1 block w-[min(420px,80vw)] rounded-xl border-2 border-black bg-white px-4 py-3 text-left shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <span className={`mb-1 block text-[14px] font-black ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{ok ? '✓ Correct!' : `✗ Answer: ${ans}`}</span>
          <Explanation q={q} />
        </span>
      )}
    </span>
  );
}

function GapInput({ q, options }) {
  const ctx = useContext(QCtx);
  const v = ctx.answers[q.id] || '';
  if (ctx.showResults) {
    const label = options ? (v ? `${v}${options.find(o => o.value === v && o.label !== v) ? ` · ${options.find(o => o.value === v).label}` : ''}` : '') : v;
    return <GapResult q={q} user={v} label={label} />;
  }
  if (options) {
    return (
      <span className="inline" id={`question-${q.id}`} style={{ scrollMarginTop: 80 }}>
        <label className={`tid-gap ${ctx.current === q.id ? 'tid-gap-active' : ''}`}>
          <span className="tid-gap-num" aria-hidden="true">{q.id}</span>
          <select value={v} onFocus={() => ctx.setCurrent(q.id)} onChange={e => ctx.setAnswer(q.id, e.target.value)}
            aria-label={`Question ${q.id}`}
            className="tid-gap-field cursor-pointer appearance-auto px-1 !min-w-[5.5em] text-center">
            <option value="">{ctx.cd ? q.id : '—'}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label === o.value ? o.value : `${o.value}. ${o.label}`}</option>)}
          </select>
        </label>
      </span>
    );
  }
  return (
    <span className="inline" id={`question-${q.id}`} style={{ scrollMarginTop: 80 }}>
      <label className={`tid-gap ${ctx.current === q.id ? 'tid-gap-active' : ''}`}>
        <span className="tid-gap-num" aria-hidden="true">{q.id}</span>
        <span className="tid-gap-field" data-value={v}>
          <input type="text" value={v} size={1} className="tid-gap-input" aria-label={`Question ${q.id}`} data-gap=""
            onFocus={() => ctx.setCurrent(q.id)} onChange={e => ctx.setAnswer(q.id, e.target.value)} autoComplete="off" spellCheck={false} />
          {!v && <span className="tid-gap-ph" aria-hidden="true">{q.id}</span>}
        </span>
      </label>
    </span>
  );
}

// style="a:b; c:d" → React style object
function styleObj(s) {
  const o = {};
  (s || '').split(';').forEach(p => {
    const i = p.indexOf(':');
    if (i < 0) return;
    const k = p.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const v = p.slice(i + 1).trim();
    if (k && v) o[k] = v;
  });
  return o;
}
const VOID = new Set(['br', 'hr', 'img', 'input', 'col', 'wbr']);
const SKIP = new Set(['script', 'style', 'iframe', 'object']);

// Renders block HTML, swapping "27 ______" markers for gap controls of that set.
function GapHtml({ html, qs, options }) {
  const byId = useMemo(() => new Map(qs.map(q => [String(q.id), q])), [qs]);
  const tree = useMemo(() => {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.firstElementChild;
  }, [html]);
  const used = new Set();
  const splitText = (text, key) => {
    const out = [];
    let rest = text, n = 0;
    while (rest && n++ < 100) {
      const m = GAP_ANY.exec(rest);
      if (!m) { out.push(rest); break; }
      const q = byId.get(m[1]);
      if (!q) { out.push(rest.slice(0, m.index + m[0].length)); rest = rest.slice(m.index + m[0].length); continue; }
      if (m.index > 0) out.push(rest.slice(0, m.index));
      used.add(q.id);
      out.push(<GapInput key={`${key}-${q.id}-${n}`} q={q} options={options} />);
      rest = rest.slice(m.index + m[0].length);
    }
    return out;
  };
  const walk = (node, key) => {
    if (node.nodeType === 3) {
      const t = node.textContent || '';
      return GAP_ANY.test(t) ? <Fragment key={key}>{splitText(t, key)}</Fragment> : t;
    }
    if (node.nodeType !== 1) return null;
    const tag = node.tagName.toLowerCase();
    if (SKIP.has(tag)) return null;
    const props = { key };
    const st = styleObj(node.getAttribute('style'));
    if (Object.keys(st).length) props.style = st;
    if (tag === 'ul') props.className = 'my-2 list-disc pl-5 space-y-1.5';
    if (tag === 'ol') props.className = node.getAttribute('style')?.includes('lower-roman') ? 'my-2 pl-6 space-y-1' : 'my-2 list-decimal pl-5 space-y-1.5';
    if (tag === 'li') props.className = 'leading-relaxed';
    if (tag === 'p') props.className = 'my-2';
    if (tag === 'strong' || tag === 'b') props.className = 'font-bold';
    if (tag === 'em' || tag === 'i') props.className = 'italic';
    if (tag === 'table' && !props.style) props.className = 'w-full border-collapse text-[14px] my-2';
    if (tag === 'td' || tag === 'th') {
      if (node.getAttribute('rowspan')) props.rowSpan = Number(node.getAttribute('rowspan'));
      if (node.getAttribute('colspan')) props.colSpan = Number(node.getAttribute('colspan'));
      if (!props.style) props.className = tag === 'th' ? 'border border-slate-500 px-3 py-2 font-bold bg-slate-50 text-center align-middle' : 'border border-slate-500 px-3 py-2 align-middle';
    }
    if (tag === 'img') { props.src = node.getAttribute('src'); props.alt = node.getAttribute('alt') || ''; props.className = 'max-w-full'; }
    if (VOID.has(tag)) return React.createElement(tag, props);
    return React.createElement(tag, props, ...Array.from(node.childNodes).map((c, i) => walk(c, `${key}-${i}`)));
  };
  const rendered = Array.from(tree?.childNodes || []).map((c, i) => walk(c, `g-${i}`));
  // questions whose marker is missing from the HTML get their own row below
  const missing = qs.filter(q => !used.has(q.id));
  return (
    <>
      {rendered}
      {missing.map(q => (
        <p key={`m-${q.id}`} className="my-2"><span className="mr-1">{q.question?.replace(/\s*[.…_]{3,}\s*/g, ' … ')}</span><GapInput q={q} options={options} /></p>
      ))}
    </>
  );
}

function QNum({ q, state }) {
  return <div className={`kk-qnum mt-0.5 shrink-0 ${state}`}>{q.id}</div>;
}

// ---------- the set renderer ----------
export function QuestionSet({ set }) {
  const ctx = useContext(QCtx);
  const { qs, kind } = set;
  const first = qs[0], last = qs[qs.length - 1];
  const label = first.id === last.id ? `Question ${first.id}` : `Questions ${first.id}–${last.id}`;
  const show = ctx.showResults;
  const ans = id => ctx.answers[id] || '';
  const qState = q => (show ? (isCorrect(ans(q.id), q.answer) ? 'kk-qnum-ok' : 'kk-qnum-bad') : ans(q.id) ? 'kk-qnum-on' : '');

  let instructions = set.instructionsHtml;
  if (!instructions && (kind === 'tfng' || kind === 'ynng')) {
    instructions = kind === 'tfng'
      ? '<p><strong>Do the following statements agree with the information given in the Reading Passage?</strong></p><p><strong>TRUE</strong>&nbsp;&nbsp;if the statement agrees with the information<br/><strong>FALSE</strong>&nbsp;&nbsp;if the statement contradicts the information<br/><strong>NOT GIVEN</strong>&nbsp;&nbsp;if there is no information on this</p>'
      : '<p><strong>Do the following statements agree with the claims of the writer in the Reading Passage?</strong></p><p><strong>YES</strong>&nbsp;&nbsp;if the statement agrees with the claims of the writer<br/><strong>NO</strong>&nbsp;&nbsp;if the statement contradicts the claims of the writer<br/><strong>NOT GIVEN</strong>&nbsp;&nbsp;if it is impossible to say what the writer thinks about this</p>';
  }

  let body = null;
  if (kind === 'tfng' || kind === 'ynng') {
    const opts = kind === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
    body = (
      <div className="flex flex-col gap-4">
        {qs.map(q => (
          <div key={q.id} id={`question-${q.id}`} style={{ scrollMarginTop: 80 }} onClick={() => ctx.setCurrent(q.id)}>
            <div className="flex items-start gap-2.5">
              <QNum q={q} state={qState(q)} />
              <div className={`flex-1 ${ctx.cd ? 'text-[16px] leading-[1.5] text-black' : 'pt-0.5 text-[15px] leading-[1.5] text-[#1a1a12]'}`}>{q.question}</div>
            </div>
            <ul className={`ml-0 mt-1.5 flex list-none flex-col ${ctx.cd ? 'gap-0.5' : 'gap-1 md:ml-9'}`}>
              {opts.map(o => {
                const on = ans(q.id).toUpperCase() === o;
                return (
                  <li key={o}>
                    <label className={`kk-option ${on ? 'kk-option-on' : ''}`} onClick={e => { e.preventDefault(); if (!show) ctx.setAnswer(q.id, on ? '' : o); }}>
                      <input type="radio" readOnly checked={on} className="kk-radio" disabled={show} />
                      <span className="text-[15px] leading-[1.5]">{o}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {show && <ResultLine q={q} user={ans(q.id)} />}
          </div>
        ))}
      </div>
    );
  } else if (kind === 'mc') {
    body = (
      <div className="flex flex-col gap-5">
        {qs.map(q => {
          const opts = (q.options || []).filter(o => o != null && String(o).trim() !== '');
          return (
            <div key={q.id} id={`question-${q.id}`} style={{ scrollMarginTop: 80 }}>
              <div className="mb-1.5 flex gap-2.5">
                <QNum q={q} state={qState(q)} />
                <div className={`flex-1 ${ctx.cd ? 'text-[16px] leading-[1.5] text-black' : 'pt-0.5 text-[15px] leading-[1.5] text-[#1a1a12]'}`}>
                  {q.questionHtml ? <span dangerouslySetInnerHTML={{ __html: q.questionHtml }} /> : q.question}
                </div>
              </div>
              <ul className={`ml-0 flex list-none flex-col ${ctx.cd ? 'gap-0.5' : 'gap-1 md:ml-9'}`}>
                {opts.map((o, i) => {
                  const L = String.fromCharCode(65 + i);
                  const on = ans(q.id) === L;
                  return (
                    <li key={i}>
                      <label className={`kk-option ${on ? 'kk-option-on' : ''}`} onClick={e => { e.preventDefault(); if (!show && !window.getSelection()?.toString().trim()) ctx.setAnswer(q.id, on ? '' : L); }}>
                        <input type="radio" readOnly checked={on} className="kk-radio" disabled={show} />
                        <span className="text-[15px] leading-[1.5]">{ctx.cd ? null : <>{L}. </>}{String(o).replace(/^[A-Z][.)]\s*/, '')}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {show && <ResultLine q={q} user={ans(q.id)} />}
            </div>
          );
        })}
      </div>
    );
  } else if (kind === 'mc2') {
    const opts = (first.options || []).filter(o => o != null && String(o).trim() !== '');
    const picked = qs.map(q => ans(q.id)).filter(Boolean).flatMap(v => v.split(/[,|]/)).filter(Boolean);
    const need = Math.max(qs.length, typeof first.answer === 'string' ? first.answer.split(/[|,]/).filter(Boolean).length : 1);
    const keyLetters = [...new Set(qs.flatMap(q => letters(q.answer)))].sort();
    const pick = L => {
      if (show) return;
      const next = (picked.includes(L) ? picked.filter(x => x !== L) : picked.length < need ? [...picked, L] : [...picked.slice(1), L]).sort();
      if (qs.length === 1 && need > 1) ctx.setAnswer(first.id, next.join(','));
      else qs.forEach((q, i) => ctx.setAnswer(q.id, next[i] ?? ''));
    };
    body = (
      <div id={`question-${first.id}`} style={{ scrollMarginTop: 80 }}>
        <div className="mb-2.5 flex gap-2.5">
          <div className={`kk-qnum shrink-0 ${qs.every(q => ans(q.id)) ? 'kk-qnum-on' : ''}`}>{first.id}{qs.length > 1 ? `–${last.id}` : ''}</div>
          <div className={`flex-1 ${ctx.cd ? 'text-[16px] leading-[1.5] text-black' : 'pt-0.5 text-[15px] leading-[1.5] text-[#1a1a12]'}`}>
            {first.questionHtml ? <span dangerouslySetInnerHTML={{ __html: first.questionHtml }} /> : first.question}
          </div>
        </div>
        <ul className={`ml-0 flex list-none flex-col ${ctx.cd ? 'gap-0.5' : 'gap-1 md:ml-9'}`}>
          {opts.map((o, i) => {
            const L = String.fromCharCode(65 + i);
            const on = picked.includes(L);
            const mark = show ? (keyLetters.includes(L) ? 'text-emerald-700 font-bold' : on ? 'text-red-600 line-through' : '') : '';
            return (
              <li key={i}>
                <label className={`kk-option ${on ? 'kk-option-on' : ''}`} onClick={e => { e.preventDefault(); if (!window.getSelection()?.toString().trim()) pick(L); }}>
                  <input type="checkbox" readOnly checked={on} className="kk-radio kk-radio-box" disabled={show} />
                  <span className={`text-[15px] leading-[1.5] ${mark}`}>{ctx.cd ? null : <>{L}. </>}{String(o).replace(/^[A-Z][.)]\s*/, '')}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {show && (
          <div className="mt-2 flex flex-col gap-1">
            {qs.map((q, i) => {
              const mine = qs.length === 1 && need > 1 ? ans(q.id) : ans(q.id);
              const ok = qs.length === 1 && need > 1 ? isCorrect(mine, keyLetters.join(',')) : !!mine && keyLetters.includes(mine.toUpperCase());
              return (
                <div key={q.id} className={`rounded border px-3 py-2 text-[12px] font-medium ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                  Q{q.id}: {ok ? '✓' : '✗'} Correct: {keyLetters.join(' / ') || '—'}
                  {i === 0 && q.explanation && <Explanation q={q} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (kind === 'matching-info') {
    const letterOpts = first.sectionOptions?.length ? first.sectionOptions : ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const active = ctx.pickRow;
    body = (
      <div className="flex flex-col gap-1">
        {qs.map(q => {
          const v = ans(q.id);
          const ok = show && isCorrect(v, q.answer);
          const isActive = !show && active === q.id;
          return (
            <div key={q.id} id={`question-${q.id}`} style={{ scrollMarginTop: 80 }} onClick={() => !show && ctx.setPickRow(q.id)}
              className={`flex cursor-pointer flex-col rounded-[10px] px-2 py-2 transition-colors ${show ? '' : isActive ? (ctx.cd ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-[rgba(232,177,58,0.22)]') : (ctx.cd ? 'hover:bg-slate-50' : 'hover:bg-[rgba(26,26,18,0.05)]')}`}>
              <div className="flex items-start gap-3">
                <QNum q={q} state={qState(q)} />
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <div className={`min-w-[2.5rem] shrink-0 border-b-2 px-2 pb-0.5 text-center text-sm font-semibold ${show ? (ok ? 'border-emerald-400 text-emerald-700' : 'border-red-400 text-red-600') : v ? (ctx.cd ? 'border-[#418ec8] text-[#418ec8]' : 'border-[#1a1a12] text-[#1a1a12]') : isActive && ctx.cd ? 'border-blue-400 text-blue-500' : ctx.cd ? 'border-gray-400 text-gray-400' : 'border-[rgba(26,26,18,0.35)] text-[rgba(26,26,18,0.4)]'}`}>
                    {v || (show ? '—' : '')}
                  </div>
                  <span className={ctx.cd ? 'text-[14px] leading-relaxed text-gray-900' : 'text-[15px] leading-[1.5] text-[#1a1a12]'}>{q.question}</span>
                </div>
              </div>
              {show && <ResultLine q={q} user={v} compact />}
            </div>
          );
        })}
        {!show && (
          <div className={`mt-3 flex flex-wrap gap-2 border-t pt-3 ${ctx.cd ? 'border-slate-200' : 'border-t-2 border-[rgba(26,26,18,0.15)]'}`}>
            {letterOpts.map(L => {
              const used = qs.some(q => ans(q.id) === L);
              return (
                <button key={L} type="button"
                  onClick={() => {
                    if (active == null) return;
                    ctx.setAnswer(active, L);
                    const i = qs.findIndex(q => q.id === active);
                    const nx = qs.slice(i + 1).find(q => !ans(q.id));
                    ctx.setPickRow(nx ? nx.id : null);
                  }}
                  style={ctx.cd ? undefined : { border: '2.5px solid #1a1a12', background: used ? '#e8b13a' : '#fff', color: '#1a1a12' }}
                  className={ctx.cd ? `rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors ${used ? 'border-[#418ec8] bg-blue-100 text-[#418ec8]' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}` : 'rounded-[9px] px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-[1px]'}>
                  Paragraph {L}
                </button>
              );
            })}
          </div>
        )}
        {!show && active == null && <p className={`mt-1 text-xs ${ctx.cd ? 'text-slate-400' : 'text-[rgba(26,26,18,0.5)]'}`}>Click a question row to select it, then click a paragraph button.</p>}
      </div>
    );
  } else if (kind === 'html') {
    body = (
      <div className={ctx.cd ? 'text-[16px] leading-[1.6] text-black' : 'kk-structured-card text-[15px] leading-[1.7]'}>
        <GapHtml html={set.html} qs={qs} options={set.options} />
        {set.phrases && (
          <div className="mt-4 rounded-lg border border-slate-300 bg-white/70 p-3">
            <p className="mb-1.5 text-[13px] font-bold">List of phrases</p>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2">
              {set.phrases.map(p => <div key={p.value}><b className="mr-2">{p.value}</b>{p.label}</div>)}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // plain completion / short answer: one line per question
    body = (
      <div className="flex flex-col gap-3">
        {qs.map(q => {
          const text = q.question || '';
          const m = /\s*(?:\d+\s*)?(?:_{3,}|[.…_]{3,})\s*/.exec(text);
          return (
            <div key={q.id} className="flex items-start gap-2.5">
              <QNum q={q} state={qState(q)} />
              <div className={`flex-1 ${ctx.cd ? 'text-[16px] leading-[1.8]' : 'text-[15px] leading-[1.8]'}`}>
                {m ? <>{text.slice(0, m.index)} <GapInput q={q} /> {text.slice(m.index + m[0].length)}</> : <>{text} <GapInput q={q} /></>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div id={`question-set-${set.key}`} className="anchor-hl-note">
      {set.headingHtml
        ? <div className={`kk-qheading mb-1.5 ${ctx.cd ? '' : '[&_*]:!my-0 [&_*]:!text-[22px] [&_*]:!font-bold [&_*]:!leading-tight'}`} dangerouslySetInnerHTML={{ __html: set.headingHtml }} />
        : <p className="kk-qheading mb-1.5">{label}</p>}
      {instructions && <div className="kk-instructions prose prose-sm mb-5 max-w-none text-[14px] leading-[1.55]" dangerouslySetInnerHTML={{ __html: instructions }} />}
      {body}
    </div>
  );
}

// Scoring helper shared by the player.
export function scoreQuestions(questions, answers) {
  let correct = 0;
  const sets = buildSets(questions);
  for (const s of sets) {
    if (s.kind === 'mc2') {
      const keyL = [...new Set(s.qs.flatMap(q => letters(q.answer)))];
      if (s.qs.length === 1) { if (isCorrect(answers[s.qs[0].id], keyL.sort().join(','))) correct++; continue; }
      const seen = new Set();
      for (const q of s.qs) {
        const v = (answers[q.id] || '').toUpperCase();
        if (v && keyL.includes(v) && !seen.has(v)) { correct++; seen.add(v); }
      }
    } else for (const q of s.qs) if (isCorrect(answers[q.id], q.answer)) correct++;
  }
  return correct;
}

export function isQCorrect(set, q, answers) {
  if (set?.kind === 'mc2') {
    const keyL = [...new Set(set.qs.flatMap(x => letters(x.answer)))];
    const v = (answers[q.id] || '').toUpperCase();
    return set.qs.length === 1 ? isCorrect(answers[q.id], keyL.sort().join(',')) : !!v && keyL.includes(v);
  }
  return isCorrect(answers[q.id], q.answer);
}

export { GAP_ANY, gapRe };
