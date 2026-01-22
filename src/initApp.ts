// 'app'/initApp.ts'

/**********************************************************
 * ### App specific part of the initiatlisation
 * non-core init
 **********************************************************/

import { log } from "@kuvali-js/core";

/**********************************************************
 * INIT APP
 *********************************************************/
export async function initApp() {
  log.debug("initApp: Starting application-specific setup...");

  try {
    log.debug("initApp: Application setup complete.");
  } catch (error) {
    log.error("initApp: Failed to initialize app-specific parts", error);
    throw error;
  }
}

//### END #####################################################################
