import { AnimatePresence } from 'framer-motion';
import type { Note as NoteType, User } from '../lib/types';
import Note from './Note';

interface Props {
  notes: NoteType[];
  user: User;
  onUpdate: (id: string, data: Partial<NoteType>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onAdd: () => void;
  onLogout: () => void;
}

export default function Board({ notes, user, onUpdate, onDelete, onFocus, onAdd, onLogout }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
      }}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) onAdd();
      }}
    >
      <div
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          display: 'flex', gap: 10, alignItems: 'center',
        }}
      >
        <button
          onClick={onAdd}
          title="New note (or double-click canvas)"
          style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
            color: '#fff', fontSize: 20, width: 40, height: 40,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >+</button>
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {user.avatar_url && (
            <img src={user.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
          )}
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Montserrat' }}>
            {user.display_name?.split(' ')[0]}
          </span>
          <button
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: 11, cursor: 'pointer', padding: 0 }}
          >sign out</button>
        </div>
      </div>

      <AnimatePresence>
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onFocus={onFocus}
          />
        ))}
      </AnimatePresence>

      {notes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat', fontSize: 15,
            letterSpacing: 0.3,
          }}>
            double-click anywhere to add a note
          </p>
        </div>
      )}
    </div>
  );
}
