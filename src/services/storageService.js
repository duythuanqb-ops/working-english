import { INITIAL_WORDS } from '../data/starterWords';
import { GRAMMAR_CHAPTERS } from '../data/grammarHandbook';

const STORAGE_KEYS = {
  WORDS: 'working_english_words_v1',
  SETTINGS: 'working_english_settings_v1',
  SYNONYMS: 'working_english_synonyms_v1',
  QUIZ_HISTORY: 'working_english_quiz_history_v1',
  GRAMMAR: 'working_english_grammar_chapters_v1',
  SEARCH_HISTORY: 'working_english_dict_history_v1',
  CUSTOM_DECKS: 'working_english_custom_decks_v1',
  NOTES: 'working_english_notes_v1'
};


const DEFAULT_SETTINGS = {
  aiProvider: 'gemini', // 'gemini' | 'openai'
  geminiApiKey: '',
  openaiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  openaiModel: 'gpt-4o-mini',
  dailyReviewTarget: 10,
  speechRate: 1.0,
  speechVoice: 'US', // 'US' | 'UK'
  theme: 'light',
  reminderEnabled: true,
  reminderTime: '20:00'
};

let isHydrated = false;
let syncTimer = null;
const scheduleDiskSync = () => {
  if (typeof window === 'undefined' || !window.electronAPI?.saveUserData) return;
  // Guard: Never write to disk before initial hydration check finishes
  if (!isHydrated) return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    try {
      const payload = {
        version: 1,
        savedAt: Date.now(),
        words: storageService.getWords(),
        customDecks: storageService.getCustomDecks(),
        notes: storageService.getNotes(),
        settings: storageService.getSettings(),
        synonyms: storageService.getSynonymGroups(),
        quizHistory: storageService.getQuizHistory(),
        searchHistory: storageService.getSearchHistory(),
        tidVocabCustom: JSON.parse(localStorage.getItem('tid_vocab_custom_v1') || '[]')
      };
      window.electronAPI.saveUserData(payload);
    } catch (e) {
      console.warn('scheduleDiskSync error:', e);
    }
  }, 400);
};

