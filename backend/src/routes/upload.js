import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { authRequired } from '../middleware/auth.js';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non supporté'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

// Fonction pour uploader vers Cloudinary
async function uploadToCloudinary(filePath, filename) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'mon-hebergement',
      public_id: filename.split('.')[0],
      resource_type: 'auto'
    });
    
    // Supprimer le fichier local après upload
    fs.unlinkSync(filePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  }
}

// POST /api/upload - upload multiple files
router.post('/', authRequired, upload.array('files', 10), async (req, res) => {
  try {
    const files = [];
    
    for (const f of req.files || []) {
      const isImage = f.mimetype.startsWith('image/');
      const isVideo = f.mimetype.startsWith('video/');
      
      // Upload vers Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(f.path, f.filename);
      
      files.push({
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        type: isImage ? 'image' : (isVideo ? 'video' : 'other'),
        url: cloudinaryUrl, // URL Cloudinary au lieu de /uploads/
      });
    }
    
    res.status(201).json({ files });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

export default router;
