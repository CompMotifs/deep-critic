import React from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-end ${className}`}>
      <img 
        src={logoImage} 
        alt="CompMotifs Logo" 
        className="h-10 mb-1"
      />
      <span className="text-xs text-gray-500">A compmotifs.com initiative</span>
    </div>
  );
};

export default Logo;