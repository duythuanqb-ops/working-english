import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Pin,
  Edit3,
  Trash2,
  Copy,
  Check,
  Calendar,
  X,
  Languages,
  Stethoscope,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Maximize2,
  Download,
  Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService';

const CATEGORIES = [
  'Tất cả',
  'Giao tiếp Công sở',
  'IELTS / TOEIC',
  'Từ vựng & Cụm từ',
  'Ngữ pháp & Cấu trúc',
  'Khác'
];

const COLOR_THEMES = [
  { id: 'lavender', label: 'Tím Lavender', bg: '#f5f3ff', border: '#e0e7ff', badgeBg: '#ede9fe', badgeText: '#6d28d9', dot: '#7c3aed' },
  { id: 'peach', label: 'Hồng Đào', bg: '#fff1f2', border: '#ffe4e6', badgeBg: '#ffe4e6', badgeText: '#be123c', dot: '#f43f5e' },
  { id: 'mint', label: 'Xanh Mint', bg: '#ecfdf5', border: '#d1fae5', badgeBg: '#d1fae5', badgeText: '#047857', dot: '#10b981' },
  { id: 'sun', label: 'Vàng Nắng', bg: '#fffbeb', border: '#fef3c7', badgeBg: '#fef3c7', badgeText: '#b45309', dot: '#f59e0b' },
  { id: 'sky', label: 'Xanh Mây', bg: '#f0f9ff', border: '#e0f2fe', badgeBg: '#e0f2fe', badgeText: '#0369a1', dot: '#0ea5e9' }
];

const getColorTheme = (colorId) => {
  return COLOR_THEMES.find((c) => c.id === colorId) || COLOR_THEMES[0];
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(timestamp).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
};

// Canvas-based image compression: optimizes screenshots to small WebP/JPEG data URLs
const compressImage = (fileOrBlob, maxWidth = 1280, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp && webp.startsWith('data:image/webp')) {
            return resolve(webp);
          }
        } catch (_) {}
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Không thể tải tệp hình ảnh.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
    reader.readAsDataURL(fileOrBlob);
  });
};

