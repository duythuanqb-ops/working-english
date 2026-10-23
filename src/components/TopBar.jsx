import React from 'react';
import { Plus, Volume2, Flame } from 'lucide-react';

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
          <span>{title}</span>
          {subtitle && (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginLeft: '10px',
                fontWeight: 400
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="top-bar-actions no-drag">
        {/* Streak Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
          title="Chuỗi ngày ôn tập liên tiếp"
        >
          <Flame size={15} color="#f59e0b" fill="#f59e0b" />
          <span>{streak} ngày học</span>
        </div>

        {/* Voice Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 8px'
          }}
        >
          <Volume2 size={15} color="var(--text-muted)" />
          <button
            onClick={() => onChangeSpeechVoice('US')}
            style={{
              background: speechVoice === 'US' ? 'var(--primary)' : 'transparent',
              color: speechVoice === 'US' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            US
          </button>
          <button
            onClick={() => onChangeSpeechVoice('UK')}
            style={{
              background: speechVoice === 'UK' ? 'var(--primary)' : 'transparent',
              color: speechVoice === 'UK' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            UK
          </button>
        </div>

        {/* Primary CTA */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Thêm từ vựng</span>
        </button>
      </div>
    </header>
  );
}
