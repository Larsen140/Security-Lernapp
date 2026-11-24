# Änderungsprotokoll – Security LernApp

Hier steht, auf welchem Stand die App ist und was sich mit jedem Update geändert hat.
Die gleiche Liste siehst du in der App unter **„Was ist neu?"** (ganz unten auf der Startseite).

**Live:** https://larsen140.github.io/Security-Lernapp/

## Aktueller Stand

- **Version:** 2.15 vom 24.11.2026
- **Geräte:** Handy und PC teilen die Daten über ein geheimes Gist im GitHub-Konto des Nutzers (Mehr → „PC und Handy verbinden“)
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

### 2.15 – 24.11.2026
- Gemini-TTS las die Stil-Anweisung mit vor: jetzt nur noch der reine Text (+ `languageCode`). Tempo-Einstellung gilt nur für die Gerätestimme
- Ladezeit: Text in zwei Teile (Frage / Antworten bzw. Ergebnis / Erklärung), beide parallel angefordert, Wiedergabe nacheinander; Zwischenspeicher hält Promises (`geminiAudio` teilt laufende Anfragen); `TTS.prefetch()` lädt die nächste Ansage vorab, wenn in den letzten 15 Min. vorgelesen wurde (`TTS.used()`)


### 2.14 – 24.11.2026
- Nutzer: Stimme klingt nach Roboter, zu schnell, Akzent, stockt. Gemini-TTS: `speechConfig.languageCode = "de-DE"` (bei 400 ohne, gemerkt als `ttsNoLang`), Anweisung „akzentfreies Hochdeutsch“, Tempo per Anweisung (`pace()`) statt `playbackRate` (verstellte die Tonhöhe), mehrere Audio-Teile werden zusammengesetzt
- `TTS.who()`: welche Stimme gespielt hat bzw. warum auf die Gerätestimme zurückgefallen wurde, Anzeige bei „Probe hören“


### 2.13 – 24.11.2026
- Nutzer verstand die iPhone-Stimme nicht. Neu: Gemini-TTS (`geminiAudio()` im `TTS`-Modul): Modell aus der Modellliste (`tts` im Namen, `ttsModels` in `slapp-ai`, 7 Tage gemerkt), `responseModalities: ["AUDIO"]`, Stimme `Kore`/`Charon`/`Aoede`/`Puck`, PCM 24 kHz → Web Audio. Zwischenspeicher für 40 Texte, Rückfall auf die Gerätestimme bei Fehler oder Limit
- Gerätestimmen: Roboter-/Spaßstimmen (`BAD`) ausgefiltert, gute zuerst (`GOOD`); am iPhone automatisch die normale Anna statt der Systemvorgabe
- Einstellung `S.settings.tts.voice`: `gemini:<Name>`, eine Gerätestimme oder leer (= natürlich, wenn KI-Schlüssel da)


### 2.12 – 24.11.2026
- Nutzer hörte am iPhone nichts. `TTS`: auf Apple-Geräten keine feste Stimme (nur `lang = de-DE`), `cancel()` nur wenn etwas läuft und danach 120 ms warten, stilles Entsperren beim ersten Tippen, Hinweis nach 2,5 s ohne `onstart`, Probe mit Ergebnis (`#ttsres`)
- Bekannt: Am iPhone ist die Sprachausgabe bei eingeschaltetem Stummschalter stumm, darauf weist die App hin


### 2.11 – 24.11.2026
- Vorlesen mit der Sprachausgabe des Geräts (`speechSynthesis`, nichts geht ins Internet): Modul `TTS` in `app.js`, Texte `sayQuestion()` / `sayResult()`, Knopf `#speak` im Lernen und in der Prüfung, Taste V
- Einstellungen `S.settings.tts` {auto, rate, voice}, Karte „Vorlesen“ unter Mehr; nur deutsche Stimmen, sonst Hinweis zum Nachinstallieren
- Texte werden in Sätze geteilt (Chrome bricht lange Texte ab), Abkürzungen ausgeschrieben, Emojis entfernt; Seitenwechsel stoppt, in der Fokus-Runde zählt Zuhören als wach


