import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableUploadError = (error) => {
  const message = String(error?.message || error?.error?.message || "");
  return /timeout|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(message);
};

const uploadOnce = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      },
    );

    uploadStream.end(buffer);
  });

const uploadImage = async (fileBuffer, folder = "nysc-connect/accommodations") => {
  const optimizedImage = await sharp(fileBuffer)
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
    })
    .toBuffer();

  try {
    return await uploadOnce(optimizedImage, folder);
  } catch (error) {
    if (!isRetryableUploadError(error)) throw error;
    await sleep(750);
    return uploadOnce(optimizedImage, folder);
  }
};

export default uploadImage;
