import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import API_CONFIG from '../config/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.ROOT}/api/faqs`);
        setFaqs(response.data.faqs || []);
      } catch (error) {
        console.error('Error loading FAQs:', error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const toggleFaq = (faqId) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner text="Loading FAQs..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full-width header section */}
      <div className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find answers to common questions about Smart Stay</p>
          </div>
        </div>
      </div>

      {/* Full-width content section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* FAQs Content */}
        {faqs.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">❓</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No FAQs Available</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Our support team is working on adding helpful FAQs. Please check back soon.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Group FAQs by category */}
            {Object.entries(
              faqs.reduce((acc, faq) => {
                const category = faq.category || 'general';
                if (!acc[category]) acc[category] = [];
                acc[category].push(faq);
                return acc;
              }, {})
            ).map(([category, categoryFaqs]) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                {/* Category Header */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                </div>
                
                {/* Category FAQs */}
                <div className="divide-y divide-gray-100">
                  {categoryFaqs.map((faq) => (
                    <div key={faq.id}>
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-6 group-hover:text-[#4E7B22] transition-colors">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0">
                          {openFaq === faq.id ? (
                            <ChevronUpIcon className="w-6 h-6 text-[#4E7B22]" />
                          ) : (
                            <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-[#4E7B22] transition-colors" />
                          )}
                        </div>
                      </button>
                      
                      {openFaq === faq.id && (
                        <div className="px-8 pb-6 bg-green-50 border-t border-green-100">
                          <div className="pt-6">
                            <p className="text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-20 bg-[#4E7B22] rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you 24/7!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              className="bg-white text-[#4E7B22] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </button>
            <a
              href="mailto:support@smartstay.com"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-[#4E7B22] transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Admin Note */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-base text-gray-600">
            FAQs are managed by our Communication Admin team and updated regularly to help you better.
          </p>
          <p className="text-sm text-gray-400">
            Currently showing {faqs.length} FAQs • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{backgroundColor: '#0C1805'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4" style={{color: '#4E7B22'}}>Smart Stay</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Your trusted platform for booking amazing properties with ease and confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/units" className="hover:text-white transition-colors">Browse Units</a></li>
                <li><a href="/recommendations" className="hover:text-white transition-colors">Recommendations</a></li>
                <li><a href="/faqs" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <p>Email: info@smartstay.com</p>
                <p>Phone: +1 (234) 567-8900</p>
                <p>Address: 123 Main St, City, State</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQs;