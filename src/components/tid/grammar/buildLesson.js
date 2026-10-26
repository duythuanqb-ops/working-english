// Port of theieltsdictionary.com's grammar lesson builder (/practice/grammar/[lessonId]).
// Turns the raw lesson ({ sections: [...] }) into topics -> sub-topics, each with theory `blocks` and a `quiz`.

const LEVEL_LABEL = { basic: 'Cơ bản (B5–6)', intermediate: 'Trung cấp (B6.5–7)', advanced: 'Nâng cao (B7.5+)' };
export { LEVEL_LABEL };

// ---- quiz normalisation (shuffles options deterministically per question set) ----
function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeQuestions(questions) {
  let seed = (function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  })(questions.map(q => `${q.number}|${q.text}`).join('\0')) || 1;
  const rand = () => {
    let t = Math.imul((seed = (seed + 1831565813) | 0) ^ (seed >>> 15), 1 | seed);
    return (((t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t) ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const slotPools = new Map();
  const nextSlot = n => {
    let pool = slotPools.get(n);
    if (!pool?.length) { pool = shuffle(Array.from({ length: n }, (_, i) => i), rand); slotPools.set(n, pool); }
    return pool.pop();
  };
  const out = [];
  for (const q of questions) {
    const answer = (q.answer || '').trim();
    const opts = (q.options || []).map((o, i) => {
      const m = o.match(/^([A-E])[.)]\s*(.*)$/);
      return m ? { letter: m[1], text: m[2] } : { letter: 'ABCDE'[i] || '', text: o };
    });
    if (opts.length === 0) {
      if (!answer) continue;
      out.push({ number: q.number, text: q.text, options: [], correct: -1, answerText: answer, explanation: q.explanation || '' });
      continue;
    }
    const ci = opts.findIndex(o => o.letter === answer.toUpperCase());
    if (opts.length < 2 || ci < 0) continue;
    const target = nextSlot(opts.length);
    const others = shuffle(opts.filter((_, i) => i !== ci), rand);
    const options = opts.map((_, i) => (i === target ? opts[ci] : others.pop())).map((o, i) => ({ letter: 'ABCDE'[i] || '', text: o.text }));
    out.push({ number: q.number, text: q.text, options, correct: target, answerText: options[target].text, explanation: q.explanation || '' });
  }
  return out;
}

// ---- answer key matching for typed answers ----
const normKey = s => s.toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim().replace(/[.,;:!?…]+$/, '').trim();
export function expandAnswerKey(key) {
  const set = new Set();
  const add = s => { const n = normKey(s); if (n) set.add(n); };
  for (const part of key.split(/\[or\]/i)) {
    let variants = [part];
    for (;;) {
      const next = [];
      let changed = false;
      for (const v of variants) {
        const a = v.indexOf('(');
        const b = a === -1 ? -1 : v.indexOf(')', a);
        if (b === -1) { next.push(v); continue; }
        changed = true;
        for (const opt of [...v.slice(a + 1, b).split('/'), '']) next.push(v.slice(0, a) + opt + v.slice(b + 1));
      }
      if (!changed) break;
      if (next.length > 256) { variants = [part.replace(/[()]/g, ' ')]; break; }
      variants = next;
    }
    for (const v of variants) {
      if (!v.includes('/')) { add(v); continue; }
      for (const s of v.split('/')) add(s);
      let combos = [''];
      for (const w of v.split(/\s+/)) {
        const alts = w.includes('/') ? w.split('/').filter(Boolean) : [w];
        if (alts.length && (combos = combos.flatMap(c => alts.map(x => (c ? `${c} ${x}` : x)))).length > 64) { combos = []; break; }
      }
      combos.forEach(add);
    }
  }
  return [...set];
}
const normTyped = s => s.toLowerCase().replace(/[()]/g, ' ').replace(/[–—-]/g, ' ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().replace(/^["']+/, '').replace(/["'.!?]+$/, '').trim();
export function checkTyped(typed, answerText) {
  const t = normTyped(typed);
  if (!t) return false;
  const key = answerText.split(/\s*(?:→|->)\s*/).pop() ?? answerText;
  return expandAnswerKey(key).some(k => normTyped(k) === t);
}

// ---- theory helpers (B-band "note" lessons) ----
const TABLE_COLS = { 'Dạng': 4, 'Tình huống': 3, 'Tiêu chí phân biệt': 3, 'Cấu trúc': 3, 'Cấu trúc thì tương lai': 3, 'Gerund (V-ing) → QUÁ KHỨ / ĐANG XẢY RA': 2, 'LUÔN DÙNG GERUND (V-ing)': 2, 'Câu điều kiện gốc (có IF)': 2, 'Chỉ dùng với ĐẾM ĐƯỢC (số nhiều)': 3, 'EVERY — toàn thể, không có ngoại lệ': 2, 'TRÁNH DÙNG (informal/speaking)': 2, 'Câu thông thường': 2, 'Dùng IN (khoảng thời gian rộng)': 3, 'FOR + KHOẢNG thời gian': 2, 'DURING + DANH TỪ (noun)': 2, 'Adj + OF': 2, 'Adj + WITH': 3 };
const splitPipes = s => s.split('|').map(x => x.trim()).filter(Boolean);
const stripLead = s => s.replace(/^[^\p{L}\p{N}]+/u, '');
const isFormula = s => s.includes('+') && s.length < 70 && /^(S|Do\/Does|Does|Do|Am\/Is\/Are|Have\/Has|Had|Did|Will|Was\/Were)\b/.test(s);

function noteToBlocks(content) {
  const parts = splitPipes(content);
  if (!parts.length) return [];
  const cols = TABLE_COLS[parts[0]];
  if (cols && parts.length >= 2 * cols && parts.length % cols === 0) {
    const rows = [];
    for (let i = cols; i < parts.length; i += cols) rows.push(parts.slice(i, i + cols));
    return [{ kind: 'table', headers: parts.slice(0, cols), rows }];
  }
  if (parts.length === 2 && parts[0].length <= 45 && parts[1].length > parts[0].length && !/^\d+\.\s/.test(parts[0])) {
    return [{ kind: 'note', tone: 'green', title: parts[0], text: parts[1] }];
  }
  const items = /^\d+\.\s/.test(parts[0]) ? parts.slice(1) : parts;
  if (!items.length) return [];
  if (items.length === 1 && items[0].length < 80 && !items[0].includes(':')) return [{ kind: 'heading', text: items[0] }];
  const blocks = [];
  let list = null;
  const flush = () => { if (list?.items.length) blocks.push({ kind: 'list', ...list }); list = null; };
  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    const s = stripLead(raw);
    let m = s.match(/^(LƯU Ý|QUY TẮC)\s*[:—-]\s*(.+)$/);
    if (m) { flush(); blocks.push({ kind: 'note', tone: 'red', title: m[1], text: m[2] }); continue; }
    m = s.match(/^Dấu hiệu\s*:\s*(.+)$/);
    if (m) { flush(); blocks.push({ kind: 'note', tone: 'amber', title: 'Dấu hiệu nhận biết', text: m[1] }); continue; }
    m = s.match(/^Cấu trúc\s*:\s*(.+)$/);
    if (m) {
      flush();
      const f = [{ label: 'Cấu trúc', pattern: m[1] }];
      while (i + 1 < items.length && isFormula(items[i + 1])) f.push({ label: '', pattern: items[++i] });
      blocks.push({ kind: 'formula', items: f });
      continue;
    }
    if (/:$/.test(raw) && raw.length < 46) { flush(); list = { title: raw.replace(/:$/, ''), items: [] }; continue; }
    m = raw.match(/^([\p{Lu}\s]{3,24}):\s*(.+)$/u);
    if (m) { flush(); list = { title: m[1].trim(), items: [m[2]] }; continue; }
    if (/^(\([a-z]\)|→|-|•|\d+\))/.test(raw) || (list && raw.length < 120)) {
      if (!list) list = { items: [] };
      list.items.push(raw.replace(/^[-•]\s*/, ''));
      continue;
    }
    if (isFormula(raw)) { flush(); blocks.push({ kind: 'formula', items: [{ label: '', pattern: raw }] }); continue; }
    flush();
    blocks.push({ kind: 'text', text: raw });
  }
  flush();
  return blocks;
}

