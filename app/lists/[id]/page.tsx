import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { deleteList } from "@/actions/packing";
import { Button } from "@/components/ui/button";
import { RealtimeListListener } from "@/components/packing/RealtimeListListener";
import { PackingModeProvider } from "@/components/packing/PackingModeContext";
import { PackingModeToggle } from "@/components/packing/PackingModeToggle";
import { ConditionalAddForm } from "@/components/packing/ConditionalAddForm";
import { PackingList } from "@/components/packing/PackingList";
import { AddItemForm } from "@/components/packing/AddItemForm";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type PackingListRow = Database["public"]["Tables"]["packing_lists"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch the list
  const { data: list, error: listError } = (await supabase
    .from("packing_lists")
    .select("*")
    .eq("id", id)
    .single()) as { data: PackingListRow | null; error: unknown };

  if (listError || !list) {
    notFound();
  }

  // Check if user has access (owner or collaborator)
  const isOwner = list.owner_id === user.id;
  let isCollaborator = false;

  if (!isOwner) {
    const { data: collaborator } = await supabase
      .from("list_collaborators")
      .select("id")
      .eq("list_id", id)
      .eq("user_id", user.id)
      .single();

    isCollaborator = !!collaborator;
  }

  if (!isOwner && !isCollaborator) {
    redirect("/dashboard");
  }

  // Calculate progress
  const { data: items } = (await supabase
    .from("packing_items")
    .select("id, checked")
    .eq("list_id", id)) as { data: { id: string; checked: boolean }[] | null; error: unknown };

  const total = items?.length || 0;
  const checked = items?.filter((item) => item.checked).length || 0;
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <RealtimeListListener listId={id} />

      <header className="bg-white dark:bg-slate-800 shadow sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Powrót
              </Button>
            </Link>
            {isOwner && (
              <form action={deleteList}>
                <input type="hidden" name="listId" value={id} />
                <Button type="submit" variant="ghost" size="sm" className="gap-2 text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Usuń listę
                </Button>
              </form>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{list.name}</h1>
          {list.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{list.description}</p>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">
                {checked} z {total} spakowane
              </span>
              <span className="font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <PackingModeProvider isPackingMode={false}>
        <PackingModeToggle />

        <main className="container mx-auto px-0 pb-24">
          <PackingList listId={id} />
        </main>

        {/* Fixed bottom add item form */}
        <ConditionalAddForm>
          <AddItemForm listId={id} />
        </ConditionalAddForm>
      </PackingModeProvider>
    </div>
  );
}
