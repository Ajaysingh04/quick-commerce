import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever a user navigates between routes,
 * clicks on a product/store/category, or switches panels, the window and all scroll
 * containers immediately reset to the top (0, 0) without displaying the footer or jumpy smooth scrolls.
 */
const ScrollToTop = () => {
  const { pathname, search, key } = useLocation();

  useLayoutEffect(() => {
    // Immediate synchronous reset before browser paint
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, key]);

  useEffect(() => {
    // Secondary reset after component tree mounts / images or async frames load
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const scrollContainers = document.querySelectorAll(
      'main, #root, [data-scroll-container], .overflow-y-auto, .overflow-auto'
    );
    scrollContainers.forEach((el) => {
      if (el) el.scrollTop = 0;
    });
  }, [pathname, search, key]);

  return null;
};

export default ScrollToTop;
