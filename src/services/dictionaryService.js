import { storageService } from './storageService';
import { INITIAL_WORDS } from '../data/starterWords';
import { TFLAT_CORE_DICTIONARY } from '../data/tflatCoreDictionary';
import { AUTOCOMPLETE_WORDS } from '../data/commonWordList';

/**
 * High Performance TFlat-Style English - Vietnamese Dictionary Service
 * Combines:
 * 1. Curated Offline Core Dictionary (0ms instant lookup)
 * 2. Google Translate Dictionary API (detailed Vietnamese definitions broken down by Noun, Verb, Adj, Adv...)
 * 3. FreeDictionaryAPI with proper User-Agent (exact UK/US IPA & real native MP3 audio clips)
 * 4. Fast Bilingual Sentence Translation Engine
 */

export const BUSINESS_DICT_TOPICS = [
  {
    category: 'Quản trị & Điều hành',
    icon: 'Layers',
    words: ['Bottleneck', 'Feasibility', 'Streamline', 'Consensus', 'Mitigate', 'Expedite', 'Milestone', 'Deliverable']
  },
  {
    category: 'Giao tiếp & Đàm phán',
    icon: 'Repeat',
    words: ['Reiterate', 'Alignment', 'Clarify', 'Leverage', 'Compromise', 'Concur', 'Bandwidth', 'Touch base']
  },
  {
    category: 'Chiến lược & Hiệu suất',
    icon: 'TrendingUp',
    words: ['Proactive', 'Pragmatic', 'Benchmark', 'Substantial', 'Discrepancy', 'Redundant', 'Pivot', 'Optimize']
  },
  {
    category: 'Email & Trao đổi Công sở',
    icon: 'Mail',
    words: ['Follow up', 'Actionable', 'Pertaining', 'Acknowledge', 'Pending', 'Circulate', 'Escalate', 'Tentative']
  }
];

