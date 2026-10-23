import React, { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import WordDetailFlashcardModal from './WordDetailFlashcardModal';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Flashcard modal state
  const [selectedWordIdForFlashcard, setSelectedWordIdForFlashcard] = useState(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

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

  // Filtered words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchSearch =
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Modern Filter Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
          {/* Search Bar */}
          <div className="search-wrapper" style={{ flex: '1 1 240px', maxWidth: '340px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="Tìm theo từ, nghĩa, từ đồng nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Leitner Box Filter */}
          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '160px', height: '40px', padding: '0 12px' }}
            value={selectedBox}
            onChange={(e) => setSelectedBox(e.target.value)}
          >
            <option value="all">Tất cả hộp nhớ (1-5)</option>
            <option value="1">Hộp 1: Mới lưu</option>
            <option value="2">Hộp 2: Đang nhớ</option>
            <option value="3">Hộp 3: Nhớ khá</option>
            <option value="4">Hộp 4: Gần thuộc</option>
            <option value="5">Hộp 5: Thành thạo</option>
          </select>

          {/* Tag Filter */}
          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '150px', height: '40px', padding: '0 12px' }}
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="all">Tất cả chủ đề</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Hiển thị <strong>{filteredWords.length}</strong> / {words.length} từ
          </span>

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
                padding: '5px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
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
                padding: '5px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Xem dạng danh sách bảng biểu"
            >
              <List size={14} />
              <span>Danh Sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Bento Grid or Table */}
      {filteredWords.length === 0 ? (
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
          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ marginTop: '8px' }}>
            <Sparkles size={16} /> Thêm Từ Vựng Ngay
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ==========================================================================
           Bento Cards View (Modern EdTech Standard)
           ========================================================================== */
        <div className="vocab-grid">
          {filteredWords.map((word) => {
            const boxInfo = getBoxInfo(word.box || 1);
            const currentBox = word.box || 1;

            return (
              <div
                key={word.id}
                className="vocab-card"
                onClick={() => handleOpenFlashcard(word.id)}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="vocab-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="vocab-pos-badge">{word.partOfSpeech || 'TERM'}</span>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: boxInfo.color,
                          background: boxInfo.bg,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          border: `1px solid ${boxInfo.color}30`
                        }}
                      >
                        {boxInfo.label}
                      </div>
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
                      word.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge-tag">
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
           Table / List View (Refined & Clean)
           ========================================================================== */
        <div style={{ overflowX: 'auto' }}>
          <table className="vocab-list-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Từ Vựng & Phát Âm</th>
                <th style={{ width: '33%' }}>Nghĩa Tiếng Việt & Ngữ Cảnh</th>
                <th style={{ width: '10%' }}>Loại Từ</th>
                <th style={{ width: '13%' }}>Cấp Ghi Nhớ</th>
                <th style={{ width: '14%' }}>Chủ Đề</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => {
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

                    <td>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: boxInfo.color,
                          background: boxInfo.bg,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          border: `1px solid ${boxInfo.color}30`
                        }}
                      >
                        {boxInfo.label}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {word.tags &&
                          word.tags.map((tag, idx) => (
                            <span key={idx} className="badge-tag">
                              {tag}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
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

      {/* 3D Flashcard Modal */}
      <WordDetailFlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        wordId={selectedWordIdForFlashcard}
        words={filteredWords}
        onRecordReview={onRecordReview}
        speechVoice={speechVoice}
      />
    </div>
  );
}
