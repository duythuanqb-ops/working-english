// Left sidebar of the site's /dashboard (DashboardSidebar) — copied markup, local navigation.
import React, { useState } from 'react';
import {
  Bell, ClipboardList, FileText, HandCoins, History, Layers, LayoutGrid, LibraryBig, Lightbulb, LogOut, Moon,
  PanelLeftClose, PanelLeftOpen, Route, Search, Sun, TrendingUp, Trophy, Users, Wallet,
} from 'lucide-react';
import { asset } from '../shared';

const LEARN = [
  { id: 'overview', label: 'Tổng quan', Icon: LayoutGrid },
  { id: 'route', label: 'Lộ trình học', Icon: Route, off: true },
  { id: 'top', label: 'Đua Top 🏆', Icon: Trophy, off: true },
  { id: 'padlet', label: 'Sổ ghi chú', Icon: ClipboardList, off: true },
  { id: 'sets', label: 'Bộ từ', Icon: LibraryBig },
  { id: 'flashcard', label: 'Flashcard', Icon: Layers },
  { id: 'stats', label: 'Thống kê', Icon: TrendingUp },
  { id: 'history', label: 'Lịch sử làm bài', Icon: History },
];
const SHARE = [
  { id: 'ref', label: 'Thống kê giới thiệu', Icon: Users },
  { id: 'wallet', label: 'Hoa hồng của bạn', Icon: Wallet },
  { id: 'policy', label: 'Chính sách chia sẻ', Icon: FileText },
  { id: 'ideas', label: 'Ý tưởng chia sẻ', Icon: Lightbulb },
  { id: 'money', label: 'Make Money cùng TID', Icon: HandCoins },
];
const ITEM = 'w-full flex items-center gap-3 px-[13px] py-[8px] [@media(max-height:820px)]:py-[6px] rounded-[13px] font-bold text-[14.5px] transition-all';

