// Build src/data/tid/speaking/** (+ heroArt.js, shadowPlayer.css) for the Speaking area. OFFLINE ONLY: reads local files.
//
// Usage: node scripts/tid/build_speaking.js
// Inputs (all local):
//   scripts/live/chunks/1mgpseq2n26y3.js     roulette page chunk (deck: P1/P2/P3 questions + cues + vocab)
//   scripts/live/chunks/3u6lzzudsl8ua.js     speaking hub chunk (topic picker lists + pixel hero html)
//   scripts/live/api/speaking-topics.json    public custom topics (TID)
//   scripts/tid/build_speaking.raw/fq3.json, fq2.json   forecast Q3/Q2 2026 (copies of /data/speaking/forecast-q*-2026.json
//                                            captured before the offline rule; page 12 only renders collapsed titles)
//   scripts/tid/build_speaking.raw/mock-interview-chunk.js   mock-interview chunk (static Part 1 bank p1-1..p1-50)
//   html/10The IELTS Dictionary…_files/2pf4pifmc-ikx.css   shadowing player stylesheet (scoped into .shp)
//   src/data/ieltsShadowing*.json, ieltsDubbing*.json/js    older crawls of shadowing_videos / subtitles / dubbing lessons
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const RAW = path.join(__dirname, 'build_speaking.raw');
const LIVE = path.join(ROOT, 'scripts/live');
const OUT = path.join(ROOT, 'src/data/tid/speaking');
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (rel, data) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data));
};

// Extract the balanced JS literal ([...] or {...}) that starts right after `marker`.
function literal(src, marker) {
  let i = src.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  i = Math.min(...[src.indexOf('[', i), src.indexOf('{', i)].filter(x => x >= 0));
  let depth = 0, q = null, j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === '\\') { j++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') depth++;
    if (c === '}' || c === ']') { depth--; if (!depth) break; }
  }
  return eval('(' + src.slice(i, j + 1) + ')'); // eslint-disable-line no-eval
}

const hubJs = fs.readFileSync(path.join(LIVE, 'chunks/3u6lzzudsl8ua.js'), 'utf8');
const mockJs = fs.readFileSync(path.join(RAW, 'mock-interview-chunk.js'), 'utf8');
const rouletteJs = fs.readFileSync(path.join(LIVE, 'chunks/1mgpseq2n26y3.js'), 'utf8');

// ---- Roulette deck --------------------------------------------------------------------------
const roulette = {
  p1: literal(rouletteJs, 'let v=[{'),
  p2: literal(rouletteJs, 'k=[{id:"p2-'),
  p3: literal(rouletteJs, 'x=[{id:"p3-'),
};
write('roulette.json', roulette);

// ---- Forecasts ----------------------------------------------------------------------------
const fq3 = readJson(path.join(RAW, 'fq3.json'));
const fq2 = readJson(path.join(RAW, 'fq2.json'));
write('forecast-q3-2026.json', fq3);
write('forecast-q2-2026.json', fq2);

// ---- Mock interview topic library (hub picker) ---------------------------------------------
const p1Bank = literal(mockJs, '{"p1-1":[');
const cats = literal(hubJs, 'z=[{label:');
const p2List = literal(hubJs, 'M=[{id:"p2-');
const p3List = literal(hubJs, 'O=[{id:"p3-');
const custom = readJson(path.join(LIVE, 'api/speaking-topics.json')).topics;

const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stripNo = s => s.replace(/^\d+\.\s*/, '');
const allCues = [
  ...roulette.p2.map(c => ({ title: c.topic.replace(/\.$/, ''), bullets: c.bullets, vocab: c.vocab, part3: [] })),
  ...[...fq3.part2_3, ...fq2.part2_3].map(c => ({ title: stripNo(c.cueCard), bullets: c.bullets, part3: c.part3 })),
];
const findCue = title => allCues.find(c => norm(c.title) === norm(title));

