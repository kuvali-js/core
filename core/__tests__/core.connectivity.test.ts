// '@kuvali-js/core/__tests__/core.connectivity.test.ts'

import { ConnectivityService, CoreProvider, useConnection } from "@kuvali-js/core";
import NetInfo from "@react-native-community/netinfo";
import { getDefaultStore } from "jotai";
import { ConnectionStatus, connectivityAtom } from "../connectivity/ConnectivityService";

//---------------------------------------
// Mock of NetInfo.fetch() call
let networkCallback: (state: any) => void = () => {};

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn((cb) => {
    networkCallback = cb; // trigger the event
    return () => console.log("NetInfo: unsubscribe called");
  }),
}));

// Mock Sentry to avoid side effects
jest.mock("@sentry/react-native", () => ({
  init:             jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb:    jest.fn(),
  setUser:          jest.fn(),
}));

//---------------------------------------
// init each test
const initialStatus: ConnectionStatus = {
  isConnected:            false,
  isReachable:            false,
  connectionType:         "none",
  isConnectionExpensive:  null, 
  signalStrength:         null,
  ssid:                   null,
  bssid:                  null,
  cellularGeneration:     null,
  carrier:                null,
};

beforeEach(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();

  // prevent change event trigger from reseting store values ;-)
  const initialFetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
  // reset Jotai default store 
  const store = getDefaultStore();
  store.set(connectivityAtom, initialStatus);
  // wait for event to trigger
  await new Promise(process.nextTick);
  initialFetchMock.mockRestore();
});

/**********************************************************
 * ### Run the High Level Integration Tests
 *********************************************************/
describe("ConnectivityService Integration", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //=============================================================================
  it("CS1001: isReachable should be FALSE when NOT connected to WiFi init", async () => {    
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected:          false,
      isInternetReachable:  false,
      type:                 "none",
    });
    // act
    await ConnectivityService.init([]);
    // assert
    const status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(false);
    expect(status.isReachable).toBe(false);
    expect(status.connectionType).toBe("none");
  });
  
  //=============================================================================
  it("CS1002: isReachable should be FALSE if connected to WIFI and internet NOT working during init", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected:          true,
      isInternetReachable:  true,
      type:                 "wifi",
      ssid:                 "Kivuli-HQ",
    });
    // act
    const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Forced Network Error"));
    await ConnectivityService.init([]);   // core sets a default endpoint 
    // assert
    const status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(true);
    expect(status.isReachable).toBe(false); 
    expect(fetchSpy).toHaveBeenCalled();
    // cleanup
    fetchSpy.mockRestore(); // important: clean up mock
  });
  
  //=============================================================================
  it("CS1003: isReachable should be TRUE if connected to WIFI and internet is working during init", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected:          true,
      isInternetReachable:  true,
      type:                 "wifi",
      ssid:                 "Kivuli-HQ",
    });
    // act
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    await ConnectivityService.init([]);   // core sets a default endpoint 
    // assert
    const status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(true);
    expect(status.isReachable).toBe(true); 
    expect(status.connectionType).toBe("wifi");
    expect(status.ssid).toBe("Kivuli-HQ");
    expect(fetchSpy).toHaveBeenCalled();
    // cleanup
    fetchSpy.mockRestore(); // important: clean up mock
  });
  
  //=============================================================================
  
  it("CS1004: isReachable should be TRUE when NetInfo triggers 'connected' event (connect to WIFI/network happened)", async () => {
    
    console.log(`--- INIT: start as offline ---`);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected:          false,
      isInternetReachable:  false,
      type:                 "none",
      details:              null,
    });
    // init
    await ConnectivityService.init([]);   // core sets a default endpoint 
    let status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(false);
    expect(status.isReachable).toBe(false);
    expect(status.connectionType).toBe("none");
    
    console.log(`|\n--- ACTION ---`);
    console.log(`trigger offline -> online: updateStatus() has to be called`);
    
    // mock the internet fetch() call returning OK
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    
    // wait for the comming status change ...
    let callbackCalled = false;
    const onStatusChanged = new Promise<void>((resolve, reject) => {
      // timeout to catch "event not fired".
      const timeoutId = setTimeout(() => {
        unsub(); 
        reject(new Error("[ConnectivityService][TEST-FAIL] Timeout - Das connectionChange Event wurde nicht gefeuert!"));
      }, 4000);
      
      const unsub = ConnectivityService.onConnectionChange((status) => {
        console.log(`[ConnectivityService][TEST-TRACE] Event received: connected: ${status.isConnected}, reachable: ${status.isReachable}`);
        if (status.isConnected && status.isReachable) {
          console.log(`[ConnectivityService][TEST-SUCCESS] confirmed: connected & reachable`);
          callbackCalled = true; 
          clearTimeout(timeoutId);
          unsub();
          resolve();
        }
      });
    });

    // simulate firing NetInfo network change event...
    networkCallback({
      isConnected:          true,
      isInternetReachable:  true,
      type:                 "wifi",
      ssid:                 "Kivuli-HQ",
    });
    //...wait for the promise and updateStatus to be finished
    await onStatusChanged;
    
    // asserts
    expect(callbackCalled).toBe(true);
    
    status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(true);
    expect(status.isReachable).toBe(true);
    expect(status.connectionType).toBe("wifi");
    expect(status.ssid).toBe("Kivuli-HQ");
    expect(fetchSpy).toHaveBeenCalled();
    // cleanup
    fetchSpy.mockRestore(); // important: clean up mock
  });
  
  //=============================================================================

  it("CS1005: isReachable should be FALSE when Wifi is connected but Ping fails", async () => {
    
    console.log(`--- INIT: start as online ---`);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected:          true,
      isInternetReachable:  true,
      type:                 "wifi",
      ssid:                 "Kivuli-HQ",
    });
    const initialFetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    await ConnectivityService.init([]); 
    initialFetchSpy.mockRestore(); // delete spy 

    console.log(`|\n--- ACTION: Wifi stays, Internet drops ---`);
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response);
    
    // wait for the comming status change ...
    let callbackCalled = false;
    const onStatusChanged = new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsub();
        reject(new Error("[ConnectivityService][TEST-FAIL] Timeout - Event wurde nicht gefeuert!"));
      }, 4000);

      const unsub = ConnectivityService.onConnectionChange((status) => {
        console.log(`[ConnectivityService][TEST-TRACE] Status Update: Reachable=${status.isReachable}`);
        
        // ATTENTION: we wait for isReachable to change to FALSE
        if (status.isConnected && !status.isReachable) {
          callbackCalled = true;
          clearTimeout(timeoutId);
          unsub();
          resolve();
        }
      });
    });

    // emulate NetInfo triggers a change, while isConnected stays true.
    networkCallback({
      isConnected:          true,
      isInternetReachable:  true, // NetInfo "thinks" it still is connected"
      type:                 "wifi",
      ssid:                 "Kivuli-HQ",
    });

    await onStatusChanged;
    
    // asserts
    const status = ConnectivityService.getStatus();
    expect(status.isConnected).toBe(true);
    expect(status.isReachable).toBe(false);     // main focus
    expect(status.connectionType).toBe("wifi");
    expect(status.ssid).toBe("Kivuli-HQ");
    expect(fetchSpy).toHaveBeenCalled();
    // cleanup
    fetchSpy.mockRestore();
  });
  
  
}) // describe(ConnectivityService Integration


//### END #################################################