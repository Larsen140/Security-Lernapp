# Projektnotizen – Security LernApp

Lern-App für die IHK-Sachkundeprüfung nach § 34a GewO. Vanilla JS, kein Build, alle Dateien flach im Root.
Live über GitHub Pages aus `main` (Ordner `/`): https://larsen140.github.io/Security-Lernapp/ – Pushen auf `main` = veröffentlichen (ca. 1–2 Min.).

## Dateien
- `index.html` lädt die Datendateien, `updates.js` und `app.js`
- `app.js` – gesamte Logik (Hash-Router)
- `styles.css` – Design, Hell-/Dunkelmodus
- `sw.js` – Service Worker (Offline). Fremde Domains (KI-APIs) werden nicht gecacht.
- `01-rdoeso.js` … `09-sit.js` – Lernkapitel und Fragen je Sachgebiet:
  `window.SL_TOPICS.push({id, short, name, icon, examCount, lesson:\`HTML\`, questions:[{q, a:[...], c:[Indizes richtig], e:"Erklärung", p:"Paragraph"}]})`
- `updates.js` – Versionsverlauf, wird in der App unter „Was ist neu“ angezeigt
- `CHANGELOG.md` – derselbe Verlauf plus aktueller Stand und offene Punkte, für GitHub

## Regeln bei jeder Änderung
1. **Version hochzählen:** neuen Eintrag OBEN in `updates.js` und in `CHANGELOG.md` (Versionen + „Aktueller Stand“; Fragenzahlen aktualisieren, offene Punkte abhaken).
2. **Cache-Version in `sw.js` hochzählen** (`slapp-vN`), und neue Dateien in `FILES` eintragen, sonst kommt das Update offline nicht an.
3. **Keine KATI-Inhalte kopieren.** Fragen werden selbst aus den Gesetzestexten formuliert.
4. **Niemals KI-Schlüssel ins Repo schreiben** – das Repo ist öffentlich. Schlüssel liegen nur im localStorage (`slapp-ai`), nicht im Backup.
5. Prüfungsverteilung (`examCount`) muss 82 ergeben: RdöSuO 6, GewO 5, DS 5, BGB 10, StGB 11, UmW 5, UVV 6, UmM 18, SiT 16.
6. Groß-/Kleinschreibung der Dateinamen beachten (GitHub Pages).
7. **Änderungen sofort auf `main` pushen** – der Nutzer hat das ausdrücklich so gewünscht. Danach NICHT auf das Pages-Deployment warten, sondern direkt antworten.

## Update-Prüfung und KI
- Die App holt alle 10 s `updates.js` mit `cache: "no-store"` (der Service Worker lässt solche Anfragen durch) und vergleicht die oberste Versionsnummer. Darum muss jede Änderung eine neue Version oben in `updates.js` bekommen, sonst merkt die App nichts.
- Der Service Worker holt jede Datei mit `cache: "no-cache"` (GitHub Pages setzt `max-age=600`, sonst kämen bis zu 10 Min. alte Dateien).
- Veröffentlichen über GitHub Pages dauert zurzeit oft 3–5 Minuten (`gh run list -R Larsen140/Security-Lernapp`).
- KI-Lernhelfer: ausschließlich Google Gemini – mit Schlüssel nur Präfix `AQ.`, ohne Schlüssel öffnet „KI-Hilfe“ gemini.google.com und kopiert die Frage. Keine Claude-Links mehr.
- Gemini-Anfragen probieren drei Wege (`header` = x-goog-api-key, `query` = ?key=, `simple` = ?key= ohne JSON-Header, also ohne CORS-Preflight). Grund: iPhone-Safari meldete „Load failed“. Der funktionierende Weg und das Modell werden in `slapp-ai` gespeichert (`way`, `model`, `models`). Diagnose: Einstellungen → „KI testen“.
- Tempo (ab 2.4): `conf.speed` „schnell“ (Flash-Lite zuerst, `modelOrder()`), Denkstufe minimal, 15 s bis zum ersten Text, sonst Modellwechsel. Nutzer fand die KI vorher zu langsam.
- Erfahrung 10.11.2026: Die neuesten Modelle (gemini-3.8/3.7-flash) meldeten „high demand“; Überlastungs-Antworten kommen auf dem iPhone teils als Netzwerkfehler an. Lösung war der automatische Modellwechsel (`models`-Liste, wird bei „KI testen“ aufgefrischt). Mit echtem AQ-Schlüssel funktioniert Weg „query“.

