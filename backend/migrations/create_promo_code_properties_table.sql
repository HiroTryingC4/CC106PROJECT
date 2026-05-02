CREATE TABLE IF NOT EXISTS promo_code_properties (
  promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  PRIMARY KEY (promo_code_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_code_properties_promo ON promo_code_properties(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_properties_property ON promo_code_properties(property_id);
