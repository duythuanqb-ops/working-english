#!/usr/bin/env node
/*
 * Builds src/data/tid/writing/** for the Writing area of the TID module.
 *
 * NOTE: network crawling of theieltsdictionary.com was stopped (account flagged for automated downloads), so this
 * script works OFFLINE ONLY from data that was already saved locally by earlier crawls:
 *   - src/data/ieltsWriting100.json           raw Supabase `writing_tasks` rows (task1 / task2 / task_builder)
 *   - src/data/ieltsWritingDichCau.json       raw /api/dich-cau exercise rows (primary)
 *   - src/data/ieltsTranslationExercises.json second copy of the same rows (used only to repair broken UTF-8)
 *   - scripts/live/api/dich-cau.json          /api/dich-cau?list=true (the official 64-item list)
 *   - scripts/live/_practice_writing_bai-mau.html  RSC payload with the 150 Band-8 sample-essay index
 *   - scripts/live/chunks/3h09ojqw5r7ls.js     paragraph-break map for the Band-8 essays
 *   - "chế độ học/*.har"                       browser HAR the user recorded: bilingual bodies of the Band-8
 *                                               essays that were opened (/api/band8?topic=..&essay=..)
 *
 * Usage: node scripts/tid/build_writing.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'src/data/tid/writing');
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (rel, data) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(data));
  return f;
};

// ---------- media URL normalisation (same rewrite the site does client-side) ----------
const R2 = 'https://pub-c71988294a9b45099e83dad66bb73426.r2.dev/';
const media = u => {
  if (!u) return null;
  if (u.startsWith(R2)) return 'https://media.theieltsdictionary.com/' + u.slice(R2.length);
  if (u.startsWith('/')) return 'https://theieltsdictionary.com' + u;
  return u;
};
const fixHtmlMedia = html => (html || '')
  .replace(/src="(\/data\/[^"]+)"/g, (_, p) => `src="https://theieltsdictionary.com${p}"`)
  .replace(/https:\/\/pub-c71988294a9b45099e83dad66bb73426\.r2\.dev\//g, 'https://media.theieltsdictionary.com/');
const stripHtml = h => (h ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
// Lark/Docs export html -> array of plain-text paragraphs
const paras = h => (h || '')
  .replace(/<\/(div|p|li|h\d)>|<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);

// ---------- 1. Writing test bank (same mapping as the site's library page) ----------
const TYPES = [
  ['bar_chart', 'bc'], ['line_graph', 'lg'], ['pie_chart', 'pc'], ['table', 'tbl'], ['mixed_graph', 'mg'], ['map', 'map'], ['process', 'proc'],
];
const TOPIC_RANGES = [[1, 12, 'education'], [13, 22, 'technology'], [23, 32, 'environment'], [33, 43, 'society'], [44, 53, 'government'],
  [54, 63, 'health'], [64, 74, 'work'], [75, 83, 'media'], [84, 91, 'crime'], [92, 100, 'globalisation'], [101, 106, 'science'],
  [107, 114, 'arts'], [115, 120, 'transport']];
const TOPIC_OVERRIDE = { 3: 'work', 10: 'society', 20: 'environment', 27: 'work', 35: 'arts', 37: 'globalisation', 39: 'health', 40: 'media',
  41: 'education', 43: 'health', 44: 'transport', 53: 'arts', 54: 'society', 62: 'arts', 68: 'transport', 70: 'environment', 73: 'transport',
  94: 'environment', 98: 'environment', 103: 'health', 109: 'media', 112: 'health' };
const task2Topic = id => {
  const n = Number(id.match(/(\d+)$/)?.[1]);
  if (TOPIC_OVERRIDE[n]) return TOPIC_OVERRIDE[n];
  return TOPIC_RANGES.find(([a, b]) => n >= a && n <= b)?.[2] ?? null;
};
const task2Type = prompt => {
  const s = prompt.toLowerCase().replace(/(you should )?give reasons for your answer[^.?!]*[.?!]?/g, ' ').replace(/write at least \d+ words\.?/g, ' ');
  if (/discuss both|both (these )?views|both sides|discuss (these|the two)|compare (these|the) two views/.test(s)) return 'discuss';
  if (/agree or disagree|do you (agree|disagree)|to what extent do you (agree|disagree)/.test(s)) return 'opinion';
  if (/outweigh|\badvantages?\b[^.?!]*\bdisadvantages?\b|\bdisadvantages?\b[^.?!]*\badvantages?\b/.test(s)) return 'adv_dis';
  if (/\b(causes?|reasons?|problems?|solutions?|measures?)\b|what (can|could|should) be done|effects? (does|do|has|have|will)/.test(s) && !/positive or (a )?negative/.test(s)) return 'problem';
  if ((s.match(/\?/g) ?? []).length >= 2) return 'two_part';
  return 'opinion';
};

// guide_html = Vietnamese outline + (after the last <hr>) the English model answer
const splitGuide = g => {
  if (!g) return { guideHtml: '', sampleHtml: '' };
  const i = g.lastIndexOf('<hr>');
  const tail = i >= 0 ? g.slice(i + 4) : '';
  const vi = (stripHtml(tail).match(/[À-ỹ]/g) || []).length;
  if (tail && vi < 10 && stripHtml(tail).split(' ').length > 60) return { guideHtml: g.slice(0, i), sampleHtml: tail };
  return { guideHtml: g, sampleHtml: '' };
};

const rows = rd('src/data/ieltsWriting100.json');
const byYp = new Map();
for (const r of rows) if (!byYp.has(r.youpass_id)) byYp.set(r.youpass_id, r); // dedupe (raw crawl has a few duplicate rows)
const uniq = [...byYp.values()];

const tests = [];
for (const r of uniq) {
  if (!r.is_visible || !['task1', 'task2'].includes(r.task_type)) continue;
  const task = r.task_type === 'task1' ? 1 : 2;
  const prompt = stripHtml(r.description);
  const type = task === 1 ? (TYPES.find(([, p]) => p === r.youpass_id.split('-')[0])?.[0] ?? null) : task2Type(prompt);
  const title = stripHtml(r.title).replace(/^\s*(bar charts?|line graphs?|pie charts?|tables?|mixed( graphs?| charts?)?|maps?|process(es)?|diagrams?)\s*:\s*/i, '') || prompt.slice(0, 90);
  const image = media(r.cloudinary_url || r.thumbnail_url);
  const item = { id: r.youpass_id, task, title, prompt, image, type, topic: task === 2 ? task2Topic(r.youpass_id) : null,
    num: Number(r.youpass_id.match(/(\d+)\s*$/)?.[1] ?? 9999) };
  tests.push(item);
  write(`tests/${r.youpass_id}.json`, {
    ...item,
    band: r.band_level || null,
    ...splitGuide(fixHtmlMedia(r.guide_html).replace(/\\([.+\-*#()[\]])/g, '$1')),
    chartDescription: r.chart_description || '',
  });
}
const typeOrder = new Map(TYPES.map(([k], i) => [k, i]));
tests.sort((a, b) => a.task - b.task || (a.task === 1 ? (typeOrder.get(a.type) ?? 99) - (typeOrder.get(b.type) ?? 99) : 0) || a.num - b.num || a.id.localeCompare(b.id));
write('tests-index.json', tests);

// ---------- 2. Writing builder (rows with a logical frame: Introduction / Overview / Body ...) ----------
const builder = [];
for (const r of uniq) {
  if (!Array.isArray(r.logical_frame) || !r.logical_frame.length) continue;
  const id = r.youpass_id;
  const sections = [...r.logical_frame].sort((a, b) => a.sort - b.sort)
    .map(f => ({ name: f.name.trim() === '1' ? 'Introduction' : f.name.trim(), paragraphs: paras(f.value) }))
    .filter(s => s.paragraphs.length);
  if (!sections.length) continue;
  const prompt = paras((r.description || '').replace(/<img[^>]*>/g, ''));
  const imgInDesc = (r.description || '').match(/<img[^>]*src="([^"]+)"/)?.[1];
  const title = stripHtml(r.title).replace(/^Luyện đề IELTS Writing Task 1:\s*/i, '');
  const item = {
    id, title,
    kind: r.task_type === 'task_builder' ? 'builder' : 'task1',
    image: media(r.cloudinary_url || r.thumbnail_url || imgInDesc),
    tag: (title.match(/^\s*\[([^\]]+)\]/) || [])[1] || null,
    sections: sections.length,
  };
  builder.push(item);
  write(`builder/${id}.json`, { ...item, prompt, frame: sections });
}
write('builder-index.json', builder);

// ---------- 3. Dịch câu exercises ----------
const list = rd('scripts/live/api/dich-cau.json').exercises;
const primary = new Map(rd('src/data/ieltsWritingDichCau.json').map(e => [e.exercise_id, e]));
const backup = rd('src/data/ieltsTranslationExercises.json');
const BAD = /�/;
// Word frequency over all Vietnamese/English text, used to repair words that lost bytes in the original crawl.
const freq = new Map();
const allText = [];
for (const e of [...primary.values(), ...Object.values(backup)]) for (const s of e.sentences || []) allText.push(s.vi || '', s.answer || '', s.hint || '');
for (const t of allText) for (const w of t.split(/[\s.,;:!?()"“”]+/)) if (w && !BAD.test(w)) freq.set(w, (freq.get(w) || 0) + 1);
const repairWord = w => {
  const re = new RegExp('^' + w.split(/�+/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.') + '$');
  let best = null, bc = 0;
  for (const [k, c] of freq) if (c > bc && re.test(k)) { best = k; bc = c; }
  return best;
};
let repaired = 0, unrepaired = 0;
const repair = str => (str || '').replace(/[^\s.,;:!?()"“”]*�+[^\s.,;:!?()"“”]*/g, w => {
  const r = repairWord(w);
  if (r) { repaired++; return r; }
  unrepaired++; return w.replace(/�+/g, '');
});
const dcIndex = [];
for (const meta of list) {
  const p = primary.get(meta.exercise_id);
  const b = backup[meta.exercise_id];
  const locked = !p?.sentences; // e.g. Bước 5 essays other than Education are TIDian/Premium-only on the site
  let sentences = [];
  if (!locked) {
    sentences = p.sentences.map((s, i) => {
      const alt = b?.created_at && b.sentences?.length === p.sentences.length ? b.sentences[i] : null; // only trust real backup rows
      const pick = k => (BAD.test(s[k] || '') && alt && alt[k] && !BAD.test(alt[k]) && alt[k].trim() ? alt[k] : s[k]) || '';
      return { vi: repair(pick('vi')).trim(), hint: repair(pick('hint')).trim(), answer: repair(pick('answer')).trim() };
    });
    write(`dichcau/${meta.exercise_id}.json`, {
      id: p.id, exerciseId: meta.exercise_id, title: p.title, band: meta.band_target, topic: p.topic || {}, sentences,
    });
  }
  dcIndex.push({ id: meta.exercise_id, title: meta.title, band: meta.band_target, order: meta.order_index, count: sentences.length, locked });
}
write('dichcau-index.json', dcIndex);

// ---------- 4. Band-8 sample essays (index only: the essay bodies were never downloaded) ----------
const html = fs.readFileSync(path.join(ROOT, 'scripts/live/_practice_writing_bai-mau.html'), 'utf8');
const samples = [];
const re = /\\"id\\":\\"(band8-[a-z-]+-\d+)\\",\\"slug\\":\\"([a-z-]+)\\",\\"topicEn\\":\\"([^\\]+)\\",\\"topicVi\\":\\"([^\\]+)\\",\\"num\\":(\d+),\\"question\\":\\"((?:[^\\]|\\\\.)*?)\\",\\"sentences\\":(\d+)/g;
let m;
while ((m = re.exec(html))) {
  if (samples.some(s => s.id === m[1])) continue;
  samples.push({ id: m[1], slug: m[2], topicEn: m[3], topicVi: m[4], num: +m[5], question: m[6].replace(/\\\\(.)/g, '$1'), sentences: +m[7] });
}
const chunk = fs.readFileSync(path.join(ROOT, 'scripts/live/chunks/3h09ojqw5r7ls.js'), 'utf8');
const brk = JSON.parse(chunk.match(/let a=(\{"band8-education-1"[^}]*\})/)[1]);
for (const s of samples) s.breaks = brk[s.id] || null;

// Essay bodies captured in the user's HAR files (only the essays that were opened in the browser)
const harDir = path.join(ROOT, 'chế độ học');
const bodies = new Map();
for (const f of fs.existsSync(harDir) ? fs.readdirSync(harDir).filter(x => x.endsWith('.har')) : []) {
  let har;
  try { har = JSON.parse(fs.readFileSync(path.join(harDir, f), 'utf8')); } catch { continue; }
  for (const e of har.log?.entries ?? []) {
    if (!/\/api\/band8\?topic=[^&]+&essay=\d+/.test(e.request?.url ?? '')) continue;
    let j;
    try { j = JSON.parse(e.response?.content?.text ?? ''); } catch { continue; }
    if (j?.essay?.essay_id && Array.isArray(j.essay.sentences) && j.essay.sentences.length) bodies.set(j.essay.essay_id, j.essay);
  }
}
for (const s of samples) {
  const b = bodies.get(s.id);
  s.hasBody = !!b;
  if (b) write(`samples/${s.id}.json`, { id: s.id, slug: b.topic_slug, num: b.essay_number, question: b.question,
    sentences: b.sentences.map(x => ({ vi: x.vi, answer: x.answer })) });
}
write('samples-index.json', samples);

console.log({ tests: tests.length, t1: tests.filter(t => t.task === 1).length, t2: tests.filter(t => t.task === 2).length,
  builder: builder.length, dichcau: dcIndex.length, dichcauLocked: dcIndex.filter(d => d.locked).length, repaired, unrepaired, samples: samples.length, sampleBodies: bodies.size });
