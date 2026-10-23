import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Plus, BookMarked, Edit3 } from 'lucide-react';
import { aiService } from '../services/aiService';
import CustomSelect from './CustomSelect';

export default function AddGrammarModal({
  isOpen,
  onClose,
  chapters = [],
  activeChapterId,
  onSaveRule,
  editingRule = null
}) {
  const [selectedChapterId, setSelectedChapterId] = useState(
    activeChapterId || (chapters[0]?.id || 'tenses')
  );
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  // Rule fields
  const [title, setTitle] = useState('');
  const [formula, setFormula] = useState('');
  const [usage, setUsage] = useState('');
  const [signals, setSignals] = useState('');
  const [workplaceExample, setWorkplaceExample] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [commonMistake, setCommonMistake] = useState('');

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingRule) {
      setSelectedChapterId(editingRule.chapterId || activeChapterId || (chapters[0]?.id || 'tenses'));
      setIsNewChapter(false);
      setTitle(editingRule.title || '');
      setFormula(editingRule.formula || '');
      setUsage(editingRule.usage || '');
      setSignals(editingRule.signals || '');
      setWorkplaceExample(editingRule.workplaceExample || '');
      setExampleVi(editingRule.exampleVi || '');
      setCommonMistake(editingRule.commonMistake || '');
      setErrorMsg('');
    } else {
      setSelectedChapterId(activeChapterId || (chapters[0]?.id || 'tenses'));
      setIsNewChapter(false);
      setNewChapterTitle('');
      setNewChapterDesc('');
      setTitle('');
      setFormula('');
      setUsage('');
      setSignals('');
      setWorkplaceExample('');
      setExampleVi('');
      setCommonMistake('');
      setErrorMsg('');
    }
  }, [editingRule, isOpen, activeChapterId]);

  if (!isOpen) return null;

  const handleAiAutoFill = async () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên quy tắc/cấu trúc trước khi nhờ AI soạn thảo.');
      return;
    }
    setErrorMsg('');
    setIsLoadingAi(true);

    try {
      const enriched = await aiService.enrichGrammarRule(title.trim());
      if (enriched.title) setTitle(enriched.title);
      if (enriched.formula) setFormula(enriched.formula);
      if (enriched.usage) setUsage(enriched.usage);
      if (enriched.signals) setSignals(enriched.signals);
      if (enriched.workplaceExample) setWorkplaceExample(enriched.workplaceExample);
      if (enriched.exampleVi) setExampleVi(enriched.exampleVi);
      if (enriched.commonMistake) setCommonMistake(enriched.commonMistake);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể gọi AI lúc này. Bạn có thể tự gõ thông tin bên dưới.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên quy tắc ngữ pháp.');
      return;
    }

    if (!editingRule && isNewChapter && !newChapterTitle.trim()) {
      setErrorMsg('Vui lòng nhập tên chuyên đề mới.');
      return;
    }

    onSaveRule({
      isEdit: !!editingRule,
      subId: editingRule?.subId,
      isNewChapter: !editingRule && isNewChapter,
      newChapterTitle: newChapterTitle.trim(),
      newChapterDesc: newChapterDesc.trim(),
      chapterId: selectedChapterId,
      ruleData: {
        title: title.trim(),
        formula: formula.trim(),
        usage: usage.trim(),
        signals: signals.trim(),
        workplaceExample: workplaceExample.trim(),
        exampleVi: exampleVi.trim(),
        commonMistake: commonMistake.trim()
      }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingRule ? (
              <Edit3 size={20} color="var(--primary)" />
            ) : (
              <BookMarked size={20} color="var(--primary)" />
            )}
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {editingRule ? 'Chỉnh Sửa Quy Tắc Ngữ Pháp' : 'Thêm Quy Tắc / Tài Liệu Ngữ Pháp Mới'}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-body">
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Chapter Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Lưu vào chuyên đề
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewChapter(!isNewChapter)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isNewChapter ? 'Chọn chuyên đề có sẵn' : '+ Tạo chuyên đề mới'}
                </button>
              </div>

              {isNewChapter ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tên chuyên đề mới (ví dụ: Cấu trúc Đảo ngữ nâng cao, Viết báo cáo...)"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Mô tả ngắn gọn về chuyên đề..."
                    value={newChapterDesc}
                    onChange={(e) => setNewChapterDesc(e.target.value)}
                  />
                </div>
              ) : (
                <CustomSelect
                  value={selectedChapterId}
                  onChange={(val) => setSelectedChapterId(val)}
                  options={chapters.map((ch) => ({ value: ch.id, label: ch.title }))}
                  style={{ width: '100%' }}
                />
              )}
            </div>

            {/* Title & AI Auto-fill Action */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Tên cấu trúc / quy tắc ngữ pháp <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Đảo ngữ với No sooner than, Câu chẻ (Cleft sentence)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="button"
                className="btn btn-ai"
                onClick={handleAiAutoFill}
                disabled={isLoadingAi}
                style={{ height: '40px', minWidth: '170px' }}
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>AI Đang Soạn...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>AI Tự Soạn Thảo</span>
                  </>
                )}
              </button>
            </div>

            {/* Formula */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Công thức ngữ pháp (Formula)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: No sooner + had + S + V3/ed + than + S + V2/ed"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
              />
            </div>

            {/* Usage */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Cách dùng & sắc thái trong giao tiếp / công việc
              </label>
              <textarea
                className="textarea-field"
                rows={2}
                placeholder="Diễn tả một hành động vừa mới xảy ra thì hành động khác lập tức xảy đến..."
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
              />
            </div>

            {/* Signals */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Dấu hiệu nhận biết
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: No sooner... than, Hardly... when, Scarcely... when"
                value={signals}
                onChange={(e) => setSignals(e.target.value)}
              />
            </div>

            {/* Workplace Example */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Ví dụ thực tế trong công sở
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Câu ví dụ tiếng Anh (ví dụ: No sooner had we launched the update than user traffic doubled.)"
                  value={workplaceExample}
                  onChange={(e) => setWorkplaceExample(e.target.value)}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Dịch nghĩa tiếng Việt của câu ví dụ..."
                  value={exampleVi}
                  onChange={(e) => setExampleVi(e.target.value)}
                />
              </div>
            </div>

            {/* Common Mistake */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Cạm bẫy hay sai & Cách khắc phục
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Nhầm 'than' thành 'when', quên đảo trợ động từ had lên trước chủ ngữ..."
                value={commonMistake}
                onChange={(e) => setCommonMistake(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {editingRule ? 'Lưu Thay Đổi' : 'Lưu Vào Cẩm Nang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
