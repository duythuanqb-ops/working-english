import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AddWordModal from './components/AddWordModal';
import MiniCaptureView from './components/MiniCaptureView';
import './components/tid/vocabulary/vocab.css';
import { storageService } from './services/storageService';

// Lazy-loaded Views for maximum performance and fast screen switches
const VocabularyView = lazy(() => import('./components/VocabularyView'));
const DailyReviewView = lazy(() => import('./components/DailyReviewView'));
const SynonymsView = lazy(() => import('./components/SynonymsView'));
const GrammarView = lazy(() => import('./components/GrammarView'));
const GrammarDoctorView = lazy(() => import('./components/GrammarDoctorView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const DictionaryView = lazy(() => import('./components/DictionaryView'));
const ToeicPracticeView = lazy(() => import('./components/ToeicPracticeView'));
const IeltsPracticeView = lazy(() => import('./components/IeltsPracticeView'));
const TidModule = lazy(() => import('./components/tid/TidModule'));

// Overview module parts
const OverviewComponent = lazy(() =>
  import('./components/tid/vocabulary/Overview').then((mod) => ({ default: mod.Overview }))
);
const StatsComponent = lazy(() =>
  import('./components/tid/vocabulary/Overview').then((mod) => ({ default: mod.Stats }))
);
const HistoryComponent = lazy(() =>
  import('./components/tid/vocabulary/Overview').then((mod) => ({ default: mod.History }))
);

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
  const [doctorInitialSentence, setDoctorInitialSentence] = useState('');

  // Initial load
  useEffect(() => {
    const loadedWords = storageService.getWords();
    setWords(loadedWords);
    const loadedSettings = storageService.getSettings();
    setSettings(loadedSettings);
    const loadedSynonyms = storageService.getSynonymGroups();
    setSynonymGroups(loadedSynonyms);

    // Listen for quick words added via Electron mini window
    if (window.electronAPI && window.electronAPI.onQuickWordAdded) {
      const unsubscribe = window.electronAPI.onQuickWordAdded((newWord) => {
        setWords((prev) => [newWord, ...prev.filter((w) => w.id !== newWord.id)]);
      });
      return () => unsubscribe();
    }
  }, []);

  // Handlers
  const handleSaveNewWord = (wordData) => {
    const saved = storageService.addWord(wordData);
    setWords((prev) => [saved, ...prev]);
  };

  const handleDeleteWord = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi sổ tay?')) {
      const updated = storageService.deleteWord(id);
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

  const handleTryInDoctor = (exampleSentence) => {
    setDoctorInitialSentence(exampleSentence);
    setCurrentView('doctor');
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
        setCurrentView={setCurrentView}
        wordCount={words.length}
        dueCount={dueCount}
      />

      {/* Main App Workspace */}
      <div className="main-wrapper">
        <TopBar
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          speechVoice={settings.speechVoice || 'US'}
          onChangeSpeechVoice={(voice) => handleSaveSettings({ ...settings, speechVoice: voice })}
        />

        <main className="content-body">
          <Suspense fallback={<ViewLoading />}>
            {currentView === 'overview' && (
              <div className="vc-dash h-full overflow-y-auto bg-[var(--d-bg)] p-4 md:p-6 transition-colors duration-500">
                <div className="mx-auto max-w-6xl">
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
              </div>
            )}

            {currentView === 'stats' && (
              <div className="vc-dash h-full overflow-y-auto bg-[var(--d-bg)] p-4 md:p-6 transition-colors duration-500">
                <div className="mx-auto max-w-6xl flex flex-col gap-6">
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
              </div>
            )}

            {currentView === 'vocab' && (
              <VocabularyView
                words={words}
                onDeleteWord={handleDeleteWord}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onRecordReview={handleRecordReview}
                speechVoice={settings.speechVoice || 'US'}
                onStartReview={() => setCurrentView('review')}
              />
            )}

            {currentView === 'dictionary' && (
              <DictionaryView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'toeic' && (
              <ToeicPracticeView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'ielts' && (
              <IeltsPracticeView
                words={words}
                onSaveWord={handleSaveNewWord}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'ielts-dictionary' && (
              <TidModule
                speechVoice={settings.speechVoice || 'US'}
                onSaveWord={handleSaveNewWord}
                tidRoute={tidRoute}
                onClearTidRoute={() => setTidRoute(null)}
              />
            )}

            {currentView === 'review' && (
              <DailyReviewView
                words={words}
                onRecordReview={handleRecordReview}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'synonyms' && (
              <SynonymsView
                words={words}
                synonymGroups={synonymGroups}
                onSaveSynonymGroups={handleSaveSynonymGroups}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'grammar' && (
              <GrammarView
                onTryInDoctor={handleTryInDoctor}
                speechVoice={settings.speechVoice || 'US'}
              />
            )}

            {currentView === 'doctor' && (
              <GrammarDoctorView
                initialSentence={doctorInitialSentence}
                speechVoice={settings.speechVoice || 'US'}
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
      />
    </div>
  );
}
