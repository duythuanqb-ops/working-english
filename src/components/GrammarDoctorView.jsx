import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Volume2,
  ArrowRight,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { ttsService } from '../services/ttsService';

export default function GrammarDoctorView({ initialSentence = '', speechVoice }) {
  const [inputText, setInputText] = useState(
    initialSentence ||
      'We will discuss about this issue in the meeting and I have some good advices for you.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample sentences for quick testing
  const sampleSentences = [
    'We will discuss about this issue and I have many good advices for you.',
    'Thank you for your feedbacks, I look forward to hear from you soon.',
    'I suggest you to finish this task before Friday.',
    'If we had more budget, we will hire two additional senior engineers.',
    'The data are showing that our revenue was increased by 15% last month.'
  ];

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Vui lòng nhập câu hoặc đoạn văn tiếng Anh cần kiểm tra.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await aiService.checkGrammar(inputText.trim());
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể kiểm tra ngữ pháp lúc này. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(88, 28, 135, 0.25) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Stethoscope size={24} color="#c084fc" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Bác Sĩ Ngữ Pháp & Hiệu Đính Tự Động (Grammar Doctor)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '780px', lineHeight: 1.5 }}>
          Gõ hoặc dán câu tiếng Anh của bạn vào bên dưới. AI sẽ <strong>chỉ rõ từ nào sai, tại sao sai theo ngữ pháp</strong> và <strong>hướng dẫn bạn cách sửa</strong> để nhớ sâu bản chất!
        </p>

        {/* Quick Sample Prompts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Thử mẫu câu sai phổ biến:
          </span>
          {sampleSentences.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample);
                setAnalysisResult(null);
              }}
              style={{
                fontSize: '0.74rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '4px 9px',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Mẫu {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="card" style={{ padding: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
          Nhập câu, email hoặc đoạn văn tiếng Anh của bạn:
        </label>
        <textarea
          className="textarea-field"
          rows={4}
          style={{ resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.5 }}
          placeholder="Ví dụ: We will discuss about this issue in the meeting..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {errorMsg && (
          <div style={{ color: '#f87171', fontSize: '0.84rem', marginTop: '8px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button
            className="btn btn-primary"
            onClick={handleCheckGrammar}
            disabled={isLoading}
            style={{ minWidth: '180px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang Chẩn Đoán...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Chẩn Đoán & Sửa Lỗi Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagnostic & Correction Result */}
      {analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Header */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: analysisResult.hasErrors
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${
                analysisResult.hasErrors
                  ? 'rgba(239, 68, 68, 0.35)'
                  : 'rgba(16, 185, 129, 0.35)'
              }`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {analysisResult.hasErrors ? (
              <AlertTriangle size={24} color="#ef4444" />
            ) : (
              <CheckCircle2 size={24} color="#10b981" />
            )}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: analysisResult.hasErrors ? '#fca5a5' : '#6ee7b7' }}>
                {analysisResult.hasErrors
                  ? `Phát hiện ${analysisResult.issues?.length || 'một số'} lỗi ngữ pháp / diễn đạt cần sửa`
                  : 'Xuất sắc! Câu văn của bạn hoàn toàn chính xác ngữ pháp'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {analysisResult.generalAdviceVi}
              </p>
            </div>
          </div>

          {/* Corrected vs Original Comparison */}
          <div className="card" style={{ padding: '20px' }}>
            {analysisResult.hasErrors && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                  Câu gốc của bạn (chứa lỗi):
                </span>
                <p
                  style={{
                    fontSize: '1rem',
                    color: '#e2e8f0',
                    background: 'rgba(239, 68, 68, 0.07)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginTop: '6px',
                    textDecoration: 'line-through'
                  }}
                >
                  {analysisResult.originalSentence}
                </p>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                  ✅ Câu sửa lại chuẩn xác:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="audio-btn"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => ttsService.speak(analysisResult.correctedSentence, { voiceType: speechVoice })}
                    title="Nghe câu đúng"
                  >
                    <Volume2 size={14} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                    onClick={() => handleCopy(analysisResult.correctedSentence)}
                  >
                    {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              <p
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 600,
                  color: '#f8fafc',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginTop: '6px'
                }}
              >
                {analysisResult.correctedSentence}
              </p>
            </div>

            {/* Professional Native Business Version */}
            {analysisResult.professionalVersion && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                  💼 Phiên bản viết nâng cao chuẩn công sở (Native Business Tone):
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginTop: '6px'
                  }}
                >
                  <p style={{ fontSize: '0.94rem', color: '#f8fafc', fontWeight: 500 }}>
                    "{analysisResult.professionalVersion}"
                  </p>
                  <button
                    className="audio-btn"
                    style={{ width: '26px', height: '26px' }}
                    onClick={() => ttsService.speak(analysisResult.professionalVersion, { voiceType: speechVoice })}
                  >
                    <Volume2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Error Breakdown Table */}
          {analysisResult.issues && analysisResult.issues.length > 0 && (
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Lightbulb size={18} color="#f59e0b" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                  Phân Tích Chi Tiết Từng Lỗi Sai & Bản Chất Ngữ Pháp
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysisResult.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: 'line-through'
                        }}
                      >
                        {issue.errorText}
                      </span>
                      <ArrowRight size={15} color="var(--text-muted)" />
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {issue.correction}
                      </span>
                      {issue.ruleName && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#93c5fd',
                            background: 'rgba(59, 130, 246, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: 'auto'
                          }}
                        >
                          Quy tắc: {issue.ruleName}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '4px' }}>
                      <strong>Giải thích:</strong> {issue.explanationVi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
