# Änderungsprotokoll - LMSRoomReservations Plugin

## Version 1.6.12

### Neue Funktionen

#### Öffnungszeiten-Abweichungen mit Koha-Kalender-Integration
Eine umfassende Verwaltung für Öffnungszeiten-Abweichungen wurde hinzugefügt:
- **Koha-Kalender-Integration**: Automatische Synchronisation mit dem Koha-Kalender-System
- **Ausnahmen definieren**: Individuelle Öffnungszeiten für besondere Tage (Feiertage, Veranstaltungen, etc.)
- **Zentrale Verwaltung**: Einheitliche Verwaltung von Öffnungszeiten und Ausnahmen
- **Konfliktprävention**: Automatische Berücksichtigung bei Raumbuchungen

#### Verpflichtende E-Mail-Benachrichtigungen im OPAC
Neue Option zur Durchsetzung von E-Mail-Benachrichtigungen für OPAC-Buchungen:
- **Konfigurierbar**: Per Raum aktivierbar
- **Transparenz**: Benutzer werden über erfolgreiche Buchungen zuverlässig informiert
- **Datenschutz**: Optional, kann für sensible Bereiche deaktiviert werden

#### OPAC-Migration zu Koha Pages
Die OPAC-Oberfläche wurde vollständig auf das moderne Koha Pages System migriert:
- Verbesserte Integration in das Koha-Ökosystem
- Automatische Seitenerstellung bei Plugin-Installation und -Upgrades
- Konsistentere Benutzererfahrung

### Verbesserungen

#### Datenintegrität
- **Foreign-Key-Schutz**: Implementierung von CASCADE ON UPDATE und ON DELETE zur Vermeidung von Dateninkonsistenzen
- **Referentielle Integrität**: Automatische Aktualisierung und Löschung abhängiger Datensätze bei Änderungen

#### Performance und Code-Qualität
- **Code Splitting**: Migration von Rollup zu Rolldown mit automatischer Code-Aufteilung
- **Gemeinsame Utilities**: Migration von Hilfsfunktionen zu einem gemeinsamen Submodul für bessere Wartbarkeit
- **Optimierte Bundles**: Reduzierte Ladezeiten durch intelligentes Code-Splitting

### Fehlerbehebungen

- **OPAC-Seitenerstellung**: Sicherstellung der korrekten Seitenerstellung bei Plugin-Upgrades
- **Foreign-Key-Violations**: Behebung von Integritätsproblemen in der Koha-Datenbank durch korrekte Cascade-Regeln

### Technische Änderungen

- Aktualisierung der deutschen Übersetzungen
- Hinzufügung von `Template::Plugin::Gettext` für String-Extraktion via xgettext-tt2
- Migration zu pders01/koha-plugin für verbessertes Projektmanagement
- Aktualisierung von koha-plugin-lmscloud-util
- Entfernung nicht verwendeter Abhängigkeiten und alter Rollup-Konfiguration
- Aktualisierung der staticapi auf neueste Upstream-Version
- Hinzufügung von Datenbankseeding für Testzwecke
- Reformatierung der Dokumentation und Behebung von Linter-Warnungen

### Dokumentation

- Hinzufügung von CHANGELOG.md
- Aktualisierung von README.md
- Verbesserung der Projektdokumentation

---

**Hinweis**: Diese Version enthält wichtige Verbesserungen zur Datenintegrität und neue Funktionen für die Verwaltung von Öffnungszeiten-Ausnahmen. Die Koha-Kalender-Integration ermöglicht eine nahtlose Abstimmung zwischen Bibliothekskalender und Raumbuchungssystem.
