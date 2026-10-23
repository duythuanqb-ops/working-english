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
  RotateCcw
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

  // Flashcard modal state
  const [selectedWordIdForFlashcard, setSelectedWordIdForFlashcard] = useState(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    words.forEach((w) => {
      if (w.tags && Array.isArray(w.tags)) {
        w.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [words]);

  // Filtered list
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="Tìm theo từ, nghĩa, từ đồng nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter by Leitner Box */}
          <select
            className="select-field"
            style={{ width: '175px' }}
            value={selectedBox}
            onChange={(e) => setSelectedBox(e.target.value)}
          >
            <option value="all">Tất cả hộp nhớ (1-5)</option>
            <option value="1">Hộp 1 (Mới lưu)</option>
            <option value="2">Hộp 2 (Đang nhớ)</option>
            <option value="3">Hộp 3 (Nhớ khá)</option>
            <option value="4">Hộp 4 (Gần thuộc)</option>
            <option value="5">Hộp 5 (Đã thành thạo)</option>
          </select>

          {/* Filter by Tag */}
          {allTags.length > 0 && (
            <select
              className="select-field"
              style={{ width: '150px' }}
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
          )}
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Hiển thị <strong>{filteredWords.length}</strong> / {words.length} từ
        </div>
      </div>

      {/* Words List Table */}
      {filteredWords.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)'
          }}
        >
          <BookOpen size={44} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
            Không tìm thấy từ vựng phù hợp
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
            Hãy thêm từ vựng mới hoặc thay đổi bộ lọc tìm kiếm của bạn.
          </p>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Sparkles size={16} /> Thêm từ đầu tiên với AI
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="vocab-list-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Từ Vựng & Phát Âm</th>
                <th>Nghĩa Tiếng Việt</th>
                <th style={{ width: '110px' }}>Loại Từ</th>
                <th style={{ width: '150px' }}>Hộp Ghi Nhớ</th>
                <th style={{ width: '180px' }}>Chủ Đề</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((item) => (
                <tr
                  key={item.id}
                  className="vocab-row"
                  onClick={() => handleOpenFlashcard(item.id)}
                  title="Nhấp để mở Flashcard xem chi tiết & lật thẻ"
                >
                  {/* Word, IPA & Audio */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="audio-btn"
                        style={{ width: '28px', height: '28px', minWidth: '28px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          ttsService.speak(item.word, { voiceType: speechVoice });
                        }}
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} />
                      </button>

                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.word}
                        </div>
                        {item.ipa && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--primary)',
                              fontFamily: 'monospace'
                            }}
                          >
                            {item.ipa}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Meaning Vi */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
                      {item.meaningVi}
                    </div>
                    {item.meaningEn && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          maxWidth: '380px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.meaningEn}
                      </div>
                    )}
                  </td>

                  {/* Part of Speech */}
                  <td>
                    {item.partOfSpeech && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: '#f1f5f9',
                          color: 'var(--text-secondary)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {item.partOfSpeech}
                      </span>
                    )}
                  </td>

                  {/* Leitner Box */}
                  <td>
                    <span
                      className={`badge ${item.box === 5 ? 'badge-leitner-5' : 'badge-leitner'}`}
                    >
                      {getBoxName(item.box || 1)}
                    </span>
                  </td>

                  {/* Tags */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.tags && item.tags.length > 0 ? (
                        item.tags.map((t, idx) => (
                          <span key={idx} className="badge badge-tag" style={{ fontSize: '0.68rem' }}>
                            {t}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                      )}
                    </div>
                  </td>

                  {/* Actions: Flashcard & Delete */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenFlashcard(item.id)}
                        title="Mở Flashcard"
                      >
                        <RotateCcw size={12} />
                        <span>Flashcard</span>
                      </button>

                      <button
                        className="btn-icon"
                        onClick={() => onDeleteWord(item.id)}
                        title="Xóa từ này"
                        style={{ padding: '6px' }}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive 3D Flashcard Modal */}
      <WordDetailFlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        wordList={filteredWords}
        initialWordId={selectedWordIdForFlashcard}
        onRecordReview={onRecordReview}
        speechVoice={speechVoice}
      />
    </div>
  );
}
