// core/initCore.ts

/**********************************************************
 * ### Init Core
**********************************************************/
import log  from './log/LogService'
import { i18n, type I18nConfig } from './i18n/I18nService'
import { db, type DatabaseConfig } from './databases/watermelon/DatabaseService';


//--- Types -----------------------------
export interface CoreConfig {
  i18n: I18nConfig;
  watermelon: DatabaseConfig;
  logLevel: string;
}

export async function initCore(coreConfig: CoreConfig) {
  //-------------------------------------
  // start logger first (Sentry & console are working now)
  await log.init()
  log.debug("App bootstrapping starting...")
  const logLevel = __DEV__ ? 'DEBUG' : 'INFO';
  log.setLevel(logLevel);

  //-------------------------------------
  // init (core) databases
  log.debug("init databaseService...")
  db.init(coreConfig.watermelon);

  const watermelon = db.getWatermelon();
  if (watermelon) {
    log.debug("Notify logService: Watermelon database can be accessed");
    log.setDatabase(watermelon);
    console.log("[GLOBAL] Notify logService it can access Watermelon database now");
  }


  //-------------------------------------
  try {

    //-----------------------------------
    log.debug("init i18nService...")
    await i18n.init(coreConfig.i18n)

    //-----------------------------------
    // log.debug("init identitiyService...")
    // await identitiyService.init();
    // log.setUserId(identitiyService.userId, identitiyService.role)

    //-----------------------------------
  } catch (error) {
    // log is working, even DB is not inititlized already
    log.error("Fatal error during bootstrap", error);
  } finally {
  }
} // initCore()

//### END #####################################################################