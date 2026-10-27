import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, X, ArrowRight, Brain } from 'lucide-react';

/**
 * DailyReviewNudge
 * Neo-brutalist pop banner displayed under the TopBar
 * Nudges user to review Leitner due words and preserve their streak.
 */
export default function DailyReviewNudge({
  dueCount = 0,
  streak = 0,
  isCheckedIn = false,
  currentView = 'vocab',
  onStartReview
}) {
  const [dismissed, setDismissed] = useState(false);

  // Check if user dismissed the banner for today
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const isDismissed = sessionStorage.getItem(`we_nudge_dismissed_${today}`);
      if (isDismissed) {
        setDismissed(true);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleDismiss = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      sessionStorage.setItem(`we_nudge_dismissed_${today}`, 'true');
    } catch {
      // Ignore
    }
    setDismissed(true);
  };

  // Do not show if:
  // 1. User dismissed it today
  // 2. Currently on review screen
  // 3. No due words AND already checked in today
  if (dismissed || currentView === 'review') {
    return null;
  }

  if (dueCount === 0 && isCheckedIn) {
    return null;
  }

  return (
    <div
      role="alert"
      className="daily-review-nudge-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 24px',
        background: 'linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)',
        borderBottom: '2px solid #1E1B4B',
        boxShadow: '0 2px 0 rgba(30, 27, 75, 0.06)',
        position: 'relative',
        zIndex: 10,
        animation: 'weSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '260px', flex: 1 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#FDE047',
            border: '2px solid #1E1B4B',
            boxShadow: '2px 2px 0 #1E1B4B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {dueCount > 0 ? (
            <Brain size={18} color="#1E1B4B" />
          ) : (
            <Flame size={18} color="#EA580C" fill="#EA580C" />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#1E1B4B',
                letterSpacing: '-0.01em'
              }}
            >
              {dueCount > 0
                ? `Chu kỳ ôn tập Leitner: Bạn có ${dueCount} từ vựng cần ôn hôm nay!`
                : `Hôm nay bạn chưa điểm danh học tập!`}
            </span>

            {streak > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FED7AA',
                  border: '1.5px solid #1E1B4B',
                  borderRadius: '999px',
                  padding: '1px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#9A3412'
                }}
              >
                <Flame size={12} color="#EA580C" fill="#EA580C" />
                Streak {streak} ngày
              </span>
            )}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: '#475569',
              lineHeight: 1.4
            }}
          >
            {dueCount > 0
              ? 'Các từ vựng ở Hộp 1 & 2 đang ở vùng dễ quên. Ôn tập 5 phút ngay để khắc sâu vào trí nhớ dài hạn.'
              : 'Dành 5 phút làm Flashcard hoặc Quiz để duy trì thói quen và giữ chuỗi ngày học liên tục nhé!'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onStartReview}
          className="we-btn we-btn-sm we-btn-indigo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            padding: '7px 14px',
            borderRadius: '10px'
          }}
        >
          <Sparkles size={14} />
          <span>Ôn tập ngay (5 phút)</span>
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          title="Để sau (ẩn hôm nay)"
          aria-label="Đóng thông báo"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1E1B4B';
            e.currentTarget.style.backgroundColor = 'rgba(30, 27, 75, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
