# @kuvali-js/core

![Status](https://img.shields.io/badge/status-alpha-orange?style=flat) [![githuub](https://img.shields.io/badge/github-kuvali--js/core-181717?style=flat)](https://github.com/kuvali-js/core) [![npm version](https://img.shields.io/npm/v/@kuvali-js/core.svg?style=flat)](https://www.npmjs.com/package/@kuvali-js/core) ![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat) [![Dependencies](https://img.shields.io/librariesio/release/npm/@kuvali-js/core)](https://libraries.io/npm/@kuvali-js/core) [![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/kuvali-js/core/blob/main/LICENSE)

[![Expo](https://img.shields.io/badge/Expo-4630EB?style=flat&logo=github)](https://github.com/expo/expo) [![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=flat&logo=github)](https://github.com/facebook/react-native) [![Jest](https://img.shields.io/badge/Jest-ffce00?style=flat&logo=github)](https://github.com/jestjs/jest) [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=github)](https://github.com/supabase/supabase) [![WatermelonDB](https://img.shields.io/badge/WatermelonDB-EE6E73?style=flat&logo=github)](https://github.com/Nozbe/WatermelonDB) [![LogLevel](https://img.shields.io/badge/LogLevel-000000?style=flat&logo=github)](https://github.com/pimterry/loglevel) [![BugSink](https://img.shields.io/badge/BugSink-FF0000?style=flat&logo=github)](https://github.com/bugsink/bugsink) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=github)](https://github.com/microsoft/TypeScript)

[![npm expo](https://img.shields.io/npm/v/expo.svg?style=flat&color=4630EB&label=expo&labelColor=4630EB&logo=npm)](https://www.npmjs.com/package/expo) [![npm react-native](https://img.shields.io/npm/v/react-native.svg?style=flat&color=61DAFB&label=react-native&labelColor=61DAFB&logo=npm)](https://www.npmjs.com/package/react-native) [![npm jest](https://img.shields.io/npm/v/jest.svg?style=flat&color=ffce00&label=jest&labelColor=ffce00&logo=npm)](https://www.npmjs.com/package/jest)(https://www.npmjs.com/package/jest) [![npm supabase](https://img.shields.io/npm/v/@supabase/supabase-js.svg?style=flat&color=3FCF8E&label=supabase&labelColor=3FCF8E&logo=npm)](https://www.npmjs.com/package/@supabase/supabase-js) [![npm watermelon](https://img.shields.io/npm/v/@nozbe/watermelondb.svg?style=flat&color=EE6E73&label=watermelondb&labelColor=EE6E73&logo=npm)](https://www.npmjs.com/package/@nozbe/watermelondb) [![npm loglevel](https://img.shields.io/npm/v/loglevel.svg?style=flat&color=000000&label=loglevel&labelColor=000000&logo=npm)](https://www.npmjs.com/package/loglevel) [![bugsink docker compose](https://img.shields.io/badge/docker--compose-FF0000?style=flat&label=bugsink&labelColor=FF0000&logo=docker)](https://www.bugsink.com/docs/installation/) [![TypeScript](https://img.shields.io/npm/v/typescript.svg?style=flat&color=3178C6&label=TypeScript&labelColor=3178C6&logo=npm)](https://www.npmjs.com/package/typescript)

---

### **The solid foundation for feature-complete, offline-first React Native mobile apps.**

---

⚠️ **Note: This project is currently in ALPHA.** The API is subject to change. We are working towards a stable foundation. Not recommended for production use yet, but we welcome early adopters and feedback!

---

## 🚀 Vision

Kuvali-js eliminates the repetitive boilerplate of mobile development. We provide an **opinionated, feature-complete core** that handles the "heavy lifting" so you can focus on building your app's unique features.

## 🧠 Our Philosophy (The Kuvali Way)

**"It's that easy."** 

Installing Kuvali gives you a robust, feature-complete mobile app that "just runs" — with professional logging, user management, and offline capabilities out-of-the-box. 

A single `initCore()` is all it takes to get your entire infrastructure running.

Kuvali isn't just a library; it's a technical manifesto for building resilient mobile applications. Our core principles are:

* **Offline-First by Design:** Data is always available; synchronization happens intelligently in the background.
* **Pragmatic Monolith:** Integrated services (Auth, DB, Network) that work together seamlessly instead of brittle, loose abstractions.
* **Zero-Config Start:** We handle the complex initialization of Best-of-Breed packages so you don't have to.

👉 **[Read our full Core Principles (Architecture & Philosophy)](./Kuvali-Principles.md)**
## ✨ Core Features (Roadmap)

Kuvali provides a pre-configured suite of services. Everything is initialized via a single `initCore()` call.

- ✅ **Connectivity (CS):** Smart network monitoring & request guarding.
- ✅ **Observability (Log):** Integrated Logging & Error Tracking (BugSink).
- ✅ **Offline-First Storage:** Powered by WatermelonDB with automatic sync.
- ✅ **Reactive Core:** Jotai-driven state with functional singletons.
- ✅ **i18n:** Robust multi-language support out-of-the-box.
- ✅ **Themes:** Centralized theme management and styling.
- 🏗️ **Identity Service:** ABAC-based security with OTP Auth (SMS/WhatsApp).
- 📅 **Sync-Engine:** Automated background data synchronization.
    
## 🤝 Join the Journey

Kuvali is built to grow. Our vision is a highly configurable system where you can toggle features or swap providers (DB, Logging, Auth) during installation to generate a stable, custom, and running application tailored to your needs.

**We invite you to contribute:**
* 💡 **Suggest Features:** What's missing for your MVP or App?
* 🛠️ **Refine the Core:** Help us optimize the initialization & interfaces.
* 📖 **Improve Docs:** Clearer explanations help everyone.

Kuvali lives from the community. Let's build the best foundation for mobile apps together.

**Contribute. Extend. Improve.**