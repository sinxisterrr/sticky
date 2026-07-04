import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note as NoteType } from '../lib/types';
import { getShapeStyle, hasStickyStrip, getContentPadding } from '../lib/shapes';
import { hexToRgba, darkenHex } from '../lib/colors';
import { useDrag } from '../hooks/useDrag';
import NoteToolbar from './NoteToolbar';

interface Props {
  note: NoteType;
  onUpdate: (id: string, data: Partial<NoteType>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

export default function Note({ note, onUpdate, onDelete, onFocus }: Props) {
  const [editing, setEditing] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const [localPos, setLocalPos] = useState({ x: note.pos_x, y: note.pos_y });
  const [localSize, setLocalSize] = useState({ w: note.width, h: note.height });
  const [showToolbar, setShowToolbar] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentSizeRef = useRef({ w: note.width, h: note.height });

  useEffect(() => { setLocalContent(note.content); }, [note.content]);
  useEffect(() => { setLocalPos({ x: note.pos_x, y: note.pos_y }); }, [note.pos_x, note.pos_y]);
  useEffect(() => {
    const s = { w: note.width, h: note.height };
    setLocalSize(s);
    currentSizeRef.current = s;
  }, [note.width, note.height]);

  const handleMove = useCallback((x: number, y: number) => setLocalPos({ x, y }), []);
  const handleEnd = useCallback((x: number, y: number) => {
    setLocalPos({ x, y });
    onUpdate(note.id, { pos_x: x, pos_y: y });
  }, [note.id, onUpdate]);
  const { onMouseDown: dragMouseDown, onTouchStart: dragTouchStart } = useDrag({ onMove: handleMove, onEnd: handleEnd });

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onUpdate(note.id, { content: val }), 800);
  };

