-- Add host reply columns to property_reviews table
ALTER TABLE property_reviews
ADD COLUMN host_reply TEXT,
ADD COLUMN host_reply_date TIMESTAMP;
