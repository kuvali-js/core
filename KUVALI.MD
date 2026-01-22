// KUVALI.MD

# Kuvali - The React-Native Core Framework

---

### **The solid foundation for feature-complete, offline-first React Native mobile apps.**

---

This is an internal file with remarks about a lot of things.
It could help others to understand the framework and get fast up to date.

---

Sinn des Projektes ist es einen solide Basis für die Entwicklung von mobilen Apps mit React Native mit Expo zur Verfügung zu stellen. Die alle Pakete und Routinen installiert, initialisiert und direkt verwendbar macht. Dabei werden Abstraktionen nur verwendet, wenn es unbedingt notwendig ist. Und einen robusten Login Service und Benutzermanagement von Begin an zu haben.

---

## Accounts - where to find the project

|         |                     |                                               |
| ------- | ------------------- | --------------------------------------------- |
| github  | @kuvali-js          | https://github.com/kuvali-js/core             |
| webpage | @kuvali-js          | https://kuvali-js.github.io                   |
| npm     | @kuvali-js          | https://www.npmjs.com/package/@kuvali-js/core |
| proton  | kuvali-js           | https://mail.proton.me/                       |
| mail    | kuvali-js@proton.me | kuvali-js@proton.me                           |
| x       | kuvali_js           |                                               |

---

============================================================

#### Folder Structure

```
.
├── src/
│   ├── app/             # Expo Router screens and routing logic
│   │   ├── (tabs)/      # Main navigation tab group
│   │   └── _layout.tsx  # Root layout and app entry point (Expo Router)
│   ├── assets/              # Static assets (images, fonts, splash screen)
│   ├── components/      # Reusable UI components
│   ├── config/          # App-specific configs and core-framework extensions
│   ├── constants/       # App constants, themes, and static configurations
│   │   └── translations # translation files used by the i18n core service
│   ├── context/         # React context providers for state sharing
│   ├── databases/       #
│   │   ├── supabase     # additional configurations (used at init core)
│   │   └── watermelon   # additional configurations (used at init core)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # App-specific business logic and API clients
│   ├── store/           # Global state management (Joati, Zustand)
│   ├── App.tsx              # Core framework initialization & bootstrap bridge
│   ├── index.js             # Low-level entry point (registers main component)
│   └── initApp.ts       # App-level initialization (orchestrated by core)
│
├── .env/                # definition of environment variables
├── core/                # Kuvali framework (shared engine & base services)
├── lib/                 # Third-party wrappers or local vendor packages
├── scripts/             # Automation, deployment, and maintenance scripts
├── supabase/            # supabase cli configuration
├── tests/               # Test suites (unit, integration, e2e)
├── app.config.ts        # Application settings
├── package.json         # Project dependencies and scripts
└── tsconfig.json        # TypeScript configuration and path aliases
```

---

============================================================

# General Considerations

Providers for Theme, Auth, Localization
App Logic with Stores (Zustand/Jotai), Observables, React Query (TanStack)
Use of Event-driven Patterns through Services und Hooks.

---

Sinn des Projektes ist es einen solide Basis für die Entwicklung von mobilen Apps mit React Native mit Expo zur Verfügung zu stellen. Die alle Pakete und Routinen installiert, initialisiert und direkt verwendbar macht. Dabei werden Abstraktionen nur verwendet, wenn es unbedingt notwendig ist. Und einen robusten Login Service und Benutzermanagement von Begin an zu haben.

---

============================================================

# Naming of the Parts/Layers

- Core – The basic services described here.
- App  – The UI and business logic of the implemented app.
         Sometimes also refered to as src (where it lives) or shell.
- App  – Body and Core together.

---

============================================================

# Core Services

### Log Service

Logging & Error Management

Logs have different leves and will be stored in Watermelon DB depending on the set level.
Log messages bejond the set log level will be ignored.
Errors will be always sent to BugSink. Which is an external service (running in it's own container).

API: log.trace(), log.debug(), log.info(), log.warning(), log.error(), log.devFatal(), log.setLevel()

There is also a @Log decorator functionality to enhance the logs with the functions.
Eventually enabling performance measuring.

### Databse Service

Local databse to hold tables and data for offline‑first functionality and syncs data to cloud when online.

API:

### I18N

Multi language capabability through translation files, one for every languange supported.

API: t(), setLocale()

### Connectivity Service 

Signals status changes in the connection, on-line / off-line. 
Important for the offline first approach and to know the status of mobile or wifi connections.

API: connectionStatus(), checkEndpoint()

### StateService - todo

Statemanageent of the app with Zustand and Jotai.

### StorageService/SettingsService - todo

Persistent store of Key-Value pairs for configuration and app states.

API: get, set, remove, subscribe

---

============================================================

# Dependencies

```
LogService
├── LogLevel ─> DatabaseService   # storing the log messages
└─m Sentry ──── BugSink           # error management

i18nService
└─> LogService

DatabaseService
├─> LogService
└─m Watermelon

```
---

============================================================

# Implementation Details & Used Packages

### StateService

module: **Jotai**

Statemanageent of the app.

### Connectivity Service 

module: **React Native NetInfo**

Checks the (physical) connection by pinging to provided (default) endpoints.
Minimum one endpoint has to be set to perform the check.

### StorageService/SettingsService

module: **MMKV**

Persistent store of Key-Value pairs for configuration and app states.

### Logging & Error Management

module: **LogLevel**
module: **BugSink**

With a custom plugin and using a decorator.
Which sends error entries to BugSink.

### DatabseService

**WatermelonDB** stores complex data like lgs, records.

### I18N

module: ** modified [GitHub repository](https://github.com/WebDevSimplified/intl-crash-course)** of [WebDevSimplified](https://www.youtube.com/c/WebDevSimplified)

Extended implementation of webdev.simplyfied.

@todo - description of the (quite complex) versatile template string options

### SplashScreen

[LogRecket Create a SplashScreen descrition]($https://blog.logrocket.com/building-splash-screens-react-native/)

module: **react-native-bootsplash**

Using bootsplash for the SplashScreen.
Removed the native Expo SplashScreen.

The screens are stored in the assests/bootsplash folder.

THe bootsplash can create all necessary resoultions
and files for ios and android.
Command: `npx react-native generate-bootsplash logo.png`
Resolution 2732 x 2732 px
Main area 1200 x 1200 px
100 DPI

### App Icon

Using Expo’s built-in image processing.
Just put the file in assets/icon.png and
Expo is caring for it.
Command: `npx expo prebuild` (`npx expo prebuild --clean`)
Resolution 1024x1024 px

//### END #################################################
