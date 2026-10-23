import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  BookOpen,
  LayoutGrid,
  List,
  Kanban,
  X,
  ArrowUpDown,
  RotateCcw,
  Eye,
  EyeOff,
  Shuffle,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Check,
  Tag
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import WordDetailFlashcardModal from './WordDetailFlashcardModal';
import CustomSelect from './CustomSelect';

// Single source of truth for Leitner box meta
const BOXES = [
  { box: 1, label: 'Mới lưu', interval: '1 ngày', color: '#ef4444' },
  { box: 2, label: 'Đang nhớ', interval: '3 ngày', color: '#f59e0b' },
  { box: 3, label: 'Nhớ khá', interval: '7 ngày', color: '#0ea5e9' },
  { box: 4, label: 'Gần thuộc', interval: '14 ngày', color: '#6366f1' },
  { box: 5, label: 'Thành thạo', interval: '30 ngày', color: '#10b981' }
];

const boxMeta = (b = 1) => BOXES.find((x) => x.box === b) || BOXES[0];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới thêm' },
  { value: 'a-z', label: 'A → Z' },
  { value: 'box-asc', label: 'Cần ôn trước (Hộp 1 → 5)' },
  { value: 'box-desc', label: 'Đã thuộc trước (Hộp 5 → 1)' }
];

// Helper to determine POS badge class
const getPosClass = (pos) => {
  if (!pos) return 'pos-term';
  const p = pos.toLowerCase();
  if (p.includes('noun') || p === 'n') return 'pos-noun';
  if (p.includes('verb') || p === 'v') return 'pos-verb';
  if (p.includes('adj') || p === 'a') return 'pos-adj';
  if (p.includes('adv')) return 'pos-adv';
  return 'pos-term';
};

