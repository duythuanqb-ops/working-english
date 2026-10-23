import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ttsService } from '../services/ttsService';

export default function VocabularyView({
  words,
  onDeleteWord,
  onOpenAddModal,
  speechVoice
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBox, setSelectedBox] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [expandedCardId, setExpandedCardId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)'
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
            style={{ width: '170px' }}
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

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Hiển thị <strong>{filteredWords.length}</strong> / {words.length} từ
        </div>
      </div>

      {/* Words Grid / List */}
      {filteredWords.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredWords.map((item) => {
            const isExpanded = expandedCardId === item.id;
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* Header: Word + IPA + Audio + Delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                        {item.word}
                      </h3>
                      <button
                        className="audio-btn"
                        onClick={() => ttsService.speak(item.word, { voiceType: speechVoice })}
                        title="Nghe phát âm"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {item.ipa && (
                        <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                          {item.ipa}
                        </span>
                      )}
                      {item.partOfSpeech && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-secondary)',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      className={`badge ${item.box === 5 ? 'badge-leitner-5' : 'badge-leitner'}`}
                      title="Hộp ghi nhớ ngắt quãng (Leitner Box)"
                    >
                      {getBoxName(item.box || 1)}
                    </span>
                    <button
                      className="btn-icon"
                      onClick={() => onDeleteWord(item.id)}
                      title="Xóa từ này"
                      style={{ padding: '6px' }}
                    >
                      <Trash2 size={14} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                {/* Meanings */}
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>
                    {item.meaningVi}
                  </div>
                  {item.meaningEn && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.meaningEn}
                    </div>
                  )}
                </div>

                {/* Synonyms preview */}
                {item.synonyms && item.synonyms.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Đồng nghĩa:
                    </span>
                    {item.synonyms.slice(0, 4).map((syn, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(168, 85, 247, 0.12)',
                          color: '#d8b4fe',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}

                {/* Collocations preview */}
                {item.collocations && item.collocations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Collocations:
                    </span>
                    {item.collocations.slice(0, 3).map((col, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(6, 182, 212, 0.1)',
                          color: '#67e8f9',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                )}

                {/* Toggle details / Examples */}
                {item.examples && item.examples.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={14} /> Thu gọn ví dụ ({item.examples.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Xem ví dụ thực tế ({item.examples.length})
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            style={{
                              background: 'rgba(15, 23, 42, 0.7)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-md)',
                              padding: '10px 12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <p style={{ fontSize: '0.84rem', color: '#f1f5f9', fontWeight: 500, flex: 1 }}>
                                "{ex.en}"
                              </p>
                              <button
                                className="audio-btn"
                                style={{ width: '24px', height: '24px', minWidth: '24px' }}
                                onClick={() => ttsService.speak(ex.en, { voiceType: speechVoice })}
                                title="Nghe câu này"
                              >
                                <Volume2 size={12} />
                              </button>
                            </div>
                            {ex.vi && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                ➔ {ex.vi}
                              </p>
                            )}
                            {ex.context && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.65rem',
                                  color: '#38bdf8',
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  marginTop: '6px'
                                }}
                              >
                                {ex.context}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tags bottom */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="badge badge-tag">
                        <Tag size={10} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
