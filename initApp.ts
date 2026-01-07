
/**********************************************************
 * ### App specific part of the initiatlisation
 * non-core init
 **********************************************************/

// initApp.ts
import { log } from '@kuvali/core';

/**********************************************************
 * ### validate environment key settings
 * at start
 *********************************************************/
function validateEnv() {
  const requiredKeys = {
    SUPABASE_URL:                        process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY:                   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN: process.env.EXPO_PUBLIC_SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN,
    BUGSINK_KEY:                         process.env.EXPO_PUBLIC_BUGSINK_KEY,
  };

  Object.entries(requiredKeys).forEach(([name, value]) => {
    if (!value) {
      log.devFatal(
        `Missing variable in ".env" file: EXPO_PUBLIC_${name} is not defined.`,
        `Missing Environment Variable: EXPO_PUBLIC_${name} is not defined.`,
        'INIT'
      );
    }
  });
}

/**********************************************************
 * INIT APP
 *********************************************************/
export async function initApp() {
  log.debug("initApp: Starting application-specific setup...");

  try {
    // await notificationService.init();

    log.debug("initApp: Application setup complete.");
  } catch (error) {
    log.error("initApp: Failed to initialize app-specific parts", error);
    throw error;
  }
}

//### END #####################################################################