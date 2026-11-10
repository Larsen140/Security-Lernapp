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

## Speicher (localStorage)
- `slapp-v1` – Fortschritt, eigene Fragen, Prüfungen, Markierungen, Einstellungen, zuletzt gesehene Version (`seenVersion`)
- `slapp-ai` – KI-Schlüssel und Modell
