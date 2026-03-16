import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, PhoneIcon } from '@heroicons/react/24/outline';

const HelpCenter = () => {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Understanding user roles',
        'Platform overview'
      ]
    },
    {
      title: 'For Guests',
      icon: '🏠',
      articles: [
        'How to search for properties',
        'Making a booking',
        'Payment methods',
        'Check-in process',
        'Cancellation policy'
      ]
    },
    {
      title: 'For Hosts',
      icon: '🔑',
      articles: [
        'Creating your first listing',
        'Setting competitive prices',
        'Managing bookings',
        'Host verification process',
        'Promotional codes'
      ]
    },
    {
      title: 'Payments & Billing',
      icon: '💳',
      articles: [
        'QR code payments',
        'Security deposits',
        'Refund process',
        'Payment troubleshooting',
        'Tax information'
      ]
    },
    {
      title: 'Safety & Security',
      icon: '🛡️',
      articles: [
        'Account security',
        'Two-factor authentication',
        'Reporting issues',
        'Community guidelines',
        'Emergency contacts'
      ]
    },
    {
      title: 'Technical Support',
      icon: '⚙️',
      articles: [
        'App troubleshooting',
        'Browser compatibility',
        'Mobile app issues',
        'Account recovery',
        'Feature requests'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to your questions and get the help you need</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Get instant help from our support team</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <PhoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Support</h3>
            <p className="text-gray-600 mb-4">Speak directly with our support team</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Call Now
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <QuestionMarkCircleIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQs</h3>
            <p className="text-gray-600 mb-4">Browse frequently asked questions</p>
            <Link 
              to="/faqs"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View FAQs
            </Link>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{category.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a 
                      href="#" 
                      className="text-gray-600 hover:text-green-600 transition-colors text-sm block py-1"
                    >
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a 
                  href="#" 
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  View all articles →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-green-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Contact Support
            </Link>
            <button className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-600 hover:text-white transition-colors font-medium">
              Submit a Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;