  function startEditing() {
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function stopEditing() {
    setEditing(false);
    onUpdate(note.id, { content: localContent });
  }

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { w: startW, h: startH } = currentSizeRef.current;
    const squareLike = note.shape !== 'rectangle';

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let w: number, h: number;
      if (squareLike) {
        const size = Math.max(80, startW + Math.max(dx, dy));
        w = size; h = size;
      } else {
        w = Math.max(120, startW + dx);
        h = Math.max(80, startH + dy);
      }
      currentSizeRef.current = { w, h };
      setLocalSize({ w, h });
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      onUpdate(note.id, { width: currentSizeRef.current.w, height: currentSizeRef.current.h });
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const hasStrip = hasStickyStrip(note.shape);
  const shapeStyle = getShapeStyle(note.shape, localSize.w, localSize.h);
  const size = Math.min(localSize.w, localSize.h);
  const contentPadding = getContentPadding(note.shape, size);
  const stripColor = darkenHex(note.color, 0.12);
  const bodyAlpha = note.opacity;
  const stripAlpha = Math.min(1, note.opacity + 0.25);
  const bodyBg = note.opacity >= 0.99 ? note.color : hexToRgba(note.color, bodyAlpha);
  const stripBg = note.opacity >= 0.99 ? stripColor : hexToRgba(stripColor, stripAlpha);

  // Bounding box for the motion wrapper
  const boxW = hasStrip ? localSize.w : size;
  const boxH = hasStrip ? localSize.h : size;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.7, opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        position: 'absolute',
        left: localPos.x,
        top: localPos.y,
        width: boxW,
        height: boxH,
        zIndex: note.z_index,
        userSelect: editing ? 'text' : 'none',
        touchAction: 'none',
        // faint guide for shaped notes so the resize grip corner is findable
        outline: (!hasStrip && showToolbar) ? '1px dashed rgba(255,255,255,0.18)' : 'none',
      }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => { if (!editing) setShowToolbar(false); }}
      onClick={() => onFocus(note.id)}
    >
      {/* ── Visual shape ── */}
      <div
        style={{
          ...shapeStyle,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: note.opacity > 0.1
            ? '0 4px 24px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)'
            : 'none',
          backdropFilter: note.opacity < 0.85 ? 'blur(6px)' : 'none',
          WebkitBackdropFilter: note.opacity < 0.85 ? 'blur(6px)' : 'none',
          // non-strip shapes: whole shape is the drag handle
          cursor: hasStrip ? 'default' : editing ? 'default' : 'grab',
        }}
        onMouseDown={
          !hasStrip && !editing
            ? e => { dragMouseDown(e, localPos.x, localPos.y); onFocus(note.id); }
            : undefined
        }
        onTouchStart={
          !hasStrip && !editing
            ? e => { dragTouchStart(e, localPos.x, localPos.y); onFocus(note.id); }
            : undefined
        }
      >
        {hasStrip ? (
          <>
            {/* Sticky strip — drag area */}
            <div
              className="sticky-strip"
              style={{
                background: stripBg,
                height: 32,
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                cursor: 'grab',
                flexShrink: 0,
                borderRadius: '16px 16px 0 0',
              }}
              onMouseDown={e => { dragMouseDown(e, localPos.x, localPos.y); onFocus(note.id); }}
              onTouchStart={e => { dragTouchStart(e, localPos.x, localPos.y); onFocus(note.id); }}
            >
              {note.pinned && (
                <span style={{ fontSize: 11, opacity: 0.6, fontFamily: note.font }}>📌</span>
              )}
            </div>

            {/* Note body */}
            <div
              style={{
                background: bodyBg,
                flex: 1,
                padding: '10px 12px 12px',
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              onDoubleClick={() => { if (!editing) startEditing(); }}
            >
              <NoteBody
                editing={editing}
                content={localContent}
                note={note}
                hasStrip={true}
                textareaRef={textareaRef}
                onChange={handleContentChange}
                onBlur={stopEditing}
              />
            </div>
          </>
        ) : (
          /* Non-strip shapes: centered content with shape-aware padding */
          <div
            style={{
              background: bodyBg,
              width: '100%',
              height: '100%',
              padding: contentPadding,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onMouseDown={e => { e.stopPropagation(); onFocus(note.id); }}
            onDoubleClick={e => { e.stopPropagation(); if (!editing) startEditing(); }}
          >
            <NoteBody
              editing={editing}
              content={localContent}
              note={note}
              hasStrip={false}
              textareaRef={textareaRef}
              onChange={handleContentChange}
              onBlur={stopEditing}
            />
          </div>
        )}
      </div>

      {/* ── Toolbar overlay — sits OUTSIDE clip-path, floats over all shapes ── */}
      {showToolbar && (
        <div
          style={{
            position: 'absolute',
            top: hasStrip ? 4 : Math.round(boxH * 0.08),
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(12, 10, 28, 0.86)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 18,
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.38)',
            border: '1px solid rgba(255,255,255,0.09)',
            whiteSpace: 'nowrap',
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <NoteToolbar note={note} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      )}

      {/* ── Resize grip ── */}
      {showToolbar && (
        <div
          onMouseDown={handleResizeMouseDown}
          title="Resize"
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 18,
            height: 18,
            cursor: 'nwse-resize',
            zIndex: 200,
            opacity: 0.45,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="white">
            <path d="M11 0 L11 11 L0 11 Z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

interface BodyProps {
  editing: boolean;
  content: string;
  note: NoteType;
  hasStrip: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (v: string) => void;
  onBlur: () => void;
}

function NoteBody({ editing, content, note, hasStrip, textareaRef, onChange, onBlur }: BodyProps) {
  const base: React.CSSProperties = {
    fontFamily: note.font,
    fontSize: note.font_size,
    lineHeight: 1.6,
    color: '#1a1a2e',
  };

  if (editing && hasStrip) {
    // Live split view: raw markdown on top, rendered preview below
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          style={{
            ...base,
            fontFamily: 'Fira Code, monospace',
            fontSize: Math.max(11, note.font_size - 1),
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            outline: 'none',
            resize: 'none',
            padding: '6px 8px',
            flexShrink: 0,
            minHeight: 56,
            maxHeight: 150,
            overflowY: 'auto',
            width: '100%',
          }}
          placeholder="markdown here..."
        />
        <div style={{ height: 1, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
        <div
          style={{ ...base, flex: 1, overflow: 'auto', minHeight: 0, paddingTop: 4 }}
          className="note-markdown"
        >
          {content
            ? <NoteMarkdown content={content} onChange={onChange} />
            : <span style={{ opacity: 0.28, fontStyle: 'italic' }}>preview...</span>
          }
        </div>
      </div>
    );
  }

  if (editing) {
    // Textarea-only for shaped notes (too small for split)
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        style={{
          ...base,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          width: '100%',
          height: '100%',
          minHeight: 40,
        }}
        placeholder="write..."
      />
    );
  }

  if (!content) {
    return (
      <span style={{ ...base, opacity: 0.35, fontStyle: 'italic', fontSize: note.font_size - 1 }}>
        double-click to write...
      </span>
    );
  }

  return (
    <div style={{ ...base, overflow: 'auto', flex: 1, width: '100%' }} className="note-markdown">
      <NoteMarkdown content={content} onChange={onChange} />
    </div>
  );
}

function NoteMarkdown({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  let ci = 0;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        input: ({ type, checked }) => {
          if (type !== 'checkbox') return null;
          const idx = ci++;
          return (
            <input
              type="checkbox"
              checked={!!checked}
              style={{ cursor: 'pointer', marginRight: 5 }}
              onChange={() => {
                let n = 0;
                const next = content.replace(/- \[(x| )\]/gi, m => {
                  const hit = n++ === idx;
                  if (!hit) return m;
                  return /x/i.test(m[3]) ? '- [ ]' : '- [x]';
                });
                onChange(next);
              }}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

import type React from 'react';
