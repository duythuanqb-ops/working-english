// Build src/data/tid/listening/** from data already saved locally (NO network).
// Live crawling of theieltsdictionary.com was stopped (account flagged for automated downloads), so this script
// normalizes the snapshots we already have:
//   - src/data/ieltsListening100.json        : full dump of Supabase table listening_tasks (501 lessons)
//   - scripts/live/api/gap-listening.json     : /api/gap-filling?skill=listening response
//   - src/data/ieltsListeningCambridgeTests.json : /api/listening-test?list=1 rows
//   - src/data/ieltsShadowingVideos.json + ieltsShadowingSubtitles.json : shadowing_videos + captions
//   - src/data/tid/listening/tests/*.json     : cam-test pages' testData (saved by hand from the page RSC)
// Usage: node scripts/tid/build_listening_data.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'src/data/tid/listening');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, obj) => {
  const f = path.join(OUT, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj));
  return fs.statSync(f).size;
};

const HIDDEN_BOOKS = new Set([9]); // isHiddenCambridgeBook on the site

// ---- site's lesson categorisation (ported from the /practice/listening chunk) ----
function categorize(name) {
  const upper = name.toUpperCase();
  const lower = name.toLowerCase();
  let id = 'other', title = 'General Tasks';
  const cam = name.match(/Cam\s*(\d+)/i);
  if (cam) { id = `cam${cam[1]}`; title = `Cambridge ${cam[1]}`; }
  else if (upper.includes('[SPELLING]') || lower.includes('spelling')) { id = 'spelling'; title = 'Spelling'; }
  else if (upper.includes('[NUMBERS]') || lower.includes('number')) { id = 'numbers'; title = 'Numbers'; }
  else if (upper.includes('[CONVERSATIONS]') || lower.includes('conversation')) { id = 'conversations'; title = 'Conversations'; }
  else if (upper.includes('[IPA]') || upper.includes('[PRONUNCIATION]') || lower.includes('pronunciation')) { id = 'ipa'; title = 'Pronunciation (IPA)'; }
  let group = 'Exercises';
  if (id.startsWith('cam')) {
    const t = name.match(/Test\s*(\d+)/i);
    group = t ? `Test ${t[1]}` : 'General';
  } else if (id === 'conversations') {
    const n = name.match(/(\d+)\./);
    if (n) group = `Section ${Math.ceil(parseInt(n[1], 10) / 20)}`;
  }
  return { id, title, group };
}

// ---- site's challenge normaliser: splits multi-word slots so every word gets its own box ----
const words = s => s.trim().split(/\s+/).filter(Boolean);
function normalizeChallenge(c) {
  const sol = Array.isArray(c.solution) ? c.solution : null;
  const jc = Array.isArray(c.jsonContent) ? c.jsonContent : null;
  if (!sol || !jc) return c;
  const len = Math.max(sol.length, jc.length);
  const solution = [], jsonContent = [], altGroups = [];
  for (let i = 0; i < len; i++) {
    const s = sol[i];
    const forms = Array.isArray(s) ? s.map(String) : s != null ? [String(s)] : [];
    const raw = jc[i];
    const primary = String((Array.isArray(raw) ? raw[0] : raw) ?? forms[0] ?? '');
    const parts = words(primary);
    const span = Math.max(parts.length, 1);
    const alts = [...new Set(forms.filter(f => words(f).length !== span))].sort((a, b) => words(b).length - words(a).length);
    const alt = alts.length ? { span, forms: alts } : null;
    if (parts.length <= 1) {
      solution.push(forms.length ? forms : [primary]);
      jsonContent.push(raw !== undefined ? raw : primary);
      altGroups.push(alt);
      continue;
    }
    const same = forms.map(words).filter(w => w.length === parts.length);
    for (let k = 0; k < parts.length; k++) {
      const opts = [...new Set(same.map(w => w[k]))];
      solution.push(opts.length ? opts : [parts[k]]);
      jsonContent.push(parts[k]);
      altGroups.push(k === 0 ? alt : null);
    }
  }
  const out = { ...c, solution, jsonContent };
  if (altGroups.some(Boolean)) out.altGroups = altGroups;
  return out;
}

