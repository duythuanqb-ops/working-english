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
  X
} from 'lucide-react';
import { hasRealExamData } from '../data/exams';

export default function ToeicCatalogView({
  catalogTests = [],
  testHistory = {},
  onSelectTest,
  activeTab = 'LR',
  setActiveTab,
  onOpenVocab600
}) {
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEtsGuideModal, setShowEtsGuideModal] = useState(false);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);

  // Filter collections available for the current active tab
  const availableCollections = useMemo(() => {
    const testsForTab = catalogTests.filter((t) => t.category === activeTab);
    const collections = Array.from(new Set(testsForTab.map((t) => t.collection)));
    return ['all', ...collections];
  }, [catalogTests, activeTab]);

  // Filter tests based on category tab, collection filter, and search
  const filteredTests = useMemo(() => {
    return catalogTests.filter((t) => {
      // Category filter (LR vs SW vs completed)
      if (activeTab === 'history') {
        const historyItem = testHistory[t.id];
        if (!historyItem || !historyItem.completed) return false;
      } else if (t.category !== activeTab) {
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
  }, [catalogTests, activeTab, selectedCollection, searchTerm, testHistory]);

  // Count metrics for tabs
  const lrCount = useMemo(() => catalogTests.filter((t) => t.category === 'LR').length, [catalogTests]);
  const swCount = useMemo(() => catalogTests.filter((t) => t.category === 'SW').length, [catalogTests]);
  const historyCount = useMemo(() => {
    return Object.values(testHistory).filter((h) => h && h.completed).length;
  }, [testHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}
            >
              <GraduationCap size={16} style={{ color: '#a5b4fc' }} />
              KHO ĐỀ THI TOEIC QUỐC TẾ • 100% ĐỊNH DẠNG ETS CHUẨN
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Thư Viện Đề Thi TOEIC Quốc Tế (Full LR & SW)
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#c7d2fe', maxWidth: '720px', lineHeight: 1.5 }}>
              Luyện tập với đầy đủ các bộ đề Listening & Reading (120 phút, 200 câu) và Speaking & Writing (80 phút, 19 câu).
              Kho dữ liệu đề thi đa dạng nguồn, lưu trữ ngoại tuyến trực tiếp, bấm giờ từng câu và làm lại không giới hạn.
            </p>
          </div>

          {/* Quick ETS Standard Info Button */}
          <button
            type="button"
            onClick={() => setShowEtsGuideModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease'
            }}
          >
            <Info size={16} style={{ color: '#38bdf8' }} />
            Quy Chuẩn Thời Gian & Số Câu ETS
          </button>
        </div>

        {/* Global Search Box in Hero */}
        <div style={{ marginTop: '22px', position: 'relative', maxWidth: '640px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên đề thi (vd: Test 1, Collection 1, Logistics, HR, IT)..."
            style={{
              width: '100%',
              padding: '12px 18px 12px 46px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 500,
              outline: 'none',
              backdropFilter: 'blur(8px)'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#c7d2fe',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY TABS (LR vs SW vs HISTORY vs VOCAB) */}
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
        <button
          type="button"
          onClick={() => {
            setActiveTab('LR');
            setSelectedCollection('all');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '12px 18px',
            borderRadius: '14px',
            border: 'none',
            background: activeTab === 'LR' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'LR' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'LR' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Headphones size={20} />
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>TOEIC LR (Nghe & Đọc)</div>
              <div style={{ fontSize: '0.74rem', opacity: activeTab === 'LR' ? 0.9 : 0.6 }}>120 phút • 7 Phần • 200 câu</div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'LR' ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
              color: activeTab === 'LR' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            {lrCount} Đề
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('SW');
            setSelectedCollection('all');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '12px 18px',
            borderRadius: '14px',
            border: 'none',
            background: activeTab === 'SW' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'SW' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'SW' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mic size={20} />
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>TOEIC SW (Nói & Viết)</div>
              <div style={{ fontSize: '0.74rem', opacity: activeTab === 'SW' ? 0.9 : 0.6 }}>80 phút • 8 Phần • 19 câu</div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'SW' ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
              color: activeTab === 'SW' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            {swCount} Đề
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            setSelectedCollection('all');
          }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '12px 18px',
            borderRadius: '14px',
            border: 'none',
            background: activeTab === 'history' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--text-main)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'history' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={20} />
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>Đề Đã Làm & Làm Lại</div>
              <div style={{ fontSize: '0.74rem', opacity: activeTab === 'history' ? 0.9 : 0.6 }}>Lịch sử điểm số & Retake</div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'history' ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
              color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            {historyCount} Đã Làm
          </span>
        </button>

        {onOpenVocab600 && (
          <button
            type="button"
            onClick={onOpenVocab600}
            style={{
              padding: '12px 18px',
              borderRadius: '14px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={20} style={{ color: '#4f46e5' }} />
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>600 Từ Vựng</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>10 Chủ đề ETS</div>
            </div>
          </button>
        )}
      </div>

      {/* 3. COLLECTION SUB-FILTER & COUNTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} /> Bộ sưu tập:
          </span>
          {availableCollections.map((col) => {
            const isSelected = selectedCollection === col;
            const label = col === 'all' ? 'Tất cả bộ đề' : col;
            return (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedCollection(col)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '2px solid var(--we-ink)',
                  background: isSelected ? 'var(--we-sun)' : '#ffffff',
                  color: 'var(--we-ink)',
                  boxShadow: isSelected ? 'var(--we-pop-sm)' : 'none',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Hiển thị: <strong style={{ color: 'var(--text-main)' }}>{filteredTests.length}</strong> bộ đề
        </div>
      </div>

      {/* 4. STUDY4-STYLE TEST GRID CARDS */}
      {filteredTests.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Layers size={40} style={{ color: '#94a3b8' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Không tìm thấy bộ đề phù hợp
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
            {activeTab === 'history'
              ? 'Bạn chưa hoàn thành bài thi nào. Hãy chọn một bộ đề trong tab TOEIC LR hoặc TOEIC SW để bắt đầu làm bài!'
              : 'Hãy thử đổi từ khóa tìm kiếm hoặc chọn "Tất cả bộ đề" để xem toàn bộ danh sách.'}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredTests.map((test) => {
            const historyItem = testHistory[test.id];
            const isCompleted = historyItem && historyItem.completed;

            return (
              <div
                key={test.id}
                className="card"
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isCompleted ? '1.5px solid #86efac' : '1px solid var(--border-medium)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                {/* Top Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: test.category === 'LR' ? '#eff6ff' : '#fdf2f8',
                        color: test.category === 'LR' ? '#2563eb' : '#db2777',
                        border: test.category === 'LR' ? '1px solid #bfdbfe' : '1px solid #fbcfe8'
                      }}
                    >
                      {test.category === 'LR' ? '🎧📖 TOEIC LR' : '🗣️✍️ TOEIC SW'}
                    </span>

                    {isCompleted ? (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#15803d',
                          background: '#dcfce7',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={12} /> Đã làm: {historyItem.score ? `${historyItem.score} điểm` : 'Hoàn thành'}
                      </span>
                    ) : hasRealExamData(test.id) ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#047857',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {test.collection?.includes('Parroto') ? '✓ Đề Chuẩn Parroto (200 câu)' : '✓ Đề Gốc ETS (200 câu)'}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#64748b',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        ⏳ Sẵn sàng nạp HTML
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.35,
                      margin: 0
                    }}
                  >
                    {test.title}
                  </h3>

                  {/* Metrics Row: Time | Participants | Comments */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} style={{ color: '#6366f1' }} />
                      {test.durationMinutes} phút
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} style={{ color: '#0ea5e9' }} />
                      {test.participantsCount ? test.participantsCount.toLocaleString() : '50,000+'}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={14} style={{ color: '#f59e0b' }} />
                      {test.commentsCount || 100}
                    </span>
                  </div>

                  {/* Parts & Questions line */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {test.partsCount} phần thi | {test.questionsCount} câu hỏi
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {test.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.72rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  {isCompleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelectTest(test, 'retake')}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                        }}
                      >
                        <RotateCcw size={14} /> Làm Lại Đề Này
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailTest(test)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-medium)',
                          background: '#ffffff',
                          color: 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Chi Tiết
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelectTest(test, 'start')}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(30, 27, 75, 0.25)'
                        }}
                      >
                        Làm Bài <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailTest(test)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-medium)',
                          background: '#ffffff',
                          color: 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Chi Tiết
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: ETS STANDARDS CONFIRMATION GUIDE */}
      {showEtsGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setShowEtsGuideModal(false)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                    Xác Nhận Quy Chuẩn Thời Gian & Số Câu TOEIC ETS
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Cấu hình đồng hồ đếm ngược tổng và tốc độ mục tiêu từng câu hỏi (Per-Question Pace)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEtsGuideModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Table 1: TOEIC LR */}
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Headphones size={18} style={{ color: '#4f46e5' }} /> 1. TOEIC LR (Listening & Reading) • Tổng 120 phút • 200 câu • 10 - 990 điểm
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>Phần thi</th>
                      <th style={{ padding: '10px 14px' }}>Số câu</th>
                      <th style={{ padding: '10px 14px' }}>Tổng thời gian</th>
                      <th style={{ padding: '10px 14px' }}>Thời gian mục tiêu mỗi câu</th>
                      <th style={{ padding: '10px 14px' }}>Đồng hồ đếm ngược từng câu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Part 1: Mô tả tranh</td>
                      <td style={{ padding: '10px 14px' }}>6 câu</td>
                      <td style={{ padding: '10px 14px' }}>~3 - 4 phút</td>
                      <td style={{ padding: '10px 14px' }}>Tô ngay sau khi nghe 4 phương án</td>
                      <td style={{ padding: '10px 14px', color: '#4f46e5', fontWeight: 700 }}>5 giây đệm</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Part 2: Hỏi & Đáp</td>
                      <td style={{ padding: '10px 14px' }}>25 câu</td>
                      <td style={{ padding: '10px 14px' }}>~9 - 10 phút</td>
                      <td style={{ padding: '10px 14px' }}>5 giây giữa 2 câu hỏi</td>
                      <td style={{ padding: '10px 14px', color: '#4f46e5', fontWeight: 700 }}>5 giây đệm</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Part 3: Đoạn hội thoại</td>
                      <td style={{ padding: '10px 14px' }}>39 câu (13 đoạn)</td>
                      <td style={{ padding: '10px 14px' }}>~17 phút</td>
                      <td style={{ padding: '10px 14px' }}>8s / câu + đọc trước đoạn tiếp theo</td>
                      <td style={{ padding: '10px 14px', color: '#4f46e5', fontWeight: 700 }}>8 giây / câu</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Part 4: Bài nói ngắn</td>
                      <td style={{ padding: '10px 14px' }}>30 câu (10 bài)</td>
                      <td style={{ padding: '10px 14px' }}>~15 phút</td>
                      <td style={{ padding: '10px 14px' }}>8s / câu</td>
                      <td style={{ padding: '10px 14px', color: '#4f46e5', fontWeight: 700 }}>8 giây / câu</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#fdf4ff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#86198f' }}>Part 5: Hoàn thành câu</td>
                      <td style={{ padding: '10px 14px' }}>30 câu</td>
                      <td style={{ padding: '10px 14px' }}>Tối đa 15 phút</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Khuyên dùng 20 - 30 giây / câu</td>
                      <td style={{ padding: '10px 14px', color: '#9333ea', fontWeight: 800 }}>30 giây đếm lùi</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#fdf4ff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#86198f' }}>Part 6: Điền đoạn văn</td>
                      <td style={{ padding: '10px 14px' }}>16 câu (4 bài)</td>
                      <td style={{ padding: '10px 14px' }}>Tối đa 8 - 10 phút</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Khuyên dùng 45 - 60 giây / câu</td>
                      <td style={{ padding: '10px 14px', color: '#9333ea', fontWeight: 800 }}>60 giây đếm lùi</td>
                    </tr>
                    <tr style={{ background: '#fdf4ff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#86198f' }}>Part 7: Đọc hiểu văn bản</td>
                      <td style={{ padding: '10px 14px' }}>54 câu</td>
                      <td style={{ padding: '10px 14px' }}>50 - 52 phút</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Khuyên dùng 55 - 60 giây / câu</td>
                      <td style={{ padding: '10px 14px', color: '#9333ea', fontWeight: 800 }}>60 giây đếm lùi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: TOEIC SW */}
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={18} style={{ color: '#db2777' }} /> 2. TOEIC SW (Speaking & Writing) • Tổng ~80 phút • 19 câu • 0 - 400 điểm
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>Phần thi</th>
                      <th style={{ padding: '10px 14px' }}>Số câu</th>
                      <th style={{ padding: '10px 14px' }}>Chuẩn bị</th>
                      <th style={{ padding: '10px 14px' }}>Thời gian làm bài</th>
                      <th style={{ padding: '10px 14px' }}>Đồng hồ đếm ngược từng câu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Speaking Q1 - Q2: Đọc to văn bản</td>
                      <td style={{ padding: '10px 14px' }}>2 câu</td>
                      <td style={{ padding: '10px 14px' }}>45 giây</td>
                      <td style={{ padding: '10px 14px' }}>45 giây đọc</td>
                      <td style={{ padding: '10px 14px', color: '#db2777', fontWeight: 700 }}>45s prep / 45s speak</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Speaking Q3 - Q4: Miêu tả tranh</td>
                      <td style={{ padding: '10px 14px' }}>2 câu</td>
                      <td style={{ padding: '10px 14px' }}>45 giây</td>
                      <td style={{ padding: '10px 14px' }}>30 giây nói</td>
                      <td style={{ padding: '10px 14px', color: '#db2777', fontWeight: 700 }}>45s prep / 30s speak</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Speaking Q5 - Q7: Trả lời câu hỏi</td>
                      <td style={{ padding: '10px 14px' }}>3 câu</td>
                      <td style={{ padding: '10px 14px' }}>3 giây</td>
                      <td style={{ padding: '10px 14px' }}>Q5, Q6: 15s • Q7: 30s</td>
                      <td style={{ padding: '10px 14px', color: '#db2777', fontWeight: 700 }}>15s / 30s speak</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Speaking Q8 - Q10: Dựa trên lịch trình</td>
                      <td style={{ padding: '10px 14px' }}>3 câu</td>
                      <td style={{ padding: '10px 14px' }}>45s đọc tài liệu</td>
                      <td style={{ padding: '10px 14px' }}>Q8, Q9: 15s • Q10: 30s</td>
                      <td style={{ padding: '10px 14px', color: '#db2777', fontWeight: 700 }}>15s / 30s speak</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Speaking Q11: Bày tỏ quan điểm</td>
                      <td style={{ padding: '10px 14px' }}>1 câu</td>
                      <td style={{ padding: '10px 14px' }}>45 giây</td>
                      <td style={{ padding: '10px 14px' }}>60 giây nói</td>
                      <td style={{ padding: '10px 14px', color: '#db2777', fontWeight: 700 }}>45s prep / 60s speak</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#fffbeb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309' }}>Writing Q1 - Q5: Viết câu theo tranh</td>
                      <td style={{ padding: '10px 14px' }}>5 câu</td>
                      <td style={{ padding: '10px 14px' }}>—</td>
                      <td style={{ padding: '10px 14px' }}>8 phút tổng (~90s / câu)</td>
                      <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 800 }}>90s / câu (hoặc 8 phút tổng)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#fffbeb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309' }}>Writing Q6 - Q7: Viết email phản hồi</td>
                      <td style={{ padding: '10px 14px' }}>2 câu</td>
                      <td style={{ padding: '10px 14px' }}>—</td>
                      <td style={{ padding: '10px 14px' }}>10 phút / email (tổng 20p)</td>
                      <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 800 }}>10 phút / email</td>
                    </tr>
                    <tr style={{ background: '#fffbeb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#b45309' }}>Writing Q8: Bài luận quan điểm</td>
                      <td style={{ padding: '10px 14px' }}>1 câu</td>
                      <td style={{ padding: '10px 14px' }}>—</td>
                      <td style={{ padding: '10px 14px' }}>30 phút (tối thiểu 300 từ)</td>
                      <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 800 }}>30 phút đếm lùi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowEtsGuideModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: TEST DETAIL */}
      {selectedDetailTest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedDetailTest(null)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: selectedDetailTest.category === 'LR' ? '#eff6ff' : '#fdf2f8',
                    color: selectedDetailTest.category === 'LR' ? '#2563eb' : '#db2777'
                  }}
                >
                  {selectedDetailTest.category === 'LR' ? 'TOEIC LISTENING & READING' : 'TOEIC SPEAKING & WRITING'}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '8px', marginBottom: '4px' }}>
                  {selectedDetailTest.title}
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedDetailTest.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTest(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Thời gian làm bài:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedDetailTest.durationMinutes} phút</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quy mô bài thi:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedDetailTest.partsCount} phần thi • {selectedDetailTest.questionsCount} câu hỏi</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mục tiêu điểm số:</span>
                <strong style={{ color: '#4f46e5' }}>{selectedDetailTest.targetBand}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Độ khó:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedDetailTest.difficulty}</strong>
              </div>
            </div>

            {testHistory[selectedDetailTest.id] && testHistory[selectedDetailTest.id].completed && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#16a34a' }} />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#15803d' }}>Bạn đã làm bài thi này!</div>
                    <div style={{ fontSize: '0.78rem', color: '#166534' }}>
                      Điểm: {testHistory[selectedDetailTest.id].score || 'Đạt tiêu chuẩn'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const test = selectedDetailTest;
                  setSelectedDetailTest(null);
                  onSelectTest(test, testHistory[test.id] && testHistory[test.id].completed ? 'retake' : 'start');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {testHistory[selectedDetailTest.id] && testHistory[selectedDetailTest.id].completed ? (
                  <>
                    <RotateCcw size={16} /> Làm Lại Bài Thi Này
                  </>
                ) : (
                  <>
                    Bắt Đầu Làm Bài <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
