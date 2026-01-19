// '@kuvali-js/core/initCore.ts'

import { LogLevelDesc } from "loglevel";

/**********************************************************
 * ### Init Core
 **********************************************************/
import { log }            from "./log/LogService";
import { 
  ConnectivityService, 
  type Endpoint         } from "./connectivity/ConnectivityService";
import { 
  i18n, 
  type I18nConfig       } from "./i18n/I18nService";
import {
  db,                   // instance
  databaseService,      // service class
  type DatabaseConfig   } from "./databases/watermelon/DatabaseService";


/**********************************************************
 * ### validate environment key settings
 * at start
 *********************************************************/
function validateCoreEnv() {
  const requiredKeys = {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN:
      process.env.EXPO_PUBLIC_SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN,
    BUGSINK_KEY: process.env.EXPO_PUBLIC_BUGSINK_KEY,
  };

  Object.entries(requiredKeys).forEach(([name, value]) => {
    if (!value) {
      log.devFatal(
        `Missing variable in ".env" file: EXPO_PUBLIC_${name} is not defined.`,
        `Missing Environment Variable: EXPO_PUBLIC_${name} is not defined.`,
        "INIT",
      );
    }
  });
}

//--- Types -----------------------------
export interface CoreConfig {
  connectivity: Endpoint[];
  i18n:         I18nConfig;
  watermelon:   DatabaseConfig;
}

/**
 * Main initialization sequence for the Kuvali core framework
 */
export async function initCore(coreConfig: CoreConfig) {

  //-------------------------------------
  // Start logger first (Sentry & console are working now)
  await log.init();

  // Use DEBUG for dev, otherwise use the level provided in config
  const logLevel = __DEV__ ? "DEBUG" : log.getLevel();
  log.setLevel(logLevel);

  log.debug("initCore: Framework bootstrapping starting...");

  //-------------------------------------
  // Validate mission-critical environment variables
  validateCoreEnv();

  //-------------------------------------
  console.log("initCore: Initializing Connectivity...:");
  ConnectivityService.init(coreConfig.connectivity,)
  
  //-------------------------------------
  // Initialize database service
  log.debug("initCore: Initializing databaseService...");
  databaseService.init(coreConfig.watermelon);

  if (db) {
    log.debug("initCore: Watermelon database accessed, notifying logService");
    log.setDatabase(db);

    // Global log for external debugging visibility
    console.log(
      "[initCore] LogService notified: Watermelon database is now accessible",
    );
  }

  try {
    
    //-----------------------------------
    // Initialize i18nService
    log.debug("initCore: Initializing i18nService...");
    await i18n.init(coreConfig.i18n);
    
    //-----------------------------------
    // Future: Initialize Identity/Auth services
    // log.debug("Core: Initializing identityService...");
    
    //-----------------------------------
  } catch (error) {
    // Logger is operational even if core modules fail
    const errMsg = error instanceof Error ? error.message : String(error);

    log.devFatal(
      `Core Bootstrap failed: ${errMsg}`,
      `Fatal error during bootstrap: ${errMsg}`,
      "CORE_INIT",
    );
  }
} // initCore()

//### END #####################################################################
