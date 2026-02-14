"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  publicId: string;
}

interface UseCloudinaryUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<string | null>;
}

/**
 * Hook to upload a file to Cloudinary via /api/upload.
 * Returns the secure URL on success, null on failure.
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || "Upload failed");
      }

      const data: { data: UploadResult } = await response.json();
      return data.data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, error, uploadFile };
}
