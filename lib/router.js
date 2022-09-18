/*

  Pluralsight Serverless Development Path (https://tuck.cc/serverlessDev)
  Author: David Tucker (davidtucker.net)

  ---

  Lambda Router

  This router handles sending requests to a specific function based on the
  HTTP method and a URL path (using the url-pattern library).  

*/
import { getLogger } from './logging';
import { OutputUtils } from './output';

/**
 * Enum for router type
 *
 * @readonly
 * @enum {Symbol}
 */
export const RouterType = Object.freeze({
  /** Router type for HTTP API (payload V2) */
  HTTP_API_V2: Symbol('httpApiV2'),
});

export const createRouter = type => {
  const _handlers = [];

  const add = (matcher, ...funcs) => {
    _handlers.push({
      matcher,
      funcs,
    });
  };

  const output = (content, statusCode, headers = {}, cookies = []) => {
    switch (type) {
      case RouterType.HTTP_API_V2:
        return OutputUtils.HttpApiV2(content, statusCode, headers, cookies);
      default:
        throw new Error('Undefined router type');
    }
  };

  // TODO - Add Logging hooks

  const run = async (event, context) => {
    const response = Object.freeze({
      output,
    });

    let request = {
      event,
      context,
      logger: getLogger(event, context),
    };

    request.addRequestData = (keyName, value) => {
      if (Object.prototype.hasOwnProperty.call(request, keyName)) {
        throw new Error('Property already present on request object');
      }
      request = {
        ...request,
        [keyName]: value,
      };
    };

    // Get first matching handler
    const matchedHandler = _handlers.find(handler => handler.matcher(request));

    if (!matchedHandler) {
      // No handler found
      return output('Not found', 404);
    }

    // Execute each handler
    for (let idx = 0; idx < matchedHandler.funcs.length; idx += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await matchedHandler.funcs[idx](request, response);
        // Return output if it is returned (will end handlers)
        if (result) {
          global.isWarmStart = true;
          return result;
        }
      } catch (error) {
        // Handler threw an error, so we need to return a 500 error
        // and log the error
        request.logger.error({ error });
        global.isWarmStart = true;
        return output('Internal server error', 500);
      }
    }
    // Functions did not return data
    request.logger.error({ message: 'Function did not return data' });
    global.isWarmStart = true;
    return output('Internal server error', 500);
  };

  return {
    add,
    run,
  };
};
