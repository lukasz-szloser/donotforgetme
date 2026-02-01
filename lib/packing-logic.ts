import type { PackingItem } from "@/types/database";

type PackingItemWithChildren = PackingItem & {
  children?: PackingItemWithChildren[];
};

/**
 * Applies Smart Check logic to a tree of packing items.
 *
 * Bubble Down: When a parent is checked/unchecked, all descendants are updated.
 * Bubble Up: When all children are checked, parent becomes checked.
 *            When any child is unchecked, parent becomes unchecked.
 *
 * @param items - Tree structure of packing items
 * @param itemId - ID of the item being toggled
 * @param checked - New checked state
 * @returns Flat array of all items with updated checked states
 */
export function applySmartCheck(
  items: PackingItemWithChildren[],
  itemId: string,
  checked: boolean
): PackingItem[] {
  // Build a flat map of all items for easy lookup and updates
  const itemMap = new Map<string, PackingItem>();
  const parentMap = new Map<string, string>(); // child -> parent mapping

  const flatten = (nodes: PackingItemWithChildren[]) => {
    nodes.forEach((node) => {
      itemMap.set(node.id, {
        id: node.id,
        title: node.title,
        checked: node.checked,
        parent_id: node.parent_id,
        position: node.position,
        list_id: node.list_id,
        created_at: node.created_at,
        updated_at: node.updated_at,
      });

      if (node.parent_id) {
        parentMap.set(node.id, node.parent_id);
      }

      if (node.children) {
        flatten(node.children);
      }
    });
  };

  flatten(items);

  // Check if item exists
  const targetItem = itemMap.get(itemId);
  if (!targetItem) {
    return Array.from(itemMap.values());
  }

  // Update the target item
  itemMap.set(itemId, { ...targetItem, checked });

  // Bubble Down: Update all descendants
  const updateDescendants = (id: string, newChecked: boolean) => {
    itemMap.forEach((item) => {
      if (item.parent_id === id) {
        itemMap.set(item.id, { ...item, checked: newChecked });
        updateDescendants(item.id, newChecked); // Recursive
      }
    });
  };

  updateDescendants(itemId, checked);

  // Bubble Up: Update ancestors based on children's state
  const updateAncestors = (childId: string) => {
    const parentId = parentMap.get(childId);
    if (!parentId) return;

    const parent = itemMap.get(parentId);
    if (!parent) return;

    // Get all children of this parent
    const children = Array.from(itemMap.values()).filter((item) => item.parent_id === parentId);

    if (children.length === 0) return;

    // Check if all children are checked
    const allChildrenChecked = children.every((child) => child.checked);

    // Update parent's checked state
    const newParentChecked = allChildrenChecked;

    if (parent.checked !== newParentChecked) {
      itemMap.set(parentId, { ...parent, checked: newParentChecked });
      // Continue bubbling up
      updateAncestors(parentId);
    }
  };

  updateAncestors(itemId);

  return Array.from(itemMap.values());
}

/**
 * Generates a queue of leaf items (items without children) that are unchecked.
 * Items are sorted so that deeper items appear first.
 *
 * @param items - Tree structure of packing items
 * @returns Flat array of leaf items, sorted by depth (deepest first)
 */
export function generatePackingQueue(items: PackingItemWithChildren[]): PackingItem[] {
  const leaves: Array<PackingItem & { depth: number }> = [];

  const traverse = (nodes: PackingItemWithChildren[], depth: number) => {
    nodes.forEach((node) => {
      const hasChildren = node.children && node.children.length > 0;

      if (!hasChildren && !node.checked) {
        leaves.push({
          id: node.id,
          title: node.title,
          checked: node.checked,
          parent_id: node.parent_id,
          position: node.position,
          list_id: node.list_id,
          created_at: node.created_at,
          updated_at: node.updated_at,
          depth,
        });
      }

      if (hasChildren) {
        traverse(node.children!, depth + 1);
      }
    });
  };

  traverse(items, 0);

  // Sort by depth (deepest first), then by position
  leaves.sort((a, b) => {
    if (a.depth !== b.depth) {
      return b.depth - a.depth; // Deeper items first
    }
    return a.position - b.position;
  });

  // Remove depth property before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return leaves.map(({ depth, ...item }) => item);
}
