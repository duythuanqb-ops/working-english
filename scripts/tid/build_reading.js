#!/usr/bin/env node
// Build the READING area data (src/data/tid/reading/) from LOCAL files only — no network access.
//
//   node scripts/tid/build_reading.js
//
// Sources (all local):
//   scripts/live/api/reading-list.json      list of all 567 reading tests (id, title, band, question types)
//   scripts/live/api/gap-reading.json       gap-filling index (which questions of a passage are gap questions)
//   scripts/live/api/bilingual.json         "Đọc báo song ngữ" articles (EN/VI paragraphs)
//   scripts/live/chunks/01-eupj01tz45.js    site catalog module (Cambridge / Vol / Essential Words / Workbook)
//   src/data/ieltsReadingAll.json           older crawl: passages + questions (no answer keys)
//   scripts/tid/build_reading.snapshot.json passages + answer keys kept from an earlier crawl run
//
// Output:
//   index.json            one row per test (567) with content/key flags
//   catalog.json          hub catalog (tabs, test cards, units)
//   gap.json              gap-filling index
//   tests/<id>.json       passage html + normalized questions (lazy-loaded)
//   articles-index.json   article cards (no body)
//   articles/<id>.json    article body (lazy-loaded)
const fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'src/data/tid/reading');
const LIVE = path.join(ROOT, 'scripts/live');
const LEGACY = path.join(ROOT, 'src/data/ieltsReadingAll.json');
const SNAPSHOT = path.join(__dirname, 'build_reading.snapshot.json');

const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d)); };
const safe = id => id.replace(/[^A-Za-z0-9_.-]/g, '_') || '_';

// ---------- catalog from the site's JS chunk ----------
function extractCatalog() {
  const src = fs.readFileSync(path.join(LIVE, 'chunks/01-eupj01tz45.js'), 'utf8');
  const start = src.indexOf('689256,e=>{');
  if (start < 0) throw new Error('catalog module not found in chunk');
  const bodyStart = start + '689256,e=>{'.length;
  // the module body ends right before the next ",<id>,e=>{" (or the chunk end)
  const re = /\},(\d+),e=>\{/g;
  re.lastIndex = bodyStart;
  const m = re.exec(src);
  const body = src.slice(bodyStart, m ? m.index : src.lastIndexOf('}'));
  const exports = {};
  const e = { s: arr => { for (let i = 0; i < arr.length; i += 3) exports[arr[i]] = arr[i + 2]; } };
  new Function('e', body)(e); // eslint-disable-line no-new-func
  const { cambridgeTests, deVolTests, essentialWordsUnits, workbookTests, workbookUnits } = exports;
  if (!cambridgeTests?.length) throw new Error('catalog: no cambridgeTests');
  return { cambridgeTests, deVolTests, essentialWordsUnits, workbookTests, workbookUnits };
}

// ---------- tests ----------
function seriesOf(id) {
  let m;
  if ((m = id.match(/^cam-(\d+)-(\d+)-(\d+)$/))) return { series: 'cam', book: +m[1], test: +m[2], passage: +m[3] };
  if ((m = id.match(/^ew-(\d+)-(\d+)$/))) return { series: 'ew', book: +m[1], test: null, passage: +m[2] };
  if ((m = id.match(/^tid-wb-final-basic-(\d+)-(\d+)$/))) return { series: 'wb', book: 'final-basic', test: +m[1], passage: +m[2] };
  if ((m = id.match(/^tid-wb-(\d+)-(\d+)([a-z]?)$/))) return { series: 'wb', book: +m[1], test: null, passage: +m[2] };
  if ((m = id.match(/^tid-vol-(\d+)-(\d+)$/))) return { series: 'vol', book: +m[1], test: +m[1], passage: +m[2] };
  if ((m = id.match(/^tid-(\d+)-(\d+)-(\d+)$/))) return { series: 'tid', book: +m[1], test: +m[2], passage: +m[3] };
  if ((m = id.match(/^passage_p(\d+)_c(\d+)$/))) return { series: 'passage', book: +m[2], test: null, passage: +m[1] };
  if (/^IELTS_/.test(id)) return { series: 'topic', book: null, test: null, passage: null };
  return { series: 'other', book: null, test: null, passage: null };
}

// Same type normalisation the site's player applies.
function normType(t) {
  t = String(t || '').toLowerCase().replace(/[\s_\-/]+/g, '');
  if (['multiplechoice', 'mc', 'singlechoice', 'multiplecoice'].includes(t)) return 'multiple-choice';
  if (t.includes('yesno')) return 'ynng';
  if (t === 'tfng' || t.includes('truefals')) return 'tfng';
  if (t.includes('fill') || t.includes('blank') || t === 'completion' || t.includes('sentence') || t.includes('summary')) return 'fill-blank';
  if (t === 'matchinginfo') return 'matching-info';
  if (t === 'matchingfeature') return 'matching-feature';
  if (t.includes('match')) return 'fill-blank';
  return t;
}

// Drop the editor's empty placeholder fields from a block config.
function cleanBlock(b) {
  if (!b) return undefined;
  const c = {};
  for (const [k, v] of Object.entries(b)) {
    if (v === '' || v == null) continue;
    if (Array.isArray(v) && v.every(x => x === '' || (Array.isArray(x) && x.every(y => y === '')))) continue;
    if (k === 'featureOptions' && v.every(x => /^Option [A-Z]$/.test(x))) continue;
    if (k === 'tableHeaders' && v.every(x => /^Cột \d+$/.test(x))) continue;
    if (k === 'sentenceItems' && v.length === 1 && /sentence with blank/.test(v[0])) continue;
    c[k] = v;
  }
  return Object.keys(c).length ? c : undefined;
}

