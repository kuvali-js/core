// @kuvali-js/connectivity/ConnectivityService

/**********************************************************
 * ### ConnectivityService
 * Returns the status of the mobile or wifi connection.
 * Optimized for unreliable networks (active ping checks).
 *********************************************************/

//---------------------------------------
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

//---------------------------------------
// --- core
import { coreEndpoints } from "./coreEndpoints";
import { log }  from "../log/LogService";

//---------------------------------------
export type ConnectionType = 
  | "wifi" 
  | "cellular" 
  | "ethernet" 
  | "unknown" 
  | "none" 
  | "bluetooth" 
  | "vpn" 
  | "other"
  
//---------------------------------------
export interface ConnectionStatus {
  isConnected:            boolean;
  isReachable:            boolean;
  connectionType:         ConnectionType;
  isConnectionExpensive?: boolean;
  signalStrength?:        number | null;
  ssid?:                  string | null;
  bssid?:                 string | null;
  cellularGeneration?:    string | null;
  carrier?:               string | null;
}

// used in event triggers 
export interface EndpointStatus {
  name:        string;
  reachable:   boolean;
}

// is set at init and stores the connection status
export interface Endpoint {
  name:        string;
  description: string;
  url:         string;
  reachable:   boolean;
  lastChecked: number;    // timestamp
  timeout:     number;    // seconds
  default:     boolean;   // true: check this endpoint at offline -> online change
}

interface ConnectivityEvents {
  connectionChange:     (status: ConnectionStatus) => void;
  endpointStatusChange: (status: EndpointStatus) => void;
  [event: string]:      (...args: any[]) => void;
}

//---------------------------------------
// minimal connection status values stored (per endpoint)
export const connectivityAtom = atom<ConnectionStatus>({
  isConnected:            false,
  isReachable:            false,
  connectionType:         "unknown",
});

//---------------------------------------
// global store for framework-wide access 
const store = getDefaultStore();
// emitter for status changes
const emitter: TypedEmitter<ConnectivityEvents> = new EventEmitter() as TypedEmitter<ConnectivityEvents>;
// endpoint list to test
let endpoints: Endpoint[] = [];


/**********************************************************
 * ### Initialize with API endpoints to check
 * using async to ensure the first fetch is completed before continuing
 *********************************************************/
async function init(appEndpoints: Endpoint[]) {
  
  //------------------------------
  endpoints = [...coreEndpoints, ...appEndpoints]
  
  // check minimum one endpoint is set
  // will run without endpoints.
  const hasDefault = endpoints.some(ep => ep.default);
  if (!hasDefault && endpoints.length > 0) {
    log.warn(
      "[ConnectivityService] Endpoints provided, but none marked as { default: true }. " +
      "Active reachability checks (Tanzania-Fix) will be skipped."
    );
  } else if (endpoints.length === 0) {
    log.info("[ConnectivityService] No endpoints provided. Operating in passive mode (NetInfo only).");
  }
  
  try {
    //------------------------------
    // update status to make sure correct states are set
    const initialState = await NetInfo.fetch();
    await updateStatus(initialState);
    
  } catch (error) {
    //------------------------------
    log.error("[ConnectivityService] Initial fetch failed", error);
    
    // fetch unsuccessful: set "safe-unknown" status
    store.set(connectivityAtom, {
      isConnected:    false,
      isReachable:    false,
      connectionType: "unknown",
    });
  } // catch
      
  //------------------------------
  // Listen/subscribe for future OS-level changes
  NetInfo.addEventListener((state: NetInfoState) => {
    updateStatus(state);
  });
  
  //------------------------------
  if (endpoints.length > 0) {
    log.debug(`[ConnectivityService] endpoints: "${endpoints.map(ep => ep.name).join('", "')}"}`);
  }
  log.info ("[ConnectivityService] initialized.")
} // init()


/**********************************************************
 * ### Checks NetInfo state and updates atom store
 * Internal logic to process NetInfoState 
 * and perform active pings if necessary
 * - 
 *********************************************************/
