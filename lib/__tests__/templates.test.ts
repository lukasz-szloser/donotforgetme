import { describe, it, expect } from "vitest";
import { packingTemplates, type TemplateItem } from "../templates";

describe("Packing Templates", () => {
  describe("Template Structure", () => {
    it("should have exactly 3 templates", () => {
      expect(packingTemplates).toHaveLength(3);
    });

    it("should have unique template IDs", () => {
      const ids = packingTemplates.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have all required template fields", () => {
      packingTemplates.forEach((template) => {
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("items");
        expect(typeof template.id).toBe("string");
        expect(typeof template.name).toBe("string");
        expect(typeof template.description).toBe("string");
        expect(Array.isArray(template.items)).toBe(true);
      });
    });
  });

  describe("Template Items", () => {
    it("should have valid item structure", () => {
      const validateItem = (item: TemplateItem) => {
        expect(item).toHaveProperty("title");
        expect(typeof item.title).toBe("string");
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.title.length).toBeLessThanOrEqual(200);

        if (item.children) {
          expect(Array.isArray(item.children)).toBe(true);
          item.children.forEach((child) => validateItem(child));
        }
      };

      packingTemplates.forEach((template) => {
        template.items.forEach((item) => validateItem(item));
      });
    });

    it("should have reasonable nesting depth (max 2 levels)", () => {
      const checkDepth = (item: TemplateItem, currentDepth: number): number => {
        if (!item.children || item.children.length === 0) {
          return currentDepth;
        }
        return Math.max(...item.children.map((child) => checkDepth(child, currentDepth + 1)));
      };

      packingTemplates.forEach((template) => {
        template.items.forEach((item) => {
          const depth = checkDepth(item, 0);
          expect(depth).toBeLessThanOrEqual(2);
        });
      });
    });

    it("mountain trip template should have expected categories", () => {
      const mountain = packingTemplates.find((t) => t.id === "mountain-trip");
      expect(mountain).toBeDefined();

      const categoryTitles = mountain!.items.map((item) => item.title);
      expect(categoryTitles).toContain("Plecak główny");
      expect(categoryTitles).toContain("Dokumenty");
      expect(categoryTitles).toContain("Elektronika");
    });

    it("beach vacation template should have expected categories", () => {
      const beach = packingTemplates.find((t) => t.id === "beach-vacation");
      expect(beach).toBeDefined();

      const categoryTitles = beach!.items.map((item) => item.title);
      expect(categoryTitles).toContain("Walizka główna");
      expect(categoryTitles).toContain("Elektronika");
    });

    it("business trip template should have expected categories", () => {
      const business = packingTemplates.find((t) => t.id === "business-trip");
      expect(business).toBeDefined();

      const categoryTitles = business!.items.map((item) => item.title);
      expect(categoryTitles).toContain("Torba podróżna");
      expect(categoryTitles).toContain("Dokumenty biznesowe");
      expect(categoryTitles).toContain("Dokumenty osobiste");
    });
  });

  describe("Template Content", () => {
    it("mountain trip should have at least 40 total items", () => {
      const mountain = packingTemplates.find((t) => t.id === "mountain-trip");
      const countItems = (items: TemplateItem[]): number => {
        return items.reduce((total, item) => {
          return total + 1 + (item.children ? countItems(item.children) : 0);
        }, 0);
      };

      const totalItems = countItems(mountain!.items);
      expect(totalItems).toBeGreaterThanOrEqual(40);
    });

    it("beach vacation should have at least 30 total items", () => {
      const beach = packingTemplates.find((t) => t.id === "beach-vacation");
      const countItems = (items: TemplateItem[]): number => {
        return items.reduce((total, item) => {
          return total + 1 + (item.children ? countItems(item.children) : 0);
        }, 0);
      };

      const totalItems = countItems(beach!.items);
      expect(totalItems).toBeGreaterThanOrEqual(30);
    });

    it("business trip should have at least 20 total items", () => {
      const business = packingTemplates.find((t) => t.id === "business-trip");
      const countItems = (items: TemplateItem[]): number => {
        return items.reduce((total, item) => {
          return total + 1 + (item.children ? countItems(item.children) : 0);
        }, 0);
      };

      const totalItems = countItems(business!.items);
      expect(totalItems).toBeGreaterThanOrEqual(20);
    });

    it("should not have empty children arrays", () => {
      const checkNoEmptyChildren = (item: TemplateItem) => {
        if (item.children) {
          expect(item.children.length).toBeGreaterThan(0);
          item.children.forEach((child) => checkNoEmptyChildren(child));
        }
      };

      packingTemplates.forEach((template) => {
        template.items.forEach((item) => checkNoEmptyChildren(item));
      });
    });
  });

  describe("Data Quality", () => {
    it("should not have duplicate item titles within same template", () => {
      const collectTitles = (items: TemplateItem[]): string[] => {
        return items.flatMap((item) => [
          item.title,
          ...(item.children ? collectTitles(item.children) : []),
        ]);
      };

      packingTemplates.forEach((template) => {
        const titles = collectTitles(template.items);
        const uniqueTitles = new Set(titles);

        // Allow some duplicates (e.g., "Powerbank") but not too many
        const duplicateCount = titles.length - uniqueTitles.size;
        expect(duplicateCount).toBeLessThan(5);
      });
    });

    it("should have reasonable category sizes (not too many items per category)", () => {
      packingTemplates.forEach((template) => {
        template.items.forEach((category) => {
          if (category.children) {
            expect(category.children.length).toBeLessThan(30);
          }
        });
      });
    });
  });
});
