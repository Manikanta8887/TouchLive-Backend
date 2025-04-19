// middleware/upload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/Cloudinary.js';

// Configure Cloudinary storage for video
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'touch_live_videos',
    resource_type: 'video',       // explicitly upload as video
    format: file.mimetype === 'video/webm' ? 'webm' : 'mp4',
    public_id: `${req.params.uid}/${Date.now()}`,
    allowed_formats: ['mp4', 'mov', 'webm'],
    transformation: [{ quality: 'auto' }],
  }),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Not a video file'), false);
  },
  limits: { fileSize: 1 * 1024 * 1024 * 1024 }, // 1 GB per file
});

export default upload;