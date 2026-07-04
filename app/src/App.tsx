import { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Board from './components/Board';
import { useNotes } from './hooks/useNotes';
import { FavColorsContext } from './lib/context';
import { setAlwaysOnTop } from './lib/electron';
import type { User } from './lib/types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('sticky_user');
    return raw ? JSON.parse(raw) : null;
  });
  const authed = !!user && !!localStorage.getItem('sticky_token');

  const { notes, favoriteColors, addNote, updateNote, deleteNote, bringToFront, saveFavoriteColors } = useNotes(authed);

  const handleLogin = useCallback((u: User) => {
    localStorage.setItem('sticky_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('sticky_token');
    localStorage.removeItem('sticky_user');
    setUser(null);
  }, []);

  const handleFocus = useCallback((id: string) => {
    bringToFront(id);
  }, [bringToFront]);

  useEffect(() => {
    const anyPinned = notes.some(n => n.pinned);
    setAlwaysOnTop(anyPinned);
  }, [notes]);

  const handleAdd = useCallback(() => {
    const x = 60 + Math.random() * 200;
    const y = 60 + Math.random() * 200;
    addNote(x, y);
  }, [addNote]);

  if (!authed) {
    return <LoginScreen onLogin={(u, token) => { localStorage.setItem('sticky_token', token); handleLogin(u); }} />;
  }

  return (
    <FavColorsContext.Provider value={{ favColors: favoriteColors, saveFavColors: saveFavoriteColors }}>
      <Board
        notes={notes}
        user={user!}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onFocus={handleFocus}
        onAdd={handleAdd}
        onLogout={handleLogout}
      />
    </FavColorsContext.Provider>
  );
}
