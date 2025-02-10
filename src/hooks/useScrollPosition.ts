
import { useEffect } from 'react';

export const useScrollPosition = () => {
  useEffect(() => {
    // Restore scroll position on page load
    const savedScrollPos = sessionStorage.getItem('scrollPosition');
    if (savedScrollPos) {
      window.scrollTo(0, parseInt(savedScrollPos));
      sessionStorage.removeItem('scrollPosition');
    }

    // Save scroll position before unload
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
