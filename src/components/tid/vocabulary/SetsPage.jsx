// "Bộ từ" page (WorkingEnglish skin): category tabs + deck cards (+ unit picker for books / Oxford / Cambridge / IELTS Vocab).
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Layers } from 'lucide-react';
import { index } from './decks';
import { deckKnownPct, useStore } from './store';

const META = {
  topics: (c, pct) => `${c.count} từ · ${pct}% thuộc`,
  books: c => `${c.count} từ · ${c.unitCount} unit`,
  idioms: c => `${c.count} thành ngữ`,
  phrasal: c => `${c.count} cụm động từ`,
  oxford: c => `CEFR ${c.level} · ${c.count} từ · ${c.unitCount} unit`,
  cambridge: c => `${c.count} từ · ${c.unitCount} bài đọc`,
  tidvocab: c => `${c.count} từ · ${c.unitCount} unit`
};
const STAMP = {
  topics: (c, pct) => `${pct}%`, idioms: c => `${c.count}`, phrasal: c => `${c.count}`, oxford: c => c.level,
  books: c => `${c.unitCount} unit`, cambridge: c => `${c.unitCount} bài`, tidvocab: c => `${c.unitCount} unit`
};

// Deck colours cycle through the WorkingEnglish palette (light text only on the dark ones).
const DECK_COLORS = ['#4F46E5', '#F8BE33', '#3ECF8E', '#F2683A', '#7CC4F2', '#E06A96', '#8B7CF6', '#10B981'];
const DARK_TEXT = new Set(['#F2683A', '#E06A96', '#4F46E5', '#8B7CF6']);
const EDGE = 'var(--d-edge)';
const POP = '0 4px 0 var(--d-edge)';

function TabBar({ tab, onTab }) {
  return (
    <div className="vc-noscroll flex items-center gap-2 overflow-x-auto overscroll-x-contain rounded-[22px] border-[2.5px] bg-[var(--d-surf)] p-2" style={{ borderColor: EDGE, boxShadow: POP }}>
      {index.tabs.map(t => (
        <button key={t.id} type="button" aria-pressed={t.id === tab} onClick={() => onTab(t.id)} className="we-toggle h-11 flex-none !px-4 !text-[14px]">
          {t.label}
          <span className="rounded-full bg-[rgba(128,128,140,.18)] px-2 py-[3px] text-[11.5px]">{t.badge}</span>
        </button>
      ))}
    </div>
  );
}

/** Three fanned mini flashcards showing real words from the deck, plus a progress stamp. */
function DeckArt({ words = [], color, stamp }) {
  const shown = [...words.slice(0, 3)];
  while (shown.length < 3) shown.push('');
  const fan = [[-9, '-38%', '#fff'], [0, '-50%', '#FFF8E7'], [8, '-62%', '#fff']];
  return (
    <div aria-hidden="true" className="relative h-[170px] overflow-hidden border-y-[2.5px]" style={{ background: color, borderColor: EDGE }}>
      <span className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, rgba(30,27,75,.22) 1.5px, transparent 1.8px)', backgroundSize: '18px 18px' }} />
      {shown.map((w, i) => (
        <span key={i}
          className="absolute left-1/2 top-[22px] flex h-[118px] w-[min(46%,150px)] items-center justify-center rounded-[16px] border-[2.5px] bg-white px-2 text-center text-[17px] font-extrabold leading-tight text-[#1E1B4B] transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-2"
          style={{ borderColor: EDGE, boxShadow: POP, background: fan[i][2], rotate: `${fan[i][0]}deg`, translate: `${fan[i][1]} 0`, zIndex: i === 1 ? 3 : 1, transitionDelay: `${i * 40}ms` }}>
          <span className="line-clamp-3 break-words">{w}</span>
        </span>
      ))}
      {stamp && (
        <span className="absolute bottom-3 right-3 z-[4] rotate-[-8deg] rounded-full border-[2.5px] bg-[#1E1B4B] px-3 py-1 text-[13px] font-black text-[#F8BE33]" style={{ borderColor: EDGE }}>
          {stamp}
        </span>
      )}
    </div>
  );
}

