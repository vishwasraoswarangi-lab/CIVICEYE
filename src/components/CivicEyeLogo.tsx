import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const CivicEyeLogo: React.FC<LogoProps> = ({ className = 'w-8 h-8', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Vibrant Gradient for the Letter C */}
        <linearGradient id="civicCGrad" x1="8" y1="8" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.6" stopColor="#0284C7" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>

        {/* Iris Gradient */}
        <radialGradient id="irisGrad" cx="22" cy="22" r="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="0.7" stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </radialGradient>
      </defs>

      {/* Modern Badge Container */}
      <rect width="44" height="44" rx="12" fill="#0F172A" />

      {/* Bold Letter 'C' */}
      <path
        d="M32 14.5C29.4 11.2 25.5 9.5 21 9.5C13.8 9.5 8 15.1 8 22C8 28.9 13.8 34.5 21 34.5C25.5 34.5 29.4 32.8 32 29.5"
        stroke="url(#civicCGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Eye Contour inside the 'C' */}
      <path
        d="M14 22C16.8 17.5 22.8 17.5 28 22C22.8 26.5 16.8 26.5 14 22Z"
        fill="#1E293B"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Iris */}
      <circle cx="21" cy="22" r="4.2" fill="url(#irisGrad)" />

      {/* Pupil */}
      <circle cx="21" cy="22" r="2.2" fill="#0F172A" />

      {/* Catchlight (Bright Eye Reflection) */}
      <circle cx="22.3" cy="20.7" r="1.1" fill="#FFFFFF" />
    </svg>
  );
};
