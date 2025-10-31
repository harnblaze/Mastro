import { useEffect, useState } from 'react';

interface UseMobileResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export function useMobile(): UseMobileResult {
  const getWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [width, setWidth] = useState<number>(getWidth());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 640; // < sm
  const isTablet = width >= 640 && width < 1024; // sm..md/lg
  const isDesktop = width >= 1024; // >= lg

  return { isMobile, isTablet, isDesktop, width };
}


