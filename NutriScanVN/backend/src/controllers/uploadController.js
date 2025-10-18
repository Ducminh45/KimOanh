import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadController = {
  async uploadBase64(req, res) {
    const { imageBase64, extension = 'jpg' } = req.body || {};
    if (!imageBase64) return res.status(400).json({ message: 'imageBase64 required' });
    const uploadsDir = path.join(__dirname, '../../', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const id = uuidv4();
    const filename = `${id}.${extension.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'}`;
    const fullPath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(imageBase64, 'base64');
    await writeFile(fullPath, buffer);
    return res.status(201).json({ url: `/uploads/${filename}` });
  }
};