// Hub Part 2 topic -> real cue card. Family member is the server's opening cue card for p2-8; the rest
// map to the closest cue card that exists in the site's own roulette deck / forecasts.
const P2_MAP = {
  'p2-15': 'Describe an old friend you got back in touch with',
  'p2-1': 'Describe a natural place in your city that you enjoy visiting',
  'p2-7': 'Describe a memorable journey you have taken',
  'p2-32': 'Describe a photo you like',
  'p2-11': 'Describe a piece of music you enjoy',
  'p2-38': 'Describe a movie you enjoyed watching',
  'p2-3': 'Describe a hobby you enjoy',
  'p2-21': 'Describe a happy childhood memory',
  'p2-33': 'Describe a gift you gave to someone',
  'p2-26': 'Describe a thing you did to learn another language',
  'p2-12': 'Describe a live sports event you watched and liked',
  'p2-16': 'Describe a book you have recently read',
  'p2-5': 'Describe a meal you really enjoyed',
  'p2-4': 'Describe a piece of technology you find useful',
  'p2-22': 'Describe a TV or online programme that you enjoy watching',
  'p2-17': 'Describe a creative person you admire',
  'p2-28': 'Describe a wild animal you find interesting',
  'p2-20': 'Describe a long-term goal/ambition you would like to achieve',
  'p2-23': 'Describe a piece of clothing you like to wear',
  'p2-44': 'Describe a special event you celebrated',
  'p2-41': "Describe a special day out that cost you little money/didn't cost you much",
  'p2-34': 'Describe an ambition you have had for a long time',
  'p2-9': 'Describe a positive change you have made in your life',
};
// Hub Part 3 topic -> roulette P3 deck topics + keyword regex used to pull forecast Part 3 questions.
const P3_MAP = {
  'p3-4': [['Technology'], /technolog|computer|internet|online|phone/i],
  'p3-10': [['Education'], /school|education|teacher|student|universit/i],
  'p3-14': [['Environment'], /environment|pollution|climate|nature/i],
  'p3-6': [['Media'], /social media/i],
  'p3-9': [['Health'], /health|exercise|fit\b|diet/i],
  'p3-20': [['Future'], /future|in the next|will .* change/i],
  'p3-49': [['Money'], /money|save|rich|spend|econom/i],
  'p3-2': [['Work', 'Work-life'], /\bjob|career|work|employ/i],
  'p3-13': [['Shopping', 'Advertising'], /shop|advert|buy|consumer|brand/i],
  'p3-5': [['Food'], /food|eat|meal|cook|restaurant/i],
  'p3-7': [['Travel'], /travel|touris|holiday|trip/i],
  'p3-8': [['Family', 'Friendship'], /family|parent|friend|grandparent/i],
  'p3-16': [['Reading'], /read|book|librar|knowledge/i],
  'p3-17': [['Art', 'Culture'], /\bart|artist|museum|culture|tradition/i],
  'p3-12': [['Sport'], /sport|competition|athlete|team/i],
  'p3-26': [['Languages'], /language|communicat|conversation/i],
  'p3-31': [['Media'], /news|media|journalis|newspaper/i],
  'p3-39': [['Transport', 'Cities'], /transport|traffic|city|cities|car/i],
  'p3-36': [['Future', 'Technology'], /science|robot|scientist|artificial/i],
  'p3-48': [['Environment'], /recycl|waste|plastic|sustain/i],
  'p3-21': [['Children', 'Memory'], /child|kid|young people|grow up/i],
  'p3-28': [['Environment', 'Leisure'], /animal|pet|wildlife|nature|plant/i],
};
const forecastP3 = [...new Set([...fq3.part2_3, ...fq2.part2_3].flatMap(c => c.part3))];
const forecastP1 = [...fq3.part1.compulsory, ...fq3.part1.specific, ...fq2.part1.compulsory, ...fq2.part1.specific];

