"use client";

import { useState, useTransition } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Trash2, ChevronRight, Plus } from "lucide-react";
import { toggleItemChecked, deleteItem, addItem } from "@/actions/packing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { usePackingMode } from "./PackingModeContext";

type PackingItemData = Database["public"]["Tables"]["packing_items"]["Row"] & {
  children?: PackingItemData[];
};

interface PackingItemProps {
  item: PackingItemData;
  depth?: number;
  maxVisibleDepth?: number;
}

const SWIPE_THRESHOLD = 50;
const MAX_SWIPE = 100;

export function PackingItem({ 
  item, 
  depth = 0, 
  maxVisibleDepth = 5
}: PackingItemProps) {
  const { isPackingMode } = usePackingMode();
  const [isChecked, setIsChecked] = useState(item.checked);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const x = useMotionValue(0);

  // Swipe indicators
  const swipeRightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const swipeLeftOpacity = useTransform(x, [0, -SWIPE_THRESHOLD], [0, 1]);
  const backgroundColor = useTransform(
    x,
    [-MAX_SWIPE, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, MAX_SWIPE],
    ["rgb(239 68 68)", "rgb(248 113 113)", "rgb(255 255 255)", "rgb(134 239 172)", "rgb(74 222 128)"]
  );

  const hasChildren = item.children && item.children.length > 0;
  const isNested = depth > 0;
  const shouldLimitNesting = depth >= maxVisibleDepth;

  // Optimistic UI - toggle immediately
  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);

    startTransition(async () => {
      const result = await toggleItemChecked(item.id, newChecked);
      if (!result.success) {
        // Revert on error
        setIsChecked(!newChecked);
        toast.error(result.error || "Nie udało się zaktualizować");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteItem(item.id);
      if (!result.success) {
        toast.error(result.error || "Nie udało się usunąć");
      } else {
        toast.success("Element usunięty");
      }
    });
  };

  const handleAddChild = async () => {
    if (!childTitle.trim()) {
      toast.error("Podaj nazwę pod-elementu");
      return;
    }

    const formData = new FormData();
    formData.append("listId", item.list_id);
    formData.append("parentId", item.id);
    formData.append("title", childTitle);

    const result = await addItem(formData);
    
    if (!result.success) {
      toast.error(result.error || "Nie udało się dodać pod-elementu");
    } else {
      toast.success("Pod-element dodany");
      setChildTitle("");
      setIsAddingChild(false);
      setIsExpanded(true); // Auto-expand to show new child
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Disable swipe in packing mode
    if (isPackingMode) {
      x.set(0);
      return;
    }

    const offsetX = info.offset.x;

    if (offsetX > SWIPE_THRESHOLD) {
      // Swipe right - toggle checked
      handleToggle();
      x.set(0);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      // Swipe left - delete
      if (confirm("Czy na pewno chcesz usunąć ten element?")) {
        handleDelete();
      }
      x.set(0);
    } else {
      // Bounce back
      x.set(0);
    }
  };

  const canAddChildren = depth < 4; // Allow adding children up to level 4 (so max depth is 5)

  // In packing mode: clicking anywhere toggles the item
  const handleRowClick = () => {
    if (isPackingMode) {
      handleToggle();
    }
  };

  return (
    <div className={cn("relative", isNested && "ml-4 border-l-2 border-slate-200")}>
      {/* Swipe indicators - hidden in packing mode */}
      <div className="relative overflow-hidden">
        {!isPackingMode && (
          <>
            {/* Left indicator (delete) */}
            <motion.div
              style={{ opacity: swipeLeftOpacity }}
              className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-red-500 text-white"
            >
              <Trash2 className="w-5 h-5" />
            </motion.div>

            {/* Right indicator (check) */}
            <motion.div
              style={{ opacity: swipeRightOpacity }}
              className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-green-500 text-white"
            >
              <Check className="w-5 h-5" />
            </motion.div>
          </>
        )}

        {/* Main item */}
        <motion.div
          drag={isPackingMode ? false : "x"}
          dragConstraints={{ left: -MAX_SWIPE, right: MAX_SWIPE }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x, backgroundColor: isPackingMode ? undefined : backgroundColor }}
          onClick={handleRowClick}
          className={cn(
            "relative flex items-center gap-3 p-3",
            isPackingMode ? "min-h-[56px]" : "min-h-[48px]",
            !isPackingMode && "cursor-grab active:cursor-grabbing",
            isPackingMode && "cursor-pointer",
            "border-b border-slate-200 transition-colors",
            isPending && "opacity-50"
          )}
        >
          {/* Checkbox */}
          <button
            onClick={(e) => {
              if (!isPackingMode) {
                e.stopPropagation();
              }
              handleToggle();
            }}
            disabled={isPending}
            className={cn(
              "flex-shrink-0 rounded border-2 flex items-center justify-center transition-all",
              isPackingMode ? "w-8 h-8" : "w-6 h-6",
              isChecked
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 hover:border-blue-500"
            )}
            type="button"
          >
            {isChecked && <Check className={cn(isPackingMode ? "w-5 h-5" : "w-4 h-4", "text-white")} />}
          </button>

          {/* Title */}
          <span
            className={cn(
              "flex-1",
              isPackingMode ? "text-lg" : "text-base",
              isChecked && "line-through text-slate-500"
            )}
          >
            {item.title}
          </span>

          {/* Add child button - only in edit mode */}
          {!isPackingMode && canAddChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingChild(true);
              }}
              className="flex-shrink-0 p-1 hover:bg-slate-100 rounded"
              type="button"
              title="Dodaj pod-element"
            >
              <Plus className="w-5 h-5 text-slate-600" />
            </button>
          )}

          {/* Expand button for nested items */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex-shrink-0 p-1 hover:bg-slate-100 rounded"
              type="button"
            >
              <ChevronRight
                className={cn(
                  "w-5 h-5 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
        </motion.div>
      </div>

      {/* Dialog for adding child items */}
      <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj pod-element</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Rodzic: <span className="font-medium">{item.title}</span>
              </p>
              <Input
                type="text"
                placeholder="Nazwa pod-elementu..."
                value={childTitle}
                onChange={(e) => setChildTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddChild();
                  }
                }}
                autoFocus
                className="min-h-[48px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingChild(false);
                setChildTitle("");
              }}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleAddChild}
              disabled={!childTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested children */}
      {hasChildren && isExpanded && !shouldLimitNesting && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <PackingItem
              key={child.id}
              item={child}
              depth={depth + 1}
              maxVisibleDepth={maxVisibleDepth}
            />
          ))}
        </div>
      )}

      {/* Drill-down indicator for deep nesting */}
      {hasChildren && shouldLimitNesting && (
        <div className="ml-4 p-2 text-sm text-slate-500 bg-slate-50 rounded">
          📦 {item.children!.length} pod-elementów (ograniczenie głębokości)
        </div>
      )}
    </div>
  );
}
