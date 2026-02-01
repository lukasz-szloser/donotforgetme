import { createClient } from "@/lib/supabase/server";
import { buildTreeFromFlatList } from "@/lib/utils";
import { SortablePackingList } from "./SortablePackingList";
import type { Database } from "@/types/database";

type PackingItemRow = Database["public"]["Tables"]["packing_items"]["Row"];

interface PackingListProps {
  listId: string;
}

export async function PackingList({ listId }: PackingListProps) {
  const supabase = await createClient();

  // Fetch all items for this list
  const { data: items, error } = await supabase
    .from("packing_items")
    .select("*")
    .eq("list_id", listId)
    .order("position", { ascending: true });

  if (error || !items) {
    return <div className="p-4 text-center text-slate-500">Nie udało się załadować elementów</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-lg">Lista jest pusta</p>
        <p className="text-sm mt-2">Dodaj pierwszy element poniżej</p>
      </div>
    );
  }

  // Build tree structure
  const tree = buildTreeFromFlatList(items as PackingItemRow[]);

  return <SortablePackingList items={tree} listId={listId} />;
}
