import React, { useState, useEffect, useCallback, useTransition, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AddWordModal from './components/AddWordModal';
import MiniCaptureView from './components/MiniCaptureView';
import DailyReviewNudge from './components/DailyReviewNudge';
import './components/tid/vocabulary/vocab.css';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';

// Lazy-loaded Views for maximum performance and fast screen switches
const viewLoaders = {
  vocab: () => import('./components/VocabularyView'),
  notes: () => import('./components/NotesView'),
  tid: () => import('./components/tid/TidModule'),
  review: () => import('./components/DailyReviewView'),
  overview: () => import('./components/tid/vocabulary/Overview'),
  dictionary: () => import('./components/DictionaryView'),
  toeic: () => import('./components/ToeicPracticeView'),
  ielts: () => import('./components/IeltsPracticeView'),
  synonyms: () => import('./components/SynonymsView'),
  grammar: () => import('./components/GrammarView'),
  doctor: () => import('./components/GrammarDoctorView'),
  settings: () => import('./components/SettingsView')
};

const VocabularyView = lazy(viewLoaders.vocab);
const NotesView = lazy(viewLoaders.notes);
const DailyReviewView = lazy(viewLoaders.review);
const SynonymsView = lazy(viewLoaders.synonyms);
const GrammarView = lazy(viewLoaders.grammar);
const GrammarDoctorView = lazy(viewLoaders.doctor);
const SettingsView = lazy(viewLoaders.settings);
const DictionaryView = lazy(viewLoaders.dictionary);
const ToeicPracticeView = lazy(viewLoaders.toeic);
const IeltsPracticeView = lazy(viewLoaders.ielts);
const TidModule = lazy(viewLoaders.tid);

// Overview module parts
const OverviewComponent = lazy(() => viewLoaders.overview().then((mod) => ({ default: mod.Overview })));
const StatsComponent = lazy(() => viewLoaders.overview().then((mod) => ({ default: mod.Stats })));
const HistoryComponent = lazy(() => viewLoaders.overview().then((mod) => ({ default: mod.History })));

// Warm view chunks one at a time while the app is idle so later screen switches are instant
function prefetchViews() {
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
  const queue = Object.values(viewLoaders);
  const next = () => {
    const load = queue.shift();
    if (load) load().catch(() => {}).finally(() => idle(next, { timeout: 2000 }));
  };
  setTimeout(() => idle(next, { timeout: 2000 }), 1500);
}

function ViewLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm font-medium">Đang tải...</span>
      </div>
    </div>
  );
}