const TENSE_WORDS = ['simple', 'present', 'past', 'future', 'perfect', 'continuous'];
const tenseTags = s => {
  const parts = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').split(/[^a-z]+/);
  return TENSE_WORDS.filter(w => parts.includes(w));
};
function splitTitle(s) {
  const t = s.replace(/^\d+\.\s*/, '').replace(/\s*\(Câu[^)]*\)\s*$/i, '').trim();
  const i = t.search(/\s[—–-]\s/);
  return i > 0 ? { title: t.slice(0, i).trim(), subtitle: t.slice(i + 3).trim() } : { title: t, subtitle: '' };
}
const NOTE_TONE = { info: 'green', tip: 'amber', warning: 'red' };
function parseHeading(h) {
  const m = h.trim().match(/^(\d+)\s*[.)]\s*(.+)$/);
  const number = m ? Number(m[1]) : null;
  let title = (m ? m[2] : h).trim();
  let subtitle = '';
  const p = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  if (p) { title = p[1].trim(); subtitle = p[2].trim(); } else {
    const i = title.search(/\s[—–-]\s/);
    if (i > 0) { subtitle = title.slice(i + 3).trim(); title = title.slice(0, i).trim(); }
  }
  return { number, title, subtitle };
}
function contentToBlocks(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks = [];
  let items = [];
  const flush = () => { if (items.length) blocks.push({ kind: 'list', items }); items = []; };
  for (const l of lines) {
    if (/^[-•✔✓]\s*/.test(l)) { items.push(l.replace(/^[-•✔✓]\s*/, '')); continue; }
    flush();
    blocks.push({ kind: 'text', text: l });
  }
  flush();
  return blocks;
}

