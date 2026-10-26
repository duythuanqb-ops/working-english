import React from 'react';
import {
  BookOpen,
  Languages,
  CalendarCheck,
  Repeat,
  BookMarked,
  Stethoscope,
  Settings,
  Zap,
  Sparkles,
  Flame,
  Award,
  GraduationCap,
  LayoutGrid,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, wordCount, dueCount }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: LayoutGrid
    },
    {
      id: 'vocab',
      label: 'Sổ từ vựng',
      icon: BookOpen,
      badge: wordCount
    },
    {
      id: 'stats',
      label: 'Thống kê',
      icon: TrendingUp
    },
    {
      id: 'dictionary',
      label: 'Từ điển Tra cứu',
      icon: Languages
    },
    {
      id: 'toeic',
      label: 'Luyện thi TOEIC',
      icon: GraduationCap,
      badge: 'PRO'
    },
    {
      id: 'ielts',
      label: 'Luyện thi IELTS',
      icon: Award,
      badge: 'PRO'
    },
    {
      id: 'ielts-dictionary',
      label: 'Luyện 4 Kỹ Năng',
      icon: Sparkles,
      badge: '100+'
    },
    {
      id: 'review',
      label: 'Ôn tập & Quiz',
      icon: CalendarCheck,
      badge: dueCount > 0 ? `${dueCount} cần ôn` : 'Đã thuộc',
      badgeDue: dueCount > 0
    },
    {
      id: 'synonyms',
      label: 'Từ đồng nghĩa',
      icon: Repeat
    },
    {
      id: 'grammar',
      label: 'Cẩm nang Ngữ pháp',
      icon: BookMarked
    },
    {
      id: 'doctor',
      label: 'Sửa lỗi',
      icon: Stethoscope,
      ai: true
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings
    }
  ];

  const handleOpenMini = () => {
    if (window.electronAPI && window.electronAPI.openMiniCapture) {
      window.electronAPI.openMiniCapture();
    } else {
      window.open(
        `${window.location.origin}/?view=mini`,
        'MiniCapture',
        'width=520,height=440,top=100,left=300'
      );
    }
  };

  const masteredCount = Math.max(0, wordCount - dueCount);
  const targetCount = Math.max(10, wordCount);
  const progressPercent = targetCount > 0 ? Math.min(100, Math.round((masteredCount / targetCount) * 100)) : 0;

  return (
    <aside className="sidebar">
      {/* Sidebar Header with macOS Window Drag Area */}
      <div className="sidebar-header titlebar-drag-region">
        <div className="app-logo no-drag">
          <Sparkles size={20} />
        </div>
        <div className="brand-text no-drag">
          <h1>
            WorkingEnglish
            <span className="brand-badge">PRO</span>
          </h1>
          <p className="brand-subtitle">Smart English for Work</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Học & Luyện Tập</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} />
                <span>{item.label}</span>
                {item.ai && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: 'rgba(147, 51, 234, 0.12)',
                      color: '#9333ea',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(147, 51, 234, 0.25)',
                      letterSpacing: '0.04em'
                    }}
                  >
                    AI
                  </span>
                )}
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`nav-badge ${item.badgeDue ? 'nav-badge-due' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Daily Progress & Quick Capture */}
      <div className="sidebar-footer">
        <div className="sidebar-goal-card">
          <div className="goal-card-header">
            <span>Tiến độ ghi nhớ</span>
            <span style={{ color: 'var(--primary)' }}>{progressPercent}%</span>
          </div>
          <div className="goal-progress-bar">
            <div
              className="goal-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>{masteredCount}/{targetCount} từ hoàn thành</span>
            <Award size={13} color="var(--primary)" />
          </div>
        </div>

        <button className="quick-capture-btn" onClick={handleOpenMini}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={15} color="var(--primary)" />
            <span>Tra & Note Nhanh</span>
          </div>
          <span className="quick-capture-shortcut">⌘⇧E</span>
        </button>
      </div>
    </aside>
  );
}
