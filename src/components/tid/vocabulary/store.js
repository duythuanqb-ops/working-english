// Local persistence for the vocabulary area (stands in for the site's Supabase tables):
//   - per-word SRS (site: flashcard reviews, calculateNextReview SM-2 variant)
//   - per-set review stages (site: /api/vocab-reviews — "Cần ôn hôm nay")
//   - daily activity (streak + calendar), user's own words, flashcard settings.
import { useSyncExternalStore } from 'react';

const KEYS = { srs: 'tid_vocab_srs_v1', sets: 'tid_vocab_sets_v1', act: 'tid_vocab_activity_v1', custom: 'tid_vocab_custom_v1' };
const listeners = new Set();
const cache = {};

function read(key, fallback) {
  if (cache[key] !== undefined) return cache[key];
  try { cache[key] = JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { cache[key] = fallback; }
  return cache[key];
}
function write(key, value) {
  cache[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
  listeners.forEach(l => l());
}
let version = 0;
listeners.add(() => { version++; });

if (typeof window !== 'undefined') {
  const bump = () => {
    delete cache[KEYS.custom];
    version++;
    listeners.forEach(l => l());
  };
  window.addEventListener('we-words-updated', bump);
  window.addEventListener('we-decks-updated', bump);
}

/** Re-render on any store change. */
export function useStore() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => version);
}

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const wordKey = w => String(w || '').trim().toLowerCase();

// ---------- per-word SRS (copied from the site's calculateNextReview) ----------
const RATINGS = {
  forgot: { intervalMultiplier: 0, easeDelta: -0.2 },
  hard: { intervalMultiplier: 1.2, easeDelta: -0.15 },
  good: { intervalMultiplier: 0, easeDelta: 0 },
  easy: { intervalMultiplier: 0, easeDelta: 0.15 },
};
export function calculateNextReview(rating, ease, interval, count) {
  const r = RATINGS[rating] || RATINGS.good;
  const e = Math.min(5, Math.max(1.3, ease + r.easeDelta));
  let n = count + 1;
  let days;
  if (rating === 'forgot') { days = 1; n = 0; }
  else if (rating === 'hard') days = Math.max(1, Math.round(interval * r.intervalMultiplier));
  else if (rating === 'easy') days = Math.max(1, Math.round(interval * e * 1.3));
  else days = count === 0 || interval === 0 ? 1 : Math.max(1, Math.round(interval * e));
  days = Math.min(days, 365);
  const next = new Date();
  next.setDate(next.getDate() + (n > 0 ? days : 1));
  if (n > 0) next.setHours(7, 0, 0, 0);
  return { easeFactor: +e.toFixed(2), intervalDays: days, nextReviewAt: next.getTime(), reviewCount: n };
}

export const getSrs = () => read(KEYS.srs, {});
export const wordState = w => getSrs()[wordKey(w)] || null;

/** Record an answer. rating: forgot | hard | good | easy. */
export function rateWord(w, rating, deckId) {
  const all = { ...getSrs() };
  const k = wordKey(w);
  const prev = all[k] || { ease: 2.5, interval: 0, count: 0 };
  const r = calculateNextReview(rating, prev.ease, prev.interval, prev.count);
  all[k] = { ease: r.easeFactor, interval: r.intervalDays, count: r.reviewCount, due: r.nextReviewAt, last: rating, at: Date.now(), d: deckId || prev.d };
  write(KEYS.srs, all);
  logActivity();

  // Bi-directional sync: update working_english_words_v1 if present in notebook
  try {
    const raw = localStorage.getItem('working_english_words_v1');
    if (raw) {
      const words = JSON.parse(raw);
      let changed = false;
      const updatedWords = words.map((item) => {
        if (wordKey(item.word) !== k) return item;
        changed = true;
        let newBox = item.box || 1;
        let isCorrect = false;
        if (rating === 'forgot') { newBox = 1; isCorrect = false; }
        else if (rating === 'hard') { newBox = Math.max(1, Math.min(2, newBox)); isCorrect = false; }
        else if (rating === 'good') { newBox = Math.min(5, newBox + 1); isCorrect = true; }
        else if (rating === 'easy') { newBox = Math.min(5, Math.max(3, newBox + 2)); isCorrect = true; }

        return {
          ...item,
          box: newBox,
          reviewCount: (item.reviewCount || 0) + 1,
          correctCount: (item.correctCount || 0) + (isCorrect ? 1 : 0),
          lastRating: rating,
          easeFactor: r.easeFactor,
          intervalDays: r.intervalDays,
          nextReviewAt: r.nextReviewAt,
          lastReviewed: new Date().toISOString()
        };
      });

      if (changed) {
        localStorage.setItem('working_english_words_v1', JSON.stringify(updatedWords));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('we-words-updated'));
          window.dispatchEvent(new CustomEvent('we-activity-updated'));
        }
      }
    }
  } catch (err) {
    console.warn('Failed to sync rateWord to working_english_words_v1:', err);
  }

  return all[k];
}
/** Preview the interval a rating would give (for the rating buttons' hints). */
export function previewInterval(w, rating) {
  const s = wordState(w);
  if (!s || !s.count) return null;
  const d = calculateNextReview(rating, s.ease, s.interval, s.count).intervalDays;
  return d >= 360 ? '1 năm' : d >= 60 ? `${Math.round(d / 30)} tháng` : d >= 30 ? '1 tháng' : `${d} ngày`;
}
/** A word counts as "thuộc" once it was last answered good/easy. */
export const isKnown = w => { const s = wordState(w); return !!s && s.count > 0 && (s.last === 'good' || s.last === 'easy'); };
export function deckProgress(words) {
  if (!words?.length) return 0;
  const srs = getSrs();
  const known = words.filter(w => { const s = srs[wordKey(w)]; return s && s.count > 0 && (s.last === 'good' || s.last === 'easy'); }).length;
  return Math.round((known / words.length) * 100);
}
/** % of a deck's words currently "thuộc" (words remember the deck they were studied in). */
export function deckKnownPct(deckId, total) {
  if (!total) return 0;
  const n = Object.values(getSrs()).filter(s => s.d === deckId && s.count > 0 && (s.last === 'good' || s.last === 'easy')).length;
  return Math.min(100, Math.round((n / total) * 100));
}
/** Buckets used by the overview card (site tooltip: ≥21d / 2–20d / ≤1d / never). */
export function buckets() {
  const b = { solid: 0, mid: 0, weak: 0, none: 0, due: 0 };
  const now = Date.now();
  Object.values(getSrs()).forEach(s => {
    if (!s.count) b.none++;
    else if (s.interval >= 21) b.solid++;
    else if (s.interval >= 2) b.mid++;
    else b.weak++;
    if (s.due && s.due <= now) b.due++;
  });
  return b;
}

