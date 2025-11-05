import { useEffect } from 'react';
import { useMotionValue } from 'motion/react';

export const useWindowScrollY = () => {
  const scrollY = useMotionValue(window?.scrollY || 0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  return scrollY;
};