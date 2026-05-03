const express = require('express');
const router = express.Router();
const { createPropertiesRepository } = require('../repo/propertiesRepo');
const { uploadStreamToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');
const { parseMultipartForm } = require('../utils/multipart');
const { getAuthUserId } = require('../utils/authMiddleware');

const getPropertiesRepo = (req) => createPropertiesRepository(req.app.locals.db);

const normalizeBookingType = (bookingType) => {
  const allowed = ['fixed', 'hourly', 'both'];
  return allowed.includes(bookingType) ? bookingType : 'fixed';
};

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties with optional filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: hostId
 *         schema:
 *           type: integer
 *         description: Filter by host ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per night
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { hostId, type, minPrice, maxPrice, search } = req.query;
    const repo = getPropertiesRepo(req);

    const filters = {};
    if (hostId) filters.hostId = parseInt(hostId);
    if (type) filters.type = type;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (search) filters.search = search;

    const properties = await repo.getAllProperties(filters);

    res.json({
      properties,
      total: properties.length
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// GET /api/properties/host - Get properties for authenticated host
router.get('/host', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const repo = getPropertiesRepo(req);
    const properties = await repo.getAllProperties({ hostId });

    res.json({
      data: properties,
      total: properties.length
    });
  } catch (error) {
    console.error('Error fetching host properties:', error);
    res.status(500).json({ message: 'Failed to fetch host properties', error: error.message });
  }
});

// GET /api/properties/favorites - Get user's favorite properties
router.get('/favorites', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT
          p.id,
          p.title,
          p.description,
          p.type,
          p.bedrooms,
          p.bathrooms,
          p.max_guests,
          p.price_per_night,
          p.address,
          p.amenities,
          p.images,
          p.availability,
          f.created_at as favorited_at,
          ROUND(COALESCE(AVG(pr.rating), 0)::numeric, 1) AS rating,
          COUNT(pr.id)::int AS review_count
        FROM favorites f
        JOIN properties p ON p.id = f.property_id
        LEFT JOIN property_reviews pr ON pr.property_id = p.id
        WHERE f.user_id = $1
        GROUP BY p.id, f.created_at
        ORDER BY f.created_at DESC
      `,
      [userId]
    );

    const favorites = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      pricePerNight: parseFloat(row.price_per_night || 0),
      address: row.address,
      amenities: row.amenities || [],
      images: row.images || [],
      availability: row.availability,
      favoritedAt: row.favorited_at,
      rating: parseFloat(row.rating || 0),
      reviewCount: row.review_count || 0
    }));

    res.json({
      favorites,
      total: favorites.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// POST /api/properties/:id/favorite - Add property to favorites
router.post('/:id/favorite', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const propertyId = parseInt(req.params.id);
    const db = req.app.locals.db;

    // Check if property exists
    const propertyCheck = await db.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existingFavorite = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    // Add to favorites
    await db.query(
      'INSERT INTO favorites (user_id, property_id, created_at) VALUES ($1, $2, NOW())',
      [userId, propertyId]
    );

    res.status(201).json({ message: 'Property added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});

// DELETE /api/properties/:id/favorite - Remove property from favorites
router.delete('/:id/favorite', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const propertyId = parseInt(req.params.id);
    const db = req.app.locals.db;

    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2 RETURNING id',
      [userId, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});

/**
 * @swagger
 * /properties/recommendations/personalized:
 *   get:
 *     summary: Get personalized property recommendations
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Recommended properties
 *       500:
 *         description: Server error
 */
router.get('/recommendations/personalized', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const db = req.app.locals.db;

    let recommendedProperties = [];
    let usedPersonalized = false;

    if (userId) {
      // Get user's booking history to understand preferences
      const bookingHistory = await db.query(
        `
          SELECT
            p.type,
            p.bedrooms,
            p.bathrooms,
            p.max_guests,
            p.price_per_night,
            b.guests,
            b.created_at
          FROM bookings b
          JOIN properties p ON p.id = b.property_id
          WHERE b.guest_id = $1
          ORDER BY b.created_at DESC
          LIMIT 5
        `,
        [userId]
      );

      if (bookingHistory.rows.length > 0) {
        // Calculate average preferences
        const avgGuests = Math.round(
          bookingHistory.rows.reduce((sum, row) => sum + (row.guests || 0), 0) / bookingHistory.rows.length
        );
        const avgPrice = Math.round(
          bookingHistory.rows.reduce((sum, row) => sum + parseFloat(row.price_per_night || 0), 0) / bookingHistory.rows.length
        );
        const preferredTypes = [...new Set(bookingHistory.rows.map(row => row.type))];

        // Get properties matching user preferences
        const result = await db.query(
          `
            SELECT
              p.id,
              p.title,
              p.description,
              p.type,
              p.bedrooms,
              p.bathrooms,
              p.max_guests,
              p.price_per_night,
              p.address,
              p.amenities,
              p.images,
              p.availability,
              ROUND(COALESCE(AVG(pr.rating), 0)::numeric, 1) AS rating,
              COUNT(pr.id)::int AS review_count
            FROM properties p
            LEFT JOIN property_reviews pr ON pr.property_id = p.id
            WHERE p.availability = true
              AND p.max_guests >= $1
              AND p.price_per_night BETWEEN $2 * 0.7 AND $2 * 1.3
              AND ($3::text[] IS NULL OR p.type = ANY($3))
              AND p.id NOT IN (
                SELECT property_id FROM bookings WHERE guest_id = $4
              )
            GROUP BY p.id
            ORDER BY rating DESC NULLS LAST, review_count DESC, p.created_at DESC
            LIMIT 20
          `,
          [avgGuests, avgPrice, preferredTypes.length > 0 ? preferredTypes : null, userId]
        );

        recommendedProperties = result.rows;
        usedPersonalized = result.rows.length > 0;
      }
    }

    // If no personalized recommendations, get top-rated properties
    if (recommendedProperties.length === 0) {
      const result = await db.query(
        `
          SELECT
            p.id,
            p.title,
            p.description,
            p.type,
            p.bedrooms,
            p.bathrooms,
            p.max_guests,
            p.price_per_night,
            p.address,
            p.amenities,
            p.images,
            p.availability,
            ROUND(COALESCE(AVG(pr.rating), 0)::numeric, 1) AS rating,
            COUNT(pr.id)::int AS review_count
          FROM properties p
          LEFT JOIN property_reviews pr ON pr.property_id = p.id
          WHERE p.availability = true
          GROUP BY p.id
          ORDER BY rating DESC NULLS LAST, review_count DESC, p.created_at DESC
          LIMIT 20
        `
      );

      recommendedProperties = result.rows;
    }

    // Format the response
    const formatted = recommendedProperties.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      pricePerNight: parseFloat(row.price_per_night || 0),
      address: row.address,
      amenities: row.amenities || [],
      images: row.images || [],
      availability: row.availability,
      rating: parseFloat(row.rating || 0),
      reviewCount: row.review_count || 0
    }));

    res.json({
      properties: formatted,
      total: formatted.length,
      personalized: usedPersonalized
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
  }
});

// POST /api/properties/upload - Upload property image
router.post('/upload', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        message: 'File upload is not configured. Set Cloudinary environment variables.'
      });
    }

    const parsedForm = await parseMultipartForm(req, {
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 1,
      allowedFileFields: ['file'],
      onFile: async ({ fieldName, fileStream, filename, mimeType }) => {
        const uploadResult = await uploadStreamToCloudinary(fileStream, {
          folder: `smartstay/properties/${hostId}`,
          public_id: `property_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
          resource_type: 'auto'
        });

        return {
          fieldName,
          originalName: filename,
          mimetype: mimeType,
          uploadResult
        };
      }
    });

    const uploadedFile = parsedForm.files.find((file) => file.fieldName === 'file');
    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const uploadResult = uploadedFile.uploadResult;

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('Error uploading property image:', error);
    const statusCode = error.message.includes('multipart/form-data') || error.message.includes('File too large')
      ? 400
      : 500;
    res.status(statusCode).json({ message: error.message || 'Failed to upload image' });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get a single property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const repo = getPropertiesRepo(req);

    const property = await repo.getPropertyById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - pricePerNight
 *               - address
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               maxGuests:
 *                 type: integer
 *               pricePerNight:
 *                 type: number
 *               address:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               bookingType:
 *                 type: string
 *                 enum: [fixed, hourly, both]
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Property created successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const repo = getPropertiesRepo(req);

    const bookingType = normalizeBookingType(req.body.bookingType);
    const parsedHourlyRate = parseFloat(req.body.hourlyRate);
    const parsedExtraGuestFee = parseFloat(req.body.extraGuestFee);
    const houseRules = typeof req.body.houseRules === 'string' ? req.body.houseRules.trim() : '';
    const hourlyRate = (bookingType === 'hourly' || bookingType === 'both')
      ? (Number.isFinite(parsedHourlyRate) ? parsedHourlyRate : null)
      : null;
    const extraGuestFee = Number.isFinite(parsedExtraGuestFee) && parsedExtraGuestFee >= 0
      ? parsedExtraGuestFee
      : 0;

    const propertyData = {
      hostId,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      maxGuests: req.body.maxGuests,
      pricePerNight: req.body.pricePerNight,
      address: req.body.address,
      amenities: req.body.amenities || [],
      images: req.body.images || [],
      availability: req.body.availability !== false,
      bookingType,
      hourlyRate,
      extraGuestFee,
      houseRules,
      timeAvailability: req.body.timeAvailability || { checkInTime: '15:00', checkOutTime: '11:00' },
      paymentMethods: req.body.paymentMethods || { cash: true, gcash: false, paymaya: false, bankTransfer: false }
    };

    const property = await repo.createProperty(propertyData);

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Property not found or access denied
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const propertyId = parseInt(req.params.id);
    const repo = getPropertiesRepo(req);

    const property = await repo.getPropertyById(propertyId);
    if (!property || property.hostId !== hostId) {
      return res.status(404).json({ message: 'Property not found or access denied' });
    }

    const bookingType = normalizeBookingType(req.body.bookingType || property.bookingType);
    const parsedHourlyRate = parseFloat(req.body.hourlyRate);
    const parsedExtraGuestFee = parseFloat(req.body.extraGuestFee);
    const houseRules = typeof req.body.houseRules === 'string'
      ? req.body.houseRules.trim()
      : (property.houseRules || '');
    const hourlyRate = (bookingType === 'hourly' || bookingType === 'both')
      ? (Number.isFinite(parsedHourlyRate) ? parsedHourlyRate : property.hourlyRate)
      : null;
    const extraGuestFee = Number.isFinite(parsedExtraGuestFee) && parsedExtraGuestFee >= 0
      ? parsedExtraGuestFee
      : Number(property.extraGuestFee || property.timeAvailability?.extraGuestFee || 0);

    const parsedPricePerNight = typeof req.body.pricePerNight === 'string'
      ? parseFloat(req.body.pricePerNight.replace(/,/g, ''))
      : parseFloat(req.body.pricePerNight);

    const updatePayload = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      bedrooms: parseInt(req.body.bedrooms, 10),
      bathrooms: parseInt(req.body.bathrooms, 10),
      maxGuests: parseInt(req.body.maxGuests, 10),
      pricePerNight: Number.isFinite(parsedPricePerNight) ? parsedPricePerNight : undefined,
      address: req.body.address,
      amenities: req.body.amenities,
      images: req.body.images,
      availability: req.body.availability !== false,
      paymentMethods: req.body.paymentMethods,
      timeAvailability: {
        ...(property.timeAvailability || {}),
        ...(req.body.timeAvailability || {}),
        bookingType,
        hourlyRate,
        extraGuestFee,
        houseRules
      }
    };

    const sanitizedPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([, value]) => value !== undefined && !Number.isNaN(value))
    );

    const updatedProperty = await repo.updateProperty(propertyId, sanitizedPayload);

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Failed to update property' });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Property not found or access denied
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const propertyId = parseInt(req.params.id);
    const repo = getPropertiesRepo(req);

    const property = await repo.getPropertyById(propertyId);
    if (!property || property.hostId !== hostId) {
      return res.status(404).json({ message: 'Property not found or access denied' });
    }

    await repo.deleteProperty(propertyId);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

module.exports = router;