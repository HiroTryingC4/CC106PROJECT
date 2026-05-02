const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const getPool = (req) => req.app.locals.db;

const isAdmin = async (req, userId) => {
  const pool = getPool(req);
  const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  return result.rows[0]?.role === 'admin' || result.rows[0]?.role === 'communication_admin';
};

// GET /api/faqs - Get all active FAQs
router.get('/', async (req, res) => {
  try {
    const pool = getPool(req);
    const { category } = req.query;

    let query = `
      SELECT id, question, answer, category, display_order, is_active, created_at, updated_at
      FROM faqs
      WHERE is_active = true
    `;
    const params = [];

    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }

    query += ` ORDER BY display_order ASC, created_at DESC`;

    const result = await pool.query(query, params);

    return res.json({
      faqs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// GET /api/faqs/all - Get all FAQs (admin only)
router.get('/all', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pool = getPool(req);
    const result = await pool.query(`
      SELECT id, question, answer, category, display_order, is_active, created_at, updated_at
      FROM faqs
      ORDER BY display_order ASC, created_at DESC
    `);

    return res.json({
      faqs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching all FAQs:', error);
    return res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// POST /api/faqs - Create new FAQ (admin only)
router.post('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { question, answer, category, displayOrder } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const pool = getPool(req);
    const result = await pool.query(
      `
        INSERT INTO faqs (question, answer, category, display_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        RETURNING *
      `,
      [question, answer, category || 'general', displayOrder || 0]
    );

    return res.status(201).json({
      message: 'FAQ created successfully',
      faq: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return res.status(500).json({ message: 'Failed to create FAQ' });
  }
});

// PUT /api/faqs/:id - Update FAQ (admin only)
router.put('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const faqId = parseInt(req.params.id, 10);
    if (Number.isNaN(faqId)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }

    const { question, answer, category, displayOrder, isActive } = req.body;

    const pool = getPool(req);
    const result = await pool.query(
      `
        UPDATE faqs
        SET
          question = COALESCE($1, question),
          answer = COALESCE($2, answer),
          category = COALESCE($3, category),
          display_order = COALESCE($4, display_order),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
      [question, answer, category, displayOrder, isActive, faqId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    return res.json({
      message: 'FAQ updated successfully',
      faq: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return res.status(500).json({ message: 'Failed to update FAQ' });
  }
});

// DELETE /api/faqs/:id - Delete FAQ (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const faqId = parseInt(req.params.id, 10);
    if (Number.isNaN(faqId)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }

    const pool = getPool(req);
    const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [faqId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    return res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return res.status(500).json({ message: 'Failed to delete FAQ' });
  }
});

module.exports = router;
