import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <svg
        width="140"
        height="40"
        viewBox="0 0 140 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-1"
      >
        <path
          d="M15.2 12.8C18.8 12.8 21.6 15.6 21.6 19.2C21.6 22.8 18.8 25.6 15.2 25.6C11.6 25.6 8.8 22.8 8.8 19.2C8.8 15.6 11.6 12.8 15.2 12.8Z"
          fill="#3B82F6"
        />
        <path
          d="M33.6 8C39.2 8 43.6 12.4 43.6 18C43.6 23.6 39.2 28 33.6 28C28 28 23.6 23.6 23.6 18C23.6 12.4 28 8 33.6 8Z"
          fill="#EC4899"
          fillOpacity="0.8"
        />
        <path
          d="M53.6 16C57.2 16 60 18.8 60 22.4C60 26 57.2 28.8 53.6 28.8C50 28.8 47.2 26 47.2 22.4C47.2 18.8 50 16 53.6 16Z"
          fill="#10B981"
        />
        <text x="65" y="24" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="#374151">
          CompMotifs
        </text>
      </svg>
      <span className="text-xs text-gray-500">A compmotifs.com initiative</span>
    </div>
  );
};

export default Logo;