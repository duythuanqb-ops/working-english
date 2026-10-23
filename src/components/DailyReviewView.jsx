import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Sparkles,
  Trophy,
  HelpCircle,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ttsService } from '../services/ttsService';

export default function DailyReviewView({
  words,
  onRecordReview,
  speechVoice
}) {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'flashcards'

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizCount, setQuizCount] = useState(5);
  const [quizType, setQuizType] = useState('mixed'); // 'mixed' | 'meaning' | 'blank' | 'synonym'

  // Flashcards state
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

  // Words that need review
  const dueWords = useMemo(() => {
    // Return words sorted by lowest box and longest time not reviewed
    return [...words].sort((a, b) => (a.box || 1) - (b.box || 1));
  }, [words]);

  // Start generating a random quiz based on user's saved words
  const generateRandomQuiz = (count = quizCount) => {
    if (words.length < 2) return;

    // Shuffle and pick subset of words
    const shuffledPool = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledPool.slice(0, Math.min(count, words.length));

    const generated = selectedWords.map((targetWord) => {
      // Pick random question type
      let qType = quizType;
      if (qType === 'mixed') {
        const types = ['meaning', 'blank'];
        if (targetWord.synonyms && targetWord.synonyms.length > 0) {
          types.push('synonym');
        }
        qType = types[Math.floor(Math.random() * types.length)];
      }

      // Generate wrong options from other words
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
          question: `Từ nào dưới đây ĐỒNG NGHĨA với "${targetWord.word}"?`,
          correctAnswer: correctSyn,
          options,
          explanation: `"${targetWord.word}" có các từ đồng nghĩa: ${targetWord.synonyms.join(', ')}.`
        };
      }

      // Default: Meaning Quiz
      const options = [
        targetWord.meaningVi,
        ...shuffledOthers.slice(0, 3).map((w) => w.meaningVi)
      ].sort(() => 0.5 - Math.random());

      return {
        type: 'meaning',
        targetWord,
        question: `Nghĩa của từ "${targetWord.word}" là gì?`,
        ipa: targetWord.ipa,
        correctAnswer: targetWord.meaningVi,
        options,
        explanation: `"${targetWord.word}" có nghĩa là: ${targetWord.meaningVi} (${targetWord.meaningEn || ''}).`
      };
    });

    setQuizQuestions(generated);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  // Handle Answer Selection in Quiz
  const handleSelectOption = (opt) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(opt);
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQIndex];
    const isCorrect = opt === currentQ.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Advance Leitner box
      onRecordReview(currentQ.targetWord.id, true);
    } else {
      // Decrease Leitner box
      onRecordReview(currentQ.targetWord.id, false);
    }

    // Play pronunciation of word
    ttsService.speak(currentQ.targetWord.word, { voiceType: speechVoice });
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Flashcards navigation
  const currentFcWord = dueWords[fcIndex];

  const handleFcAnswer = (isKnown) => {
    if (currentFcWord) {
      onRecordReview(currentFcWord.id, isKnown);
    }
    setIsFlipped(false);
    if (fcIndex + 1 < dueWords.length) {
      setFcIndex((prev) => prev + 1);
    } else {
      setFcIndex(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Leitner Box Progress & Mode Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'center',
          background: 'var(--bg-card)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CalendarCheck size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Tiến Độ Ôn Tập Ngắt Quãng (Spaced Repetition)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '14px' }}>
            Hệ thống tự động phân loại từ vựng thành 5 hộp theo mức độ ghi nhớ. Ôn tập đúng nhịp giúp nhớ lâu gấp 3 lần.
          </p>

          {/* 5 Leitner Boxes bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((boxNum) => {
              const count = boxStats[boxNum] || 0;
              const percent = words.length > 0 ? Math.round((count / words.length) * 100) : 0;
              return (
                <div
                  key={boxNum}
                  style={{
                    background: boxNum === 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${boxNum === 5 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Hộp {boxNum}
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: boxNum === 5 ? '#34d399' : '#f8fafc',
                      margin: '2px 0'
                    }}
                  >
                    {count} từ
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {percent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <button
            className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('quiz');
              if (quizQuestions.length === 0) generateRandomQuiz();
            }}
          >
            <Sparkles size={16} />
            <span>Bài Kiểm Tra Random</span>
          </button>

          <button
            className={`btn ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <RotateCcw size={16} />
            <span>Lật Thẻ Flashcard</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Random Daily Quiz */}
      {activeTab === 'quiz' && (
        <div className="card" style={{ padding: '28px' }}>
          {quizQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <Trophy size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                Tự Tạo Bài Kiểm Tra Ngẫu Nhiên Hàng Ngày
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 24px auto' }}>
                Hệ thống sẽ lấy ngẫu nhiên các từ vựng bạn đã note để tạo câu hỏi trắc nghiệm nghĩa, điền từ vào câu ví dụ công sở và ghép từ đồng nghĩa.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Số lượng câu hỏi:
                </span>
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuizCount(num)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: quizCount === num ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      color: quizCount === num ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {num} câu
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={() => generateRandomQuiz(quizCount)}>
                <Sparkles size={16} /> Bắt Đầu Kiểm Tra Ngay
              </button>
            </div>
          ) : quizCompleted ? (
            /* Quiz Results Screen */
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <Award size={64} color="#f59e0b" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                Hoàn Thành Bài Kiểm Tra!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
                Bạn đã đạt <strong>{score}</strong> / {quizQuestions.length} câu đúng (
                {Math.round((score / quizQuestions.length) * 100)}%)
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '28px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Các từ trả lời đúng đã được thăng hạng lên Hộp ghi nhớ cao hơn!</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button className="btn btn-primary" onClick={() => generateRandomQuiz(quizCount)}>
                  <RotateCcw size={16} /> Làm Đề Khác
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('flashcards')}>
                  Ôn Lại Bằng Flashcard
                </button>
              </div>
            </div>
          ) : (
            /* Active Quiz Question */
            <div>
              {/* Question Header & Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Câu {currentQIndex + 1} / {quizQuestions.length}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                  Điểm số: {score} đúng
                </span>
              </div>

              <div
                style={{
                  height: '6px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '24px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Question Body */}
              {(() => {
                const q = quizQuestions[currentQIndex];
                return (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                        {q.question}
                      </h4>

                      {q.ipa && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.9rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                            {q.ipa}
                          </span>
                          <button
                            className="audio-btn"
                            style={{ width: '26px', height: '26px' }}
                            onClick={() => ttsService.speak(q.targetWord.word, { voiceType: speechVoice })}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                      )}

                      {q.sentence && (
                        <div
                          style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 18px',
                            margin: '14px 0'
                          }}
                        >
                          <p style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 500 }}>
                            {q.sentence}
                          </p>
                          {q.sentenceVi && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              ➔ {q.sentenceVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = {
                          textAlign: 'left',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#f8fafc',
                          fontSize: '0.92rem',
                          fontWeight: 500,
                          cursor: isAnswerSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        };

                        if (isAnswerSubmitted) {
                          if (opt === q.correctAnswer) {
                            btnStyle.background = 'rgba(16, 185, 129, 0.2)';
                            btnStyle.borderColor = '#10b981';
                            btnStyle.color = '#6ee7b7';
                          } else if (opt === selectedAnswer && opt !== q.correctAnswer) {
                            btnStyle.background = 'rgba(239, 68, 68, 0.2)';
                            btnStyle.borderColor = '#ef4444';
                            btnStyle.color = '#fca5a5';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            style={btnStyle}
                            onClick={() => handleSelectOption(opt)}
                          >
                            <span>{opt}</span>
                            {isAnswerSubmitted && opt === q.correctAnswer && (
                              <CheckCircle2 size={18} color="#10b981" />
                            )}
                            {isAnswerSubmitted && opt === selectedAnswer && opt !== q.correctAnswer && (
                              <XCircle size={18} color="#ef4444" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Next Button */}
                    {isAnswerSubmitted && (
                      <div
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1, marginRight: '16px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 500 }}>
                            💡 {q.explanation}
                          </span>
                        </div>
                        <button className="btn btn-primary" onClick={handleNextQuestion}>
                          <span>Tiếp theo</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Flashcards Spaced Repetition */}
      {activeTab === 'flashcards' && (
        <div>
          {dueWords.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Tuyệt Vời! Hôm Nay Đã Ôn Hết Từ
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Bạn đã hoàn thành mục tiêu ngày hôm nay. Hãy thêm từ vựng mới hoặc quay lại vào ngày mai!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Thẻ số <strong>{fcIndex + 1}</strong> / {dueWords.length} (Nhấp vào thẻ để lật mặt sau)
              </div>

              {/* 3D Flip Flashcard */}
              <div className="flashcard-perspective">
                <div
                  className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front Face */}
                  <div className="flashcard-face flashcard-front">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-leitner">
                        Hộp {currentFcWord.box || 1}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Nhấp để xem nghĩa
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                        {currentFcWord.word}
                      </h2>
                      {currentFcWord.ipa && (
                        <p style={{ fontSize: '1.15rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                          {currentFcWord.ipa}
                        </p>
                      )}
                      <div style={{ marginTop: '16px' }}>
                        <button
                          className="audio-btn"
                          style={{ width: '42px', height: '42px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            ttsService.speak(currentFcWord.word, { voiceType: speechVoice });
                          }}
                          title="Phát âm"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {currentFcWord.partOfSpeech && (
                        <span>Loại từ: {currentFcWord.partOfSpeech.toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="flashcard-face flashcard-back">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                        {currentFcWord.word}
                      </span>
                      <button
                        className="audio-btn"
                        style={{ width: '28px', height: '28px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          ttsService.speak(currentFcWord.word, { voiceType: speechVoice });
                        }}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>

                    <div style={{ margin: 'auto 0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px' }}>
                        {currentFcWord.meaningVi}
                      </div>
                      {currentFcWord.meaningEn && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '14px' }}>
                          {currentFcWord.meaningEn}
                        </div>
                      )}

                      {/* Examples */}
                      {currentFcWord.examples && currentFcWord.examples.length > 0 && (
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            marginTop: '10px'
                          }}
                        >
                          <p style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                            "{currentFcWord.examples[0].en}"
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            ➔ {currentFcWord.examples[0].vi}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Hãy đánh giá mức độ ghi nhớ ở bên dưới
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  className="btn"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '12px 28px'
                  }}
                  onClick={() => handleFcAnswer(false)}
                >
                  <XCircle size={18} />
                  <span>Chưa Nhớ (Về Hộp 1)</span>
                </button>

                <button
                  className="btn"
                  style={{
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    padding: '12px 28px'
                  }}
                  onClick={() => handleFcAnswer(true)}
                >
                  <CheckCircle2 size={18} />
                  <span>Đã Nhớ Rõ (Lên Hộp Tiếp)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
