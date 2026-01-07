// core/log/LogDecorator.ts
import logService from './LogService';

//#############################################################################
//### DECORATOR
//#############################################################################

/******************************************************************************
* ### \@Log-Decorator factory
* Logs method calls,parameter, results.
* @param customName {string}
* the classname as argument to counter minification in productions logs.
 *****************************************************************************/
export function Log(customName?: string) {
  return function Log(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    return function (this: any, ...args: any[]) {

      //---------------------------------
      let className = customName || this?.constructor?.name || this?.name || 'GLOBAL';
      className = className.toUpperCase()
      const logger = logService.getLogger(className);
      logger.debug(`[${className}:${methodName}] called:`, args);

      //---------------------------------
      // handle error situations of catch blocks
      const handleError = (err: any, isAsync: boolean) => {
        const type = isAsync ? 'async ' : '';
        logger.error(`❌ [${className}:${methodName}] ${type}failed:`, err);

        logService.devFatal(
          `${type.toUpperCase()} error in ${methodName}: ${err?.message || err}`,
          `Graceful recovery from ${type}error in ${methodName}`,
          className
        );
        return null;
      };

      //---------------------------------
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result
            .then((res) => {
              logger.debug(`✅ [${className}:${methodName}] resolved:`, res);
              return res;
            })
            .catch((err) => handleError(err, true));
        }
        return result;
      } catch (err) {
        return handleError(err, false)
      }
    };
  }
}

//### END #####################################################################