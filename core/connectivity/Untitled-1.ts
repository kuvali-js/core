// @kuvali-js/connectivity/ConnectivityService

/**********************************************************
 * ### ConnectivityService
 * Returns the status of the mobile or wifi connection.
 * Optimized for unreliable networks (active ping checks).
 *********************************************************/

//---------------------------------------
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { atom, createStore, useAtomValue } from "jotai";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

//---------------------------------------
// --- core
import { coreEndpoints } from "./coreEndpoints";
import { log } from "../log/LogService";

//---------------------------------------
export type ConnectionType =
  | "wifi"
  | "cellular"
  | "ethernet"
  | "unknown"
  | "none"
  | "bluetooth"
  | "vpn"
  | "other";

//---------------------------------------
export interface ConnectionStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  effectiveConnection: boolean;
  connectionType: ConnectionType;
  isConnectionExpensive?: boolean;
  signalStrength?: number | null;
  ssid?: string | null;
  bssid?: string | null;
  cellularGeneration?: string | null;
  carrier?:               string | null;
}

export interface EndpointStatus {
  name: string;
  reachable: boolean;
}

export interface Endpoint {
  name: string;
  url: string;
  reachable: boolean;
  lastChecked: number; // timestamp
  timeout: number; // seconds
  default: boolean; // check this endpoint at change offline->online
}

interface ConnectivityEvents {
  connectionChange: (status: ConnectionStatus) => void;
  endpointStatusChange: (status: EndpointStatus) => void;
  [event: string]: (...args: any[]) => void;
}

//---------------------------------------
export const connectivityAtom = atom<ConnectionStatus>({
  isConnected: false,
  isInternetReachable: false,
  effectiveConnection: false,
  connectionType: "unknown",
});

//---------------------------------------
// global store for framework-wide access 
const store = createStore();
// emitter for status changes
const emitter: TypedEmitter<ConnectivityEvents> = new EventEmitter() as TypedEmitter<ConnectivityEvents>;
// endpoint list to test
let endpoints: Endpoint[] = [];

//---------------------------------------
/**
 * Main initialization
 * We use async to ensure the first fetch is completed before continuing
 */
async function init(appEndpoints: Endpoint[]) {
  
  endpoints = [...coreEndpoints, ...appEndpoints];
  log.info("ConnectivityService initialized with endpoints", endpoints);

  // 1. Trigger initial fetch immediately (Fixes the "No Connection" hang on start)
  const initialState = await NetInfo.fetch();
  await updateStatus(initialState);

  // 2. Listen for future OS-level changes
  NetInfo.addEventListener((state: NetInfoState) => {
    updateStatus(state);
  });
}

/**
 * Internal logic to process NetInfoState and perform active pings if necessary
 */
async function updateStatus(state: NetInfoState) {
  
  // Base values from OS
  let reachable = state.isInternetReachable ?? false;

  // TANSANIA-FIX: If OS says "Connected via Wifi/Cellular" but "No Internet",
  // we don't trust it blindly and perform an active ping to the default endpoint.
  if (state.isConnected && !reachable) {
    const defaultEp = endpoints.find(e => e.default);
    if (defaultEp) {
      log.debug(`NetInfo reports no internet. Verifying via ${defaultEp.name}...`);
      const activeCheck = await testEndpoint(defaultEp.name, true);
      if (activeCheck) reachable = true;
    }
  }

  const newStatus: ConnectionStatus = {
    isConnected:            state.isConnected         ?? false,
    isInternetReachable:    reachable,
    effectiveConnection:   (state.isConnected         ?? false) && reachable,
    connectionType:         state.type as ConnectionType, 
    isConnectionExpensive:  state.details?.isConnectionExpensive, 
    signalStrength:         state.type === "wifi"     ? (state.details as any).strength    ?? null : null,
    ssid:                   state.type === "wifi"     ? (state.details as any).ssid        ?? null : null,
    bssid:                  state.type === "wifi"     ? (state.details as any).bssid       ?? null : null,
    cellularGeneration:     state.type === "cellular" ? (state.details as any).cellularGeneration ?? null : null,
    carrier:                state.type === "cellular" ? (state.details as any).carrier     ?? null : null,
  };

  const currentStatus = store.get(connectivityAtom); 
  
  // Prevent duplicate updates
  if (isEqual(newStatus, currentStatus)) return;
  
  store.set(connectivityAtom, newStatus);
  emitter.emit("connectionChange", newStatus);

  if (!newStatus.effectiveConnection) {
    log.info("Connectivity lost", newStatus);
  } else {
    log.info("Connectivity restored", newStatus);
    // Refresh all default endpoints to ensure services are up
    testEndpoints(true);
  }
}

