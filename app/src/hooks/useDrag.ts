import { useRef, useCallback } from 'react';

interface DragOptions {
  onMove: (x: number, y: number) => void;
  onEnd: (x: number, y: number) => void;
}

export function useDrag({ onMove, onEnd }: DragOptions) {
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent, noteX: number, noteY: number) => {
    e.preventDefault();
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, nx: noteX, ny: noteY };

    const handleMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = ev.clientX - start.current.mx;
      const dy = ev.clientY - start.current.my;
      onMove(start.current.nx + dx, start.current.ny + dy);
    };

    const handleUp = (ev: MouseEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      const dx = ev.clientX - start.current.mx;
      const dy = ev.clientY - start.current.my;
      onEnd(start.current.nx + dx, start.current.ny + dy);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [onMove, onEnd]);

  const onTouchStart = useCallback((e: React.TouchEvent, noteX: number, noteY: number) => {
    const touch = e.touches[0];
    start.current = { mx: touch.clientX, my: touch.clientY, nx: noteX, ny: noteY };

    const handleMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      const dx = t.clientX - start.current.mx;
      const dy = t.clientY - start.current.my;
      onMove(start.current.nx + dx, start.current.ny + dy);
    };

    const handleEnd = (ev: TouchEvent) => {
      const t = ev.changedTouches[0];
      const dx = t.clientX - start.current.mx;
      const dy = t.clientY - start.current.my;
      onEnd(start.current.nx + dx, start.current.ny + dy);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  }, [onMove, onEnd]);

  return { onMouseDown, onTouchStart };
}