function buildNoteLesson(sections) {
  const topics = [];
  let topic = null, sub = null;
  const pre = [];
  for (const s of sections) {
    if (s.type === 'note') {
      const c = (s.content || '').trim();
      if (!c || /^Câu\s*\|\s*ĐA\b/.test(c)) continue;
      const part = c.match(/^PHẦN\s*(\d+)\s*[—–-]?\s*(.*)$/);
      if (part) { topic = { id: `part-${part[1]}`, number: Number(part[1]), title: part[2] || `Phần ${part[1]}`, subtitle: '', subs: [] }; topics.push(topic); sub = null; continue; }
      const numbered = /^\d+\.\s/.test(c), group = /^NHÓM\s*\d+/.test(c);
      if ((numbered || group) && topic) {
        const first = splitPipes(c)[0];
        const { title, subtitle } = group ? (() => {
          const t = splitTitle(first), k = t.subtitle.indexOf('/');
          return k > 0 ? { title: `${t.title} — ${t.subtitle.slice(0, k).trim()}`, subtitle: t.subtitle.slice(k + 1).trim() } : t;
        })() : splitTitle(first);
        sub = { id: s.id, title, subtitle, blocks: [], quiz: [] };
        if (numbered) sub.blocks.push(...noteToBlocks(c));
        topic.subs.push(sub);
        continue;
      }
      const b = noteToBlocks(c);
      if (sub) sub.blocks.push(...b); else pre.push(...b);
      continue;
    }
    if (s.type === 'exercise' && sub) sub.quiz.push(...normalizeQuestions(s.questions || []));
  }
  const first = topics[0]?.subs[0];
  if (first && pre.length) first.blocks.unshift(...pre);
  const theorySubs = topics.flatMap(t => t.subs.filter(x => x.quiz.length === 0));
  for (const t of topics) {
    const withQuiz = t.subs.filter(x => x.quiz.length > 0).length;
    t.subtitle = withQuiz ? `${withQuiz} nhóm · ${t.subs.reduce((a, x) => a + x.quiz.length, 0)} câu trắc nghiệm` : `${t.subs.length} chủ đề lý thuyết`;
    for (const x of t.subs) {
      if (!x.quiz.length) continue;
      const label = `${x.title} / ${x.subtitle}`;
      const tags = tenseTags(label.includes('/') ? label.slice(label.lastIndexOf('/') + 1) : label);
      const tense = ['present', 'past', 'future'].find(w => tags.includes(w));
      if (!tense) continue;
      let best = null, score = 0, len = 99;
      for (const th of theorySubs) {
        const tt = tenseTags(th.subtitle || th.title);
        if (!tt.includes(tense)) continue;
        const sc = tt.filter(w => tags.includes(w)).length;
        if (sc > score || (sc === score && tt.length < len)) { best = th; score = sc; len = tt.length; }
      }
      if (score > 0 && best) x.blocks = best.blocks;
    }
  }
  return topics;
}

