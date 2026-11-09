import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export const BACKGROUND_IMAGES = [
  'https://wallpaperswide.com/download/wedding_day_3-wallpaper-1280x800.jpg',
  'https://videocdn.cdnpk.net/videos/20873127-b843-4bb1-b6ef-b5c35df5a500/horizontal/thumbnails/large.jpg?semt=ais_hybrid&item_id=261815&w=740&q=80',
  'https://cdn.pixabay.com/photo/2014/02/07/11/31/flowers-260894_1280.jpg',
  'https://img.magnific.com/free-photo/beautiful-wedding-bouquet-made-eucalyptus-colorful-flowers-girl-s-hands-outdoors-sunny-day_8353-10984.jpg?semt=ais_hybrid&w=740&q=80',
];

// Fallback high-res wedding images in case an external CDN has hotlink blocks
export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920&q=85',
];

export const BackgroundCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // 5 seconds automatic rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Background Images with smooth 5-second cross-fade */}
      {BACKGROUND_IMAGES.map((src, index) => {
        const isActive = index === currentIndex;
        const actualSrc = failedImages[index] ? FALLBACK_IMAGES[index] : src;

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={actualSrc}
              alt="To‘y foni"
              onError={() => handleImageError(index)}
              className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      {/* Multi-layer Liquid Glass & Romantic Wedding Overlay */}
      {/* Layer 1: Ethereal Pink & Sky Blue Radial Ambient Wash */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#F5C9D8]/45 via-white/40 to-[#B9DFFA]/45 mix-blend-normal" />

      {/* Layer 2: Soft White Frosted Glass Tint for Optimal Text Contrast */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[10px]" />

      {/* Layer 3: Subtle Romantic Vignette & Inner Light */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#F5C9D8]/15 to-[#1E1418]/15 pointer-events-none" />

      {/* Slide Indicator Dots (Interactive on click) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel shadow-md border border-white/80">
        <span className="text-[10px] font-bold tracking-wider text-[#3A242B] flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#E27B9B]" />
          <span>{currentIndex + 1}/4</span>
        </span>
        {BACKGROUND_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-6 bg-gradient-to-r from-[#E27B9B] to-[#4A9BD4] shadow-xs'
                : 'w-2 bg-black/20 hover:bg-black/40'
            }`}
            aria-label={`Fon surati ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
