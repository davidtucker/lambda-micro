import {
  validatePathVariables,
  validateBodyJSONVariables,
  validateMultipartFormData,
  validateObject,
} from '../..';

describe('Validation Middleware', () => {
  describe('validatePathVariables', () => {
    const pathVariablesRequest = {
      pathVariables: {
        id: '12345',
      },
    };

    const pathVariablesSchema = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };

    it('should properly validate path variables', () => {
      const result = validatePathVariables(pathVariablesSchema)(pathVariablesRequest);
      expect(result).toBeUndefined();
    });

    it('should properly note invalid additional path variables', () => {
      let statusCode;
      let message;
      const response = {
        output: (outputMessage, outputStatusCode) => {
          statusCode = outputStatusCode;
          message = outputMessage;
        },
      };
      const request = pathVariablesRequest;
      request.pathVariables.anotherId = 'value';
      validatePathVariables(pathVariablesSchema)(request, response);
      expect(message.Errors).toBeDefined();
      expect(message.Errors.length).toStrictEqual(1);
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('validateBodyJSONVariables', () => {
    const bodyVariables = {
      var1: 'value1',
      var2: 'value2',
    };

    const bodyVariablesRequest = {
      event: {
        body: JSON.stringify(bodyVariables),
      },
      logger: {
        error: () => {},
      },
    };

    const bodyVariablesSchema = {
      type: 'object',
      properties: {
        var1: {
          type: 'string',
        },
        var2: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };

    it('should properly validate body variables', () => {
      const result = validateBodyJSONVariables(bodyVariablesSchema)(bodyVariablesRequest);
      expect(result).toBeUndefined();
    });

    it('should properly note invalid body variables', () => {
      let statusCode;
      let message;
      const response = {
        output: (outputMessage, outputStatusCode) => {
          statusCode = outputStatusCode;
          message = outputMessage;
        },
      };
      const request = bodyVariablesRequest;
      bodyVariables.var3 = 'value3';
      request.event.body = JSON.stringify(bodyVariables);
      validateBodyJSONVariables(bodyVariablesSchema)(request, response);
      expect(message.Errors).toBeDefined();
      expect(message.Errors.length).toStrictEqual(1);
      expect(statusCode).toStrictEqual(400);
    });

    it('should properly note invalid JSON string for body', () => {
      let statusCode;
      let message;
      const response = {
        output: (outputMessage, outputStatusCode) => {
          statusCode = outputStatusCode;
          message = outputMessage;
        },
      };
      const request = bodyVariablesRequest;
      request.event.body = 'INVALID JSON';
      validateBodyJSONVariables(bodyVariablesSchema)(request, response);
      expect(message.Error).toStrictEqual('Cannot parse body as JSON');
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('validateMultipartFormData', () => {
    const formDataRequest = {
      formData: {
        fields: {
          var1: 'value1',
          var2: 'value2',
        },
        files: [
          {
            id: '1234',
          },
        ],
      },
    };

    const formDataSchema = {
      type: 'object',
      properties: {
        fields: {
          type: 'object',
          properties: {
            var1: {
              type: 'string',
              minLength: 3,
            },
            var2: {
              type: 'string',
              minLength: 3,
            },
          },
          additionalProperties: false,
        },
        files: {
          type: 'array',
          minItems: 1,
          maxItems: 1,
        },
      },
      additionalProperties: false,
    };

    it('should properly validate path variables', () => {
      const result = validateMultipartFormData(formDataSchema)(formDataRequest);
      expect(result).toBeUndefined();
    });

    it('should properly note invalid additional form data variables', () => {
      let statusCode;
      let message;
      const response = {
        output: (outputMessage, outputStatusCode) => {
          statusCode = outputStatusCode;
          message = outputMessage;
        },
      };
      const request = formDataRequest;
      request.formData.fields.var3 = 'value3';
      validateMultipartFormData(formDataSchema)(request, response);
      expect(message.Errors).toBeDefined();
      expect(message.Errors.length).toStrictEqual(1);
      expect(statusCode).toStrictEqual(400);
    });
  });

  describe('validateObject', () => {
    const sampleObject = {
      sample: {
        id: '12345',
      },
    };

    const objectSchema = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };

    it('should properly return values when validation succeeds', () => {
      const result = validateObject(objectSchema, sampleObject.sample);
      expect(result.isValid).toStrictEqual(true);
      expect(result.errors).toBeNull();
    });

    it('should properly return values when validation fails', () => {
      sampleObject.sample.anotherId = 'value';
      const result = validateObject(objectSchema, sampleObject.sample);
      expect(result.isValid).toStrictEqual(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toStrictEqual(1);
    });
  });
});
