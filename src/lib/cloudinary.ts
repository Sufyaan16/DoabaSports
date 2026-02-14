import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from env vars (lazy — only runs when first called)
let configured = false;

function ensureConfigured() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

/**
 * Upload a base64 or data-URI image to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImage(
  dataUri: string,
  options: {
    folder?: string;
    publicId?: string;
  } = {},
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder || "doaba-sports",
    public_id: options.publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
