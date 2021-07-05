/**
 * Creates a formatted output for Amazon API Gateway HTTP API (payload v2).
 *
 * @param {(string|object)} content This is the content of the output.
 * It can be either a string (which will be output as text/plain) or an
 * object (which will be converted to a JSON string and sent as
 * application/json). You can override the Content-Type by using the headers
 * parameter.
 * @param {number} statusCode The HTTP status code to be returned with the
 * result.
 * @param {object} headers The headers to be sent with the response. If
 * Content-Type is not specified, it will be added to the response based
 * on the type of the content parameter.
 * @param {array} cookies The cookies to be included with the response.
 * @returns {object} The response formatted for Amazon API Gateway HTTP
 * API (payload v2).
 */
export const createOutput = (content, statusCode = 200, headers = {}, cookies = []) => {
  const isJSON = typeof content !== 'string';
  const outputHeaders = headers;

  if (isJSON && content) {
    outputHeaders['Content-Type'] = 'application/json';
  } else if (!isJSON && content) {
    outputHeaders['Content-Type'] = 'text/plain';
  }

  let bodyOutput;
  if (content) {
    bodyOutput = typeof content === 'string' ? content : JSON.stringify(content);
  }

  const output = {
    statusCode,
    body: bodyOutput,
    cookies,
    headers: outputHeaders,
    isBase64Encoded: false,
  };

  return output;
};
