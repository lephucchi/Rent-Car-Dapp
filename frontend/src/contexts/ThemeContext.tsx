import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light-aurora' | 'dark-aurora';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLightMode: boolean;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'light-aurora';
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('luxerent-aurora-theme') as Theme;
    if (savedTheme && (savedTheme === 'light-aurora' || savedTheme === 'dark-aurora')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark-aurora';
    }
    
    return 'light-aurora';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light-aurora', 'dark-aurora', 'light', 'dark');
    
    // Add current Aurora theme class
    root.classList.add(theme);
    
    // Add legacy class for backward compatibility
    root.classList.add(theme === 'light-aurora' ? 'light' : 'dark');
    
    // Save to localStorage
    localStorage.setItem('luxerent-aurora-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('luxerent-aurora-theme')) {
        setThemeState(e.matches ? 'dark-aurora' : 'light-aurora');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light-aurora' ? 'dark-aurora' : 'light-aurora');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isLightMode: theme === 'light-aurora',
    isDarkMode: theme === 'dark-aurora',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
