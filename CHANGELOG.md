# Änderungsprotokoll – Security LernApp

Hier steht, auf welchem Stand die App ist und was sich mit jedem Update geändert hat.
Die gleiche Liste siehst du in der App unter **„Was ist neu?"** (ganz unten auf der Startseite).

**Live:** https://larsen140.github.io/Security-Lernapp/

## Aktueller Stand

- **Version:** 1.5 vom 10.11.2026
- **Fragen:** 351 in 9 Sachgebieten (selbst formuliert aus den Gesetzestexten, keine KATI-Inhalte)
- **Prüfungssimulation:** 82 Fragen, 120 Minuten, bestanden ab 50 %

| Sachgebiet | Fragen in der App | Fragen in der Prüfung |
| --- | ---: | ---: |
| Recht der öffentlichen Sicherheit und Ordnung | 41 | 6 |
| Gewerberecht | 35 | 5 |
| Datenschutzrecht | 33 | 5 |
| Bürgerliches Gesetzbuch | 41 | 10 |
| Straf- und Strafverfahrensrecht | 46 | 11 |
| Umgang mit Waffen | 32 | 5 |
| Unfallverhütungsvorschriften | 34 | 6 |
| Umgang mit Menschen | 46 | 18 |
| Grundzüge der Sicherheitstechnik | 43 | 16 |
| **Summe** | **351** | **82** |

## Offen / nächste Schritte

- [ ] KI-Hilfe mit einem echten Gemini-Schlüssel testen (bisher nur mit simulierten Antworten getestet)
- [ ] Fragen inhaltlich gegenprüfen, vor allem BewachV-Paragraphen, Versicherungssummen und Prüfungsaufteilung
- [ ] Mehr Fragen für „Umgang mit Menschen" und „Sicherheitstechnik" (die größten Prüfungsgebiete)

## Versionen

### 1.5 – 10.11.2026
- Updates kommen jetzt zuverlässig an: Die App fragt immer direkt beim Server nach statt alte Kopien aus dem Browser-Speicher zu nehmen (GitHub Pages erlaubt sonst bis zu 10 Minuten alte Dateien)
- „KI-Hilfe" ohne eigenen Schlüssel öffnet jetzt Google Gemini statt Claude und kopiert die Frage automatisch

### 1.4 – 10.11.2026
- Die App prüft alle 10 Sekunden selbst, ob es ein Update gibt
- Auf der Startseite wird ein Update sofort geladen, sonst erscheint oben ein Knopf „Jetzt aktualisieren"
- KI-Lernhelfer nimmt nur noch Gemini-Schlüssel, die mit „AQ." beginnen (Claude- und AIza-Schlüssel werden nicht mehr angenommen)

### 1.3 – 10.11.2026
- Neu: Seite „Was ist neu" in der App mit allen Updates
- Versionsnummer auf der Startseite, damit du siehst, ob das letzte Update angekommen ist
- Nach einem Update erscheint einmal ein Hinweis mit den Neuerungen
- Dieses Änderungsprotokoll angelegt

### 1.2 – 10.11.2026
- KI-Lernhelfer funktioniert mit einem Google-Gemini-Schlüssel (kostenlos), auch im neuen Format „AQ.…"
- Das passende Gemini-Modell wird automatisch gewählt

### 1.1 – 10.11.2026
- Neu: KI-Lernhelfer bei jeder Frage und auf der Startseite
- Anzeige, wie viele Antworten richtig sind (in den Einstellungen abschaltbar)

### 1.0 – 10.11.2026
- Erste Version: 9 Sachgebiete mit Lernkapiteln und 351 Übungsfragen
- Prüfungssimulation mit 82 Fragen in 120 Minuten
- Lernstand pro Frage, Fehler wiederholen, Fragen markieren, eigene Fragen, Backup
- Als App installierbar und offline nutzbar
