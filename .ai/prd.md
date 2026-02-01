# Dokument wymagań produktu (PRD) – Packing Helper

## 1. Przegląd produktu

Projekt "Packing Helper" to aplikacja typu mobile-first służąca do tworzenia i zarządzania wielopoziomowymi listami pakowania. Głównym celem jest redukcja stresu przed podróżą poprzez intuicyjny interfejs, wsparcie dla współdzielenia list w czasie rzeczywistym oraz dedykowany tryb "Pakowania" (Packing Session), ułatwiający fizyczny proces kompletowania bagażu.

## 2. Problem użytkownika

Tradycyjne metody pakowania (papierowe listy, notatki w telefonie) są płaskie i nie oddają struktury bagażu (np. podziału na konkretne walizki czy kosmetyczki). Pakowanie grupowe często prowadzi do chaosu komunikacyjnego (duplikaty rzeczy lub ich brak), a standardowe aplikacje to-do są niewygodne w obsłudze jedną ręką podczas pospiesznego pakowania.

## 3. Wymagania funkcjonalne

1. **Struktura i zarządzanie listami:**
   - Tworzenie zagnieżdżonych list (struktura drzewiasta: Walizka -> Ubrania -> Skarpetki).
   - Ograniczenie widoczności zagnieżdżenia w UI do 5 poziomów (dla czytelności), przy zachowaniu nieograniczonej głębokości w bazie danych.
   - Obsługa szablonów: wybór predefiniowanych list (np. "Wyjazd w góry") i klonowanie ich jako własne.

2. **Kolaboracja w czasie rzeczywistym (Realtime):**
   - Współdzielenie listy poprzez zaproszenie e-mail (dla zalogowanych użytkowników - dostęp prywatny).
   - Współdzielenie poprzez unikalny link (tryb dostępny dla osób posiadających link).
   - Wyświetlanie awatarów użytkowników (Presence) aktualnie przeglądających lub edytujących listę.
   - Synchronizacja zmian (dodanie, edycja, odhaczenie elementu) poniżej 1 sekundy u wszystkich uczestników.

3. **Interakcje i UX (Mobile-first):**
   - Obsługa gestów Swipe na liście: przesunięcie w prawo (oznacz jako spakowane), przesunięcie w lewo (edycja/usuń).
   - Mechanizm Drag & Drop do zmiany kolejności elementów i przenoszenia ich między kategoriami.
   - Nawigacja typu "drill-down" (wchodzenie w głąb kategorii) z wykorzystaniem breadcrumbs.

4. **Smart Check & Synchronizacja (Automatyzacja):** [NOWE]
   - **Bubble Down Logic:** Zmiana statusu elementu-rodzica na `checked` automatycznie zmienia status wszystkich jego dzieci (rekurencyjnie w dół) na `checked`. Analogicznie dla odznaczenia.
   - **Bubble Up Logic:** Jeśli wszystkie dzieci danego rodzica zostaną oznaczone jako `checked`, rodzic automatycznie zmienia status na `checked`. Jeśli choć jedno dziecko zostanie odznaczone, rodzic zmienia status na `unchecked`.

5. **Tryb Pakowania – Sesja z Kartami (Card Packing Mode):** [NOWE]
   - Specjalny widok skupienia zastępujący listę.
   - **Kolejkowanie:** Wyświetlana jest kolejka elementów będących "liśćmi" (bez dzieci) i o statusie niespakowanym.
   - **Interfejs Karty:** Wyświetlany jest tylko jeden element naraz (Tinder-style stack).
   - **Interakcje:**
     - Swipe Right / Przycisk "Gotowe": Oznacza jako `checked` (z uruchomieniem Smart Check), usuwa z kolejki.
     - Swipe Left / Przycisk "Pomiń": Przenosi element na koniec kolejki (Skip/Later).
   - **Completion:** Po opróżnieniu kolejki wyświetlany jest ekran podsumowania.

6. **System kont i bezpieczeństwo:**
   - Logowanie i rejestracja użytkowników (Supabase Auth).
   - Zarządzanie uprawnieniami do list (Właściciel / Edytor / Gość).

7. **Ograniczenia techniczne i wydajność:**
   - Wykorzystanie Next.js 16 i Server Actions do mutacji danych.
   - Optymalizacja pod kątem urządzeń mobilnych (Lighthouse mobile score >90).

## 4. Granice produktu

1. Poza zakresem MVP:
   - Tryb Offline (aplikacja wymaga połączenia z internetem).
   - Aplikacje natywne (iOS/Android) – tylko wersja PWA/Web.
   - Zaawansowane atrybuty przedmiotów (waga, zdjęcia, cena).
   - Integracja z kalendarzami czy systemami rezerwacji biletów.
   - Powiadomienia Push.
   - Historia zmian (activity log) dla użytkownika.

## 5. Historyjki użytkowników

