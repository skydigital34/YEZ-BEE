import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/helpers';

// Ensure environment variables are loaded if not already initialized
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config();
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

logger.info(`[Cloudinary Config] Diagnostic Check:`);
logger.info(`Cloudinary cloud name present: ${Boolean(cloudName)}`);
logger.info(`Cloudinary API key present: ${Boolean(apiKey)}`);
logger.info(`Cloudinary API secret present: ${Boolean(apiSecret)}`);
logger.info(`Cloudinary initialized: ${isConfigured}`);
logger.info(`Cloud: ${isConfigured ? cloudName : 'N/A'}`);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
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

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  publicId: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const folderPath = options.folder || 'yezbee/products';
  logger.info(`[Cloudinary Upload] Upload started. Buffer size: ${fileBuffer.length} bytes, Target Folder: ${folderPath}`);

  const uploadOptions: Record<string, unknown> = {
    folder: folderPath,
    resource_type: 'auto',
    ...options,
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('[Cloudinary Upload] Upload failure:', error.message || error);
          reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
          return;
        }
        logger.info(`[Cloudinary Upload] Upload success. Public ID: ${result!.public_id}, Format: ${result!.format}, Dimensions: ${result!.width}x${result!.height}`);
        resolve({
          url: result!.secure_url,
          secure_url: result!.secure_url,
          publicId: result!.public_id,
          public_id: result!.public_id,
          width: result!.width,
          height: result!.height,
          format: result!.format,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const getCategoryFolderPath = (categoryNameOrSlug?: string): string => {
  if (!categoryNameOrSlug) return 'products/general';
  const sanitized = categoryNameOrSlug
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/\s+/g, '-');
  return `products/${sanitized || 'general'}`;
};

export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted from Cloudinary: ${publicId}, result: ${JSON.stringify(result)}`);
  } catch (error: any) {
    logger.error(`Cloudinary delete error for ${publicId}:`, error?.message || error);
  }
};

export const deleteMultipleFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  const validIds = (publicIds || []).filter(Boolean);
  if (validIds.length === 0) return;
  try {
    await cloudinary.api.delete_resources(validIds);
    logger.info(`Deleted ${validIds.length} files from Cloudinary`);
  } catch (error: any) {
    logger.error('Cloudinary bulk delete error:', error?.message || error);
  }
};

export default cloudinary;