### 2.10 – 24.11.2026
- Prüfungstermin des Nutzers 10.12.2026 als Vorgabe, wenn `S.settings.examDate` noch nicht gesetzt ist (`null` = bewusst entfernt)
- Auswahl „Tagesziel“ entfernt. `dailyGoal()` = max(10, ⌈nicht sichere Fragen × 2 / Resttage⌉ + heute schon beantwortet), einmal pro Tag berechnet und in `slapp-goal` gemerkt; ohne Termin gilt weiter `S.settings.goal` (20)


### 2.9 – 24.11.2026
- Lernrunde: falsche Frage wird einmal 4 Plätze später erneut eingefügt (`s.again` Positionen, `s.redo` IDs), Hinweis „🔁 nochmal“
- Prüfungstermin `S.settings.examDate` (Mehr → Lernen), `countdown()` auf der Startseite: Tage bis zur Prüfung, nötige Fragen pro Tag = nicht sichere Fragen × 2 / Tage


### 2.8 – 24.11.2026
- `tipCard()`: Empfehlung nach fehlenden Prüfungspunkten je Sachgebiet ((1 − Lernstand) × `examCount`), führt zu `#/lernen/t-…`
- `syncLine()`: Stand oder Fehler des Abgleichs auf der Startseite
- Prüfung der Seiten bei 320, 390, 1024 und 1440 px, hell und dunkel: keine Fehler, nichts zu breit


### 2.7 – 24.11.2026
- Fokus-Runde `#/fokus` (Einstellung `S.settings.focus` {min, noise}, Verlauf `S.settings.focusLog`): Lernen im Modus `#/lernen/fokus` ohne Ende (immer neue 20er-Runden aus `pickSmart`), Zeitpille `#fpill` in der Kopfzeile, `body.focus` blendet Navigation aus (auch die Seitenleiste am PC)
- Wachhalten: 60 s ohne Eingabe → `SFX.alarm()` (klingt auch bei ausgeschalteten Tönen), Vibration, Overlay `#wakeov` mit Aufgabe; nach 3× Hinweis auf eine echte Pause
- Ablenkungen über `visibilitychange` (> 5 s weg), Bildschirm-Sperre über Wake Lock, braunes Rauschen über Web Audio (`NOISE`)
- Ende der Zeit: Ergebnis mit 5-Minuten-Pause; Verlassen der Fokus-Seite beendet die Runde


### 2.6 – 24.11.2026
- `cleanQ()` entfernt „Lösung aus früherer KATI-Auswertung“ (auch in derselben Zeile wie die Frage, so liest pdf.js manche Seiten) sowie „KATI-Auswertung“/„Lösungsvorschlag“ am Ende des Fragetexts; ein „Lösungsvorschlag“ am Ende setzt weiter die Markierung
- Beim Start werden bereits importierte Fragen in `S.custom` einmal bereinigt; der Abgleich überträgt die bereinigte Fassung


### 2.5 – 24.11.2026
- Geräte-Abgleich über GitHub: Token (classic, nur Scope `gist`) liegt nur in `localStorage` `slapp-sync`, nicht im Backup, nie im Repo. Daten als geheimes Gist (`slapp-sync.json`), wird über die Gist-Liste gefunden oder angelegt
- `mergeState()`: Lernstand pro Frage nach neuestem `t`, eigene Fragen als Vereinigung nach `id`, Prüfungen nach `d`, Tage als Maximum bzw. Summe pro Gerät (`S.dev`, letzte 60 Tage), Einstellungen nach `settings._t` (bei Gleichstand gewinnt die Fassung im Gist)
- Löschungen werden mit Zeitpunkt in `S.del` gemerkt (eigene Fragen `id`, Markierungen `f:id`), Zurücksetzen über `S.resetAt`; Markierungen speichern jetzt den Zeitpunkt statt `1`
- Abgleich beim Start, 3 s nach jeder Speicherung, alle 30 s und beim Zurückkehren in die App; hochgeladen wird nur, wenn sich der Inhalt unterscheidet (`canon()`, unabhängig von der Reihenfolge). Große Dateien über `raw_url`
- Nach dem Abgleich werden nur ruhige Seiten neu gezeichnet (Start, Lernen, Sachgebiet, Prüfung-Start, Mehr), nie mitten in einer Runde. Die laufende Prüfung (`slapp-exam`) bleibt auf dem Gerät
- PC-Ansicht ab 980 px: Seitenleiste statt Leiste unten, `body[data-page]` für Raster je Seite, KI-Chat als Schublade rechts, Hover-Effekte bei Maus


