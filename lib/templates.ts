/**
 * Predefined packing list templates
 */

export interface TemplateItem {
  title: string;
  children?: TemplateItem[];
}

export interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: TemplateItem[];
}

export const packingTemplates: PackingTemplate[] = [
  {
    id: "mountain-trip",
    name: "Wyjazd w góry",
    description: "Kompletna lista na trekking i wędrówki górskie",
    icon: "⛰️",
    items: [
      {
        title: "Plecak główny",
        children: [
          {
            title: "Ubrania",
            children: [
              { title: "Kurtka przeciwdeszczowa" },
              { title: "Polar lub bluza" },
              { title: "Koszulki techniczne (3 szt.)" },
              { title: "Spodnie trekkingowe" },
              { title: "Spodnie krótkie" },
              { title: "Skarpety trekkingowe (3 pary)" },
              { title: "Bielizna termoaktywna" },
              { title: "Czapka i rękawiczki" },
            ],
          },
          {
            title: "Obuwie",
            children: [{ title: "Buty trekkingowe" }, { title: "Sandały lub klapki" }],
          },
          {
            title: "Wyposażenie",
            children: [
              { title: "Śpiwór" },
              { title: "Karimatka" },
              { title: "Latarka czołowa" },
              { title: "Power bank" },
              { title: "Butelka na wodę" },
              { title: "Kijki trekkingowe" },
            ],
          },
          {
            title: "Kosmetyczka",
            children: [
              { title: "Pasta i szczoteczka do zębów" },
              { title: "Mydło" },
              { title: "Ręcznik szybkoschnący" },
              { title: "Krem z filtrem SPF" },
              { title: "Balsam po opalaniu" },
              { title: "Papier toaletowy" },
            ],
          },
          {
            title: "Apteczka",
            children: [
              { title: "Plastry" },
              { title: "Bandaż elastyczny" },
              { title: "Środek przeciwbólowy" },
              { title: "Lek na zgagę" },
              { title: "Repelent" },
            ],
          },
        ],
      },
      {
        title: "Dokumenty",
        children: [
          { title: "Dowód osobisty" },
          { title: "Karta EKUZ" },
          { title: "Polisa ubezpieczenia" },
          { title: "Rezerwacja noclegu" },
        ],
      },
      {
        title: "Elektronika",
        children: [
          { title: "Telefon" },
          { title: "Ładowarka" },
          { title: "Aparat lub kamera" },
          { title: "Słuchawki" },
        ],
      },
    ],
  },
  {
    id: "beach-vacation",
    name: "Wakacje nad morzem",
    description: "Essentials na plażowy relaks i zwiedzanie",
    icon: "🏖️",
    items: [
      {
        title: "Walizka główna",
        children: [
          {
            title: "Ubrania",
            children: [
              { title: "Kostiumy kąpielowe (2 szt.)" },
              { title: "Szorty (3 pary)" },
              { title: "Koszulki i bluzki (5 szt.)" },
              { title: "Sukienka lub długie spodnie (wyjście)" },
              { title: "Bielizna (7 kompletów)" },
              { title: "Skarpety (3 pary)" },
              { title: "Piżama" },
            ],
          },
          {
            title: "Obuwie",
            children: [
              { title: "Japonki lub sandały plażowe" },
              { title: "Buty sportowe" },
              { title: "Elegantniejsze obuwie (opcjonalnie)" },
            ],
          },
          {
            title: "Akcesoria plażowe",
            children: [
              { title: "Ręcznik plażowy (2 szt.)" },
              { title: "Okulary przeciwsłoneczne" },
              { title: "Kapelusz lub czapka z daszkiem" },
              { title: "Torba plażowa" },
              { title: "Mata plażowa" },
            ],
          },
          {
            title: "Kosmetyczka",
            children: [
              { title: "Pasta i szczoteczka do zębów" },
              { title: "Szampon i żel pod prysznic" },
              { title: "Dezodorant" },
              { title: "Krem z wysokim SPF (50+)" },
              { title: "Balsam po opalaniu" },
              { title: "Szczotka do włosów" },
            ],
          },
        ],
      },
      {
        title: "Dokumenty i pieniądze",
        children: [
          { title: "Paszport lub dowód" },
          { title: "Bilety lotnicze/autobusowe" },
          { title: "Rezerwacja hotelu" },
          { title: "Karta kredytowa" },
          { title: "Gotówka (EUR/USD)" },
        ],
      },
      {
        title: "Elektronika",
        children: [
          { title: "Telefon i ładowarka" },
          { title: "Power bank" },
          { title: "Czytnik e-booków" },
          { title: "Aparat" },
        ],
      },
    ],
  },
  {
    id: "business-trip",
    name: "Podróż służbowa",
    description: "Niezbędnik na krótki wyjazd biznesowy",
    icon: "💼",
    items: [
      {
        title: "Torba podróżna",
        children: [
          {
            title: "Garderoba formalna",
            children: [
              { title: "Marynarka lub żakiet" },
              { title: "Spodnie lub spódnica (2 szt.)" },
              { title: "Koszule (3 szt.)" },
              { title: "Krawat lub szal" },
              { title: "Skarpety (3 pary)" },
              { title: "Bielizna (3 komplety)" },
              { title: "Buty eleganckie" },
            ],
          },
          {
            title: "Casual na wieczór",
            children: [
              { title: "Dżinsy" },
              { title: "Koszulka lub bluzka" },
              { title: "Obuwie sportowe" },
            ],
          },
          {
            title: "Kosmetyczka",
            children: [
              { title: "Pasta i szczoteczka" },
              { title: "Dezodorant" },
              { title: "Żel do golenia / maszynka" },
              { title: "Szczotka / grzebień" },
              { title: "Perfumy" },
            ],
          },
        ],
      },
      {
        title: "Dokumenty biznesowe",
        children: [
          { title: "Laptop" },
          { title: "Ładowarka do laptopa" },
          { title: "Dokumenty konferencji/spotkania" },
          { title: "Wizytówki" },
          { title: "Notes i długopis" },
        ],
      },
      {
        title: "Dokumenty osobiste",
        children: [
          { title: "Dowód lub paszport" },
          { title: "Bilety" },
          { title: "Karta płatnicza firmowa" },
        ],
      },
    ],
  },
];
