// Cambridge / library dictation lesson (= /practice/listening/<lessonId> on the site), audio from per-sentence MP3s.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DictationCore from './DictationCore';
import { loadLesson } from './data';

/** Media controller over one <audio> element: plays each sentence's own clip (or a time slice of the full track). */
export function useAudioMedia(challenges, fullSrc) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRateState] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [allIndex, setAllIndex] = useState(null);
  const seg = useRef({ start: 0, end: 0, sliced: false });
  const chain = useRef({ on: false, i: 0, continuous: false });
  const rateRef = useRef(1);

  const startClip = useCallback((i, fromChain = false) => {
    const a = audioRef.current;
    const c = challenges[i];
    if (!a || !c) return;
    if (!fromChain) chain.current.on = false;
    const own = c.audioSrc;
    if (own) {
      seg.current = { start: 0, end: 0, sliced: false };
      if (a.src !== own) a.src = own;
      a.currentTime = 0;
    } else if (fullSrc) {
      seg.current = { start: c.timeStart || 0, end: c.timeEnd || 0, sliced: true };
      if (a.src !== fullSrc) a.src = fullSrc;
      a.currentTime = c.timeStart || 0;
    } else return;
    a.playbackRate = rateRef.current;
    a.play().catch(() => setPlaying(false));
  }, [challenges, fullSrc]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const tick = () => {
      const s = seg.current;
      if (s.sliced) {
        if (s.end && a.currentTime >= s.end) { a.pause(); onEnd(); }
        setTime(Math.max(0, a.currentTime - s.start));
        setDuration(Math.max(0, (s.end || a.duration || 0) - s.start));
      } else {
        setTime(a.currentTime);
        setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      }
    };
    const onEnd = () => {
      setPlaying(false);
      const ch = chain.current;
      if (ch.on) {
        if (ch.continuous && ch.i + 1 < challenges.length) { ch.i += 1; setAllIndex(ch.i); startClip(ch.i, true); } else { ch.on = false; setAllIndex(null); }
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const evs = ['timeupdate', 'durationchange', 'loadedmetadata', 'seeked'];
    evs.forEach(e => a.addEventListener(e, tick));
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      evs.forEach(e => a.removeEventListener(e, tick));
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [challenges, startClip]);

  useEffect(() => () => audioRef.current?.pause(), []);

  return {
    node: <audio ref={audioRef} preload="none" className="hidden" />,
    playing,
    rate,
    time,
    duration,
    allIndex,
    playSentence: i => { setAllIndex(null); startClip(i); },
    toggle: () => {
      const a = audioRef.current;
      if (!a) return;
      if (playing) a.pause();
      else {
        const s = seg.current;
        if (s.sliced && s.end && a.currentTime >= s.end - 0.05) a.currentTime = s.start;
        a.play().catch(() => {});
      }
    },
    setRate: r => { rateRef.current = r; setRateState(r); if (audioRef.current) audioRef.current.playbackRate = r; },
    seek: t => { const a = audioRef.current; if (a) a.currentTime = seg.current.start + t; },
    playFrom: (i, continuous) => { chain.current = { on: true, i, continuous }; setAllIndex(i); startClip(i, true); },
    stopAll: () => { chain.current.on = false; setAllIndex(null); audioRef.current?.pause(); },
  };
}

function Player({ lesson, onBack, onSaveWord, speechVoice }) {
  const media = useAudioMedia(lesson.challenges, lesson.audioSrc);
  return <DictationCore data={{ title: lesson.title, challenges: lesson.challenges }} storageId={lesson.id} media={media} onBack={onBack} backLabel="Listening" onSaveWord={onSaveWord} speechVoice={speechVoice} />;
}

export default function DictationPlayer({ lessonId, onBack, onSaveWord, speechVoice }) {
  const [lesson, setLesson] = useState(undefined);
  useEffect(() => {
    let off = false;
    loadLesson(lessonId).then(l => { if (!off) setLesson(l); }).catch(() => { if (!off) setLesson(null); });
    return () => { off = true; };
  }, [lessonId]);
  if (lesson === undefined) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-11 w-11 animate-spin rounded-full border-4 border-[#1F2A1A] border-t-transparent" /></div>;
  }
  if (!lesson) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-bold text-slate-600">Không tìm thấy bài nghe này trong dữ liệu offline.</p>
        <button type="button" onClick={onBack} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Quay lại</button>
      </div>
    );
  }
  return <Player lesson={lesson} onBack={onBack} onSaveWord={onSaveWord} speechVoice={speechVoice} />;
}
