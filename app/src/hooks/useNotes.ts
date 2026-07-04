import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Note } from '../lib/types';

export function useNotes(authed: boolean) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  useEffect(() => {
    if (!authed) return;
    api.notes.list().then(setNotes).catch(console.error);
    api.notes.getColors().then(rows => setFavoriteColors(rows.map(r => r.color))).catch(console.error);
  }, [authed]);

  const addNote = useCallback(async (pos_x = 80, pos_y = 80) => {
    const maxZ = notes.reduce((m, n) => Math.max(m, n.z_index), 0);
    const note = await api.notes.create({ pos_x, pos_y, z_index: maxZ + 1 });
    setNotes(prev => [...prev, note]);
    return note;
  }, [notes]);

  const updateNote = useCallback(async (id: string, data: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    await api.notes.update(id, data);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await api.notes.delete(id);
  }, []);

  const bringToFront = useCallback(async (id: string) => {
    const maxZ = notes.reduce((m, n) => Math.max(m, n.z_index), 0);
    await updateNote(id, { z_index: maxZ + 1 });
  }, [notes, updateNote]);

  const saveFavoriteColors = useCallback(async (colors: string[]) => {
    setFavoriteColors(colors);
    await api.notes.saveColors(colors);
  }, []);

  return { notes, favoriteColors, addNote, updateNote, deleteNote, bringToFront, saveFavoriteColors };
}
