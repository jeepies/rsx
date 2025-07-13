import React, { createContext, useContext, useEffect, useState } from 'react';

type FavouritesContextType = {
  favourites: string[];
  addFavourite: (RSN: string) => void;
  removeFavourite: (RSN: string) => void;
};

const STORAGE_KEY = 'favouriteProfiles';

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavourites(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    }
  }, [favourites, initialized]);

  function addFavourite(RSN: string) {
    setFavourites((prev) => {
      if (prev.includes(RSN)) return prev;
      return [...prev, RSN];
    });
  }

  function removeFavourite(RSN: string) {
    setFavourites((prev) => prev.filter((p) => p !== RSN));
  }

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error('useFavourites used outside of Favourites context');
  return context;
}
