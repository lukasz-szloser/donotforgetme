"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderItems } from "@/actions/packing";
import { toast } from "sonner";
import { SortablePackingItem } from "./SortablePackingItem";
import type { Database } from "@/types/database";

type PackingItemData = Database["public"]["Tables"]["packing_items"]["Row"] & {
  children?: PackingItemData[];
};

interface SortablePackingListProps {
  items: PackingItemData[];
  listId: string;
}

export function SortablePackingList({ items: initialItems, listId }: SortablePackingListProps) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (allows swipe to work)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistic UI update
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update positions on server
    const updatedPositions = newItems.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    const result = await reorderItems(listId, updatedPositions);

    if (!result.success) {
      // Revert on error
      setItems(items);
      toast.error(result.error || "Nie udało się zmienić kolejności");
    } else {
      toast.success("Kolejność zmieniona");
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <SortablePackingItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
