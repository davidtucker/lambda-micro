import { Matcher } from '../..';

describe('Matchers', () => {
  describe('HTTP API Payload V2', () => {
    const matcher1 = Matcher.HttpApiV2('GET', '/home');
    const matcher2 = Matcher.HttpApiV2('POST', '/item(/:id)');

    const defaultAddRequestData = () => {};

    const createTestRequest = (method, path, addFunc = defaultAddRequestData) => {
      return {
        event: {
          requestContext: {
            http: {
              method,
              path,
            },
          },
        },
        addRequestData: addFunc,
      };
    };

    it('should properly match when method and path pattern match', () => {
      const testRequest = createTestRequest('GET', '/home');
      const result = matcher1(testRequest);
      expect(result).toStrictEqual(true);
    });

    it('should not match when method does not match', () => {
      const testRequest = createTestRequest('POST', '/home');
      const result = matcher1(testRequest);
      expect(result).toStrictEqual(false);
    });

    it('should not match when path does not match', () => {
      const testRequest = createTestRequest('GET', '/noMatch');
      const result = matcher1(testRequest);
      expect(result).toStrictEqual(false);
    });

    it('should not match when path and method do not match', () => {
      const testRequest = createTestRequest('POST', '/noMatch');
      const result = matcher1(testRequest);
      expect(result).toStrictEqual(false);
    });

    it('should match when using path variables', () => {
      const testRequest = createTestRequest('POST', '/item/1234');
      const result = matcher2(testRequest);
      expect(result).toStrictEqual(true);
    });

    it('should populate path variables on request', () => {
      let pathVars;
      const addFunc = (key, value) => {
        pathVars = value;
      };
      const testRequest = createTestRequest('POST', '/item/1234', addFunc);
      const result = matcher2(testRequest);
      expect(result).toStrictEqual(true);
      expect(pathVars).toHaveProperty('id');
      expect(pathVars.id).toStrictEqual('1234');
    });

    it('should fail when httpContext is not provided', () => {
      const testRequest = {
        event: {
          someOtherKey: {},
        },
      };
      const result = matcher2(testRequest);
      expect(result).toStrictEqual(false);
    });
  });
});
