import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, ChevronDown, Globe, User, Shield, PlusCircle } from 'lucide-react';
import { Language } from '../types';

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: 'O‘zbekcha', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/75 backdrop-blur-2xl py-3 border-b border-white/80 shadow-[0_8px_32px_rgba(245,201,216,0.22)]'
          : 'bg-white/60 backdrop-blur-xl py-4 border-b border-white/60 shadow-[0_4px_24px_rgba(185,223,250,0.18)]'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-4">
        <div className="flex items-center justify-between gap-1 xl:gap-2.5 flex-nowrap">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#F5C9D8] via-[#F5EBDD] to-[#B9DFFA] shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0 border border-white/80">
              <img
                src="/logo.jpg"
                alt="Taklifim Logo"
                className="w-full h-full object-cover rounded-[13px]"
              />
            </div>
            <div className="shrink-0 flex items-center">
              <span className="font-playfair text-xl xl:text-2xl font-bold tracking-tight text-[#231E1B] whitespace-nowrap">
                Taklifim
              </span>

            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0 flex-nowrap">
            <Link
              to="/"
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all"
              activeClassName="text-[#231E1B] bg-white/95 font-bold shadow-xs border border-white/90"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/templates"
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all"
              activeClassName="text-[#231E1B] bg-white/95 font-bold shadow-xs border border-white/90"
            >
              {t.nav.templates}
            </Link>
            <Link
              to="/my-invitations"
              className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-bold text-[#D9658B] hover:text-[#C24B7A] hover:bg-white/80 transition-all flex items-center gap-1.5 shadow-xs border border-[#D9658B]/30 bg-gradient-to-r from-[#FFF5F8] to-white"
              activeClassName="text-[#1E1418] bg-white font-extrabold shadow-sm border border-[#D9658B]"
            >
              <span>💌 {language === 'ru' ? 'Мои приглашения' : language === 'en' ? 'My Invitations' : 'Taklifnomalarim'}</span>
            </Link>
            <Link
              to="/#how-it-works"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              to="/pricing"
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all"
              activeClassName="text-[#231E1B] bg-white/95 font-bold shadow-xs border border-white/90"
            >
              {t.nav.pricing}
            </Link>
            <Link
              to="/premium"
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all flex items-center gap-1.5"
              activeClassName="text-[#231E1B] bg-white/95 font-bold shadow-xs border border-white/90"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9658B] animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">{t.nav.premium}</span>
            </Link>
            <Link
              to="/faq"
              className="whitespace-nowrap shrink-0 px-2 xl:px-2.5 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold text-[#4A3E39] hover:text-[#231E1B] hover:bg-white/60 transition-all"
              activeClassName="text-[#231E1B] bg-white/95 font-bold shadow-xs border border-white/90"
            >
              {t.nav.faq}
            </Link>
          </nav>

          {/* Right Controls: Language, Admin, Account, CTA */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 flex-nowrap">
            {/* Language Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-semibold text-[#4A3E39] hover:bg-white/90 transition-all border border-black/5 bg-white/60 shadow-xs"
                aria-label="Tilni tanlash"
              >
                <span>{currentLangObj.flag}</span>
                <span className="font-bold">{currentLangObj.code.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 glass-panel rounded-2xl shadow-lg py-1.5 border border-white/80 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-white/90 transition-colors ${
                        language === l.code ? 'text-[#231E1B] font-bold bg-[#F5EBDD]/60' : 'text-[#5C4F48]'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span className="whitespace-nowrap">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin shortcut with security icon */}
            <Link
              to="/admin"
              className="shrink-0 p-1.5 xl:p-2 rounded-full text-xs font-medium text-[#6B5E57] hover:text-[#231E1B] hover:bg-white/90 transition-all border border-black/5 bg-white/60 shadow-xs"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4 text-[#7A6A63]" />
            </Link>

            {/* Customer Account / Dashboard link */}
            {isLoggedIn ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#231E1B] bg-white/85 hover:bg-white transition-all border border-black/5 shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#F5C9D8] to-[#B9DFFA] text-[#3A2D28] flex items-center justify-center font-bold text-[10px] shrink-0">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <span className="truncate font-semibold max-w-[65px] xl:max-w-[90px]">{user?.name?.split(' ')[0] || user?.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-xl py-2 border border-white/90 z-50">
                    <div className="px-3 py-1.5 border-b border-black/5 text-xs text-[#7A6A63]">
                      <div className="font-semibold text-[#231E1B] truncate">{user?.name}</div>
                      <div className="text-[11px] truncate opacity-70">{user?.phone}</div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-[#3A2D28] hover:bg-white/80 transition-colors whitespace-nowrap"
                    >
                      {t.nav.dashboard}
                    </Link>
                    <Link
                      to="/dashboard/invitations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-[#3A2D28] hover:bg-white/80 transition-colors whitespace-nowrap"
                    >
                      {t.dashboard.tabs.invitations}
                    </Link>
                    <Link
                      to="/dashboard/guests"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs text-[#3A2D28] hover:bg-white/80 transition-colors whitespace-nowrap"
                    >
                      {t.dashboard.tabs.guests}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50/50 transition-colors whitespace-nowrap"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-[#4A3E39] hover:bg-white/90 transition-all border border-black/5 bg-white/60 shadow-xs"
              >
                {t.nav.login}
              </Link>
            )}

            {/* Primary Action Button */}
            <Link
              to="/templates"
              className="whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-full text-xs font-bold text-[#231E1B] bg-gradient-to-r from-[#F5C9D8] via-[#F5EBDD] to-[#B9DFFA] hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/80 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t.nav.createInvitation}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick lang switch for mobile */}
            <button
              onClick={() => {
                const nextLang: Record<Language, Language> = { uz: 'ru', ru: 'en', en: 'uz' };
                setLanguage(nextLang[language]);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#4A3E39] bg-white/70 border border-black/5"
            >
              {language.toUpperCase()}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#231E1B] bg-white/70 hover:bg-white transition-colors border border-black/5"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/60 mt-2 px-4 pt-4 pb-6 space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
              activeClassName="bg-white/90 font-bold"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/templates"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
              activeClassName="bg-white/90 font-bold"
            >
              {t.nav.templates}
            </Link>
            <Link
              to="/my-invitations"
              className="px-3 py-2.5 rounded-xl text-sm font-extrabold text-[#D9658B] bg-gradient-to-r from-[#FFF5F8] to-white border border-[#D9658B]/30 shadow-xs flex items-center justify-between"
              activeClassName="bg-[#D9658B] text-white"
            >
              <span>💌 {language === 'ru' ? 'Мои приглашения' : language === 'en' ? 'My Invitations' : 'Taklifnomalarim'}</span>
              <span className="text-[10px] bg-[#D9658B] text-white px-2 py-0.5 rounded-full">{language === 'ru' ? 'Новое' : language === 'en' ? 'New' : 'Yangi'}</span>
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              to="/pricing"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
              activeClassName="bg-white/90 font-bold"
            >
              {t.nav.pricing}
            </Link>
            <Link
              to="/premium"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80 flex items-center justify-between"
              activeClassName="bg-white/90 font-bold"
            >
              <span>{t.nav.premium}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5C9D8] text-[#3A2D28] font-bold">New</span>
            </Link>
            <Link
              to="/faq"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
              activeClassName="bg-white/90 font-bold"
            >
              {t.nav.faq}
            </Link>
            <Link
              to="/dashboard"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80"
              activeClassName="bg-white/90 font-bold"
            >
              {t.nav.dashboard}
            </Link>
            <Link
              to="/admin"
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#231E1B] hover:bg-white/80 flex items-center gap-2"
              activeClassName="bg-white/90 font-bold"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-black/5">
            <Link
              to="/templates"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[#231E1B] bg-gradient-to-r from-[#F5C9D8] to-[#F5EBDD] shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.createInvitation}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
