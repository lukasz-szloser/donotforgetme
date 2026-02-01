"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeListListenerProps {
  listId: string;
}

export function RealtimeListListener({ listId }: RealtimeListListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes in packing_items for this list
    const channel = supabase
      .channel(`list-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "packing_items",
          filter: `list_id=eq.${listId}`,
        },
        () => {
          // Refresh the page to show new data
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, router]);

  return null;
}
