// Local data for the listening area (built by scripts/tid/build_listening_data.js).
// Heavy files are code-split with import.meta.glob so they load lazily and work under Electron file://.
import index from '../../../data/tid/listening/index.json';

export const LISTENING_INDEX = index;

const lessonFiles = import.meta.glob('../../../data/tid/listening/lessons/*.json');
const testFiles = import.meta.glob('../../../data/tid/listening/tests/*.json');
const ytFiles = import.meta.glob('../../../data/tid/listening/youtube/*.json');
const pronFile = import.meta.glob('../../../data/tid/listening/pronunciation.json');
const ytIndexFile = import.meta.glob('../../../data/tid/listening/youtube-index.json');

const load = async (files, key) => {
  const loader = files[key];
  if (!loader) return null;
  const mod = await loader();
  return mod.default ?? mod;
};

export const loadLesson = id => load(lessonFiles, `../../../data/tid/listening/lessons/${id}.json`);
export const loadTest = id => load(testFiles, `../../../data/tid/listening/tests/${id}.json`);
export const loadYoutube = ytId => load(ytFiles, `../../../data/tid/listening/youtube/${ytId}.json`);
export const loadPronunciation = () => load(pronFile, '../../../data/tid/listening/pronunciation.json');
export const loadYoutubeIndex = () => load(ytIndexFile, '../../../data/tid/listening/youtube-index.json');

/** Sentence translation (same public Google endpoint the app's dictionary service uses). */
export async function translateVi(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const out = (data?.[0] || []).map(p => p?.[0] || '').join('').trim();
  if (!out) throw new Error('empty translation');
  return out;
}
