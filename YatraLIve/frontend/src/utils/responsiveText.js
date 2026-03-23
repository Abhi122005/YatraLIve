// Responsive text sizing utility
// Automatically scales text based on screen size
import React from 'react';

export const getScreenSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width <= 480) return 'mobile-small';
  if (width <= 768) return 'mobile-large';
  if (width <= 1024) return 'tablet';
  if (width <= 1440) return 'laptop';
  if (width <= 2160) return 'desktop';
  return 'tv-large';
};

export const responsiveTextSizes = {
  'mobile-small': {
    // Small mobile phones (320px - 480px)
    h1: '10px',
    h2: '8px',
    h3: '7px',
    body: '8px',
    small: '7px',
    lineHeight: 1.05,
  },
  'mobile-large': {
    // Large phones (481px - 768px)
    h1: '13px',
    h2: '11px',
    h3: '9px',
    body: '10px',
    small: '8px',
    lineHeight: 1.1,
  },
  'tablet': {
    // Tablets (769px - 1024px)
    h1: '22px',
    h2: '18px',
    h3: '15px',
    body: '13px',
    small: '11px',
    lineHeight: 1.3,
  },
  'laptop': {
    // Laptops (1025px - 1440px)
    h1: '28px',
    h2: '22px',
    h3: '18px',
    body: '14px',
    small: '11px',
    lineHeight: 1.4,
  },
  'desktop': {
    // Desktops (1441px - 2160px)
    h1: '36px',
    h2: '28px',
    h3: '22px',
    body: '15px',
    small: '12px',
    lineHeight: 1.5,
  },
  'tv-large': {
    // Large displays/TVs (2161px+)
    h1: '48px',
    h2: '36px',
    h3: '28px',
    body: '18px',
    small: '14px',
    lineHeight: 1.6,
  },
};

// Get responsive font size for element
export const getResponsiveSize = (element) => {
  const screenSize = getScreenSize();
  return responsiveTextSizes[screenSize]?.[element] || responsiveTextSizes['laptop']?.[element];
};

// Hook for responsive sizing
export const useResponsiveText = () => {
  const [screenSize, setScreenSize] = React.useState(getScreenSize());

  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return {
    screenSize,
    sizes: responsiveTextSizes[screenSize] || responsiveTextSizes['laptop'],
  };
};

export default {
  getScreenSize,
  getResponsiveSize,
  responsiveTextSizes,
  useResponsiveText,
};
