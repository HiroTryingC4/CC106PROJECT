const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

Object.assign(process.env, envConfig);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartstay',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

async function cleanupProperties() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Show current properties
    console.log('\n=== Current Properties ===');
    const allProperties = await client.query(`
      SELECT id, title, host_id, type, price_per_night 
      FROM properties 
      ORDER BY id
    `);
    console.log(`Total properties: ${allProperties.rowCount}`);
    allProperties.rows.forEach(p => {
      console.log(`ID: ${p.id}, Host: ${p.host_id}, Title: ${p.title}, Type: ${p.type}, Price: ₱${p.price_per_night}`);
    });

    // Keep only properties owned by host ID 8
    const keepHostId = 8;

    // Get property IDs to delete
    const propertiesToDelete = await client.query(`
      SELECT id FROM properties WHERE host_id != $1
    `, [keepHostId]);

    const deletePropertyIds = propertiesToDelete.rows.map(p => p.id);
    console.log(`\n=== Properties to Delete (${deletePropertyIds.length}) ===`);
    console.log(deletePropertyIds);

    if (deletePropertyIds.length > 0) {
      // Delete related data for properties we're removing
      console.log('\n=== Deleting related data ===');

      // Delete property reviews
      const deleteReviews = await client.query(`
        DELETE FROM property_reviews 
        WHERE property_id = ANY($1)
        RETURNING id
      `, [deletePropertyIds]);
      console.log(`Deleted ${deleteReviews.rowCount} reviews`);

      // Delete bookings
      const deleteBookings = await client.query(`
        DELETE FROM bookings 
        WHERE property_id = ANY($1)
        RETURNING id
      `, [deletePropertyIds]);
      console.log(`Deleted ${deleteBookings.rowCount} bookings`);

      // Delete property images (if table exists)
      try {
        const deleteImages = await client.query(`
          DELETE FROM property_images 
          WHERE property_id = ANY($1)
          RETURNING id
        `, [deletePropertyIds]);
        console.log(`Deleted ${deleteImages.rowCount} property images`);
      } catch (err) {
        if (err.code !== '42P01') throw err;
        console.log('Property images table does not exist, skipping...');
      }

      // Delete property amenities (if table exists)
      try {
        const deleteAmenities = await client.query(`
          DELETE FROM property_amenities 
          WHERE property_id = ANY($1)
          RETURNING id
        `, [deletePropertyIds]);
        console.log(`Deleted ${deleteAmenities.rowCount} property amenities`);
      } catch (err) {
        if (err.code === '42P01') {
          console.log('Property amenities table does not exist, skipping...');
        } else {
          console.log(`Error deleting amenities: ${err.message}`);
        }
      }

      // Delete favorites (if table exists)
      try {
        const deleteFavorites = await client.query(`
          DELETE FROM favorites 
          WHERE property_id = ANY($1)
          RETURNING id
        `, [deletePropertyIds]);
        console.log(`Deleted ${deleteFavorites.rowCount} favorites`);
      } catch (err) {
        if (err.code === '42P01') {
          console.log('Favorites table does not exist, skipping...');
        } else {
          console.log(`Error deleting favorites: ${err.message}`);
        }
      }

      // Delete properties
      const deleteProperties = await client.query(`
        DELETE FROM properties 
        WHERE host_id != $1
        RETURNING id, title
      `, [keepHostId]);
      console.log(`\n=== Deleted ${deleteProperties.rowCount} properties ===`);
      deleteProperties.rows.forEach(p => {
        console.log(`Deleted property ID: ${p.id}, Title: ${p.title}`);
      });
    }

    await client.query('COMMIT');

    // Show remaining properties
    console.log('\n=== Remaining Properties ===');
    const remainingProperties = await client.query(`
      SELECT id, title, host_id, type, price_per_night, bedrooms, bathrooms 
      FROM properties 
      ORDER BY id
    `);
    console.log(`Total properties: ${remainingProperties.rowCount}`);
    remainingProperties.rows.forEach(p => {
      console.log(`ID: ${p.id}, Host: ${p.host_id}, Title: ${p.title}, Type: ${p.type}, Price: ₱${p.price_per_night}, Beds: ${p.bedrooms}, Baths: ${p.bathrooms}`);
    });

    console.log('\n✅ Property cleanup completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupProperties().catch(console.error);
