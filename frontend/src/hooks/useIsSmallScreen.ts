import { useEffect, useState } from "react";

export function useIsSmallScreen(breakpoint = 768) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      setIsSmall(window.innerWidth < breakpoint);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);

  return isSmall;
}