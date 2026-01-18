// 'src/constants/connectivity/coreEndpoints.ts'

import { type Endpoint } from "@kuvali-js/core";

/**********************************************************
// App-specific API endpoints for connectivity checks
*********************************************************/
export const appEndpoints = [
  {
    name: "google",
    url: "https://google.com/",
    reachable: false,
    lastChecked: 0,
    timeout: 36000, // 60 Minuten
    default: true,  // is checked at every offline→online change
  },
] as Endpoint[]

//### END #################################################