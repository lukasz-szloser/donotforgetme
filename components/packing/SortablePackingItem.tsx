"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PackingItem } from "./PackingItem";
import type { Database } from "@/types/database";

type PackingItemData = Database["public"]["Tables"]["packing_items"]["Row"] & {
  children?: PackingItemData[];
};

interface SortablePackingItemProps {
  item: PackingItemData;
}

export function SortablePackingItem({ item }: SortablePackingItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PackingItem item={item} />
    </div>
  );
}
