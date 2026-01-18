// core/log/index.js
import LogService from "./LogService";
export { Log } from "./LogDecorator";

// export the instanz as 'log' for easy access to log.info()
export const log = LogService;

// export ts-types
export type { LogLevelName } from "./LogService";
