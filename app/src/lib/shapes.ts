import type { NoteShape } from './types';

export function getShapeClip(shape: NoteShape): string {
  switch (shape) {
    case 'circle':
      return 'circle(50% at 50% 50%)';
    case 'hexagon':
      return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    case 'star':
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    case 'flower':
      return 'polygon(50% 0%, 60% 20%, 80% 10%, 75% 30%, 100% 35%, 80% 50%, 100% 65%, 75% 70%, 80% 90%, 60% 80%, 50% 100%, 40% 80%, 20% 90%, 25% 70%, 0% 65%, 20% 50%, 0% 35%, 25% 30%, 20% 10%, 40% 20%)';
    default:
      return 'none';
  }
}

export function getShapeStyle(shape: NoteShape, width: number, height: number): React.CSSProperties {
  const base: React.CSSProperties = { width, height };

  if (shape === 'square') {
    const size = Math.min(width, height);
    return { ...base, width: size, height: size, borderRadius: 16 };
  }
  if (shape === 'rectangle') {
    return { ...base, borderRadius: 16 };
  }
  const clip = getShapeClip(shape);
  const size = Math.min(width, height);
  return { width: size, height: size, clipPath: clip, borderRadius: 0 };
}

export function hasStickyStrip(shape: NoteShape): boolean {
  return shape === 'rectangle' || shape === 'square';
}

// Returns CSS padding for the inner content div so text stays inside the visible shape area.
export function getContentPadding(shape: NoteShape, size: number): string {
  const p = (f: number) => `${Math.round(size * f)}px`;
  switch (shape) {
    case 'circle':   return p(0.175);
    case 'hexagon':  return `${p(0.15)} ${p(0.28)}`;
    case 'star':     return `${p(0.33)} ${p(0.32)}`;
    case 'flower':   return `${p(0.23)} ${p(0.27)}`;
    default:         return '0';
  }
}

import type React from 'react';
