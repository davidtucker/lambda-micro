import UrlPattern from 'url-pattern';

/**
 * Matches a request for HTTP API on API Gateway (payload V2).
 *
 * @param {string} method The HTTP method for the request. Wildcards may
 * not be used.
 * @param {*} urlPattern The URL pattern to match for.  This uses the format
 * from url-pattern and not the format used for API Gateway route config.
 * @returns
 * @see {@link https://github.com/snd/url-pattern|url-pattern}
 */
export const matcher = (method, urlPattern) => request => {
  // Is HTTP Context present
  const { event } = request;
  if (!event.requestContext || !event.requestContext.http) {
    return false;
  }
  const httpContext = event.requestContext.http;

  // Does Method match
  const { method: requestMethod, path } = httpContext;
  if (method.toLowerCase() !== requestMethod.toLowerCase()) {
    return false;
  }

  // Does URL Pattern match
  const pattern = new UrlPattern(urlPattern);
  const result = pattern.match(path);

  if (!result) {
    return false;
  }

  // Add path variables to the request object
  request.addRequestData('pathVariables', result);
  // It does match, return true
  return true;
};
