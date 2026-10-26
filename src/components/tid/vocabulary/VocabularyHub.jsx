// IELTS Vocabulary area — replica of theieltsdictionary.com /practice/vocabulary, /dashboard (Bộ từ · Tổng quan) and
// /practice/flashcard. Sub-pages are local state; all word data is bundled (src/data/tid/vocabulary).
import React, { Suspense, lazy, useCallback, useState } from 'react';
import './vocab.css';
import VocabHome, { CuratedPage } from './VocabHome';
import Sidebar from './Sidebar';
import SetsPage from './SetsPage';
import SaveWordPopup from './SaveWordPopup';
import { History, Overview, Stats } from './Overview';
import { buildSession, index } from './decks';
import { getSetting, setSetting } from './store';

const Flashcard = lazy(() => import('./Flashcard'));
const GrammarHub = lazy(() => import('../grammar/GrammarHub'));

const HEAD = {
  overview: ['Tổng quan · Tiến độ luyện tập', 'Chào bạn, hôm nay ôn từ nhé!'],
  flashcard: ['Flashcard · Ôn tập', 'Lật thẻ, nhớ từ lâu hơn'],
  stats: ['Thống kê', 'Tiến độ từng bộ từ'],
  history: ['Lịch sử làm bài', 'Các phiên học & lịch ôn'],
};
const Loading = ({ dark }) => <div className={`p-20 text-center font-bold ${dark ? 'text-white/60' : 'text-slate-400'}`}>Đang chuẩn bị học liệu...</div>;

export default function VocabularyHub({ onBack, onSaveWord, speechVoice }) {
  const [view, setView] = useState('home'); // home | curated | dash | grammar
  const [page, setPage] = useState('sets');
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
  const nav = p => {
    if (p === 'flashcard' && !session) {
      const last = getSetting('last_session', null);
      if (last) return study(last);
      return setPage('sets');
    }
    setPage(p);
  };

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
  const [eyebrow, heading] = page === 'sets' ? [t.eyebrow, t.heading] : HEAD[page] || HEAD.overview;
  return (
    <div className={`vc-dash ${dark ? 'dark' : ''} flex h-full w-full overflow-hidden bg-[var(--d-bg)] text-[var(--d-ink)] transition-colors duration-500`}>
      <Sidebar active={page} onNav={nav} eyebrow={eyebrow} heading={heading} dark={dark}
        onToggleDark={() => { setDark(d => { setSetting('dark', !d); return !d; }); }}
        onHome={() => setView('home')} onExit={onBack}
        onSearch={(word, r) => setLookup({ word, anchor: { x: r.left + 10, bottom: r.bottom } })} />
      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--d-bg)]">
        <div className="relative flex-1 overflow-y-auto px-3 py-3 md:px-[18px] md:py-[18px]">
          <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-6">
            {page === 'sets' && <SetsPage tab={tab} onTab={setTab} onStudy={sel => study(sel)} />}
            {page === 'overview' && <Overview onPick={() => setPage('sets')} onReview={r => (r.sel ? study(r.sel) : setPage('sets'))} />}
            {page === 'stats' && <Stats />}
            {page === 'history' && <History onReview={r => (r.sel ? study(r.sel) : setPage('sets'))} />}
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
