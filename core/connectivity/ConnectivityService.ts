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
  isConnectionExpensive?: boolean | null;
  signalStrength?:        number  | null;
  ssid?:                  string  | null;
  bssid?:                 string  | null;
  cellularGeneration?:    string  | null;
  carrier?:               string  | null;
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
  connectionType:         "none",
  isConnectionExpensive:  null, 
  signalStrength:         null,
  ssid:                   null,
  bssid:                  null,
  cellularGeneration:     null,
  carrier:                null,
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
  log.setLevel("TRACE")
  
  //------------------------------
  endpoints = [...coreEndpoints, ...appEndpoints]
  
  // check minimum one endpoint is set
  // will run without endpoints.
  const hasDefault = endpoints.some(ep => ep.default);
  if (!hasDefault && endpoints.length > 0) {
    log.warn(
      "[INIT-ConnectivityService] Endpoints provided, but none marked as { default: true }. "
    );
  } else if (endpoints.length === 0) {
    log.info("[INIT-ConnectivityService] No endpoints provided. Operating in passive mode (NetInfo only).");
  }
  
  try {
    //------------------------------
    // update status to make sure correct states are set
    const initialState = await NetInfo.fetch();
    await updateStatus(initialState);
    
  } catch (error) {
    //------------------------------
    log.error("[INIT-ConnectivityService] Initial fetch failed", error);
    
    // fetch unsuccessful: set "safe-unknown" status
    store.set(connectivityAtom, {
      isConnected:    false,
      isReachable:    false,
      connectionType: "none",
    });
  } // catch
      
  //------------------------------
  // Listen/subscribe for future OS-level changes
  NetInfo.addEventListener((state: NetInfoState) => {
    log.debug("[ConnectivityService] NetInfo connection value change -> call updateStaus()...")
    updateStatus(state);
  });
  
  //------------------------------
  if (endpoints.length > 0) {
    log.debug(`[INIT-ConnectivityService] endpoints: "${endpoints.map(ep => ep.name).join('", "')}"}`);
  }
  log.info ("[INIT-ConnectivityService] initialized.")
} // init()


/**********************************************************
 * ### Checks NetInfo state and updates atom store
 * Internal logic to process NetInfoState 
 * and perform active pings if necessary
 * 
 *********************************************************/
async function updateStatus(state: NetInfoState) {
  
  log.debug(`[ConnectivityService] updateStatus called...`);
  if (log.logLevelName() === "TRACE") {
    log.debug( dumpState((state as any),(state as any)) )   // show connection values for deep debugging
  }
  
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
  } else {
    log.debug(`[ConnectivityService] No connected: not endpoint check performed.`);
  }

  //------------------------------
  // set status values in Atom store
  const newState: ConnectionStatus = {
    isConnected:            state.isConnected         ?? false,
    isReachable:            reachable,
    connectionType:         state.type as ConnectionType, 
    isConnectionExpensive:  state.details?.isConnectionExpensive ?? undefined, 
    //@ts-ignore
    signalStrength:         state.type === "wifi"     ? state.strength           ?? null : null,
    //@ts-ignore
    ssid:                   state.type === "wifi"     ? state.ssid               ?? null : null,
    //@ts-ignore
    bssid:                  state.type === "wifi"     ? state.bssid              ?? null : null,
    //@ts-ignore
    cellularGeneration:     state.type === "cellular" ? state.cellularGeneration ?? null : null,
    //@ts-ignore
    carrier:                state.type === "cellular" ? state.carrier            ?? null : null,

  };

  const currentstate = store.get(connectivityAtom); 
  const equal = isEqual(newState, currentstate)
  log.debug(`[ConnectivityService] equal? ${equal}`)
  if (equal) return;      // Prevent costly or too many updates: only update if something really changed 
  
  
  //------------------------------
  // connection status changed
  store.set(connectivityAtom, newState);
  emitter.emit("connectionChange", newState);

  log.debug(`[ConnectivityService] value(s) changed`)

  //TODO// check debug level (umber) to be less or equal TRACE, 
  // otherwise exit function without processing the string templates.
  const connType =
    newState.connectionType === "none"
    ? ""
    : newState.connectionType + " "

    const connName = 
    newState.connectionType === "wifi"     
    ? ( newState.ssid    !== null ? `"${newState.ssid}" ` : "" ) 
    : newState.connectionType === "cellular" 
    ? ( newState.carrier !== null ? `"${newState.carrier}" ` : "" ) 
    : ""

  log.info(`[ConnectivityService] ${connType}connection ${connName}is ${ newState.isReachable ? "online" : "offline"}`);
  if (log.logLevelName() === "TRACE") {
    log.debug( dumpState(newState, currentstate) )   // list connection values for deep debugging
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
  const footer = "---------------------------------------------------------\n"
  const header = [
    "[ConnectivityService] Connection states:",
    "---------------------------------------------------------",
    "value                 : current state      -> new state",
    "---------------------------------------------------------",
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

  return `${header} \n${rows.join("\n")} \n${footer}`
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
  if ( !force 
    && endpoint.lastChecked > 0 
    && age < endpoint.timeout * 1000
  ) {
    log.debug(`[ConnectivityService] Return endpoint ${name} state using cached result (age ${age}ms)`);
    return endpoint.reachable
  }
  
  //-------------------------------------
  // perform network check
  let reachable = false
  try {
    log.debug(`[ConnectivityService] check endpoint "${endpoint.name}"`);
    const res = await fetch(endpoint.url, { method: "HEAD" });    // "ping" check if the internet connection is actually working
    reachable = res.ok;
    
  } catch (err) {
    log.error(`[ConnectivityService] Endpoint "${endpoint.name}" error: `, err);
  }
  
  endpoint.lastChecked = now;
  endpoint.reachable   = reachable;

  log.debug(`[ConnectivityService] Endpoint "${endpoint.name}" reachable: ${reachable}`);
  if (log.logLevelName() === "TRACE") {
  log.debug(`[ConnectivityService] Endpoint "${endpoint.name}" url: "${endpoint.url}"`);
  }
  
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
  
  // returns unsubscribe function
  onConnectionChange: (cb: (s: ConnectionStatus) => void) => {
    emitter.on("connectionChange", cb);
    return () => emitter.off("connectionChange", cb);
  },
  // to be able to use a reference to unsubscribe
  offConnectionChange: (cb: (s: ConnectionStatus) => void) => emitter.off("connectionChange", cb),
  
  // returns unsubscribe function
  onEndpointStatusChangeByName: (name: string, cb: (s: EndpointStatus) => void) => {
    const handler = (status: EndpointStatus) => {
      if (status.name === name) cb(status);
    };
    emitter.on("endpointStatusChange", handler);
    return () => emitter.off("endpointStatusChange", handler); 
  },
  // to be able to use a reference to unsubscribe
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