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
      timeAvailability: req.body.timeAvailability || { checkInTime: '15:00', checkOutTime: '11:00' }
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