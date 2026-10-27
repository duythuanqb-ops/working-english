import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Award,
  Sparkles,
  Layers,
  Check,
  Send,
  Eye,
  EyeOff,
  Trophy
} from 'lucide-react';
import IeltsCatalogView from './IeltsCatalogView';
import { IELTS_CATALOG_TESTS, calculateIeltsBand, IELTS_BAND_SCORE_TABLE } from '../data/ieltsData';
import { useExam, loadExam, resolveIeltsExamId } from '../data/exams';
import { ttsService } from '../services/ttsService';

export default function IeltsPracticeView({ words = [], onSaveWord, speechVoice = 'US' }) {
  // Mode: 'catalog' | 'exam'
  const [viewMode, setViewMode] = useState('catalog');
  const [activeCatalogTest, setActiveCatalogTest] = useState(IELTS_CATALOG_TESTS[0]);
  const [catalogTab, setCatalogTab] = useState('all');

  // Test History in localStorage
  const [testHistory, setTestHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ielts_test_history_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Current Skill: 'listening' | 'reading' | 'writing' | 'speaking'
  const [activeSkill, setActiveSkill] = useState('listening');

  // Skill Sub-states
  const [listeningPartNum, setListeningPartNum] = useState(1); // 1, 2, 3, 4
  const [readingPassageNum, setReadingPassageNum] = useState(1); // 1, 2, 3
  const [writingTaskNum, setWritingTaskNum] = useState(1); // 1 or 2
  const [speakingPartNum, setSpeakingPartNum] = useState(1); // 1, 2, 3

  // Interactive User Answers
  // { [qid]: string | selectedOptionKey }
  const [userAnswers, setUserAnswers] = useState({});
  const [showSolutions, setShowSolutions] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Audio Playback
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Speaking Audio TTS state
  const [isSpeakingPlaying, setIsSpeakingPlaying] = useState(false);
  const [speakingActiveQIdx, setSpeakingActiveQIdx] = useState(0);

  // Speaking Timers (Part 2)
  const [speakingPrepTime, setSpeakingPrepTime] = useState(60);
  const [isSpeakingPrepRunning, setIsSpeakingPrepRunning] = useState(false);
  const [speakingTalkTime, setSpeakingTalkTime] = useState(120);
  const [isSpeakingTalkRunning, setIsSpeakingTalkRunning] = useState(false);

  // Writing Text Input
  const [writingAnswers, setWritingAnswers] = useState({ task1: '', task2: '' });
  const [showWritingModel, setShowWritingModel] = useState(false);

  // Full Exam Timer (165 mins)
  const [examTimeLeft, setExamTimeLeft] = useState(165 * 60);
  const [isExamTimerRunning, setIsExamTimerRunning] = useState(false);

  // Result Modal
  const [showResultModal, setShowResultModal] = useState(false);

  // Load active full exam data
  const activeExamData = useExam(resolveIeltsExamId(activeCatalogTest?.id));

  // Handle select test from catalog
  const handleSelectTest = async (test) => {
    // Load the exam content before switching views so the test never renders half-empty
    await loadExam(resolveIeltsExamId(test.id));
    setActiveCatalogTest(test);
    setViewMode('exam');
    setActiveSkill(test.skill || 'listening');
    setListeningPartNum(1);
    setReadingPassageNum(1);
    setWritingTaskNum(1);
    setSpeakingPartNum(1);
    setUserAnswers({});
    setShowSolutions(false);
    setShowTranscript(false);
    setIsPlayingAudio(false);
    setExamTimeLeft(test.durationMinutes * 60);
    setIsExamTimerRunning(true);
    ttsService.stop();
  };

  // Exam Countdown Timer
  useEffect(() => {
    let interval = null;
    if (isExamTimerRunning && examTimeLeft > 0) {
      interval = setInterval(() => {
        setExamTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamTimerRunning, examTimeLeft]);

  // Speaking Part 2 Timer effects
  useEffect(() => {
    let t = null;
    if (isSpeakingPrepRunning && speakingPrepTime > 0) {
      t = setInterval(() => setSpeakingPrepTime((p) => p - 1), 1000);
    } else if (speakingPrepTime === 0 && isSpeakingPrepRunning) {
      setIsSpeakingPrepRunning(false);
      setIsSpeakingTalkRunning(true);
    }
    return () => clearInterval(t);
  }, [isSpeakingPrepRunning, speakingPrepTime]);

  useEffect(() => {
    let t = null;
    if (isSpeakingTalkRunning && speakingTalkTime > 0) {
      t = setInterval(() => setSpeakingTalkTime((p) => p - 1), 1000);
    } else if (speakingTalkTime === 0) {
      setIsSpeakingTalkRunning(false);
    }
    return () => clearInterval(t);
  }, [isSpeakingTalkRunning, speakingTalkTime]);

  // Audio track for current listening part
  const currentListeningPart = useMemo(() => {
    if (!activeExamData?.listening?.parts) return null;
    return activeExamData.listening.parts.find((p) => p.partNum === listeningPartNum) || activeExamData.listening.parts[0];
  }, [activeExamData, listeningPartNum]);

  const activeAudioTrack = useMemo(() => {
    return currentListeningPart?.audioTrack || '';
  }, [currentListeningPart]);

  // Reset audio when part changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      setAudioCurrentTime(0);
      if (activeAudioTrack) {
        audioRef.current.load();
      }
    }
  }, [activeAudioTrack, listeningPartNum]);

  // Audio handlers
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      ttsService.stop();
      setIsSpeakingPlaying(false);
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch((e) => console.log('Audio error:', e));
    }
  };

  const handleAudioSpeedChange = (speed) => {
    setAudioSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // User answer input
  const handleAnswerChange = (qid, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qid]: value
    }));
  };

  // Calculate scores for listening & reading
  const scoreResults = useMemo(() => {
    if (!activeExamData) return { listeningCorrect: 0, readingCorrect: 0, listeningBand: 0, readingBand: 0 };
    
    // Listening
    let lCorrect = 0;
    if (activeExamData.listening?.parts) {
      for (const part of activeExamData.listening.parts) {
        for (const g of part.groups || []) {
          for (const q of g.questions || []) {
            const userAns = (userAnswers[q.qid] || '').trim().toLowerCase();
            const correctAns = (q.correctAnswer || '').trim().toLowerCase();
            if (userAns && correctAns) {
              const accepted = correctAns.split('/').map((s) => s.trim().toLowerCase());
              if (accepted.includes(userAns) || userAns === correctAns) {
                lCorrect++;
              }
            }
          }
        }
      }
    }

    // Reading
    let rCorrect = 0;
    if (activeExamData.reading?.passages) {
      for (const passage of activeExamData.reading.passages) {
        for (const g of passage.groups || []) {
          for (const q of g.questions || []) {
            const userAns = (userAnswers[q.qid] || '').trim().toLowerCase();
            const correctAns = (q.correctAnswer || '').trim().toLowerCase();
            if (userAns && correctAns) {
              const accepted = correctAns.split('/').map((s) => s.trim().toLowerCase());
              if (accepted.includes(userAns) || userAns === correctAns) {
                rCorrect++;
              }
            }
          }
        }
      }
    }

    const isGT = activeCatalogTest?.category === 'general';
    const lBand = calculateIeltsBand(lCorrect, 'listening', isGT ? 'general' : 'academic');
    const rBand = calculateIeltsBand(rCorrect, 'reading', isGT ? 'general' : 'academic');
    const overallBand = ((lBand + rBand) / 2).toFixed(1);

    return {
      listeningCorrect: lCorrect,
      readingCorrect: rCorrect,
      listeningBand: lBand,
      readingBand: rBand,
      overallBand
    };
  }, [activeExamData, userAnswers, activeCatalogTest]);

  // Speaking TTS speech
  const handlePlaySpeakingModel = (text, qIdx = 0) => {
    if (isSpeakingPlaying && speakingActiveQIdx === qIdx) {
      ttsService.stop();
      setIsSpeakingPlaying(false);
      return;
    }
    // Pause listening audio if running
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
    ttsService.stop();
    setSpeakingActiveQIdx(qIdx);
    setIsSpeakingPlaying(true);
    ttsService.speak(text, speechVoice, () => {
      setIsSpeakingPlaying(false);
    });
  };

  // Finish exam and save history
  const handleFinishExam = () => {
    setShowSolutions(true);
    setShowResultModal(true);
    setIsExamTimerRunning(false);

    if (activeCatalogTest) {
      const historyEntry = {
        testId: activeCatalogTest.id,
        title: activeCatalogTest.title,
        date: new Date().toLocaleDateString('vi-VN'),
        listeningScore: scoreResults.listeningCorrect,
        readingScore: scoreResults.readingCorrect,
        listeningBand: scoreResults.listeningBand,
        readingBand: scoreResults.readingBand,
        overallBand: scoreResults.overallBand,
        completed: true
      };

      const updatedHistory = {
        ...testHistory,
        [activeCatalogTest.id]: historyEntry
      };
      setTestHistory(updatedHistory);
      try {
        localStorage.setItem('ielts_test_history_v1', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save IELTS history:', e);
      }
    }
  };

  // Word count helper
  const countWords = (str = '') => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render Cambridge Catalog directly without nested switcher
  if (viewMode === 'catalog') {
    return (
      <IeltsCatalogView
        testHistory={testHistory}
        onSelectTest={handleSelectTest}
        activeTab={catalogTab}
        setActiveTab={setCatalogTab}
      />
    );
  }

  // Fallback if exam data is loading or missing
  if (!activeExamData) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', borderRadius: '24px' }}>
        <AlertCircle size={48} style={{ color: '#f59e0b', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px 0' }}>Đang nạp đề thi IELTS...</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Đề thi <strong>{activeCatalogTest?.title}</strong> đang được đồng bộ dữ liệu bản gốc và audio phòng thu.
        </p>
        <button
          type="button"
          onClick={() => setViewMode('catalog')}
          style={{
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ← Quay lại danh mục đề
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP BAR NAVIGATION & TIMERS */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn thoát về danh mục đề thi?')) {
                ttsService.stop();
                if (audioRef.current) audioRef.current.pause();
                setViewMode('catalog');
              }
            }}
            style={{
              background: '#f1f5f9',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} />
            Danh mục đề
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: activeCatalogTest.category === 'academic' ? '#e0f2fe' : '#dcfce7',
                  color: activeCatalogTest.category === 'academic' ? '#0369a1' : '#15803d',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                {activeCatalogTest.category === 'academic' ? 'ACADEMIC' : 'GENERAL TRAINING'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {activeCatalogTest.collection}
              </span>
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
              {activeCatalogTest.title}
            </h2>
          </div>
        </div>

        {/* Exam Timer & Finish Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: examTimeLeft < 300 ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${examTimeLeft < 300 ? '#fca5a5' : '#e2e8f0'}`,
              padding: '6px 14px',
              borderRadius: '12px',
              color: examTimeLeft < 300 ? '#dc2626' : '#334155',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}
          >
            <Clock size={16} style={{ color: examTimeLeft < 300 ? '#dc2626' : '#0284c7' }} />
            {formatTime(examTimeLeft)}
          </div>

          <button
            type="button"
            onClick={handleFinishExam}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Check size={16} />
            Nộp bài & Chấm điểm
          </button>
        </div>
      </div>

      {/* 2. 4-SKILL SELECTOR TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}
      >
        {[
          { id: 'listening', label: 'Listening (40 câu)', icon: Headphones, color: '#0284c7', count: 'Part 1 - 4' },
          { id: 'reading', label: 'Reading (40 câu)', icon: BookOpen, color: '#059669', count: 'Passage 1 - 3' },
          { id: 'writing', label: 'Writing (2 Tasks)', icon: PenTool, color: '#d97706', count: 'Task 1 & 2' },
          { id: 'speaking', label: 'Speaking (3 Parts)', icon: Mic, color: '#8b5cf6', count: 'Part 1 - 3' }
        ].map((sk) => {
          const Icon = sk.icon;
          const isActive = activeSkill === sk.id;
          return (
            <button
              key={sk.id}
              type="button"
              onClick={() => {
                setActiveSkill(sk.id);
                ttsService.stop();
              }}
              style={{
                border: isActive ? `2px solid ${sk.color}` : '1px solid #e2e8f0',
                background: isActive ? '#ffffff' : '#f8fafc',
                padding: '14px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? '0 6px 18px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  background: isActive ? `${sk.color}15` : '#e2e8f0',
                  color: isActive ? sk.color : '#64748b',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isActive ? sk.color : '#0f172a' }}>
                  {sk.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  {sk.count}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. SKILL WORKSPACE BODY */}
      {/* ============================================================== */}
      {/* 3A. LISTENING VIEW */}
      {/* ============================================================== */}
      {activeSkill === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Audio Player Bar */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 22px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <audio
              ref={audioRef}
              src={activeAudioTrack}
              onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
              onEnded={() => setIsPlayingAudio(false)}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={togglePlayAudio}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                }}
              >
                {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                  Audio Phòng Thu: Listening Part {listeningPartNum}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 600)}
                </div>
              </div>
            </div>

            {/* Sub-Part Switcher */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '12px' }}>
              {[1, 2, 3, 4].map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setListeningPartNum(pNum)}
                  style={{
                    border: 'none',
                    background: listeningPartNum === pNum ? '#0284c7' : 'transparent',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Part {pNum}
                </button>
              ))}
            </div>

            {/* Speed & Transcript buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '8px' }}>
                {[0.8, 1.0, 1.2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAudioSpeedChange(s)}
                    style={{
                      border: 'none',
                      background: audioSpeed === s ? '#ffffff' : 'transparent',
                      color: audioSpeed === s ? '#0f172a' : '#cbd5e1',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                style={{
                  background: showTranscript ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
                {showTranscript ? 'Ẩn Transcript' : 'Hiện Transcript'}
              </button>
            </div>
          </div>

          {/* Transcript Accordion if enabled */}
          {showTranscript && currentListeningPart?.transcript && (
            <div
              className="card"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '20px',
                borderRadius: '16px',
                fontSize: '0.88rem',
                lineHeight: 1.7,
                color: '#334155'
              }}
            >
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Headphones size={16} style={{ color: '#0284c7' }} />
                Transcript Chi Tiết: Listening Part {listeningPartNum}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {currentListeningPart.transcript}
              </div>
            </div>
          )}

          {/* Question Groups for active Part */}
          {currentListeningPart?.groups?.map((group, gIdx) => (
            <div
              key={gIdx}
              className="card"
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Directions */}
              <div
                style={{
                  background: '#f1f5f9',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '16px'
                }}
              >
                📌 {group.directions ? group.directions.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
              </div>

              {/* Context / Notes HTML if present */}
              {group.contextHtml && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#334155'
                  }}
                  dangerouslySetInnerHTML={{ __html: group.contextHtml }}
                />
              )}

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {group.questions?.map((q) => {
                  const userVal = userAnswers[q.qid] || '';
                  const isChecked = showSolutions;
                  const acceptedAnswers = (q.correctAnswer || '').split('/').map((s) => s.trim().toLowerCase());
                  const isCorrect = userVal && acceptedAnswers.includes(userVal.trim().toLowerCase());

                  return (
                    <div
                      key={q.qid}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: isChecked
                          ? isCorrect
                            ? '#ecfdf5'
                            : '#fef2f2'
                          : '#ffffff',
                        border: isChecked
                          ? isCorrect
                            ? '1px solid #a7f3d0'
                            : '1px solid #fca5a5'
                          : '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        <span
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {q.qNum}
                        </span>

                        <div style={{ flex: 1 }}>
                          {q.question && (
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                              {q.question}
                            </div>
                          )}

                          {/* Multiple Choice Options */}
                          {q.type === 'choice' && q.options?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {q.options.map((opt) => (
                                <label
                                  key={opt.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    background: userVal === opt.key ? '#e0f2fe' : '#f8fafc',
                                    border: userVal === opt.key ? '1px solid #38bdf8' : '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    fontSize: '0.86rem'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.qid}`}
                                    value={opt.key}
                                    checked={userVal === opt.key}
                                    onChange={() => handleAnswerChange(q.qid, opt.key)}
                                  />
                                  <span style={{ fontWeight: 700, color: '#0284c7' }}>({opt.key})</span>
                                  <span>{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            /* Text Fill-in-the-blank input */
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="text"
                                placeholder={`Nhập đáp án câu ${q.qNum}...`}
                                value={userVal}
                                onChange={(e) => handleAnswerChange(q.qid, e.target.value)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.88rem',
                                  width: '280px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          )}

                          {/* Show Solutions Details */}
                          {isChecked && (
                            <div style={{ marginTop: '10px', fontSize: '0.82rem', lineHeight: 1.5 }}>
                              <div style={{ color: isCorrect ? '#059669' : '#dc2626', fontWeight: 800 }}>
                                {isCorrect ? '✓ Chính xác!' : `✗ Sai! Đáp án chuẩn: ${q.correctAnswer}`}
                              </div>
                              {q.explanation && (
                                <div style={{ color: '#64748b', marginTop: '4px' }}>
                                  💡 <em>{q.explanation}</em>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3B. READING VIEW (SIDE-BY-SIDE PASSAGE & QUESTIONS) */}
      {/* ============================================================== */}
      {activeSkill === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Passage Switcher */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderRadius: '16px',
              background: '#ffffff'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              {activeCatalogTest.category === 'academic' ? 'Academic Reading' : 'General Training Reading'} (60 phút)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3].map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setReadingPassageNum(pNum)}
                  style={{
                    border: 'none',
                    background: readingPassageNum === pNum ? '#059669' : '#f1f5f9',
                    color: readingPassageNum === pNum ? '#ffffff' : '#334155',
                    padding: '7px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {activeCatalogTest.category === 'general' ? `Section ${pNum}` : `Passage ${pNum}`}
                </button>
              ))}
            </div>
          </div>

          {/* Two-column Reading Workspace */}
          {activeExamData.reading?.passages && (
            (() => {
              const currentPassage = activeExamData.reading.passages.find((p) => p.passageNum === readingPassageNum) || activeExamData.reading.passages[0];
              if (!currentPassage) return <div>Không tìm thấy bài đọc.</div>;

              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1fr',
                    gap: '20px',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Left Column: Reading Passage Text */}
                  <div
                    className="card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '28px',
                      border: '1px solid #e2e8f0',
                      maxHeight: '75vh',
                      overflowY: 'auto',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                      {currentPassage.title}
                    </h3>
                    <div
                      style={{
                        fontSize: '0.94rem',
                        lineHeight: 1.8,
                        color: '#334155'
                      }}
                      dangerouslySetInnerHTML={{ __html: currentPassage.passageHtml }}
                    />
                  </div>

                  {/* Right Column: Questions */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      maxHeight: '75vh',
                      overflowY: 'auto'
                    }}
                  >
                    {currentPassage.groups?.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="card"
                        style={{
                          background: '#ffffff',
                          borderRadius: '18px',
                          padding: '20px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div
                          style={{
                            background: '#f1f5f9',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '14px'
                          }}
                        >
                          📌 {group.directions ? group.directions.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
                        </div>

                        {group.contextHtml && (
                          <div
                            style={{
                              background: '#f8fafc',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              marginBottom: '14px',
                              fontSize: '0.88rem',
                              lineHeight: 1.6
                            }}
                            dangerouslySetInnerHTML={{ __html: group.contextHtml }}
                          />
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {group.questions?.map((q) => {
                            const userVal = userAnswers[q.qid] || '';
                            const isChecked = showSolutions;
                            const acceptedAnswers = (q.correctAnswer || '').split('/').map((s) => s.trim().toLowerCase());
                            const isCorrect = userVal && acceptedAnswers.includes(userVal.trim().toLowerCase());

                            return (
                              <div
                                key={q.qid}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  background: isChecked
                                    ? isCorrect
                                      ? '#ecfdf5'
                                      : '#fef2f2'
                                    : '#f8fafc',
                                  border: isChecked
                                    ? isCorrect
                                      ? '1px solid #a7f3d0'
                                      : '1px solid #fca5a5'
                                    : '1px solid #e2e8f0'
                                }}
                              >
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                  <span
                                    style={{
                                      background: '#059669',
                                      color: '#ffffff',
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '50%',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    {q.qNum}
                                  </span>

                                  <div style={{ flex: 1 }}>
                                    {q.question && (
                                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                        {q.question}
                                      </div>
                                    )}

                                    {/* Choice Options */}
                                    {q.type === 'choice' && q.options?.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        {q.options.map((opt) => (
                                          <label
                                            key={opt.key}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              padding: '6px 10px',
                                              borderRadius: '8px',
                                              background: userVal === opt.key ? '#dcfce7' : '#ffffff',
                                              border: userVal === opt.key ? '1px solid #86efac' : '1px solid #e2e8f0',
                                              cursor: 'pointer',
                                              fontSize: '0.84rem'
                                            }}
                                          >
                                            <input
                                              type="radio"
                                              name={`q_${q.qid}`}
                                              value={opt.key}
                                              checked={userVal === opt.key}
                                              onChange={() => handleAnswerChange(q.qid, opt.key)}
                                            />
                                            <span style={{ fontWeight: 700, color: '#059669' }}>({opt.key})</span>
                                            <span>{opt.text}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        placeholder={`Nhập đáp án câu ${q.qNum}...`}
                                        value={userVal}
                                        onChange={(e) => handleAnswerChange(q.qid, e.target.value)}
                                        style={{
                                          padding: '7px 12px',
                                          borderRadius: '8px',
                                          border: '1px solid #cbd5e1',
                                          fontSize: '0.85rem',
                                          width: '100%',
                                          outline: 'none'
                                        }}
                                      />
                                    )}

                                    {isChecked && (
                                      <div style={{ marginTop: '8px', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                        <div style={{ color: isCorrect ? '#059669' : '#dc2626', fontWeight: 800 }}>
                                          {isCorrect ? '✓ Đúng!' : `✗ Sai! Đáp án: ${q.correctAnswer}`}
                                        </div>
                                        {q.explanation && (
                                          <div style={{ color: '#64748b', marginTop: '3px' }}>
                                            <em>{q.explanation}</em>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3C. WRITING VIEW (TASK 1 & TASK 2) */}
      {/* ============================================================== */}
      {activeSkill === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Sub-Task Switcher */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderRadius: '16px',
              background: '#ffffff'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              IELTS Writing (60 phút • 2 Tasks)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setWritingTaskNum(1)}
                style={{
                  border: 'none',
                  background: writingTaskNum === 1 ? '#d97706' : '#f1f5f9',
                  color: writingTaskNum === 1 ? '#ffffff' : '#334155',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Task 1 (150 từ • 20 phút)
              </button>
              <button
                type="button"
                onClick={() => setWritingTaskNum(2)}
                style={{
                  border: 'none',
                  background: writingTaskNum === 2 ? '#d97706' : '#f1f5f9',
                  color: writingTaskNum === 2 ? '#ffffff' : '#334155',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Task 2 (250 từ • 40 phút)
              </button>
            </div>
          </div>

          {/* Active Task Workspace */}
          {(() => {
            const task = writingTaskNum === 1 ? activeExamData.writing?.task1 : activeExamData.writing?.task2;
            if (!task) return <div>Dữ liệu bài viết đang được nạp.</div>;

            const textKey = writingTaskNum === 1 ? 'task1' : 'task2';
            const currentText = writingAnswers[textKey] || '';
            const wordsCount = countWords(currentText);
            const isMinReached = wordsCount >= task.minWords;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Prompt Card */}
                <div
                  className="card"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '8px' }}>
                      {task.title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      Thời gian đề xuất: {task.timeMinutes} phút • Tối thiểu: {task.minWords} từ
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {task.prompt}
                  </h3>

                  {/* Key Vocab Hints */}
                  {task.keyVocab?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Từ vựng ăn điểm:</span>
                      {task.keyVocab.map((v, i) => (
                        <span key={i} style={{ fontSize: '0.74rem', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px' }}>
                          <strong>{v.word}</strong>: {v.meaningVi}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Writing Area */}
                <div
                  className="card"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      Bài viết của bạn:
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isMinReached ? '#059669' : '#d97706',
                        background: isMinReached ? '#ecfdf5' : '#fffbeb',
                        padding: '4px 12px',
                        borderRadius: '8px'
                      }}
                    >
                      {wordsCount} / {task.minWords} từ {isMinReached ? '✓ Đạt số từ quy định' : `(cần thêm ${task.minWords - wordsCount} từ)`}
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    placeholder="Bắt đầu viết bài luận hoặc báo cáo tại đây..."
                    value={currentText}
                    onChange={(e) => setWritingAnswers({ ...writingAnswers, [textKey]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />

                  {/* Model Answer Toggle */}
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowWritingModel(!showWritingModel)}
                      style={{
                        background: showWritingModel ? '#f1f5f9' : '#fef3c7',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={16} />
                      {showWritingModel ? 'Ẩn Bài Mẫu Band 8.5' : 'Xem Bài Mẫu Chuẩn Band 8.5 & Cấu Trúc'}
                    </button>
                  </div>

                  {showWritingModel && task.sampleBand8Answer && (
                    <div
                      style={{
                        marginTop: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '20px',
                        borderRadius: '16px'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        ⭐ Bài Mẫu Chuẩn IELTS Band 8.5 / 9.0:
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                        {task.sampleBand8Answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3D. SPEAKING VIEW (PART 1, 2, 3 WITH NATIVE TTS) */}
      {/* ============================================================== */}
      {activeSkill === 'speaking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Sub-Part Switcher */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderRadius: '16px',
              background: '#ffffff'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              IELTS Speaking (11 - 14 phút phỏng vấn trực tiếp)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { p: 1, label: 'Part 1: Giới thiệu' },
                { p: 2, label: 'Part 2: Cue Card' },
                { p: 3, label: 'Part 3: Thảo luận sâu' }
              ].map((item) => (
                <button
                  key={item.p}
                  type="button"
                  onClick={() => {
                    setSpeakingPartNum(item.p);
                    ttsService.stop();
                    setIsSpeakingPlaying(false);
                  }}
                  style={{
                    border: 'none',
                    background: speakingPartNum === item.p ? '#8b5cf6' : '#f1f5f9',
                    color: speakingPartNum === item.p ? '#ffffff' : '#334155',
                    padding: '7px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SPEAKING PART 1 */}
          {speakingPartNum === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '6px' }}>
                  {activeExamData.speaking?.part1?.title}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  Chủ đề phỏng vấn: {activeExamData.speaking?.part1?.topic}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeExamData.speaking?.part1?.questions?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '16px 20px',
                        borderRadius: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          Question {item.qNum}: {item.question}
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlaySpeakingModel(item.sampleBand8, idx)}
                          style={{
                            background: isSpeakingPlaying && speakingActiveQIdx === idx ? '#ef4444' : '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSpeakingPlaying && speakingActiveQIdx === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {isSpeakingPlaying && speakingActiveQIdx === idx ? 'Dừng đọc' : 'Nghe mẫu Band 8'}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#475569', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#8b5cf6' }}>Câu trả lời mẫu Band 8+:</strong> {item.sampleBand8}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SPEAKING PART 2 (CUE CARD) */}
          {speakingPartNum === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', background: '#f5f3ff', padding: '4px 12px', borderRadius: '8px' }}>
                    Part 2: Cue Card (Thuyết trình cá nhân 2 phút)
                  </span>

                  {/* Timer Controls */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpeakingPrepTime(60);
                        setIsSpeakingPrepRunning(true);
                        setIsSpeakingTalkRunning(false);
                      }}
                      style={{
                        background: isSpeakingPrepRunning ? '#f59e0b' : '#f1f5f9',
                        color: isSpeakingPrepRunning ? '#ffffff' : '#334155',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Clock size={14} />
                      Chuẩn bị: {speakingPrepTime}s
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSpeakingTalkTime(120);
                        setIsSpeakingTalkRunning(true);
                        setIsSpeakingPrepRunning(false);
                      }}
                      style={{
                        background: isSpeakingTalkRunning ? '#10b981' : '#f1f5f9',
                        color: isSpeakingTalkRunning ? '#ffffff' : '#334155',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Mic size={14} />
                      Nói: {speakingTalkTime}s
                    </button>
                  </div>
                </div>

                {/* Cue Card Prompt Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                    {activeExamData.speaking?.part2?.cueCard?.prompt}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                    You should say:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.8 }}>
                    {activeExamData.speaking?.part2?.cueCard?.bullets?.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Model Response with Speech */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    Bài nói mẫu chuẩn Band 8.5 (ETS & Cambridge):
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlaySpeakingModel(activeExamData.speaking?.part2?.sampleBand8Answer, 99)}
                    style={{
                      background: isSpeakingPlaying && speakingActiveQIdx === 99 ? '#ef4444' : '#8b5cf6',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSpeakingPlaying && speakingActiveQIdx === 99 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    {isSpeakingPlaying && speakingActiveQIdx === 99 ? 'Dừng đọc' : 'Nghe giọng bản xứ'}
                  </button>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '18px',
                    borderRadius: '14px',
                    fontSize: '0.92rem',
                    lineHeight: 1.8,
                    color: '#334155',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {activeExamData.speaking?.part2?.sampleBand8Answer}
                </div>
              </div>
            </div>
          )}

          {/* SPEAKING PART 3 */}
          {speakingPartNum === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '6px' }}>
                  {activeExamData.speaking?.part3?.title}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  Chủ đề mở rộng: {activeExamData.speaking?.part3?.topic}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeExamData.speaking?.part3?.questions?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '16px 20px',
                        borderRadius: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                          Question {item.qNum}: {item.question}
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlaySpeakingModel(item.sampleBand8, idx + 10)}
                          style={{
                            background: isSpeakingPlaying && speakingActiveQIdx === idx + 10 ? '#ef4444' : '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSpeakingPlaying && speakingActiveQIdx === idx + 10 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {isSpeakingPlaying && speakingActiveQIdx === idx + 10 ? 'Dừng đọc' : 'Nghe mẫu Band 8'}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#475569', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#8b5cf6' }}>Phản hồi chiều sâu:</strong> {item.sampleBand8}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. RESULT & SCORE MODAL */}
      {showResultModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Trophy size={32} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Kết Quả Bài Thi IELTS
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 24px 0' }}>
              {activeCatalogTest.title}
            </p>

            {/* Score Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}
            >
              <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>Listening</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>
                  Band {scoreResults.listeningBand.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {scoreResults.listeningCorrect} / 40 câu
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>Reading</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                  Band {scoreResults.readingBand.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {scoreResults.readingCorrect} / 40 câu
                </div>
              </div>

              <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700 }}>Overall LR</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#8b5cf6' }}>
                  Band {scoreResults.overallBand}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Quy đổi quốc tế
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                style={{
                  flex: '1',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Xem chi tiết câu đúng/sai
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  setViewMode('catalog');
                }}
                style={{
                  flex: '1',
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Về danh mục đề
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
