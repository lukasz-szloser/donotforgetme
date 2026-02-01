import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateListButton } from "@/components/packing/CreateListButton";
import Link from "next/link";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PackingList = Database["public"]["Tables"]["packing_lists"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // This should never happen due to middleware, but just in case
  if (authError || !user) {
    redirect("/login");
  }

  // Try to get user profile from profiles table
  const { data: profile } = (await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()) as { data: Profile | null; error: unknown };

  // Fallback to email from auth if profile doesn't exist
  const displayName = profile?.full_name || profile?.email || user.email || "Użytkowniku";

  // Fetch user's packing lists
  const { data: lists } = (await supabase
    .from("packing_lists")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })) as { data: PackingList[] | null; error: unknown };

  // For each list, count total items and checked items
  const listsWithStats = await Promise.all(
    (lists || []).map(async (list) => {
      const { data: items } = (await supabase
        .from("packing_items")
        .select("id, checked")
        .eq("list_id", list.id)) as { data: { id: string; checked: boolean }[] | null; error: unknown };

      const total = items?.length || 0;
      const checked = items?.filter((item) => item.checked).length || 0;
      const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

      return { ...list, total, checked, progress };
    })
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Packing Helper</h1>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Wyloguj
            </Button>
          </form>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Witaj, {displayName}!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Zarządzaj swoimi listami pakowania w jednym miejscu.
            </p>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Moje listy pakowania
            </h3>
            <CreateListButton />
          </div>

          {listsWithStats.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-lg shadow text-center">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                Nie masz jeszcze żadnych list pakowania
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Kliknij &quot;Nowa lista&quot;, aby utworzyć pierwszą listę
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {listsWithStats.map((list) => (
                <Link key={list.id} href={`/lists/${list.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {list.name}
                    </h3>
                    {list.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {list.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-500">
                        {list.total} pozycji • {list.checked} spakowanych
                      </span>
                      <span className="text-blue-600 font-medium">{list.progress}% gotowe</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
