import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Search,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Stethoscope,
  ChevronRight,
  Clock,
  Shield,
  GitBranch,
  Network,
  Compass,
  Mail,
  Plus,
  Trash2,
  Sparkles,
  Edit3
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/ttsService';
import AddGrammarModal from './AddGrammarModal';

const ICON_MAP = {
  Clock: Clock,
  Shield: Shield,
  GitBranch: GitBranch,
  Network: Network,
  Compass: Compass,
  Mail: Mail,
  AlertTriangle: AlertTriangle,
  BookMarked: BookMarked
};

export default function GrammarView({ onTryInDoctor, speechVoice }) {
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    const loaded = storageService.getGrammarChapters();
    setChapters(loaded);
    if (loaded.length > 0 && !selectedChapterId) {
      setSelectedChapterId(loaded[0].id);
    }
  }, []);

  const currentChapter =
    chapters.find((ch) => ch.id === selectedChapterId) || chapters[0] || { sections: [] };

  const filteredSections = (currentChapter.sections || []).filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      (sec.formula && sec.formula.toLowerCase().includes(q)) ||
      (sec.usage && sec.usage.toLowerCase().includes(q)) ||
      (sec.workplaceExample && sec.workplaceExample.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingRule(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (section) => {
    setEditingRule({ ...section, chapterId: currentChapter.id });
    setIsAddModalOpen(true);
  };

  const handleSaveNewRule = ({ isEdit, subId, isNewChapter, newChapterTitle, newChapterDesc, chapterId, ruleData }) => {
    if (isEdit) {
      const updated = storageService.updateGrammarSection(chapterId, subId, ruleData);
      setChapters(updated);
      setSelectedChapterId(chapterId);
    } else if (isNewChapter) {
      const updatedWithChapter = storageService.addGrammarChapter({
        title: newChapterTitle,
        description: newChapterDesc || 'Chuyên đề ngữ pháp do bạn tạo'
      });
      const newChId = updatedWithChapter[updatedWithChapter.length - 1].id;
      const finalChapters = storageService.addGrammarSection(newChId, ruleData);
      setChapters(finalChapters);
      setSelectedChapterId(newChId);
    } else {
      const updated = storageService.addGrammarSection(chapterId, ruleData);
      setChapters(updated);
      setSelectedChapterId(chapterId);
    }
  };

  const handleDeleteSection = (chapterId, subId) => {
    if (confirm('Bạn có chắc chắn muốn xóa quy tắc ngữ pháp này?')) {
      const updated = storageService.deleteGrammarSection(chapterId, subId);
      setChapters(updated);
    }
  };

  const handleDeleteChapter = (chapterId) => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ chuyên đề này cùng các quy tắc bên trong?')) {
      const updated = storageService.deleteGrammarChapter(chapterId);
      setChapters(updated);
      if (selectedChapterId === chapterId && updated.length > 0) {
        setSelectedChapterId(updated[0].id);
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: '100%' }}>
      {/* Chapter Selection Column */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <BookMarked size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Mục Lục Ngữ Pháp
              </h3>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {chapters.length} chuyên đề ngữ pháp
            </p>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
            onClick={handleOpenAdd}
            title="Thêm chuyên đề hoặc quy tắc mới"
          >
            <Plus size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
          {chapters.map((ch) => {
            const Icon = ICON_MAP[ch.icon] || BookMarked;
            const isSelected = ch.id === selectedChapterId;
            return (
              <div
                key={ch.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? '#eef2ff' : 'transparent',
                  border: `1px solid ${isSelected ? '#c7d2fe' : 'transparent'}`,
                  transition: 'all 0.15s ease'
                }}
              >
                <button
                  onClick={() => setSelectedChapterId(ch.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={16} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{ch.title}</span>
                  {ch.isCustom && (
                    <span style={{ fontSize: '0.62rem', background: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '3px' }}>
                      Tự tạo
                    </span>
                  )}
                </button>
                {ch.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(ch.id);
                    }}
                    title="Xóa chuyên đề tự tạo này"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 10px',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chapter Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          paddingRight: '6px'
        }}
      >
        {/* Header & Search within Chapter */}
        <div
          className="card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {currentChapter.title}
                </h2>
                {currentChapter.isCustom && (
                  <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Chuyên đề người dùng tạo
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {currentChapter.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="search-wrapper" style={{ width: '220px' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="input-field search-input"
                  placeholder="Tìm quy tắc, ví dụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={handleOpenAdd}>
                <Plus size={15} />
                <span>Thêm Quy Tắc Mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredSections.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-medium)'
              }}
            >
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}>
                Chưa có quy tắc nào trong mục này hoặc không khớp với tìm kiếm.
              </p>
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                <Plus size={15} /> Thêm quy tắc ngữ pháp đầu tiên
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div
                key={sec.subId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: '4px solid var(--primary)',
                  position: 'relative'
                }}
              >
                {/* Title & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {sec.title}
                    </h4>
                    {sec.isCustom && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: '#eef2ff',
                          color: 'var(--primary)',
                          border: '1px solid #c7d2fe',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        Tự thêm
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                      onClick={() => onTryInDoctor(sec.workplaceExample || '')}
                      title="Mở sang Sửa lỗi để thử nghiệm câu này"
                    >
                      <Stethoscope size={13} color="var(--accent-purple)" />
                      <span>Thử câu trên Sửa lỗi</span>
                    </button>

                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEdit(sec)}
                      title="Chỉnh sửa quy tắc ngữ pháp này"
                      style={{ padding: '5px' }}
                    >
                      <Edit3 size={14} color="var(--primary)" />
                    </button>

                    {sec.isCustom && (
                      <button
                        className="btn-icon"
                        onClick={() => handleDeleteSection(currentChapter.id, sec.subId)}
                        title="Xóa quy tắc tự thêm này"
                        style={{ padding: '5px' }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Formula / Structure */}
                {sec.formula && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                      border: '1px solid #c7d2fe',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 16px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      color: '#3730a3',
                      fontWeight: 700,
                      boxShadow: 'inset 0 1px 2px rgba(99, 102, 241, 0.05)'
                    }}
                  >
                    <span style={{ color: '#6366f1', marginRight: '8px', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      ⚡ Công thức:
                    </span>
                    {sec.formula}
                  </div>
                )}

                {/* Usage & Signals */}
                {sec.usage && (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-main)' }}>Cách dùng:</strong> {sec.usage}
                  </div>
                )}

                {sec.signals && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Dấu hiệu nhận biết:</strong> {sec.signals}
                  </div>
                )}

                {/* Workplace Example */}
                {sec.workplaceExample && (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e0e7ff',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 18px',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.04)',
                      borderLeft: '4px solid var(--primary)',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          Ví dụ thực chiến công sở
                        </span>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '4px', lineHeight: 1.4 }}>
                          "{sec.workplaceExample}"
                        </p>
                      </div>
                      <button
                        className="audio-btn"
                        style={{ width: '30px', height: '30px', marginLeft: '10px' }}
                        onClick={() => ttsService.speak(sec.workplaceExample, { voiceType: speechVoice })}
                        title="Nghe phát âm chuẩn câu ví dụ"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>
                    {sec.exampleVi && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        ➔ {sec.exampleVi}
                      </p>
                    )}
                  </div>
                )}

                {/* Common Mistake Alert */}
                {sec.commonMistake && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.84rem',
                      color: '#991b1b'
                    }}
                  >
                    <AlertTriangle size={16} color="#dc2626" style={{ minWidth: '16px' }} />
                    <span>
                      <strong>Cạm bẫy hay sai:</strong> {sec.commonMistake}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Grammar Modal */}
      <AddGrammarModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRule(null);
        }}
        chapters={chapters}
        activeChapterId={selectedChapterId}
        onSaveRule={handleSaveNewRule}
        editingRule={editingRule}
      />
    </div>
  );
}