const topics = {};
const p1Names = Object.fromEntries(cats.flatMap(c => c.topics).map(t => [t.id, t.name]));
for (const [id, qs] of Object.entries(p1Bank)) {
  const name = p1Names[id] || id;
  const key = norm(name).split(' ')[0];
  const extra = [
    ...roulette.p1.filter(c => norm(c.topic).startsWith(key)).map(c => c.q),
    ...forecastP1.filter(t => norm(stripNo(t.title)).includes(key)).flatMap(t => t.questions),
  ];
  const questions = [...qs];
  for (const q of extra) if (!questions.some(x => norm(x).includes(norm(q)))) questions.push(q);
  questions.splice(10);
  const tips = roulette.p1.filter(c => norm(c.topic).startsWith(key)).map(c => ({ q: c.q, cues: c.cues, vocab: c.vocab }));
  topics[id] = { id, part: 1, name, questions, tips };
}
topics['p2-8'] = {
  id: 'p2-8', part: 2, name: 'Family member',
  cue: { title: 'Describe a family member you are closest to', bullets: ['who this person is', 'what they look like', 'what kind of person they are', 'what you usually do together'], closing: 'and explain why you are so close to this person' },
};
for (const t of p2List) {
  if (topics[t.id]) continue;
  const c = findCue(P2_MAP[t.id] || '');
  if (!c) { console.warn('no cue card for', t.id, P2_MAP[t.id]); continue; }
  topics[t.id] = { id: t.id, part: 2, name: t.name, cue: { title: c.title, bullets: c.bullets, closing: '' }, vocab: c.vocab || [], part3: c.part3 };
}
for (const t of p3List) {
  const [deckTopics, re] = P3_MAP[t.id] || [[], /$^/];
  const deck = roulette.p3.filter(c => deckTopics.includes(c.topic));
  const opening = t.id === 'p3-4' ? ['In what ways do you think technology has changed the way people communicate with each other, compared to a few decades ago?'] : [];
  const questions = [...new Set([...opening, ...deck.map(c => c.q), ...forecastP3.filter(q => re.test(q))])].slice(0, 10);
  topics[t.id] = { id: t.id, part: 3, name: t.name, questions, tips: deck.map(c => ({ q: c.q, cues: c.cues, vocab: c.vocab })) };
}
for (const t of custom) {
  const id = `custom-${t.part}-${t.id}`;
  topics[id] = t.part === 2
    ? { id, part: 2, name: t.name, custom: true, cue: { title: t.questions.title, bullets: t.questions.cues, closing: t.questions.closing } }
    : { id, part: t.part, name: t.name, custom: true, questions: t.questions };
}
write('topics.json', {
  categories: cats.map(c => ({ label: c.label, color: c.color, topics: c.topics })),
  p2: p2List, p3: p3List,
  custom: custom.map(t => ({ id: `custom-${t.part}-${t.id}`, part: t.part, name: t.name, is_public: t.is_public })),
  topics,
});

