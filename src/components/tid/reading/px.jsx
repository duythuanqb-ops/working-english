// Small pixel-theme building blocks shared by the Reading pages (ported from the site's px helpers).
import React, { memo, useMemo } from 'react';
import { asset } from '../shared';

export const PX = p => asset(`assets/tid/reading/pixel/${p}`);
export const PX_ROOT = 'px-root';
export const PX_HERO_ART = 'pointer-events-none absolute inset-0 max-sm:[zoom:0.72]';

export function PxImg({ src, alt = '', className = '', style }) {
  return <img src={PX(src)} alt={alt} className={className} style={style} draggable={false} />;
}

export function CamOrange({ className = 'h-[1.1em] w-[1.1em]' }) {
  return <PxImg src="orange.svg" alt="Cambridge" className={`inline-block shrink-0 ${className}`} />;
}

// Replaces the word "Cambridge" with the pixel orange, like the site's withCamOrange().
export function withCamOrange(text, className) {
  const parts = text.split('Cambridge');
  if (parts.length === 1) return text;
  return parts.flatMap((p, i) => (i === 0 ? [p] : [<CamOrange key={i} className={className} />, p]));
}

// Inline pixel-art scene (static HTML copied from the site). `%PX%` → local asset folder.
export const PixelArt = memo(function PixelArt({ html, className = 'pointer-events-none absolute inset-0' }) {
  const markup = useMemo(() => ({ __html: html.replace(/%PX%/g, PX('')) }), [html]);
  return <div aria-hidden="true" className={`px-art ${className}`} data-px-live="" dangerouslySetInnerHTML={markup} />;
});

export function PxBackLink({ onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 self-start rounded-full border-[3px] border-[#1F2A1A] bg-[#FDF5E0] px-4 text-[15px] font-bold text-[#1F2A1A] shadow-[0_4px_0_#1F2A1A] transition-[transform,box-shadow,background-color] hover:bg-[#F8BE33] hover:text-[#1F2A1A] active:translate-y-0.5 active:shadow-[0_2px_0_#1F2A1A] ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}
