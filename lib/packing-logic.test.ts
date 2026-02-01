import { describe, it, expect } from "vitest";
import { applySmartCheck, generatePackingQueue } from "@/lib/packing-logic";
import type { PackingItem } from "@/types/database";

type PackingItemWithChildren = PackingItem & {
  children?: PackingItemWithChildren[];
};

describe("Smart Check Logic", () => {
  describe("Bubble Down - zaznaczenie rodzica zaznacza dzieci", () => {
    it("powinno zaznaczyć wszystkie dzieci gdy rodzic zostaje zaznaczony", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "parent",
          title: "Kosmetyczka",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "child-1",
              title: "Pasta",
              checked: false,
              parent_id: "parent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-2",
              title: "Szczoteczka",
              checked: false,
              parent_id: "parent",
              position: 1,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "parent", true);

      expect(result.find((i) => i.id === "parent")?.checked).toBe(true);
      expect(result.find((i) => i.id === "child-1")?.checked).toBe(true);
      expect(result.find((i) => i.id === "child-2")?.checked).toBe(true);
    });

    it("powinno zaznaczyć głęboko zagnieżdżone dzieci", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "level-0",
          title: "Walizka",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "level-1",
              title: "Kosmetyczka",
              checked: false,
              parent_id: "level-0",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
              children: [
                {
                  id: "level-2",
                  title: "Zestaw szczoteczek",
                  checked: false,
                  parent_id: "level-1",
                  position: 0,
                  list_id: "list-1",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                  children: [
                    {
                      id: "level-3",
                      title: "Szczoteczka główna",
                      checked: false,
                      parent_id: "level-2",
                      position: 0,
                      list_id: "list-1",
                      created_at: "2024-01-01T00:00:00Z",
                      updated_at: "2024-01-01T00:00:00Z",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "level-0", true);

      expect(result.find((i) => i.id === "level-0")?.checked).toBe(true);
      expect(result.find((i) => i.id === "level-1")?.checked).toBe(true);
      expect(result.find((i) => i.id === "level-2")?.checked).toBe(true);
      expect(result.find((i) => i.id === "level-3")?.checked).toBe(true);
    });

    it("powinno odznaczyć wszystkie dzieci gdy rodzic zostaje odznaczony", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "parent",
          title: "Kosmetyczka",
          checked: true,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "child-1",
              title: "Pasta",
              checked: true,
              parent_id: "parent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-2",
              title: "Szczoteczka",
              checked: true,
              parent_id: "parent",
              position: 1,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "parent", false);

      expect(result.find((i) => i.id === "parent")?.checked).toBe(false);
      expect(result.find((i) => i.id === "child-1")?.checked).toBe(false);
      expect(result.find((i) => i.id === "child-2")?.checked).toBe(false);
    });
  });

  describe("Bubble Up - zaznaczenie wszystkich dzieci zaznacza rodzica", () => {
    it("powinno zaznaczyć rodzica gdy wszystkie dzieci są zaznaczone", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "parent",
          title: "Kosmetyczka",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "child-1",
              title: "Pasta",
              checked: true,
              parent_id: "parent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-2",
              title: "Szczoteczka",
              checked: false, // To zostanie zaznaczone
              parent_id: "parent",
              position: 1,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "child-2", true);

      expect(result.find((i) => i.id === "child-2")?.checked).toBe(true);
      expect(result.find((i) => i.id === "parent")?.checked).toBe(true);
    });

    it("powinno odznaczyć rodzica gdy jedno dziecko zostaje odznaczone", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "parent",
          title: "Kosmetyczka",
          checked: true,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "child-1",
              title: "Pasta",
              checked: true,
              parent_id: "parent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-2",
              title: "Szczoteczka",
              checked: true, // To zostanie odznaczone
              parent_id: "parent",
              position: 1,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "child-2", false);

      expect(result.find((i) => i.id === "child-2")?.checked).toBe(false);
      expect(result.find((i) => i.id === "parent")?.checked).toBe(false);
    });

    it("powinno propagować zaznaczenie w górę przez wiele poziomów", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "grandparent",
          title: "Walizka",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "parent",
              title: "Kosmetyczka",
              checked: false,
              parent_id: "grandparent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
              children: [
                {
                  id: "child-1",
                  title: "Pasta",
                  checked: true,
                  parent_id: "parent",
                  position: 0,
                  list_id: "list-1",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
                {
                  id: "child-2",
                  title: "Szczoteczka",
                  checked: false, // To zostanie zaznaczone
                  parent_id: "parent",
                  position: 1,
                  list_id: "list-1",
                  created_at: "2024-01-01T00:00:00Z",
                  updated_at: "2024-01-01T00:00:00Z",
                },
              ],
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "child-2", true);

      expect(result.find((i) => i.id === "child-2")?.checked).toBe(true);
      expect(result.find((i) => i.id === "parent")?.checked).toBe(true);
      expect(result.find((i) => i.id === "grandparent")?.checked).toBe(true);
    });

    it("nie powinno zaznaczyć rodzica gdy tylko część dzieci jest zaznaczona", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "parent",
          title: "Kosmetyczka",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          children: [
            {
              id: "child-1",
              title: "Pasta",
              checked: false, // To zostanie zaznaczone
              parent_id: "parent",
              position: 0,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-2",
              title: "Szczoteczka",
              checked: false, // To pozostanie odznaczone
              parent_id: "parent",
              position: 1,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "child-3",
              title: "Krem",
              checked: false, // To pozostanie odznaczone
              parent_id: "parent",
              position: 2,
              list_id: "list-1",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      ];

      const result = applySmartCheck(items, "child-1", true);

      expect(result.find((i) => i.id === "child-1")?.checked).toBe(true);
      expect(result.find((i) => i.id === "parent")?.checked).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("powinno obsłużyć element bez dzieci", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "item",
          title: "Pojedynczy przedmiot",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const result = applySmartCheck(items, "item", true);

      expect(result.find((i) => i.id === "item")?.checked).toBe(true);
    });

    it("powinno obsłużyć pustą listę", () => {
      const items: PackingItemWithChildren[] = [];

      const result = applySmartCheck(items, "non-existent", true);

      expect(result).toEqual([]);
    });

    it("powinno obsłużyć nieistniejący itemId", () => {
      const items: PackingItemWithChildren[] = [
        {
          id: "item",
          title: "Przedmiot",
          checked: false,
          parent_id: null,
          position: 0,
          list_id: "list-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const result = applySmartCheck(items, "non-existent", true);

      // Powinno zwrócić niezmienioną listę
      expect(result.find((i) => i.id === "item")?.checked).toBe(false);
    });
  });
});

