import { useState } from 'react';
import type { Note, NoteShape, NoteFont } from '../lib/types';
import ColorPicker from './ColorPicker';

const SHAPES: { value: NoteShape; label: string }[] = [
  { value: 'rectangle', label: '▭' },
  { value: 'square', label: '■' },
  { value: 'circle', label: '●' },
  { value: 'hexagon', label: '⬡' },
  { value: 'star', label: '★' },
  { value: 'flower', label: '✿' },
];

const FONTS: { value: NoteFont; label: string }[] = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Special Elite', label: 'Typewriter' },
  { value: 'Courier Prime', label: 'Courier' },
];

interface Props {
  note: Note;
  onUpdate: (id: string, data: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

export default function NoteToolbar({ note, onUpdate, onDelete }: Props) {
  const [panel, setPanel] = useState<'color' | 'font' | 'shape' | 'opacity' | null>(null);

  function toggle(p: typeof panel) {
    setPanel(prev => (prev === p ? null : p));
  }

  return (
    <div
      className="note-toolbar"
      style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}
      onMouseDown={e => e.stopPropagation()}
    >
      <ToolBtn title="Color" onClick={() => toggle('color')}>🎨</ToolBtn>
      <ToolBtn title="Font" onClick={() => toggle('font')}>T</ToolBtn>
      <ToolBtn title="Shape" onClick={() => toggle('shape')}>◈</ToolBtn>
      <ToolBtn title="Opacity" onClick={() => toggle('opacity')}>◑</ToolBtn>
      <ToolBtn
        title={note.pinned ? 'Unpin' : 'Pin to top'}
        onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
        active={note.pinned}
      >📌</ToolBtn>
      <ToolBtn title="Delete" onClick={() => onDelete(note.id)} danger>✕</ToolBtn>

      {panel === 'color' && (
        <FloatingPanel onClose={() => setPanel(null)}>
          <ColorPicker
            color={note.color}
            onChange={color => onUpdate(note.id, { color })}
          />
        </FloatingPanel>
      )}

      {panel === 'font' && (
        <FloatingPanel onClose={() => setPanel(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
            {FONTS.map(f => (
              <button
                key={f.value}
                onClick={() => { onUpdate(note.id, { font: f.value }); setPanel(null); }}
                style={{
                  fontFamily: f.value,
                  background: note.font === f.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: 'none', borderRadius: 6, padding: '5px 10px',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13,
                }}
              >{f.label}</button>
            ))}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 6, marginTop: 2 }}>
              <label style={{ fontSize: 11, opacity: 0.6 }}>Size</label>
              <input
                type="range" min={10} max={24} value={note.font_size}
                onChange={e => onUpdate(note.id, { font_size: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </FloatingPanel>
      )}

      {panel === 'shape' && (
        <FloatingPanel onClose={() => setPanel(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {SHAPES.map(s => (
              <button
                key={s.value}
                onClick={() => { onUpdate(note.id, { shape: s.value }); setPanel(null); }}
                title={s.value}
                style={{
                  fontSize: 18, background: note.shape === s.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8,
                  width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{s.label}</button>
            ))}
          </div>
        </FloatingPanel>
      )}

      {panel === 'opacity' && (
        <FloatingPanel onClose={() => setPanel(null)}>
          <div style={{ minWidth: 160, padding: '4px 0' }}>
            <label style={{ fontSize: 11, opacity: 0.6 }}>Opacity</label>
            <input
              type="range" min={0.05} max={1} step={0.05} value={note.opacity}
              onChange={e => onUpdate(note.id, { opacity: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.5 }}>
              <span>ghost</span><span>full</span>
            </div>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
}

function ToolBtn({ children, onClick, title, active, danger }: {
  children: React.ReactNode; onClick: () => void; title?: string;
  active?: boolean; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
        border: 'none', borderRadius: 5, width: 22, height: 22,
        cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#ef4444' : 'inherit', opacity: 0.75,
      }}
    >{children}</button>
  );
}

function FloatingPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute', top: 28, right: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {children}
      </div>
    </>
  );
}

import type React from 'react';
