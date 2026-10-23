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
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ttsService } from '../services/ttsService';

export default function DailyReviewView({
  words,
  onRecordReview,
  speechVoice
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

  // Keyboard navigation for Flashcard mode
  useEffect(() => {
    if (activeMode !== 'flashcards' || !currentFcWord) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleFlashcardResult(false);
      } else if (e.key === '2') {
        e.preventDefault();
        handleFlashcardResult(true);
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

  const handleFlashcardResult = (isCorrect) => {
    if (!currentFcWord) return;
    onRecordReview(currentFcWord.id, isCorrect);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Thẻ {fcIndex + 1} / {reviewDeck.length}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: '#eef2ff',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid #c7d2fe'
                    }}
                  >
                    Hộp {currentFcWord.box || 1}
                  </span>
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

              {/* Bottom Action Controls */}
              <div className="review-actions">
                <button
                  className="btn"
                  onClick={() => handleFlashcardResult(false)}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                  title="Chưa nhớ - Giảm về Hộp 1"
                >
                  <XCircle size={16} />
                  <span>Chưa nhớ</span>
                  <kbd>1</kbd>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setIsFlipped(!isFlipped)}
                  title="Lật thẻ"
                >
                  <RotateCcw size={15} />
                  <span>Lật</span>
                  <kbd>Space</kbd>
                </button>

                <button
                  className="btn"
                  onClick={() => handleFlashcardResult(true)}
                  style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669' }}
                  title="Đã nhớ tốt - Tăng lên Hộp tiếp theo"
                >
                  <CheckCircle2 size={16} />
                  <span>Đã nhớ</span>
                  <kbd>2</kbd>
                </button>
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
