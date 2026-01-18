// core/services/LogService.ts
//*****************************************************************************
/** ### Custom Plugin for LogLevel
 * Service class that handles application-wide logging and error handling,
 * ---
 * LogLevel class to add custom functions to LogLevel.
 *
 * 1. Plugin for logging to:
 * - send errors to BugSink (Sentry protocol)
 * - WatermelonDb for sync logs to clou
 *
 * 2. Defining @Log Decorator
 * To include in every call to get:
 * - function name
 * - class name
 * (or log this once at function entry and exit)
 * ---
 * Implements a buffer of log messages until init of database
 *****************************************************************************/

import { Platform } from "react-native";
import { version as appVersion } from "#/package.json";
import Constants from "expo-constants";
import React from "react";

import originalLog from "loglevel";

// --- database type & tables
import KuvaliLog from "../databases/watermelon/models/KuvaliLog";
import { type Database } from "@nozbe/watermelondb";

// -- error management
import * as Sentry from "@sentry/react-native";

//#############################################################################
//### LOGGING
//#############################################################################

// Log-Level as array
export const LOG_LEVEL_NAMES = [
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "SILENT",
] as const;
// get Log-Level as string
export type LogLevelName = (typeof LOG_LEVEL_NAMES)[number];

// Interface to extend loglevel type.
interface LogExtensions {
  getLevelName: (level: number) => LogLevelName;
  logLevelName: () => LogLevelName;
  logLevel: () => number;
  devFatal(message: string, context?: string): void;
  LOG_LEVEL_NAMES: typeof LOG_LEVEL_NAMES;
}

/** Interface of buffer  */
interface LogEntry {
  level: string;
  message: string;
  metadata: any;
}

//*****************************************************************************
/** ### LogLevel wrapper class
 * Service class that handles application-wide logging,
 * integrating with
 * - BugSink (Sentry protocol) for remote error tracking and
 * - WatermelonDB for local log persistence and then replicated to Supabase.
 *****************************************************************************/
class LogService {
  private isInitialized = false;

  // set default values to prevent null value in the db and Sentry
  private static readonly LOG_CONTEXT = "LOG-SERVICE"; // Context for the @Log decorator
  private sessionId: string = `gen-${Date.now()}`; // persistence between every call to log
  private userId: string = "anonymous"; // is set after IdentityService is initialised (eventually after init of LogService)
  private userRole: string = "role"; // is set after IdentityService is initialised (eventually after init of LogService)
  private isDbReady = false; // database/watermelon status
  private isFlushing = false; // flusching buffer into database after its init
  private logBuffer: LogEntry[] = []; // buffer of log messages prior to DB init
  private watermelon: Database | null = null; // watermelon db instance for logging

  constructor() {
    this.sessionId = Constants.sessionId || `id-${Date.now()}`;
    this.setupFactory(); // create the plugin for LogLevel
  }

  //***************************************************************************
  /** ### Initialise the session
   * Logs session, app and device data once:
   * - session,
   * - userid, role and
   * - device and app data
   ****************************************************************************/
  public async init() {
    if (this.isInitialized) return;

    //-----------------------------------
    const sessionHeader = {
      schemaVersion: 1, // metadata schema version
      sessionId: this.sessionId,
      user: {
        id: this.userId,
        role: this.userRole,
      },
      version: {
        app: appVersion,
        build: Platform.select({
          ios: Constants.expoConfig?.ios?.buildNumber,
          android: Constants.expoConfig?.android?.versionCode?.toString(),
        }),
        expo: Constants.expoConfig?.version,
        react: React.version,
        rn: `${Platform.constants?.reactNativeVersion?.major}.${Platform.constants?.reactNativeVersion?.minor}`,
      },
      device: {
        os: Platform.OS,
        osVersion: Platform.Version,
        model: Constants.deviceName,
      },
    };

    //-----------------------------------
    // Write common "Header"-metadata at start of session
    await this.persistToDatabase("SYSTEM", "Session Start", { sessionHeader });

    //-----------------------------------
    // set static data as tags in Sentry
    Sentry.setTags({
      sessionId: String(this.sessionId),
      os: String(sessionHeader.device.os),
      role: String(""),
      appVersion: String(sessionHeader.version.app),
      buildVersion: Platform.select({
        ios: String(Constants.expoConfig?.ios?.buildNumber),
        android: String(Constants.expoConfig?.android?.versionCode?.toString()),
      }),
      deviceOs: String(Platform.OS),
      deviceOsVersion: String(Platform.Version),
      deviceModel: String(Constants.deviceName ?? "unknown"),
    });

    this.isInitialized = true;
  }

  //***************************************************************************
  /** ### LogLevel Plugin
   * Extends the loglevel factory to inject metadata and
   * handle multi-channel output
   * - BugSink,
   * - WatermelonDB,
   * - Console
   ***************************************************************************/
  private setupFactory() {
    const originalFactory = originalLog.methodFactory;

    originalLog.methodFactory = (methodName, logLevel, loggerName) => {
      const rawMethod = originalFactory(methodName, logLevel, loggerName);

      // --- create standard meta data record ---
      return async (message, ...args) => {
        const context = loggerName ? String(loggerName) : "GLOBAL";
        const levelUpper = methodName.toUpperCase();

        // Standardize metadata
        const metadata = {
          schemaVersion: 1, // metadata schema version
          sessionId: this.sessionId,
          context: context,
          args: args, // the message(s) to be logged
        };

        // --- log errors to Bugsink ----
        if (levelUpper === "ERROR") {
          // Immediate remote report for errors
          const errorObject =
            message instanceof Error ? message : new Error(String(message));
          Sentry.captureException(errorObject, { extra: metadata });
          console.debug("Error logging to bugsink done.", message);
        }
        if (levelUpper !== "ERROR" && levelUpper !== "TRACE") {
          // prevent log overflow due to TRACE
          // --- put non-errors into BugSink/Sentry breadcrumns ---
          // Local buffer for non-errors
          Sentry.addBreadcrumb({
            category: "log",
            level: methodName as Sentry.SeverityLevel,
            message: String(message),
            data: metadata,
          });
          console.debug("Non-Error logging to bugsink done:", message);
        }

        // --- log every message in WatermelonDB for offline-first persistence
        await this.persistToDatabase(levelUpper, message, metadata);

        // --- Console Output -----------
        rawMethod(`[${context}] ${message}`, ...args);
      };
    };

    // Apply the factory changes !! important !! see LogLevel documentation.
    originalLog.setLevel(originalLog.getLevel());
  }

