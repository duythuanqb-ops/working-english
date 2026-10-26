import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, BookmarkPlus, Check } from 'lucide-react';
import { useLocalData, loadData, useRecorder, speak, analyzeSpeech, addHistory, fmtTime } from './speakingUtils';

// /practice/speaking/roulette — "Speaking Roulette": a fan of 18 cards, spin to draw a random question.
const THEME = { '--bg': '#16352a', '--ink': '#f4f1e6', '--ink-soft': 'rgba(244,241,230,0.66)', '--ink-faint': 'rgba(244,241,230,0.40)', '--line': 'rgba(244,241,230,0.16)', '--panel': 'rgba(15,38,30,0.82)', '--display': '"Playfair Display", Georgia, serif' };
const PALETTE = ['#C75D4F', '#E0A93B', '#7F9461', '#D7C9A8', '#C68799', '#3E7C76', '#A8552E', '#4F6D8C', '#B6694A', '#5E8C6A'];
const MODES = [{ id: 'p1', label: 'Part 1', sub: 'Interview' }, { id: 'p2', label: 'Part 2', sub: 'Cue Card' }, { id: 'p3', label: 'Part 3', sub: 'Discussion' }];
const FAVS_KEY = 'ielts_favs';

const inkFor = hex => {
  const t = hex.replace('#', '');
  return (0.299 * parseInt(t.slice(0, 2), 16) + 0.587 * parseInt(t.slice(2, 4), 16) + 0.114 * parseInt(t.slice(4, 6), 16)) / 255 > 0.62 ? '#27201a' : '#fbf6ec';
};
const paletteFor = accent => {
  const ink = inkFor(accent);
  const light = ink === '#fbf6ec';
  return {
    accent, ink, fill: ink, onFill: accent,
    soft: light ? 'rgba(251,246,236,0.76)' : 'rgba(39,32,26,0.68)',
    faint: light ? 'rgba(251,246,236,0.54)' : 'rgba(39,32,26,0.48)',
    line: light ? 'rgba(251,246,236,0.24)' : 'rgba(39,32,26,0.20)',
    panel: light ? 'rgba(0,0,0,0.17)' : 'rgba(255,255,255,0.36)',
  };
};

// Weighted shuffle so unseen cards come up first (site's roulette_seen_<mode>)
function dealFan(pool, mode) {
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem(`roulette_seen_${mode}`) || '{}'); } catch { /* ignore */ }
  let weights = pool.map(c => (seen[c.id] ? 1 : 10));
  if (pool.every(c => seen[c.id])) { weights = pool.map(() => 10); try { localStorage.setItem(`roulette_seen_${mode}`, '{}'); } catch { /* ignore */ } }
  let bag = [];
  pool.forEach((_, i) => { for (let k = 0; k < weights[i]; k++) bag.push(i); });
  const out = [];
  for (let k = 0; k < 18 && bag.length; k++) { const pick = bag[Math.floor(Math.random() * bag.length)]; out.push(pick); bag = bag.filter(x => x !== pick); }
  while (out.length < 18 && pool.length) out.push(Math.floor(Math.random() * pool.length));
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

