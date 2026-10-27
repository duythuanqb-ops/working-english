import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  Trophy,
  Clock,
  RotateCcw,
  CheckCircle2,
  Users,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Info,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import { IELTS_CATALOG_TESTS, IELTS_BAND_SCORE_TABLE, IELTS_CRITERIA_INFO } from '../data/ieltsData';
import { hasIeltsExam } from '../data/exams';

export default function IeltsCatalogView({
  testHistory = {},
  onSelectTest,
  activeTab = 'all',
  setActiveTab
}) {
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBandGuideModal, setShowBandGuideModal] = useState(false);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);

  // Available collections for current tab
  const availableCollections = useMemo(() => {
    let tests = IELTS_CATALOG_TESTS;
    if (activeTab === 'academic') {
      tests = tests.filter((t) => t.category === 'academic');
    } else if (activeTab === 'general') {
      tests = tests.filter((t) => t.category === 'general');
    }
    const cols = Array.from(new Set(tests.map((t) => t.collection)));
    return ['all', ...cols];
  }, [activeTab]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return IELTS_CATALOG_TESTS.filter((t) => {
      // Category tab filter
      if (activeTab === 'history') {
        const hist = testHistory[t.id];
        if (!hist || !hist.completed) return false;
      } else if (activeTab === 'academic' && t.category !== 'academic') {
        return false;
      } else if (activeTab === 'general' && t.category !== 'general') {
        return false;
      }

      // Collection filter
      if (selectedCollection !== 'all' && t.collection !== selectedCollection) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(term);
        const matchSubtitle = t.subtitle.toLowerCase().includes(term);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(term));
        if (!matchTitle && !matchSubtitle && !matchTags) return false;
      }

      return true;
    });
  }, [activeTab, selectedCollection, searchTerm, testHistory]);

  const acCount = useMemo(() => IELTS_CATALOG_TESTS.filter((t) => t.category === 'academic').length, []);
  const gtCount = useMemo(() => IELTS_CATALOG_TESTS.filter((t) => t.category === 'general').length, []);
  const historyCount = useMemo(() => {
    return Object.values(testHistory).filter((h) => h && h.completed).length;
  }, [testHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. HERO HEADER */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0369a1 100%)',
          borderRadius: '24px',
          padding: '28px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(3, 105, 161, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: '#38bdf8',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}
              >
                INTERNATIONAL ENGLISH LANGUAGE TESTING SYSTEM
              </span>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#bae6fd',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                BAND 6.5 - 9.0 TARGET
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '6px 0 10px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Luyện Thi IELTS Academic & General Training
            </h1>

            <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '640px', lineHeight: 1.5 }}>
              Hệ thống đề thi IELTS bản gốc từ STUDY4 • Đầy đủ 4 kỹ năng Listening (Audio phòng thu), Reading (Học thuật & Đời sống), Writing (Bài mẫu Band 8.5) & Speaking (Giọng đọc bản xứ không chồng chéo).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBandGuideModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <Info size={16} />
            Thang Điểm & Tiêu Chí Chấm
          </button>
        </div>

        {/* Quick Highlights Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '12px', color: '#38bdf8' }}>
              <Headphones size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>40 Bài Nghe</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Audio phòng thu bản xứ</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '10px', borderRadius: '12px', color: '#34d399' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>AC & GT Reading</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Khoa học & Công sở thực tế</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(244, 114, 182, 0.2)', padding: '10px', borderRadius: '12px', color: '#f472b6' }}>
              <PenTool size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Writing Task 1 & 2</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bài mẫu chuẩn Band 8.5</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '10px', borderRadius: '12px', color: '#fbbf24' }}>
              <Mic size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Speaking 3 Parts</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Đồng hồ bấm giờ & Cue Card</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Main Category Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '14px',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setSelectedCollection('all'); }}
              style={{
                border: 'none',
                background: activeTab === 'all' ? '#ffffff' : 'transparent',
                color: activeTab === 'all' ? '#0f172a' : '#64748b',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === 'all' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Tất cả đề ({IELTS_CATALOG_TESTS.length})
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('academic'); setSelectedCollection('all'); }}
              style={{
                border: 'none',
                background: activeTab === 'academic' ? '#ffffff' : 'transparent',
                color: activeTab === 'academic' ? '#0369a1' : '#64748b',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === 'academic' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={16} />
              IELTS Academic ({acCount})
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('general'); setSelectedCollection('all'); }}
              style={{
                border: 'none',
                background: activeTab === 'general' ? '#ffffff' : 'transparent',
                color: activeTab === 'general' ? '#047857' : '#64748b',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === 'general' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Award size={16} />
              IELTS General ({gtCount})
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); setSelectedCollection('all'); }}
              style={{
                border: 'none',
                background: activeTab === 'history' ? '#ffffff' : 'transparent',
                color: activeTab === 'history' ? '#4338ca' : '#64748b',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === 'history' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} />
              Lịch sử ({historyCount})
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi IELTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Collection Pills Filter */}
        {availableCollections.length > 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} />
              Bộ đề:
            </span>
            {availableCollections.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedCollection(col)}
                style={{
                  border: '2px solid var(--we-ink)',
                  background: selectedCollection === col ? 'var(--we-sun)' : '#ffffff',
                  color: 'var(--we-ink)',
                  padding: '5px 14px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: selectedCollection === col ? 'var(--we-pop-sm)' : 'none',
                  transform: selectedCollection === col ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {col === 'all' ? 'Tất cả Collection' : col}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. TEST CARDS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredTests.map((test) => {
          const isAC = test.category === 'academic';
          const isReady = hasIeltsExam(test.id);
          const historyItem = testHistory[test.id];
          const isCompleted = historyItem?.completed;

          return (
            <div
              key={test.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
                borderRadius: '20px',
                background: '#ffffff',
                border: isCompleted
                  ? '2px solid #10b981'
                  : '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                {/* Header Tag Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isAC ? '#e0f2fe' : '#dcfce7',
                        color: isAC ? '#0369a1' : '#15803d',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {isAC ? 'IELTS ACADEMIC' : 'GENERAL TRAINING'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569'
                      }}
                    >
                      {test.collection}
                    </span>
                  </div>

                  {isReady ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} />
                      {test.skill === 'listening' ? 'Chuyên Sâu Listening' : (test.skill === 'reading' ? 'Chuyên Sâu Reading' : 'Đầy đủ 4 Kỹ Năng')}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      Sẵn sàng
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.35,
                    margin: '0 0 6px 0'
                  }}
                >
                  {test.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    margin: '0 0 14px 0',
                    lineHeight: 1.45
                  }}
                >
                  {test.subtitle}
                </p>

                {/* Metrics Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.78rem',
                    color: '#64748b',
                    marginBottom: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} style={{ color: '#0284c7' }} />
                    {test.durationMinutes} phút
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={14} style={{ color: '#10b981' }} />
                    {test.questionsCount} câu hỏi
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trophy size={14} style={{ color: '#f59e0b' }} />
                    {test.targetBand}
                  </span>
                </div>

                {/* Skill Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    🎧 40 câu Listening
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    📖 40 câu Reading
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    ✍️ Task 1 & 2
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    🎙️ Speaking 3 Parts
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDetailTest(test)}
                  style={{
                    flex: '1',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    padding: '9px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Chi tiết đề
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTest(test)}
                  style={{
                    flex: '2',
                    background: isAC
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isAC ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  Bắt đầu làm bài
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. DETAIL MODAL */}
      {selectedDetailTest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDetailTest(null)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 20px 48px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailTest(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
                {selectedDetailTest.category === 'academic' ? 'IELTS ACADEMIC' : 'IELTS GENERAL TRAINING'}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                {selectedDetailTest.collection}
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0' }}>
              {selectedDetailTest.title}
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              {selectedDetailTest.subtitle}
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Cấu trúc bài thi tiêu chuẩn IDP / British Council:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.7 }}>
                <li><strong>Listening (40 phút - 4 phần):</strong> Nghe 4 đoạn hội thoại & độc thoại, trả lời 40 câu hỏi.</li>
                <li><strong>Reading (60 phút - 3 bài đọc):</strong> 40 câu hỏi trắc nghiệm, True/False/Not Given, điền từ.</li>
                <li><strong>Writing (60 phút - 2 bài viết):</strong> Task 1 (150 từ, 20 phút) + Task 2 (250 từ, 40 phút).</li>
                <li><strong>Speaking (11 - 14 phút - 3 phần):</strong> Giới thiệu, Thuyết trình theo Cue Card, Thảo luận mở rộng.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailTest(null)}
                style={{
                  flex: '1',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = selectedDetailTest;
                  setSelectedDetailTest(null);
                  onSelectTest(t);
                }}
                style={{
                  flex: '2',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Bắt đầu làm bài thi ngay
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. BAND SCORE & CRITERIA MODAL */}
      {showBandGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowBandGuideModal(false)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 20px 48px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowBandGuideModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0369a1' }}>
              <Info size={20} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Thang Điểm IELTS & Bảng Quy Đổi Band Điểm
              </h2>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Bảng quy đổi số câu đúng (trên 40 câu) sang thang điểm 1.0 - 9.0 của Cambridge ESOL & IDP.
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Số câu đúng / 40</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>IELTS Listening</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>IELTS Reading (Academic)</th>
                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>IELTS Reading (General)</th>
                  </tr>
                </thead>
                <tbody>
                  {IELTS_BAND_SCORE_TABLE.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {row.minRaw === row.maxRaw ? row.minRaw : `${row.minRaw} - ${row.maxRaw}`}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0284c7' }}>Band {row.bandListening.toFixed(1)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#4338ca' }}>Band {row.bandReadingAc.toFixed(1)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#059669' }}>Band {row.bandReadingGt.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  ✍️ 4 Tiêu chí IELTS Writing:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                  <li>Task Achievement / Task Response (25%)</li>
                  <li>Coherence and Cohesion (25%)</li>
                  <li>Lexical Resource (25%)</li>
                  <li>Grammatical Range and Accuracy (25%)</li>
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  🎙️ 4 Tiêu chí IELTS Speaking:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                  <li>Fluency and Coherence (25%)</li>
                  <li>Lexical Resource (25%)</li>
                  <li>Grammatical Range and Accuracy (25%)</li>
                  <li>Pronunciation (25%)</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBandGuideModal(false)}
              style={{
                width: '100%',
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
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
