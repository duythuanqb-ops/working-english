import React from 'react';
import {
  BookOpen,
  CalendarCheck,
  Repeat,
  BookMarked,
  Stethoscope,
  Settings,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, wordCount, dueCount }) {
  const navItems = [
    {
      id: 'vocab',
      label: 'Sổ từ vựng',
      icon: BookOpen,
      badge: wordCount
    },
    {
      id: 'review',
      label: 'Ôn tập & Quiz',
      icon: CalendarCheck,
      badge: dueCount > 0 ? `${dueCount} cần ôn` : null,
      badgeHighlight: dueCount > 0
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
      label: 'Bác sĩ Sửa lỗi',
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
      // In web preview fallback, open a new popup window
      window.open(
        `${window.location.origin}/?view=mini`,
        'MiniCapture',
        'width=520,height=440,top=100,left=300'
      );
    }
  };

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
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(168, 85, 247, 0.25)',
                      color: '#c084fc',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      border: '1px solid rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    AI
                  </span>
                )}
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className="nav-badge"
                  style={
                    item.badgeHighlight
                      ? { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                      : {}
                  }
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Quick Capture Trigger */}
      <div className="sidebar-footer">
        <button className="quick-capture-btn" onClick={handleOpenMini}>
          <Zap size={16} />
          <span>Tra & Note Nhanh</span>
          <span className="quick-capture-shortcut">⌘⇧E</span>
        </button>
      </div>
    </aside>
  );
}
