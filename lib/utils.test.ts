import { describe, it, expect } from "vitest";
import { buildTreeFromFlatList } from "@/lib/utils";
import type { PackingItem } from "@/types/database";

type PackingItemWithChildren = PackingItem & {
  children?: PackingItemWithChildren[];
};

describe("buildTreeFromFlatList", () => {
  it("should convert flat list to tree structure", () => {
    const flatList: PackingItem[] = [
      {
        id: "1",
        list_id: "list-1",
        parent_id: null,
        title: "Parent Item",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        list_id: "list-1",
        parent_id: "1",
        title: "Child Item 1",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "3",
        list_id: "list-1",
        parent_id: "1",
        title: "Child Item 2",
        checked: false,
        position: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const tree = buildTreeFromFlatList(flatList);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("1");
    expect(tree[0].title).toBe("Parent Item");
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children![0].title).toBe("Child Item 1");
    expect(tree[0].children![1].title).toBe("Child Item 2");
  });

  it("should handle empty list", () => {
    const emptyList: PackingItem[] = [];
    const tree = buildTreeFromFlatList(emptyList);

    expect(tree).toHaveLength(0);
    expect(tree).toEqual([]);
  });

  it("should handle list with only root items", () => {
    const flatList: PackingItem[] = [
      {
        id: "1",
        list_id: "list-1",
        parent_id: null,
        title: "Root Item 1",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        list_id: "list-1",
        parent_id: null,
        title: "Root Item 2",
        checked: false,
        position: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const tree = buildTreeFromFlatList(flatList);

    expect(tree).toHaveLength(2);
    expect(tree[0].children).toHaveLength(0);
    expect(tree[1].children).toHaveLength(0);
  });

  it("should handle deep nesting (5 levels)", () => {
    const flatList: PackingItem[] = [
      {
        id: "1",
        list_id: "list-1",
        parent_id: null,
        title: "Level 1",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        list_id: "list-1",
        parent_id: "1",
        title: "Level 2",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "3",
        list_id: "list-1",
        parent_id: "2",
        title: "Level 3",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "4",
        list_id: "list-1",
        parent_id: "3",
        title: "Level 4",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "5",
        list_id: "list-1",
        parent_id: "4",
        title: "Level 5",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const tree = buildTreeFromFlatList(flatList) as PackingItemWithChildren[];

    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe("Level 1");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children![0].title).toBe("Level 2");
    expect(tree[0].children![0].children).toHaveLength(1);
    expect(tree[0].children![0].children![0].title).toBe("Level 3");
    expect(tree[0].children![0].children![0].children).toHaveLength(1);
    expect(tree[0].children![0].children![0].children![0].title).toBe("Level 4");
    expect(tree[0].children![0].children![0].children![0].children).toHaveLength(1);
    expect(tree[0].children![0].children![0].children![0].children![0].title).toBe("Level 5");
  });

  it("should sort items by position at each level", () => {
    const flatList: PackingItem[] = [
      {
        id: "1",
        list_id: "list-1",
        parent_id: null,
        title: "Root 2",
        checked: false,
        position: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        list_id: "list-1",
        parent_id: null,
        title: "Root 1",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "3",
        list_id: "list-1",
        parent_id: "1",
        title: "Child 2",
        checked: false,
        position: 1,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "4",
        list_id: "list-1",
        parent_id: "1",
        title: "Child 1",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const tree = buildTreeFromFlatList(flatList);

    expect(tree[0].title).toBe("Root 1");
    expect(tree[1].title).toBe("Root 2");
    expect(tree[1].children![0].title).toBe("Child 1");
    expect(tree[1].children![1].title).toBe("Child 2");
  });

  it("should handle orphaned items (parent does not exist)", () => {
    const flatList: PackingItem[] = [
      {
        id: "1",
        list_id: "list-1",
        parent_id: null,
        title: "Root Item",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        list_id: "list-1",
        parent_id: "non-existent",
        title: "Orphaned Item",
        checked: false,
        position: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const tree = buildTreeFromFlatList(flatList);

    // Orphaned item should not appear in tree (parent doesn't exist)
    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe("Root Item");
    expect(tree[0].children).toHaveLength(0);
  });
});