// ---- Hub pixel hero (inline html from the site) ----------------------------------------------
const htmls = [];
const re = /html:'((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = re.exec(hubJs))) htmls.push(eval(`'${m[1]}'`)); // eslint-disable-line no-eval
const fixAssets = h => h.replace(/\/assets\/pixel\//g, '{{BASE}}assets/tid/speaking/');
fs.writeFileSync(path.join(ROOT, 'src/components/tid/speaking/heroArt.js'),
  '// Pixel-art hero + snow layer copied from the site (theieltsdictionary.com/practice/speaking).\n' +
  `export const HERO_HTML = ${JSON.stringify(fixAssets(htmls[0]))};\nexport const SNOW_HTML = ${JSON.stringify(fixAssets(htmls[1]))};\n`);

// ---- Shadowing -----------------------------------------------------------------------------
const shVideos = readJson(path.join(ROOT, 'src/data/ieltsShadowingVideos.json'));
const shSubs = readJson(path.join(ROOT, 'src/data/ieltsShadowingSubtitles.json'));
const byId = Object.fromEntries(shVideos.map(v => [v.id, v]));
const shIndex = [];
for (const v of shVideos) {
  const subs = shSubs[v.id] || shSubs[v.youtube_id];
  if (subs && subs.length) {
    write(`shadowing/${v.youtube_id}.json`, subs.map(s => ({
      text: s.text, start: +(+s.start_time).toFixed(2), dur: +(+s.duration).toFixed(2), ipa: s.ipa || '', vi: s.vietnamese_text || '',
    })).sort((a, b) => a.start - b.start));
  }
  shIndex.push({
    youtube_id: v.youtube_id, title: v.title, thumbnail_url: v.thumbnail_url || `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`,
    category: v.category, level: v.level, duration: v.duration,
    segments: subs?.length || v.segments || 0, is_custom: !!v.is_custom, is_community: !!v.is_community,
    created_at: v.created_at, hasSubs: !!(subs && subs.length),
  });
}
shIndex.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
write('shadowing/index.json', shIndex);
console.log('shadowing videos', shIndex.length, 'with subtitles', shIndex.filter(v => v.hasSubs).length,
  'orphan subtitle sets (no metadata)', Object.keys(shSubs).filter(k => !byId[k] && !shVideos.some(v => v.youtube_id === k)).length);

// ---- Dubbing (lồng tiếng) ------------------------------------------------------------------
const dubVideos = readJson(path.join(ROOT, 'src/data/ieltsDubbingVideos.json'));
const lessonsSrc = fs.readFileSync(path.join(ROOT, 'src/data/ieltsDubbingLessons.js'), 'utf8');
const lessons = literal(lessonsSrc, 'ieltsDubbingLessons = [');
const lessonIds = new Set();
for (const l of lessons) {
  lessonIds.add(l.youtube_id);
  write(`dubbing/${l.youtube_id}.json`, l.sentences.map(s => ({
    text: s.text, start: s.start, dur: s.duration, ipa: s.ipa || '', vi: s.translation || '', speaker: s.speaker || '',
  })));
}
// Dubbing videos without a lesson file can reuse the same video's shadowing subtitles (same Supabase table).
for (const v of dubVideos) {
  if (lessonIds.has(v.youtube_id)) continue;
  const src = path.join(OUT, `shadowing/${v.youtube_id}.json`);
  if (fs.existsSync(src)) { write(`dubbing/${v.youtube_id}.json`, readJson(src)); lessonIds.add(v.youtube_id); }
}
write('dubbing/index.json', dubVideos.map(v => ({ ...v, hasSubs: lessonIds.has(v.youtube_id) })));
console.log('dubbing lessons', dubVideos.length, 'with sentences', lessonIds.size);
console.log('topics', Object.keys(topics).length, 'roulette', roulette.p1.length, roulette.p2.length, roulette.p3.length);

// ---- Shadowing player stylesheet: the site's global CSS, scoped under .shp ------------------------
const PX = (w, h, rects) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${rects}</svg>`)}")`;
const SPRITES = { // stand-ins for /assets/shadowing/*.webp (not saved offline): small pixel-art SVGs
  '0b175ba5.webp': PX(16, 8, "<rect width='16' height='8' fill='#c8662a'/><rect y='3' width='16' height='1' fill='#7a3b18'/><rect y='7' width='16' height='1' fill='#7a3b18'/><rect x='7' width='1' height='3' fill='#7a3b18'/><rect x='3' y='4' width='1' height='3' fill='#7a3b18'/><rect x='12' y='4' width='1' height='3' fill='#7a3b18'/><rect x='1' y='1' width='4' height='1' fill='#e89a5a'/>"),
  '9137f69c.webp': PX(18, 9, "<rect x='4' y='2' width='10' height='6' fill='#fff'/><rect x='2' y='4' width='14' height='4' fill='#fff'/><rect x='6' y='0' width='6' height='3' fill='#fff'/><rect x='2' y='8' width='14' height='1' fill='#b9d4ea'/>"),
  '94ba376e.webp': PX(10, 10, "<rect width='10' height='10' fill='#7a3b18'/><rect x='1' y='1' width='8' height='8' fill='#f2b134'/><rect x='4' y='2' width='3' height='1' fill='#7a3b18'/><rect x='6' y='3' width='1' height='2' fill='#7a3b18'/><rect x='4' y='5' width='2' height='1' fill='#7a3b18'/><rect x='4' y='7' width='2' height='1' fill='#7a3b18'/>"),
  '423d10bb.webp': PX(20, 7, "<rect x='2' y='3' width='16' height='4' fill='#2e9e44'/><rect x='4' y='1' width='5' height='3' fill='#2e9e44'/><rect x='10' y='0' width='6' height='4' fill='#2e9e44'/><rect x='5' y='2' width='2' height='1' fill='#66c766'/><rect x='11' y='1' width='2' height='1' fill='#66c766'/>"),
  'bird.webp': PX(11, 8, "<rect x='2' y='2' width='7' height='5' fill='#f6c445'/><rect x='6' y='1' width='3' height='2' fill='#f6c445'/><rect x='7' y='2' width='1' height='1' fill='#222'/><rect x='9' y='3' width='2' height='1' fill='#e86b2a'/><rect x='0' y='4' width='4' height='2' fill='#fff'/>"),
  'flag.webp': PX(12, 16, "<rect x='2' width='1' height='16' fill='#7a7a7a'/><rect x='3' y='1' width='8' height='5' fill='#da251d'/><rect x='6' y='3' width='2' height='1' fill='#ffcd00'/><rect x='0' y='15' width='6' height='1' fill='#4a4a4a'/>"),
};
const cssSrc = fs.readFileSync(path.join(ROOT, 'html/10The IELTS Dictionary - Luyện thi IELTS chuyên nghiệp_files/2pf4pifmc-ikx.css'), 'utf8');
function scopeSel(sel) {
  return sel.split(',').map(x => {
    x = x.trim();
    if (x === ':root' || x === 'body') return '.shp';
    if (x.startsWith('body.night')) return '.shp.night' + x.slice(10);
    if (x.startsWith('body.dragging')) return 'body.shp-dragging' + x.slice(13);
    if (x.startsWith(':where(.app)')) return ':where(.shp)' + x.slice(12);
    if (x.startsWith('.app')) return '.shp' + x.slice(4);
    return '.shp ' + x;
  }).join(',');
}
const kf = new Set([...cssSrc.matchAll(/@keyframes ([\w-]+)/g)].map(m => m[1]));
function scopeBlock(css) {
  let out = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    for (; j < css.length && depth; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; }
    const body = css.slice(open + 1, j - 1);
    if (head.startsWith('@keyframes')) out += `@keyframes shp-${head.slice(11).trim()}{${body}}`;
    else if (head.startsWith('@media')) out += `${head}{${scopeBlock(body)}}`;
    else out += `${scopeSel(head)}{${body}}`;
    i = j;
  }
  return out;
}
let scoped = scopeBlock(cssSrc)
  .replace(/url\(\/assets\/shadowing\/mario\.webp\)/g, 'var(--shp-mario)')
  .replace(/url\(\/assets\/shadowing\/([\w.]+)\)/g, (m, f) => SPRITES[f] || 'none')
  .replace(/(animation(?:-name)?:[^;}]*)/g, d => d.replace(/[\w-]+/g, w => (kf.has(w) ? `shp-${w}` : w)));
fs.writeFileSync(path.join(ROOT, 'src/components/tid/speaking/shadowPlayer.css'),
  '/* Shadowing player — theieltsdictionary.com stylesheet (html/10…_files/2pf4pifmc-ikx.css) scoped under .shp by scripts/tid/build_speaking.js. Do not edit by hand. */\n' + scoped + '\n');
console.log('shadowPlayer.css', scoped.length, 'bytes; keyframes', kf.size);
