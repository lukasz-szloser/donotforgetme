"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { usePackingMode } from "./PackingModeContext";

export function PackingModeToggle() {
  const { isPackingMode, setIsPackingMode } = usePackingMode();

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-[120px] z-10">
      <div className="container mx-auto max-w-4xl flex items-center gap-3">
        <Package className="w-5 h-5 text-blue-600" />
        <Label htmlFor="packing-mode" className="flex-1 cursor-pointer">
          <span className="font-medium">Tryb pakowania</span>
          <p className="text-xs text-slate-500 mt-0.5">
            Uproszczony widok - tylko zaznaczanie elementów
          </p>
        </Label>
        <Switch
          id="packing-mode"
          checked={isPackingMode}
          onCheckedChange={setIsPackingMode}
        />
      </div>
    </div>
  );
}