function Pattern({ seed, opacity }) {
  const s = ((seed % 7) + 7) % 7;
  const g = { fill: 'none', stroke: 'currentColor', strokeWidth: 7, strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke' };
  const shapes = [
    <g {...g}><circle cx="150" cy="215" r="42" /><circle cx="150" cy="215" r="22" /><path d="M20 40 Q105 120 190 40" /></g>,
    <g {...g}><circle cx="45" cy="120" r="48" /><circle cx="120" cy="120" r="48" /><circle cx="195" cy="120" r="48" /></g>,
    <g {...g}><path d="M-10 60 L220 20" /><path d="M-10 140 L220 100" /><path d="M-10 220 L220 180" /></g>,
    <g {...g}><path d="M60 -10 L60 290" /><path d="M150 -10 L150 290" /><path d="M-10 200 L220 200" /></g>,
    <g {...g}><path d="M30 250 Q105 60 180 250" /><circle cx="120" cy="120" r="16" /><circle cx="175" cy="210" r="22" /></g>,
    <g {...g}><path d="M20 20 L190 260" /><path d="M190 20 L20 260" /></g>,
    <g {...g}><path d="M10 70 h190" /><path d="M10 110 h190" /><path d="M10 150 h190" /></g>,
  ];
  return <svg viewBox="0 0 210 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}>{shapes[s]}</svg>;
}

function Fan({ pool, fan, hot, phase, onSpin }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 430, transform: 'scale(var(--fan-fit, 1))', transformOrigin: '50% 50%', pointerEvents: phase === 'spinning' ? 'none' : 'auto', transition: 'opacity .4s, filter .4s', opacity: phase === 'result' ? 0.12 : 1, filter: phase === 'result' ? 'blur(3px)' : 'none' }}>
      {fan.map((ci, r) => {
        const card = pool[ci];
        if (!card) return null;
        const angle = (r - 8.5) * 5.6;
        const bg = PALETTE[r % PALETTE.length];
        const ink = inkFor(bg);
        const isHot = hot === r;
        return (
          <div key={r} className={`fancard${isHot ? ' hot' : ''}`} onClick={() => phase !== 'spinning' && onSpin()}
            style={{ position: 'absolute', left: '50%', bottom: 0, width: 178, height: 252, marginLeft: -89, transformOrigin: '50% calc(100% + 330px)', transform: `rotate(${angle}deg) translateY(${isHot ? -34 : 0}px) scale(${isHot ? 1.07 : 1})`, borderRadius: 16, background: bg, color: ink, zIndex: r, boxShadow: isHot ? '0 26px 60px rgba(0,0,0,.5)' : '0 10px 26px rgba(0,0,0,.34)', padding: '19px 17px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,.14)', cursor: 'pointer', overflow: 'hidden' }}>
            <Pattern seed={ci} opacity={ink === '#fbf6ec' ? 0.18 : 0.22} />
            <div style={{ position: 'relative', opacity: 0.85, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.topic}</div>
            <div style={{ position: 'relative', fontFamily: 'var(--display)', fontSize: 42, lineHeight: 0.9, fontWeight: 700, opacity: 0.92 }}>?</div>
            <div style={{ position: 'relative', height: 1, background: 'currentColor', opacity: 0.22 }} />
          </div>
        );
      })}
    </div>
  );
}

function Btn({ s, ghost, onClick, children }) {
  return <button onClick={onClick} className="icon-btn" style={{ fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 9, background: ghost ? 'transparent' : s.fill, color: ghost ? s.soft : s.onFill, border: ghost ? `1px solid ${s.line}` : 'none' }}>{children}</button>;
}

// Part 2 prep/talk ring timer
function CueTimer({ s }) {
  const [phase, setPhase] = useState('idle');
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (phase !== 'prep' && phase !== 'talk') return undefined;
    const t = setInterval(() => setLeft(v => {
      if (v > 1) return v - 1;
      if (phase === 'prep') { setPhase('talk'); return 120; }
      setPhase('done'); return 0;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);
  const total = phase === 'prep' ? 60 : phase === 'talk' ? 120 : 1;
  const C = 2 * Math.PI * 32;
  const pct = phase === 'idle' ? 0 : phase === 'done' ? 1 : 1 - left / total;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="32" fill="none" stroke={s.line} strokeWidth="6" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={s.fill} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 19, fontWeight: 700, color: s.ink }}>{phase === 'idle' ? '1:00' : phase === 'done' ? '0:00' : fmtTime(left)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: s.faint, fontWeight: 700 }}>{phase === 'prep' ? 'Preparing' : phase === 'talk' ? 'Speaking' : phase === 'done' ? "Time's up" : 'Ready · 1 min prep, 2 min talk'}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {phase === 'idle' && <Btn s={s} onClick={() => { setPhase('prep'); setLeft(60); }}>Start prep</Btn>}
          {phase === 'prep' && <Btn s={s} onClick={() => { setPhase('talk'); setLeft(120); }}>Skip to talk</Btn>}
          {(phase === 'talk' || phase === 'done') && <Btn s={s} onClick={() => { setPhase('prep'); setLeft(60); }}>Restart</Btn>}
          {phase !== 'idle' && <Btn s={s} ghost onClick={() => { setPhase('idle'); setLeft(0); }}>Reset</Btn>}
        </div>
      </div>
    </div>
  );
}

