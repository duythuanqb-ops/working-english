import React, { useState, useRef, useEffect } from 'react';
import { Plus, Flame, Sparkles, CheckCircle2, Calendar, Award, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TopBar({
  title,
  subtitle,
  onOpenAddModal,
  speechVoice,
  onChangeSpeechVoice,
  streak = 0,
  todayCount = 0,
  isCheckedIn = false,
  onCheckIn
}) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const popoverRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowCheckInModal(false);
      }
    };
    if (showCheckInModal) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCheckInModal]);

  const handleTriggerCheckIn = () => {
    if (onCheckIn) {
      const res = onCheckIn();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.15 }
        });
      } catch {}
    }
  };

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric'
  });

  return (
    <header className="top-bar titlebar-drag-region">
      <div className="top-bar-title no-drag">
        <div className="flex items-center gap-2">
          <span className="top-bar-heading">{title}</span>
          {subtitle && (
            <span className="top-bar-subtitle">
              • {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="top-bar-actions no-drag" style={{ position: 'relative' }}>
        {/* Streak & Daily Check-in Button */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            type="button"
            className={`streak-pill ${isCheckedIn ? 'streak-active' : ''}`}
            onClick={() => setShowCheckInModal((v) => !v)}
            title="Nhấp để xem tiến độ streak và điểm danh hôm nay"
            style={{
              cursor: 'pointer',
              border: isCheckedIn ? '1.5px solid #f97316' : '1px solid var(--border-medium)',
              background: isCheckedIn ? 'rgba(249, 115, 22, 0.12)' : 'var(--bg-card)'
            }}
          >
            <Flame
              size={16}
              color={streak > 0 ? '#ea580c' : '#94a3b8'}
              fill={streak > 0 ? '#ea580c' : 'none'}
              className="streak-flame-icon"
            />
            <span style={{ fontWeight: 800 }}>{streak} ngày</span>
            {isCheckedIn ? (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#16a34a',
                  background: '#dcfce7',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  marginLeft: '2px'
                }}
              >
                ✓ Đã điểm danh
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#ea580c',
                  background: '#ffedd5',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  marginLeft: '2px'
                }}
              >
                Điểm danh
              </span>
            )}
          </button>

          {/* Check-in Dropdown Modal */}
          {showCheckInModal && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: '#ffffff',
                border: '2.5px solid #1E1B4B',
                borderRadius: '18px',
                boxShadow: '0 8px 0 #1E1B4B',
                padding: '20px',
                zIndex: 100,
                color: '#1E1B4B',
                animation: 'scaleIn 0.15s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#FFF0C2',
                      border: '2px solid #1E1B4B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Flame size={18} color="#ea580c" fill="#ea580c" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>Điểm Danh Hàng Ngày</h4>
                    <span style={{ fontSize: '0.74rem', color: '#6B6790', fontWeight: 600 }}>{todayStr}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B6790',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                style={{
                  background: '#FFF8E7',
                  border: '2px solid #1E1B4B',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>
                    {streak}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B6790', marginTop: '2px' }}>
                    Chuỗi ngày học
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(30,27,75,0.15)' }} />
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                    {todayCount}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B6790', marginTop: '2px' }}>
                    Hoạt động hôm nay
                  </div>
                </div>
              </div>

              <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#6B6790', lineHeight: 1.45 }}>
                {isCheckedIn
                  ? 'Tuyệt vời! Bạn đã duy trì chuỗi học hôm nay. Mọi hoạt động tra từ, học flashcard và làm đề sẽ tiếp tục cộng dồn.'
                  : 'Hãy điểm danh để không làm gián đoạn chuỗi ngày học liên tục của bạn!'}
              </p>

              {!isCheckedIn ? (
                <button
                  type="button"
                  onClick={handleTriggerCheckIn}
                  className="we-btn we-btn-indigo"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Sparkles size={16} />
                  <span>Điểm danh hôm nay (+1 Streak)</span>
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: '#DCFCE7',
                    border: '2px solid #16A34A',
                    borderRadius: '12px',
                    color: '#15803D',
                    fontSize: '0.85rem',
                    fontWeight: 800
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Đã ghi nhận điểm danh hôm nay!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pronunciation Voice Switcher (Segmented Control) */}
        <div className="voice-switcher" title="Giọng phát âm mặc định">
          <button
            type="button"
            className={`voice-btn ${speechVoice === 'US' ? 'active' : ''}`}
            onClick={() => onChangeSpeechVoice('US')}
          >
            🇺🇸 US
          </button>
          <button
            type="button"
            className={`voice-btn ${speechVoice === 'UK' ? 'active' : ''}`}
            onClick={() => onChangeSpeechVoice('UK')}
          >
            🇬🇧 UK
          </button>
        </div>

        {/* Primary Action Button */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Thêm Từ Mới</span>
        </button>
      </div>
    </header>
  );
}
