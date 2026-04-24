import React from 'react';

interface MSULogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const MSULogo: React.FC<MSULogoProps> = ({ size = 'medium', className = '', showText = true }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-48 h-48'
  };

  const textSizes = {
    small: '4',
    medium: '8',
    large: '16'
  };

  const subtitleSizes = {
    small: '3',
    medium: '6',
    large: '14'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative z-10`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      >
        {/* MSU Shield Background */}
        <path
          d="M100 10 L170 40 L170 100 C170 140 140 170 100 190 C60 170 30 140 30 100 L30 40 L100 10Z"
          fill="#2563eb"
          stroke="#1e40af"
          strokeWidth="2"
        />
        
        {/* Inner Shield Border */}
        <path
          d="M100 20 L160 45 L160 100 C160 135 135 160 100 175 C65 160 40 135 40 100 L40 45 L100 20Z"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1"
        />
        
        {/* Book */}
        <rect x="65" y="70" width="70" height="10" fill="#ffffff" rx="1" />
        <polygon points="100,60 135,70 100,80 65,70" fill="#ffffff" />
        
        {/* Graduation Cap */}
        <polygon points="70,85 130,85 100,65" fill="#ffffff" />
        <rect x="95" y="85" width="10" height="15" fill="#ffffff" />
        <polygon points="85,100 115,100 100,90" fill="#ffffff" />
        
        {/* Tassel */}
        <line x1="105" y1="85" x2="115" y2="75" stroke="#ffffff" strokeWidth="2" />
        <circle cx="115" cy="75" r="3" fill="#ffffff" />
        
        {/* Text */}
        {showText && (
          <>
            <text
              x="100"
              y="140"
              textAnchor="middle"
              fill="white"
              fontSize={textSizes[size]}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              MIDLANDS
            </text>
            <text
              x="100"
              y="150"
              textAnchor="middle"
              fill="white"
              fontSize={textSizes[size]}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              STATE
            </text>
            <text
              x="100"
              y="160"
              textAnchor="middle"
              fill="white"
              fontSize={textSizes[size]}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              UNIVERSITY
            </text>
            <text
              x="100"
              y="175"
              textAnchor="middle"
              fill="#ffffff"
              fontSize={subtitleSizes[size]}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              MSU
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default MSULogo;
