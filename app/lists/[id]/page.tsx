import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { deleteList } from "@/actions/packing";
import { getCollaborators } from "@/actions/collaboration";
import { Button } from "@/components/ui/button";
import { RealtimeListListener } from "@/components/packing/RealtimeListListener";
import { PackingModeProvider } from "@/components/packing/PackingModeContext";
import { PackingModeToggle } from "@/components/packing/PackingModeToggle";
import { ConditionalAddForm } from "@/components/packing/ConditionalAddForm";
import { PackingList } from "@/components/packing/PackingList";
import { AddItemForm } from "@/components/packing/AddItemForm";
import { ShareListDialog } from "@/components/collaboration/ShareListDialog";
import { CollaboratorAvatars } from "@/components/collaboration/CollaboratorAvatars";
import { PackingModeWrapper } from "@/components/packing/PackingModeWrapper";
import { EditListDialog } from "@/components/packing/EditListDialog";
import { ArrowLeft, Trash2, Luggage } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";
import { buildTreeFromFlatList } from "@/lib/utils";
import { generatePackingQueue } from "@/lib/packing-logic";

type PackingListRow = Database["public"]["Tables"]["packing_lists"]["Row"];
type PackingItem = Database["public"]["Tables"]["packing_items"]["Row"];

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
  const { data: items } = (await supabase.from("packing_items").select("*").eq("list_id", id)) as {
    data: PackingItem[] | null;
    error: unknown;
  };

  const total = items?.length || 0;
  const checked = items?.filter((item) => item.checked).length || 0;
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  // Generate packing queue for card mode
  const tree = items ? buildTreeFromFlatList(items) : [];
  const packingQueue = generatePackingQueue(tree);

  // Fetch collaborators
  const collaborators = await getCollaborators(id);

  return (
    <div className="min-h-screen gradient-page">
      <RealtimeListListener listId={id} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          {/* Top row - navigation and actions */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              {isOwner && (
                <EditListDialog
                  listId={id}
                  currentName={list.name}
                  currentDescription={list.description}
                />
              )}
              <ShareListDialog
                listId={id}
                collaborators={collaborators}
                isOwner={isOwner}
                currentUserId={user.id}
                isPublic={list.is_public}
              />
              {isOwner && (
                <form action={deleteList}>
                  <input type="hidden" name="listId" value={id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Usuń</span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* List info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Luggage className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold truncate">{list.name}</h1>
              </div>
              {list.description && (
                <p className="text-sm text-muted-foreground ml-13 line-clamp-2">{list.description}</p>
              )}
            </div>
            {collaborators.length > 0 && (
              <div className="flex-shrink-0">
                <CollaboratorAvatars collaborators={collaborators} />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{checked}</span> z {total} spakowane
              </span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="progress-bar h-2.5">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <PackingModeProvider isPackingMode={false}>
        <PackingModeToggle />

        <PackingModeWrapper listId={id} packingQueueData={JSON.stringify(packingQueue)}>
          <main className="container mx-auto pb-28">
            <div className="bg-card rounded-xl shadow-soft border border-border/50 mt-4 mx-4 overflow-hidden">
              <PackingList listId={id} />
            </div>
          </main>
        </PackingModeWrapper>

        {/* Fixed bottom add item form */}
        <ConditionalAddForm>
          <AddItemForm listId={id} />
        </ConditionalAddForm>
      </PackingModeProvider>
    </div>
  );
}
