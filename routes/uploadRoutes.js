// routes/uploadRoutes.js
import express from 'express';
import multer from 'multer'; // for handling multipart/form-data
import cloudinary from '../middleware/cloudinary.js'; // import cloudinary config
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',
    });
    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
