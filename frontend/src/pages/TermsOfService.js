import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: March 16, 2026</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using our accommodation booking platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Our platform provides an online marketplace that connects property hosts with guests seeking short-term accommodations. We offer the following services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Property listing and management tools for hosts</li>
                <li>Booking and reservation system for guests</li>
                <li>Secure payment processing via QR code technology</li>
                <li>Messaging system between hosts and guests</li>
                <li>Review and rating system</li>
                <li>Customer support and dispute resolution</li>
                <li>Automated chatbot assistance</li>
                <li>Property recommendations and search functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use our services, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 User Types</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Guests:</strong> Users who book accommodations</li>
                <li><strong>Hosts:</strong> Users who list and rent their properties</li>
                <li><strong>Administrators:</strong> Platform managers with oversight capabilities</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">3.3 Account Verification</h3>
              <p className="text-gray-700 mb-4">
                Hosts may be subject to verification processes including identity verification, property verification, and background checks to ensure platform safety and quality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Host Responsibilities</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1 Property Listings</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate and up-to-date property information</li>
                <li>Upload genuine photos of the accommodation</li>
                <li>Set fair and competitive pricing</li>
                <li>Maintain property availability calendars</li>
                <li>Respond to booking requests within 24 hours</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Guest Communication</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide check-in instructions 24 hours before arrival</li>
                <li>Respond to guest messages promptly</li>
                <li>Provide access codes and special instructions as needed</li>
                <li>Be available for guest support during their stay</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">4.3 Property Standards</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Maintain clean and safe accommodations</li>
                <li>Ensure all advertised amenities are functional</li>
                <li>Comply with local laws and regulations</li>
                <li>Provide necessary safety equipment (smoke detectors, etc.)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Guest Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate booking information</li>
                <li>Treat the property with respect and care</li>
                <li>Follow house rules and check-in/check-out procedures</li>
                <li>Report any damages or issues immediately</li>
                <li>Complete payment according to the specified terms</li>
                <li>Leave honest and fair reviews</li>
                <li>Comply with occupancy limits</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Booking and Payment Terms</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.1 Booking Process</h3>
              <p className="text-gray-700 mb-4">
                Bookings are confirmed upon successful payment processing. Guests will receive a confirmation email with booking details and payment receipt via QR code.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.2 Payment Methods</h3>
              <p className="text-gray-700 mb-4">
                We accept payments via QR code technology. After booking, guests receive a QR code to scan and complete payment securely through their preferred payment method.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.3 Security Deposits</h3>
              <p className="text-gray-700 mb-4">
                A security deposit is required for all bookings and will be returned within 7 days after checkout if there are no damages or policy violations.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.4 Promotional Codes</h3>
              <p className="text-gray-700 mb-4">
                Promotional codes may be offered at our discretion and are subject to specific terms, conditions, and expiration dates. Codes cannot be combined with other offers unless explicitly stated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellation Policy</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7.1 Guest Cancellations</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Cancellations 48+ hours before check-in: Full refund</li>
                <li>Cancellations within 48 hours: Subject to 50% cancellation fee</li>
                <li>No-shows: No refund</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">7.2 Host Cancellations</h3>
              <p className="text-gray-700 mb-4">
                Hosts who cancel confirmed bookings may be subject to penalties and must provide alternative accommodations or full refunds to affected guests.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">7.3 Booking Modifications</h3>
              <p className="text-gray-700 mb-4">
                Guests can modify booking dates from their dashboard, subject to availability. Changes may affect the total price and are subject to the host's approval.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Platform Fees and Commissions</h2>
              <p className="text-gray-700 mb-4">
                Our platform charges service fees to both hosts and guests to maintain and improve our services. Fee structures are clearly disclosed during the booking process and may include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Guest service fees (added to booking total)</li>
                <li>Host commission fees (deducted from payout)</li>
                <li>Payment processing fees</li>
                <li>Additional fees for premium features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Reviews and Ratings</h2>
              <p className="text-gray-700 mb-4">
                Both hosts and guests may leave reviews after a completed stay. Reviews must be:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Honest and based on actual experience</li>
                <li>Respectful and non-discriminatory</li>
                <li>Relevant to the accommodation and service</li>
                <li>Free from personal attacks or inappropriate content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">Users are prohibited from:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Using the platform for illegal activities</li>
                <li>Discriminating against users based on protected characteristics</li>
                <li>Creating fake accounts or providing false information</li>
                <li>Attempting to circumvent platform fees</li>
                <li>Harassing or threatening other users</li>
                <li>Violating intellectual property rights</li>
                <li>Posting inappropriate or offensive content</li>
                <li>Using automated systems to manipulate the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy and personal data. Our data collection, use, and sharing practices are detailed in our Privacy Policy, which is incorporated by reference into these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">12.1 Platform Mediation</h3>
              <p className="text-gray-700 mb-4">
                We provide dispute resolution services for conflicts between hosts and guests. Our support team will investigate issues and work toward fair resolutions.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">12.2 Escalation Process</h3>
              <p className="text-gray-700 mb-4">
                Unresolved disputes may be escalated to binding arbitration. Users agree to resolve disputes through arbitration rather than court proceedings, except where prohibited by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Our platform serves as an intermediary between hosts and guests. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>The condition, safety, or legality of listed properties</li>
                <li>The accuracy of property descriptions or photos</li>
                <li>The conduct of hosts or guests</li>
                <li>Property damage or personal injury</li>
                <li>Loss of personal belongings</li>
                <li>Failure to complete bookings due to circumstances beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Account Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose risks to other users or the platform's integrity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Terms of Service periodically. Users will be notified of significant changes via email or platform notifications. Continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact our support team through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>In-platform messaging system</li>
                <li>Customer support chatbot</li>
                <li>Email support (available through your account dashboard)</li>
                <li>Help center and FAQ section</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service are governed by and construed in accordance with the laws of the Philippines. Any disputes arising from these terms will be subject to the jurisdiction of Philippine courts.
              </p>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600 text-center">
                By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;