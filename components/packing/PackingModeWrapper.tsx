"use client";

import { ReactNode, useMemo } from "react";
import { usePackingMode } from "./PackingModeContext";
import { PackingSession } from "./PackingSession";
import type { PackingItem } from "@/types/database";

interface PackingModeWrapperProps {
  listId: string;
  packingQueueData: string; // JSON serialized data
  children: ReactNode;
}

export function PackingModeWrapper({ packingQueueData, children }: PackingModeWrapperProps) {
  const { isPackingMode } = usePackingMode();

  const packingQueue = useMemo<PackingItem[]>(() => {
    try {
      return JSON.parse(packingQueueData);
    } catch {
      return [];
    }
  }, [packingQueueData]);

  if (isPackingMode) {
    return (
      <div className="min-h-[60vh]">
        <PackingSession queue={packingQueue} />
      </div>
    );
  }

  return <>{children}</>;
}
