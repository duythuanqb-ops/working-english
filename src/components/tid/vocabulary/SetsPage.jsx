// /dashboard?tab=knowledge — "Bộ từ": category tabs + illustrated set cards (+ unit picker for books / Oxford / Cambridge / TID).
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Layers, Plus, Trash2, X } from 'lucide-react';
import { asset } from '../shared';
import CardArt from './CardArt';
import { index } from './decks';
import { addCustomWord, deckKnownPct, getCustomWords, removeCustomWord, useStore } from './store';

const photoUrl = p => (p ? asset(`assets/tid/vocabulary/photos/${p}.webp`) : null);
const META = {
  topics: (c, pct) => `${c.count} từ · ${pct}% thuộc`,
  books: c => `${c.count} từ · ${c.unitCount} unit`,
  idioms: c => `${c.count} thành ngữ`,
  phrasal: c => `${c.count} cụm động từ`,
  oxford: c => `CEFR ${c.level} · ${c.count} từ · ${c.unitCount} unit`,
  cambridge: c => `${c.count} từ · ${c.unitCount} bài đọc`,
  tidvocab: c => `${c.count} từ · ${c.unitCount} unit`,
};
const RING_LABEL = {
  topics: (c, pct) => `${pct}%`, idioms: c => `${c.count} thành ngữ`, phrasal: c => `${c.count} cụm từ`, oxford: c => c.level,
  books: c => `${c.unitCount} unit`, cambridge: c => `${c.unitCount} bài đọc`, tidvocab: c => `${c.unitCount} unit`,
};