## Design
- Thema „Nachtschicht“: `--ink` Nachtblau, `--signal` Signalgelb, Absperrband-Streifen `--stripe` (Kopfzeile, Lernstand, Fortschritt, Chat-Kopf). Hell = „Tagschicht“.
- Ab 3.0 „Lernausweis“: Lernstand als Dienstausweis (`.idcard` mit Guilloche-Muster, Schild-Ring `#pring`). Das ist das eine auffällige Element; der Rest bleibt ruhig (Linien statt Schatten). Keine Großbuchstaben-Überschriften.
- Schrift Barlow / Barlow Condensed (OFL) als `font-*.woff2` im Root, in `sw.js` `FILES` eingetragen.
- Animationen nur bei Nutzeraktionen; `prefers-reduced-motion` schaltet sie ab.
- KI-Chat streamt über `streamGenerateContent?alt=sse`; bei Fehler ohne Text Rückfall auf `callAI` (mit Modellwechsel).

## Prüfungssimulation
- Wertung wie IHK seit 1. Juli 2025: 82 Fragen, Punkte je Frage = Anzahl richtiger Antworten (Teilpunkte), bestanden ab 50 % der Punkte (IHK: 60 von 120). Falsche Kreuze: nicht offiziell geregelt, App zieht je falschem Kreuz 1 Punkt der Frage ab (min. 0), Funktion `points()` in `app.js`.

## Fragen
- Neue Fragen immer am ENDE der Liste anhängen: Die ID ist `sachgebiet-index`, daran hängt der Lernstand der Nutzer.
- KATI-Listen dürfen nur zur Themensuche und zum Gegenprüfen genutzt werden, nie wörtlich übernommen (Repo ist öffentlich).
- Fremde Fragenlisten importiert der Nutzer selbst über „Eigene Fragen → Fragen importieren“ (`parseImport`, `guessTopic` in `app.js`). Sie liegen nur in `S.custom` auf dem Gerät (Flag `imp: true`). Mit `onlyOwn()` (Einstellung `S.settings.onlyOwn`, sonst automatisch an bei importierten Fragen) liefert `questionsOf()` nur eigene Fragen; eingebaute Fragen nie aus dem Repo löschen. Zwei Importformate: Ankreuzliste (A) … mit ✅/„Richtig ·“) und „nur Lösungen“ (• Aufzählung, falsche Antworten ergänzt `addDistractors()`). PDF-Dateien liest `pdfToText` mit pdf.js 3.11.174 von cdnjs (nur bei Bedarf geladen).

## Aufbau (ab 2.0)
- Untere Navigation `#tabs` (Start `#/`, Lernen `#/themen`, Prüfung `#/pruefung`, Fragen `#/eigene`, Mehr `#/einstellungen`); `foot()` mit Inhalt blendet sie aus (`body.has-foot`).
- Töne: `SFX` in `app.js` (Web Audio, keine Dateien), Einstellung `S.settings.sound`. Lerntage `S.days` (für Serie).
- Tagesziel (ab 2.10) kommt aus dem Prüfungstermin `S.settings.examDate` (Nutzer: 10.12.2026) über `dailyGoal()`; der Nutzer wollte kein selbst gewähltes Tagesziel mehr. Ohne Termin Rückfall auf `S.settings.goal`. Ab 3.0 mit Puffer `S.settings.buffer` (Standard 3 Tage, Nutzerwunsch: 3 Tage vor der Prüfung fertig).
- Laufende Prüfung in `localStorage` `slapp-exam` (IDs statt Fragen, `qAny()` stellt sie wieder her).

## Lesbarkeit (ab 3.3)
- Nutzer will gut lesbare Texte: keine Silbentrennung, `overflow-wrap:break-word` (nicht `anywhere`), Mindestgröße 13–14 px, `--muted` mit genug Kontrast. Einstellungen sind aufklappbare Abschnitte (`details.setsec`) – Tests müssen sie vor dem Klicken öffnen.

