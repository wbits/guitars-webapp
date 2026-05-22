import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  presignPictureUpload,
  putPictureToStorage,
  uploadPicture,
  validatePictureFile,
} from './uploads';

vi.mock('./client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from './client';

describe('uploads', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('presignPictureUpload calls the API', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      uploadUrl: 'https://s3.example/upload',
      publicUrl: 'https://cdn.example/images/guitars/a.jpg',
      key: 'images/guitars/a.jpg',
    });

    const result = await presignPictureUpload('image/jpeg');
    expect(apiFetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/upload/presign',
      body: { contentType: 'image/jpeg' },
      signal: undefined,
    });
    expect(result.publicUrl).toContain('images/guitars');
  });

  it('putPictureToStorage PUTs the file to the presigned URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await putPictureToStorage('https://s3.example/upload', file);

    expect(fetchMock).toHaveBeenCalledWith('https://s3.example/upload', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: file,
      signal: undefined,
    });
  });

  it('uploadPicture presigns then uploads', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      uploadUrl: 'https://s3.example/upload',
      publicUrl: 'https://cdn.example/images/guitars/a.jpg',
      key: 'images/guitars/a.jpg',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const url = await uploadPicture(file);
    expect(url).toBe('https://cdn.example/images/guitars/a.jpg');
  });

  it('validatePictureFile rejects unsupported types and oversized files', () => {
    expect(validatePictureFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toMatch(
      /supported/i,
    );
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    expect(validatePictureFile(big)).toMatch(/5 MB/i);
    expect(validatePictureFile(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).toBeNull();
  });
});
