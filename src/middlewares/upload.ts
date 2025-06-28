// src/middlewares/upload.ts
import { Request } from 'express';

// Helper function to validate image URL format
export const processImageUpload = (req: Request): string | null => {
  let imageUrl = req.body.image_url;

  if (!imageUrl) return null;

  // Convert Google Drive share link to direct view link
  const driveMatch = imageUrl.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (driveMatch) {
    const fileId = driveMatch[1];
    imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Final URL validation
  try {
    const urlObj = new URL(imageUrl);
    if (!urlObj.protocol.startsWith('http')) {
      throw new Error();
    }
  } catch {
    throw new Error('Invalid image URL');
  }

  return imageUrl;
};