function normalizeQuestion(q, i) {
  let text = (q.text || q.question || q.question_text || (q.paragraph ? `Match the correct heading for Paragraph ${q.paragraph}` : ''))
    .replace(/^\d+[.)]\s*/, '').replace(/^\d+\s+(?=[A-Z])/, '').trim();
  const mp = text.match(/^Paragraph\s+([A-Z])$/i);
  if (mp) text = `Choose the correct heading for Paragraph ${mp[1].toUpperCase()}. Write the heading number.`;
  const out = {
    id: q.id || q.number || i + 1, type: normType(q.type), displayType: q.displayType || q.display_type || '', question: text,
    questionHtml: q.questionHtml || q.question_html || '', groupId: q.groupId || q.group_id || '',
    groupHtml: q.groupHtml || q.group_html || '', blockId: q.blockId || q.block_id || '', blockTitle: q.blockTitle || q.block_title || '',
    options: q.options || [], sectionOptions: q.sectionOptions || [], phraseOptions: q.phraseOptions || [],
    block: cleanBlock(q._blockConfig),
  };
  for (const f of Object.keys(out)) if (out[f] === '' || (Array.isArray(out[f]) && !out[f].length) || out[f] === undefined) delete out[f];
  return out;
}

function buildTests() {
  const list = readJson(path.join(LIVE, 'api/reading-list.json')).rows;
  const legacy = new Map(readJson(LEGACY).map(r => [r.youpass_id, r]));
  const snapshot = fs.existsSync(SNAPSHOT) ? readJson(SNAPSHOT).tests : {};
  fs.rmSync(path.join(OUT, 'tests'), { recursive: true, force: true });
  const index = [];
  const stats = { rows: 0, content: 0, key: 0, fromSnapshot: 0, fromLegacy: 0 };
  for (const row of list) {
    const id = row.youpass_id;
    if (!id) continue;
    const s = seriesOf(id);
    const entry = { id, title: (row.title || '').trim(), ...s, band: row.band_level || '', types: row.question_types || [] };
    let test = null;
    if (snapshot[id]?.html) {
      test = { ...snapshot[id], ...s, band: entry.band, types: entry.types };
      stats.fromSnapshot++;
    } else if (legacy.get(id)?.content_html) {
      const r = legacy.get(id);
      test = {
        id, title: r.title || entry.title, ...s, band: entry.band, types: entry.types,
        html: r.content_html, questions: (r.questions || []).map(normalizeQuestion), hasKey: false,
      };
      stats.fromLegacy++;
    }
    if (test) {
      writeJson(path.join(OUT, 'tests', safe(id) + '.json'), test);
      entry.q = test.questions.length;
      entry.content = 1;
      stats.content++;
      if (test.hasKey) { entry.key = 1; stats.key++; }
    }
    if (id === 'ew-test') entry.hidden = 1; // placeholder row on the site ("test")
    index.push(entry);
    stats.rows++;
  }
  writeJson(path.join(OUT, 'index.json'), index);
  console.log('tests', stats);
}

// ---------- bilingual articles ----------
const plain = t => String(t || '').replace(/\[IMG:[^\]]*\]/g, '').replace(/\[([^\]]+)\]\{[^}]*\}/g, '$1').replace(/\*\*?/g, '').trim();

function buildArticles() {
  const arts = readJson(path.join(LIVE, 'api/bilingual.json')).articles || [];
  fs.rmSync(path.join(OUT, 'articles'), { recursive: true, force: true });
  const idx = [];
  for (const a of arts) {
    const tidy = k => (typeof a[k] === 'string' ? a[k].trim() : a[k]);
    const content = (a.content || []).filter(c => c && (c.en || c.vi));
    const first = content.find(c => c.en && !/^\[IMG:/.test(c.en) && plain(c.en).length > 60);
    const meta = {
      id: a.id, sourceId: a.source_id, category: tidy('category'), categoryVi: tidy('category_vi'), title: tidy('title'), titleVi: tidy('title_vi'),
      excerpt: a.excerpt || (first ? plain(first.en).slice(0, 200) : ''), excerptVi: a.excerpt_vi || (first ? plain(first.vi).slice(0, 200) : ''),
      image: a.image_url || '', author: tidy('author') || 'TID Editor', readTime: tidy('read_time') || '10 mins', viewCount: a.view_count || 0,
      sourceUrl: a.source_url || '', sourceLabel: a.source_label || '', createdAt: a.created_at, paragraphs: content.length,
    };
    for (const k of Object.keys(meta)) if (meta[k] === '' || meta[k] == null) delete meta[k];
    idx.push(meta);
    writeJson(path.join(OUT, 'articles', safe(a.id) + '.json'), { id: a.id, content });
  }
  writeJson(path.join(OUT, 'articles-index.json'), idx);
  console.log('articles', idx.length);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const catalog = extractCatalog();
  writeJson(path.join(OUT, 'catalog.json'), catalog);
  console.log('catalog', Object.fromEntries(Object.entries(catalog).map(([k, v]) => [k, v.length])));
  buildTests();
  const gap = readJson(path.join(LIVE, 'api/gap-reading.json'));
  writeJson(path.join(OUT, 'gap.json'), gap.items || gap);
  console.log('gap items', (gap.items || gap).length);
  buildArticles();
}

main();
