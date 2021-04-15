import Busboy from 'busboy';

const getConfig = event => {
  return {
    headers: {
      'content-type': event.headers['content-type'] || event.headers['Content-Type'],
    },
  };
};

export const parseMultipartFormData = async request => {
  const { event } = request;

  const formData = {
    files: [],
    fields: {},
  };

  const busboy = new Busboy(getConfig(event));

  return new Promise((resolve, reject) => {
    const buffers = [];

    busboy.on('file', (fieldName, file, fileName, encoding, mimeType) => {
      const userSubmittedFile = {};

      file.on('data', data => {
        if (data && data.length) {
          buffers.push(data);
        }
      });

      file.on('end', () => {
        if (buffers.length) {
          userSubmittedFile.content = Buffer.concat(buffers);
          userSubmittedFile.fileName = fileName;
          userSubmittedFile.contentType = mimeType;
          userSubmittedFile.encoding = encoding;
          userSubmittedFile.fieldName = fieldName;
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

    busboy.on('finish', () => {
      request.addRequestData('formData', formData);
      resolve();
    });

    const encoding = event.encoding || (event.isBase64Encoded ? 'base64' : 'binary');

    busboy.write(event.body, encoding);
    busboy.end();
  });
};
