import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/helpers';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: object;
  eager?: object[];
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<{ url: string; publicId: string }> => {
  const uploadOptions: Record<string, unknown> = {
    folder: options.folder || 'yezbee-fashion',
    resource_type: 'auto',
    ...options,
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload file to cloud storage'));
          return;
        }
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
};

export const deleteMultipleFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  try {
    await cloudinary.api.delete_resources(publicIds);
    logger.info(`Deleted ${publicIds.length} files from Cloudinary`);
  } catch (error) {
    logger.error('Cloudinary bulk delete error:', error);
    throw new Error('Failed to delete files from cloud storage');
  }
};

export default cloudinary;