### 2.4 – 19.11.2026
- KI-Tempo `conf.speed` („schnell“ Standard / „gruendlich“): Schnell nimmt zuerst Flash-Lite (`conf.lite`, `conf.fast`), Gründlich zuerst Flash
- Denk-Einstellung „minimal“ (Gemini 3) bzw. Budget 0 (2.5); lehnt ein Modell sie ab, wird „low“ bzw. keine Angabe probiert und je Modell gemerkt (`conf.think`)
- Streaming bricht ab, wenn nach 15 s noch kein Text kommt, und wechselt das Modell; Einzelanfragen höchstens 20 s (vorher 120 s bzw. 60 s)
- `maxOutputTokens` 2048, Systemanweisung verlangt kurze Antworten
- Fehlt die Lite-Liste (alter Stand), wird die Modellliste beim Öffnen des Chats im Hintergrund nachgeladen
- Statuszeile: „denkt nach … n s“, danach Modell und Antwortzeit

### 2.3 – 19.11.2026
- Pinch-Rauszoomen wird per `touchmove`/`gesturechange` abgefangen, solange `visualViewport.scale` ≤ 1; Reinzoomen bleibt erlaubt
- Viewport zusätzlich mit `shrink-to-fit=no`
- Alle Seiten (inkl. KI-Chat, Prüfung, Ergebnis, Rundenende, Import-Vorschau) auf 320 und 375 px Breite geprüft: nichts ragt über den Rand

### 2.2 – 19.11.2026
- Import: Markierung „Lösungsvorschlag ·“ vor einer Antwort zählt als richtig und setzt den Hinweis „noch nicht bestätigt“
- Zeile „Lösung aus früherer KATI-Auswertung“ wird als Kennzeichnung erkannt statt an die Frage angehängt
- Fußzeilen der Form „Wort · Zahl“ werden ignoriert
- Getestet mit vier Quellen (drei PDFs, eine Textliste), einzeln und nacheinander: keine Reste von Markierungen, Dubletten werden übersprungen

### 2.1 – 17.11.2026
- Lernrunden ≤ 30 Fragen: segmentierte Fortschrittsanzeige (`session.hist`), sonst Balken
- Antwortkästchen zeigen Buchstaben; Rückmeldung mit Symbol (`.vhead`), gestaffeltes Aufdecken (`--k`)
- 🔥-Zähler als Abzeichen an der Fragekarte
- Rundenende mit SVG-Ring und Kennzahlen (`.donecard`)
- Sachgebietsseite mit dunklem Kopf (`.thero`) und Lernmodus-Liste (`.mode`)
- Kachelsymbole in getönten Feldern, Navigationssymbol hüpft beim Wechsel

### 2.0 – 17.11.2026
**Aufbau**
- Untere Navigation (Start, Lernen, Prüfung, Fragen, Mehr); wird in Lernrunden und Prüfung ausgeblendet
- Startseite neu: Lernstand, Lernserie und Tagesziel, Weiterlernen, Kacheln (Fehler, Schnelltest, Markiert, KI), Prüfungskarte, Hinweis bei laufender Prüfung
- Neue Seite „Lernen“ (`#/themen`) mit allen Sachgebieten und Prozent je Sachgebiet
- „Eigene Fragen“: Suche, Filter nach Sachgebiet, 30 Fragen pro Seite, „Neue Frage“ einklappbar

**Aussehen, Animation, Töne**
- Töne per Web Audio (keine Dateien): Tippen, richtig, falsch, Serie, Rundenende, bestanden/nicht bestanden. Einstellung „Töne“, Vibration bei falsch (Android)
- Serien-Zähler 🔥 in Lernrunden, Hereingleiten der nächsten Frage, Balken je Sachgebiet im Prüfungsergebnis
- Neues App-Symbol (Nachtblau, gelbes Schild, Absperrband), `theme-color` und Manifest-Farben auf Nachtblau
- Tastatur am Computer: 1–6 wählt Antworten, Enter prüft/weiter, Pfeile in der Prüfung

