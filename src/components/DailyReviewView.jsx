import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Sparkles,
  Trophy,
  ArrowRight,
  Award,
  Layers,
  Brain,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Search,
  Stethoscope,
  Repeat,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ttsService } from '../services/ttsService';

export const RATINGS = [
  {
    rating: 'forgot',
    label: 'Quên',
    kb: '1',
    color: '#F2683A',
    bg: '#FFF2EC',
    when: 'Nhìn mà không ra nghĩa',
    then: 'Mai gặp lại từ này ngay (Hộp 1)',
    intervalHint: 'Mai gặp lại',
    Icon: HelpCircle
  },
  {
    rating: 'hard',
    label: 'Mơ hồ',
    kb: '2',
    color: '#D98A1B',
    bg: '#FEF9EC',
    when: 'Nhớ được nhưng phải nghĩ lâu',
    then: 'Sau 2 ngày gặp lại (Hộp 2)',
    intervalHint: 'Sau 2 ngày',
    Icon: Brain
  },
  {
    rating: 'good',
    label: 'Nhớ',
    kb: '3',
    color: '#1F9D63',
    bg: '#EDFAF3',
    when: 'Ra nghĩa trong vài giây',
    then: 'Tăng 1 Hộp (Sau 5 ngày)',
    intervalHint: 'Sau 5 ngày',
    Icon: CheckCircle2
  },
  {
    rating: 'easy',
    label: 'Nhớ rồi',
    kb: '4',
    color: '#4F46E5',
    bg: '#EEF2FF',
    when: 'Bật ra ngay, không phải nghĩ',
    then: 'Thuộc lòng (Sau 14 ngày)',
    intervalHint: 'Thuộc lòng',
    Icon: Sparkles
  }
];