//---------------------------------------
// Compare two status objects
function isEqual(a: ConnectionStatus, b: ConnectionStatus): boolean {
  return (
    a.isConnected           === b.isConnected &&
    a.isInternetReachable   === b.isInternetReachable &&
    a.effectiveConnection   === b.effectiveConnection &&
    a.connectionType        === b.connectionType &&
    a.isConnectionExpensive === b.isConnectionExpensive &&
    a.signalStrength        === b.signalStrength &&
    a.ssid                  === b.ssid &&
    a.bssid                 === b.bssid &&
    a.cellularGeneration    === b.cellularGeneration && 
    a.carrier               === b.carrier
  );
}

/**********************************************************
 * ### Returns combined status of check of all endpoints
 *********************************************************/
async function testEndpoints(defaultsOnly: boolean = true) {
  for (const ep of endpoints) {
    if (defaultsOnly && !ep.default) continue;
    await testEndpoint(ep.name);
  }
  return endpoints;
}

/**********************************************************
 * ### Returns endpoint reachability status
 *********************************************************/
async function testEndpoint(  
  name: string,
  force: boolean = false
): Promise<boolean | null> {

  const endpoint = endpoints.find((ep) => ep.name === name);
  if (!endpoint) {
    log.error(`Endpoint ${name} not found in list`);
    return null;
  }

  // Check cache
  const now = Date.now();
  const age = now - endpoint.lastChecked;
  if (
    !force && 
    endpoint.lastChecked > 0 && 
    age < endpoint.timeout * 1000) {
    log.debug(`Endpoint ${name} using cached result (age ${age}ms)`);
    return endpoint.reachable;
  }

  let reachable = false;
  try {
    // ABORT CONTROLLER: Prevents fetch from hanging indefinitely in slow networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

    const res = await fetch(endpoint.url, { 
        method: "HEAD",
        signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    reachable = res.ok;
    
  } catch (err) {
    log.debug(`Endpoint ${endpoint.name} unreachable or timeout`);
  }
  
  endpoint.lastChecked = now;
  endpoint.reachable   = reachable;

  log.trace(`Endpoint ${endpoint.name} url: "${endpoint.url}"`);
  log.debug(`Endpoint ${endpoint.name} reachable: ${reachable}`);
  
  const epStatus = { name: endpoint.name, reachable: endpoint.reachable };
  emitter.emit("endpointStatusChange", epStatus);
  
  return reachable;
}

/**********************************************************
 * ### Returns all status information
 *********************************************************/
function getStatus(): ConnectionStatus {
  return store.get(connectivityAtom);
}

//---------------------------------------
// Public API
export const ConnectivityService = {
  init,
  getStatus,
  testEndpoint,
  onConnectionChange: (cb: (s: ConnectionStatus) => void) => emitter.on("connectionChange", cb),
  offConnectionChange: (cb: (s: ConnectionStatus) => void) => emitter.off("connectionChange", cb),

  onEndpointStatusChangeByName: (name: string, cb: (s: EndpointStatus) => void) => {
    const handler = (status: EndpointStatus) => {
      if (status.name === name) cb(status);
    };
    emitter.on("endpointStatusChange", handler);
    return handler; 
  },

  offEndpointStatusChangeByName: (handler: (s: EndpointStatus) => void) => {
    emitter.off("endpointStatusChange", handler);
  },
};

/**********************************************************
 * ### Return the hook to access ConnectivityService 
 *********************************************************/
export function useConnection() {
  return useAtomValue(connectivityAtom);
}

//### END #################################################