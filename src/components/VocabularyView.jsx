import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  BookOpen,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import WordDetailFlashcardModal from './WordDetailFlashcardModal';
import CustomSelect from './CustomSelect';

// Single source of truth for Leitner box meta
const BOXES = [
  { box: 1, label: 'Mới lưu', color: '#ef4444' },
  { box: 2, label: 'Đang nhớ', color: '#f59e0b' },
  { box: 3, label: 'Nhớ khá', color: '#0ea5e9' },
  { box: 4, label: 'Gần thuộc', color: '#6366f1' },
  { box: 5, label: 'Thành thạo', color: '#10b981' }
];
const boxMeta = (b = 1) => BOXES.find((x) => x.box === b) || BOXES[0];

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới thêm' },
  { value: 'a-z', label: 'A → Z' },
  { value: 'box-asc', label: 'Cần ôn trước' },
  { value: 'box-desc', label: 'Đã thuộc trước' }
];

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
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [flashcardWordId, setFlashcardWordId] = useState(null);

  const searchInputRef = useRef(null);

  // '/' focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const boxCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    words.forEach((w) => { c[w.box || 1] = (c[w.box || 1] || 0) + 1; });
    return c;
  }, [words]);

  const tagOptions = useMemo(() => {
    const set = new Set();
    words.forEach((w) => (w.tags || []).forEach((t) => set.add(t)));
    return [
      { value: 'all', label: 'Mọi chủ đề' },
      ...Array.from(set).sort().map((t) => ({ value: t, label: t }))
    ];
  }, [words]);

  const visibleWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = words.filter((w) => {
      const matchSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        (w.meaningVi || '').toLowerCase().includes(q) ||
        (w.synonyms || []).some((s) => s.toLowerCase().includes(q));
      const matchBox = selectedBox === 'all' || (w.box || 1) === Number(selectedBox);
      const matchTag = selectedTag === 'all' || (w.tags || []).includes(selectedTag);
      return matchSearch && matchBox && matchTag;
    });

    switch (sortBy) {
      case 'a-z':
        return list.sort((a, b) => a.word.localeCompare(b.word));
      case 'box-asc':
        return list.sort((a, b) => (a.box || 1) - (b.box || 1));
      case 'box-desc':
        return list.sort((a, b) => (b.box || 1) - (a.box || 1));
      default:
        return list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
    }
  }, [words, searchQuery, selectedBox, selectedTag, sortBy]);

  useEffect(() => setCurrentPage(1), [searchQuery, selectedBox, selectedTag, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleWords.length / PAGE_SIZE));
  const pageWords = visibleWords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasFilters = searchQuery.trim() || selectedBox !== 'all' || selectedTag !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBox('all');
    setSelectedTag('all');
  };

  const speak = (e, text) => {
    e.stopPropagation();
    ttsService.speak(text, { voiceType: speechVoice });
  };

  const remove = (e, id) => {
    e.stopPropagation();
    onDeleteWord(id);
  };

  const MasteryBar = ({ box }) => (
    <div className="mastery" title={`Hộp ${box}/5 • ${boxMeta(box).label}`}>
      <span className="mastery-label">{boxMeta(box).label}</span>
      <div className="mastery-bar">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`mastery-seg ${i <= box ? 'on' : ''}`} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Row 1: search + topic + sort + view */}
      <div className="lib-toolbar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="input-field search-input"
            placeholder="Tìm từ, nghĩa hoặc từ đồng nghĩa…   /"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Xóa">
              <X size={14} />
            </button>
          )}
        </div>

        {tagOptions.length > 2 && (
          <CustomSelect
            value={selectedTag}
            onChange={setSelectedTag}
            options={tagOptions}
            style={{ width: '170px' }}
          />
        )}

        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
          icon={ArrowUpDown}
          style={{ width: '170px' }}
        />

        <div className="box-tabs" style={{ padding: '3px' }}>
          <button
            className={`box-tab ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Dạng thẻ"
            style={{ padding: '7px 10px' }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`box-tab ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Dạng danh sách"
            style={{ padding: '7px 10px' }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Row 2: box tabs — the ONLY box filter, counts shown once */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="box-tabs">
          <button
            className={`box-tab ${selectedBox === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedBox('all')}
          >
            Tất cả <span className="box-tab-count">{words.length}</span>
          </button>
          {BOXES.map((b) => (
            <button
              key={b.box}
              className={`box-tab ${selectedBox === String(b.box) ? 'active' : ''}`}
              onClick={() => setSelectedBox(String(b.box))}
              title={`Hộp ${b.box}`}
            >
              <span className="box-tab-dot" style={{ background: b.color }} />
              {b.label}
              <span className="box-tab-count">{boxCounts[b.box]}</span>
            </button>
          ))}
        </div>

        {hasFilters && (
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {visibleWords.length} kết quả ·{' '}
            <button
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, font: 'inherit' }}
            >
              Xóa lọc
            </button>
          </span>
        )}
      </div>

      {/* Content */}
      {visibleWords.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <BookOpen size={32} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {words.length === 0 ? 'Sổ từ vựng còn trống' : 'Không có từ nào khớp'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {words.length === 0 ? 'Thêm từ đầu tiên để bắt đầu học.' : 'Thử từ khóa khác hoặc bỏ bớt bộ lọc.'}
          </p>
          {words.length === 0 ? (
            <button className="btn btn-primary" onClick={onOpenAddModal}>Thêm từ vựng</button>
          ) : (
            <button className="btn btn-secondary" onClick={clearFilters}>
              <RotateCcw size={14} /> Xóa bộ lọc
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="word-grid">
          {pageWords.map((w, i) => {
            const box = w.box || 1;
            return (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                className="word-card"
                style={{ '--accent': boxMeta(box).color, animationDelay: `${i * 25}ms` }}
                onClick={() => setFlashcardWordId(w.id)}
                onKeyDown={(e) => e.key === 'Enter' && setFlashcardWordId(w.id)}
              >
                <div className="word-card-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="word-card-word">{w.word}</div>
                    {w.ipa && <div className="word-card-ipa">{w.ipa}</div>}
                  </div>
                  <div className="word-card-actions">
                    <button className="icon-ghost danger" onClick={(e) => remove(e, w.id)} title="Xóa">
                      <Trash2 size={15} />
                    </button>
                    <button className="icon-ghost" onClick={(e) => speak(e, w.word)} title="Nghe phát âm">
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="word-card-meaning">{w.meaningVi}</p>

                <div className="word-card-foot">
                  <span className="word-card-pos">{w.partOfSpeech || 'term'}</span>
                  <MasteryBar box={box} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="word-list">
          {pageWords.map((w, i) => {
            const box = w.box || 1;
            return (
              <div
                key={w.id}
                className="word-row"
                style={{ '--accent': boxMeta(box).color, animationDelay: `${i * 20}ms` }}
                onClick={() => setFlashcardWordId(w.id)}
              >
                <button className="icon-ghost" onClick={(e) => speak(e, w.word)} title="Nghe phát âm">
                  <Volume2 size={16} />
                </button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{w.word}</div>
                  {w.ipa && <div className="word-card-ipa">{w.ipa}</div>}
                </div>
                <div className="word-row-meaning">{w.meaningVi}</div>
                <MasteryBar box={box} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="icon-ghost danger" onClick={(e) => remove(e, w.id)} title="Xóa">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Minimal pagination — only when needed */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
          <button
            className="icon-ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{ opacity: currentPage === 1 ? 0.35 : 1 }}
            title="Trang trước"
          >
            <ChevronLeft size={18} />
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
            className="icon-ghost"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{ opacity: currentPage === totalPages ? 0.35 : 1 }}
            title="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <WordDetailFlashcardModal
        isOpen={!!flashcardWordId}
        onClose={() => setFlashcardWordId(null)}
        wordId={flashcardWordId}
        words={visibleWords}
        onRecordReview={onRecordReview}
        speechVoice={speechVoice}
      />
    </div>
  );
}
