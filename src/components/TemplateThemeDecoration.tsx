import React from 'react';
import { Sparkles, Crown, Heart, Leaf, Feather } from 'lucide-react';
import { Language } from '../types';

interface TemplateThemeDecorationProps {
  templateSlug?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  language?: Language;
}

export const TemplateThemeDecoration: React.FC<TemplateThemeDecorationProps> = ({
  templateSlug = 'template-1',
  primaryColor = '#B48B47',
  secondaryColor = '#D9658B',
  accentColor = '#C9A96E',
  language = 'uz',
}) => {
  switch (templateSlug) {
    case 'template-19':
    case 'modern_noir':
    case 'noir':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-900/90 border border-amber-400/50 shadow-md backdrop-blur-md">
            <span className="text-amber-400 text-xs">⚜️</span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-300">
              {language === 'ru' ? 'Коллекция Modern Noir' : language === 'en' ? 'Modern Noir Collection' : 'Modern Noir Kolleksiyasi'}
            </span>
            <span className="text-amber-400 text-xs">✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1.5 opacity-80">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <span className="text-[9px] text-amber-300">✦</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>
        </div>
      );

    case 'template-10':
    case 'safir':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#0E1A30]/90 border border-sky-400/50 shadow-md backdrop-blur-md">
            <span className="text-sky-400 text-xs">💎</span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-sky-200">
              {language === 'ru' ? 'Сапфир Миднайт' : language === 'en' ? 'Sapphire Midnight' : 'Safir Midnight Kolleksiyasi'}
            </span>
            <span className="text-amber-400 text-xs">✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1.5 opacity-80">
            <div className="w-12 h-px bg-sky-400/50" />
            <span className="text-[9px] text-amber-300">★</span>
            <div className="w-12 h-px bg-sky-400/50" />
          </div>
        </div>
      );

    case 'template-18':
    case 'ruby':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#3B0B18]/90 border border-rose-400/50 shadow-md backdrop-blur-md">
            <span className="text-rose-400 text-xs">👑</span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-rose-200">
              {language === 'ru' ? 'Королевский Рубин' : language === 'en' ? 'Royal Ruby' : 'Qirollik Yoquti'}
            </span>
            <span className="text-amber-400 text-xs">✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1.5 opacity-80">
            <div className="w-12 h-px bg-rose-400/50" />
            <span className="text-[9px] text-amber-300">✦</span>
            <div className="w-12 h-px bg-rose-400/50" />
          </div>
        </div>
      );

    case 'template-15':
    case 'celestial':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50/90 border border-indigo-200 shadow-xs">
            <span className="text-indigo-500 text-xs">🌙</span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-900">
              {language === 'ru' ? 'Небесная Сказка' : language === 'en' ? 'Celestial Dream' : 'Samoviy Orzu'}
            </span>
            <span className="text-indigo-400 text-xs">✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 opacity-70">
            <div className="w-10 h-px bg-indigo-300" />
            <span className="text-[9px] text-indigo-400">✦</span>
            <div className="w-10 h-px bg-indigo-300" />
          </div>
        </div>
      );

    case 'template-20':
    case 'butterfly':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-cyan-50/90 border border-cyan-200 shadow-xs">
            <span className="text-cyan-500 text-xs">🦋</span>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-900">
              {language === 'ru' ? 'Нежная Бабочка' : language === 'en' ? 'Sweet Butterfly' : 'Nozik Kapalaklar'}
            </span>
            <span className="text-cyan-400 text-xs">✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 opacity-70">
            <div className="w-10 h-px bg-cyan-300" />
            <span className="text-[9px] text-cyan-400">✦</span>
            <div className="w-10 h-px bg-cyan-300" />
          </div>
        </div>
      );

    case 'template-8':
    case 'template-14':
    case 'estelle':
      return (
        <div className="relative pointer-events-none select-none my-2">
          {/* Top Botanical Wreath Badge */}
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-emerald-50/80 border border-emerald-200/60 max-w-xs mx-auto shadow-xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-800">
              {language === 'ru' ? 'Ботаническая коллекция' : language === 'en' ? 'Botanical Collection' : 'Botanik kolleksiya'}
            </span>
            <Leaf className="w-3.5 h-3.5 text-emerald-600 rotate-90" />
          </div>
          {/* Decorative Corner Foliage */}
          <div className="flex justify-between items-center px-4 pt-1 opacity-70">
            <span className="text-xs">🌿</span>
            <div className="flex-1 mx-3 h-px bg-gradient-to-r from-emerald-300 via-emerald-100 to-emerald-300" />
            <span className="text-xs">🍃</span>
          </div>
        </div>
      );

    case 'template-3':
    case 'template-5':
    case 'velvet':
      return (
        <div className="relative pointer-events-none select-none my-2">
          {/* Oriental Archway Top Banner */}
          <div className="py-1 px-4 rounded-xl bg-amber-50/90 border border-amber-300/60 max-w-xs mx-auto text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-amber-900">
              <span className="text-xs">🕌</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {language === 'ru' ? 'Восточные Традиции' : language === 'en' ? 'Oriental Tradition' : 'Sharqona Milliy An’ana'}
              </span>
              <span className="text-xs">✨</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 text-amber-700/60 text-xs">
            <span>❖</span>
            <div className="w-16 h-px bg-amber-400/40" />
            <span>⚜</span>
            <div className="w-16 h-px bg-amber-400/40" />
            <span>❖</span>
          </div>
        </div>
      );

    case 'template-9':
    case 'template-11':
    case 'swan':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50/80 border border-sky-200/70 shadow-xs">
            <Feather className="w-3.5 h-3.5 text-sky-600 animate-bounce" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-900">
              {language === 'ru' ? 'Чистый Минимализм' : language === 'en' ? 'Pure Minimal' : 'Sof Minimalizm'}
            </span>
            <Feather className="w-3.5 h-3.5 text-sky-600 -scale-x-100" />
          </div>
          <div className="flex items-center justify-center gap-1 pt-1 opacity-60">
            <div className="w-10 h-px bg-sky-300" />
            <span className="text-[8px] text-sky-500">◆</span>
            <div className="w-10 h-px bg-sky-300" />
          </div>
        </div>
      );

    case 'template-2':
    case 'template-6':
    case 'template-7':
    case 'template-13':
    case 'bloom':
      return (
        <div className="relative pointer-events-none select-none my-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/90 border border-rose-200/70 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-300 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-900">
              {language === 'ru' ? 'Нежная Романтика' : language === 'en' ? 'Sweet Romance' : 'Nafis Romantika'}
            </span>
            <Sparkles className="w-3 h-3 text-rose-400" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs text-rose-400">🌸</span>
            <div className="w-14 h-px bg-rose-200" />
            <span className="text-xs text-rose-400">🌸</span>
          </div>
        </div>
      );

    case 'template-1':
    case 'template-4':
    case 'aurelia':
    default:
      return (
        <div className="relative pointer-events-none select-none my-2">
          {/* Royal Gold Filigree Crest */}
          <div className="flex items-center justify-center gap-2 py-1 px-3.5 rounded-full bg-amber-50/90 border border-amber-200 max-w-xs mx-auto shadow-xs">
            <Crown className="w-3.5 h-3.5 text-[#B48B47]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#5A451F]">
              {language === 'ru' ? 'Королевская Коллекция' : language === 'en' ? 'Royal Collection' : 'Qirollik Kolleksiyasi'}
            </span>
            <Sparkles className="w-3 h-3 text-[#B48B47]" />
          </div>
          {/* Double Gold Line */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }} />
            <span className="text-[10px] text-[#B48B47]">✦</span>
            <div className="w-12 h-px" style={{ backgroundColor: primaryColor }} />
          </div>
        </div>
      );
  }
};

export default TemplateThemeDecoration;
