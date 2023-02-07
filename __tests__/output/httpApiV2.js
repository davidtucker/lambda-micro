import Ajv from 'ajv';
import { OutputUtils } from '../..';

const ajv = new Ajv();

const outputSchema = {
  type: 'object',
  properties: {
    statusCode: {
      type: 'number',
      min: 100,
      max: 599,
    },
    body: {
      type: 'string',
    },
    cookies: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 2,
      },
    },
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
          minLength: 2,
        },
      },
      additionalProperties: true,
    },
    isBase64Encoded: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
};

let validator;

beforeEach(() => {
  validator = ajv.compile(outputSchema);
});

describe('Output', () => {
  describe('httpApiV2', () => {
    it('should return a correctly formatted output for string and status code', () => {
      const result = OutputUtils.HttpApiV2('output string', 200);
      expect(result.statusCode).toStrictEqual(200);
      expect(result.body).toStrictEqual('output string');
      expect(result).toBeDefined();
      const isValid = validator(result);
      expect(isValid).toStrictEqual(true);
      expect(validator.errors).toBeNull();
    });

    it('should return a correctly formatted output for JSON string and status code', () => {
      const outputObject = {
        errors: ['This is an error'],
        message: 'This is a message',
      };
      const result = OutputUtils.HttpApiV2(outputObject, 400);
      expect(result).toBeDefined();
      expect(result.statusCode).toStrictEqual(400);
      expect(result.body).toStrictEqual(JSON.stringify(outputObject));
      const isValid = validator(result);
      expect(isValid).toStrictEqual(true);
      expect(validator.errors).toBeNull();
    });

    it('should return 200 status code when not entered', () => {
      const outputObject = {
        errors: ['This is an error'],
        message: 'This is a message',
      };
      const result = OutputUtils.HttpApiV2(outputObject);
      expect(result).toBeDefined();
      expect(result.statusCode).toStrictEqual(200);
      expect(result.body).toStrictEqual(JSON.stringify(outputObject));
      const isValid = validator(result);
      expect(isValid).toStrictEqual(true);
      expect(validator.errors).toBeNull();
    });

    it('should return 200 status code and blank body with no arguments passed', () => {
      const result = OutputUtils.HttpApiV2();
      expect(result).toBeDefined();
      expect(result.statusCode).toStrictEqual(200);
      expect(result.body).toBeUndefined();
      const isValid = validator(result);
      expect(isValid).toStrictEqual(true);
      expect(validator.errors).toBeNull();
    });

    it('should return correct content-type when content-type passed', () => {
      const result = OutputUtils.HttpApiV2('', 200, {
        'Content-Type': 'text/html',
      });
      expect(result).toBeDefined();
      expect(result.statusCode).toStrictEqual(200);
      expect(result.headers['Content-Type']).toStrictEqual('text/html');
      const isValid = validator(result);
      expect(isValid).toStrictEqual(true);
      expect(validator.errors).toBeNull();
    });
  });
});
