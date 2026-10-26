// Shared helpers for the Speaking area: lazy local data, recording (MediaRecorder + Web Speech API),
// TTS and simple local scoring (the site grades on its server; here everything runs offline).
import { useCallback, useEffect, useRef, useState } from 'react';
import { ttsService } from '../../../services/ttsService';

// ---------- lazy local data (import.meta.glob keeps the Electron file:// build working) ----------
const DATA = import.meta.glob('../../../data/tid/speaking/*.json');
const SHADOW = import.meta.glob('../../../data/tid/speaking/shadowing/*.json');
const DUB = import.meta.glob('../../../data/tid/speaking/dubbing/*.json');
const load = async (map, key) => {
  const fn = map[key];
  if (!fn) return null;
  const mod = await fn();
  return mod.default ?? mod;
};
export const loadData = name => load(DATA, `../../../data/tid/speaking/${name}.json`);
export const loadShadowing = name => load(SHADOW, `../../../data/tid/speaking/shadowing/${name}.json`);
export const loadDubbing = name => load(DUB, `../../../data/tid/speaking/dubbing/${name}.json`);

// Hook: load once, return [data, status]
export function useLocalData(loader, deps = []) {
  const [state, setState] = useState({ data: null, status: 'loading' });
  useEffect(() => {
    let alive = true;
    setState({ data: null, status: 'loading' });
    loader().then(d => alive && setState({ data: d, status: d ? 'ready' : 'error' }))
      .catch(() => alive && setState({ data: null, status: 'error' }));
    return () => { alive = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return [state.data, state.status];
}

// ---------- TTS ----------
export const VOICES = ['British (Anh-Anh)', 'American (Anh-Mỹ)', 'No Voice'];
export function speak(text, voice = 'British (Anh-Anh)', onEnd) {
  if (!text || voice === 'No Voice') return;
  const voiceType = /american|mỹ/i.test(voice) ? 'US' : 'UK';
  ttsService.speak(text.replace(/^\s*-\s+/gm, ''), { voiceType, rate: 1 }, onEnd);
}
export const stopSpeaking = () => ttsService.stop();

// ---------- text analysis ----------
const FILLER_RE = /\b(um|uh|like|you know|literally|basically|actually|right|so|well)\b/gi;
export function analyzeSpeech(text, seconds) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  const wpm = seconds > 0 ? Math.round((words.length / seconds) * 60) : 0;
  return { wordCount: words.length, wpm, fillerCount: ((text || '').match(FILLER_RE) || []).length };
}
export const tokenize = s => (s || '').toLowerCase().replace(/[’‘`']/g, '').split(/[^a-z0-9]+/).filter(Boolean);

// Word-level comparison of a reference sentence against what the recogniser heard (LCS alignment).
export function compareSentence(ref, said) {
  const refWords = (ref || '').split(/\s+/).filter(Boolean);
  const a = refWords.map(w => tokenize(w).join(''));
  const b = tokenize(said);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    dp[i][j] = a[i] && a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Array(a.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] && a[i] === b[j]) { ok[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  const scored = a.filter(Boolean).length || 1;
  const score = Math.round((ok.filter(Boolean).length / scored) * 100);
  return { score, words: refWords.map((w, i) => ({ w, ok: ok[i] || !a[i] })) };
}

// ---------- recording ----------
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const hasSpeechRecognition = !!SR;

// MediaRecorder for the audio + Web Speech API for a live transcript.
export function useRecorder({ maxSeconds = 0, onDone } = {}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const ref = useRef({});
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const cleanup = () => {
    const r = ref.current;
    clearInterval(r.timer);
    try { r.rec?.stop(); } catch { /* noop */ }
    r.rec = null;
    r.stream?.getTracks().forEach(t => t.stop());
    r.stream = null;
    setStream(null);
  };

  const stop = useCallback((cancel = false) => {
    const r = ref.current;
    if (!r.mr) return;
    r.cancelled = cancel;
    try { r.mr.state !== 'inactive' && r.mr.stop(); } catch { /* noop */ }
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    if (ref.current.mr) return;
    setError(''); setInterim(''); setSeconds(0);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const r = ref.current;
      r.stream = s; setStream(s);
      r.chunks = []; r.text = ''; r.cancelled = false; r.startedAt = Date.now();
      const mr = new MediaRecorder(s);
      mr.ondataavailable = e => e.data.size && r.chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(r.chunks, { type: mr.mimeType || 'audio/webm' });
        const duration = Math.max(1, Math.round((Date.now() - r.startedAt) / 1000));
        const transcript = (r.text || '').trim();
        const cancelled = r.cancelled;
        r.mr = null;
        cleanup();
        if (!cancelled) doneRef.current?.({ blob, url: URL.createObjectURL(blob), transcript, duration });
      };
      r.mr = mr;
      mr.start();
      if (SR) {
        const rec = new SR();
        rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true;
        rec.onresult = e => {
          let t = '';
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
          r.text = t; setInterim(t);
        };
        rec.onerror = () => {};
        rec.onend = () => { if (r.rec === rec) try { rec.start(); } catch { /* noop */ } };
        r.rec = rec;
        try { rec.start(); } catch { /* noop */ }
      }
      setRecording(true);
      r.timer = setInterval(() => {
        const sec = Math.round((Date.now() - r.startedAt) / 1000);
        setSeconds(sec);
        if (maxSeconds && sec >= maxSeconds) stop();
      }, 500);
    } catch (e) {
      console.error(e);
      setError('Không thể truy cập Micro. Vui lòng kiểm tra quyền thiết bị.');
      cleanup();
    }
  }, [maxSeconds, stop]);

  useEffect(() => () => { const r = ref.current; r.cancelled = true; try { r.mr?.stop(); } catch { /* noop */ } cleanup(); }, []);

  return { recording, seconds, interim, error, setError, stream, start, stop: () => stop(false), cancel: () => stop(true) };
}

// Space toggles recording (Esc cancels), ignoring typing in inputs — mirrors the site's useSpaceToRecord.
export function useSpaceToRecord({ canStart = true, recording, start, stop, cancel }) {
  const fns = useRef({});
  fns.current = { canStart, recording, start, stop, cancel };
  useEffect(() => {
    const onKey = e => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      const f = fns.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (f.recording) f.stop(); else if (f.canStart) f.start();
      } else if (e.key === 'Escape' && f.recording) f.cancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Local practice history (replaces the site's /api/speaking/sessions)
const HISTORY_KEY = 'tid_speaking_history_v1';
export function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
export function addHistory(entry) {
  try {
    const list = [{ ...entry, created_at: new Date().toISOString() }, ...readHistory()].slice(0, 300);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch { /* storage full / blocked */ }
}
