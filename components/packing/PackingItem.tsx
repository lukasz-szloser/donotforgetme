"use client";

import { useState, useTransition } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Trash2, ChevronRight, Plus, Pencil, FolderOpen } from "lucide-react";
import { toggleItemChecked, deleteItem, addItem, updateItem } from "@/actions/packing";
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

export function PackingItem({ item, depth = 0, maxVisibleDepth = 5 }: PackingItemProps) {
  const { isPackingMode } = usePackingMode();
  const [isChecked, setIsChecked] = useState(item.checked);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSwipeMenu, setShowSwipeMenu] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const [editTitle, setEditTitle] = useState(item.title);
  const x = useMotionValue(0);

  // Swipe indicators
  const swipeRightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const swipeLeftOpacity = useTransform(x, [0, -SWIPE_THRESHOLD], [0, 1]);

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

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Podaj nazwę elementu");
      return;
    }

    const formData = new FormData();
    formData.append("itemId", item.id);
    formData.append("title", editTitle);

    const result = await updateItem(formData);

    if (!result.success) {
      toast.error(result.error || "Nie udało się zaktualizować");
    } else {
      toast.success("Element zaktualizowany");
      setIsEditing(false);
    }
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
      setIsExpanded(true);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isPackingMode) {
      x.set(0);
      return;
    }

    const offsetX = info.offset.x;

    if (offsetX > SWIPE_THRESHOLD) {
      handleToggle();
      x.set(0);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      setShowSwipeMenu(true);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const canAddChildren = depth < 4;

  const handleRowClick = () => {
    if (isPackingMode) {
      handleToggle();
    }
  };

  return (
    <div
      className={cn(
        "relative",
        isNested && "ml-4 border-l-2 border-border/50 dark:border-border/30"
      )}
    >
      {/* Swipe indicators - hidden in packing mode */}
      <div className="relative overflow-hidden rounded-lg">
        {!isPackingMode && (
          <>
            {/* Left indicator (edit/delete menu) */}
            <motion.div
              style={{ opacity: swipeLeftOpacity }}
              className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-muted text-muted-foreground"
            >
              <Pencil className="w-5 h-5" />
            </motion.div>

            {/* Right indicator (check) */}
            <motion.div
              style={{ opacity: swipeRightOpacity }}
              className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-success text-success-foreground"
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
          style={{ x }}
          onClick={handleRowClick}
          className={cn(
            "relative flex items-center gap-3 px-4 py-3 bg-card",
            isPackingMode ? "min-h-[56px]" : "min-h-[52px]",
            !isPackingMode && "cursor-grab active:cursor-grabbing",
            isPackingMode && "cursor-pointer hover:bg-muted/50",
            "border-b border-border/30 transition-all duration-200",
            isPending && "opacity-50",
            isChecked && "bg-success/5"
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
              "flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all duration-200 touch-target",
              isPackingMode ? "w-8 h-8" : "w-7 h-7",
              isChecked
                ? "bg-primary border-primary"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
            type="button"
          >
            {isChecked && (
              <Check className={cn(isPackingMode ? "w-5 h-5" : "w-4 h-4", "text-primary-foreground")} />
            )}
          </button>

          {/* Title */}
          <span
            className={cn(
              "flex-1 transition-all duration-200",
              isPackingMode ? "text-lg font-medium" : "text-base",
              isChecked && "line-through text-muted-foreground"
            )}
          >
            {item.title}
          </span>

          {/* Children count badge */}
          {hasChildren && !isExpanded && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {item.children!.length}
            </span>
          )}

          {/* Add child button - only in edit mode */}
          {!isPackingMode && canAddChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingChild(true);
              }}
              className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors touch-target"
              type="button"
              title="Dodaj pod-element"
            >
              <Plus className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </button>
          )}

          {/* Expand button for nested items */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors touch-target"
              type="button"
            >
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
        </motion.div>
      </div>

      {/* Dialog for adding child items */}
      <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj pod-element</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Rodzic: <span className="font-medium text-foreground">{item.title}</span>
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
                className="h-12 rounded-xl"
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
              className="touch-target"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleAddChild}
              disabled={!childTitle.trim()}
              className="btn-primary touch-target"
            >
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing item */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edytuj element</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nazwa elementu..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEdit();
                }
              }}
              autoFocus
              className="h-12 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditTitle(item.title);
              }}
              className="touch-target"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editTitle.trim()}
              className="btn-primary touch-target"
            >
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swipe menu dialog */}
      <Dialog open={showSwipeMenu} onOpenChange={setShowSwipeMenu}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="truncate pr-4">{item.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Button
              onClick={() => {
                setShowSwipeMenu(false);
                setIsEditing(true);
              }}
              className="w-full justify-start h-12 rounded-xl"
              variant="outline"
            >
              <Pencil className="w-5 h-5 mr-3" />
              Edytuj
            </Button>
            <Button
              onClick={() => {
                setShowSwipeMenu(false);
                if (confirm("Czy na pewno chcesz usunąć ten element?")) {
                  handleDelete();
                }
              }}
              className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              variant="outline"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Usuń
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested children */}
      {hasChildren && isExpanded && !shouldLimitNesting && (
        <div className="mt-0.5">
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
        <div className="ml-4 p-3 text-sm text-muted-foreground bg-muted/50 rounded-lg flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {item.children!.length} pod-elementów
        </div>
      )}
    </div>
  );
}
