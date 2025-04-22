import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isPropertyModalOpen: boolean;
  setPropertyModalOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [isPropertyModalOpen, setPropertyModalOpen] = useState(false);

  return (
    <UIContext.Provider value={{ 
      isPropertyModalOpen, 
      setPropertyModalOpen
    }}>
      {children}
    </UIContext.Provider>
  );
}