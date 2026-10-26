#!/usr/bin/env node
// Builds src/data/tid/vocabulary/** and public/assets/tid/vocabulary/** for the TID vocabulary area.
//
// OFFLINE ONLY: reads nothing but files already on disk — the pages the user saved from their browser
// (html/*.html + *_files/) and the old crawled JSON in src/data. No network access of any kind.
//
// Sources (Turbopack chunks inside the saved pages' _files folders; parsed with @babel/parser, never executed):
//   vocabSets            -> "Chủ đề" (11 topic sets)        + POST /api/flashcard/extras captured in ieltsFlashcardExtras.json
//   vocabBooks           -> "4k vocab books" (6 books, units)
//   idiomThemes          -> "Thành ngữ" (17 themes, 300 idioms)
//   phrasalSets          -> "Phrasal Verbs" (22 sets, 550)
//   oxfordLevels         -> "Oxford 3000" (A1–B2, units, 3310 words)
//   cambridgeBooks       -> "Cambridge" (Cam 10–19, passages)
//   tidVocabCollections  -> "TID Vocabulary" (2 collections, units)
// Card copy / colours / photos / art words come from the rendered dashboard DOM (pages 25, 42, 43).
//
// Usage: node scripts/tid/build_vocabulary.js
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');

const ROOT = path.join(__dirname, '..', '..');
const HTML = path.join(ROOT, 'html');
const OUT = path.join(ROOT, 'src/data/tid/vocabulary');
const ASSETS = path.join(ROOT, 'public/assets/tid/vocabulary');

// ---------- helpers ----------
const savedFiles = fs.readdirSync(HTML).filter(f => f.endsWith('_files')).map(f => path.join(HTML, f));
const savedPage = n => path.join(HTML, fs.readdirSync(HTML).find(f => f.startsWith(String(n)) && /^\d+The.*\.html$/.test(f)));
/** Find a saved chunk file that exports `name` (first match across all _files folders). */
function findChunk(name) {
  for (const dir of savedFiles) {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.js')) continue;
      const p = path.join(dir, f);
      const src = fs.readFileSync(p, 'utf8');
      if (src.includes(`"${name}",0,`) || src.includes(`"${name}",()=>`)) return src;
    }
  }
  throw new Error(`chunk exporting ${name} not found`);
}

/** Convert a literal AST node to plain JSON. Anything non-literal (identifiers, calls…) becomes null. */
function lit(n, scope) {
  if (!n) return null;
  switch (n.type) {
    case 'StringLiteral': case 'NumericLiteral': case 'BooleanLiteral': return n.value;
    case 'NullLiteral': return null;
    case 'TemplateLiteral': return n.expressions.length ? null : n.quasis.map(q => q.value.cooked).join('');
    case 'UnaryExpression':
      if (n.operator === '-') { const v = lit(n.argument, scope); return typeof v === 'number' ? -v : null; }
      if (n.operator === '!') { const v = lit(n.argument, scope); return v === null ? null : !v; }
      return null;
    case 'ArrayExpression': {
      const out = [];
      for (const el of n.elements) {
        if (el && el.type === 'SpreadElement') { const v = lit(el.argument, scope); if (Array.isArray(v)) out.push(...v); }
        else out.push(lit(el, scope));
      }
      return out;
    }
    case 'ObjectExpression': {
      const o = {};
      for (const p of n.properties) {
        if (p.type !== 'ObjectProperty') continue;
        const k = p.key.type === 'Identifier' ? p.key.name : lit(p.key, scope);
        o[k] = lit(p.value, scope);
      }
      return o;
    }
    case 'Identifier': return scope && scope[n.name] ? lit(scope[n.name], null) : null;
    default: return null;
  }
}

function walk(node, fn) {
  if (!node || typeof node.type !== 'string') return;
  fn(node);
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walk(c, fn));
    else if (v && typeof v.type === 'string') walk(v, fn);
  }
}

