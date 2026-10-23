import React, { useState } from 'react';
import {
  Settings,
  Key,
  Volume2,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { aiService } from '../services/aiService';
import CustomSelect from './CustomSelect';

export default function SettingsView({
  settings,
  onSaveSettings,
  words,
  onRestoreWords
}) {
  const [provider, setProvider] = useState(settings.aiProvider || 'gemini');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel || 'gemini-2.0-flash');
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-4o-mini');
  const [speechVoice, setSpeechVoice] = useState(settings.speechVoice || 'US');
  const [speechRate, setSpeechRate] = useState(settings.speechRate || 1.0);
  const [dailyReviewTarget, setDailyReviewTarget] = useState(settings.dailyReviewTarget || 10);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { type: 'success'|'error', msg: '' }
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const updated = {
      ...settings,
      aiProvider: provider,
      geminiApiKey: geminiApiKey.trim(),
      openaiApiKey: openaiApiKey.trim(),
      geminiModel,
      openaiModel,
      speechVoice,
      speechRate,
      dailyReviewTarget
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestAi = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      // Temporarily save before test
      handleSave();
      const testResult = await aiService.enrichWord('Innovate');
      if (testResult && testResult.meaningVi) {
        setTestStatus({
          type: 'success',
          msg: `Kết nối thành công! AI đã phân tích thử từ "Innovate": ${testResult.meaningVi}`
        });
      } else {
        throw new Error('Không nhận được kết quả hợp lệ.');
      }
    } catch (err) {
      setTestStatus({
        type: 'error',
        msg: `Kết nối thất bại: ${err.message || 'Vui lòng kiểm tra lại API Key.'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(words, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkingEnglish_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (Array.isArray(parsed)) {
          onRestoreWords(parsed);
          alert(`Đã khôi phục thành công ${parsed.length} từ vựng!`);
        } else {
          alert('Tệp sao lưu không đúng định dạng JSON.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp sao lưu: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '800px' }}>
      {savedSuccess && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span>Đã lưu cài đặt thành công!</span>
        </div>
      )}

      {/* AI Provider Configuration */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Key size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Cấu Hình AI Trợ Lý (AI Engine)</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Hỗ trợ linh hoạt cả Google Gemini và OpenAI để tự động tạo phiên âm, ví dụ công sở và phân tích lỗi ngữ pháp.
        </p>

        {/* Provider Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setProvider('gemini')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: provider === 'gemini' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${provider === 'gemini' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              color: provider === 'gemini' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} color="#c084fc" />
            <span>Google Gemini (Miễn phí & Khuyên dùng)</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('openai')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: provider === 'openai' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${provider === 'openai' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              color: provider === 'openai' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>OpenAI (GPT-4o / GPT-4o-mini)</span>
          </button>
        </div>

        {/* Gemini Inputs */}
        {provider === 'gemini' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  className="input-field"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Model
                </label>
                <CustomSelect
                  value={geminiModel}
                  onChange={(val) => setGeminiModel(val)}
                  options={[
                    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Cực nhanh, mới nhất)' },
                    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Ổn định)' }
                  ]}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.82rem',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 0'
                  }}
                >
                  <span>Lấy API Key miễn phí tại Google AI Studio</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* OpenAI Inputs */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                OpenAI API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  className="input-field"
                  placeholder="sk-proj-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Model
              </label>
              <CustomSelect
                value={openaiModel}
                onChange={(val) => setOpenaiModel(val)}
                options={[
                  { value: 'gpt-4o-mini', label: 'GPT-4o-mini (Nhanh & Tiết kiệm)' },
                  { value: 'gpt-4o', label: 'GPT-4o (Thông minh toàn diện)' }
                ]}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTestAi}
            disabled={isTesting}
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối AI'}</span>
          </button>

          {testStatus && (
            <div
              style={{
                fontSize: '0.82rem',
                color: testStatus.type === 'success' ? '#34d399' : '#f87171'
              }}
            >
              {testStatus.msg}
            </div>
          )}
        </div>
      </div>

      {/* Pronunciation & Audio Settings */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Volume2 size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Cài Đặt Phát Âm (Text-to-Speech)</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
          Tùy chỉnh giọng đọc chuẩn bản xứ và tốc độ phát âm để luyện nghe tốt nhất.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Giọng phát âm mặc định
            </label>
            <CustomSelect
              value={speechVoice}
              onChange={(val) => setSpeechVoice(val)}
              options={[
                { value: 'US', label: '🇺🇸 Tiếng Anh - Mỹ (English US)' },
                { value: 'UK', label: '🇬🇧 Tiếng Anh - Anh (English UK)' }
              ]}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Tốc độ đọc
            </label>
            <CustomSelect
              value={speechRate}
              onChange={(val) => setSpeechRate(parseFloat(val))}
              options={[
                { value: 0.8, label: '0.8x (Chậm, rõ âm cho người mới)' },
                { value: 1.0, label: '1.0x (Chuẩn tự nhiên)' },
                { value: 1.2, label: '1.2x (Nhanh, phản xạ cao)' }
              ]}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              ttsService.speak('Welcome to WorkingEnglish. Let us elevate your vocabulary and communication.', {
                voiceType: speechVoice,
                rate: speechRate
              })
            }
          >
            <Volume2 size={15} /> Thử Giọng Đọc
          </button>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sao Lưu & Phục Hồi Dữ Liệu</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
          Dữ liệu của bạn được lưu an toàn 100% trên máy tính. Bạn có thể xuất file sao lưu JSON bất cứ lúc nào.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportData}>
            <Download size={15} /> Xuất Dữ Liệu Ra File JSON
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Nhập Dữ Liệu Từ File JSON
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportData}
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} style={{ minWidth: '160px' }}>
          Lưu Mọi Cài Đặt
        </button>
      </div>
    </div>
  );
}
