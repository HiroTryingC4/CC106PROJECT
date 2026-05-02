const express = require('express');
const router = express.Router({ mergeParams: true });
const Busboy = require('busboy');
const { getAuthUserId } = require('../utils/authMiddleware');
const { uploadBufferToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

const getPool = (req) => req.app.locals.db;

// POST /api/bookings/:id/checkout-photos
router.post('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ message: 'No authentication provided' });

    const pool = getPool(req);
    const bookingId = parseInt(req.params.id, 10);

    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [bookingId]);
    const booking = existing.rows[0];
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guest_id !== userId) return res.status(403).json({ message: 'Access denied' });

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ message: 'Image storage is not configured on the server' });
    }

    const uploadedUrls = await new Promise((resolve, reject) => {
      const busboy = Busboy({
        headers: req.headers,
        limits: { fileSize: 5 * 1024 * 1024, files: 5 }
      });

      const uploads = [];

      busboy.on('file', (fieldName, fileStream, info) => {
        const { mimeType } = info;
        if (!['image/jpeg', 'image/png'].includes(mimeType)) {
          fileStream.resume();
          return;
        }

        const task = new Promise((res, rej) => {
          const chunks = [];
          fileStream.on('data', (d) => chunks.push(d));
          fileStream.on('end', async () => {
            try {
              const result = await uploadBufferToCloudinary(
                Buffer.concat(chunks),
                { folder: `smartstay/checkout/${bookingId}` }
              );
              res(result.secure_url);
            } catch (e) { rej(e); }
          });
          fileStream.on('error', rej);
        });

        uploads.push(task);
      });

      busboy.on('finish', async () => {
        try {
          resolve(await Promise.all(uploads));
        } catch (e) { reject(e); }
      });

      busboy.on('error', reject);
      req.pipe(busboy);
    });

    if (uploadedUrls.length === 0) {
      return res.status(400).json({ message: 'No valid photos uploaded' });
    }

    const currentMeta = booking.metadata || {};
    const updatedMeta = {
      ...currentMeta,
      checkoutPhotos: [...(currentMeta.checkoutPhotos || []), ...uploadedUrls],
      checkoutSubmittedAt: new Date().toISOString()
    };

    await pool.query(
      'UPDATE bookings SET metadata = $1::jsonb, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedMeta), bookingId]
    );

    return res.json({ message: 'Checkout photos uploaded successfully', urls: uploadedUrls });
  } catch (err) {
    console.error('Error uploading checkout photos:', err);
    return res.status(500).json({ message: err.message || 'Failed to upload checkout photos' });
  }
});

module.exports = router;