export default function DailyReviewView({
  words,
  onRecordReview,
  speechVoice,
  onLookupDictionary,
  onTryInDoctor,
  onViewSynonyms,
  onOpenIn4Skills,
  onOpenVocab
}) {
  const [activeMode, setActiveMode] = useState('flashcards'); // 'flashcards' | 'quiz'

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizCount, setQuizCount] = useState(5);
  const [quizType, setQuizType] = useState('mixed');

  // Flashcards deck state
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Box statistics
  const boxStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    words.forEach((w) => {
      const box = w.box || 1;
      if (stats[box] !== undefined) stats[box]++;
    });
    return stats;
  }, [words]);

  // Words that need review sorted by lowest box first
  const reviewDeck = useMemo(() => {
    return [...words].sort((a, b) => (a.box || 1) - (b.box || 1));
  }, [words]);

  const currentFcWord = reviewDeck[fcIndex] || null;

  // Keyboard navigation for Flashcard mode (1: Quên, 2: Mơ hồ, 3: Nhớ, 4: Nhớ rồi, Space: Lật)
  useEffect(() => {
    if (activeMode !== 'flashcards' || !currentFcWord) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleFlashcardResult('forgot');
      } else if (e.key === '2') {
        e.preventDefault();
        handleFlashcardResult('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleFlashcardResult('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleFlashcardResult('easy');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextFc();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevFc();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, currentFcWord, fcIndex, isFlipped]);

  const handleFlashcardResult = (rating) => {
    if (!currentFcWord) return;
    onRecordReview(currentFcWord.id, rating);
    handleNextFc();
  };

  const handleNextFc = () => {
    setIsFlipped(false);
    if (fcIndex < reviewDeck.length - 1) {
      setFcIndex((prev) => prev + 1);
    } else {
      setFcIndex(0);
    }
  };

  const handlePrevFc = () => {
    setIsFlipped(false);
    if (fcIndex > 0) {
      setFcIndex((prev) => prev - 1);
    } else {
      setFcIndex(reviewDeck.length - 1);
    }
  };

  // Generate random quiz questions
  const generateRandomQuiz = (count = quizCount) => {
    if (words.length < 2) return;

    const shuffledPool = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledPool.slice(0, Math.min(count, words.length));

    const generated = selectedWords.map((targetWord) => {
      let qType = quizType;
      if (qType === 'mixed') {
        const types = ['meaning', 'blank'];
        if (targetWord.synonyms && targetWord.synonyms.length > 0) {
          types.push('synonym');
        }
        qType = types[Math.floor(Math.random() * types.length)];
      }

      const otherWords = words.filter((w) => w.id !== targetWord.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());

      if (qType === 'blank' && targetWord.examples && targetWord.examples.length > 0) {
        const randomEx =
          targetWord.examples[Math.floor(Math.random() * targetWord.examples.length)];
        const regex = new RegExp(targetWord.word, 'gi');
        const blankSentence = randomEx.en.replace(regex, '______');

        const options = [
          targetWord.word,
          ...shuffledOthers.slice(0, 3).map((w) => w.word)
        ].sort(() => 0.5 - Math.random());

        return {
          type: 'blank',
          targetWord,
          question: `Điền từ thích hợp vào câu công sở sau:`,
          sentence: blankSentence,
          sentenceVi: randomEx.vi,
          correctAnswer: targetWord.word,
          options,
          explanation: `Từ cần điền là "${targetWord.word}" (${targetWord.ipa || ''}): ${targetWord.meaningVi}.`
        };
      }

      if (qType === 'synonym' && targetWord.synonyms && targetWord.synonyms.length > 0) {
        const correctSyn = targetWord.synonyms[0];
        const fakeSynonyms = shuffledOthers
          .slice(0, 3)
          .map((w) => w.synonyms?.[0] || w.word);

        const options = [correctSyn, ...fakeSynonyms].sort(() => 0.5 - Math.random());

        return {
          type: 'synonym',
          targetWord,
          question: `Từ nào sau đây ĐỒNG NGHĨA với "${targetWord.word}"?`,
          sentence: `Nghĩa: ${targetWord.meaningVi}`,
          correctAnswer: correctSyn,
          options,
          explanation: `"${targetWord.word}" đồng nghĩa với "${correctSyn}".`
        };
      }

      // Default: Meaning quiz
      const options = [
        targetWord.meaningVi,
        ...shuffledOthers.slice(0, 3).map((w) => w.meaningVi)
      ].sort(() => 0.5 - Math.random());

      return {
        type: 'meaning',
        targetWord,
        question: `Nghĩa tiếng Việt của từ "${targetWord.word}" là gì?`,
        sentence: targetWord.ipa ? `Phát âm: ${targetWord.ipa}` : '',
        correctAnswer: targetWord.meaningVi,
        options,
        explanation: `"${targetWord.word}" nghĩa là: ${targetWord.meaningVi}.`
      };
    });

    setQuizQuestions(generated);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleSelectAnswer = (option) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQIndex];
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    onRecordReview(currentQ.targetWord.id, isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const currentQ = quizQuestions[currentQIndex] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Bento Stats Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '22px 26px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}
              >
                <Brain size={18} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Hệ Thống Ghi Nhớ Ngắt Quãng (Spaced Repetition)
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '640px' }}>
              Từ vựng được tự động nâng cấp qua 5 cấp độ nhớ. Ôn tập đúng chu kỳ giúp tăng khả năng ghi nhớ vĩnh viễn lên gấp 3 lần.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-pill)',
              padding: '4px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setActiveMode('flashcards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeMode === 'flashcards' ? '#ffffff' : 'transparent',
                color: activeMode === 'flashcards' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'flashcards' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} />
              <span>Lật Thẻ Flashcard</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('quiz');
                if (quizQuestions.length === 0) generateRandomQuiz();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeMode === 'quiz' ? '#ffffff' : 'transparent',
                color: activeMode === 'quiz' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'quiz' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Zap size={15} />
              <span>Trắc Nghiệm Hàng Ngày</span>
            </button>
          </div>
        </div>

        {/* 5-Tier Leitner Ladder Cards */}
        <div className="leitner-ladder-container">
          {[
            { box: 1, label: 'Hộp 1 • Mới lưu', color: '#ef4444', count: boxStats[1] },
            { box: 2, label: 'Hộp 2 • Đang nhớ', color: '#f59e0b', count: boxStats[2] },
            { box: 3, label: 'Hộp 3 • Nhớ khá', color: '#0284c7', count: boxStats[3] },
            { box: 4, label: 'Hộp 4 • Gần thuộc', color: '#6366f1', count: boxStats[4] },
            { box: 5, label: 'Hộp 5 • Thành thạo', color: '#10b981', count: boxStats[5] }
          ].map((item) => {
            const pct = words.length > 0 ? Math.round((item.count / words.length) * 100) : 0;
            return (
              <div key={item.box} className="leitner-tier-card">
                <div className="leitner-tier-count" style={{ color: item.color }}>
                  {item.count}
                </div>
                <div className="leitner-tier-label" style={{ color: 'var(--text-main)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {pct}% tổng số từ
                </div>
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    background: '#e2e8f0',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                    marginTop: '8px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: item.color,
                      borderRadius: 'var(--radius-pill)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================================================
          Mode 1: 3D Flashcard Deck Mode
          ========================================================================== */}
      {activeMode === 'flashcards' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {reviewDeck.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '50px 24px',
                maxWidth: '520px',
                width: '100%'
              }}
            >
              <Award size={48} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Chưa có từ vựng nào trong sổ</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                Hãy thêm từ vựng mới để bắt đầu chuỗi ngày luyện tập ghi nhớ.
              </p>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '620px' }}>
              {/* Deck Navigation Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  padding: '0 8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Thẻ {fcIndex + 1} / {reviewDeck.length}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: '#eef2ff',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid #1E1B4B'
                    }}
                  >
                    Hộp {currentFcWord.box || 1}
                  </span>
                  {currentFcWord.lastRating && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1.5px solid #1E1B4B',
                        background:
                          currentFcWord.lastRating === 'forgot'
                            ? '#FFF2EC'
                            : currentFcWord.lastRating === 'hard'
                            ? '#FEF9EC'
                            : currentFcWord.lastRating === 'good'
                            ? '#EDFAF3'
                            : '#EEF2FF',
                        color:
                          currentFcWord.lastRating === 'forgot'
                            ? '#F2683A'
                            : currentFcWord.lastRating === 'hard'
                            ? '#D98A1B'
                            : currentFcWord.lastRating === 'good'
                            ? '#1F9D63'
                            : '#4F46E5'
                      }}
                    >
                      Lần trước:{' '}
                      {currentFcWord.lastRating === 'forgot'
                        ? 'Quên'
                        : currentFcWord.lastRating === 'hard'
                        ? 'Mơ hồ'
                        : currentFcWord.lastRating === 'good'
                        ? 'Nhớ'
                        : 'Nhớ rồi'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" onClick={handlePrevFc} title="Thẻ trước [←]">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="btn-icon" onClick={handleNextFc} title="Thẻ tiếp theo [→]">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* 3D Flip Card */}
              <div className="flashcard-perspective">
                <div
                  className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front Face */}
                  <div className="flashcard-face">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="vocab-pos-badge">{currentFcWord.partOfSpeech || 'TERM'}</span>
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          ttsService.speak(currentFcWord.word, { voiceType: speechVoice });
                        }}
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'center', margin: '18px 0' }}>
                      <h1
                        style={{
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          letterSpacing: '-0.03em',
                          marginBottom: '8px'
                        }}
                      >
                        {currentFcWord.word}
                      </h1>
                      {currentFcWord.ipa && (
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            color: 'var(--primary)',
                            fontWeight: 600
                          }}
                        >
                          {currentFcWord.ipa}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      Bấm vào thẻ hoặc nhấn <kbd style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>Space</kbd> để lật xem nghĩa
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="flashcard-face flashcard-back">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {currentFcWord.word}
                        </span>
                        <button
                          className="audio-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            ttsService.speak(currentFcWord.word, { voiceType: speechVoice });
                          }}
                          title="Nghe phát âm"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '14px'
                        }}
                      >
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {currentFcWord.meaningVi}
                        </div>
                        {currentFcWord.meaningEn && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '3px' }}>
                            {currentFcWord.meaningEn}
                          </div>
                        )}
                      </div>

                      {/* Workplace Example */}
                      {currentFcWord.examples && currentFcWord.examples[0] && (
                        <div
                          style={{
                            background: '#eef2ff',
                            border: '1px solid #c7d2fe',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#312e81', lineHeight: 1.4 }}>
                              "{currentFcWord.examples[0].en}"
                            </p>
                            <button
                              className="audio-btn"
                              style={{ width: '26px', height: '26px', marginLeft: '6px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                ttsService.speak(currentFcWord.examples[0].en, { voiceType: speechVoice });
                              }}
                              title="Nghe câu ví dụ"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          {currentFcWord.examples[0].vi && (
                            <p style={{ fontSize: '0.8rem', color: '#4338ca', marginTop: '4px' }}>
                              ➔ {currentFcWord.examples[0].vi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      Bấm thẻ để lật lại mặt trước
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Controls: 4-tier SRS Assessment + Flip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                {/* 4 SRS Rating Buttons */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px'
                  }}
                >
                  {RATINGS.map((r) => {
                    const IconComp = r.Icon;
                    return (
                      <button
                        key={r.rating}
                        type="button"
                        onClick={() => handleFlashcardResult(r.rating)}
                        title={`${r.label}: ${r.when} • ${r.then} (Phím ${r.kb})`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '12px 6px',
                          background: r.bg,
                          border: '2px solid #1E1B4B',
                          borderRadius: '16px',
                          boxShadow: '0 3px 0 #1E1B4B',
                          cursor: 'pointer',
                          transition: 'transform 0.12s ease, box-shadow 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 5px 0 #1E1B4B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 3px 0 #1E1B4B';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: r.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1.5px solid #1E1B4B',
                              flexShrink: 0
                            }}
                          >
                            <IconComp size={12} strokeWidth={2.5} />
                          </span>
                          <span
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: '#1E1B4B',
                              fontFamily: 'var(--font-heading)'
                            }}
                          >
                            {r.label}
                          </span>
                          <kbd
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: '#ffffff',
                              border: '1.5px solid #1E1B4B',
                              color: '#1E1B4B'
                            }}
                          >
                            {r.kb}
                          </kbd>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: r.color,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {r.intervalHint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Flip Card Bar */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: '#ffffff',
                    border: '2px solid #1E1B4B',
                    borderRadius: '14px',
                    boxShadow: '0 2px 0 #1E1B4B',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#1E1B4B',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <RotateCcw size={16} />
                  <span>{isFlipped ? 'Lật lại mặt trước' : 'Lật xem nghĩa & câu ví dụ'}</span>
                  <kbd
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#F1F5F9',
                      border: '1.5px solid #1E1B4B',
                      marginLeft: '4px'
                    }}
                  >
                    Space
                  </kbd>
                </button>

                {/* Cross-Screen Hub: Liên kết tức thì sang Từ điển, Bác sĩ ngữ pháp, Từ đồng nghĩa, 4 Kỹ Năng, Sổ từ */}
                {currentFcWord && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: '#FAF5FF',
                      border: '2px solid #1E1B4B',
                      boxShadow: '0 3px 0 #1E1B4B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={15} color="#7E22CE" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E1B4B' }}>
                        Khám phá sâu từ "{currentFcWord.word}":
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {onLookupDictionary && (
                        <button
                          type="button"
                          onClick={() => onLookupDictionary(currentFcWord.word)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1.5px solid #1E1B4B',
                            color: '#1E1B4B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #1E1B4B'
                          }}
                          title="Tra cứu từ điển Anh-Việt đầy đủ với IPA & collocations"
                        >
                          <Search size={13} color="#2563EB" />
                          <span>📖 Tra từ điển</span>
                        </button>
                      )}

                      {onTryInDoctor && (
                        <button
                          type="button"
                          onClick={() => {
                            const sentence = currentFcWord.examples?.[0]?.en || `Please make sure to apply the concept of ${currentFcWord.word} in our team project.`;
                            onTryInDoctor(sentence);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1.5px solid #1E1B4B',
                            color: '#1E1B4B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #1E1B4B'
                          }}
                          title="Thử đặt câu hoặc sửa câu ví dụ trong Bác sĩ ngữ pháp"
                        >
                          <Stethoscope size={13} color="#059669" />
                          <span>🩺 Luyện viết câu</span>
                        </button>
                      )}

                      {onViewSynonyms && (
                        <button
                          type="button"
                          onClick={() => onViewSynonyms(currentFcWord.word)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1.5px solid #1E1B4B',
                            color: '#1E1B4B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #1E1B4B'
                          }}
                          title="Xem từ đồng nghĩa và biến thể từ"
                        >
                          <Repeat size={13} color="#7E22CE" />
                          <span>🔄 Từ đồng nghĩa</span>
                        </button>
                      )}

                      {onOpenIn4Skills && (
                        <button
                          type="button"
                          onClick={() => onOpenIn4Skills(currentFcWord.word)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1.5px solid #1E1B4B',
                            color: '#1E1B4B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #1E1B4B'
                          }}
                          title="Mở luyện tập trong bộ 4 Kỹ Năng"
                        >
                          <GraduationCap size={13} color="#2563EB" />
                          <span>⚡ 4 Kỹ Năng</span>
                        </button>
                      )}

                      {onOpenVocab && (
                        <button
                          type="button"
                          onClick={onOpenVocab}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1.5px solid #1E1B4B',
                            color: '#1E1B4B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 0 #1E1B4B'
                          }}
                          title="Mở xem trong Sổ từ vựng"
                        >
                          <BookOpen size={13} color="#4F46E5" />
                          <span>📚 Sổ từ</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================================
          Mode 2: Interactive Daily Quiz Mode
          ========================================================================== */}
      {activeMode === 'quiz' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          {quizCompleted ? (
            /* Quiz Completion Card */
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)'
                }}
              >
                <Trophy size={34} color="#854d0e" />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Hoàn Thành Bài Kiểm Tra!
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Bạn đã trả lời đúng <strong>{score}</strong> / {quizQuestions.length} câu hỏi.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px'
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => generateRandomQuiz(5)}
                >
                  <RotateCcw size={15} /> Làm 5 Câu Mới
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => generateRandomQuiz(10)}
                >
                  <Zap size={15} /> Thử Thách 10 Câu
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Quiz Question Card */
            <div className="card" style={{ padding: '28px' }}>
              {/* Question Header & Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Câu {currentQIndex + 1} / {quizQuestions.length}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Điểm số: {score}
                  </span>
                </div>

                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                      background: 'var(--primary-gradient)',
                      borderRadius: 'var(--radius-pill)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {currentQ.question}
              </h3>

              {currentQ.sentence && (
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '20px'
                  }}
                >
                  {currentQ.sentence}
                  {currentQ.sentenceVi && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '4px' }}>
                      ➔ {currentQ.sentenceVi}
                    </div>
                  )}
                </div>
              )}

              {/* 4 Multiple Choice Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQ.options.map((opt, idx) => {
                  const keyLetter = ['A', 'B', 'C', 'D'][idx] || '';
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === currentQ.correctAnswer;

                  let optionClass = 'quiz-option-btn';
                  if (isAnswerSubmitted) {
                    if (isCorrect) optionClass += ' selected-correct';
                    else if (isSelected && !isCorrect) optionClass += ' selected-wrong';
                  }

                  return (
                    <button
                      key={idx}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(opt)}
                      disabled={isAnswerSubmitted}
                    >
                      <span className="quiz-key-pill">{keyLetter}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 size={18} color="var(--success)" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle size={18} color="var(--danger)" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerSubmitted && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {currentQ.explanation}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                    onClick={handleNextQuestion}
                  >
                    <span>{currentQIndex === quizQuestions.length - 1 ? 'Xem Kết Quả' : 'Câu Tiếp Theo'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <button className="btn btn-primary" onClick={() => generateRandomQuiz(5)}>
                Bắt Đầu Bài Kiểm Tra Ngay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
