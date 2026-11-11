window.SL_TOPICS = window.SL_TOPICS || [];
window.SL_TOPICS.push({
  id: "dguv",
  short: "UVV",
  name: "Unfallverhütungsvorschriften (DGUV)",
  icon: "⛑️",
  examCount: 6,
  lesson: `
<h3>Worum geht es?</h3>
<p>Wie schützt du dich und andere vor Unfällen, und was tust du, wenn doch etwas passiert?</p>
<h3>1. Gesetzliche Unfallversicherung</h3>
<ul>
<li>Träger sind die <b>Berufsgenossenschaften</b>. Für das Bewachungsgewerbe ist das die <b>VBG</b> (Verwaltungs-Berufsgenossenschaft).</li>
<li>Die <b>Beiträge zahlt allein der Arbeitgeber</b>.</li>
<li>Versichert sind <b>Arbeitsunfälle</b>, <b>Wegeunfälle</b> (direkter Weg zur Arbeit und zurück) und <b>Berufskrankheiten</b>.</li>
<li>Nach einem Arbeitsunfall geht man zum <b>Durchgangsarzt (D-Arzt)</b>, wenn die Verletzung über den Unfalltag hinaus zur Arbeitsunfähigkeit führt oder eine Behandlung über eine Woche nötig ist.</li>
<li><b>Unfallanzeige</b> an die BG, wenn ein Versicherter getötet oder für <b>mehr als 3 Tage</b> arbeitsunfähig ist.</li>
<li>Jede Erste-Hilfe-Leistung wird dokumentiert (<b>Verbandbuch</b>, 5 Jahre aufbewahren).</li>
</ul>
<h3>2. DGUV Vorschrift 1 – Grundsätze der Prävention</h3>
<ul>
<li><b>Unternehmer:</b> Gefährdungsbeurteilung, Schutzmaßnahmen, persönliche Schutzausrüstung (PSA) bereitstellen, Erste Hilfe organisieren, Beschäftigte <b>unterweisen</b>: vor Aufnahme der Tätigkeit und dann <b>mindestens einmal jährlich</b>, dokumentiert.</li>
<li><b>Beschäftigte:</b> Weisungen befolgen, PSA benutzen, Einrichtungen bestimmungsgemäß nutzen, Mängel und Gefahren sofort melden, sich nicht durch <b>Alkohol, Drogen oder Medikamente</b> in einen gefährlichen Zustand versetzen.</li>
</ul>
<h3>3. DGUV Vorschrift 23 – Wach- und Sicherungsdienste</h3>
<ul>
<li>Wachpersonen müssen <b>geeignet</b> sein (körperlich und geistig) und für ihre Aufgaben ausreichend <b>eingewiesen</b> werden, auch in das Objekt und seine besonderen Gefahren.</li>
<li><b>Dienstanweisung</b> mit Verhalten im Objekt und bei Gefahren.</li>
<li>Wachpersonen dürfen <b>keine Tätigkeiten außerhalb des Wachauftrags</b> übernehmen, die sie gefährden.</li>
<li>Bei Dunkelheit: <b>Handleuchte</b> (Taschenlampe) mitführen.</li>
<li><b>Alleinarbeit:</b> Überwachung sicherstellen, z. B. Personen-Notsignal-Anlage (PNA) oder regelmäßige Kontrollmeldungen.</li>
<li><b>Schusswaffen:</b> nur mit Erlaubnis. Wachpersonen müssen sachkundig sein und regelmäßig an Schießübungen teilnehmen. Laden und Entladen am sicheren Ort.</li>
<li><b>Diensthunde:</b> nur geprüfte Hunde mit geeigneten, geschulten Hundeführern.</li>
</ul>
<h3>4. Sicherheitszeichen</h3>
<ul>
<li><b>Verbotszeichen:</b> rund, roter Rand, Querbalken.</li>
<li><b>Gebotszeichen:</b> rund, blau.</li>
<li><b>Warnzeichen:</b> dreieckig, gelb mit schwarzem Rand.</li>
<li><b>Rettungszeichen:</b> rechteckig, grün.</li>
<li><b>Brandschutzzeichen:</b> rechteckig, rot.</li>
</ul>
<h3>5. Notfall und Brand</h3>
<ul>
<li><b>Notrufe:</b> 112 (Feuerwehr/Rettungsdienst), 110 (Polizei).</li>
<li><b>W-Fragen:</b> Wo ist es passiert? Was ist passiert? Wie viele Verletzte? Welche Verletzungen? Warten auf Rückfragen!</li>
<li><b>Bei Brand:</b> Ruhe bewahren, Brand melden, in Sicherheit bringen, Löschversuch unternehmen (nur ohne Eigengefährdung).</li>
<li><b>Brandklassen:</b> A feste Stoffe (Holz, Papier), B Flüssigkeiten (Benzin), C Gase, D Metalle, F Speiseöle und -fette.</li>
<li>Löschen: <b>mit dem Wind</b>, von vorne nach hinten, von unten nach oben, Tropf- und Fließbrände von oben nach unten. Lieber mehrere Löscher gleichzeitig statt nacheinander. Kein Wasser auf Fettbrand!</li>
</ul>`,
  questions: [
    {q:"Welche Berufsgenossenschaft ist für das Bewachungsgewerbe zuständig?", a:["Verwaltungs-Berufsgenossenschaft (VBG)","BG Bau","BG Verkehr","Keine"], c:[0], e:"Unternehmen der Sicherheitsdienstleistung sind bei der VBG versichert.", p:"SGB VII"},
    {q:"Wer zahlt die Beiträge zur gesetzlichen Unfallversicherung?", a:["Allein der Arbeitgeber","Der Arbeitnehmer allein","Arbeitgeber und Arbeitnehmer je zur Hälfte","Der Staat"], c:[0], e:"Die Beiträge zur Berufsgenossenschaft trägt allein der Unternehmer.", p:"§ 150 SGB VII"},
    {q:"Welche Ereignisse sind durch die gesetzliche Unfallversicherung abgedeckt? (mehrere richtig)", a:["Arbeitsunfälle","Wegeunfälle auf dem direkten Weg zur Arbeit","Berufskrankheiten","Unfälle beim privaten Skiurlaub"], c:[0,1,2], e:"Versichert sind Arbeitsunfälle, Wegeunfälle und Berufskrankheiten. Private Freizeitunfälle nicht.", p:"§§ 7, 8, 9 SGB VII"},
    {q:"Wann muss ein Arbeitsunfall der Berufsgenossenschaft gemeldet werden (Unfallanzeige)?", a:["Wenn der Versicherte getötet wird oder mehr als drei Tage arbeitsunfähig ist","Bei jedem Kratzer","Nur bei Todesfällen","Nur wenn der Arbeitnehmer es verlangt"], c:[0], e:"Eine Unfallanzeige ist zu erstatten, wenn der Versicherte stirbt oder mehr als drei Tage arbeitsunfähig wird.", p:"§ 193 SGB VII"},
    {q:"Welcher Arzt ist nach einem Arbeitsunfall mit Arbeitsunfähigkeit aufzusuchen?", a:["Der Durchgangsarzt (D-Arzt)","Der Hausarzt immer","Der Betriebsrat","Der Zahnarzt"], c:[0], e:"Bei Arbeitsunfähigkeit über den Unfalltag hinaus oder voraussichtlicher Behandlung über eine Woche ist ein Durchgangsarzt aufzusuchen.", p:"Vertrag Ärzte/Unfallversicherungsträger"},
    {q:"Wo werden Erste-Hilfe-Leistungen dokumentiert?", a:["Im Verbandbuch (Meldeblock)","Im Wachbuch des Kunden ohne Datum","Gar nicht","Nur mündlich beim Chef"], c:[0], e:"Jede Erste-Hilfe-Leistung ist zu dokumentieren und die Aufzeichnungen sind 5 Jahre aufzubewahren. Das ist wichtig für spätere Ansprüche.", p:"§ 24 Abs. 6 DGUV Vorschrift 1"},
    {q:"Wie oft muss der Unternehmer die Beschäftigten über Sicherheit und Gesundheitsschutz unterweisen?", a:["Vor Aufnahme der Tätigkeit und danach mindestens einmal jährlich","Einmal im Berufsleben","Alle fünf Jahre","Nur nach einem Unfall"], c:[0], e:"Unterweisungen erfolgen vor Beginn der Tätigkeit und wiederkehrend mindestens einmal jährlich. Sie sind zu dokumentieren.", p:"§ 4 DGUV Vorschrift 1"},
    {q:"Was regelt die DGUV Vorschrift 1?", a:["Grundsätze der Prävention","Wach- und Sicherungsdienste","Waffenrecht","Datenschutz"], c:[0], e:"Die DGUV Vorschrift 1 enthält die allgemeinen Grundsätze der Prävention für alle Betriebe.", p:"DGUV Vorschrift 1"},
    {q:"Was regelt die DGUV Vorschrift 23?", a:["Wach- und Sicherungsdienste","Grundsätze der Prävention","Bauarbeiten","Elektrische Anlagen"], c:[0], e:"Die DGUV Vorschrift 23 enthält spezielle Regeln für Wach- und Sicherungsdienste.", p:"DGUV Vorschrift 23"},
    {q:"Welche Pflichten haben Beschäftigte nach DGUV Vorschrift 1? (mehrere richtig)", a:["Persönliche Schutzausrüstung bestimmungsgemäß benutzen","Festgestellte Mängel und Gefahren unverzüglich melden","Sich nicht durch Alkohol oder Drogen in einen gefährlichen Zustand versetzen","Gefährdungsbeurteilung erstellen"], c:[0,1,2], e:"Die Gefährdungsbeurteilung ist Aufgabe des Unternehmers. Beschäftigte müssen mitwirken, Weisungen befolgen, PSA nutzen und Mängel melden.", p:"§§ 15, 16, 30 DGUV Vorschrift 1"},
    {q:"Wer muss die Gefährdungsbeurteilung durchführen?", a:["Der Unternehmer","Die Wachperson","Die Polizei","Der Kunde allein"], c:[0], e:"Der Unternehmer muss die Gefährdungen ermitteln, bewerten und Schutzmaßnahmen festlegen.", p:"§ 5 ArbSchG, § 3 DGUV Vorschrift 1"},
    {q:"Was müssen Wachpersonen bei Dunkelheit nach DGUV Vorschrift 23 mitführen?", a:["Eine geeignete Handleuchte (Taschenlampe)","Ein Fernglas","Eine Schusswaffe","Einen Hund"], c:[0], e:"Bei Dunkelheit müssen Wachpersonen eine geeignete Handleuchte mitführen.", p:"DGUV Vorschrift 23"},
    {q:"Wie kann die Sicherheit bei Alleinarbeit im Wachdienst gewährleistet werden? (mehrere richtig)", a:["Personen-Notsignal-Anlage (PNA)","Regelmäßige Kontrollanrufe bzw. Meldungen an die Zentrale","Funkverbindung zu einer ständig besetzten Stelle","Handy ausschalten, um nicht gestört zu werden"], c:[0,1,2], e:"Bei gefährlicher Alleinarbeit muss sichergestellt sein, dass im Notfall Hilfe kommt, z. B. durch PNA oder Meldesysteme.", p:"DGUV Vorschrift 23, DGUV Regel 112-139"},
    {q:"Welche Form und Farbe haben Verbotszeichen?", a:["Rund mit rotem Rand und Querbalken","Dreieckig gelb","Rechteckig grün","Rund blau"], c:[0], e:"Verbotszeichen sind rund, weiß mit rotem Rand und rotem Querbalken (z. B. „Rauchen verboten“).", p:"ASR A1.3, DIN EN ISO 7010"},
    {q:"Welche Form und Farbe haben Gebotszeichen?", a:["Rund, blau mit weißem Symbol","Dreieckig gelb","Rechteckig rot","Rund mit rotem Rand"], c:[0], e:"Gebotszeichen sind rund und blau (z. B. „Gehörschutz benutzen“).", p:"ASR A1.3"},
    {q:"Welche Form und Farbe haben Warnzeichen?", a:["Dreieckig, gelb mit schwarzem Rand","Rund, blau","Rechteckig, grün","Rechteckig, rot"], c:[0], e:"Warnzeichen sind gelbe Dreiecke mit schwarzem Rand (z. B. „Warnung vor elektrischer Spannung“).", p:"ASR A1.3"},
    {q:"Welche Farbe haben Rettungszeichen (z. B. Notausgang)?", a:["Grün","Rot","Blau","Gelb"], c:[0], e:"Rettungszeichen sind grün mit weißem Symbol und rechteckig oder quadratisch.", p:"ASR A1.3"},
    {q:"Welche Farbe haben Brandschutzzeichen (z. B. Feuerlöscher)?", a:["Rot","Grün","Blau","Gelb"], c:[0], e:"Brandschutzzeichen sind rot mit weißem Symbol (z. B. Feuerlöscher, Brandmelder).", p:"ASR A1.3"},
    {q:"Welche Notrufnummer erreicht Feuerwehr und Rettungsdienst?", a:["112","110","115","911"], c:[0], e:"112 ist der europaweite Notruf für Feuerwehr und Rettungsdienst. 110 ist die Polizei.", p:"Notrufnummern"},
    {q:"Welche Angaben gehören zu einer vollständigen Notfallmeldung (W-Fragen)? (mehrere richtig)", a:["Wo ist es passiert?","Was ist passiert?","Wie viele Verletzte?","Warum bin ich heute zu spät gekommen?"], c:[0,1,2], e:"W-Fragen: Wo, Was, Wie viele, Welche Verletzungen, Warten auf Rückfragen.", p:"Erste Hilfe / Notruf"},
    {q:"Warum soll man am Ende eines Notrufs auf Rückfragen warten?", a:["Damit die Leitstelle fehlende Infos erfragen kann und das Gespräch beendet","Weil es höflich ist","Um Kosten zu sparen","Damit die Polizei den Anrufer verhaften kann"], c:[0], e:"Die Leitstelle beendet das Gespräch. So können wichtige Informationen nachgefragt werden.", p:"Notruf"},
    {q:"Welche Brandklasse gilt für brennende Flüssigkeiten wie Benzin?", a:["B","A","C","D"], c:[0], e:"A = feste glutbildende Stoffe, B = flüssige oder flüssig werdende Stoffe, C = Gase, D = Metalle, F = Speiseöle/-fette.", p:"DIN EN 2"},
    {q:"Welche Brandklasse gilt für brennende Speiseöle und Fette?", a:["F","B","D","A"], c:[0], e:"Fettbrände (z. B. in Fritteusen) gehören zur Brandklasse F und brauchen spezielle Fettbrandlöscher. Niemals mit Wasser löschen!", p:"DIN EN 2"},
    {q:"Welche Brandklasse gilt für Holz, Papier und Textilien?", a:["A","B","C","F"], c:[0], e:"Brandklasse A umfasst feste Stoffe, die unter Glutbildung verbrennen.", p:"DIN EN 2"},
    {q:"Wie setzt man einen Feuerlöscher richtig ein? (mehrere richtig)", a:["Mit dem Wind löschen","Flächenbrände von vorne nach hinten ablöschen","Tropf- und Fließbrände von oben nach unten löschen","Gegen den Wind löschen"], c:[0,1,2], e:"Mit dem Wind, damit Löschmittel und Rauch nicht zurückkommen. Mehrere Löscher besser gleichzeitig einsetzen.", p:"Brandschutz-Grundregeln"},
    {q:"Was ist die richtige Reihenfolge im Brandfall?", a:["Ruhe bewahren – Brand melden – in Sicherheit bringen – Löschversuch unternehmen","Löschen – fliehen – melden","Fotografieren – melden – löschen","Fenster öffnen – warten"], c:[0], e:"Erst melden und Menschen retten, ein Löschversuch nur ohne Eigengefährdung.", p:"ASR A2.2"},
    {q:"Warum darf ein Fettbrand nicht mit Wasser gelöscht werden?", a:["Das Wasser verdampft schlagartig und schleudert brennendes Fett heraus (Fettexplosion)","Weil Wasser zu teuer ist","Weil Wasser den Brand nicht erreicht","Das ist erlaubt"], c:[0], e:"Wasser verdampft im heißen Fett explosionsartig. Es entsteht eine Stichflamme.", p:"Brandschutz"},
    {q:"Was gehört zur persönlichen Schutzausrüstung (PSA) im Wachdienst? (mehrere richtig)", a:["Sicherheitsschuhe, wenn erforderlich","Warnweste bei Tätigkeit im Verkehrsbereich","Stichschutzweste bei entsprechender Gefährdung","Eine Sonnenbrille aus Modegründen"], c:[0,1,2], e:"Die PSA richtet sich nach der Gefährdungsbeurteilung und wird vom Unternehmer kostenlos gestellt.", p:"§ 29 DGUV Vorschrift 1, PSA-BV"},
    {q:"Darf ein Wachmann mit Alkohol im Blut seinen Dienst antreten, wenn er sich „fit“ fühlt?", a:["Nein, er darf sich nicht in einen Zustand versetzen, in dem er sich oder andere gefährdet","Ja, bis 0,5 Promille","Ja, wenn er nicht fährt","Ja, nachts"], c:[0], e:"Beschäftigte dürfen sich durch Alkohol, Drogen oder Medikamente nicht in einen Zustand versetzen, der sie oder andere gefährdet. Viele Arbeitgeber haben ein absolutes Alkoholverbot.", p:"§ 15 Abs. 2 DGUV Vorschrift 1"},
    {q:"Welche Voraussetzung muss ein Diensthund im Wachdienst erfüllen?", a:["Er muss geprüft sein und von einem geeigneten, ausgebildeten Hundeführer geführt werden","Er muss groß sein","Er muss schwarz sein","Es gibt keine Voraussetzungen"], c:[0], e:"Nach DGUV Vorschrift 23 dürfen nur geprüfte Diensthunde mit geeigneten Hundeführern eingesetzt werden.", p:"DGUV Vorschrift 23"},
    {q:"Was gilt nach DGUV Vorschrift 23 für Wachpersonen mit Schusswaffen?", a:["Sie müssen sachkundig sein und regelmäßig an Schießübungen teilnehmen","Sie dürfen ohne Übung schießen","Sie dürfen die Waffe privat nutzen","Sie brauchen keine Unterweisung"], c:[0], e:"Wachpersonen mit Schusswaffen müssen im Umgang geübt sein und regelmäßig Schießübungen absolvieren.", p:"DGUV Vorschrift 23"},
    {q:"Was gilt für Wachpersonen in Bezug auf Tätigkeiten außerhalb des Wachauftrags?", a:["Sie dürfen keine gefährlichen Tätigkeiten übernehmen, für die sie nicht eingewiesen sind","Sie müssen alles machen, was der Kunde sagt","Sie dürfen Maschinen des Kunden bedienen, wenn niemand da ist","Sie müssen Reparaturen selbst durchführen"], c:[0], e:"Wachpersonen sollen nicht mit fremden, gefährlichen Arbeiten belastet werden, für die sie nicht qualifiziert sind.", p:"DGUV Vorschrift 23"},
    {q:"Was müssen Wachpersonen vor dem ersten Einsatz in einem neuen Objekt erhalten?", a:["Eine Einweisung in das Objekt und seine besonderen Gefahren","Einen Schlüssel für alle Räume","Eine Waffe","Nichts, sie sollen selbst schauen"], c:[0], e:"Wachpersonen müssen über die örtlichen Verhältnisse und Gefahren (z. B. Gefahrstoffe, Hochspannung, Hunde) eingewiesen werden.", p:"DGUV Vorschrift 23"},
    {q:"Ein Notausgang ist durch abgestellte Paletten versperrt. Was tust du?", a:["Mangel sofort beseitigen lassen bzw. melden und dokumentieren","Nichts, ist nicht dein Problem","Notausgang abschließen","Ein Foto machen und es posten"], c:[0], e:"Flucht- und Rettungswege müssen jederzeit frei sein. Mängel sind sofort zu melden und nach Möglichkeit abzustellen.", p:"§ 16 DGUV Vorschrift 1, ASR A2.3"},
    {q:"Warum sind Schreckschuss-, Reizstoff- und Signalwaffen bei Wach- und Sicherungsaufgaben nicht zulässig?", a:["Sie vermitteln ein trügerisches Sicherheitsgefühl und können bei bewaffneten Tätern zu einer extremen Gefährdung führen", "Weil sie zu teuer sind", "Weil sie zu laut sind", "Sie sind ausdrücklich erlaubt"], c:[0], e:"Ein Täter kann eine Schreckschusswaffe für eine scharfe Waffe halten und selbst schießen. Die Wachperson hat dann keine wirksame Verteidigung.", p:"DGUV Vorschrift 23"},
    {q:"Wie werden Schusswaffen nach DGUV Vorschrift 23 übergeben?", a:["Nur entladen; der Übernehmende prüft sofort selbst den Ladezustand", "Geladen, damit sie sofort einsatzbereit sind", "Durch Zuwerfen", "Ohne Kontrolle, wenn man sich kennt"], c:[0], e:"Bei der Übergabe passieren viele Unfälle. Laden und Entladen erfolgen auf einen Kugelfang, und jeder prüft den Ladezustand selbst.", p:"DGUV Vorschrift 23"},
    {q:"Wie oft müssen Dienstschusswaffen mindestens von einem Sachkundigen geprüft werden?", a:["Einmal jährlich, bei Verdacht auf Mängel sofort", "Alle zehn Jahre", "Nie", "Nur beim Kauf"], c:[0], e:"Es dürfen nur amtlich beschossene Waffen verwendet werden. Sie werden mindestens jährlich geprüft und nur von Berechtigten instand gesetzt.", p:"DGUV Vorschrift 23"},
    {q:"Was müssen Brillenträger im Wachdienst nach DGUV Vorschrift 23 beachten?", a:["Die Brille gegen Verlieren sichern oder eine Ersatzbrille mitführen", "Die Brille im Dienst abnehmen", "Nichts", "Nur Sonnenbrillen tragen"], c:[0], e:"Verliert eine Wachperson im Einsatz ihre Brille, kann sie sich und andere gefährden. Deshalb Sicherung oder Ersatzbrille.", p:"DGUV Vorschrift 23"},
    {q:"Was gilt für die Objekteinweisung einer Wachperson, die nachts eingesetzt wird?", a:["Sie wird zusätzlich bei Tageslicht in das Objekt eingewiesen", "Eine Einweisung ist nachts nicht nötig", "Sie bekommt nur einen Plan per E-Mail", "Sie weist sich selbst ein"], c:[0], e:"Gefahrstellen wie Gruben, Treppen oder Maschinen erkennt man bei Tageslicht besser. Die Einweisung wird regelmäßig wiederholt.", p:"DGUV Vorschrift 23"},
    {q:"Wann muss der Unternehmer die zu sichernden Objekte auf Gefahren überprüfen?", a:["Regelmäßig und bei besonderem Anlass unverzüglich, z. B. nach Umbauten", "Nur einmal bei Vertragsbeginn", "Nie, das macht der Kunde", "Nur nach einem Unfall"], c:[0], e:"Festgestellte Gefahren werden dokumentiert. Bis sie beseitigt sind, muss anders für die Sicherheit gesorgt werden. Wachpersonen melden Gefahren, die sie bemerken.", p:"DGUV Vorschrift 23"},
    {q:"Was gilt für Geldtransporte zu Fuß in öffentlich zugänglichen Bereichen in der Regel?", a:["Sie werden von mindestens zwei Personen durchgeführt, von denen eine sichert", "Eine Person reicht immer", "Sie sind verboten", "Sie dürfen nur nachts stattfinden"], c:[0], e:"Die zweite Person sichert den Träger. Ausnahmen gibt es z. B. bei nicht erkennbaren Transporten in unauffälliger Kleidung.", p:"DGUV Vorschrift 23"},
    {q:"An wen richtet sich Teil A der Brandschutzordnung?", a:["An alle Personen, die sich im Gebäude aufhalten (meist als Aushang)", "Nur an die Feuerwehr", "Nur an den Brandschutzbeauftragten", "Nur an Handwerker"], c:[0], e:"Teil A ist ein Aushang mit Verhaltensregeln für alle. Teil B richtet sich an Personen, die sich nicht nur vorübergehend im Gebäude aufhalten, Teil C an Personen mit besonderen Brandschutzaufgaben.", p:"DIN 14096"},
    {q:"Wie wirkt Wasser als Löschmittel hauptsächlich?", a:["Durch Abkühlen (Kühleffekt)", "Durch Ersticken", "Durch chemische Reaktion mit dem Metall", "Gar nicht"], c:[0], e:"Wasser entzieht dem Brand viel Wärme und eignet sich daher gut für feste Stoffe (Brandklasse A). Bei Fett- und Metallbränden ist es gefährlich.", p:"Brandschutz, DIN EN 2"},
    {q:"Welche Löschmittel wirken vor allem durch Ersticken? (mehrere richtig)", a:["Kohlendioxid (CO₂)", "Schaum", "Löschdecke", "Wasser"], c:[0, 1, 2], e:"Erstickend wirken Mittel, die den Sauerstoff vom Brand fernhalten oder verdrängen. Wasser wirkt vor allem kühlend.", p:"Brandschutz"}
  ]
});