function TabBar({ tab, onTab }) {
  return (
    <div className="@container overflow-hidden rounded-[22px] bg-[var(--d-surf)]" style={{ boxShadow: '0 14px 30px -20px rgba(27,29,34,.45), inset 0 0 0 1.5px var(--d-line)' }}>
      <div className="vc-noscroll relative flex items-center gap-1 overflow-x-auto overscroll-x-contain p-[5px] @min-[1100px]:gap-1.5 @min-[1100px]:p-[7px]">
        {index.tabs.map(t => {
          const on = t.id === tab;
          return (
            <button key={t.id} type="button" onClick={() => onTab(t.id)}
              className={`flex h-10 flex-none items-center gap-1.5 whitespace-nowrap rounded-[15px] px-3 text-[13.5px] font-bold transition-[background-color,translate] duration-300 ease-[cubic-bezier(.34,1.8,.5,1)] hover:-translate-y-0.5 @min-[1100px]:h-[48px] @min-[1100px]:text-[14.5px] @min-[1300px]:h-[50px] @min-[1300px]:gap-2 @min-[1300px]:px-[18px] @min-[1300px]:text-[16px] ${on ? 'bg-[var(--d-accent)] text-white' : 'text-[var(--d-ink)] hover:bg-[var(--d-surf2)]'}`}
              style={on ? { boxShadow: '0 8px 14px -10px color-mix(in oklab, var(--d-accent) 80%, transparent)' } : undefined}>
              {t.label}
              <span className="rounded-full px-1.5 py-[3px] text-[11.5px] font-bold @min-[1300px]:px-2 @min-[1300px]:text-[12.5px]" style={{ background: 'rgba(128,128,140,.16)' }}>{t.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SetCard({ card, tab, delay, selected, onClick }) {
  const pct = deckKnownPct(card.id, card.count);
  return (
    <button type="button" onClick={onClick}
      className={`td-pop group relative isolate flex min-h-[400px] w-full cursor-pointer select-none flex-col overflow-hidden rounded-[26px] text-center transition-transform duration-200 hover:-translate-y-[5px] ${selected ? 'outline outline-[4px] outline-offset-2 outline-[var(--d-accent)]' : ''}`}
      style={{ animationDelay: `${delay}ms`, background: card.color, color: '#1b1d22' }}>
      {card.photo && <img src={photoUrl(card.photo)} alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-20 block h-full w-full object-cover" />}
      <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(${card.color} 0%, ${card.color} 36%, ${card.color}33 72%)` }} />
      {selected && <span className="absolute right-4 top-4 z-[3] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--d-accent)] text-white"><Check size={16} strokeWidth={3} /></span>}
      <div className="relative z-[2] flex flex-col items-center gap-2 px-6 pt-[26px]">
        <h3 className="m-0 text-[26px] font-bold leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">{card.title}</h3>
        <p className="m-0 max-w-[300px] text-[14.5px] font-medium leading-[1.45] [text-wrap:pretty]" style={{ color: 'rgba(27,29,34,.72)' }}>{card.desc}</p>
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.04em]" style={{ color: 'rgba(27,29,34,.62)' }}>{META[tab](card, pct)}</span>
        </div>
      </div>
      <CardArt card={{ ...card, unitWord: tab === 'idioms' ? 'Thành ngữ' : undefined }} pct={pct} label={RING_LABEL[tab](card, pct)} />
    </button>
  );
}

function AddWordModal({ onClose }) {
  const [f, setF] = useState({ w: '', vi: '', ex: '' });
  useStore();
  const words = getCustomWords();
  const save = e => {
    e.preventDefault();
    if (!f.w.trim() || !f.vi.trim()) return;
    addCustomWord({ w: f.w.trim(), vi: f.vi.trim(), ex: f.ex.trim() });
    setF({ w: '', vi: '', ex: '' });
  };
  const input = 'w-full rounded-[14px] bg-[var(--d-surf2)] px-4 py-3 text-[15px] font-semibold text-[var(--d-ink)] outline-none placeholder:text-[var(--d-mute)] focus:ring-2 focus:ring-[var(--d-accent)]';
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="td-pop flex max-h-[86vh] w-full max-w-[520px] flex-col gap-4 overflow-hidden rounded-[26px] bg-[var(--d-surf)] p-6 text-[var(--d-ink)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="m-0 text-[24px] font-bold tracking-[-0.02em]">Bộ từ của bản thân</h3>
            <p className="m-0 mt-1 text-[14px] font-semibold text-[var(--d-mute)]">Tự thêm và ôn tập từ vựng của riêng bạn.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--d-surf2)]"><X size={18} /></button>
        </div>
        <form onSubmit={save} className="flex flex-col gap-2.5">
          <input autoFocus className={input} placeholder="Từ tiếng Anh (vd: sustainable)" value={f.w} onChange={e => setF({ ...f, w: e.target.value })} />
          <input className={input} placeholder="Nghĩa tiếng Việt (vd: bền vững)" value={f.vi} onChange={e => setF({ ...f, vi: e.target.value })} />
          <input className={input} placeholder="Câu ví dụ (không bắt buộc)" value={f.ex} onChange={e => setF({ ...f, ex: e.target.value })} />
          <button type="submit" disabled={!f.w.trim() || !f.vi.trim()} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#1b1d22] text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-40"><Plus size={18} /> Thêm từ</button>
        </form>
        <div className="vc-noscroll -mx-1 flex flex-col gap-1.5 overflow-y-auto px-1">
          {words.map(w => (
            <div key={w.w} className="flex items-center gap-3 rounded-[14px] bg-[var(--d-surf2)] px-3.5 py-2.5">
              <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-bold">{w.w}</div><div className="truncate text-[13px] font-semibold text-[var(--d-mute)]">{w.vi}</div></div>
              <button type="button" onClick={() => removeCustomWord(w.w)} aria-label="Xoá" className="text-[var(--d-mute)] hover:text-[#e5482a]"><Trash2 size={16} /></button>
            </div>
          ))}
          {!words.length && <p className="m-0 py-3 text-center text-[13.5px] font-semibold text-[var(--d-mute)]">Chưa có từ nào.</p>}
        </div>
      </div>
    </div>
  );
}

function UnitPicker({ card, tab, onBack, onStudy }) {
  const [sel, setSel] = useState([]);
  const unitName = tab === 'cambridge' ? 'bài đọc' : 'unit';
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="flex h-10 items-center gap-1.5 rounded-[14px] bg-[var(--d-surf)] px-3.5 text-[14px] font-bold text-[var(--d-ink)] shadow-[inset_0_0_0_1.5px_var(--d-line)] hover:-translate-y-0.5 transition-transform"><ArrowLeft size={16} /> Bộ từ</button>
        <div className="min-w-0">
          <h2 className="m-0 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[var(--d-ink)]">{card.title}</h2>
          <p className="m-0 text-[13.5px] font-bold text-[var(--d-mute)]">{card.desc} · {card.count} từ · {card.unitCount} {unitName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {sel.length > 0 && <button type="button" onClick={() => setSel([])} className="h-11 rounded-[14px] px-4 text-[14px] font-bold text-[var(--d-mute)] hover:bg-[var(--d-surf2)]">Bỏ chọn</button>}
          <button type="button" onClick={() => onStudy(sel)} className="flex h-11 items-center gap-2 rounded-[14px] bg-[#1b1d22] px-5 text-[14.5px] font-extrabold text-white transition-transform hover:-translate-y-0.5">
            <Layers size={17} /> {sel.length ? `Học ${sel.length} ${unitName} đã chọn` : `Học cả ${card.unitCount} ${unitName}`}
          </button>
        </div>
      </div>
      <p className="m-0 flex flex-wrap items-center gap-[5px] px-1 text-[13.5px] font-semibold text-[var(--d-mute)]">Bấm để chọn một hoặc nhiều {unitName}, rồi bấm “Học”. Bấm đúp để học ngay {unitName} đó.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-3">
        {card.units.map((u, i) => {
          const on = sel.includes(u.id);
          return (
            <button key={u.id} type="button" onClick={() => toggle(u.id)} onDoubleClick={() => onStudy([u.id])}
              className={`td-pop flex items-center gap-3 rounded-[20px] p-3.5 text-left transition-transform hover:-translate-y-1 ${on ? 'text-white' : 'bg-[var(--d-surf)] text-[var(--d-ink)]'}`}
              style={{ animationDelay: `${Math.min(i, 20) * 20}ms`, background: on ? 'var(--d-accent)' : undefined, boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--d-line)' }}>
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] text-[15px] font-extrabold" style={{ background: on ? 'rgba(255,255,255,.2)' : card.color, color: on ? '#fff' : '#1b1d22' }}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold">{u.label}</span>
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
  const [adding, setAdding] = useState(false);
  const t = index.tabs.find(x => x.id === tab);
  const cards = index.cards[tab];
  const custom = getCustomWords();
  useEffect(() => { setMulti([]); setUnitCard(null); }, [tab]);
  const total = useMemo(() => cards.reduce((a, c) => a + c.count, 0), [cards]);

  if (unitCard) {
    return <UnitPicker card={unitCard} tab={tab} onBack={() => setUnitCard(null)} onStudy={units => onStudy({ cards: [unitCard.id], units })} />;
  }
  const open = (e, card) => {
    if (card.units) return setUnitCard(card);
    if (t.multi && (e.ctrlKey || e.metaKey)) return setMulti(m => (m.includes(card.id) ? m.filter(x => x !== card.id) : [...m, card.id]));
    onStudy({ cards: multi.length ? [...new Set([...multi, card.id])] : [card.id] });
  };
  return (
    <div className="relative flex select-none flex-col gap-[18px] pb-24">
      <TabBar tab={tab} onTab={onTab} />
      {t.multi ? (
        <p className="m-0 flex flex-wrap items-center gap-[5px] px-1 text-[13.5px] font-semibold text-[var(--d-mute)]">
          Mẹo: giữ
          <kbd className="rounded-[7px] bg-[var(--d-surf)] px-[7px] py-0.5 font-sans text-[11.5px] font-bold text-[var(--d-ink)]" style={{ boxShadow: '0 2px 0 var(--d-line)' }}>Ctrl</kbd>/
          <kbd className="rounded-[7px] bg-[var(--d-surf)] px-[7px] py-0.5 font-sans text-[11.5px] font-bold text-[var(--d-ink)]" style={{ boxShadow: '0 2px 0 var(--d-line)' }}>⌘</kbd>
          rồi bấm để chọn nhiều chủ đề học cùng lúc.
        </p>
      ) : (
        <p className="m-0 flex items-center gap-2 px-1 text-[13.5px] font-bold text-[var(--d-mute)]">
          <span className="h-2 w-2 rounded-full bg-[#20b486]" />
          {tab === 'topics' ? `${cards.length + 1} bộ · ${total} từ` : `${cards.length} bộ · ${total} từ`}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
        {tab === 'topics' && (
          <button type="button" onClick={() => (custom.length ? onStudy({ cards: ['custom'] }) : setAdding(true))}
            className="td-pop group relative isolate flex min-h-[400px] w-full cursor-pointer select-none flex-col overflow-hidden rounded-[26px] text-center text-white transition-transform duration-200 hover:-translate-y-[5px]" style={{ background: '#1b1d22' }}>
            <div className="flex flex-col items-center gap-2 px-6 pt-[26px]">
              <h3 className="m-0 text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-white">Bộ từ của bản thân</h3>
              <p className="m-0 text-[14.5px] font-medium leading-[1.45] text-[#c4c8d0]">Tự thêm và ôn tập từ vựng của riêng bạn.</p>
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#9aa0ab]">Cá nhân · {custom.length} từ</span>
            </div>
            <div className="relative mt-3.5 flex min-h-[220px] flex-1 items-center justify-center">
              <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px) 0 0/30px 30px', maskImage: 'linear-gradient(transparent,#000 45%)' }} />
              <span onClick={e => { e.stopPropagation(); setAdding(true); }}
                className="relative flex flex-col items-center gap-2.5 rounded-[22px] border-2 border-dashed border-white/45 px-[34px] py-[26px] text-[14.5px] font-bold transition-colors duration-200 group-hover:border-[#ffc02e] group-hover:bg-[#ffc02e] group-hover:text-[#1b1d22]">
                <Plus size={28} />Thêm từ của bạn
              </span>
            </div>
          </button>
        )}
        {cards.map((c, i) => <SetCard key={c.id} card={c} tab={tab} delay={i * 40} selected={multi.includes(c.id)} onClick={e => open(e, c)} />)}
      </div>
      {multi.length > 0 && (
        <div className="td-pop fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-[20px] bg-[#1b1d22] py-2.5 pl-5 pr-2.5 text-white shadow-2xl">
          <span className="text-[14px] font-bold">Đã chọn {multi.length} chủ đề</span>
          <button type="button" onClick={() => setMulti([])} className="rounded-[12px] px-3 py-2 text-[13px] font-bold text-white/70 hover:bg-white/10">Bỏ chọn</button>
          <button type="button" onClick={() => onStudy({ cards: multi })} className="flex items-center gap-2 rounded-[14px] bg-[var(--d-accent)] px-4 py-2.5 text-[14px] font-extrabold"><Layers size={16} /> Học {multi.reduce((a, id) => a + (cards.find(c => c.id === id)?.count || 0), 0)} {tab === 'idioms' ? 'thành ngữ' : 'cụm từ'}</button>
        </div>
      )}
      {adding && <AddWordModal onClose={() => setAdding(false)} />}
    </div>
  );
}
