const express = require('express');
const router = express.Router();
const { uploadStreamToCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');
const { parseMultipartForm } = require('../utils/multipart');
const { getAuthUserId } = require('../utils/authMiddleware');

let adminRouter = null;
router.setAdminRouter = (admin) => {
  adminRouter = admin;
};

// GET /api/host/verification-status
router.get('/verification-status', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const userResult = await db.query(
      `SELECT verification_status FROM users WHERE id = $1 LIMIT 1`,
      [hostId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'Host account not found' });
    }

    const verificationResult = await db.query(
      `
        SELECT
          business_name,
          business_type,
          business_address,
          id_type,
          id_number,
          tax_id,
          details,
          status,
          submitted_at,
          reviewed_at,
          rejection_reason
        FROM host_verifications
        WHERE host_user_id = $1
        ORDER BY updated_at DESC, submitted_at DESC, id DESC
        LIMIT 1
      `,
      [hostId]
    );

    const verification = verificationResult.rows[0];
    const userStatus = userResult.rows[0].verification_status;
    const rawStatus = verification ? verification.status : userStatus;
    const status = (userStatus === 'verified' || rawStatus === 'approved' || rawStatus === 'verified')
      ? 'verified'
      : rawStatus;
    const isVerified = status === 'verified';

    return res.json({
      status,
      message: `Your verification status is ${status}`,
      submittedAt: verification?.submitted_at || null,
      lastUpdated: verification?.reviewed_at || null,
      verified: isVerified,
      data: verification
        ? {
            businessName: verification.business_name,
            businessType: verification.business_type,
            businessAddress: verification.business_address,
            idType: verification.id_type,
            idNumber: verification.id_number,
            taxId: verification.tax_id,
            ...verification.details
          }
        : null
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching verification status', error: error.message });
  }
});

// GET /api/host/debug - Debug endpoint
router.get('/debug', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const db = req.app.locals.db;
    const profileResult = await db.query(
      `
        SELECT u.id, u.email, up.user_id AS profile_user_id
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [hostId]
    );

    const bookingsResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM bookings WHERE host_id = $1`,
      [hostId]
    );

    return res.json({
      hostId,
      hostDataExists: !!profileResult.rows[0],
      hostData: profileResult.rows[0] || null,
      bookingsCount: bookingsResult.rows[0]?.count || 0,
      adminRouterLinked: !!adminRouter
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error in debug', error: error.message });
  }
});

// GET /api/host/profile - Get host profile
router.get('/profile', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.company,
          up.bio,
          up.profile_picture,
          up.preferences,
          up.host_info
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [hostId]
    );

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: 'Host profile not found' });
    }

    return res.json({
      success: true,
      data: {
        id: row.id,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        email: row.email || '',
        phone: row.phone || '',
        company: row.company || '',
        fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        bio: row.bio || '',
        profilePicture: row.profile_picture || '',
        preferences: row.preferences || {},
        hostInfo: row.host_info || {}
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching host profile', error: error.message });
  }
});

// GET /api/host/verification-data - Get submitted verification form data
router.get('/verification-data', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT
          business_name,
          business_type,
          business_address,
          id_type,
          id_number,
          tax_id,
          details,
          status,
          submitted_at
        FROM host_verifications
        WHERE host_user_id = $1
        ORDER BY updated_at DESC, submitted_at DESC, id DESC
        LIMIT 1
      `,
      [hostId]
    );

    if (result.rowCount === 0) {
      return res.json({
        data: null,
        message: 'No verification data found'
      });
    }

    const row = result.rows[0];

    return res.json({
      data: {
        businessName: row.business_name,
        businessType: row.business_type,
        businessAddress: row.business_address,
        idType: row.id_type,
        idNumber: row.id_number,
        taxId: row.tax_id,
        submittedAt: row.submitted_at,
        ...row.details
      },
      status: row.status
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching verification data', error: error.message });
  }
});

// POST /api/host/verify - Submit verification
router.post('/verify', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = req.app.locals.db;
    const existingVerificationResult = await db.query(
      `
        SELECT status, submitted_at
        FROM host_verifications
        WHERE host_user_id = $1
        ORDER BY updated_at DESC, submitted_at DESC, id DESC
        LIMIT 1
      `,
      [hostId]
    );

    if (existingVerificationResult.rowCount > 0 && existingVerificationResult.rows[0].status === 'pending') {
      return res.status(409).json({
        status: 'pending',
        message: 'Verification is already pending review. You cannot submit again until an admin decision is made.',
        submittedAt: existingVerificationResult.rows[0].submitted_at,
        verified: false
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      businessAddress,
      businessType,
      yearsOfExperience,
      propertyCount,
      expectedRevenue,
      bankName,
      accountNumber,
      routingNumber
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !bankName || !accountNumber) {
      return res.status(400).json({ message: 'Missing required verification fields' });
    }

    await db.query(
      `
        INSERT INTO host_verifications (
          host_user_id,
          business_name,
          business_type,
          business_address,
          id_type,
          id_number,
          tax_id,
          details,
          status,
          submitted_at,
          reviewed_at,
          reviewed_by,
          rejection_reason,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'pending', NOW(), NULL, NULL, '', NOW())
        ON CONFLICT (host_user_id)
        DO UPDATE SET
          business_name = EXCLUDED.business_name,
          business_type = EXCLUDED.business_type,
          business_address = EXCLUDED.business_address,
          id_type = EXCLUDED.id_type,
          id_number = EXCLUDED.id_number,
          tax_id = EXCLUDED.tax_id,
          details = EXCLUDED.details,
          status = 'pending',
          submitted_at = NOW(),
          reviewed_at = NULL,
          reviewed_by = NULL,
          rejection_reason = '',
          updated_at = NOW()
      `,
      [
        hostId,
        company || 'N/A',
        businessType || 'N/A',
        businessAddress || 'N/A',
        'Government ID',
        accountNumber.slice(-4),
        '',
        JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company,
          businessAddress,
          businessType,
          yearsOfExperience,
          propertyCount,
          expectedRevenue,
          bankName,
          accountNumber: `****${accountNumber.slice(-4)}`,
          routingNumber: routingNumber ? `****${routingNumber.slice(-4)}` : ''
        })
      ]
    );

    await db.query(
      `UPDATE users SET verification_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [hostId]
    );

    return res.json({
      id: hostId,
      status: 'pending',
      message: 'Verification submitted successfully and is pending admin approval',
      submittedAt: new Date().toISOString(),
      verified: false
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting verification', error: error.message });
  }
});

