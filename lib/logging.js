/* eslint-disable no-console */

export const LogLevel = Object.freeze({
  ERROR: 50,
  WARN: 40,
  INFO: 30,
  DEBUG: 20,
  TRACE: 10,
});

const DEFAULT_LOG_LEVEL = LogLevel.INFO;

const flattenObject = (obj, prefix = '') => {
  const result = Object.keys(obj).reduce((acc, k) => {
    const elementPrefix = prefix.length ? `${prefix}_` : '';
    if (obj[k] instanceof Error) {
      acc[`${elementPrefix}${k}`] = obj[k].toString();
    } else if (typeof obj[k] === 'object') {
      Object.assign(acc, flattenObject(obj[k], `${elementPrefix}${k}`));
    } else {
      acc[`${elementPrefix}${k}`] = obj[k];
    }
    return acc;
  }, {});
  return result;
};

// Get context for the function, this will need to only be done once for an
// invocation of a Lambda function
let functionContext;
const getFunctionContext = context => {
  if (!functionContext) {
    functionContext = {
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      functionMemorySize: context.memoryLimitInMB,
      functionARN: context.invokedFunctionArn,
    };
  }
  return functionContext;
};

const generateLoggingObject = (logLevel, event, context, message) => {
  // Create initial logging object
  let output = {
    logLevel,
    timestamp: new Date().getTime(),
    functionRequestId: context.awsRequestId,
    isColdStart: !global.isWarmStart,
    ...getFunctionContext(context),
  };

  // eslint-disable-next-line no-underscore-dangle
  const traceId = process.env._X_AMZN_TRACE_ID;
  if (traceId) {
    // Add in XRay Trace ID if present
    output.xrayTraceId = traceId;
  }

  // Add in flattened version of message parameter
  if (message && typeof message === 'object') {
    const flattenedMessage = flattenObject({ message });
    output = { ...output, ...flattenedMessage };
  } else if (typeof message === 'string') {
    try {
      const parsed = flattenObject({ message: JSON.parse(message) });
      output = { ...output, ...parsed };
    } catch (_) {
      output.message = message;
    }
  } else {
    throw new Error('Can only log objects and strings');
  }
  return output;
};

const getLoggingLevel = () => {
  if (!process.env.LOG_LEVEL && process.env.NODE_ENV === 'development') {
    return LogLevel.INFO;
  }
  if (process.env.LOG_LEVEL) {
    return Number.parseInt(process.env.LOG_LEVEL, 10);
  }
  return DEFAULT_LOG_LEVEL;
};

export const getLogger = (event, context) => {
  return {
    trace: value => {
      const level = getLoggingLevel();
      if (level <= LogLevel.TRACE) {
        console.trace(generateLoggingObject(LogLevel.TRACE, event, context, value));
      }
    },
    debug: value => {
      const level = getLoggingLevel();

      if (level <= LogLevel.DEBUG) {
        console.debug(generateLoggingObject(LogLevel.DEBUG, event, context, value));
      }
    },
    info: value => {
      const level = getLoggingLevel();

      if (level <= LogLevel.INFO) {
        console.info(generateLoggingObject(LogLevel.INFO, event, context, value));
      }
    },
    warn: value => {
      const level = getLoggingLevel();

      if (level <= LogLevel.WARN) {
        console.warn(generateLoggingObject(LogLevel.WARN, event, context, value));
      }
    },
    error: value => {
      const level = getLoggingLevel();
      if (level <= LogLevel.ERROR) {
        console.error(generateLoggingObject(LogLevel.ERROR, event, context, value));
      }
    },
  };
};

/* eslint-enable no-console */