function Practice({ s, item, part }) {
  const [res, setRes] = useState(null);
  const question = item.q || item.topic;
  const rec = useRecorder({
    maxSeconds: part === 2 ? 120 : 90,
    onDone: r => { setRes(r); addHistory({ mode: 'speaking_roulette', topic: item.topic, question, transcript: r.transcript, duration: r.duration, wpm: analyzeSpeech(r.transcript, r.duration).wpm }); },
  });
  useEffect(() => { setRes(null); }, [question]);
  const m = res ? analyzeSpeech(res.transcript, res.duration) : null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {rec.recording ? (
          <>
            <Btn s={s} onClick={rec.stop}><span className="rec-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: '#e5484d', marginRight: 6 }} />Stop · {fmtTime(rec.seconds)}</Btn>
            <Btn s={s} ghost onClick={rec.cancel}>Cancel</Btn>
          </>
        ) : <Btn s={s} onClick={rec.start}>🎤 {res ? 'Record again' : 'Start recording'}</Btn>}
      </div>
      {rec.recording && rec.interim && <p className="vsent" style={{ marginTop: 10, fontSize: 14, fontStyle: 'italic', color: s.soft }}>{rec.interim}</p>}
      {rec.error && <p style={{ marginTop: 10, fontSize: 13, color: s.ink, fontWeight: 700 }}>{rec.error}</p>}
      {res && (
        <div style={{ marginTop: 14, background: s.panel, borderRadius: 12, padding: 14 }}>
          <audio src={res.url} controls style={{ width: '100%' }} />
          {res.transcript && <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.55, fontStyle: 'italic' }}>“{res.transcript}”</p>}
          <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, fontWeight: 700, color: s.soft, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            <span>{res.duration}s</span><span>{m.wordCount} words</span><span>{m.wpm || '—'} wpm</span><span>{m.fillerCount} fillers</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ mode, item, accent, isFav, onFav, onAgain, onClose, onSaveWord }) {
  const s = paletteFor(accent);
  const isCue = !!item.bullets;
  const [hint, setHint] = useState(false);
  const [saved, setSaved] = useState({});
  const label = MODES.find(m => m.id === mode)?.label;
  const cap = { fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: s.faint, fontWeight: 700 };
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150, padding: 30 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,18,14,.6)', backdropFilter: 'blur(3px)', animation: 'spkFadeIn .3s both' }} />
      <div style={{ position: 'relative', width: isCue ? 680 : 600, maxWidth: '94vw', maxHeight: '88vh', overflow: 'auto', background: accent, color: s.ink, borderRadius: 26, border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 40px 90px rgba(0,0,0,.55)', padding: '30px 34px', animation: 'posterRise .55s cubic-bezier(.2,.8,.25,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...cap, color: s.ink }}>{label}</span>
            <span style={{ width: 4, height: 4, borderRadius: 9, background: s.faint }} />
            <span style={cap}>{item.topic}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setHint(h => !h)} title="Gợi ý" className="icon-btn" style={{ background: 'transparent', border: `1px solid ${s.line}`, color: s.ink, borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 700 }}>💡 Gợi ý</button>
            <button onClick={onFav} title="Save question" className="icon-btn" style={{ background: 'transparent', border: `1px solid ${s.line}`, color: isFav ? '#E9B949' : s.ink, borderRadius: 10, padding: '7px 10px', fontSize: 15 }}>{isFav ? '★' : '☆'}</button>
          </div>
        </div>

        {hint && (
          <div style={{ marginTop: 18, background: '#faf9f2', color: '#27201a', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>💡 Gợi ý từ TID</div>
            <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 800, color: '#4a6b2a', marginBottom: 6 }}>🧠 Ý tưởng trả lời</div>
            <ul style={{ display: 'grid', gap: 6 }}>{(item.cues || item.bullets || []).map((c, i) => <li key={i} style={{ background: '#fff', borderRadius: 10, padding: '8px 10px', fontSize: 14 }}><strong>{c}</strong></li>)}</ul>
          </div>
        )}

        {isCue ? (
          <>
            <div style={{ fontFamily: 'var(--display)', fontSize: 34, lineHeight: 1.1, fontWeight: 700, marginTop: 18 }}>{item.topic}</div>
            <div style={{ ...cap, marginTop: 18, marginBottom: 10 }}>You should say</div>
            <ul style={{ display: 'grid', gap: 10 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 18 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: s.ink, color: accent, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span><span>{b}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${s.line}` }}><CueTimer s={s} /></div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--display)', fontSize: 31, lineHeight: 1.15, fontWeight: 700, marginTop: 18 }}>{item.q}</div>
            <div style={{ ...cap, marginTop: 18, marginBottom: 10 }}>Things you could talk about</div>
            <ul style={{ display: 'grid', gap: 8 }}>
              {item.cues.map((c, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 17 }}>
                  <span style={{ fontSize: 17, fontFamily: 'var(--display)', fontWeight: 700, opacity: 0.6 }}>{i + 1}</span><span>{c}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {item.vocab?.length > 0 && (
          <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${s.line}` }}>
            <div style={{ ...cap, marginBottom: 12 }}>Useful vocabulary</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {item.vocab.map((v, i) => (
                <div key={i} className="vsent" style={{ animationDelay: `${i * 0.05}s`, background: s.panel, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{v.t}</div>
                    <div style={{ fontSize: 14, color: s.soft, fontStyle: 'italic', marginTop: 2 }}>{v.s}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => speak(v.s)} title="Nghe" className="icon-btn" style={{ color: s.ink, border: `1px solid ${s.line}`, borderRadius: 8, padding: 6 }}><Volume2 size={14} /></button>
                    {onSaveWord && (
                      <button title="Lưu vào sổ từ vựng" className="icon-btn" style={{ color: s.ink, border: `1px solid ${s.line}`, borderRadius: 8, padding: 6 }}
                        onClick={() => { onSaveWord({ word: v.t, meaningVi: '', partOfSpeech: 'phrase', examples: [{ en: v.s, vi: '' }], tags: ['IELTS Speaking'] }); setSaved(x => ({ ...x, [i]: true })); }}>
                        {saved[i] ? <Check size={14} /> : <BookmarkPlus size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${s.line}` }}>
          <div style={{ ...cap, marginBottom: 13 }}>Practise speaking</div>
          <Practice s={s} item={item} part={mode === 'p2' ? 2 : mode === 'p3' ? 3 : 1} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 20, borderTop: `1px solid ${s.line}` }}>
          <button onClick={onAgain} className="btn-spin" style={{ flex: '1 1 200px', minWidth: 0, whiteSpace: 'nowrap', padding: 15, borderRadius: 13, background: s.fill, color: s.onFill, fontWeight: 700, fontSize: 15.5, border: 'none' }}>Spin again</button>
          <button onClick={onClose} className="icon-btn" style={{ flex: '0 0 auto', whiteSpace: 'nowrap', padding: '15px 24px', borderRadius: 13, background: 'transparent', border: `1px solid ${s.line}`, color: s.soft, fontWeight: 600, fontSize: 15 }}>Back to deck</button>
        </div>
      </div>
    </div>
  );
}

function SavedDrawer({ open, favs, onClose, onOpen, onRemove }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 160, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', animation: 'spkFadeIn .25s both' }} />
      <div style={{ position: 'relative', width: 400, maxWidth: '92vw', height: '100%', background: 'var(--panel)', backdropFilter: 'blur(12px)', borderLeft: '1px solid var(--line)', padding: '26px 24px', overflowY: 'auto', color: 'var(--ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700 }}>Saved questions</div>
          <button onClick={onClose} style={{ color: 'var(--ink-soft)', fontSize: 18, background: 'transparent' }}>✕</button>
        </div>
        {favs.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--ink-faint)', lineHeight: 1.6 }}>No saved questions yet.<br />Tap the star on any question to keep it here.</div>
        ) : favs.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 12, cursor: 'pointer' }} onClick={() => onOpen(f)}>
            <span style={{ width: 10, height: 34, borderRadius: 4, background: f.accent, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontWeight: 700 }}>{MODES.find(m => m.id === f.mode)?.label} · {f.item.topic}</div>
              <div style={{ fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.item.q || f.item.topic}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onRemove(f.key); }} title="Remove" style={{ color: 'var(--ink-faint)', fontSize: 15, background: 'transparent' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Roulette({ onBack, onSaveWord }) {
  const [deck] = useLocalData(() => loadData('roulette'));
  const [mode, setMode] = useState('p1');
  const [phase, setPhase] = useState('idle');
  const [hot, setHot] = useState(-1);
  const [result, setResult] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [favs, setFavs] = useState(() => { try { return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'); } catch { return []; } });
  const pool = deck?.[mode] || [];
  const [fan, setFan] = useState([]);
  const spinning = useRef(false);
  const rootRef = useRef(null);
  const audioCtx = useRef(null);

  useEffect(() => { spinning.current = false; if (pool.length) setFan(dealFan(pool, mode)); setPhase('idle'); setHot(-1); setResult(null); }, [mode, deck]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = rootRef.current;
    const fit = () => el && el.style.setProperty('--fan-fit', String(Math.min(1, (el.clientWidth - 40) / 1080)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => () => { spinning.current = false; }, []);

  const tick = () => {
    try {
      audioCtx.current ||= new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(800, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      o.start(); o.stop(ctx.currentTime + 0.05);
    } catch { /* audio not available */ }
  };

  const spin = useCallback(() => {
    if (spinning.current || !pool.length) return;
    spinning.current = true;
    const order = dealFan(pool, mode);
    setFan(order); setPhase('spinning'); setResult(null);
    const steps = (1 + Math.floor(2 * Math.random())) * 18 + Math.floor(18 * Math.random());
    const startAt = Math.floor(18 * Math.random());
    const dur = 2400;
    const final = (startAt + steps) % 18;
    const t0 = performance.now();
    let last = -1;
    const frame = now => {
      if (!spinning.current) return;
      const p = Math.min(1, (now - t0) / dur);
      const cur = (startAt + Math.floor((1 - Math.pow(1 - p, 3)) * steps)) % 18;
      if (cur !== last) { setHot(cur); last = cur; tick(); }
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    setTimeout(() => {
      if (!spinning.current) return;
      spinning.current = false;
      setHot(final);
      const item = pool[order[final]];
      setResult({ item, accent: PALETTE[final % PALETTE.length] });
      setPhase('result');
      try {
        const seen = JSON.parse(localStorage.getItem(`roulette_seen_${mode}`) || '{}');
        seen[item.id] = (seen[item.id] || 0) + 1;
        localStorage.setItem(`roulette_seen_${mode}`, JSON.stringify(seen));
      } catch { /* ignore */ }
    }, dur + 360);
  }, [pool, mode]);

  const favKey = result ? `${mode}::${result.item.topic}|${result.item.q || ''}` : null;
  const isFav = !!favKey && favs.some(f => f.key === favKey);
  const saveFavs = list => { setFavs(list); try { localStorage.setItem(FAVS_KEY, JSON.stringify(list)); } catch { /* ignore */ } };

  return (
    <div ref={rootRef} className="spk-roulette flex h-full min-h-[640px] flex-col overflow-hidden bg-herb" style={{ ...THEME, color: 'var(--ink)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 38px 0', position: 'relative', zIndex: 5 }}>
        <button onClick={onBack} title="Back to Speaking Hub" className="transition-opacity hover:opacity-80" style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', color: 'var(--bg)', marginRight: 4, alignSelf: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </span>
          <span style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 700, letterSpacing: '-.01em', color: 'var(--ink)' }}>Speaking Roulette</span>
          <span style={{ fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontWeight: 700 }}>IELTS</span>
        </button>
        <button onClick={() => setDrawer(true)} className="icon-btn" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', borderRadius: 11, border: '1px solid var(--line)', color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14, background: 'transparent' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
          Saved {favs.length > 0 && <span style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '1px 7px' }}>{favs.length}</span>}
        </button>
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18, position: 'relative', zIndex: 5 }}>
        {MODES.map(m => {
          const on = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, padding: '10px 20px', borderRadius: 13, background: on ? 'var(--ink)' : 'transparent', border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, color: on ? 'var(--bg)' : 'var(--ink-soft)', minWidth: 130, lineHeight: 1.15, transition: 'color .2s, background .2s, border-color .2s' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.label}</span>
              <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.7, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.sub}</span>
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ width: '100%', marginBottom: 200 }}><Fan pool={pool} fan={fan} hot={hot} phase={phase} onSpin={spin} /></div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13, pointerEvents: phase === 'result' ? 'none' : 'auto' }}>
          <button onClick={spin} disabled={phase === 'spinning'} className="btn-spin" style={{ padding: '17px 52px', borderRadius: 99, fontFamily: 'var(--display)', fontSize: 21, fontWeight: 700, letterSpacing: '.01em', whiteSpace: 'nowrap', background: 'var(--ink)', color: 'var(--bg)', boxShadow: '0 14px 36px rgba(0,0,0,.4)', opacity: phase === 'spinning' ? 0.6 : 1, cursor: phase === 'spinning' ? 'default' : 'pointer', border: 'none' }}>
            {phase === 'spinning' ? 'Spinning…' : 'Spin the deck'}
          </button>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{phase === 'spinning' ? 'Finding your question' : 'Tap a card or the button to draw a random question'}</div>
        </div>
        {phase === 'result' && result && (
          <ResultCard mode={mode} item={result.item} accent={result.accent} isFav={isFav} onSaveWord={onSaveWord}
            onFav={() => saveFavs(isFav ? favs.filter(f => f.key !== favKey) : [{ key: favKey, mode, item: result.item, accent: result.accent }, ...favs])}
            onAgain={spin} onClose={() => { setPhase('idle'); setHot(-1); }} />
        )}
      </div>
      <SavedDrawer open={drawer} favs={favs} onClose={() => setDrawer(false)}
        onOpen={f => { setMode(f.mode); setDrawer(false); setTimeout(() => { setResult({ item: f.item, accent: f.accent }); setPhase('result'); }, 60); }}
        onRemove={k => saveFavs(favs.filter(f => f.key !== k))} />
    </div>
  );
}
