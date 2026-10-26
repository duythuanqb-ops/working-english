// IELTS Reading area — mirrors theieltsdictionary.com/practice/reading and its sub-pages
// (/practice/reading/<testId> player, /practice/reading/song-ngu-bao press portal). Sub-pages are local state routes.
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './reading.css';
import ReadingHome from './ReadingHome';

const ReadingPlayer = lazy(() => import('./ReadingPlayer'));
const PressPortal = lazy(() => import('./PressPortal'));

const Fallback = () => <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

export default function ReadingHub({ onBack, onSaveWord, speechVoice }) {
  // { name: 'home' } | { name: 'test', testId, mode, passage?, gap? } | { name: 'press' }
  const [route, setRoute] = useState({ name: 'home' });
  const homeScroll = useRef(0);
  const rootRef = useRef(null);
  const scroller = () => rootRef.current?.closest('.tid-root');

  const go = next => {
    if (route.name === 'home') homeScroll.current = scroller()?.scrollTop || 0;
    setRoute(next);
  };
  // restore the hub scroll position when coming back; start sub-pages at the top
  useEffect(() => {
    const el = scroller();
    if (!el) return;
    if (route.name === 'home') requestAnimationFrame(() => { el.scrollTop = homeScroll.current; });
    else if (route.name === 'press') el.scrollTop = 0;
  }, [route.name]);

  return (
    <div ref={rootRef} className="min-h-full">
      {route.name === 'press' ? (
        <Suspense fallback={<Fallback />}>
          <PressPortal onBack={() => go({ name: 'home' })} onSaveWord={onSaveWord} />
        </Suspense>
      ) : (
        <ReadingHome onBack={onBack} onOpenPress={() => go({ name: 'press' })} onOpenTest={t => go({ name: 'test', ...t })} />
      )}
      {route.name === 'test' && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] grid place-items-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
          <ReadingPlayer
            key={`${route.testId}-${route.mode}-${route.passage || ''}-${route.gap ? 'g' : ''}`}
            testId={route.testId} mode={route.mode} passage={route.passage} gap={route.gap}
            onBack={() => go({ name: 'home' })} onSaveWord={onSaveWord} speechVoice={speechVoice}
          />
        </Suspense>
      )}
    </div>
  );
}
