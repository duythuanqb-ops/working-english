// Local data for the Writing area (built by scripts/tid/build_writing.js). Heavy files are loaded lazily.
import TESTS from '../../../data/tid/writing/tests-index.json';
import BUILDER from '../../../data/tid/writing/builder-index.json';
import DICHCAU from '../../../data/tid/writing/dichcau-index.json';
import SAMPLES from '../../../data/tid/writing/samples-index.json';

export { TESTS, BUILDER, DICHCAU, SAMPLES };

const testFiles = import.meta.glob('../../../data/tid/writing/tests/*.json');
const builderFiles = import.meta.glob('../../../data/tid/writing/builder/*.json');
const dichcauFiles = import.meta.glob('../../../data/tid/writing/dichcau/*.json');
const sampleFiles = import.meta.glob('../../../data/tid/writing/samples/*.json');

const load = (files, dir, id) => {
  const fn = files[`../../../data/tid/writing/${dir}/${id}.json`];
  return fn ? fn().then(m => m.default ?? m) : Promise.resolve(null);
};
export const loadTest = id => load(testFiles, 'tests', id);
export const loadBuilder = id => load(builderFiles, 'builder', id);
export const loadDichCau = id => load(dichcauFiles, 'dichcau', id);
export const loadSample = id => load(sampleFiles, 'samples', id);

// Band-8 reader helpers (same logic as the site's sample-essay module)
const CONCL = /^(In conclusion|To conclude|To sum up|In summary)\b/i;
export function paragraphsOf(breaks, sentences) {
  const n = sentences.length;
  let t;
  const l = breaks;
  if (l && l[0] === 0 && l.every((e, i) => i === 0 || e > l[i - 1]) && l[l.length - 1] < n && CONCL.test(sentences[l[l.length - 1]]?.answer ?? '')) t = l;
  else {
    let e = -1;
    for (let a = n - 1; a >= 0; a--) if (CONCL.test(sentences[a].answer)) { e = a; break; }
    t = n > 4 && e > 2 ? [0, 2, e] : [0];
  }
  return t.map((e, i) => Array.from({ length: (t[i + 1] ?? n) - e }, (_, a) => e + a));
}
export const paragraphLabels = n => (n < 3 ? Array.from({ length: n }, () => '')
  : Array.from({ length: n }, (_, a) => (a === 0 ? 'Mở bài' : a === n - 1 ? 'Kết bài' : n === 3 ? 'Thân bài' : `Thân bài ${a}`)));
export const SAMPLE_VIEW_KEY = 'tid_sample8_view';
export function markSampleRead(id) {
  const s = new Set(lsGet(SAMPLE_READ_KEY, []) || []);
  if (!s.has(id)) { s.add(id); lsSet(SAMPLE_READ_KEY, [...s]); }
}

// ---- Task 1 chart types / Task 2 question types / Task 2 topics (same tables as the site) ----
export const CHART_TYPES = [
  { key: 'bar_chart', label: 'Bar Chart', icon: '▦', color: '#B45309' },
  { key: 'line_graph', label: 'Line Graph', icon: '〜', color: '#1D4ED8' },
  { key: 'pie_chart', label: 'Pie Chart', icon: '◕', color: '#BE123C' },
  { key: 'table', label: 'Table', icon: '⊟', color: '#475569' },
  { key: 'mixed_graph', label: 'Mixed Graph', icon: '⋈', color: '#7E22CE' },
  { key: 'map', label: 'Map', icon: '⊞', color: '#0F766E' },
  { key: 'process', label: 'Process', icon: '→', color: '#047857' },
];
export const QUESTION_TYPES = [
  { key: 'opinion', label: 'Opinion', icon: '✎', color: '#1D4ED8' },
  { key: 'discuss', label: 'Discuss Both Views', icon: '⇆', color: '#7E22CE', short: 'Discuss Both' },
  { key: 'adv_dis', label: 'Advantages & Disadvantages', icon: '⇅', color: '#B45309', short: 'Adv & Disadv' },
  { key: 'problem', label: 'Problem & Solution', icon: '⚙', color: '#BE123C', short: 'Problem & Sol.' },
  { key: 'two_part', label: 'Two-part Question', icon: '?', color: '#0F766E', short: 'Two-part' },
];
export const TASK2_TOPICS = [
  { key: 'education', label: 'Giáo dục', icon: '🎓' }, { key: 'technology', label: 'Công nghệ', icon: '💻' },
  { key: 'environment', label: 'Môi trường', icon: '🌿' }, { key: 'society', label: 'Xã hội & Gia đình', icon: '👪' },
  { key: 'government', label: 'Chính phủ & Chi tiêu công', icon: '🏛️' }, { key: 'health', label: 'Sức khoẻ & Lối sống', icon: '🩺' },
  { key: 'work', label: 'Việc làm & Kinh tế', icon: '💼' }, { key: 'media', label: 'Truyền thông & Quảng cáo', icon: '📺' },
  { key: 'crime', label: 'Tội phạm & Pháp luật', icon: '⚖️' }, { key: 'globalisation', label: 'Toàn cầu hoá & Văn hoá', icon: '🌏' },
  { key: 'science', label: 'Khoa học', icon: '🔬' }, { key: 'arts', label: 'Nghệ thuật & Thể thao', icon: '🎨' },
  { key: 'transport', label: 'Giao thông & Đô thị', icon: '🚦' },
];
export const TYPE_BY_KEY = Object.fromEntries([...CHART_TYPES, ...QUESTION_TYPES].map(t => [t.key, t]));
export const TOPIC_BY_KEY = Object.fromEntries(TASK2_TOPICS.map(t => [t.key, t]));

