import { useEffect } from 'react';
import { useMotionValue } from 'motion/react';

export const useWindowScrollY = () => {
  const scrollY = useMotionValue(0);

  useEffect(() => {
    scrollY.set(window.scrollY);

    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  return scrollY;
};