function SetCard({ card, tab, i, selected, onClick }) {
  const pct = deckKnownPct(card.id, card.count);
  const color = DECK_COLORS[i % DECK_COLORS.length];
  return (
    <button type="button" onClick={onClick}
      className={`we-pop-in we-card-hover group relative flex min-h-[360px] w-full cursor-pointer select-none flex-col overflow-hidden rounded-[24px] border-[2.5px] bg-[var(--d-surf)] text-left text-[var(--d-ink)] ${selected ? 'outline outline-[4px] outline-offset-2 outline-[var(--d-accent)]' : ''}`}
      style={{ animationDelay: `${i * 40}ms`, borderColor: EDGE, boxShadow: POP, '--we-rot': `${i % 2 ? 0.6 : -0.6}deg` }}>
      {selected && <span className="absolute right-3 top-3 z-[5] flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] bg-[var(--d-accent)] text-white" style={{ borderColor: EDGE }}><Check size={16} strokeWidth={3} /></span>}
      <div className="flex flex-col gap-1.5 px-5 pb-4 pt-5">
        <h3 className="we-display m-0 text-[26px] [text-wrap:balance]">{card.title}</h3>
        <p className="m-0 line-clamp-2 text-[14px] font-semibold leading-[1.45] text-[var(--d-mute)] [text-wrap:pretty]">{card.desc}</p>
      </div>
      <DeckArt words={card.words} color={color} stamp={STAMP[tab](card, pct)} />
      <div className="mt-auto flex items-center justify-between gap-3 px-5 py-4">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.04em] text-[var(--d-mute)]">{META[tab](card, pct)}</span>
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border-[2.5px] transition-transform group-hover:translate-x-1" style={{ borderColor: EDGE, background: color, color: DARK_TEXT.has(color) ? '#fff' : '#1E1B4B' }}>
          <ArrowRight size={17} strokeWidth={2.75} />
        </span>
      </div>
      {tab === 'topics' && (
        <span className="absolute inset-x-0 bottom-0 h-[5px]" style={{ background: `linear-gradient(90deg, #3ECF8E ${pct}%, transparent ${pct}%)` }} />
      )}
    </button>
  );
}



