const Busboy = require('busboy');

const parseMultipartForm = (req, options = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024,
    maxFiles = 10,
    allowedFileFields = null,
    onFile = null
  } = options;

  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      reject(new Error('Expected multipart/form-data request'));
      return;
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxFileSize,
        files: maxFiles
      }
    });

    const fields = {};
    const fileTasks = [];
    let settled = false;

    const fail = (error) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    };

    busboy.on('field', (fieldName, value) => {
      fields[fieldName] = value;
    });

    busboy.on('file', (fieldName, fileStream, info) => {
      const { filename = '', encoding = '7bit', mimeType = '' } = info || {};

      if (Array.isArray(allowedFileFields) && !allowedFileFields.includes(fieldName)) {
        fileStream.resume();
        return;
      }

      fileStream.on('limit', () => {
        fail(new Error(`File too large for field: ${fieldName}`));
      });

      const task = Promise.resolve(
        onFile
          ? onFile({
              fieldName,
              fileStream,
              filename,
              encoding,
              mimeType
            })
          : {
              fieldName,
              filename,
              encoding,
              mimeType
            }
      );

      fileTasks.push(task);
      task.catch((error) => fail(error));
    });

    busboy.on('filesLimit', () => {
      fail(new Error('Too many files uploaded'));
    });

    busboy.on('error', (error) => {
      fail(error);
    });

    busboy.on('finish', async () => {
      if (settled) {
        return;
      }

      try {
        const files = await Promise.all(fileTasks);
        settled = true;
        resolve({
          fields,
          files: files.filter(Boolean)
        });
      } catch (error) {
        fail(error);
      }
    });

    req.pipe(busboy);
  });
};

module.exports = {
  parseMultipartForm
};