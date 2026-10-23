import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';
import { GRAMMAR_CHAPTERS } from '../data/grammarHandbook';
import { ttsService } from '../services/ttsService';

const ICON_MAP = {
  Clock: Clock,
  Shield: Shield,
  GitBranch: GitBranch,
  Network: Network,
  Compass: Compass,
  Mail: Mail,
  AlertTriangle: AlertTriangle
};

export default function GrammarView({ onTryInDoctor, speechVoice }) {
  const [selectedChapterId, setSelectedChapterId] = useState(GRAMMAR_CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const currentChapter =
    GRAMMAR_CHAPTERS.find((ch) => ch.id === selectedChapterId) || GRAMMAR_CHAPTERS[0];

  const filteredSections = currentChapter.sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      (sec.formula && sec.formula.toLowerCase().includes(q)) ||
      (sec.usage && sec.usage.toLowerCase().includes(q)) ||
      (sec.workplaceExample && sec.workplaceExample.toLowerCase().includes(q))
    );
  });

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
        <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BookMarked size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Mục Lục Ngữ Pháp
            </h3>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Đầy đủ 7 chuyên đề ngữ pháp thực chiến
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
          {GRAMMAR_CHAPTERS.map((ch) => {
            const Icon = ICON_MAP[ch.icon] || BookMarked;
            const isSelected = ch.id === selectedChapterId;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChapterId(ch.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? '#eef2ff' : 'transparent',
                  border: `1px solid ${isSelected ? '#c7d2fe' : 'transparent'}`,
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ flex: 1, lineHeight: 1.3 }}>{ch.title}</span>
              </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {currentChapter.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {currentChapter.description}
              </p>
            </div>

            <div className="search-wrapper" style={{ width: '240px' }}>
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="input-field search-input"
                placeholder="Tìm quy tắc, ví dụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredSections.map((sec) => (
            <div
              key={sec.subId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderLeft: '4px solid var(--primary)'
              }}
            >
              {/* Title & Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {sec.title}
                </h4>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                  onClick={() => onTryInDoctor(sec.workplaceExample || '')}
                  title="Mở sang Bác sĩ Sửa lỗi để thử nghiệm câu này"
                >
                  <Stethoscope size={13} color="var(--accent-purple)" />
                  <span>Thử câu trên Bác sĩ Sửa lỗi</span>
                </button>
              </div>

              {/* Formula / Structure */}
              {sec.formula && (
                <div
                  style={{
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 14px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#3730a3',
                    fontWeight: 600
                  }}
                >
                  <strong>Công thức:</strong> {sec.formula}
                </div>
              )}

              {/* Usage & Signals */}
              {sec.usage && (
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginTop: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      "{sec.workplaceExample}"
                    </p>
                    <button
                      className="audio-btn"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => ttsService.speak(sec.workplaceExample, { voiceType: speechVoice })}
                      title="Nghe đọc ví dụ"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                  {sec.exampleVi && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
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
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#991b1b'
                  }}
                >
                  <AlertTriangle size={15} color="#dc2626" style={{ minWidth: '15px' }} />
                  <span>
                    <strong>Cạm bẫy hay sai:</strong> {sec.commonMistake}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
