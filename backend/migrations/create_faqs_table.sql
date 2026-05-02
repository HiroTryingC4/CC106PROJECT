-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);

-- Insert default FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('What is SmartStay?', 'SmartStay is a modern booking platform that connects guests with quality accommodations. We offer a seamless booking experience with secure payments and real-time communication.', 'general', 1),
('How do I book a property?', 'Browse available properties, select your dates, review the details, and click "Book Now". You''ll need to create an account and complete the payment process to confirm your booking.', 'booking', 2),
('What payment methods do you accept?', 'We accept GCash, bank transfers, and other digital payment methods. All payments are processed securely through our platform.', 'payment', 3),
('Can I cancel my booking?', 'Yes, you can cancel your booking from your booking history page. Cancellation policies vary by property, so please review the specific terms before booking.', 'booking', 4),
('How do I become a host?', 'Click "Become a Host" in the navigation menu, complete the verification process, and start listing your properties. Our team will review your application within 24-48 hours.', 'hosting', 5),
('Is my payment information secure?', 'Yes, we use industry-standard encryption and secure payment gateways to protect your financial information. We never store your complete payment details.', 'payment', 6),
('How do I contact customer support?', 'You can reach us through the chat feature on our website, send a message through the contact form, or email us directly. We typically respond within 24 hours.', 'general', 7),
('What if I have issues with my booking?', 'Contact the host directly through our messaging system. If the issue isn''t resolved, our support team is available to help mediate and find a solution.', 'booking', 8)
ON CONFLICT DO NOTHING;
