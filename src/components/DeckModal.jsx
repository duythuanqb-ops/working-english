import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';

const DECK_PALETTE = [
  '#4F46E5', // Indigo
  '#F2683A', // Orange Coral
  '#3ECF8E', // Emerald
  '#F8BE33', // Amber Gold
  '#7CC4F2', // Sky Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6'  // Teal
];

export default function DeckModal({ isOpen, onClose, initialData, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [desc, setDesc] = useState(initialData?.desc || '');
  const [color, setColor] = useState(initialData?.color || DECK_PALETTE[0]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDesc(initialData?.desc || '');
      setColor(initialData?.color || DECK_PALETTE[0]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      desc: desc.trim(),
      color
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(30, 27, 75, 0.55)',
        backdropFilter: 'blur(3px)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--we-surf, #ffffff)',
          border: '2.5px solid var(--we-ink, #1E1B4B)',
          borderRadius: '24px',
          boxShadow: '0 8px 0 var(--we-ink, #1E1B4B)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--text-main, #1E1B4B)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>
              {initialData ? 'Chỉnh Sửa Bộ Từ Vựng' : 'Tạo Bộ Từ Vựng Mới'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              Gom từ theo chủ đề, cuộc họp, công việc hoặc mục tiêu học tập.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-ghost"
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', marginBottom: '6px' }}>
              Tên bộ từ *
            </label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Marketing & Branding, Phỏng vấn xin việc, IELTS Writing..."
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '2px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', marginBottom: '6px' }}>
              Mô tả ngắn
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ví dụ: Thuật ngữ thảo luận trong các buổi báo cáo tiến độ tuần"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '2px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', marginBottom: '8px' }}>
              Màu sắc đại diện
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DECK_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #1E1B4B' : '2px solid transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '9px 18px', borderRadius: '12px', fontWeight: 700 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn-primary"
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FolderPlus size={16} />
              <span>{initialData ? 'Cập Nhật Bộ Từ' : 'Tạo Bộ Từ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
