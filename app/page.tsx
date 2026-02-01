import Link from "next/link";
import { Luggage, Users, Smartphone, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen gradient-page">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Luggage className="w-4 h-4" />
              Inteligentne pakowanie
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Pakuj </span>
              <span className="text-gradient">bez stresu</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Twórz wielopoziomowe listy pakowania, współdziel je z bliskimi i pakuj rzeczy
              pojedynczo - bez chaosu i zapominania.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl btn-primary touch-target"
              >
                Zacznij za darmo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all touch-target"
              >
                Dowiedz się więcej
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3 mt-20 stagger-children">
            <div className="group p-8 rounded-2xl bg-card shadow-soft card-hover border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Luggage className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zagnieżdżone listy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organizuj rzeczy w kategorie: walizka, kosmetyczka, plecak. Do 5 poziomów
                zagnieżdżenia.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card shadow-soft card-hover border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wspólne pakowanie</h3>
              <p className="text-muted-foreground leading-relaxed">
                Udostępnij listę rodzinie lub znajomym. Zmiany widoczne w czasie rzeczywistym.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card shadow-soft card-hover border border-border/50">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tryb pakowania</h3>
              <p className="text-muted-foreground leading-relaxed">
                Jedna rzecz na raz. Przesuń palcem, aby oznaczyć jako spakowane. Proste i szybkie.
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-20 p-8 md:p-12 rounded-2xl bg-card shadow-soft border border-border/50">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Co oferuje Packing Helper?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Smart Check - automatyczne zaznaczanie kategorii",
                "Szablony list pakowania (góry, plaża, biznes)",
                "Gesty swipe - szybkie zarządzanie przedmiotami",
                "Drag & Drop - zmiana kolejności elementów",
                "Udostępnianie przez link lub email",
                "Tryb ciemny dla oczu",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Gotowy na bezstresowe pakowanie?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dołącz do tysięcy osób, które odkryły spokój podczas przygotowań do podróży.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl btn-primary touch-target"
            >
              Utwórz darmowe konto
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Zbudowane z Next.js 15, TypeScript, Tailwind CSS i Supabase
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
