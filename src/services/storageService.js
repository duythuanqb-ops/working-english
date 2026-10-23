import { INITIAL_WORDS } from '../data/starterWords';
import { GRAMMAR_CHAPTERS } from '../data/grammarHandbook';

const STORAGE_KEYS = {
  WORDS: 'working_english_words_v1',
  SETTINGS: 'working_english_settings_v1',
  SYNONYMS: 'working_english_synonyms_v1',
  QUIZ_HISTORY: 'working_english_quiz_history_v1',
  GRAMMAR: 'working_english_grammar_chapters_v1'
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
  theme: 'light'
};

export const storageService = {
  getWords: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(INITIAL_WORDS));
        return INITIAL_WORDS;
      }
      const existing = JSON.parse(data);
      // Auto-merge new curated starter words if any are missing
      const existingIds = new Set(existing.map((w) => w.id));
      const missingStarters = INITIAL_WORDS.filter((w) => !existingIds.has(w.id));
      if (missingStarters.length > 0) {
        const merged = [...existing, ...missingStarters];
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(merged));
        return merged;
      }
      return existing;
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
  }
};
