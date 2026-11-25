// Versionsverlauf der App. Neueste Version immer OBEN eintragen.
// Wird in der App unter „Was ist neu“ angezeigt. Bitte auch CHANGELOG.md mitpflegen.
window.SL_UPDATES = [
  {
    v: "2.17", d: "2026-11-25", items: [
      "Rauschen am Ende jetzt wirklich weg: Die neue Google-Stimme schickt hinter dem Ton einen unhörbaren Herkunftsnachweis („KI-erzeugt“) mit, den die App bisher als Ton abgespielt hat. Der wird jetzt übersprungen",
      "Auch das leise Knacken ganz am Anfang ist weg"
    ]
  },
  {
    v: "2.16", d: "2026-11-25", items: [
      "Kein Rauschen mehr am Ende: Das Störgeräusch, das Google ans Ende der Frage und der Antworten hängt, wird jetzt abgeschnitten und sanft ausgeblendet",
      "Zwischen Frage und Antworten gibt es eine kurze natürliche Pause"
    ]
  },
  {
    v: "2.15", d: "2026-11-24", items: [
      "Der fremde Satz am Anfang ist weg: Die Stimme liest jetzt nur noch Frage und Antworten vor",
      "Schneller: Die Frage wird zuerst geladen und gesprochen, die Antworten laden gleichzeitig nach",
      "Sobald du einmal 🔊 benutzt hast, lädt die App die nächste Ansage schon im Voraus (Lösung nach dem Prüfen, nächste Frage). Dann spricht sie fast sofort los"
    ]
  },
  {
    v: "2.14", d: "2026-11-24", items: [
      "Natürliche Stimme verbessert: Google bekommt jetzt ausdrücklich Deutsch vorgegeben und soll akzentfrei, ruhig und deutlich sprechen",
      "Das Tempo wird nicht mehr durch schnelleres Abspielen verstellt (das klang nach Roboter), sondern Google spricht selbst langsamer oder zügiger",
      "„Probe hören“ unter Mehr → Vorlesen zeigt jetzt, welche Stimme wirklich gespielt hat und warum, falls Google nicht ging"
    ]
  },
  {
    v: "2.13", d: "2026-11-24", items: [
      "Neu: natürliche Stimme zum Vorlesen. Mit deinem Gemini-Schlüssel liest jetzt eine Stimme von Google vor, die wie ein Mensch klingt (Standard, wenn ein Schlüssel eingetragen ist)",
      "Vier Stimmen zur Auswahl unter Mehr → Vorlesen: Kore, Charon, Aoede und Puck. Das Laden dauert 2–5 Sekunden, der Knopf zeigt solange ⏳",
      "Ist das Tageslimit bei Google erreicht oder kein Internet da, liest automatisch die Stimme des Handys",
      "Die schwer verständlichen Roboter- und Spaßstimmen des iPhones (z. B. Eddy, Grandma, Shelley) werden nicht mehr verwendet und nicht mehr angeboten"
    ]
  },
  {
    v: "2.12", d: "2026-11-24", items: [
      "Vorlesen am iPhone repariert: Die App nimmt jetzt die deutsche Systemstimme statt einer „Erweitert“-Stimme, die evtl. nicht geladen ist und stumm bleibt",
      "Safari blieb stumm, wenn direkt nach dem Abbrechen neu gesprochen wurde – das ist behoben, die Sprachausgabe wird außerdem beim ersten Tippen freigeschaltet",
      "Kommt kein Ton, zeigt die App jetzt einen Hinweis (z. B. Stummschalter am iPhone) statt einfach still zu bleiben",
      "„Probe hören“ unter Mehr → Vorlesen sagt dir, ob die Sprachausgabe läuft und was du sonst prüfen musst"
    ]
  },
  {
    v: "2.11", d: "2026-11-24", items: [
      "Neu: Vorlesen. Tippe bei einer Frage auf 🔊, dann liest die App Frage und Antworten vor (A, B, C … in der angezeigten Reihenfolge)",
      "Nach „Antwort prüfen“ liest 🔊 vor, ob es richtig war, welche Antworten stimmen und die Erklärung",
      "Unter Mehr → Vorlesen: jede Frage automatisch vorlesen lassen, Tempo und Stimme wählen, Probe hören",
      "Abkürzungen werden ausgesprochen, z. B. „§ 32 StGB“ als „Paragraf 32 Strafgesetzbuch“",
      "Funktioniert auch in der Prüfungssimulation und in der Fokus-Runde; am PC mit der Taste V"
    ]
  },
  {
    v: "2.10", d: "2026-11-24", items: [
      "Dein Prüfungstermin 10.12.2026 ist eingetragen (änderbar unter Mehr → Lernen)",
      "Das Tagesziel stellst du nicht mehr selbst ein: Die App rechnet es aus dem Prüfungstermin aus. Alle Fragen, die noch nicht sicher sitzen, werden auf die verbleibenden Tage verteilt",
      "Das Ziel wird einmal am Tag festgelegt und bleibt dann bis Mitternacht gleich. Lernst du viel, wird es an den nächsten Tagen kleiner"
    ]
  },
  {
    v: "2.9", d: "2026-11-24", items: [
      "Falsch beantwortete Fragen kommen in derselben Runde nach drei anderen Fragen noch einmal dran (mit „🔁 nochmal“ und neu gemischten Antworten). So bleibt die richtige Lösung besser hängen",
      "Neu unter Mehr → Lernen: dein Prüfungstermin. Die Startseite zeigt dann, wie viele Tage noch bleiben und wie viele Fragen du pro Tag schaffen solltest",
      "Am Prüfungstag wünscht dir die App viel Erfolg 🍀"
    ]
  },
  {
    v: "2.8", d: "2026-11-24", items: [
      "Neu auf der Startseite: „Heute am meisten wert“ zeigt das Sachgebiet, in dem dir für die Prüfung die meisten Punkte fehlen, mit einem Tipp direkt zum Üben",
      "Ist PC und Handy verbunden, steht unten auf der Startseite, wann zuletzt abgeglichen wurde (oder was nicht klappt)",
      "Am PC stehen Fokus-Runde und Prüfung nebeneinander"
    ]
  },
  {
    v: "2.7", d: "2026-11-24", items: [
      "Neu: Fokus-Runde auf der Startseite. 15, 25 oder 45 Minuten nur Fragen, ohne Menü, die Zeit läuft oben mit",
      "Gegen Müdigkeit: Tippst du eine Minute lang nichts, klingelt die App, vibriert und gibt dir eine kurze Aufgabe zum Wachwerden (z. B. 10 Kniebeugen oder kaltes Wasser)",
      "Verlässt du die App während der Runde, begrüßt sie dich beim Zurückkommen und zählt es als Ablenkung",
      "Auf Wunsch ruhiges Rauschen im Hintergrund, der Bildschirm bleibt während der Runde an",
      "Am Ende: Fragen, Trefferquote, Ablenkungen und wie oft du weggenickt bist, dazu eine 5-Minuten-Pause mit Uhr"
    ]
  },
  {
    v: "2.6", d: "2026-11-24", items: [
      "Der Hinweis „Lösung aus früherer KATI-Auswertung“ steht nicht mehr im Fragetext, auch nicht bei schon importierten Fragen",
      "Beim Import wird er gleich weggelassen, ebenso ein „Lösungsvorschlag“ am Ende der Frage (der Hinweis darauf steht weiter in der Erklärung)"
    ]
  },
  {
    v: "2.5", d: "2026-11-24", items: [
      "PC und Handy teilen jetzt dieselben Daten: unter Mehr → „PC und Handy verbinden“ einmal einen GitHub-Schlüssel eingeben, auf beiden Geräten",
      "Abgeglichen werden Lernstand, eigene und importierte Fragen, Markierungen, Prüfungsergebnisse, Lernserie und Einstellungen – automatisch beim Öffnen, kurz nach jeder Antwort und alle 30 Sekunden",
      "Hast du auf beiden Geräten schon gelernt, wird alles zusammengeführt: pro Frage zählt der neueste Stand, Gelöschtes bleibt gelöscht",
      "Neue Ansicht für den PC: Menü als Leiste links, Startseite und Sachgebiete nebeneinander, Einstellungen in zwei Spalten",
      "Der KI-Chat öffnet sich am PC als Fenster am rechten Rand, die Seite bleibt daneben sichtbar",
      "Am PC als App installierbar (Chrome oder Edge: Symbol „App installieren“ in der Adresszeile); mit der Tastatur antworten wie bisher: 1–6 und Enter"
    ]
  },
  {
    v: "2.4", d: "2026-11-19", items: [
      "KI deutlich schneller: neuer Modus „Schnell“ (Standard) mit dem schnelleren Modell Flash-Lite und minimaler Denkzeit",
      "Kürzere, auf den Punkt gebrachte Antworten; mehr bekommst du mit „Noch einfacher“ oder indem du nachfragst",
      "Ist ein Modell überlastet, wechselt die App nach 15 Sekunden automatisch (vorher bis zu 2 Minuten Wartezeit)",
      "Die Statuszeile im Chat zeigt, wie lange die KI schon nachdenkt, und danach, wie lange die Antwort gedauert hat",
      "Unter Mehr → KI-Lernhelfer kannst du auf „Gründlich“ umstellen, wenn du ausführlichere Antworten willst"
    ]
  },
  {
    v: "2.3", d: "2026-11-19", items: [
      "Rauszoomen mit zwei Fingern ist jetzt ganz gesperrt, auch das kurze Auseinanderziehen am iPhone",
      "Reinzoomen bleibt möglich, und von dort kommst du wie gewohnt zurück zur normalen Größe"
    ]
  },
  {
    v: "2.2", d: "2026-11-19", items: [
      "Import erkennt jetzt auch Antworten, die mit „Lösungsvorschlag ·“ markiert sind",
      "Seitenzahlen wie „KATI · 2“ landen nicht mehr im Antworttext",
      "Lösungsvorschläge werden auch bei Ankreuzfragen als „noch nicht bestätigt“ gekennzeichnet"
    ]
  },
  {
    v: "2.1", d: "2026-11-17", items: [
      "Fortschritt beim Lernen als Felder: jedes Feld eine Frage, grün richtig, rot falsch, gelb die aktuelle",
      "Antworten mit Buchstaben im Kästchen, Buchstaben stehen nicht mehr doppelt im Text",
      "Neue Rückmeldung nach „Antwort prüfen“ mit großem ✓ oder ✗; die Lösungen erscheinen nacheinander",
      "🔥-Serie als Abzeichen an der Frage statt in einer eigenen Zeile",
      "Rundenende neu: Ring, der sich füllt, dazu richtig, falsch, beste Serie und Tagesziel",
      "Sachgebietsseite neu: dunkler Kopf mit Prozent und Balken, Lernmodi als übersichtliche Liste",
      "Symbole in Kacheln und Navigation, kleines Hüpfen beim Wechsel des Reiters"
    ]
  },
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
