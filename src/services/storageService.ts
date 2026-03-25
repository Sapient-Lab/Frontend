export interface UploadResponse {
  success: boolean;
  url?: string;
  blobName?: string;
  error?: string;
}

export const storageService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await fetch('/api/storage/upload', {
      method: 'POST',
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      throw new Error(text || 'Upload failed');
    }

    return resp.json();
  },
};
