import { useEffect } from 'react';

// Counts how many popups are open, so closing one popup
// doesn't unlock the page while another popup is still open
let openPopups = 0;

// Stops the page behind a popup from scrolling while the popup is open
export function useLockBodyScroll() {
  useEffect(() => {
    openPopups += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      openPopups -= 1;
      if (openPopups === 0) document.body.style.overflow = '';
    };
  }, []);
}
