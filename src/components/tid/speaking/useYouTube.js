import { useEffect, useRef, useState } from 'react';

// Minimal YouTube IFrame API wrapper used by the shadowing + dubbing players.
let apiPromise = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise(resolve => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

export function useYouTube(videoId, { mute = false } = {}) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setReady(false); setError(null);
    loadApi().then(YT => {
      if (!alive || !hostRef.current) return;
      const el = document.createElement('div');
      hostRef.current.innerHTML = '';
      hostRef.current.appendChild(el);
      playerRef.current = new YT.Player(el, {
        videoId,
        width: '100%', height: '100%',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, cc_load_policy: 0, iv_load_policy: 3, ...(window.location.protocol.startsWith('http') ? { origin: window.location.origin } : {}) },
        events: {
          onReady: e => { if (!alive) return; if (mute) e.target.mute(); setReady(true); },
          onStateChange: e => alive && setPlaying(e.data === 1),
          onError: e => alive && setError(e.data),
        },
      });
    });
    return () => {
      alive = false;
      try { playerRef.current?.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = {
    hostRef, ready, playing, error,
    player: () => playerRef.current,
    time: () => { try { return playerRef.current?.getCurrentTime?.() || 0; } catch { return 0; } },
    seek: t => { try { playerRef.current?.seekTo(t, true); } catch { /* noop */ } },
    play: () => { try { playerRef.current?.playVideo(); } catch { /* noop */ } },
    pause: () => { try { playerRef.current?.pauseVideo(); } catch { /* noop */ } },
    setRate: r => { try { playerRef.current?.setPlaybackRate(r); } catch { /* noop */ } },
    mute: m => { try { if (m) playerRef.current?.mute(); else playerRef.current?.unMute(); } catch { /* noop */ } },
  };
  return api;
}

// Play [start, end) once, then pause; calls onEnd when the segment finishes.
export function playSegment(yt, start, end, onEnd) {
  yt.seek(start);
  yt.play();
  const t0 = Date.now();
  const iv = setInterval(() => {
    const now = yt.time();
    if (now >= end - 0.05 || Date.now() - t0 > (end - start) * 1000 + 4000) {
      clearInterval(iv);
      yt.pause();
      onEnd?.();
    }
  }, 80);
  return () => clearInterval(iv);
}
