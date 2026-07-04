import { createContext } from 'react';

export const FavColorsContext = createContext<{
  favColors: string[];
  saveFavColors: (colors: string[]) => void;
}>({ favColors: [], saveFavColors: () => {} });
