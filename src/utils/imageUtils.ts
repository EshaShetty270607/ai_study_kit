/**
 * Resizes and compresses an image client-side before sending to server.
 * This guarantees token consumption stays well within limits and network uploads are near-instant.
 */
export async function processImageFile(file: File): Promise<{
  name: string;
  mimeType: string;
  data: string; // base64 without prefix
  previewUrl: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2d context.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp/jpeg with 0.82 quality
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.82);
        const base64 = dataUrl.split(',')[1];

        resolve({
          name: file.name,
          mimeType,
          data: base64,
          previewUrl: dataUrl,
          size: Math.round((base64.length * 3) / 4),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
