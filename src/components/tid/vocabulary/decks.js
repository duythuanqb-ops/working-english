// Deck data access — the index is small and eager, each deck JSON is code-split (works under Electron file://).
import index from '../../../data/tid/vocabulary/index.json';
import { getCustomWords } from './store';

export { index };
const loaders = import.meta.glob('../../../data/tid/vocabulary/decks/*.json');
const memo = {};
export function loadDeck(id) {
  if (!memo[id]) {
    const load = loaders[`../../../data/tid/vocabulary/decks/${id}.json`];
    memo[id] = load ? load().then(m => m.default || m) : Promise.reject(new Error(`deck ${id} not found`));
  }
  return memo[id];
}

export const allCards = () => Object.values(index.cards).flat();
export const cardById = id => allCards().find(c => c.id === id);
export const tabOfCard = id => index.tabs.find(t => index.cards[t.id].some(c => c.id === id));

/**
 * Build a study session.
 *   { cards: [cardId…], units?: [unitId…] }  ->  { key, title, words[] }
 * Several cards of the same tab can be combined (idioms / phrasal verbs: Ctrl/⌘ + click).
 */
export async function buildSession({ cards, units }) {
  if (cards[0] === 'custom') {
    return { key: 'custom', sel: { cards: ['custom'] }, title: 'Bộ từ của bản thân', words: getCustomWords().map(w => ({ ...w, deck: 'Cá nhân', deckId: 'custom' })) };
  }
  const decks = await Promise.all(cards.map(loadDeck));
  const words = [];
  const labels = [];
  decks.forEach((d, i) => {
    const card = cardById(cards[i]);
    if (d.units) {
      const picked = units?.length ? d.units.filter(u => units.includes(u.id)) : d.units;
      picked.forEach(u => u.words.forEach(w => words.push({ ...w, deck: card?.deckTitle || d.title, deckId: cards[i], unit: u.label })));
      labels.push(units?.length && picked.length < d.units.length ? `${card?.title || d.title} · ${picked.length === 1 ? picked[0].label : `${picked.length} unit`}` : card?.deckTitle || d.title);
    } else {
      d.words.forEach(w => words.push({ ...w, deck: card?.deckTitle || d.title, deckId: cards[i] }));
      labels.push(card?.deckTitle || d.title);
    }
  });
  const key = [...cards, ...(units || [])].join('+');
  const title = labels.length > 2 ? `${labels[0]} +${labels.length - 1}` : labels.join(' + ');
  return { key, title, words, sel: { cards, units } };
}

// ---------- word helpers shared by the flashcard modes ----------
export const POS_VI = { n: 'Danh từ', v: 'Động từ', adj: 'Tính từ', adv: 'Trạng từ', prep: 'Giới từ', phr: 'Cụm từ', 'phr.v': 'Cụm động từ', idiom: 'Thành ngữ', conj: 'Liên từ', pron: 'Đại từ', det: 'Từ hạn định' };
export function posLabel(pos) {
  if (!pos) return '';
  const p = pos.toLowerCase().replace(/\s+/g, '');
  return POS_VI[p] || POS_VI[p.split(/[/,]/)[0]] || pos;
}
/** Short Vietnamese gloss (first sense, no POS tags). */
export function gloss(w) {
  const s = String(w?.vi || '').replace(/^\((?:n|v|adj|adv)\)\s*/i, '').trim();
  return s || w?.en || '';
}
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Cut the target word (or an inflected form) out of the example sentence for the fill-in-the-blank mode. */
export function blankSentence(ex, word) {
  if (!ex || !word) return null;
  const base = word.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').split(/[,;/]/)[0].trim();
  if (!base) return null;
  const parts = base.split(/\s+/).map(escapeRe);
  const stem = parts.length === 1 && base.length > 4 ? escapeRe(base.replace(/(e|y)$/, '')) : null;
  const pattern = stem ? `\\b${stem}[a-z]*\\b` : `\\b${parts.join('\\s+')}(?:s|es|ed|ing|d)?\\b`;
  const m = ex.match(new RegExp(pattern, 'i'));
  if (!m) return null;
  return { before: ex.slice(0, m.index), removed: m[0], after: ex.slice(m.index + m[0].length) };
}
export function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed ?? Math.floor(Math.random() * 1e9);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
