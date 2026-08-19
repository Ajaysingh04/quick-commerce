import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/who-are-we': 'Who We Are',
  '/careers': 'Careers at RoseDash',
  '/press': 'Press & Media',
  '/security': 'Security',
  '/contact': 'Contact Us',
  '/faq': 'Frequently Asked Questions',
  '/cancellation': 'Cancellation & Refund Policies',
  '/shipping': 'Delivery Policies',
  '/partner/register': 'Partner With Us',
  '/delivery/register': 'Ride With Us',
  '/corporate': 'Corporate Information',
  '/app': 'Download The App',
  '/tracking': 'Track Your Order'
};

const StaticPage = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Information';

  return (
    <div className="min-h-[60vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-6">{title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          This is a placeholder page for <strong>{title}</strong>. 
          Real content (like contact forms, FAQ accordions, or company information) will be added here soon.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="bg-[#971273] hover:bg-[#7a0e5c] text-white px-6 py-2 rounded font-bold transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default StaticPage;
