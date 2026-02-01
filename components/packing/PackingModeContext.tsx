"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface PackingModeContextType {
  isPackingMode: boolean;
  setIsPackingMode: (mode: boolean) => void;
}

const PackingModeContext = createContext<PackingModeContextType>({
  isPackingMode: false,
  setIsPackingMode: () => {},
});

export function usePackingMode() {
  return useContext(PackingModeContext);
}

interface PackingModeProviderProps {
  isPackingMode?: boolean;
  children: ReactNode;
}

export function PackingModeProvider({
  isPackingMode: initialMode = false,
  children,
}: PackingModeProviderProps) {
  const [isPackingMode, setIsPackingMode] = useState(initialMode);

  return (
    <PackingModeContext.Provider value={{ isPackingMode, setIsPackingMode }}>
      {children}
    </PackingModeContext.Provider>
  );
}
