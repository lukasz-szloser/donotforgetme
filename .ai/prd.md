# Dokument wymagań produktu (PRD) – Packing Helper

## 1. Przegląd produktu

Projekt "Packing Helper" to aplikacja typu mobile-first służąca do tworzenia i zarządzania wielopoziomowymi listami pakowania. Głównym celem jest redukcja stresu przed podróżą poprzez intuicyjny interfejs, wsparcie dla współdzielenia list w czasie rzeczywistym oraz dedykowany tryb "Pakowania", ułatwiający fizyczny proces kompletowania bagażu.

## 2. Problem użytkownika

Tradycyjne metody pakowania (papierowe listy, notatki w telefonie) są płaskie i nie oddają struktury bagażu (np. podziału na konkretne walizki czy kosmetyczki). Pakowanie grupowe często prowadzi do chaosu komunikacyjnego (duplikaty rzeczy lub ich brak), a standardowe aplikacje to-do są niewygodne w obsłudze jedną ręką podczas pospiesznego pakowania.

## 3. Wymagania funkcjonalne

1. Struktura i zarządzanie listami:
   - Tworzenie zagnieżdżonych list (struktura drzewiasta: Walizka -> Ubrania -> Skarpetki).
   - Ograniczenie widoczności zagnieżdżenia w UI do 5 poziomów (dla czytelności), przy zachowaniu nieograniczonej głębokości w bazie danych.
   - Obsługa szablonów: wybór predefiniowanych list (np. "Wyjazd w góry") i klonowanie ich jako własne.

2. Kolaboracja w czasie rzeczywistym (Realtime):
   - Współdzielenie listy poprzez zaproszenie e-mail (dla zalogowanych użytkowników - dostęp prywatny).
   - Współdzielenie poprzez unikalny link (tryb dostępny dla osób posiadających link).
   - Wyświetlanie awatarów użytkowników (Presence) aktualnie przeglądających lub edytujących listę.
   - Synchronizacja zmian (dodanie, edycja, odhaczenie elementu) poniżej 1 sekundy u wszystkich uczestników.

3. Interakcje i UX (Mobile-first):
   - Obsługa gestów Swipe: przesunięcie w prawo (oznacz jako spakowane), przesunięcie w lewo (edycja/usuń).
   - Mechanizm Drag & Drop do zmiany kolejności elementów i przenoszenia ich między kategoriami.
   - Nawigacja typu "drill-down" (wchodzenie w głąb kategorii) z wykorzystaniem breadcrumbs (okruszków chleba).

4. Tryb Pakowania (Packing Mode):
   - Specjalny widok "tylko do odczytu/odhaczania".
   - Ukrycie opcji edycji, usuwania i dodawania nowych elementów, aby zapobiec przypadkowym kliknięciom.
   - Powiększone elementy interfejsu (checkboxy/teksty) dla łatwiejszej obsługi.
   - Wizualny pasek postępu (Progress Bar) pokazujący stan spakowania listy.

5. System kont i bezpieczeństwo:
   - Logowanie i rejestracja użytkowników (Supabase Auth).
   - Zarządzanie uprawnieniami do list (Właściciel / Edytor / Gość).

6. Ograniczenia techniczne i wydajność:
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
- Przy zagłębieniu powyżej 2 poziomu interfejs pozwala na "wejście" w kategorię (widok szczegółowy), aby zachować czytelność na małym ekranie.

ID: US-003
Tytuł: Zaproszenie do współtworzenia
Opis: Jako organizator wyjazdu chcę wysłać link do listy mojej partnerce, aby mogła zaznaczyć, co już spakowała.
Kryteria akceptacji:

- Generowanie unikalnego linku do listy w ustawieniach udostępniania.
- Osoba wchodząca z linku ma uprawnienia do edycji statusu (spakowane/niespakowane).
- Gdy partnerka odhaczy element, zmiana jest natychmiast widoczna na moim ekranie bez konieczności odświeżania strony.

ID: US-004
Tytuł: Tryb Pakowania (Packing Mode)
Opis: Jako użytkownik będący w trakcie pakowania, chcę włączyć tryb uproszczony, aby wygodnie odhaczać rzeczy jedną ręką i widzieć ile mi jeszcze zostało.
Kryteria akceptacji:

- Przycisk "Rozpocznij pakowanie" przełącza widok aplikacji.
- W trybie tym zablokowane są gesty usuwania i edycji tekstu.
- Checkboxy są powiększone.
- Na górze ekranu widoczny jest pasek postępu (np. "15/40 spakowane").

ID: US-005
Tytuł: Zarządzanie elementami gestami (Swipe)
Opis: Jako użytkownik chcę szybko zarządzać listą używając gestów kciuka, aby obsługa była płynna jak w natywnej aplikacji.
Kryteria akceptacji:

- Przesunięcie elementu w prawo zmienia jego status (zrobione/niezrobione).
- Przesunięcie elementu w lewo odsłania opcje "Edytuj" i "Usuń".
- Animacje są płynne i dają informację zwrotną (np. zmiana koloru tła przy przesuwaniu).

ID: US-006
Tytuł: Zmiana kolejności (Drag & Drop)
Opis: Jako użytkownik chcę przesunąć "Skarpetki" wyżej na liście, ponieważ są dla mnie priorytetowe.
Kryteria akceptacji:

- Przytrzymanie elementu pozwala na jego przeciągnięcie w górę lub w dół.
- Nowa kolejność jest zapisywana w bazie danych i synchronizowana z innymi użytkownikami.

## 6. Metryki sukcesu

1. Stabilność i szybkość synchronizacji:
   - Zmiany stanu (checkbox) pojawiają się u innych użytkowników w czasie poniżej 1 sekundy w 95% przypadków.
2. Użyteczność Trybu Pakowania:
   - Brak przypadkowych usunięć elementów podczas korzystania z "Trybu Pakowania" (weryfikowane brakiem zgłoszeń/cofnięć akcji w tym trybie).
3. Adopcja Szablonów:
   - 50% nowo tworzonych list powstaje na bazie dostępnych szablonów.
