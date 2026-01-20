import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
const companyLogosDir = path.join(__dirname, '../../uploads/company-logos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(companyLogosDir)) {
  fs.mkdirSync(companyLogosDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if it's a company logo upload based on the route
    if (req.path && req.path.includes('/logo')) {
      cb(null, companyLogosDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // For company logos, use companyId; for profiles, use userId
    if (req.path && req.path.includes('/logo')) {
      const uniqueName = `company_${req.companyId || req.user.company_id}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    } else {
      const uniqueName = `${req.user.userId}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper function to delete old profile picture
export function deleteOldProfilePicture(filename) {
  if (!filename) return;
  
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted old profile picture: ${filename}`);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }
  }
}
