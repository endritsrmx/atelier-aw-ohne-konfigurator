# Atelier AW – Website-Demonstration (statisch)

Reines HTML, CSS und JavaScript – ohne Framework, ohne Build-Schritt, ohne externe Dienste.
`index.html` lässt sich direkt im Browser öffnen oder auf jedem statischen Hosting (z. B. GitHub Pages, auch im Unterordner) betreiben.

## Dateistruktur

```
index.html              Startseite (Onepage: Hero, Anlässe, Geschichten, Ablauf, Konfigurator,
                        Atelier, Materialien, Beispielbilder, Fragen, Anfrage)
impressum.html          Impressum (mit Platzhaltern)
datenschutz.html        Datenschutz (mit Platzhaltern)
.nojekyll               GitHub Pages liefert alle Dateien unverändert aus
README.md               diese Datei

assets/css/styles.css   Schriften, Grundlagen, Zustände (Menü, Konfigurator, Formular, FAQ),
                        gerundete Fotos, Intro-Grundgerüst, Header «Metallblau mit Stahlkante»
                        (Abschnitt «Header», Höhe über --hd: 84 px Desktop, 72 px Handy),
                        Hover-Regeln (unten in der Datei)
assets/js/intro.js      Intro-Animation  ← Zeiten hier anpassen (siehe unten)
assets/js/app.js        Seitenlogik: Menü, aktive Navigation, Ablauf-Linien, Konfigurator,
                        Anfrageformular (Demo, kein Versand), FAQ
assets/fonts/           Cormorant Garamond und Source Sans 3 als WOFF2 (lokal) + Lizenzen (OFL)
assets/img/             Beispielbilder als WebP, je 1440 px und 720 px breit (-720.webp)
assets/logo/            Original-Logo schwarz und weiss (SVG, unverändert)
assets/icons/           Favicon (SVG, PNG 32 px) und Apple-Touch-Icon (180 px)
```

Die meisten Gestaltungswerte (Abstände, Farben, Schriftgrössen) stehen wie im Design-Projekt direkt im HTML.

### Konfigurator-Modell

Kissengehäuse mit zentralem Tourbillon, römischem Zahlenring und gekörntem Zifferblatt – als SVG direkt in `index.html`
(Vorder- und Rückseite im Abschnitt `#konfigurator`). Jede Auswahl ist eine eigene Ebene (`data-l="dial-smaragd"` usw.);
welche sichtbar ist, steuert `styles.css` über die Attribute am Element `#cfg` (Abschnitt «Konfigurator-Modell»).
Dort stehen auch die Tourbillon-Animationen: Käfig `aw-cage` (60 s pro Umdrehung) und Unruh `aw-balance` (0,42 s).
Ausserhalb des Sichtfelds und bei «Bewegung reduzieren» stehen sie still.

## Intro

Gesteuert von **`assets/js/intro.js`**. Ganz oben in der Datei steht die Tabelle `T` mit allen Zeiten in Sekunden:

```js
var T = {
  stageIn:  [0.00, 0.70], // Bühne blendet ein
  rim:      [0.10, 1.40], // Rand zeichnet sich um den Gehäuseboden
  disc:     [0.25, 1.30], // Gehäuseboden blendet ein
  screws:   [0.70, 1.40], // Schrauben erscheinen nacheinander
  line1:    [1.60, 3.00], // Gravur Zeile 1 («Für Anna»)
  line2:    [3.20, 4.35], // Gravur Zeile 2 (Datum)
  flip:     [4.80, 5.95], // Drehung zum Zifferblatt
  hands:    [5.40, 6.45], // Zeiger laufen auf 10:10
  tagline:  [6.00, 6.60], // «Jede Uhr ein Unikat.»
  progress: [0.20, 6.50], // Fortschrittslinie
  out:      [6.80, 7.90]  // Logo fliegt in den Header, Crossfade zur Startseite
};
```