// ---------- per-set review stages ("Cần ôn hôm nay") ----------
const STAGE_DAYS = [1, 3, 7, 14, 30, 60];
export const getSetReviews = () => read(KEYS.sets, {});
/** Called when a study session over a set finishes. */
export function markSetStudied(ref, name, sel) {
  const all = { ...getSetReviews() };
  const prev = all[ref];
  const now = Date.now();
  const stage = prev ? (prev.next_due <= now ? Math.min(prev.stage + 1, STAGE_DAYS.length - 1) : prev.stage) : 0;
  all[ref] = { set_ref: ref, set_name: name, sel: sel || prev?.sel, stage, studied_at: prev?.studied_at || now, last_reviewed_at: prev ? now : null, next_due: now + STAGE_DAYS[stage] * 864e5 };
  write(KEYS.sets, all);
}
export const dueSets = () => Object.values(getSetReviews()).filter(r => r.next_due <= Date.now()).sort((a, b) => a.next_due - b.next_due);
export function dismissSet(ref) {
  const all = { ...getSetReviews() };
  delete all[ref];
  write(KEYS.sets, all);
}

// ---------- activity (streak / calendar) ----------
export const getActivity = () => read(KEYS.act, {});
export function logActivity(n = 1) {
  const all = { ...getActivity() };
  const k = dayKey();
  all[k] = (all[k] || 0) + n;
  write(KEYS.act, all);
}
export function streak() {
  const act = getActivity();
  const d = new Date();
  if (!act[dayKey(d)]) d.setDate(d.getDate() - 1); // today not studied yet: streak still alive until midnight
  let n = 0;
  while (act[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// ---------- user's own words ("Bộ từ của bản thân / Sổ từ vựng") ----------
export const getCustomWords = () => {
  const manual = read(KEYS.custom, []) || [];
  let appWords = [];
  try {
    const raw = typeof window !== 'undefined'
      ? (localStorage.getItem('working_english_words_v1') || localStorage.getItem('working_english_vocab_words_v1'))
      : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        appWords = parsed.map(w => {
          const deckName = (w.deck || (Array.isArray(w.tags) && w.tags[0]) || '').trim();
          return {
            id: w.id,
            w: w.word || w.w || '',
            vi: w.meaningVi || w.meaning || w.vi || '',
            ex: w.examples?.[0]?.en || w.example || w.ex || '',
            ipa: w.phonetic || w.ipa || '',
            pos: w.partOfSpeech || w.pos || 'n',
            syn: w.synonyms || w.syn || [],
            ant: w.antonyms || w.ant || [],
            forms: w.forms || [],
            deck: deckName,
            deckId: deckName ? `custom:${deckName}` : 'custom',
            tags: Array.isArray(w.tags) ? w.tags : (w.tags ? [w.tags] : (deckName ? [deckName] : [])),
            addedAt: w.createdAt || w.addedAt || w.dateAdded || Date.now()
          };
        });
      }
    }
  } catch { /* ignore */ }

  const map = new Map();
  appWords.forEach(w => {
    if (w.w && w.w.trim()) map.set(wordKey(w.w), w);
  });
  manual.forEach(w => {
    if (w.w && w.w.trim()) {
      const k = wordKey(w.w);
      const prev = map.get(k) || {};
      const deckName = (w.deck || prev.deck || '').trim();
      map.set(k, {
        ...prev,
        ...w,
        deck: deckName,
        deckId: deckName ? `custom:${deckName}` : 'custom',
        tags: w.tags || prev.tags || (deckName ? [deckName] : [])
      });
    }
  });

  return Array.from(map.values());
};

// ---------- small settings bag ----------

// ---------- small settings bag ----------
export function getSetting(name, fallback) { return read(`tid_vocab_${name}`, fallback); }
export function setSetting(name, value) { write(`tid_vocab_${name}`, value); }
