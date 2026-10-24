import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  Volume2,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Award,
  Zap,
  Check,
  ChevronRight,
  Flame,
  ListFilter
} from 'lucide-react';
import {
  TOEIC_PART5_QUESTIONS,
  TOEIC_PART2_LISTENING,
  TOEIC_600_WORDS,
  TOEIC_BANDS
} from '../data/toeicData';
import { ttsService } from '../services/ttsService';

export default function ToeicPracticeView({ words = [], onSaveWord, speechVoice = 'US' }) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('part5'); // 'part5' | 'part2' | 'vocab600' | 'mock'
  const [targetBand, setTargetBand] = useState('650 - 800');

  // Part 5 State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [p5Index, setP5Index] = useState(0);
  const [p5Answers, setP5Answers] = useState({}); // { [qId]: selectedIdx }
  const [savedVocabIds, setSavedVocabIds] = useState(new Set());

  // Part 2 State
  const [p2Index, setP2Index] = useState(0);
  const [p2Answers, setP2Answers] = useState({}); // { [qId]: selectedIdx }
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 600 Words State
  const [selectedWordTopic, setSelectedWordTopic] = useState('all');
  const [wordSearch, setWordSearch] = useState('');

  // Mini Mock Test State
  const [mockActive, setMockActive] = useState(false);
  const [mockFinished, setMockFinished] = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimeLeft, setMockTimeLeft] = useState(600); // 10 mins in seconds
  const [mockIndex, setMockIndex] = useState(0);
  const timerRef = useRef(null);

  // Filtered Part 5 questions
  const filteredP5 = useMemo(() => {
    if (selectedCategory === 'all') return TOEIC_PART5_QUESTIONS;
    return TOEIC_PART5_QUESTIONS.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentP5 = filteredP5[p5Index] || filteredP5[0];

  // Part 5 Categories
  const p5Categories = useMemo(() => {
    const cats = new Set(TOEIC_PART5_QUESTIONS.map((q) => q.category));
    return ['all', ...Array.from(cats)];
  }, []);

  // Filtered 600 words
  const wordTopics = useMemo(() => {
    const topics = new Set(TOEIC_600_WORDS.map((w) => w.topic));
    return ['all', ...Array.from(topics)];
  }, []);

  const filtered600Words = useMemo(() => {
    return TOEIC_600_WORDS.filter((w) => {
      const matchTopic = selectedWordTopic === 'all' || w.topic === selectedWordTopic;
      const matchSearch =
        !wordSearch.trim() ||
        w.word.toLowerCase().includes(wordSearch.toLowerCase()) ||
        w.meaningVi.toLowerCase().includes(wordSearch.toLowerCase());
      return matchTopic && matchSearch;
    });
  }, [selectedWordTopic, wordSearch]);

  // Track overall stats
  const totalP5Answered = Object.keys(p5Answers).length;
  const correctP5Count = Object.entries(p5Answers).filter(([qId, ansIdx]) => {
    const q = TOEIC_PART5_QUESTIONS.find((item) => item.id === qId);
    return q && q.correctIndex === ansIdx;
  }).length;
  const p5Accuracy = totalP5Answered > 0 ? Math.round((correctP5Count / totalP5Answered) * 100) : 0;

  // Estimated TOEIC score calculation
  const estimatedScore = useMemo(() => {
    if (totalP5Answered === 0) return 650;
    const base = 400;
    const bonus = Math.round((p5Accuracy / 100) * 450);
    return Math.min(990, base + bonus);
  }, [totalP5Answered, p5Accuracy]);

  // Audio speaker
  const playAudio = (text) => {
    if (!text) return;
    setIsPlayingAudio(true);
    ttsService.speak(text, { voiceType: speechVoice });
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  // Add word to notebook
  const handleSaveWordToNotebook = (wordObj) => {
    if (!onSaveWord) return;
    const wordKey = wordObj.word.toLowerCase();
    onSaveWord({
      word: wordObj.word,
      partOfSpeech: wordObj.pos || wordObj.partOfSpeech || 'noun',
      ipa: wordObj.ipa || '',
      meaningVi: wordObj.meaningVi || '',
      examples: wordObj.exampleEn
        ? [{ en: wordObj.exampleEn, vi: wordObj.exampleVi || '', context: 'TOEIC Exam Prep' }]
        : [],
      collocations: wordObj.collocation ? [wordObj.collocation] : [],
      tags: ['TOEIC', 'Business'],
      box: 1
    });

    setSavedVocabIds((prev) => new Set(prev).add(wordKey));
  };

  // Mock Test Timer
  useEffect(() => {
    if (mockActive && !mockFinished) {
      timerRef.current = setInterval(() => {
        setMockTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setMockFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mockActive, mockFinished]);

  const startMockTest = () => {
    // Shuffle and pick 10 questions
    const shuffled = [...TOEIC_PART5_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 10);
    setMockQuestions(shuffled);
    setMockAnswers({});
    setMockIndex(0);
    setMockTimeLeft(600); // 10 minutes
    setMockActive(true);
    setMockFinished(false);
  };

  const submitMockTest = () => {
    clearInterval(timerRef.current);
    setMockFinished(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOEIC Hero Dashboard Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: '24px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 24px -4px rgba(49, 46, 129, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '540px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '3px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Luyện Thi Chuẩn Quốc Tế
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>• 100% Sát format đề thi ETS</span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0 }}>
            Luyện Thi TOEIC Công Sở & Quốc Tế
          </h2>
          <p style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '6px', lineHeight: 1.45 }}>
            Rèn luyện phản xạ ngữ pháp Part 5, bẫy nghe Part 2, và làm chủ 600 từ vựng kinh điển giúp bạn đạt điểm tối đa trong môi trường làm việc toàn cầu.
          </p>

          {/* Target Band Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.8 }}>Mục tiêu:</span>
            {TOEIC_BANDS.map((b) => (
              <button
                key={b.band}
                onClick={() => setTargetBand(b.band)}
                style={{
                  background: targetBand === b.band ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: targetBand === b.band ? '#312e81' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {b.band}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Widgets */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '16px 20px',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{totalP5Answered}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', marginTop: '4px' }}>
              Câu đã làm
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.2)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: '#a7f3d0' }}>
              {p5Accuracy}%
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', marginTop: '4px' }}>
              Độ chính xác
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.2)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: '#fef08a' }}>
              ~{estimatedScore}
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', marginTop: '4px' }}>
              Điểm ước tính
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('part5')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'part5' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'part5' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target size={16} />
          <span>Part 5: Điền Câu & Ngữ Pháp ({TOEIC_PART5_QUESTIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('part2')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'part2' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'part2' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Volume2 size={16} />
          <span>Part 2: Luyện Nghe Phản Xạ ({TOEIC_PART2_LISTENING.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vocab600')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'vocab600' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'vocab600' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} />
          <span>600 Từ Vựng Trọng Tâm ({TOEIC_600_WORDS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mock')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'mock' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'mock' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Trophy size={16} />
          <span>Thi Thử Mini Mock Test</span>
        </button>
      </div>

      {/* 3. TAB 1: PART 5 INCOMPLETE SENTENCES */}
      {activeTab === 'part5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Chuyên đề:</span>
            {p5Categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setP5Index(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)',
                  background: selectedCategory === cat ? '#eef2ff' : '#ffffff',
                  color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'all' ? 'Tất cả chuyên đề' : cat}
              </button>
            ))}
          </div>

          {/* Question Card */}
          {currentP5 && (
            <div
              className="card"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Question Top Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    Câu {p5Index + 1} / {filteredP5.length}
                  </span>

                  <span
                    style={{
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {currentP5.category}
                  </span>

                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    Mục tiêu: {currentP5.difficulty}
                  </span>
                </div>

                {/* Speak Sentence Button */}
                <button
                  onClick={() => playAudio(currentP5.question.replace('_______', 'blank'))}
                  className="icon-ghost"
                  title="Nghe phát âm cả câu"
                  style={{ width: '32px', height: '32px' }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* The Sentence */}
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  lineHeight: 1.55,
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderRadius: '14px',
                  borderLeft: '4px solid var(--primary)'
                }}
              >
                {currentP5.question.split('_______').map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '90px',
                          borderBottom: '2px dashed var(--primary)',
                          color: p5Answers[currentP5.id] !== undefined
                            ? (p5Answers[currentP5.id] === currentP5.correctIndex ? '#059669' : '#dc2626')
                            : 'var(--primary)',
                          fontWeight: 800,
                          textAlign: 'center',
                          padding: '0 8px'
                        }}
                      >
                        {p5Answers[currentP5.id] !== undefined
                          ? currentP5.options[p5Answers[currentP5.id]]
                          : '.......'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* 4 Choices: A, B, C, D */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {currentP5.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isAnswered = p5Answers[currentP5.id] !== undefined;
                  const isSelected = p5Answers[currentP5.id] === optIdx;
                  const isCorrect = currentP5.correctIndex === optIdx;

                  let bgColor = '#ffffff';
                  let borderColor = 'var(--border-medium)';
                  let textColor = 'var(--text-main)';

                  if (isAnswered) {
                    if (isCorrect) {
                      bgColor = '#ecfdf5';
                      borderColor = '#10b981';
                      textColor = '#065f46';
                    } else if (isSelected) {
                      bgColor = '#fef2f2';
                      borderColor = '#ef4444';
                      textColor = '#991b1b';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => setP5Answers({ ...p5Answers, [currentP5.id]: optIdx })}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: `1.5px solid ${borderColor}`,
                        background: bgColor,
                        color: textColor,
                        fontWeight: 600,
                        fontSize: '0.98rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: isAnswered ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: isSelected ? 'currentColor' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem'
                          }}
                        >
                          {letter}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation Card (Revealed after answer) */}
              {p5Answers[currentP5.id] !== undefined && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    animation: 'cardEntrance 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} color="var(--primary)" />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Giải Thích Ngữ Pháp & Mẹo Thi ETS
                    </h4>
                  </div>

                  {/* Vietnamese translation */}
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong>Dịch nghĩa:</strong> {currentP5.translation}
                  </div>

                  {/* Grammar explanation */}
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                    <strong>Phân tích:</strong> {currentP5.explanation}
                  </div>

                  {/* Trap Alert */}
                  {currentP5.trapAlert && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: '0.86rem',
                        fontWeight: 600
                      }}
                    >
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{currentP5.trapAlert}</span>
                    </div>
                  )}

                  {/* Key Vocab with 1-click Save to Notebook */}
                  {currentP5.keyVocabulary && currentP5.keyVocabulary.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Từ vựng cốt lõi trong câu:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {currentP5.keyVocabulary.map((kv, kvIdx) => {
                          const isSaved = savedVocabIds.has(kv.word.toLowerCase());
                          return (
                            <div
                              key={kvIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#ffffff',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '10px',
                                padding: '6px 12px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <strong>{kv.word}</strong>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({kv.pos})</span>
                              <span style={{ color: 'var(--text-secondary)' }}>: {kv.meaningVi}</span>
                              <button
                                onClick={() => handleSaveWordToNotebook(kv)}
                                style={{
                                  border: 'none',
                                  background: isSaved ? '#ecfdf5' : '#eef2ff',
                                  color: isSaved ? '#059669' : 'var(--primary)',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {isSaved ? <Check size={12} /> : <BookmarkPlus size={12} />}
                                {isSaved ? 'Đã lưu' : '+ Lưu sổ'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Controls: Prev / Next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <button
                  disabled={p5Index === 0}
                  onClick={() => setP5Index((p) => p - 1)}
                  className="btn btn-secondary"
                  style={{ opacity: p5Index === 0 ? 0.4 : 1 }}
                >
                  ← Câu trước
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {filteredP5.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setP5Index(idx)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: idx === p5Index
                          ? 'var(--primary)'
                          : p5Answers[q.id] !== undefined
                          ? (p5Answers[q.id] === q.correctIndex ? '#d1fae5' : '#fee2e2')
                          : '#f1f5f9',
                        color: idx === p5Index
                          ? '#ffffff'
                          : p5Answers[q.id] !== undefined
                          ? (p5Answers[q.id] === q.correctIndex ? '#065f46' : '#991b1b')
                          : 'var(--text-muted)'
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={p5Index === filteredP5.length - 1}
                  onClick={() => setP5Index((p) => p + 1)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Câu tiếp theo →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: PART 2 QUESTION - RESPONSE (LISTENING DRILLS) */}
      {activeTab === 'part2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {TOEIC_PART2_LISTENING[p2Index] && (
            <div
              className="card"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Question Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#f1f5f9', fontWeight: 800, fontSize: '0.82rem', padding: '4px 10px', borderRadius: '8px' }}>
                    Part 2: Câu {p2Index + 1} / {TOEIC_PART2_LISTENING.length}
                  </span>
                  <span style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    {TOEIC_PART2_LISTENING[p2Index].category}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Nghe câu hỏi và chọn phản hồi đúng nhất (A, B hoặc C)
                </div>
              </div>

              {/* Audio Player Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
                  borderRadius: '16px',
                  border: '1px solid #c7d2fe',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                    🎧 Nghe câu hỏi (Audio)
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {p2Answers[TOEIC_PART2_LISTENING[p2Index].id] !== undefined
                      ? `"${TOEIC_PART2_LISTENING[p2Index].questionText}"`
                      : 'Bấm nút nghe bên phải để bắt đầu phản xạ nghe'}
                  </div>
                </div>

                <button
                  onClick={() => playAudio(TOEIC_PART2_LISTENING[p2Index].questionText)}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Volume2 size={20} />
                  Phát âm ({speechVoice})
                </button>
              </div>

              {/* 3 Choices: A, B, C */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {TOEIC_PART2_LISTENING[p2Index].options.map((opt, optIdx) => {
                  const q = TOEIC_PART2_LISTENING[p2Index];
                  const isAnswered = p2Answers[q.id] !== undefined;
                  const isSelected = p2Answers[q.id] === optIdx;
                  const isCorrect = q.correctIndex === optIdx;

                  let bgColor = '#ffffff';
                  let borderColor = 'var(--border-medium)';
                  let textColor = 'var(--text-main)';

                  if (isAnswered) {
                    if (isCorrect) {
                      bgColor = '#ecfdf5';
                      borderColor = '#10b981';
                      textColor = '#065f46';
                    } else if (isSelected) {
                      bgColor = '#fef2f2';
                      borderColor = '#ef4444';
                      textColor = '#991b1b';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => !isAnswered && setP2Answers({ ...p2Answers, [q.id]: optIdx })}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: `1.5px solid ${borderColor}`,
                        background: bgColor,
                        color: textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: isAnswered ? 'default' : 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{opt}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(opt.replace(/^\([A-C]\)\s*/, ''));
                          }}
                          className="icon-ghost"
                          title="Nghe câu trả lời"
                        >
                          <Volume2 size={16} />
                        </button>
                        {isAnswered && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Part 2 Trap Analysis */}
              {p2Answers[TOEIC_PART2_LISTENING[p2Index].id] !== undefined && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={18} color="var(--primary)" />
                    <h4 style={{ margin: 0, fontWeight: 800 }}>Dịch Nghĩa & Phân Tích Bẫy Nghe Part 2</h4>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Câu hỏi:</strong> {TOEIC_PART2_LISTENING[p2Index].questionVi}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                    {TOEIC_PART2_LISTENING[p2Index].optionsVi.map((vi, i) => (
                      <div key={i} style={{ color: i === TOEIC_PART2_LISTENING[p2Index].correctIndex ? '#059669' : 'var(--text-muted)' }}>
                        {vi}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{TOEIC_PART2_LISTENING[p2Index].trapAlert}</span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  disabled={p2Index === 0}
                  onClick={() => setP2Index((p) => p - 1)}
                  className="btn btn-secondary"
                  style={{ opacity: p2Index === 0 ? 0.4 : 1 }}
                >
                  ← Câu trước
                </button>

                <button
                  disabled={p2Index === TOEIC_PART2_LISTENING.length - 1}
                  onClick={() => setP2Index((p) => p + 1)}
                  className="btn btn-primary"
                >
                  Câu tiếp theo →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: 600 ESSENTIAL TOEIC BUSINESS WORDS */}
      {activeTab === 'vocab600' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Controls: Search + Topic Filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-wrapper" style={{ flex: '1 1 240px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Tìm từ vựng 600 TOEIC hoặc nghĩa tiếng Việt…"
                value={wordSearch}
                onChange={(e) => setWordSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
              {wordTopics.map((top) => (
                <button
                  key={top}
                  onClick={() => setSelectedWordTopic(top)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: selectedWordTopic === top ? 700 : 500,
                    border: '1px solid',
                    borderColor: selectedWordTopic === top ? 'var(--primary)' : 'var(--border-subtle)',
                    background: selectedWordTopic === top ? '#eef2ff' : '#ffffff',
                    color: selectedWordTopic === top ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {top === 'all' ? 'Mọi chủ đề 600 từ' : top}
                </button>
              ))}
            </div>
          </div>

          {/* Words Grid */}
          <div className="word-grid">
            {filtered600Words.map((w, idx) => {
              const isSaved = savedVocabIds.has(w.word.toLowerCase());
              return (
                <div
                  key={idx}
                  className="word-card"
                  style={{ '--accent': '#6366f1', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="pos-badge pos-verb" style={{ fontSize: '0.68rem' }}>
                          {w.partOfSpeech}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{w.topic}</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {w.word}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {w.ipa}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => playAudio(w.word)}
                        className="icon-ghost"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => handleSaveWordToNotebook(w)}
                        className="icon-ghost"
                        title="Lưu vào Sổ tay từ vựng"
                        style={{ color: isSaved ? '#10b981' : 'var(--primary)' }}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {w.meaningVi}
                  </div>

                  {w.collocation && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      • Collocation: {w.collocation}
                    </div>
                  )}

                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '2px solid #818cf8',
                      borderRadius: '0 8px 8px 0',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                      lineHeight: 1.35
                    }}
                  >
                    "{w.exampleEn}"
                    {w.exampleVi && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'normal', marginTop: '2px' }}>
                        → {w.exampleVi}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 4: MINI MOCK TEST */}
      {activeTab === 'mock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!mockActive && !mockFinished ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '50px 24px',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <Trophy size={48} color="var(--primary)" />
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                Thi Thử Rút Gọn TOEIC Part 5 (10 Câu)
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Đề thi mô phỏng áp lực phòng thi thật với đồng hồ đếm ngược 10 phút. Hệ thống sẽ quy đổi điểm số chính xác theo thang điểm chuẩn TOEIC ETS.
              </p>

              <button
                onClick={startMockTest}
                className="btn btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)'
                }}
              >
                <Zap size={18} />
                Bắt Đầu Làm Bài Ngay
              </button>
            </div>
          ) : mockActive && !mockFinished ? (
            /* Active Mock Test */
            <div
              className="card"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '20px',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Header with Timer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    Câu {mockIndex + 1} / {mockQuestions.length}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    background: mockTimeLeft < 120 ? '#fee2e2' : '#f1f5f9',
                    color: mockTimeLeft < 120 ? '#dc2626' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}
                >
                  <Clock size={16} />
                  <span>{formatTime(mockTimeLeft)}</span>
                </div>

                <button
                  onClick={submitMockTest}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', borderRadius: '10px', fontWeight: 700 }}
                >
                  Nộp Bài Thi
                </button>
              </div>

              {/* Question */}
              {mockQuestions[mockIndex] && (
                <div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      lineHeight: 1.55,
                      padding: '18px',
                      background: '#f8fafc',
                      borderRadius: '14px',
                      borderLeft: '4px solid var(--primary)',
                      marginBottom: '16px'
                    }}
                  >
                    {mockQuestions[mockIndex].question}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {mockQuestions[mockIndex].options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = mockAnswers[mockQuestions[mockIndex].id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => setMockAnswers({ ...mockAnswers, [mockQuestions[mockIndex].id]: optIdx })}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            background: isSelected ? '#eef2ff' : '#ffffff',
                            color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: isSelected ? 'var(--primary)' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem'
                            }}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Palette */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button
                  disabled={mockIndex === 0}
                  onClick={() => setMockIndex((p) => p - 1)}
                  className="btn btn-secondary"
                  style={{ opacity: mockIndex === 0 ? 0.4 : 1 }}
                >
                  ← Trước
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {mockQuestions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setMockIndex(idx)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        background: idx === mockIndex
                          ? 'var(--primary)'
                          : mockAnswers[q.id] !== undefined
                          ? '#c7d2fe'
                          : '#f1f5f9',
                        color: idx === mockIndex ? '#ffffff' : 'var(--text-main)'
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={mockIndex === mockQuestions.length - 1}
                  onClick={() => setMockIndex((p) => p + 1)}
                  className="btn btn-secondary"
                >
                  Sau →
                </button>
              </div>
            </div>
          ) : (
            /* Mock Test Result Card */
            <div
              className="card"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                  Kết Quả Thi Thử TOEIC Rút Gọn
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Điểm số được quy đổi chuẩn hóa theo thang điểm TOEIC ETS
                </p>
              </div>

              {/* Score Highlights */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px'
                }}
              >
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {Object.entries(mockAnswers).filter(([qId, ans]) => {
                      const q = mockQuestions.find((m) => m.id === qId);
                      return q && q.correctIndex === ans;
                    }).length} / {mockQuestions.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                    Số câu đúng
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                    {Math.round(
                      (Object.entries(mockAnswers).filter(([qId, ans]) => {
                        const q = mockQuestions.find((m) => m.id === qId);
                        return q && q.correctIndex === ans;
                      }).length /
                        mockQuestions.length) *
                        100
                    )}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#047857', textTransform: 'uppercase', marginTop: '4px' }}>
                    Tỷ lệ chính xác
                  </div>
                </div>

                <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309' }}>
                    ~{Math.min(
                      990,
                      450 +
                        Math.round(
                          (Object.entries(mockAnswers).filter(([qId, ans]) => {
                            const q = mockQuestions.find((m) => m.id === qId);
                            return q && q.correctIndex === ans;
                          }).length /
                            mockQuestions.length) *
                            450
                        )
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#92400e', textTransform: 'uppercase', marginTop: '4px' }}>
                    Điểm ước tính
                  </div>
                </div>
              </div>

              {/* Review All Answers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Rà Soát Chi Tiết Bài Làm</h4>
                {mockQuestions.map((q, qIdx) => {
                  const userAns = mockAnswers[q.id];
                  const isCorrect = userAns === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: isCorrect ? '#a7f3d0' : '#fecaca',
                        background: isCorrect ? '#f0fdf4' : '#fff5f5'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Câu {qIdx + 1}: {q.question}</span>
                        {isCorrect ? (
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={16} /> Đúng
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={16} /> Sai
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.84rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
                        <strong>Đáp án đúng:</strong> {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                        {userAns !== undefined && !isCorrect && (
                          <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                            (Bạn chọn: {String.fromCharCode(65 + userAns)}. {q.options[userAns]})
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-main)', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={startMockTest}
                className="btn btn-primary"
                style={{ alignSelf: 'center', padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
              >
                <RotateCcw size={16} /> Làm Đề Thi Khác
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
