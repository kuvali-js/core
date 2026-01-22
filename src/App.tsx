// 'app'/App.tsx'

import React, { useEffect, useState } from "react";
import BootSplash from "react-native-bootsplash";
import { ExpoRoot } from "expo-router";

/**********************************************************
 * ### core
 **********************************************************/
import { CoreProvider }              from "@kuvali-js/core";
import { initCore, type CoreConfig } from "@kuvali-js/core";
import { log }                       from "@kuvali-js/core";
import * as Sentry                   from "@sentry/react-native";


/**********************************************************
// Import app-specific DB definitions
*********************************************************/
import {
  appSchemas,
  DB_NAME,
  DB_VERSION,
} from "@/databases/watermelon/appSchemas";
import { appModels } from "@/databases/watermelon/models/index";


/**********************************************************
// Import app-specific connectivity api endpoint definitions 
*********************************************************/
import { appEndpoints } from "@/constants/connectivity/appEndpoints";


/**********************************************************
 * ### load translation files for every language
 *********************************************************/
import { en, sw } from "@/constants/translations/index";


/**********************************************************
 * ### application 
 *********************************************************/
import { initApp } from "@/initApp";

/**********************************************************
 * ### Mission Critical Settings.
 *********************************************************/
// register Expo/Metro routes
// load all files of the /app folder
const ctx = require.context("./app");

if (process.env.EXPO_PUBLIC_BUGSINK_KEY) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_BUGSINK_KEY,
    debug: false,
  });
}

/**********************************************************
 * ### Init & Config Core Modules
 **********************************************************/
export function App() {
  const [coreIsReady, setCoreIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        //-------------------------------------
        const coreConfig: CoreConfig = {
          connectivity: appEndpoints,
          i18n: { translations: [en, sw] },
          watermelon: {
            dbName: DB_NAME, // name of SQLite file on device
            version: DB_VERSION, // current schema version
            appModels: appModels, // app models
            appSchemas: appSchemas, // app table definitions
          },
        };

        log.setLevel("ERROR") //todo//remove// test
        
        // init all parts
        await initCore(coreConfig);   // core-specific
        await initApp();              // app-specific
        
        log.setLevel("DEBUG") //todo//remove// test
        console.log(">>> WAIT 5 sec") //todo//remove// test
        
        // slow down boot init to check bootsplash is working
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("<<<< WAIT 5 sec") //todo//remove// test
        
        //
      } catch (error) {
        log.error("Fatal error during bootstrap", error);
      } finally {
        setCoreIsReady(true);
      }
    }
    bootstrap();
    console.log("########################################################## \n App init successful \n################################################################")
    
  }, []);
  
  // Hide splashscreen after init is done
  useEffect(() => {
    const hideSplash = async () => {
      if (coreIsReady) {
        await BootSplash.hide({ fade: true });
        console.log("<<<< BOOTSPLASH HIDDEN") //todo//remove// test
      }
    };
    hideSplash();
  }, [coreIsReady]);

  // show splash screen during init
  if (!coreIsReady) {
    return null;
  }

  /**********************************************************
   * ### Gentlemen, start your App...
   **********************************************************/

  return (
    <CoreProvider>
      <ExpoRoot context={ctx} />
    </CoreProvider>
  );
} // export default function App()

export default Sentry.wrap(App);

//### END #####################################################################
