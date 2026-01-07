// App.tsx
import React, { useEffect, useState } from 'react'
import { ExpoRoot } from 'expo-router'
import BootSplash from "react-native-bootsplash";

/**********************************************************
 * ### core
**********************************************************/
import { CoreProvider } from '@kuvali/core'
import { db, log, initCore, type CoreConfig } from '@kuvali/core';

// Import your app-specific DB definitions
import { appModels }  from './databases/watermelon/models/index';
import { appSchemas, DB_NAME, DB_VERSION } from './databases/watermelon/appSchemas';

import * as Sentry from '@sentry/react-native'

/**********************************************************
 * ### load translation files for every language
 **********************************************************
 *
 * @core-todo - add languages here once to have them globaly in the code and your app
 *
 *********************************************************/
import en from '@kuvali/translations/en'
import sw from '@kuvali/translations/sw'


/**********************************************************
 * ### application
 *********************************************************/
import { initApp } from './initApp'


/**********************************************************
 * ### Mission Critical Settings.
 *********************************************************/
// register Expo/Metro routes
const ctx = require.context('./app');

if (process.env.EXPO_PUBLIC_BUGSINK_KEY) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_BUGSINK_KEY,
    debug: __DEV__,
  });
}

/**********************************************************
 * ### Init & Config Core Modules
 **********************************************************/
export function App() {
  const [coreIsReady, setCoreIsReady] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {

        //-------------------------------------
        const coreConfig: CoreConfig = {
          i18n: { translations: [ en, sw ] },
          watermelon: {
            dbName:     DB_NAME,      // name of SQLite file on device
            appModels:  appModels,    // app models
            appSchemas: appSchemas,   // app table definitions
            version:    DB_VERSION    // current schema version
          },
          logLevel: __DEV__ ? 'DEBUG' : 'INFO',
        }

        // init all parts
        await initCore( coreConfig )
        await initApp()

      } catch (error) {
        log.error("Fatal error during bootstrap", error)
      } finally {
        setCoreIsReady(true)
      }
    }
  bootstrap();
  }, []);

  // Hide splashscreen after init is done
  useEffect(() => {
    const hideSplash = async () => {
      if (coreIsReady) {
        await BootSplash.hide({ fade: true });
      }
    };
    hideSplash();
  }, [ coreIsReady ]);


  // show splash screen during init
  if (!coreIsReady) { return null;  }

  /**********************************************************
   * ### Gentlemen, start your App...
   **********************************************************/

  return (
    <CoreProvider>
      <ExpoRoot context={ctx} />
    </CoreProvider>
  )

} // export default function App()

export default Sentry.wrap(App);

//### END #####################################################################