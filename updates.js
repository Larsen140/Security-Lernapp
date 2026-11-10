// Versionsverlauf der App. Neueste Version immer OBEN eintragen.
// Wird in der App unter „Was ist neu“ angezeigt. Bitte auch CHANGELOG.md mitpflegen.
window.SL_UPDATES = [
  {
    v: "1.5", d: "2026-11-10", items: [
      "Updates kommen jetzt zuverlässig an: Die App fragt immer direkt beim Server nach statt alte Kopien aus dem Browser-Speicher zu nehmen",
      "„KI-Hilfe“ ohne eigenen Schlüssel öffnet jetzt Google Gemini statt Claude und kopiert die Frage automatisch"
    ]
  },
  {
    v: "1.4", d: "2026-11-10", items: [
      "Die App prüft alle 10 Sekunden selbst, ob es ein Update gibt",
      "Auf der Startseite wird ein Update sofort geladen, sonst erscheint oben ein Knopf „Jetzt aktualisieren“",
      "KI-Lernhelfer nimmt nur noch Gemini-Schlüssel, die mit „AQ.“ beginnen (Claude- und AIza-Schlüssel werden nicht mehr angenommen)"
    ]
  },
  {
    v: "1.3", d: "2026-11-10", items: [
      "Neu: Seite „Was ist neu“ mit allen Updates",
      "Versionsnummer auf der Startseite, damit du siehst, ob das letzte Update angekommen ist",
      "Nach einem Update erscheint einmal ein Hinweis mit den Neuerungen"
    ]
  },
  {
    v: "1.2", d: "2026-11-10", items: [
      "KI-Lernhelfer funktioniert mit einem Google-Gemini-Schlüssel (kostenlos), auch im neuen Format „AQ.…“",
      "Das passende Gemini-Modell wird automatisch gewählt"
    ]
  },
  {
    v: "1.1", d: "2026-11-10", items: [
      "Neu: KI-Lernhelfer bei jeder Frage und auf der Startseite",
      "Anzeige, wie viele Antworten richtig sind (in den Einstellungen abschaltbar)"
    ]
  },
  {
    v: "1.0", d: "2026-11-10", items: [
      "Erste Version: 9 Sachgebiete mit Lernkapiteln und 351 Übungsfragen",
      "Prüfungssimulation mit 82 Fragen in 120 Minuten",
      "Lernstand pro Frage, Fehler wiederholen, Fragen markieren, eigene Fragen, Backup",
      "Als App installierbar und offline nutzbar"
    ]
  }
];
