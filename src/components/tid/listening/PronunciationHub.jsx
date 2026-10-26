// /practice/listening/pronunciation — minimal-pair index (42 cặp âm, 407 câu).
import React, { useEffect, useState } from 'react';
import { loadPronunciation } from './data';

const SECTIONS = [
  { id: 'vowels', title: 'Nguyên âm', desc: 'Sai nguyên âm là lỗi khiến người nghe hiểu sang từ khác nhiều nhất.' },
  { id: 'consonants', title: 'Phụ âm', desc: 'Phụ âm cuối và các cặp /θ/–/s/, /l/–/r/ là chỗ người Việt hay rơi điểm Pronunciation.' },
];

export default function PronunciationHub({ onBack, onOpen }) {
  const [sets, setSets] = useState(null);
  useEffect(() => { loadPronunciation().then(setSets); }, []);
  const totalQ = sets ? sets.reduce((s, x) => s + x.questions.length, 0) : 407;
  const stats = [[sets ? sets.length : 42, 'cặp âm'], [totalQ, 'câu luyện'], ['2', 'giọng Anh–Anh / Anh–Mỹ']];

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#fafaf7] font-sans">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-14">
          <button type="button" onClick={onBack} className="mb-6 inline-block text-[10px] font-black uppercase tracking-[2px] text-slate-400 transition-colors hover:text-moss">← Listening Hub</button>
          <div className="mb-6 ml-0 inline-flex items-center gap-2 border-2 border-black bg-[#FFFADD] px-4 py-2 shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-[2px] text-moss">Minimal Pairs · IPA</span>
          </div>
          <h1 className="mb-6 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-moss md:text-6xl">Luyện tai<br />phân biệt âm</h1>
          <p className="max-w-2xl font-newsreader text-lg italic leading-relaxed text-slate-600">
            Nghe một từ, chọn đúng từ vừa nghe. Hai từ chỉ khác nhau <strong className="font-bold not-italic text-moss">đúng một âm</strong> — nếu tai chưa tách được <em>bad</em> với <em>bed</em>, thì miệng cũng chưa nói tách được.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {stats.map(([n, l]) => (
              <div key={l} className="border-2 border-black bg-white px-5 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <span className="text-2xl font-black tracking-tighter text-moss">{n}</span>
                <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[1.5px] text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        </div>
        {!sets ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" /></div>
        ) : SECTIONS.map(sec => {
          const list = sets.filter(s => s.category === sec.id);
          return (
            <section key={sec.id} className="mb-16">
              <div className="mb-2 flex items-baseline gap-4">
                <h2 className="text-xl font-black uppercase tracking-[3px] text-moss">{sec.title}</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{list.length} cặp</span>
              </div>
              <p className="mb-6 font-newsreader text-sm italic text-slate-500">{sec.desc}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map(s => (
                  <button key={s.id} type="button" onClick={() => onOpen(s.id)} className="group border-2 border-black bg-white p-5 text-left shadow-[5px_5px_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[3px_3px_0_rgba(0,0,0,1)]">
                    <div className="mb-3 inline-block border-2 border-black bg-[#FFE787] px-3 py-1 text-sm font-black tracking-tight text-moss">{s.contrast}</div>
                    <p className="text-lg font-black lowercase tracking-tight text-moss">{s.pair}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">{s.questions.length} câu →</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
