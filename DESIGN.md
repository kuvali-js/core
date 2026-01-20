### Core Blueprint

#### Config

Store: jotai (default) | zustand.
Settings backend: mmkv (default) | asyncstorage.
DB: watermelon (default), abstrahiert über DatabaseService.

#### Core Modules

- store/: interfaces, jotai/, zustand/, factory.
- storage/: StorageService (MMKV/AsyncStorage adapters).
- db/: DatabaseService (Watermelon), models, schema.
- sync/: SyncService (TanStack Query integration).
- services/: AuthService, ConnectivityService, EncryptionService.
- hooks/: useAuth, useSettings, useConnectivity, useSyncedQuery.

- CoreStoreAdapter (Zustand/Jotai)
- StorageAdapter (MMKV/AsyncStorage)
- SyncService (TanStack Query ↔ Watermelon)


### Event‑driven architecture

Event‑driven Stores sind State‑Container, die nicht nur Werte halten, sondern aktiv auf externe Ereignisse reagieren—sie subscriben auf Quellen wie Netzwerkstatus, DB‑Replikation, Push‑Events oder Service‑Callbacks und aktualisieren ihren State daraus.

**Quelle → Event → Store:**

- ConnectivityService: Emittiert „online/offline“→Store setzt isOnline.
- DatabaseService (Watermelon): Emittiert „recordAdded/updated“→Store patcht Collections.
- AuthService: Emittiert „login/logout/tokenRefreshed“→Store aktualisiert user/session.

- **Services als Event‑Emitter**
Jeder Service feuert Events (onLogin, onNetworkChange, onSyncComplete).

- **Hooks als Subscriber**
Hooks (useAuth, useConnectivity) subscriben auf diese Events und liefern State an die UI.

- **Middleware/Adapters**
Logging, Persistenz, Security werden als Middleware/Wrapper implementiert, nicht fest in der Klasse.


### Core Store‑Adapter

Interface: CoreStore mit Methoden wie get, set, subscribe, select.
Implementierungen: CoreStoreZustand, CoreStoreJotai.
Config: storeEngine: 'zustand' | 'jotai'.
Exports: Gleiche Hook‑Signaturen (useAuth, useSettings, useConnectivity)—intern wird je nach Engine gemappt.
****
### Databse layer

Query für API‑Layer:

- useQuery/useMutation sprechen Supabase/HTTP an.
- On success/failure synchronisieren sie Watermelon (write‑through/write‑back).

Watermelon als Source of Truth lokal:
UI liest aus Watermelon (observables).

Query layer aktualisiert/invalidiert und triggert Replikation.

Core‑Hooks:

- useSyncedCollection(model)—subscribt Watermelon und nutzt Query für Sync.
- useServerSync()—koordiniert Pull/Push mit Supabase via Query.

Warum nicht ersetzen:

- Query ist kein Ersatz für eine lokale relationale DB.
- Watermelon deckt Offline‑First, Konfliktlösung und komplexe Schemas ab—Query ergänzt das als Netzwerk‑/Cache‑Layer.
