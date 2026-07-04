export type NoteShape = 'rectangle' | 'square' | 'circle' | 'hexagon' | 'star' | 'flower';
export type NoteFont = 'Montserrat' | 'Inter' | 'Fira Code' | 'Special Elite' | 'Courier Prime';

export interface Note {
  id: string;
  user_id: number;
  content: string;
  color: string;
  opacity: number;
  shape: NoteShape;
  font: NoteFont;
  font_size: number;
  pinned: boolean;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  avatar_url: string;
}