export const storageService = {
  // Notes Management API
  getNotes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data === null) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(data) || [];
      const cleaned = parsed.filter((n) => !n.id?.startsWith('note_starter_'));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(cleaned));
        scheduleDiskSync();
      }
      return cleaned;
    } catch (e) {
      console.error('Failed to load notes from storage:', e);
      return [];
    }
  },

  saveNotes: (notes) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('we-notes-updated'));
      }
      scheduleDiskSync();
      return notes;
    } catch (e) {
      console.error('Failed to save notes:', e);
      return [];
    }
  },

  addNote: (noteData) => {
    const notes = storageService.getNotes();
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: (noteData.title || 'Ghi chú không tiêu đề').trim(),
      category: noteData.category || 'Chung',
      color: noteData.color || 'lavender',
      isPinned: Boolean(noteData.isPinned),
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      content: (noteData.content || '').trim(),
      images: Array.isArray(noteData.images) ? noteData.images : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newNote, ...notes];
    storageService.saveNotes(updated);
    return newNote;
  },

  updateNote: (id, noteData) => {
    const notes = storageService.getNotes();
    let updatedNote = null;
    const updated = notes.map((note) => {
      if (note.id === id) {
        updatedNote = {
          ...note,
          ...noteData,
          title: noteData.title !== undefined ? noteData.title.trim() : note.title,
          content: noteData.content !== undefined ? noteData.content.trim() : note.content,
          updatedAt: Date.now()
        };
        return updatedNote;
      }
      return note;
    });
    storageService.saveNotes(updated);
    return updatedNote;
  },

  deleteNote: (id) => {
    const notes = storageService.getNotes();
    const updated = notes.filter((n) => n.id !== id);
    storageService.saveNotes(updated);
    return updated;
  },

  togglePinNote: (id) => {
    const notes = storageService.getNotes();
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n));
    storageService.saveNotes(updated);
    return updated;
  },
  getWords: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (data === null) {
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Failed to load words from storage:', e);
      return [];
    }
  },

  saveWords: (words) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('we-words-updated'));
      }
      scheduleDiskSync();
    } catch (e) {
      console.error('Failed to save words:', e);
    }
  },

  getCustomDecks: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS);
      if (raw === null) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify([]));
        return [];
      }
      const decks = JSON.parse(raw);
      return Array.isArray(decks) ? decks : [];
    } catch (e) {
      console.error('Failed to load custom decks:', e);
      return [];
    }
  },

  clearAllDecks: () => {
    storageService.saveCustomDecks([]);
    return [];
  },

  saveCustomDecks: (decks) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('we-decks-updated'));
      }
      scheduleDiskSync();
    } catch (e) {
      console.error('Failed to save custom decks:', e);
    }
  },

  addCustomDeck: (deckData) => {
    const decks = storageService.getCustomDecks();
    const name = (deckData.name || '').trim();
    if (!name) return null;
    const existing = decks.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newDeck = {
      id: `deck-${Date.now()}`,
      name,
      desc: (deckData.desc || '').trim() || `Bộ từ vựng ${name}`,
      color: deckData.color || '#4F46E5',
      createdAt: Date.now()
    };
    const updated = [newDeck, ...decks];
    storageService.saveCustomDecks(updated);
    return newDeck;
  },

  updateCustomDeck: (idOrOldName, updatedData) => {
    const decks = storageService.getCustomDecks();
    const target = String(idOrOldName || '').toLowerCase();
    const index = decks.findIndex((d) => d.id.toLowerCase() === target || d.name.toLowerCase() === target);
    if (index === -1) return null;
    const oldName = decks[index].name;
    const newName = (updatedData.name || oldName).trim();
    decks[index] = {
      ...decks[index],
      ...updatedData,
      name: newName
    };
    storageService.saveCustomDecks(decks);

    if (oldName !== newName) {
      const words = storageService.getWords();
      let changed = false;
      const updatedWords = words.map((w) => {
        if (w.deck && w.deck.toLowerCase() === oldName.toLowerCase()) {
          changed = true;
          return { ...w, deck: newName };
        }
        return w;
      });
      if (changed) {
        storageService.saveWords(updatedWords);
      }
    }
    return decks[index];
  },

  deleteCustomDeck: (idOrName) => {
    const decks = storageService.getCustomDecks();
    const target = String(idOrName || '').toLowerCase();
    const deckToDelete = decks.find((d) => d.id.toLowerCase() === target || d.name.toLowerCase() === target);
    const updated = decks.filter((d) => d.id.toLowerCase() !== target && d.name.toLowerCase() !== target);
    storageService.saveCustomDecks(updated);

    if (deckToDelete) {
      const words = storageService.getWords();
      let changed = false;
      const updatedWords = words.map((w) => {
        if (w.deck && w.deck.toLowerCase() === deckToDelete.name.toLowerCase()) {
          changed = true;
          return { ...w, deck: '' };
        }
        return w;
      });
      if (changed) {
        storageService.saveWords(updatedWords);
      }
    }
    return updated;
  },

  addWord: (newWord) => {
    const words = storageService.getWords();
    const defaultDeck = (newWord.deck || (Array.isArray(newWord.tags) && newWord.tags[0]) || '').trim();
    const wordWithDefaults = {
      id: `word-${Date.now()}`,
      box: 1,
      reviewCount: 0,
      correctCount: 0,
      dateAdded: new Date().toISOString(),
      lastReviewed: null,
      deck: defaultDeck,
      tags: newWord.tags || (defaultDeck ? [defaultDeck] : []),
      examples: [],
      synonyms: [],
      antonyms: [],
      collocations: [],
      notes: '',
      ...newWord,
      deck: (newWord.deck || defaultDeck || '').trim()
    };
    if (wordWithDefaults.deck) {
      storageService.addCustomDeck({ name: wordWithDefaults.deck });
    }
    const updated = [wordWithDefaults, ...words];
    storageService.saveWords(updated);
    storageService.recordActivity(1);
    return wordWithDefaults;
  },

  updateWord: (updatedWord) => {
    const words = storageService.getWords();
    const updated = words.map((w) => (w.id === updatedWord.id ? updatedWord : w));
    storageService.saveWords(updated);
    return updated;
  },

  deleteWord: (id) => {
    const words = storageService.getWords();
    const updated = words.filter((w) => w.id !== id);
    storageService.saveWords(updated);
    return updated;
  },

  deleteWordByText: (wordText) => {
    const norm = String(wordText || '').trim().toLowerCase();
    if (!norm) return storageService.getWords();
    const words = storageService.getWords();
    const updated = words.filter((w) => String(w.word || '').trim().toLowerCase() !== norm);
    storageService.saveWords(updated);
    return updated;
  },

  deleteWords: (ids) => {
    const idSet = new Set(ids);
    const words = storageService.getWords();
    const updated = words.filter((w) => !idSet.has(w.id));
    storageService.saveWords(updated);
    return updated;
  },

  clearAllWords: () => {
    storageService.saveWords([]);
    return [];
  },

  restoreStarterWords: () => {
    storageService.saveWords(INITIAL_WORDS);
    return INITIAL_WORDS;
  },

  isWordSaved: (wordText) => {
    const norm = String(wordText || '').trim().toLowerCase();
    if (!norm) return false;
    const words = storageService.getWords();
    return words.some((w) => String(w.word || '').trim().toLowerCase() === norm);
  },

  // Leitner & SRS Spaced Repetition updater (supports 4 ratings: 'forgot' | 'hard' | 'good' | 'easy' or boolean)
  recordReviewResult: (wordIdOrText, ratingOrCorrect) => {
    const words = storageService.getWords();
    const norm = String(wordIdOrText || '').trim().toLowerCase();

    // Normalize rating
    let rating = ratingOrCorrect;
    if (typeof ratingOrCorrect === 'boolean') {
      rating = ratingOrCorrect ? 'good' : 'forgot';
    }
    if (!['forgot', 'hard', 'good', 'easy'].includes(rating)) {
      rating = 'good';
    }

    let targetWordText = null;

    const updated = words.map((w) => {
      const matchId = w.id === wordIdOrText;
      const matchWord = String(w.word || '').trim().toLowerCase() === norm;
      if (!matchId && !matchWord) return w;

      targetWordText = w.word;
      let newBox = w.box || 1;
      let isCorrect = false;

      if (rating === 'forgot') {
        newBox = 1;
        isCorrect = false;
      } else if (rating === 'hard') {
        newBox = Math.max(1, Math.min(2, newBox));
        isCorrect = false;
      } else if (rating === 'good') {
        newBox = Math.min(5, newBox + 1);
        isCorrect = true;
      } else if (rating === 'easy') {
        newBox = Math.min(5, Math.max(3, newBox + 2));
        isCorrect = true;
      }

      const srsResult = storageService.calculateNextSrsReview(w, rating);

      return {
        ...w,
        box: newBox,
        reviewCount: (w.reviewCount || 0) + 1,
        correctCount: (w.correctCount || 0) + (isCorrect ? 1 : 0),
        lastRating: rating,
        easeFactor: srsResult.easeFactor,
        intervalDays: srsResult.intervalDays,
        nextReviewAt: srsResult.nextReviewAt,
        lastReviewed: new Date().toISOString()
      };
    });

    storageService.saveWords(updated);
    storageService.recordActivity(1);

    // Bi-directional sync with 4-skills vocabulary SRS store
    if (targetWordText) {
      storageService.syncToTidSrs(targetWordText, rating);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('we-words-updated'));
    }

    return updated;
  },

  calculateNextSrsReview: (word, rating) => {
    const RATINGS_CFG = {
      forgot: { intervalMultiplier: 0, easeDelta: -0.2 },
      hard: { intervalMultiplier: 1.2, easeDelta: -0.15 },
      good: { intervalMultiplier: 0, easeDelta: 0 },
      easy: { intervalMultiplier: 0, easeDelta: 0.15 },
    };
    const r = RATINGS_CFG[rating] || RATINGS_CFG.good;
    const ease = word.easeFactor || 2.5;
    const interval = word.intervalDays || 0;
    const count = word.reviewCount || 0;

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
  },

  syncToTidSrs: (wordText, rating) => {
    try {
      const k = String(wordText || '').trim().toLowerCase();
      if (!k) return;
      const raw = localStorage.getItem('tid_vocab_srs_v1');
      const all = raw ? JSON.parse(raw) : {};
      const prev = all[k] || { ease: 2.5, interval: 0, count: 0 };

      const RATINGS_CFG = {
        forgot: { intervalMultiplier: 0, easeDelta: -0.2 },
        hard: { intervalMultiplier: 1.2, easeDelta: -0.15 },
        good: { intervalMultiplier: 0, easeDelta: 0 },
        easy: { intervalMultiplier: 0, easeDelta: 0.15 },
      };
      const rCfg = RATINGS_CFG[rating] || RATINGS_CFG.good;
      const e = Math.min(5, Math.max(1.3, prev.ease + rCfg.easeDelta));
      let n = prev.count + 1;
      let days;
      if (rating === 'forgot') { days = 1; n = 0; }
      else if (rating === 'hard') days = Math.max(1, Math.round(prev.interval * rCfg.intervalMultiplier));
      else if (rating === 'easy') days = Math.max(1, Math.round(prev.interval * e * 1.3));
      else days = prev.count === 0 || prev.interval === 0 ? 1 : Math.max(1, Math.round(prev.interval * e));
      days = Math.min(days, 365);
      const next = new Date();
      next.setDate(next.getDate() + (n > 0 ? days : 1));
      if (n > 0) next.setHours(7, 0, 0, 0);

      all[k] = {
        ease: +e.toFixed(2),
        interval: days,
        count: n,
        due: next.getTime(),
        last: rating,
        at: Date.now(),
        d: prev.d || 'notebook'
      };
      localStorage.setItem('tid_vocab_srs_v1', JSON.stringify(all));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('we-srs-updated', { detail: { word: k, rating, srs: all[k] } }));
      }
    } catch (err) {
      console.warn('Failed to sync to tid_vocab_srs_v1:', err);
    }
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      scheduleDiskSync();
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getSynonymGroups: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNONYMS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveSynonymGroups: (groups) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNONYMS, JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to save synonym groups:', e);
    }
  },

  getQuizHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveQuizResult: (result) => {
    const history = storageService.getQuizHistory();
    const newEntry = {
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      ...result
    };
    const updated = [newEntry, ...history.slice(0, 49)];
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save quiz history:', e);
    }
    return newEntry;
  },

  /* ==========================================================================
     Grammar Handbook Persistence & Custom User Rules
     ========================================================================== */

  getGrammarChapters: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRAMMAR);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GRAMMAR, JSON.stringify(GRAMMAR_CHAPTERS));
        return GRAMMAR_CHAPTERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load grammar chapters:', e);
      return GRAMMAR_CHAPTERS;
    }
  },

  saveGrammarChapters: (chapters) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GRAMMAR, JSON.stringify(chapters));
    } catch (e) {
      console.error('Failed to save grammar chapters:', e);
    }
  },

  addGrammarSection: (chapterId, sectionData) => {
    const chapters = storageService.getGrammarChapters();
    const newSection = {
      subId: `custom-sec-${Date.now()}`,
      isCustom: true,
      ...sectionData
    };

    const updated = chapters.map((ch) => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          sections: [newSection, ...ch.sections]
        };
      }
      return ch;
    });

    storageService.saveGrammarChapters(updated);
    return updated;
  },

  deleteGrammarSection: (chapterId, subId) => {
    const chapters = storageService.getGrammarChapters();
    const updated = chapters.map((ch) => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          sections: ch.sections.filter((s) => s.subId !== subId)
        };
      }
      return ch;
    });
    storageService.saveGrammarChapters(updated);
    return updated;
  },

  updateGrammarSection: (chapterId, subId, updatedData) => {
    const chapters = storageService.getGrammarChapters();
    const updated = chapters.map((ch) => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          sections: ch.sections.map((s) => (s.subId === subId ? { ...s, ...updatedData } : s))
        };
      }
      return ch;
    });
    storageService.saveGrammarChapters(updated);
    return updated;
  },

  addGrammarChapter: (chapterData) => {
    const chapters = storageService.getGrammarChapters();
    const newChapter = {
      id: `custom-ch-${Date.now()}`,
      icon: 'BookMarked',
      isCustom: true,
      sections: [],
      ...chapterData
    };
    const updated = [...chapters, newChapter];
    storageService.saveGrammarChapters(updated);
    return updated;
  },

  deleteGrammarChapter: (chapterId) => {
    const chapters = storageService.getGrammarChapters();
    const updated = chapters.filter((ch) => ch.id !== chapterId);
    storageService.saveGrammarChapters(updated);
    return updated;
  },

  resetGrammarToDefault: () => {
    storageService.saveGrammarChapters(GRAMMAR_CHAPTERS);
    return GRAMMAR_CHAPTERS;
  },

  /* ==========================================================================
     Dictionary Search History
     ========================================================================== */

  getSearchHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  addSearchHistory: (term) => {
    if (!term || typeof term !== 'string') return [];
    const cleanTerm = term.trim().toLowerCase();
    if (!cleanTerm) return [];
    const history = storageService.getSearchHistory();
    const filtered = history.filter((item) => item.toLowerCase() !== cleanTerm);
    const updated = [cleanTerm, ...filtered].slice(0, 20); // Keep 20 recent
    try {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
    return updated;
  },

  clearSearchHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
    return [];
  },

  /* ==========================================================================
     Daily Activity, Real Streak & Check-in System
     ========================================================================== */

  getDayKey: (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getActivityLog: () => {
    try {
      const data = localStorage.getItem('tid_vocab_activity_v1');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  recordActivity: (count = 1) => {
    try {
      const activities = storageService.getActivityLog();
      const today = storageService.getDayKey();
      activities[today] = (activities[today] || 0) + count;
      localStorage.setItem('tid_vocab_activity_v1', JSON.stringify(activities));
      // Dispatch storage event so all components react immediately
      window.dispatchEvent(new CustomEvent('we-activity-updated', { detail: { today, count: activities[today] } }));
      return activities[today];
    } catch (e) {
      console.error('Failed to record activity:', e);
      return 0;
    }
  },

  getStreak: () => {
    const act = storageService.getActivityLog();
    const d = new Date();
    // If today hasn't had activity yet, streak is still intact from yesterday
    if (!act[storageService.getDayKey(d)]) {
      d.setDate(d.getDate() - 1);
    }
    let count = 0;
    while (act[storageService.getDayKey(d)]) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  },

  isTodayCheckedIn: () => {
    const act = storageService.getActivityLog();
    const today = storageService.getDayKey();
    return Boolean(act[today] && act[today] > 0);
  },

  getTodayActivityCount: () => {
    const act = storageService.getActivityLog();
    const today = storageService.getDayKey();
    return act[today] || 0;
  },

  checkInToday: () => {
    const isAlready = storageService.isTodayCheckedIn();
    storageService.recordActivity(1);
    const newStreak = storageService.getStreak();
    return {
      success: true,
      isFirstToday: !isAlready,
      streak: newStreak,
      count: storageService.getTodayActivityCount()
    };
  },

  /* ==========================================================================
     Full App Snapshot Export & Import (All-in-One Backup)
     ========================================================================== */

  exportFullSnapshot: () => {
    const words = storageService.getWords();
    const settings = storageService.getSettings();
    const synonyms = storageService.getSynonymGroups();
    const grammar = storageService.getGrammarChapters();
    const quizHistory = storageService.getQuizHistory();
    const searchHistory = storageService.getSearchHistory();

    // Collect all TID module & learning data from localStorage
    const tidState = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('tid_') ||
          key.startsWith('roulette_') ||
          key.startsWith('exam_') ||
          key.startsWith('working_english_'))
      ) {
        try {
          tidState[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          tidState[key] = localStorage.getItem(key);
        }
      }
    }

    const snapshot = {
      app: 'WorkingEnglish',
      format: 'full_snapshot_v2',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      summary: {
        wordsCount: words.length,
        streak: storageService.getStreak(),
        settingsSummary: `${settings.speechVoice} voice, ${settings.aiProvider || 'offline'} AI`,
        keysCount: Object.keys(tidState).length
      },
      core: {
        words,
        settings,
        synonyms,
        grammar,
        quizHistory,
        searchHistory,
        notes: storageService.getNotes()
      },
      fullStorage: tidState
    };

    return snapshot;
  },

  importFullSnapshot: (backupPayload) => {
    if (!backupPayload) throw new Error('Dữ liệu sao lưu trống.');

    // 1. Legacy v1: raw array of words
    if (Array.isArray(backupPayload)) {
      storageService.saveWords(backupPayload);
      storageService.recordActivity(1);
      return {
        mode: 'words_only',
        wordsCount: backupPayload.length,
        message: `Đã khôi phục thành công ${backupPayload.length} từ vựng từ tệp sao lưu v1!`
      };
    }

    // 2. Full Snapshot v2
    if (backupPayload.format === 'full_snapshot_v2' || backupPayload.core) {
      const { core, fullStorage } = backupPayload;

      // Restore core items
      if (core?.words) storageService.saveWords(core.words);
      if (core?.notes) storageService.saveNotes(core.notes);
      if (core?.settings) storageService.saveSettings(core.settings);
      if (core?.synonyms) storageService.saveSynonymGroups(core.synonyms);
      if (core?.grammar) storageService.saveGrammarChapters(core.grammar);
      if (core?.quizHistory) {
        try {
          localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(core.quizHistory));
        } catch {}
      }
      if (core?.searchHistory) {
        try {
          localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(core.searchHistory));
        } catch {}
      }

      // Restore all fullStorage keys
      if (fullStorage && typeof fullStorage === 'object') {
        Object.entries(fullStorage).forEach(([k, val]) => {
          try {
            localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
          } catch (e) {
            console.warn('Failed restoring key:', k, e);
          }
        });
      }

      // Record check-in to confirm restore activity
      storageService.recordActivity(1);

      return {
        mode: 'full_snapshot',
        wordsCount: core?.words?.length || 0,
        streak: storageService.getStreak(),
        message: `Khôi phục toàn diện thành công! Đã phục hồi ${core?.words?.length || 0} từ vựng, chuỗi ngày học và toàn bộ tiến trình 4 kỹ năng.`
      };
    }

    throw new Error('Định dạng tệp sao lưu không được hỗ trợ.');
  },

  // Auto-hydration from disk on app startup (preserves data across builds & cache clears)
  initPersistentSync: async (onRestored) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.loadUserData) {
        const res = await window.electronAPI.loadUserData();
        if (res?.success && res.data) {
          const diskData = res.data;
          const currentWords = storageService.getWords();
          const currentDecks = storageService.getCustomDecks();

          // If disk has words but localStorage has fewer/no words, restore from disk!
          const shouldRestore = Array.isArray(diskData.words) && diskData.words.length > currentWords.length;
          const shouldRestoreDecks = Array.isArray(diskData.customDecks) && diskData.customDecks.length > currentDecks.length;

          if (shouldRestore || shouldRestoreDecks) {
            if (Array.isArray(diskData.words)) {
              localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(diskData.words));
            }
            if (Array.isArray(diskData.customDecks)) {
              localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(diskData.customDecks));
            }
            if (diskData.settings) {
              localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(diskData.settings));
            }
            if (Array.isArray(diskData.synonyms)) {
              localStorage.setItem(STORAGE_KEYS.SYNONYMS, JSON.stringify(diskData.synonyms));
            }
            if (Array.isArray(diskData.quizHistory)) {
              localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(diskData.quizHistory));
            }
            if (Array.isArray(diskData.searchHistory)) {
              localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(diskData.searchHistory));
            }
            if (Array.isArray(diskData.tidVocabCustom)) {
              localStorage.setItem('tid_vocab_custom_v1', JSON.stringify(diskData.tidVocabCustom));
            }
            if (Array.isArray(diskData.notes)) {
              localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(diskData.notes));
            }

            window.dispatchEvent(new CustomEvent('we-words-updated'));
            window.dispatchEvent(new CustomEvent('we-decks-updated'));
            window.dispatchEvent(new CustomEvent('we-notes-updated'));
            if (onRestored) onRestored(diskData.words);
          }
        }
      }
    } catch (err) {
      console.warn('initPersistentSync warning:', err);
    } finally {
      isHydrated = true;
      // If we have active words in memory/storage, ensure disk has latest
      if (storageService.getWords().length > 0 || storageService.getCustomDecks().length > 0) {
        scheduleDiskSync();
      }
    }
  }
};

