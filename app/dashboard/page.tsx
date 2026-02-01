import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
            <Button className="bg-blue-600 hover:bg-blue-700">+ Nowa lista</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Sample packing list cards - to be replaced with real data */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Wakacje letnie 2024
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Niezbędne rzeczy na plażę
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-500">
                  12 pozycji • 8 spakowanych
                </span>
                <span className="text-blue-600 font-medium">67% gotowe</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Wyjazd służbowy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Konferencja w Warszawie
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-500">8 pozycji • 2 spakowane</span>
                <span className="text-blue-600 font-medium">25% gotowe</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
