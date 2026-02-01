import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateListButton } from "@/components/packing/CreateListButton";
import { TemplatesSection } from "@/components/packing/TemplatesSection";
import Link from "next/link";
import { Luggage, LogOut, ChevronRight, Package } from "lucide-react";
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
  const firstName = displayName.split(" ")[0];

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
        .eq("list_id", list.id)) as {
        data: { id: string; checked: boolean }[] | null;
        error: unknown;
      };

      const total = items?.length || 0;
      const checked = items?.filter((item) => item.checked).length || 0;
      const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

      return { ...list, total, checked, progress };
    })
  );

  return (
    <div className="min-h-screen gradient-page">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Luggage className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">Packing Helper</span>
          </Link>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Wyloguj</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Witaj, <span className="text-gradient">{firstName}</span>!
            </h1>
            <p className="text-muted-foreground text-lg">
              Zarządzaj swoimi listami pakowania w jednym miejscu.
            </p>
          </div>

          {/* Templates Section */}
          <TemplatesSection />

          {/* Lists Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold">Moje listy pakowania</h2>
            <CreateListButton />
          </div>

          {/* Lists Grid */}
          {listsWithStats.length === 0 ? (
            <Card className="p-12 text-center shadow-soft border-border/50 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Brak list pakowania</h3>
              <p className="text-muted-foreground mb-6">
                Utwórz pierwszą listę lub wybierz jeden z szablonów powyżej.
              </p>
              <CreateListButton />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 stagger-children">
              {listsWithStats.map((list) => (
                <Link key={list.id} href={`/lists/${list.id}`}>
                  <Card className="group p-6 shadow-soft border-border/50 card-hover card-interactive">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    {list.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {list.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${list.progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {list.checked} / {list.total} spakowanych
                        </span>
                        <span className="font-semibold text-primary">{list.progress}%</span>
                      </div>
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