  /********************************************************
   * ### Batch write log messages to local database
   *******************************************************/
  private async writeBatchToDb(entries: LogEntry[]) {
    if (!this.watermelon) {
      console.warn(
        "[Kuvali:LogService] writeBatchToDb called without database instance.",
      );
      return;
    }

    try {
      await this.watermelon.write(async () => {
        const logCollection = this.watermelon!.get<KuvaliLog>("kuvali_logs");
        const models = entries.map((item) =>
          logCollection.prepareCreate((record) => {
            record.schemaVersion = item.metadata.schemaVersion;
            record.session_id = this.sessionId!;
            record.level = item.level;
            record.context = item.metadata.context ?? "GLOBAL";
            record.message = item.message;
            record.payload = JSON.stringify(item.metadata);
            record.created_at = Date.now();
          }),
        );
        await this.watermelon!.batch(...models);
      });
      console.debug("[Kuvali:LogService] Logging to local database done.");
    } catch (err) {
      // use console.error as fallback
      console.error("[Kuvali:LogService] Batch write failed:", err);
    }
  }

  /********************************************************
   * ### Write log entry to local device database
   * Log to WatermelonDB for offline-first persistence
   * ---
   * Before dabase init
   * Logs into buffer until database is initialized in the core.
   * Flushes all entries to db and clears buffer.
   *******************************************************/
  private async persistToDatabase(
    level:    string,
    message:  string,
    metadata: any,
  ) {
    if (!this.isDbReady || this.isFlushing) {
      this.logBuffer.push({ level, message, metadata });
      console.debug(
        "Logging into buffer until init of database/end of flushing.",
      );
      return;
    }
    await this.writeBatchToDb([{ level, message, metadata }]);
  }

  /********************************************************
   * ### Flush buffer into database
   * Write all elements in buffer to database and clear the buffer.
   * New items arriving while flushing are handelt the same way.
   * Until the buffer is empty.
   * ---
   * Temporal order of messages is kept intact this way and
   * no messages are written twice or are missing.
   *******************************************************/
  private async flushBuffer() {
    if (this.logBuffer.length === 0 || this.isFlushing) return;
    this.isFlushing = true;

    try {
      while (this.logBuffer.length > 0) {
        const snapshot = [...this.logBuffer];
        this.logBuffer = [];
        await this.writeBatchToDb(snapshot);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /********************************************************
   * ### Set database after it is initilized
   *******************************************************/
  public setDatabase(dbInstance: any) {
    if (!dbInstance) {
      this.devFatal(
        "LogService: Received null database instance!",
        "DB Init Error",
        "INIT",
      );
      return;
    }
    this.watermelon = dbInstance;
    this.isDbReady = true;
    console.debug("LogService: Database connected. Flushing buffer...");
    this.flushBuffer();
  }

  /**********************************************************
   * ### Get userId after init of IdentityServcie
   * Sets also the user role.
   **********************************************************/
  public setUserId(userId: string = "anonymous", role: string = "role") {
    this.userId = userId;
    this.userRole = role;

    if (userId) {
      Sentry.setUser({
        id:   userId,
        role: role,
      });

      Sentry.setTag("user_role", role);
      this.debug(`User identity set: ${userId} (${role})`);
    } else {
      Sentry.setUser(null);
      this.debug("User identity cleared.");
    }
  }

  //#############################################################################
  //### PUBLIC API
  //#############################################################################

  //*****************************************************************************
  /** ### Handle development errors
   * - dev:  fail with an error
   * - prod: log a warning and continue
   *****************************************************************************/
  public devFatal(
    devMessage: string,
    prodMessage: string,
    context?: string,
  ): void {
    if (__DEV__) {
      const fullMessage = `[Kuvali DX] ${context ? `${context}: ` : ""}${devMessage}`;
      throw new Error(fullMessage);
    } else {
      const fullMessage = `[Kuvali] ${context ? `${context}: ` : ""}${prodMessage}`;
      this.warn(fullMessage);
    }
  }

  /** * Method mapping using arrow functions to preserve lexical 'this' context.
   * This allows direct deconstruction: const { debug } = LogService;
   */
  public trace = (msg: any, ...args: any[]) => originalLog.trace(msg, ...args);
  public debug = (msg: any, ...args: any[]) => originalLog.debug(msg, ...args);
  public info  = (msg: any, ...args: any[]) => originalLog.info(msg, ...args);
  public warn  = (msg: any, ...args: any[]) => originalLog.warn(msg, ...args);
  public error = (msg: any, ...args: any[]) => originalLog.error(msg, ...args);

  public setLevel   = (level: originalLog.LogLevelDesc) => originalLog.setLevel(level);
  public getLevel   = () => originalLog.getLevel();
  public getLogger  = (name: string) => originalLog.getLogger(name);
  public getLoggers = () => originalLog.getLoggers();
} // class LogService

// Export as Singleton
const log = new LogService();
export default log;

//### END #####################################################################