async function updateStatus(state: NetInfoState) {
  
  //------------------------------
  // connectivity status from NetInfo
  let reachable: boolean = state.isInternetReachable ?? false;

  //------------------------------
  // Actively check additionaly the default endpoints to be sure there is actually connection
  // Check if "Connected via Wifi/Cellular" the internet is actually working
  // (sets also in testEndpoint() the reachable status flag for the checked endpoints)
  if (state.isConnected) {
    const defaultEp = endpoints.find(e => e.default);
    if (defaultEp) {
      // there are default endpoints, check them
      log.debug(`[ConnectivityService] NetInfo reports connection. Verifying default endpoints...`);
      reachable = await testDefaultEndpoints()
    }
  }

  //------------------------------
  // set status values in Atom store
  const newState: ConnectionStatus = {
    isConnected:            state.isConnected         ?? false,
    isReachable:            reachable,
    connectionType:         state.type as ConnectionType, 
    isConnectionExpensive:  state.details?.isConnectionExpensive ?? undefined, 
    signalStrength:         state.type === "wifi"     ? state.details?.strength           ?? null : null,
    ssid:                   state.type === "wifi"     ? state.details?.ssid               ?? null : null,
    bssid:                  state.type === "wifi"     ? state.details?.bssid              ?? null : null,
    cellularGeneration:     state.type === "cellular" ? state.details?.cellularGeneration ?? null : null,
    carrier:                state.type === "cellular" ? state.details?.carrier            ?? null : null,

  };

  const currentstate = store.get(connectivityAtom); 
  if (isEqual(newState, currentstate)) return;      // Prevent costly or too many updates: only update if something really changed 
    
  //------------------------------
  // connection status changed
  store.set(connectivityAtom, newState);
  emitter.emit("connectionChange", newState);

  const connName = 
    newState.connectionType === "wifi"     
    ? `"${newState.ssid ?? ""}" ` 
    : newState.connectionType === "cellular" 
    ? `"${newState.carrier ?? ""}" ` 
    : ""

  log.info(`[ConnectivityService] ${newState.connectionType} connection ${connName}is ${ newState.isReachable ? "Online" : "Offline"}`);
  if (log.logLevelName() === "TRACE") {
    log.trace( dumpState(newState, currentstate) )   // trace connection values for debugging
  }
} // init()

//---------------------------------------
// Compare two status objects
// only report status changes if one of these values changes
function isEqual(a: ConnectionStatus, b: ConnectionStatus): boolean {
  return (
    a.isConnected           === b.isConnected &&
    a.isReachable           === b.isReachable &&
    a.connectionType        === b.connectionType &&
    a.ssid                  === b.ssid &&
    a.carrier               === b.carrier
    
    // these should not trigger a check of the physical connection
    // active if you need one of them
    //----------------------------------
    // a.isConnectionExpensive === b.isConnectionExpensive && 
    // a.signalStrength        === b.signalStrength &&
    // a.bssid                 === b.bssid &&
    // a.cellularGeneration    === b.cellularGeneration && 
  );
}

/**********************************************************
 * ### Log current and new connection state values
 * Writes the current and new connection state values as a table into the log
 *********************************************************/
function dumpState(newState: ConnectionStatus, currentState: ConnectionStatus) {
  const header = [
    "[ConnectivityService] Connection states:",
    "--------------------------",
    "value                 : current state    -> new state",
    "--------------------------",
  ].join("\n");

  // unify the keys from both objects
  const keys = Array.from(new Set([...Object.keys(currentState), ...Object.keys(newState)]));

  const rows = keys.map((key) => {
    const curVal = (currentState as any)[key]
    const newVal = (newState as any)[key]    
    const marker = curVal !== newVal ? " >> CHANGE <<" : "";
    const curStr = curVal === undefined ? "-" : JSON.stringify(curVal); 
    const newStr = newVal === undefined ? "-" : JSON.stringify(newVal);

    return `${key.padEnd(22)}: ${JSON.stringify(curStr).padEnd(18)} -> ${JSON.stringify(newStr).padEnd((18))} ${marker}`;
  });

  return header + "\n" + rows.join("\n");
}

/**********************************************************
 * ### Returns status of check of default endpoints
 * @sideeffect -  the connection status of each endpoint is set in testEndpoint() until an endpoint is reachable
 * @returns {boolean} - if one or none endpoint is reachable
 * - true:  after one endpoint was reached successfully
 * - false: when no endpoint was reachable   
 *********************************************************/
async function testDefaultEndpoints(): Promise<boolean> {
  for (const ep of endpoints) {
    await testEndpoint(ep.name, true)
    if (ep.reachable) return true
  }
  return false
}

/**********************************************************
 * ### Returns endpoints list after checking each endpoint
 * Checks all endpoints and returns the endpoints object 
 * @sideeffect -  the connection status of each endpoint is set in testEndpoint()
 * @returns - EndpointStatus[] with name and status of each endpoint.
 *********************************************************/
async function testEndpoints(): Promise<Endpoint[]> {
  for (const ep of endpoints) {
    await testEndpoint(ep.name)
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
async function testEndpoint(  
  name: string,
  force: boolean = false
): Promise<boolean | null> {

  //-------------------------------------
  const endpoint = endpoints.find((ep) => ep.name === name);
  if (!endpoint) {
    log.error(`[ConnectivityService] Endpoint ${name} not found in list`); //todo// should this be adevFatal
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
    log.debug(`[ConnectivityService] Return endpoint ${name} state using cached result (age ${age}ms)`);
    return endpoint.reachable
  }

  //-------------------------------------
  // perform check
  let reachable = false
  try {
    const res = await fetch(endpoint.url, { method: "HEAD" });
    reachable = res.ok;
    
  } catch (err) {
    log.error(`[ConnectivityService] Endpoint ${endpoint.name} error: `, err);
  }
  
  endpoint.lastChecked = now;
  endpoint.reachable   = reachable;

  log.debug(`[ConnectivityService] Endpoint ${endpoint.name} reachable: ${reachable}`);
  log.trace(`[ConnectivityService] Endpoint ${endpoint.name} url: "${endpoint.url}"`);
  
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