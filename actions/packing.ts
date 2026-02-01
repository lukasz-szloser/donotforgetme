"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Database } from "@/types/database";
import { applySmartCheck } from "@/lib/packing-logic";
import { buildTreeFromFlatList } from "@/lib/utils";
import { packingTemplates, type TemplateItem } from "@/lib/templates";

type PackingList = Database["public"]["Tables"]["packing_lists"]["Row"];
type PackingListInsert = Database["public"]["Tables"]["packing_lists"]["Insert"];
type PackingListUpdate = Database["public"]["Tables"]["packing_lists"]["Update"];
type PackingItem = Database["public"]["Tables"]["packing_items"]["Row"];
type PackingItemInsert = Database["public"]["Tables"]["packing_items"]["Insert"];
type PackingItemUpdate = Database["public"]["Tables"]["packing_items"]["Update"];

// Validation schemas
const createListSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa listy jest wymagana")
    .max(100, "Nazwa może mieć maksimum 100 znaków"),
  description: z.string().max(500, "Opis może mieć maksimum 500 znaków").optional(),
});

const updateListSchema = z.object({
  listId: z.string().uuid("Nieprawidłowe ID listy"),
  name: z
    .string()
    .min(1, "Nazwa listy jest wymagana")
    .max(100, "Nazwa może mieć maksimum 100 znaków"),
  description: z.string().max(500, "Opis może mieć maksimum 500 znaków").optional(),
});

const addItemSchema = z.object({
  listId: z.string().uuid("Nieprawidłowe ID listy"),
  parentId: z.string().uuid("Nieprawidłowe ID rodzica").nullable(),
  title: z
    .string()
    .min(1, "Tytuł elementu jest wymagany")
    .max(200, "Tytuł może mieć maksimum 200 znaków"),
});

const toggleItemSchema = z.object({
  itemId: z.string().uuid("Nieprawidłowe ID elementu"),
  checked: z.boolean(),
});

const updateItemSchema = z.object({
  itemId: z.string().uuid("Nieprawidłowe ID elementu"),
  title: z
    .string()
    .min(1, "Tytuł elementu jest wymagany")
    .max(200, "Tytuł może mieć maksimum 200 znaków"),
});

const reorderItemsSchema = z.object({
  listId: z.string().uuid("Nieprawidłowe ID listy"),
  items: z.array(
    z.object({
      id: z.string().uuid("Nieprawidłowe ID elementu"),
      position: z.number().int().min(0, "Pozycja musi być nieujemna"),
    })
  ),
});

const deleteItemSchema = z.object({
  itemId: z.string().uuid("Nieprawidłowe ID elementu"),
});

const deleteListSchema = z.object({
  listId: z.string().uuid("Nieprawidłowe ID listy"),
});

export type ActionResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * Check if user has access to a list (owner or collaborator)
 */
async function hasListAccess(listId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("packing_lists")
    .select("owner_id, list_collaborators(user_id)")
    .eq("id", listId)
    .single()) as { data: PackingList | null; error: unknown };

  if (error || !data) return false;

  // User is owner
  if (data.owner_id === userId) return true;

  // User is collaborator
  const collaborators = Array.isArray(
    (data as unknown as { list_collaborators: unknown }).list_collaborators
  )
    ? (data as unknown as { list_collaborators: { user_id: string }[] }).list_collaborators
    : [];
  return collaborators.some((c) => c.user_id === userId);
}

/**
 * Create items recursively from template
 */
async function createItemsFromTemplate(
  supabase: any,
  listId: string,
  items: TemplateItem[],
  parentId: string | null = null,
  startPosition: number = 0
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const templateItem = items[i];
    const itemData: PackingItemInsert = {
      list_id: listId,
      parent_id: parentId,
      title: templateItem.title,
      position: startPosition + i,
    };

    const { data: newItem, error } = (await supabase
      .from("packing_items")
      .insert(itemData as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !newItem) {
      throw new Error("Nie udało się utworzyć elementu z szablonu");
    }

    // Recursively create children
    if (templateItem.children && templateItem.children.length > 0) {
      await createItemsFromTemplate(supabase, listId, templateItem.children, newItem.id, 0);
    }
  }
}

/**
 * Create a new packing list
 */
