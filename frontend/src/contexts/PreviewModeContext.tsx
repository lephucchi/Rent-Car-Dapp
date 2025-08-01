import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SimulatedRole = 'admin' | 'inspector' | 'user';
export type SimulatedTheme = 'light-aurora' | 'dark-aurora';

interface PreviewModeContextType {
  isPreviewMode: boolean;
  simulatedRole: SimulatedRole;
  simulatedTheme: SimulatedTheme;
  showPreviewPanel: boolean;
  setIsPreviewMode: (enabled: boolean) => void;
  setSimulatedRole: (role: SimulatedRole) => void;
  setSimulatedTheme: (theme: SimulatedTheme) => void;
  setShowPreviewPanel: (show: boolean) => void;
  enterPreviewMode: () => void;
  exitPreviewMode: () => void;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

interface PreviewModeProviderProps {
  children: ReactNode;
}

export const PreviewModeProvider: React.FC<PreviewModeProviderProps> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<SimulatedRole>('user');
  const [simulatedTheme, setSimulatedTheme] = useState<SimulatedTheme>('light-aurora');
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const enterPreviewMode = () => {
    setIsPreviewMode(true);
    setShowPreviewPanel(false); // Hide panel after entering preview
  };

  const exitPreviewMode = () => {
    setIsPreviewMode(false);
    setShowPreviewPanel(false);
  };

  const value: PreviewModeContextType = {
    isPreviewMode,
    simulatedRole,
    simulatedTheme,
    showPreviewPanel,
    setIsPreviewMode,
    setSimulatedRole,
    setSimulatedTheme,
    setShowPreviewPanel,
    enterPreviewMode,
    exitPreviewMode,
  };

  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  );
};

export const usePreviewMode = (): PreviewModeContextType => {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error('usePreviewMode must be used within a PreviewModeProvider');
  }
  return context;
};
