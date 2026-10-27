import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/workingenglish-pop.css';

// While the main content area scrolls, flag <html> so CSS can switch off hover effects: cards sliding under
// a still cursor would otherwise fire hover transitions (lift/rotate/shadow) and repaint mid-scroll.
// Inner scrollers (side-by-side panes, popup lists) are left alone so their wheel gestures keep working.
let scrollIdle;
window.addEventListener('scroll', (e) => {
  if (!e.target?.classList?.contains('content-body')) return;
  const root = document.documentElement;
  if (!root.classList.contains('is-scrolling')) root.classList.add('is-scrolling');
  clearTimeout(scrollIdle);
  scrollIdle = setTimeout(() => root.classList.remove('is-scrolling'), 150);
}, { capture: true, passive: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
