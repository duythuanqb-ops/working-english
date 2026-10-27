// Vocabulary Hub — "Bộ từ" (SetsPage) and Flashcard practice (Flashcard, Blast, Match)
import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import './vocab.css';
import VocabHome, { CuratedPage } from './VocabHome';
import SetsPage from './SetsPage';
import SaveWordPopup from './SaveWordPopup';
import { buildSession, index } from './decks';
import { getSetting, setSetting } from './store';

const Flashcard = lazy(() => import('./Flashcard'));
const GrammarHub = lazy(() => import('../grammar/GrammarHub'));

const Loading = ({ dark }) => <div className={`p-20 text-center font-bold ${dark ? 'text-white/60' : 'text-slate-400'}`}>Đang chuẩn bị học liệu...</div>;

export default function VocabularyHub({ onBack, onSaveWord, onRemoveWord, speechVoice, tidRoute }) {
  const [view, setView] = useState(() => tidRoute?.view || 'home'); // home | curated | dash | grammar
  const [page, setPage] = useState(() => tidRoute?.page || 'sets');
  const [tab, setTab] = useState(() => tidRoute?.tab || 'topics');
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('flashcard');
  const [busy, setBusy] = useState(false);
  const [dark, setDark] = useState(() => getSetting('dark', false));
  const [lookup, setLookup] = useState(null);

  const openDash = (p = 'sets', t) => { setPage(p); if (t) setTab(t); setView('dash'); };
  const study = useCallback(async (sel, m = 'flashcard') => {
    setBusy(true); setPage('flashcard'); setView('dash');
    try {
      const s = await buildSession(sel);
      if (!s.words.length) { setPage('sets'); return; }
      setSession(s); setMode(m); setSetting('last_session', sel);
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (tidRoute) {
      if (tidRoute.page) setPage(tidRoute.page);
      if (tidRoute.view) setView(tidRoute.view);
      if (tidRoute.tab) setTab(tidRoute.tab);
      if (tidRoute.sessionSel) {
        study(tidRoute.sessionSel);
      }
    }
  }, [tidRoute, study]);

  if (view === 'home') return <VocabHome onBack={onBack} onOpenSets={(t) => openDash('sets', t)} onOpenCurated={() => setView('curated')} onOpenGrammar={() => setView('grammar')} />;
  if (view === 'curated') return <CuratedPage onClose={() => setView('home')} onExplore={() => openDash('sets', 'cambridge')} />;
  if (view === 'grammar') {
    return (
      <Suspense fallback={<Loading />}>
        <GrammarHub onBack={() => setView('home')} onSaveWord={onSaveWord} speechVoice={speechVoice} />
      </Suspense>
    );
  }

  const heading = index.tabs.find(x => x.id === tab)?.heading || 'Chọn bộ từ để bắt đầu học';

  return (
    <div className={`vc-dash ${dark ? 'dark' : ''} flex h-full w-full overflow-hidden bg-[var(--d-bg)] text-[var(--d-ink)] transition-colors duration-500`}>
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--d-bg)]">
        {page === 'sets' && (
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[3px] border-[var(--d-edge)] bg-[var(--d-surf)] px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setView('home')} className="we-btn we-btn-sm we-btn-white h-10 flex-none">
                <ArrowLeft size={16} strokeWidth={2.75} /> <span className="hidden sm:inline">Trang từ vựng</span>
              </button>
              <h1 className="we-display m-0 truncate text-xl text-[var(--d-ink)] md:text-2xl">{heading}</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setDark(d => {
                  setSetting('dark', !d);
                  return !d;
                });
              }}
              className="we-btn we-btn-sm we-btn-white h-10 w-10 flex-none !p-0"
              title="Chế độ sáng / tối"
              aria-label="Chế độ sáng / tối"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </header>
        )}

        <div className="relative flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-4">
            {page === 'sets' && <SetsPage tab={tab} onTab={setTab} onStudy={sel => study(sel)} />}
            {page === 'flashcard' && (busy || !session
              ? (
                <div className="flex flex-col items-center gap-6 py-24">
                  <div className="relative h-20 w-20"><div className="absolute inset-0 rounded-full border-4 border-[var(--d-line)]" /><div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--d-accent)] border-t-transparent" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--d-mute)]">Đang chuẩn bị học liệu...</span>
                </div>
              ) : (
                <Suspense fallback={<Loading dark={dark} />}>
                  <Flashcard session={session} initialMode={mode} onPickSet={() => setPage('sets')} onExit={() => setPage('sets')} onSaveWord={onSaveWord} onRemoveWord={onRemoveWord} speechVoice={speechVoice} />
                </Suspense>
              ))}
          </div>
        </div>
      </main>
      {lookup && <SaveWordPopup word={lookup.word} anchor={lookup.anchor} tag="Vocabulary" onClose={() => setLookup(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />}
    </div>
  );
}