- Jede Phase ist `[Beginn, Ende]`. Die Lücken zwischen den Phasen sind die ruhigen Stehmomente.
- Die Gesamtdauer ist `T.out[1]` (aktuell 7,9 s). Zum Verlängern oder Kürzen die nachfolgenden Werte gleichmässig verschieben.
- Darunter: `SHORT` (kurze Einblendung bei «Bewegung reduzieren», ca. 1 s), die Texte `LINE1`, `LINE2`, `TAGLINE` und die Fortschritts-Beschriftungen `LABELS` mit ihren Startzeiten.

Wann welche Version läuft, entscheidet ein kurzes Skript im `<head>` von `index.html`:

| Fall | Verhalten |
|---|---|
| erster Aufruf in der Browser-Sitzung | volles Intro (ca. 7,9 s), Knopf «Überspringen», Escape überspringt ebenfalls |
| weitere Aufrufe in derselben Sitzung | kein Intro (Merker `aw-intro-seen` im sessionStorage) |
| Systemeinstellung «Bewegung reduzieren» | nur kurze Einblendung des Logos |
| JavaScript deaktiviert | kein Intro, Seite sofort lesbar |

Zum erneuten Testen: neuen Tab/privates Fenster öffnen oder in der Konsole `sessionStorage.clear()` ausführen.

## Auf GitHub Pages veröffentlichen

1. Repository anlegen, z. B. `atelier-w-demo` (öffentlich).
2. **Add file → Upload files**: den *Inhalt* dieses Ordners hochladen (`index.html` muss oben im Repository liegen). Die versteckte Datei `.nojekyll` mitnehmen, falls sichtbar – sie ist optional.
3. **Settings → Pages**: «Deploy from a branch», Branch `main`, Ordner `/ (root)`.
4. Nach ein bis zwei Minuten: `https://BENUTZERNAME.github.io/atelier-w-demo/`

Alle Pfade sind relativ; die Seite läuft daher auch im Unterordner.

## Technik und Barrierefreiheit

- Animationen laufen über `transform` und `opacity`; Farbwechsel der SVG-Uhr sind kurze Überblendungen. Die Unschärfe beim Intro-Ausgang gibt es nur auf Geräten mit Maus/Trackpad.
- Hover-Effekte nur auf Geräten mit Maus/Trackpad (`@media (hover: hover) and (pointer: fine)`); auf Touch-Geräten gibt es stattdessen eine Rückmeldung beim Antippen (`:active`).
- Fotos: 9 px Rundung auf dem Handy, 12 px ab 768 px Breite; der Hover-Zoom wird von der Rundung abgeschnitten. Logo und Konfigurator-Uhr bleiben eckig.
- Skip-Link «Zum Inhalt», echte Buttons und Radio-Gruppen, Fehlermeldungen mit `aria-invalid`/`aria-describedby`, Live-Regionen für Statusmeldungen, `prefers-reduced-motion` wird respektiert.

## Grenzen der Demo

- Das Anfrageformular sendet nichts. Angaben bleiben nur im geöffneten Fenster; kein Backend, keine Cookies, kein localStorage. Nach «Demo-Anfrage abschliessen» erscheint eine Bestätigung auf der Seite.
- Die Logo-Datei im Formular wird weder gelesen noch hochgeladen; nur Dateiname und Typ werden angezeigt.
- `noindex, nofollow` ist gesetzt – vor einem Livegang bewusst ändern.
- Alle Fotografien sind Beispielbilder und keine Kundenaufträge.

## Offene Angaben (Platzhalter)

`[[RECHTSFORM]]`, `[[INHABER / VERTRETUNGSBERECHTIGTE PERSON]]`, `[[STRASSE UND HAUSNUMMER]]`, `[[PLZ UND ORT]]`, `[[E-MAIL]]`, `[[TELEFON]]`, `[[UID / MWST-STATUS]]`, `[[HANDELSREGISTER / FALLS ZUTREFFEND]]`, `[[DATENSCHUTZKONTAKT]]`, `[[HOSTINGANBIETER UND LAND]]`, `[[HOSTING-LOGS: ZWECK UND AUFBEWAHRUNG]]`, `[[STAND DER DATENSCHUTZERKLÄRUNG]]`

Impressum und Datenschutz vor einem Livebetrieb rechtlich prüfen lassen.