export default function NotesView({ onLookupDictionary, onTryInDoctor }) {
  const [notes, setNotes] = useState(() => storageService.getNotes());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Giao tiếp Công sở');
  const [color, setColor] = useState('lavender');
  const [isPinned, setIsPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fileInputRef = useRef(null);

  // Sync when notes change
  useEffect(() => {
    const handleSync = () => {
      setNotes(storageService.getNotes());
    };
    window.addEventListener('we-notes-updated', handleSync);
    return () => window.removeEventListener('we-notes-updated', handleSync);
  }, []);

  // Keyboard shortcut: Escape to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // Image ingestion handler (from paste or file upload)
  const handleAddImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setIsProcessingImage(true);
      const compressedUrl = await compressImage(file);
      setImages((prev) => [
        ...prev,
        {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          url: compressedUrl,
          name: file.name || 'Ảnh ghi chú'
        }
      ]);
    } catch (err) {
      console.error('Lỗi xử lý hình ảnh:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Paste handler for editor modal & inputs
  const handlePaste = async (e) => {
    const clipboardItems = e.clipboardData?.items;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          await handleAddImageFile(file);
        }
      }
    }
  };

  // Global paste handler: If user presses Cmd+V on notes screen while modal is closed, auto-open editor!
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      if (isEditorOpen) return;
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setEditingNote(null);
            setTitle('');
            setCategory(selectedCategory !== 'Tất cả' ? selectedCategory : 'Giao tiếp Công sở');
            setColor('lavender');
            setIsPinned(false);
            setTagsInput('');
            setContent('');
            setImages([]);
            setIsEditorOpen(true);
            await handleAddImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isEditorOpen, selectedCategory]);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setCategory(selectedCategory !== 'Tất cả' ? selectedCategory : 'Giao tiếp Công sở');
    setColor('lavender');
    setIsPinned(false);
    setTagsInput('');
    setContent('');
    setImages([]);
    setIsEditorOpen(true);
  };

  const openEditModal = (note, e) => {
    if (e) e.stopPropagation();
    setEditingNote(note);
    setTitle(note.title);
    setCategory(note.category || 'Chung');
    setColor(note.color || 'lavender');
    setIsPinned(Boolean(note.isPinned));
    setTagsInput((note.tags || []).join(', '));
    setContent(note.content || '');
    setImages(Array.isArray(note.images) ? [...note.images] : []);
    setIsEditorOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && images.length === 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const cleanTitle = title.trim() || (images.length > 0 ? `Ảnh ghi chú ${formatDate(Date.now())}` : 'Ghi chú mới');

    if (editingNote) {
      storageService.updateNote(editingNote.id, {
        title: cleanTitle,
        category,
        color,
        isPinned,
        tags,
        content,
        images
      });
      if (selectedNote && selectedNote.id === editingNote.id) {
        setSelectedNote({
          ...selectedNote,
          title: cleanTitle,
          category,
          color,
          isPinned,
          tags,
          content,
          images,
          updatedAt: Date.now()
        });
      }
    } else {
      const created = storageService.addNote({
        title: cleanTitle,
        category,
        color,
        isPinned,
        tags,
        content,
        images
      });
      setSelectedNote(created);
    }

    setNotes(storageService.getNotes());
    setIsEditorOpen(false);
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      const updated = storageService.deleteNote(id);
      setNotes(updated);
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const handleTogglePin = (id, e) => {
    if (e) e.stopPropagation();
    const updated = storageService.togglePinNote(id);
    setNotes(updated);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote((prev) => ({ ...prev, isPinned: !prev.isPinned }));
    }
  };

  const handleCopyContent = (text, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter & Sort
  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notes
      .filter((n) => {
        const matchesCategory = selectedCategory === 'Tất cả' || n.category === selectedCategory;
        const matchesQuery =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
      });
  }, [notes, searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-6xl w-full flex flex-col gap-6" style={{ paddingBottom: '40px' }}>
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            className="search-input w-full pl-10 pr-4 py-2.5 text-sm"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, #tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ padding: '10px 20px', borderRadius: '14px' }}
          >
            <Plus size={18} />
            <span>Tạo Ghi Chú Mới</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === 'Tất cả'
              ? notes.length
              : notes.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className={`filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              <span className="filter-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center p-12 text-center"
          style={{ borderRadius: '20px', border: '1px dashed #cbd5e1', background: '#ffffff' }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--we-lavender)',
              marginBottom: '16px'
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
            {searchQuery ? 'Không tìm thấy ghi chú phù hợp' : 'Chưa có ghi chú nào trong mục này'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '20px' }}>
            {searchQuery
              ? 'Hãy thử tìm bằng từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
              : 'Ghi lại collocations, cấu trúc câu hay hoặc chụp màn hình rồi dán trực tiếp (Cmd+V) vào đây!'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ padding: '9px 18px' }}
          >
            <Plus size={16} />
            <span>Tạo ghi chú ngay ✨</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const theme = getColorTheme(note.color);
            const hasImages = Array.isArray(note.images) && note.images.length > 0;
            const firstImage = hasImages ? (note.images[0].url || note.images[0]) : null;

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="card flex flex-col justify-between cursor-pointer group"
                style={{
                  borderRadius: '18px',
                  border: `1px solid ${theme.border}`,
                  background: '#ffffff',
                  padding: '18px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Banner Stripe */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: theme.dot
                  }}
                />

                {/* Card Content Top */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: theme.badgeBg,
                        color: theme.badgeText
                      }}
                    >
                      {note.category || 'Ghi chú'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(note.id, e)}
                        className="btn-icon"
                        title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                        style={{
                          padding: '4px',
                          color: note.isPinned ? theme.dot : '#94a3b8'
                        }}
                      >
                        {note.isPinned ? <Pin size={15} fill={theme.dot} /> : <Pin size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => openEditModal(note, e)}
                        className="btn-icon"
                        title="Chỉnh sửa ghi chú"
                        style={{ padding: '4px' }}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(note.id, e)}
                        className="btn-icon text-rose-500 hover:text-rose-700"
                        title="Xóa ghi chú"
                        style={{ padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Image Thumbnail Preview (if note has images) */}
                  {hasImages && firstImage && (
                    <div
                      className="relative w-full rounded-xl overflow-hidden mb-3 border border-slate-100 group/thumb"
                      style={{ height: '135px', background: '#f8fafc' }}
                    >
                      <img
                        src={firstImage}
                        alt={note.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {note.images.length > 1 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '7px',
                            right: '7px',
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            background: 'rgba(15, 23, 42, 0.78)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          +{note.images.length - 1} ảnh
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <h4
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.35,
                      marginBottom: '8px'
                    }}
                  >
                    {note.title}
                  </h4>

                  {/* Content Preview */}
                  {note.content && (
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        display: '-webkit-box',
                        WebkitLineClamp: hasImages ? 2 : 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Footer: Tags & Time */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags && note.tags.length > 0 ? (
                      note.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#64748b'
                          }}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem' }}>{formatDate(note.updatedAt || note.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Detail Modal */}
      {selectedNote && !isEditorOpen && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="modal-content w-full max-w-2xl flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: '22px' }}
          >
            {/* Modal Header */}
            <div className="modal-header px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    background: getColorTheme(selectedNote.color).badgeBg,
                    color: getColorTheme(selectedNote.color).badgeText
                  }}
                >
                  {selectedNote.category || 'Ghi chú'}
                </span>
                {selectedNote.isPinned && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Pin size={12} fill="#d97706" /> Đã ghim
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {selectedNote.content && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyContent(selectedNote.content, selectedNote.id, e)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '10px' }}
                    title="Sao chép toàn bộ nội dung text"
                  >
                    {copiedId === selectedNote.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copiedId === selectedNote.id ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(selectedNote)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '10px' }}
                >
                  <Edit3 size={14} />
                  <span>Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNote(null)}
                  className="btn-icon ml-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                {selectedNote.title}
              </h2>

              {/* Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedNote.tags.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569'
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Attached Images Gallery */}
              {Array.isArray(selectedNote.images) && selectedNote.images.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-indigo-500" />
                      <span>Hình ảnh đính kèm ({selectedNote.images.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Bấm ảnh để phóng to</span>
                  </div>

                  <div
                    className={`grid gap-3 ${
                      selectedNote.images.length === 1
                        ? 'grid-cols-1'
                        : selectedNote.images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {selectedNote.images.map((img, idx) => {
                      const url = img.url || img;
                      return (
                        <div
                          key={img.id || idx}
                          onClick={() => setLightboxImage(url)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition-all"
                          style={{
                            maxHeight: selectedNote.images.length === 1 ? '380px' : '200px',
                            background: '#f8fafc'
                          }}
                        >
                          <img
                            src={url}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                            style={{
                              maxHeight: selectedNote.images.length === 1 ? '380px' : '200px'
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="p-2 rounded-full bg-white/95 text-slate-800 shadow-md">
                              <Maximize2 size={16} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Full View */}
              {selectedNote.content && (
                <div
                  style={{
                    fontSize: '0.94rem',
                    lineHeight: 1.65,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-line',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '14px',
                    padding: '16px'
                  }}
                >
                  {selectedNote.content}
                </div>
              )}

              {/* Quick Assistant Interconnections */}
              <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Cập nhật: {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
                </span>

                <div className="flex items-center gap-2">
                  {onLookupDictionary && (
                    <button
                      type="button"
                      onClick={() => onLookupDictionary(selectedNote.title)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      <Languages size={14} />
                      Tra từ điển
                    </button>
                  )}
                  {onTryInDoctor && (
                    <button
                      type="button"
                      onClick={() => onTryInDoctor(selectedNote.title)}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer ml-3"
                    >
                      <Stethoscope size={14} />
                      Bác sĩ ngữ pháp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isEditorOpen && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="modal-content w-full max-w-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
            onPaste={handlePaste}
            style={{ borderRadius: '22px' }}
          >
            {/* Header */}
            <div className="modal-header px-6 py-4 flex items-center justify-between">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingNote ? 'Chỉnh Sửa Ghi Chú' : 'Tạo Ghi Chú Học Tập Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="btn-icon cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tiêu đề ghi chú <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field w-full px-4 py-2.5 text-sm font-semibold"
                    placeholder="VD: Cấu trúc paraphrase hay, Từ vựng buổi họp sáng..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Category & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Danh mục
                    </label>
                    <select
                      className="select-field w-full px-3 py-2 text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Màu thẻ ghi chú
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {COLOR_THEMES.map((c) => {
                        const isChosen = color === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setColor(c.id)}
                            title={c.label}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: c.dot,
                              border: isChosen ? '2.5px solid #0f172a' : '2px solid transparent',
                              transform: isChosen ? 'scale(1.15)' : 'scale(1)',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tags & Pin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Thẻ tag (cách nhau bởi dấu phẩy)
                    </label>
                    <input
                      type="text"
                      className="input-field w-full px-3 py-2 text-xs"
                      placeholder="email, collocations, task2..."
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>Ghim ghi chú lên đầu</span>
                    </label>
                  </div>
                </div>

                {/* Attached Images Dropzone & List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-indigo-500" />
                      <span>Hình ảnh đính kèm ({images.length})</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Chọn ảnh từ máy</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(handleAddImageFile);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>

                  {images.length === 0 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                        <ImagePlus size={18} />
                        <span>Bấm Cmd+V để dán ảnh chụp màn hình, hoặc nhấn vào đây để tải ảnh</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Hỗ trợ chụp màn hình nhanh (Cmd+Shift+4), ảnh đề bài IELTS/TOEIC, bài viết (PNG, JPG, WebP)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {images.map((img, idx) => (
                          <div
                            key={img.id || idx}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs"
                            style={{ width: '84px', height: '84px' }}
                          >
                            <img
                              src={img.url}
                              alt={img.name || 'Ảnh ghi chú'}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setLightboxImage(img.url)}
                              title="Bấm để xem ảnh phóng to"
                            />
                            <button
                              type="button"
                              onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs opacity-90 transition-all cursor-pointer"
                              title="Xóa ảnh này"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer text-xs"
                          title="Thêm ảnh khác"
                        >
                          <Plus size={18} />
                          <span className="text-[10px] font-semibold">Thêm ảnh</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>💡 Nhấn <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">Cmd+V</kbd> bất kỳ lúc nào để dán thêm ảnh</span>
                        {isProcessingImage && (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                            <Loader2 size={12} className="animate-spin" /> Đang tối ưu ảnh...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nội dung ghi chú
                    </label>

                    {/* Quick Snippet Helpers */}
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                      <button
                        type="button"
                        onClick={() => setContent((prev) => (prev ? `${prev}\n• ` : '• '))}
                        className="hover:underline cursor-pointer"
                      >
                        + Gạch đầu dòng
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setContent((prev) => (prev ? `${prev}\nVí dụ: ` : 'Ví dụ: '))}
                        className="hover:underline cursor-pointer"
                      >
                        + Ví dụ
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    className="textarea-field w-full px-4 py-3 text-sm leading-relaxed"
                    placeholder="Viết nội dung ghi chú, câu ví dụ, cấu trúc cần lưu ý ở đây..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn btn-secondary cursor-pointer"
                  style={{ padding: '8px 16px' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary cursor-pointer"
                  style={{ padding: '8px 20px' }}
                >
                  <span>{editingNote ? 'Cập Nhật Ghi Chú' : 'Lưu Ghi Chú Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Ảnh phóng to"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={lightboxImage}
                download={`working-english-note-${Date.now()}.png`}
                className="btn btn-secondary text-xs"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              >
                <Download size={14} />
                <span>Tải ảnh về máy</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="btn btn-primary text-xs cursor-pointer"
                style={{ padding: '6px 16px' }}
              >
                <X size={14} />
                <span>Đóng (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
