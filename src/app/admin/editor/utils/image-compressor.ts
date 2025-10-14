// src/app/admin/editor/utils/image-compressor.ts
import imageCompression from 'browser-image-compression';

interface CompressOptions {
  maxWidth: number;
  quality: number; // Changed from literal type to number
}

/**
 * Compresses an image file in the browser before uploading.
 * @param file The original image file.
 * @param options The compression options (maxWidth and quality).
 * @returns The compressed image as a File object.
 */
export async function compressImage(file: File, options: CompressOptions): Promise<File> {
  // Target size in MB (100KB = 0.1MB)
  const targetSizeMB = 0.1;
  
  const compressionOptions = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: options.maxWidth,
    useWebWorker: true,
    initialQuality: options.quality,
    fileType: 'image/webp',
    // Add these additional options for better control
    maxIteration: 10, // Maximum attempts to reach target size
    alwaysKeepResolution: false, // Allow further size reduction if needed
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Additional check: if still too large, apply more aggressive compression
    if (compressedFile.size > targetSizeMB * 1024 * 1024) {
      console.warn('Image still larger than target, applying aggressive compression');
      
      const aggressiveOptions = {
        maxSizeMB: targetSizeMB,
        maxWidthOrHeight: Math.min(options.maxWidth, 1200), // Reduce dimensions further
        useWebWorker: true,
        initialQuality: Math.min(options.quality, 0.6), // Lower quality
        fileType: 'image/webp',
        maxIteration: 15,
      };
      
      const aggressivelyCompressed = await imageCompression(file, aggressiveOptions);
      console.log(`Aggressive compression: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(aggressivelyCompressed.size / 1024 / 1024).toFixed(2)}MB`);
      return aggressivelyCompressed;
    }
    
    console.log(`Compressed image from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails, try a simpler approach as fallback
    return await fallbackCompression(file, options);
  }
}

// Fallback method using canvas if browser-image-compression fails
async function fallbackCompression(file: File, options: CompressOptions): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate dimensions
      let { width, height } = img;
      if (width > options.maxWidth) {
        height = (height * options.maxWidth) / width;
        width = options.maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with lower quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if blob creation fails
            }
          },
          'image/webp',
          options.quality
        );
      } else {
        resolve(file);
      }
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}