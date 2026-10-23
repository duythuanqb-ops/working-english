import { INITIAL_WORDS } from '../data/starterWords';

const STORAGE_KEYS = {
  WORDS: 'working_english_words_v1',
  SETTINGS: 'working_english_settings_v1',
  SYNONYMS: 'working_english_synonyms_v1',
  QUIZ_HISTORY: 'working_english_quiz_history_v1'
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
  theme: 'dark'
};

export const storageService = {
  getWords: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(INITIAL_WORDS));
        return INITIAL_WORDS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load words from storage:', e);
      return INITIAL_WORDS;
    }
  },

  saveWords: (words) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    } catch (e) {
      console.error('Failed to save words:', e);
    }
  },

  addWord: (newWord) => {
    const words = storageService.getWords();
    const wordWithDefaults = {
      id: `word-${Date.now()}`,
      box: 1,
      reviewCount: 0,
      correctCount: 0,
      dateAdded: new Date().toISOString(),
      lastReviewed: null,
      tags: ['Work'],
      examples: [],
      synonyms: [],
      antonyms: [],
      collocations: [],
      ...newWord
    };
    const updated = [wordWithDefaults, ...words];
    storageService.saveWords(updated);
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

  // Leitner Spaced Repetition updater
  recordReviewResult: (wordId, isCorrect) => {
    const words = storageService.getWords();
    const updated = words.map((w) => {
      if (w.id !== wordId) return w;
      let newBox = w.box || 1;
      if (isCorrect) {
        newBox = Math.min(5, newBox + 1);
      } else {
        newBox = Math.max(1, newBox - 1);
      }
      return {
        ...w,
        box: newBox,
        reviewCount: (w.reviewCount || 0) + 1,
        correctCount: (w.correctCount || 0) + (isCorrect ? 1 : 0),
        lastReviewed: new Date().toISOString()
      };
    });
    storageService.saveWords(updated);
    return updated;
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
  }
};
