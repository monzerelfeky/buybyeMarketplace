const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/images');
const UPLOADS_URL_PREFIX = '/uploads/images';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save base64 image to disk and return filename
 * @param {string} base64String - Data URL or base64 string (e.g., "data:image/png;base64,...")
 * @returns {string|null} Filename if saved, null if failed
 */
function saveBase64Image(base64String) {
  try {
    if (!base64String) return null;

    // Extract base64 data and mime type
    let base64Data = base64String;
    let mimeType = 'image/jpeg'; // default

    if (base64String.startsWith('data:')) {
      const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      mimeType = matches[1];
      base64Data = matches[2];
    }

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `${hash}.${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Decode and save
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);

    console.debug(`[imageHandler] Saved image: ${filename} (${buffer.length} bytes)`);
    return filename;
  } catch (err) {
    console.error('[imageHandler] Failed to save image:', err.message);
    return null;
  }
}

function normalizeImagePath(value) {
  if (!value || typeof value !== 'string') return null;

  if (value.startsWith('data:')) return value;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      return parsed.pathname.startsWith('/uploads/')
        ? parsed.pathname
        : `${UPLOADS_URL_PREFIX}/${path.basename(parsed.pathname)}`;
    } catch (err) {
      return null;
    }
  }

  if (value.includes('uploads/images/')) {
    return `${UPLOADS_URL_PREFIX}/${path.basename(value)}`;
  }

  if (value.startsWith('/uploads/')) {
    if (!value.startsWith(`${UPLOADS_URL_PREFIX}/`)) {
      return `${UPLOADS_URL_PREFIX}/${path.basename(value)}`;
    }
    return value;
  }

  if (value.startsWith('/')) {
    return value;
  }

  return `${UPLOADS_URL_PREFIX}/${value}`;
}

/**
 * Process image array - converts base64 strings to filenames
 * @param {array} images - Array of base64 strings or filenames
 * @returns {array} Array of filenames stored on disk
 */
function processImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => {
      // If base64 data URL or raw base64, save it
      if (typeof img === 'string') {
        if (img.startsWith('data:')) {
          const filename = saveBase64Image(img);
          return filename ? `${UPLOADS_URL_PREFIX}/${filename}` : null;
        }
        const looksLikeBase64 = !img.startsWith('http') && !img.startsWith('/uploads/') && !img.includes('.');
        if (looksLikeBase64 && img.length > 100) {
          const filename = saveBase64Image(img);
          return filename ? `${UPLOADS_URL_PREFIX}/${filename}` : null;
        }
        return normalizeImagePath(img);
      }
      return null;
    })
    .filter(Boolean); // Remove nulls
}

/**
 * Delete images from disk
 * @param {array} filenames - Array of filenames to delete
 */
function deleteImages(filenames) {
  if (!Array.isArray(filenames)) return;

  filenames.forEach((filename) => {
    try {
      if (!filename) return;
      if (filename.startsWith('http')) return;
      const normalized = filename.startsWith('/uploads/')
        ? path.basename(filename)
        : path.basename(filename);
      if (!normalized) return;
      const filepath = path.join(UPLOADS_DIR, normalized);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.debug(`[imageHandler] Deleted image: ${filename}`);
      }
    } catch (err) {
      console.warn(`[imageHandler] Failed to delete ${filename}:`, err.message);
    }
  });
}

module.exports = { saveBase64Image, processImages, deleteImages };
