// Versionsverlauf der App. Neueste Version immer OBEN eintragen.
// Wird in der App unter „Was ist neu“ angezeigt. Bitte auch CHANGELOG.md mitpflegen.
window.SL_UPDATES = [
  {
    v: "2.0", d: "2026-11-17", items: [
      "Neue Navigation unten: Start, Lernen, Prüfung, Fragen, Mehr",
      "Neue Startseite mit Lernserie 🔥 (Tage in Folge) und Tagesziel, einstellbar unter Mehr",
      "Töne bei richtigen und falschen Antworten, am Rundenende und beim Prüfungsergebnis (abschaltbar)",
      "Serien-Zähler beim Lernen: 🔥 zeigt, wie viele du in Folge richtig hast",
      "Fragen gleiten beim Weiterblättern herein, Ergebnis pro Sachgebiet als Balken",
      "Die Prüfung wird gespeichert: Schließt sich die App, kannst du genau dort weitermachen. Läuft die Zeit ab, wird automatisch ausgewertet",
      "„Eigene Fragen“ mit Suche und Filter nach Sachgebiet statt einer endlosen Liste",
      "Backup über „Teilen“, damit es auch auf dem iPhone klappt (z. B. „In Dateien sichern“)",
      "Neues App-Symbol und dunkle Statusleiste passend zum Design",
      "Behoben: Absturz bei ungültigen Lern-Adressen, falsche Zahl bei „Markierte Fragen“, laufende Prüfung wurde beim Wechsel der Seite überschrieben"
    ]
  },
  {
    v: "1.16", d: "2026-11-16", items: [
      "Man kann die App nicht mehr kleiner zoomen als den Bildschirm",
      "Sehr lange Wörter in importierten Fragen werden umbrochen, statt über den Rand zu ragen",
      "Kein versehentliches Zoomen mehr durch doppeltes Tippen"
    ]
  },
  {
    v: "1.15", d: "2026-11-16", items: [
      "Import erkennt jetzt auch Listen, in denen nur die richtigen Antworten als Aufzählung (•) stehen. Die App ergänzt dann falsche Antworten aus anderen Fragen desselben Sachgebiets",
      "„Lösungsvorschlag“ wird bei der Frage vermerkt, Zwischenüberschriften und Seitenzahlen werden ignoriert",
      "Doppelte Fragen werden jetzt auch erkannt, wenn sie sich nur in Satzzeichen oder Leerzeichen unterscheiden"
    ]
  },
  {
    v: "1.14", d: "2026-11-16", items: [
      "Neu: Schalter „Nur meine eigenen Fragen verwenden“ in den Einstellungen. Lernen, Fehler wiederholen und Prüfung nutzen dann nur deine importierten und selbst angelegten Fragen",
      "Der Schalter ist automatisch an, sobald du Fragen importiert hast. Die eingebauten Fragen und dein Lernstand dazu bleiben erhalten"
    ]
  },
  {
    v: "1.13", d: "2026-11-16", items: [
      "Die Prüfungssimulation nimmt jetzt auch deine eigenen und importierten Fragen mit dazu"
    ]
  },
  {
    v: "1.12", d: "2026-11-16", items: [
      "Fragen-Import liest jetzt auch PDF-Dateien: unter „Eigene Fragen“ auf „PDF- oder Textdatei wählen“ tippen",
      "Doppelte Fragen innerhalb einer Datei werden übersprungen, Seitenzahlen ignoriert"
    ]
  },
  {
    v: "1.11", d: "2026-11-16", items: [
      "Neu: Fragen importieren unter „Eigene Fragen“. Liste einfügen („1. Frage“, „A) Antwort“, richtige mit ✅), die App legt daraus eigene Fragen an",
      "Das Sachgebiet wird automatisch erkannt, doppelte Fragen werden übersprungen",
      "Importierte Fragen bleiben nur auf deinem Gerät und lassen sich mit einem Knopf wieder löschen"
    ]
  },
  {
    v: "1.10", d: "2026-11-11", items: [
      "100 neue Fragen, jetzt 451 insgesamt. Mehr Fragen u. a. zu besonders schwerem Diebstahl, Begünstigung, Putativnotwehr, Schikaneverbot, Waffentransport, Brandschutz, Schließanlagen, Funk und Kommunikation",
      "Prüfungssimulation wertet jetzt wie die IHK seit Juli 2025: Teilpunkte für jede richtig angekreuzte Antwort, bestanden ab 50 % der Punkte",
      "Korrigiert: Ein Lichtbild ist auf dem Dienstausweis nicht vorgeschrieben; den Ausweis zeigt man Behörden wie Polizei oder Ordnungsamt; nach einem Waffengebrauch wird immer auch die Polizei informiert"
    ]
  },
  {
    v: "1.9", d: "2026-11-10", items: [
      "Prozentanzeige verbessert: Fragen, die du 1× richtig hast, zählen jetzt halb. Die Zahl bewegt sich also schon nach der ersten richtigen Antwort",
      "Unter 10 % mit einer Nachkommastelle (z. B. 1,4 %), damit kleine Fortschritte sichtbar sind",
      "Das Absperrband zeigt bei 0 % nichts mehr an, „1× richtig“ erscheint als heller Teil"
    ]
  },
  {
    v: "1.8", d: "2026-11-10", items: [
      "Neues Design „Nachtschicht“: Nachtblau und Signalgelb wie Warnweste und Absperrband, neue Schrift",
      "Startseite: Lernstand als Absperrband, das sich füllt",
      "Animationen: richtige Antworten leuchten auf, falsche wackeln, Konfetti beim Bestehen der Prüfung",
      "KI-Chat neu: Antwort erscheint live Wort für Wort, Stopp-Knopf, Folgefragen wie „Noch einfacher“, Kopieren, „Neu“ für einen neuen Chat",
      "Chats bleiben erhalten, solange die App offen ist"
    ]
  },
  {
    v: "1.7", d: "2026-11-10", items: [
      "„KI testen“ macht bei Problemen eine genaue Fehlersuche: 9 verschiedene Anfragen an Google, jeweils mit Ergebnis",
      "Neuer Knopf „Testergebnis kopieren“, damit du das Ergebnis weitergeben kannst"
    ]
  },
  {
    v: "1.6", d: "2026-11-10", items: [
      "KI-Lernhelfer repariert: Auf dem iPhone kam „Load failed“. Die App probiert jetzt mehrere Verbindungswege zu Google und merkt sich den, der funktioniert",
      "„Speichern & testen“ schickt eine echte Testfrage an die KI",
      "Neuer Knopf „KI testen“ in den Einstellungen zeigt genau, was klappt und was nicht",
      "Fragen zu Notwehr oder Waffen werden von Google nicht mehr so schnell blockiert, und bei überlasteten Modellen wird automatisch ein anderes genommen"
    ]
  },
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