export default function App() {
  // Check if opened as mini capture window or with custom topic id
  const urlParams = new URLSearchParams(window.location.search);
  const isMini = urlParams.get('view') === 'mini';
  const customTopicId = urlParams.get('id');

  if (isMini) {
    return <MiniCaptureView />;
  }

  // State
  const [currentView, setCurrentView] = useState(customTopicId ? 'ielts-dictionary' : 'vocab');
  const [tidRoute, setTidRoute] = useState(null);
  const [words, setWords] = useState([]);
  const [settings, setSettings] = useState(storageService.getSettings());
  const [synonymGroups, setSynonymGroups] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addWordInitialDeck, setAddWordInitialDeck] = useState('');
  const [doctorInitialSentence, setDoctorInitialSentence] = useState('');
  const [dictInitialWord, setDictInitialWord] = useState('');
  const [synonymsInitialWord, setSynonymsInitialWord] = useState('');
  const [streak, setStreak] = useState(() => storageService.getStreak());
  const [todayCount, setTodayCount] = useState(() => storageService.getTodayActivityCount());
  const [isCheckedIn, setIsCheckedIn] = useState(() => storageService.isTodayCheckedIn());
  const [noteCount, setNoteCount] = useState(() => storageService.getNotes().length);
  const [, startViewTransition] = useTransition();

  // Switch screens in a transition: the current screen stays interactive while the next one renders
  const navigate = useCallback((view) => startViewTransition(() => setCurrentView(view)), []);

  // Unified Cross-Screen Interconnection Handlers
  const handleLookupDictionary = useCallback((word) => {
    if (!word) return;
    setDictInitialWord(String(word).trim());
    navigate('dictionary');
  }, [navigate]);

  const handleTryInDoctor = useCallback((sentenceOrWord) => {
    if (!sentenceOrWord) return;
    setDoctorInitialSentence(String(sentenceOrWord).trim());
    navigate('doctor');
  }, [navigate]);

  const handleViewSynonyms = useCallback((word) => {
    if (!word) return;
    setSynonymsInitialWord(String(word).trim());
    navigate('synonyms');
  }, [navigate]);

  const handleOpenIn4Skills = useCallback((options = {}) => {
    if (typeof options === 'string') {
      setTidRoute({
        area: 'vocabulary',
        view: 'dash',
        page: 'flashcard',
        sessionSel: { cards: [`custom:${options}`] }
      });
    } else if (options && (options.area || options.view || options.page || options.sessionSel || options.tab)) {
      setTidRoute(options);
    } else {
      setTidRoute({ area: 'vocabulary', view: 'dash', page: 'sets', tab: 'topics' });
    }
    navigate('ielts-dictionary');
  }, [navigate]);

  const handleStartReview = useCallback((_opts) => {
    navigate('review');
  }, [navigate]);

  const handleOpenVocab = useCallback(() => {
    navigate('vocab');
  }, [navigate]);

  const handleOpenGrammar = useCallback(() => {
    navigate('grammar');
  }, [navigate]);

  useEffect(prefetchViews, []);

  // Update streak whenever learning activity occurs
  useEffect(() => {
    const handleActivity = () => {
      setStreak(storageService.getStreak());
      setTodayCount(storageService.getTodayActivityCount());
      setIsCheckedIn(storageService.isTodayCheckedIn());
    };
    const handleWordsUpdated = () => {
      setWords(storageService.getWords());
    };
    const handleNotesUpdated = () => {
      setNoteCount(storageService.getNotes().length);
    };
    window.addEventListener('we-activity-updated', handleActivity);
    window.addEventListener('we-words-updated', handleWordsUpdated);
    window.addEventListener('we-notes-updated', handleNotesUpdated);
    return () => {
      window.removeEventListener('we-activity-updated', handleActivity);
      window.removeEventListener('we-words-updated', handleWordsUpdated);
      window.removeEventListener('we-notes-updated', handleNotesUpdated);
    };
  }, []);

  // Initial load & persistent disk hydration
  useEffect(() => {
    const loadedWords = storageService.getWords();
    setWords(loadedWords);
    const loadedSettings = storageService.getSettings();
    setSettings(loadedSettings);
    const loadedSynonyms = storageService.getSynonymGroups();
    setSynonymGroups(loadedSynonyms);

    // Hydrate from persistent disk file if localStorage was blank
    storageService.initPersistentSync((restored) => {
      if (Array.isArray(restored) && restored.length > 0) {
        setWords(restored);
      }
    });

    // Listen for quick words added via Electron mini window
    if (window.electronAPI && window.electronAPI.onQuickWordAdded) {
      const unsubscribe = window.electronAPI.onQuickWordAdded((newWord) => {
        setWords((prev) => [newWord, ...prev.filter((w) => w.id !== newWord.id)]);
      });
      return () => unsubscribe();
    }
  }, []);

  // Scheduled background daily study reminder check
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      notificationService.checkDailyReminder(words, streak);
    }, 3000);

    const interval = setInterval(() => {
      notificationService.checkDailyReminder(words, streak);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [words, streak]);

  const handleCheckIn = useCallback(() => {
    const res = storageService.checkInToday();
    setStreak(res.streak);
    setTodayCount(res.count);
    setIsCheckedIn(true);
    return res;
  }, []);

  // Handlers
  const handleSaveNewWord = (wordData) => {
    const saved = storageService.addWord(wordData);
    setWords((prev) => [saved, ...prev]);
  };

  const handleRemoveWord = (wordTextOrId) => {
    const norm = String(wordTextOrId || '').trim().toLowerCase();
    const updated = storageService.getWords().filter(
      (w) => w.id !== wordTextOrId && String(w.word || '').trim().toLowerCase() !== norm
    );
    storageService.saveWords(updated);
    setWords(updated);
  };

  const handleDeleteWord = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi sổ tay?')) {
      const updated = storageService.deleteWord(id);
      setWords(updated);
    }
  };

  const handleDeleteWords = (ids) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} từ vựng đã chọn khỏi sổ tay?`)) {
      const updated = storageService.deleteWords(ids);
      setWords(updated);
    }
  };

  const handleClearAllWords = () => {
    if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ từ vựng trong sổ tay để bắt đầu danh sách mới?')) {
      const updated = storageService.clearAllWords();
      setWords(updated);
    }
  };

  const handleRestoreStarterWords = () => {
    if (confirm('Khôi phục danh sách từ vựng công sở mẫu ban đầu?')) {
      const updated = storageService.restoreStarterWords();
      setWords(updated);
    }
  };

  const handleRecordReview = (wordId, isCorrect) => {
    const updated = storageService.recordReviewResult(wordId, isCorrect);
    setWords(updated);
  };

  const handleSaveSettings = (newSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveSynonymGroups = (groups) => {
    storageService.saveSynonymGroups(groups);
    setSynonymGroups(groups);
  };

  const handleRestoreWords = (restoredWords) => {
    storageService.saveWords(restoredWords);
    setWords(restoredWords);
  };

  // Header Titles
  const getHeaderInfo = () => {
    switch (currentView) {
      case 'overview':
        return { title: 'Tổng Quan Tiến Độ Học Tập', subtitle: 'Chuỗi ngày học liên tục, mục tiêu từ vựng & lịch ôn tập' };
      case 'stats':
        return { title: 'Thống Kê Tiến Độ Bộ Từ', subtitle: 'Tỉ lệ ghi nhớ từng chủ đề & lịch sử luyện tập' };
      case 'vocab':
        return { title: 'Sổ Tay Từ Vựng Tiếng Anh', subtitle: 'Kho từ vựng công sở cá nhân' };
      case 'notes':
        return { title: 'Sổ Ghi Chú Học Tập', subtitle: 'Lưu trữ mẫu câu công sở, collocations, cấu trúc IELTS/TOEIC & mẹo học' };
      case 'dictionary':
        return { title: 'Từ Điển Công Sở & Quốc Tế', subtitle: 'Tra cứu chuyên sâu nghĩa công sở, phát âm IPA & định nghĩa Oxford' };
      case 'toeic':
        return { title: 'Luyện Thi TOEIC Quốc Tế', subtitle: 'Kho đề thi chuẩn ETS & đa nguồn • Đầy đủ Listening, Reading, Speaking & Writing' };
      case 'ielts':
        return { title: 'Luyện Thi IELTS Quốc Tế', subtitle: 'Trọn bộ đề thi Cambridge 10–20 mô phỏng thi thật • 4 kỹ năng có bấm giờ & chấm band' };
      case 'ielts-dictionary':
        return { title: 'Luyện 4 Kỹ Năng Toàn Diện', subtitle: 'Listening chép chính tả, Reading song ngữ & báo, Speaking Forecast & Writing 9 bước' };
      case 'review':
        return { title: 'Ôn Tập & Kiểm Tra Hàng Ngày', subtitle: 'Ghi nhớ ngắt quãng (Spaced Repetition)' };
      case 'synonyms':
        return { title: 'Từ Đồng Nghĩa & Sắc Thái', subtitle: 'Mở rộng vốn từ và phân biệt sắc thái' };
      case 'grammar':
        return { title: 'Cẩm Nang Toàn Bộ Ngữ Pháp', subtitle: 'Hệ thống 7 chuyên đề ngữ pháp chuyên sâu' };
      case 'doctor':
        return { title: 'Bác Sĩ Ngữ Pháp & Hiệu Đính', subtitle: 'Chỉ rõ từ sai, nguyên nhân và cách sửa' };
      case 'settings':
        return { title: 'Cài Đặt Ứng Dụng', subtitle: 'Cấu hình AI, phát âm giọng đọc & sao lưu' };
      default:
        return { title: 'WorkingEnglish', subtitle: '' };
    }
  };

  const headerInfo = getHeaderInfo();
  const dueCount = words.filter((w) => (w.box || 1) <= 2).length;

  return (
    <div className="app-container">
      {/* macOS Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={navigate}
        wordCount={words.length}
        dueCount={dueCount}
        noteCount={noteCount}
      />

      {/* Main App Workspace */}
      <div className="main-wrapper">
        <TopBar
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          speechVoice={settings.speechVoice || 'US'}
          onChangeSpeechVoice={(voice) => handleSaveSettings({ ...settings, speechVoice: voice })}
          streak={streak}
          todayCount={todayCount}
          isCheckedIn={isCheckedIn}
          onCheckIn={handleCheckIn}
        />

        {/* Smart In-App Nudge Banner for Leitner Spaced Repetition */}
        <DailyReviewNudge
          dueCount={dueCount}
          streak={streak}
          isCheckedIn={isCheckedIn}
          currentView={currentView}
          onStartReview={() => navigate('review')}
        />

        <main className={`content-body ${currentView === 'ielts-dictionary' ? '!p-0' : ''}`}>
          <Suspense fallback={<ViewLoading />}>
            {currentView === 'overview' && (
              <div className="mx-auto max-w-6xl w-full">
                <OverviewComponent
                  onPick={() => {
                    setTidRoute({ area: 'vocabulary', view: 'dash', page: 'sets' });
                    setCurrentView('ielts-dictionary');
                  }}
                  onReview={(r) => {
                    if (r?.sel) {
                      setTidRoute({ area: 'vocabulary', view: 'dash', page: 'flashcard', sessionSel: r.sel });
                    } else {
                      setTidRoute({ area: 'vocabulary', view: 'dash', page: 'sets' });
                    }
                    setCurrentView('ielts-dictionary');
                  }}
                />
              </div>
            )}

            {currentView === 'stats' && (
              <div className="mx-auto max-w-6xl w-full flex flex-col gap-6">
                <StatsComponent />
                <HistoryComponent
                  onReview={(r) => {
                    if (r?.sel) {
                      setTidRoute({ area: 'vocabulary', view: 'dash', page: 'flashcard', sessionSel: r.sel });
                    } else {
                      setTidRoute({ area: 'vocabulary', view: 'dash', page: 'sets' });
                    }
                    setCurrentView('ielts-dictionary');
                  }}
                />
              </div>
            )}

            {currentView === 'vocab' && (
              <VocabularyView
                words={words}
                onDeleteWord={handleDeleteWord}
                onDeleteWords={handleDeleteWords}
                onClearAllWords={handleClearAllWords}
                onRestoreStarterWords={handleRestoreStarterWords}
                onOpenAddModal={(deck) => {
                  setAddWordInitialDeck(typeof deck === 'string' ? deck : '');
                  setIsAddModalOpen(true);
                }}
                onRecordReview={handleRecordReview}
                speechVoice={settings.speechVoice || 'US'}
                onStartReview={handleStartReview}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
                onViewSynonyms={handleViewSynonyms}
                onOpenIn4Skills={handleOpenIn4Skills}
              />
            )}

            {currentView === 'notes' && (
              <NotesView
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
              />
            )}

            {currentView === 'dictionary' && (
              <DictionaryView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
                initialWord={dictInitialWord}
                onTryInDoctor={handleTryInDoctor}
                onViewSynonyms={handleViewSynonyms}
                onOpenIn4Skills={handleOpenIn4Skills}
                onStartReview={handleStartReview}
                onOpenVocab={handleOpenVocab}
              />
            )}

            {currentView === 'toeic' && (
              <ToeicPracticeView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
              />
            )}

            {currentView === 'ielts' && (
              <IeltsPracticeView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
              />
            )}

            {currentView === 'ielts-dictionary' && (
              <TidModule
                speechVoice={settings.speechVoice || 'US'}
                onSaveWord={handleSaveNewWord}
                onRemoveWord={handleRemoveWord}
                tidRoute={tidRoute}
                onClearTidRoute={() => setTidRoute(null)}
                initialTopicId={customTopicId}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
                onStartReview={handleStartReview}
              />
            )}

            {currentView === 'review' && (
              <DailyReviewView
                words={words}
                onRecordReview={handleRecordReview}
                speechVoice={settings.speechVoice || 'US'}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
                onViewSynonyms={handleViewSynonyms}
                onOpenIn4Skills={handleOpenIn4Skills}
                onOpenVocab={handleOpenVocab}
              />
            )}

            {currentView === 'synonyms' && (
              <SynonymsView
                words={words}
                synonymGroups={synonymGroups}
                onSaveSynonymGroups={handleSaveSynonymGroups}
                speechVoice={settings.speechVoice || 'US'}
                initialWord={synonymsInitialWord}
                onLookupDictionary={handleLookupDictionary}
                onTryInDoctor={handleTryInDoctor}
                onSaveWord={handleSaveNewWord}
                onStartReview={handleStartReview}
                onOpenIn4Skills={handleOpenIn4Skills}
              />
            )}

            {currentView === 'grammar' && (
              <GrammarView
                onTryInDoctor={handleTryInDoctor}
                speechVoice={settings.speechVoice || 'US'}
                onLookupDictionary={handleLookupDictionary}
                onSaveWord={handleSaveNewWord}
              />
            )}

            {currentView === 'doctor' && (
              <GrammarDoctorView
                initialSentence={doctorInitialSentence}
                speechVoice={settings.speechVoice || 'US'}
                onLookupDictionary={handleLookupDictionary}
                onSaveWord={handleSaveNewWord}
                onOpenGrammarHandbook={handleOpenGrammar}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                words={words}
                onRestoreWords={handleRestoreWords}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewWord}
        speechVoice={settings.speechVoice || 'US'}
        initialDeck={addWordInitialDeck}
      />
    </div>
  );
}
