const mapPropertyRow = (row) => {
  const timeAvailability = row.time_availability || { checkInTime: '15:00', checkOutTime: '11:00' };
  const bookingType = timeAvailability.bookingType || 'fixed';
  const houseRules = timeAvailability.houseRules || '';
  const hourlyRate = timeAvailability.hourlyRate !== undefined && timeAvailability.hourlyRate !== null
    ? parseFloat(timeAvailability.hourlyRate)
    : null;
  const extraGuestFee = timeAvailability.extraGuestFee !== undefined && timeAvailability.extraGuestFee !== null
    ? parseFloat(timeAvailability.extraGuestFee)
    : 0;

  return {
    id: row.id,
    hostId: row.host_id,
    hostName: row.host_name || null,
    hostEmail: row.host_email || null,
    title: row.title,
    description: row.description,
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    maxGuests: row.max_guests,
    pricePerNight: parseFloat(row.price_per_night),
    address: row.address || {},
    amenities: row.amenities || [],
    images: row.images || [],
    availability: row.availability,
    rating: parseFloat(row.rating),
    reviewCount: row.review_count,
    bookingType,
    hourlyRate,
    extraGuestFee,
    houseRules,
    timeAvailability,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const createPropertiesRepository = (pool) => {
  if (!pool) {
    throw new Error('A PostgreSQL pool is required to use the properties repository');
  }

  const getAllProperties = async (filters = {}) => {
    let query = `
      SELECT
        p.*,
        CONCAT_WS(' ', u.first_name, u.last_name) AS host_name,
        u.email AS host_email
      FROM properties p
      LEFT JOIN users u ON u.id = p.host_id
      WHERE p.availability = true
    `;
    const params = [];

    if (filters.hostId) {
      query += ` AND p.host_id = $${params.length + 1}`;
      params.push(filters.hostId);
    }

    if (filters.type) {
      query += ` AND p.type = $${params.length + 1}`;
      params.push(filters.type);
    }

    if (filters.minPrice !== undefined) {
      query += ` AND p.price_per_night >= $${params.length + 1}`;
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query += ` AND p.price_per_night <= $${params.length + 1}`;
      params.push(filters.maxPrice);
    }

    if (filters.search) {
      query += ` AND (p.title ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm);
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(mapPropertyRow);
  };

  const getPropertyById = async (id) => {
    const result = await pool.query(
      `
        SELECT
          p.*,
          CONCAT_WS(' ', u.first_name, u.last_name) AS host_name,
          u.email AS host_email
        FROM properties p
        LEFT JOIN users u ON u.id = p.host_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [id]
    );

    return result.rows[0] ? mapPropertyRow(result.rows[0]) : null;
  };

  const getPropertiesByHostId = async (hostId) => {
    const result = await pool.query(
      `
        SELECT
          p.*,
          CONCAT_WS(' ', u.first_name, u.last_name) AS host_name,
          u.email AS host_email
        FROM properties p
        LEFT JOIN users u ON u.id = p.host_id
        WHERE p.host_id = $1
        ORDER BY p.created_at DESC
      `,
      [hostId]
    );

    return result.rows.map(mapPropertyRow);
  };

  const createProperty = async (propertyData) => {
    const {
      hostId,
      title,
      description,
      type,
      bedrooms,
      bathrooms,
      maxGuests,
      pricePerNight,
      address,
      amenities = [],
      images = [],
      availability = true,
      bookingType = 'fixed',
      hourlyRate = null,
      extraGuestFee = 0,
      houseRules = '',
      timeAvailability = { checkInTime: '15:00', checkOutTime: '11:00' }
    } = propertyData;

    const mergedTimeAvailability = {
      ...timeAvailability,
      bookingType,
      hourlyRate,
      extraGuestFee,
      houseRules
    };

    const result = await pool.query(
      `
        INSERT INTO properties (
          host_id,
          title,
          description,
          type,
          bedrooms,
          bathrooms,
          max_guests,
          price_per_night,
          address,
          amenities,
          images,
          availability,
          time_availability,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13::jsonb, NOW(), NOW())
        RETURNING *
      `,
      [
        hostId,
        title,
        description,
        type,
        bedrooms,
        bathrooms,
        maxGuests,
        pricePerNight,
        JSON.stringify(address),
        amenities,
        images,
        availability,
        JSON.stringify(mergedTimeAvailability)
      ]
    );

    return mapPropertyRow(result.rows[0]);
  };

  const updateProperty = async (id, propertyData) => {
    const fields = [];
    const params = [];
    let paramCount = 1;

    Object.entries(propertyData).forEach(([key, value]) => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (dbKey === 'address' || dbKey === 'time_availability') {
        fields.push(`${dbKey} = $${paramCount}::jsonb`);
        params.push(JSON.stringify(value));
      } else if (dbKey === 'amenities' || dbKey === 'images') {
        fields.push(`${dbKey} = $${paramCount}::text[]`);
        params.push(Array.isArray(value) ? value : []);
      } else {
        fields.push(`${dbKey} = $${paramCount}`);
        params.push(value);
      }
      paramCount += 1;
    });

    if (fields.length === 0) {
      return getPropertyById(id);
    }

    fields.push(`updated_at = $${paramCount}`);
    params.push(new Date());
    paramCount += 1;

    params.push(id);

    const result = await pool.query(
      `UPDATE properties SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    return result.rows[0] ? mapPropertyRow(result.rows[0]) : null;
  };

  const deleteProperty = async (id) => {
    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0] ? mapPropertyRow(result.rows[0]) : null;
  };

  const updatePropertyRating = async (propertyId, rating, reviewCount) => {
    const result = await pool.query(
      `
        UPDATE properties 
        SET rating = $1, review_count = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `,
      [rating, reviewCount, propertyId]
    );

    return result.rows[0] ? mapPropertyRow(result.rows[0]) : null;
  };

  return {
    getAllProperties,
    getPropertyById,
    getPropertiesByHostId,
    createProperty,
    updateProperty,
    deleteProperty,
    updatePropertyRating
  };
};

module.exports = {
  createPropertiesRepository
};