// ---------------------------------------------------------------------------------------------
const tasks = read('src/data/ieltsListening100.json');
const camList = read('src/data/ieltsListeningCambridgeTests.json');
const gap = read('scripts/live/api/gap-listening.json');

fs.mkdirSync(OUT, { recursive: true });
const stats = {};

// 1) Dictation lessons (everything except the [IPA] minimal-pair sets)
const library = [];
let lessonFiles = 0;
for (const t of tasks) {
  const name = t.lesson_name || `Lesson ${t.lesson_id}`;
  const cat = categorize(name);
  if (cat.id === 'ipa') continue; // used by the pronunciation page instead
  const book = Number((cat.id.match(/^cam(\d+)$/) || [])[1]);
  if (HIDDEN_BOOKS.has(book)) continue;
  const challenges = (t.challenges || []).filter(c => c && !Array.isArray(c)).map(c => normalizeChallenge({
    content: c.content || '',
    jsonContent: c.jsonContent,
    solution: c.solution,
    audioSrc: c.audioSrc || c.audio_src || '',
    timeStart: c.timeStart ?? 0,
    timeEnd: c.timeEnd ?? 0,
  }));
  if (!challenges.length) continue;
  write(`lessons/${t.lesson_id}.json`, { id: String(t.lesson_id), title: name, audioSrc: t.audio_src || null, challenges });
  lessonFiles++;
  library.push({ id: String(t.lesson_id), title: name, category: cat.id, categoryTitle: cat.title, group: cat.group, total: challenges.length });
}
stats.lessons = lessonFiles;

// 2) Cambridge full tests (list from /api/listening-test?list=1; questions only where a testData snapshot exists)
const testDir = path.join(OUT, 'tests');
const haveTests = new Set(fs.existsSync(testDir) ? fs.readdirSync(testDir).map(f => f.replace(/\.json$/, '')) : []);
const camTests = camList
  .filter(r => !HIDDEN_BOOKS.has(r.volume))
  .map(r => ({ testId: r.test_id, testName: r.test_name, volume: r.volume, testNumber: r.test_number, hasAudio: r.has_audio, hasQuestions: haveTests.has(r.test_id) }));
stats.camTests = camTests.length;
stats.camTestsWithQuestions = camTests.filter(t => t.hasQuestions).length;

// 3) Gap-filling list
const gapItems = (gap.items || []).map(g => ({ ...g, hasQuestions: haveTests.has(g.testId) }));
stats.gapItems = gapItems.length;

write('index.json', { camTests, library, gap: gapItems });

