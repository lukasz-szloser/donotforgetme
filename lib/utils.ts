import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PackingItem } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transforms a flat list of packing items into a tree structure
 * using the Adjacency List pattern (parent_id references).
 * 
 * @param items - Flat array of packing items from database
 * @returns Array of root items (items without parent_id) with nested children
 */
export function buildTreeFromFlatList(
  items: PackingItem[]
): (PackingItem & { children?: PackingItem[] })[] {
  // Create a map for quick lookup
  const itemMap = new Map<string, PackingItem & { children?: PackingItem[] }>();
  const roots: (PackingItem & { children?: PackingItem[] })[] = [];

  // First pass: create all nodes
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build the tree
  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort by position
  const sortByPosition = (
    items: (PackingItem & { children?: PackingItem[] })[]
  ) => {
    items.sort((a, b) => a.position - b.position);
    items.forEach((item) => {
      if (item.children) {
        sortByPosition(item.children);
      }
    });
  };

  sortByPosition(roots);
  return roots;
}
