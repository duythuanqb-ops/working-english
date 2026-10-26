// Local data access for the Reading area (crawled by scripts/tid/crawl_reading.js).
// Heavy files (passages, articles) are code-split with import.meta.glob so the Electron file:// build works.
import INDEX from '../../../data/tid/reading/index.json';
import CATALOG from '../../../data/tid/reading/catalog.json';
import GAP_ITEMS from '../../../data/tid/reading/gap.json';

const TEST_FILES = import.meta.glob('../../../data/tid/reading/tests/*.json', { import: 'default' });
const ARTICLE_FILES = import.meta.glob('../../../data/tid/reading/articles/*.json', { import: 'default' });

export { INDEX, CATALOG, GAP_ITEMS };

export const INDEX_BY_ID = new Map(INDEX.map(r => [r.id, r]));
export const GAP_BY_ID = new Map(GAP_ITEMS.map(g => [g.id, g]));

// Same list as the site's READING_QTYPES (question-type filter chips).
export const READING_QTYPES = [
  'True/False/Not Given', 'Yes/No/Not Given', 'Multiple Choice', 'Matching Headings', 'Matching Information',
  'Matching Features', 'Matching Sentence Endings', 'Short Answer', 'Sentence Completion', 'Note/Summary Completion',
  'Flow Chart Completion', 'Diagram Labelling', 'Map Labelling',
];

const QTYPE_ALIASES = {
  truefalsenotgiven: 'True/False/Not Given', yesnonotgiven: 'Yes/No/Not Given', multiplechoice: 'Multiple Choice',
  matchingheadings: 'Matching Headings', matchingheading: 'Matching Headings', matchinginformation: 'Matching Information',
  matchingfeatures: 'Matching Features', matchingsentenceendings: 'Matching Sentence Endings', shortanswer: 'Short Answer',
  sentencecompletion: 'Sentence Completion', notesummarycompletion: 'Note/Summary Completion', gapfilling: 'Note/Summary Completion',
  flowchartcompletion: 'Flow Chart Completion', diagramlabelling: 'Diagram Labelling', maplabelling: 'Map Labelling',
};
export function normalizeQTypes(list) {
  const out = [];
  for (const t of list || []) {
    const k = String(t).toLowerCase().replace(/[^a-z]/g, '');
    const v = QTYPE_ALIASES[k] || READING_QTYPES.find(q => q.toLowerCase().replace(/[^a-z]/g, '') === k);
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

export const hasContent = id => !!INDEX_BY_ID.get(id)?.content;
export const hasKey = id => !!INDEX_BY_ID.get(id)?.key;

const fileOf = id => id.replace(/[^A-Za-z0-9_.-]/g, '_');

export async function loadPassage(id) {
  const loader = TEST_FILES[`../../../data/tid/reading/tests/${fileOf(id)}.json`];
  return loader ? loader() : null;
}

// A "test" id is either a passage id (cam-20-1-2, ew-3-1 …) or a Cambridge test id (cam-20-1 → 3 passages).
export function passageIdsOf(testId) {
  if (INDEX_BY_ID.has(testId)) return [testId];
  return [1, 2, 3, 4].map(n => `${testId}-${n}`).filter(id => INDEX_BY_ID.has(id));
}

let articleIndexPromise = null;
export function loadArticleIndex() {
  articleIndexPromise ||= import('../../../data/tid/reading/articles-index.json').then(m => m.default);
  return articleIndexPromise;
}
export async function loadArticle(id) {
  const loader = ARTICLE_FILES[`../../../data/tid/reading/articles/${fileOf(id)}.json`];
  return loader ? loader() : null;
}

// ---- progress (localStorage, per passage) — mirrors the site's tid_progress_v1 records ----
const PKEY = 'tid_reading_progress_v1';
export function readProgress() {
  try { return JSON.parse(localStorage.getItem(PKEY) || '{}') || {}; } catch { return {}; }
}
export function saveProgress(id, rec) {
  try {
    const all = readProgress();
    all[id] = { ...all[id], ...rec, at: new Date().toISOString() };
    localStorage.setItem(PKEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('tid-reading-progress'));
  } catch { /* storage unavailable */ }
}

// Site helper: progress chip text.
export function pxProgress(p) {
  if (!p || (!p.completed && !(p.done > 0))) return null;
  if (p.completed) return { done: true, text: typeof p.score === 'number' && p.total > 0 ? `Đã xong ${p.score}/${p.total}` : 'Đã xong' };
  return { done: false, text: p.total > 0 ? `Đang làm ${p.done}/${p.total}` : 'Đang làm dở' };
}

// Site's readingBandFromScore
export function readingBand(score, total) {
  if (total <= 0) return 0;
  const n = total >= 40 ? score : Math.round((score / total) * 40);
  return n >= 39 ? 9 : n >= 37 ? 8.5 : n >= 35 ? 8 : n >= 33 ? 7.5 : n >= 30 ? 7 : n >= 27 ? 6.5 : n >= 23 ? 6 : n >= 20 ? 5.5
    : n >= 16 ? 5 : n >= 13 ? 4.5 : n >= 10 ? 4 : n >= 7 ? 3.5 : n >= 5 ? 3 : n >= 3 ? 2.5 : n >= 2 ? 2 : n >= 1 ? 1.5 : 1;
}

export const HIDDEN_CAM_BOOKS = new Set([9]);

// ---- per-question-type accuracy (local stand-in for the site's /history type stats page) ----
const TKEY = 'tid_reading_type_stats_v1';
export function qTypeLabel(set, q) {
  const bt = q.block?.type || q.displayType || set.qs[0]?.block?.type || set.qs[0]?.displayType || '';
  if (set.kind === 'tfng') return 'True/False/Not Given';
  if (set.kind === 'ynng') return 'Yes/No/Not Given';
  if (set.kind === 'mc' || set.kind === 'mc2') return 'Multiple Choice';
  if (bt === 'matching-heading') return 'Matching Headings';
  if (set.kind === 'matching-info') return 'Matching Information';
  if (bt === 'matching-feature' || q.type === 'matching-feature') return 'Matching Features';
  if (bt === 'sentence-ending') return 'Matching Sentence Endings';
  if (bt === 'sentence-completion') return 'Sentence Completion';
  if (/flow/.test(bt)) return 'Flow Chart Completion';
  if (/short/.test(bt)) return 'Short Answer';
  return 'Note/Summary Completion';
}
export function readTypeStats() {
  try { return JSON.parse(localStorage.getItem(TKEY) || '{}') || {}; } catch { return {}; }
}
export function recordTypeStats(entries) {
  try {
    const all = readTypeStats();
    for (const { type, ok } of entries) {
      const r = (all[type] ||= { correct: 0, total: 0 });
      r.total++; if (ok) r.correct++;
    }
    localStorage.setItem(TKEY, JSON.stringify(all));
  } catch { /* storage unavailable */ }
}
