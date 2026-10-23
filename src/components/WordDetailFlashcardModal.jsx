import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { ttsService } from '../services/ttsService';

export default function WordDetailFlashcardModal({
  isOpen,
  onClose,
  wordList = [],
  words = [],
  initialWordId,
  wordId,
  onRecordReview,
  speechVoice
}) {
  const activeList = wordList.length > 0 ? wordList : words;
  const activeWordId = initialWordId || wordId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (activeWordId && activeList.length > 0) {
      const idx = activeList.findIndex((w) => w.id === activeWordId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
    setIsFlipped(false);
  }, [activeWordId, activeList]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, activeList.length]);

  if (!isOpen || activeList.length === 0) return null;

  const currentWord = activeList[currentIndex] || activeList[0];

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeList.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : 0));
  };

  const handleScoreReview = (isCorrect) => {
    if (onRecordReview && currentWord) {
      onRecordReview(currentWord.id, isCorrect);
    }
    handleNext();
  };

  const getBoxName = (box) => {
    switch (box) {
      case 1:
        return 'Hộp 1 (Mới lưu)';
      case 2:
        return 'Hộp 2 (Đang nhớ)';
      case 3:
        return 'Hộp 3 (Nhớ khá)';
      case 4:
        return 'Hộp 4 (Gần thuộc)';
      case 5:
        return 'Hộp 5 (Thành thạo)';
      default:
        return `Hộp ${box}`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', background: 'transparent', border: 'none', boxShadow: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Bar Above Flashcard */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-icon" onClick={handlePrev} title="Từ trước (←)">
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Từ {currentIndex + 1} / {wordList.length}
            </span>
            <button className="btn-icon" onClick={handleNext} title="Từ tiếp theo (→)">
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <RotateCcw size={13} />
              <span>{isFlipped ? 'Xem mặt trước' : 'Lật xem nghĩa (Space)'}</span>
            </button>
            <button className="btn-icon" onClick={onClose} title="Đóng (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3D Flip Flashcard */}
        <div className="flashcard-perspective">
          <div
            className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* FRONT FACE */}
            <div className="flashcard-face flashcard-front">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${currentWord.box === 5 ? 'badge-leitner-5' : 'badge-leitner'}`}>
                  {getBoxName(currentWord.box || 1)}
                </span>
                {currentWord.partOfSpeech && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: '#f1f5f9',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {currentWord.partOfSpeech}
                  </span>
                )}
              </div>

              {/* Word & Pronunciation */}
              <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                <h2
                  style={{
                    fontSize: '2.8rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {currentWord.word}
                </h2>

                {currentWord.ipa && (
                  <p
                    style={{
                      fontSize: '1.2rem',
                      color: 'var(--primary)',
                      fontFamily: 'monospace',
                      fontWeight: 500
                    }}
                  >
                    {currentWord.ipa}
                  </p>
                )}

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="audio-btn"
                    style={{ width: '48px', height: '48px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      ttsService.speak(currentWord.word, { voiceType: speechVoice });
                    }}
                    title="Phát âm từ vựng"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px'
                }}
              >
                Nhấp vào thẻ hoặc nhấn phím <strong>Space</strong> để lật xem giải nghĩa & ví dụ
              </div>
            </div>

            {/* BACK FACE */}
            <div
              className="flashcard-face flashcard-back"
              style={{ overflowY: 'auto', maxHeight: '480px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {currentWord.word}
                  </h3>
                  {currentWord.ipa && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {currentWord.ipa}
                    </span>
                  )}
                </div>

                <button
                  className="audio-btn"
                  style={{ width: '32px', height: '32px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    ttsService.speak(currentWord.word, { voiceType: speechVoice });
                  }}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Meanings */}
              <div style={{ margin: '14px 0' }}>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '4px'
                  }}
                >
                  {currentWord.meaningVi}
                </div>
                {currentWord.meaningEn && (
                  <div
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginBottom: '12px'
                    }}
                  >
                    {currentWord.meaningEn}
                  </div>
                )}

                {/* Practical Workplace Examples */}
                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Ví dụ thực tế trong công việc:
                    </span>
                    {currentWord.examples.map((ex, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            "{ex.en}"
                          </p>
                          <button
                            className="audio-btn"
                            style={{ width: '24px', height: '24px', minWidth: '24px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              ttsService.speak(ex.en, { voiceType: speechVoice });
                            }}
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                        {ex.vi && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            ➔ {ex.vi}
                          </p>
                        )}
                        {ex.context && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.68rem',
                              color: 'var(--primary)',
                              background: '#eef2ff',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              marginTop: '4px'
                            }}
                          >
                            {ex.context}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Synonyms & Collocations */}
                {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Đồng nghĩa:
                    </span>
                    {currentWord.synonyms.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          background: '#faf5ff',
                          color: '#7e22ce',
                          border: '1px solid #e9d5ff',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessment Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  marginTop: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '8px 12px',
                    fontSize: '0.82rem'
                  }}
                  onClick={() => handleScoreReview(false)}
                >
                  <XCircle size={15} />
                  <span>Chưa thuộc (Hạ hộp)</span>
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    padding: '8px 12px',
                    fontSize: '0.82rem'
                  }}
                  onClick={() => handleScoreReview(true)}
                >
                  <CheckCircle2 size={15} />
                  <span>Đã nhớ (Lên hộp)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