/** Extract the value exported as `name` from a Turbopack chunk (e.s(["name",0,value]) form). */
function exported(name) {
  const ast = parse(findChunk(name), { sourceType: 'script', errorRecovery: true });
  let result;
  walk(ast, node => {
    if (result !== undefined || node.type !== 'FunctionExpression' && node.type !== 'ArrowFunctionExpression') return;
    // module factory: collect top-level declarators, then look for the e.s([...]) call
    const body = node.body && node.body.body;
    if (!Array.isArray(body)) return;
    const scope = {};
    let call = null;
    for (const st of body) {
      if (st.type === 'VariableDeclaration') st.declarations.forEach(d => { if (d.id.type === 'Identifier') scope[d.id.name] = d.init; });
      walk(st, x => {
        if (call || x.type !== 'CallExpression' || x.callee.type !== 'MemberExpression' || x.callee.property.name !== 's') return;
        const arr = x.arguments[0];
        if (arr && arr.type === 'ArrayExpression' && arr.elements.some(e => e && e.type === 'StringLiteral' && e.value === name)) call = arr;
      });
      if (st.type === 'VariableDeclaration') {
        // `let i=[...]` may be declared in a sequence with other declarators
        st.declarations.forEach(d => { if (d.id.type === 'Identifier') scope[d.id.name] = d.init; });
      }
    }
    if (!call) return;
    const idx = call.elements.findIndex(e => e && e.type === 'StringLiteral' && e.value === name);
    result = lit(call.elements[idx + 2], scope);
  });
  if (result == null) throw new Error(`could not read export ${name}`);
  return result;
}

/** vocabSets is not exported literally (the factory exports `m`), so read the `let m=[{title:"Set 1"…}]` array. */
function vocabSets() {
  const ast = parse(findChunk('vocabSets'), { sourceType: 'script', errorRecovery: true });
  let out = null;
  walk(ast, n => {
    if (out || n.type !== 'VariableDeclarator' || !n.init || n.init.type !== 'ArrayExpression') return;
    const first = n.init.elements[0];
    if (first && first.type === 'ObjectExpression' && first.properties.some(p => p.key && p.key.name === 'title' && p.value.value === 'Set 1')) out = lit(n.init);
  });
  return out;
}

function writeJson(rel, data) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
  return fs.statSync(file).size;
}
const clean = s => (s == null ? '' : String(s).replace(/\s+/g, ' ').trim());