function sectionBlocks(s) {
  switch (s.type) {
    case 'explanation': {
      const b = [];
      if (s.heading) b.push({ kind: 'heading', text: s.heading });
      if (s.content) b.push(...contentToBlocks(s.content));
      return b;
    }
    case 'note': {
      const lines = (s.content || '').split('\n').map(l => l.trim()).filter(Boolean);
      const head = lines[0] || '';
      const titled = lines.length > 1 && head.length < 90;
      return [{ kind: 'note', tone: NOTE_TONE[s.variant || 'info'] || 'green', title: titled ? head.replace(/^[^\p{L}\p{N}]+/u, '').trim() : '', text: (titled ? lines.slice(1) : lines).join('\n') }];
    }
    case 'table': {
      const b = [];
      if (s.heading) b.push({ kind: 'heading', text: s.heading });
      b.push({ kind: 'table', headers: s.headers || [], rows: s.rows || [] });
      return b;
    }
    case 'rule': {
      const b = [];
      if (s.heading) b.push({ kind: 'heading', text: s.heading });
      if (s.formula) b.push({ kind: 'formula', items: [{ label: 'Cấu trúc', pattern: s.formula }] });
      if (s.notes?.length) b.push({ kind: 'list', items: s.notes });
      return b;
    }
    case 'example': {
      const b = [];
      if (s.heading) b.push({ kind: 'heading', text: s.heading });
      b.push({ kind: 'examples', items: s.items || [] });
      return b;
    }
    default:
      return [];
  }
}

function buildSectionLesson(lesson) {
  const theory = { id: 'theory', number: 1, title: `LÝ THUYẾT ${lesson.title.toUpperCase()}`, subtitle: '', subs: [] };
  const practice = { id: 'practice', number: 2, title: 'BÀI TẬP THỰC HÀNH', subtitle: '', subs: [] };
  let current = null, currentHeading = '';
  const loose = [];
  for (const s of lesson.sections || []) {
    if (['exercise', 'sentence_transform', 'translation'].includes(s.type)) {
      const quiz = s.type === 'exercise'
        ? normalizeQuestions(s.questions || [])
        : s.type === 'sentence_transform'
          ? (s.questions || []).filter(q => q.answer).map(q => ({ number: q.number, text: [q.source || q.text, q.hint ? `(gợi ý: ${q.hint})` : ''].filter(Boolean).join(' '), options: [], correct: -1, answerText: q.answer, explanation: q.explanation || '' }))
          : (s.sentences || []).filter(q => q.answer).map((q, i) => ({ number: i + 1, text: q.vi, options: [], correct: -1, answerText: q.answer, explanation: '' }));
      if (!quiz.length) continue;
      if (current && currentHeading && (s.heading || '').trim() === currentHeading) {
        current.quiz.push(...quiz);
        current.intro = current.intro || s.instruction || '';
        continue;
      }
      const { number, title, subtitle } = parseHeading((s.heading || '').replace(/^Exercise\s*(\d+)\s*:?/i, (_, n) => `${n}.`));
      practice.subs.push({ id: s.id, title: number ? `BÀI ${number} — ${title}` : title || 'Bài tập', subtitle, intro: s.instruction || '', blocks: [], quiz });
      continue;
    }
    if (s.type === 'explanation' && /^\d+\s*[.)]/.test((s.heading || '').trim())) {
      const { title, subtitle } = parseHeading(s.heading || '');
      currentHeading = (s.heading || '').trim();
      current = { id: s.id, title, subtitle, blocks: s.content ? contentToBlocks(s.content) : [], quiz: [] };
      theory.subs.push(current);
      continue;
    }
    const b = sectionBlocks(s);
    if (b.length) (current ? current.blocks : loose).push(...b);
  }
  if (loose.length) {
    if (theory.subs.length) theory.subs[0].blocks.unshift(...loose);
    else theory.subs.push({ id: 'intro', title: lesson.title, subtitle: '', blocks: loose, quiz: [] });
  }
  const merged = practice.subs.length === 0 && theory.subs.some(x => x.quiz.length > 0);
  const total = theory.subs.reduce((a, x) => a + x.quiz.length, 0);
  if (merged) { theory.title = lesson.title.toUpperCase(); theory.subtitle = `${theory.subs.length} chủ đề · ${total} câu`; } else theory.subtitle = `${theory.subs.length} chủ đề lý thuyết`;
  practice.subtitle = `${practice.subs.length} phần · ${practice.subs.reduce((a, x) => a + x.quiz.length, 0)} câu`;
  return [theory, practice].filter(t => t.subs.length > 0);
}

/** Lesson -> [{ id, number, title, subtitle, subs: [{ id, title, subtitle, intro?, blocks, quiz }] }] */
export function buildLesson(lesson) {
  const sections = lesson.sections || [];
  const notes = sections.filter(s => s.type === 'note').length;
  const theoryish = sections.filter(s => ['explanation', 'table', 'rule', 'example'].includes(s.type)).length;
  return notes > 0 && theoryish === 0 ? buildNoteLesson(sections) : buildSectionLesson(lesson);
}