ID: US-001
Tytuł: Utworzenie listy z szablonu
Opis: Jako nowy użytkownik chcę wybrać gotowy szablon (np. "Wyjazd w góry"), aby nie musieć wpisywać podstawowych rzeczy ręcznie i zaoszczędzić czas.
Kryteria akceptacji:

- W dashboardzie dostępna jest sekcja "Szablony".
- Po wybraniu szablonu tworzona jest nowa, niezależna kopia listy przypisana do konta użytkownika.
- Użytkownik może edytować skopiowaną listę bez wpływu na oryginalny szablon.

ID: US-002
Tytuł: Organizacja zagnieżdżona (Drzewo)
Opis: Jako użytkownik chcę stworzyć kategorię "Kosmetyczka" i dodać do niej "Pastę" i "Szczoteczkę", aby zachować logiczny porządek w mojej walizce.
Kryteria akceptacji:

- Możliwość dodania elementu jako "dziecko" innego elementu.
- Widok listy poprawnie renderuje wcięcia (indentation) dla pod-elementów.
- Przy zagłębieniu powyżej 2 poziomu interfejs pozwala na "wejście" w kategorię (widok szczegółowy).

ID: US-003
Tytuł: Zaproszenie do współtworzenia
Opis: Jako organizator wyjazdu chcę wysłać link do listy mojej partnerce, aby mogła zaznaczyć, co już spakowała.
Kryteria akceptacji:

- Generowanie unikalnego linku do listy w ustawieniach udostępniania.
- Osoba wchodząca z linku ma uprawnienia do edycji statusu (spakowane/niespakowane).
- Zmiany są widoczne natychmiast (Realtime).

ID: US-004
Tytuł: Tryb Pakowania (Packing Mode) - Sesja Kart
Opis: Jako użytkownik będący w trakcie pakowania, chcę widzieć tylko jeden przedmiot na raz, aby nie czuć się przytłoczonym i skupić na zadaniu.
Kryteria akceptacji:

- Przycisk "Rozpocznij pakowanie" przełącza widok na pojedyncze karty.
- Wyświetlane są tylko przedmioty fizyczne (bez kategorii nadrzędnych).
- Gest w prawo odhacza przedmiot i pokazuje następny.
- Gest w lewo przenosi przedmiot na koniec kolejki ("Spakuję później").

ID: US-005
Tytuł: Zarządzanie elementami gestami (Swipe na liście)
Opis: Jako użytkownik w widoku listy chcę szybko zarządzać elementami kciukiem.
Kryteria akceptacji:

- Przesunięcie elementu w prawo zmienia jego status (zrobione/niezrobione).
- Przesunięcie elementu w lewo odsłania opcje "Edytuj" i "Usuń".

ID: US-006
Tytuł: Zmiana kolejności (Drag & Drop)
Opis: Jako użytkownik chcę przesunąć "Skarpetki" wyżej na liście.
Kryteria akceptacji:

- Przytrzymanie elementu pozwala na jego przeciągnięcie w górę lub w dół.
- Nowa kolejność jest zapisywana w bazie danych.

ID: US-007
Tytuł: Smart Check (Synchronizacja rodzic-dziecko) [NOWE]
Opis: Jako użytkownik oczekuję, że gdy spakuję całą zawartość kosmetyczki, sama kosmetyczka również oznaczy się jako spakowana.
Kryteria akceptacji:

- Zaznaczenie rodzica zaznacza wszystkie dzieci.
- Zaznaczenie wszystkich dzieci zaznacza rodzica.
- Odznaczenie jednego dziecka odznacza rodzica.

## 6. Metryki sukcesu

1. Stabilność i szybkość synchronizacji:
   - Zmiany stanu (checkbox) pojawiają się u innych użytkowników w czasie poniżej 1 sekundy w 95% przypadków.
2. Użyteczność Trybu Pakowania:
   - Brak przypadkowych usunięć elementów podczas korzystania z "Trybu Pakowania".
3. Adopcja Szablonów:
   - 50% nowo tworzonych list powstaje na bazie dostępnych szablonów.

## 7. Wymagania Testowe [NOWE]

Aby zapewnić stabilność krytycznych funkcji, wymagane są testy automatyczne włączone w proces CI/CD:

1. **Unit Tests (Vitest):**
   - Pokrycie logiki `Smart Check` (scenariusze: głębokie zagnieżdżenie, częściowe zaznaczenie, odznaczenie rodzica).
   - Pokrycie algorytmu generowania kolejki kart (filtrowanie liści, sortowanie, pomijanie spakowanych).
   - Testy funkcji pomocniczych (`buildTreeFromFlatList`).

2. **E2E Tests (Playwright):**
   - Scenariusz pełnej sesji pakowania: Wejście w tryb pakowania -> Przesunięcie karty -> Weryfikacja zmiany stanu w bazie/liście -> Ekran końcowy.
   - Weryfikacja podstawowego flow logowania i dostępu do dashboardu.
