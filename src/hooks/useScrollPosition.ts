
import { useEffect } from 'react';

export const useScrollPosition = () => {
  useEffect(() => {
    // Set scroll restoration to manual
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Only restore scroll position if there's a saved position
    const savedScrollPos = sessionStorage.getItem('scrollPosition');
    if (savedScrollPos !== null) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem('scrollPosition');
      });
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
