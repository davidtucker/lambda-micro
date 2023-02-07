import Busboy from 'busboy';

export const parseMultipartFormData = async request => {
  const { event } = request;

  const formData = {
    files: [],
    fields: {},
  };

  const busboyHeaders = { ...request.headers };
  busboyHeaders['content-type'] = event.headers['content-type'] || event.headers['Content-Type'];

  const busboy = Busboy({ headers: busboyHeaders });

  return new Promise((resolve, reject) => {
    const buffers = [];
    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const userSubmittedFile = {};

      file.on('data', data => {
        if (data && data.length) {
          buffers.push(data);
        }
      });

      file.on('end', () => {
        if (buffers.length) {
          userSubmittedFile.content = Buffer.concat(buffers);
          userSubmittedFile.fileName = filename;
          userSubmittedFile.contentType = mimeType;
          userSubmittedFile.encoding = encoding;
          userSubmittedFile.fieldName = name;
          formData.files.push(userSubmittedFile);
        }
      });
    });

    busboy.on('field', (fieldname, value) => {
      formData.fields[fieldname] = value;
    });

    busboy.on('error', error => {
      reject(error);
    });

    busboy.on('close', () => {
      request.addRequestData('formData', formData);
      resolve();
    });

    const encoding = event.encoding || (event.isBase64Encoded ? 'base64' : 'binary');

    busboy.write(event.body, encoding);
    busboy.end();
  });
};
