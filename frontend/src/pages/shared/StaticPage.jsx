import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../services/api.js';

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
  '/tracking': 'Track Your Order',
  '/terms': 'Terms of Service',
  '/privacy': 'Privacy Policy'
};

const StaticPage = () => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const fallbackTitle = pageTitles[location.pathname] || 'Information';

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await API.get(`/pages/slug/${slug}`);
        setPage(res.data);
      } catch (error) {
        console.error('Page not found in DB, using fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded shadow-md">
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center">{page ? page.title : fallbackTitle}</h1>
        {page && page.content ? (
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.content }}></div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-8 leading-relaxed">
              This is a placeholder page for <strong>{fallbackTitle}</strong>. 
              Real content (like contact forms, FAQ accordions, or company information) will be added here soon.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-[#971273] hover:bg-[#7a0e5c] text-white px-6 py-2 rounded font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticPage;