// Band-8 sample essay topics (bai-mau + translation band8/band9)
export const SAMPLE_TOPIC_STYLE = {
  education: { color: '#1D4ED8', icon: '🎓' }, environment: { color: '#15803D', icon: '🌿' }, technology: { color: '#6D28D9', icon: '💻' },
  health: { color: '#BE123C', icon: '🩺' }, work: { color: '#B45309', icon: '💼' }, travel: { color: '#0E7490', icon: '✈️' },
  food: { color: '#C2410C', icon: '🍲' }, family: { color: '#9D174D', icon: '👪' }, 'social-media': { color: '#4338CA', icon: '📱' },
  shopping: { color: '#A21CAF', icon: '🛍️' }, 'city-life': { color: '#334155', icon: '🏙️' }, transport: { color: '#0F766E', icon: '🚆' },
  culture: { color: '#7C2D12', icon: '🎭' }, crime: { color: '#991B1B', icon: '⚖️' }, hobbies: { color: '#4D7C0F', icon: '🎨' },
};
export const SAMPLE_TOPIC_FALLBACK = { color: '#334155', icon: '📝' };
export const SAMPLE_TOPICS = (() => {
  const m = new Map();
  for (const s of SAMPLES) {
    const t = m.get(s.slug);
    if (t) t.count++; else m.set(s.slug, { slug: s.slug, vi: s.topicVi, en: s.topicEn, count: 1 });
  }
  return [...m.values()];
})();

// ---- small localStorage helpers (wrapped: storage can throw in some contexts) ----
export const lsGet = (k, fb = null) => {
  try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; }
};
export const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
export const lsDel = k => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

// Writing history: { [testId]: { n, band, at } }
export const HISTORY_KEY = 'tid_writing_history_v1';
export const getHistory = () => lsGet(HISTORY_KEY, {}) || {};
export function recordAttempt(id, band) {
  const h = getHistory();
  const prev = h[id] || { n: 0, band: null };
  h[id] = { n: prev.n + 1, band: band ?? prev.band, at: Date.now() };
  lsSet(HISTORY_KEY, h);
}

// Bai-mau "read" set (same key the site uses)
export const SAMPLE_READ_KEY = 'tid_sample8_read_v1';

// Dịch câu progress (same key format as the site's player)
export const dichCauKey = id => `dich_cau_progress_${id}`;
export function dichCauProgress(id, total) {
  const s = lsGet(dichCauKey(id));
  if (!s || typeof s !== 'object') return null;
  const done = Array.isArray(s.submittedSet) ? s.submittedSet.length : 0;
  if (s.completed) return { completed: true, done: total, total };
  return done > 0 ? { completed: false, done, total } : null;
}

export const stripVN = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const countWords = s => (s.trim().match(/[A-Za-z0-9'’-]+/g) || []).length;