export default function VocabularyView({
  words,
  onDeleteWord,
  onOpenAddModal,
  onRecordReview,
  speechVoice = 'US',
  onStartReview
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBox, setSelectedBox] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'kanban' | 'list'
  
  // Learning Optimization Modes:
  // 'none' (normal) | 'hide-meaning' (active recall) | 'hide-word' (reverse recall)
  const [recallMode, setRecallMode] = useState('none');
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [shuffledSeed, setShuffledSeed] = useState(0);
  
  const [flashcardWordId, setFlashcardWordId] = useState(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' focuses search
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

  // Compute box counts & learning statistics
  const stats = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    words.forEach((w) => {
      c[w.box || 1] = (c[w.box || 1] || 0) + 1;
    });
    const dueCount = c[1] + c[2];
    const learningCount = c[3] + c[4];
    const masteredCount = c[5];
    const total = words.length;
    const masteryPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    return { counts: c, dueCount, learningCount, masteredCount, total, masteryPct };
  }, [words]);

  // Topic filter options
  const tagOptions = useMemo(() => {
    const set = new Set();
    words.forEach((w) => (w.tags || []).forEach((t) => set.add(t)));
    return [
      { value: 'all', label: 'Mọi chủ đề' },
      ...Array.from(set).sort().map((t) => ({ value: t, label: t }))
    ];
  }, [words]);

  // Filtered & sorted words (NO PAGINATION - Instant full catalog access)
  const visibleWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = words.filter((w) => {
      const matchSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        (w.meaningVi || '').toLowerCase().includes(q) ||
        (w.ipa || '').toLowerCase().includes(q) ||
        (w.synonyms || []).some((s) => s.toLowerCase().includes(q)) ||
        (w.examples || []).some(
          (ex) =>
            (ex.en && ex.en.toLowerCase().includes(q)) ||
            (ex.vi && ex.vi.toLowerCase().includes(q))
        );
      const matchBox = selectedBox === 'all' || (w.box || 1) === Number(selectedBox);
      const matchTag = selectedTag === 'all' || (w.tags || []).includes(selectedTag);
      return matchSearch && matchBox && matchTag;
    });

    if (shuffledSeed > 0) {
      let seed = shuffledSeed;
      list = [...list].sort(() => Math.sin(seed++) - 0.5);
    } else {
      switch (sortBy) {
        case 'a-z':
          list.sort((a, b) => a.word.localeCompare(b.word));
          break;
        case 'box-asc':
          list.sort((a, b) => (a.box || 1) - (b.box || 1));
          break;
        case 'box-desc':
          list.sort((a, b) => (b.box || 1) - (a.box || 1));
          break;
        default:
          list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
          break;
      }
    }

    return list;
  }, [words, searchQuery, selectedBox, selectedTag, sortBy, shuffledSeed]);

  // Reset revealed cards when recall mode changes
  useEffect(() => {
    setRevealedIds(new Set());
  }, [recallMode]);

  const toggleReveal = (id, e) => {
    if (e) e.stopPropagation();
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShuffle = () => {
    setShuffledSeed(Date.now());
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBox('all');
    setSelectedTag('all');
    setShuffledSeed(0);
  };

  const speak = (e, text) => {
    e.stopPropagation();
    ttsService.speak(text, { voiceType: speechVoice });
  };

  const remove = (e, id) => {
    e.stopPropagation();
    onDeleteWord(id);
  };

  const quickBump = (e, wordId, isCorrect) => {
    e.stopPropagation();
    if (onRecordReview) {
      onRecordReview(wordId, isCorrect);
    }
  };

  const hasFilters = searchQuery.trim() || selectedBox !== 'all' || selectedTag !== 'all' || shuffledSeed > 0;

  // Mastery Bar Component
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 1. Motivational Learning Hero Dashboard */}
      <div className="vocab-hero-banner">
        <div className="vocab-hero-stats">
          <div className="vocab-stat-pill">
            <div className="vocab-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div className="vocab-stat-val">{stats.total}</div>
              <div className="vocab-stat-title">Tổng từ vựng</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

          <div className="vocab-stat-pill">
            <div className="vocab-stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Zap size={20} />
            </div>
            <div>
              <div className="vocab-stat-val" style={{ color: '#dc2626' }}>{stats.dueCount}</div>
              <div className="vocab-stat-title">Cần ôn luyện</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

          <div className="vocab-stat-pill">
            <div className="vocab-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Award size={20} />
            </div>
            <div>
              <div className="vocab-stat-val" style={{ color: '#059669' }}>{stats.masteredCount}</div>
              <div className="vocab-stat-title">Đã thành thạo</div>
            </div>
          </div>
        </div>

        {/* Action Button: Quick Review session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onStartReview && (
            <button
              className="btn btn-primary"
              onClick={onStartReview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Zap size={16} fill="currentColor" />
              Ôn Tập Ngay ({stats.dueCount})
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onOpenAddModal}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              fontWeight: 600
            }}
          >
            + Thêm Từ Mới
          </button>
        </div>
      </div>

      {/* 2. Control Toolbar: Search + Self-Test Active Recall Mode + View Switcher */}
      <div className="lib-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Instant Search input */}
        <div className="search-wrapper" style={{ flex: '1 1 240px' }}>
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="input-field search-input"
            placeholder="Tìm theo từ, nghĩa, IPA hoặc ví dụ…  nhấn /"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Xóa tìm kiếm">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Active Recall Mode Toggle (Tối ưu cho việc học - Luyện Trí Nhớ) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '3px',
            gap: '2px'
          }}
          title="Chế độ Tự Kiểm Tra (Active Recall) giúp giảm tải chữ và tăng hiệu quả ghi nhớ não bộ"
        >
          <button
            onClick={() => setRecallMode('none')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: recallMode === 'none' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: recallMode === 'none' ? '#f1f5f9' : 'transparent',
              color: recallMode === 'none' ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Hiện đầy đủ
          </button>

          <button
            onClick={() => setRecallMode(recallMode === 'hide-meaning' ? 'none' : 'hide-meaning')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: recallMode === 'hide-meaning' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: recallMode === 'hide-meaning' ? '#eef2ff' : 'transparent',
              color: recallMode === 'hide-meaning' ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            {recallMode === 'hide-meaning' ? <EyeOff size={14} /> : <Eye size={14} />}
            Ẩn nghĩa (Tự test)
          </button>

          <button
            onClick={() => setRecallMode(recallMode === 'hide-word' ? 'none' : 'hide-word')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: recallMode === 'hide-word' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              background: recallMode === 'hide-word' ? '#fef3c7' : 'transparent',
              color: recallMode === 'hide-word' ? '#b45309' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Ẩn từ tiếng Anh
          </button>
        </div>

        {/* Shuffle Button (Prevents sequence bias) */}
        <button
          onClick={handleShuffle}
          className="btn btn-secondary"
          style={{
            padding: '7px 12px',
            fontSize: '0.84rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Xáo trộn ngẫu nhiên thứ tự từ vựng để thử thách não bộ"
        >
          <Shuffle size={14} />
          Xáo trộn
        </button>

        {/* Topic filter */}
        {tagOptions.length > 2 && (
          <CustomSelect
            value={selectedTag}
            onChange={setSelectedTag}
            options={tagOptions}
            style={{ width: '150px' }}
          />
        )}

        {/* Sort option */}
        <CustomSelect
          value={sortBy}
          onChange={(val) => {
            setSortBy(val);
            setShuffledSeed(0);
          }}
          options={SORT_OPTIONS}
          icon={ArrowUpDown}
          style={{ width: '160px' }}
        />

        {/* View mode switcher: Cards / Leitner Kanban / Compact List */}
        <div className="box-tabs" style={{ padding: '3px' }}>
          <button
            className={`box-tab ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Dạng thẻ học thông minh"
            style={{ padding: '7px 10px' }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`box-tab ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Dạng bảng hộp trí nhớ (Pipeline)"
            style={{ padding: '7px 10px' }}
          >
            <Kanban size={15} />
          </button>
          <button
            className={`box-tab ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Dạng danh sách thu gọn"
            style={{ padding: '7px 10px' }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* 3. Leitner Box Tabs Filter (Single Source of Box Filters with Counts) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="box-tabs" style={{ overflowX: 'auto', maxWidth: '100%' }}>
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
              title={`Hộp ${b.box} • Ôn mỗi ${b.interval}`}
            >
              <span className="box-tab-dot" style={{ background: b.color }} />
              {b.label}
              <span className="box-tab-count">{stats.counts[b.box]}</span>
            </button>
          ))}
        </div>

        {/* Results summary & Clear Filter Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>
            Hiển thị <strong>{visibleWords.length}</strong> / {words.length} từ vựng
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0 4px',
                font: 'inherit'
              }}
            >
              · Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. Active Recall Mode Instructional Hint */}
      {recallMode !== 'none' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: recallMode === 'hide-meaning' ? '#eef2ff' : '#fef3c7',
            border: `1px solid ${recallMode === 'hide-meaning' ? '#c7d2fe' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '0.85rem',
            color: recallMode === 'hide-meaning' ? '#3730a3' : '#92400e',
            animation: 'cardEntrance 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <span>
              {recallMode === 'hide-meaning'
                ? 'Đang bật chế độ Ẩn nghĩa tiếng Việt: Nhìn từ tiếng Anh, tự kiểm tra trong đầu rồi rê chuột hoặc chạm vào thẻ để mở nghĩa.'
                : 'Đang bật chế độ Ẩn từ tiếng Anh: Nhìn nghĩa tiếng Việt, thử nhớ lại từ tiếng Anh tương ứng rồi rê chuột để mở từ.'}
            </span>
          </div>
          <button
            onClick={() => setRecallMode('none')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Tắt
          </button>
        </div>
      )}

      {/* 5. Main Content: Empty State OR 3 Learning Views (No Pagination Friction) */}
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
            gap: '12px'
          }}
        >
          <BookOpen size={36} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {words.length === 0 ? 'Sổ từ vựng của bạn còn trống' : 'Không tìm thấy từ vựng nào phù hợp'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px' }}>
            {words.length === 0
              ? 'Hãy tra cứu từ mới ở mục Từ Điển hoặc nhấn nút bên dưới để thêm từ vựng công sở đầu tiên.'
              : 'Thử tìm với từ khóa khác, hoặc bấm "Xóa bộ lọc" để xem toàn bộ danh mục từ vựng.'}
          </p>
          {words.length === 0 ? (
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              + Thêm từ vựng đầu tiên
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={clearFilters}>
              <RotateCcw size={14} /> Xóa bộ lọc
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        
        /* MODE A: Smart Learning Cards Grid */
        <div className="word-grid">
          {visibleWords.map((w, i) => {
            const box = w.box || 1;
            const isRevealed = revealedIds.has(w.id);
            const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;
            const isWordHidden = recallMode === 'hide-word' && !isRevealed;
            const primaryExample = (w.examples && w.examples[0]) || null;
            const primaryTag = (w.tags && w.tags[0]) || null;

            return (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                className="word-card"
                style={{
                  '--accent': boxMeta(box).color,
                  animationDelay: `${Math.min(i * 15, 300)}ms`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onClick={() => setFlashcardWordId(w.id)}
                onKeyDown={(e) => e.key === 'Enter' && setFlashcardWordId(w.id)}
              >
                {/* Card Top: Word, IPA, POS badge, Tag & Actions */}
                <div className="word-card-top">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`pos-badge ${getPosClass(w.partOfSpeech)}`}>
                        {w.partOfSpeech || 'term'}
                      </span>
                      {primaryTag && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontWeight: 600
                          }}
                        >
                          {primaryTag}
                        </span>
                      )}
                    </div>

                    {/* Word with Active Recall Blur if enabled */}
                    <div
                      className={`word-card-word ${isWordHidden ? 'smart-recall-blur' : ''}`}
                      style={{ marginTop: '6px' }}
                      onClick={(e) => isWordHidden && toggleReveal(w.id, e)}
                    >
                      {w.word}
                    </div>

                    {/* IPA phonetic */}
                    {w.ipa && <div className="word-card-ipa">{w.ipa}</div>}
                  </div>

                  {/* Actions: Speak & Delete */}
                  <div className="word-card-actions">
                    <button
                      className="icon-ghost"
                      onClick={(e) => speak(e, w.word)}
                      title={`Phát âm (${speechVoice})`}
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      className="icon-ghost danger"
                      onClick={(e) => remove(e, w.id)}
                      title="Xóa khỏi sổ tay"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card Middle: Meaning with Active Recall Blur */}
                <div
                  style={{
                    position: 'relative',
                    cursor: isMeaningHidden ? 'pointer' : 'default'
                  }}
                  onClick={(e) => isMeaningHidden && toggleReveal(w.id, e)}
                >
                  <p
                    className={`word-card-meaning ${isMeaningHidden ? 'smart-recall-blur' : ''}`}
                    style={{ margin: 0 }}
                  >
                    {w.meaningVi}
                  </p>

                  {isMeaningHidden && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="recall-hint-badge">
                        <Eye size={12} /> Chạm mở nghĩa
                      </span>
                    </div>
                  )}
                </div>

                {/* Context Real-World Example Quote */}
                {primaryExample && (
                  <div className="word-card-example-box">
                    <div className="word-card-example-en">
                      "{primaryExample.en}"
                    </div>
                    {primaryExample.vi && !isMeaningHidden && (
                      <div className="word-card-example-vi">
                        → {primaryExample.vi}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Foot: Mastery Bar & Quick Review Bumps */}
                <div className="word-card-foot" style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <MasteryBar box={box} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="quick-leitner-btn success"
                      onClick={(e) => quickBump(e, w.id, true)}
                      title="Ghi nhận đã thuộc (+1 Hộp)"
                    >
                      <Check size={12} /> Thuộc
                    </button>
                    <button
                      className="quick-leitner-btn"
                      onClick={(e) => quickBump(e, w.id, false)}
                      title="Cần ôn lại (Chuyển về Hộp 1)"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'kanban' ? (

        /* MODE B: Leitner Kanban Pipeline (5 Columns by Memory Stage) */
        <div className="kanban-board">
          {BOXES.map((b) => {
            const colWords = visibleWords.filter((w) => (w.box || 1) === b.box);
            return (
              <div key={b.box} className="kanban-col" style={{ '--col-accent': b.color }}>
                <div className="kanban-col-head">
                  <div className="kanban-col-title">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: b.color }} />
                    {b.label}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {colWords.length}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    padding: '0 4px 6px',
                    borderBottom: '1px dashed #e2e8f0'
                  }}
                >
                  Chu kỳ ôn: <strong>{b.interval}</strong>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                  {colWords.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 12px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontStyle: 'italic'
                      }}
                    >
                      Không có từ nào
                    </div>
                  ) : (
                    colWords.map((w) => {
                      const isRevealed = revealedIds.has(w.id);
                      const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;

                      return (
                        <div
                          key={w.id}
                          className="kanban-card"
                          onClick={() => setFlashcardWordId(w.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                                {w.word}
                              </div>
                              {w.ipa && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                  {w.ipa}
                                </div>
                              )}
                            </div>
                            <button
                              className="icon-ghost"
                              style={{ width: '24px', height: '24px' }}
                              onClick={(e) => speak(e, w.word)}
                              title="Nghe"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>

                          <div
                            style={{
                              fontSize: '0.84rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.35,
                              position: 'relative'
                            }}
                            onClick={(e) => isMeaningHidden && toggleReveal(w.id, e)}
                          >
                            <span className={isMeaningHidden ? 'smart-recall-blur' : ''}>
                              {w.meaningVi}
                            </span>
                            {isMeaningHidden && (
                              <span
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  color: 'var(--primary)',
                                  fontWeight: 700
                                }}
                              >
                                Chạm mở
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                            <span className={`pos-badge ${getPosClass(w.partOfSpeech)}`}>
                              {w.partOfSpeech || 'term'}
                            </span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {b.box < 5 && (
                                <button
                                  className="quick-leitner-btn success"
                                  style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                  onClick={(e) => quickBump(e, w.id, true)}
                                  title="Chuyển lên hộp tiếp theo"
                                >
                                  +1 Hộp
                                </button>
                              )}
                              {b.box > 1 && (
                                <button
                                  className="quick-leitner-btn"
                                  style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                  onClick={(e) => quickBump(e, w.id, false)}
                                  title="Chuyển về Hộp 1"
                                >
                                  ↺
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* MODE C: Compact Learning List */
        <div className="word-list">
          {visibleWords.map((w, i) => {
            const box = w.box || 1;
            const isRevealed = revealedIds.has(w.id);
            const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;

            return (
              <div
                key={w.id}
                className="word-row"
                style={{
                  '--accent': boxMeta(box).color,
                  animationDelay: `${Math.min(i * 12, 250)}ms`
                }}
                onClick={() => setFlashcardWordId(w.id)}
              >
                <button
                  className="icon-ghost"
                  onClick={(e) => speak(e, w.word)}
                  title="Nghe phát âm"
                >
                  <Volume2 size={16} />
                </button>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.98rem' }}>
                      {w.word}
                    </span>
                    <span className={`pos-badge ${getPosClass(w.partOfSpeech)}`} style={{ padding: '1px 5px', fontSize: '0.62rem' }}>
                      {w.partOfSpeech || 'term'}
                    </span>
                  </div>
                  {w.ipa && <div className="word-card-ipa">{w.ipa}</div>}
                </div>

                <div
                  className="word-row-meaning"
                  style={{ position: 'relative' }}
                  onClick={(e) => isMeaningHidden && toggleReveal(w.id, e)}
                >
                  <span className={isMeaningHidden ? 'smart-recall-blur' : ''}>
                    {w.meaningVi}
                  </span>
                  {isMeaningHidden && (
                    <span className="recall-hint-badge" style={{ marginLeft: '8px' }}>
                      <Eye size={11} /> Ẩn nghĩa
                    </span>
                  )}
                </div>

                <MasteryBar box={box} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                  <button
                    className="icon-ghost danger"
                    onClick={(e) => remove(e, w.id)}
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Detail Flashcard Modal */}
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
