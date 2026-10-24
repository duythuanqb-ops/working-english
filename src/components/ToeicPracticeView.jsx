import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  Trophy,
  Clock,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  BookmarkPlus,
  BookmarkCheck,
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Play,
  Square,
  FileText,
  Mail,
  Layers,
  ListFilter,
  Check,
  Flame,
  Zap,
  HelpCircle
} from 'lucide-react';
import {
  TOEIC_PART1_PHOTOS,
  TOEIC_PART2_LISTENING,
  TOEIC_PART3_CONVERSATIONS,
  TOEIC_PART4_TALKS,
  TOEIC_PART5_QUESTIONS,
  TOEIC_PART6_PASSAGES,
  TOEIC_PART7_PASSAGES,
  TOEIC_SPEAKING_TASKS,
  TOEIC_WRITING_TASKS,
  TOEIC_600_WORDS,
  TOEIC_BANDS
} from '../data/toeicData';
import { ttsService } from '../services/ttsService';

export default function ToeicPracticeView({ words = [], onSaveWord, speechVoice = 'US' }) {
  // Main Skill Navigation: 'listening' | 'reading' | 'speaking' | 'writing' | 'mock' | 'vocab600'
  const [activeSkill, setActiveSkill] = useState('listening');
  const [targetBand, setTargetBand] = useState('650 - 800');
  const [globalSearch, setGlobalSearch] = useState('');

  // Sub-tab States
  const [listeningPart, setListeningPart] = useState('part1'); // 'part1' | 'part2' | 'part3' | 'part4'
  const [readingPart, setReadingPart] = useState('part5'); // 'part5' | 'part6' | 'part7'
  const [speakingTaskId, setSpeakingTaskId] = useState('spk-1');
  const [writingTaskId, setWritingTaskId] = useState('wrt-1');

  // Interactive Exercise States
  // Part 1 Photos
  const [p1Index, setP1Index] = useState(0);
  const [p1Answers, setP1Answers] = useState({});

  // Part 2 Listening
  const [p2Index, setP2Index] = useState(0);
  const [p2Answers, setP2Answers] = useState({});

  // Part 3 Conversations
  const [p3Index, setP3Index] = useState(0);
  const [p3Answers, setP3Answers] = useState({}); // { [questionIdx]: selectedOptionIdx }

  // Part 4 Talks
  const [p4Index, setP4Index] = useState(0);
  const [p4Answers, setP4Answers] = useState({});

  // Part 5 Questions
  const [p5Index, setP5Index] = useState(0);
  const [p5Answers, setP5Answers] = useState({});
  const [selectedP5Category, setSelectedP5Category] = useState('all');

  // Part 6 Passages
  const [p6Index, setP6Index] = useState(0);
  const [p6Answers, setP6Answers] = useState({}); // { [blankIndex]: selectedIdx }

  // Part 7 Passages
  const [p7Index, setP7Index] = useState(0);
  const [p7Answers, setP7Answers] = useState({});

  // Speaking Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [showSpeakingModel, setShowSpeakingModel] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // Writing Editor State
  const [userWritingDrafts, setUserWritingDrafts] = useState({});
  const [writingTimeLeft, setWritingTimeLeft] = useState(1800); // 30 mins
  const [isWritingTimerRunning, setIsWritingTimerRunning] = useState(false);
  const [showWritingModel, setShowWritingModel] = useState(false);

  // 600 Words State
  const [selectedWordTopic, setSelectedWordTopic] = useState('all');
  const [savedVocabIds, setSavedVocabIds] = useState(new Set());

  // Mini Mock Test State
  const [mockActive, setMockActive] = useState(false);
  const [mockFinished, setMockFinished] = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimeLeft, setMockTimeLeft] = useState(600); // 10 mins
  const [mockIndex, setMockIndex] = useState(0);

  // Load saved vocabulary words state
  useEffect(() => {
    if (words && Array.isArray(words)) {
      const savedSet = new Set(words.map((w) => w.word.toLowerCase()));
      setSavedVocabIds(savedSet);
    }
  }, [words]);

  // Handle Voice Recording cleanup
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Handle Mock Test Timer
  useEffect(() => {
    let timer = null;
    if (mockActive && !mockFinished && mockTimeLeft > 0) {
      timer = setInterval(() => {
        setMockTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setMockFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mockActive, mockFinished, mockTimeLeft]);

  // Handle Writing Timer
  useEffect(() => {
    let timer = null;
    if (isWritingTimerRunning && writingTimeLeft > 0) {
      timer = setInterval(() => {
        setWritingTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWritingTimerRunning, writingTimeLeft]);

  // Save word helper
  const handleSaveToNotebook = (wordItem) => {
    if (!onSaveWord) return;
    const wordKey = wordItem.word.toLowerCase();
    onSaveWord({
      word: wordItem.word,
      ipa: wordItem.ipa || '',
      meaningVi: wordItem.meaningVi,
      partOfSpeech: wordItem.pos || wordItem.partOfSpeech || 'noun',
      collocations: wordItem.collocation ? [wordItem.collocation] : [],
      examples: wordItem.exampleEn
        ? [{ en: wordItem.exampleEn, vi: wordItem.exampleVi || '' }]
        : []
    });
    setSavedVocabIds((prev) => new Set([...prev, wordKey]));
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      alert('Không thể kết nối Micro. Hãy kiểm tra và cấp quyền micro cho ứng dụng để luyện nói.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Formatter for MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Mock Test
  const startMockTest = () => {
    const shuffled = [...TOEIC_PART5_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setMockQuestions(shuffled);
    setMockAnswers({});
    setMockTimeLeft(600);
    setMockFinished(false);
    setMockActive(true);
    setMockIndex(0);
  };

  // Score Calculation for Mock Test
  const mockScore = useMemo(() => {
    if (!mockFinished || mockQuestions.length === 0) return { correct: 0, total: 0, score: 0 };
    let correct = 0;
    mockQuestions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correctIndex) correct++;
    });
    // Scaled estimate to 990
    const scaledScore = Math.min(990, Math.round(350 + (correct / mockQuestions.length) * 550));
    return { correct, total: mockQuestions.length, score: scaledScore };
  }, [mockFinished, mockQuestions, mockAnswers]);

  // Filter 600 words
  const filteredWords = useMemo(() => {
    return TOEIC_600_WORDS.filter((item) => {
      const matchTopic = selectedWordTopic === 'all' || item.topic === selectedWordTopic;
      const matchSearch =
        !globalSearch ||
        item.word.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.meaningVi.toLowerCase().includes(globalSearch.toLowerCase());
      return matchTopic && matchSearch;
    });
  }, [selectedWordTopic, globalSearch]);

  // Current active Speaking task
  const currentSpeakingTask = useMemo(() => {
    return TOEIC_SPEAKING_TASKS.find((t) => t.id === speakingTaskId) || TOEIC_SPEAKING_TASKS[0];
  }, [speakingTaskId]);

  // Current active Writing task
  const currentWritingTask = useMemo(() => {
    return TOEIC_WRITING_TASKS.find((t) => t.id === writingTaskId) || TOEIC_WRITING_TASKS[0];
  }, [writingTaskId]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. HERO HEADER */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)',
          borderRadius: '24px',
          padding: '28px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(49, 46, 129, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>
              <GraduationCap size={16} style={{ color: '#a5b4fc' }} />
              CHƯƠNG TRÌNH TOEIC 4 KỸ NĂNG QUỐC TẾ • 100% FORMAT ETS
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Luyện Thi TOEIC Toàn Diện: Nghe • Nói • Đọc • Viết
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#c7d2fe', maxWidth: '640px', lineHeight: 1.5 }}>
              Làm chủ cả 4 kỹ năng công sở: Phản xạ âm chuẩn, bẫy đề thi Part 1-7, tự tin thuyết trình Speaking (Q1-11) và soạn thảo văn bản kinh doanh Writing (Q1-8).
            </p>
          </div>

          {/* Target Band Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a5b4fc', fontWeight: 800 }}>
              Mục tiêu điểm số:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['500 - 650', '650 - 800', '800 - 990'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setTargetBand(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: targetBand === b ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: targetBand === b ? '#ffffff' : 'transparent',
                    color: targetBand === b ? '#312e81' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ marginTop: '20px', position: 'relative', maxWidth: '680px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Tìm nhanh đề thi, chủ đề, dạng bài (vd: email, part 5, when, bị động, opinion essay)..."
            style={{
              width: '100%',
              padding: '12px 18px 12px 46px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 500,
              outline: 'none',
              backdropFilter: 'blur(8px)'
            }}
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#c7d2fe', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. PRIMARY SKILL NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '18px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'listening', label: '🎧 Nghe (Listening)', desc: 'Part 1 • 2 • 3 • 4' },
          { id: 'reading', label: '📖 Đọc (Reading)', desc: 'Part 5 • 6 • 7' },
          { id: 'speaking', label: '🗣️ Nói (Speaking)', desc: 'Q1 – Q11 Phản xạ' },
          { id: 'writing', label: '✍️ Viết (Writing)', desc: 'Q1 – Q8 Thư & Luận' },
          { id: 'mock', label: '🏆 Thi Thử 4 Kỹ Năng', desc: 'Mini Mock Test' },
          { id: 'vocab600', label: '📚 600 Từ Vựng Cốt Lõi', desc: '10 Chủ đề công sở' }
        ].map((tab) => {
          const isActive = activeSkill === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSkill(tab.id)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>{tab.label}</span>
              <span style={{ fontSize: '0.74rem', opacity: isActive ? 0.9 : 0.6, fontWeight: 500 }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CONTENT AREA PER SKILL */}

      {/* ========================================================================= */}
      {/* SKILL 1: LISTENING COMPREHENSION */}
      {/* ========================================================================= */}
      {activeSkill === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Listening Parts */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            {[
              { id: 'part1', label: 'Part 1: Mô Tả Tranh (Photos)' },
              { id: 'part2', label: 'Part 2: Hỏi - Đáp (Question - Response)' },
              { id: 'part3', label: 'Part 3: Đoạn Hội Thoại (Conversations)' },
              { id: 'part4', label: 'Part 4: Bài Nói Ngắn (Short Talks)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setListeningPart(p.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: listeningPart === p.id ? '#eef2ff' : 'transparent',
                  color: listeningPart === p.id ? '#4f46e5' : 'var(--text-secondary)'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* PART 1: PHOTOGRAPHS */}
          {listeningPart === 'part1' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const photo = TOEIC_PART1_PHOTOS[p1Index] || TOEIC_PART1_PHOTOS[0];
                const selected = p1Answers[photo.id];
                const isAnswered = selected !== undefined;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', background: '#eef2ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Tranh {p1Index + 1} / {TOEIC_PART1_PHOTOS.length}: {photo.sceneType}
                      </span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(photo.audioPrompt, speechVoice)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Volume2 size={16} /> Nghe Hướng Dẫn
                      </button>
                    </div>

                    {/* Image Simulator Box */}
                    <div
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '2px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        📸 Bối cảnh hình ảnh mô phỏng trong đề thi:
                      </div>
                      <div style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                        "{photo.imageContext}"
                      </div>
                    </div>

                    {/* 4 Statements A, B, C, D */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Chọn phương án miêu tả chính xác nhất bức tranh:
                      </div>
                      {photo.statements.map((stmt) => {
                        const isCorrect = stmt.key === photo.correctKey;
                        const isChosen = selected === stmt.key;
                        let bg = '#ffffff';
                        let border = '1px solid var(--border-medium)';
                        let textColor = 'var(--text-main)';

                        if (isAnswered) {
                          if (isCorrect) {
                            bg = '#f0fdf4';
                            border = '2px solid #22c55e';
                            textColor = '#15803d';
                          } else if (isChosen) {
                            bg = '#fef2f2';
                            border = '2px solid #ef4444';
                            textColor = '#b91c1c';
                          }
                        }

                        return (
                          <div
                            key={stmt.key}
                            style={{
                              padding: '14px 18px',
                              borderRadius: '12px',
                              background: bg,
                              border,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              cursor: isAnswered ? 'default' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={() => {
                              if (!isAnswered) {
                                setP1Answers((prev) => ({ ...prev, [photo.id]: stmt.key }));
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                              <span
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: isChosen ? '#4f46e5' : '#f1f5f9',
                                  color: isChosen ? '#ffffff' : 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.88rem',
                                  flexShrink: 0
                                }}
                              >
                                {stmt.key}
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: textColor }}>
                                  ({stmt.key}) {stmt.text}
                                </span>
                                {isAnswered && (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                    → {stmt.textVi}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                ttsService.speak(stmt.text, speechVoice);
                              }}
                              className="icon-ghost"
                              title="Nghe câu này"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation & Trap Alert */}
                    {isAnswered && (
                      <div style={{ padding: '18px 22px', borderRadius: '14px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 800, fontSize: '0.92rem' }}>
                          <Lightbulb size={18} /> Phân Tích & Mẹo Giải Part 1
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {photo.explanation}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> {photo.trapAlert}
                        </div>

                        {/* Vocabulary Save */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Từ vựng trọng tâm:</span>
                          {photo.keyVocab.map((kv, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSaveToNotebook(kv)}
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
                            >
                              + Lưu "{kv.word}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button
                        type="button"
                        disabled={p1Index === 0}
                        onClick={() => setP1Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p1Index === 0 ? 0.5 : 1 }}
                      >
                        ← Câu Trước
                      </button>
                      <button
                        type="button"
                        disabled={p1Index === TOEIC_PART1_PHOTOS.length - 1}
                        onClick={() => setP1Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p1Index === TOEIC_PART1_PHOTOS.length - 1 ? 0.5 : 1 }}
                      >
                        Câu Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 2: QUESTION - RESPONSE */}
          {listeningPart === 'part2' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const item = TOEIC_PART2_LISTENING[p2Index] || TOEIC_PART2_LISTENING[0];
                const selected = p2Answers[item.id];
                const isAnswered = selected !== undefined;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0ea5e9', background: '#f0f9ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 2: Câu {p2Index + 1} / {TOEIC_PART2_LISTENING.length} • {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(item.questionText, speechVoice)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Volume2 size={18} /> Bấm Nghe Câu Hỏi ({speechVoice})
                      </button>
                    </div>

                    <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', borderLeft: '4px solid #0ea5e9' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '6px' }}>
                        🎧 Transcript Câu Hỏi:
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                        "{item.questionText}"
                      </div>
                      {isAnswered && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          → Dịch nghĩa: {item.questionVi}
                        </div>
                      )}
                    </div>

                    {/* Choices A, B, C */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === item.correctIndex;
                        const isChosen = selected === oIdx;
                        let bg = '#ffffff';
                        let border = '1px solid var(--border-medium)';
                        let textColor = 'var(--text-main)';

                        if (isAnswered) {
                          if (isCorrect) {
                            bg = '#f0fdf4';
                            border = '2px solid #22c55e';
                            textColor = '#15803d';
                          } else if (isChosen) {
                            bg = '#fef2f2';
                            border = '2px solid #ef4444';
                            textColor = '#b91c1c';
                          }
                        }

                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '14px 18px',
                              borderRadius: '12px',
                              background: bg,
                              border,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: isAnswered ? 'default' : 'pointer'
                            }}
                            onClick={() => {
                              if (!isAnswered) {
                                setP2Answers((prev) => ({ ...prev, [item.id]: oIdx }));
                              }
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: textColor }}>
                                {opt}
                              </span>
                              {isAnswered && (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                  → {item.optionsVi[oIdx]}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                ttsService.speak(opt, speechVoice);
                              }}
                              className="icon-ghost"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Trap Alert */}
                    {isAnswered && (
                      <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span><strong>Mẹo bẫy ETS:</strong> {item.trapAlert}</span>
                      </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button
                        type="button"
                        disabled={p2Index === 0}
                        onClick={() => setP2Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p2Index === 0 ? 0.5 : 1 }}
                      >
                        ← Câu Trước
                      </button>
                      <button
                        type="button"
                        disabled={p2Index === TOEIC_PART2_LISTENING.length - 1}
                        onClick={() => setP2Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p2Index === TOEIC_PART2_LISTENING.length - 1 ? 0.5 : 1 }}
                      >
                        Câu Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 3: CONVERSATIONS */}
          {listeningPart === 'part3' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const convo = TOEIC_PART3_CONVERSATIONS[p3Index] || TOEIC_PART3_CONVERSATIONS[0];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#8b5cf6', background: '#f5f3ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 3: Hội Thoại • {convo.scenario}
                      </span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(convo.audioScript, speechVoice)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Volume2 size={18} /> Bấm Nghe Toàn Bộ Hội Thoại
                      </button>
                    </div>

                    {/* Audio Script with Bilingual View */}
                    <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        📜 Audio Script Hội Thoại:
                      </div>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                        {convo.audioScript}
                      </pre>
                    </div>

                    {/* 3 Comprehension Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        3 Câu Hỏi Đọc Hiểu Theo Đoạn:
                      </div>
                      {convo.questions.map((q, qIdx) => {
                        const selectedAns = p3Answers[qIdx];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = oIdx === q.correctIndex;
                                const isChosen = selectedAns === oIdx;
                                let border = '1px solid var(--border-subtle)';
                                let bg = '#fafafa';
                                if (isDone) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                  }
                                }
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => setP3Answers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isDone ? 'default' : 'pointer'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isDone && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 4: TALKS */}
          {listeningPart === 'part4' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const talk = TOEIC_PART4_TALKS[p4Index] || TOEIC_PART4_TALKS[0];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 4: Bài Nói Độc Thoại • {talk.scenario}
                      </span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(talk.audioScript, speechVoice)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Volume2 size={18} /> Bấm Nghe Bài Phát Thanh
                      </button>
                    </div>

                    <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        📢 Broadcast Script:
                      </div>
                      <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                        "{talk.audioScript}"
                      </div>
                    </div>

                    {/* Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {talk.questions.map((q, qIdx) => {
                        const selectedAns = p4Answers[qIdx];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = oIdx === q.correctIndex;
                                const isChosen = selectedAns === oIdx;
                                let border = '1px solid var(--border-subtle)';
                                let bg = '#fafafa';
                                if (isDone) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                  }
                                }
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => setP4Answers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isDone ? 'default' : 'pointer'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isDone && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 2: READING COMPREHENSION */}
      {/* ========================================================================= */}
      {activeSkill === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Reading Parts */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            {[
              { id: 'part5', label: 'Part 5: Điền Câu & Ngữ Pháp (Incomplete Sentences)' },
              { id: 'part6', label: 'Part 6: Điền Đoạn Văn (Text Completion)' },
              { id: 'part7', label: 'Part 7: Đọc Hiểu Văn Bản (Reading Passages)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setReadingPart(p.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: readingPart === p.id ? '#eef2ff' : 'transparent',
                  color: readingPart === p.id ? '#4f46e5' : 'var(--text-secondary)'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* PART 5: INCOMPLETE SENTENCES */}
          {readingPart === 'part5' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const q = TOEIC_PART5_QUESTIONS[p5Index] || TOEIC_PART5_QUESTIONS[0];
                const selected = p5Answers[q.id];
                const isAnswered = selected !== undefined;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', background: '#eef2ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Câu {p5Index + 1} / {TOEIC_PART5_QUESTIONS.length} • {q.category} • Mục tiêu {q.difficulty}
                      </span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(q.question.replace('_______', q.options[q.correctIndex]), speechVoice)}
                        className="icon-ghost"
                        title="Nghe câu hoàn chỉnh"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', borderLeft: '4px solid #6366f1' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {isAnswered ? (
                          <>
                            {q.question.split('_______')[0]}
                            <span style={{ color: selected === q.correctIndex ? '#16a34a' : '#dc2626', textDecoration: 'underline', fontWeight: 800, margin: '0 4px' }}>
                              {q.options[selected]}
                            </span>
                            {q.question.split('_______')[1]}
                          </>
                        ) : (
                          q.question
                        )}
                      </div>
                    </div>

                    {/* Options A, B, C, D */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex;
                        const isChosen = selected === idx;
                        let bg = '#ffffff';
                        let border = '1px solid var(--border-medium)';
                        let textColor = 'var(--text-main)';

                        if (isAnswered) {
                          if (isCorrect) {
                            bg = '#f0fdf4';
                            border = '2px solid #22c55e';
                            textColor = '#15803d';
                          } else if (isChosen) {
                            bg = '#fef2f2';
                            border = '2px solid #ef4444';
                            textColor = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => setP5Answers((prev) => ({ ...prev, [q.id]: idx }))}
                            style={{
                              padding: '16px 20px',
                              borderRadius: '12px',
                              background: bg,
                              border,
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: textColor,
                              cursor: isAnswered ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              textAlign: 'left'
                            }}
                          >
                            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.84rem' }}>
                              {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations */}
                    {isAnswered && (
                      <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 800, fontSize: '0.94rem' }}>
                          <Lightbulb size={18} /> Giải Thích Ngữ Pháp & Mẹo Thi ETS
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          <strong>Dịch nghĩa:</strong> {q.translation}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          <strong>Phân tích:</strong> {q.explanation}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> <strong>Cảnh báo bẫy:</strong> {q.trapAlert}
                        </div>

                        {/* Vocabulary Save */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Từ vựng câu này:</span>
                          {q.keyVocabulary.map((kv, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSaveToNotebook(kv)}
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
                            >
                              + Lưu "{kv.word}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Question Palette & Nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                      <button
                        type="button"
                        disabled={p5Index === 0}
                        onClick={() => setP5Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p5Index === 0 ? 0.5 : 1 }}
                      >
                        ← Câu Trước
                      </button>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {TOEIC_PART5_QUESTIONS.map((item, idx) => {
                          const ans = p5Answers[item.id];
                          const isDone = ans !== undefined;
                          const isRight = ans === item.correctIndex;
                          let bg = '#f1f5f9';
                          let color = 'var(--text-secondary)';
                          if (isDone) {
                            bg = isRight ? '#22c55e' : '#ef4444';
                            color = '#ffffff';
                          } else if (idx === p5Index) {
                            bg = '#4f46e5';
                            color = '#ffffff';
                          }
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setP5Index(idx)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: bg,
                                color,
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                              }}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={p5Index === TOEIC_PART5_QUESTIONS.length - 1}
                        onClick={() => setP5Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p5Index === TOEIC_PART5_QUESTIONS.length - 1 ? 0.5 : 1 }}
                      >
                        Câu Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 6: TEXT COMPLETION */}
          {readingPart === 'part6' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const passage = TOEIC_PART6_PASSAGES[p6Index] || TOEIC_PART6_PASSAGES[0];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 6: {passage.title}
                      </span>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', lineHeight: 1.8, fontSize: '0.98rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                      {passage.passageText}
                    </div>

                    {/* 4 Blanks Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Điền từ hoặc câu thích hợp vào 4 vị trí trống:
                      </div>
                      {passage.blanks.map((b) => {
                        const selectedAns = p6Answers[b.blankIndex];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={b.blankIndex} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                              Vị trí số ({b.blankIndex}):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {b.options.map((opt, oIdx) => {
                                const isCorrect = oIdx === b.correctIndex;
                                const isChosen = selectedAns === oIdx;
                                let border = '1px solid var(--border-subtle)';
                                let bg = '#fafafa';
                                if (isDone) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                  }
                                }
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => setP6Answers((prev) => ({ ...prev, [b.blankIndex]: oIdx }))}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isDone ? 'default' : 'pointer'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isDone && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                                ✓ Giải thích: {b.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 7: READING COMPREHENSION PASSAGES */}
          {readingPart === 'part7' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const passage = TOEIC_PART7_PASSAGES[p7Index] || TOEIC_PART7_PASSAGES[0];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 7: {passage.passageType}
                      </span>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', lineHeight: 1.7, fontSize: '0.96rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {passage.documentContent}
                    </div>

                    {/* Comprehension Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Các Câu Hỏi Đọc Hiểu:
                      </div>
                      {passage.questions.map((q, qIdx) => {
                        const selectedAns = p7Answers[qIdx];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = oIdx === q.correctIndex;
                                const isChosen = selectedAns === oIdx;
                                let border = '1px solid var(--border-subtle)';
                                let bg = '#fafafa';
                                if (isDone) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                  }
                                }
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => setP7Answers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isDone ? 'default' : 'pointer'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isDone && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 3: SPEAKING (TOEIC SW) */}
      {/* ========================================================================= */}
      {activeSkill === 'speaking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Speaking Tasks Q1 to Q11 */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
            {TOEIC_SPEAKING_TASKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSpeakingTaskId(t.id);
                  setRecordedAudioUrl(null);
                  setShowSpeakingModel(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: speakingTaskId === t.id ? '#faf5ff' : 'transparent',
                  color: speakingTaskId === t.id ? '#9333ea' : 'var(--text-secondary)'
                }}
              >
                {t.part}: {t.partName}
              </button>
            ))}
          </div>

          {/* Speaking Interactive Stage */}
          <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9333ea', background: '#faf5ff', padding: '4px 10px', borderRadius: '8px' }}>
                  {currentSpeakingTask.part} • {currentSpeakingTask.partName}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                  {currentSpeakingTask.prompt}
                </h3>
              </div>

              {/* Time Badges */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ⏱️ Chuẩn bị: {currentSpeakingTask.prepTimeSec}s
                </span>
                {currentSpeakingTask.speakTimeSec && (
                  <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#fdf2f8', color: '#db2777', fontWeight: 700 }}>
                    🎙️ Trả lời: {currentSpeakingTask.speakTimeSec}s
                  </span>
                )}
              </div>
            </div>

            {/* Task Content Details */}
            {currentSpeakingTask.textToRead && (
              <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#fcfaff', border: '1px solid #f3e8ff' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', marginBottom: '8px' }}>
                  📄 Đoạn văn cần đọc to:
                </div>
                <div style={{ fontSize: '1.18rem', fontWeight: 600, color: '#1e1b4b', lineHeight: 1.8, fontStyle: 'italic' }}>
                  "{currentSpeakingTask.textToRead}"
                </div>
                {currentSpeakingTask.phoneticGuide && (
                  <div style={{ fontSize: '0.84rem', color: '#7e22ce', marginTop: '12px', fontWeight: 600, background: '#faf5ff', padding: '6px 12px', borderRadius: '8px' }}>
                    💡 Phiên âm trọng tâm: {currentSpeakingTask.phoneticGuide}
                  </div>
                )}
              </div>
            )}

            {currentSpeakingTask.imageDescription && (
              <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  🖼️ Bối cảnh bức tranh cần miêu tả:
                </div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {currentSpeakingTask.imageDescription}
                </div>
              </div>
            )}

            {currentSpeakingTask.scheduleData && (
              <div style={{ padding: '22px 26px', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--primary)' }}>
                  📅 {currentSpeakingTask.scheduleData.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Thời gian: {currentSpeakingTask.scheduleData.date} | Địa điểm: {currentSpeakingTask.scheduleData.location}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentSpeakingTask.scheduleData.sessions.map((s, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                      <span style={{ fontWeight: 700, color: '#4338ca' }}>{s.time}</span>
                      <span style={{ fontWeight: 600, flex: 1, margin: '0 12px' }}>{s.topic}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.speaker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions for Part 3 / Part 4 */}
            {currentSpeakingTask.questions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentSpeakingTask.questions.map((q, idx) => (
                  <div key={idx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#fdfaff', border: '1px solid #f3e8ff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#9333ea' }}>{q.qNum}</span>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(q.question, speechVoice)}
                        className="icon-ghost"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      "{q.question}"
                    </div>
                    {showSpeakingModel && (
                      <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#faf5ff', fontSize: '0.88rem', color: '#6b21a8', lineHeight: 1.5, borderLeft: '3px solid #9333ea' }}>
                        <strong>Bài mẫu Band 8+:</strong> {q.modelAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Speaking Voice Recorder & Player */}
            <div style={{ padding: '24px', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-primary"
                    style={{ background: '#9333ea', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    <Mic size={18} /> Bắt Đầu Ghi Âm Luyện Nói
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Square size={18} /> Dừng Ghi Âm ({recordingSeconds}s)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const text = currentSpeakingTask.modelAudioText || currentSpeakingTask.sampleBand8Answer || (currentSpeakingTask.questions ? currentSpeakingTask.questions[0].modelAnswer : '');
                    if (text) ttsService.speak(text, speechVoice);
                  }}
                  className="btn-outline"
                  style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}
                >
                  <Volume2 size={18} /> Nghe Bài Mẫu Giọng Bản Xứ
                </button>
              </div>

              {recordedAudioUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#16a34a' }}>✓ Đã thu âm xong:</span>
                  <audio controls src={recordedAudioUrl} style={{ height: '36px' }} />
                </div>
              )}
            </div>

            {/* Model Answer & Strategy Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowSpeakingModel((prev) => !prev)}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800 }}
              >
                {showSpeakingModel ? 'Ẩn Bài Mẫu & Chiến Thuật' : '💡 Xem Bài Mẫu Band 8+ & Tiêu Chí Chấm Điểm'}
              </button>
            </div>

            {/* Full Model Breakdown */}
            {showSpeakingModel && (
              <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6b21a8' }}>
                  🏆 Bài Nói Mẫu Đạt Điểm Tuyệt Đối (ETS 200/200):
                </div>
                {currentSpeakingTask.sampleBand8Answer && (
                  <div style={{ fontSize: '0.96rem', color: '#4c1d95', lineHeight: 1.7, fontStyle: 'italic', background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                    "{currentSpeakingTask.sampleBand8Answer}"
                  </div>
                )}
                {currentSpeakingTask.strategyTemplate && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#7e22ce' }}>Dàn ý chiến thuật 4 bước:</span>
                    {currentSpeakingTask.strategyTemplate.map((st, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '0.84rem', color: '#581c87' }}>
                        • {st}
                      </div>
                    ))}
                  </div>
                )}
                {currentSpeakingTask.peelOutline && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#7e22ce' }}>Khung trả lời PEEL (Point, Explain, Example, Link):</span>
                    {currentSpeakingTask.peelOutline.map((p, pIdx) => (
                      <div key={pIdx} style={{ fontSize: '0.84rem', color: '#581c87' }}>
                        • {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 4: WRITING (TOEIC SW) */}
      {/* ========================================================================= */}
      {activeSkill === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Writing Tasks Q1 to Q8 */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            {TOEIC_WRITING_TASKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setWritingTaskId(t.id);
                  setShowWritingModel(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: writingTaskId === t.id ? '#ecfdf5' : 'transparent',
                  color: writingTaskId === t.id ? '#059669' : 'var(--text-secondary)'
                }}
              >
                {t.part}: {t.partName}
              </button>
            ))}
          </div>

          {/* Interactive Writing Stage */}
          <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px' }}>
                  {currentWritingTask.part} • {currentWritingTask.partName}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                  {currentWritingTask.prompt}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ⏱️ Thời gian: {currentWritingTask.timeMinutes} phút
                </span>
                <button
                  type="button"
                  onClick={() => setIsWritingTimerRunning((p) => !p)}
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  {isWritingTimerRunning ? `Đang đếm (${formatTime(writingTimeLeft)})` : 'Bấm Giờ Viết'}
                </button>
              </div>
            </div>

            {/* Q1-5 Sentences based on picture */}
            {currentWritingTask.tasks && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {currentWritingTask.tasks.map((task, tIdx) => {
                  const draftKey = `${currentWritingTask.id}-${tIdx}`;
                  const currentDraft = userWritingDrafts[draftKey] || '';
                  return (
                    <div key={tIdx} style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary)' }}>{task.qNum}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {task.keywords.map((kw, kIdx) => (
                            <span key={kIdx} style={{ fontSize: '0.78rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              🔑 {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        🖼️ Bối cảnh ảnh: {task.sceneDescription}
                      </div>

                      <input
                        type="text"
                        value={currentDraft}
                        onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                        placeholder="Nhập 1 câu hoàn chỉnh có chứa 2 từ khóa phía trên..."
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      />

                      {showWritingModel && (
                        <div style={{ fontSize: '0.86rem', color: '#059669', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px' }}>
                          <strong>Câu mẫu đạt 3/3 điểm ETS:</strong>
                          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {task.modelAnswers.map((ma, mIdx) => (
                              <li key={mIdx}>"{ma}"</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Q6-7 Email Request */}
            {currentWritingTask.emailReceived && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-medium)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    📩 Email cần phản hồi:
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <strong>Từ:</strong> {currentWritingTask.emailReceived.from} | <strong>Chủ đề:</strong> {currentWritingTask.emailReceived.subject}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '8px' }}>
                    {currentWritingTask.emailReceived.body}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    Soạn thảo email phản hồi của bạn:
                  </div>
                  <textarea
                    rows={8}
                    value={userWritingDrafts['email-draft'] || ''}
                    onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, 'email-draft': e.target.value }))}
                    placeholder="Dear Mr. Taylor,&#10;&#10;Thank you for contacting our customer support..."
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Số từ: {(userWritingDrafts['email-draft'] || '').trim().split(/\s+/).filter(Boolean).length} từ</span>
                    <span>Yêu cầu: Giải quyết đủ 3 nội dung trong đề bài</span>
                  </div>
                </div>

                {showWritingModel && (
                  <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#065f46' }}>
                      🏆 Email Mẫu Đạt Điểm Tuyệt Đối (ETS 4/4):
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#047857', lineHeight: 1.6, margin: 0 }}>
                      {currentWritingTask.sampleBand8Email}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Q8 Opinion Essay */}
            {currentWritingTask.targetWords && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      Trình soạn thảo bài luận (Target: ≥300 từ):
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: (userWritingDrafts['essay-draft'] || '').trim().split(/\s+/).filter(Boolean).length >= 300 ? '#16a34a' : '#d97706' }}>
                      Đã viết: {(userWritingDrafts['essay-draft'] || '').trim().split(/\s+/).filter(Boolean).length} / 300 từ
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={userWritingDrafts['essay-draft'] || ''}
                    onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, 'essay-draft': e.target.value }))}
                    placeholder="In recent decades, corporate workplace culture has evolved substantially... Write your 4-paragraph opinion essay here."
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.98rem',
                      lineHeight: 1.7,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                {showWritingModel && (
                  <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
                      🏆 Bài Luận Mẫu Band 8+ (ETS 5/5 Điểm):
                    </div>
                    <div style={{ fontSize: '0.94rem', color: '#047857', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {currentWritingTask.sampleBand8Essay}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Model Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowWritingModel((p) => !p)}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800 }}
              >
                {showWritingModel ? 'Ẩn Bài Viết Mẫu' : '💡 Xem Bài Mẫu Đạt Điểm Tuyệt Đối & Cấu Trúc Đoạn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 5: THI THỬ 4 KỸ NĂNG (MINI MOCK TEST) */}
      {/* ========================================================================= */}
      {activeSkill === 'mock' && (
        <div className="card" style={{ padding: '36px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)' }}>
          {!mockActive && !mockFinished ? (
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Thi Thử Rút Gọn TOEIC Chuẩn Quốc Tế (10 Câu)
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Đề thi mô phỏng áp lực phòng thi thật với đồng hồ đếm ngược 10 phút. Hệ thống sẽ quy đổi điểm số chính xác theo thang điểm chuẩn TOEIC ETS.
              </p>
              <button
                type="button"
                onClick={startMockTest}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 800, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Zap size={18} /> Bắt Đầu Làm Bài Ngay
              </button>
            </div>
          ) : mockActive && !mockFinished ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Câu {mockIndex + 1} / {mockQuestions.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: mockTimeLeft < 60 ? '#dc2626' : '#4f46e5', background: '#f8fafc', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <Clock size={16} /> {formatTime(mockTimeLeft)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMockFinished(true)}
                    className="btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.86rem' }}
                  >
                    Nộp Bài Thi
                  </button>
                </div>
              </div>

              {/* Mock Question Item */}
              {(() => {
                const q = mockQuestions[mockIndex];
                if (!q) return null;
                const chosen = mockAnswers[mockIndex];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', borderLeft: '4px solid #4f46e5', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6 }}>
                      {q.question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setMockAnswers((prev) => ({ ...prev, [mockIndex]: oIdx }))}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            background: chosen === oIdx ? '#eef2ff' : '#ffffff',
                            border: chosen === oIdx ? '2px solid #4f46e5' : '1px solid var(--border-medium)',
                            color: chosen === oIdx ? '#4f46e5' : 'var(--text-main)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: chosen === oIdx ? '#4f46e5' : '#f1f5f9', color: chosen === oIdx ? '#ffffff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.84rem' }}>
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>

                    {/* Navigation Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <button
                        type="button"
                        disabled={mockIndex === 0}
                        onClick={() => setMockIndex((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: mockIndex === 0 ? 0.5 : 1 }}
                      >
                        ← Trước
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {mockQuestions.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMockIndex(idx)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: mockAnswers[idx] !== undefined ? '#4f46e5' : idx === mockIndex ? '#e0e7ff' : '#f1f5f9',
                              color: mockAnswers[idx] !== undefined ? '#ffffff' : 'var(--text-main)',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={mockIndex === mockQuestions.length - 1}
                        onClick={() => setMockIndex((p) => p + 1)}
                        className="btn-secondary"
                        style={{ opacity: mockIndex === mockQuestions.length - 1 ? 0.5 : 1 }}
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Mock Result View */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={42} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  Kết Quả Thi Thử Của Bạn
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Đúng {mockScore.correct} / {mockScore.total} câu ({Math.round((mockScore.correct / mockScore.total) * 100)}%)
                </p>
              </div>

              <div style={{ padding: '24px 36px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.86rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                  Điểm Dự Đoán TOEIC Toàn Diện
                </span>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '-0.02em' }}>
                  ~{mockScore.score}
                </span>
                <span style={{ fontSize: '0.84rem', color: '#c7d2fe' }}>
                  Thang điểm chuẩn quốc tế ETS (0 - 990)
                </span>
              </div>

              <button
                type="button"
                onClick={startMockTest}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={18} /> Làm Lại Bài Thi Mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 6: 600 ESSENTIAL BUSINESS WORDS */}
      {/* ========================================================================= */}
      {activeSkill === 'vocab600' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Topic Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'Contracts & Agreements', 'Marketing & Sales', 'Warranties & Quality', 'Business Planning', 'Conferences & Meetings', 'Finance & Accounting'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedWordTopic(topic)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedWordTopic === topic ? '#4f46e5' : '#f1f5f9',
                  color: selectedWordTopic === topic ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {topic === 'all' ? 'Mọi chủ đề 600 từ' : topic}
              </button>
            ))}
          </div>

          {/* Word Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {filteredWords.map((item, idx) => {
              const isSaved = savedVocabIds.has(item.word.toLowerCase());
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    borderRadius: '18px',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                        {item.partOfSpeech}
                      </span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {item.word}
                      </h4>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {item.ipa}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(item.word, speechVoice)}
                        className="icon-ghost"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveToNotebook(item)}
                        className="icon-ghost"
                        title={isSaved ? 'Đã lưu trong sổ' : 'Lưu vào Sổ từ vựng'}
                        style={{ color: isSaved ? '#16a34a' : 'var(--text-muted)' }}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.meaningVi}
                  </div>

                  {item.collocation && (
                    <div style={{ fontSize: '0.82rem', color: '#4338ca', fontWeight: 700, background: '#eef2ff', padding: '4px 10px', borderRadius: '8px', alignSelf: 'flex-start' }}>
                      • Collocation: {item.collocation}
                    </div>
                  )}

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                    "{item.exampleEn}"
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      → {item.exampleVi}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
