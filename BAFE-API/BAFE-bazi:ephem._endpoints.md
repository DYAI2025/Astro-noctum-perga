 Basierend auf meiner Analyse der app.py-Datei kann ich feststellen, dass die Engine nicht
  explizit für die Ausgabe von nur Ephemeriden oder nur BaZi konfiguriert ist. Es gibt jedoch
  spezialisierte Endpunkte, die jeweils eine Hauptfunktion erfüllen:

  1. Nur BaZi-Ausgabe:

- Endpunkt: POST /calculate/bazi
- Eingabe: Datum, Zeitzone, Längen- und Breitengrad
- Ausgabe: Vier Säulen (Jahr, Monat, Tag, Stunde) mit detaillierten Informationen zu Stämmen,
     Zweigen, Tieren und Elementen

  1. Nur westliche Ephemeriden-Ausgabe:

- Endpunkt: POST /calculate/western
- Eingabe: Datum, Zeitzone, Längen- und Breitengrad
- Ausgabe: Vollständige westliche Ephemeriden mit:
  - Planetenpositionen (Länge, Breite, Entfernung, Geschwindigkeit)
  - Hauspositionen
  - Winkeln (Aszendent, MC, etc.)
  - Retrograd-Status

  1. Spezialisierte Endpunkte:

- `POST /calculate/wuxing`: Berechnet nur den Wu-Xing-Elementvektor aus westlichen Planeten
- `POST /calculate/tst`: Berechnet nur die wahre Sonnenzeit
- `GET /info/wuxing-mapping`: Gibt nur die Planet-zu-Element-Zuordnung aus

  1. Fusionsendpunkte:

- `POST /calculate/fusion`: Kombiniert westliche und östliche Systeme
- `POST /api/webhooks/chart`: Gibt vereinfachte westliche und östliche Informationen aus

  Fazit:

  Die Engine ist teilweise für spezialisierte Ausgaben konfiguriert:
