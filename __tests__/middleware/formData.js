import { promises as fs } from 'fs';
import path from 'path';
import FormData from 'form-data';
import { parseMultipartFormData } from '../..';

const filePath = path.join(__dirname, '..', 'fixtures', 'sample.txt');

const createFormData = async (isBase64Encoded = false) => {
  const formData = new FormData();
  formData.append('field1', 'value1');
  formData.append('field2', 'value2');
  const options = {};
  if (isBase64Encoded) {
    options.encoding = 'base64';
  }
  const file = await fs.readFile(filePath, options);
  formData.append('file', file, 'sample.txt');
  return formData;
};

describe('Parse multi-part form data', () => {
  const createRequest = async (isBase64Encoded = false) => {
    const formData = await createFormData();
    const request = {};
    request.event = {
      body: formData.getBuffer(),
      headers: formData.getHeaders(),
      isBase64Encoded,
    };
    return request;
  };

  it('should populate formData on request', async () => {
    const request = await createRequest();
    let outputData;
    let outputKey;
    request.addRequestData = (keyname, val) => {
      outputData = val;
      outputKey = keyname;
    };
    await parseMultipartFormData(request);
    expect(outputKey).toStrictEqual('formData');
    expect(outputData).toBeDefined();
  });

  it('should populate formData with uppercase Content Type header', async () => {
    const request = await createRequest();
    let outputData;
    let outputKey;
    request.addRequestData = (keyname, val) => {
      outputData = val;
      outputKey = keyname;
    };
    const { headers } = request.event;
    headers['Content-Type'] = headers['content-type'];
    delete headers['content-type'];
    request.event.headers = headers;
    await parseMultipartFormData(request);
    expect(outputKey).toStrictEqual('formData');
    expect(outputData).toBeDefined();
  });

  it('should populate formData with base64 encoding', async () => {
    let outputData;
    let outputKey;
    const request = await createRequest(true);
    request.addRequestData = (keyname, val) => {
      outputData = val;
      outputKey = keyname;
    };
    await parseMultipartFormData(request);
    expect(outputKey).toStrictEqual('formData');
    expect(outputData).toBeDefined();
  });

  it('should populate and have correct fields', async () => {
    const request = await createRequest();
    let outputData;
    request.addRequestData = (_, val) => {
      outputData = val;
    };
    await parseMultipartFormData(request);
    expect(outputData.fields).toBeDefined();
    expect(outputData.fields.field1).toStrictEqual('value1');
    expect(outputData.fields.field2).toStrictEqual('value2');
  });

  it('should populate file', async () => {
    const request = await createRequest();
    let outputData;
    request.addRequestData = (_, val) => {
      outputData = val;
    };
    await parseMultipartFormData(request);
    expect(outputData.files).toBeDefined();
    expect(outputData.files.length).toStrictEqual(1);
    expect(outputData.files[0].content).toStrictEqual(await fs.readFile(filePath));
    expect(outputData.files[0].fileName).toStrictEqual('sample.txt');
  });

  it('should throw error on malformed request', async () => {
    const request = await createRequest();
    request.event.body = request.event.body.slice(0, 100);
    request.addRequestData = () => {};
    await expect(async () => {
      await parseMultipartFormData(request);
    }).rejects.toThrowError();
  });
});
