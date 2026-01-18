// @kuvali-js/connectivity/ConnectivityService

/**********************************************************
 * ### ConnectivityService
 * Returns the status of the mobile or wifi connection.
 *********************************************************/

//---------------------------------------
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { atom, createStore } from "jotai";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

//---------------------------------------
// --- core
import { coreEndpoints } from "./coreEndpoints";
import log from "../log/LogService";

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
  isConnected:            boolean;
  isInternetReachable:    boolean;
  effectiveConnection:    boolean;
  connectionType:         ConnectionType;
  isConnectionExpensive?: boolean;
  signalStrength?:        number | null;
  ssid?:                  string | null;
  bssid?:                 string | null;
  cellularGeneration?:    string | null;
  carrier?:               string | null;
}

export interface EndpointStatus {
  name:        string;
  reachable:   boolean;
}

export interface Endpoint {
  name:        string;
  url:         string;
  reachable:   boolean;
  lastChecked: number;    // timestamp
  timeout:     number;    // seconds
  default:     boolean;   // check this endpoint at change offline->online
}

interface ConnectivityEvents {
  connectionChange:     (status: ConnectionStatus) => void;
  [event: string]:      (...args: any[]) => void;
}

//---------------------------------------
export const connectivityAtom = atom<ConnectionStatus>({
  isConnected:            false,
  isInternetReachable:    false,
  effectiveConnection:    false,
  connectionType:         "unknown",
});

//---------------------------------------
// global store for framework-wide access 
const store = createStore();
// emitter for status changes
const emitter: TypedEmitter<ConnectivityEvents> = new EventEmitter() as TypedEmitter<ConnectivityEvents>;
// endpoint list to test
let endpoints: Endpoint[] = [];

//---------------------------------------
// Initialize with API endpoints
function init(appEndpoints: Endpoint[]) {
  
  //------------------------------
  endpoints = [...coreEndpoints, ...appEndpoints]
  log.info("ConnectivityService initialized with endpoints", endpoints);

  NetInfo.addEventListener((state: NetInfoState) => {

    const newStatus: ConnectionStatus = {
      isConnected:            state.isConnected         ?? false,
      isInternetReachable:    state.isInternetReachable ?? false,
      effectiveConnection:   (state.isConnected         ?? false) && (state.isInternetReachable ?? false),
      connectionType:         state.type as ConnectionType, 
      isConnectionExpensive:  state.details?.isConnectionExpensive, 
      signalStrength:         state.type === "wifi"     ? state.details.strength           ?? null : null,
      ssid:                   state.type === "wifi"     ? state.details.ssid               ?? null : null,
      bssid:                  state.type === "wifi"     ? state.details.bssid              ?? null : null,
      cellularGeneration:     state.type === "cellular" ? state.details.cellularGeneration ?? null : null,
      carrier:                state.type === "cellular" ? state.details.carrier            ?? null : null,

    };

    const currentStatus = store.get(connectivityAtom); 
    
    // Prevent costly or too many updates: only update if something really changed 
    if (isEqual(newStatus, currentStatus)) return;
    
    store.set(connectivityAtom, newStatus);
    emitter.emit("connectionChange", newStatus);

    if (!newStatus.effectiveConnection) {
      log.info("Connectivity lost", newStatus);
    } else {
      log.info("Connectivity restored", newStatus);
      // Run default endpoint checks when connection is restored
      testEndpoints(true)
    }
  });
} // init()

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
 * Checks all endpoints and return an object with the name and status of each endpoint.
 * @returns - EndpointStatus[] with name and status of each endpoint.
 *********************************************************/
async function testEndpoints(onlyDefaults: boolean = true) {
  for (const ep of endpoints) {
    if (onlyDefaults && !ep.default) continue
    await testEndpointByName(ep.name)
  }
  return endpoints
}

/**********************************************************
 * ### Returns endpoint reachablility status
 * 
 * Check for the given endpoint:
 * - lastChecked not set: 
 *   -> perform and return status of api check
 * - lastChecked is set: 
 *   - timeout not expired -> return the reachable value
 *   - timeout expired     -> perform and return status of api check
 * 
 * @param name {string}
 * String with the Name of endpoint. Must be in the inital array of provided {name, url}
 * @param force {boolean}
 * When true, perform the endpoint check, otherwise default behavior.
 * 
 * @returns {boolean}
 * - true:  reachable
 * - false: not reachable
 * - null:  is not in the inital array of provided {name, url}
 *********************************************************/
async function testEndpointByName(  
  name: string,
  force: boolean = false
): Promise<boolean | null> {

  //-------------------------------------
  const endpoint = endpoints.find((ep) => ep.name === name);
  if (!endpoint) {
    log.error(`Endpoint ${name} not found in list`); //todo// should this be adevFatal
    return null;
  }

  //-------------------------------------
  // Check cache first
  const now = Date.now();
  const age = now - endpoint.lastChecked;
  if (
    !force && 
    endpoint.lastChecked > 0 && 
    age < endpoint.timeout * 1000) {
    log.debug(`Endpoint ${name} using cached result (age ${age}ms)`);
    return endpoint.reachable
  }

  //-------------------------------------
  // perform check
  let reachable = false
  try {
    const res = await fetch(endpoint.url, { method: "HEAD" });
    reachable = res.ok;
    
  } catch (err) {
    log.error(`Endpoint ${endpoint.name} unreachable`, err);
  }
  
  endpoint.lastChecked = now;
  endpoint.reachable   = reachable;

  log.trace(`Endpoint ${endpoint.name} url: "${endpoint.url}"`);
  log.debug(`Endpoint ${endpoint.name} reachable: ${reachable}`);
  
  const epStatus = { name: endpoint.name, reachable: endpoint.reachable }
  emitter.emit("endpointStatusChange", epStatus);
  
  return reachable;
}

/**********************************************************
 * ### Returs all status informations
 * @returns {ConnectionStatus object} with all status information
 *********************************************************/
function getStatus(): ConnectionStatus {
  return store.get(connectivityAtom);
}

//---------------------------------------
// Public API
export const ConnectivityService = {
  init,
  getStatus,
  testEndpointByName,
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


//### END #################################################