**Fehler behoben**
- Absturz bei ungültigen Adressen wie `#/lernen/gewo`
- „Markierte Fragen“ zählte gelöschte und ausgeblendete Fragen mit
- Laufende Prüfung ging beim Schließen der App verloren → jetzt in `slapp-exam` gespeichert und fortsetzbar; abgelaufene Zeit wird beim Öffnen ausgewertet
- Laufende Prüfung wurde über „Prüfung starten“ überschrieben → Fortsetzen/Verwerfen
- Nach einer abgeschlossenen Prüfung lief das automatische Update auf der Startseite nicht mehr
- Backup-Download in der installierten iPhone-App → Teilen-Dialog
- Statusleiste noch im alten Blau

**Getestet:** alle Seiten in vier Speicherzuständen ohne Fehler, Lernrunde, Prüfung über Neuladen und Zeitablauf, Einstellungen, Tastatur, hell/dunkel auf 390 px Breite

### 1.16 – 16.11.2026
- Viewport `minimum-scale=1`: Rauszoomen nicht mehr möglich, Reinzoomen bleibt erlaubt (Barrierefreiheit)
- `overflow-wrap:anywhere`, `overflow-x:hidden`, `touch-action:manipulation` für html/body; Ursache war ein zusammengeklebtes langes Wort aus einer importierten PDF auf „Eigene Fragen“
- Alle Seiten auf 375 px Breite geprüft: nichts ragt mehr über den Rand

### 1.15 – 16.11.2026
- Import: zweites Format „nur Lösungen“ (Frage + Aufzählung der richtigen Antworten). `addDistractors()` ergänzt falsche Antworten aus anderen Fragen desselben Sachgebiets (möglichst wenig Wortüberschneidung), bis 4 Antworten vorhanden sind
- Kennzeichnung „Lösungsvorschlag“ in der Erklärung; Zeilen wie „Test 331“, „Weitere Fragen …“ und Fußzeilen „… / 33“ werden ignoriert
- Dubletten-Vergleich ohne Satz- und Leerzeichen
- Getestet: neue Lösungs-PDF (933 Fragen erkannt), alte PDF (777) und Textliste (58); kombiniert keine Dubletten

### 1.14 – 16.11.2026
- Einstellung „Nur meine eigenen Fragen verwenden“ (`S.settings.onlyOwn`). Ohne ausdrückliche Wahl automatisch an, sobald importierte Fragen existieren. Wirkt auf Startseite, Sachgebiete, alle Lernmodi und Prüfung
- Startseite zeigt „Fragen: nur deine eigenen (N)“ mit Link zu den Einstellungen; Prüfung kürzt Sachgebiete mit zu wenigen eigenen Fragen und weist darauf hin

### 1.13 – 16.11.2026
- Prüfungssimulation zieht je Sachgebiet aus eingebauten und eigenen/importierten Fragen (vorher nur eingebaute)
- Ablauftest mit 777 importierten Fragen: Import, Startseite, Üben, Fehler wiederholen, Lernstand, KI-Hilfe und Prüfung funktionieren

### 1.12 – 16.11.2026
- Import liest PDF- und Textdateien direkt auf dem Gerät. Der PDF-Leser (pdf.js 3.11.174 von cdnjs) wird nur bei Bedarf geladen, dafür ist Internet nötig
- Erkennt auch das Format „A) Richtig · Antwort“, ignoriert Seitenzahlen und Fußzeilen, überspringt Dubletten innerhalb der Datei
- Getestet mit einer PDF mit 777 Fragen: alle erkannt und zugeordnet

### 1.11 – 16.11.2026
- Import für eigene Fragen: Text im Format „1. Frage / A) Antwort / ✅ = richtig“ einfügen, Sachgebiet automatisch oder fest wählen, Dubletten werden übersprungen. Gespeichert nur im localStorage des Geräts (und im Backup), nicht im Repo
- Knopf „Alle importierten Fragen löschen“

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
