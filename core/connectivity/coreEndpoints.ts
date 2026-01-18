// '@kuvali-js/core/connectivity/coreEndpoints.ts'

import { type Endpoint } from "@kuvali-js/core";

/**********************************************************
// Core-specific API endpoints for connectivity checks
*********************************************************/
export const coreEndpoints = [
  {
    name: "apple",
    url: "https://apple.com/",
    reachable: false,
    lastChecked: 0,
    timeout: 36000, // 60 Minuten
    default: true,  // is checked at every offline→online change
  },
] as Endpoint[]

//### END #################################################