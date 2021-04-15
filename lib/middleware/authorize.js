/*

  Pluralsight Serverless Development Path (https://tuck.cc/serverlessDev)
  Author: David Tucker (davidtucker.net)

  ---

  Authorize Middleware

  This file contains middleware functions to help with ensuring authorization
  for service calls.  This requires that a Cognito authorizer is used with an
  HTTP API via API Gateway.

*/

/**
 * Middleware used to enforce group membership before a service call can be
 * executed.
 *
 * @param {(string|string[])} accessGroups The groups that are required.
 * This function will check if there is any overlap between the user's groups
 * and these groups (in other words if one matches, it will succeed).
 * @returns void
 */
export const enforceGroupMembership = accessGroups => (request, response) => {
  // If access groups is not an array, make it a one element array
  let requiredGroups = accessGroups;
  if (!Array.isArray(accessGroups)) {
    requiredGroups = [accessGroups];
  }

  const { authorizer } = request.event.requestContext;
  if (!authorizer) {
    request.logger.error({
      message: 'Authorizer data not present in event. Authorizer might be missing from route.',
      event: request.event,
    });
    throw new Error('Authorizer data not present in request');
  }

  // Get (and possibly parse) user groups from authorizer
  let groups = authorizer.jwt.claims['cognito:groups'];
  if (!Array.isArray(groups)) {
    const parsedString = groups.replace(/['[\]]+/g, '');
    groups = parsedString.split(' ');
  }

  // Determine if we overlap between accessGroups and user groups
  const intersectionGroups = groups.filter(val => requiredGroups.includes(val));
  const isAuthorized = intersectionGroups.length > 0;

  // Return if not an overlap
  request.logger.info({
    requiredGroups,
    currentUserGroup: groups,
    message: 'Authentication Group Evaluation',
  });
  if (!isAuthorized) {
    return response.output('Unauthorized', 403);
  }
};
