import { createContext, useContext, useState, type ReactNode } from 'react';
import { readTheme, THEME_KEY, type Theme } from './LumivoxLogo';

// Single source of truth for the day/night theme. Every toggle and every themed
// page reads/writes this, so switching anywhere updates the whole UI.
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue>({ theme: 'day', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy init from localStorage / OS preference so there's no first-paint flash.
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  const toggle = (): void =>
    setTheme((t) => {
      const next: Theme = t === 'night' ? 'day' : 'night';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Safe against storage quota or security restrictions
      }
      return next;
    });

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
