import React, { useState } from 'react';
import { X, Sparkles, Loader2, Volume2, Plus, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { ttsService } from '../services/ttsService';
import CustomSelect from './CustomSelect';

export default function AddWordModal({ isOpen, onClose, onSave, speechVoice }) {
  const [word, setWord] = useState('');
  const [ipa, setIpa] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [meaningVi, setMeaningVi] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [examples, setExamples] = useState([
    { en: '', vi: '', context: 'Workplace' }
  ]);
  const [synonymsText, setSynonymsText] = useState('');
  const [antonymsText, setAntonymsText] = useState('');
  const [collocationsText, setCollocationsText] = useState('');
  const [tagsText, setTagsText] = useState('Work, Meeting');
  const [notes, setNotes] = useState('');

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAiEnrich = async () => {
    if (!word.trim()) {
      setErrorMsg('Vui lòng nhập từ vựng trước khi nhấn AI phân tích.');
      return;
    }
    setErrorMsg('');
    setIsLoadingAi(true);

    try {
      const enriched = await aiService.enrichWord(word.trim());
      if (enriched.ipa) setIpa(enriched.ipa);
      if (enriched.partOfSpeech) setPartOfSpeech(enriched.partOfSpeech.toLowerCase());
      if (enriched.meaningVi) setMeaningVi(enriched.meaningVi);
      if (enriched.meaningEn) setMeaningEn(enriched.meaningEn);
      if (enriched.examples && enriched.examples.length > 0) {
        setExamples(enriched.examples);
      }
      if (enriched.synonyms && enriched.synonyms.length > 0) {
        setSynonymsText(enriched.synonyms.join(', '));
      }
      if (enriched.antonyms && enriched.antonyms.length > 0) {
        setAntonymsText(enriched.antonyms.join(', '));
      }
      if (enriched.collocations && enriched.collocations.length > 0) {
        setCollocationsText(enriched.collocations.join(', '));
      }

      // Auto play pronunciation
      ttsService.speak(word.trim(), { voiceType: speechVoice });
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể tra cứu AI. Vui lòng kiểm tra kết nối mạng hoặc API Key.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAddExample = () => {
    setExamples([...examples, { en: '', vi: '', context: 'Business' }]);
  };

  const handleUpdateExample = (index, field, value) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };

  const handleRemoveExample = (index) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim()) {
      setErrorMsg('Vui lòng nhập từ vựng.');
      return;
    }

    const synonyms = synonymsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const antonyms = antonymsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const collocations = collocationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      word: word.trim(),
      ipa: ipa.trim(),
      partOfSpeech,
      meaningVi: meaningVi.trim(),
      meaningEn: meaningEn.trim(),
      examples: examples.filter((ex) => ex.en.trim().length > 0),
      synonyms,
      antonyms,
      collocations,
      tags: tags.length > 0 ? tags : ['General'],
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Thêm Từ Vựng Mới</h2>
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
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Word Input & AI Action */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Từ vựng tiếng Anh <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: Mitigate, Consensus, Streamline..."
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    autoFocus
                  />
                  {word && (
                    <button
                      type="button"
                      onClick={() => ttsService.speak(word, { voiceType: speechVoice })}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Phát âm"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ai"
                onClick={handleAiEnrich}
                disabled={isLoadingAi}
                style={{ height: '42px', minWidth: '175px' }}
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>AI Tự Động Điền</span>
                  </>
                )}
              </button>
            </div>

            {/* Pronunciation & Part of Speech */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Phiên âm quốc tế (IPA)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="/ˈmɪt.ɪ.ɡeɪt/"
                  value={ipa}
                  onChange={(e) => setIpa(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Loại từ
                </label>
                <CustomSelect
                  value={partOfSpeech}
                  onChange={(val) => setPartOfSpeech(val)}
                  options={[
                    { value: 'noun', label: 'Danh từ (noun)' },
                    { value: 'verb', label: 'Động từ (verb)' },
                    { value: 'adjective', label: 'Tính từ (adj)' },
                    { value: 'adverb', label: 'Trạng từ (adv)' },
                    { value: 'phrase', label: 'Cụm từ (phrase)' },
                    { value: 'idiom', label: 'Thành ngữ (idiom)' }
                  ]}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Vietnamese Meaning */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nghĩa tiếng Việt
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Giải nghĩa rõ ràng, dễ nhớ..."
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
              />
            </div>

            {/* English Definition */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Định nghĩa tiếng Anh (English definition)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Short concise definition in English..."
                value={meaningEn}
                onChange={(e) => setMeaningEn(e.target.value)}
              />
            </div>

            {/* Workplace Examples */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Ví dụ trong công việc / giao tiếp
                </label>
                <button
                  type="button"
                  onClick={handleAddExample}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Thêm câu ví dụ
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {examples.map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        className="input-field"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                        placeholder="Câu ví dụ tiếng Anh..."
                        value={ex.en}
                        onChange={(e) => handleUpdateExample(idx, 'en', e.target.value)}
                      />
                      {ex.en && (
                        <button
                          type="button"
                          className="audio-btn"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => ttsService.speak(ex.en, { voiceType: speechVoice })}
                          title="Phát âm câu ví dụ"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                      {examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExample(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
                      placeholder="Dịch nghĩa tiếng Việt của câu ví dụ..."
                      value={ex.vi}
                      onChange={(e) => handleUpdateExample(idx, 'vi', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Synonyms & Collocations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Từ đồng nghĩa (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Alleviate, Diminish, Lessen..."
                  value={synonymsText}
                  onChange={(e) => setSynonymsText(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Cụm từ hay gặp (Collocations)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Mitigate risks, Mitigate impact..."
                  value={collocationsText}
                  onChange={(e) => setCollocationsText(e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Thẻ chủ đề (Tags)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Meeting, Email, Presentation, Finance..."
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu Vào Sổ Từ Vựng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
