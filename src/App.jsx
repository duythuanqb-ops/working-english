import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import VocabularyView from './components/VocabularyView';
import DailyReviewView from './components/DailyReviewView';
import SynonymsView from './components/SynonymsView';
import GrammarView from './components/GrammarView';
import GrammarDoctorView from './components/GrammarDoctorView';
import SettingsView from './components/SettingsView';
import DictionaryView from './components/DictionaryView';
import ToeicPracticeView from './components/ToeicPracticeView';
import IeltsPracticeView from './components/IeltsPracticeView';
import TidModule from './components/tid/TidModule';
import AddWordModal from './components/AddWordModal';
import MiniCaptureView from './components/MiniCaptureView';
import { storageService } from './services/storageService';

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
      case 'vocab':
        return { title: 'Sổ Tay Từ Vựng Tiếng Anh', subtitle: 'Kho từ vựng công sở cá nhân' };
      case 'dictionary':
        return { title: 'Từ Điển Công Sở & Quốc Tế', subtitle: 'Tra cứu chuyên sâu nghĩa công sở, phát âm IPA & định nghĩa Oxford' };
      case 'toeic':
        return { title: 'Luyện Thi TOEIC Quốc Tế', subtitle: 'Kho đề thi chuẩn ETS & đa nguồn • Đầy đủ Listening, Reading, Speaking & Writing' };
      case 'ielts':
        return { title: 'Luyện Thi IELTS Quốc Tế', subtitle: 'Trọn bộ đề thi Cambridge 10–20 mô phỏng thi thật • 4 kỹ năng có bấm giờ & chấm band' };
      case 'ielts-dictionary':
        return { title: 'The IELTS Dictionary • 100+ Đề 4 Kỹ Năng', subtitle: 'Listening chép chính tả, Reading song ngữ & báo, Speaking Forecast & Writing 9 bước' };
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
