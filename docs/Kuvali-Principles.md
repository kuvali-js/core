# Kuvali Principles

---

### **The solid foundation for feature-complete, offline-first React Native mobile apps.**

---

## 1. Vision & Mission: "It's that easy"
Der Kern von **Kuvali** ist es, eine solide, sofort einsatzbereite Basis für mobile Anwendungen mit **React Native und Expo** bereitzustellen. Anstatt bei jedem Projekt Infrastruktur-Entscheidungen neu zu treffen, bietet Kuvali eine vorkonfigurierte Umgebung, in der alle notwendigen Pakete bereits installiert, initialisiert und funktionsfähig sind.

Das Ziel ist eine professionelle Anwendung, die direkt nach der Installation ("out-of-the-box") über ein robustes User-Management, Logging und Offline-Funktionalität verfügt.

---

## 2. Was ist Kuvali?
* **An Opinionated Core:** Eine kuratierte Auswahl technischer Best Practices (SOTA), die optimal aufeinander abgestimmt sind.
* **Ein pragmatischer Monolith:** Wir priorisieren Stabilität und Geschwindigkeit gegenüber theoretischer Abstraktion. Der Core funktioniert als integriertes Ganzes.
* **Open-Source-Grundgerüst:** Ein Vorschlag an die Community, der zur Erweiterung und Mitgestaltung einlädt.
* **Production-Ready MVP:** Eine Basis, die bereits im MVP-Zustand alle unternehmenskritischen Funktionen mitbringt.

---

## 3. Technische Säulen (SOTA & Best Practices)
Kuvali setzt konsequent auf moderne Architekturmuster, um Komplexität zu reduzieren und die Developer Experience (DX) zu maximieren:

* **Offline-First:** Die App bleibt unabhängig vom Netzwerkstatus voll funktionsfähig.
* **Event-Driven & Reactive State:** Kommunikation über einen hybriden Ansatz aus **Jotai Atomen** (für den Zustand) und einem funktionalen **Object + EventEmitter** Modell (für flüchtige Events).
* **Functional Singletons:** Bevorzugung von Objekten gegenüber Klassen (wo technologisch möglich), um Speicher zu sparen und die Testbarkeit zu erhöhen.
* **Singleton over Provider:** Vermeidung der "Provider-Hölle". Zugriff auf Services erfolgt direkt über Singletons, React-Provider werden nur bei technischer Notwendigkeit (z. B. i18n) eingesetzt.
* **Test-Driven Development (TDD):** Integrierte Testroutinen sichern die Kernfunktionalität ab.
* **Dokumentation:** Klare Erklärungen aller Konfigurationsoptionen für eine schnelle Einarbeitung.

---

## 4. Implementierung & Struktur

### Modulare Aufteilung
* **`@kuvali-js/core`**: Die Business-Logik, Datenbank-Orchestrierung und Infrastruktur-Services.
* **`@kuvali-js/ui`**: Standardisierte UI-Komponenten des Cores (Login-Screens, Onboarding-Flows).

### Zentrale Komponenten
* **Zentrale Initialisierung:** Ein einziger Aufruf von `initCore()` in der `App.tsx` startet die gesamte Boot-Sequenz in der korrekten Reihenfolge.
* **Observability:** Einheitliches Logging (`Log.*level*()`) und Error-Management über eine zentrale **BugSink**.
* **IdentityService:** Ein Singleton-Service, der alle Informationen über den User, den Authentifizierungsstatus und Berechtigungen kapselt.
* **ABAC-Security:** Action-Based Access Control ermöglicht feingranulare Berechtigungen auf Aktionsebene statt starrer Rollen.
* **Modern Auth:** Fokus auf passwortlose Logins (OTP via SMS/WhatsApp), bereitgestellt durch Supabase.

---

## 5. Leitlinie: "Don't Reinvent the Wheel"
Wir erfinden Basisfunktionen nicht neu. Wir wählen die besten Pakete des Ökosystems aus, kümmern uns um deren nahtlose Integration und Initialisierung. Der Fokus liegt darauf, diese Komponenten für zukünftige Anwendungen so einfach und zentral wie möglich konfigurierbar zu machen.

---

## 6. Ausblick & Mitmachen
Kuvali soll wachsen. Die Vision ist ein hochgradig konfigurierbares System, bei dem Entwickler bei der Installation zwischen verschiedenen Optionen (z. B. Datenbanken, Logging-Providern) wählen können. Features sollen über einfache **Toggles** im Core aktiviert oder deaktiviert werden können.

Kuvali lebt von der Community. Die Principles sind ein stabiler Ausgangspunkt – wir laden jeden ein, neue Features beizusteuern, alternative Pakete zu prüfen und Schnittstellen zu verbessern.

**Contribute. Extend. Improve.**

