"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, ListCollaboratorInsert } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ListCollaborator = Database["public"]["Tables"]["list_collaborators"]["Row"];

export interface CollaboratorWithProfile {
  user_id: string;
  role: string;
  profile: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Share a list with another user by email
 * Only the list owner can share the list
 */
export async function shareList(listId: string, email: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  // Check if current user is the list owner
  const { data: list, error: listError } = await supabase
    .from("packing_lists")
    .select("owner_id")
    .eq("id", listId)
    .single<{ owner_id: string }>();

  if (listError || !list) {
    return { success: false, error: "Lista nie została znaleziona" };
  }

  if (list.owner_id !== user.id) {
    return { success: false, error: "Tylko właściciel może udostępniać listę" };
  }

  // Find user by email in profiles table
  const { data: targetUser, error: userError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email.toLowerCase().trim())
    .single<{ id: string; email: string | null }>();

  if (userError || !targetUser) {
    return { success: false, error: "Użytkownik nie znaleziony" };
  }

  // Check if user is trying to share with themselves
  if (targetUser.id === user.id) {
    return { success: false, error: "Nie możesz udostępnić listy samemu sobie" };
  }

  // Check if user is already a collaborator
  const { data: existingCollaborator } = await supabase
    .from("list_collaborators")
    .select("user_id")
    .eq("list_id", listId)
    .eq("user_id", targetUser.id)
    .single();

  if (existingCollaborator) {
    return { success: false, error: "Ten użytkownik ma już dostęp do listy" };
  }

  // Add collaborator
  const insertData: ListCollaboratorInsert = {
    list_id: listId,
    user_id: targetUser.id,
    role: "editor",
  };

  const { error: insertError } = await supabase
    .from("list_collaborators")
    .insert(insertData as any);

  if (insertError) {
    console.error("Error adding collaborator:", insertError);
    return { success: false, error: "Nie udało się dodać współpracownika" };
  }

  revalidatePath(`/lists/${listId}`);
  return { success: true, error: null };
}

/**
 * Remove a collaborator from the list
 * Can be called by the list owner or by the collaborator themselves (to leave the list)
 */
export async function removeCollaborator(listId: string, userId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  // Check if current user is the list owner
  const { data: list, error: listError } = await supabase
    .from("packing_lists")
    .select("owner_id")
    .eq("id", listId)
    .single<{ owner_id: string }>();

  if (listError || !list) {
    return { success: false, error: "Lista nie została znaleziona" };
  }

  const isOwner = list.owner_id === user.id;
  const isSelf = userId === user.id;

  // Only owner can remove others, or user can remove themselves
  if (!isOwner && !isSelf) {
    return { success: false, error: "Nie masz uprawnień do usunięcia tego użytkownika" };
  }

  // Remove collaborator
  const { error: deleteError } = await supabase
    .from("list_collaborators")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Error removing collaborator:", deleteError);
    return { success: false, error: "Nie udało się usunąć współpracownika" };
  }

  revalidatePath(`/lists/${listId}`);
  return { success: true, error: null };
}

/**
 * Get all collaborators for a list with their profile information
 */
export async function getCollaborators(listId: string): Promise<CollaboratorWithProfile[]> {
  const supabase = await createClient();

  const { data: collaborators, error } = await supabase
    .from("list_collaborators")
    .select(
      `
      user_id,
      role,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      )
    `
    )
    .eq("list_id", listId);

  if (error) {
    console.error("Error fetching collaborators:", error);
    return [];
  }

  // Transform the data to match our interface
  return (collaborators || []).map((collab: any) => ({
    user_id: collab.user_id,
    role: collab.role,
    profile: {
      email: collab.profiles?.email || null,
      full_name: collab.profiles?.full_name || null,
      avatar_url: collab.profiles?.avatar_url || null,
    },
  }));
}
