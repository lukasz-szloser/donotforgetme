"use client";

import { ReactNode } from "react";
import { usePackingMode } from "./PackingModeContext";

interface ConditionalAddFormProps {
  children: ReactNode;
}

export function ConditionalAddForm({ children }: ConditionalAddFormProps) {
  const { isPackingMode } = usePackingMode();

  if (isPackingMode) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-10">
      {children}
    </div>
  );
}
