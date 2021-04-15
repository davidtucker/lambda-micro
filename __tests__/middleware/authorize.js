import { enforceGroupMembership } from '../..';

describe('Authorize', () => {
  const defaultAddRequestData = () => {};
  const logger = {
    info: () => {},
    error: () => {},
  };

  const createTestRequest = (groups, addFunc = defaultAddRequestData) => {
    return {
      logger,
      event: {
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                'cognito:groups': `[${groups.join(' ')}]`,
              },
            },
          },
        },
      },
      addRequestData: addFunc,
    };
  };

  const createTestRequestArray = (groups, addFunc = defaultAddRequestData) => {
    return {
      logger,
      event: {
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                'cognito:groups': groups,
              },
            },
          },
        },
      },
      addRequestData: addFunc,
    };
  };

  const testResponse = {
    output: (content, statusCode) => {
      return statusCode;
    },
  };

  it('should properly return when including the correct single group', () => {
    const testRequest = createTestRequest(['admin']);
    const result = enforceGroupMembership('admin')(testRequest, testResponse);
    expect(result).toBeUndefined();
  });

  it('should properly return output when including the incorrect single group', () => {
    const testRequest = createTestRequest(['reader']);
    const result = enforceGroupMembership('admin')(testRequest, testResponse);
    expect(result).toStrictEqual(403);
  });

  it('should properly return nothing when including a single group when multiple groups are allowed', () => {
    const testRequest = createTestRequest(['reader', 'admin']);
    const result = enforceGroupMembership('admin')(testRequest, testResponse);
    expect(result).toBeUndefined();
  });

  it('should properly return output when including a single group that is not allowed when multiple groups are allowed', () => {
    const testRequest = createTestRequest(['reader', 'admin']);
    const result = enforceGroupMembership('something')(testRequest, testResponse);
    expect(result).toStrictEqual(403);
  });

  it('should properly throw error when authorizer data is not present', () => {
    const testRequest = createTestRequest(['admin']);
    delete testRequest.event.requestContext.authorizer;
    expect(() => {
      enforceGroupMembership('admin')(testRequest, testResponse);
    }).toThrow('Authorizer data not present in request');
  });

  it('should properly return nothing when including multiple groups when multiple groups are allowed', () => {
    const testRequest = createTestRequest(['reader', 'admin']);
    const result = enforceGroupMembership(['admin', 'editor'])(testRequest, testResponse);
    expect(result).toBeUndefined();
  });

  it('should properly return when including the correct single group with it delivered in an array format', () => {
    const testRequest = createTestRequestArray(['admin']);
    const result = enforceGroupMembership('admin')(testRequest, testResponse);
    expect(result).toBeUndefined();
  });
});
