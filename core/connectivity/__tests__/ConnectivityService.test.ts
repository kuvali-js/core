// // '@kuvali-js/core/connectivity/__tests__/ConnectivityService.test.ts'
// //
// import NetInfo from "@react-native-community/netinfo";
// import { ConnectivityService, connectivityAtom } from "../ConnectivityService";
// import { getDefaultStore } from "jotai";
// //

// jest.mock("@sentry/react-native", () => ({
//   init: jest.fn(),
//   captureException: jest.fn(),
//   captureMessage: jest.fn(),
//   // füge hier weitere Sentry-Funktionen hinzu, falls der LogService sie nutzt
// }));

// // 1. Mock NetInfo
// jest.mock("@react-native-community/netinfo", () => ({
//   fetch: jest.fn(),
//   addEventListener: jest.fn(),
// }));

// // 2. Globaler Fetch Mock (für die Endpoints)
// global.fetch = jest.fn();

// describe("ConnectivityService", () => {
//   let store: any;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     store = getDefaultStore();
//     // Reset den Atom-Zustand für jeden Test
//     store.set(connectivityAtom, { isConnected: false, isReachable: false, connectionType: "unknown" });
//   });

//   test("should detect online -> offline change", async () => {
//     let listenerCallback: any;
    
//     // Simuliere die Registrierung des Listeners
//     (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
//       listenerCallback = cb;
//       return () => {};
//     });

//     // Init mit einem Test-Endpoint
//     await ConnectivityService.init([{ 
//       name: "Test", url: "https://test.com", default: true, 
//       description: "", reachable: false, lastChecked: 0, timeout: 60 
//     }]);

//     // --- Schritt 1: Simuliere ONLINE ---
//     (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
//     await listenerCallback({
//       isConnected: true,
//       isInternetReachable: true,
//       type: "wifi",
//       details: { ssid: "HomeOffice" }
//     });

//     expect(ConnectivityService.getStatus().isReachable).toBe(true);

//     // --- Schritt 2: Simuliere OFFLINE (Der eigentliche Test) ---
//     await listenerCallback({
//       isConnected: false,
//       isInternetReachable: false,
//       type: "none"
//     });

//     const status = ConnectivityService.getStatus();
//     expect(status.isConnected).toBe(false);
//     expect(status.isReachable).toBe(false);
//     expect(status.connectionType).toBe("none");
//   });

//   test("should verify reachability via active ping", async () => {
//     let listenerCallback: any;
//     (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
//       listenerCallback = cb;
//       return () => {};
//     });

//     await ConnectivityService.init([{ 
//       name: "PingTarget", url: "https://check.com", default: true, 
//       description: "", reachable: false, lastChecked: 0, timeout: 60 
//     }]);

//     // NetInfo sagt "verbunden", aber der Ping schlägt fehl (z.B. Hotel-WLAN ohne Login)
//     (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

//     await listenerCallback({
//       isConnected: true,
//       isInternetReachable: true,
//       type: "wifi"
//     });

//     const status = ConnectivityService.getStatus();
//     expect(status.isConnected).toBe(true);
//     expect(status.isReachable).toBe(false); // Wichtig! Trotz NetInfo-Connect muss Reachable false sein
//   });
// });