// POST /api/host/verification - Submit verification documents
router.post('/verification', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const fileFields = ['idDocumentPhoto', 'ownerHoldingIdPhoto', 'proofOfOwnership', 'additionalDocuments'];
    const parsedForm = await parseMultipartForm(req, {
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: fileFields.length,
      allowedFileFields: fileFields,
      onFile: async ({ fieldName, fileStream, filename, mimeType }) => {
        if (!isCloudinaryConfigured()) {
          throw new Error('File upload is not configured yet. Please set Cloudinary environment variables in backend/.env.');
        }

        const uploadResult = await uploadStreamToCloudinary(fileStream, {
          folder: `smartstay/host_verifications/${hostId}`,
          public_id: `${fieldName}_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
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

    const db = req.app.locals.db;
    const existingVerificationResult = await db.query(
      `
        SELECT status, submitted_at
        FROM host_verifications
        WHERE host_user_id = $1
        ORDER BY updated_at DESC, submitted_at DESC, id DESC
        LIMIT 1
      `,
      [hostId]
    );

    if (existingVerificationResult.rowCount > 0 && existingVerificationResult.rows[0].status === 'pending') {
      return res.status(409).json({
        status: 'pending',
        message: 'Verification is already pending review. You cannot submit again until an admin decision is made.',
        submittedAt: existingVerificationResult.rows[0].submitted_at,
        verified: false
      });
    }

    const { businessName, businessType, businessAddress, idType, idNumber, taxId, email, hostName } = parsedForm.fields;

    if (!businessName || !businessType || !businessAddress || !idType || !idNumber) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['businessName', 'businessType', 'businessAddress', 'idType', 'idNumber'],
        received: { businessName, businessType, businessAddress, idType, idNumber }
      });
    }

    const uploadedFiles = {};
    parsedForm.files.forEach((file) => {
      uploadedFiles[file.fieldName] = {
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.uploadResult.bytes || 0,
        fileId: file.uploadResult.public_id,
        fileUrl: file.uploadResult.secure_url,
        format: file.uploadResult.format,
        uploadedAt: new Date().toISOString()
      };
    });

    await db.query(
      `
        INSERT INTO host_verifications (
          host_user_id,
          business_name,
          business_type,
          business_address,
          id_type,
          id_number,
          tax_id,
          details,
          status,
          submitted_at,
          reviewed_at,
          reviewed_by,
          rejection_reason,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'pending', NOW(), NULL, NULL, '', NOW())
        ON CONFLICT (host_user_id)
        DO UPDATE SET
          business_name = EXCLUDED.business_name,
          business_type = EXCLUDED.business_type,
          business_address = EXCLUDED.business_address,
          id_type = EXCLUDED.id_type,
          id_number = EXCLUDED.id_number,
          tax_id = EXCLUDED.tax_id,
          details = EXCLUDED.details,
          status = 'pending',
          submitted_at = NOW(),
          reviewed_at = NULL,
          reviewed_by = NULL,
          rejection_reason = '',
          updated_at = NOW()
      `,
      [
        hostId,
        businessName,
        businessType,
        businessAddress,
        idType,
        idNumber,
        taxId || '',
        JSON.stringify({
          businessName,
          businessType,
          businessAddress,
          idType,
          idNumber,
          taxId: taxId || '',
          email: email || '',
          hostName: hostName || '',
          files: uploadedFiles
        })
      ]
    );

    await db.query(
      `UPDATE users SET verification_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [hostId]
    );

    return res.status(201).json({
      id: hostId,
      status: 'pending_review',
      message: 'Verification documents submitted successfully! Your submission is under review.',
      data: {
        businessName,
        businessType,
        businessAddress,
        idType,
        idNumber,
        taxId: taxId || '',
        files: uploadedFiles
      },
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    const statusCode = error.message.includes('multipart/form-data') || error.message.includes('File too large')
      ? 400
      : 500;
    return res.status(statusCode).json({ message: 'Error submitting verification', error: error.message });
  }
});

// GET /api/host/dashboard - Get host dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const db = req.app.locals.db;

    const [statsResult, recentBookingsResult, propertiesResult] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE((SELECT COUNT(*) FROM properties p WHERE p.host_id = $1 AND p.availability = true), 0)::int AS active_listings,
            COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.host_id = $1), 0)::int AS total_bookings,
            COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.host_id = $1 AND b.status = 'confirmed'), 0)::int AS upcoming_bookings,
            COALESCE((SELECT SUM(CASE WHEN pay.status = 'completed' THEN pay.host_payout ELSE 0 END) FROM payments pay WHERE pay.host_id = $1), 0)::numeric AS total_earnings
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            b.id,
            CONCAT_WS(' ', gu.first_name, gu.last_name) AS guest_name,
            b.check_in,
            b.check_out,
            b.status,
            b.total_amount
          FROM bookings b
          LEFT JOIN users gu ON gu.id = b.guest_id
          WHERE b.host_id = $1
          ORDER BY b.created_at DESC
          LIMIT 3
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            p.id,
            p.title,
            CASE WHEN p.availability THEN 'approved' ELSE 'inactive' END AS status,
            p.rating,
            COUNT(b.id)::int AS bookings
          FROM properties p
          LEFT JOIN bookings b ON b.property_id = p.id
          WHERE p.host_id = $1
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `,
        [hostId]
      )
    ]);

    const stats = statsResult.rows[0] || {};
    const totalEarnings = parseFloat(stats.total_earnings || 0);
    const monthlyRevenue = parseFloat((totalEarnings / 3).toFixed(2));

    return res.json({
      data: {
        stats: {
          activeListings: stats.active_listings || 0,
          totalBookings: stats.total_bookings || 0,
          upcomingBookings: stats.upcoming_bookings || 0,
          totalEarnings,
          monthlyRevenue,
          occupancyRate: stats.total_bookings > 0 ? Math.min(100, Math.round((stats.upcoming_bookings / stats.total_bookings) * 100)) : 0
        },
        recentBookings: recentBookingsResult.rows.map((row) => ({
          id: row.id,
          guestName: row.guest_name || 'Guest',
          checkIn: row.check_in,
          checkOut: row.check_out,
          status: row.status,
          totalAmount: parseFloat(row.total_amount || 0)
        })),
        properties: propertiesResult.rows.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          bookings: row.bookings,
          rating: parseFloat(row.rating || 0)
        })),
        alerts: [
          {
            id: 1,
            type: 'info',
            message: 'Dashboard is now powered by live database data.',
            date: new Date().toISOString()
          }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// GET /api/host/bookings - Get host bookings
router.get('/bookings', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { status, sort } = req.query;
    const db = req.app.locals.db;

    const where = ['b.host_id = $1'];
    const params = [hostId];

    if (status) {
      where.push(`b.status = $${params.length + 1}`);
      params.push(status);
    }

    const orderBy = sort === '-checkIn' ? 'b.check_in DESC' : 'b.check_in ASC';

    const result = await db.query(
      `
        SELECT
          b.id,
          b.property_id,
          b.guest_id,
          CONCAT_WS(' ', gu.first_name, gu.last_name) AS guest_name,
          b.check_in,
          b.check_out,
          b.guests,
          b.total_amount,
          b.status,
          b.payment_status,
          b.special_requests
        FROM bookings b
        LEFT JOIN users gu ON gu.id = b.guest_id
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy}
      `,
      params
    );

    return res.json({
      data: result.rows.map((row) => ({
        id: row.id,
        propertyId: row.property_id,
        guestId: row.guest_id,
        guestName: row.guest_name || 'Guest',
        checkIn: row.check_in,
        checkOut: row.check_out,
        guests: row.guests,
        totalAmount: parseFloat(row.total_amount || 0),
        status: row.status,
        paymentStatus: row.payment_status,
        specialRequests: row.special_requests || ''
      })),
      total: result.rows.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// PUT /api/host/bookings/:id/accept
router.put('/bookings/:id/accept', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const db = req.app.locals.db;

    const result = await db.query(
      `
        UPDATE bookings
        SET status = 'confirmed', updated_at = NOW()
        WHERE id = $1 AND host_id = $2
        RETURNING *
      `,
      [bookingId, hostId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error confirming booking', error: error.message });
  }
});

// PUT /api/host/bookings/:id/reject
router.put('/bookings/:id/reject', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const { reason } = req.body || {};
    const db = req.app.locals.db;

    const result = await db.query(
      `
        UPDATE bookings
        SET
          status = 'cancelled',
          special_requests = COALESCE(NULLIF($3, ''), special_requests),
          updated_at = NOW()
        WHERE id = $1 AND host_id = $2
        RETURNING *
      `,
      [bookingId, hostId, reason || 'Host declined']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({
      success: true,
      message: 'Booking rejected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// GET /api/host/financial - Get host financial data
router.get('/financial', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const db = req.app.locals.db;

    const [revenueResult, expensesResult, transactionsResult] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.host_payout ELSE 0 END), 0)::numeric AS total_revenue
          FROM payments p
          WHERE p.host_id = $1
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            id,
            expense_date,
            type,
            description,
            property,
            amount,
            category,
            created_at
          FROM host_expenses
          WHERE host_user_id = $1
          ORDER BY expense_date DESC, id DESC
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            b.id,
            b.check_out,
            b.total_amount,
            b.status,
            p.status AS payment_status
          FROM bookings b
          LEFT JOIN payments p ON p.booking_id = b.id
          WHERE b.host_id = $1
          ORDER BY b.updated_at DESC
          LIMIT 5
        `,
        [hostId]
      )
    ]);

    const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || 0);
    const expenses = expensesResult.rows.map((row) => ({
      id: row.id,
      date: row.expense_date,
      type: row.type,
      description: row.description,
      property: row.property,
      amount: parseFloat(row.amount || 0),
      category: row.category,
      createdAt: row.created_at
    }));
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    return res.json({
      data: {
        stats: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          commission: (totalRevenue * 0.03).toFixed(2)
        },
        monthlyData: [
          { month: 'Jan', revenue: parseFloat((totalRevenue * 0.3).toFixed(2)) },
          { month: 'Feb', revenue: parseFloat((totalRevenue * 0.33).toFixed(2)) },
          { month: 'Mar', revenue: parseFloat((totalRevenue * 0.37).toFixed(2)) }
        ],
        expenses,
        recentTransactions: transactionsResult.rows.map((row) => ({
          id: row.id,
          date: row.check_out,
          type: 'booking_income',
          amount: parseFloat(row.total_amount || 0),
          description: `Payment from booking #${row.id}`,
          status: row.payment_status || row.status || 'pending'
        })),
        bankDetails: {
          bankName: 'Connected Bank',
          accountLast4: '****'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching financial data', error: error.message });
  }
});

