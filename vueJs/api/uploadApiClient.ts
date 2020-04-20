import axios from 'axios';

export const getSignedURL = async (
  url: string,
  file: File
): Promise<{ fileName: string; s3Url: string }> => {
  try {
    const endpoint = url;
    const payload = {
      filePath: file.name,
      contentType: file.type,
      fileSize: file.size,
    };
    const { data } = await axios.post(endpoint, payload);

    return data as any;
  } catch (err) {
    if (err.response) {
      throw err.response;
    }

    throw err;
  }
};
