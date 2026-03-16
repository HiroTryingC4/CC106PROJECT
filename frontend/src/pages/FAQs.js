import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load FAQs from localStorage
    const loadFaqs = () => {
      try {
        const storedFaqs = JSON.parse(localStorage.getItem('smartStayFaqs') || '[]');
        console.log('FAQ Page: Loading FAQs from localStorage:', storedFaqs.length);
        
        // Default FAQs to ensure we always have content
        const defaultFaqs = [
          {
            id: 1,
            category: "General",
            question: "What is Smart Stay?",
            answer: "Smart Stay is an AI-driven web-based platform for intelligent property booking and host financial management. We provide smart recommendations, automated chatbot support, and comprehensive analytics for both guests and hosts."
          },
          {
            id: 2,
            category: "General",
            question: "How do I create an account?",
            answer: "You can create an account by clicking the 'Sign Up' button on our homepage. Choose whether you want to register as a guest or host, fill in your details, and verify your email address to get started."
          },
          {
            id: 3,
            category: "General",
            question: "Is Smart Stay free to use?",
            answer: "Yes, Smart Stay is free to browse and search properties. Guests can create accounts and browse listings at no cost. Hosts can list their first property for free, with optional premium features available for enhanced visibility and analytics."
          },
          {
            id: 4,
            category: "General",
            question: "What makes Smart Stay different from other booking platforms?",
            answer: "Smart Stay uses advanced AI technology to provide personalized property recommendations, automated customer support through our intelligent chatbot, comprehensive financial analytics for hosts, and seamless QR code payment processing for secure transactions."
          },
          {
            id: 5,
            category: "Guests FAQ",
            question: "How can I book a property?",
            answer: "To book a property: 1) Browse available properties using our search filters, 2) Select your desired dates and number of guests, 3) Review property details and host information, 4) Complete the booking form with your details, 5) Make payment using our secure QR code system."
          },
          {
            id: 6,
            category: "Guests FAQ",
            question: "Can I browse properties without an account?",
            answer: "Yes, you can browse all available properties, view photos, read descriptions, and check availability without creating an account. However, you'll need to create a free account to make bookings and access personalized recommendations."
          },
          {
            id: 7,
            category: "Guests FAQ",
            question: "How does the AI recommendation system work?",
            answer: "Our AI recommendation system analyzes your browsing history, previous bookings, preferences, and search patterns to suggest properties that match your interests. The more you use Smart Stay, the better our recommendations become."
          },
          {
            id: 8,
            category: "Guests FAQ",
            question: "What payment methods do you accept?",
            answer: "We accept payments via QR code technology supporting major payment platforms including GCash, PayMaya, and bank transfers. After booking confirmation, you'll receive a secure QR code to complete your payment."
          }
        ];
        
        // If no stored FAQs or stored FAQs are empty, use defaults
        if (storedFaqs.length === 0) {
          console.log('FAQ Page: No stored FAQs found, using defaults');
          localStorage.setItem('smartStayFaqs', JSON.stringify(defaultFaqs));
          setFaqs(defaultFaqs);
        } else {
          console.log('FAQ Page: Using stored FAQs');
          setFaqs(storedFaqs);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
        setFaqs([]);
      }
      setLoading(false);
    };

    loadFaqs();

    // Listen for localStorage changes to update FAQs in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'smartStayFaqs') {
        console.log('FAQ Page: localStorage changed, reloading FAQs');
        loadFaqs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    const handleFaqUpdate = () => {
      console.log('FAQ Page: FAQ update event received');
      loadFaqs();
    };
    
    window.addEventListener('faqsUpdated', handleFaqUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('faqsUpdated', handleFaqUpdate);
    };
  }, []);

  const toggleFaq = (faqId) => {
    setOpenFaq(openFaq === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading FAQs...</p>
          </div>
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
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <h1 className="text-5xl font-bold text-gray-900">Frequently Asked Questions</h1>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find answers to common questions about Smart Stay</p>
            {/* Debug info for testing */}
            <div className="mt-4 text-sm text-gray-400">
              Debug: {faqs.length} FAQs loaded • Storage key: smartStayFaqs
            </div>
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
                const category = faq.category || 'General';
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
    </div>
  );
};

export default FAQs;