// 4) Pronunciation minimal pairs — order/labels from the /practice/listening/pronunciation page,
//    words + IPA + recorded audio from the 42 "[IPA]" lessons of listening_tasks.
const PAIRS = [['bad-vs-bed', '/æ/ – /e/', 'bad / bed'], ['cat-vs-cut', '/æ/ – /ʌ/', 'cat / cut'], ['e-i-bet-vs-bit', '/e/ – /ɪ/', 'bet / bit'], ['far-vs-fur', '/ɑː/ – /ɜː/', 'far / fur'], ['had-vs-hard', '/æ/ – /ɑː/', 'had / hard'], ['i-vs-ee-it-vs-eat', '/ɪ/ – /iː/', 'it / eat'], ['know-vs-now', '/əʊ/ – /oʊ/ – /aʊ/', 'know / now'], ['low-vs-law', '/əʊ/ – /ɔː/ – /ɑː/', 'low / law'], ['swan-vs-sworn', '/ɒ/ – /ɑː/ – /ɔː/', 'swan / sworn'], ['want-vs-wont', '/ɒ/ – /ɑː/ – /əʊ/', "want / won't"], ['wet-vs-wait', '/e/ – /eɪ/', 'wet / wait'],
  ['b-p-big-vs-pig', '/b/ – /p/', 'big / pig'], ['ban-vs-van', '/b/ – /v/', 'ban / van'], ['bank-vs-bang', '/ŋk/ – /ŋ/', 'bank / bang'], ['cheap-vs-sheep', '/tʃ/ – /ʃ/', 'cheap / sheep'], ['cheese-vs-jeez', '/tʃ/ – /dʒ/', 'cheese / jeez'], ['chew-vs-two', '/ʧ/ – /t/', 'chew / two'], ['clothe-vs-close', '/ð/ – /z/', 'clothe / close'], ['dam-vs-jam', '/d/ – /ʤ/', 'dam / jam'], ['day-vs-they', '/d/ – /ð/', 'day / they'], ['f-h-fat-vs-hat', '/f/ – /h/', 'fat / hat'], ['f-p-fan-vs-pan', '/f/ – /p/', 'fan / pan'], ['f-v-fan-vs-van', '/f/ – /v/', 'fan / van'], ['fin-vs-thin', '/f/ – /θ/', 'fin / thin'], ['g-w-get-vs-wet', '/g/ – /w/', 'get / wet'], ['h-no-h-hand-vs-and', '/h/ – no /h/', 'hand / and'], ['h-r-hat-vs-rat', '/h/ – /r/', 'hat / rat'], ['jam-vs-yam', '/ʤ/ – /j/', 'jam / yam'], ['k-g-cold-vs-gold', '/k/ – /g/', 'cold / gold'], ['kw-k-quick-vs-kick', '/kw/ – /k/', 'quick / kick'], ['l-r-law-vs-raw', '/l/ – /r/', 'law / raw'], ['m-n-mine-vs-nine', '/m/ – /n/', 'mine / nine'], ['page-vs-pays', '/ʤ/ – /z/', 'page / pays'], ['r-w-rare-vs-where', '/r/ – /w/', 'rare / where'], ['s-z-bus-vs-buzz', '/s/ – /z/', 'bus / buzz'], ['sin-vs-sing', '/n/ – /ŋ/', 'sin / sing'], ['sing-vs-thing', '/s/ – /θ/', 'sing / thing'], ['so-vs-show', '/s/ – /ʃ/', 'so / show'], ['t-d-tie-vs-die', '/t/ – /d/', 'tie / die'], ['tank-vs-thank', '/t/ – /θ/', 'tank / thank'], ['v-w-vet-vs-wet', '/v/ – /w/', 'vet / wet'], ['w-no-w-wait-vs-eight', '/w/ – no /w/', 'wait / eight']];
const ipaLessons = tasks.filter(t => (t.lesson_name || '').includes('[IPA]'));
const norm = s => s.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
const option = o => {
  const r = o.recordings || {};
  const us = r['1'] || r['2'] || Object.values(r)[0] || {};
  const uk = r['3'] || r['4'] || us;
  return { word: us.text || uk.text || '', ipaUS: us.secondaryText || '', ipaUK: uk.secondaryText || us.secondaryText || '', audioUS: us.audioSrc || '', audioUK: uk.audioSrc || '' };
};
const sets = PAIRS.map(([slug, contrast, pair], i) => {
  const key = norm(pair.replace(' / ', ' vs '));
  const lesson = ipaLessons.find(l => norm((l.lesson_name.match(/\(([^)]+)\)\s*$/) || [])[1] || '') === key);
  if (!lesson) throw new Error('No [IPA] lesson for ' + pair);
  const questions = lesson.challenges.filter(Array.isArray).map(ch => ch.map(option));
  return { id: slug, category: i < 11 ? 'vowels' : 'consonants', contrast, pair, questions };
});
stats.pronunciationSets = sets.length;
stats.pronunciationQuestions = sets.reduce((s, x) => s + x.questions.length, 0);
write('pronunciation.json', sets);

// 5) YouTube dictation: shadowing videos that have captions saved locally
const videos = read('src/data/ieltsShadowingVideos.json');
const subs = read('src/data/ieltsShadowingSubtitles.json');
const ytList = [];
for (const v of videos) {
  const s = subs[v.id];
  if (!Array.isArray(s) || !s.length || !v.youtube_id) continue;
  const segments = s.map(x => ({ text: String(x.text || '').replace(/\s+/g, ' ').trim(), start: +x.start_time || 0, end: (+x.start_time || 0) + (+x.duration || 0), vi: x.vietnamese_text || '' })).filter(x => x.text);
  write(`youtube/${v.youtube_id}.json`, { youtubeId: v.youtube_id, title: v.title, segments });
  ytList.push({ id: v.id, youtubeId: v.youtube_id, title: v.title, thumbnail: v.thumbnail_url, category: v.category, level: v.level, duration: v.duration, segments: segments.length });
}
write('youtube-index.json', ytList);
stats.youtubeVideos = ytList.length;

console.log(stats);