describe("generatePackingQueue", () => {
  it("powinno zwrócić tylko liście (bez dzieci)", () => {
    const items: PackingItemWithChildren[] = [
      {
        id: "parent",
        title: "Kosmetyczka",
        checked: false,
        parent_id: null,
        position: 0,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        children: [
          {
            id: "child-1",
            title: "Pasta",
            checked: false,
            parent_id: "parent",
            position: 0,
            list_id: "list-1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "child-2",
            title: "Szczoteczka",
            checked: false,
            parent_id: "parent",
            position: 1,
            list_id: "list-1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    ];

    const queue = generatePackingQueue(items);

    expect(queue.length).toBe(2);
    expect(queue.map((i) => i.id)).toEqual(["child-1", "child-2"]);
  });

  it("powinno pominąć już spakowane elementy", () => {
    const items: PackingItemWithChildren[] = [
      {
        id: "item-1",
        title: "Spakowane",
        checked: true,
        parent_id: null,
        position: 0,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "item-2",
        title: "Niespakowane",
        checked: false,
        parent_id: null,
        position: 1,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    const queue = generatePackingQueue(items);

    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe("item-2");
  });

  it("powinno sortować głębsze elementy na początku", () => {
    const items: PackingItemWithChildren[] = [
      {
        id: "shallow",
        title: "Płytki element",
        checked: false,
        parent_id: null,
        position: 0,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "level-0",
        title: "Walizka",
        checked: false,
        parent_id: null,
        position: 1,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        children: [
          {
            id: "level-1",
            title: "Kosmetyczka",
            checked: false,
            parent_id: "level-0",
            position: 0,
            list_id: "list-1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
            children: [
              {
                id: "level-2",
                title: "Pasta",
                checked: false,
                parent_id: "level-1",
                position: 0,
                list_id: "list-1",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
              },
            ],
          },
        ],
      },
    ];

    const queue = generatePackingQueue(items);

    expect(queue.length).toBe(2);
    // Głębszy element powinien być pierwszy
    expect(queue[0]?.id).toBe("level-2");
    expect(queue[1]?.id).toBe("shallow");
  });

  it("powinno zwrócić pustą kolejkę gdy wszystko jest spakowane", () => {
    const items: PackingItemWithChildren[] = [
      {
        id: "item-1",
        title: "Wszystko spakowane",
        checked: true,
        parent_id: null,
        position: 0,
        list_id: "list-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        children: [
          {
            id: "child-1",
            title: "Dziecko też spakowane",
            checked: true,
            parent_id: "item-1",
            position: 0,
            list_id: "list-1",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    ];

    const queue = generatePackingQueue(items);

    expect(queue.length).toBe(0);
  });
});
