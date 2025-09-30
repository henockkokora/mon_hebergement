import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authRequired } from '../middleware/auth.js';

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

// POST /api/upload - upload multiple files
router.post('/', authRequired, upload.array('files', 10), (req, res) => {
  const files = (req.files || []).map((f) => {
    const isImage = f.mimetype.startsWith('image/');
    const isVideo = f.mimetype.startsWith('video/');
    return {
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      type: isImage ? 'image' : (isVideo ? 'video' : 'other'),
      url: `/uploads/${f.filename}`,
    };
  });
  res.status(201).json({ files });
});

export default router;