export default function Sidebar({ active, onNav, eyebrow, heading, dark, onToggleDark, onHome, onExit, onSearch }) {
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState('');
  const w = collapsed ? 84 : 260;
  const Item = ({ it }) => {
    const on = it.id === active;
    return (
      <button type="button" disabled={it.off} title={it.off ? 'Chỉ có trên website' : it.label} onClick={() => onNav(it.id)}
        className={`${ITEM} ${on ? 'bg-[#4f7cf7] text-white shadow-[0_10px_20px_-12px_rgba(79,124,247,.9)]' : 'text-[var(--d-ink)] hover:bg-[var(--d-surf2)]'} ${it.off ? 'cursor-not-allowed opacity-45 hover:bg-transparent' : ''} ${collapsed ? 'justify-center' : ''}`}>
        <it.Icon className={`h-5 w-5 shrink-0 ${on ? 'text-white' : 'text-[var(--d-ink)]'}`} />
        {!collapsed && <span className="truncate">{it.label}</span>}
      </button>
    );
  };
  return (
    <div className="relative z-[80] block h-full shrink-0 transition-[width] duration-300 ease-in-out" style={{ width: w }}>
      <aside className="vc-noscroll absolute bottom-0 left-0 top-0 flex flex-col overflow-y-auto overflow-x-hidden whitespace-nowrap border-r border-[var(--d-line)] bg-[var(--d-surf)] px-[16px] pb-[14px] pt-[18px] text-[var(--d-ink)] transition-[background-color] duration-300 [&>*]:shrink-0" style={{ width: w }}>
        <div className="flex items-center gap-2 pb-[14px]">
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onHome} title="Về trang từ vựng" className="flex min-w-0 cursor-pointer items-center gap-[11px] text-left">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[12px] border border-[var(--d-line)]"><img src={asset('assets/tid/logo.webp')} alt="" className="h-full w-full object-cover" /></div>
              {!collapsed && (
                <div className="min-w-0 leading-[1.05]">
                  <div className="text-[16px] font-extrabold text-[var(--d-ink)]">The IELTS</div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[var(--d-mute)]">DICTIONARY</div>
                </div>
              )}
            </button>
          </div>
          {!collapsed && (
            <button type="button" onClick={onToggleDark} aria-label="Chế độ sáng / tối" title="Chế độ sáng / tối"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-[12px] transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.8,.5,1)] hover:-translate-y-0.5 hover:-rotate-12"
              style={{ width: 38, height: 38, background: dark ? '#ffc93c' : '#1b1d22', color: dark ? '#1b1d22' : '#ffc93c', boxShadow: '0 6px 14px -6px rgba(27,29,34,.6),0 0 0 2px #ffc93c' }}>
              {dark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
            </button>
          )}
          <button type="button" onClick={() => setCollapsed(c => !c)} aria-label="Thu gọn menu" title="Thu gọn menu"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[var(--d-mute)] transition-colors hover:bg-[var(--d-surf2)] hover:text-[var(--d-ink)]">
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="flex flex-col gap-[3px] px-2 pb-3 [@media(max-height:899px)]:hidden">
              <span className="truncate text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-[var(--d-mute)]">{eyebrow}</span>
              <span className="whitespace-normal text-[19px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--d-ink)]">{heading}</span>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (q.trim()) onSearch(q.trim(), e.currentTarget.getBoundingClientRect()); }}
              className="mx-[2px] mb-3 flex h-11 items-center gap-[9px] rounded-[14px] bg-[var(--d-surf2)] pl-[14px] pr-[6px]">
              <Search className="h-4 w-4 shrink-0 text-[var(--d-ink)]" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tra từ vựng..." aria-label="Tra từ vựng..."
                className="min-w-0 flex-1 border-0 bg-transparent text-[13.5px] font-semibold text-[var(--d-ink)] outline-none placeholder:text-[var(--d-mute)]" />
              <span className="shrink-0 rounded-[8px] bg-[var(--d-surf)] px-2 py-1 text-[10.5px] font-extrabold text-[var(--d-ink)]">↵</span>
            </form>
          </>
        )}
        <nav className="flex flex-col gap-0.5">
          {!collapsed && <div className="px-3 pb-1 pt-1.5 text-[10.5px] font-extrabold tracking-[0.16em] text-[var(--d-mute)]">HỌC TẬP</div>}
          {LEARN.map(it => <Item key={it.id} it={it} />)}
          <div className="mx-2 my-1.5 h-px shrink-0 bg-[var(--d-line)]" />
          {!collapsed && <div className="px-3 pb-1 pt-1.5 text-[10.5px] font-extrabold tracking-[0.16em] text-[var(--d-mute)]">CHIA SẺ WEBSITE</div>}
          {SHARE.map(it => <Item key={it.id} it={{ ...it, off: true }} />)}
        </nav>
        <div className="min-h-4 flex-1" />
        <div className="mx-2 my-1.5 h-px shrink-0 bg-[var(--d-line)]" />
        <div className={`flex items-center gap-[10px] px-2 py-1.5 ${collapsed ? 'justify-center' : ''}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[var(--d-surf2)] text-[12px] font-extrabold text-[var(--d-mute)]">HV</span>
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[14px] font-extrabold text-[var(--d-ink)]">Học viên</span></div>
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[var(--d-surf2)] text-[var(--d-ink)]" title="Thông báo"><Bell className="h-[18px] w-[18px]" /></span>
            </>
          )}
        </div>
        <button type="button" onClick={onExit} className={`${ITEM} text-[#e5482a] hover:bg-[var(--d-surf2)] ${collapsed ? 'justify-center' : ''}`} title="Quay lại chọn kỹ năng">
          <LogOut className="h-5 w-5 shrink-0" />{!collapsed && <span>Quay lại chọn kỹ năng</span>}
        </button>
      </aside>
    </div>
  );
}
