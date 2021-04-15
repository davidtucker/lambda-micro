import Ajv from 'ajv';

const ajv = new Ajv();

export const validatePathVariables = schema => {
  const validate = ajv.compile(schema);
  return (request, response) => {
    const isValid = validate(request.pathVariables);
    if (!isValid) {
      return response.output({ Errors: validate.errors }, 400);
    }
  };
};

export const validateBodyJSONVariables = schema => {
  const validate = ajv.compile(schema);
  return (request, response) => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(request.event.body);
    } catch (_) {
      request.logger.error({
        message: 'Cannot parse body as JSON',
        body: request.event.body,
      });
      return response.output({ Error: 'Cannot parse body as JSON' }, 400);
    }
    const isValid = validate(parsedBody);
    if (!isValid) {
      return response.output({ Errors: validate.errors }, 400);
    }
  };
};

export const validateMultipartFormData = schema => {
  const validate = ajv.compile(schema);
  return (request, response) => {
    const isValid = validate(request.formData);
    if (!isValid) {
      return response.output({ Errors: validate.errors }, 400);
    }
  };
};

export const validateObject = (schema, object) => {
  const validate = ajv.compile(schema);
  return {
    isValid: validate(object),
    errors: validate.errors,
  };
};
