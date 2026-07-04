import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note as NoteType } from '../lib/types';
import { getShapeStyle, hasStickyStrip } from '../lib/shapes';
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
  const [showToolbar, setShowToolbar] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setLocalContent(note.content); }, [note.content]);
  useEffect(() => { setLocalPos({ x: note.pos_x, y: note.pos_y }); }, [note.pos_x, note.pos_y]);

  const handleMove = useCallback((x: number, y: number) => {
    setLocalPos({ x, y });
  }, []);

  const handleEnd = useCallback((x: number, y: number) => {
    setLocalPos({ x, y });
    onUpdate(note.id, { pos_x: x, pos_y: y });
  }, [note.id, onUpdate]);

  const { onMouseDown, onTouchStart } = useDrag({ onMove: handleMove, onEnd: handleEnd });

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onUpdate(note.id, { content: val }), 800);
  };

  const shapeStyle = getShapeStyle(note.shape, note.width, note.height);
  const hasStrip = hasStickyStrip(note.shape);
  const stripColor = darkenHex(note.color, 0.12);
  const bodyAlpha = note.opacity;
  const stripAlpha = Math.min(1, note.opacity + 0.25);

  const bodyBg = note.opacity >= 0.99
    ? note.color
    : hexToRgba(note.color, bodyAlpha);

  const stripBg = note.opacity >= 0.99
    ? stripColor
    : hexToRgba(stripColor, stripAlpha);

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
        zIndex: note.z_index,
        userSelect: editing ? 'text' : 'none',
        touchAction: 'none',
      }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => { if (!editing) setShowToolbar(false); }}
      onClick={() => onFocus(note.id)}
    >
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
        }}
      >
        {hasStrip ? (
          <>
            <div
              className="sticky-strip"
              style={{
                background: stripBg,
                height: 32,
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                cursor: 'grab',
                flexShrink: 0,
                borderRadius: note.shape === 'rectangle' ? '16px 16px 0 0' : '16px 16px 0 0',
              }}
              onMouseDown={e => { onMouseDown(e, localPos.x, localPos.y); onFocus(note.id); }}
              onTouchStart={e => { onTouchStart(e, localPos.x, localPos.y); onFocus(note.id); }}
            >
              <span style={{ fontSize: 11, opacity: 0.6, fontFamily: note.font, letterSpacing: 0.3 }}>
                {note.pinned ? '📌' : ''}
              </span>
              {showToolbar && (
                <NoteToolbar note={note} onUpdate={onUpdate} onDelete={onDelete} />
              )}
            </div>

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
              onDoubleClick={() => { setEditing(true); setTimeout(() => textareaRef.current?.focus(), 0); }}
            >
              <NoteBody
                editing={editing}
                content={localContent}
                note={note}
                textareaRef={textareaRef}
                onChange={handleContentChange}
                onBlur={() => { setEditing(false); setShowToolbar(false); onUpdate(note.id, { content: localContent }); }}
              />
            </div>
          </>
        ) : (
          <div
            style={{ background: bodyBg, width: '100%', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            onDoubleClick={() => { setEditing(true); setTimeout(() => textareaRef.current?.focus(), 0); }}
          >
            <div
              style={{
                position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                width: 36, height: 8, borderRadius: 4,
                background: hexToRgba(darkenHex(note.color, 0.2), stripAlpha),
                cursor: 'grab', zIndex: 1,
              }}
              onMouseDown={e => { onMouseDown(e, localPos.x, localPos.y); onFocus(note.id); }}
              onTouchStart={e => { onTouchStart(e, localPos.x, localPos.y); onFocus(note.id); }}
            />
            {showToolbar && (
              <div style={{ position: 'absolute', top: 16, right: 8, zIndex: 2 }}>
                <NoteToolbar note={note} onUpdate={onUpdate} onDelete={onDelete} />
              </div>
            )}
            <div style={{ padding: '28px 14px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <NoteBody
                editing={editing}
                content={localContent}
                note={note}
                textareaRef={textareaRef}
                onChange={handleContentChange}
                onBlur={() => { setEditing(false); setShowToolbar(false); onUpdate(note.id, { content: localContent }); }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface BodyProps {
  editing: boolean;
  content: string;
  note: NoteType;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (v: string) => void;
  onBlur: () => void;
}

function NoteBody({ editing, content, note, textareaRef, onChange, onBlur }: BodyProps) {
  const textStyle: React.CSSProperties = {
    fontFamily: note.font,
    fontSize: note.font_size,
    lineHeight: 1.6,
    color: '#1a1a2e',
    width: '100%',
    flex: 1,
  };

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        style={{
          ...textStyle,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          height: '100%',
          minHeight: 80,
        }}
        placeholder="write something..."
      />
    );
  }

  if (!content) {
    return (
      <span style={{ ...textStyle, opacity: 0.35, fontStyle: 'italic', fontSize: note.font_size - 1 }}>
        double-click to write...
      </span>
    );
  }

  return (
    <div style={{ ...textStyle, overflow: 'auto', flex: 1 }} className="note-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