// POST /api/host/expenses - Add expense
router.post('/expenses', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { date, type, description, amount, category, property } = req.body || {};

    if (!date || !amount || !category) {
      return res.status(400).json({ message: 'Missing required expense fields' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        INSERT INTO host_expenses (
          host_user_id,
          expense_date,
          type,
          description,
          property,
          amount,
          category,
          created_at
        )
        VALUES ($1, $2::date, COALESCE($3, ''), COALESCE($4, ''), COALESCE($5, ''), $6, COALESCE($7, ''), NOW())
        RETURNING id, expense_date, type, description, property, amount, category, created_at
      `,
      [hostId, date, type, description, property, parseFloat(amount), category]
    );

    const row = result.rows[0];
    return res.json({
      success: true,
      message: 'Expense added successfully',
      data: {
        id: row.id,
        date: row.expense_date,
        type: row.type,
        description: row.description,
        property: row.property,
        amount: parseFloat(row.amount || 0),
        category: row.category,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
});

const initializeNewHost = async (hostId, firstName, lastName, email, company, db) => {
  if (!db) {
    return;
  }

  await db.query(
    `
      INSERT INTO user_profiles (user_id, bio, profile_picture, preferences, host_info, guest_info, updated_at)
      VALUES (
        $1,
        '',
        '',
        '{"notifications":true,"emailUpdates":true,"smsAlerts":true}'::jsonb,
        $2::jsonb,
        '{}'::jsonb,
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        host_info = EXCLUDED.host_info,
        updated_at = NOW()
    `,
    [
      hostId,
      JSON.stringify({
        company: company || '',
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        email: email || ''
      })
    ]
  );
};

router.initializeNewHost = initializeNewHost;

module.exports = router;
