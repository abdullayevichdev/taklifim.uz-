import React from 'react';
import { Link } from '../context/RouterContext';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/95 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F5C9D8] to-[#B9DFFA] mx-auto flex items-center justify-center text-[#231E1B] shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-3xl font-extrabold text-[#D9658B]">404</span>
          <h1 className="font-playfair text-2xl font-bold text-[#231E1B]">
            Sahifa topilmadi
          </h1>
          <p className="text-xs text-[#5C4F48] leading-relaxed">
            Siz izlayotgan sahifa ko‘chirilgan, o‘chirilgan yoki manzili xato kiritilgan bo‘lishi mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/"
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#231E1B] hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga</span>
          </Link>

          <Link
            to="/templates"
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-[#231E1B] glass-panel hover:bg-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shablonlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
