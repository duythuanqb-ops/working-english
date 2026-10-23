import React from 'react';
import { Plus, Volume2, Flame, Sparkles } from 'lucide-react';

export default function TopBar({
  title,
  subtitle,
  onOpenAddModal,
  speechVoice,
  onChangeSpeechVoice,
  streak = 3
}) {
  return (
    <header className="top-bar titlebar-drag-region">
      <div className="top-bar-title no-drag">
        <div>
          <span className="top-bar-heading">{title}</span>
          {subtitle && (
            <span className="top-bar-subtitle" style={{ marginLeft: '12px' }}>
              • {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="top-bar-actions no-drag">
        {/* Streak Indicator with Warm Flame */}
        <div className="streak-pill" title="Chuỗi ngày ôn tập liên tiếp">
          <Flame size={15} color="#ea580c" fill="#ea580c" className="streak-flame-icon" />
          <span>{streak} ngày học liên tiếp</span>
        </div>

        {/* Pronunciation Voice Switcher (Segmented Control) */}
        <div className="voice-switcher" title="Giọng phát âm mặc định">
          <button
            className={`voice-btn ${speechVoice === 'US' ? 'active' : ''}`}
            onClick={() => onChangeSpeechVoice('US')}
          >
            🇺🇸 US
          </button>
          <button
            className={`voice-btn ${speechVoice === 'UK' ? 'active' : ''}`}
            onClick={() => onChangeSpeechVoice('UK')}
          >
            🇬🇧 UK
          </button>
        </div>

        {/* Primary Action Button */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Thêm Từ Vựng Mới</span>
        </button>
      </div>
    </header>
  );
}
