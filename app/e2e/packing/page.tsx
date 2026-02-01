"use client";

import { PackingSessionTest } from "@/components/packing/PackingSessionTest";
import type { Database } from "@/types/database";

type PackingItemRow = Database["public"]["Tables"]["packing_items"]["Row"];

// Mock data for E2E tests - matches test expectations
const mockItems: PackingItemRow[] = [
  {
    id: "item-1",
    title: "Pasta do zębów",
    checked: false,
    parent_id: null,
    position: 0,
    list_id: "test-list",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "item-2",
    title: "Szczoteczka",
    checked: false,
    parent_id: null,
    position: 1,
    list_id: "test-list",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "item-3",
    title: "Ręcznik",
    checked: true, // Already packed
    parent_id: null,
    position: 2,
    list_id: "test-list",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

/**
 * E2E Test Route - Packing Session
 *
 * This route is used for E2E testing only. It renders the PackingSession
 * component with hardcoded mock data, avoiding database dependencies.
 *
 * Available only in development (protected by middleware for /e2e/* routes)
 */
export default function E2EPackingTestPage() {
  // Filter to only unpacked items (queue logic)
  const unpackedItems = mockItems.filter((item) => !item.checked);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">This page is only available in development.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <h1 className="text-lg font-semibold">E2E Test Route - Packing Session</h1>
        <p className="text-sm text-muted-foreground">
          This page is for automated testing. Mock data: {unpackedItems.length} unpacked items.
        </p>
      </div>

      <PackingSessionTest
        queue={unpackedItems}
        onComplete={() => console.log("Packing complete!")}
      />
    </div>
  );
}
