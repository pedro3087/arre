import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'nav-visibility';

interface NavVisibilityContextValue {
  visibility: Record<string, boolean>;
  toggleItem: (path: string) => void;
  isVisible: (path: string) => boolean;
}

const NavVisibilityContext = createContext<NavVisibilityContextValue>({
  visibility: {},
  toggleItem: () => {},
  isVisible: () => true,
});

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });

  const toggleItem = (path: string) => {
    setVisibility((prev: Record<string, boolean>) => {
      const next = { ...prev };
      if (next[path] === false) {
        delete next[path];
      } else {
        next[path] = false;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isVisible = (path: string) => visibility[path] !== false;

  return (
    <NavVisibilityContext.Provider value={{ visibility, toggleItem, isVisible }}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export const useNavVisibility = () => useContext(NavVisibilityContext);
