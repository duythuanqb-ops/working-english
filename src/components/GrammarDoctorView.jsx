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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
          border: '1px solid #e9d5ff',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Stethoscope size={24} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
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
        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
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
          <div style={{ color: '#dc2626', fontSize: '0.84rem', marginTop: '8px' }}>
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
              background: analysisResult.hasErrors ? '#fef2f2' : '#ecfdf5',
              border: `1px solid ${analysisResult.hasErrors ? '#fecaca' : '#a7f3d0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {analysisResult.hasErrors ? (
              <AlertTriangle size={24} color="#dc2626" />
            ) : (
              <CheckCircle2 size={24} color="#059669" />
            )}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: analysisResult.hasErrors ? '#b91c1c' : '#047857' }}>
                {analysisResult.hasErrors
                  ? `Phát hiện ${analysisResult.issues?.length || 'một số'} lỗi ngữ pháp / diễn đạt cần sửa`
                  : 'Xuất sắc! Câu văn của bạn hoàn toàn chính xác ngữ pháp'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {analysisResult.generalAdviceVi}
              </p>
            </div>
          </div>

          {/* Corrected vs Original Comparison */}
          <div className="card" style={{ padding: '20px' }}>
            {analysisResult.hasErrors && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>
                  Câu gốc của bạn (chứa lỗi):
                </span>
                <p
                  style={{
                    fontSize: '1rem',
                    color: '#991b1b',
                    background: '#fef2f2',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fecaca',
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
                <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
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
                    {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              <p
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 600,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #a7f3d0',
                  marginTop: '6px'
                }}
              >
                {analysisResult.correctedSentence}
              </p>
            </div>

            {/* Professional Native Business Version */}
            {analysisResult.professionalVersion && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  💼 Phiên bản viết nâng cao chuẩn công sở (Native Business Tone):
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginTop: '6px'
                  }}
                >
                  <p style={{ fontSize: '0.94rem', color: '#0369a1', fontWeight: 600 }}>
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
                <Lightbulb size={18} color="#d97706" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Phân Tích Chi Tiết Từng Lỗi Sai & Bản Chất Ngữ Pháp
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysisResult.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
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
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
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
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
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
                            color: 'var(--primary)',
                            background: '#eef2ff',
                            border: '1px solid #c7d2fe',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: 'auto',
                            fontWeight: 600
                          }}
                        >
                          Quy tắc: {issue.ruleName}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Giải thích:</strong> {issue.explanationVi}
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
