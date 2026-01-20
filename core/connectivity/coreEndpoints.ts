// '@kuvali-js/core/connectivity/coreEndpoints.ts'

import { type Endpoint } from "@kuvali-js/core";

/**********************************************************
// Core-specific API endpoints for connectivity checks
*********************************************************/
export const coreEndpoints = [
  {
    // global default endpoint for connectivity check
    // google-connectivity 8.8.8.8 server
    name:         "core-heartbeat",
    description:  "(core heartbeat)",
    url:          "https://clients3.google.com/generate_204",
    reachable:    false,
    lastChecked:  0,
    timeout:      3600,  // 60 minutes
    default:      true,  // true: check at every offline→online change
  },
] as Endpoint[]

//### END #################################################