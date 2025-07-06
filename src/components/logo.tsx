import React from 'react';

export function Logo({ width = 36, height = 36, ...props }: React.SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={width} height={height} {...props}>
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="170" height="170" rx="40" ry="40" fill="url(#bg-gradient)" />
      <rect x="25" y="25" width="150" height="150" rx="32" ry="32" fill="url(#highlight-gradient)" />
      <circle cx="100" cy="100" r="60" fill="#1d4ed8" opacity="0.7" />
      <g transform="translate(50, 50) scale(0.5)">
        <path d="M80,40 L110,40 Q120,40 130,45 Q140,50 145,60 Q150,70 150,80 Q150,90 145,100 Q140,110 130,115 Q120,120 110,120 L80,120"
          stroke="#ffffff" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M120,80 L90,80 Q80,80 70,85 Q60,90 55,100 Q50,110 50,120 Q50,130 55,140 Q60,150 70,155 Q80,160 90,160 L120,160"
          stroke="#ffffff" strokeWidth="18" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="75" cy="75" r="12" fill="#ffffff" />
      <circle cx="75" cy="75" r="6" fill="#bfdbfe" />
      <circle cx="75" cy="75" r="3" fill="#3b82f6" />
      <circle cx="125" cy="125" r="12" fill="#ffffff" />
      <circle cx="125" cy="125" r="6" fill="#bfdbfe" />
      <circle cx="125" cy="125" r="3" fill="#3b82f6" />
      <rect x="15" y="15" width="170" height="170" rx="40" ry="40" fill="none"
        stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.1" />
    </svg>
  );
}
