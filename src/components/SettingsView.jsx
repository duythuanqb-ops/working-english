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
  EyeOff,
  Bell,
  Clock,
  Flame
} from 'lucide-react';
import { ttsService } from '../services/ttsService';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
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
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || '20:00');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { type: 'success'|'error', msg: '' }
  const [isTesting, setIsTesting] = useState(false);
  const [testNotifStatus, setTestNotifStatus] = useState(null);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
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
      dailyReviewTarget: parseInt(dailyReviewTarget, 10) || 10,
      reminderEnabled,
      reminderTime
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    setTestNotifStatus(null);
    try {
      await notificationService.requestPermission();
      const sent = await notificationService.sendTestNotification();
      if (sent) {
        setTestNotifStatus({
          type: 'success',
          msg: 'Đã gửi thông báo thử nghiệm thành công! Hãy kiểm tra màn hình máy tính của bạn.'
        });
      } else {
        setTestNotifStatus({
          type: 'error',
          msg: 'Không thể gửi thông báo. Vui lòng kiểm tra quyền thông báo trên máy tính.'
        });
      }
    } catch (err) {
      setTestNotifStatus({
        type: 'error',
        msg: `Lỗi thông báo: ${err.message || 'Không xác định'}`
      });
    } finally {
      setIsTestingNotif(false);
      setTimeout(() => setTestNotifStatus(null), 6000);
    }
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

  const [backupNotice, setBackupNotice] = useState(null);

  const handleExportData = () => {
    try {
      const snapshot = storageService.exportFullSnapshot();
      const dataStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WorkingEnglish_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupNotice({
        type: 'success',
        msg: `Đã xuất gói sao lưu toàn diện (${snapshot.summary.wordsCount} từ vựng, Streak ${snapshot.summary.streak} ngày, toàn bộ tiến trình học).`
      });
      setTimeout(() => setBackupNotice(null), 4000);
    } catch (err) {
      alert('Lỗi xuất sao lưu: ' + err.message);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const res = storageService.importFullSnapshot(parsed);
        const restoredWords = storageService.getWords();
        onRestoreWords(restoredWords);
        setBackupNotice({
          type: 'success',
          msg: res.message || 'Khôi phục dữ liệu thành công!'
        });
        setTimeout(() => setBackupNotice(null), 5000);
      } catch (err) {
        setBackupNotice({
          type: 'error',
          msg: 'Lỗi khôi phục tệp: ' + err.message
        });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
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

      {/* Study Reminder & Daily Targets */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Bell size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Nhắc Nhở Học Tập & Ôn Từ Hàng Ngày</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px', lineHeight: 1.5 }}>
          Hệ thống tự động gửi thông báo Desktop nhắc nhở bạn vào đúng khung giờ mong muốn, giúp ôn tập các từ vựng đến hạn (Hộp 1 & 2 theo Leitner Spaced Repetition) và bảo vệ chuỗi ngày học Streak.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Toggle Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                Bật thông báo nhắc học trên máy tính
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Gửi thông báo Native Desktop nhắc nhở ôn từ vựng & điểm danh hàng ngày
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Time & Target settings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              opacity: reminderEnabled ? 1 : 0.5,
              pointerEvents: reminderEnabled ? 'auto' : 'none'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Khung giờ nhắc nhở hàng ngày
              </label>
              <CustomSelect
                value={reminderTime}
                onChange={(val) => setReminderTime(val)}
                options={[
                  { value: '07:30', label: '07:30 - Đầu buổi sáng' },
                  { value: '08:30', label: '08:30 - Bắt đầu làm việc' },
                  { value: '11:45', label: '11:45 - Nghỉ trưa' },
                  { value: '17:45', label: '17:45 - Tan làm' },
                  { value: '19:30', label: '19:30 - Đầu buổi tối' },
                  { value: '20:00', label: '20:00 - Sau bữa tối (Khuyên dùng)' },
                  { value: '21:00', label: '21:00 - Giờ học tập tối' },
                  { value: '22:00', label: '22:00 - Trước khi ngủ' }
                ]}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Mục tiêu ôn tập hàng ngày
              </label>
              <CustomSelect
                value={dailyReviewTarget}
                onChange={(val) => setDailyReviewTarget(parseInt(val, 10))}
                options={[
                  { value: 5, label: '5 từ / ngày (Nhẹ nhàng, thư thả)' },
                  { value: 10, label: '10 từ / ngày (Tiêu chuẩn khuyên dùng)' },
                  { value: 15, label: '15 từ / ngày (Tăng tốc ghi nhớ)' },
                  { value: 20, label: '20 từ / ngày (Chinh phục thần tốc)' }
                ]}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Test Notification Action */}
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestNotification}
              disabled={isTestingNotif || !reminderEnabled}
            >
              <Bell size={14} className={isTestingNotif ? 'animate-bounce' : ''} />
              <span>{isTestingNotif ? 'Đang gửi...' : 'Gửi Thử Thông Báo Desktop'}</span>
            </button>

            {testNotifStatus && (
              <div
                style={{
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: testNotifStatus.type === 'success' ? '#16A34A' : '#DC2626',
                  fontWeight: 600
                }}
              >
                {testNotifStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testNotifStatus.msg}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sao Lưu & Phục Hồi Dữ Liệu Toàn Diện</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px', lineHeight: 1.5 }}>
          Gói sao lưu toàn diện (Full App Snapshot) bao gồm: Sổ từ vựng, quy tắc ngữ pháp tự tạo, chuỗi ngày học Streak, cài đặt giọng đọc, ghi chú và toàn bộ tiến trình 4 kỹ năng của bạn.
        </p>

        {backupNotice && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              background: backupNotice.type === 'success' ? '#DCFCE7' : '#FEE2E2',
              border: backupNotice.type === 'success' ? '1.5px solid #16A34A' : '1.5px solid #DC2626',
              color: backupNotice.type === 'success' ? '#15803D' : '#991B1B',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {backupNotice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{backupNotice.msg}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportData}>
            <Download size={15} /> Xuất Gói Sao Lưu Toàn Diện (.JSON)
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Khôi Phục Dữ Liệu Từ File JSON
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
