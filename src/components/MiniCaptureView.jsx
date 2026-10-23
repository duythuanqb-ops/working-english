import React, { useState } from 'react';
import { Sparkles, X, Volume2, Loader2, Check, ArrowRight } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/ttsService';

export default function MiniCaptureView() {
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!word.trim()) return;

    setIsLoading(true);
    setEnrichedData(null);
    setSavedSuccess(false);

    try {
      const data = await aiService.enrichWord(word.trim());
      setEnrichedData(data);
      ttsService.speak(word.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    if (!enrichedData) return;

    const savedWord = storageService.addWord(enrichedData);

    // If running in Electron, notify main window
    if (window.electronAPI && window.electronAPI.sendQuickWord) {
      window.electronAPI.sendQuickWord(savedWord);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      if (window.electronAPI && window.electronAPI.closeMiniCapture) {
        window.electronAPI.closeMiniCapture();
      } else {
        window.close();
      }
    }, 800);
  };

  const handleClose = () => {
    if (window.electronAPI && window.electronAPI.closeMiniCapture) {
      window.electronAPI.closeMiniCapture();
    } else {
      window.close();
    }
  };

  return (
    <div className="mini-capture-window">
      {/* Mini Titlebar */}
      <div
        className="titlebar-drag-region"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="no-drag">
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            WorkingEnglish — Tra & Note Nhanh
          </span>
        </div>
        <button
          className="btn-icon no-drag"
          onClick={handleClose}
          style={{ padding: '4px', background: 'transparent', border: 'none' }}
        >
          <X size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Nhập từ cần note (e.g. Mitigate)..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          autoFocus
          style={{ fontSize: '1rem', padding: '10px 14px' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !word.trim()}
          style={{ minWidth: '85px' }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Tra từ</span>}
        </button>
      </form>

      {/* Enriched Result Preview */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {enrichedData ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  {enrichedData.word}
                </span>
                {enrichedData.ipa && (
                  <span style={{ fontSize: '0.85rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                    {enrichedData.ipa}
                  </span>
                )}
                {enrichedData.partOfSpeech && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {enrichedData.partOfSpeech}
                  </span>
                )}
              </div>
              <button
                className="audio-btn"
                style={{ width: '28px', height: '28px' }}
                onClick={() => ttsService.speak(enrichedData.word)}
              >
                <Volume2 size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
              {enrichedData.meaningVi}
            </div>

            {enrichedData.examples && enrichedData.examples.length > 0 && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <p style={{ color: '#e2e8f0' }}>"{enrichedData.examples[0].en}"</p>
                {enrichedData.examples[0].vi && (
                  <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    ➔ {enrichedData.examples[0].vi}
                  </p>
                )}
              </div>
            )}

            {enrichedData.synonyms && enrichedData.synonyms.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Đồng nghĩa:</span>
                {enrichedData.synonyms.slice(0, 3).map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              margin: 'auto 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Nhập từ vựng cần lưu nhanh khi đang đọc tài liệu, họp hoặc lướt web trên Mac.
          </div>
        )}
      </div>

      {/* Footer Action */}
      {enrichedData && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveAndClose}
            disabled={savedSuccess}
            style={{ width: '100%' }}
          >
            {savedSuccess ? (
              <>
                <Check size={16} color="#34d399" />
                <span>Đã lưu vào Sổ từ vựng!</span>
              </>
            ) : (
              <>
                <span>Lưu Vào Sổ Từ Vựng (Enter)</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
