import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
  Layers,
  Repeat,
  TrendingUp,
  Mail,
  History,
  Trash2,
  Check,
  BookOpen,
  ArrowRight,
  Info,
  CornerDownLeft,
  BookA,
  Globe
} from 'lucide-react';
import { dictionaryService, BUSINESS_DICT_TOPICS } from '../services/dictionaryService';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/ttsService';

export default function DictionaryView({ words, onSaveWord, speechVoice = 'US' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vi'); // 'vi' (Anh-Việt chuẩn TFlat) | 'en' (Anh-Anh) | 'biz' (Công sở)
  const [saveSuccess, setSaveSuccess] = useState(false);

  const searchInputRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // Load search history and default word on initial mount
  useEffect(() => {
    const history = storageService.getSearchHistory();
    setSearchHistory(history);

    // Initial default lookup if no result yet
    if (!result) {
      const defaultWord = history.length > 0 ? history[0] : 'university';
      handleSearch(defaultWord, false);
    }
  }, []);

  // Handle outside click to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing and instant suggestions
  const handleInputChange = (val) => {
    setSearchTerm(val);
    setActiveSuggestionIndex(-1);
    if (val.trim().length >= 1) {
      const matched = dictionaryService.getSuggestions(val);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === 'Enter') {
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          e.preventDefault();
          const chosen = suggestions[activeSuggestionIndex];
          setSearchTerm(chosen);
          setShowSuggestions(false);
          handleSearch(chosen);
          return;
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const isWordSaved = result
    ? words.some((w) => w.word.toLowerCase() === result.word.toLowerCase())
    : false;

  const savedWordData = result
    ? words.find((w) => w.word.toLowerCase() === result.word.toLowerCase())
    : null;

  const handleSearch = async (termToSearch, updateHistory = true) => {
    const query = (termToSearch || searchTerm).trim();
    if (!query) return;

    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const data = await dictionaryService.lookup(query);
      setResult(data);
      setSearchTerm(data.word);
      if (updateHistory) {
        setSearchHistory(storageService.getSearchHistory());
      }
      setActiveTab('vi'); // Always default to Vietnamese TFlat tab
    } catch (err) {
      console.error('Dictionary search failed:', err);
      setError(err.message || 'Không tìm thấy từ vựng hoặc có lỗi kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có muốn xóa toàn bộ lịch sử tra cứu gần đây?')) {
      storageService.clearSearchHistory();
      setSearchHistory([]);
    }
  };

  const handlePlayAudio = (accent = 'US') => {
    if (!result) return;

    if (accent === 'UK' && result.audioUk) {
      const audio = new Audio(result.audioUk);
      audio.play().catch(() => ttsService.speak(result.word, 'UK'));
      return;
    }
    if (accent === 'US' && result.audioUs) {
      const audio = new Audio(result.audioUs);
      audio.play().catch(() => ttsService.speak(result.word, 'US'));
      return;
    }

    ttsService.speak(result.word, accent);
  };

  const handleSaveToNotebook = () => {
    if (!result || isWordSaved) return;

    const newWord = {
      word: result.word,
      ipa: result.ipaUs || result.ipaUk || '',
      partOfSpeech: result.partOfSpeech || 'noun',
      meaningVi: result.meaningVi,
      meaningEn: result.lexicalMeanings?.[0]?.definitions?.[0]?.definition || '',
      examples: result.bilingualExamples || [],
      synonyms: result.synonyms || [],
      antonyms: result.antonyms || [],
      collocations: result.collocations || [],
      tags: ['TFlat', 'Tra Cứu']
    };

    onSaveWord(newWord);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search Header Hero Bar with Autocomplete Dropdown */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '24px 28px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          zIndex: 40
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          <div ref={searchWrapperRef} style={{ position: 'relative' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchTerm);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <Search size={20} />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tra từ điển Anh - Việt (ví dụ: university, streamline, feasibility, deadline)..."
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchTerm.trim().length >= 1 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '52px',
                    paddingLeft: '48px',
                    paddingRight: searchTerm ? '42px' : '16px',
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-medium)',
                    background: '#ffffff',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      searchInputRef.current?.focus();
                    }}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '4px'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="btn btn-primary"
                style={{
                  height: '52px',
                  padding: '0 26px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                    <span>Đang tra...</span>
                  </>
                ) : (
                  <>
                    <span>Tra Từ</span>
                    <CornerDownLeft size={16} style={{ opacity: 0.7 }} />
                  </>
                )}
              </button>
            </form>

            {/* Instant Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: '125px',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '14px',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                  overflow: 'hidden',
                  zIndex: 50
                }}
              >
                <div
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    background: '#f8fafc',
                    borderBottom: '1px solid var(--border-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Gợi ý từ vựng
                </div>
                {suggestions.map((item, index) => (
                  <div
                    key={item}
                    onClick={() => {
                      setSearchTerm(item);
                      setShowSuggestions(false);
                      handleSearch(item);
                    }}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: index === activeSuggestionIndex ? '#eef2ff' : '#ffffff',
                      color: index === activeSuggestionIndex ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: index === activeSuggestionIndex ? 700 : 500,
                      fontSize: '0.92rem',
                      borderBottom: index < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    <span>{item}</span>
                    <ArrowRight size={14} style={{ opacity: 0.4 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search History Chips */}
          {searchHistory.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '14px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <History size={14} />
                <span>Gần đây:</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  flex: 1
                }}
              >
                {searchHistory.slice(0, 8).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchTerm(term);
                      handleSearch(term);
                    }}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      background: '#ffffff',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#eef2ff';
                      e.target.style.color = 'var(--primary)';
                      e.target.style.borderColor = '#c7d2fe';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.color = 'var(--text-secondary)';
                      e.target.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleClearHistory}
                title="Xóa lịch sử tra cứu"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="card"
          style={{
            padding: '18px 24px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '16px'
          }}
        >
          <Info size={20} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{error}</div>
            <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '2px' }}>
              Kiểm tra lại chính tả hoặc chọn từ danh sách gợi ý bên dưới.
            </div>
          </div>
        </div>
      )}

      {/* Main TFlat-Style Word Result */}
      {result && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Card: Word, Pronunciations, Save Button */}
          <div
            className="card"
            style={{
              padding: '26px 30px',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '18px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1
                    }}
                  >
                    {result.word}
                  </h1>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {result.partOfSpeech}
                  </span>
                </div>

                {/* Pronunciation Badges (UK and US with audio buttons) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginTop: '10px',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* US Audio & IPA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      🇺🇸 US
                    </span>
                    <span
                      style={{
                        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                        fontSize: '0.92rem',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}
                    >
                      {result.ipaUs}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio('US')}
                      className="icon-ghost"
                      style={{ width: '26px', height: '26px' }}
                      title="Phát âm tiếng Mỹ"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  {/* UK Audio & IPA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      🇬🇧 UK
                    </span>
                    <span
                      style={{
                        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                        fontSize: '0.92rem',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}
                    >
                      {result.ipaUk}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio('UK')}
                      className="icon-ghost"
                      style={{ width: '26px', height: '26px' }}
                      title="Phát âm tiếng Anh - Anh"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action: Add to Notebook */}
              <div>
                {isWordSaved ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      borderRadius: '12px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
                      fontWeight: 700,
                      fontSize: '0.88rem'
                    }}
                  >
                    <BookmarkCheck size={18} />
                    <span>
                      Đã lưu trong Sổ tay (Hộp {savedWordData?.box || 1})
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveToNotebook}
                    className="btn btn-primary"
                    style={{
                      padding: '11px 22px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                    }}
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={18} />
                        <span>Đã Thêm Vào Sổ Tay!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={18} />
                        <span>+ Lưu Vào Sổ Từ Vựng</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Prominent Vietnamese Primary Translation Banner */}
            <div
              style={{
                marginTop: '22px',
                padding: '18px 22px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                border: '1px solid #c7d2fe'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}
              >
                Nghĩa Chính Tiếng Việt
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  lineHeight: 1.35
                }}
              >
                {result.meaningVi}
              </div>
            </div>

            {/* Prominent Quick Synonyms & Antonyms in Main Card */}
            {((result.synonyms && result.synonyms.length > 0) || (result.antonyms && result.antonyms.length > 0)) && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {result.synonyms && result.synonyms.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#7e22ce',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#faf5ff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #f3e8ff'
                      }}
                    >
                      <Repeat size={12} />
                      Từ đồng nghĩa:
                    </span>
                    {result.synonyms.map((syn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchTerm(syn);
                          handleSearch(syn);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#6b21a8',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          border: '1px solid #e9d5ff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f3e8ff';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#ffffff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        title={`Click để tra ngay từ "${syn}"`}
                      >
                        {syn} ↗
                      </button>
                    ))}
                  </div>
                )}

                {result.antonyms && result.antonyms.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#be123c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#fff1f2',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #ffe4e6'
                      }}
                    >
                      Từ trái nghĩa:
                    </span>
                    {result.antonyms.map((ant, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchTerm(ant);
                          handleSearch(ant);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#9f1239',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          border: '1px solid #fecdd3',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#ffe4e6';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#ffffff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        title={`Click để tra ngay từ "${ant}"`}
                      >
                        {ant} ↗
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs (Anh - Việt / Anh - Anh / Ngữ Cảnh Công Sở) */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('vi')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'vi' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'vi' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <BookA size={16} />
              <span>Từ Điển Anh - Việt</span>
            </button>

            {result.lexicalMeanings && result.lexicalMeanings.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'en' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === 'en' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Globe size={16} />
                <span>Định Nghĩa Oxford (Anh - Anh)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('biz')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'biz' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'biz' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={16} />
              <span>Công Sở & Ví Dụ Thực Tế</span>
            </button>
          </div>

          {/* TAB 1: Anh - Việt Chuẩn TFlat */}
          {activeTab === 'vi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Detailed Breakdown by Part of Speech */}
              <div
                className="card"
                style={{
                  padding: '24px 28px',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Các Tầng Nghĩa Theo Từ Loại (Parts of Speech)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {result.partsOfSpeech?.map((posGroup, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: '#f8fafc',
                        borderLeft: '4px solid var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {posGroup.posVi}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          ({posGroup.pos})
                        </span>
                      </div>

                      <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {posGroup.meanings?.map((meaningText, mIdx) => (
                          <li
                            key={mIdx}
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                              lineHeight: 1.45
                            }}
                          >
                            {meaningText}
                          </li>
                        ))}
                      </ul>

                      {/* Reverse translation keywords if available */}
                      {posGroup.details && posGroup.details.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {posGroup.details.slice(0, 3).map((detail, dIdx) => (
                            <span
                              key={dIdx}
                              style={{
                                fontSize: '0.76rem',
                                color: 'var(--text-secondary)',
                                background: '#ffffff',
                                border: '1px solid var(--border-subtle)',
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              {detail.meaning} ({detail.reverseWords?.slice(0, 2).join(', ')})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Collocations & Phrases like TFlat */}
              {result.collocations && result.collocations.length > 0 && (
                <div
                  className="card"
                  style={{
                    padding: '24px 28px',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Layers size={18} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Cụm Từ Ghép & Thành Ngữ Thường Dùng (Collocations)
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {result.collocations.map((col, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                        <span>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bilingual Example Sentences */}
              <div
                className="card"
                style={{
                  padding: '24px 28px',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Mail size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Câu Ví Dụ Song Ngữ Anh - Việt
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {result.bilingualExamples?.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        borderLeft: '4px solid #6366f1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
                          "{ex.en}"
                        </div>
                        <button
                          type="button"
                          onClick={() => ttsService.speak(ex.en, speechVoice)}
                          className="icon-ghost"
                          title="Nghe câu ví dụ"
                          style={{ flexShrink: 0 }}
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        → {ex.vi}
                      </div>

                      {ex.context && (
                        <div style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                              background: 'rgba(79, 70, 229, 0.08)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {ex.context}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Oxford English Definitions */}
          {activeTab === 'en' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.lexicalMeanings?.map((meaning, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '24px 28px',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        background: 'rgba(79, 70, 229, 0.08)',
                        color: 'var(--primary)',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {meaning.partOfSpeech}
                    </span>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      ({meaning.definitions?.length} definitions)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {meaning.definitions?.map((def, defIdx) => (
                      <div
                        key={defIdx}
                        style={{
                          paddingLeft: '14px',
                          borderLeft: '2px solid var(--border-medium)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
                          <span style={{ color: 'var(--primary)', marginRight: '6px' }}>{defIdx + 1}.</span>
                          {def.definition}
                        </div>

                        {def.example && (
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '16px' }}>
                            "{def.example}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Business & Workplace Context */}
          {activeTab === 'biz' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                className="card"
                style={{
                  padding: '24px 28px',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Ứng Dụng Thực Chiến Trong Môi Trường Công Sở
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {result.bilingualExamples?.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        borderLeft: '4px solid var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.45 }}>
                        "{ex.en}"
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        → {ex.vi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Curated Workplace Topics */}
      <div
        className="card"
        style={{
          padding: '26px 30px',
          background: '#ffffff',
          border: '1px solid var(--border-medium)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Từ Vựng Tiếng Anh Công Sở Thường Gặp
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
          Nhấp vào bất kỳ từ nào để tra ngay nghĩa tiếng Việt, phiên âm và ví dụ câu thực tế:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {BUSINESS_DICT_TOPICS.map((topic, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--primary)' }}>
                  {topic.icon === 'Layers' && <Layers size={16} />}
                  {topic.icon === 'Repeat' && <Repeat size={16} />}
                  {topic.icon === 'TrendingUp' && <TrendingUp size={16} />}
                  {topic.icon === 'Mail' && <Mail size={16} />}
                </span>
                <span>{topic.category}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {topic.words.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      setSearchTerm(word);
                      handleSearch(word);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#eef2ff';
                      e.target.style.color = 'var(--primary)';
                      e.target.style.borderColor = '#c7d2fe';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.color = 'var(--text-secondary)';
                      e.target.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
