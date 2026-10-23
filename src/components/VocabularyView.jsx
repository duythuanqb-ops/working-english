import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  Tag,
  Sparkles,
  BookOpen,
  Filter,
  Eye,
  RotateCcw,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import WordDetailFlashcardModal from './WordDetailFlashcardModal';
import CustomSelect from './CustomSelect';

export default function VocabularyView({
  words,
  onDeleteWord,
  onOpenAddModal,
  onRecordReview,
  speechVoice
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBox, setSelectedBox] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'a-z' | 'z-a' | 'box-asc' | 'box-desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12, 24, 48, or 'all'

  const searchInputRef = useRef(null);

  // Flashcard modal state
  const [selectedWordIdForFlashcard, setSelectedWordIdForFlashcard] = useState(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  // Focus search with '/' shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Leitner Box counts
  const boxStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    words.forEach((w) => {
      const b = w.box || 1;
      if (stats[b] !== undefined) stats[b]++;
    });
    return stats;
  }, [words]);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    words.forEach((w) => {
      if (w.tags && Array.isArray(w.tags)) {
        w.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [words]);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchSearch =
        !searchQuery.trim() ||
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.meaningVi && w.meaningVi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.meaningEn && w.meaningEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.synonyms && w.synonyms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchBox =
        selectedBox === 'all' || (w.box || 1) === parseInt(selectedBox, 10);

      const matchTag =
        selectedTag === 'all' || (w.tags && w.tags.includes(selectedTag));

      return matchSearch && matchBox && matchTag;
    });
  }, [words, searchQuery, selectedBox, selectedTag]);

  // Sort words
  const sortedWords = useMemo(() => {
    const list = [...filteredWords];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
      case 'oldest':
        return list.sort((a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0));
      case 'a-z':
        return list.sort((a, b) => a.word.localeCompare(b.word));
      case 'z-a':
        return list.sort((a, b) => b.word.localeCompare(a.word));
      case 'box-asc':
        return list.sort((a, b) => (a.box || 1) - (b.box || 1));
      case 'box-desc':
        return list.sort((a, b) => (b.box || 1) - (a.box || 1));
      default:
        return list;
    }
  }, [filteredWords, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBox, selectedTag, sortBy, pageSize]);

  // Pagination calculation
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(sortedWords.length / pageSize));
  const paginatedWords = useMemo(() => {
    if (pageSize === 'all') return sortedWords;
    const start = (currentPage - 1) * pageSize;
    return sortedWords.slice(start, start + pageSize);
  }, [sortedWords, currentPage, pageSize]);

  const handleOpenFlashcard = (wordId) => {
    setSelectedWordIdForFlashcard(wordId);
    setIsFlashcardOpen(true);
  };

  const getBoxInfo = (box = 1) => {
    switch (box) {
      case 1:
        return { label: 'Hộp 1 • Mới lưu', color: '#ef4444', bg: '#fef2f2' };
      case 2:
        return { label: 'Hộp 2 • Đang nhớ', color: '#f59e0b', bg: '#fffbeb' };
      case 3:
        return { label: 'Hộp 3 • Nhớ khá', color: '#0284c7', bg: '#f0f9ff' };
      case 4:
        return { label: 'Hộp 4 • Gần thuộc', color: '#6366f1', bg: '#eef2ff' };
      case 5:
        return { label: 'Hộp 5 • Thành thạo', color: '#10b981', bg: '#ecfdf5' };
      default:
        return { label: `Hộp ${box}`, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  // Select dropdown options
  const boxSelectOptions = [
    { value: 'all', label: 'Tất cả hộp nhớ (1-5)', count: words.length },
    { value: '1', label: 'Hộp 1 • Mới lưu', dotColor: '#ef4444', count: boxStats[1] },
    { value: '2', label: 'Hộp 2 • Đang nhớ', dotColor: '#f59e0b', count: boxStats[2] },
    { value: '3', label: 'Hộp 3 • Nhớ khá', dotColor: '#0284c7', count: boxStats[3] },
    { value: '4', label: 'Hộp 4 • Gần thuộc', dotColor: '#6366f1', count: boxStats[4] },
    { value: '5', label: 'Hộp 5 • Thành thạo', dotColor: '#10b981', count: boxStats[5] }
  ];

  const tagSelectOptions = [
    { value: 'all', label: 'Tất cả chủ đề', count: words.length },
    ...allTags.map((tag) => ({
      value: tag,
      label: tag,
      count: words.filter((w) => w.tags && w.tags.includes(tag)).length
    }))
  ];

  const sortSelectOptions = [
    { value: 'newest', label: 'Mới thêm nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'a-z', label: 'Từ A → Z' },
    { value: 'z-a', label: 'Từ Z → A' },
    { value: 'box-asc', label: 'Cần ôn (Hộp 1 → 5)' },
    { value: 'box-desc', label: 'Đã thuộc (Hộp 5 → 1)' }
  ];

  const pageSizeOptions = [
    { value: 12, label: '12 từ / trang' },
    { value: 24, label: '24 từ / trang' },
    { value: 48, label: '48 từ / trang' },
    { value: 'all', label: 'Hiển thị tất cả' }
  ];

  const hasActiveFilters = selectedBox !== 'all' || selectedTag !== 'all' || searchQuery.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* ==========================================================================
          Modern Filter & Search Toolbar (Using CustomSelect)
          ========================================================================== */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          {/* Quick Search */}
          <div className="search-wrapper" style={{ flex: '1 1 220px', maxWidth: '300px' }}>
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="input-field search-input"
              placeholder="Tìm kiếm từ vựng... (Nhấn /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Custom Animated Select for Leitner Box */}
          <CustomSelect
            value={selectedBox}
            onChange={(val) => setSelectedBox(val)}
            options={boxSelectOptions}
            style={{ width: '215px' }}
          />

          {/* Custom Animated Select for Tag/Topic */}
          <CustomSelect
            value={selectedTag}
            onChange={(val) => setSelectedTag(val)}
            options={tagSelectOptions}
            style={{ width: '180px' }}
          />

          {/* Custom Animated Select for Sorting */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={sortSelectOptions}
            icon={ArrowUpDown}
            style={{ width: '175px' }}
          />
        </div>

        {/* View Mode Switcher (Bento Cards vs Compact List) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Xem dạng thẻ Bento Cards hiện đại"
            >
              <LayoutGrid size={14} />
              <span>Thẻ Bento</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Xem dạng danh sách tinh gọn"
            >
              <List size={14} />
              <span>Danh Sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          Quick Filter Chips Bar (1-Click Leitner Filter with Live Counts)
          ========================================================================== */}
      <div className="quick-filter-bar">
        <button
          className={`filter-chip ${selectedBox === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedBox('all')}
        >
          <span>Tất cả</span>
          <span className="filter-chip-count">{words.length}</span>
        </button>

        <button
          className={`filter-chip ${selectedBox === '1' ? 'active' : ''}`}
          onClick={() => setSelectedBox(selectedBox === '1' ? 'all' : '1')}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span>Hộp 1 • Mới lưu</span>
          <span className="filter-chip-count">{boxStats[1]}</span>
        </button>

        <button
          className={`filter-chip ${selectedBox === '2' ? 'active' : ''}`}
          onClick={() => setSelectedBox(selectedBox === '2' ? 'all' : '2')}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span>Hộp 2 • Đang nhớ</span>
          <span className="filter-chip-count">{boxStats[2]}</span>
        </button>

        <button
          className={`filter-chip ${selectedBox === '3' ? 'active' : ''}`}
          onClick={() => setSelectedBox(selectedBox === '3' ? 'all' : '3')}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
          <span>Hộp 3 • Nhớ khá</span>
          <span className="filter-chip-count">{boxStats[3]}</span>
        </button>

        <button
          className={`filter-chip ${selectedBox === '4' ? 'active' : ''}`}
          onClick={() => setSelectedBox(selectedBox === '4' ? 'all' : '4')}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
          <span>Hộp 4 • Gần thuộc</span>
          <span className="filter-chip-count">{boxStats[4]}</span>
        </button>

        <button
          className={`filter-chip ${selectedBox === '5' ? 'active' : ''}`}
          onClick={() => setSelectedBox(selectedBox === '5' ? 'all' : '5')}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Hộp 5 • Thành thạo</span>
          <span className="filter-chip-count">{boxStats[5]}</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedBox('all');
              setSelectedTag('all');
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
              textDecoration: 'underline',
              whiteSpace: 'nowrap'
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results Count & Quick Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {hasActiveFilters ? (
            <>
              Tìm thấy <strong style={{ color: 'var(--primary)' }}>{sortedWords.length}</strong> từ vựng phù hợp
              {words.length !== sortedWords.length && ` (trong tổng số ${words.length} từ)`}
            </>
          ) : (
            <>
              Đang hiển thị <strong>{paginatedWords.length}</strong> / <strong>{words.length}</strong> từ vựng trong sổ tay
            </>
          )}
        </span>

        {/* Page size selector */}
        {sortedWords.length > 12 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mỗi trang:</span>
            <CustomSelect
              value={pageSize}
              onChange={(val) => setPageSize(val)}
              options={pageSizeOptions}
              style={{ width: '145px' }}
            />
          </div>
        )}
      </div>

      {/* ==========================================================================
          Main Content: Bento Grid or Table
          ========================================================================== */}
      {sortedWords.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '2px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            <BookOpen size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Không tìm thấy từ vựng phù hợp
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px' }}>
            Hãy thử tìm bằng từ khóa khác hoặc bấm nút thêm từ mới để bổ sung vào sổ tay công sở của bạn.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedBox('all');
              setSelectedTag('all');
              setSearchQuery('');
            }}
            style={{ marginTop: '8px' }}
          >
            <RotateCcw size={15} /> Xóa Bộ Lọc Tìm Kiếm
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Cards View */
        <div className="vocab-grid">
          {paginatedWords.map((word, idx) => {
            const boxInfo = getBoxInfo(word.box || 1);
            const currentBox = word.box || 1;

            return (
              <div
                key={word.id}
                className="vocab-card"
                style={{ animationDelay: `${idx * 0.03}s` }}
                onClick={() => handleOpenFlashcard(word.id)}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="vocab-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="vocab-pos-badge">{word.partOfSpeech || 'TERM'}</span>
                      <span
                        className="badge-leitner"
                        style={{
                          color: boxInfo.color,
                          background: boxInfo.bg,
                          border: `1px solid ${boxInfo.color}35`
                        }}
                      >
                        <span className="badge-leitner-dot" style={{ backgroundColor: boxInfo.color }} />
                        {boxInfo.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          ttsService.speak(word.word, { voiceType: speechVoice });
                        }}
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWord(word.id);
                        }}
                        title="Xóa từ khỏi sổ tay"
                        style={{ padding: '6px' }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Word & IPA */}
                  <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                    <div className="vocab-word-title">
                      <span>{word.word}</span>
                      {word.ipa && <span className="vocab-ipa">{word.ipa}</span>}
                    </div>
                  </div>

                  {/* Meaning */}
                  <p className="vocab-meaning-vi">{word.meaningVi}</p>
                  {word.meaningEn && <p className="vocab-meaning-en">{word.meaningEn}</p>}

                  {/* Workplace Example Quote */}
                  {word.examples && word.examples[0] && (
                    <div className="vocab-example-box" style={{ marginTop: '12px' }}>
                      <p className="vocab-example-en">"{word.examples[0].en}"</p>
                      {word.examples[0].vi && (
                        <p className="vocab-example-vi">➔ {word.examples[0].vi}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer with Tags and 5-Dot Meter */}
                <div className="vocab-card-footer">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                    {word.tags &&
                      word.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span key={tagIdx} className="badge-tag">
                          {tag}
                        </span>
                      ))}
                  </div>

                  {/* 5-Dot Leitner Visualizer */}
                  <div className="leitner-dots" title={`Cấp độ ghi nhớ: ${currentBox}/5`}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`leitner-dot ${lvl <= currentBox ? 'active' : ''} ${
                          lvl <= currentBox && currentBox === 5 ? 'box-5' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==========================================================================
           Table / List View (High-Density, Guaranteed Non-Wrapping Badges)
           ========================================================================== */
        <div style={{ overflowX: 'auto' }}>
          <table className="vocab-list-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Từ Vựng & Phát Âm</th>
                <th style={{ width: '32%' }}>Nghĩa Tiếng Việt & Ngữ Cảnh</th>
                <th style={{ width: '10%' }}>Loại Từ</th>
                <th className="col-box" style={{ width: '15%' }}>Cấp Ghi Nhớ</th>
                <th style={{ width: '13%' }}>Chủ Đề</th>
                <th className="col-actions" style={{ width: '8%' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWords.map((word) => {
                const boxInfo = getBoxInfo(word.box || 1);
                return (
                  <tr
                    key={word.id}
                    className="vocab-row"
                    onClick={() => handleOpenFlashcard(word.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          className="audio-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            ttsService.speak(word.word, { voiceType: speechVoice });
                          }}
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 size={14} />
                        </button>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                            {word.word}
                          </div>
                          {word.ipa && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                              {word.ipa}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        {word.meaningVi}
                      </div>
                      {word.meaningEn && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          {word.meaningEn}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="vocab-pos-badge">{word.partOfSpeech || 'TERM'}</span>
                    </td>

                    {/* Single-line Leitner Badge (Fixed wrapping bug) */}
                    <td className="col-box">
                      <span
                        className="badge-leitner"
                        style={{
                          color: boxInfo.color,
                          background: boxInfo.bg,
                          border: `1px solid ${boxInfo.color}35`
                        }}
                      >
                        <span className="badge-leitner-dot" style={{ backgroundColor: boxInfo.color }} />
                        {boxInfo.label}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {word.tags &&
                          word.tags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="badge-tag">
                              {tag}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="col-actions">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleOpenFlashcard(word.id)}
                          title="Lật thẻ Flashcard"
                        >
                          <RotateCcw size={13} />
                          <span>Flashcard</span>
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => onDeleteWord(word.id)}
                          title="Xóa từ"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================================================
          Pagination Footer (When Total Pages > 1)
          ========================================================================== */}
      {pageSize !== 'all' && totalPages > 1 && (
        <div className="pagination-container">
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={15} />
              <span>Trước</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-page-pill ${p === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <span>Sau</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3D Flashcard Modal */}
      <WordDetailFlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        wordId={selectedWordIdForFlashcard}
        words={sortedWords}
        onRecordReview={onRecordReview}
        speechVoice={speechVoice}
      />
    </div>
  );
}
