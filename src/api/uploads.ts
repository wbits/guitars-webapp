import { apiFetch } from './client';

export interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const presignPictureUpload = async (
  contentType: string,
  signal?: AbortSignal,
): Promise<PresignUploadResponse> =>
  apiFetch<PresignUploadResponse>({
    method: 'POST',
    path: '/upload/presign',
    body: { contentType },
    signal,
  });

const normalizeLocalUploadUrl = (uploadUrl: string): string => {
  if (!import.meta.env.DEV) return uploadUrl;
  // SAM local presigns against the Docker hostname; browsers need localhost.
  return uploadUrl.replace('http://guitars-localstack:4566', 'http://localhost:4566');
};

export const putPictureToStorage = async (
  uploadUrl: string,
  file: File,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch(normalizeLocalUploadUrl(uploadUrl), {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
};

export const uploadPicture = async (file: File, signal?: AbortSignal): Promise<string> => {
  const { uploadUrl, publicUrl } = await presignPictureUpload(file.type, signal);
  await putPictureToStorage(uploadUrl, file, signal);
  return publicUrl;
};

export const validatePictureFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Only JPEG, PNG, WebP, and GIF images are supported.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Each image must be 5 MB or smaller.';
  }
  return null;
};
