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
  Tag,
  Stethoscope,
  Repeat,
  GraduationCap,
  FolderPlus,
  Plus,
  Folder,
  ArrowLeft,
  Edit2,
  Layers,
  CheckSquare,
  Square,
  MoreVertical
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { storageService } from '../services/storageService';
import WordDetailFlashcardModal from './WordDetailFlashcardModal';
import CustomSelect from './CustomSelect';
import DeckModal from './DeckModal';

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
  onDeleteWords,
  onClearAllWords,
  onRestoreStarterWords,
  onOpenAddModal,
  onRecordReview,
  speechVoice = 'US',
  onStartReview,
  onLookupDictionary,
  onTryInDoctor,
  onViewSynonyms,
  onOpenIn4Skills
}) {
  // 2 Parts: 'decks' (Phần 1: Bộ từ vựng) vs 'words' (Phần 2: Tất cả từ vựng đã thêm)
  const [activeTab, setActiveTab] = useState('decks');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [customDecks, setCustomDecks] = useState(() => storageService.getCustomDecks());
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);

  // Sync customDecks on deck or word changes
  useEffect(() => {
    const handleSync = () => {
      setCustomDecks(storageService.getCustomDecks());
    };
    window.addEventListener('we-decks-updated', handleSync);
    window.addEventListener('we-words-updated', handleSync);
    return () => {
      window.removeEventListener('we-decks-updated', handleSync);
      window.removeEventListener('we-words-updated', handleSync);
    };
  }, []);

  const handleCreateDeck = () => {
    setEditingDeck(null);
    setIsDeckModalOpen(true);
  };

  const handleEditDeck = (deck, e) => {
    if (e) e.stopPropagation();
    setEditingDeck(deck);
    setIsDeckModalOpen(true);
  };

  const handleDeleteDeck = (deck, e) => {
    if (e) e.stopPropagation();
    const dWords = words.filter(
      (w) => (w.deck || (w.tags && w.tags[0]) || '').toLowerCase() === deck.name.toLowerCase()
    );
    const confirmMsg = dWords.length > 0
      ? `Bộ từ "${deck.name}" đang có ${dWords.length} từ vựng. Bạn có chắc muốn xóa bộ từ này? (Các từ vựng vẫn được lưu trong kho từ chung).`
      : `Bạn có chắc muốn xóa bộ từ "${deck.name}"?`;
    if (confirm(confirmMsg)) {
      storageService.deleteCustomDeck(deck.id);
      setCustomDecks(storageService.getCustomDecks());
      if (selectedDeck && selectedDeck.id === deck.id) {
        setSelectedDeck(null);
      }
    }
  };

  const handleSaveDeck = (deckData) => {
    if (editingDeck) {
      const updated = storageService.updateCustomDeck(editingDeck.id, deckData);
      setCustomDecks(storageService.getCustomDecks());
      if (selectedDeck && selectedDeck.id === editingDeck.id) {
        setSelectedDeck((prev) => ({ ...prev, ...updated }));
      }
    } else {
      const created = storageService.addCustomDeck(deckData);
      setCustomDecks(storageService.getCustomDecks());
      if (created) {
        setSelectedDeck(created);
      }
    }
    setEditingDeck(null);
    setIsDeckModalOpen(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBox, setSelectedBox] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'kanban' | 'list'
  
  // Multi-select batch deletion state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Learning Optimization Modes:
  // 'none' (normal) | 'hide-meaning' (active recall) | 'hide-word' (reverse recall)
  const [recallMode, setRecallMode] = useState('none');
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [shuffledSeed, setShuffledSeed] = useState(0);
  
  const [flashcardWordId, setFlashcardWordId] = useState(null);
  const searchInputRef = useRef(null);

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  // Topic & Deck filter options
  const tagOptions = useMemo(() => {
    const set = new Set();
    customDecks.forEach((d) => d.name && set.add(d.name));
    words.forEach((w) => {
      if (w.deck) set.add(w.deck);
      (w.tags || []).forEach((t) => set.add(t));
    });
    return [
      { value: 'all', label: 'Mọi bộ từ & chủ đề' },
      ...Array.from(set).sort().map((t) => ({ value: t, label: `Bộ: ${t}` }))
    ];
  }, [words, customDecks]);

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
      const matchTag =
        selectedTag === 'all' ||
        (w.deck && w.deck.toLowerCase() === selectedTag.toLowerCase()) ||
        (w.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase());
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

  // Progressive DOM rendering (pagination) to keep memory low and scrolling ultra-fast
  const [displayLimit, setDisplayLimit] = useState(36);

  useEffect(() => {
    setDisplayLimit(36);
  }, [searchQuery, selectedBox, selectedTag, sortBy, shuffledSeed, viewMode]);

  const displayedWords = useMemo(() => {
    return visibleWords.slice(0, displayLimit);
  }, [visibleWords, displayLimit]);

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

  const selectedDeckWords = useMemo(() => {
    if (!selectedDeck) return [];
    return words.filter(
      (w) => (w.deck || (w.tags && w.tags[0]) || '').toLowerCase() === selectedDeck.name.toLowerCase()
    );
  }, [words, selectedDeck]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* MASTER TOP SWITCHER: Phần 1: Bộ từ vựng VS Phần 2: Tất cả từ vựng đã thêm */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '2px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            background: 'var(--we-surf-muted, #f1f5f9)',
            borderRadius: '16px',
            border: '2px solid var(--border-subtle, #e2e8f0)',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('decks');
              setSelectedDeck(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'decks' ? '#ffffff' : 'transparent',
              color: activeTab === 'decks' ? 'var(--we-indigo, #4F46E5)' : 'var(--text-muted, #64748b)',
              boxShadow: activeTab === 'decks' ? '0 3px 10px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <FolderPlus size={18} />
            <span>Phần 1: Bộ từ vựng</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '10px',
                background: activeTab === 'decks' ? '#eef2ff' : '#e2e8f0',
                color: activeTab === 'decks' ? '#4f46e5' : '#64748b',
                fontWeight: 800
              }}
            >
              {customDecks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('words')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'words' ? '#ffffff' : 'transparent',
              color: activeTab === 'words' ? 'var(--we-indigo, #4F46E5)' : 'var(--text-muted, #64748b)',
              boxShadow: activeTab === 'words' ? '0 3px 10px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={18} />
            <span>Phần 2: Tất cả từ vựng đã thêm</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '10px',
                background: activeTab === 'words' ? '#eef2ff' : '#e2e8f0',
                color: activeTab === 'words' ? '#4f46e5' : '#64748b',
                fontWeight: 800
              }}
            >
              {words.length}
            </span>
          </button>
        </div>

        {/* Quick Action Buttons: + Tạo Bộ Từ Mới & + Thêm Từ Vựng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCreateDeck}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              border: '2px solid #cbd5e1'
            }}
            title="Tạo bộ từ vựng mới theo chủ đề"
          >
            <FolderPlus size={16} />
            <span>+ Tạo Bộ Từ Mới</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenAddModal && onOpenAddModal(selectedDeck?.name || '')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
            title="Thêm từ vựng mới vào sổ tay"
          >
            <Plus size={16} />
            <span>+ Thêm Từ Vựng</span>
          </button>
        </div>
      </div>

      {activeTab === 'decks' ? (
        /* PHẦN 1: BỘ TỪ VỰNG */
        selectedDeck ? (
          /* DRILLDOWN: Xem chi tiết các từ trong 1 bộ từ cụ thể */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Back Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedDeck(null)}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}
              >
                <ArrowLeft size={16} />
                <span>Quay lại tất cả bộ từ</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => handleEditDeck(selectedDeck, e)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', fontWeight: 600 }}
                  title="Chỉnh sửa tên hoặc mô tả của bộ từ"
                >
                  <Edit2 size={15} />
                  <span>Sửa bộ từ</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => handleDeleteDeck(selectedDeck, e)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '12px', fontWeight: 600, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                  title="Xóa bộ từ này"
                >
                  <Trash2 size={15} />
                  <span>Xóa bộ</span>
                </button>
              </div>
            </div>

            {/* Deck Detail Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '2.5px solid var(--we-ink, #1E1B4B)',
                borderRadius: '20px',
                boxShadow: '0 4px 0 var(--we-ink, #1E1B4B)',
                padding: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: selectedDeck.color || '#4F46E5',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #1E1B4B',
                    boxShadow: '0 3px 0 #1E1B4B',
                    flexShrink: 0
                  }}
                >
                  <Folder size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      {selectedDeck.name}
                    </h2>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: '#eef2ff',
                        color: '#4f46e5',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: '1px solid #c7d2fe'
                      }}
                    >
                      {selectedDeckWords.length} từ vựng
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {selectedDeck.desc || `Bộ từ vựng gom theo chủ đề ${selectedDeck.name}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {onOpenIn4Skills && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      if (selectedDeckWords.length === 0) {
                        if (onOpenAddModal) onOpenAddModal(selectedDeck.name);
                        return;
                      }
                      onOpenIn4Skills({
                        area: 'vocabulary',
                        view: 'dash',
                        page: 'flashcard',
                        sessionSel: { cards: [`custom:${selectedDeck.name}`] }
                      });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      color: '#ffffff',
                      border: '2px solid #1E1B4B',
                      boxShadow: '0 4px 0 #1E1B4B',
                      cursor: 'pointer'
                    }}
                    title="Luyện bộ từ này với 8 chế độ đỉnh cao: Lật thẻ, Quiz, Listening, Điền từ, Đặt câu, Card Blast, Gõ từ, Tổng hợp"
                  >
                    <Sparkles size={16} fill="#F8BE33" color="#1E1B4B" />
                    <span>Học Bộ Này (8 Chế Độ)</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenAddModal && onOpenAddModal(selectedDeck.name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontWeight: 700
                  }}
                >
                  <Plus size={16} />
                  <span>+ Thêm Từ Vào Bộ</span>
                </button>
              </div>
            </div>

            {/* Word Grid in this deck */}
            {selectedDeckWords.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={28} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Bộ từ "{selectedDeck.name}" chưa có từ vựng nào
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
                  Bạn có thể nhấn nút bên dưới để thêm các từ mới vào bộ từ này.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenAddModal && onOpenAddModal(selectedDeck.name)}
                  style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '12px', fontWeight: 700 }}
                >
                  <Plus size={16} />
                  <span>+ Thêm Từ Vựng Đầu Tiên Vào Bộ Này</span>
                </button>
              </div>
            ) : (
              <div className="word-grid">
                {selectedDeckWords.map((w, i) => {
                  const box = w.box || 1;
                  const isRevealed = revealedIds.has(w.id);
                  const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;
                  const isWordHidden = recallMode === 'hide-word' && !isRevealed;
                  const primaryExample = (w.examples && w.examples[0]) || null;

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
                    >
                      <div className="word-card-top">
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`pos-badge ${getPosClass(w.partOfSpeech)}`}>
                              {w.partOfSpeech || 'term'}
                            </span>
                          </div>
                          <div
                            className={`word-card-word ${isWordHidden ? 'smart-recall-blur' : ''}`}
                            style={{ marginTop: '6px' }}
                            onClick={(e) => isWordHidden && toggleReveal(w.id, e)}
                          >
                            {w.word}
                          </div>
                          {w.ipa && <div className="word-card-ipa">{w.ipa}</div>}
                        </div>

                        <div className="word-card-actions" onClick={(e) => e.stopPropagation()}>
                          {onLookupDictionary && (
                            <button
                              type="button"
                              className="icon-ghost"
                              onClick={() => onLookupDictionary(w.word)}
                              title="Tra từ điển chi tiết"
                              style={{ color: '#2563eb' }}
                            >
                              <Search size={15} />
                            </button>
                          )}
                          {onTryInDoctor && (
                            <button
                              type="button"
                              className="icon-ghost"
                              onClick={() => onTryInDoctor(w.examples?.[0]?.en || w.word)}
                              title="Gửi câu vào Bác sĩ ngữ pháp"
                              style={{ color: '#059669' }}
                            >
                              <Stethoscope size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="icon-ghost danger"
                            onClick={(e) => remove(e, w.id)}
                            title="Xóa từ khỏi sổ tay"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div
                        className={`word-card-meaning ${isMeaningHidden ? 'smart-recall-blur' : ''}`}
                        onClick={(e) => isMeaningHidden && toggleReveal(w.id, e)}
                      >
                        {w.meaningVi}
                      </div>

                      {primaryExample && primaryExample.en && (
                        <div className="word-card-example" style={{ marginTop: 'auto' }}>
                          <div className="word-card-example-en">"{primaryExample.en}"</div>
                          {primaryExample.vi && <div className="word-card-example-vi">{primaryExample.vi}</div>}
                        </div>
                      )}

                      <div className="word-card-footer" onClick={(e) => e.stopPropagation()}>
                        <MasteryBar box={box} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="icon-ghost"
                            onClick={(e) => speak(e, w.word)}
                            title="Nghe phát âm"
                          >
                            <Volume2 size={16} />
                          </button>
                          <div className="leitner-bump-group">
                            {box < 5 && (
                              <button
                                type="button"
                                className="quick-leitner-btn success"
                                onClick={(e) => quickBump(e, w.id, true)}
                                title="Nhớ tốt (+1 Hộp)"
                              >
                                +1 Hộp
                              </button>
                            )}
                            {box > 1 && (
                              <button
                                type="button"
                                className="quick-leitner-btn"
                                onClick={(e) => quickBump(e, w.id, false)}
                                title="Quên (Về Hộp 1)"
                              >
                                ↺
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* OVERVIEW: Danh sách tất cả các bộ từ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Banner giới thiệu Phần 1 */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                border: '2px solid #c7d2fe',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderPlus size={22} color="#4F46E5" />
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#1E1B4B' }}>
                    Bộ Từ Vựng Của Bạn
                  </h2>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#475569', maxWidth: '640px', lineHeight: 1.5 }}>
                  Tạo và quản lý các bộ từ vựng theo mục tiêu, dự án hoặc phòng ban. Nhấn <strong>"Học 8 Chế Độ"</strong> trên bất kỳ bộ từ nào để bước vào phòng luyện tập 4 kỹ năng chuyên sâu (Lật thẻ, Quiz, Listening, Điền từ, Đặt câu, Card Blast...).
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateDeck}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                }}
              >
                <FolderPlus size={17} />
                <span>+ Tạo Bộ Từ Mới</span>
              </button>
            </div>

            {/* Grid of Decks */}
            {customDecks.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '2.5px dashed var(--we-ink, #1E1B4B)',
                  boxShadow: '0 4px 0 var(--we-ink, #1E1B4B)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #1E1B4B',
                    boxShadow: '0 3px 0 #1E1B4B'
                  }}
                >
                  <FolderPlus size={26} />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  Bạn chưa có bộ từ vựng nào
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
                  Hãy tạo bộ từ theo chủ đề công việc, chuyên ngành hoặc kỳ thi để gom nhóm và luyện tập 8 chế độ hiệu quả!
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateDeck}
                  style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}
                >
                  <FolderPlus size={16} />
                  <span>+ Tạo Bộ Từ Đầu Tiên</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {/* Custom Decks */}
                {customDecks.map((d) => {
                const dWords = words.filter(
                  (w) => (w.deck || (w.tags && w.tags[0]) || '').toLowerCase() === d.name.toLowerCase()
                );
                const dDue = dWords.filter((w) => (w.box || 1) <= 2).length;
                const dMastered = dWords.filter((w) => (w.box || 1) === 5).length;
                const previewWords = dWords.slice(0, 4);

                return (
                  <div
                    key={d.id || d.name}
                    className="card-hover-scale"
                    style={{
                      background: '#ffffff',
                      border: '2.5px solid var(--we-ink, #1E1B4B)',
                      borderRadius: '20px',
                      boxShadow: '0 4px 0 var(--we-ink, #1E1B4B)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            background: d.color || '#4F46E5',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #1E1B4B',
                            boxShadow: '0 3px 0 #1E1B4B',
                            flexShrink: 0
                          }}
                        >
                          <Folder size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.12rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {d.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {dWords.length} từ vựng đã lưu
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          className="icon-ghost"
                          onClick={(e) => handleEditDeck(d, e)}
                          title="Sửa tên / mô tả bộ từ"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-ghost danger"
                          onClick={(e) => handleDeleteDeck(d, e)}
                          title="Xóa bộ từ này"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '38px' }}>
                      {d.desc || `Bộ từ vựng thuộc chủ đề ${d.name}`}
                    </p>

                    {/* Word preview chips */}
                    {previewWords.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {previewWords.map((pw) => (
                          <span
                            key={pw.id}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              fontWeight: 600
                            }}
                          >
                            {pw.word}
                          </span>
                        ))}
                        {dWords.length > 4 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            +{dWords.length - 4} từ nữa
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Chưa có từ nào trong bộ này
                      </div>
                    )}

                    {/* Stats pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', fontWeight: 700 }}>
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5' }}>
                        {dWords.length} từ
                      </span>
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626' }}>
                        {dDue} cần ôn
                      </span>
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
                        {dMastered} đã thuộc
                      </span>
                    </div>

                    {/* Card Action Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      {onOpenIn4Skills && (
                        <button
                          type="button"
                          className="btn"
                          onClick={() => {
                            if (dWords.length === 0) {
                              if (onOpenAddModal) onOpenAddModal(d.name);
                              return;
                            }
                            onOpenIn4Skills({
                              area: 'vocabulary',
                              view: 'dash',
                              page: 'flashcard',
                              sessionSel: { cards: [`custom:${d.name}`] }
                            });
                          }}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '9px 10px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            color: '#ffffff',
                            border: '2px solid #1E1B4B',
                            boxShadow: '0 3px 0 #1E1B4B',
                            cursor: 'pointer'
                          }}
                          title="Luyện bộ từ này với 8 chế độ học"
                        >
                          <Sparkles size={14} fill="#F8BE33" color="#1E1B4B" />
                          <span>Học 8 Chế Độ</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onOpenAddModal && onOpenAddModal(d.name)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                        title="Thêm từ mới vào bộ này"
                      >
                        + Thêm Từ
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setSelectedDeck(d)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                        title="Xem danh sách từ trong bộ này"
                      >
                        Xem ({dWords.length})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )
      ) : (
        /* PHẦN 2: TẤT CẢ TỪ VỰNG ĐÃ THÊM */
        <React.Fragment>
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

        {/* Action Buttons: 8 Modes Study + Quick Review + Add Word */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {onOpenIn4Skills && (
            <button
              className="btn"
              onClick={() => {
                if (words.length === 0) {
                  if (onOpenAddModal) onOpenAddModal();
                  return;
                }
                const sessionSel = selectedTag !== 'all' ? { cards: [`custom:${selectedTag}`] } : { cards: ['custom'] };
                onOpenIn4Skills({
                  area: 'vocabulary',
                  view: 'dash',
                  page: 'flashcard',
                  sessionSel
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#ffffff',
                border: '2px solid #1E1B4B',
                boxShadow: '0 4px 0 #1E1B4B',
                cursor: 'pointer'
              }}
              title="Luyện bộ từ này với 8 chế độ đỉnh cao: Lật thẻ, Quiz, Listening, Điền từ, Đặt câu, Card Blast, Gõ từ, Tổng hợp"
            >
              <Sparkles size={16} fill="#F8BE33" color="#1E1B4B" />
              <span>{selectedTag !== 'all' ? `Học Bộ "${selectedTag}" (8 Chế Độ)` : `Học 8 Chế Độ (4 Kỹ Năng)`}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActiveTab('decks')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '12px',
              fontWeight: 600
            }}
            title="Quay lại Phần 1: Các bộ từ vựng"
          >
            <FolderPlus size={16} />
            <span>Phần 1: Bộ Từ Vựng</span>
          </button>

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
              Ôn Tập Leitner ({stats.dueCount})
            </button>
          )}

          {words.length > 0 && (
            <button
              className={`btn ${isSelecting ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setIsSelecting(!isSelecting);
                setSelectedIds(new Set());
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Chọn nhiều từ để xóa hàng loạt"
            >
              <CheckCircle2 size={16} />
              <span>{isSelecting ? 'Hủy Chọn' : 'Chọn Nhiều'}</span>
            </button>
          )}

          {onClearAllWords && words.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={onClearAllWords}
              style={{
                padding: '9px 14px',
                borderRadius: '12px',
                fontWeight: 600,
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Xóa toàn bộ từ vựng trong sổ tay"
            >
              <Trash2 size={16} />
              <span>Xóa Hết ({words.length})</span>
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

      {/* Floating/Inline Selection Toolbar when Selecting */}
      {isSelecting && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '12px 20px',
            background: 'var(--we-indigo-soft, #EEF2FF)',
            border: '2.5px solid var(--we-ink, #1E1B4B)',
            borderRadius: '16px',
            boxShadow: '0 4px 0 var(--we-ink, #1E1B4B)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1E1B4B' }}>
              Đã chọn {selectedIds.size} / {visibleWords.length} từ
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.8rem', background: '#fff' }}
              onClick={() => {
                if (selectedIds.size === visibleWords.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(visibleWords.map((w) => w.id)));
                }
              }}
            >
              {selectedIds.size === visibleWords.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedIds.size > 0 && onDeleteWords && (
              <button
                className="btn btn-primary"
                style={{
                  background: '#ef4444',
                  borderColor: '#b91c1c',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  onDeleteWords(Array.from(selectedIds));
                  setSelectedIds(new Set());
                  setIsSelecting(false);
                }}
              >
                <Trash2 size={15} /> Xóa {selectedIds.size} từ đã chọn
              </button>
            )}
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#fff' }}
              onClick={() => {
                setIsSelecting(false);
                setSelectedIds(new Set());
              }}
            >
              Đóng chế độ chọn
            </button>
          </div>
        </div>
      )}

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
            border: '2px solid var(--we-ink)',
            borderRadius: '14px',
            padding: '3px',
            gap: '3px',
            boxShadow: 'var(--we-pop-sm)'
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
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: recallMode === 'none' ? '2px solid var(--we-ink)' : '2px solid transparent',
              cursor: 'pointer',
              background: recallMode === 'none' ? 'var(--we-sun)' : 'transparent',
              color: 'var(--we-ink)',
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
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: recallMode === 'hide-meaning' ? '2px solid var(--we-ink)' : '2px solid transparent',
              cursor: 'pointer',
              background: recallMode === 'hide-meaning' ? 'var(--we-indigo-soft)' : 'transparent',
              color: 'var(--we-ink)',
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
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: recallMode === 'hide-word' ? '2px solid var(--we-ink)' : '2px solid transparent',
              cursor: 'pointer',
              background: recallMode === 'hide-word' ? 'var(--we-coral-soft)' : 'transparent',
              color: 'var(--we-ink)',
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={onOpenAddModal}>
                + Thêm từ vựng đầu tiên
              </button>
              {onRestoreStarterWords && (
                <button className="btn btn-secondary" onClick={onRestoreStarterWords}>
                  <RotateCcw size={14} /> Khôi phục từ công sở mẫu
                </button>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={clearFilters}>
              <RotateCcw size={14} /> Xóa bộ lọc
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        
        /* MODE A: Smart Learning Cards Grid */
        <div>
          <div className="word-grid">
            {displayedWords.map((w, i) => {
            const box = w.box || 1;
            const isRevealed = revealedIds.has(w.id);
            const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;
            const isWordHidden = recallMode === 'hide-word' && !isRevealed;
            const primaryExample = (w.examples && w.examples[0]) || null;
            const primaryTag = w.deck || (w.tags && w.tags[0]) || null;

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
                  gap: '12px',
                  outline: isSelecting && selectedIds.has(w.id) ? '3px solid #4F46E5' : 'none'
                }}
                onClick={(e) => (isSelecting ? toggleSelect(w.id, e) : setFlashcardWordId(w.id))}
                onKeyDown={(e) => e.key === 'Enter' && (isSelecting ? toggleSelect(w.id) : setFlashcardWordId(w.id))}
              >
                {/* Card Top: Word, IPA, POS badge, Tag & Actions */}
                <div className="word-card-top">
                  {isSelecting && (
                    <span
                      onClick={(e) => toggleSelect(w.id, e)}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: '2px solid #1E1B4B',
                        background: selectedIds.has(w.id) ? '#4F46E5' : '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                        marginRight: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedIds.has(w.id) && <Check size={14} strokeWidth={3} />}
                    </span>
                  )}
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

                  {/* Actions: Speak, Cross-screen links & Delete */}
                  <div className="word-card-actions" onClick={(e) => e.stopPropagation()}>
                    {onLookupDictionary && (
                      <button
                        className="icon-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLookupDictionary(w.word);
                        }}
                        title="Tra từ điển chi tiết"
                        style={{ color: '#2563eb' }}
                      >
                        <Search size={15} />
                      </button>
                    )}
                    {onTryInDoctor && (
                      <button
                        className="icon-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          const sentence = w.examples?.[0]?.en || `We need to implement ${w.word} in our workflow.`;
                          onTryInDoctor(sentence);
                        }}
                        title="Gửi câu vào Bác sĩ ngữ pháp"
                        style={{ color: '#059669' }}
                      >
                        <Stethoscope size={15} />
                      </button>
                    )}
                    {onViewSynonyms && (
                      <button
                        className="icon-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewSynonyms(w.word);
                        }}
                        title="Xem từ đồng nghĩa"
                        style={{ color: '#7e22ce' }}
                      >
                        <Repeat size={15} />
                      </button>
                    )}
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
          {displayLimit < visibleWords.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDisplayLimit((prev) => prev + 36)}
                style={{
                  padding: '10px 24px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                Xem thêm ({visibleWords.length - displayLimit} từ còn lại)
              </button>
            </div>
          )}
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
        <div>
          <div className="word-list">
            {displayedWords.map((w, i) => {
              const box = w.box || 1;
              const isRevealed = revealedIds.has(w.id);
              const isMeaningHidden = recallMode === 'hide-meaning' && !isRevealed;
              const isSelected = selectedIds.has(w.id);

              return (
                <div
                  key={w.id}
                  className="word-row"
                  style={{
                    '--accent': boxMeta(box).color,
                    animationDelay: `${Math.min(i * 12, 250)}ms`,
                    ...(isSelecting && isSelected ? { background: '#f5f3ff', outline: '2px solid #6366f1' } : {})
                  }}
                  onClick={(e) => {
                    if (isSelecting) {
                      toggleSelect(w.id, e);
                    } else {
                      setFlashcardWordId(w.id);
                    }
                  }}
                >
                  {isSelecting ? (
                    <div
                      onClick={(e) => toggleSelect(w.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #4f46e5' : '2px solid #cbd5e1',
                        background: isSelected ? '#4f46e5' : '#ffffff',
                        color: '#ffffff',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title={isSelected ? 'Bỏ chọn' : 'Chọn từ này'}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} color="#94a3b8" />}
                    </div>
                  ) : (
                    <button
                      className="icon-ghost"
                      onClick={(e) => speak(e, w.word)}
                      title="Nghe phát âm"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}

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
                      title="Xóa từ này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {displayLimit < visibleWords.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDisplayLimit((prev) => prev + 36)}
                style={{
                  padding: '10px 24px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                Xem thêm ({visibleWords.length - displayLimit} từ còn lại)
              </button>
            </div>
          )}
        </div>
      )}
        </React.Fragment>
      )}

      {/* 6. Deck Modal for creating or editing decks */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={() => {
          setIsDeckModalOpen(false);
          setEditingDeck(null);
        }}
        initialData={editingDeck}
        onSave={handleSaveDeck}
      />

      {/* 7. Detail Flashcard Modal */}
      <WordDetailFlashcardModal
        isOpen={!!flashcardWordId}
        onClose={() => setFlashcardWordId(null)}
        wordId={flashcardWordId}
        words={visibleWords}
        onRecordReview={onRecordReview}
        speechVoice={speechVoice}
        onLookupDictionary={onLookupDictionary}
        onTryInDoctor={onTryInDoctor}
        onViewSynonyms={onViewSynonyms}
        onOpenIn4Skills={onOpenIn4Skills}
      />
    </div>
  );
}