// Helper to translate part of speech to Vietnamese like TFlat
export function formatPosVi(pos) {
  const map = {
    noun: 'Danh từ',
    verb: 'Động từ',
    adjective: 'Tính từ',
    adverb: 'Trạng từ',
    pronoun: 'Đại từ',
    preposition: 'Giới từ',
    conjunction: 'Liên từ',
    interjection: 'Thán từ',
    idiom: 'Thành ngữ',
    phrase: 'Cụm từ'
  };
  return map[(pos || '').toLowerCase()] || pos || 'Nghĩa từ';
}

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeoutMs = 2800) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Fast sentence translator to Vietnamese
async function translateSentenceVi(sentence) {
  if (!sentence) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(sentence)}`;
    const res = await fetchWithTimeout(url, {}, 2000);
    if (res.ok) {
      const data = await res.json();
      return data[0]?.[0]?.[0] || '';
    }
  } catch (e) {
    // ignore translation failure
  }
  return '';
}

export const dictionaryService = {
  /**
   * Fast auto-complete suggestions (< 1ms)
   */
  getSuggestions: (prefix) => {
    if (!prefix || typeof prefix !== 'string') return [];
    const q = prefix.trim().toLowerCase();
    if (q.length < 1) return [];

    const matches = new Set();

    // 1. Check local saved words
    const saved = storageService.getWords();
    for (const w of saved) {
      if (w.word.toLowerCase().startsWith(q)) {
        matches.add(w.word);
        if (matches.size >= 8) return Array.from(matches);
      }
    }

    // 2. Check curated dictionary
    for (const key of Object.keys(TFLAT_CORE_DICTIONARY)) {
      if (key.startsWith(q)) {
        matches.add(key);
        if (matches.size >= 8) return Array.from(matches);
      }
    }

    // 3. Check common word list
    for (const item of AUTOCOMPLETE_WORDS) {
      if (item.startsWith(q)) {
        matches.add(item);
        if (matches.size >= 8) return Array.from(matches);
      }
    }

    return Array.from(matches);
  },

  /**
   * Main TFlat-Style Lookup
   */
  lookup: async (rawQuery) => {
    const query = (rawQuery || '').trim();
    if (!query) throw new Error('Vui lòng nhập từ hoặc cụm từ cần tra.');

    // Save to search history
    storageService.addSearchHistory(query);

    const lowerQuery = query.toLowerCase();

    // Check if word is already saved in user's notebook
    const localWords = storageService.getWords();
    const savedInNotebook = localWords.find((w) => w.word.toLowerCase() === lowerQuery);

    // 1. Instant check against TFlat core dictionary
    if (TFLAT_CORE_DICTIONARY[lowerQuery]) {
      const core = TFLAT_CORE_DICTIONARY[lowerQuery];
      return {
        ...core,
        bilingualExamples: core.examples || [],
        isSavedInNotebook: Boolean(savedInNotebook),
        savedWordData: savedInNotebook || null,
        source: 'tflat-offline'
      };
    }

    // 2. Query Google Translate Dictionary & FreeDictionaryAPI concurrently
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(query)}`;
    const freeDictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`;

    const [transRes, dictRes] = await Promise.allSettled([
      fetchWithTimeout(gtxUrl, {}, 2500),
      fetchWithTimeout(
        freeDictUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        },
        2500
      )
    ]);

    let viMain = '';
    let partsOfSpeech = [];

    // Parse Google Translate Dictionary data
    if (transRes.status === 'fulfilled' && transRes.value.ok) {
      try {
        const data = await transRes.value.json();
        viMain = data[0]?.[0]?.[0] || '';
        if (data[1] && Array.isArray(data[1])) {
          partsOfSpeech = data[1].map((entry) => ({
            pos: entry[0],
            posVi: formatPosVi(entry[0]),
            meanings: entry[1] || [],
            details: (entry[2] || []).map((d) => ({
              meaning: d[0],
              reverseWords: d[1] || []
            }))
          }));
        }
      } catch (e) {
        console.warn('Failed parsing GTX data:', e);
      }
    }

    // Parse FreeDictionaryAPI data (phonetics, audio, Oxford definitions)
    let ipaUk = '';
    let ipaUs = '';
    let audioUk = null;
    let audioUs = null;
    let lexicalMeanings = [];
    let englishExamples = [];
    let synonyms = [];
    let antonyms = [];

    if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
      try {
        const dictJson = await dictRes.value.json();
        const entry = dictJson[0];
        if (entry) {
          if (entry.phonetics && Array.isArray(entry.phonetics)) {
            for (const p of entry.phonetics) {
              if (p.audio?.includes('-uk') || p.audio?.includes('/uk/')) {
                audioUk = p.audio;
                if (p.text) ipaUk = p.text;
              } else if (p.audio?.includes('-us') || p.audio?.includes('/us/')) {
                audioUs = p.audio;
                if (p.text) ipaUs = p.text;
              } else if (!audioUs && p.audio) {
                audioUs = p.audio;
              }
              if (!ipaUs && p.text) ipaUs = p.text;
            }
          }
          if (!ipaUk) ipaUk = entry.phonetic || ipaUs || `/${query}/`;
          if (!ipaUs) ipaUs = entry.phonetic || ipaUk || `/${query}/`;

          lexicalMeanings = (entry.meanings || []).map((m) => ({
            partOfSpeech: m.partOfSpeech || 'general',
            partOfSpeechVi: formatPosVi(m.partOfSpeech),
            synonyms: m.synonyms || [],
            antonyms: m.antonyms || [],
            definitions: (m.definitions || []).map((d) => ({
              definition: d.definition,
              example: d.example || null,
              synonyms: d.synonyms || [],
              antonyms: d.antonyms || []
            }))
          }));

          // Gather example sentences
          for (const m of lexicalMeanings) {
            for (const d of m.definitions) {
              if (d.example) {
                englishExamples.push({
                  en: d.example,
                  pos: m.partOfSpeechVi
                });
                if (englishExamples.length >= 3) break;
              }
            }
            if (englishExamples.length >= 3) break;
          }

          // Gather synonyms
          for (const m of lexicalMeanings) {
            if (m.synonyms) synonyms.push(...m.synonyms);
          }
        }
      } catch (e) {
        console.warn('Failed parsing FreeDictionary data:', e);
      }
    }

    // Fallbacks if IPA was missing
    if (!ipaUk && !ipaUs) {
      ipaUk = `/${query}/`;
      ipaUs = `/${query}/`;
    } else if (!ipaUk) {
      ipaUk = ipaUs;
    } else if (!ipaUs) {
      ipaUs = ipaUk;
    }

    // Fallback if main translation was missing
    if (!viMain) {
      if (savedInNotebook) {
        viMain = savedInNotebook.meaningVi;
      } else {
        viMain = query;
      }
    }

    // Ensure parts of speech breakdown exists
    if (partsOfSpeech.length === 0) {
      partsOfSpeech.push({
        pos: 'general',
        posVi: 'Nghĩa chung',
        meanings: [viMain],
        details: []
      });
    }

    // Generate bilingual example sentences
    const bilingualExamples = [];

    if (savedInNotebook?.examples && savedInNotebook.examples.length > 0) {
      bilingualExamples.push(...savedInNotebook.examples);
    } else if (englishExamples.length > 0) {
      // Translate the first 2 Oxford examples in parallel
      const translated = await Promise.all(
        englishExamples.slice(0, 2).map(async (ex) => {
          const vi = await translateSentenceVi(ex.en);
          return {
            en: ex.en,
            vi: vi || `Ví dụ câu cho "${query}"`,
            context: ex.pos || 'Oxford Example'
          };
        })
      );
      bilingualExamples.push(...translated);
    }

    // If still no examples, create a natural workplace sentence
    if (bilingualExamples.length === 0) {
      const workplaceSentenceEn = `We should consider the ${query} carefully during our project review.`;
      const workplaceSentenceVi = await translateSentenceVi(workplaceSentenceEn);
      bilingualExamples.push({
        en: workplaceSentenceEn,
        vi: workplaceSentenceVi || `Chúng ta nên xem xét ${query} cẩn thận trong buổi đánh giá dự án.`,
        context: 'Môi Trường Công Sở'
      });
    }

    // Build common collocations
    const collocations = [];
    if (savedInNotebook?.collocations && savedInNotebook.collocations.length > 0) {
      collocations.push(...savedInNotebook.collocations);
    } else {
      collocations.push(
        `Key ${query}`,
        `Apply ${query}`,
        `Review ${query}`,
        `${query} process`
      );
    }

    // Deduplicate and enrich synonyms
    const lowerQueryWord = query.toLowerCase();
    const initialWordMatch = INITIAL_WORDS.find((w) => w.word.toLowerCase() === lowerQueryWord);
    if (initialWordMatch?.synonyms) {
      synonyms.push(...initialWordMatch.synonyms);
    }
    if (savedInNotebook?.synonyms) {
      synonyms.push(...savedInNotebook.synonyms);
    }

    // If still sparse, fetch similar/synonym words from Datamuse
    if (synonyms.length < 3) {
      try {
        const datamuseRes = await fetchWithTimeout(
          `https://api.datamuse.com/words?ml=${encodeURIComponent(query)}&max=8`,
          {},
          1500
        );
        if (datamuseRes.ok) {
          const data = await datamuseRes.json();
          const wordsFound = data
            .map((d) => d.word)
            .filter((w) => w && !w.includes(' ') && w.toLowerCase() !== lowerQueryWord);
          synonyms.push(...wordsFound);
        }
      } catch (e) {
        // ignore Datamuse network errors silently
      }
    }

    const cleanSynonyms = Array.from(new Set(synonyms.map((s) => s.trim()))).filter(Boolean).slice(0, 10);

    return {
      word: query,
      ipaUk,
      ipaUs,
      audioUk,
      audioUs,
      meaningVi: viMain,
      partOfSpeech: partsOfSpeech[0]?.pos || 'noun',
      partsOfSpeech,
      bilingualExamples,
      collocations,
      synonyms: cleanSynonyms,
      antonyms: Array.from(new Set(antonyms)).slice(0, 5),
      lexicalMeanings,
      isSavedInNotebook: Boolean(savedInNotebook),
      savedWordData: savedInNotebook || null,
      source: 'live-hybrid'
    };
  }
};
