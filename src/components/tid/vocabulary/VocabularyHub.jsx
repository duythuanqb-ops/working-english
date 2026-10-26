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

export default function VocabularyHub({ onBack, onSaveWord, speechVoice, tidRoute }) {
  const [view, setView] = useState(() => tidRoute?.view || 'home'); // home | curated | dash | grammar
  const [page, setPage] = useState(() => tidRoute?.page || 'sets');
  const [tab, setTab] = useState('topics');
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
      if (tidRoute.sessionSel) {
        study(tidRoute.sessionSel);
      }
    }
  }, [tidRoute, study]);

  if (view === 'home') return <VocabHome onBack={onBack} onOpenSets={() => openDash('sets')} onOpenCurated={() => setView('curated')} onOpenGrammar={() => setView('grammar')} />;
  if (view === 'curated') return <CuratedPage onClose={() => setView('home')} onExplore={() => openDash('sets', 'cambridge')} />;
  if (view === 'grammar') {
    return (
      <Suspense fallback={<Loading />}>
        <GrammarHub onBack={() => setView('home')} onSaveWord={onSaveWord} speechVoice={speechVoice} />
      </Suspense>
    );
  }

  const t = index.tabs.find(x => x.id === tab);

  return (
    <div className={`vc-dash ${dark ? 'dark' : ''} flex h-full w-full overflow-hidden bg-[var(--d-bg)] text-[var(--d-ink)] transition-colors duration-500`}>
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--d-bg)]">
        {page === 'sets' && (
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--d-line)] bg-[var(--d-surf)]/90 px-4 py-3 md:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView('home')}
                className="flex h-9 items-center gap-2 rounded-xl bg-[var(--d-surf2)] px-3 text-sm font-bold text-[var(--d-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--d-line)]"
              >
                <ArrowLeft size={16} /> Quay lại trang từ vựng
              </button>
              <div className="hidden h-5 w-px bg-[var(--d-line)] sm:block" />
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-[var(--d-ink)] md:text-base">
                  {t?.heading || 'Kho Bộ Từ Vựng Theo Chủ Đề'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDark(d => {
                    setSetting('dark', !d);
                    return !d;
                  });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--d-surf2)] text-[var(--d-ink)] transition-all hover:bg-[var(--d-line)]"
                title="Chế độ sáng / tối"
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </header>
        )}

        <div className="relative flex-1 overflow-y-auto px-3 py-3 md:px-[22px] md:py-[18px]">
          <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-6">
            {page === 'sets' && <SetsPage tab={tab} onTab={setTab} onStudy={sel => study(sel)} />}
            {page === 'flashcard' && (busy || !session
              ? (
                <div className="flex flex-col items-center gap-6 py-24">
                  <div className="relative h-20 w-20"><div className="absolute inset-0 rounded-full border-4 border-[var(--d-line)]" /><div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--d-accent)] border-t-transparent" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--d-mute)]">Đang chuẩn bị học liệu...</span>
                </div>
              ) : (
                <Suspense fallback={<Loading dark={dark} />}>
                  <Flashcard session={session} initialMode={mode} onPickSet={() => setPage('sets')} onExit={() => setPage('sets')} onSaveWord={onSaveWord} speechVoice={speechVoice} />
                </Suspense>
              ))}
          </div>
        </div>
      </main>
      {lookup && <SaveWordPopup word={lookup.word} anchor={lookup.anchor} tag="Vocabulary" onClose={() => setLookup(null)} onSaveWord={onSaveWord} speechVoice={speechVoice} />}
    </div>
  );
}
