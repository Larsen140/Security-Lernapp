# Änderungsprotokoll – Security LernApp

Hier steht, auf welchem Stand die App ist und was sich mit jedem Update geändert hat.
Die gleiche Liste siehst du in der App unter **„Was ist neu?"** (ganz unten auf der Startseite).

**Live:** https://larsen140.github.io/Security-Lernapp/

## Aktueller Stand

- **Version:** 1.10 vom 11.11.2026
- **Fragen:** 451 in 9 Sachgebieten (selbst formuliert aus den Gesetzestexten, keine KATI-Inhalte)
- **Prüfungssimulation:** 82 Fragen, 120 Minuten, Teilpunkte wie bei der IHK seit 1. Juli 2025, bestanden ab 50 % der Punkte

| Sachgebiet | Fragen in der App | Fragen in der Prüfung |
| --- | ---: | ---: |
| Recht der öffentlichen Sicherheit und Ordnung | 49 | 6 |
| Gewerberecht | 45 | 5 |
| Datenschutzrecht | 39 | 5 |
| Bürgerliches Gesetzbuch | 50 | 10 |
| Straf- und Strafverfahrensrecht | 62 | 11 |
| Umgang mit Waffen | 41 | 5 |
| Unfallverhütungsvorschriften | 44 | 6 |
| Umgang mit Menschen | 61 | 18 |
| Grundzüge der Sicherheitstechnik | 60 | 16 |
| **Summe** | **451** | **82** |

## Offen / nächste Schritte

- [x] KI-Hilfe mit einem echten Gemini-Schlüssel testen – funktioniert auf dem iPhone (10.11.2026, Modell gemini-3.6-flash)
- [x] Fragen gegenprüfen: Abgleich mit einer KATI-Fragenliste (777 Fragen) und Prüfung von § 14, 17, 18, 20, 21 BewachV am Gesetzestext (11.11.2026). Drei Fehler korrigiert
- [ ] Wie die IHK falsch gesetzte Kreuze wertet, ist nicht veröffentlicht. Die App zieht je falschem Kreuz einen Punkt der Frage ab; bei neuen Infos anpassen
- [ ] Lernkapitel um die neuen Themen ergänzen (z. B. § 243 StGB, Schließanlagen, Brandschutzordnung)
- [x] Mehr Fragen für „Umgang mit Menschen" (+15) und „Sicherheitstechnik" (+17)

## Versionen

### 1.10 – 11.11.2026
- 100 neue, selbst formulierte Fragen (351 → 451). Themen aus dem Abgleich mit einer KATI-Fragenliste, Wortlaut nicht übernommen
- Prüfungssimulation mit Teilpunkten wie die IHK seit 1. Juli 2025 (82 Fragen, Punkte = Anzahl richtiger Antworten, bestanden ab 50 %). Annahme der App: jedes falsche Kreuz hebt einen Punkt der Frage auf
- Korrigiert: Dienstausweis ohne Lichtbild-Pflicht, dafür mit Bewacherregister-Nummern (§ 18 Abs. 1 BewachV); Vorzeigen gegenüber Vollzugsbehörden (§ 18 Abs. 2); Meldung nach Waffengebrauch an Polizei und Gewerbetreibenden (§ 17 Abs. 1, § 20 Abs. 2)

### 1.9 – 10.11.2026
- Prozentanzeige verbessert: „1× richtig“ zählt halb, „sicher“ voll. Vorher zählten nur sichere Fragen (2× hintereinander richtig), dadurch blieb die Anzeige lange bei 0 %
- Unter 10 % mit einer Nachkommastelle, damit kleine Fortschritte sichtbar sind (eine Frage = 0,28 %)
- Absperrband zeigte bei 0 % trotzdem ein Stück an – behoben; „1× richtig“ erscheint als heller Teil
- Getestet: 0 %, 1× richtig, sicher, falsch beantwortet und 100 % ergeben jeweils den richtigen Wert

### 1.8 – 10.11.2026
- Neues Design „Nachtschicht“: Nachtblau und Signalgelb (Warnweste, Absperrband), Schrift Barlow (liegt in der App, funktioniert offline)
- Startseite: Lernstand als Absperrband, das sich füllt, Prozentzahl zählt hoch
- Animationen: richtige Antworten leuchten auf, falsche wackeln, Stempel und Konfetti beim Prüfungsergebnis, sanfte Seitenwechsel. Bei „Bewegung reduzieren“ (iPhone-Einstellung) aus
- KI-Chat neu: Antwort erscheint live (Streaming), Tipp-Anzeige, Stopp-Knopf, Folgefragen, Kopieren, „Neu“, bessere Formatierung von Listen und Fettdruck

### 1.7 – 10.11.2026
- „KI testen“ macht bei Problemen eine genaue Fehlersuche: 9 verschiedene Anfragen an Google, jeweils mit Ergebnis
- Neuer Knopf „Testergebnis kopieren“
- Problem „Verbindung zu Google blockiert“ gelöst: Die neuesten Gemini-Modelle waren überlastet, die App weicht jetzt automatisch auf ein anderes aus

### 1.6 – 10.11.2026
- KI-Lernhelfer repariert: Auf dem iPhone kam „Load failed“ (Safari hat die Anfrage an Google blockiert). Die App probiert jetzt mehrere Verbindungswege und merkt sich den funktionierenden
- „Speichern & testen“ schickt eine echte Testfrage an die KI
- Neuer Knopf „KI testen“ in den Einstellungen zeigt genau, was klappt und was nicht
- Sicherheitsfilter gelockert (nur noch hohe Stufe blockiert), automatischer Wechsel auf ein anderes Modell bei Überlastung, Zeitgrenze 60 Sekunden

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
