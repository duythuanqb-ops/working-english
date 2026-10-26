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

// ---------- user's own words ("Bộ từ của bản thân") ----------
export const getCustomWords = () => read(KEYS.custom, []);
export function addCustomWord(word) {
  const list = getCustomWords().filter(w => wordKey(w.w) !== wordKey(word.w));
  write(KEYS.custom, [{ ...word, addedAt: Date.now() }, ...list]);
}
export function removeCustomWord(w) {
  write(KEYS.custom, getCustomWords().filter(x => wordKey(x.w) !== wordKey(w)));
}

// ---------- small settings bag ----------
export function getSetting(name, fallback) { return read(`tid_vocab_${name}`, fallback); }
export function setSetting(name, value) { write(`tid_vocab_${name}`, value); }
