import React from 'react';
import { motion, useScroll } from 'framer-motion';

/** Skiper19 career path, drawn progressively with the page scroll. */
export const CareerJourneyLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1278 2670"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <motion.path
          d="M 1090 0 C 1220 120 1200 230 1060 340 C 900 465 770 520 830 660 C 890 800 1120 810 1135 960 C 1150 1110 950 1200 790 1300 C 630 1400 650 1550 820 1660 C 990 1770 1180 1820 1110 1970 C 1040 2120 830 2180 730 2310 C 630 2440 780 2570 960 2670"
          stroke="#C2F84F"
          strokeWidth="5"
          strokeLinecap="butt"
          strokeOpacity="0.9"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
    </div>
  );
};