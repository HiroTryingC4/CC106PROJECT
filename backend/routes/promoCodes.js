const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const getPool = (req) => req.app.locals.db;

// GET /api/promo-codes - Get all promo codes for host
router.get('/', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const result = await db.query(
      `
        SELECT
          id,
          host_id,
          code,
          type,
          value,
          description,
          start_date,
          end_date,
          usage_limit,
          used_count,
          min_booking_amount,
          status,
          created_at,
          updated_at
        FROM promo_codes
        WHERE host_id = $1
        ORDER BY created_at DESC
      `,
      [hostId]
    );

    const promoCodes = result.rows.map(row => ({
      id: row.id,
      hostId: row.host_id,
      code: row.code,
      type: row.type,
      value: parseFloat(row.value),
      description: row.description || '',
      startDate: row.start_date,
      endDate: row.end_date,
      usageLimit: row.usage_limit,
      usedCount: row.used_count,
      minBookingAmount: parseFloat(row.min_booking_amount || 0),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return res.json({
      success: true,
      data: promoCodes,
      total: promoCodes.length
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return res.status(500).json({ message: 'Failed to fetch promo codes', error: error.message });
  }
});

// POST /api/promo-codes - Create new promo code
router.post('/', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const {
      code,
      type,
      value,
      description,
      startDate,
      endDate,
      usageLimit,
      minBookingAmount
    } = req.body;

    const normalizedStartDate = startDate ?? req.body.start_date;
    const normalizedEndDate = endDate ?? req.body.end_date;
    const normalizedUsageLimit = usageLimit ?? req.body.usage_limit;
    const normalizedMinBookingAmount = minBookingAmount ?? req.body.min_booking_amount;

    // Validation
    if (!code || !type || !value || !normalizedStartDate || !normalizedEndDate || !normalizedUsageLimit) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['code', 'type', 'value', 'startDate', 'endDate', 'usageLimit']
      });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "percentage" or "fixed"' });
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({ message: 'Percentage value must be between 0 and 100' });
    }

    if (value <= 0) {
      return res.status(400).json({ message: 'Value must be greater than 0' });
    }

    const db = getPool(req);

    // Check if code already exists for this host
    const existingCode = await db.query(
      'SELECT id FROM promo_codes WHERE host_id = $1 AND code = $2',
      [hostId, code.toUpperCase()]
    );

    if (existingCode.rows.length > 0) {
      return res.status(409).json({ message: 'Promo code already exists' });
    }

    // Create promo code
    const result = await db.query(
      `
        INSERT INTO promo_codes (
          host_id,
          code,
          type,
          value,
          description,
          start_date,
          end_date,
          usage_limit,
          used_count,
          min_booking_amount,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, 'active', NOW(), NOW())
        RETURNING *
      `,
      [
        hostId,
        code.toUpperCase(),
        type,
        value,
        description || '',
        normalizedStartDate,
        normalizedEndDate,
        normalizedUsageLimit,
        normalizedMinBookingAmount || 0
      ]
    );

    const promoCode = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: {
        id: promoCode.id,
        hostId: promoCode.host_id,
        code: promoCode.code,
        type: promoCode.type,
        value: parseFloat(promoCode.value),
        description: promoCode.description,
        startDate: promoCode.start_date,
        endDate: promoCode.end_date,
        usageLimit: promoCode.usage_limit,
        usedCount: promoCode.used_count,
        minBookingAmount: parseFloat(promoCode.min_booking_amount),
        status: promoCode.status,
        createdAt: promoCode.created_at
      }
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return res.status(500).json({ message: 'Failed to create promo code', error: error.message });
  }
});

// GET /api/promo-codes/:id - Get single promo code
router.get('/:id', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const promoId = parseInt(req.params.id, 10);
    if (Number.isNaN(promoId)) {
      return res.status(400).json({ message: 'Invalid promo code ID' });
    }

    const db = getPool(req);
    const result = await db.query(
      `
        SELECT * FROM promo_codes
        WHERE id = $1 AND host_id = $2
      `,
      [promoId, hostId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    const promoCode = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: promoCode.id,
        hostId: promoCode.host_id,
        code: promoCode.code,
        type: promoCode.type,
        value: parseFloat(promoCode.value),
        description: promoCode.description,
        startDate: promoCode.start_date,
        endDate: promoCode.end_date,
        usageLimit: promoCode.usage_limit,
        usedCount: promoCode.used_count,
        minBookingAmount: parseFloat(promoCode.min_booking_amount),
        status: promoCode.status,
        createdAt: promoCode.created_at,
        updatedAt: promoCode.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return res.status(500).json({ message: 'Failed to fetch promo code', error: error.message });
  }
});

