// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for server-side rendering)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Update state on initial check
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener for changes
    const listener = () => {
      setMatches(media.matches);
    };

    // Add the listener
    // The 'change' event is the modern way, but 'addListener' is needed for older browsers.
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener); // Deprecated but good for fallback
    }

    // Cleanup on unmount
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener); // Deprecated but good for fallback
      }
    };
  }, [matches, query]);

  return matches;
}