// ---------- dashboard DOM (card copy, colours, photos, art words) ----------
function domCards(n) {
  const html = fs.readFileSync(savedPage(n), 'utf8');
  const cards = [];
  const start = '<(?:a|button)\\b[^>]*class="td-pop group relative isolate flex min-h-\\[400px\\]';
  const re = new RegExp(`${start}[\\s\\S]*?(?=${start}|<\/main>|<script|<next-route-announcer|$)`, 'g');
  let m;
  const txt = s => clean(s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'"));
  while ((m = re.exec(html))) {
    const c = m[0];
    const bg = (c.match(/style="[^"]*?background: (rgb\([^)]*\))/) || [])[1];
    const photo = (c.match(/<img\b[^>]*class="absolute inset-0 -z-20[^"]*"[^>]*src="[^"]*\/([a-z0-9_-]+)\.webp"/) || [])[1] || null;
    const title = txt((c.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || '');
    const desc = txt((c.match(/<p class="m-0[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '');
    const meta = txt((c.match(/uppercase tracking-\[0\.04em\][^>]*>([\s\S]*?)<\/span>/) || [])[1] || '');
    const href = (c.match(/href="([^"]+)"/) || [])[1] || null;
    // art words: every leaf text of the illustration area, minus counters/labels
    const art = c.slice(c.indexOf('min-h-[220px]'));
    const words = [...art.matchAll(/>([^<>]+)</g)].map(x => txt(x[1]))
      .filter(t => t && !/^[A-Z]$|^[+\d]+%?$|^(Đã thuộc|Tổng từ|Liên quan|Thành ngữ|A1|A2|B1|B2|Thêm từ của bạn)$|thành ngữ$|^Nghĩa của|^Xem cùng/.test(t));
    const letters = [...c.matchAll(/<span class="flex h-\[44px\] w-\[38px\][^>]*>([A-Z])<\/span>/g)].map(x => x[1]).join('');
    const chat = [...c.matchAll(/rounded-\[18px_18px_(?:18px_4px|4px_18px)\][^>]*>([^<]+)<\/span>/g)].map(x => txt(x[1]));
    cards.push({ href, bg, photo, title, desc, meta, words, letters, chat });
  }
  return cards;
}

// ---------- normalisers ----------
const PALETTE = ['#c49bff', '#9fd3ef', '#bfe6c3', '#ff7a3d', '#ffba3b', '#8587f8', '#ff9ec1', '#86dccb'];
const ART = ['list', 'letters', 'rings', 'chat', 'docs', 'donut', 'stats', 'path', 'stickers', 'wordcard'];
const rgbHex = s => {
  const m = s && s.match(/(\d+), (\d+), (\d+)/);
  return m ? '#' + m.slice(1).map(x => (+x).toString(16).padStart(2, '0')).join('') : null;
};
function card(i, extra) {
  return { color: PALETTE[i % PALETTE.length], art: ART[i % ART.length], ...extra };
}
/** Pick a few preview words spread through a deck (deterministic). */
function previewWords(words, n = 4) {
  const ws = words.map(w => w.w).filter(Boolean);
  if (ws.length <= n) return ws;
  return Array.from({ length: n }, (_, k) => ws[Math.floor((k * ws.length) / n)]);
}
function lettersWord(words) {
  const w = words.map(x => x.w).find(x => /^[a-z]{5,7}$/i.test(x));
  return (w || 'VOCAB').toUpperCase();
}
const posOf = p => clean(p).replace(/\.$/, '');

// ---------- build ----------
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const report = [];
  const dump = (rel, data, n) => report.push(`${rel.padEnd(32)} ${String(n).padStart(5)} items  ${(writeJson(rel, data) / 1024).toFixed(1)} KB`);

  // ----- 1) Chủ đề (topic sets) + flashcard extras captured from the site -----
  const sets = vocabSets();
  const extrasFile = path.join(ROOT, 'src/data/ieltsFlashcardExtras.json');
  const extras = fs.existsSync(extrasFile) ? JSON.parse(fs.readFileSync(extrasFile, 'utf8')).extras || [] : [];
  // the captured extras array is aligned with set index 1 (Môi trường & Sinh thái) word order
  const domTopics = domCards(25).filter(c => c.href);
  const topics = [];
  sets.forEach((s, idx) => {
    const words = s.words.map((w, j) => {
      const x = idx === 1 ? extras[j] || {} : {};
      const r = x.relations || {};
      return {
        w: clean(w.word), ipa: clean(w.ipa || x.ipa), pos: posOf(w.pos), vi: clean(w.definition), ex: clean(w.example),
        ...(x.exampleVi ? { exVi: x.exampleVi } : {}),
        ...(r.synonyms?.length ? { syn: r.synonyms } : {}),
        ...(r.antonyms?.length ? { ant: r.antonyms } : {}),
        ...(r.forms?.length ? { forms: r.forms } : {}),
      };
    });
    const id = `topic-${idx}`;
    dump(`decks/${id}.json`, { id, title: s.topic, words }, words.length);
    const dom = domTopics.find(c => c.href.endsWith(`set=${idx}`));
    topics.push({ idx, dom, words, id });
  });
  // the site lists the topic cards in DOM order (set=1 first)
  const topicCards = domTopics.map((dom, i) => {
    const t = topics.find(x => dom.href.endsWith(`set=${x.idx}`));
    return card(i, {
      id: t.id, deck: t.id, title: dom.title, desc: dom.desc, deckTitle: sets[t.idx].topic, count: t.words.length,
      color: rgbHex(dom.bg), photo: dom.photo, words: dom.words.length ? dom.words : previewWords(t.words),
      letters: dom.letters || undefined, chat: dom.chat.length ? dom.chat : undefined,
    });
  });

  // ----- 2) 4k vocab books -----
  const books = exported('vocabBooks');
  const bookCards = books.map((b, i) => {
    const id = `book-${b.book}`;
    const units = b.units.map(u => ({
      id: `${id}-u${u.unit}`, label: `Unit ${u.unit}`,
      words: u.words.map(w => ({ w: clean(w.word), ipa: clean(w.ipa), pos: posOf(w.pos), vi: clean(w.definition), ex: clean(w.example) })),
    }));
    const all = units.flatMap(u => u.words);
    dump(`decks/${id}.json`, { id, title: b.title, units }, all.length);
    return card(i, {
      id, deck: id, title: b.title, desc: clean(b.description), deckTitle: b.title, count: all.length,
      unitCount: units.length, units: units.map(u => ({ id: u.id, label: u.label, count: u.words.length })),
      photo: ['openbook', 'books', 'library', 'notebook', 'students', 'brain'][i % 6], words: previewWords(all), letters: lettersWord(all),
    });
  });

  // ----- 3) Thành ngữ (idioms) -----
  const idioms = exported('idiomThemes');
  const domIdioms = domCards(42);
  const idiomCards = idioms.map((t, i) => {
    const id = `idiom-${i + 1}`;
    const words = t.idioms.map(x => ({ w: clean(x.idiom), pos: 'idiom', vi: clean(x.meaning_vi), en: clean(x.meaning_en), ex: clean(x.example) }));
    dump(`decks/${id}.json`, { id, title: t.titleVi, words }, words.length);
    const dom = domIdioms[i] || {};
    return card(i, {
      id, deck: id, title: dom.title || t.titleVi, desc: dom.desc || clean(t.description), deckTitle: `Thành ngữ · ${t.titleVi}`,
      count: words.length, theme: t.theme, color: rgbHex(dom.bg) || PALETTE[i % 8], photo: dom.photo || null,
      words: dom.words?.length ? dom.words : previewWords(words), letters: dom.letters || undefined, chat: dom.chat?.length ? dom.chat : undefined,
    });
  });

  // ----- 4) Phrasal verbs -----
  const phrasal = exported('phrasalSets');
  const pvPhotos = ['road', 'construct', 'talk', 'hands', 'people', 'clock', 'coins', 'brain'];
  const phrasalCards = phrasal.map((s, i) => {
    const id = `phrasal-${s.setNumber}`;
    const words = s.verbs.map(x => ({ w: clean(x.phrasal_verb), pos: 'phr.v', vi: clean(x.meaning_vi), en: clean(x.meaning_en), ex: clean(x.example) }));
    dump(`decks/${id}.json`, { id, title: s.title, words }, words.length);
    return card(i, {
      id, deck: id, title: s.title, desc: `Cụm động từ ${s.range} theo thứ tự A–Z.`, deckTitle: s.title, count: words.length,
      photo: pvPhotos[i % pvPhotos.length], words: previewWords(words), letters: 'PHRASAL',
    });
  });

  // ----- 5) Oxford 3000 -----
  const oxford = exported('oxfordLevels');
  const domOx = domCards(43);
  const oxfordCards = oxford.map((l, i) => {
    const id = `oxford-${l.level.toLowerCase()}`;
    const units = l.units.map(u => ({
      id: `${id}-u${u.unit}`, label: `Unit ${u.unit}`,
      words: u.words.map(w => ({ w: clean(w.word), ipa: clean(w.ipa), pos: posOf(w.pos), vi: clean(w.definition), ex: clean(w.example) })),
    }));
    const all = units.flatMap(u => u.words);
    dump(`decks/${id}.json`, { id, title: l.title, units }, all.length);
    const dom = domOx[i] || {};
    return card(i, {
      id, deck: id, title: dom.title || l.title, desc: dom.desc || clean(l.description), deckTitle: l.title, level: l.level,
      count: all.length, unitCount: units.length, units: units.map(u => ({ id: u.id, label: u.label, count: u.words.length })),
      color: rgbHex(dom.bg) || PALETTE[i % 8], photo: dom.photo || null,
      words: dom.words?.length ? dom.words.filter(w => w !== l.level) : previewWords(all), letters: dom.letters || lettersWord(all), chat: dom.chat?.length ? dom.chat : undefined,
    });
  });

  // ----- 6) Cambridge (one deck per book, units = passages) -----
  const cam = exported('cambridgeBooks');
  const camPhotos = ['library', 'openbook', 'books', 'notebook', 'students', 'ruins', 'earth', 'forest', 'city', 'tech'];
  const camCards = cam.map((b, i) => {
    const id = `cam-${b.book}`;
    const units = b.passages.map(p => ({
      id: `${id}-t${p.test}p${p.passage}`, label: clean(p.label), title: clean(p.title),
      words: p.words.map(w => ({ w: clean(w.word), pos: posOf(w.pos), vi: clean(w.definition), ex: clean(w.example) })),
    }));
    const all = units.flatMap(u => u.words);
    dump(`decks/${id}.json`, { id, title: b.title, units }, all.length);
    return card(i, {
      id, deck: id, title: b.title, desc: clean(b.description), deckTitle: b.title, count: all.length,
      unitCount: units.length, units: units.map(u => ({ id: u.id, label: u.label, count: u.words.length })),
      photo: camPhotos[i % camPhotos.length], words: previewWords(all), letters: lettersWord(all),
    });
  });

  // ----- 7) TID Vocabulary -----
  const tid = exported('tidVocabCollections');
  const tidCards = tid.map((c, i) => {
    const id = `tid-${c.key}`;
    const units = c.units.map(u => ({
      id: `${id}-u${u.unit}`, label: clean(u.title),
      // the collection's `example` is a Vietnamese sentence that uses the English word (code-switching practice)
      words: u.words.map(w => ({ w: clean(w.word), vi: clean(w.definition), en: clean(w.definition_en), ex: clean(w.example) })),
    }));
    const all = units.flatMap(u => u.words);
    dump(`decks/${id}.json`, { id, title: c.title, units }, all.length);
    return card(i, {
      id, deck: id, title: c.title, desc: clean(c.description), deckTitle: c.title, count: all.length,
      unitCount: units.length, units: units.map(u => ({ id: u.id, label: u.label, count: u.words.length })),
      photo: ['students', 'openbook'][i % 2], words: previewWords(all), letters: lettersWord(all),
    });
  });

  const sum = cs => cs.reduce((a, c) => a + c.count, 0);
  const index = {
    source: 'theieltsdictionary.com — saved pages (offline extraction)',
    tabs: [
      { id: 'topics', label: 'Chủ đề', badge: `${topicCards.length} bộ`, eyebrow: 'Bộ từ vựng · IELTS', heading: 'Chọn bộ từ để bắt đầu học', total: sum(topicCards) },
      { id: 'books', label: '4k vocab books', badge: `${bookCards.length} bộ`, eyebrow: '4000 Essential Words', heading: `${bookCards.length} cuốn · ${sum(bookCards)} từ`, total: sum(bookCards) },
      { id: 'idioms', label: 'Thành ngữ', badge: String(sum(idiomCards)), eyebrow: 'Thành ngữ · Idioms', heading: `${idiomCards.length} chủ đề · ${sum(idiomCards)} thành ngữ`, total: sum(idiomCards), multi: true },
      { id: 'phrasal', label: 'Phrasal Verbs', badge: String(sum(phrasalCards)), eyebrow: 'Phrasal verbs', heading: `${phrasalCards.length} bộ · ${sum(phrasalCards)} cụm động từ`, total: sum(phrasalCards), multi: true },
      { id: 'oxford', label: 'Oxford 3000', badge: String(sum(oxfordCards)), eyebrow: 'Oxford 3000 · CEFR', heading: `${oxfordCards.length} trình độ · ${sum(oxfordCards)} từ`, total: sum(oxfordCards) },
      { id: 'cambridge', label: 'Cambridge', badge: `${camCards.length} bộ`, eyebrow: 'Cambridge IELTS · Reading', heading: `${camCards.length} cuốn · ${sum(camCards)} từ`, total: sum(camCards) },
      { id: 'tidvocab', label: 'TID Vocabulary', badge: `${tidCards.length} bộ`, eyebrow: 'TID · Vocabulary', heading: `${tidCards.length} bộ · ${sum(tidCards)} từ`, total: sum(tidCards) },
    ],
    cards: { topics: topicCards, books: bookCards, idioms: idiomCards, phrasal: phrasalCards, oxford: oxfordCards, cambridge: camCards, tidvocab: tidCards },
  };
  report.push(`index.json  ${(writeJson('index.json', index) / 1024).toFixed(1)} KB`);
  for (const t of index.tabs) report.push(`  tab ${t.id.padEnd(10)} ${String(index.cards[t.id].length).padStart(3)} cards  ${t.total} items`);

  // ----- decorative assets (from the saved pages only) -----
  fs.mkdirSync(path.join(ASSETS, 'photos'), { recursive: true });
  const photos = new Set(Object.values(index.cards).flat().map(c => c.photo).filter(Boolean));
  for (const name of photos) {
    const src = savedFiles.map(d => path.join(d, `${name}.webp`)).find(f => fs.existsSync(f));
    if (src) fs.copyFileSync(src, path.join(ASSETS, 'photos', `${name}.webp`));
    else report.push(`! photo ${name}.webp not saved — card falls back to its colour`);
  }
  const hub = fs.readFileSync(savedPage(31), 'utf8');
  const hubDir = savedFiles.find(d => path.basename(d).startsWith('31'));
  fs.copyFileSync(path.join(hubDir, 'vocab-page.webp'), path.join(ASSETS, 'vocab-page.webp'));
  ['avatar.svg', 'avatar(1).svg', 'avatar(2).svg', 'avatar(3).svg'].forEach((f, i) => fs.copyFileSync(path.join(hubDir, f), path.join(ASSETS, `avatar-${i}.svg`)));
  // the sun mascot of the "Kho từ vựng khổng lồ" card (inline SVG in the page)
  const sunAt = hub.indexOf('width: 550px; height: 550px');
  const sunStart = hub.indexOf('<svg', sunAt);
  const sun = hub.slice(sunStart, hub.indexOf('</svg>', sunStart) + 6).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/ class="[^"]*"/, '');
  fs.writeFileSync(path.join(ASSETS, 'sun.svg'), sun);
  // the flashcard stage mascot (WatchingSun, inline SVG in the flashcard page)
  const fc = fs.readFileSync(savedPage(32), 'utf8');
  const coinAt = fc.indexOf('<svg', fc.indexOf('width: 62px; height: 65.72px'));
  let coinEnd = fc.indexOf('</svg>', coinAt);
  while (fc.slice(coinAt + 4, coinEnd).split('<svg').length - 1 > fc.slice(coinAt, coinEnd).split('</svg>').length - 1) coinEnd = fc.indexOf('</svg>', coinEnd + 6);
  fs.writeFileSync(path.join(ASSETS, 'watching-sun.svg'), fc.slice(coinAt, coinEnd + 6).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  report.push(`public/assets/tid/vocabulary: ${photos.size} photos, vocab-page.webp, 4 avatars, sun.svg, watching-sun.svg`);
  console.log(report.join('\n'));
}

build();