function UnitPicker({ card, tab, onBack, onStudy }) {
  const [sel, setSel] = useState([]);
  const unitName = tab === 'cambridge' ? 'bài đọc' : 'unit';
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="we-btn we-btn-sm we-btn-white h-10"><ArrowLeft size={16} /> Bộ từ</button>
        <div className="min-w-0">
          <h2 className="we-display m-0 text-[28px] text-[var(--d-ink)]">{card.title}</h2>
          <p className="m-0 text-[13.5px] font-bold text-[var(--d-mute)]">{card.desc} · {card.count} từ · {card.unitCount} {unitName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {sel.length > 0 && <button type="button" onClick={() => setSel([])} className="we-btn we-btn-sm we-btn-ghost h-11 !text-[var(--d-mute)]">Bỏ chọn</button>}
          <button type="button" onClick={() => onStudy(sel)} className="we-btn we-btn-indigo h-11">
            <Layers size={17} /> {sel.length ? `Học ${sel.length} ${unitName} đã chọn` : `Học cả ${card.unitCount} ${unitName}`}
          </button>
        </div>
      </div>
      <p className="m-0 px-1 text-[13.5px] font-semibold text-[var(--d-mute)]">Bấm để chọn một hoặc nhiều {unitName}, rồi bấm “Học”. Bấm đúp để học ngay {unitName} đó.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-3">
        {card.units.map((u, i) => {
          const on = sel.includes(u.id);
          return (
            <button key={u.id} type="button" onClick={() => toggle(u.id)} onDoubleClick={() => onStudy([u.id])}
              className={`td-pop flex items-center gap-3 rounded-[18px] border-[2.5px] p-3 text-left transition-[transform,box-shadow] hover:-translate-y-1 ${on ? 'bg-[var(--d-accent)] text-white' : 'bg-[var(--d-surf)] text-[var(--d-ink)]'}`}
              style={{ animationDelay: `${Math.min(i, 20) * 20}ms`, borderColor: EDGE, boxShadow: on ? POP : '0 2px 0 var(--d-edge)' }}>
              <span className="we-display flex h-11 w-11 flex-none items-center justify-center rounded-[13px] border-[2.5px] text-[17px]" style={{ borderColor: EDGE, background: on ? '#F8BE33' : DECK_COLORS[i % DECK_COLORS.length], color: '#1E1B4B' }}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-extrabold">{u.label}</span>
                <span className={`block text-[12.5px] font-bold ${on ? 'text-white/80' : 'text-[var(--d-mute)]'}`}>{u.count} từ</span>
              </span>
              {on && <Check size={18} strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SetsPage({ tab, onTab, onStudy }) {
  useStore();
  const [unitCard, setUnitCard] = useState(null);
  const [multi, setMulti] = useState([]);

  const t = index.tabs.find(x => x.id === tab);
  const cards = index.cards[tab] || [];

  useEffect(() => { setMulti([]); setUnitCard(null); }, [tab]);
  const total = useMemo(() => cards.reduce((a, c) => a + c.count, 0), [cards]);

  if (unitCard) {
    return <UnitPicker card={unitCard} tab={tab} onBack={() => setUnitCard(null)} onStudy={units => onStudy({ cards: [unitCard.id], units })} />;
  }

  const open = (e, card) => {
    if (card.units) return setUnitCard(card);
    if (t?.multi && (e.ctrlKey || e.metaKey)) return setMulti(m => (m.includes(card.id) ? m.filter(x => x !== card.id) : [...m, card.id]));
    onStudy({ cards: multi.length ? [...new Set([...multi, card.id])] : [card.id] });
  };

  const kbd = 'rounded-[7px] border-2 bg-[var(--d-surf)] px-[7px] py-0.5 font-sans text-[11.5px] font-extrabold text-[var(--d-ink)]';

  return (
    <div className="relative flex select-none flex-col gap-[18px] pb-24">
      <TabBar tab={tab} onTab={onTab} />

      {t?.multi ? (
        <p className="m-0 flex flex-wrap items-center gap-[5px] px-1 text-[13.5px] font-semibold text-[var(--d-mute)]">
          Mẹo: giữ
          <kbd className={kbd} style={{ borderColor: EDGE }}>Ctrl</kbd>/
          <kbd className={kbd} style={{ borderColor: EDGE }}>⌘</kbd>
          rồi bấm để chọn nhiều chủ đề học cùng lúc.
        </p>
      ) : (
        <p className="m-0 flex items-center gap-2 px-1 text-[13.5px] font-extrabold text-[var(--d-mute)]">
          <span className="h-2.5 w-2.5 rounded-full border-2 bg-[#3ECF8E]" style={{ borderColor: EDGE }} />
          {cards.length} bộ · {total} từ
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-5">
        {cards.map((c, i) => <SetCard key={c.id} card={c} tab={tab} i={i} selected={multi.includes(c.id)} onClick={e => open(e, c)} />)}
      </div>

      {multi.length > 0 && (
        <div className="td-pop fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-[20px] border-[3px] border-[#1E1B4B] bg-[#2F3654] py-2.5 pl-5 pr-2.5 text-white shadow-[0_6px_0_#1E1B4B]">
          <span className="text-[14px] font-extrabold">Đã chọn {multi.length} chủ đề</span>
          <button type="button" onClick={() => setMulti([])} className="rounded-[12px] px-3 py-2 text-[13px] font-bold text-white/70 hover:bg-white/10">Bỏ chọn</button>
          <button type="button" onClick={() => onStudy({ cards: multi })} className="we-btn we-btn-sm"><Layers size={16} /> Học {multi.reduce((a, id) => a + (cards.find(c => c.id === id)?.count || 0), 0)} {tab === 'idioms' ? 'thành ngữ' : 'cụm từ'}</button>
        </div>
      )}
    </div>
  );
}
