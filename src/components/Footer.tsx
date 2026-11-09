import React from 'react';
import { Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { Heart, Send, Instagram, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-[#211B18] text-[#D8CDC5] pt-16 pb-12 border-t border-[#382F2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#382F2A]/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#F5C9D8] to-[#B9DFFA] flex items-center justify-center border border-white/20 bg-white">
                <img
                  src="/logo.jpg"
                  alt="Taklifim Logo"
                  className="w-full h-full object-cover rounded-[10px]"
                  onError={(e) => {
                    // Fallback to local assets path if needed
                    const target = e.currentTarget;
                    if (!target.src.includes('Taklifim%20logo.jpg')) {
                      target.src = '/assets/logo.jpg';
                    }
                  }}
                />
              </div>
              <span className="font-playfair text-2xl font-bold text-white tracking-wide">
                Taklifim
              </span>
            </Link>
            <p className="text-sm text-[#A89A92] leading-relaxed max-w-sm">
              {t.footer?.about || '«Har bir lahzaga o‘zgacha taklif.» To‘y, yubiley va marosimlaringiz uchun eng nafis raqamli veb va video taklifnomalar yaratish platformasi.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://t.me/avazxanovvv_700"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#B9DFFA]/20 hover:text-[#B9DFFA] flex items-center justify-center transition-colors text-white/80"
                aria-label="Telegram"
                title="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/avazxanovvv_700/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#F5C9D8]/20 hover:text-[#F5C9D8] flex items-center justify-center transition-colors text-white/80"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="tel:+998933223580"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 flex items-center justify-center transition-colors text-white/80"
                aria-label="Telefon: +998933223580"
                title="+998933223580"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer?.servicesTitle || 'Xizmatlar'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/templates" className="hover:text-white transition-colors">
                  {t.footer?.templatesLink || 'Shablonlar katalogi'}
                </Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-white transition-colors">
                  {t.footer?.videoLink || 'Video taklifnomalar'}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  {t.footer?.pricingLink || 'Tariflar va narxlar'}
                </Link>
              </li>
              <li>
                <Link to="/i/nodir-malika-wedding" className="hover:text-white transition-colors text-[#F5C9D8]">
                  {t.footer?.demoLink || 'Jonli namuna (To‘y)'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer?.companyTitle || 'Kompaniya'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  {t.footer?.faqLink || 'Savol-javoblar'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t.footer?.contactLink || 'Bog‘lanish'}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  {t.footer?.privacyLink || 'Maxfiylik siyosati'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  {t.footer?.termsLink || 'Foydalanish shartlari'}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors text-xs text-[#8A7C74]">
                  {t.footer?.adminLink || 'Admin tizimi'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language and Region */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer?.chooseLanguage || 'Tilni tanlang'}
            </h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setLanguage('uz')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                  language === 'uz' ? 'bg-[#3A2F29] text-white font-bold' : 'hover:bg-white/5 text-[#A89A92]'
                }`}
              >
                <span>🇺🇿</span>
                <span>O‘zbekcha</span>
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                  language === 'ru' ? 'bg-[#3A2F29] text-white font-bold' : 'hover:bg-white/5 text-[#A89A92]'
                }`}
              >
                <span>🇷🇺</span>
                <span>Русский</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                  language === 'en' ? 'bg-[#3A2F29] text-white font-bold' : 'hover:bg-white/5 text-[#A89A92]'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A7C74] gap-4">
          <p>© {new Date().getFullYear()} Taklifim. {t.footer?.allRightsReserved || 'Barcha huquqlar himoyalangan.'}</p>
          <div className="flex items-center gap-1.5">
            <span>{t.footer?.madeWithLove || 'Yurakdan mehr bilan yaratilgan'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{t.footer?.location || 'Toshkent, O‘zbekiston'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
