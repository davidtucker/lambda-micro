/* eslint-disable no-console, no-underscore-dangle */

import { getLogger, LogLevel } from '..';

describe('core/logging.ts tests', () => {
  const message = 'Sample message';
  const xrayTraceId = 'xray-12345';

  const nestedObject = {
    n1: 'value',
  };

  const sampleMessageObject = {
    i1: 'level1 value',
    i2: nestedObject,
  };

  let spyTrace;
  let spyDebug;
  let spyInfo;
  let spyWarn;
  let spyError;

  beforeEach(() => {
    spyTrace = jest.spyOn(console, 'trace').mockImplementation();
    spyDebug = jest.spyOn(console, 'debug').mockImplementation();
    spyInfo = jest.spyOn(console, 'info').mockImplementation();
    spyWarn = jest.spyOn(console, 'warn').mockImplementation();
    spyError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
    delete process.env.LOG_SAMPLING_RATE;
  });

  const context = {
    functionName: 'sampleFunctionName',
    functionVersion: '2',
    memoryLimitInMB: '1024',
    invokedFunctionArn: 'arn:sample',
    awsRequestId: 'a1234',
  };

  const event = {};

  it('should generate a valid logger', () => {
    const logger = getLogger(event, context);
    expect.assertions(5);
    expect(typeof logger.trace).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should properly populate log level for trace', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    expect(console.trace).toHaveBeenCalledTimes(1);
    const result = spyTrace.mock.calls[0][0];
    expect(result.logLevel).toBe(LogLevel.TRACE);
  });

  it('should properly populate log level for debug', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.debug(message);
    expect(console.debug).toHaveBeenCalledTimes(1);
    const result = spyDebug.mock.calls[0][0];
    expect(result.logLevel).toBe(LogLevel.DEBUG);
  });

  it('should properly populate log level for info', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.info(message);
    expect(console.info).toHaveBeenCalledTimes(1);
    const result = spyInfo.mock.calls[0][0];
    expect(result.logLevel).toBe(LogLevel.INFO);
  });

  it('should properly populate log level for warn', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.warn(message);
    expect(console.warn).toHaveBeenCalledTimes(1);
    const result = spyWarn.mock.calls[0][0];
    expect(result.logLevel).toBe(LogLevel.WARN);
  });

  it('should properly populate log level for error', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.error(message);
    expect(console.error).toHaveBeenCalledTimes(1);
    const result = spyError.mock.calls[0][0];
    expect(result.logLevel).toBe(LogLevel.ERROR);
  });

  it('should properly X-ray Trace ID', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    process.env._X_AMZN_TRACE_ID = xrayTraceId;
    const logger = getLogger(event, context);
    logger.error(message);
    const result = spyError.mock.calls[0][0];
    expect(result.xrayTraceId).toBe(xrayTraceId);
    process.env._X_AMZN_TRACE_ID = undefined;
  });

  it('should flatten an object', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.error(sampleMessageObject);
    const result = spyError.mock.calls[0][0];
    expect(result.message_i1).toBe('level1 value');
    expect(result.message_i2_n1).toBe('value');
  });

  it('should flatten a JSON string', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.error(JSON.stringify(sampleMessageObject));
    const result = spyError.mock.calls[0][0];
    expect(result.message_i1).toBe('level1 value');
    expect(result.message_i2_n1).toBe('value');
  });

  it('should include a message string', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.error(message);
    const result = spyError.mock.calls[0][0];
    expect(result.message).toBe(message);
  });

  it('should throw an error when trying to log a function', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    expect(() => {
      logger.error(() => {});
    }).toThrow('Can only log objects and strings');
  });

  it('trace should not be called if log level does not want it', () => {
    process.env.LOG_LEVEL = LogLevel.ERROR.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('debug should not be called if log level does not want it', () => {
    process.env.LOG_LEVEL = LogLevel.ERROR.toString();
    const logger = getLogger(event, context);
    logger.debug(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('info should not be called if log level does not want it', () => {
    process.env.LOG_LEVEL = LogLevel.ERROR.toString();
    const logger = getLogger(event, context);
    logger.info(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('warn should not be called if log level does not want it', () => {
    process.env.LOG_LEVEL = LogLevel.ERROR.toString();
    const logger = getLogger(event, context);
    logger.warn(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('trace should be called (and everything higher) if log level is set to TRACE', () => {
    process.env.LOG_LEVEL = LogLevel.TRACE.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('debug should be called (and everything higher) if log level is set to DEBUG', () => {
    process.env.LOG_LEVEL = LogLevel.DEBUG.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('info should be called (and everything higher) if log level is set to INFO', () => {
    process.env.LOG_LEVEL = LogLevel.INFO.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('warn should be called (and everything higher) if log level is set to WARN', () => {
    process.env.LOG_LEVEL = LogLevel.WARN.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('error should be called (and everything higher) if log level is set to ERROR', () => {
    process.env.LOG_LEVEL = LogLevel.ERROR.toString();
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('development mode should properly set log level', () => {
    process.env.NODE_ENV = 'development';
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('default log level value', () => {
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('higher log level value should result in no logging', () => {
    process.env.LOG_LEVEL = '100';
    const logger = getLogger(event, context);
    logger.trace(message);
    logger.debug(message);
    logger.info(message);
    logger.warn(message);
    logger.error(message);
    expect(console.trace).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
  });
});

/* eslint-enable no-console, no-underscore-dangle */