// PUT /api/promo-codes/:id - Update promo code
router.put('/:id', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const promoId = parseInt(req.params.id, 10);
    if (Number.isNaN(promoId)) {
      return res.status(400).json({ message: 'Invalid promo code ID' });
    }

    const {
      code,
      type,
      value,
      description,
      startDate,
      endDate,
      usageLimit,
      minBookingAmount,
      status
    } = req.body;

    const db = getPool(req);

    // Check if promo code exists and belongs to host
    const existing = await db.query(
      'SELECT id FROM promo_codes WHERE id = $1 AND host_id = $2',
      [promoId, hostId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`);
      values.push(code.toUpperCase());
    }
    if (type !== undefined) {
      if (!['percentage', 'fixed'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "percentage" or "fixed"' });
      }
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (value !== undefined) {
      updates.push(`value = $${paramCount++}`);
      values.push(value);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(endDate);
    }
    if (usageLimit !== undefined) {
      updates.push(`usage_limit = $${paramCount++}`);
      values.push(usageLimit);
    }
    if (minBookingAmount !== undefined) {
      updates.push(`min_booking_amount = $${paramCount++}`);
      values.push(minBookingAmount);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    updates.push(`updated_at = NOW()`);
    values.push(promoId, hostId);

    const result = await db.query(
      `
        UPDATE promo_codes
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND host_id = $${paramCount++}
        RETURNING *
      `,
      values
    );

    const promoCode = result.rows[0];

    return res.json({
      success: true,
      message: 'Promo code updated successfully',
      data: {
        id: promoCode.id,
        hostId: promoCode.host_id,
        code: promoCode.code,
        type: promoCode.type,
        value: parseFloat(promoCode.value),
        description: promoCode.description,
        startDate: promoCode.start_date,
        endDate: promoCode.end_date,
        usageLimit: promoCode.usage_limit,
        usedCount: promoCode.used_count,
        minBookingAmount: parseFloat(promoCode.min_booking_amount),
        status: promoCode.status,
        updatedAt: promoCode.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return res.status(500).json({ message: 'Failed to update promo code', error: error.message });
  }
});

// DELETE /api/promo-codes/:id - Delete promo code
router.delete('/:id', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const promoId = parseInt(req.params.id, 10);
    if (Number.isNaN(promoId)) {
      return res.status(400).json({ message: 'Invalid promo code ID' });
    }

    const db = getPool(req);
    const result = await db.query(
      'DELETE FROM promo_codes WHERE id = $1 AND host_id = $2 RETURNING id',
      [promoId, hostId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    return res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return res.status(500).json({ message: 'Failed to delete promo code', error: error.message });
  }
});

// GET /api/promo-codes/:id/properties - Get units assigned to a promo code
router.get('/:id/properties', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) return res.status(401).json({ message: 'No authentication provided' });

    const promoId = parseInt(req.params.id, 10);
    if (Number.isNaN(promoId)) return res.status(400).json({ message: 'Invalid promo code ID' });

    const db = getPool(req);
    const owns = await db.query('SELECT id FROM promo_codes WHERE id = $1 AND host_id = $2', [promoId, hostId]);
    if (owns.rows.length === 0) return res.status(404).json({ message: 'Promo code not found' });

    const result = await db.query(
      `SELECT p.id, p.title FROM promo_code_properties pcp
       JOIN properties p ON p.id = pcp.property_id
       WHERE pcp.promo_code_id = $1`,
      [promoId]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch assigned properties', error: error.message });
  }
});

// PUT /api/promo-codes/:id/properties - Replace assigned units for a promo code
router.put('/:id/properties', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) return res.status(401).json({ message: 'No authentication provided' });

    const promoId = parseInt(req.params.id, 10);
    if (Number.isNaN(promoId)) return res.status(400).json({ message: 'Invalid promo code ID' });

    const { propertyIds } = req.body;
    if (!Array.isArray(propertyIds)) return res.status(400).json({ message: 'propertyIds must be an array' });

    const db = getPool(req);
    const owns = await db.query('SELECT id FROM promo_codes WHERE id = $1 AND host_id = $2', [promoId, hostId]);
    if (owns.rows.length === 0) return res.status(404).json({ message: 'Promo code not found' });

    await db.query('DELETE FROM promo_code_properties WHERE promo_code_id = $1', [promoId]);

    if (propertyIds.length > 0) {
      const values = propertyIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await db.query(
        `INSERT INTO promo_code_properties (promo_code_id, property_id) VALUES ${values}`,
        [promoId, ...propertyIds]
      );
    }

    return res.json({ success: true, message: 'Units assigned successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to assign properties', error: error.message });
  }
});

// POST /api/promo-codes/validate - Validate promo code for booking
router.post('/validate', async (req, res) => {
  try {
    const { code, bookingAmount, propertyId } = req.body;

    if (!code) return res.status(400).json({ valid: false, message: 'Promo code is required' });

    const db = getPool(req);
    const result = await db.query(
      `SELECT * FROM promo_codes WHERE code = $1 AND status = 'active'`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ valid: false, message: 'Invalid or inactive promo code' });

    const promo = result.rows[0];
    const now = new Date();

    if (now < new Date(promo.start_date))
      return res.status(400).json({ valid: false, message: 'Promo code is not yet active' });

    if (now > new Date(promo.end_date))
      return res.status(400).json({ valid: false, message: 'Promo code has expired' });

    if (promo.used_count >= promo.usage_limit)
      return res.status(400).json({ valid: false, message: 'Promo code usage limit reached' });

    const amount = parseFloat(bookingAmount) || 0;
    if (amount < parseFloat(promo.min_booking_amount))
      return res.status(400).json({ valid: false, message: `Minimum booking amount of ₱${promo.min_booking_amount} required` });

    // Check if promo is restricted to specific units
    if (propertyId) {
      const assigned = await db.query(
        `SELECT 1 FROM promo_code_properties WHERE promo_code_id = $1`,
        [promo.id]
      );
      if (assigned.rows.length > 0) {
        const match = await db.query(
          `SELECT 1 FROM promo_code_properties WHERE promo_code_id = $1 AND property_id = $2`,
          [promo.id, parseInt(propertyId, 10)]
        );
        if (match.rows.length === 0)
          return res.status(400).json({ valid: false, message: 'Promo code is not valid for this property' });
      }
    }

    const discountAmount = promo.type === 'percentage'
      ? parseFloat(((amount * parseFloat(promo.value)) / 100).toFixed(2))
      : Math.min(parseFloat(promo.value), amount);

    return res.json({
      valid: true,
      message: 'Promo code applied!',
      data: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: parseFloat(promo.value),
        discountAmount,
        finalAmount: parseFloat((amount - discountAmount).toFixed(2)),
        description: promo.description
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({ message: 'Failed to validate promo code', error: error.message });
  }
});

module.exports = router;
