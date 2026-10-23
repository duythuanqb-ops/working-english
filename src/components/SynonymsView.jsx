import React, { useState } from 'react';
import {
  Repeat,
  Sparkles,
  Plus,
  Trash2,
  Volume2,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { ttsService } from '../services/ttsService';

export default function SynonymsView({
  words,
  synonymGroups,
  onSaveSynonymGroups,
  speechVoice
}) {
  const [searchWord, setSearchWord] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // New Group Modal/State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupWordsText, setGroupWordsText] = useState('');
  const [groupNotes, setGroupNotes] = useState('');

  // Built-in Curated Business English Synonym Clusters
  const defaultClusters = [
    {
      id: 'cluster-1',
      title: 'Xử lý & Giải quyết (Solve / Resolve / Address / Tackle)',
      words: [
        { word: 'Solve', nuance: 'Dùng chung cho tìm ra đáp án đúng (toán học, bài toán cụ thể)', example: 'Solve a technical bug.' },
        { word: 'Resolve', nuance: 'Giải quyết triệt để xung đột, tranh chấp, thỏa thuận dứt điểm', example: 'Resolve a customer dispute.' },
        { word: 'Address', nuance: 'Bắt đầu xem xét, đối diện và xử lý vấn đề một cách có trách nhiệm', example: 'Address security concerns.' },
        { word: 'Tackle', nuance: 'Chủ động xông vào giải quyết vấn đề khó khăn, phức tạp', example: 'Tackle the project deadline.' }
      ]
    },
    {
      id: 'cluster-2',
      title: 'Quan trọng & Cốt lõi (Important / Crucial / Pivotal / Vital)',
      words: [
        { word: 'Important', nuance: 'Quan trọng ở mức độ tiêu chuẩn, hay dùng hàng ngày', example: 'An important email.' },
        { word: 'Crucial', nuance: 'Cực kỳ quyết định đến thành bại của cả dự án/kế hoạch', example: 'A crucial milestone for Q4.' },
        { word: 'Pivotal', nuance: 'Mang tính bước ngoặt làm xoay chuyển toàn bộ cục diện', example: 'A pivotal partnership agreement.' },
        { word: 'Vital', nuance: 'Sống còn, thiết yếu không thể thiếu được', example: 'Vital data for business strategy.' }
      ]
    }
  ];

  const handleAnalyzeWithAi = async () => {
    if (!searchWord.trim()) return;
    setIsLoadingAi(true);
    setAiResult(null);

    try {
      const result = await aiService.analyzeSynonyms(searchWord.trim());
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupTitle.trim()) return;

    const parsedWords = groupWordsText
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const newGroup = {
      id: `syn-${Date.now()}`,
      title: groupTitle.trim(),
      words: parsedWords.map((w) => ({ word: w, nuance: '' })),
      notes: groupNotes.trim()
    };

    onSaveSynonymGroups([newGroup, ...synonymGroups]);
    setGroupTitle('');
    setGroupWordsText('');
    setGroupNotes('');
    setIsCreatingGroup(false);
  };

  const handleDeleteGroup = (id) => {
    onSaveSynonymGroups(synonymGroups.filter((g) => g.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* AI Synonym Explorer Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
          border: '1px solid #e9d5ff',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={22} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AI Khám Phá & So Sánh Sắc Thái Từ Đồng Nghĩa
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
          Nhập một từ bất kỳ (ví dụ: <em>Resolve, Mitigate, Facilitate, Enhance, Allocate</em>) để AI phân tích sự khác biệt tinh tế khi dùng trong công sở.
        </p>

        <div style={{ display: 'flex', gap: '10px', maxWidth: '640px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Nhập từ cần tra từ đồng nghĩa..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeWithAi()}
          />
          <button
            className="btn btn-ai"
            onClick={handleAnalyzeWithAi}
            disabled={isLoadingAi}
            style={{ minWidth: '160px' }}
          >
            {isLoadingAi ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang Phân Tích...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>So Sánh Sắc Thái</span>
              </>
            )}
          </button>
        </div>

        {/* AI Analysis Result */}
        {aiResult && (
          <div
            style={{
              marginTop: '20px',
              padding: '18px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              {aiResult.groupName || `Nhóm từ đồng nghĩa cho "${searchWord}"`}
            </h3>
            {aiResult.coreConceptVi && (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Khái niệm cốt lõi: {aiResult.coreConceptVi}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {aiResult.words?.map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {w.word}
                      </span>
                      {w.ipa && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                          {w.ipa}
                        </span>
                      )}
                    </div>
                    <button
                      className="audio-btn"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => ttsService.speak(w.word, { voiceType: speechVoice })}
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>

                  {w.meaningVi && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                      {w.meaningVi}
                    </div>
                  )}

                  {w.nuance && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-main)' }}>Sắc thái:</strong> {w.nuance}
                    </div>
                  )}

                  {w.exampleEn && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>"{w.exampleEn}"</span>
                      {w.exampleVi && <div style={{ marginTop: '2px' }}>➔ {w.exampleVi}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User's Synonym Groups & Clusters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Thư Viện Nhóm Từ Đồng Nghĩa Của Bạn
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Gom nhóm các từ có cùng trường nghĩa để mở rộng vốn từ khi viết email và báo cáo.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreatingGroup(true)}>
          <Plus size={16} /> Thêm Nhóm Mới
        </button>
      </div>

      {/* Create New Group Modal */}
      {isCreatingGroup && (
        <div className="card" style={{ padding: '20px', border: '1px solid var(--border-medium)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
            Tạo Nhóm Từ Đồng Nghĩa Mới
          </h4>
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Tên chủ đề nhóm từ
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Đàm phán & Thỏa thuận, Cải thiện năng suất..."
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Các từ trong nhóm (cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Negotiate, Bargain, Compromise, Reach an accord..."
                value={groupWordsText}
                onChange={(e) => setGroupWordsText(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Ghi chú hoặc phân biệt sắc thái riêng
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Dùng Compromise khi mỗi bên nhượng bộ một phần..."
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingGroup(false)}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu Nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Display All Groups (Curated + Custom) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {[...synonymGroups, ...defaultClusters].map((group) => (
          <div key={group.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {group.title}
              </h4>
              {synonymGroups.some((g) => g.id === group.id) && (
                <button
                  className="btn-icon"
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Xóa nhóm này"
                  style={{ padding: '4px' }}
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {group.words.map((item, i) => {
                const wordName = typeof item === 'string' ? item : item.word;
                const nuance = typeof item === 'object' ? item.nuance : '';
                return (
                  <div
                    key={i}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {wordName}
                      </span>
                      <button
                        className="audio-btn"
                        style={{ width: '22px', height: '22px' }}
                        onClick={() => ttsService.speak(wordName, { voiceType: speechVoice })}
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    {nuance && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {nuance}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {group.notes && (
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  fontStyle: 'italic'
                }}
              >
                📝 {group.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
