"use client";

import { createContext, useContext, ReactNode } from "react";

interface PackingModeContextType {
  isPackingMode: boolean;
}

const PackingModeContext = createContext<PackingModeContextType>({
  isPackingMode: false,
});

export function usePackingMode() {
  return useContext(PackingModeContext);
}

interface PackingModeProviderProps {
  isPackingMode: boolean;
  children: ReactNode;
}

export function PackingModeProvider({ isPackingMode, children }: PackingModeProviderProps) {
  return (
    <PackingModeContext.Provider value={{ isPackingMode }}>
      {children}
    </PackingModeContext.Provider>
  );
}
