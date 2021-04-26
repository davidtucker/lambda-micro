# lambda-micro

![Build Status](https://github.com/davidtucker/lambda-micro/workflows/CICD/badge.svg) 
![Code Coverage](https://img.shields.io/codecov/c/github/davidtucker/lambda-micro)
![npm](https://img.shields.io/npm/v/lambda-micro)

Minimal microservices router for AWS Lambda

## Concepts

The Lambda Micro router takes two types of arguments: **matchers** and **handlers**. The matcher is used to determine if the handlers should be executed for a specific Lambda invocation.  The handlers are one or more functions that will be executed for that invocation.

### Matchers

The framework includes matchers, but you can also write your own. Here is an example of a matcher for an API Gateway HTTP API (Payload V2):

```javascript
const matcher = Matcher.HttpApiV2('GET', '/documents(/:id)');
```

In this case, this matcher is configured to receive an HTTP method (GET in this case) and a URL pattern (using the [url-pattern](https://github.com/snd/url-pattern) library).

You can also write your own matchers.  Matchers receive a `request` object, and must return either `true` or `false`. You can see the entire code for the HTTP API matcher below:

```javascript
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
```

You can see in this example that there is a function on the request object, `addRequestData` that enables the matcher to populate data on the request object that will be passed down to each of the handlers.  In this case, this is used to pass down the path variables to the handler functions.

### Handlers

Handler functions are executed if the matcher returns `true` (only the first route that has a matcher that returns `true` will be executed). 

Handler functions receive a `request` and `response` object. The `request` object includes the request data, (including the `event` and `context` for the Lambda invocation). The `response` object includes an output function that provides an easy way to create the required output format (based on the type of router that was configured).

```javascript
const doSomething = async (request, response) => {
  return response.output({
    message: 'Success'
  }, 200);
};
```

## Examples

### API Gateway - HTTP API (Payload V2)

```javascript
// Create a router
const router = createRouter(RouterType.HTTP_API_V2);

// Call a single function on a route
// The matcher takes the HTTP method and a URL pattern
router.add(Matcher.HttpApiV2('GET', '/service/'), getData);

// Use a path variable, and validate path variables with a JSON schema
router.add(
  Matcher.HttpApiV2('GET', '/service(/:id)'),
  validatePathVariables(pathVariablesSchema),
  getDocument,
);

// Handle a route with multipart form data
// Includes validation of the form data with a JSON schema
router.add(
  Matcher.HttpApiV2('POST', '/service/'),
  parseMultipartFormData,
  validateMultipartFormData(formDataSchema),
  createDocument,
);

// Handle a route that is passed JSON in the body
// Validate the body with a JSON schema
router.add(
  Matcher.HttpApiV2('PATCH', '/service(/:id)'),
  validateBodyJSONVariables(jsonBodySchema),
  updateDocument,
);

// Run the router in the handler function
exports.handler = async (event, context) => {
  return router.run(event, context);
};
```