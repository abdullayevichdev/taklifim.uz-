import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { mockTemplates } from '../data/mockTemplates';
import { api } from '../services/api';
import { formatPriceUZS } from '../utils/logic';
import { Template } from '../types';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar,
  Share2,
  Music,
  MapPin,
  Heart,
} from 'lucide-react';

export const TemplateDetailPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { language, t } = useLanguage();
  const slug = params.slug;

  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [allTemplates, setAllTemplates] = useState<Template[]>(mockTemplates);

  useEffect(() => {
    async function load() {
      const list = await api.getTemplates();
      setAllTemplates(list);
    }
    load();
  }, []);

  const template = allTemplates.find((tpl) => tpl.slug === slug);

  if (!template) {
    return (
      <div className="pt-32 pb-24 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#F5EBDD] mx-auto flex items-center justify-center text-[#8A7C74]">
          <Eye className="w-8 h-8" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-[#231E1B]">
          Shablon topilmadi
        </h1>
        <p className="text-xs text-[#7A6A63]">
          Siz qidirayotgan shablon mavjud emas yoki o‘chirilgan bo‘lishi mumkin.
        </p>
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#231E1B] text-white text-xs font-bold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Shablonlar katalogiga qaytish</span>
        </Link>
      </div>
    );
  }

  // Related templates
  const relatedTemplates = mockTemplates
    .filter((tpl) => tpl.slug !== template.slug)
    .slice(0, 3);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C4F48] hover:text-[#231E1B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Katalogga qaytish</span>
          </Link>

          {/* Device Preview Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-black/5">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                previewDevice === 'mobile'
                  ? 'bg-[#231E1B] text-white shadow-xs'
                  : 'text-[#7A6A63] hover:text-[#231E1B]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                previewDevice === 'desktop'
                  ? 'bg-[#231E1B] text-white shadow-xs'
                  : 'text-[#7A6A63] hover:text-[#231E1B]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Kompyuter</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Preview on Left/Center, Specs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Preview Container */}
          <div className="lg:col-span-7 flex justify-center">
            {previewDevice === 'mobile' ? (
              /* Mobile Preview Frame */
              <div className="w-[320px] sm:w-[340px] rounded-[44px] p-4 bg-[#231E1B] shadow-2xl ring-1 ring-white/20 relative">
                {/* Speaker */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#151210] rounded-full z-30" />

                <div
                  className="w-full h-[620px] rounded-[36px] overflow-y-auto overflow-x-hidden relative p-6 pt-9 text-center flex flex-col justify-between border border-black/10 select-none shadow-inner"
                  style={{ backgroundColor: template.colorStyle.background }}
                >
                  <div className="space-y-4">
                    <div
                      className="text-[10px] tracking-widest uppercase font-bold"
                      style={{ color: template.colorStyle.primary }}
                    >
                      {template.category.toUpperCase()} • TAKLIFNOMA
                    </div>

                    <h2
                      className="text-2xl font-bold tracking-tight"
                      style={{
                        fontFamily: template.typography.headingFont,
                        color: template.colorStyle.text,
                      }}
                    >
                      Nodir & Malika
                    </h2>

                    <div
                      className="w-10 h-0.5 mx-auto opacity-50"
                      style={{ backgroundColor: template.colorStyle.primary }}
                    />

                    {/* Preview Image */}
                    <div className="w-full h-52 rounded-2xl overflow-hidden shadow-sm border border-white/60">
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p
                      className="text-xs leading-relaxed italic px-2"
                      style={{ color: template.colorStyle.text, opacity: 0.85 }}
                    >
                      «Hayotimizning eng baxtli oqshomida biz bilan birga bo‘ling!»
                    </p>

                    <div className="py-2 space-y-1 text-xs">
                      <div className="font-bold flex items-center justify-center gap-1.5" style={{ color: template.colorStyle.primary }}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>24-Avgust, 2026 • 18:00</span>
                      </div>
                      <div className="text-[11px] flex items-center justify-center gap-1" style={{ color: template.colorStyle.text, opacity: 0.7 }}>
                        <MapPin className="w-3 h-3" />
                        <span>«Versal» majmuasi, Toshkent</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated RSVP button */}
                  <div className="pt-4 border-t border-black/5">
                    <div
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: template.colorStyle.primary }}
                    >
                      Tashrifingizni tasdiqlang
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Preview Frame */
              <div className="w-full rounded-3xl p-3 bg-[#231E1B] shadow-2xl ring-1 ring-white/20">
                <div className="flex items-center gap-1.5 pb-2 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-white/50 ml-2 font-mono truncate">
                    taklifim.uz/i/{template.slug}-demo
                  </span>
                </div>
                <div
                  className="w-full h-[480px] rounded-2xl overflow-y-auto p-8 text-center flex flex-col justify-between"
                  style={{ backgroundColor: template.colorStyle.background }}
                >
                  <div className="max-w-md mx-auto space-y-4">
                    <div
                      className="text-xs tracking-widest uppercase font-bold"
                      style={{ color: template.colorStyle.primary }}
                    >
                      {template.category}
                    </div>
                    <h2
                      className="text-3xl font-bold tracking-tight"
                      style={{
                        fontFamily: template.typography.headingFont,
                        color: template.colorStyle.text,
                      }}
                    >
                      Nodir & Malika
                    </h2>
                    <div className="w-full h-44 rounded-2xl overflow-hidden shadow-xs border border-white">
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{ color: template.colorStyle.text, opacity: 0.85 }}
                    >
                      «Sizni tantanamizga lutfan taklif etamiz!»
                    </p>
                  </div>
                  <div className="pt-4">
                    <span
                      className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: template.colorStyle.primary }}
                    >
                      Tashrifni Tasdiqlash (RSVP)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Details Container */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-xs font-bold text-[#D9658B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">{template.category}</span>
              </div>

              <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-[#231E1B]">
                {template.name}
              </h1>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-playfair text-3xl font-black text-[#231E1B]">
                  {formatPriceUZS(template.price)}
                </span>
                <span className="text-xs text-[#8A7C74]">/ to‘liq xizmat</span>
              </div>

              <p className="text-sm text-[#5C4F48] leading-relaxed pt-2">
                {template.description[language] || template.description.uz}
              </p>
            </div>

            {/* Color Palette and Fonts */}
            <div className="glass-panel rounded-2xl p-4 border border-white/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#231E1B]">
                Ranglar gammasi va Shriftlar
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: template.colorStyle.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: template.colorStyle.accent }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: template.colorStyle.secondary }}
                    title="Secondary"
                  />
                </div>
                <span className="text-xs text-[#7A6A63] ml-2 font-mono">
                  Sarlavha: {template.typography.headingFont}
                </span>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#231E1B]">
                Shablon imkoniyatlari
              </h4>
              <div className="space-y-2">
                {(template.features[language] || template.features.uz).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#3A2D28] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suitable For */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#231E1B]">
                Mos marosimlar
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(template.suitableFor[language] || template.suitableFor.uz).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EBDD] text-[#3A2D28]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-4 border-t border-black/5 space-y-3">
              <Link
                to={`/create/${template.slug}`}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-[#231E1B] bg-gradient-to-r from-[#F5C9D8] via-[#F5EBDD] to-[#B9DFFA] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Ushbu Shablondan Foydalanish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={`/i/nodir-malika-wedding`}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-[#5C4F48] glass-panel hover:bg-white text-center block transition-colors"
              >
                Tayyor namunaviy taklifnomani ko‘rish
              </Link>
            </div>
          </div>
        </div>

        {/* Related Templates */}
        <div className="pt-12 border-t border-black/5 space-y-6">
          <h3 className="font-playfair text-2xl font-bold text-[#231E1B]">
            Boshqa mos shablonlar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedTemplates.map((rel) => (
              <Link
                key={rel.id}
                to={`/templates/${rel.slug}`}
                className="glass-panel rounded-2xl p-4 border border-white/80 hover:border-[#D9658B] transition-all flex items-center gap-4 group"
              >
                <img
                  src={rel.previewImage}
                  alt={rel.name}
                  className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-playfair text-sm font-bold text-[#231E1B] group-hover:text-[#D9658B] transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-[11px] text-[#7A6A63]">{rel.category}</p>
                  <p className="text-xs font-bold text-[#231E1B] mt-1">
                    {formatPriceUZS(rel.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
