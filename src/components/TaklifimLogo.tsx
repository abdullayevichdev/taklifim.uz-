import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';

interface TaklifimLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TaklifimLogo: React.FC<TaklifimLogoProps> = ({
  className = 'w-6 h-6',
  size = 'sm',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`relative overflow-hidden rounded-full flex items-center justify-center shrink-0 shadow-xs border border-white/60 bg-gradient-to-tr from-[#F5C9D8] via-[#FAF6F0] to-[#B9DFFA] ${className}`}
      >
        {!imageError ? (
          <img
            src={logoImg}
            alt="Taklifim"
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D9658B] to-[#B48B47] text-white font-serif font-black text-[10px]">
            T
          </div>
        )}
      </div>
      {showText && (
        <span className="font-playfair font-bold text-[#231E1B] tracking-tight">
          Taklifim
        </span>
      )}
    </div>
  );
};