## Zoom
- Rauszoomen ist gesperrt (Viewport `minimum-scale=1` + Abfangen der Pinch-Geste in `app.js`), Reinzoomen bleibt erlaubt. Nichts darf breiter als der Bildschirm werden (`overflow-wrap:anywhere`), sonst lässt iOS wieder rauszoomen.

## Lernstand
- Prozentzahl auf der Startseite = (sicher + 0,5 × „1× richtig“) / alle Fragen; unter 10 % mit einer Nachkommastelle. Absperrband: voller Teil = sicher, heller Teil = halbe Punkte.

## PC-Ansicht und Geräte-Abgleich (ab 2.5)
- Ab 980 px Breite: `#tabs` wird zur Seitenleiste links (mit `.brand`), `router()` setzt `body[data-page]`, danach richten sich die Raster in `styles.css` (Start, Themen, Einstellungen). Fragen/Prüfung bleiben 840 px schmal. Handy-Ansicht unverändert.
- Abgleich über ein geheimes Gist im GitHub-Konto des Nutzers (Datei `slapp-sync.json`). Token (classic, Scope `gist`) nur in `slapp-sync` – nie ins Repo, nie ins Backup, nie ins Gist. KI-Schlüssel wird nie abgeglichen.
- Zusammenführen in `mergeState()`; Löschungen brauchen einen Eintrag in `S.del` (`forget(id)`, Markierungen `"f:"+id`), Zurücksetzen setzt `S.resetAt`. Wer neue Daten in `S` einführt, muss sie in `mergeState()` und in der Liste in `syncNow()` ergänzen, sonst gehen sie beim Abgleich verloren.
- Einstellungen ändern immer mit `S.settings._t = Date.now()`, sonst setzt sich die Änderung nicht auf dem anderen Gerät durch.
- Test: zwei Browser-Kontexte mit nachgebautem GitHub (Request-Interception), siehe Verlauf 24.11.2026.

## Fokus-Runde (ab 2.7)
- Nutzer schlief beim Lernen ein und wollte konzentrierter bleiben. `#/fokus` → `startFocus()`, Lernen unter `#/lernen/fokus`, Zustand `focus` nur im Speicher (nicht gespeichert). Weck-Hinweis nach `WAKE_MS` (60 s) ohne Eingabe. Jede andere Route beendet die Runde (`router()`).

## Vorlesen (ab 2.11)
- Natürliche Stimme (ab 2.13): Gemini-TTS mit dem AQ-Schlüssel (`geminiAudio()`), Standard wenn ein Schlüssel da ist; sonst/bei Fehler Gerätestimme. Nutzer fand die iPhone-Stimme unverständlich, die Gemini-Stimme „super“. Keine Anweisungen vor den Text schreiben, das Modell liest sie mit vor. Vorabladen nur bei aktiver Nutzung (Tageslimit bei Google). Neuere TTS-Modelle liefern WAV mit `C2PA`-Block am Ende – immer über `decodeAudio()` dekodieren, nie die ganzen Bytes als PCM.
- `TTS` (Web Speech API, nur deutsche Stimmen, Roboterstimmen gefiltert), Knopf `#speak` über `speakBtn()`/`bindSpeak()`, Einstellungen `S.settings.tts`. Abkürzungsliste `WORDS` im `TTS`-Modul erweitern, wenn etwas falsch ausgesprochen wird. Test: `speechSynthesis` per `Object.defineProperty` nachbauen (direkte Zuweisung greift in Chrome nicht).

## Verstehen statt raten (ab 3.2)
- Nutzer riet und merkte sich nur die Lösungen. „Weiß nicht“ und „War nur geraten“ zählen wie falsch; KI-Erklärung `explainWhy()` für Fragen ohne `e`, gespeichert als `ke` (wird abgeglichen).

## Speicher (localStorage)
- `slapp-v1` – Fortschritt, eigene Fragen, Prüfungen, Markierungen, Einstellungen, zuletzt gesehene Version (`seenVersion`)
- `slapp-ai` – KI-Schlüssel und Modell
- `slapp-sync` – GitHub-Token, Gist-ID, Benutzername, letzter Abgleich (nur auf dem Gerät)
- `slapp-dev` – zufällige Geräte-ID für die Tageszählung
- `slapp-exam` – laufende Prüfung (wird nicht abgeglichen)