export async function createList(formData: FormData): Promise<ActionResponse<{ id: string }>> {
  try {
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    };

    const validatedData = createListSchema.parse(rawData);
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Create list
    const listData: PackingListInsert = {
      name: validatedData.name,
      description: validatedData.description,
      owner_id: user.id,
    };

    const { data, error } = (await supabase
      .from("packing_lists")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(listData as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !data) {
      console.error("Error creating list:", error);
      return { success: false, error: "Nie udało się utworzyć listy" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in createList:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Create a new packing list from template
 */
export async function createFromTemplate(
  templateId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const template = packingTemplates.find((t) => t.id === templateId);
    if (!template) {
      return { success: false, error: "Szablon nie został znaleziony" };
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Create list
    const listData: PackingListInsert = {
      name: template.name,
      description: template.description,
      owner_id: user.id,
    };

    const { data, error } = (await supabase
      .from("packing_lists")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(listData as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !data) {
      console.error("Error creating list from template:", error);
      return { success: false, error: "Nie udało się utworzyć listy" };
    }

    // Create items from template
    await createItemsFromTemplate(supabase, data.id, template.items);

    revalidatePath("/dashboard");
    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Error in createFromTemplate:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Update a packing list (only owner can update)
 */
export async function updateList(formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = {
      listId: formData.get("listId"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    };

    const validatedData = updateListSchema.parse(rawData);
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Check if user is owner
    const { data: list, error: fetchError } = (await supabase
      .from("packing_lists")
      .select("owner_id")
      .eq("id", validatedData.listId)
      .single()) as { data: Pick<PackingList, "owner_id"> | null; error: unknown };

    if (fetchError || !list) {
      return { success: false, error: "Lista nie istnieje" };
    }

    if (list.owner_id !== user.id) {
      return { success: false, error: "Tylko właściciel może edytować listę" };
    }

    // Update list
    const result = await supabase
      .from("packing_lists")
      // @ts-ignore - Supabase generated types issue: update parameter typed as 'never'
      .update({
        name: validatedData.name,
        description: validatedData.description,
      })
      .eq("id", validatedData.listId);

    const { error } = result as { error: unknown };

    if (error) {
      console.error("Error updating list:", error);
      return { success: false, error: "Nie udało się zaktualizować listy" };
    }

    revalidatePath(`/lists/${validatedData.listId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in updateList:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Delete a packing list (only owner can delete)
 */
export async function deleteList(formData: FormData): Promise<void> {
  try {
    const listId = formData.get("listId") as string;
    const validatedData = deleteListSchema.parse({ listId });
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Musisz być zalogowany");
    }

    // Check if user is owner
    const { data: list, error: fetchError } = (await supabase
      .from("packing_lists")
      .select("owner_id")
      .eq("id", validatedData.listId)
      .single()) as { data: Pick<PackingList, "owner_id"> | null; error: unknown };

    if (fetchError || !list) {
      throw new Error("Lista nie istnieje");
    }

    if (list.owner_id !== user.id) {
      throw new Error("Tylko właściciel może usunąć listę");
    }

    // Delete list (cascade will delete items and collaborators)
    const { error } = await supabase.from("packing_lists").delete().eq("id", validatedData.listId);

    if (error) {
      console.error("Error deleting list:", error);
      throw new Error("Nie udało się usunąć listy");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in deleteList:", error);
    throw error;
  }

  redirect("/dashboard");
}

/**
 * Add a new item to a packing list
 */
export async function addItem(formData: FormData): Promise<ActionResponse<{ id: string }>> {
  try {
    const rawData = {
      listId: formData.get("listId"),
      parentId: formData.get("parentId") || null,
      title: formData.get("title"),
    };

    const validatedData = addItemSchema.parse(rawData);
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Check access
    const hasAccess = await hasListAccess(validatedData.listId, user.id);
    if (!hasAccess) {
      return { success: false, error: "Brak dostępu do tej listy" };
    }

    // Get max position for proper ordering
    const { data: maxPosData } = (await supabase
      .from("packing_items")
      .select("position")
      .eq("list_id", validatedData.listId)
      .is("parent_id", validatedData.parentId as null)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: Pick<PackingItem, "position"> | null; error: unknown };

    const nextPosition = maxPosData ? maxPosData.position + 1 : 0;

    // Add item
    const itemData: PackingItemInsert = {
      list_id: validatedData.listId,
      parent_id: validatedData.parentId,
      title: validatedData.title,
      position: nextPosition,
    };

    const { data, error } = (await supabase
      .from("packing_items")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(itemData as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !data) {
      console.error("Error adding item:", error);
      return { success: false, error: "Nie udało się dodać elementu" };
    }

    revalidatePath(`/lists/${validatedData.listId}`);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in addItem:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Toggle item checked status with Smart Check logic
 * Applies Bubble Up and Bubble Down synchronization
 */
export async function toggleItemChecked(itemId: string, checked: boolean): Promise<ActionResponse> {
  try {
    const validatedData = toggleItemSchema.parse({ itemId, checked });
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Get item's list_id for access check
    const { data: item, error: fetchError } = (await supabase
      .from("packing_items")
      .select("list_id")
      .eq("id", validatedData.itemId)
      .single()) as { data: Pick<PackingItem, "list_id"> | null; error: unknown };

    if (fetchError || !item) {
      return { success: false, error: "Element nie istnieje" };
    }

    // Check access
    const hasAccess = await hasListAccess(item.list_id, user.id);
    if (!hasAccess) {
      return { success: false, error: "Brak dostępu" };
    }

    // Get all items from the list to apply Smart Check logic
    const { data: allItems, error: fetchAllError } = (await supabase
      .from("packing_items")
      .select("*")
      .eq("list_id", item.list_id)) as { data: PackingItem[] | null; error: unknown };

    if (fetchAllError || !allItems) {
      return { success: false, error: "Nie udało się pobrać elementów listy" };
    }

    // Build tree and apply Smart Check logic
    const tree = buildTreeFromFlatList(allItems);
    const updatedItems = applySmartCheck(tree, validatedData.itemId, validatedData.checked);

    // Batch update all affected items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates = updatedItems.map((updatedItem) => {
      const builder: any = supabase.from("packing_items");
      return builder.update({ checked: updatedItem.checked }).eq("id", updatedItem.id);
    });

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);

    if (hasError) {
      console.error("Error updating items:", results.find((r) => r.error)?.error);
      return { success: false, error: "Nie udało się zaktualizować wszystkich elementów" };
    }

    revalidatePath(`/lists/${item.list_id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in toggleItemChecked:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Update a packing item title
 */
export async function updateItem(formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = {
      itemId: formData.get("itemId"),
      title: formData.get("title"),
    };

    const validatedData = updateItemSchema.parse(rawData);
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Get item's list_id for access check
    const { data: item, error: fetchError } = (await supabase
      .from("packing_items")
      .select("list_id")
      .eq("id", validatedData.itemId)
      .single()) as { data: Pick<PackingItem, "list_id"> | null; error: unknown };

    if (fetchError || !item) {
      return { success: false, error: "Element nie istnieje" };
    }

    // Check access
    const hasAccess = await hasListAccess(item.list_id, user.id);
    if (!hasAccess) {
      return { success: false, error: "Brak dostępu" };
    }

    // Update item title
    const result = await supabase
      .from("packing_items")
      // @ts-ignore - Supabase generated types issue: update parameter typed as 'never'
      .update({ title: validatedData.title })
      .eq("id", validatedData.itemId);

    const { error } = result as { error: unknown };

    if (error) {
      console.error("Error updating item:", error);
      return { success: false, error: "Nie udało się zaktualizować elementu" };
    }

    revalidatePath(`/lists/${item.list_id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in updateItem:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Reorder items (drag & drop)
 */
export async function reorderItems(
  listId: string,
  items: { id: string; position: number }[]
): Promise<ActionResponse> {
  try {
    const validatedData = reorderItemsSchema.parse({ listId, items });
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Check access
    const hasAccess = await hasListAccess(validatedData.listId, user.id);
    if (!hasAccess) {
      return { success: false, error: "Brak dostępu" };
    }

    // Batch update positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates = validatedData.items.map((item) => {
      const builder: any = supabase.from("packing_items");
      return builder.update({ position: item.position } as any).eq("id", item.id);
    });

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);

    if (hasError) {
      console.error("Error reordering items:", results.find((r) => r.error)?.error);
      return { success: false, error: "Nie udało się zmienić kolejności" };
    }

    revalidatePath(`/lists/${validatedData.listId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in reorderItems:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}

/**
 * Delete a packing item
 */
export async function deleteItem(itemId: string): Promise<ActionResponse> {
  try {
    const validatedData = deleteItemSchema.parse({ itemId });
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Musisz być zalogowany" };
    }

    // Get item's list_id for access check
    const { data: item, error: fetchError } = (await supabase
      .from("packing_items")
      .select("list_id")
      .eq("id", validatedData.itemId)
      .single()) as { data: Pick<PackingItem, "list_id"> | null; error: unknown };

    if (fetchError || !item) {
      return { success: false, error: "Element nie istnieje" };
    }

    // Check access
    const hasAccess = await hasListAccess(item.list_id, user.id);
    if (!hasAccess) {
      return { success: false, error: "Brak dostępu" };
    }

    // Delete item (cascade will delete children)
    const { error } = (await supabase
      .from("packing_items")
      .delete()
      .eq("id", validatedData.itemId)) as { error: unknown };

    if (error) {
      console.error("Error deleting item:", error);
      return { success: false, error: "Nie udało się usunąć elementu" };
    }

    revalidatePath(`/lists/${item.list_id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Błąd walidacji" };
    }
    console.error("Error in deleteItem:", error);
    return { success: false, error: "Nieoczekiwany błąd" };
  }
}
