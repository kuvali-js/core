Best Practice 2026 (BP):

Zentraler Connectivity‑Store: nicht nur ein EventEmitter, sondern ein globaler Store (z. B. Zustand/Jotai) der den Status hält.

Services subscriben: DB‑Sync, Auth, API‑Clients hören auf diesen Store.

App‑weit: Wenn isConnected = false, werden Requests automatisch in eine Queue gelegt, Sync pausiert, Auth‑Refresh verschoben.

Reaktiv: Sobald isConnected = true, feuert der Store Events → Services starten Sync, Auth‑Refresh, etc.

👉 Damit wird „offline“ nicht nur ein Flag, sondern ein globaler Zustand, den alle Services respektieren.

SOTA/BP:

ConnectivityService liefert isConnected, isInternetReachable, type.

Dieser Status wird in einem globalen Store gespiegelt.

Alle Services (DB, Auth, API) prüfen diesen Store, bevor sie Aktionen ausführen.

Beispiel:

DB‑Sync: pausiert, wenn offline.

Auth: Token‑Refresh wird verschoben.

UI: zeigt Offline‑Banner oder cached Daten.

👉 Ergebnis: App‑weit konsistentes Verhalten, ohne dass jeder Service selbst NetInfo abfragen muss.

